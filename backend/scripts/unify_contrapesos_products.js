const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  const client = await pool.connect();
  try {
    console.log('Iniciando unificação dos Contrapesos Lapek...');
    await client.query('BEGIN');

    // =========================================================================
    // 1. ATUALIZAR PRODUTO EXISTENTE: GARRA ALTA E GARRA BAIXA
    // =========================================================================
    const garraAltaBaixaId = 'prod_1790018672896';
    const garraImg = 'https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/athena_produtos/lapek-92e789022702.webp';

    const garraVariants = [
      // Garra Alta
      {
        id: 'var_garra_alta_5g',
        name: 'Garra Alta 5g (Pct c/ 100 un)',
        sku: 'LPK-50144',
        omieCode: 'LPK-50144',
        omieProductId: 11906918775,
        price: 21.06,
        stockQty: 1,
        colorHex: '',
        image: '',
        isActive: true,
        showInCatalog: true,
        statusControl: 'auto',
        isManualForce: false,
        tipo: 'Garra Alta',
        peso: '5g',
        embalagem: '100 un'
      },
      {
        id: 'var_garra_alta_10g',
        name: 'Garra Alta 10g (Pct c/ 100 un)',
        sku: 'LPK-50145A',
        omieCode: 'LPK-50145A',
        omieProductId: 11877595912,
        price: 47.37,
        stockQty: 4,
        colorHex: '',
        image: '',
        isActive: true,
        showInCatalog: true,
        statusControl: 'auto',
        isManualForce: false,
        tipo: 'Garra Alta',
        peso: '10g',
        embalagem: '100 un'
      },
      {
        id: 'var_garra_alta_15g',
        name: 'Garra Alta 15g (Pct c/ 100 un)',
        sku: 'LPK-50146A',
        omieCode: 'LPK-50146A',
        omieProductId: 11906918783,
        price: 60.65,
        stockQty: 3,
        colorHex: '',
        image: '',
        isActive: true,
        showInCatalog: true,
        statusControl: 'auto',
        isManualForce: false,
        tipo: 'Garra Alta',
        peso: '15g',
        embalagem: '100 un'
      },
      {
        id: 'var_garra_alta_20g',
        name: 'Garra Alta 20g (Pct c/ 100 un)',
        sku: 'LPK-50147A',
        omieCode: 'LPK-50147A',
        omieProductId: 11906918788,
        price: 80.87,
        stockQty: 3,
        colorHex: '',
        image: '',
        isActive: true,
        showInCatalog: true,
        statusControl: 'auto',
        isManualForce: false,
        tipo: 'Garra Alta',
        peso: '20g',
        embalagem: '100 un'
      },
      {
        id: 'var_garra_alta_25g',
        name: 'Garra Alta 25g (Pct c/ 100 un)',
        sku: 'LPK-50148A',
        omieCode: 'LPK-50148A',
        omieProductId: 11906918793,
        price: 101.10,
        stockQty: 3,
        colorHex: '',
        image: '',
        isActive: true,
        showInCatalog: true,
        statusControl: 'auto',
        isManualForce: false,
        tipo: 'Garra Alta',
        peso: '25g',
        embalagem: '100 un'
      },
      {
        id: 'var_garra_alta_30g',
        name: 'Garra Alta 30g (Pct c/ 50 un)',
        sku: 'LPK-50149A',
        omieCode: 'LPK-50149A',
        omieProductId: 11906918800,
        price: 60.65,
        stockQty: 3,
        colorHex: '',
        image: '',
        isActive: true,
        showInCatalog: true,
        statusControl: 'auto',
        isManualForce: false,
        tipo: 'Garra Alta',
        peso: '30g',
        embalagem: '50 un'
      },
      {
        id: 'var_garra_alta_35g',
        name: 'Garra Alta 35g (Pct c/ 50 un)',
        sku: 'LPK-50150A',
        omieCode: 'LPK-50150A',
        omieProductId: null,
        price: '',
        stockQty: '',
        colorHex: '',
        image: '',
        isActive: true,
        showInCatalog: true,
        statusControl: 'auto',
        isManualForce: false,
        tipo: 'Garra Alta',
        peso: '35g',
        embalagem: '50 un'
      },
      {
        id: 'var_garra_alta_40g',
        name: 'Garra Alta 40g (Pct c/ 50 un)',
        sku: 'LPK-50151A',
        omieCode: 'LPK-50151A',
        omieProductId: null,
        price: '',
        stockQty: '',
        colorHex: '',
        image: '',
        isActive: true,
        showInCatalog: true,
        statusControl: 'auto',
        isManualForce: false,
        tipo: 'Garra Alta',
        peso: '40g',
        embalagem: '50 un'
      },
      {
        id: 'var_garra_alta_45g',
        name: 'Garra Alta 45g (Pct c/ 50 un)',
        sku: 'LPK-50152A',
        omieCode: 'LPK-50152A',
        omieProductId: null,
        price: '',
        stockQty: '',
        colorHex: '',
        image: '',
        isActive: true,
        showInCatalog: true,
        statusControl: 'auto',
        isManualForce: false,
        tipo: 'Garra Alta',
        peso: '45g',
        embalagem: '50 un'
      },
      {
        id: 'var_garra_alta_50g',
        name: 'Garra Alta 50g (Pct c/ 50 un)',
        sku: 'LPK-50170A',
        omieCode: 'LPK-50170A',
        omieProductId: null,
        price: '',
        stockQty: '',
        colorHex: '',
        image: '',
        isActive: true,
        showInCatalog: true,
        statusControl: 'auto',
        isManualForce: false,
        tipo: 'Garra Alta',
        peso: '50g',
        embalagem: '50 un'
      },
      {
        id: 'var_garra_alta_55g',
        name: 'Garra Alta 55g (Pct c/ 50 un)',
        sku: 'LPK-50171A',
        omieCode: 'LPK-50171A',
        omieProductId: null,
        price: '',
        stockQty: '',
        colorHex: '',
        image: '',
        isActive: true,
        showInCatalog: true,
        statusControl: 'auto',
        isManualForce: false,
        tipo: 'Garra Alta',
        peso: '55g',
        embalagem: '50 un'
      },
      {
        id: 'var_garra_alta_60g',
        name: 'Garra Alta 60g (Pct c/ 50 un)',
        sku: 'LPK-50172A',
        omieCode: 'LPK-50172A',
        omieProductId: null,
        price: '',
        stockQty: '',
        colorHex: '',
        image: '',
        isActive: true,
        showInCatalog: true,
        statusControl: 'auto',
        isManualForce: false,
        tipo: 'Garra Alta',
        peso: '60g',
        embalagem: '50 un'
      },

      // Garra Baixa
      {
        id: 'var_garra_baixa_5g',
        name: 'Garra Baixa 5g (Pct c/ 100 un)',
        sku: 'LPK-50141A',
        omieCode: 'LPK-50141A',
        omieProductId: null,
        price: '',
        stockQty: '',
        colorHex: '',
        image: '',
        isActive: true,
        showInCatalog: true,
        statusControl: 'auto',
        isManualForce: false,
        tipo: 'Garra Baixa',
        peso: '5g',
        embalagem: '100 un'
      },
      {
        id: 'var_garra_baixa_10g',
        name: 'Garra Baixa 10g (Pct c/ 100 un)',
        sku: 'LPK-50130A',
        omieCode: 'LPK-50130A',
        omieProductId: null,
        price: '',
        stockQty: '',
        colorHex: '',
        image: '',
        isActive: true,
        showInCatalog: true,
        statusControl: 'auto',
        isManualForce: false,
        tipo: 'Garra Baixa',
        peso: '10g',
        embalagem: '100 un'
      },
      {
        id: 'var_garra_baixa_15g',
        name: 'Garra Baixa 15g (Pct c/ 100 un)',
        sku: 'LPK-50131A',
        omieCode: 'LPK-50131A',
        omieProductId: null,
        price: '',
        stockQty: '',
        colorHex: '',
        image: '',
        isActive: true,
        showInCatalog: true,
        statusControl: 'auto',
        isManualForce: false,
        tipo: 'Garra Baixa',
        peso: '15g',
        embalagem: '100 un'
      },
      {
        id: 'var_garra_baixa_20g',
        name: 'Garra Baixa 20g (Pct c/ 100 un)',
        sku: 'LPK-50132A',
        omieCode: 'LPK-50132A',
        omieProductId: null,
        price: '',
        stockQty: '',
        colorHex: '',
        image: '',
        isActive: true,
        showInCatalog: true,
        statusControl: 'auto',
        isManualForce: false,
        tipo: 'Garra Baixa',
        peso: '20g',
        embalagem: '100 un'
      },
      {
        id: 'var_garra_baixa_25g',
        name: 'Garra Baixa 25g (Pct c/ 100 un)',
        sku: 'LPK-50133A',
        omieCode: 'LPK-50133A',
        omieProductId: 11877595917,
        price: 168.68,
        stockQty: 1,
        colorHex: '',
        image: '',
        isActive: true,
        showInCatalog: true,
        statusControl: 'auto',
        isManualForce: false,
        tipo: 'Garra Baixa',
        peso: '25g',
        embalagem: '100 un'
      },
      {
        id: 'var_garra_baixa_30g',
        name: 'Garra Baixa 30g (Pct c/ 50 un)',
        sku: 'LPK-50134A',
        omieCode: 'LPK-50134A',
        omieProductId: null,
        price: '',
        stockQty: '',
        colorHex: '',
        image: '',
        isActive: true,
        showInCatalog: true,
        statusControl: 'auto',
        isManualForce: false,
        tipo: 'Garra Baixa',
        peso: '30g',
        embalagem: '50 un'
      },
      {
        id: 'var_garra_baixa_35g',
        name: 'Garra Baixa 35g (Pct c/ 50 un)',
        sku: 'LPK-50142A',
        omieCode: 'LPK-50142A',
        omieProductId: null,
        price: '',
        stockQty: '',
        colorHex: '',
        image: '',
        isActive: true,
        showInCatalog: true,
        statusControl: 'auto',
        isManualForce: false,
        tipo: 'Garra Baixa',
        peso: '35g',
        embalagem: '50 un'
      },
      {
        id: 'var_garra_baixa_40g',
        name: 'Garra Baixa 40g (Pct c/ 50 un)',
        sku: 'LPK-50135A',
        omieCode: 'LPK-50135A',
        omieProductId: null,
        price: '',
        stockQty: '',
        colorHex: '',
        image: '',
        isActive: true,
        showInCatalog: true,
        statusControl: 'auto',
        isManualForce: false,
        tipo: 'Garra Baixa',
        peso: '40g',
        embalagem: '50 un'
      },
      {
        id: 'var_garra_baixa_45g',
        name: 'Garra Baixa 45g (Pct c/ 50 un)',
        sku: 'LPK-50143A',
        omieCode: 'LPK-50143A',
        omieProductId: null,
        price: '',
        stockQty: '',
        colorHex: '',
        image: '',
        isActive: true,
        showInCatalog: true,
        statusControl: 'auto',
        isManualForce: false,
        tipo: 'Garra Baixa',
        peso: '45g',
        embalagem: '50 un'
      },
      {
        id: 'var_garra_baixa_50g',
        name: 'Garra Baixa 50g (Pct c/ 50 un)',
        sku: 'LPK-50169A',
        omieCode: 'LPK-50169A',
        omieProductId: null,
        price: '',
        stockQty: '',
        colorHex: '',
        image: '',
        isActive: true,
        showInCatalog: true,
        statusControl: 'auto',
        isManualForce: false,
        tipo: 'Garra Baixa',
        peso: '50g',
        embalagem: '50 un'
      },
      {
        id: 'var_garra_baixa_55g',
        name: 'Garra Baixa 55g (Pct c/ 50 un)',
        sku: 'LPK-50128A',
        omieCode: 'LPK-50128A',
        omieProductId: null,
        price: '',
        stockQty: '',
        colorHex: '',
        image: '',
        isActive: true,
        showInCatalog: true,
        statusControl: 'auto',
        isManualForce: false,
        tipo: 'Garra Baixa',
        peso: '55g',
        embalagem: '50 un'
      },
      {
        id: 'var_garra_baixa_60g',
        name: 'Garra Baixa 60g (Pct c/ 50 un)',
        sku: 'LPK-50129A',
        omieCode: 'LPK-50129A',
        omieProductId: null,
        price: '',
        stockQty: '',
        colorHex: '',
        image: '',
        isActive: true,
        showInCatalog: true,
        statusControl: 'auto',
        isManualForce: false,
        tipo: 'Garra Baixa',
        peso: '60g',
        embalagem: '50 un'
      }
    ];

    const garraSpecs = [
      'Tipo de Fixação: Garra Metálica (Presilha / Clip-on)',
      'Aplicação: Rodas de ferro e aço com borda flangeada tradicional',
      'Modelos Disponíveis: Garra Alta (rodas de aço convencionais) e Garra Baixa (rodas com rebordo espesso)',
      'Faixa de Gramaturas: 5 g até 60 g',
      'Embalagens: Pacotes com 50 e 100 unidades (conforme gramatura)',
      'Fixação: Encaixe sob pressão com mola de retenção de alta durabilidade',
      'Benefícios: Redução de vibrações em alta velocidade e preservação do conjunto de suspensão e pneus',
      'Marca: Lapek'
    ];

    const garraDescription = `Os contrapesos de mola Lapek foram especialmente desenvolvidos para o balanceamento dinâmico e estático de rodas de ferro e aço em veículos de passeio, utilitários, furgões e caminhonetes.

Fabricados com presilhas de fixação com alta pressão elástica e tratamento superficial resistente à oxidação, oferecem encaixe preciso e seguro na borda do aro, evitando desprendimento em frenagens e altas rotações. Contribuem diretamente para a estabilidade do veículo, eliminando trepidações na direção e prevenindo o desgaste prematuro dos pneus e componentes da suspensão.`;

    await client.query(`
      UPDATE products SET
        variants = $1::jsonb,
        specs = $2::jsonb,
        description = $3,
        price = '21.06',
        preco_venda = '21.06',
        in_stock = true,
        estoque_quantidade = 18,
        price_negotiable = true,
        status = 'published',
        sku = 'LPK-CONTRAPESOS-GARRA',
        omie_code = 'LPK-CONTRAPESOS-GARRA',
        updated_at = NOW()
      WHERE id = $4
    `, [
      JSON.stringify(garraVariants),
      JSON.stringify(garraSpecs),
      garraDescription,
      garraAltaBaixaId
    ]);

    console.log(`✅ Produto Garra Alta e Garra Baixa (${garraAltaBaixaId}) atualizado com ${garraVariants.length} variantes!`);

    // =========================================================================
    // 2. CRIAR NOVO PRODUTO: CONTRAPESOS COLANTES ADESIVOS (LIGA LEVE)
    // =========================================================================
    const colanteId = 'prod_lapek_contrapesos-colantes-adesivos';
    const colanteSlug = 'contrapesos-colantes-adesivos-de-aco-para-rodas-de-liga-leve-lapek';

    const colanteVariants = [
      {
        id: 'var_colante_50138a',
        name: 'Fita Adesiva 5/10g Perfil Baixo - 60g (Pct c/ 50 un)',
        sku: 'LPK-50138A',
        omieCode: 'LPK-50138A',
        omieProductId: 11877595907,
        price: 96.41,
        stockQty: 5,
        colorHex: '',
        image: '',
        isActive: true,
        showInCatalog: true,
        statusControl: 'auto',
        isManualForce: false,
        segmentacao: '5g e 10g',
        perfil: 'Baixo',
        pesoBarra: '60g',
        embalagem: '50 unidades (3 kg total)'
      },
      {
        id: 'var_colante_50137',
        name: 'Fita Adesiva 10/10g Perfil Alto - 60g (Pct c/ 50 un)',
        sku: 'LPK-50137',
        omieCode: 'LPK-50137',
        omieProductId: 11906918770,
        price: 86.31,
        stockQty: 0,
        colorHex: '',
        image: '',
        isActive: true,
        showInCatalog: true,
        statusControl: 'auto',
        isManualForce: false,
        segmentacao: '10g',
        perfil: 'Alto',
        pesoBarra: '60g',
        embalagem: '50 unidades (3 kg total)'
      },
      {
        id: 'var_colante_50137a',
        name: 'Fita Adesiva de Aço 10/10g - 60g (Pct c/ 50 un)',
        sku: 'LPK-50137A',
        omieCode: 'LPK-50137A',
        omieProductId: 11919232433,
        price: 81.14,
        stockQty: 2,
        colorHex: '',
        image: '',
        isActive: true,
        showInCatalog: true,
        statusControl: 'auto',
        isManualForce: false,
        segmentacao: '10g',
        perfil: 'Padrão em Aço',
        pesoBarra: '60g',
        embalagem: '50 unidades (3 kg total)'
      }
    ];

    const colanteSpecs = [
      'Tipo de Fixação: Fita Dupla Face Automotiva de Alta Aderência (Stick-on)',
      'Aplicação: Rodas de Liga Leve, Alumínio, Magnésio e Rodas Esportivas',
      'Material: Aço zincado com tratamento superficial e proteção anticorrosiva',
      'Peso por Barra: 60 g por fita adesiva',
      'Segmentações Disponíveis: 5 g / 10 g (Perfil Baixo) ou 10 g / 10 g (Perfil Alto e Aço)',
      'Embalagem: Pacote com 50 barras (peso líquido total de 3,0 kg)',
      'Vantagens: Não arranha o acabamento da roda e não interfere com as pinças de freio',
      'Marca: Lapek'
    ];

    const colanteTabs = [
      {
        id: 'tab_colantes_modelos',
        title: 'Tabela de Modelos & Códigos',
        content: '| Código | Segmentação | Perfil | Peso da Barra | Embalagem | Aplicação Principal |\n| ---------- | ----------- | ------ | ------------- | --------- | ------------------- |\n| LPK-50138A | 5 g e 10 g | Baixo | 60 g (4x5g + 4x10g) | Pct c/ 50 un | Rodas esportivas com folga reduzida para pinça de freio |\n| LPK-50137 | 10 g | Alto | 60 g (6x10g) | Pct c/ 50 un | Rodas de liga leve convencionais e utilitários |\n| LPK-50137A | 10 g | Aço Adesivo | 60 g (6x10g) | Pct c/ 50 un | Aplicação geral em liga leve com acabamento em aço |'
      },
      {
        id: 'tab_colantes_diferenciais',
        title: 'Diferenciais',
        content: '• Fita dupla face automotiva com adesão ultra resistente a intempéries e rotação\n• Segmentos destacados facilmente com as mãos ou alicate aplicador\n• Perfil baixo que evita atrito com pinças de freio esportivas\n• Tratamento superficial contra ferrugem, poeira de pastilha e umidade\n• Não agride nem arranha a pintura de rodas diamantadas ou esportivas\n• Embalagens práticas com 50 barras de 60 g (total de 3 kg de contrapesos por embalagem)'
      },
      {
        id: 'tab_colantes_aplicacoes',
        title: 'Aplicações',
        content: '• Balanceamento dinâmico e estático de rodas esportivas e liga leve\n• Centros automotivos, autocenters e borracharias profissionais\n• Veículos de passeio, SUVs, picapes e automóveis premium\n• Montadoras, frotistas e concessionárias'
      }
    ];

    const colanteDescription = `Os Contrapesos Colantes Adesivos de Aço Lapek foram desenvolvidos especialmente para o balanceamento estático e dinâmico de rodas de liga leve, alumínio e magnésio de veículos de passeio, SUVs e esportivos.

Fabricados em aço com tratamento protetivo anticorrosivo e equipados com fita adesiva automotiva de alta adesão, proporcionam fixação firme mesmo sob altas velocidades, rotações intensas e variações severas de temperatura. Seu formato segmentado permite destaque rápido e moldagem anatômica na curvatura do canal interno da roda, preservando o acabamento visual e garantindo um balanceamento suave e livre de vibrações.`;

    const colanteTags = [
      'contrapesos colantes adesivos de aco para rodas de liga leve - lapek',
      'contrapeso colante',
      'contrapeso adesivo',
      'contrapeso de roda aco adesivo',
      'chumbo colante',
      'fita colante balanceamento',
      'contrapeso liga leve',
      'contrapeso perfil baixo',
      'lapek',
      'lpk-50138a',
      'lpk-50137',
      'lpk-50137a',
      'balanceamento de rodas',
      'acessorios para borracharia',
      'desmontadoras e balanceadoras'
    ];

    // Verificar se o produto colante já existe ou inserir
    const checkColante = await client.query('SELECT id FROM products WHERE id = $1', [colanteId]);
    if (checkColante.rows.length === 0) {
      await client.query(`
        INSERT INTO products (
          id, name, slug, category_id, brand_id, price, preco_venda, price_negotiable,
          badge, status, is_featured, image, images, alt_text, description, specs,
          attachments, in_stock, custom_tabs, product_type, a_points, estoque_quantidade,
          tags, compatible_product_ids, recommended_product_ids, sku, omie_code,
          variants, weight, height, width, length, requires_equipment_serial, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8,
          $9, $10, $11, $12, $13::jsonb, $14, $15, $16::jsonb,
          $17::jsonb, $18, $19::jsonb, $20, $21, $22,
          $23::jsonb, $24::jsonb, $25::jsonb, $26, $27,
          $28::jsonb, $29, $30, $31, $32, $33, NOW(), NOW()
        )
      `, [
        colanteId,
        'Contrapesos Colantes Adesivos de Aço para Rodas de Liga Leve - Lapek',
        colanteSlug,
        'cat_desmontadoras',
        'brand_1789587409948',
        '81.14',
        '81.14',
        true,
        'Liga Leve',
        'published',
        false,
        garraImg, // Mesma imagem provisória conforme solicitado
        JSON.stringify([garraImg]),
        'Contrapesos Colantes Adesivos de Aço para Rodas de Liga Leve Lapek Balanceamento de Rodas Athena Soluções Automotivas',
        colanteDescription,
        JSON.stringify(colanteSpecs),
        JSON.stringify([]),
        true,
        JSON.stringify(colanteTabs),
        'physical',
        0,
        7,
        JSON.stringify(colanteTags),
        JSON.stringify([]),
        JSON.stringify([]),
        'LPK-CONTRAPESOS-COLANTES',
        'LPK-CONTRAPESOS-COLANTES',
        JSON.stringify(colanteVariants),
        '3.000',
        '10.00',
        '15.00',
        '20.00',
        false
      ]);
      console.log(`✅ Novo produto de contrapesos colantes criado: ${colanteId}`);
    } else {
      await client.query(`
        UPDATE products SET
          name = $2, slug = $3, category_id = $4, brand_id = $5,
          price = $6, preco_venda = $7, price_negotiable = $8,
          badge = $9, status = $10, image = $11, images = $12::jsonb,
          alt_text = $13, description = $14, specs = $15::jsonb,
          in_stock = $16, custom_tabs = $17::jsonb, estoque_quantidade = $18,
          tags = $19::jsonb, sku = $20, omie_code = $21, variants = $22::jsonb,
          updated_at = NOW()
        WHERE id = $1
      `, [
        colanteId,
        'Contrapesos Colantes Adesivos de Aço para Rodas de Liga Leve - Lapek',
        colanteSlug,
        'cat_desmontadoras',
        'brand_1789587409948',
        '81.14',
        '81.14',
        true,
        'Liga Leve',
        'published',
        garraImg,
        JSON.stringify([garraImg]),
        'Contrapesos Colantes Adesivos de Aço para Rodas de Liga Leve Lapek Balanceamento de Rodas Athena Soluções Automotivas',
        colanteDescription,
        JSON.stringify(colanteSpecs),
        true,
        JSON.stringify(colanteTabs),
        7,
        JSON.stringify(colanteTags),
        'LPK-CONTRAPESOS-COLANTES',
        'LPK-CONTRAPESOS-COLANTES',
        JSON.stringify(colanteVariants)
      ]);
      console.log(`✅ Produto de contrapesos colantes atualizado: ${colanteId}`);
    }

    // =========================================================================
    // 3. MIGRAR HISTÓRICO DE PEDIDOS (ORDER_ITEMS)
    // =========================================================================
    const oldColanteIds = ['prod_omie_11906918770', 'prod_omie_11877595907', 'prod_omie_11919232433'];
    const updatedOrderItems = await client.query(`
      UPDATE order_items
      SET product_id = $1
      WHERE product_id = ANY($2)
      RETURNING id, order_id, variant_sku
    `, [colanteId, oldColanteIds]);

    console.log(`📦 ${updatedOrderItems.rows.length} itens de pedidos migrados para o produto pai ${colanteId}.`);

    // =========================================================================
    // 4. REMOVER OS 10 PRODUTOS RASCUNHOS DESMEMBRADOS
    // =========================================================================
    const draftIdsToDelete = [
      // Garra Alta & Baixa
      'prod_omie_11906918775',
      'prod_omie_11877595912',
      'prod_omie_11906918783',
      'prod_omie_11906918788',
      'prod_omie_11906918793',
      'prod_omie_11906918800',
      'prod_omie_11877595917',
      // Colantes
      'prod_omie_11906918770',
      'prod_omie_11877595907',
      'prod_omie_11919232433'
    ];

    const delRes = await client.query(`
      DELETE FROM products
      WHERE id = ANY($1)
      RETURNING id, sku, name
    `, [draftIdsToDelete]);

    console.log(`🧹 ${delRes.rows.length} produtos em rascunho avulsos foram excluídos com sucesso.`);

    await client.query('COMMIT');
    console.log('🎉 Operação concluída com sucesso!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Erro durante a unificação:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch(() => process.exit(1));
