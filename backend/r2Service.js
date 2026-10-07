require('dotenv').config();
const { S3Client, PutObjectCommand, HeadObjectCommand, ListObjectsV2Command, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const sharp = require('sharp');
const crypto = require('crypto');

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'athena-catalogo';
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || 'https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev';

const isR2Configured = Boolean(R2_ACCOUNT_ID && R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY);

const ALLOWED_R2_FOLDERS = ['produtos', 'marcas', 'banners', 'documentos', 'catalogos', 'uploads', 'temp'];
const MAX_UPLOAD_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

let r2Client = null;
if (isR2Configured) {
  r2Client = new S3Client({
    region: 'auto',
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
  });
}

// In-memory cache for listing bucket objects to optimize performance and responsiveness
let r2ObjectsCache = {
  items: null,
  lastFetched: 0,
  ttlMs: 600000 // 10 minutes TTL (auto-invalidated on upload or delete)
};

function invalidateR2Cache() {
  r2ObjectsCache.items = null;
  r2ObjectsCache.lastFetched = 0;
}

/**
 * Uploads a file (base64 string or Buffer) to Cloudflare R2.
 * Automatically validates magic bytes, prevents path traversal, and converts images to WebP.
 */
async function uploadToR2({ file, folder = 'produtos', filename = null }) {
  if (!isR2Configured || !r2Client) {
    throw new Error('Cloudflare R2 não está configurado com as credenciais necessárias.');
  }

  let buffer;
  let mimeType = 'image/jpeg';
  let isPdf = false;

  if (Buffer.isBuffer(file)) {
    buffer = file;
  } else if (typeof file === 'string') {
    if (file.startsWith('data:')) {
      const matches = file.match(/^data:([A-Za-z0-9-+\/]+);base64,(.+)$/);
      if (matches) {
        mimeType = matches[1].toLowerCase();
        buffer = Buffer.from(matches[2], 'base64');
      } else {
        buffer = Buffer.from(file, 'base64');
      }
    } else {
      buffer = Buffer.from(file, 'base64');
    }
  } else {
    throw new Error('Formato de arquivo inválido para upload.');
  }

  // 1. Limite de tamanho de arquivo
  if (buffer.length > MAX_UPLOAD_SIZE_BYTES) {
    throw new Error('O arquivo excede o limite máximo permitido de 25 MB.');
  }

  // 2. Higienização e Validação Estrita de Pasta (Anti-Path Traversal)
  const safeFolder = String(folder || 'produtos')
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '')
    .slice(0, 32);
  const finalFolder = ALLOWED_R2_FOLDERS.includes(safeFolder) ? safeFolder : 'produtos';

  // 3. Validação de Tipo de Arquivo e Magic Bytes
  if (mimeType.includes('pdf') || (filename && filename.toLowerCase().endsWith('.pdf'))) {
    // Valida magic bytes de PDF (%PDF-)
    if (buffer.length < 5 || buffer.subarray(0, 5).toString('ascii') !== '%PDF-') {
      throw new Error('Arquivo PDF corrompido ou com cabeçalho inválido.');
    }
    isPdf = true;
  }

  let finalBuffer = buffer;
  let finalContentType = mimeType;
  let extension = isPdf ? 'pdf' : 'webp';

  // 4. Se for imagem, processa e converte com o Sharp (descarta vetores maliciosos/XSS embutidos)
  if (!isPdf) {
    const originalSizeKb = (buffer.length / 1024).toFixed(1);
    try {
      console.log(`[Sharp Engine] Processando imagem (${originalSizeKb} KB)... Convertendo para WebP (máx. 2560x2560px)...`);
      finalBuffer = await sharp(buffer)
        .resize(2560, 2560, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .webp({ quality: 86, effort: 4 })
        .toBuffer();
      finalContentType = 'image/webp';
      const newSizeKb = (finalBuffer.length / 1024).toFixed(1);
      const reduction = (((buffer.length - finalBuffer.length) / buffer.length) * 100).toFixed(1);
      console.log(`[Sharp Engine] Sucesso: ${originalSizeKb} KB -> ${newSizeKb} KB (Economia de ${reduction}% em WebP)`);
    } catch (sharpError) {
      console.error('[Sharp Engine] Arquivo de imagem inválido ou malicioso rejeitado:', sharpError.message);
      throw new Error('O arquivo enviado não é uma imagem válida suportada.');
    }
  } else {
    console.log(`[Storage] Processando documento PDF seguro (${(buffer.length / 1024).toFixed(1)} KB)...`);
  }

  // 5. Gera chave segura sem caracteres de escape
  const randomHash = crypto.randomBytes(6).toString('hex');
  const baseName = filename
    ? String(filename).replace(/\.[^/.]+$/, '').toLowerCase().replace(/[^a-z0-9-_]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').slice(0, 80)
    : `item-${Date.now()}`;
  const key = `${finalFolder}/${baseName}-${randomHash}.${extension}`;

  // 6. Envio para o Cloudflare R2 com cabeçalhos de segurança estritos
  await r2Client.send(new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    Body: finalBuffer,
    ContentType: finalContentType,
    CacheControl: 'public, max-age=31536000, immutable',
    Metadata: {
      'x-content-type-options': 'nosniff'
    }
  }));

  const publicUrl = `${R2_PUBLIC_URL.replace(/\/$/, '')}/${key}`;

  // Invalida o cache local da biblioteca
  invalidateR2Cache();

  return {
    url: publicUrl,
    key,
    format: extension,
    bytes: finalBuffer.length,
    isR2: true
  };
}

