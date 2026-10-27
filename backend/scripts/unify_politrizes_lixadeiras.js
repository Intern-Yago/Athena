const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const LIXADEIRAS_POLITRIZES_CAT_ID = 'cat_1792785083640';

// Model pairs: [parentPublishedId, draftId, voltageParent, voltageDraft]
const pairsToMerge = [
  {
    parentId: 'prod_sigma_sgt-5106',
    draftId: 'prod_omie_11878361675',
    title: 'SGT-5106 – Politriz Roto Orbital Red&Shine 5" 12mm – Sigma Tools',
    vParent: { name: '220V', voltage: '220V', sku: 'SGT-5106-220V', omieCode: 'SGT-5106-220V', omieProductId: 11878361673, price: 601.60 },
    vDraft: { name: '110V', voltage: '110V', sku: 'SGT-5106-110V', omieCode: 'SGT-5106-110V', omieProductId: 11878361675, price: 601.60 }
  },
  {
    parentId: 'prod_sigma_sgt-5108',
    draftId: 'prod_omie_11878361685',
    title: 'SGT-5108 – Mini Politriz Roto Orbital 3" 8mm – Sigma Tools',
    vParent: { name: '220V', voltage: '220V', sku: 'SGT-5108-220V', omieCode: 'SGT-5108-220V', omieProductId: 11878361683, price: 644.76 },
    vDraft: { name: '127V', voltage: '127V', sku: 'SGT-5108-110V', omieCode: 'SGT-5108-110V', omieProductId: 11878361685, price: 644.76 }
  },
  {
    parentId: 'prod_sigma_sgt-5109',
    draftId: 'prod_omie_11878361791',
    title: 'SGT-5109 – Mini Politriz Smart Change Rotativa / Roto Orbital (8mm / 12mm) – Sigma Tools',
    vParent: { name: '220V', voltage: '220V', sku: 'SGT-5109-220V', omieCode: 'SGT-5109-220V', omieProductId: 11878361743, price: 1019.55 },
    vDraft: { name: '127V', voltage: '127V', sku: 'SGT-5109-110V', omieCode: 'SGT-5109-110V', omieProductId: 11878361791, price: 1019.55 }
  },
  {
    parentId: 'prod_sigma_sgt-5112',
    draftId: 'prod_omie_11878361879',
    title: 'SGT-5112 – Politriz Roto Orbital Forçada 3" 5mm 710W – Sigma Tools',
    vParent: { name: '220V', voltage: '220V', sku: 'SGT-5112-220V', omieCode: '0752013651', omieProductId: 11878362519, price: 1647.26 },
    vDraft: { name: '110V', voltage: '110V', sku: 'SGT-5112-110V', omieCode: 'SGT-5112-110V', omieProductId: 11878361879, price: 1647.26 }
  },
  {
    parentId: 'prod_sigma_sgt-5116',
    draftId: 'prod_omie_11878361885',
    title: 'SGT-5116 – Politriz Roto Orbital Red&Shine 5" 15mm 900W – Sigma Tools',
    vParent: { name: '220V', voltage: '220V', sku: 'SGT-5116-220V', omieCode: 'SGT-5116-220V', omieProductId: 11878361883, price: 1027.47 },
    vDraft: { name: '110V', voltage: '110V', sku: 'SGT-5116-110V', omieCode: 'SGT-5116-110V', omieProductId: 11878361885, price: 1027.47 }
  },
  {
    parentId: 'prod_sigma_sgt-5116p',
    draftId: 'prod_omie_11878361892',
    title: 'SGT-5116P – Politriz Roto Orbital Red&Shine 5" Premium Version 15mm 1200W – Sigma Tools',
    vParent: { name: '220V', voltage: '220V', sku: 'SGT-5116P-220V', omieCode: 'SGT-5116P-220V', omieProductId: 11878361890, price: 990.83 },
    vDraft: { name: '127V', voltage: '127V', sku: 'SGT-5116P-110V', omieCode: 'SGT-5116P-110V', omieProductId: 11878361892, price: 990.83 }
  },
  {
    parentId: 'prod_sigma_sgt-5117',
    draftId: 'prod_omie_11878361901',
    title: 'SGT-5117 – Politriz Roto Orbital SGT PRO 15mm 900W – Sigma Tools',
    vParent: { name: '220V', voltage: '220V', sku: 'SGT-5117-220V', omieCode: 'SGT-5117-220V', omieProductId: 11878361894, price: 726.68 },
    vDraft: { name: '110V', voltage: '110V', sku: 'SGT-5117-110V', omieCode: 'SGT-5117-110V', omieProductId: 11878361901, price: 726.68 }
  },
  {
    parentId: 'prod_sigma_sgt-5126',
    draftId: 'prod_omie_11878362090',
    title: 'SGT-5126 – Politriz Rotativa 5" Cabo 180 Graus Red&Shine 1400W – Sigma Tools',
    vParent: { name: '110V', voltage: '110V', sku: 'SGT-5126-110V', omieCode: 'SGT-5126-110V', omieProductId: 11878362081, price: 805.83 },
    vDraft: { name: '220V', voltage: '220V', sku: 'SGT-5126-220V', omieCode: 'SGT-5126-220V', omieProductId: 11878362090, price: 805.83 }
  },
  {
    parentId: 'prod_sigma_sgt_5139_pro_politriz_automotiva_6',
    draftId: 'prod_omie_11878362114',
    title: 'SGT-5139 – Politriz Automotiva 6" PRO – Sigma Tools',
    vParent: { name: '110V', voltage: '110V', sku: 'SGT-5139-110V', omieCode: 'SGT-5139-110V', omieProductId: 11878362116, price: 262.17 },
    vDraft: { name: '220V', voltage: '220V', sku: 'SGT-5139-220V', omieCode: '0702513900', omieProductId: 11878362114, price: 262.17 }
  },
  {
    parentId: 'prod_sigma_sgt_4320_110v_220v_lixadeira_eletrica_aspirad',
    draftId: 'prod_omie_11878342603',
    title: 'SGT-4320 – Lixadeira Elétrica Aspirada Roto Orbital 6" Órbita 5mm 350W Brushless – Sigma Tools',
    vParent: { name: '110V', voltage: '110V', sku: 'SGT-4320-110V', omieCode: 'SGT-4320-110V', omieProductId: 11878342612, price: 1462.55 },
    vDraft: { name: '220V', voltage: '220V', sku: 'SGT-4320-220V', omieCode: 'SGT-4320-220V', omieProductId: 11878342603, price: 1462.55 }
  },
  {
    parentId: 'prod_sigma_sgt-4321-pro',
    draftId: 'prod_omie_11878422939',
    title: 'SGT-4321 – Lixadeira Orbital Treme-Treme 200W 110x100mm PRO – Sigma Tools',
    vParent: { name: '220V', voltage: '220V', sku: 'SGT-4321-220V', omieCode: 'SGT-4321-220V', omieProductId: 11878422937, price: 213.96 },
    vDraft: { name: '127V', voltage: '127V', sku: 'SGT-4321-110V', omieCode: 'SGT-4321-110V', omieProductId: 11878422939, price: 213.96 }
  },
  {
    parentId: 'prod_sigma_sgt-4322-pro',
    draftId: 'prod_omie_11878422943',
    title: 'SGT-4322 – Lixadeira Orbital Treme-Treme 280W 93x185mm PRO – Sigma Tools',
    vParent: { name: '220V', voltage: '220V', sku: 'SGT-4322-220V', omieCode: 'SGT-4322-220V', omieProductId: 11878422941, price: 228.32 },
    vDraft: { name: '127V', voltage: '127V', sku: 'SGT-4322-110V', omieCode: 'SGT-4322-110V', omieProductId: 11878422943, price: 228.32 }
  },
  {
    parentId: 'prod_sigma_mxt-0311',
    draftId: 'prod_omie_11878342514',
    title: 'MXT-0311 – Lixadeira Orbital 6" – Sigma Tools',
    vParent: { name: 'Sem Aspiração (SA)', sku: '0701031102', omieCode: '0701031102', omieProductId: 11878342512, price: 180.62 },
    vDraft: { name: 'Com Aspiração (CA)', sku: '0701031103', omieCode: '0701031103', omieProductId: 11878342514, price: 195.79 }
  }
];

