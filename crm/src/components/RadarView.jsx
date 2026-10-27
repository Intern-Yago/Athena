import React, { useState } from 'react';
import { ExternalLink, RefreshCw, MapPin, Maximize2, Minimize2 } from 'lucide-react';

export default function RadarView() {
  const [iframeKey, setIframeKey] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  return (
    <div className={`flex-1 flex flex-col min-h-0 bg-slate-950 ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Control bar */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4 shrink-0 select-none">
        <div className="flex items-center gap-2 text-xs">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-bold text-white">Radar de Expansão DF</span>
          <span className="text-slate-400 hidden sm:inline">• 9.212 Oficinas Mapeadas com Metas por Região Administrativa</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIframeKey(k => k + 1)}
            className="p-1.5 rounded-lg bg-slate-950 text-slate-400 hover:text-white border border-slate-800 transition cursor-pointer text-xs flex items-center gap-1.5"
            title="Recarregar Mapa"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Recarregar</span>
          </button>

          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg bg-slate-950 text-slate-400 hover:text-white border border-slate-800 transition cursor-pointer text-xs flex items-center gap-1.5"
            title={isFullscreen ? "Sair da Tela Cheia" : "Tela Cheia"}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isFullscreen ? "Minimizar" : "Tela Cheia"}</span>
          </button>

          <a
            href="/radar.html"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500 text-amber-400 hover:text-slate-950 font-bold text-xs flex items-center gap-1.5 transition"
            title="Abrir em Nova Aba"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Abrir Separado</span>
          </a>
        </div>
      </div>

      {/* Embedded Iframe */}
      <div className="flex-1 w-full h-full relative bg-slate-950 overflow-hidden">
        <iframe
          key={iframeKey}
          src="/radar.html"
          title="Radar de Expansão de Oficinas DF"
          className="w-full h-full border-0 absolute inset-0"
          loading="lazy"
        />
      </div>
    </div>
  );
}
