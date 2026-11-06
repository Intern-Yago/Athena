import React from 'react';
import { ShieldCheck, Truck, Wrench, Award, Sparkles, Layers } from 'lucide-react';
import SearchBar from './SearchBar';

export default function Hero({ 
  searchTerm, 
  setSearchTerm, 
  categories, 
  selectedCategory, 
  setSelectedCategory 
}) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-slate-100/90 via-slate-50 to-slate-100/60 border-b border-slate-200/80 py-12 md:py-16">
      
      <div className="container-custom relative z-10">
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center justify-center space-y-6">
          
          {/* Top Pill Badge */}
          <div className="inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-white border border-amber-200 text-amber-900 text-xs font-bold tracking-wide shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-spin-slow shrink-0" />
            <span>ATHENA SOLUÇÕES AUTOMOTIVAS</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-600 font-medium">Catálogo Oficial de Equipamentos</span>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Equipamentos de Alta Performance para <span className="bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 bg-clip-text text-transparent">Sua Oficina</span>
          </h1>

          {/* Description */}
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Elevadores, scanners de diagnóstico com Inteligência Artificial, alinhadores 3D, desmontadoras e ferramentas das melhores marcas do mercado automotivo.
          </p>

          {/* Search Box & Category Filters Container */}
          <div className="pt-2 w-full max-w-2xl mx-auto space-y-5">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              variant="hero"
            />

            {/* Category Filter Chips */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3 w-full">
              <div className="flex items-center justify-between text-xs font-bold text-slate-600 px-1">
                <span className="flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                  <Layers className="w-4 h-4 text-amber-600 shrink-0" /> Categorias Principais
                </span>
                {selectedCategory !== 'all' && (
                  <button 
                    onClick={() => setSelectedCategory('all')} 
                    className="text-amber-600 hover:underline text-[11px] font-bold"
                  >
                    Mostrar Todas
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 w-full">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`chip-category ${selectedCategory === 'all' ? 'active' : ''}`}
                >
                  Todas as Categorias
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

          {/* Trust Highlights Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-slate-200/80 mt-8 text-left w-full">
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-xs">
              <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Garantia de Fábrica</h4>
                <p className="text-[11px] text-slate-500">Produtos homologados</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-xs">
              <div className="p-2.5 rounded-xl bg-sky-50 text-sky-600 shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Entrega Nacional</h4>
                <p className="text-[11px] text-slate-500">Envio para todo o Brasil</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-xs">
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Suporte Técnico</h4>
                <p className="text-[11px] text-slate-500">Treinamento & Instalação</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-xs">
              <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Condições Especiais</h4>
                <p className="text-[11px] text-slate-500">Financiamento facilitado</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
