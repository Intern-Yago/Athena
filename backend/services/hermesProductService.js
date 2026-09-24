/**
 * hermesProductService.js
 * 
 * Servico inteligente de consulta de produtos para o Agente Hermes (Gemini AI).
 * Arquitetura: Cache-Aside (Lazy Loading) + Fallback no ERP Omie.
 * 
 * Fluxo:
 *   Passo A: Busca semantica/textual no banco de dados local (PostgreSQL / Supabase).
 *   Passo B: Se encontrar localmente, retorna o produto com preco_venda e estoque_quantidade (fim da execucao, sub-30ms).
 *   Passo C (Fallback): Se NAO encontrar no banco, consulta a API do Omie (ConsultarProduto / ListarProdutos).
 *   Passo D (Cache Write): Pega o resultado do Omie, dá INSERT/UPDATE no PostgreSQL e retorna para o Hermes.
 */

const axios = require("axios");

const OMIE_APP_KEY = process.env.OMIE_APP_KEY;
const OMIE_APP_SECRET = process.env.OMIE_APP_SECRET;
const OMIE_PRODUTOS_URL = "https://app.omie.com.br/api/v1/geral/produtos/";

// Helper para chamada segura a API do Omie
async function callOmie(callMethod, paramObj) {
  const appKey = process.env.OMIE_APP_KEY;
  const appSecret = process.env.OMIE_APP_SECRET;

  if (!appKey || !appSecret) {
    console.warn(`[Hermes Omie] Variáveis OMIE_APP_KEY ou OMIE_APP_SECRET não configuradas no ambiente.`);
    return null;
  }

  try {
    const response = await axios.post(OMIE_PRODUTOS_URL, {
      call: callMethod,
      app_key: appKey,
      app_secret: appSecret,
      param: [paramObj]
    }, {
      timeout: 7000
    });
    return response.data;
  } catch (err) {
    const msg = err.response?.data?.faultstring || err.message;
    console.warn(`[Hermes Omie Call Error] ${callMethod}: ${msg}`);
    return null;
  }
}

