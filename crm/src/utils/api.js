/**
 * Centralized API Client for Athena CRM
 * Suporta fallback automático entre Render Backend direto e Vercel Proxy relativo,
 * com injeção automática de Bearer Token.
 */
export const API_BASE_URL = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:3001/api'
  : (import.meta.env.VITE_API_BASE_URL || 'https://athena-backend-hu1m.onrender.com/api');

export async function crmApiFetch(path, options = {}) {
  const token = localStorage.getItem('athena_crm_token') || localStorage.getItem('athena_token') || '';
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  const headers = {
    ...(options.headers || {}),
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };

  const primaryUrl = `${API_BASE_URL}${cleanPath}`;

  try {
    const res = await fetch(primaryUrl, { ...options, headers });
    // Se a URL primária retornar 404 ou 403, tenta a rota relativa /api/...
    if (!res.ok && res.status !== 401 && res.status !== 400) {
      const fallbackUrl = `/api${cleanPath}`;
      const fallbackRes = await fetch(fallbackUrl, { ...options, headers });
      if (fallbackRes.ok) return fallbackRes;
    }
    return res;
  } catch (e) {
    // Se falhar rede na primária, tenta relativa
    const fallbackUrl = `/api${cleanPath}`;
    return fetch(fallbackUrl, { ...options, headers });
  }
}
