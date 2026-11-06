const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function runAudit() {
  console.log('--- INICIANDO AUDITORIA DE TODAS AS CATEGORIAS E PRODUTOS ---');
  
  // 1. Contagem por categoria
  const catRes = await pool.query(`
    SELECT c.id, c.name, c.slug, count(p.id) AS prod_count
    FROM categories c
    LEFT JOIN products p ON c.id = p.category_id
    GROUP BY c.id, c.name, c.slug
    ORDER BY prod_count ASC, c.name ASC
  `);

  console.log(`Total de categorias cadastradas: ${catRes.rows.length}`);

  // 2. Buscar todos os produtos agrupados
  const prodRes = await pool.query(`
    SELECT id, name, sku, category_id, brand_id, price
    FROM products
    ORDER BY name ASC
  `);

  const prodsByCat = {};
  const orphans = [];

  for (const p of prodRes.rows) {
    if (!p.category_id) {
      orphans.push(p);
    } else {
      if (!prodsByCat[p.category_id]) prodsByCat[p.category_id] = [];
      prodsByCat[p.category_id].push(p);
    }
  }

  const report = {
    totalProducts: prodRes.rows.length,
    totalCategories: catRes.rows.length,
    orphans: orphans.map(o => ({ id: o.id, name: o.name, sku: o.sku, price: o.price })),
    categories: []
  };

  for (const cat of catRes.rows) {
    const prods = prodsByCat[cat.id] || [];
    report.categories.push({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      count: prods.length,
      products: prods.map(p => ({ id: p.id, name: p.name, sku: p.sku }))
    });
  }

  const outPath = path.join(__dirname, 'audit_report.json');
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2));
  console.log(`Relatório salvo em: ${outPath}`);

  // Imprimir resumo analítico
  console.log('\n=========================================');
  console.log('RESUMO ESTRUTURAL DAS 51 CATEGORIAS:');
  console.log('=========================================');
  
  const zeroOrOne = report.categories.filter(c => c.count <= 1);
  const twoToFive = report.categories.filter(c => c.count >= 2 && c.count <= 5);
  const sixToFifteen = report.categories.filter(c => c.count >= 6 && c.count <= 15);
  const aboveFifteen = report.categories.filter(c => c.count > 15);

  console.log(`\n🔴 CATEGORIAS DE 0 A 1 PRODUTO (${zeroOrOne.length}):`);
  for (const c of zeroOrOne) {
    console.log(`- [${c.count} prod] ${c.name} (${c.id})`);
    for (const p of c.products) console.log(`    ↳ ${p.name} (${p.id})`);
  }

  console.log(`\n🟡 CATEGORIAS DE 2 A 5 PRODUTOS (${twoToFive.length}):`);
  for (const c of twoToFive) {
    console.log(`- [${c.count} prods] ${c.name} (${c.id})`);
    for (const p of c.products) console.log(`    ↳ ${p.name}`);
  }

  console.log(`\n🟢 CATEGORIAS DE 6 A 15 PRODUTOS (${sixToFifteen.length}):`);
  for (const c of sixToFifteen) {
    console.log(`- [${c.count} prods] ${c.name} (${c.id})`);
  }

  console.log(`\n🔵 CATEGORIAS DE MAIS DE 15 PRODUTOS (${aboveFifteen.length}):`);
  for (const c of aboveFifteen) {
    console.log(`- [${c.count} prods] ${c.name} (${c.id})`);
  }

  await pool.end();
}

runAudit().catch(err => {
  console.error('Erro na auditoria:', err);
  pool.end();
});
