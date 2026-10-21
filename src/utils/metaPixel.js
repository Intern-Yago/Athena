/**
 * metaPixel.js
 *
 * Central Unificada de Telemetria Comercial & Conversão (Meta Pixel + Google Analytics 4 / GTM).
 *
 * Funcionalidades:
 * 1. Filtro Automático de Equipe (Staff Block):
 *    - Bloqueia o envio de métricas quando o usuário logado faz parte da equipe interna
 *      (roles: 'admin', 'vendedor', 'editor', 'staff', 'gerente', 'operador', 'logistica')
 *      ou quando está navegando dentro de '/admin'.
 *    - Mantém o rastreamento 100% ATIVO para Clientes logados (role: 'cliente' / 'customer')
 *      e visitantes anônimos.
 * 2. Enriquecimento Descritivo Automático (Rich Context):
 *    - Anexa automaticamente em TODOS os eventos os campos `descricao`, `diretorio`, `secao`,
 *      `url_completa`, `pagina_anterior` e `titulo_pagina` para facilitar a leitura humana no
 *      Gerenciador de Eventos da Meta e no Google Analytics 4.
 * 3. Disparo Duplo Sincronizado (Dual-Dispatch + CAPI):
 *    - Envia eventos padrão e personalizados simultaneamente para os 2 Datasets do Meta Pixel (`fbq`),
 *      para a API de Conversões Server-Side (`/api/analytics/capi` com desduplicação `eventID`)
 *      e para a camada de dados do Google Tag Manager / GA4 (`window.dataLayer`).
 */

export const META_PIXEL_ID = '2181846082544846';
export const META_PIXEL_IDS = ['2181846082544846', '2198770257418355'];
export const GA4_MEASUREMENT_ID = 'G-8LBCQ5SBNR';

const STAFF_ROLES = new Set([
  'admin',
  'administrador',
  'vendedor',
  'editor',
  'staff',
  'gerente',
  'operador',
  'logistica'
]);

/**
 * Verifica se a sessão atual pertence a um membro da equipe interna (Admin / Funcionário).
 * Clientes logados ('cliente' / 'customer') retornam `false` e continuam sendo rastreados normalmente.
 *
 * @returns {boolean} `true` se o rastreamento deve ser bloqueado (Staff), `false` caso contrário.
 */
export function isStaffAnalyticsBlocked() {
  if (typeof window === 'undefined') return true;

  try {
    if (window.location?.pathname?.startsWith('/admin')) {
      return true;
    }

    const raw = window.localStorage?.getItem('athena_user');
    if (!raw) return false;

    const user = JSON.parse(raw);
    if (!user || !user.role) return false;

    const role = String(user.role).toLowerCase().trim();
    // Clientes reais da loja nunca são bloqueados
    if (role === 'cliente' || role === 'customer' || role === 'user') {
      return false;
    }

    return STAFF_ROLES.has(role);
  } catch (_) {
    return false;
  }
}

/**
 * Identifica a seção amigável e o diretório exato da URL atual.
 */
