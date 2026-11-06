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

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {isCardMode ? (
      <DigitalCardPage />
    ) : (
      <React.Suspense fallback={null}>
        <App />
      </React.Suspense>
    )}
  </React.StrictMode>,
)
