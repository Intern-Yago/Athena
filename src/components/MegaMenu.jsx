import React, { useRef, useEffect, useState, useMemo } from 'react';
import { 
  Layers, 
  Tag, 
  Grid, 
  ChevronRight, 
  X, 
  Search, 
  Sparkles, 
  Disc, 
  Cpu, 
  Droplet, 
  Wrench, 
  Wind, 
  Box, 
  ArrowRight
} from 'lucide-react';
import { MACRO_DEPARTMENTS, getCategoriesForDepartment } from '../data/departmentsData';
import { isProductPublished } from '../utils/imageUrl';

// Icon resolver map for macro departments
const DEPT_ICONS = {
  Sparkles,
  Disc,
  Layers,
  Cpu,
  Droplet,
  Wrench,
  Wind,
  Box
};

export default function MegaMenu({ type, categories, brands, products, onNavigate, onClose }) {
  const menuRef = useRef(null);
  const [activeDeptId, setActiveDeptId] = useState('dept_elevacao_pesada');
  const [searchTerm, setSearchTerm] = useState('');

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

  // Compute published products count per category
  const publishedProducts = useMemo(() => {
    return (products || []).filter(isProductPublished);
  }, [products]);

  const categoryCounts = useMemo(() => {
    const map = new Map();
    publishedProducts.forEach((p) => {
      if (p.categoryId) {
        map.set(p.categoryId, (map.get(p.categoryId) || 0) + 1);
      }
    });
    return map;
  }, [publishedProducts]);

  // Attach categories & totals to each department
  const departmentsWithData = useMemo(() => {
    return MACRO_DEPARTMENTS.map((dept) => {
      const deptCats = getCategoriesForDepartment(dept.id, categories, MACRO_DEPARTMENTS);
      const totalEquip = deptCats.reduce((acc, cat) => acc + (categoryCounts.get(cat.id) || 0), 0);
      return {
        ...dept,
        categories: deptCats,
        totalEquipment: totalEquip
      };
    });
  }, [categories, categoryCounts]);

  // Current active department
  const currentDept = useMemo(() => {
    return departmentsWithData.find((d) => d.id === activeDeptId) || departmentsWithData[0] || null;
  }, [departmentsWithData, activeDeptId]);

  // Filtered categories when user is searching inside the menu
  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return null;
    const term = searchTerm.toLowerCase().trim();
    return (categories || []).filter((cat) => 
      cat.name?.toLowerCase().includes(term) || 
      cat.slug?.toLowerCase().includes(term)
    );
  }, [categories, searchTerm]);

  // ==========================================================
  // RENDER: BRANDS MENU (Preserved as requested)
  // ==========================================================
  if (type === 'brands') {
    return (
      <div className="absolute top-full left-0 right-0 z-50 bg-white border-b border-slate-200 shadow-2xl animate-dropdown max-h-[calc(100vh-120px)] overflow-y-auto">
        <div className="h-1 w-full bg-sky-600" />
        <div ref={menuRef} className="container-custom py-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl text-white bg-sky-600">
                <Tag className="w-4 h-4" />
              </div>
              <div>
                <span className="font-extrabold text-sm text-slate-900 uppercase tracking-wider block leading-tight">
                  Navegar por Fabricantes
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  Explore os fabricantes parceiros da Athena Soluções Automotivas
                </span>
              </div>
            </div>

            <button 
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <X className="w-4 h-4" /> <span>Fechar</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            <div 
              onClick={() => {
                onNavigate('brands');
                onClose();
              }}
              className="p-6 rounded-2xl text-white cursor-pointer transition-transform hover:-translate-y-0.5 flex flex-col justify-between bg-sky-600 hover:bg-sky-700"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white">
                  <Grid className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-base leading-snug tracking-tight">
                  Ver Todas as Marcas
                </h3>
                <p className="text-xs text-white/80 leading-relaxed">
                  Conheça todos os fabricantes parceiros da Athena Soluções Automotivas.
                </p>
              </div>

              <div className="pt-6 flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-white">
                <span>Acessar Listagem Geral</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>

            <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {(brands || [])
                .filter((b) => (products || []).some((p) => p.brandId === b.id && isProductPublished(p)))
                .map((b) => {
                  const count = (products || []).filter(p => p.brandId === b.id && isProductPublished(p)).length;
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
                })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================
  // RENDER: CATEGORIES MENU (Split-Pane Macro Departments)
  // ==========================================================
  return (
    <div className="absolute top-full left-0 right-0 z-50 bg-white border-b border-slate-200 shadow-2xl animate-dropdown max-h-[calc(100vh-120px)] flex flex-col overflow-hidden">
      
      {/* Top Accent Line */}
      <div className="h-1 w-full bg-amber-600 shrink-0" />

      <div ref={menuRef} className="container-custom py-4 flex flex-col flex-1 min-h-0 overflow-hidden">
        
        {/* Header bar with Quick Search Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 mb-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl text-white bg-amber-600 shrink-0 shadow-xs">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <span className="font-black text-sm text-slate-900 uppercase tracking-wider block leading-tight">
                Departamentos & Categorias
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                Navegue pelas 8 famílias técnicas de equipamentos e ferramentas
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Filter Input */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filtrar categorias..."
                className="w-full pl-8 pr-7 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-hidden transition-all text-slate-800 placeholder-slate-400"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button 
              onClick={() => {
                onNavigate('categories');
                onClose();
              }}
              className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100/80 text-amber-900 border border-amber-200 text-xs font-bold transition-colors hidden md:flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <Grid className="w-3.5 h-3.5 text-amber-700" />
              <span>Ver Catálogo Geral</span>
            </button>

            <button 
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <X className="w-4 h-4" /> <span>Fechar</span>
            </button>
          </div>
        </div>

        {/* Main Split-Pane Body */}
        {searchResults !== null ? (
          // Search Results Mode
          <div className="flex-1 overflow-y-auto pr-1 space-y-3 min-h-[300px]">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
              <span>Resultados para "{searchTerm}" ({searchResults.length} encontradas):</span>
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="text-amber-700 hover:underline text-xs font-bold"
              >
                Limpar filtro
              </button>
            </div>
            
            {searchResults.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <p className="text-xs">Nenhuma categoria encontrada com esse termo.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
                {searchResults.map((cat) => {
                  const count = categoryCounts.get(cat.id) || 0;
                  return (
                    <div
                      key={cat.id}
                      onClick={() => {
                        onNavigate(`categoria/${cat.slug || cat.id}`);
                        onClose();
                      }}
                      className="p-3 rounded-xl border border-slate-200 hover:border-amber-400 bg-slate-50/70 hover:bg-amber-50/50 cursor-pointer transition-all flex items-center justify-between group shadow-2xs"
                    >
                      <div className="min-w-0 pr-2">
                        <h4 className="font-bold text-xs text-slate-800 group-hover:text-amber-700 truncate">
                          {cat.name}
                        </h4>
                        <span className="text-[10px] text-slate-500 font-medium block">
                          {count} {count === 1 ? 'equipamento' : 'equipamentos'}
                        </span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-amber-600 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          // Split-Pane: 8 Macro Departments on Left | Categories Grid on Right
          <div className="flex-1 flex flex-col md:flex-row gap-4 min-h-0 overflow-hidden">
            
            {/* Left Sidebar: 8 Macro-Departments */}
            <div className="w-full md:w-80 shrink-0 border-b md:border-b-0 md:border-r border-slate-100 pr-0 md:pr-3 overflow-y-auto max-h-48 md:max-h-full space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-3 py-1 block">
                Macro-Departamentos
              </span>
              
              {departmentsWithData.map((dept) => {
                const IconComponent = DEPT_ICONS[dept.icon] || Layers;
                const isActive = dept.id === activeDeptId;

                return (
                  <button
                    key={dept.id}
                    type="button"
                    onMouseEnter={() => setActiveDeptId(dept.id)}
                    onClick={() => setActiveDeptId(dept.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl transition-all flex items-center justify-between group cursor-pointer ${
                      isActive 
                        ? 'bg-amber-50 text-amber-950 font-bold border-l-4 border-amber-600 shadow-2xs' 
                        : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`p-1.5 rounded-lg shrink-0 transition-colors ${
                        isActive 
                          ? 'bg-amber-600 text-white shadow-2xs' 
                          : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                      }`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className={`text-xs truncate leading-tight ${isActive ? 'font-black text-amber-950' : 'font-bold text-slate-800'}`}>
                          {dept.shortName || dept.name}
                        </p>
                        <span className="text-[10px] text-slate-500 font-medium block">
                          {dept.categories.length} categorias • {dept.totalEquipment} equip.
                        </span>
                      </div>
                    </div>
                    <ChevronRight className={`w-3.5 h-3.5 shrink-0 transition-transform ${
                      isActive ? 'text-amber-700 translate-x-0.5' : 'text-slate-300 group-hover:text-slate-500'
                    }`} />
                  </button>
                );
              })}
            </div>

            {/* Right Pane: Specific Categories of Active Department */}
            <div className="flex-1 flex flex-col min-h-0 overflow-y-auto pl-0 md:pl-2 pr-1">
              {currentDept && (
                <>
                  {/* Department Banner Header */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 mb-3 shrink-0">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black uppercase tracking-wider text-amber-700">
                          {currentDept.shortName || currentDept.name}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                          {currentDept.categories.length} categorias
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 max-w-xl line-clamp-1">
                        {currentDept.description}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        onNavigate('categories');
                        onClose();
                      }}
                      className="text-xs font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1 shrink-0 cursor-pointer hover:underline"
                    >
                      <span>Ver todas as categorias</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Categories Grid (2 to 3 cols, compact and clean) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pb-2">
                    {currentDept.categories.map((cat) => {
                      const count = categoryCounts.get(cat.id) || 0;
                      return (
                        <div
                          key={cat.id}
                          onClick={() => {
                            onNavigate(`categoria/${cat.slug || cat.id}`);
                            onClose();
                          }}
                          className="p-3 rounded-xl border border-slate-200/90 hover:border-amber-500 bg-white hover:bg-amber-50/40 cursor-pointer transition-all flex items-center justify-between group shadow-2xs hover:shadow-xs"
                        >
                          <div className="space-y-0.5 min-w-0 pr-2">
                            <h4 className="font-bold text-xs text-slate-900 group-hover:text-amber-700 truncate leading-snug">
                              {cat.name}
                            </h4>
                            <span className="text-[10px] text-slate-500 font-medium block">
                              {count} {count === 1 ? 'equipamento' : 'equipamentos'}
                            </span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-amber-600 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
