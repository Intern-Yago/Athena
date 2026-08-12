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
    <div className="relative bg-slate-950 text-white border-b border-slate-800 py-10 sm:py-12 overflow-hidden shadow-lg">
      
      {/* Background Image with Dark Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/hero-bg.jpg" 
          alt="Oficina Automotiva de Elite" 
          className="w-full h-full object-cover object-center opacity-30 filter brightness-75 scale-105 transition-transform duration-1000"
        />
        {/* Dark Gradient Overlay for perfect readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/85 to-slate-950/90" />
      </div>

      <div className="container-custom relative z-10">
        <div className="max-w-4xl mx-auto space-y-5 text-center">
          
          {/* Header Tagline & Title */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-[11px] font-extrabold tracking-wider uppercase shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin-slow shrink-0" />
              <span>ATHENA SOLUÇÕES AUTOMOTIVAS</span>
            </div>
            
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight drop-shadow-md">
              Catálogo de Equipamentos Automotivos de Elite
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto font-medium">
              Elevadores hidráulicos, scanners de diagnóstico com IA, alinhadores 3D e ferramentas para o seu centro automotivo.
            </p>
          </div>

          {/* Quick Search & Filter Pills */}
          <div className="space-y-3.5 max-w-2xl mx-auto pt-1">
            <div className="relative group w-full">
              <input
                type="text"
                placeholder="Buscar por elevador, scanner, alinhador ou marca (ex: Launch, Engecass)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white text-slate-900 placeholder-slate-400 text-xs sm:text-sm rounded-2xl pl-11 pr-24 py-3.5 shadow-xl border border-amber-400/40 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all outline-none"
              />
              <Search className="w-4 h-4 text-amber-600 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold"
                >
                  Limpar
                </button>
              )}
            </div>

            {/* Quick Filter Pills */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                  selectedCategory === 'all'
                    ? 'bg-amber-600 text-white border-amber-500 shadow-md scale-105'
                    : 'bg-slate-900/80 text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white'
                }`}
              >
                Todas
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                    selectedCategory === cat.id
                      ? 'bg-amber-600 text-white border-amber-500 shadow-md scale-105'
                      : 'bg-slate-900/80 text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white'
                  }`}
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
