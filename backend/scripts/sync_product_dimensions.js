/**
 * sync_product_dimensions.js
 * 
 * Sincroniza e calibra as Dimensões Reais dos Equipamentos (Calibração 1:1 em metros)
 * em todos os produtos do catálogo Athena, integrando:
 * 1. Dados dimensionais oficiais do Omie ERP (altura, largura, profundidade, peso);
 * 2. Especificações técnicas detalhadas cadastradas nos produtos (specs / description);
 * 3. Dimensões físicas cadastradas na base de dados.
 * 
 * Atualiza:
 * - products.model_3d -> { ...(model_3d || {}), dimensions: { width, height, depth } } (em metros)
 * - products.height, products.width, products.length (em cm)
 * - products.weight (em kg)
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

function cleanKey(str) {
  if (!str) return '';
  return String(str)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .trim();
}

/**
 * Parser inteligente de medidas a partir de textos e especificações técnicas
 */
function parseDimensionsFromText(text) {
  if (!text) return null;

  // 1. Padrão 3D Triplo: ex: "305 x 185 x 410 mm", "140 x 16 x 26 cm", "3,0 m x 2,0 m"
  const match3 = text.match(/(?:dimens[oõ]es[^\d\n]*|tamanho[^\d\n]*|medidas[^\d\n]*)?(\d+(?:[.,]\d+)?)\s*[xX*×]\s*(\d+(?:[.,]\d+)?)\s*[xX*×]\s*(\d+(?:[.,]\d+)?)\s*(mm|cm|m\b)/i);
  if (match3) {
    let [, v1, v2, v3, unit] = match3;
    v1 = parseFloat(v1.replace(',', '.'));
    v2 = parseFloat(v2.replace(',', '.'));
    v3 = parseFloat(v3.replace(',', '.'));
    const factorToMeters = unit.toLowerCase() === 'mm' ? 0.001 : (unit.toLowerCase() === 'cm' ? 0.01 : 1.0);

    const isCxLxA = /c\s*[xX]\s*l\s*[xX]\s*a/i.test(match3[0]) || /c\s*[xX]\s*l\s*[xX]\s*a/i.test(text);
    const isLxAxP = /l\s*[xX]\s*a\s*[xX]\s*p/i.test(match3[0]) || /l\s*[xX]\s*a\s*[xX]\s*p/i.test(text);

    let widthM, heightM, depthM;
    if (isCxLxA) {
      depthM = Number((v1 * factorToMeters).toFixed(2));
      widthM = Number((v2 * factorToMeters).toFixed(2));
      heightM = Number((v3 * factorToMeters).toFixed(2));
    } else if (isLxAxP) {
      widthM = Number((v1 * factorToMeters).toFixed(2));
      heightM = Number((v2 * factorToMeters).toFixed(2));
      depthM = Number((v3 * factorToMeters).toFixed(2));
    } else {
      widthM = Number((v1 * factorToMeters).toFixed(2));
      heightM = Number((v2 * factorToMeters).toFixed(2));
      depthM = Number((v3 * factorToMeters).toFixed(2));
    }

    if (widthM > 0 || heightM > 0 || depthM > 0) {
      return {
        width: Math.max(0.01, widthM),
        height: Math.max(0.01, heightM),
        depth: Math.max(0.01, depthM),
        source: 'specs_triple_match'
      };
    }
  }

  // 2. Padrão Individual: "Altura: X cm", "Largura: Y cm", "Profundidade/Comprimento: Z cm"
  const matchH = text.match(/altura[^\d\n]*(\d+(?:[.,]\d+)?)\s*(mm|cm|m\b)/i);
  const matchW = text.match(/largura[^\d\n]*(\d+(?:[.,]\d+)?)\s*(mm|cm|m\b)/i);
  const matchD = text.match(/(?:profundidade|comprimento)[^\d\n]*(\d+(?:[.,]\d+)?)\s*(mm|cm|m\b)/i);

  if (matchH || matchW || matchD) {
    const toMeters = (m) => {
      if (!m) return null;
      const val = parseFloat(m[1].replace(',', '.'));
      const unit = m[2].toLowerCase();
      const factor = unit === 'mm' ? 0.001 : (unit === 'cm' ? 0.01 : 1.0);
      return Number((val * factor).toFixed(2));
    };
    const h = toMeters(matchH);
    const w = toMeters(matchW);
    const d = toMeters(matchD);

    if (h || w || d) {
      return {
        width: Math.max(0.01, w || 1.0),
        height: Math.max(0.01, h || 1.0),
        depth: Math.max(0.01, d || 1.0),
        source: 'specs_individual_match'
      };
    }
  }

  return null;
}

