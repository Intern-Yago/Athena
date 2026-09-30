const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '../.env');
const env = fs.readFileSync(envPath, 'utf8');
const match = env.match(/DATABASE_URL=([^\r\n]+)/);
if (!match) {
  console.error('DATABASE_URL not found in .env');
  process.exit(1);
}

const { Pool } = require('../node_modules/pg');
const pool = new Pool({
  connectionString: match[1].replace(/[\"']/g, ''),
  ssl: { rejectUnauthorized: false }
});

const brandDescriptions = {
  'brand_sigmatools': 'Líder e referência em ferramentas pneumáticas, chaves de impacto Brushless a bateria, soquetes de alta precisão em Cromo-Vanádio e linha completa para estética e detalhamento automotivo.',
  'brand_mahovi': 'Uma das maiores fabricantes de elevadores hidráulicos de 2 e 4 colunas, alinhadores 3D computadorizados, desmontadoras com braço Run-Flat e maquinário pesado para auto centers e concessionárias.',
  'brand_1789587409948': 'Especialista em soluções para lubrificação e borracharia: macacos hidráulicos de alta tonelagem, válvulas profissionais sem câmara, bombas de abastecimento, engraxadeiras manuais e pneumáticas.',
  'brand_1790613109980': 'Pioneira em infraestrutura de mobilidade elétrica: conectores e plugues Tipo 2 e GB/T, cabos reforçados para carregamento de veículos elétricos e híbridos, e quadros de proteção dedicados.',
  'brand_delta': 'Referência nacional no desenvolvimento e fabricação de ferramentas especiais para injeção eletrônica, extração de conectores elétricos, sistemas de arrefecimento, motor e suspensão.',
  'brand_wolfcar': 'Padrão premium em mobiliário modular e organização de oficinas: armários industriais reforçados, bancadas pesadas, painéis de ferramentas e carrinhos com Realidade Aumentada (AR).',
  'brand_starkx': 'Engenharia avançada em diagnóstico eletrônico: testadores digitais de condutância para baterias com emissão de laudo, câmeras de inspeção endoscópica, analisadores de fluido de freio e TPMS.',
  'brand_1790019814846': 'Tecnologia europeia de diagnóstico automotivo guiado por Inteligência Artificial, scanners com mapeamento de topologia de rede CAN, programação de chaves IMMO e clonagem de centrais ECU.',
  'brand_1789665068798': 'Equipamentos de alta tecnologia para descarbonização e regeneração térmica e química de filtros de partículas Diesel (DPF), catalisadores SCR e sistemas de pós-tratamento de emissões.',
  'brand_1788282718425': 'Soluções proprietárias Athena em engenharia e inteligência automotiva: pacotes anuais de atualização de banco de dados para alinhadores 3D e liberação de acesso Security Gateway (SGW).',
  'brand_1790613841037': 'Tradicional fabricante brasileira de equipamentos para oficina: máquinas de limpeza e teste de bicos injetores por ultrassom, manômetros de combustível, sangradores de freio e ferramentas eletrônicas.'
};

async function execute() {
  try {
    await pool.query('BEGIN');
    let updatedCount = 0;
    for (const [id, desc] of Object.entries(brandDescriptions)) {
      const res = await pool.query('UPDATE brands SET description = $1 WHERE id = $2', [desc, id]);
      if (res.rowCount > 0) updatedCount++;
    }
    await pool.query('COMMIT');
    console.log(`✅ PostgreSQL atualizado: ${updatedCount} marcas receberam descrições profissionais!`);

    // Atualizar athena-db.json local também
    const dbPath = path.join(__dirname, '../data/athena-db.json');
    if (fs.existsSync(dbPath)) {
      const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
      if (Array.isArray(db.brands)) {
        db.brands.forEach(b => {
          if (brandDescriptions[b.id]) {
            b.description = brandDescriptions[b.id];
          }
        });
      }
      fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
      console.log('✅ athena-db.json atualizado com as novas descrições de marcas!');
    }
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error('❌ Erro na execução:', err);
  } finally {
    pool.end();
  }
}

execute();
