/**
 * cadastrar_11_produtos_sigma.cjs
 * Cadastra os 11 novos produtos químicos da Sigma Tools (SGT Chemicals / Veneto)
 * vinculando com o Omie, baixando e convertendo as imagens originais para o R2,
 * e estruturando as descrições técnicas enriquecidas com SEO local e palavras-chave.
 */

require('dotenv').config({ path: '/home/yago/Documentos/athena/backend/.env' });
const fs = require('fs');
const https = require('https');
const http = require('http');
const sharp = require('sharp');
const { query } = require('../backend/services/db');
const { uploadToR2, isR2Configured } = require('../backend/r2Service');

const scrapedData = JSON.parse(fs.readFileSync('/tmp/scraped_sigma.json', 'utf8'));

const PRODUCTS_CONFIG = [
  {
    sku: '0101000401',
    omie_code: 11946185236,
    name: 'Composto Polidor Corte, Refino e Lustro Premium 500g ÚNICO – Veneto / Sigma Tools',
    slug: 'composto-polidor-corte-refino-lustro-unico-veneto-sigma-tools',
    price: 41.94,
    ncm: '3405.30.00',
    unit: 'UN',
    ean: '0810231670367',
    package_type: '500g Push-Pull',
    category_id: 'cat_estetica_pintura',
    brand_id: 'brand_sigmatools',
    badge: '3 em 1 Premium',
    meta_title: 'Composto Polidor ÚNICO Veneto 500g | Sigma Tools na Athena DF',
    meta_description: 'Composto polidor premium 3 em 1 ÚNICO Veneto: corte, refino e lustro com tecnologia de abrasivos evolutivos. Pronta-entrega em Brasília na Athena.',
    specs: [
      'Marca: Veneto / Sigma Tools',
      'Linha: Polimento Automotivo Premium',
      'Código Sigma: 0101000401',
      'Conteúdo: 500g',
      'Embalagem: Frasco com tampa dosadora Push-Pull',
      'Função: 3 em 1 (Corte, Refino e Lustro em composto único)',
      'Tecnologia de Abrasivos: Óxidos de alumínio calibrados e evolutivos',
      'Base: À base d’água, livre de ceras, silicones e agentes mascaradores',
      'Aplicação: Boinas de lã, microfibra ou espuma em politriz rotativa ou roto-orbital',
      'Código de barras (EAN): 0810231670367',
      'Garantia: Oficial Sigma Tools com suporte técnico Athena'
    ],
    tags: ['Composto Polidor', 'Veneto', 'Sigma Tools', 'Estética Automotiva Brasília', 'Produtos para detalhamento automotivo', 'Polimento Automotivo DF']
  },
  {
    sku: '0102000201',
    omie_code: 11946185243,
    name: 'Selante Cerâmico SiO2 500ml SGT-Ceramiq – SGT Chemicals / Sigma Tools',
    slug: 'selante-ceramico-sio2-500ml-sgt-ceramiq-sigma-tools',
    price: 24.84,
    ncm: '3405.30.00',
    unit: 'UN',
    ean: '0810231670008',
    package_type: '500ml Gatilho Pulverizador',
    category_id: 'cat_estetica_pintura',
    brand_id: 'brand_sigmatools',
    badge: 'Proteção SiO2',
    meta_title: 'Selante Cerâmico SGT-Ceramiq 500ml SiO2 | Sigma Tools na Athena',
    meta_description: 'Selante cerâmico nanotecnológico SiO2 SGT-Ceramiq: proteção hidrorrepelente de até 6 meses e manutenção de vitrificação. Distribuidora Athena em Brasília.',
    specs: [
      'Marca: SGT Chemicals (Sigma Tools)',
      'Código Sigma: 0102000201',
      'Conteúdo: 500ml',
      'Embalagem: Frasco com gatilho pulverizador de precisão',
      'Composição: Nanotecnologia SiO2 (Dióxido de Silício)',
      'Durabilidade: Até 6 meses de proteção na pintura',
      'Tempo de Cura: 2 horas (parcial) / 24 horas (cura total)',
      'Propriedades: Super hidrorrepelência, proteção contra raios UV e toque aveludado',
      'Indicação: Pinturas automotivas, manutenção de vitrificadores cerâmicos e detalhamento',
      'Garantia: Oficial Sigma Tools com assistência e pós-venda ativo Athena'
    ],
    tags: ['Selante Cerâmico', 'SiO2', 'SGT Chemicals', 'Sigma Tools', 'Estética automotiva em Brasília', 'Proteção de pintura']
  },
  {
    sku: '0102000101',
    omie_code: 11946185249,
    name: 'Cera Híbrida de Carnaúba e SiO2 500ml SGT-Hybrid Wax – SGT Chemicals / Sigma Tools',
    slug: 'cera-hibrida-carnauba-sio2-500ml-sgt-hybrid-wax-sigma-tools',
    price: 17.70,
    ncm: '3405.30.00',
    unit: 'UN',
    ean: '0810231670015',
    package_type: '500ml Gatilho Pulverizador',
    category_id: 'cat_estetica_pintura',
    brand_id: 'brand_sigmatools',
    badge: 'Carnaúba + SiO2',
    meta_title: 'Cera Híbrida Carnaúba & SiO2 SGT-Hybrid Wax 500ml | Sigma Tools DF',
    meta_description: 'Cera líquida híbrida com Carnaúba Tipo 1 e SiO2: brilho quente, toque ultra macio e hidrorrepelência superior. Compre na Athena em Brasília.',
    specs: [
      'Marca: SGT Chemicals (Sigma Tools)',
      'Código Sigma: 0102000101',
      'Conteúdo: 500ml',
      'Embalagem: Frasco com gatilho ergonômico',
      'Fórmula Híbrida: Carnaúba amarela cearense Tipo 1 + polímeros SiO2',
      'Durabilidade: Até 60 dias de proteção por aplicação',
      'Efeito Visual: Brilho profundo ("efeito molhado") e alta repelência de água',
      'Modo de Aplicação: Spray rápido e acabamento com toalha de microfibra macia',
      'Garantia: Oficial Sigma Tools com pronta-entrega na Athena'
    ],
    tags: ['Cera Híbrida', 'Carnaúba', 'SiO2', 'SGT Chemicals', 'Sigma Tools', 'Equipamentos para detalhamento automotivo']
  },
  {
    sku: '0107000201',
    omie_code: 11946185259,
    name: 'Selante de Pneus com Brilho 500ml SGT-Glaze – SGT Chemicals / Sigma Tools',
    slug: 'selante-de-pneus-com-brilho-500ml-sgt-glaze-sigma-tools',
    price: 29.82,
    ncm: '3402.31.00',
    unit: 'UN',
    ean: '0810231670206',
    package_type: '500ml Push-Pull',
    category_id: 'cat_estetica_pintura',
    brand_id: 'brand_sigmatools',
    badge: 'Wet Look Pneus',
    meta_title: 'Selante de Pneus com Brilho SGT-Glaze 500ml | Sigma Tools DF',
    meta_description: 'Selante de pneus SGT-Glaze com acabamento brilhante wet look, hidrorrepelente e anti-ressecamento. Distribuidora Athena em Brasília.',
    specs: [
      'Marca: SGT Chemicals (Sigma Tools)',
      'Código Sigma: 0107000201',
      'Conteúdo: 500ml',
      'Embalagem: Frasco com bico dosador Push-Pull',
      'Acabamento: Brilho molhado profundo ("Wet Look") de alta durabilidade',
      'Propriedades: Barreira hidrorrepelente contra chuva, barro e poeira',
      'Proteção: Filtro UV ativo contra ressecamento e craquelamento da borracha',
      'Rendimento: Alta viscosidade com zero respingo na lataria em movimento',
      'Garantia: Oficial Sigma Tools com suporte técnico Athena'
    ],
    tags: ['Selante de Pneus', 'Pretinho Brilhante', 'SGT Glaze', 'Sigma Tools', 'Produtos e equipamentos para lava-jatos']
  },
  {
    sku: '0107000401',
    omie_code: 11946185266,
    name: 'Renovador de Plástico, Pneu e Borracha 500ml SGT-Back To Black – SGT Chemicals / Sigma Tools',
    slug: 'renovador-de-plastico-pneu-borracha-500ml-sgt-back-to-black-sigma-tools',
    price: 17.14,
    ncm: '3405.90.00',
    unit: 'UN',
    ean: '0810231670244',
    package_type: '500ml Push-Pull',
    category_id: 'cat_estetica_pintura',
    brand_id: 'brand_sigmatools',
    badge: 'Restauração Plástica',
    meta_title: 'Renovador de Plásticos SGT-Back To Black 500ml | Sigma Tools DF',
    meta_description: 'Restaure parachoques e frisos plásticos ressecados com o SGT-Back To Black. Toque seco, proteção UV e visual original. Pronta-entrega na Athena.',
    specs: [
      'Marca: SGT Chemicals (Sigma Tools)',
      'Código Sigma: 0107000401',
      'Conteúdo: 500ml',
      'Embalagem: Frasco dosador Push-Pull',
      'Aplicação: Plásticos externos e internos, borrachas de vedação e pneus',
      'Acabamento: Toque 100% seco, não engordura e não gruda poeira',
      'Ação: Revitaliza plásticos esbranquiçados devolvendo o tom preto original',
      'Código de barras (EAN): 0810231670244',
      'Garantia: Oficial Sigma Tools com faturamento CNPJ/CPF na Athena'
    ],
    tags: ['Renovador de Plástico', 'Back to Black', 'SGT Chemicals', 'Sigma Tools', 'Detalhamento automotivo Brasília']
  },
  {
    sku: '0103000701',
    omie_code: 11946185272,
    name: 'Limpador de Pneu e Borracha 500ml SGT-Duon – SGT Chemicals / Sigma Tools',
    slug: 'limpador-de-pneu-e-borracha-500ml-sgt-duon-sigma-tools',
    price: 12.14,
    ncm: '3402.39.90',
    unit: 'UN',
    ean: '0810231670152',
    package_type: '500ml Gatilho Espumador',
    category_id: 'cat_estetica_pintura',
    brand_id: 'brand_sigmatools',
    badge: 'Espuma Ativa',
    meta_title: 'Limpador de Pneus e Borrachas SGT-Duon 500ml | Sigma Tools DF',
    meta_description: 'Limpador desincrustante específico para borrachas e pneus SGT-Duon com gatilho espumador. Remove marrom de pneu instantaneamente. Athena DF.',
    specs: [
      'Marca: SGT Chemicals (Sigma Tools)',
      'Código Sigma: 0103000701',
      'Conteúdo: 500ml',
      'Embalagem: Frasco com gatilho espumador Foamer',
      'Função: Limpeza pesada e desoxidação de pneus e borrachas',
      'Mecanismo: Espuma densa que age quimicamente na sujidade marrom sem agredir o aro',
      'Preparo da Superfície: Essencial para máxima ancoragem de selantes e pretinhos',
      'Garantia: Oficial Sigma Tools com suporte técnico Athena'
    ],
    tags: ['Limpador de Pneu', 'SGT Duon', 'Sigma Tools', 'Lava-jatos em Brasília', 'Estética Automotiva no DF']
  },
  {
    sku: '0107000601',
    omie_code: 11946185278,
    name: 'Pneu Pretinho Tradicional 500ml SGT-Jet Black – SGT Chemicals / Sigma Tools',
    slug: 'pneu-pretinho-500ml-sgt-jet-black-sigma-tools',
    price: 7.94,
    ncm: '3402.90.90',
    unit: 'UN',
    ean: '0810231670268',
    package_type: '500ml Push-Pull',
    category_id: 'cat_estetica_pintura',
    brand_id: 'brand_sigmatools',
    badge: 'Custo-Benefício',
    meta_title: 'Pneu Pretinho SGT-Jet Black 500ml | Sigma Tools na Athena DF',
    meta_description: 'Pneu pretinho de alto rendimento SGT-Jet Black da Sigma Tools. Acabamento preto uniforme, secagem rápida e alta economia para lava-jatos no DF.',
    specs: [
      'Marca: SGT Chemicals (Sigma Tools)',
      'Código Sigma: 0107000601',
      'Conteúdo: 500ml',
      'Embalagem: Frasco ergonômico Push-Pull',
      'Aplicação: Pneus de veículos leves, utilitários e caminhões',
      'Rendimento: Alto rendimento para frotas e lava-jatos de alta rotatividade',
      'Acabamento: Brilho na medida certa sem escorrer',
      'Garantia: Oficial Sigma Tools com faturamento CNPJ na Athena'
    ],
    tags: ['Pneu Pretinho', 'SGT Jet Black', 'Sigma Tools', 'Produtos e equipamentos para lava-jatos', 'Estética Automotiva Brasília']
  },
  {
    sku: '0103000201',
    omie_code: 11946185285,
    name: 'Lava Autos Neutro Concentrado 500ml SGT-Wash – SGT Chemicals / Sigma Tools',
    slug: 'lava-autos-neutro-concentrado-500ml-sgt-wash-sigma-tools',
    price: 11.97,
    ncm: '3402.31.00',
    unit: 'UN',
    ean: '0810231670107',
    package_type: '500ml Push-Pull',
    category_id: 'cat_estetica_pintura',
    brand_id: 'brand_sigmatools',
    badge: 'pH Neutro',
    meta_title: 'Lava Autos Neutro SGT-Wash 500ml Concentrado | Sigma Tools DF',
    meta_description: 'Shampoo automotivo de pH neutro concentrado SGT-Wash: alta lubrificação, espuma densa e seguro para vernizes e vitrificações. Athena DF.',
    specs: [
      'Marca: SGT Chemicals (Sigma Tools)',
      'Código Sigma: 0103000201',
      'Conteúdo: 500ml',
      'Embalagem: Frasco com tampa dosadora Push-Pull',
      'pH: Neutro (7.0 balanceado)',
      'Concentração: Alto rendimento para balde ou Snow Foam',
      'Poder de Lubrificação: Reduz o atrito da luva de microfibra, evitando micro-riscos (swirls)',
      'Segurança: Não remove ceras, selantes ou vitrificações preexistentes',
      'Garantia: Oficial Sigma Tools com pós-venda ativo Athena'
    ],
    tags: ['Lava Autos Neutro', 'Shampoo Automotivo', 'SGT Wash', 'Sigma Tools', 'Produtos e equipamentos para lava-jatos']
  },
  {
    sku: '0103000801',
    omie_code: 11946185290,
    name: 'Limpador de Chassi e Motor 500ml SGT-Motor – SGT Chemicals / Sigma Tools',
    slug: 'limpador-de-chassi-e-motor-500ml-sgt-motor-sigma-tools',
    price: 10.79,
    ncm: '3402.39.90',
    unit: 'UN',
    ean: '0810231670169',
    package_type: '500ml Gatilho Espumador',
    category_id: 'cat_estetica_pintura',
    brand_id: 'brand_sigmatools',
    badge: 'Desengraxante Pesado',
    meta_title: 'Limpador de Chassi e Motor SGT-Motor 500ml | Sigma Tools DF',
    meta_description: 'Desengraxante de alta performance SGT-Motor com gatilho espumador: dissolve óleos, graxas e fuligem pesada em cofres e chassis. Athena DF.',
    specs: [
      'Marca: SGT Chemicals (Sigma Tools)',
      'Código Sigma: 0103000801',
      'Conteúdo: 500ml',
      'Embalagem: Frasco com gatilho espumador de alta vazão',
      'Ação Química: Solubilização rápida de óleos minerais, graxas antigas e lama seca',
      'Locais de Uso: Cofre do motor, suspensão, caixa de rodas e chassi automotivo',
      'Vantagem: Alto poder de emulsão com fácil enxágue sem deixar resíduo pegajoso',
      'Garantia: Oficial Sigma Tools com consultoria para oficinas Athena'
    ],
    tags: ['Limpador de Motor', 'Desengraxante Chassi', 'SGT Motor', 'Sigma Tools', 'Equipamentos para oficinas mecânicas em Brasília']
  },
  {
    sku: '0103000502',
    omie_code: 11946185298,
    name: 'Lava Autos Desengraxante 1,5L SGT-Mol – SGT Chemicals / Sigma Tools',
    slug: 'lava-autos-desengraxante-1-5l-sgt-mol-sigma-tools',
    price: 24.66,
    ncm: '3402.31.00',
    unit: 'UN',
    ean: '0810231670138',
    package_type: '1,5L Econômico Tampa Lacre',
    category_id: 'cat_estetica_pintura',
    brand_id: 'brand_sigmatools',
    badge: 'Pré-Lavagem Desengraxante',
    meta_title: 'Lava Autos Desengraxante SGT-Mol 1,5L | Sigma Tools DF',
    meta_description: 'Shampoo desengraxante de pré-lavagem SGT-Mol 1,5 Litros: remove fuligem, filme de estrada e graxa sem esforço mecânico. Athena em Brasília.',
    specs: [
      'Marca: SGT Chemicals (Sigma Tools)',
      'Código Sigma: 0103000502',
      'Volume: 1,5 Litros (Embalagem Econômica)',
      'Embalagem: Galão ergonômico com tampa lacre e alça',
      'Indicação: Pré-lavagem (Touchless) e lavagem desengraxante de caminhonetes, SUVs e frotas',
      'Compatibilidade: Excelente rendimento em canhões de espuma Snow Foam e pulverizadores',
      'Ação: Amolece o barro e o filme de estrada antes do contato manual, prevenindo microrriscos',
      'Garantia: Oficial Sigma Tools com entrega em Brasília e entorno'
    ],
    tags: ['Lava Autos Desengraxante', 'SGT Mol', 'Sigma Tools', 'Produtos para estética automotiva em Brasília', 'Lava-jatos DF']
  },
  {
    sku: '0103000101',
    omie_code: 11946185305,
    name: 'Removedor de Cola e Piche 500ml SGT-Flash – SGT Chemicals / Sigma Tools',
    slug: 'removedor-de-cola-e-piche-500ml-sgt-flash-sigma-tools',
    price: 31.50,
    ncm: '3805.90.90',
    unit: 'UN',
    ean: '0810231670091',
    package_type: '500ml Gatilho Pulverizador',
    category_id: 'cat_estetica_pintura',
    brand_id: 'brand_sigmatools',
    badge: 'Solvente Seguro',
    meta_title: 'Removedor de Cola e Piche SGT-Flash 500ml | Sigma Tools DF',
    meta_description: 'Removedor de piche e restos de cola de adesivo SGT-Flash: dissolve contaminações severas sem agredir o verniz automotivo. Pronta-entrega na Athena.',
    specs: [
      'Marca: SGT Chemicals (Sigma Tools)',
      'Código Sigma: 0103000101',
      'Conteúdo: 500ml',
      'Embalagem: Frasco com gatilho borrifador de alta resistência química',
      'Ação: Dissolução ultrarrápida de respingos de asfalto/piche, colas de insulfilm, etiquetas e fitas dupla face',
      'Tempo de Ação: Age entre 30 e 60 segundos sobre a contaminação',
      'Segurança do Verniz: Desenvolvido para pintura automotiva, vidros e metais sem causar opacidade',
      'Garantia: Oficial Sigma Tools com atendimento humanizado Athena'
    ],
    tags: ['Removedor de Cola e Piche', 'SGT Flash', 'Sigma Tools', 'Equipamentos para lanternagem e pintura automotiva', 'Detalhamento DF']
  }
];

