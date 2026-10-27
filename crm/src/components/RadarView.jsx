import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import { 
  RefreshCw, 
  Maximize2, 
  Minimize2, 
  ExternalLink,
  Layers,
  MapPin
} from 'lucide-react';

export default function RadarView({ onConvertWorkshopToLead }) {
  const { isDark } = useTheme();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const iframeRef = useRef(null);
  const containerRef = useRef(null);

  // Sincroniza evento nativo de fullscreen
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const toggleFullscreen = () => {
    try {
      const iframeDoc = iframeRef.current?.contentDocument;
      const mapEl = iframeDoc?.getElementById('mapaDF');
      if (mapEl) {
        if (!document.fullscreenElement && !iframeDoc?.fullscreenElement) {
          const req = mapEl.requestFullscreen || mapEl.webkitRequestFullscreen || mapEl.msRequestFullscreen;
          if (req) {
            req.call(mapEl);
            return;
          }
        } else {
          const exit = document.exitFullscreen || iframeDoc?.exitFullscreen || document.webkitExitFullscreen;
          if (exit) {
            exit.call(iframeDoc?.fullscreenElement ? iframeDoc : document);
            return;
          }
        }
      }
    } catch (e) {
      console.warn("Fullscreen direto no mapa do iframe não permitido, fallback:", e);
    }

    if (!document.fullscreenElement) {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen().catch(() => {
          setIsFullscreen(true);
        });
      } else {
        setIsFullscreen(true);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  // Sincroniza tema com o iframe do radar em tempo real
  useEffect(() => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ 
        type: 'THEME_CHANGE', 
        theme: isDark ? 'dark' : 'light' 
      }, '*');
    }
  }, [isDark]);

  // Escuta atualizações vindas do iframe do radar
  useEffect(() => {
    const handleMessage = (e) => {
      if (e.data && e.data.type === 'RADAR_WORKSHOP_STATUS_CHANGED') {
        if (onConvertWorkshopToLead && e.data.workshop) {
          onConvertWorkshopToLead(e.data.workshop);
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onConvertWorkshopToLead]);

  return (
    <div 
      ref={containerRef}
      className={`flex-1 flex flex-col min-h-0 select-none ${
        isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
      } ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}
    >
      {/* Top Header do Radar */}
      <div className={`px-4 sm:px-6 py-3 border-b flex flex-wrap items-center justify-between gap-3 shrink-0 ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className={`font-black text-sm sm:text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Radar de Expansão DF
            </span>
          </div>
          <span className={`text-xs px-2.5 py-1 rounded-full border font-medium hidden sm:inline-flex items-center gap-1.5 ${
            isDark ? 'bg-slate-800/60 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-600'
          }`}>
            <MapPin className="w-3 h-3 text-emerald-500" />
            9.211 oficinas mapeadas • DF & Região
          </span>
          <span className={`text-xs px-2.5 py-1 rounded-full border font-medium hidden md:inline-flex items-center gap-1.5 ${
            isDark ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
          }`}>
            <Layers className="w-3 h-3 text-emerald-500" />
            Sincronizado ao Funil de Expansão
          </span>
        </div>

        {/* Controles de Ação */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIframeKey(k => k + 1)}
            className={`p-1.5 px-3 rounded-xl border text-xs flex items-center gap-1.5 transition cursor-pointer ${
              isDark 
                ? 'bg-slate-950 text-slate-400 hover:text-white border-slate-800' 
                : 'bg-slate-100 text-slate-700 hover:text-slate-900 border-slate-200'
            }`}
            title="Recarregar Radar"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Recarregar</span>
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            className={`p-1.5 px-3 rounded-xl border text-xs flex items-center gap-1.5 transition cursor-pointer ${
              isDark 
                ? 'bg-slate-950 text-slate-400 hover:text-white border-slate-800' 
                : 'bg-slate-100 text-slate-700 hover:text-slate-900 border-slate-200'
            }`}
            title={isFullscreen ? "Sair da Tela Cheia" : "Tela Cheia"}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isFullscreen ? "Minimizar" : "Tela Cheia"}</span>
          </button>

          <a
            href="/radar.html"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500 text-emerald-500 hover:text-slate-950 font-bold text-xs flex items-center gap-1.5 transition"
            title="Abrir em Nova Aba"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Abrir Aba Cheia</span>
          </a>
        </div>
      </div>

      {/* Conteúdo: Radar Interativo DF Completo */}
      <div className={`flex-1 w-full h-full relative overflow-hidden ${
        isDark ? 'bg-slate-950' : 'bg-slate-100'
      }`}>
        <iframe
          ref={iframeRef}
          key={`${iframeKey}-${isDark ? 'dark' : 'light'}`}
          src={`/radar.html?theme=${isDark ? 'dark' : 'light'}`}
          title="Radar de Expansão de Oficinas DF"
          className="w-full h-full border-0 absolute inset-0"
          loading="lazy"
          allow="fullscreen"
          allowFullScreen
        />
      </div>
    </div>
  );
}
