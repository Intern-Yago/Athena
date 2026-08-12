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
      
      {/* Background Image with Crisp Visibility Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/hero-bg.jpg" 
          alt="Oficina Automotiva Athena" 
          className="w-full h-full object-cover object-center opacity-65 filter brightness-90 scale-105 transition-transform duration-1000"
        />
        {/* Soft Contrast Overlay to enhance image visibility & keep text crisp */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/50 to-slate-950/85" />
      </div>

      <div className="container-custom relative z-10">
        <div className="max-w-4xl mx-auto space-y-5 text-center">
          
          {/* Header Tagline & Title */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/30 text-amber-300 border border-amber-400/40 text-[11px] font-extrabold tracking-wider uppercase shadow-md backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin-slow shrink-0" />
              <span>ATHENA SOLUÇÕES AUTOMOTIVAS</span>
            </div>
            
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
              Catálogo de Equipamentos Automotivos
            </h1>
            <p className="text-xs sm:text-sm text-slate-100 max-w-xl mx-auto font-semibold drop-shadow-md">
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
                className="w-full bg-white text-slate-900 placeholder-slate-500 text-xs sm:text-sm rounded-2xl pl-11 pr-24 py-3.5 shadow-2xl border-2 border-amber-400/60 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30 transition-all outline-none"
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
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border shadow-sm ${
                  selectedCategory === 'all'
                    ? 'bg-amber-600 text-white border-amber-400 shadow-md scale-105'
                    : 'bg-slate-900/90 text-white border-slate-700 hover:bg-slate-800 hover:border-amber-400'
                }`}
              >
                Todas
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border shadow-sm ${
                    selectedCategory === cat.id
                      ? 'bg-amber-600 text-white border-amber-400 shadow-md scale-105'
                      : 'bg-slate-900/90 text-white border-slate-700 hover:bg-slate-800 hover:border-amber-400'
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
