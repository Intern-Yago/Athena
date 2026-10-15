const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { uploadToR2 } = require('../r2Service');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const TREATED_DIR = '/tmp/delta/treated_v3';

// Mapeamento de nome de arquivo (em minúsculas) para o SKU oficial no banco de dados
const FILE_TO_SKU = {
  'dt-ada01.webp': 'DT-ADA01',
  'dt-ali06.webp': 'DT-ALI06',
  'dt-ali07.webp': 'DT-ALI07',
  'dt-atb01.webp': 'DT-ATB01',
  'dt-jsq01.webp': 'DT-JSQ01',
  'dt-kmf01.webp': 'DT-KMF01',
  'dt-mat01.webp': 'DT-MAT01',
  'dt-mft01.webp': 'DT-MFT01',
  'dt-mga01.webp': 'DT-MGA01',
  'dt-mga01ea.webp': 'DT-MGA01EA',
  'dt-mga01eb.webp': 'DT-MGA01EB',
  'dt-pen007.webp': 'DT-PEN007',
  'dt-rec.webp': 'DT-REC',
  'dt-rep01.webp': 'DT-REP01',
  'dt-sac04.webp': 'DT-SAC04',
  'dt-sac07.webp': 'DT-SAC07',
  'dt-sac08.webp': 'DT-SAC08',
  'dt-sac10.webp': 'DT-SAC10',
  'dt-sac15.webp': 'DT-SAC15',
  'dt-sac16.webp': 'DT-SAC16',
  'dt-sac20.webp': 'DT-SAC20',
  'dt-sfb01.webp': 'DT-SFB01',
  'dt-sgf01.webp': 'DT-SGF01',
  'dt-sgf02.webp': 'DT-SGF02',
  'dt-sgf02-r.webp': 'DT-SGF02.R',
  'dt-sso01.webp': 'DT-SSO01',
  'dt-tbd01.webp': 'DT-TBD01',
  'dt-tfr01.webp': 'DT-TFR01',
  'sac-01.webp': 'SAC-01'
};

async function run() {
  console.log('🚀 Iniciando upload das imagens oficiais e tratadas da Delta para o Cloudflare R2...');

  const files = fs.readdirSync(TREATED_DIR).filter(f => f.endsWith('.webp'));
  console.log(`📁 Encontrados ${files.length} arquivos WebP em ${TREATED_DIR}`);

  let updatedCount = 0;

  for (const file of files) {
    const sku = FILE_TO_SKU[file.toLowerCase()];
    if (!sku) {
      console.warn(`⚠️ Arquivo sem SKU mapeado: ${file}`);
      continue;
    }

    const filePath = path.join(TREATED_DIR, file);
    const fileBuffer = fs.readFileSync(filePath);
    // Adiciona timestamp para quebrar cache no CDN
    const filename = `delta-${sku.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

    try {
      console.log(`📤 Enviando ${file} (${sku}) para R2...`);
      const { url } = await uploadToR2({
        file: fileBuffer,
        folder: 'produtos',
        filename
      });

      console.log(`✅ Upload concluído: ${url}`);

      // Atualiza no PostgreSQL preservando todas as demais colunas
      const res = await pool.query(
        `UPDATE products 
         SET image = $1, 
             images = $2, 
             updated_at = NOW() 
         WHERE sku = $3 
         RETURNING id, sku, name`,
        [url, JSON.stringify([url]), sku]
      );

      if (res.rows.length > 0) {
        console.log(`🎯 Produto atualizado no banco: [${sku}] ${res.rows[0].name}`);
        updatedCount++;
      } else {
        console.warn(`❓ Produto não encontrado no banco com SKU: ${sku}`);
      }
    } catch (err) {
      console.error(`❌ Erro ao processar ${file} (${sku}):`, err.message);
    }
  }

  console.log(`\n🎉 Sincronização de imagens da Delta concluída com sucesso! Total atualizados: ${updatedCount}/${files.length}`);
  await pool.end();
}

run().catch(err => {
  console.error('Falha fatal:', err);
  process.exit(1);
});
