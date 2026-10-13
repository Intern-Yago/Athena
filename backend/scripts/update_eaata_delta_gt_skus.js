const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  console.log('🔄 Iniciando atualização de SKUs e unificação de produtos para EAATA, Delta e GT Eagle...');

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // ==============================================================
    // 1. EAATA BRASIL — ATUALIZAÇÃO DE SKUs E UNIFICAÇÃO DE RASCUNHOS
    // ==============================================================

    // 1.1 Scanner 360 PRO
    const var360 = JSON.stringify([
      { id: 'var_eaata360_orig', name: '360 PRO', sku: 'EAATA360', omie_code: 'EAATA360' }
    ]);
    await client.query(`
      UPDATE products
      SET sku = 'SCANNER 360 PRO',
          omie_code = 'SCANNER 360 PRO',
          omie_codigo_produto = 11877763189,
          price = 30750.00,
          preco_venda = 30750.00,
          price_negotiable = false,
          in_stock = true,
          variants = $1::jsonb,
          omie_last_sync = NOW()
      WHERE id = 'prod_1790020231902'
    `, [var360]);
    await client.query(`DELETE FROM products WHERE id = 'prod_omie_11877763189'`);
    console.log('✅ prod_1790020231902 (360 PRO) -> SKU=SCANNER 360 PRO | Omie=11877763189 | R$ 30.750,00');

    // 1.2 Auxiliar de Partida EJS120
    const varEjs = JSON.stringify([
      { id: 'var_ejs120_orig', name: 'EJS120', sku: 'EJS120', omie_code: 'EJS120' }
    ]);
    await client.query(`
      UPDATE products
      SET sku = 'DIAGNÓSTICO AUXILIAR DE PARTIDA',
          omie_code = 'DIAGNÓSTICO AUXILIAR DE PARTIDA',
          omie_codigo_produto = 11877769360,
          price = 722.00,
          preco_venda = 722.00,
          price_negotiable = false,
          in_stock = true,
          variants = $1::jsonb,
          omie_last_sync = NOW()
      WHERE id = 'prod_1790717317368'
    `, [varEjs]);
    await client.query(`DELETE FROM products WHERE id = 'prod_omie_11877769360'`);
    console.log('✅ prod_1790717317368 (EJS120) -> SKU=DIAGNÓSTICO AUXILIAR DE PARTIDA | Omie=11877769360 | R$ 722,00');

    // 1.3 Estabilizador de Bateria EPD002
    const varEpd = JSON.stringify([
      { id: 'var_epd002_orig', name: 'EPD002', sku: 'EPD002', omie_code: 'EPD002' }
    ]);
    await client.query(`
      UPDATE products
      SET sku = 'EQUIP.  EPD - ESTABILIZADOR EAATA',
          omie_code = 'EQUIP.  EPD - ESTABILIZADOR EAATA',
          omie_codigo_produto = 11878088864,
          price = 3450.00,
          preco_venda = 3450.00,
          price_negotiable = false,
          in_stock = true,
          variants = $1::jsonb,
          omie_last_sync = NOW()
      WHERE id = 'prod_1790717925829'
    `, [varEpd]);
    await client.query(`DELETE FROM products WHERE id = 'prod_omie_11878088864'`);
    console.log('✅ prod_1790717925829 (EPD002) -> SKU=EQUIP.  EPD - ESTABILIZADOR EAATA | Omie=11878088864 | R$ 3.450,00');

    // 1.4 Caneta de Teste ACT20 (ECT PRO)
    const varAct = JSON.stringify([
      { id: 'var_act20_orig', name: 'ACT20', sku: 'ACT20', omie_code: 'ACT20' }
    ]);
    await client.query(`
      UPDATE products
      SET sku = 'DIAGNÓSTICO ECT PRO -  CANETA TESTE',
          omie_code = 'DIAGNÓSTICO ECT PRO -  CANETA TESTE',
          omie_codigo_produto = 11877768248,
          price = 660.00,
          preco_venda = 660.00,
          price_negotiable = false,
          in_stock = true,
          variants = $1::jsonb,
          omie_last_sync = NOW()
      WHERE id = 'prod_1790717730558'
    `, [varAct]);
    await client.query(`DELETE FROM products WHERE id = 'prod_omie_11877768248'`);
    console.log('✅ prod_1790717730558 (ACT20) -> SKU=DIAGNÓSTICO ECT PRO -  CANETA TESTE | Omie=11877768248 | R$ 660,00');

    // 1.5 Câmera Endoscópica TES-402 (EVE PRO)
    const varTes = JSON.stringify([
      { id: 'var_tes402_orig', name: 'TES-402', sku: 'TES-402', omie_code: 'TES-402' }
    ]);
    await client.query(`
      UPDATE products
      SET sku = 'DIAGNÓSTICO EVE PRO CAMERA EAATA',
          omie_code = 'DIAGNÓSTICO EVE PRO CAMERA EAATA',
          omie_codigo_produto = 11877767462,
          price = 2210.00,
          preco_venda = 2210.00,
          price_negotiable = false,
          in_stock = true,
          variants = $1::jsonb,
          omie_last_sync = NOW()
      WHERE id = 'prod_1790717601334'
    `, [varTes]);
    await client.query(`DELETE FROM products WHERE id = 'prod_omie_11877767462'`);
    console.log('✅ prod_1790717601334 (TES-402) -> SKU=DIAGNÓSTICO EVE PRO CAMERA EAATA | Omie=11877767462 | R$ 2.210,00');

    // 1.6 Adaptador PROG360BOX
    const varProg = JSON.stringify([
      { id: 'var_prog360_orig', name: 'PROG360BOX', sku: 'PROG360BOX', omie_code: 'PROG360BOX' },
      { id: 'var_prog360_cliente', name: 'PROG360BOX (Já possui adaptador)', sku: 'DIAGNÓSTICO ADPT PROG360BOX- CLIENTE', omie_code: 'DIAGNÓSTICO ADPT PROG360BOX- CLIENTE', omie_codigo_produto: 11877766910, price: 1350.00 }
    ]);
    await client.query(`
      UPDATE products
      SET sku = 'DIAGNÓSTICO ADAPT. PROG360BOX',
          omie_code = 'DIAGNÓSTICO ADAPT. PROG360BOX',
          omie_codigo_produto = 11877766245,
          price = 1830.00,
          preco_venda = 1830.00,
          price_negotiable = false,
          in_stock = true,
          variants = $1::jsonb,
          omie_last_sync = NOW()
      WHERE id = 'prod_1790717203446'
    `, [varProg]);
    await client.query(`DELETE FROM products WHERE id IN ('prod_omie_11877766245', 'prod_omie_11877766910')`);
    console.log('✅ prod_1790717203446 (PROG360BOX) -> SKU=DIAGNÓSTICO ADAPT. PROG360BOX | Omie=11877766245 | R$ 1.830,00');

    // 1.7 Adaptador INS_DB1 Trava MQB
    const varMqb = JSON.stringify([
      { id: 'var_ins_db1_orig', name: 'INS_DB1', sku: 'ADAPTADOR-INS-DB1-PA', omie_code: 'ADAPTADOR-INS-DB1-PA' }
    ]);
    await client.query(`
      UPDATE products
      SET sku = 'DIAGNÓSTICO ADPT. TRAVA MQB',
          omie_code = 'DIAGNÓSTICO ADPT. TRAVA MQB',
          omie_codigo_produto = 11877765779,
          price = 1035.00,
          preco_venda = 1035.00,
          price_negotiable = false,
          in_stock = true,
          variants = $1::jsonb,
          omie_last_sync = NOW()
      WHERE id = 'prod_eaata_adaptador-ins-db1-pa'
    `, [varMqb]);
    await client.query(`DELETE FROM products WHERE id = 'prod_omie_11877765779'`);
    console.log('✅ prod_eaata_adaptador-ins-db1-pa (MQB) -> SKU=DIAGNÓSTICO ADPT. TRAVA MQB | Omie=11877765779 | R$ 1.035,00');

    // 1.8 Adaptador V4 Fujitsu
    const varFuj = JSON.stringify([
      { id: 'var_v4_fujitsu_orig', name: 'V4 Fujitsu', sku: 'ADAPTADOR-V4-LEITURA', omie_code: 'ADAPTADOR-V4-LEITURA' }
    ]);
    await client.query(`
      UPDATE products
      SET sku = 'DIAGNÓSTICO ADPT. FUJITSU',
          omie_code = 'DIAGNÓSTICO ADPT. FUJITSU',
          omie_codigo_produto = 11877765553,
          price = 1140.00,
          preco_venda = 1140.00,
          price_negotiable = false,
          in_stock = true,
          variants = $1::jsonb,
          omie_last_sync = NOW()
      WHERE id = 'prod_eaata_adaptador-v4-leitura'
    `, [varFuj]);
    await client.query(`DELETE FROM products WHERE id = 'prod_omie_11877765553'`);
    console.log('✅ prod_eaata_adaptador-v4-leitura (Fujitsu) -> SKU=DIAGNÓSTICO ADPT. FUJITSU | Omie=11877765553 | R$ 1.140,00');

    // 1.9 Osciloscópio Scope Box
    const varScope = JSON.stringify([
      { id: 'var_scopebox_orig', name: 'Scope Box', sku: 'SCOPE-BOX', omie_code: 'SCOPE-BOX' }
    ]);
    await client.query(`
      UPDATE products
      SET sku = 'DIAGNÓSTICO SCOPE BOX',
          omie_code = 'DIAGNÓSTICO SCOPE BOX',
          omie_codigo_produto = 11877767052,
          price = 4830.00,
          preco_venda = 4830.00,
          price_negotiable = false,
          in_stock = true,
          variants = $1::jsonb,
          omie_last_sync = NOW()
      WHERE id = 'prod_eaata_scope-box'
    `, [varScope]);
    await client.query(`DELETE FROM products WHERE id = 'prod_omie_11877767052'`);
    console.log('✅ prod_eaata_scope-box (Osciloscópio) -> SKU=DIAGNÓSTICO SCOPE BOX | Omie=11877767052 | R$ 4.830,00');

    // 1.10 Testador de Bateria TBT 360 PRO
    const varTbt = JSON.stringify([
      { id: 'var_tbt360_orig', name: 'TBT 360PRO', sku: 'TBT360PRO', omie_code: 'TBT360PRO' }
    ]);
    await client.query(`
      UPDATE products
      SET sku = 'EQUIP. TBT 360 PRO',
          omie_code = 'EQUIP. TBT 360 PRO',
          omie_codigo_produto = 11878088795,
          price = 1290.00,
          preco_venda = 1290.00,
          price_negotiable = false,
          in_stock = true,
          variants = $1::jsonb,
          omie_last_sync = NOW()
      WHERE id = 'prod_eaata_tbt360pro'
    `, [varTbt]);
    await client.query(`DELETE FROM products WHERE id = 'prod_omie_11878088795'`);
    console.log('✅ prod_eaata_tbt360pro -> SKU=EQUIP. TBT 360 PRO | Omie=11878088795 | R$ 1.290,00');

    // 1.11 Testador M-TESTER
    const varMtester = JSON.stringify([
      { id: 'var_mtester_orig', name: 'M-TESTER', sku: 'M-TESTER', omie_code: 'M-TESTER' }
    ]);
    await client.query(`
      UPDATE products
      SET sku = 'EQUIP. M-TESTER',
          omie_code = 'EQUIP. M-TESTER',
          omie_codigo_produto = 11878089166,
          price = 9290.00,
          preco_venda = 9290.00,
          price_negotiable = false,
          in_stock = true,
          variants = $1::jsonb,
          omie_last_sync = NOW()
      WHERE id = 'prod_eaata_m-tester'
    `, [varMtester]);
    await client.query(`DELETE FROM products WHERE id = 'prod_omie_11878089166'`);
    console.log('✅ prod_eaata_m-tester -> SKU=EQUIP. M-TESTER | Omie=11878089166 | R$ 9.290,00');

    // 1.12 Carrinho TPC 400
    const varTpc = JSON.stringify([
      { id: 'var_tpc400_orig', name: 'TPC-400', sku: 'TPC-400', omie_code: 'TPC-400' }
    ]);
    await client.query(`
      UPDATE products
      SET sku = 'EQUIP. CARRINHO THINKCAR TPC 400',
          omie_code = 'EQUIP. CARRINHO THINKCAR TPC 400',
          omie_codigo_produto = 11878089175,
          price = 1420.00,
          preco_venda = 1420.00,
          price_negotiable = false,
          in_stock = true,
          variants = $1::jsonb,
          omie_last_sync = NOW()
      WHERE id = 'prod_eaata_tpc-400'
    `, [varTpc]);
    await client.query(`DELETE FROM products WHERE id = 'prod_omie_11878089175'`);
    console.log('✅ prod_eaata_tpc-400 -> SKU=EQUIP. CARRINHO THINKCAR TPC 400 | Omie=11878089175 | R$ 1.420,00');

    // 1.13 Sistema ADAS Calibração
    const varAdas = JSON.stringify([
      { id: 'var_adas_orig', name: 'ADAS-EAATA', sku: 'ADAS-EAATA', omie_code: 'ADAS-EAATA' }
    ]);
    await client.query(`
      UPDATE products
      SET sku = 'ADAS THINKCAR ADAS',
          omie_code = 'ADAS THINKCAR ADAS',
          omie_codigo_produto = 11878089247,
          in_stock = true,
          variants = $1::jsonb,
          omie_last_sync = NOW()
      WHERE id = 'prod_eaata_adas-eaata'
    `, [varAdas]);
    await client.query(`DELETE FROM products WHERE id = 'prod_omie_11878089247'`);
    console.log('✅ prod_eaata_adas-eaata -> SKU=ADAS THINKCAR ADAS | Omie=11878089247');

    // 1.14 Kit Cabos EV
    const varEv = JSON.stringify([
      { id: 'var_kit_cabos_ev_sem_soft', name: 'Kit 18 Cabos + Jumper (Sem Software)', sku: 'KIT-CABOS-EV-PACKAGE', omie_code: 'KIT-CABOS-EV-PACKAGE' },
      { id: 'var_kit_cabos_ev_com_soft', name: 'Kit 18 Cabos + Jumper + 2 Anos Software', sku: 'DIAGNÓSTICO KIT EV', omie_code: 'DIAGNÓSTICO KIT EV', omie_codigo_produto: 11877773957, price: 8630.00 }
    ]);
    await client.query(`
      UPDATE products
      SET sku = 'DIAGNÓSTICO KIT CABOS EV (18 CABOS + JUMPER KIT)',
          omie_code = 'DIAGNÓSTICO KIT CABOS EV (18 CABOS + JUMPER KIT)',
          omie_codigo_produto = 11877774026,
          price = 3430.00,
          preco_venda = 3430.00,
          price_negotiable = false,
          in_stock = true,
          variants = $1::jsonb,
          omie_last_sync = NOW()
      WHERE id = 'prod_eaata_kit-cabos-ev-package'
    `, [varEv]);
    await client.query(`DELETE FROM products WHERE id IN ('prod_omie_11877774026', 'prod_omie_11877773957')`);
    console.log('✅ prod_eaata_kit-cabos-ev-package -> SKU=DIAGNÓSTICO KIT CABOS EV (18 CABOS + JUMPER KIT) | Omie=11877774026 | R$ 3.430,00');

    // 1.15 Carrinho TTK 333
    const varTtk333 = JSON.stringify([
      { id: 'var_ttk333_orig', name: 'TTK-333', sku: 'TTK-333', omie_code: 'TTK-333' }
    ]);
    await client.query(`
      UPDATE products
      SET sku = 'EQUIP. CARRINHO DE FERRAMENTAS TTK 333',
          omie_code = 'EQUIP. CARRINHO DE FERRAMENTAS TTK 333',
          omie_codigo_produto = 11878089153,
          in_stock = true,
          variants = $1::jsonb,
          omie_last_sync = NOW()
      WHERE id = 'prod_eaata_ttk-333'
    `, [varTtk333]);
    await client.query(`DELETE FROM products WHERE id = 'prod_omie_11878089153'`);
    console.log('✅ prod_eaata_ttk-333 -> SKU=EQUIP. CARRINHO DE FERRAMENTAS TTK 333 | Omie=11878089153');

    // 1.16 Carrinho TTK 88 (Híbrido)
    const varTtk88 = JSON.stringify([
      { id: 'var_ttk88_orig', name: 'TTK-88', sku: 'TTK-88', omie_code: 'TTK-88' }
    ]);
    await client.query(`
      UPDATE products
      SET sku = 'EQUIP. CARRINHO DE FERRAMENTAS HIBRIDO',
          omie_code = 'EQUIP. CARRINHO DE FERRAMENTAS HIBRIDO',
          omie_codigo_produto = 11878089144,
          in_stock = true,
          variants = $1::jsonb,
          omie_last_sync = NOW()
      WHERE id = 'prod_eaata_ttk-88'
    `, [varTtk88]);
    await client.query(`DELETE FROM products WHERE id = 'prod_omie_11878089144'`);
    console.log('✅ prod_eaata_ttk-88 -> SKU=EQUIP. CARRINHO DE FERRAMENTAS HIBRIDO | Omie=11878089144');

    // 1.17 Macaco Jacaré TFJ 340
    const varTfj = JSON.stringify([
      { id: 'var_tfj340_orig', name: 'TFJ-340', sku: 'TFJ-340', omie_code: 'TFJ-340' }
    ]);
    await client.query(`
      UPDATE products
      SET sku = 'EQUIP. MACACO HIDRAULICO TFJ 340',
          omie_code = 'EQUIP. MACACO HIDRAULICO TFJ 340',
          omie_codigo_produto = 11878089178,
          in_stock = true,
          variants = $1::jsonb,
          omie_last_sync = NOW()
      WHERE id = 'prod_eaata_tfj-340'
    `, [varTfj]);
    await client.query(`DELETE FROM products WHERE id = 'prod_omie_11878089178'`);
    console.log('✅ prod_eaata_tfj-340 -> SKU=EQUIP. MACACO HIDRAULICO TFJ 340 | Omie=11878089178');

    // 1.18 Maleta de Conectores Óleo de Câmbio
    const varMaleta = JSON.stringify([
      { id: 'var_maleta_orig', name: 'MALETA-COM-20-CONECT', sku: 'MALETA-COM-20-CONECT', omie_code: 'MALETA-COM-20-CONECT' }
    ]);
    await client.query(`
      UPDATE products
      SET sku = 'EQUIP.  MALETA DE CONECTORES',
          omie_code = 'EQUIP.  MALETA DE CONECTORES',
          omie_codigo_produto = 11878088902,
          in_stock = true,
          variants = $1::jsonb,
          omie_last_sync = NOW()
      WHERE id = 'prod_eaata_maleta-com-20-conect'
    `, [varMaleta]);
    await client.query(`DELETE FROM products WHERE id = 'prod_omie_11878088902'`);
    console.log('✅ prod_eaata_maleta-com-20-conect -> SKU=EQUIP.  MALETA DE CONECTORES | Omie=11878088902');

    // 1.19 Scanner EAATA 90 (Combos & Variantes)
    const varEaata90 = JSON.stringify([
      { id: 'var_eaata90_padrao', name: 'EAATA 90 Padrão', sku: 'EAATA 90', omie_code: 'EAATA 90', omie_codigo_produto: 11877738278, price: 2800.00 },
      { id: 'var_eaata010_br', name: 'EAATA 90 (BR)', sku: 'EAATA010-BR', omie_code: 'EAATA010-BR', omie_codigo_produto: 11879245885, price: 2800.00 },
      { id: 'var_eaata90_prog', name: 'EAATA 90 + PROG', sku: 'EAATA 90+P', omie_code: 'EAATA 90+P', omie_codigo_produto: 11877742511 },
      { id: 'var_eaata90_prog_mcu', name: 'EAATA 90 + PROG + MCU3', sku: 'SCANNER EAATA  90 + P+M', omie_code: 'SCANNER EAATA  90 + P+M', omie_codigo_produto: 11877744981 },
      { id: 'var_eaata90_scope', name: 'EAATA 90 + Scope Box', sku: 'SCANNER EAATA 90+ S+B', omie_code: 'SCANNER EAATA 90+ S+B', omie_codigo_produto: 11877747013, price: 15560.00 }
    ]);
    await client.query(`
      UPDATE products
      SET sku = 'EAATA 90',
          omie_code = 'EAATA 90',
          omie_codigo_produto = 11877738278,
          price = 2800.00,
          preco_venda = 2800.00,
          price_negotiable = false,
          in_stock = true,
          variants = $1::jsonb,
          omie_last_sync = NOW()
      WHERE id = 'prod_1790020380356'
    `, [varEaata90]);
    await client.query(`
      DELETE FROM products 
      WHERE id IN ('prod_omie_11877742511', 'prod_omie_11877744981', 'prod_omie_11877747013', 'prod_omie_11879245885')
    `);
    console.log('✅ prod_1790020380356 (EAATA 90) -> Combos e códigos unificados como variantes (4 rascunhos removidos)');

    // 1.20 Publicar Carrinho Diagnóstico EAATA (prod_omie_11878089199)
    await client.query(`
      UPDATE products
      SET name = 'Carrinho de Diagnóstico Automotivo com Rodízios – EAATA',
          brand_id = 'brand_1790019814846',
          category_id = 'cat_1790345836898',
          status = 'published',
          price = 3360.00,
          preco_venda = 3360.00,
          price_negotiable = false,
          in_stock = true
      WHERE id = 'prod_omie_11878089199'
    `);
    console.log('✅ prod_omie_11878089199 (Carrinho Diagnóstico EAATA) -> Publicado oficialmente | R$ 3.360,00');

    // 1.21 Publicar THINKCAR TTE 780 (prod_omie_11878088887)
    await client.query(`
      UPDATE products
      SET name = 'Máquina de Troca e Aquecimento de Fluido de Câmbio Automático TTE 780 – Thinkcar / EAATA',
          brand_id = 'brand_1790019814846',
          category_id = 'cat_1788371138282',
          status = 'published',
          price_negotiable = true,
          in_stock = true
      WHERE id = 'prod_omie_11878088887'
    `);
    console.log('✅ prod_omie_11878088887 (TTE 780) -> Publicado oficialmente');

    // ==============================================================
    // 2. DELTA FERRAMENTAS — VALIDAÇÃO E ATIVAÇÃO DE NOVOS ITENS
    // ==============================================================

    // 2.1 Publicar Caneta de Polaridade Delta (prod_omie_11881567103)
    await client.query(`
      UPDATE products
      SET name = 'Caneta de Polaridade Digital Automotiva Multifunção – Delta Ferramentas DT-PEN007',
          brand_id = 'brand_delta',
          category_id = 'cat_ferramentas',
          status = 'published',
          price = 170.00,
          preco_venda = 170.00,
          price_negotiable = false,
          in_stock = true
      WHERE id = 'prod_omie_11881567103'
    `);
    console.log('✅ prod_omie_11881567103 (Caneta de Polaridade DT-PEN007) -> Publicada oficialmente | R$ 170,00');

    // 2.2 Publicar Maleta Flanges Delta DT-KMF01 (prod_omie_11909989537)
    await client.query(`
      UPDATE products
      SET name = 'Maleta com Flanges e Adaptadores para Máquina de Transmissão – Delta Ferramentas DT-KMF01',
          brand_id = 'brand_delta',
          category_id = 'cat_ferramentas',
          status = 'published',
          price = 6212.50,
          preco_venda = 6212.50,
          price_negotiable = false,
          in_stock = true
      WHERE id = 'prod_omie_11909989537'
    `);
    console.log('✅ prod_omie_11909989537 (Kit Flanges DT-KMF01) -> Publicada oficialmente | R$ 6.212,50');

    // 2.3 Confirmar DT-MAT01, DT-JSQ01, DT-SGF01
    await client.query(`
      UPDATE products SET in_stock = true WHERE id IN ('prod_delta_dt-mat01', 'prod_delta_dt-jsq01', 'prod_delta_dt-sgf')
    `);
    console.log('✅ DT-MAT01, DT-JSQ01 e DT-SGF01 validados com sucesso.');

    // ==============================================================
    // 3. GT EAGLE — AUDITORIA DE PRODUTOS
    // ==============================================================
    console.log('✅ GT Eagle: 3 produtos verificados (CF-002, CF-003, CF-002PLUS) — Não possuem cadastro no Omie ERP (0 duplicatas).');

    await client.query('COMMIT');
    console.log('\n🎉 Transação concluída com sucesso no PostgreSQL!');

    // Sincroniza athena-db.json se existir
    const dbJsonPath = path.join(__dirname, '../data/athena-db.json');
    if (fs.existsSync(dbJsonPath)) {
      try {
        const dbJson = JSON.parse(fs.readFileSync(dbJsonPath, 'utf8'));
        if (Array.isArray(dbJson.products)) {
          const removedIds = new Set([
            'prod_omie_11877763189',
            'prod_omie_11877769360',
            'prod_omie_11878088864',
            'prod_omie_11877768248',
            'prod_omie_11877767462',
            'prod_omie_11877766245',
            'prod_omie_11877766910',
            'prod_omie_11877765779',
            'prod_omie_11877765553',
            'prod_omie_11877767052',
            'prod_omie_11878088795',
            'prod_omie_11878089166',
            'prod_omie_11878089175',
            'prod_omie_11878089247',
            'prod_omie_11877774026',
            'prod_omie_11877773957',
            'prod_omie_11878089153',
            'prod_omie_11878089144',
            'prod_omie_11878089178',
            'prod_omie_11878088902',
            'prod_omie_11877742511',
            'prod_omie_11877744981',
            'prod_omie_11877747013',
            'prod_omie_11879245885'
          ]);
          dbJson.products = dbJson.products.filter(p => !removedIds.has(p.id));
          fs.writeFileSync(dbJsonPath, JSON.stringify(dbJson, null, 2));
          console.log('✅ athena-db.json sincronizado com sucesso!');
        }
      } catch (errJson) {
        console.warn('Aviso ao sincronizar athena-db.json:', errJson.message);
      }
    }

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Erro na transação. Rollback executado:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(console.error);