// Color mapping for SGT-5118
const sgt5118ColorHexMap = {
  PRETA: '#1A1A1A',
  LARANJA: '#FF6B00',
  AZUL: '#0066CC',
  AMARELA: '#FFD700',
  ROSA: '#FF1493',
  VERDE: '#00A859',
  ROXA: '#7B1FA2'
};

async function run() {
  const client = await pool.connect();
  try {
    console.log('Iniciando saneamento, unificação de variantes e categorização de Politrizes & Lixadeiras...');
    await client.query('BEGIN');

    // =========================================================================
    // 1. UNIFICAR AS 13 DUPLICATAS (VOLTAGENS E ASPIRAÇÃO) EM VARIANTES
    // =========================================================================
    const draftIdsToDelete = [];

    for (const pair of pairsToMerge) {
      const parentRow = (await client.query('SELECT * FROM products WHERE id = $1', [pair.parentId])).rows[0];
      if (!parentRow) {
        console.warn(`Pai ${pair.parentId} não encontrado!`);
        continue;
      }

      const variants = [
        {
          id: `var_${parentRow.id.replace('prod_', '')}_1`,
          name: pair.vParent.name,
          sku: pair.vParent.sku,
          omieCode: pair.vParent.omieCode,
          omieProductId: pair.vParent.omieProductId,
          price: pair.vParent.price,
          stockQty: '',
          colorHex: '',
          isActive: true,
          showInCatalog: true,
          statusControl: 'auto',
          isManualForce: false,
          voltage: pair.vParent.voltage || ''
        },
        {
          id: `var_${parentRow.id.replace('prod_', '')}_2`,
          name: pair.vDraft.name,
          sku: pair.vDraft.sku,
          omieCode: pair.vDraft.omieCode,
          omieProductId: pair.vDraft.omieProductId,
          price: pair.vDraft.price,
          stockQty: '',
          colorHex: '',
          isActive: true,
          showInCatalog: true,
          statusControl: 'auto',
          isManualForce: false,
          voltage: pair.vDraft.voltage || ''
        }
      ];

      await client.query(`
        UPDATE products SET
          name = $1,
          category_id = $2,
          brand_id = COALESCE(brand_id, 'brand_sigmatools'),
          variants = $3::jsonb,
          price = $4,
          preco_venda = $4,
          price_negotiable = true,
          status = 'published',
          updated_at = NOW()
        WHERE id = $5
      `, [
        pair.title,
        LIXADEIRAS_POLITRIZES_CAT_ID,
        JSON.stringify(variants),
        pair.vParent.price,
        pair.parentId
      ]);

      draftIdsToDelete.push(pair.draftId);
      console.log(`✅ ${pair.title}: 2 variantes unificadas (110V/220V ou CA/SA)`);
    }

    // =========================================================================
    // 2. RESOLVER DUPLICATA DRAFT SGT-0307 (prod_omie_11882200419)
    // Corrigir também o preço errôneo de prod_sigma_sgt-0307 (de 1.856.121,00 para 2.036,33)
    // =========================================================================
    await client.query(`
      UPDATE products SET
        price = '2036.33',
        preco_venda = '2036.33',
        category_id = $1,
        brand_id = COALESCE(brand_id, 'brand_sigmatools'),
        name = 'Lixadeira Orbital 30mm Detail 12.000 RPM M10 SGT-0307 – Sigma Tools',
        price_negotiable = true,
        updated_at = NOW()
      WHERE id = 'prod_sigma_sgt-0307'
    `, [LIXADEIRAS_POLITRIZES_CAT_ID]);
    draftIdsToDelete.push('prod_omie_11882200419');
    console.log('✅ SGT-0307: Preço normalizado para R$ 2.036,33 e duplicata draft marcada para remoção.');

    // =========================================================================
    // 3. ENRIQUECER POLITRIZ SGT-5118 COLORS (ROXA -> SGT COLORS) COM COLORHEX
    // =========================================================================
    const p5118 = (await client.query('SELECT variants FROM products WHERE id = $1', ['prod_sigma_sgt-5118'])).rows[0];
    if (p5118 && Array.isArray(p5118.variants)) {
      const enrichedVariants = p5118.variants.map(v => {
        const colorKey = (v.color || '').toUpperCase();
        return {
          ...v,
          colorHex: sgt5118ColorHexMap[colorKey] || '',
          colorName: v.color || '',
          isActive: true,
          showInCatalog: true,
          statusControl: 'auto'
        };
      });

      await client.query(`
        UPDATE products SET
          name = 'SGT-5118 – Politriz Roto Orbital SGT Colors 15mm – Sigma Tools',
          category_id = $1,
          brand_id = 'brand_sigmatools',
          variants = $2::jsonb,
          updated_at = NOW()
        WHERE id = 'prod_sigma_sgt-5118'
      `, [LIXADEIRAS_POLITRIZES_CAT_ID, JSON.stringify(enrichedVariants)]);
      console.log(`✅ SGT-5118: Título corrigido para 'Politriz Roto Orbital SGT Colors' e ${enrichedVariants.length} variantes enriquecidas com colorHex!`);
    }

    // =========================================================================
    // 4. UNIFICAR SGT-0319 (C/ Aspiração e S/ Aspiração)
    // =========================================================================
    const p0319CA = (await client.query('SELECT * FROM products WHERE id = $1', ['prod_sigma_sgt-0319'])).rows[0];
    const p0319SA = (await client.query('SELECT * FROM products WHERE id = $1', ['prod_sigma_sgt-0319-sa'])).rows[0];

    if (p0319CA && p0319SA) {
      const v0319 = [
        {
          id: 'var_sgt0319_ca',
          name: 'Com Aspiração (CA)',
          sku: 'SGT-0319',
          omieCode: 'SGT-0319',
          omieProductId: 11878342548,
          price: 301.20,
          stockQty: '',
          colorHex: '',
          isActive: true,
          showInCatalog: true,
          statusControl: 'auto',
          isManualForce: false,
          aspiracao: 'Com Aspiração'
        },
        {
          id: 'var_sgt0319_sa',
          name: 'Sem Aspiração (SA)',
          sku: 'SGT-0319-SA',
          omieCode: 'SGT-0319-SA',
          omieProductId: 11878342550,
          price: 269.34,
          stockQty: '',
          colorHex: '',
          isActive: true,
          showInCatalog: true,
          statusControl: 'auto',
          isManualForce: false,
          aspiracao: 'Sem Aspiração'
        }
      ];

      await client.query(`
        UPDATE products SET
          name = 'Lixadeira Roto Orbital 6" SGT-0319 – Sigma Tools',
          category_id = $1,
          brand_id = 'brand_sigmatools',
          variants = $2::jsonb,
          price = '269.34',
          preco_venda = '269.34',
          price_negotiable = true,
          updated_at = NOW()
        WHERE id = 'prod_sigma_sgt-0319'
      `, [LIXADEIRAS_POLITRIZES_CAT_ID, JSON.stringify(v0319)]);

      // Redirecionar pedidos se houver
      await client.query(`UPDATE order_items SET product_id = 'prod_sigma_sgt-0319' WHERE product_id = 'prod_sigma_sgt-0319-sa'`);
      // Deletar a duplicata SA publicada
      await client.query(`DELETE FROM products WHERE id = 'prod_sigma_sgt-0319-sa'`);
      console.log('✅ SGT-0319: Unificado com variantes Com Aspiração e Sem Aspiração (prod_sigma_sgt-0319-sa removido)');
    }

    // =========================================================================
    // 5. UNIFICAR SGT-5122 RED&SHINE (110V/220V)
    // =========================================================================
    const p5122 = (await client.query('SELECT * FROM products WHERE id = $1', ['prod_sigma_sgt-5122'])).rows[0];
    if (p5122) {
      const v5122 = [
        {
          id: 'var_sgt5122_220v',
          name: '220V',
          sku: 'SGT-5122-220V',
          omieCode: 'SGT-5122-220V',
          omieProductId: 11878362059,
          price: 1027.47,
          stockQty: '',
          colorHex: '',
          isActive: true,
          showInCatalog: true,
          statusControl: 'auto',
          isManualForce: false,
          voltage: '220V'
        },
        {
          id: 'var_sgt5122_110v',
          name: '110V',
          sku: 'SGT-5122-110V',
          omieCode: 'SGT-5122-110V',
          omieProductId: null,
          price: 1027.47,
          stockQty: '',
          colorHex: '',
          isActive: true,
          showInCatalog: true,
          statusControl: 'auto',
          isManualForce: false,
          voltage: '110V'
        }
      ];

      await client.query(`
        UPDATE products SET
          name = 'SGT-5122 – Politriz Roto Orbital 6" Red&Shine – Sigma Tools',
          category_id = $1,
          variants = $2::jsonb,
          updated_at = NOW()
        WHERE id = 'prod_sigma_sgt-5122'
      `, [LIXADEIRAS_POLITRIZES_CAT_ID, JSON.stringify(v5122)]);
      console.log('✅ SGT-5122: Variantes 110V e 220V configuradas.');
    }

    // =========================================================================
    // 6. UNIFICAR SGT-5149 RED&SHINE FORÇADA (110V/220V)
    // =========================================================================
    const p5149 = (await client.query('SELECT * FROM products WHERE id = $1', ['prod_sigma_sgt-5149'])).rows[0];
    if (p5149) {
      const v5149 = [
        {
          id: 'var_sgt5149_220v',
          name: '220V',
          sku: 'SGT-5149-220V',
          omieCode: 'SGT-5149-220V',
          omieProductId: 11878362122,
          price: 1643.48,
          stockQty: '',
          colorHex: '',
          isActive: true,
          showInCatalog: true,
          statusControl: 'auto',
          isManualForce: false,
          voltage: '220V'
        },
        {
          id: 'var_sgt5149_110v',
          name: '110V',
          sku: 'SGT-5149-110V',
          omieCode: 'SGT-5149-110V',
          omieProductId: null,
          price: 1643.48,
          stockQty: '',
          colorHex: '',
          isActive: true,
          showInCatalog: true,
          statusControl: 'auto',
          isManualForce: false,
          voltage: '110V'
        }
      ];

      await client.query(`
        UPDATE products SET
          name = 'SGT-5149 – Politriz Roto Orbital Forçada Red&Shine 5"/6" 8mm 1200W – Sigma Tools',
          category_id = $1,
          variants = $2::jsonb,
          updated_at = NOW()
        WHERE id = 'prod_sigma_sgt-5149'
      `, [LIXADEIRAS_POLITRIZES_CAT_ID, JSON.stringify(v5149)]);
      console.log('✅ SGT-5149: Variantes 110V e 220V configuradas.');
    }

    // =========================================================================
    // 7. LIMPEZA DE TÍTULOS QUEBRADOS COM ENTIDADES HTML EM TODOS OS PRODUTOS
    // =========================================================================
    const allProds = (await client.query(`
      SELECT id, name
      FROM products
      WHERE (
        name ILIKE '%politriz%' 
        OR name ILIKE '%lixadeira%'
        OR slug ILIKE '%politriz%'
        OR slug ILIKE '%lixadeira%'
        OR sku ILIKE 'SGT-51%'
        OR sku ILIKE 'SGT-03%'
        OR sku ILIKE 'MXT-03%'
      )
    `)).rows;

    let fixedTitlesCount = 0;
    for (const p of allProds) {
      let cleaned = p.name
        .replace(/&#038;/g, '&')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/[“”]/g, '"')
        .replace(/[’‘]/g, "'")
        .replace(/– SGT TOOLS – Sigma Tools/gi, '– Sigma Tools')
        .replace(/– SGT Tools/gi, '– Sigma Tools')
        .replace(/\s+/g, ' ')
        .trim();

      if (cleaned !== p.name) {
        await client.query('UPDATE products SET name = $1, updated_at = NOW() WHERE id = $2', [cleaned, p.id]);
        fixedTitlesCount++;
      }
    }
    console.log(`✅ ${fixedTitlesCount} títulos limpos e corrigidos de entidades HTML/aspas/repetições!`);

    // =========================================================================
    // 8. CORREÇÃO DAS CATEGORIAS DE POLITRIZES E LIXADEIRAS
    // Todas as máquinas e acessórios específicos de lixadeira/politriz -> cat_1792785083640
    // =========================================================================
    const catUpdateRes = await client.query(`
      UPDATE products SET
        category_id = $1,
        brand_id = COALESCE(brand_id, 'brand_sigmatools'),
        updated_at = NOW()
      WHERE (
        name ILIKE '%politriz%' 
        OR name ILIKE '%lixadeira%'
        OR slug ILIKE '%politriz%'
        OR slug ILIKE '%lixadeira%'
        OR sku ILIKE 'SGT-51%'
        OR sku ILIKE 'SGT-03%'
        OR sku ILIKE 'MXT-03%'
      )
      AND (category_id != $1 OR category_id IS NULL)
      RETURNING id, name
    `, [LIXADEIRAS_POLITRIZES_CAT_ID]);

    console.log(`✅ ${catUpdateRes.rows.length} produtos de Politrizes & Lixadeiras atualizados para a categoria 'Lixadeiras e Politrizes'!`);

    // =========================================================================
    // 9. REMOVER OS RASCUNHOS INCORPORADOS (14 rascunhos)
    // =========================================================================
    const delDraftsRes = await client.query(`
      DELETE FROM products
      WHERE id = ANY($1)
      RETURNING id, sku, name
    `, [draftIdsToDelete]);

    console.log(`🧹 ${delDraftsRes.rows.length} rascunhos duplicados foram removidos do banco com sucesso.`);

    await client.query('COMMIT');
    console.log('🎉 Operação concluída com sucesso!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Erro na unificação:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch(() => process.exit(1));
