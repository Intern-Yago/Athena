import React from 'react';
import { Search, Sparkles, Layers, ShieldCheck, Truck, Wrench } from 'lucide-react';

export default function HeroSlim({ 
  searchTerm, 
  setSearchTerm, 
  categories, 
  selectedCategory, 
  setSelectedCategory 
}) {
  return (
    <div className="bg-gradient-to-b from-slate-100/90 via-slate-50 to-slate-100/60 border-b border-slate-200/80 py-8">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto space-y-4 text-center">
          
          {/* Header tagline & title in slim compact format */}
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-amber-200 text-amber-900 text-[11px] font-bold shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-spin-slow shrink-0" />
              <span>ATHENA SOLUÇÕES AUTOMOTIVAS</span>
            </div>
            
            <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Catálogo de Equipamentos Automotivos de Elite
            </h1>
          </div>

          {/* Quick Search & Filter Pills */}
          <div className="space-y-3 max-w-2xl mx-auto">
            <div className="relative group w-full">
              <input
                type="text"
                placeholder="Buscar por elevador, scanner, alinhador ou marca (ex: Launch, Engecass)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-slate-300 focus:border-amber-500 text-slate-900 placeholder-slate-400 text-xs sm:text-sm rounded-xl pl-11 pr-24 py-3 shadow-sm transition-all outline-none"
              />
              <Search className="w-4 h-4 text-amber-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                >
                  Limpar
                </button>
              )}
            </div>

            {/* Quick Filter Pills */}
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`chip-category ${selectedCategory === 'all' ? 'active' : ''}`}
              >
                Todas
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`chip-category ${selectedCategory === cat.id ? 'active' : ''}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
