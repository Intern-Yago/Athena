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

const OMIE_APP_KEY = process.env.OMIE_APP_KEY || "7410462256197";
const OMIE_APP_SECRET = process.env.OMIE_APP_SECRET || "0a8c9d675963da05b8565eb75a167020";
const OMIE_PRODUTOS_URL = "https://app.omie.com.br/api/v1/geral/produtos/";

// Helper para chamada segura a API do Omie
async function callOmie(callMethod, paramObj) {
  try {
    const response = await axios.post(OMIE_PRODUTOS_URL, {
      call: callMethod,
      app_key: OMIE_APP_KEY,
      app_secret: OMIE_APP_SECRET,
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
          p.badge, p.image, p.images, p.in_stock as "inStock",
          p.omie_codigo_produto as "omieCodigoProduto",
          p.omie_code as "omieCode",
          p.description, p.specs,
          c.name as "categoryName", b.name as "brandName"
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN brands b ON p.brand_id = b.id
        WHERE p.omie_codigo_produto = $1 OR p.omie_product_id = $1 OR p.omie_code = $2
        LIMIT $3
      `, [clean, clean, numLimit]);
    } else {
      exactRes = await pool.query(`
        SELECT 
          p.id, p.name, p.slug, p.price, 
          COALESCE(p.preco_venda, p.price, 0) as "precoVenda",
          COALESCE(p.estoque_quantidade, 0) as "estoqueQuantidade",
          p.price_negotiable as "priceNegotiable",
          p.badge, p.image, p.images, p.in_stock as "inStock",
          p.omie_codigo_produto as "omieCodigoProduto",
          p.omie_code as "omieCode",
          p.description, p.specs,
          c.name as "categoryName", b.name as "brandName"
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN brands b ON p.brand_id = b.id
        WHERE LOWER(p.omie_code) = LOWER($1) OR LOWER(p.slug) = LOWER($1)
        LIMIT $2
      `, [clean, numLimit]);
    }

    if (exactRes && exactRes.rows.length > 0) {
      return exactRes.rows.map(mapDbRowToHermesProduct);
    }

    // 2. Busca textual flexivel por tokens no nome, descricao, marca e categoria
    let whereClauses = ["p.status = 'published'"];
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
  const canBuyOnline = priceNum > 0 && !isNegotiable;

  let orientacao = "";
  if (canBuyOnline) {
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
    canBuyOnline: canBuyOnline,
    modalidadeVenda: canBuyOnline ? "compra_direta_site" : "consulta_orcamento",
    orientacaoHermes: orientacao,
    inStock: stockNum > 0 || Boolean(row.inStock),
    badge: row.badge || null,
    image: row.image || null,
    brandName: row.brandName || "Athena",
    categoryName: row.categoryName || "Geral",
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

  console.log(`[Hermes Fallback Omie] Produto nao encontrado localmente. Consultando Omie ERP para: "${clean}"...`);

  // Tentativa 1: Consulta direta por codigo / SKU (ConsultarProduto)
  // Se for algo como MAH-4008, 0615010001, etc.
  try {
    const directByCode = await callOmie("ConsultarProduto", { codigo: clean });
    if (directByCode && directByCode.codigo_produto) {
      return [directByCode];
    }
  } catch (e) {
    // Continua
  }

  // Se for numerico, tenta por codigo_produto
  if (/^\d+$/.test(clean)) {
    try {
      const directById = await callOmie("ConsultarProduto", { codigo_produto: Number(clean) });
      if (directById && directById.codigo_produto) {
        return [directById];
      }
    } catch (e) {
      // Continua
    }
  }

  // Tentativa 2: Busca por listagem com filtro textual
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

    const matches = items.filter(p => {
      const desc = normalizeText(p.descricao || "");
      const cod = normalizeText(p.codigo || "");
      const marca = normalizeText(p.marca || "");
      const full = `${desc} ${cod} ${marca}`;

      if (full.includes(normSearch)) return true;
      return searchTokens.every(tok => full.includes(tok));
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

    // 1. Verifica se ja existe por omie_codigo_produto ou omie_code
    const checkRes = await pool.query(`
      SELECT id, name, slug, price, preco_venda, price_negotiable, estoque_quantidade 
      FROM products 
      WHERE omie_codigo_produto = $1 OR omie_product_id = $1 OR (omie_code = $2 AND omie_code IS NOT NULL AND omie_code != '')
      LIMIT 1
    `, [omieId, omieCode]);

    if (checkRes.rows.length > 0) {
      // Ja existe: UPDATE do cache local
      const existing = checkRes.rows[0];
      await pool.query(`
        UPDATE products 
        SET 
          omie_codigo_produto = $1,
          omie_product_id = $1,
          omie_code = $2,
          preco_venda = $3,
          estoque_quantidade = $4,
          in_stock = ($4 > 0),
          omie_last_sync = CURRENT_TIMESTAMP
        WHERE id = $5
      `, [omieId, omieCode, preco, estoque, existing.id]);

      const isNegotiable = existing.price_negotiable !== false;
      const canBuyOnline = preco > 0 && !isNegotiable;

      return {
        id: existing.id,
        name: existing.name || omieName,
        slug: existing.slug,
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
              ? `No site público o valor é exibido como 'Sob Consulta' e não permite compra direta. Quando o cliente perguntar o valor a você, INFORME com clareza o preço de tabela/referência de R$ ${preco.toFixed(2)}, explicando que a formalização é feita via orçamento oficial com nossos consultores.`
              : `Item sob Consulta de Orçamento. Oriente o cliente a solicitar orçamento.`),
        inStock: estoque > 0,
        omieCodigoProduto: String(omieId),
        omieCode: omieCode,
        url: `https://athenaconsultoria.com.br/produto/${existing.slug || existing.id}`,
        source: "omie_fallback_cached"
      };
    }

    // 2. Nao existe: INSERT como novo produto em cache
    // Gera slug amigavel
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
        omie_product_id, omie_code, omie_last_sync
      )
      VALUES ($1, $2, $3, $4, $4, $5, TRUE, 'published', ($5 > 0), $6, $6, $7, CURRENT_TIMESTAMP)
      ON CONFLICT (id) DO UPDATE SET
        preco_venda = $4,
        estoque_quantidade = $5,
        in_stock = ($5 > 0),
        omie_last_sync = CURRENT_TIMESTAMP
    `, [newId, omieName, slug, preco, estoque, omieId, omieCode]);

    console.log(`[Cache-Aside] Produto do Omie "${omieName}" (${omieCode}) salvo com sucesso no banco Supabase!`);

    return {
      id: newId,
      name: omieName,
      slug: slug,
      precoVenda: preco,
      precoFormatado: preco > 0 ? `R$ ${preco.toFixed(2)}` : "Sob Consulta",
      precoExibicaoSite: "Sob Consulta",
      estoqueQuantidade: estoque,
      priceNegotiable: true, // Mantem "Consultar Orcamento" no frontend conforme regra de negocio
      isUnderQuote: true,
      canBuyOnline: false,
      modalidadeVenda: "consulta_orcamento",
      orientacaoHermes: preco > 0
        ? `No site público o valor é exibido como 'Sob Consulta' e não permite compra direta. Quando o cliente perguntar o valor a você, INFORME com clareza o preço de tabela/referência de R$ ${preco.toFixed(2)}, explicando que a proposta formal e condições são fechadas via cotação oficial com nossos consultores.`
        : `Item sob Consulta de Orçamento. Oriente o cliente a solicitar orçamento.`,
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
 * FUNCAO PRINCIPAL DA TOOL DO HERMES
 * Executa o fluxo completo Cache-Aside com Fallback
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
      return {
        query: cleanSearch,
        total: localResults.length,
        executionFlow: "cache_hit_postgres",
        source: "local_database",
        performance: "sub_30ms",
        products: localResults
      };
    }
  }

  // PASSO C: Fallback na API do Omie ERP
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
 * DECLARACAO DA TOOL DO HERMES PARA GEMINI AI
 * Formato oficial da Google Generative AI (Tool / Function Declaration)
 */
const hermesGeminiToolDeclaration = {
  name: "search_athena_products",
  description: "Pesquisa produtos, maquinas e equipamentos automotivos da Athena Solucoes Automotivas com preco atualizado e saldo de estoque em tempo real. Consulta primeiro a replica de leitura em alta velocidade e sincroniza com o Omie ERP automaticamente quando necessario.",
  parameters: {
    type: "OBJECT",
    properties: {
      search: {
        type: "STRING",
        description: "Termo de busca, nome do equipamento (ex: Elevador 4T, Scanner Automotivo), modelo (ex: MAH-4008, SGT-0529AK) ou codigo SKU."
      },
      limit: {
        type: "INTEGER",
        description: "Quantidade maxima de produtos a retornar (padrao: 10)."
      }
    },
    required: ["search"]
  }
};

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

  throw new Error(`Tool desconhecida: ${name}`);
}

module.exports = {
  searchHermesProducts,
  searchLocalProducts,
  fetchOmieFallback,
  upsertOmieProductToLocal,
  hermesGeminiToolDeclaration,
  executeHermesGeminiTool
};
