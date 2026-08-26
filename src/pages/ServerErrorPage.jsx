import React from 'react';
import { RefreshCw, Home, AlertTriangle, MessageCircle, ShieldAlert } from 'lucide-react';

export default function ServerErrorPage({ onNavigate, onRetry, errorDetails }) {
  return (
    <div className="min-h-[70vh] flex items-center justify-center py-16 px-4">
      <div className="max-w-xl w-full text-center space-y-6 bg-white p-8 sm:p-12 rounded-3xl border border-red-200 shadow-xl relative overflow-hidden">
        
        {/* Ambient Top Red Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-red-400/10 rounded-full blur-3xl pointer-events-none" />

        {/* 500 Visual Badge */}
        <div className="space-y-2 relative">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-red-50 border border-red-200 flex items-center justify-center shadow-xs">
            <span className="text-3xl font-extrabold text-red-600">500</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-bold border border-red-200">
            <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
            <span>Erro Interno no Servidor</span>
          </div>
        </div>

        {/* Text Content */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Instabilidade Temporária
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
            Não se preocupe! Nossos serviços já registraram o ocorrido. O banco de dados local continuará atendendo enquanto reestabelecemos a conexão.
          </p>
        </div>

        {errorDetails && (
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-left max-h-32 overflow-y-auto">
            <p className="text-[11px] font-mono text-slate-500 break-all">{String(errorDetails)}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3 flex-wrap">
          <button
            onClick={() => {
              if (onRetry) onRetry();
              else window.location.reload();
            }}
            className="btn-gold w-full sm:w-auto px-6 py-3 text-xs font-bold flex items-center justify-center gap-2 shadow-md"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Tentar Novamente</span>
          </button>

          <button
            onClick={() => {
              try {
                localStorage.removeItem('athena_products');
              } catch (e) {}
              window.location.reload();
            }}
            className="btn-secondary w-full sm:w-auto px-5 py-3 text-xs font-bold flex items-center justify-center gap-2 border-amber-300 text-amber-900 bg-amber-50 hover:bg-amber-100"
            title="Libera a memória temporária do navegador e recarrega o catálogo"
          >
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <span>Recuperar Memória Local</span>
          </button>

          <button
            onClick={() => onNavigate ? onNavigate('catalog') : (window.location.href = '/')}
            className="btn-secondary w-full sm:w-auto px-5 py-3 text-xs font-bold flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>Voltar ao Início</span>
          </button>
        </div>

        {/* Support Help */}
        <div className="pt-6 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-500">
          <span>Precisa de suporte imediato?</span>
          <a
            href="https://wa.me/5511999999999?text=Ol%C3%A1%2C%20estou%20com%20uma%20d%C3%BAvida%20sobre%20o%20cat%C3%A1logo%20Athena."
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-700 font-bold hover:underline inline-flex items-center gap-1"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-600" /> WhatsApp
          </a>
        </div>

      </div>
    </div>
  );
}
