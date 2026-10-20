/**
 * adminDataCache.js
 *
 * Camada de Cache Stale-While-Revalidate (SWR) para o Painel Operacional (Athena OS).
 * Evita telas vazias ("flash de carregamento") e requisições redundantes ao alternar
 * entre abas de Vendas & Pedidos, Mesa de Expedição e Omie ERP.
 *
 * Arquitetura em 2 níveis:
 * - L1 (Memória RAM / Map): Acesso instantâneo (0ms) durante a navegação SPA.
 * - L2 (sessionStorage): Preserva o estado instantâneo mesmo após F5 na aba do navegador.
 */

const CACHE_PREFIX = 'athena_admin_cache_v1:';
const FRESH_TTL_MS = 60 * 1000; // 60 segundos considerado "fresco" (evita re-fetch automático)
const MAX_STALE_AGE_MS = 30 * 60 * 1000; // 30 minutos de retenção máxima para renderização imediata

const memoryStore = new Map();
const inflightRequests = new Map();

export const ADMIN_CACHE_KEYS = {
  FULFILLMENT_KANBAN: 'fulfillment_kanban',
  ADMIN_ORDERS: 'admin_orders',
  DIGITAL_ACTIVATIONS: 'digital_activations',
  OMIE_SYNC_STATUS: 'omie_sync_status'
};

/**
 * Lê um item do cache (L1 Memória -> L2 sessionStorage).
 *
 * @param {string} key - Chave de cache (use ADMIN_CACHE_KEYS)
 * @returns {{ data: any, timestamp: number, isFresh: boolean } | null}
 */
export function getCachedAdminData(key) {
  const now = Date.now();

  if (memoryStore.has(key)) {
    const entry = memoryStore.get(key);
    if (now - entry.timestamp <= MAX_STALE_AGE_MS) {
      return {
        data: entry.data,
        timestamp: entry.timestamp,
        isFresh: now - entry.timestamp <= FRESH_TTL_MS
      };
    }
    memoryStore.delete(key);
  }

  if (typeof window !== 'undefined' && window.sessionStorage) {
    try {
      const raw = window.sessionStorage.getItem(`${CACHE_PREFIX}${key}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.timestamp && now - parsed.timestamp <= MAX_STALE_AGE_MS) {
          memoryStore.set(key, parsed);
          return {
            data: parsed.data,
            timestamp: parsed.timestamp,
            isFresh: now - parsed.timestamp <= FRESH_TTL_MS
          };
        } else {
          window.sessionStorage.removeItem(`${CACHE_PREFIX}${key}`);
        }
      }
    } catch (_) {
      // Ignora erros de parse ou quota de sessionStorage
    }
  }

  return null;
}

/**
 * Grava dados no cache L1 (Memória) e L2 (sessionStorage).
 *
 * @param {string} key - Chave de cache
 * @param {any} data - Payload a ser armazenado
 */
export function setCachedAdminData(key, data) {
  const entry = {
    data,
    timestamp: Date.now()
  };

  memoryStore.set(key, entry);

  if (typeof window !== 'undefined' && window.sessionStorage) {
    try {
      window.sessionStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(entry));
    } catch (_) {
      // Caso exceda quota do sessionStorage, mantém apenas em L1 (memória)
    }
  }
}

/**
 * Invalida uma ou mais chaves de cache (ex: após movimentação de card ou despacho).
 *
 * @param {string | string[]} keys - Chave(s) a invalidar
 */
export function invalidateAdminCache(keys) {
  const list = Array.isArray(keys) ? keys : [keys];
  for (const key of list) {
    memoryStore.delete(key);
    if (typeof window !== 'undefined' && window.sessionStorage) {
      try {
        window.sessionStorage.removeItem(`${CACHE_PREFIX}${key}`);
      } catch (_) {}
    }
  }
}

/**
 * Executa fetch deduplicado (evita disparos concorrentes idênticos) e salva no cache.
 *
 * @param {string} cacheKey - Chave do cache
 * @param {string} url - Endpoint HTTP
 * @param {string} token - JWT Bearer Token
 * @param {(json: any) => any} transform - Transformação opcional antes de salvar no cache
 * @returns {Promise<any>}
 */
export async function fetchAndCacheAdminData(cacheKey, url, token, transform = (d) => d) {
  const requestKey = `${cacheKey}:${url}`;
  if (inflightRequests.has(requestKey)) {
    return inflightRequests.get(requestKey);
  }

  const promise = (async () => {
    try {
      const res = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const json = await res.json();
      const processed = transform(json);
      setCachedAdminData(cacheKey, processed);
      return processed;
    } finally {
      inflightRequests.delete(requestKey);
    }
  })();

  inflightRequests.set(requestKey, promise);
  return promise;
}

/**
 * Faz o pré-carregamento (warm-up) silencioso das abas operacionais (Kanban de Expedição e Pedidos)
 * assim que o painel administrativo é aberto, para que o clique na aba seja instantâneo.
 *
 * @param {string} apiBaseUrl
 * @param {string} token
 */
export function preloadAdminOperationalData(apiBaseUrl, token) {
  if (!apiBaseUrl || !token) return;

  const cachedKanban = getCachedAdminData(ADMIN_CACHE_KEYS.FULFILLMENT_KANBAN);
  if (!cachedKanban || !cachedKanban.isFresh) {
    fetchAndCacheAdminData(
      ADMIN_CACHE_KEYS.FULFILLMENT_KANBAN,
      `${apiBaseUrl}/admin/fulfillment/kanban`,
      token,
      (data) => {
        if (data?.digital_activations) {
          setCachedAdminData(ADMIN_CACHE_KEYS.DIGITAL_ACTIVATIONS, data.digital_activations);
        }
        return data?.physical_kanban || {
          pending: [],
          picking: [],
          ready: [],
          shipped: [],
          delivered: []
        };
      }
    ).catch(() => {});
  }

  const cachedOrders = getCachedAdminData(ADMIN_CACHE_KEYS.ADMIN_ORDERS);
  if (!cachedOrders || !cachedOrders.isFresh) {
    fetchAndCacheAdminData(
      ADMIN_CACHE_KEYS.ADMIN_ORDERS,
      `${apiBaseUrl}/admin/orders`,
      token,
      (data) => ({
        orders: data?.orders || [],
        metrics: data?.metrics || null
      })
    ).catch(() => {});
  }
}
