/**
 * Crawler & Indexer para Catálogos Oficiais de Fabricantes (Sigma Tools, Mahovi, EAATA, etc.)
 * 
 * Faz o crawling das páginas de produtos das marcas, indexa por Códigos de Produto / SKUs / EANs
 * e salva em cache JSON local para o enriquecedor atualizar o banco de dados.
 */

const fs = require('fs');
const path = require('path');
const axios = require(path.resolve(__dirname, '../backend/node_modules/axios'));

const SIGMA_CACHE_FILE = path.resolve(__dirname, 'sigma_catalog_index.json');

function decodeHtmlEntities(str) {
  if (!str) return '';
  return str
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#8211;/g, '-')
    .replace(/&#8212;/g, '-')
    .replace(/&#8243;/g, '"')
    .replace(/&#8217;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

async function fetchSigmaCatalog() {
  console.log('=== [1/2] RASTREAMENTO DO CATÁLOGO OFICIAL SIGMA TOOLS ===');

  let urls = [];
  const urlsFile = path.resolve(__dirname, 'sigma_urls.json');
  if (fs.existsSync(urlsFile)) {
    urls = JSON.parse(fs.readFileSync(urlsFile, 'utf8'));
    console.log(`Carregadas ${urls.length} URLs de produtos do cache local.`);
  } else {
    console.log('Baixando product-sitemap.xml...');
    const res = await axios.get('https://www.sigmatools.com.br/product-sitemap.xml', {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
      timeout: 15000
    });
    const regex = /<loc>(https:\/\/www\.sigmatools\.com\.br\/produto\/[^<]+)<\/loc>/g;
    let m;
    while ((m = regex.exec(res.data)) !== null) {
      urls.push(m[1]);
    }
    fs.writeFileSync(urlsFile, JSON.stringify(urls, null, 2));
    console.log(`Salvas ${urls.length} URLs de produtos.`);
  }

  // Carregar cache existente se houver
  let catalogIndex = {};
  if (fs.existsSync(SIGMA_CACHE_FILE)) {
    try {
      catalogIndex = JSON.parse(fs.readFileSync(SIGMA_CACHE_FILE, 'utf8'));
      console.log(`Cache existente carregado com ${Object.keys(catalogIndex).length} produtos indexados.`);
    } catch (e) {
      catalogIndex = {};
    }
  }

  const client = axios.create({
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
    },
    timeout: 10000
  });

  const BATCH_SIZE = 8;
  let processed = 0;
  let newEntries = 0;

  for (let i = 0; i < urls.length; i += BATCH_SIZE) {
    const chunk = urls.slice(i, i + BATCH_SIZE);
    await Promise.all(
      chunk.map(async (url) => {
        try {
          const res = await client.get(url);
          const html = res.data;

          // Extrair Título
          const titleMatch = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
          let title = titleMatch ? decodeHtmlEntities(titleMatch[1].replace(/<[^>]+>/g, '').trim()) : '';
          title = title.replace(/\s*-\s*SGT TOOLS/i, '').replace(/\s*-\s*SIGMA TOOLS/i, '').trim();

          // Extrair Imagens em Alta Resolução
          const imgMatches = html.match(/https?:\/\/www\.sigmatools\.com\.br\/site\/wp-content\/uploads\/[^\s"']+\.(?:jpg|jpeg|png|webp)/gi) || [];
          const highResImgs = Array.from(new Set(imgMatches)).filter(img => {
            return !img.includes('-100x100.') &&
                   !img.includes('-150x150.') &&
                   !img.includes('-300x300.') &&
                   !img.includes('Logo') &&
                   !img.includes('favicon') &&
                   !img.includes('android-chrome') &&
                   !img.includes('apple-touch-icon');
          });

          // Extrair Descrição Completa
          let description = '';
          const descMatch = html.match(/<div[^>]+id="tab-description"[^>]*>([\s\S]*?)<\/div>/i) ||
                            html.match(/<div[^>]+class="woocommerce-product-details__short-description"[^>]*>([\s\S]*?)<\/div>/i);
          if (descMatch) {
            description = decodeHtmlEntities(
              descMatch[1]
                .replace(/<br\s*[\/]?>/gi, '\n')
                .replace(/<\/p>/gi, '\n\n')
                .replace(/<li[^>]*>/gi, '- ')
                .replace(/<\/li>/gi, '\n')
                .replace(/<[^>]+>/g, '')
                .replace(/\n{3,}/g, '\n\n')
                .trim()
            );
          }

          // Extrair todos os SKUs e códigos presentes na página
          const foundCodes = new Set();

          // Padrão 1: Código do produto: 0613010200
          const codeMatches = html.matchAll(/c[óo]digo(?:\s+do\s+produto)?[:\s]+([a-zA-Z0-9_\-\.\/]+)/gi);
          for (const cm of codeMatches) {
            const c = cm[1].trim().toUpperCase();
            if (c.length >= 3 && !['DE', 'DO', 'DA', 'EM', 'PARA'].includes(c)) foundCodes.add(c);
          }

          // Padrão 2: SGT-XXXX
          const sgtMatches = (title + ' ' + html).match(/SGT-?[0-9]{3,5}[A-Z0-9\-]*/gi) || [];
          for (const s of sgtMatches) foundCodes.add(s.toUpperCase().replace(/\s+/g, ''));

          // Padrão 3: Numéricos de 10 dígitos (ex: 0752013772, 0613010200, 0761010005)
          const numCodes = html.match(/\b0[67]\d{8}[A-Z]?\b/g) || [];
          for (const nc of numCodes) foundCodes.add(nc.toUpperCase());

          // Padrão 4: Slug da URL (ex: kit-5-boinas-de-espuma)
          const slug = url.split('/produto/')[1]?.replace(/\/$/, '') || '';

          const entry = {
            title,
            slug,
            url,
            images: highResImgs,
            primaryImage: highResImgs[0] || null,
            description,
            codes: Array.from(foundCodes)
          };

          // Indexar por cada código encontrado
          for (const code of foundCodes) {
            catalogIndex[code] = entry;
            newEntries++;
          }
          if (slug) catalogIndex[slug] = entry;

        } catch (err) {
          // Ignora timeouts pontuais para não parar o fluxo
        }
      })
    );

    processed += chunk.length;
    if (processed % 80 === 0 || processed >= urls.length) {
      console.log(`Processadas ${processed}/${urls.length} páginas... (${Object.keys(catalogIndex).length} chaves indexadas)`);
      // Salvar periodicamente
      fs.writeFileSync(SIGMA_CACHE_FILE, JSON.stringify(catalogIndex, null, 2));
    }
  }

  fs.writeFileSync(SIGMA_CACHE_FILE, JSON.stringify(catalogIndex, null, 2));
  console.log(`=== SUCESSO: ${Object.keys(catalogIndex).length} códigos e produtos da Sigma Tools indexados em ${SIGMA_CACHE_FILE} ===`);
}

fetchSigmaCatalog().catch(console.error);