/**
 * Exclui com segurança um arquivo do Cloudflare R2 validando o prefixo da chave.
 */
async function deleteFromR2(urlOrKey) {
  if (!isR2Configured || !r2Client || !urlOrKey) return false;
  try {
    let key = urlOrKey;
    if (typeof urlOrKey === 'string' && (urlOrKey.startsWith('http://') || urlOrKey.startsWith('https://'))) {
      try {
        const urlObj = new URL(urlOrKey);
        key = urlObj.pathname.replace(/^\//, '');
      } catch (e) {
        key = urlOrKey;
      }
    }

    if (!key || typeof key !== 'string') return false;

    // Defesa estrita contra Path Traversal
    const cleanKey = decodeURIComponent(key).trim();
    if (cleanKey.includes('..') || cleanKey.startsWith('/') || cleanKey.includes('\\')) {
      console.warn('[Cloudflare R2] Tentativa de exclusão com path traversal rejeitada:', cleanKey);
      return false;
    }

    // Permite exclusão apenas em pastas autorizadas
    const isAllowedPrefix = ALLOWED_R2_FOLDERS.some(f => cleanKey.startsWith(`${f}/`));
    if (!isAllowedPrefix) {
      console.warn('[Cloudflare R2] Tentativa de exclusão fora das pastas autorizadas:', cleanKey);
      return false;
    }

    await r2Client.send(new DeleteObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: cleanKey,
    }));

    // Invalida cache da biblioteca
    invalidateR2Cache();

    console.log(`[Cloudflare R2] Objeto excluído com segurança: ${cleanKey}`);
    return true;
  } catch (err) {
    console.warn(`[Cloudflare R2] Falha ao excluir objeto ${urlOrKey}:`, err.message);
    return false;
  }
}

/**
 * Lists image media from Cloudflare R2 bucket with fast in-memory caching, search, and pagination.
 */
async function listR2Objects({ page = 1, limit = 36, search = '', folder = '' } = {}) {
  if (!isR2Configured || !r2Client) {
    return { items: [], total: 0, page: 1, totalPages: 0, hasMore: false };
  }

  const now = Date.now();
  let allItems = r2ObjectsCache.items;

  if (!allItems || now - r2ObjectsCache.lastFetched > r2ObjectsCache.ttlMs) {
    allItems = [];
    let continuationToken = undefined;

    try {
      do {
        const cmd = new ListObjectsV2Command({
          Bucket: R2_BUCKET_NAME,
          MaxKeys: 1000,
          ContinuationToken: continuationToken
        });
        const response = await r2Client.send(cmd);
        if (response.Contents && response.Contents.length > 0) {
          for (const item of response.Contents) {
            const lowerKey = item.Key.toLowerCase();
            const isMedia = lowerKey.endsWith('.webp') ||
                            lowerKey.endsWith('.jpg') ||
                            lowerKey.endsWith('.jpeg') ||
                            lowerKey.endsWith('.png') ||
                            lowerKey.endsWith('.gif') ||
                            lowerKey.endsWith('.avif');
            if (isMedia) {
              const parts = item.Key.split('/');
              const filename = parts[parts.length - 1];
              const itemFolder = parts.length > 1 ? parts[0] : '';
              allItems.push({
                key: item.Key,
                filename,
                folder: itemFolder,
                url: `${R2_PUBLIC_URL.replace(/\/$/, '')}/${item.Key}`,
                size: item.Size,
                lastModified: item.LastModified ? item.LastModified.toISOString() : new Date().toISOString()
              });
            }
          }
        }
        continuationToken = response.IsTruncated ? response.NextContinuationToken : undefined;
      } while (continuationToken);

      // Sort newest first
      allItems.sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime());

      r2ObjectsCache.items = allItems;
      r2ObjectsCache.lastFetched = now;
    } catch (err) {
      console.error('[Cloudflare R2] Erro ao listar objetos:', err.message);
      if (r2ObjectsCache.items) {
        allItems = r2ObjectsCache.items;
      } else {
        return { items: [], total: 0, page: 1, totalPages: 0, hasMore: false };
      }
    }
  }

  let filtered = allItems;

  if (folder) {
    const fLower = folder.toLowerCase();
    filtered = filtered.filter(item => item.folder.toLowerCase() === fLower);
  }

  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    filtered = filtered.filter(item =>
      item.filename.toLowerCase().includes(q) ||
      item.key.toLowerCase().includes(q)
    );
  }

  const total = filtered.length;
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const pageSize = Math.min(100, Math.max(6, parseInt(limit, 10) || 36));
  const totalPages = Math.ceil(total / pageSize);
  const startIndex = (pageNum - 1) * pageSize;
  const paginatedItems = filtered.slice(startIndex, startIndex + pageSize);
  const hasMore = startIndex + pageSize < total;

  return {
    items: paginatedItems,
    total,
    page: pageNum,
    limit: pageSize,
    totalPages,
    hasMore
  };
}

module.exports = {
  isR2Configured,
  r2Client,
  uploadToR2,
  deleteFromR2,
  listR2Objects,
  invalidateR2Cache,
  R2_BUCKET_NAME,
  R2_PUBLIC_URL,
  ALLOWED_R2_FOLDERS
};
