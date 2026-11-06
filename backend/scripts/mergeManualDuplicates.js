require('dotenv').config({ path: '.env' });
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  const client = await pool.connect();
  try {
    console.log('Iniciando unificação e limpeza das 4 duplicatas manuais...');
    await client.query('BEGIN');

    // 1. Kit Funil para Óleo de Motor 15 Peças (0699990106)
    const del1 = await client.query('DELETE FROM products WHERE id = $1 RETURNING id, name', ['prod_1790612977491']);
    if (del1.rows.length > 0) console.log(`1. Kit Funil: duplicata vazia [${del1.rows[0]?.id}] removida.`);

    // 2. Jogo de Grampos para Tapetes Automotivos (0699970000)
    const del2 = await client.query('DELETE FROM products WHERE id = $1 RETURNING id, name', ['prod_1790874513864']);
    if (del2.rows.length > 0) console.log(`2. Jogo de Grampos: duplicata [${del2.rows[0]?.id}] removida.`);

    // 3. Jogo de Ferramentas 4 Bandejas em EVA 125 Peças (0699940010)
    await client.query(`
      UPDATE products
      SET price = 2489.03, preco_venda = 2489.03, updated_at = NOW()
      WHERE id = 'prod_1790871645501'
    `);
    const del3 = await client.query('DELETE FROM products WHERE id = $1 RETURNING id, name', ['prod_1790346674110']);
    if (del3.rows.length > 0) console.log(`3. Jogo de Ferramentas EVA: unificado.`);

    // 4. Cabo de Recarga Tipo 2 para Tipo 2 32A EW1035 (EW1035)
    const del4 = await client.query('DELETE FROM products WHERE id = $1 RETURNING id, name', ['prod_1790624056392']);
    if (del4.rows.length > 0) console.log(`4. Cabo E-Wolf EW1035: duplicata removida.`);

    // 5. Soquetes CR-MO: Unificar 48 rascunhos que já existem como variantes de prod_1789415995966
    const pSoq = (await client.query("SELECT id, variants FROM products WHERE id = 'prod_1789415995966'")).rows[0];
    if (pSoq) {
      const variants = pSoq.variants || [];
      const varMap = new Map(variants.map(v => [v.sku, v]));
      const soqDrafts = (await client.query("SELECT id, sku, omie_codigo_produto, price FROM products WHERE status = 'draft' AND id LIKE 'prod_omie_%'")).rows;
      
      let enrichedCount = 0;
      const deletedSoqIds = [];
      for (const d of soqDrafts) {
        if (varMap.has(d.sku)) {
          const v = varMap.get(d.sku);
          if (d.omie_codigo_produto) v.omieProductId = Number(d.omie_codigo_produto);
          if (d.price && (!v.price || v.price === '')) v.price = Number(d.price);
          deletedSoqIds.push(d.id);
          enrichedCount++;
        }
      }
      await client.query("UPDATE products SET variants = $1::jsonb, updated_at = NOW() WHERE id = 'prod_1789415995966'", [JSON.stringify(variants)]);
      if (deletedSoqIds.length > 0) {
        await client.query('DELETE FROM products WHERE id = ANY($1)', [deletedSoqIds]);
      }
      console.log(`5. Soquetes CR-MO: ${enrichedCount} variantes enriquecidas com Omie IDs e ${deletedSoqIds.length} rascunhos duplicados removidos.`);
    }

    // 6. SGT-5118 Politriz Colors: Unificar variantes de cores e voltagens no produto oficial prod_sigma_sgt-5118
    const sgt5118Drafts = (await client.query("SELECT id, name, sku, omie_codigo_produto, price FROM products WHERE status = 'draft' AND sku LIKE 'SGT-5118-%'")).rows;
    if (sgt5118Drafts.length > 0) {
      const colorVariants = sgt5118Drafts.map((d, idx) => {
        const parts = d.sku.split('-');
        const volt = parts[2] || '';
        const color = parts[3] || parts[2] || '';
        return {
          id: `var_sgt5118_${idx + 1}`,
          name: `${volt} - ${color}`.trim(),
          sku: d.sku,
          omieCode: d.sku,
          omieProductId: d.omie_codigo_produto ? Number(d.omie_codigo_produto) : null,
          price: Number(d.price) || 890,
          voltage: volt,
          color: color,
          showInCatalog: true,
          isActive: true
        };
      });
      await client.query("UPDATE products SET variants = $1::jsonb, updated_at = NOW() WHERE id = 'prod_sigma_sgt-5118'", [JSON.stringify(colorVariants)]);
      const deleted5118 = await client.query('DELETE FROM products WHERE id = ANY($1) RETURNING id', [sgt5118Drafts.map(d => d.id)]);
      console.log(`6. SGT-5118: ${colorVariants.length} variantes de cores/voltagens unificadas e ${deleted5118.rows.length} rascunhos duplicados removidos.`);
    }

    // 7. Pares diretos 1-para-1 verificados manualmente
    const directMappings = [
      { draftId: 'prod_omie_11878339974', pubId: 'prod_sigma_sgt_5700_pro_220v_bomba_periferica_1_2_cv', name: 'Bomba Periférica SGT-5700' },
      { draftId: 'prod_omie_11876443472', pubId: 'prod_sigma_sgt_9950', name: 'Mangueira c/ Enrolador SGT-9950' },
      { draftId: 'prod_omie_11878422480', pubId: 'prod_sigma_sgt-3601', name: 'Tanque Pintura SGT-3601' },
      { draftId: 'prod_omie_11878422531', pubId: 'prod_sigma_sgt-3820', name: 'Pistola SGT-3820' },
      { draftId: 'prod_omie_11876276605', pubId: 'prod_sigma_sgt-tp-01', name: 'Torquímetro SGT-TP-01' },
      { draftId: 'prod_omie_11878360917', pubId: 'prod_sigma_sgt_0233a_furadeira_reversivel_1_2_700_rpm', name: 'Furadeira SGT-0233A' },
      { draftId: 'prod_omie_11878362525', pubId: 'prod_sigma_prato_suporte_5_lixadeira_roto_orbital_eletri', name: 'Prato Suporte 5 4 Parafusos' },
      { draftId: 'prod_omie_11878362521', pubId: 'prod_sigma_prato_suporte_6_lixadeira_roto_orbital_eletri', name: 'Prato Suporte 6 Bosch Ave' },
      { draftId: 'prod_omie_11878362533', pubId: 'prod_sigma_suporte_ventilado_6_para_politriz_roto_orbita', name: 'Suporte Ventilado 6 M8' },
      { draftId: 'prod_omie_11878362531', pubId: 'prod_sigma_suporte_ventilado_5_para_politriz_roto_orbita', name: 'Suporte Ventilado 5 M8' },
      { draftId: 'prod_omie_11878362695', pubId: 'prod_sigma_kit_com_2_parafusos_adaptadores_para_furadeir', name: 'Parafuso Adaptador M14' },
      { draftId: 'prod_omie_11878243361', pubId: 'prod_sigma_sgt_0535_chave_de_impacto_1_2_125_kgf_m', name: 'Chave Impacto SGT-0535' },
      { draftId: 'prod_omie_11878361322', pubId: 'prod_sigma_sgt-1212', name: 'Serra Tico-Tico RNT-1212' },
      { draftId: 'prod_omie_11878342538', pubId: 'prod_sigma_sgt_0316', name: 'Lixadeira SGT-0316' },
      { draftId: 'prod_omie_11878342584', pubId: 'prod_sigma_mxt_0362a', name: 'Lixadeira MXT-0362A' },
      { draftId: 'prod_omie_11878337767', pubId: 'prod_sigma_sgt_0519_kit_3_em_1_multitool_catraca_1_2_ret', name: 'Kit Multitool SGT-0519' },
      { draftId: 'prod_omie_11878423318', pubId: 'prod_sigma_sgt_3315_pistola_de_ar_premium_curta', name: 'Pistola de Ar SGT-3315' },
      { draftId: 'prod_omie_11878337364', pubId: 'prod_sigma_sgt_2020_pro_macaco_hidraulico_tipo_jacare_2t', name: 'Macaco Jacaré SGT-2020' },
      { draftId: 'prod_omie_11878362839', pubId: 'prod_sigma_sgt-5114', name: 'Boinas SGT-5114' },
      { draftId: 'prod_omie_11878362841', pubId: 'prod_sigma_sgt-8101', name: 'Boinas SGT-8101' },
      { draftId: 'prod_omie_11877653775', pubId: 'prod_mahovi_mah-1009-01', name: 'Rampa MAH-1009-01' },
      { draftId: 'prod_omie_11878335860', pubId: 'prod_sigma_kit_8_chaves_combinadas_mxt_6891011131719mm', name: 'Kit 8 Chaves Combinadas MXT' },
      { draftId: 'prod_omie_11878335872', pubId: 'prod_sigma_kit_12_chaves_combinadas_mxt_6789101112131417', name: 'Kit 12 Chaves Combinadas MXT' },
      { draftId: 'prod_omie_11878335878', pubId: 'prod_sigma_kit_25_chaves_combinadas_mxt_6mm_a_28mm_30mm_', name: 'Kit 25 Chaves Combinadas MXT' },
      { draftId: 'prod_omie_11878335273', pubId: 'prod_sigma_kit_chave_fixa_mxt_6x7mm_a_20x22mm', name: 'Kit Chave Fixa MXT' },
      { draftId: 'prod_sigma_sgt-5101', pubId: 'prod_sigma_sgt-6051', name: 'Pistola SGT-6051 110V' },
      { draftId: 'prod_omie_11878422162', pubId: 'prod_sigma_mxt_5601_soprador_e_aspirador_de_po_600w_com_', name: 'Soprador SGT-5601 220V' },
      { draftId: 'prod_omie_11878422340', pubId: 'prod_sigma_sgt-5606', name: 'Soprador SGT-5606 220V' },
      { draftId: 'prod_omie_11878422721', pubId: 'prod_sigma_sgt-6050', name: 'Pistola SGT-6050 110V' },
      { draftId: 'prod_omie_11878422963', pubId: 'prod_sigma_sgt-5221-pro', name: 'Serra Tico-Tico SGT-5221 127V' },
      { draftId: 'prod_omie_11878423177', pubId: 'prod_sigma_sgt-5802', name: 'Martelete SGT-5802 127V' },
      { draftId: 'prod_omie_11878423185', pubId: 'prod_sigma_sgt-5803', name: 'Martelete SGT-5803 127V' },
      { draftId: 'prod_omie_11878362073', pubId: 'prod_sigma_sgt-5122', name: 'Politriz SGT-5122 110V' },
      { draftId: 'prod_omie_11878362079', pubId: 'prod_sigma_sgt-5123', name: 'Politriz SGT-5123 110V' },
      { draftId: 'prod_omie_11878362094', pubId: 'prod_sigma_sgt-5127', name: 'Politriz SGT-5127 220V' },
      { draftId: 'prod_omie_11878362105', pubId: 'prod_sigma_sgt-5135', name: 'Politriz SGT-5135 127V' },
      { draftId: 'prod_omie_11878362116', pubId: 'prod_sigma_sgt_5139_pro_politriz_automotiva_6', name: 'Politriz SGT-5139 127V' },
      { draftId: 'prod_omie_11878362124', pubId: 'prod_sigma_sgt-5149', name: 'Politriz SGT-5149 110V' },
      { draftId: 'prod_omie_11878362128', pubId: 'prod_sigma_sgt-5150', name: 'Politriz SGT-5150 110V' }
    ];

    let directMerged = 0;
    for (const m of directMappings) {
      const dRow = (await client.query('SELECT sku, omie_code, omie_codigo_produto, price FROM products WHERE id = $1', [m.draftId])).rows[0];
      if (dRow) {
        // Exclui a duplicata primeiro para liberar a constraint UNIQUE em omie_product_id
        await client.query('DELETE FROM products WHERE id = $1', [m.draftId]);

        await client.query(`
          UPDATE products
          SET 
            omie_codigo_produto = COALESCE(omie_codigo_produto, $1),
            omie_product_id = COALESCE(omie_product_id, $1),
            omie_code = COALESCE(omie_code, $2),
            price = CASE WHEN price IS NULL OR price = 0 THEN COALESCE($3, price) ELSE price END,
            preco_venda = CASE WHEN preco_venda IS NULL OR preco_venda = 0 THEN COALESCE($3, preco_venda) ELSE preco_venda END,
            updated_at = NOW()
          WHERE id = $4
        `, [dRow.omie_codigo_produto, dRow.omie_code || dRow.sku, dRow.price, m.pubId]);

        directMerged++;
      }
    }
    console.log(`7. Pares diretos: ${directMerged} duplicatas unificadas e removidas.`);

    await client.query('COMMIT');
    console.log('\n🎉 Todas as 4 duplicatas manuais foram unificadas e limpas com sucesso!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Erro na transação, rollback executado:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

run();