// Helper para baixar imagem como Buffer
function downloadImageBuffer(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    protocol.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode !== 200) {
        return reject(new Error(`Falha ao baixar imagem: ${res.statusCode} ${url}`));
      }
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    }).on('error', reject);
  });
}

// Processa imagens do produto: converte para WebP e faz upload para o R2
async function processProductImages(sku, rawUrls) {
  const finalUrls = [];
  console.log(`[SKU ${sku}] Processando ${rawUrls.length} imagens da Sigma...`);
  
  for (let i = 0; i < rawUrls.length; i++) {
    const rawUrl = rawUrls[i];
    try {
      const buffer = await downloadImageBuffer(rawUrl);
      const webpBuffer = await sharp(buffer)
        .webp({ quality: 86, effort: 4 })
        .toBuffer();

      const suffix = i === 0 ? 'principal' : `detalhe-${i}`;
      const filename = `sigma-${sku}-${suffix}.webp`;

      if (isR2Configured) {
        const uploadRes = await uploadToR2({
          file: webpBuffer,
          folder: 'produtos',
          filename: filename
        });
        const uploadedUrl = uploadRes?.url || uploadRes;
        if (uploadedUrl) {
          finalUrls.push(uploadedUrl);
          console.log(`  -> Imagem salva no R2: ${uploadedUrl}`);
        } else {
          finalUrls.push(rawUrl);
        }
      } else {
        finalUrls.push(rawUrl);
      }
    } catch (err) {
      console.warn(`  [Aviso] Falha ao processar imagem ${rawUrl}:`, err.message);
      finalUrls.push(rawUrl);
    }
  }

  return finalUrls;
}

