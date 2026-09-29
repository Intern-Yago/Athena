const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function sanitizeCatalog() {
  const client = await pool.connect();
  console.log('🚀 Conectado ao banco de dados Supabase para higienização do catálogo.');

  try {
    await client.query('BEGIN');
    console.log('🔒 Transação iniciada.');

    // 1. Correção do título corrompido com prompt de imagem em prod_mahovi_mah-6004
    console.log('\n--- 1. Corrigindo título de MAH-6004 ---');
    const updateTitleRes = await client.query(`
      UPDATE products 
      SET name = 'Balanceadora de Rodas Computadorizada Linha Leve - Mahovi MAH-6004'
      WHERE id = 'prod_mahovi_mah-6004'
      RETURNING id, name;
    `);
    console.log('✅ Título corrigido:', updateTitleRes.rows[0]);

    // 2. Vincular os 4 produtos órfãos
    console.log('\n--- 2. Vinculando os 4 produtos órfãos ---');
    await client.query(`UPDATE products SET category_id = 'cat_desmontadoras' WHERE id = 'prod_omie_11876439233'`);
    console.log('✅ prod_omie_11876439233 (Pasta Desmontagem) ➔ cat_desmontadoras');

    await client.query(`UPDATE products SET category_id = 'cat_1789998064578' WHERE id = 'prod_omie_11929046930'`);
    console.log('✅ prod_omie_11929046930 (Programador TPMS Venu 90) ➔ cat_1789998064578 (Válvulas/TPMS)');

    await client.query(`UPDATE products SET category_id = 'cat_elevadores' WHERE id = 'prod_omie_11876016891'`);
    console.log('✅ prod_omie_11876016891 (Elevador Gangorra 1.5T) ➔ cat_elevadores');

    await client.query(`UPDATE products SET category_id = 'cat_1789405752776' WHERE id = 'prod_omie_11880776500'`);
    console.log('✅ prod_omie_11880776500 (JG Chave Hexalobular Canivete 8P) ➔ cat_1789405752776 (Soquetes)');

    // 3. Criar categoria dedicada de Estética Automotiva & Pintura
    console.log('\n--- 3. Criando categoria Estética Automotiva & Pintura ---');
    const catCheck = await client.query(`SELECT id FROM categories WHERE id = 'cat_estetica_pintura'`);
    if (catCheck.rows.length === 0) {
      await client.query(`
        INSERT INTO categories (id, name, slug, description, icon, "order")
        VALUES (
          'cat_estetica_pintura',
          'Estética Automotiva & Pintura',
          'estetica-automotiva-e-pintura',
          'Politrizes rotativas e roto-orbitais, lixadeiras industriais, pistolas de pintura airless, canhões de espuma snow foam e tornadores.',
          'Sparkles',
          53
        )
      `);
      console.log('✅ Categoria cat_estetica_pintura criada com sucesso.');
    } else {
      console.log('ℹ️ Categoria cat_estetica_pintura já existe.');
    }

    // 4. Migrar os 81 produtos de estética de cat_ferramentas para cat_estetica_pintura
    console.log('\n--- 4. Migrando produtos de estética para cat_estetica_pintura ---');
    const esteticaMoveRes = await client.query(`
      UPDATE products 
      SET category_id = 'cat_estetica_pintura'
      WHERE category_id = 'cat_ferramentas' 
      AND (
        LOWER(name) LIKE '%politriz%' OR LOWER(name) LIKE '%roto orbital%' OR LOWER(name) LIKE '%roto-orbital%' OR LOWER(name) LIKE '%nano híbrida%' OR
        LOWER(name) LIKE '%lixadeira%' OR
        LOWER(name) LIKE '%pistola de pintura%' OR LOWER(name) LIKE '%airless%' OR LOWER(name) LIKE '%aerógrafo%' OR
        LOWER(name) LIKE '%tornador%' OR LOWER(name) LIKE '%extratora%' OR
        LOWER(name) LIKE '%snow foam%' OR LOWER(name) LIKE '%canhão de espuma%' OR LOWER(name) LIKE '%pulverizador%' OR LOWER(name) LIKE '%espuma%'
      )
      RETURNING id, name;
    `);
    console.log(`✅ ${esteticaMoveRes.rows.length} produtos de estética migrados com sucesso para cat_estetica_pintura.`);

    // 5. Migrar as 26 parafusadeiras de cat_ferramentas para cat_1789409045834 (Parafusadeira & Desparafusadeira)
    console.log('\n--- 5. Migrando parafusadeiras para cat_1789409045834 ---');
    const parafusadeirasMoveRes = await client.query(`
      UPDATE products 
      SET category_id = 'cat_1789409045834'
      WHERE category_id = 'cat_ferramentas' 
      AND (LOWER(name) LIKE '%parafusadeira%' OR LOWER(name) LIKE '%desparafusadeira%')
      RETURNING id, name;
    `);
    console.log(`✅ ${parafusadeirasMoveRes.rows.length} parafusadeiras migradas para Parafusadeira & Desparafusadeira.`);

    // 6. Resgatar Macacos e Suporte para Motor de cat_elevadores
    console.log('\n--- 6. Resgatando macacos e suporte para motor de cat_elevadores ---');
    const macacosElevRes = await client.query(`
      UPDATE products 
      SET category_id = 'cat_1789587656316'
      WHERE category_id = 'cat_elevadores' 
      AND (LOWER(name) LIKE '%macaco%' OR LOWER(name) LIKE '%sanfona%')
      RETURNING id, name;
    `);
    console.log(`✅ ${macacosElevRes.rows.length} macacos transferidos de Elevadores para Macaco Hidráulico:`, macacosElevRes.rows.map(r => r.name));

    const suporteMotorRes = await client.query(`
      UPDATE products 
      SET category_id = 'cat_1790178421551'
      WHERE id = 'prod_1790178303116'
      RETURNING id, name;
    `);
    console.log(`✅ Suporte para Motor 450kg reunificado com o de 600kg em cat_1790178421551:`, suporteMotorRes.rows[0]?.name);

    // 7. Redistribuir itens desalocados de Acessórios Diversos (cat_1789413477954)
    console.log('\n--- 7. Redistribuindo itens de Acessórios Diversos ---');
    const acessMoveMap = [
      { id: 'prod_1790179415072', cat: 'cat_1789587656316', desc: 'Guincho Hidráulico 2T ➔ Macaco Hidráulico' },
      { id: 'prod_1789674370529', cat: 'cat_1789587656316', desc: 'Cavaletes Industriais 2-12T ➔ Macaco Hidráulico' },
      { id: 'prod_delta_dt-jsq01', cat: 'cat_1789405752776', desc: 'Jogo Soquetes 46P 1/4" ➔ Soquetes' },
      { id: 'prod_omie_11876342036', cat: 'cat_1789498107322', desc: 'Kit Saca Polia 13P ➔ Ferramentas de extração' },
      { id: 'prod_delta_dt-sac07', cat: 'cat_1789498107322', desc: 'Sacador Bicos GDI ➔ Ferramentas de extração' },
      { id: 'prod_delta_dt-mat01', cat: 'cat_1789075823822', desc: 'Medidor Angular de Torque ➔ Torquímetro' },
      { id: 'prod_starkx_skx-018', cat: 'cat_1789414354078', desc: 'Auxiliar Partida SKX-018 ➔ Teste de bateria' },
      { id: 'prod_delta_dt-atb01', cat: 'cat_1789414354078', desc: 'Cabo OBD Auxiliar Bateria ➔ Teste de bateria' },
      { id: 'prod_mahovi_wal-4020', cat: 'cat_elevadores', desc: 'Tapetes Antiderrapantes ➔ Elevadores' },
      { id: 'prod_1790018027688', cat: 'cat_desmontadoras', desc: 'Alicate Balanceador ➔ Desmontadoras' },
      { id: 'prod_1790017853666', cat: 'cat_1789998064578', desc: 'Saca Núcleo 100mm ➔ Válvulas para pneus' },
      { id: 'prod_1790017919180', cat: 'cat_1789998064578', desc: 'Saca Núcleo 25mm ➔ Válvulas para pneus' },
      { id: 'prod_1790017784816', cat: 'cat_1789998064578', desc: 'Tarraxa Saca Núcleo 4F ➔ Válvulas para pneus' },
      { id: 'prod_1790017646598', cat: 'cat_1789998064578', desc: 'Tarraxa Saca Núcleo 2F ➔ Válvulas para pneus' },
      { id: 'prod_1790018095905', cat: 'cat_1789998064578', desc: 'Tampa Válvula Pneu ➔ Válvulas para pneus' },
      { id: 'prod_mahovi_wal-fun', cat: 'cat_1790179785560', desc: 'Funil Óleo WAL-FUN ➔ Troca e Coleta de Óleo' },
      { id: 'prod_1790184934169', cat: 'cat_1790179785560', desc: 'Funil Óleo 12,5cm ➔ Troca e Coleta de Óleo' },
      { id: 'prod_1790184002870', cat: 'cat_1790179785560', desc: 'Seringa Fluidos 1,5L ➔ Troca e Coleta de Óleo' },
      { id: 'prod_1790183616366', cat: 'cat_1790179785560', desc: 'Seringa Fluidos 200ml ➔ Troca e Coleta de Óleo' },
      { id: 'prod_delta_dt-ada01', cat: 'cat_1788377224759', desc: 'Kit Adaptador Bicos DT-ADA01 ➔ Limpador/Testador Injetores' }
    ];

    for (const item of acessMoveMap) {
      await client.query(`UPDATE products SET category_id = $1 WHERE id = $2`, [item.cat, item.id]);
      console.log(`✅ ${item.desc}`);
    }

    // 8. Redistribuir itens desalocados de Ferramentas Automotivas (cat_1790341668541)
    console.log('\n--- 8. Redistribuindo itens de Ferramentas Automotivas ---');
    const autoToolsMoveMap = [
      { id: 'prod_mahovi_mah-5010', cat: 'cat_1790016852133', desc: 'Calibrador Digital MAH-5010 ➔ Calibradores e Medidores' },
      { id: 'prod_starkx_skx-038', cat: 'cat_1789414354078', desc: 'Carregador Baterias SKX-038 ➔ Teste de bateria' },
      { id: 'prod_starkx_skx088', cat: 'cat_scanners', desc: 'Detector Continuidade SKX-088 ➔ Scanners & Diagnóstico' },
      { id: 'prod_1788380306494', cat: 'cat_1788371138282', desc: 'Visor Fluidos ATF ➔ Troca de fluido' },
      { id: 'prod_mahovi_mah-103', cat: 'cat_1789587656316', desc: 'Trolley Veículos MAH-103 ➔ Macaco Hidráulico' },
      { id: 'prod_1790609549695', cat: 'cat_1789499887542', desc: 'Kit Êmbolo Pinça Freio 16P ➔ Sistema de freios' },
      { id: 'prod_1790344863290', cat: 'cat_1790615634326', desc: 'Encolhedor Molas Pneumático ➔ Suspensão e Direção' },
      { id: 'prod_1790352769270', cat: 'cat_1790616153068', desc: 'Reset Embreagem Powershift DPS6 ➔ Embreagem e Transmissão' },
      { id: 'prod_1790347969788', cat: 'cat_1789498107322', desc: 'Saca Polia 4P ➔ Ferramentas de extração' }
    ];

    for (const item of autoToolsMoveMap) {
      await client.query(`UPDATE products SET category_id = $1 WHERE id = $2`, [item.cat, item.id]);
      console.log(`✅ ${item.desc}`);
    }

    // 9. Itens de Ferramentas de Extração (cat_1789498107322) que pertencem a freios/ar/direção/injetores
    console.log('\n--- 9. Redistribuindo itens de Ferramentas de Extração ---');
    const extraMoveMap = [
      { id: 'prod_1790609185126', cat: 'cat_1789499887542', desc: 'Mola de Freio 14P ➔ Sistema de freios' },
      { id: 'prod_1790609363570', cat: 'cat_1789499887542', desc: 'Mola de Freio 8P ➔ Sistema de freios' },
      { id: 'prod_delta_dt-sac04', cat: 'cat_1789496349243', desc: 'Spring Lock Ar Condicionado ➔ Ferramentas para Ar Condicionado' },
      { id: 'prod_1790608255187', cat: 'cat_1790615634326', desc: 'Extrator Terminais Direção ➔ Suspensão e Direção' },
      { id: 'prod_1790607026919', cat: 'cat_1788377224759', desc: 'Extração Bicos Injetores Diesel ➔ Limpador/Testador Injetores' },
      { id: 'prod_delta_dt-sac08', cat: 'cat_1788377224759', desc: 'Extrator Injetores Diesel 40P ➔ Limpador/Testador Injetores' },
      { id: 'prod_sigma_sgt-9812', cat: 'cat_1788377224759', desc: 'Kit Pneumático Bico Injetor 21P ➔ Limpador/Testador Injetores' }
    ];

    for (const item of extraMoveMap) {
      await client.query(`UPDATE products SET category_id = $1 WHERE id = $2`, [item.cat, item.id]);
      console.log(`✅ ${item.desc}`);
    }

    // 10. Fusão e Eliminação de Micro-Categorias Redundantes
    console.log('\n--- 10. Fundindo micro-categorias redundantes ---');

    // 10.1 Apertadeira de rodas (cat_1789067041029) ➔ Chaves de impacto (cat_1788453768939)
    await client.query(`UPDATE products SET category_id = 'cat_1788453768939' WHERE category_id = 'cat_1789067041029'`);
    await client.query(`DELETE FROM categories WHERE id = 'cat_1789067041029'`);
    console.log('✅ Apertadeira de Rodas fundida em Chaves de impacto e categoria excluída.');

    // 10.2 Transmissão Automática (cat_1789670494368) ➔ Troca de fluido (cat_1788371138282)
    await client.query(`UPDATE products SET category_id = 'cat_1788371138282' WHERE category_id = 'cat_1789670494368'`);
    await client.query(`DELETE FROM categories WHERE id = 'cat_1789670494368'`);
    console.log('✅ Transmissão Automática fundida em Troca de fluido e categoria excluída.');

    // 10.3 Endoscópios e Boroscópios (cat_1790341326840) ➔ Scanners & Diagnóstico (cat_scanners)
    await client.query(`UPDATE products SET category_id = 'cat_scanners' WHERE category_id = 'cat_1790341326840'`);
    await client.query(`DELETE FROM categories WHERE id = 'cat_1790341326840'`);
    console.log('✅ Endoscópios e Boroscópios fundida em Scanners & Diagnóstico e categoria excluída.');

    // 10.4 Extensão para controle de torque (cat_1789406515276) ➔ Torquímetro (cat_1789075823822)
    await client.query(`UPDATE products SET category_id = 'cat_1789075823822' WHERE category_id = 'cat_1789406515276'`);
    await client.query(`DELETE FROM categories WHERE id = 'cat_1789406515276'`);
    console.log('✅ Extensão para controle de torque fundida em Torquímetro e categoria excluída.');

    // 10.5 Fumaça & Nitrogênio (cat_1788376758844)
    await client.query(`UPDATE products SET category_id = 'cat_scanners' WHERE id = 'prod_mahovi_mah4040_fumaca'`);
    await client.query(`UPDATE products SET category_id = 'cat_1790016852133' WHERE id = 'prod_mahovi_mah-4014'`);
    await client.query(`DELETE FROM categories WHERE id = 'cat_1788376758844'`);
    console.log('✅ Fumaça & Nitrogênio desmembrada (Fumaça ➔ Scanners, Nitrogênio ➔ Calibradores) e categoria excluída.');

    // 10.6 Canetas para testes e diagnósticos (cat_1789413312442) - Categoria Vazia
    await client.query(`DELETE FROM categories WHERE id = 'cat_1789413312442'`);
    console.log('✅ Canetas para testes e diagnósticos excluída (categoria vazia de 0 produtos).');

    await client.query('COMMIT');
    console.log('\n🎉 Transação concluída com SUCESSO! Alterações gravadas no banco de dados.');

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ ERRO na migração. Transação cancelada (ROLLBACK realizado):', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

sanitizeCatalog().catch(e => {
  console.error('Falha geral:', e.message);
  process.exit(1);
});
