import React, { useState, useMemo, useEffect } from 'react';
import { 
  Filter, Layers, Tag, DollarSign, ChevronDown, ChevronUp, RefreshCw, Sliders, Search, X, Check, ChevronRight,
  Sparkles, Disc, Cpu, Droplet, Wrench, Wind, Box
} from 'lucide-react';
import SearchBar from './SearchBar';
import { buildProductRelationsMap, matchProductWithRelations } from '../utils/productSearch';
import { MACRO_DEPARTMENTS } from '../data/departmentsData';

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

export default function FilterSidebar({
  products,
  categories,
  brands,
  departments = MACRO_DEPARTMENTS,
  selectedCategories,
  setSelectedCategories,
  selectedBrands,
  setSelectedBrands,
  maxPriceFilter,
  setMaxPriceFilter,
  searchTerm,
  setSearchTerm,
  onResetFilters
}) {
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [showAllBrands, setShowAllBrands] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Build bidirectional relation map across all catalog items
  const relationsMap = useMemo(() => {
    return buildProductRelationsMap(products);
  }, [products]);

  // Min and Max price bounds calculated from products with valid prices (> 0)
  const priceBounds = useMemo(() => {
    const validPrices = products.filter(p => p.price > 0).map(p => p.price);
    if (validPrices.length === 0) return { min: 0, max: 100000 };
    return {
      min: Math.min(...validPrices),
      max: Math.max(...validPrices)
    };
  }, [products]);

  const currentMaxPrice = maxPriceFilter !== null ? maxPriceFilter : priceBounds.max;

  // OPTIMIZATION: Single pass pre-evaluation of base matching products (search + price)
  // Instead of recalculating search matching O(categories * products + brands * products) times (~6,000 times),
  // we evaluate each product exactly ONCE, then compute category and brand stats with O(1) hash maps.
  const baseMatchingProducts = useMemo(() => {
    const rawTerm = searchTerm.trim();
    const categoriesMap = new Map((categories || []).map(c => [c.id, c]));
    const brandsMap = new Map((brands || []).map(b => [b.id, b]));

    return (products || []).filter((p) => {
      const matchesPrice = maxPriceFilter === null || (p.price > 0 ? p.price <= maxPriceFilter : true);
      if (!matchesPrice) return false;
      if (!rawTerm) return true;
      return matchProductWithRelations(p, rawTerm, relationsMap, categoriesMap, brandsMap).matches;
    });
  }, [products, searchTerm, maxPriceFilter, relationsMap, categories, brands]);

  // Frequency map of category counts in single pass O(N)
  const categoryCounts = useMemo(() => {
    const counts = new Map();
    for (let i = 0; i < baseMatchingProducts.length; i++) {
      const p = baseMatchingProducts[i];
      if (selectedBrands.length > 0 && !selectedBrands.includes(p.brandId)) continue;
      counts.set(p.categoryId, (counts.get(p.categoryId) || 0) + 1);
    }
    return counts;
  }, [baseMatchingProducts, selectedBrands]);

  // Frequency map of brand counts in single pass O(N)
  const brandCounts = useMemo(() => {
    const counts = new Map();
    for (let i = 0; i < baseMatchingProducts.length; i++) {
      const p = baseMatchingProducts[i];
      if (selectedCategories.length > 0 && !selectedCategories.includes(p.categoryId)) continue;
      counts.set(p.brandId, (counts.get(p.brandId) || 0) + 1);
    }
    return counts;
  }, [baseMatchingProducts, selectedCategories]);

  // Frequency map of total global products per category (independent of current active filters)
  const globalCategoryCounts = useMemo(() => {
    const counts = new Map();
    for (let i = 0; i < (products || []).length; i++) {
      const catId = products[i].categoryId;
      if (catId) counts.set(catId, (counts.get(catId) || 0) + 1);
    }
    return counts;
  }, [products]);

  // Frequency map of total global products per brand (independent of current active filters)
  const globalBrandCounts = useMemo(() => {
    const counts = new Map();
    for (let i = 0; i < (products || []).length; i++) {
      const bId = products[i].brandId;
      if (bId) counts.set(bId, (counts.get(bId) || 0) + 1);
    }
    return counts;
  }, [products]);

  // Compute stats and sorting for CATEGORIES using O(1) count lookups
  const categoryStats = useMemo(() => {
    // Filtra apenas categorias que possuem produtos cadastrados no catálogo geral (ou que estejam selecionadas)
    const validCategories = (categories || []).filter((cat) => {
      const globalTotal = globalCategoryCounts.get(cat.id) || 0;
      return globalTotal > 0 || selectedCategories.includes(cat.id);
    });

    const rawStats = validCategories.map((cat) => {
      const isChecked = selectedCategories.includes(cat.id);
      const matchingCount = categoryCounts.get(cat.id) || 0;
      const isDisabled = matchingCount === 0 && !isChecked;

      return {
        ...cat,
        count: matchingCount,
        isChecked,
        isDisabled
      };
    });

    return [...rawStats].sort((a, b) => {
      if (a.isChecked && !b.isChecked) return -1;
      if (!a.isChecked && b.isChecked) return 1;

      // Primary Rule: Highest product count comes first
      if (b.count !== a.count) return b.count - a.count;

      // Secondary Rule: Custom manual order if set
      const orderA = (a.order !== undefined && a.order > 0) ? a.order : 999;
      const orderB = (b.order !== undefined && b.order > 0) ? b.order : 999;
      if (orderA !== orderB) return orderA - orderB;

      // Fallback: Alphabetical
      return a.name.localeCompare(b.name);
    });
  }, [categories, selectedCategories, categoryCounts, globalCategoryCounts]);

  // Compute stats and sorting for BRANDS using O(1) count lookups
  const brandStats = useMemo(() => {
    // Filtra apenas marcas que possuem produtos cadastrados no catálogo geral (ou que estejam selecionadas)
    const validBrands = (brands || []).filter((b) => {
      const globalTotal = globalBrandCounts.get(b.id) || 0;
      return globalTotal > 0 || selectedBrands.includes(b.id);
    });

    const rawStats = validBrands.map((b) => {
      const isChecked = selectedBrands.includes(b.id);
      const matchingCount = brandCounts.get(b.id) || 0;
      const isDisabled = matchingCount === 0 && !isChecked;

      return {
        ...b,
        count: matchingCount,
        isChecked,
        isDisabled
      };
    });

    return [...rawStats].sort((a, b) => {
      if (a.isChecked && !b.isChecked) return -1;
      if (!a.isChecked && b.isChecked) return 1;

      // Primary Rule: Highest product count comes first
      if (b.count !== a.count) return b.count - a.count;

      // Secondary Rule: Custom manual order if set
      const orderA = (b.order !== undefined && b.order > 0) ? b.order : 999;
      const orderB = (a.order !== undefined && a.order > 0) ? a.order : 999;
      if (orderA !== orderB) return orderA - orderB;

      // Fallback: Alphabetical
      return a.name.localeCompare(b.name);
    });
  }, [brands, selectedBrands, brandCounts, globalBrandCounts]);

  const toggleCategory = (catId) => {
    if (selectedCategories.includes(catId)) {
      setSelectedCategories(selectedCategories.filter(id => id !== catId));
    } else {
      setSelectedCategories([...selectedCategories, catId]);
    }
  };

  const toggleBrand = (brandId) => {
    if (selectedBrands.includes(brandId)) {
      setSelectedBrands(selectedBrands.filter(id => id !== brandId));
    } else {
      setSelectedBrands([...selectedBrands, brandId]);
    }
  };

  // Group categories into Macro-Departments (dynamic by cat.departmentId or default mapping)
  const departmentStats = useMemo(() => {
    const activeDepts = Array.isArray(departments) && departments.length > 0 ? departments : MACRO_DEPARTMENTS;
    return activeDepts.map((dept) => {
      const subcategories = (categoryStats || [])
        .filter(cat => {
          if (cat.departmentId) {
            return cat.departmentId === dept.id;
          }
          return (dept.categoryIds || []).includes(cat.id);
        })
        .sort((a, b) => {
          if (a.isChecked && !b.isChecked) return -1;
          if (!a.isChecked && b.isChecked) return 1;
          return b.count - a.count;
        });

      const totalMatchingCount = subcategories.reduce((acc, c) => acc + (c.count || 0), 0);
      const totalGlobalCount = subcategories.reduce((acc, c) => acc + (globalCategoryCounts.get(c.id) || 0), 0);
      
      const selectedSubcats = subcategories.filter(c => c.isChecked);
      const isSelected = selectedSubcats.length > 0;
      const isAllSelected = subcategories.length > 0 && selectedSubcats.length === subcategories.length;

      return {
        ...dept,
        subcategories,
        totalMatchingCount,
        totalGlobalCount,
        selectedCount: selectedSubcats.length,
        isSelected,
        isAllSelected,
        isDisabled: totalMatchingCount === 0 && !isSelected
      };
    }).filter(d => d.totalGlobalCount > 0 || d.isSelected);
  }, [categoryStats, globalCategoryCounts, departments]);

  const [expandedDeptId, setExpandedDeptId] = useState(() => {
    const activeDepts = Array.isArray(departments) && departments.length > 0 ? departments : MACRO_DEPARTMENTS;
    if (selectedCategories && selectedCategories.length > 0) {
      for (const catId of selectedCategories) {
        const found = activeDepts.find(d => {
          const cat = (categories || []).find(c => c.id === catId);
          if (cat?.departmentId) return cat.departmentId === d.id;
          return (d.categoryIds || []).includes(catId);
        });
        if (found) return found.id;
      }
    }
    return null;
  });

  const toggleDepartmentAccordion = (deptId) => {
    setExpandedDeptId(prev => (prev === deptId ? null : deptId));
  };

  const handleSelectAllDepartment = (dept, e) => {
    e?.stopPropagation();
    const deptCatIds = dept.subcategories.map(c => c.id);
    if (dept.isAllSelected) {
      // Desmarca tudo deste departamento
      setSelectedCategories(selectedCategories.filter(id => !deptCatIds.includes(id)));
    } else {
      // Seleciona tudo deste departamento (abre o macro completo com todos os produtos!)
      const otherSelected = selectedCategories.filter(id => !deptCatIds.includes(id));
      setSelectedCategories([...otherSelected, ...deptCatIds]);
    }
  };

  const handleResetFilters = () => {
    setExpandedDeptId(null);
    onResetFilters();
  };

  const visibleBrands = showAllBrands ? brandStats : brandStats.slice(0, 4);

  const activeFiltersCount = 
    selectedCategories.length + 
    selectedBrands.length + 
    (maxPriceFilter !== null ? 1 : 0) + 
    (searchTerm ? 1 : 0);

  // Exact matching products count based on all active filters
  const totalFilteredCount = useMemo(() => {
    return (baseMatchingProducts || []).filter(p => {
      if (selectedCategories.length > 0 && !selectedCategories.includes(p.categoryId)) return false;
      if (selectedBrands.length > 0 && !selectedBrands.includes(p.brandId)) return false;
      return true;
    }).length;
  }, [baseMatchingProducts, selectedCategories, selectedBrands]);

  // Lock background body scroll on mobile when drawer is open
  useEffect(() => {
    if (isMobileOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isMobileOpen]);

  const filterControls = (
    <div className="space-y-5">
      {/* SEARCH INPUT INSIDE SIDEBAR TOP */}
        <div className="space-y-1 relative z-0">
          <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
            Buscar Equipamento
          </label>
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Digite o nome..."
            variant="sidebar"
          />
        </div>

        <div className="border-t border-slate-100" />

        {/* 1. DEPARTAMENTOS & CATEGORIAS (SIMPLES, TEXTO PEQUENO IGUAL MARCAS) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-900">
            <span className="flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
              <Layers className="w-3.5 h-3.5 text-amber-600" /> Departamentos
            </span>
            {selectedCategories.length > 0 && (
              <span className="text-[10px] font-extrabold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                {selectedCategories.length} sel.
              </span>
            )}
          </div>

          <div className="space-y-1">
            {departmentStats.map((dept) => {
              const isExpanded = expandedDeptId === dept.id;

              return (
                <div key={dept.id} className="space-y-1">
                  {/* Department Row - Simples e limpo igual o nome das marcas */}
                  <div
                    onClick={() => toggleDepartmentAccordion(dept.id)}
                    className={`flex items-center justify-between p-2 rounded-xl text-xs transition-colors cursor-pointer select-none ${
                      dept.isSelected
                        ? 'bg-amber-50/90 text-amber-950 font-bold border border-amber-200'
                        : isExpanded
                        ? 'bg-slate-50 text-slate-900 font-semibold'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <ChevronDown
                        className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${
                          isExpanded ? 'rotate-180 text-amber-700' : ''
                        }`}
                      />
                      <span className="truncate">{dept.shortName}</span>
                    </div>

                    <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded-md shrink-0 ${
                      dept.isSelected ? 'bg-amber-200 text-amber-950' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {dept.totalMatchingCount}
                    </span>
                  </div>

                  {/* Subcategorias Aninhadas (Expandidas) */}
                  {isExpanded && (
                    <div className="pl-3.5 ml-3 space-y-1 border-l-2 border-amber-300/80 py-1">
                      {/* Opção Ver Todos */}
                      <label
                        onClick={(e) => handleSelectAllDepartment(dept, e)}
                        className={`flex items-center justify-between p-1.5 rounded-lg text-xs transition-colors cursor-pointer select-none ${
                          dept.isAllSelected
                            ? 'bg-amber-100 text-amber-950 font-bold'
                            : 'hover:bg-slate-50 text-slate-600'
                        }`}
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          <input
                            type="checkbox"
                            checked={dept.isAllSelected}
                            onChange={() => {}}
                            className="w-3.5 h-3.5 accent-amber-600 rounded border-slate-300 cursor-pointer shrink-0"
                          />
                          <span className="truncate italic">Todos em {dept.shortName}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-semibold">
                          {dept.totalMatchingCount}
                        </span>
                      </label>

                      {/* Subcategorias individuais com texto pequeno e simples */}
                      {dept.subcategories.map((cat) => (
                        <label
                          key={cat.id}
                          className={`flex items-center justify-between p-1.5 rounded-lg text-xs transition-colors cursor-pointer select-none ${
                            cat.isDisabled
                              ? 'opacity-40 cursor-not-allowed text-slate-400'
                              : cat.isChecked
                              ? 'bg-amber-50 text-amber-950 font-bold'
                              : 'hover:bg-slate-50 text-slate-600'
                          }`}
                        >
                          <div className="flex items-center gap-2 overflow-hidden">
                            <input
                              type="checkbox"
                              checked={cat.isChecked}
                              disabled={cat.isDisabled}
                              onChange={() => toggleCategory(cat.id)}
                              className="w-3.5 h-3.5 accent-amber-600 rounded border-slate-300 cursor-pointer disabled:cursor-not-allowed shrink-0"
                            />
                            <span className="truncate">{cat.name}</span>
                          </div>
                          <span className={`text-[10px] px-1 py-0.5 rounded shrink-0 ${
                            cat.isChecked ? 'text-amber-900 font-bold' : 'text-slate-400'
                          }`}>
                            {cat.count}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="border-t border-slate-100" />

        {/* 2. MARCAS */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-900">
            <span className="flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
              <Tag className="w-3.5 h-3.5 text-sky-600" /> Marcas / Fabricantes
            </span>
            {selectedBrands.length > 0 && (
              <span className="text-[10px] font-extrabold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">
                {selectedBrands.length} sel.
              </span>
            )}
          </div>

          <div className={`space-y-1.5 ${showAllBrands ? 'max-h-64 overflow-y-auto pr-1 [scrollbar-width:thin] [scrollbar-color:#cbd5e1_transparent]' : ''}`}>
            {visibleBrands.map((b) => (
              <label
                key={b.id}
                className={`flex items-center justify-between p-2 rounded-xl text-xs transition-colors cursor-pointer select-none ${
                  b.isDisabled 
                    ? 'opacity-40 cursor-not-allowed bg-slate-50 text-slate-400' 
                    : b.isChecked
                    ? 'bg-sky-50/80 text-sky-950 font-bold border border-sky-200'
                    : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <input
                    type="checkbox"
                    checked={b.isChecked}
                    disabled={b.isDisabled}
                    onChange={() => toggleBrand(b.id)}
                    className="w-4 h-4 accent-sky-600 rounded border-slate-300 cursor-pointer disabled:cursor-not-allowed shrink-0"
                  />
                  <span className="truncate">{b.name}</span>
                </div>

                <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded-md ${
                  b.isChecked ? 'bg-sky-200/60 text-sky-900' : 'bg-slate-100 text-slate-500'
                }`}>
                  {b.count}
                </span>
              </label>
            ))}
          </div>

          {brandStats.length > 4 && (
            <button
              onClick={() => setShowAllBrands(!showAllBrands)}
              className="text-[11px] font-bold text-sky-700 hover:text-sky-800 hover:underline flex items-center gap-1 pt-1"
            >
              {showAllBrands ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5" />
                  <span>-- Ver menos --</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5" />
                  <span>-- Ver mais ({brandStats.length - 4}) --</span>
                </>
              )}
            </button>
          )}
        </div>

    </div>
  );

  return (
    <aside className="w-full space-y-6">
      
      {/* ========================================================
          MOBILE ONLY: Trigger Button + KaBuM!-style Slide-over Drawer
          ======================================================== */}
      <div className="block lg:hidden">
        <button
          type="button"
          onClick={() => setIsMobileOpen(true)}
          className="w-full bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl p-3.5 flex items-center justify-between shadow-xs transition-all active:scale-[0.99] cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
              <Sliders className="w-4 h-4" />
            </div>
            <div className="text-left">
              <span className="font-bold text-xs text-slate-900 block leading-tight">
                Filtros do Catálogo
              </span>
              <span className="text-[10px] text-slate-500 font-medium">
                {activeFiltersCount > 0
                  ? `${activeFiltersCount} ${activeFiltersCount === 1 ? 'filtro ativo' : 'filtros ativos'}`
                  : 'Filtrar por departamento, marca ou busca'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activeFiltersCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-amber-600 text-white text-[10px] font-extrabold flex items-center justify-center shadow-xs">
                {activeFiltersCount}
              </span>
            )}
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>
        </button>
      </div>

      {/* MOBILE SLIDE-OVER DRAWER (KA-BUM! STYLE - ALINHADO À ESQUERDA) */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-[120] lg:hidden flex justify-start">
          {/* Backdrop Escurecido com Blur e Animação Fade Suave */}
          <div 
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs animate-backdrop-fade cursor-pointer"
            onClick={() => setIsMobileOpen(false)}
          />

          {/* Drawer Lateral Deslizante da Esquerda */}
          <div 
            className="relative z-10 w-[86vw] max-w-sm sm:max-w-md h-[100dvh] max-h-[100dvh] bg-white shadow-2xl flex flex-col rounded-r-3xl overflow-hidden animate-drawer-slide-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header Fixo */}
            <div className="px-5 py-4 border-b border-slate-200 bg-white flex items-center justify-between shrink-0 shadow-2xs">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-600" />
                <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
                  Filtros
                </h3>
                {activeFiltersCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-extrabold">
                    {activeFiltersCount}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {activeFiltersCount > 0 && (
                  <button
                    onClick={handleResetFilters}
                    className="text-xs font-bold text-amber-700 hover:text-amber-800 hover:underline flex items-center gap-1 mr-1"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Limpar
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsMobileOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  title="Fechar filtros"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Drawer Body Scrollável */}
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5 [scrollbar-width:thin] overscroll-contain">
              {filterControls}
            </div>

            {/* Drawer Footer Fixo Elevado (Evita sobreposição pelo menu inferior mobile) */}
            <div className="p-4 pb-20 sm:pb-5 border-t border-slate-200 bg-white/95 backdrop-blur-md shrink-0 shadow-[0_-8px_20px_rgba(0,0,0,0.06)]">
              <button
                type="button"
                onClick={() => setIsMobileOpen(false)}
                className="w-full btn-gold py-3 text-xs font-bold shadow-md flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer"
              >
                <span>
                  Ver {totalFilteredCount} {totalFilteredCount === 1 ? 'Equipamento' : 'Equipamentos'}
                </span>
                <Check className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          DESKTOP ONLY: Classic Fixed Sidebar (Permanece como está)
          ======================================================== */}
      <div className="hidden lg:block bg-white rounded-2xl border border-slate-200 shadow-xs px-5 pb-5 pt-0 space-y-5 max-h-[calc(100vh-7.5rem)] overflow-y-auto overscroll-contain overflow-x-hidden [scrollbar-width:thin] [scrollbar-color:#cbd5e1_transparent]">
        {/* Sidebar Header - 100% Solid White Sticky Top Covering Full Edge */}
        <div className="sticky top-0 z-50 bg-white pt-5 pb-3 border-b border-slate-200 -mx-5 px-5 rounded-t-2xl flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-amber-600" />
            <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
              Filtros
            </h3>
          </div>

          {activeFiltersCount > 0 && (
            <button
              onClick={handleResetFilters}
              className="text-[11px] font-bold text-amber-700 hover:text-amber-800 hover:underline flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Limpar
            </button>
          )}
        </div>

        {filterControls}
      </div>

    </aside>
  );
}

