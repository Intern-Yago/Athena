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
    <div className="relative bg-slate-950 text-white border-b border-slate-800 py-8 sm:py-12 overflow-hidden shadow-lg">
      
      {/* Background Image with High Visibility */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/hero-bg.jpg" 
          alt="Oficina Automotiva Athena" 
          className="w-full h-full object-cover object-center opacity-80 filter brightness-95 contrast-105 scale-105 transition-transform duration-1000"
        />
        {/* Soft Contrast Overlay for Image Depth & Text Legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/35 to-slate-950/70" />
      </div>

      <div className="container-custom relative z-10">
        <div className="max-w-4xl mx-auto space-y-4 text-center">
          
          {/* Header Title with Special Class .hero-catalog-title (No capsule wrapper) */}
          <div className="space-y-2">
            <h1 className="hero-catalog-title text-2xl sm:text-4xl font-black tracking-tight">
              Catálogo de Equipamentos Automotivos
            </h1>

            <p className="text-xs sm:text-sm text-slate-200 max-w-xl mx-auto font-semibold drop-shadow-md">
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