export function getCurrentPageContext() {
  if (typeof window === 'undefined') {
    return {
      diretorio: '/catalogo',
      secao: 'Catálogo Principal',
      url_completa: 'https://www.athenaconsultoria.com.br/',
      titulo_pagina: 'Athena Soluções Automotivas'
    };
  }

  const rawPath = window.location?.pathname || '/';
  const search = window.location?.search || '';
  const hash = window.location?.hash ? window.location.hash.replace(/^#\/?/, '') : '';
  const cleanRoute = (rawPath && rawPath !== '/' ? rawPath.replace(/^\//, '') : hash) || 'catalogo';
  const diretorio = `/${cleanRoute}${search}`;

  let secao = 'Catálogo Principal';
  if (cleanRoute.startsWith('produto/') || cleanRoute.startsWith('product:')) {
    secao = 'Página de Produto';
  } else if (cleanRoute.startsWith('categoria/') || cleanRoute.startsWith('category:')) {
    secao = 'Página de Categoria';
  } else if (cleanRoute.startsWith('marca/') || cleanRoute.startsWith('brand:')) {
    secao = 'Página de Marca';
  } else if (cleanRoute === 'categorias' || cleanRoute === 'categories') {
    secao = 'Índice de Categorias';
  } else if (cleanRoute === 'marcas' || cleanRoute === 'brands') {
    secao = 'Índice de Marcas';
  } else if (cleanRoute === 'sobre' || cleanRoute === 'about' || cleanRoute === 'quem-somos') {
    secao = 'Institucional / Sobre a Athena';
  } else if (cleanRoute === 'minha-conta' || cleanRoute === 'account' || cleanRoute === 'pedidos') {
    secao = 'Área do Cliente';
  } else if (cleanRoute === 'login' || cleanRoute === 'cadastro') {
    secao = 'Autenticação de Cliente';
  }

  return {
    diretorio,
    secao,
    url_completa: window.location?.href || `https://www.athenaconsultoria.com.br${diretorio}`,
    titulo_pagina: (typeof document !== 'undefined' && document.title) ? document.title : 'Athena Soluções Automotivas'
  };
}

/**
 * Constrói automaticamente uma descrição humana clara em português para qualquer evento,
 * caso uma descrição customizada não tenha sido fornecida.
 */
function buildDefaultEventDescription(eventName, params = {}, pageCtx) {
  if (params.descricao) return params.descricao;

  const contentIds = Array.isArray(params.content_ids) ? params.content_ids : [];
  const code = contentIds[0] || params.sku || params.product_id || '';
  const name = params.content_name || params.product_name || params.category_name || params.brand_name || '';
  const brand = params.brand_name ? ` | Marca: ${params.brand_name}` : '';
  const category = params.content_category ? ` | Cat: ${params.content_category}` : '';
  const cepInfo = params.shipping_cep
    ? ` | CEP: ${params.shipping_cep}${params.shipping_location ? ` (${params.shipping_location})` : ''}`
    : '';
  const carrierInfo = params.shipping_carrier ? ` | Frete: ${params.shipping_carrier}` : '';

  switch (eventName) {
    case 'PageView':
      return `Navegou para ${pageCtx.secao}${name ? `: ${name}` : ''} (${pageCtx.diretorio})`;
    case 'ViewContent':
      return `Abriu ficha do equipamento: ${name}${code ? ` [${code}]` : ''}${brand}${category} (${pageCtx.diretorio})`;
    case 'AddToCart':
      return `Adicionou à lista/carrinho (${params.quantity || 1} un): ${name}${code ? ` [${code}]` : ''}${brand}${category}`;
    case 'Search':
      return `Pesquisou no catálogo por "${params.search_string || ''}"${params.results_count != null ? ` (${params.results_count} resultados)` : ''}`;
    case 'ViewCategory':
      return `Explorou a categoria: ${params.category_name || code}${params.products_count != null ? ` (${params.products_count} equipamentos)` : ''} (${pageCtx.diretorio})`;
    case 'ViewBrand':
      return `Explorou a marca: ${params.brand_name || code}${params.products_count != null ? ` (${params.products_count} equipamentos)` : ''} (${pageCtx.diretorio})`;
    case 'CalculateShipping':
    case 'FindLocation':
      return `Calculou frete p/ CEP ${params.shipping_cep || params.postal_code || ''}${params.shipping_location ? ` (${params.shipping_location})` : ''} no item: ${name || 'Carrinho'}${carrierInfo}`;
    case 'InitiateCheckout':
      return `Iniciou fechamento/cotação do carrinho (${params.num_items || 1} itens)${cepInfo}${carrierInfo}`;
    case 'Lead':
      return `Gerou Lead de Orçamento (${params.lead_source || 'WhatsApp'}): ${name}${code ? ` [${code}]` : ''}${cepInfo}${carrierInfo}`;
    case 'Contact':
      return `Clicou para atendimento no WhatsApp: ${name}${code ? ` [${code}]` : ''}${cepInfo}${carrierInfo}`;
    case 'CompareProduct':
      return `Adicionou equipamento ao comparador técnico: ${name}${code ? ` [${code}]` : ''}`;
    default:
      return `${eventName}${name ? `: ${name}` : ''} (${pageCtx.diretorio})`;
  }
}

/**
 * Enriquece os parâmetros do evento com descrição legível, diretório, seção e URL completa.
 */
export function enrichEventParams(eventName, params = {}) {
  const pageCtx = getCurrentPageContext();
  const descricao = buildDefaultEventDescription(eventName, params, pageCtx);

  return {
    descricao,
    diretorio: params.diretorio || params.page_path || pageCtx.diretorio,
    secao: params.secao || params.page_section || pageCtx.secao,
    url_completa: params.url_completa || params.page_url || pageCtx.url_completa,
    ...params
  };
}

/**
 * Envia um evento estruturado para o Google Tag Manager / GA4 (`window.dataLayer`).
 *
 * @param {string} gaEventName - Nome do evento GA4 (snake_case)
 * @param {Object} params - Parâmetros do evento
 */
export function pushGtmEvent(gaEventName, params = {}) {
  if (isStaffAnalyticsBlocked()) return;

  try {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: gaEventName,
      ...params
    });

    const gtagFn = typeof window.gtag === 'function'
      ? window.gtag
      : function () { window.dataLayer.push(arguments); };

    gtagFn('event', gaEventName, {
      send_to: GA4_MEASUREMENT_ID,
      ...params
    });
  } catch (err) {
    console.warn('[GA4/GTM Warning]:', err.message);
  }
}

/**
 * Converte parâmetros do Meta Pixel para o formato padrão E-Commerce do GA4.
 */
function mapMetaToGa4Event(eventName, params = {}) {
  const contentIds = Array.isArray(params.content_ids) ? params.content_ids : [];
  const primaryId = contentIds[0] || params.product_id || '';
  const itemName = params.content_name || params.product_name || '';
  const itemCategory = params.content_category || '';
  const value = Number(params.value || 0);
  const currency = params.currency || 'BRL';

  const items = Array.isArray(params.contents) && params.contents.length > 0
    ? params.contents.map(c => ({
        item_id: String(c.id || primaryId),
        item_name: c.name || itemName,
        price: Number(c.item_price || value || 0),
        quantity: Number(c.quantity || 1)
      }))
    : (primaryId || itemName
        ? [{
            item_id: String(primaryId),
            item_name: String(itemName),
            item_category: String(itemCategory),
            item_brand: String(params.brand_name || ''),
            price: value,
            quantity: Number(params.quantity || params.num_items || 1)
          }]
        : []);

  const commonContext = {
    descricao: params.descricao || '',
    diretorio: params.diretorio || '',
    secao: params.secao || '',
    pagina_anterior: params.pagina_anterior || '',
    url_completa: params.url_completa || ''
  };

  switch (eventName) {
    case 'ViewContent':
      return {
        gaName: 'view_item',
        gaParams: {
          ...commonContext,
          currency,
          value,
          content_name: itemName,
          content_id: primaryId,
          content_category: itemCategory,
          brand_name: params.brand_name || '',
          modalidade_venda: params.modalidade_venda || '',
          items
        }
      };
    case 'AddToCart':
      return {
        gaName: 'add_to_cart',
        gaParams: {
          ...commonContext,
          currency,
          value,
          content_name: itemName,
          content_id: primaryId,
          content_category: itemCategory,
          brand_name: params.brand_name || '',
          variant_name: params.variant_name || '',
          modalidade_venda: params.modalidade_venda || '',
          quantity: Number(params.quantity || 1),
          items
        }
      };
    case 'InitiateCheckout':
      return {
        gaName: 'begin_checkout',
        gaParams: {
          ...commonContext,
          currency,
          value,
          num_items: params.num_items || items.length,
          itens_orcamento: params.itens_orcamento || '',
          shipping_cep: params.shipping_cep || '',
          shipping_location: params.shipping_location || '',
          shipping_carrier: params.shipping_carrier || '',
          items
        }
      };
    case 'Search':
      return {
        gaName: 'search',
        gaParams: {
          ...commonContext,
          search_term: params.search_string || params.search_term || '',
          results_count: params.results_count ?? null,
          sample_results: params.sample_results || ''
        }
      };
    case 'Lead':
      return {
        gaName: 'generate_lead',
        gaParams: {
          ...commonContext,
          currency,
          value,
          lead_source: params.lead_source || 'whatsapp_quote',
          content_name: itemName,
          content_id: primaryId,
          brand_name: params.brand_name || '',
          shipping_cep: params.shipping_cep || '',
          shipping_location: params.shipping_location || '',
          shipping_carrier: params.shipping_carrier || '',
          shipping_price: params.shipping_price ?? null,
          items
        }
      };
    case 'Contact':
      return {
        gaName: 'whatsapp_contact',
        gaParams: {
          ...commonContext,
          content_name: itemName,
          content_id: primaryId,
          content_category: itemCategory,
          brand_name: params.brand_name || '',
          origem_clique: params.origem_clique || '',
          value,
          currency,
          shipping_cep: params.shipping_cep || '',
          shipping_location: params.shipping_location || '',
          shipping_carrier: params.shipping_carrier || ''
        }
      };
    case 'FindLocation':
      return {
        gaName: 'find_location',
        gaParams: {
          ...commonContext,
          content_name: itemName,
          content_id: primaryId,
          shipping_cep: params.shipping_cep || params.postal_code || '',
          shipping_location: params.shipping_location || '',
          shipping_carrier: params.shipping_carrier || '',
          shipping_price: params.shipping_price ?? null
        }
      };
    default:
      return null;
  }
}

/**
 * Lê um cookie específico do navegador (usado para _fbp e _fbc da Meta CAPI).
 */
function getCookieValue(cookieName) {
  if (typeof document === 'undefined' || !document.cookie) return '';
  const match = document.cookie.match(new RegExp(`(^| )${cookieName}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : '';
}

/**
 * Envia o evento em segundo plano para a API de Conversões (CAPI) no servidor Node.js,
 * utilizando o mesmo `eventId` para desduplicação automática na Meta nos 2 Datasets.
 */
function sendServerCapiEvent(eventName, eventId, params = {}) {
  if (typeof window === 'undefined' || typeof fetch !== 'function') return;

  try {
    let customerData = {};
    const rawUser = window.localStorage?.getItem('athena_user');
    if (rawUser) {
      const parsed = JSON.parse(rawUser);
      if (parsed && (parsed.role === 'cliente' || parsed.role === 'customer')) {
        customerData = {
          email: parsed.email || undefined,
          phone: parsed.phone || undefined,
          userId: parsed.id || undefined
        };
      }
    }

    const apiBase = (window.location && window.location.origin)
      ? `${window.location.origin}/api`
      : 'https://athena-backend-hu1m.onrender.com/api';

    fetch(`${apiBase}/analytics/capi`, {
      method: 'POST',
      keepalive: true,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventName,
        eventId,
        eventSourceUrl: params.url_completa || window.location?.href || 'https://www.athenaconsultoria.com.br/',
        customData: params,
        userData: customerData,
        fbp: getCookieValue('_fbp'),
        fbc: getCookieValue('_fbc')
      })
    }).catch(() => {});
  } catch (_) {}
}

/**
 * Dispara um Evento Padrão (Standard Event) nos 2 Conjuntos de Dados do Meta Pixel
 * (via Browser + CAPI Server-Side com desduplicação) e espelha automaticamente no GA4/GTM.
 * Ignora automaticamente caso o usuário logado seja Staff/Admin.
 *
 * @param {string} eventName - Ex: 'PageView', 'ViewContent', 'AddToCart', 'Search', 'InitiateCheckout', 'Lead', 'Contact', 'FindLocation'
 * @param {Object} params - Parâmetros de contexto (content_ids, content_name, value, currency, etc.)
 */
export function trackMetaEvent(eventName, params = {}) {
  if (isStaffAnalyticsBlocked()) return;

  const enriched = enrichEventParams(eventName, params);
  const eventId = `evt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    try {
      // Dispara automaticamente para todos os Datasets inicializados (2181846082544846 e 2198770257418355)
      window.fbq('track', eventName, enriched, { eventID: eventId });
    } catch (err) {
      console.warn('[Meta Pixel Warning]:', err.message);
    }
  }

  // Envia via Server-Side CAPI com o mesmo eventID (desduplicado nos 2 Datasets)
  sendServerCapiEvent(eventName, eventId, enriched);

  // Para PageView, o App.jsx já gerencia o push dedicado de virtual_page_view com path/title
  if (eventName !== 'PageView') {
    const mapped = mapMetaToGa4Event(eventName, enriched);
    if (mapped) {
      pushGtmEvent(mapped.gaName, mapped.gaParams);
    }
  }
}

/**
 * Dispara um Evento Personalizado (Custom Event) nos 2 Conjuntos de Dados do Meta Pixel
 * (`fbq('trackCustom', ...)` + CAPI Server-Side) e espelha no Google Tag Manager / GA4 (`window.dataLayer`).
 * Ignora automaticamente caso o usuário logado seja Staff/Admin.
 *
 * @param {string} eventName - Ex: 'CalculateShipping', 'ViewCategory', 'ViewBrand', 'CompareProduct'
 * @param {Object} params - Dados ricos da ação
 */
export function trackMetaCustom(eventName, params = {}) {
  if (isStaffAnalyticsBlocked()) return;

  const enriched = enrichEventParams(eventName, params);
  const eventId = `evt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    try {
      // Dispara automaticamente para todos os Datasets inicializados (2181846082544846 e 2198770257418355)
      window.fbq('trackCustom', eventName, enriched, { eventID: eventId });
    } catch (err) {
      console.warn('[Meta Pixel Custom Warning]:', err.message);
    }
  }

  // Envia via Server-Side CAPI com o mesmo eventID (desduplicado nos 2 Datasets)
  sendServerCapiEvent(eventName, eventId, enriched);

  const gaSnakeName = String(eventName)
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .toLowerCase();

  pushGtmEvent(gaSnakeName, enriched);
}
