const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const productId = 'prod_1789415995966';

const rawVariantsData = [
  // Encaixe 1/2" — comprimento 78 mm
  { drive: '1/2"', length: '78 mm', size: '8 mm', code: '0603121008' },
  { drive: '1/2"', length: '78 mm', size: '10 mm', code: '0603121010' },
  { drive: '1/2"', length: '78 mm', size: '11 mm', code: '0603121011' },
  { drive: '1/2"', length: '78 mm', size: '12 mm', code: '0603121012' },
  { drive: '1/2"', length: '78 mm', size: '13 mm', code: '0603121013' },
  { drive: '1/2"', length: '78 mm', size: '14 mm', code: '0603121014' },
  { drive: '1/2"', length: '78 mm', size: '15 mm', code: '0603121015' },
  { drive: '1/2"', length: '78 mm', size: '16 mm', code: '0603121016' },
  { drive: '1/2"', length: '78 mm', size: '17 mm', code: '0603121017' },
  { drive: '1/2"', length: '78 mm', size: '18 mm', code: '0603121018' },
  { drive: '1/2"', length: '78 mm', size: '19 mm', code: '0603121019' },
  { drive: '1/2"', length: '78 mm', size: '21 mm', code: '0603121021' },
  { drive: '1/2"', length: '78 mm', size: '22 mm', code: '0603121022' },
  { drive: '1/2"', length: '78 mm', size: '24 mm', code: '0603121024' },
  { drive: '1/2"', length: '78 mm', size: '27 mm', code: '0603121027' },
  { drive: '1/2"', length: '78 mm', size: '32 mm', code: '0603121032' },

  // Encaixe 3/4" — comprimento 80 mm
  { drive: '3/4"', length: '80 mm', size: '22 mm', code: '0603122022' },
  { drive: '3/4"', length: '80 mm', size: '23 mm', code: '0603122023' },
  { drive: '3/4"', length: '80 mm', size: '24 mm', code: '0603122024' },
  { drive: '3/4"', length: '80 mm', size: '27 mm', code: '0603122027' },
  { drive: '3/4"', length: '80 mm', size: '28 mm', code: '0603122028' },
  { drive: '3/4"', length: '80 mm', size: '29 mm', code: '0603122029' },
  { drive: '3/4"', length: '80 mm', size: '30 mm', code: '0603122030' },
  { drive: '3/4"', length: '80 mm', size: '32 mm', code: '0603122032' },
  { drive: '3/4"', length: '80 mm', size: '33 mm', code: '0603122033' },
  { drive: '3/4"', length: '80 mm', size: '36 mm', code: '0603122036' },
  { drive: '3/4"', length: '80 mm', size: '38 mm', code: '0603122038' },
  { drive: '3/4"', length: '80 mm', size: '41 mm', code: '0603122041', omieProductId: 11878334519, price: 52.60 },
  { drive: '3/4"', length: '80 mm', size: '42 mm', code: '0603122042' },
  { drive: '3/4"', length: '80 mm', size: '50 mm', code: '0603122050' },
  { drive: '3/4"', length: '80 mm', size: '65 mm', code: '0603122065' },
  { drive: '3/4"', length: '80 mm', size: '72 mm', code: '0603122072' },
  { drive: '3/4"', length: '80 mm', size: '75 mm', code: '0603122075' },

  // Encaixe 1" — comprimento 80 mm
  { drive: '1"', length: '80 mm', size: '22 mm', code: '0603123022' },
  { drive: '1"', length: '80 mm', size: '24 mm', code: '0603123024' },
  { drive: '1"', length: '80 mm', size: '27 mm', code: '0603123027' },
  { drive: '1"', length: '80 mm', size: '30 mm', code: '0603123030' },
  { drive: '1"', length: '80 mm', size: '32 mm', code: '0603123032' },
  { drive: '1"', length: '80 mm', size: '33 mm', code: '0603123033' },
  { drive: '1"', length: '80 mm', size: '36 mm', code: '0603123036' },
  { drive: '1"', length: '80 mm', size: '38 mm', code: '0603123038' },
  { drive: '1"', length: '80 mm', size: '41 mm', code: '0603123041' },
  { drive: '1"', length: '80 mm', size: '42 mm', code: '0603123042' },
  { drive: '1"', length: '80 mm', size: '46 mm', code: '0603123046' },
  { drive: '1"', length: '80 mm', size: '50 mm', code: '0603123050' },
  { drive: '1"', length: '80 mm', size: '55 mm', code: '0603123055' },
  { drive: '1"', length: '80 mm', size: '60 mm', code: '0603123060' },
  { drive: '1"', length: '80 mm', size: '65 mm', code: '0603123065' },
  { drive: '1"', length: '80 mm', size: '72 mm', code: '0603123072' },
  { drive: '1"', length: '80 mm', size: '75 mm', code: '0603123075' }
];

