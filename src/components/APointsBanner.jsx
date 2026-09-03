import React from 'react';

/**
 * Humanized, clean callout for Athena A-Points.
 * Zero emojis, sober tone, no hardcoded ratios.
 */
export default function APointsBanner({ onNavigate, currentUser }) {
  if (currentUser) {
    return (
      <div className="container-custom py-2">
        <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-slate-700 text-xs">
          <p className="leading-relaxed">
            <strong className="text-slate-900 font-semibold">Programa A-Points:</strong> Suas compras de equipamentos geram pontos que podem ser utilizados em novos pedidos.
          </p>
          <button
            type="button"
            onClick={() => onNavigate('account')}
            className="text-amber-800 font-bold hover:underline shrink-0 cursor-pointer"
          >
            Acessar meus pontos &rarr;
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-2">
      <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-slate-700 text-xs">
        <div className="space-y-0.5">
          <p className="font-bold text-slate-900 text-xs sm:text-sm">
            Programa de Pontos Athena
          </p>
          <p className="text-slate-600 leading-relaxed max-w-2xl">
            Suas compras de equipamentos geram A-Points para você utilizar em futuros pedidos. Crie sua conta para acompanhar seu saldo e resgates.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => onNavigate('login')}
            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg transition-colors cursor-pointer text-xs"
          >
            Criar conta ou entrar
          </button>
        </div>
      </div>
    </div>
  );
}
