import React from 'react';
import { ArrowLeftRight, X, Sparkles, Trash2, Eye } from 'lucide-react';

export default function ComparisonFloatingBar({
  comparisonList,
  onOpenModal,
  onRemoveItem,
  onClearComparison
}) {
  if (!comparisonList || comparisonList.length === 0) return null;

  const canCompare = comparisonList.length >= 2;

  return (
    <div className="fixed bottom-16 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-2xl animate-fade-in-up">
      <div className="bg-slate-950/95 backdrop-blur-md text-white p-3 sm:p-4 rounded-2xl sm:rounded-3xl border border-amber-500/40 shadow-2xl flex items-center justify-between gap-3">
        
        {/* Left: Indicator & Thumbnails */}
        <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto">
          <div className="hidden sm:flex items-center justify-center p-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold shrink-0">
            <ArrowLeftRight className="w-5 h-5" />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {comparisonList.map((prod) => (
              <div
                key={prod.id}
                className="relative group w-10 h-10 sm:w-12 sm:h-12 rounded-xl overflow-hidden bg-slate-800 border border-slate-700 shrink-0"
              >
                <img
                  src={prod.image || 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=200&auto=format&fit=crop&q=80'}
                  alt={prod.name}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => onRemoveItem(prod.id)}
                  className="absolute inset-0 bg-red-600/85 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remover"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {/* Empty Slots */}
            {Array.from({ length: 3 - comparisonList.length }).map((_, idx) => (
              <div
                key={idx}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl border border-dashed border-slate-700 flex items-center justify-center text-[10px] text-slate-500 shrink-0"
              >
                +{idx + 1}
              </div>
            ))}
          </div>

          <div className="hidden md:block">
            <p className="text-xs font-bold text-slate-200">
              Comparador ({comparisonList.length}/3)
            </p>
            <p className="text-[10px] text-slate-400">
              {canCompare ? 'Pronto para comparar!' : 'Selecione mais 1 para comparar'}
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onClearComparison}
            className="p-2 sm:px-3 sm:py-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors text-xs font-medium flex items-center gap-1"
            title="Limpar todos"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Limpar</span>
          </button>

          <button
            onClick={onOpenModal}
            disabled={!canCompare}
            className={`px-3.5 sm:px-5 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm flex items-center gap-1.5 shadow-md transition-all ${
              canCompare
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 cursor-pointer active:scale-95'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-60'
            }`}
          >
            <ArrowLeftRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Comparar Agora</span>
          </button>
        </div>

      </div>
    </div>
  );
}
