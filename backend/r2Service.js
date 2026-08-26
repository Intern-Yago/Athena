require('dotenv').config();
const { S3Client, PutObjectCommand, HeadObjectCommand } = require('@aws-sdk/client-s3');
const sharp = require('sharp');
const crypto = require('crypto');

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'athena-catalogo';
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || `https://pub-${R2_ACCOUNT_ID}.r2.dev`;

const isR2Configured = Boolean(R2_ACCOUNT_ID && R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY);

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

/**
 * Uploads a file (base64 string or Buffer) to Cloudflare R2.
 * Automatically converts image files to optimized WebP format.
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
      const matches = file.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches) {
        mimeType = matches[1];
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

  if (mimeType.includes('pdf') || (filename && filename.toLowerCase().endsWith('.pdf'))) {
    isPdf = true;
  }

  let finalBuffer = buffer;
  let finalContentType = mimeType;
  let extension = isPdf ? 'pdf' : 'webp';

  // If it's an image, convert to WebP using Sharp
  if (!isPdf) {
    try {
      finalBuffer = await sharp(buffer)
        .resize(1200, 1200, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .webp({ quality: 82, effort: 4 })
        .toBuffer();
      finalContentType = 'image/webp';
    } catch (sharpError) {
      console.warn('Aviso Sharp ao converter imagem:', sharpError.message);
      // If sharp fails (e.g. invalid image format), upload original buffer
    }
  }

  // Generate clean unique key
  const randomHash = crypto.randomBytes(6).toString('hex');
  const baseName = filename
    ? filename.replace(/\.[^/.]+$/, '').toLowerCase().replace(/[^a-z0-9-_]/g, '-')
    : `item-${Date.now()}`;
  const key = `${folder}/${baseName}-${randomHash}.${extension}`;

  // Upload to Cloudflare R2
  await r2Client.send(new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    Body: finalBuffer,
    ContentType: finalContentType,
    CacheControl: 'public, max-age=31536000, immutable'
  }));

  const publicUrl = `${R2_PUBLIC_URL.replace(/\/$/, '')}/${key}`;

  return {
    url: publicUrl,
    key,
    format: extension,
    bytes: finalBuffer.length,
    isR2: true
  };
}

module.exports = {
  isR2Configured,
  r2Client,
  uploadToR2,
  R2_BUCKET_NAME,
  R2_PUBLIC_URL
};
