import React, { useRef, useEffect } from 'react';
import { Layers, Tag, Grid, ChevronRight, X } from 'lucide-react';

export default function MegaMenu({ type, categories, brands, products, onNavigate, onClose }) {
  const menuRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div className="absolute top-full left-0 right-0 z-50 bg-white border-b border-slate-200 shadow-xl animate-dropdown">
      
      {/* Top Accent Line */}
      <div className={`h-1 w-full ${type === 'categories' ? 'bg-amber-600' : 'bg-sky-600'}`} />

      <div ref={menuRef} className="container-custom py-6">
        
        {/* Header bar inside MegaMenu */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl text-white ${type === 'categories' ? 'bg-amber-600' : 'bg-sky-600'}`}>
              {type === 'categories' ? (
                <Layers className="w-4 h-4" />
              ) : (
                <Tag className="w-4 h-4" />
              )}
            </div>
            <div>
              <span className="font-extrabold text-sm text-slate-900 uppercase tracking-wider block leading-tight">
                {type === 'categories' ? 'Navegar por Categorias' : 'Navegar por Fabricantes'}
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                {type === 'categories' ? 'Selecione uma categoria para visualizar a página dedicada' : 'Explore os fabricantes parceiros da Athena'}
              </span>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <X className="w-4 h-4" /> <span>Fechar</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          
          {/* Main "VER TODOS" Hero Card */}
          <div 
            onClick={() => {
              onNavigate(type === 'categories' ? 'categories' : 'brands');
              onClose();
            }}
            className={`p-6 rounded-2xl text-white cursor-pointer transition-transform hover:-translate-y-0.5 flex flex-col justify-between ${
              type === 'categories' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-sky-600 hover:bg-sky-700'
            }`}
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white">
                <Grid className="w-5 h-5" />
              </div>
              
              <h3 className="font-extrabold text-base leading-snug tracking-tight">
                {type === 'categories' ? 'Ver Todas as Categorias' : 'Ver Todas as Marcas'}
              </h3>
              
              <p className="text-xs text-white/80 leading-relaxed">
                {type === 'categories' 
                  ? 'Explore toda a nossa linha de elevadores, scanners e ferramentas.' 
                  : 'Conheça todos os fabricantes parceiros da Athena Soluções Automotivas.'
                }
              </p>
            </div>

            <div className="pt-6 flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-white">
              <span>Acessar Listagem Geral</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>

          {/* List of Item Cards */}
          <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {type === 'categories' ? (
              categories.map((cat) => {
                const count = products.filter(p => p.categoryId === cat.id).length;
                return (
                  <div
                    key={cat.id}
                    onClick={() => {
                      onNavigate(`categoria/${cat.slug || cat.id}`);
                      onClose();
                    }}
                    className="p-3.5 rounded-xl border border-slate-200 hover:border-amber-400 bg-slate-50 hover:bg-amber-50/60 cursor-pointer transition-colors flex items-center justify-between group"
                  >
                    <div className="space-y-0.5">
                      <h4 className="font-bold text-xs text-slate-900 group-hover:text-amber-700">
                        {cat.name}
                      </h4>
                      <span className="text-[10px] text-slate-500 font-medium block">
                        {count} equipamento(s)
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600" />
                  </div>
                );
              })
            ) : (
              brands.map((b) => {
                const count = products.filter(p => p.brandId === b.id).length;
                return (
                  <div
                    key={b.id}
                    onClick={() => {
                      onNavigate(`marca/${b.slug || b.id}`);
                      onClose();
                    }}
                    className="p-3.5 rounded-xl border border-slate-200 hover:border-sky-400 bg-slate-50 hover:bg-sky-50/60 cursor-pointer transition-colors flex items-center justify-between group"
                  >
                    <div className="space-y-0.5">
                      <h4 className="font-bold text-xs text-slate-900 group-hover:text-sky-700">
                        {b.name}
                      </h4>
                      <span className="text-[10px] text-slate-500 font-medium block">
                        {count} equipamento(s)
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-sky-600" />
                  </div>
                );
              })
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