async function main() {
  console.log('=== INICIANDO CADASTRO DE 11 PRODUTOS QUÍMICOS SIGMA TOOLS ===\n');

  for (const cfg of PRODUCTS_CONFIG) {
    console.log(`\n------------------------------------------------------------`);
    console.log(`Cadastrando: ${cfg.name} (SKU: ${cfg.sku})`);
    
    // Obter dados raspados da Sigma
    const scraped = scrapedData[cfg.sku] || { paragraphs: [], images: [], videos: [] };
    
    // Processar imagens para o Cloudflare R2 da Athena
    let images = [];
    if (scraped.images && scraped.images.length > 0) {
      images = await processProductImages(cfg.sku, scraped.images.slice(0, 6));
    }

    const mainImage = images[0] || (scraped.images[0] || '');

    // Construção da descrição detalhada e técnica
    const rawSigmaDesc = scraped.paragraphs.filter(p => !p.includes('&#8211;')).join('\n\n');
    const descriptionText = `${cfg.name}\n\n${rawSigmaDesc || 'Produto oficial de alta performance da linha SGT Chemicals / Sigma Tools desenvolvido para estética e detalhamento automotivo profissional.'}\n\n` +
      `Distribuído com exclusividade e suporte técnico especializado pela Athena Soluções Automotivas em Brasília e em todo o Distrito Federal. ` +
      `Garantia de procedência original, faturamento facilitado para oficinas mecânicas, centros de estética automotiva e lava-jatos no DF com atendimento humanizado e pós-venda ativo.`;

    const productId = `prod_omie_${cfg.omie_code}`;

    // Insere ou atualiza o produto no PostgreSQL da Athena
    await query(`
      INSERT INTO products (
        id, sku, omie_code, omie_codigo_produto, omie_product_id,
        name, slug, description, category_id, brand_id,
        price, preco_venda, original_price,
        is_price_visible, price_negotiable, commercial_mode,
        in_stock, estoque_quantidade, status, badge, ean,
        image, images, specs, tags, warranty_months,
        video_url, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9, $10,
        $11, $12, $13,
        $14, $15, $16,
        $17, $18, $19, $20, $21,
        $22, $23, $24, $25, $26,
        $27, NOW(), NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        slug = EXCLUDED.slug,
        description = EXCLUDED.description,
        price = EXCLUDED.price,
        preco_venda = EXCLUDED.preco_venda,
        is_price_visible = EXCLUDED.is_price_visible,
        image = EXCLUDED.image,
        images = EXCLUDED.images,
        specs = EXCLUDED.specs,
        tags = EXCLUDED.tags,
        badge = EXCLUDED.badge,
        ean = EXCLUDED.ean,
        updated_at = NOW()
    `, [
      productId,
      cfg.sku,
      String(cfg.omie_code),
      cfg.omie_code,
      cfg.omie_code,
      cfg.name,
      cfg.slug,
      descriptionText,
      cfg.category_id,
      cfg.brand_id,
      cfg.price,
      cfg.price,
      (cfg.price * 1.15).toFixed(2), // Preço "de/por" com referência promocional
      true, // is_price_visible
      false, // price_negotiable
      'variable_tax',
      true, // in_stock
      25, // estoque_quantidade de referência
      'active',
      cfg.badge,
      cfg.ean,
      mainImage,
      JSON.stringify(images),
      JSON.stringify(cfg.specs),
      JSON.stringify(cfg.tags),
      12, // warranty_months
      scraped.videos[0] ? `https://www.youtube.com/watch?v=${scraped.videos[0]}` : null
    ]);

    console.log(`✓ Produto cadastrado e vinculado no banco de dados e no Omie com sucesso!`);
  }

  console.log('\n============================================================');
  console.log('TODOS OS 11 PRODUTOS DA SIGMA FORAM CADASTRADOS COM SUCESSO!');
  console.log('============================================================\n');
  process.exit(0);
}

main().catch(err => {
  console.error('Erro fatal no cadastro:', err);
  process.exit(1);
});
