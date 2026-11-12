import React from 'react'
import ReactDOM from 'react-dom/client'
import DigitalCardPage from './pages/DigitalCardPage'
import { isDigitalCardSubdomain } from './config/digitalCardConfig'
import { lazyWithRetry } from './utils/lazyWithRetry'
import './index.css'

// Lazy-load main catalog App so the NFC Digital Card subdomain (cartao.athenaconsultoria.com.br)
// loads instantaneously without downloading the 1MB catalog bundle.
const App = lazyWithRetry(() => import('./App'))

// Trata erro de chunk dinâmico desatualizado após novo deploy no servidor
window.addEventListener('vite:preloadError', (event) => {
  event.preventDefault();
  const reloadKey = 'vite_chunk_reload_attempt';
  const lastReload = sessionStorage.getItem(reloadKey);
  const now = Date.now();
  if (!lastReload || now - parseInt(lastReload, 10) > 15000) {
    sessionStorage.setItem(reloadKey, String(now));
    window.location.reload();
  }
});

const isCardMode = isDigitalCardSubdomain();
const rootElement = document.getElementById('root');

const appContent = (
  <React.StrictMode>
    {isCardMode ? (
      <DigitalCardPage />
    ) : (
      <React.Suspense fallback={null}>
        <App />
      </React.Suspense>
    )}
  </React.StrictMode>
);

// Decisão Arquitetural de Hidratação (Requisito 6):
// Se o container #root contiver nós filhos pré-renderizados pelo Edge Serverless / SSR do Blog
// (identificado pelo atributo data-ssr="true" ou window.__ATHENA_SSR__), utilizamos hydrateRoot para preservar o DOM e evitar CLS.
// Caso contrário (modo SPA cliente tradicional com fallback SEO estático no index.html), utilizamos createRoot.
const hasSsrContent = Boolean(
  rootElement && (
    rootElement.getAttribute('data-ssr') === 'true' || 
    (typeof window !== 'undefined' && window.__ATHENA_SSR__ === true)
  )
);

if (rootElement && hasSsrContent) {
  ReactDOM.hydrateRoot(rootElement, appContent);
} else if (rootElement) {
  ReactDOM.createRoot(rootElement).render(appContent);
}
