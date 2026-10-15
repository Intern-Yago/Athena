const fs = require('fs');
const path = require('path');
const https = require('https');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const OMIE_APP_KEY = process.env.OMIE_APP_KEY;
const OMIE_APP_SECRET = process.env.OMIE_APP_SECRET;

function callOmie(endpoint, callName, paramObj) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      call: callName,
      app_key: OMIE_APP_KEY,
      app_secret: OMIE_APP_SECRET,
      param: [paramObj]
    });

    const req = https.request(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json);
        } catch (e) {
          resolve(null);
        }
      });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

function cleanStr(str) {
  return String(str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .trim();
}

async function run() {
  console.log('========================================================================');
  console.log(' SINCRONIZAÇÃO COMPLETA: PREÇOS & ESTOQUE OMIE ➔ BANCO POSTGRESQL ');
  console.log('========================================================================\n');

  // 1. Carregar Preços Base do Cadastro de Produtos Omie (1.657 itens)
  const cachePath = path.join(__dirname, '../data/omie_products_cache.json');
  let omieProducts = [];
  if (fs.existsSync(cachePath)) {
    omieProducts = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
    console.log(`📦 Carregados ${omieProducts.length} produtos do catálogo Omie.`);
  }

  // 2. Buscar Saldo de Estoque Físico Real via API ListarPosEstoque
  console.log('🔄 Consultando saldos de estoque físico no Omie (ListarPosEstoque)...');
  const stockMap = new Map(); // omieCode / sku -> { saldo, preco, codigo_produto }
  let page = 1;
  let totalStockRecords = 0;

  while (true) {
    const res = await callOmie('https://app.omie.com.br/api/v1/estoque/consulta/', 'ListarPosEstoque', {
      nPagina: page,
      nRegPorPagina: 50,
      dDataPosicao: new Date().toLocaleDateString('pt-BR')
    });

    if (!res || !res.produtos || res.produtos.length === 0) break;

    for (const p of res.produtos) {
      const sku = (p.cCodigo || '').trim();
      const nCod = Number(p.nCodProd);
      const saldo = Math.max(0, parseInt(p.nSaldo || p.fisico || 0, 10));
      const preco = Number(p.nPrecoUnitario || 0);

      const data = { sku, omieId: nCod, saldo, preco };
      if (sku) stockMap.set(cleanStr(sku), data);
      if (nCod) stockMap.set(`ID_${nCod}`, data);
      totalStockRecords++;
    }

    if (page >= (res.nTotPaginas || 1)) break;
    page++;
  }
  console.log(`✅ ${totalStockRecords} posições de estoque mapeadas do Omie.\n`);

  // Indexar produtos cadastrais do Omie
  const omieByCode = new Map();
  const omieById = new Map();
  const omieByCleanSku = new Map();

  for (const op of omieProducts) {
    const nCod = Number(op.codigo_produto);
    const sku = (op.codigo || '').trim();
    const valor = Number(op.valor_unitario || 0);
    const item = { ...op, valor_unitario: valor };

    if (nCod) omieById.set(nCod, item);
    if (sku) {
      omieByCode.set(sku.toUpperCase(), item);
      omieByCleanSku.set(cleanStr(sku), item);
    }
  }

  // 3. Buscar todos os produtos do banco Athena
  const dbProds = (await pool.query(`
    SELECT id, name, sku, omie_code, omie_codigo_produto, omie_product_id, price, preco_venda, estoque_quantidade, in_stock, price_negotiable, status
    FROM products
  `)).rows;

  console.log(`📦 Total de produtos no banco Athena: ${dbProds.length}`);

  let updatedPriceCount = 0;
  let updatedStockCount = 0;
  let matchesFound = 0;

  for (const prod of dbProds) {
    let matchedOmie = null;
    let matchedStock = null;

    // A. Mapeia por ID do Omie se já existir no produto
    const omieId = Number(prod.omie_codigo_produto || prod.omie_product_id);
    if (omieId && omieById.has(omieId)) {
      matchedOmie = omieById.get(omieId);
    }

    // B. Mapeia por SKU
    if (!matchedOmie && prod.sku) {
      const cleanS = cleanStr(prod.sku);
      if (cleanS && omieByCleanSku.has(cleanS)) {
        matchedOmie = omieByCleanSku.get(cleanS);
      }
    }

    // C. Mapeia por omie_code
    if (!matchedOmie && prod.omie_code) {
      const cleanO = cleanStr(prod.omie_code);
      if (cleanO && omieByCleanSku.has(cleanO)) {
        matchedOmie = omieByCleanSku.get(cleanO);
      }
    }

    // D. Procura saldo de estoque específico
    if (omieId && stockMap.has(`ID_${omieId}`)) {
      matchedStock = stockMap.get(`ID_${omieId}`);
    } else if (prod.sku && stockMap.has(cleanStr(prod.sku))) {
      matchedStock = stockMap.get(cleanStr(prod.sku));
    }

    let finalPrice = null;
    if (matchedStock && matchedStock.preco > 0) {
      finalPrice = matchedStock.preco;
    } else if (matchedOmie && matchedOmie.valor_unitario > 0) {
      finalPrice = matchedOmie.valor_unitario;
    }

    let finalStock = 0;
    let hasStock = false;
    if (matchedStock) {
      finalStock = matchedStock.saldo;
      hasStock = finalStock > 0;
    }

    if (matchedOmie || matchedStock) {
      matchesFound++;

      const needsPriceUpdate = finalPrice && (Number(prod.preco_venda) !== finalPrice || Number(prod.price) !== finalPrice);
      const needsStockUpdate = matchedStock && (Number(prod.estoque_quantidade) !== finalStock || prod.in_stock !== hasStock);

      await pool.query(`
        UPDATE products
        SET 
          preco_venda = COALESCE($1, preco_venda),
          price = COALESCE($1, price),
          price_negotiable = true,
          estoque_quantidade = CASE WHEN $2::boolean THEN $3::integer ELSE estoque_quantidade END,
          in_stock = CASE WHEN $2::boolean THEN $4::boolean ELSE in_stock END,
          omie_last_sync = NOW()
        WHERE id = $5
      `, [
        finalPrice,
        Boolean(matchedStock),
        finalStock,
        hasStock,
        prod.id
      ]);

      if (needsPriceUpdate) updatedPriceCount++;
      if (needsStockUpdate) updatedStockCount++;
    } else {
      // Mesmo sem match no Omie, garante que price_negotiable = true para manter "Sob Consulta"
      await pool.query(`UPDATE products SET price_negotiable = true WHERE id = $1`, [prod.id]);
    }
  }

  console.log('\n========================================================================');
  console.log(' RESULTADO DA SINCRONIZAÇÃO DE PREÇOS E ESTOQUE');
  console.log('========================================================================');
  console.log(`✅ Produtos vinculados ao Omie: ${matchesFound}`);
  console.log(`💰 Preços sincronizados no banco: ${updatedPriceCount}`);
  console.log(`📦 Estoques atualizados no banco: ${updatedStockCount}`);
  console.log(`🔒 Regra de Ouro mantida: 100% dos produtos continuam como "SOB CONSULTA" (price_negotiable = true).`);

  await pool.end();
}

run().catch(err => {
  console.error('Erro na execução:', err);
  process.exit(1);
});