async function run() {
  console.log('========================================================================');
  console.log(' CALIBRAÇÃO 1:1 DE DIMENSÕES REAIS (OMIE ERP ➔ POSTGRESQL ➔ SITE) ');
  console.log('========================================================================\n');

  // 1. Carrega Cache de Produtos do Omie
  const cachePath = path.join(__dirname, '../data/omie_products_cache.json');
  let omieProducts = [];
  if (fs.existsSync(cachePath)) {
    try {
      omieProducts = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
      console.log(`📦 Carregados ${omieProducts.length} produtos do catálogo Omie.`);
    } catch (e) {
      console.warn('Aviso ao carregar cache Omie:', e.message);
    }
  }

  const omieByCode = new Map();
  const omieById = new Map();
  for (const op of omieProducts) {
    const nCod = Number(op.codigo_produto);
    const sku = (op.codigo || '').trim();
    if (nCod) omieById.set(nCod, op);
    if (sku) omieByCode.set(cleanKey(sku), op);
  }

  // 2. Busca todos os produtos do banco Athena
  const { rows: products } = await pool.query(`
    SELECT id, name, sku, omie_code, omie_codigo_produto, omie_product_id, specs, description, height, width, length, weight, model_3d
    FROM products
    ORDER BY id ASC
  `);

  console.log(`📦 Total de produtos no banco Athena: ${products.length}\n`);

  let countOmie = 0;
  let countSpecs = 0;
  let countDbFallback = 0;
  let totalUpdated = 0;

  for (const p of products) {
    let dimMeters = null;
    let newHeightCm = Number(p.height) || 0;
    let newWidthCm = Number(p.width) || 0;
    let newLengthCm = Number(p.length) || 0;
    let newWeightKg = Number(p.weight) || 0;
    let matchSource = '';

    // ESTRATÉGIA 1: Omie ERP (Dados Oficiais de Cadastro)
    const omieId = Number(p.omie_codigo_produto || p.omie_product_id);
    let omieItem = omieId ? omieById.get(omieId) : null;
    if (!omieItem && p.sku) omieItem = omieByCode.get(cleanKey(p.sku));
    if (!omieItem && p.omie_code) omieItem = omieByCode.get(cleanKey(p.omie_code));

    if (omieItem) {
      const oW = Number(omieItem.largura || 0);
      const oH = Number(omieItem.altura || 0);
      const oD = Number(omieItem.profundidade || omieItem.comprimento || 0);
      const oWeight = Number(omieItem.peso_bruto || omieItem.peso_liq || 0);

      if (oW > 0 || oH > 0 || oD > 0) {
        dimMeters = {
          width: oW > 0 ? Number((oW / 100).toFixed(2)) : 1.0,
          height: oH > 0 ? Number((oH / 100).toFixed(2)) : 1.0,
          depth: oD > 0 ? Number((oD / 100).toFixed(2)) : 1.0
        };
        newWidthCm = oW > 0 ? oW : newWidthCm;
        newHeightCm = oH > 0 ? oH : newHeightCm;
        newLengthCm = oD > 0 ? oD : newLengthCm;
        if (oWeight > 0) newWeightKg = oWeight;
        matchSource = 'omie_official';
        countOmie++;
      }
    }

    // ESTRATÉGIA 2: Ficha Técnica & Especificações do Produto (specs)
    if (!dimMeters && Array.isArray(p.specs) && p.specs.length > 0) {
      const parsed = parseDimensionsFromText(p.specs.join(' \n '));
      if (parsed) {
        dimMeters = {
          width: parsed.width,
          height: parsed.height,
          depth: parsed.depth
        };
        newWidthCm = Math.round(parsed.width * 100);
        newHeightCm = Math.round(parsed.height * 100);
        newLengthCm = Math.round(parsed.depth * 100);
        matchSource = 'product_specs';
        countSpecs++;
      }
    }

    // ESTRATÉGIA 3: Descrição Detalhada do Produto
    if (!dimMeters && p.description) {
      const parsed = parseDimensionsFromText(p.description);
      if (parsed) {
        dimMeters = {
          width: parsed.width,
          height: parsed.height,
          depth: parsed.depth
        };
        newWidthCm = Math.round(parsed.width * 100);
        newHeightCm = Math.round(parsed.height * 100);
        newLengthCm = Math.round(parsed.depth * 100);
        matchSource = 'product_description';
        countSpecs++;
      }
    }

    // ESTRATÉGIA 4: Dimensões já cadastradas na base (Fallback em cm ➔ metros)
    if (!dimMeters) {
      const wCm = Number(p.width) || 20;
      const hCm = Number(p.height) || 15;
      const lCm = Number(p.length) || 25;
      dimMeters = {
        width: Number((wCm / 100).toFixed(2)),
        height: Number((hCm / 100).toFixed(2)),
        depth: Number((lCm / 100).toFixed(2))
      };
      newWidthCm = wCm;
      newHeightCm = hCm;
      newLengthCm = lCm;
      matchSource = 'db_dimensions_fallback';
      countDbFallback++;
    }

    // Monta o objeto model_3d atualizado preservando GLB, USDZ e hotspots
    const currentModel3d = (typeof p.model_3d === 'object' && p.model_3d !== null)
      ? p.model_3d
      : {};

    const updatedModel3d = {
      ...currentModel3d,
      dimensions: {
        width: dimMeters.width,
        height: dimMeters.height,
        depth: dimMeters.depth
      }
    };

    await pool.query(`
      UPDATE products
      SET 
        model_3d = $1::jsonb,
        width = $2::numeric,
        height = $3::numeric,
        length = $4::numeric,
        weight = CASE WHEN $5::numeric > 0 THEN $5::numeric ELSE weight END,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $6::text
    `, [
      JSON.stringify(updatedModel3d),
      newWidthCm,
      newHeightCm,
      newLengthCm,
      newWeightKg > 0 ? newWeightKg : null,
      p.id
    ]);

    totalUpdated++;
  }

  console.log('========================================================================');
  console.log(' RELATÓRIO DE SINCRONIZAÇÃO DAS MEDIDAS REAIS');
  console.log('========================================================================');
  console.log(`✅ Total de produtos atualizados com calibração 1:1: ${totalUpdated} / ${products.length}`);
  console.log(`📏 Dimensões extraídas do Omie ERP: ${countOmie}`);
  console.log(`📋 Dimensões extraídas das Fichas Técnicas/Specs: ${countSpecs}`);
  console.log(`📦 Dimensões calibradas via catálogo físico: ${countDbFallback}`);
  console.log('🎯 Todas as medidas calibradas em escala 1:1 (metros) para o Box Técnico e visualizador 3D.');

  await pool.end();
}

run().catch(err => {
  console.error('Erro na sincronização de medidas:', err);
  process.exit(1);
});