// Normaliza texto para comparacoes
function normalizeText(str) {
  if (!str) return "";
  return String(str)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

const SKU_STOP_WORDS = new Set([
  'TOOLS', 'SIGMA', 'MAHOVI', 'DELTA', 'STARKX', 'WOLFCAR', 'LAPEK',
  'AUTOMOTIVO', 'AUTOMOTIVA', 'VEICULAR', 'PROFISSIONAL', 'UNIVERSAL',
  'DIGITAL', 'ANALOGICO', 'MANUAL', 'ELETRICO', 'PNEUMATICO', 'HIDRAULICO',
  'PECAS', 'PECA', 'LITROS', 'LITRO', 'KG', 'TON', 'TONELADAS', 'PSI', 'BAR',
  'MM', 'CM', 'METROS', 'METRO', 'M', 'POL', 'POLEGADAS', 'PRO', 'PLUS', 'KIT', 'MINI'
]);

/**
 * Extrai o codigo SKU a partir do titulo do produto.
 * Ignora nomes de marcas e palavras genericas.
 * Exemplo: "Elevador Automotivo 4000kg MAH-4008 - Mahovi" -> "MAH-4008"
 */
function extractSkuFromTitle(str) {
  if (!str) return null;
  const parts = String(str).trim().split(/\s+/);
  if (parts.length === 0) return null;

  for (let i = parts.length - 1; i >= 0; i--) {
    const candidate = parts[i].replace(/^[(\[{'"]+|[)\]}'"]+$/g, '').trim();
    const upper = candidate.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (!upper || SKU_STOP_WORDS.has(upper)) continue;

    const hasLetter = /[A-Z]/i.test(candidate);
    const hasDigit = /[0-9]/.test(candidate);
    const hasHyphen = candidate.includes('-');
    const isBarcode = /^[0-9]{6,}$/.test(candidate);

    if ((hasLetter && hasDigit) || (hasHyphen && candidate.length >= 3) || isBarcode) {
      return candidate;
    }
  }

  return null;
}

/**
 * Extrai padroes de modelo/SKU de uma string (ex: MAH-4008, SGT-0529AK, W1058)
 */
function extractModelKeys(str) {
  if (!str) return [];
  const upper = String(str).toUpperCase();
  const matches = upper.match(/[A-Z0-9]{2,}[-_/][A-Z0-9]{2,}|[A-Z]{2,4}[0-9]{2,5}[A-Z0-9]*|[0-9]{2,5}[A-Z]{2,4}/g) || [];
  return matches.map(m => m.replace(/[^A-Z0-9-_]/g, "")).filter(m => m.length >= 3);
}

/**
 * PASSO A: Busca Semantica / Textual no PostgreSQL (Supabase)
 */
async function searchLocalProducts(pool, searchTerm, limit = 10) {
  if (!pool) return [];

  const clean = String(searchTerm || "").trim();
  if (!clean) return [];

  const numLimit = Math.min(50, Math.max(1, Number(limit) || 10));
  const tokens = clean.split(/\s+/).filter(t => t.length >= 2).map(t => normalizeText(t));

  try {
    // 1. Verificacao de correspondencia exata por ID ou codigo Omie / SKU
    const isNumeric = /^\d+$/.test(clean);
    let exactRes = null;

    if (isNumeric) {
      exactRes = await pool.query(`
        SELECT 
          p.id, p.name, p.slug, p.price, 
          COALESCE(p.preco_venda, p.price, 0) as "precoVenda",
          COALESCE(p.estoque_quantidade, 0) as "estoqueQuantidade",
          p.price_negotiable as "priceNegotiable",
          p.status,
          p.badge, p.image, p.images, p.in_stock as "inStock",
          p.sku,
          p.omie_codigo_produto as "omieCodigoProduto",
          p.omie_code as "omieCode",
          p.description, p.specs,
          c.name as "categoryName", b.name as "brandName"
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN brands b ON p.brand_id = b.id
        WHERE p.omie_codigo_produto = $1 OR p.omie_product_id = $1 OR p.omie_code = $2 OR p.sku = $2
        LIMIT $3
      `, [clean, clean, numLimit]);
    } else {
      exactRes = await pool.query(`
        SELECT 
          p.id, p.name, p.slug, p.price, 
          COALESCE(p.preco_venda, p.price, 0) as "precoVenda",
          COALESCE(p.estoque_quantidade, 0) as "estoqueQuantidade",
          p.price_negotiable as "priceNegotiable",
          p.status,
          p.badge, p.image, p.images, p.in_stock as "inStock",
          p.sku,
          p.omie_codigo_produto as "omieCodigoProduto",
          p.omie_code as "omieCode",
          p.description, p.specs,
          c.name as "categoryName", b.name as "brandName"
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN brands b ON p.brand_id = b.id
        WHERE LOWER(p.omie_code) = LOWER($1) OR LOWER(COALESCE(p.sku, '')) = LOWER($1) OR LOWER(p.slug) = LOWER($1)
        LIMIT $2
      `, [clean, numLimit]);
    }

    if (exactRes && exactRes.rows.length > 0) {
      return exactRes.rows.map(mapDbRowToHermesProduct);
    }

    // 2. Busca textual flexivel por tokens no nome, descricao, marca e categoria
    let whereClauses = ["(p.status IS NULL OR p.status IN ('published', 'draft', 'rascunho'))"];
    let params = [];

    if (tokens.length > 0) {
      tokens.forEach((token, idx) => {
        params.push(`%${token}%`);
        const pNum = params.length;
        whereClauses.push(`(
          LOWER(p.name) LIKE $${pNum} OR 
          LOWER(COALESCE(p.omie_code, '')) LIKE $${pNum} OR 
          LOWER(COALESCE(b.name, '')) LIKE $${pNum} OR 
          LOWER(COALESCE(c.name, '')) LIKE $${pNum} OR
          LOWER(COALESCE(p.description, '')) LIKE $${pNum}
        )`);
      });
    } else {
      params.push(`%${clean.toLowerCase()}%`);
      whereClauses.push(`(LOWER(p.name) LIKE $1 OR LOWER(COALESCE(p.omie_code, '')) LIKE $1)`);
    }

    params.push(numLimit);
    const limitParam = params.length;

    const query = `
      SELECT 
        p.id, p.name, p.slug, p.price, 
        COALESCE(p.preco_venda, p.price, 0) as "precoVenda",
        COALESCE(p.estoque_quantidade, 0) as "estoqueQuantidade",
        p.price_negotiable as "priceNegotiable",
        p.status,
        p.badge, p.image, p.images, p.in_stock as "inStock",
        p.omie_codigo_produto as "omieCodigoProduto",
        p.omie_code as "omieCode",
        p.description, p.specs,
        c.name as "categoryName", b.name as "brandName",
        CASE 
          WHEN LOWER(p.name) = LOWER($1) THEN 1
          WHEN LOWER(p.name) LIKE $` + params.length + ` THEN 2
          ELSE 3
        END as relevance
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      WHERE ${whereClauses.join(" AND ")}
      ORDER BY relevance ASC, p.is_featured DESC, p.created_at DESC
      LIMIT $${limitParam}
    `;

    // Ajusta o primeiro parametro de relevancy se houver
    const finalParams = [...params];
    const res = await pool.query(
      query.replace(`$` + params.length, `$` + (params.length - 1)), 
      finalParams
    );

    return res.rows.map(mapDbRowToHermesProduct);
  } catch (err) {
    console.error("[searchLocalProducts Error]:", err.message);
    return [];
  }
}

function mapDbRowToHermesProduct(row) {
  const priceNum = Number(row.precoVenda || row.price || 0);
  const stockNum = Number(row.estoqueQuantidade != null ? row.estoqueQuantidade : (row.inStock ? 1 : 0));
  const isNegotiable = Boolean(row.priceNegotiable !== false);
  const statusStr = String(row.status || 'published').toLowerCase().trim();
  const isDraft = statusStr === 'draft' || statusStr === 'rascunho';
  const canBuyOnline = priceNum > 0 && !isNegotiable && !isDraft;

  let orientacao = "";
  if (isDraft) {
    orientacao = `Equipamento cadastrado internamente em RASCUNHO (oculto no catálogo do site para inclusão de imagens, tags e revisão técnica). Quando o cliente perguntar o valor a você, INFORME com clareza o preço de tabela/referência de R$ ${priceNum.toFixed(2)}, explicando que as condições comerciais finais (descontos, parcelamento, frete) são fechadas via cotação oficial no WhatsApp com nossos consultores técnicos.`;
  } else if (canBuyOnline) {
    orientacao = `Disponível para compra direta no site com checkout online pelo valor público de R$ ${priceNum.toFixed(2)}.`;
  } else if (priceNum > 0) {
    orientacao = `No site público o produto é exibido como "Sob Consulta" e o botão de compra direta fica bloqueado para orçamento. Porém, quando você (Hermes) for perguntado sobre o valor pelo cliente, INFORME com clareza o preço de tabela/referência de R$ ${priceNum.toFixed(2)}, explicando que as condições comerciais finais (descontos, parcelamento, frete) são fechadas via cotação oficial no WhatsApp com nossos consultores.`;
  } else {
    orientacao = `Equipamento sob consulta personalizada com a equipe de consultores técnicos da Athena. Solicite que o cliente entre em contato para cotação sob medida.`;
  }

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    precoVenda: priceNum,
    precoFormatado: priceNum > 0 ? `R$ ${priceNum.toFixed(2)}` : "Sob Consulta",
    precoExibicaoSite: canBuyOnline ? `R$ ${priceNum.toFixed(2)}` : "Sob Consulta",
    estoqueQuantidade: stockNum,
    priceNegotiable: isNegotiable,
    isUnderQuote: isNegotiable,
    status: row.status || 'published',
    isDraft: isDraft,
    canBuyOnline: canBuyOnline,
    modalidadeVenda: canBuyOnline ? "compra_direta_site" : "consulta_orcamento",
    orientacaoHermes: orientacao,
    inStock: stockNum > 0 || Boolean(row.inStock),
    badge: row.badge || null,
    image: row.image || null,
    brandName: row.brandName || "Athena",
    categoryName: row.categoryName || "Geral",
    sku: row.sku || row.omieCode || null,
    omieCodigoProduto: row.omieCodigoProduto ? String(row.omieCodigoProduto) : null,
    omieCode: row.omieCode || null,
    url: `https://athenaconsultoria.com.br/produto/${row.slug || row.id}`,
    source: "postgres_local_cache"
  };
}

/**
 * PASSO C: Fallback na API do Omie ERP
 */
async function fetchOmieFallback(searchTerm) {
  const clean = String(searchTerm || "").trim();
  if (!clean) return [];

  console.log(`[Hermes Fallback Omie] Consultando Omie ERP para: "${clean}"...`);

  // Extrai candidatos a codigo / SKU (incluindo o SKU via indice -1 ao separar o titulo por espaco)
  const skuFromTitle = extractSkuFromTitle(clean);
  const modelKeys = extractModelKeys(clean);
  const candidateCodes = [];

  if (skuFromTitle) candidateCodes.push(skuFromTitle);
  if (!candidateCodes.includes(clean)) candidateCodes.push(clean);
  for (const mk of modelKeys) {
    if (!candidateCodes.includes(mk)) candidateCodes.push(mk);
  }

  // Tentativa 1: Consulta direta por codigo / SKU (ConsultarProduto)
  for (const cod of candidateCodes) {
    try {
      const directByCode = await callOmie("ConsultarProduto", { codigo: cod });
      if (directByCode && (directByCode.codigo_produto || directByCode.codigo)) {
        return [directByCode];
      }
    } catch (e) {
      // Continua
    }

    if (/^\d+$/.test(cod)) {
      try {
        const directById = await callOmie("ConsultarProduto", { codigo_produto: Number(cod) });
        if (directById && directById.codigo_produto) {
          return [directById];
        }
      } catch (e) {
        // Continua
      }
    }
  }

  // Tentativa 2: Busca por listagem com filtrar_por_descricao no Omie
  const searchCandidates = [clean];
  const words = clean.split(/\s+/).filter(w => w.length >= 3);
  if (words.length >= 2) {
    searchCandidates.push(words.slice(0, 3).join(' ')); // Ex: "kit saca polia"
    const poliaWord = words.find(w => w.toLowerCase().includes('polia'));
    if (poliaWord) searchCandidates.push(poliaWord);
  }

  for (const term of searchCandidates) {
    if (!term) continue;
    try {
      const listRes = await callOmie("ListarProdutos", {
        pagina: 1,
        registros_por_pagina: 50,
        apenas_importado_api: "N",
        filtrar_apenas_omiepdv: "N",
        filtrar_por_descricao: term
      });
      const items = listRes?.produto_servico_cadastro || [];
      if (items.length > 0) {
        return items.slice(0, 10);
      }
    } catch (e) {
      // continua
    }
  }

  // Tentativa 3: Busca por listagem geral com filtro textual em memória
  try {
    const listRes = await callOmie("ListarProdutos", {
      pagina: 1,
      registros_por_pagina: 50,
      apenas_importado_api: "N",
      filtrar_apenas_omiepdv: "N"
    });

    const items = listRes?.produto_servico_cadastro || [];
    const normSearch = normalizeText(clean);
    const searchTokens = normSearch.split(/\s+/).filter(t => t.length >= 2);
    const normSku = skuFromTitle ? normalizeText(skuFromTitle) : "";

    const matches = items.filter(p => {
      const desc = normalizeText(p.descricao || "");
      const cod = normalizeText(p.codigo || "");
      const marca = normalizeText(p.marca || "");
      const full = `${desc} ${cod} ${marca}`;

      if (normSku && (cod === normSku || cod.includes(normSku))) return true;
      if (full.includes(normSearch)) return true;
      return searchTokens.length > 0 && searchTokens.every(tok => full.includes(tok));
    });

    return matches.slice(0, 10);
  } catch (e) {
    console.warn("[Hermes Fallback Omie ListarProdutos Error]:", e.message);
    return [];
  }
}

/**
 * PASSO D: Upsert no PostgreSQL (Cache-Aside Lazy Loading)
 */
async function upsertOmieProductToLocal(pool, omieItem) {
  if (!pool || !omieItem || !omieItem.codigo_produto) return null;

  try {
    const omieId = Number(omieItem.codigo_produto);
    const omieCode = String(omieItem.codigo || "").trim();
    const omieName = String(omieItem.descricao || "Equipamento Omie").trim();
    const preco = Number(omieItem.valor_unitario || 0);
    const estoque = Number(omieItem.quantidade_estoque != null ? omieItem.quantidade_estoque : 0);

    // 1. Deduplicação inteligente multi-tier (Omie ID, SKU exato, SKU normalizado, chaves de modelo no nome/ID)
    const { findMatchingAthenaProduct } = require("./omieWebhookService");
    const matchResult = await findMatchingAthenaProduct(pool, {
      codigoProduto: omieId,
      codigoSku: omieCode,
      descricao: omieName
    });

    if (matchResult && matchResult.product) {
      // Ja existe: UPDATE do cache local (PRESERVANDO o status price_negotiable e status publicado/rascunho!)
      const existing = matchResult.product;
      await pool.query(`
        UPDATE products 
        SET 
          omie_codigo_produto = $1,
          omie_product_id = $1,
          omie_code = $2::text,
          sku = CASE 
            WHEN sku IS NULL OR sku = '' OR sku IN ('Tools', 'kg', 'Litros', 'Mahovi', 'Delta', 'Sigma') 
            THEN COALESCE(NULLIF($2::text, ''), sku) 
            ELSE sku 
          END,
          preco_venda = CASE WHEN $3::numeric > 0 THEN $3::numeric ELSE preco_venda END,
          price = CASE WHEN (price IS NULL OR price = 0) AND $3::numeric > 0 THEN $3::numeric ELSE price END,
          estoque_quantidade = $4::integer,
          in_stock = ($4::integer > 0),
          omie_last_sync = CURRENT_TIMESTAMP
        WHERE id = $5::text
      `, [omieId, omieCode, preco, estoque, existing.id]);

      const isNegotiable = existing.price_negotiable !== false;
      const canBuyOnline = preco > 0 && !isNegotiable;

      return {
        id: existing.id,
        name: existing.name || omieName,
        slug: existing.slug,
        sku: omieCode,
        precoVenda: preco,
        precoFormatado: preco > 0 ? `R$ ${preco.toFixed(2)}` : "Sob Consulta",
        precoExibicaoSite: canBuyOnline ? `R$ ${preco.toFixed(2)}` : "Sob Consulta",
        estoqueQuantidade: estoque,
        priceNegotiable: isNegotiable,
        isUnderQuote: isNegotiable,
        canBuyOnline: canBuyOnline,
        modalidadeVenda: canBuyOnline ? "compra_direta_site" : "consulta_orcamento",
        orientacaoHermes: canBuyOnline 
          ? `Disponível para compra direta no site com checkout online por R$ ${preco.toFixed(2)}.`
          : (preco > 0 
              ? `No site público o valor é exibido como 'Sob Consulta' e não permite compra direta. Quando o cliente perguntar o valor a você, INFORME com clareza o preço de tabela/referência de R$ ${preco.toFixed(2)}, explicando que a formalização é feita via orçamento oficial com nossos consultores técnicos.`
              : `Item sob Consulta de Orçamento. Oriente o cliente a solicitar orçamento.`),
        inStock: estoque > 0,
        omieCodigoProduto: String(omieId),
        omieCode: omieCode,
        url: `https://athenaconsultoria.com.br/produto/${existing.slug || existing.id}`,
        source: "omie_fallback_cached"
      };
    }

    // 2. Nao existe: INSERT como novo produto em cache
    const rawSlug = omieName
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
    const slug = `${rawSlug || "produto"}-${omieCode ? omieCode.toLowerCase().replace(/[^a-z0-9]/g, "") : omieId}`;
    const newId = `prod_omie_${omieId}`;

    await pool.query(`
      INSERT INTO products (
        id, name, slug, price, preco_venda, estoque_quantidade,
        price_negotiable, status, in_stock, omie_codigo_produto,
        omie_product_id, omie_code, sku, omie_last_sync
      )
      VALUES ($1, $2, $3, $4, $4, $5, TRUE, 'draft', ($5 > 0), $6, $6, $7, $7, CURRENT_TIMESTAMP)
      ON CONFLICT (id) DO UPDATE SET
        preco_venda = $4,
        estoque_quantidade = $5,
        in_stock = ($5 > 0),
        sku = COALESCE(products.sku, $7),
        omie_last_sync = CURRENT_TIMESTAMP
    `, [newId, omieName, slug, preco, estoque, omieId, omieCode]);

    console.log(`[Cache-Aside] Produto do Omie "${omieName}" (SKU: ${omieCode}) salvo como RASCUNHO no banco Supabase!`);

    return {
      id: newId,
      name: omieName,
      slug: slug,
      sku: omieCode,
      precoVenda: preco,
      precoFormatado: preco > 0 ? `R$ ${preco.toFixed(2)}` : "Sob Consulta",
      precoExibicaoSite: "Sob Consulta",
      estoqueQuantidade: estoque,
      priceNegotiable: true, // Mantem "Sob Consulta" conforme regra de negocio
      isUnderQuote: true,
      status: "draft",
      isDraft: true,
      canBuyOnline: false,
      modalidadeVenda: "consulta_orcamento",
      orientacaoHermes: preco > 0
        ? `Equipamento importado do Omie ERP em formato de RASCUNHO (permanece estritamente oculto no site público para inclusão de imagens, tags e revisão pela equipe). Quando o cliente perguntar o valor a você, INFORME com clareza o preço de tabela/referência de R$ ${preco.toFixed(2)}, explicando que as condições comerciais finais (descontos, parcelamento, frete) são fechadas via cotação oficial no WhatsApp com nossos consultores técnicos.`
        : `Item sob Consulta de Orçamento (Rascunho). Oriente o cliente a solicitar orçamento formal com os consultores técnicos.`,
      inStock: estoque > 0,
      omieCodigoProduto: String(omieId),
      omieCode: omieCode,
      url: `https://athenaconsultoria.com.br/produto/${slug}`,
      source: "omie_fallback_cached"
    };
  } catch (err) {
    console.error("[upsertOmieProductToLocal Error]:", err.message);
    return null;
  }
}

/**
 * JUST-IN-TIME PRICE ENRICHMENT
 * Se um produto foi encontrado no banco de dados local do site, mas esta SEM PRECO (precoVenda <= 0),
 * consulta o Omie ERP para obter o preco de tabela/venda e estoque atualizado, registrando silenciosamente
 * no banco do site.
 * 
 * REGRA CRITICA DE NEGOCIO:
 * O status de "Sob Consulta" (price_negotiable) NAO e alterado!
 * Se estiver em consulta continua em consulta, e se nao estiver permanece como esta.
 */
async function enrichProductWithOmiePrice(pool, product) {
  if (!pool || !product) return product;
  if (Number(product.precoVenda || 0) > 0) return product; // Ja possui preco!

  console.log(`[Hermes Auto-Enrich] Produto "${product.name}" sem preco no banco local. Consultando Omie ERP...`);

  // Monta lista de possiveis chaves para buscar no Omie
  const skuFromTitle = extractSkuFromTitle(product.name);
  const modelKeys = extractModelKeys(product.name);
  const candidateCodes = [];

  if (product.omieCodigoProduto) {
    candidateCodes.push({ type: "codigo_produto", val: Number(product.omieCodigoProduto) });
  }
  if (product.omieCode) {
    candidateCodes.push({ type: "codigo", val: String(product.omieCode).trim() });
  }
  if (skuFromTitle && !candidateCodes.some(c => c.val === skuFromTitle)) {
    candidateCodes.push({ type: "codigo", val: skuFromTitle });
  }
  for (const mk of modelKeys) {
    if (!candidateCodes.some(c => c.val === mk)) {
      candidateCodes.push({ type: "codigo", val: mk });
    }
  }

  let omieItem = null;

  // 1. Tenta consulta direta por codigo ou codigo_produto
  for (const cand of candidateCodes) {
    try {
      const param = cand.type === "codigo_produto" ? { codigo_produto: cand.val } : { codigo: cand.val };
      const res = await callOmie("ConsultarProduto", param);
      if (res && (res.codigo_produto || res.codigo)) {
        omieItem = res;
        break;
      }
    } catch (e) {
      // continua
    }
  }

  // 2. Se nao encontrou direto, tenta busca flexivel no Omie usando o SKU ou nome
  if (!omieItem && (skuFromTitle || product.name)) {
    const fallbackResults = await fetchOmieFallback(skuFromTitle || product.name);
    if (fallbackResults && fallbackResults.length > 0) {
      omieItem = fallbackResults[0];
    }
  }

  // 3. Se obteve o item do Omie, enriquece o banco local e o objeto retornado
  if (omieItem) {
    const precoOmie = Number(omieItem.valor_unitario || 0);
    const estoqueOmie = Number(omieItem.quantidade_estoque != null ? omieItem.quantidade_estoque : 0);
    const omieId = Number(omieItem.codigo_produto || 0);
    const omieCode = String(omieItem.codigo || "").trim();

    if (precoOmie > 0 || estoqueOmie > 0) {
      // Grava no PostgreSQL SEM alterar o status de consulta (price_negotiable permanece INTACTO)
      await pool.query(`
        UPDATE products 
        SET 
          preco_venda = CASE WHEN $1::numeric > 0 THEN $1::numeric ELSE preco_venda END,
          price = CASE WHEN (price IS NULL OR price = 0) AND $1::numeric > 0 THEN $1::numeric ELSE price END,
          estoque_quantidade = $2::integer,
          in_stock = ($2::integer > 0),
          omie_codigo_produto = COALESCE(omie_codigo_produto, $3),
          omie_product_id = COALESCE(omie_product_id, $3),
          omie_code = COALESCE(NULLIF($4::text, ''), omie_code),
          sku = COALESCE(sku, NULLIF($4::text, '')),
          omie_last_sync = CURRENT_TIMESTAMP
        WHERE id = $5::text
      `, [
        precoOmie,
        estoqueOmie,
        omieId || null,
        omieCode || null,
        product.id
      ]);

      console.log(`[Hermes Auto-Enrich] ✅ Produto "${product.name}" enriquecido do Omie! Preco: R$ ${precoOmie} | Estoque: ${estoqueOmie} (Status 'Sob Consulta' preservado)`);

      // Atualiza os dados do produto para o Hermes responder com precisao
      if (precoOmie > 0) product.precoVenda = precoOmie;
      product.estoqueQuantidade = estoqueOmie;
      product.inStock = estoqueOmie > 0;
      if (omieId) product.omieCodigoProduto = String(omieId);
      if (omieCode) product.omieCode = omieCode;

      const isNegotiable = product.priceNegotiable !== false;
      const canBuyOnline = product.precoVenda > 0 && !isNegotiable;

      product.canBuyOnline = canBuyOnline;
      product.modalidadeVenda = canBuyOnline ? "compra_direta_site" : "consulta_orcamento";
      product.precoFormatado = product.precoVenda > 0 ? `R$ ${product.precoVenda.toFixed(2)}` : "Sob Consulta";
      product.precoExibicaoSite = canBuyOnline ? `R$ ${product.precoVenda.toFixed(2)}` : "Sob Consulta";

      if (canBuyOnline) {
        product.orientacaoHermes = `Disponível para compra direta no site com checkout online pelo valor público de R$ ${product.precoVenda.toFixed(2)}.`;
      } else if (product.precoVenda > 0) {
        product.orientacaoHermes = `No site público o produto é exibido como "Sob Consulta" e o botão de compra direta fica bloqueado para orçamento. Porém, quando você (Hermes) for perguntado sobre o valor pelo cliente, INFORME com clareza o preço de tabela/referência de R$ ${product.precoVenda.toFixed(2)}, explicando que as condições comerciais finais (descontos, parcelamento, frete) são fechadas via cotação oficial no WhatsApp com nossos consultores técnicos.`;
      }
    }
  }

  return product;
}

/**
 * FUNCAO PRINCIPAL DA TOOL DE BUSCA DO HERMES
 * Executa o fluxo completo Cache-Aside com Fallback e Enriquecimento Just-in-Time
 */
async function searchHermesProducts({ pool, search = "", limit = 10, forceOmie = false }) {
  const cleanSearch = String(search || "").trim();
  if (!cleanSearch) {
    return {
      query: "",
      total: 0,
      executionFlow: "empty_query",
      products: []
    };
  }

  // PASSO A & B: Busca semantica no PostgreSQL (Local Read Replica)
  if (!forceOmie && pool) {
    const localResults = await searchLocalProducts(pool, cleanSearch, limit);
    if (localResults.length > 0) {
      // Auto-enriquecimento Just-in-Time: Se algum dos produtos encontrados nao tiver valor,
      // busca no Omie e auto-alimenta o banco do site silenciosamente, mantendo o status de consulta.
      const enrichedProducts = [];
      for (const prod of localResults) {
        if (prod.precoVenda <= 0) {
          const enriched = await enrichProductWithOmiePrice(pool, prod);
          enrichedProducts.push(enriched);
        } else {
          enrichedProducts.push(prod);
        }
      }

      return {
        query: cleanSearch,
        total: enrichedProducts.length,
        executionFlow: "cache_hit_postgres_enriched",
        source: "local_database",
        performance: "optimized",
        products: enrichedProducts
      };
    }
  }

  // PASSO C: Fallback na API do Omie ERP (quando o produto nao esta cadastrado no site)
  const omieCandidates = await fetchOmieFallback(cleanSearch);
  if (omieCandidates.length === 0) {
    return {
      query: cleanSearch,
      total: 0,
      executionFlow: "fallback_miss_omie",
      message: `Nenhum produto encontrado para "${cleanSearch}" nem no banco local nem no ERP Omie.`,
      products: []
    };
  }

  // PASSO D: Persistencia no PostgreSQL (Cache-Aside Write) e retorno
  const cachedResults = [];
  for (const omieItem of omieCandidates) {
    const saved = await upsertOmieProductToLocal(pool, omieItem);
    if (saved) {
      cachedResults.push(saved);
    }
  }

  return {
    query: cleanSearch,
    total: cachedResults.length,
    executionFlow: "cache_miss_omie_loaded",
    source: "omie_erp_fallback_cached",
    products: cachedResults
  };
}

/**
 * Permite ao Hermes (ou via API x-hermes-key) atualizar dados de um produto no catalogo
 * (preco, estoque ou status).
 */
async function updateProductByHermes(pool, identifier, updateData = {}) {
  if (!pool || !identifier) {
    throw new Error("Parâmetros inválidos: pool e identificador do produto são obrigatórios.");
  }

  const cleanId = String(identifier).trim();

  let findRes = await pool.query(`
    SELECT id, name, slug, price, preco_venda, estoque_quantidade, price_negotiable, status, in_stock, omie_codigo_produto, omie_code, sku 
    FROM products 
    WHERE id = $1::text 
       OR slug = $1::text 
       OR CAST(omie_codigo_produto AS TEXT) = $1::text 
       OR CAST(omie_product_id AS TEXT) = $1::text 
       OR LOWER(COALESCE(omie_code, '')) = LOWER($1::text) 
       OR LOWER(COALESCE(sku, '')) = LOWER($1::text)
    LIMIT 1
  `, [cleanId]);

  if (!findRes || findRes.rows.length === 0) {
    // Tenta por SKU no titulo ou busca parcial
    const skuCandidate = extractSkuFromTitle(cleanId);
    const searchTerm = skuCandidate || cleanId;
    findRes = await pool.query(`
      SELECT id, name, slug, price, preco_venda, estoque_quantidade, price_negotiable, status, in_stock, omie_codigo_produto, omie_code, sku 
      FROM products 
      WHERE name ILIKE $1::text OR omie_code ILIKE $1::text OR sku ILIKE $1::text
      LIMIT 1
    `, [`%${searchTerm}%`]);
  }

  if (!findRes || findRes.rows.length === 0) {
    // 1. Tenta buscar no Omie para importar automaticamente
    let omieItem = null;
    try {
      if (/^\d+$/.test(cleanId)) {
        omieItem = await callOmie("ConsultarProduto", { codigo_produto: Number(cleanId) });
      }
      if (!omieItem) {
        omieItem = await callOmie("ConsultarProduto", { codigo: cleanId });
      }
    } catch (e) {
      console.warn(`[updateProductByHermes] Erro ao consultar Omie para "${cleanId}":`, e.message);
    }

    if (omieItem && omieItem.codigo_produto) {
      const saved = await upsertOmieProductToLocal(pool, omieItem);
      findRes = await pool.query(`SELECT id, name, slug, price, preco_venda, estoque_quantidade, price_negotiable, status, in_stock, omie_codigo_produto, omie_code, sku FROM products WHERE id = $1 LIMIT 1`, [saved.id]);
    } else {
      // 2. Não existe no Omie nem no banco local: cria como novo rascunho (draft)
      const name = updateData.name || updateData.descricao || `Produto ${cleanId}`;
      const rawSlug = name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9 -]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
      const slug = `${rawSlug || 'produto'}-${cleanId.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
      const newId = cleanId.startsWith('prod_') ? cleanId : `prod_${cleanId.replace(/[^a-zA-Z0-9_-]/g, '')}`;
      const initPrice = Number(updateData.precoVenda || updateData.price || 0);
      const initStock = parseInt(updateData.estoqueQuantidade || updateData.stock || 0, 10);
      const initSku = updateData.sku || cleanId;
      const initStatus = updateData.status ? String(updateData.status).trim() : 'draft';
      const initNegotiable = updateData.priceNegotiable != null ? Boolean(updateData.priceNegotiable) : true;

      await pool.query(`
        INSERT INTO products (
          id, name, slug, price, preco_venda, estoque_quantidade,
          price_negotiable, status, in_stock, sku, omie_code, omie_last_sync
        )
        VALUES ($1, $2, $3, $4, $4, $5, $6, $7, ($5 > 0), $8, $8, CURRENT_TIMESTAMP)
        ON CONFLICT (id) DO UPDATE SET
          preco_venda = $4,
          price = CASE WHEN $4 > 0 THEN $4 ELSE products.price END,
          estoque_quantidade = $5,
          in_stock = ($5 > 0),
          price_negotiable = $6,
          status = $7,
          sku = COALESCE(products.sku, $8),
          omie_last_sync = CURRENT_TIMESTAMP
      `, [newId, name, slug, initPrice, initStock, initNegotiable, initStatus, initSku]);

      findRes = await pool.query(`SELECT id, name, slug, price, preco_venda, estoque_quantidade, price_negotiable, status, in_stock, omie_codigo_produto, omie_code, sku FROM products WHERE id = $1 LIMIT 1`, [newId]);
    }
  }

  const existing = findRes.rows[0];

  const newPrice = updateData.precoVenda != null 
    ? Number(updateData.precoVenda) 
    : (updateData.price != null ? Number(updateData.price) : existing.preco_venda);

  const newStock = updateData.estoqueQuantidade != null 
    ? Number(updateData.estoqueQuantidade) 
    : (updateData.stock != null ? Number(updateData.stock) : existing.estoque_quantidade);

  const newNegotiable = updateData.priceNegotiable != null 
    ? Boolean(updateData.priceNegotiable) 
    : existing.price_negotiable;

  const newStatus = updateData.status ? String(updateData.status).trim() : existing.status;

  await pool.query(`
    UPDATE products 
    SET 
      preco_venda = $1::numeric,
      price = CASE WHEN $1::numeric > 0 THEN $1::numeric ELSE price END,
      estoque_quantidade = $2::integer,
      in_stock = ($2::integer > 0),
      price_negotiable = $3::boolean,
      status = $4::text,
      omie_last_sync = CURRENT_TIMESTAMP
    WHERE id = $5::text
  `, [
    newPrice,
    newStock,
    newNegotiable,
    newStatus,
    existing.id
  ]);

  // Sincroniza a alteração de estoque/preço com o Omie ERP em background
  try {
    const { syncProductToOmie } = require('./omieProductSyncService');
    syncProductToOmie(pool, {
      id: existing.id,
      name: existing.name,
      sku: existing.sku || existing.omie_code,
      omieCode: existing.omie_code,
      omieCodigoProduto: existing.omie_codigo_produto,
      stock: newStock,
      estoqueQuantidade: newStock,
      price: newPrice,
      precoVenda: newPrice
    }).catch(e => console.error('[Hermes Sync to Omie Background Error]:', e.message));
  } catch (err) {
    // continua sem quebrar
  }

  return {
    success: true,
    message: `Produto "${existing.name}" atualizado com sucesso pelo Hermes!`,
    product: {
      id: existing.id,
      name: existing.name,
      slug: existing.slug,
      precoVenda: newPrice,
      estoqueQuantidade: newStock,
      priceNegotiable: newNegotiable,
      status: newStatus,
      inStock: newStock > 0
    }
  };
}

/**
 * Permite ao Hermes forcar a sincronizacao/importacao de um produto do Omie ERP para o site.
 */
async function syncProductFromOmie(pool, { codigo, codigo_produto, search } = {}) {
  if (!pool) throw new Error("Conexão com o banco de dados indisponível.");

  let omieItem = null;

  if (codigo_produto) {
    omieItem = await callOmie("ConsultarProduto", { codigo_produto: Number(codigo_produto) });
  } else if (codigo) {
    omieItem = await callOmie("ConsultarProduto", { codigo: String(codigo).trim() });
  } else if (search) {
    const clean = String(search).trim();
    const sku = extractSkuFromTitle(clean);
    if (sku) {
      try {
        omieItem = await callOmie("ConsultarProduto", { codigo: sku });
      } catch (e) {}
    }
    if (!omieItem) {
      const candidates = await fetchOmieFallback(clean);
      if (candidates && candidates.length > 0) {
        omieItem = candidates[0];
      }
    }
  }

  if (!omieItem || !omieItem.codigo_produto) {
    throw new Error(`Produto não localizado no Omie ERP pelos critérios informados.`);
  }

  const saved = await upsertOmieProductToLocal(pool, omieItem);
  return {
    success: true,
    message: `Produto "${omieItem.descricao}" sincronizado com sucesso do Omie para o catálogo!`,
    product: saved
  };
}

/**
 * DECLARACAO DAS TOOLS DO HERMES PARA GEMINI AI
 * Formato oficial da Google Generative AI (Tool / Function Declaration)
 */
const hermesGeminiTools = [
  {
    name: "search_athena_products",
    description: "Pesquisa produtos, máquinas e equipamentos automotivos da Athena Soluções Automotivas com preço atualizado e saldo de estoque em tempo real. Consulta o banco local de alta velocidade e auto-sincroniza silenciosamente com o Omie ERP caso o produto esteja sem valor ou não cadastrado no site.",
    parameters: {
      type: "OBJECT",
      properties: {
        search: {
          type: "STRING",
          description: "Termo de busca, nome do equipamento (ex: Elevador 4T, Scanner Automotivo), modelo/SKU (ex: MAH-4008, SGT-0529AK)."
        },
        limit: {
          type: "INTEGER",
          description: "Quantidade máxima de produtos a retornar (padrão: 10)."
        }
      },
      required: ["search"]
    }
  },
  {
    name: "update_athena_product",
    description: "Atualiza o preço de venda ou a quantidade de estoque de um produto existente no catálogo da Athena. Usar apenas quando explicitamente solicitado pelo administrador.",
    parameters: {
      type: "OBJECT",
      properties: {
        identifier: {
          type: "STRING",
          description: "ID do produto, slug, código SKU ou modelo (ex: 'MAH-4008', 'prod_123')."
        },
        precoVenda: {
          type: "NUMBER",
          description: "Novo preço de venda do produto em Reais."
        },
        estoqueQuantidade: {
          type: "INTEGER",
          description: "Nova quantidade em estoque disponível."
        },
        status: {
          type: "STRING",
          description: "Status do produto no catálogo ('draft' para rascunho ou 'published' para publicado). Novos itens ou revisões internas devem sempre usar 'draft'."
        }
      },
      required: ["identifier"]
    }
  },
  {
    name: "sync_omie_product",
    description: "Força a busca e sincronização/cadastro de um produto do ERP Omie para o catálogo do site Athena. Usar quando o usuário solicitar puxar um produto do Omie.",
    parameters: {
      type: "OBJECT",
      properties: {
        codigo: {
          type: "STRING",
          description: "Código SKU do produto no Omie (ex: 'MAH-4008')."
        },
        codigo_produto: {
          type: "INTEGER",
          description: "Código numérico do produto no Omie."
        },
        search: {
          type: "STRING",
          description: "Termo de busca no Omie caso não saiba o código exato."
        }
      }
    }
  }
];

const hermesGeminiToolDeclaration = hermesGeminiTools[0];

/**
 * Executor da Tool Gemini para integracao com Agente Hermes
 */
async function executeHermesGeminiTool(pool, toolCall) {
  const name = toolCall.name || toolCall.function?.name;
  const args = toolCall.args || toolCall.function?.arguments || {};
  const parsedArgs = typeof args === "string" ? JSON.parse(args) : args;

  if (name === "search_athena_products") {
    return await searchHermesProducts({
      pool,
      search: parsedArgs.search || parsedArgs.query || "",
      limit: parsedArgs.limit || 10
    });
  }

  if (name === "update_athena_product") {
    return await updateProductByHermes(pool, parsedArgs.identifier, {
      precoVenda: parsedArgs.precoVenda,
      estoqueQuantidade: parsedArgs.estoqueQuantidade,
      status: parsedArgs.status
    });
  }

  if (name === "sync_omie_product") {
    return await syncProductFromOmie(pool, {
      codigo: parsedArgs.codigo,
      codigo_produto: parsedArgs.codigo_produto,
      search: parsedArgs.search
    });
  }

  throw new Error(`Tool desconhecida: ${name}`);
}

async function createProductByHermes(pool, productData = {}) {
  const cleanId = String(productData.id || productData.sku || productData.codigo || productData.omieCode || `prod_${Date.now()}`).trim();
  const dataWithDraft = {
    status: 'draft',
    ...productData
  };
  return await updateProductByHermes(pool, cleanId, dataWithDraft);
}

module.exports = {
  searchHermesProducts,
  searchLocalProducts,
  fetchOmieFallback,
  upsertOmieProductToLocal,
  enrichProductWithOmiePrice,
  updateProductByHermes,
  createProductByHermes,
  syncProductFromOmie,
  extractSkuFromTitle,
  extractModelKeys,
  hermesGeminiToolDeclaration,
  hermesGeminiTools,
  executeHermesGeminiTool
};