const variants = rawVariantsData.map((item, idx) => {
  const paddedIdx = String(idx + 1).padStart(2, '0');
  return {
    id: `var_${Date.now()}_${paddedIdx}`,
    name: `${item.drive} - ${item.size}`,
    sku: item.code,
    omieCode: item.code,
    omieProductId: item.omieProductId || null,
    colorHex: '',
    price: item.price !== undefined ? item.price : '',
    image: '',
    stockQty: '',
    statusControl: 'auto',
    isManualForce: false,
    isActive: true,
    showInCatalog: true,
    drive: item.drive,
    size: item.size,
    length: item.length
  };
});

const updatedProduct = {
  name: 'Soquete de Impacto CR-MO Cromo-Molibdênio - Sigma Tools',
  slug: 'soquete-de-impacto-cr-mo-cromo-molibdenio-sigma-tools',
  description: 'Os Soquetes de Impacto CR-MO Sigma Tools são fabricados em **Cromo-Molibdênio (Cr-Mo)**, material desenvolvido para suportar as solicitações e impactos característicos de ferramentas pneumáticas e elétricas de impacto. O acabamento fosfatizado auxilia na proteção da peça e proporciona maior resistência para o uso em oficinas e aplicações mecânicas.\n\nDisponíveis em diferentes medidas e encaixes de **1/2", 3/4" e 1"**, atendem diferentes necessidades de desmontagem e montagem de componentes automotivos e mecânicos. Os modelos possuem alta resistência à ruptura e atendem à **norma DIN 3129**.',
  specs: [
    'Material: Cromo-Molibdênio (Cr-Mo)',
    'Acabamento: Fosfatizado',
    'Aplicação: Ferramentas de impacto',
    'Alta resistência à ruptura',
    'Norma: DIN 3129',
    'Encaixes disponíveis: 1/2", 3/4" e 1"',
    'Comprimentos: 78 mm e 80 mm, conforme a medida/modelo'
  ],
  customTabs: [
    {
      id: 'tab_medidas_codigos',
      title: 'Tabela de Medidas & Códigos',
      content: '| Encaixe | Comprimento | Medida | Código        | Emb. |\n| ------- | ----------: | -----: | ------------- | ---: |\n| 1/2″    |       78 mm |   8 mm | 06 03 12 1008 |    4 |\n| 1/2″    |       78 mm |  10 mm | 06 03 12 1010 |    4 |\n| 1/2″    |       78 mm |  11 mm | 06 03 12 1011 |    4 |\n| 1/2″    |       78 mm |  12 mm | 06 03 12 1012 |    4 |\n| 1/2″    |       78 mm |  13 mm | 06 03 12 1013 |    4 |\n| 1/2″    |       78 mm |  14 mm | 06 03 12 1014 |    4 |\n| 1/2″    |       78 mm |  15 mm | 06 03 12 1015 |    4 |\n| 1/2″    |       78 mm |  16 mm | 06 03 12 1016 |    4 |\n| 1/2″    |       78 mm |  17 mm | 06 03 12 1017 |    3 |\n| 1/2″    |       78 mm |  18 mm | 06 03 12 1018 |    4 |\n| 1/2″    |       78 mm |  19 mm | 06 03 12 1019 |    3 |\n| 1/2″    |       78 mm |  21 mm | 06 03 12 1021 |    2 |\n| 1/2″    |       78 mm |  22 mm | 06 03 12 1022 |    4 |\n| 1/2″    |       78 mm |  24 mm | 06 03 12 1024 |    1 |\n| 1/2″    |       78 mm |  27 mm | 06 03 12 1027 |    4 |\n| 1/2″    |       78 mm |  32 mm | 06 03 12 1032 |    4 |\n| 3/4″    |       80 mm |  22 mm | 06 03 12 2022 |    1 |\n| 3/4″    |       80 mm |  23 mm | 06 03 12 2023 |    1 |\n| 3/4″    |       80 mm |  24 mm | 06 03 12 2024 |    1 |\n| 3/4″    |       80 mm |  27 mm | 06 03 12 2027 |    1 |\n| 3/4″    |       80 mm |  28 mm | 06 03 12 2028 |    1 |\n| 3/4″    |       80 mm |  29 mm | 06 03 12 2029 |    1 |\n| 3/4″    |       80 mm |  30 mm | 06 03 12 2030 |    1 |\n| 3/4″    |       80 mm |  32 mm | 06 03 12 2032 |    1 |\n| 3/4″    |       80 mm |  33 mm | 06 03 12 2033 |    1 |\n| 3/4″    |       80 mm |  36 mm | 06 03 12 2036 |    1 |\n| 3/4″    |       80 mm |  38 mm | 06 03 12 2038 |    1 |\n| 3/4″    |       80 mm |  41 mm | 06 03 12 2041 |    1 |\n| 3/4″    |       80 mm |  42 mm | 06 03 12 2042 |    1 |\n| 3/4″    |       80 mm |  50 mm | 06 03 12 2050 |    1 |\n| 3/4″    |       80 mm |  65 mm | 06 03 12 2065 |    1 |\n| 3/4″    |       80 mm |  72 mm | 06 03 12 2072 |    1 |\n| 3/4″    |       80 mm |  75 mm | 06 03 12 2075 |    1 |\n| 1″      |       80 mm |  22 mm | 06 03 12 3022 |    1 |\n| 1″      |       80 mm |  24 mm | 06 03 12 3024 |    1 |\n| 1″      |       80 mm |  27 mm | 06 03 12 3027 |    1 |\n| 1″      |       80 mm |  30 mm | 06 03 12 3030 |    1 |\n| 1″      |       80 mm |  32 mm | 06 03 12 3032 |    1 |\n| 1″      |       80 mm |  33 mm | 06 03 12 3033 |    1 |\n| 1″      |       80 mm |  36 mm | 06 03 12 3036 |    1 |\n| 1″      |       80 mm |  38 mm | 06 03 12 3038 |    1 |\n| 1″      |       80 mm |  41 mm | 06 03 12 3041 |    1 |\n| 1″      |       80 mm |  42 mm | 06 03 12 3042 |    1 |\n| 1″      |       80 mm |  46 mm | 06 03 12 3046 |    1 |\n| 1″      |       80 mm |  50 mm | 06 03 12 3050 |    1 |\n| 1″      |       80 mm |  55 mm | 06 03 12 3055 |    1 |\n| 1″      |       80 mm |  60 mm | 06 03 12 3060 |    1 |\n| 1″      |       80 mm |  65 mm | 06 03 12 3065 |    1 |\n| 1″      |       80 mm |  72 mm | 06 03 12 3072 |    1 |\n| 1″      |       80 mm |  75 mm | 06 03 12 3075 |    1 |'
    },
    {
      id: 'tab_diferenciais',
      title: 'Diferenciais',
      content: '• Fabricado em Cromo-Molibdênio (Cr-Mo)\n• Alta resistência para aplicações de impacto\n• Acabamento fosfatizado\n• Maior resistência à ruptura\n• Diversidade de medidas para diferentes aplicações\n• Atende à norma DIN 3129\n• Disponível em encaixes de 1/2", 3/4" e 1"'
    },
    {
      id: 'tab_aplicacoes',
      title: 'Aplicações',
      content: '• Manutenção automotiva\n• Oficinas mecânicas\n• Desmontagem e montagem de componentes\n• Uso com ferramentas pneumáticas de impacto\n• Uso com ferramentas elétricas de impacto compatíveis\n• Serviços de manutenção mecânica\n• Reparação automotiva e industrial'
    }
  ],
  tags: [
    'soquete de impacto', 'soquete impacto', 'soquete Cr-Mo', 'soquete cromo molibdênio',
    'soquete de impacto Cr-Mo', 'soquete para chave de impacto', 'soquete pneumático',
    'soquete para parafusadeira de impacto', 'soquete mecânico', 'soquete automotivo',
    'soquete sextavado', 'ferramenta de impacto', 'ferramentas para oficina',
    'ferramentas automotivas', 'ferramentas mecânicas', 'ferramentas pneumáticas',
    'ferramentas elétricas', 'chave de impacto', 'chave de impacto pneumática',
    'manutenção automotiva', 'manutenção mecânica', 'oficina mecânica',
    'reparação automotiva', 'desmontagem automotiva', 'montagem automotiva',
    'mecânica automotiva', 'acessórios para chave de impacto', 'soquete 1/2',
    'soquete 3/4', 'soquete 1 polegada', 'soquete 1"', 'soquete 8mm', 'soquete 10mm',
    'soquete 14mm', 'soquete 17mm', 'soquete 19mm', 'soquete 21mm', 'soquete 22mm',
    'soquete 24mm', 'soquete 27mm', 'soquete 30mm', 'soquete 32mm', 'soquete 36mm',
    'soquete 38mm', 'soquete 41mm', 'soquete 42mm', 'soquete 46mm', 'soquete 50mm',
    'soquete 55mm', 'soquete 60mm', 'soquete 65mm', 'soquete 72mm', 'soquete 75mm',
    'Sigma Tools', 'DIN 3129'
  ],
  altText: 'Soquete de Impacto CR-MO Cromo-Molibdênio Sigma Tools Soquetes Ferramenta de Impacto Athena Soluções Automotivas',
  variants
};

async function run() {
  console.log('Iniciando atualização de', productId);
  console.log('Total de variações configuradas:', variants.length);

  const query = `
    UPDATE products SET
      name = $1,
      slug = $2,
      description = $3,
      specs = $4::jsonb,
      custom_tabs = $5::jsonb,
      tags = $6::jsonb,
      alt_text = $7,
      variants = $8::jsonb,
      category_id = $9,
      brand_id = $10,
      price_negotiable = true,
      status = 'published',
      updated_at = NOW()
    WHERE id = $11
    RETURNING id, name, slug, jsonb_array_length(variants) as total_variants, status, price_negotiable;
  `;

  const values = [
    updatedProduct.name,
    updatedProduct.slug,
    updatedProduct.description,
    JSON.stringify(updatedProduct.specs),
    JSON.stringify(updatedProduct.customTabs),
    JSON.stringify(updatedProduct.tags),
    updatedProduct.altText,
    JSON.stringify(updatedProduct.variants),
    'cat_1789405752776',
    'brand_sigmatools',
    productId
  ];

  const res = await pool.query(query, values);
  console.log('Resultado da atualização:', res.rows[0]);
  await pool.end();
}

run().catch(err => {
  console.error('Erro na atualização:', err);
  pool.end();
});
