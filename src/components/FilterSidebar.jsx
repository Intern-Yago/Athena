import React, { useState, useMemo } from 'react';
import { Filter, Layers, Tag, DollarSign, ChevronDown, ChevronUp, RefreshCw, Sliders, Search, X } from 'lucide-react';

export default function FilterSidebar({
  products,
  categories,
  brands,
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

  // DYNAMIC CROSS-FILTER ENGINE
  const matchesBase = (p) => {
    const matchesSearch = !searchTerm || 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.specs && p.specs.some(s => s.toLowerCase().includes(searchTerm.toLowerCase())));

    const matchesPrice = maxPriceFilter === null || (p.price > 0 ? p.price <= maxPriceFilter : true);

    return matchesSearch && matchesPrice;
  };

  // Compute stats and sorting for CATEGORIES
  const categoryStats = useMemo(() => {
    const rawStats = categories.map((cat) => {
      const isChecked = selectedCategories.includes(cat.id);

      const matchingCount = products.filter((p) => {
        if (!matchesBase(p)) return false;
        if (selectedBrands.length > 0 && !selectedBrands.includes(p.brandId)) return false;
        return p.categoryId === cat.id;
      }).length;

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
  }, [categories, products, selectedCategories, selectedBrands, maxPriceFilter, searchTerm]);

  // Compute stats and sorting for BRANDS
  const brandStats = useMemo(() => {
    const rawStats = brands.map((b) => {
      const isChecked = selectedBrands.includes(b.id);

      const matchingCount = products.filter((p) => {
        if (!matchesBase(p)) return false;
        if (selectedCategories.length > 0 && !selectedCategories.includes(p.categoryId)) return false;
        return p.brandId === b.id;
      }).length;

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
  }, [brands, products, selectedCategories, selectedBrands, maxPriceFilter, searchTerm]);

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

  const visibleCategories = showAllCategories ? categoryStats : categoryStats.slice(0, 4);
  const visibleBrands = showAllBrands ? brandStats : brandStats.slice(0, 4);

  const activeFiltersCount = 
    selectedCategories.length + 
    selectedBrands.length + 
    (maxPriceFilter !== null ? 1 : 0) + 
    (searchTerm ? 1 : 0);

  return (
    <aside className="w-full space-y-6">
      
      {/* Mobile Toggle Button */}
      <div className="block lg:hidden">
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="w-full btn-secondary text-xs py-3 justify-between font-bold shadow-xs"
        >
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-amber-600" />
            <span>Filtros do Catálogo {activeFiltersCount > 0 ? `(${activeFiltersCount})` : ''}</span>
          </div>
          <ChevronDown className={`w-4 h-4 transition-transform ${isMobileOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Main Filter Sidebar Card */}
      <div className={`bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-5 ${
        isMobileOpen ? 'block' : 'hidden lg:block'
      }`}>
        
        {/* Sidebar Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-amber-600" />
            <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
              Filtros
            </h3>
          </div>

          {activeFiltersCount > 0 && (
            <button
              onClick={onResetFilters}
              className="text-[11px] font-bold text-amber-700 hover:text-amber-800 hover:underline flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Limpar
            </button>
          )}
        </div>

        {/* SEARCH INPUT INSIDE SIDEBAR TOP */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
            Buscar Equipamento
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Digite o nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 focus:border-amber-500 focus:bg-white text-slate-900 placeholder-slate-400 text-xs rounded-xl pl-8 pr-7 py-2 outline-none"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded text-slate-400 hover:text-slate-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="border-t border-slate-100" />

        {/* 1. CATEGORIAS */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-900">
            <span className="flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
              <Layers className="w-3.5 h-3.5 text-amber-600" /> Categorias
            </span>
            {selectedCategories.length > 0 && (
              <span className="text-[10px] font-extrabold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                {selectedCategories.length} sel.
              </span>
            )}
          </div>

          <div className="space-y-2">
            {visibleCategories.map((cat) => (
              <label
                key={cat.id}
                className={`flex items-center justify-between p-2 rounded-xl text-xs transition-colors cursor-pointer select-none ${
                  cat.isDisabled 
                    ? 'opacity-40 cursor-not-allowed bg-slate-50 text-slate-400' 
                    : cat.isChecked
                    ? 'bg-amber-50/80 text-amber-950 font-bold border border-amber-200'
                    : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <input
                    type="checkbox"
                    checked={cat.isChecked}
                    disabled={cat.isDisabled}
                    onChange={() => toggleCategory(cat.id)}
                    className="w-4 h-4 accent-amber-600 rounded border-slate-300 cursor-pointer disabled:cursor-not-allowed shrink-0"
                  />
                  <span className="truncate">{cat.name}</span>
                </div>

                <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded-md ${
                  cat.isChecked ? 'bg-amber-200/60 text-amber-900' : 'bg-slate-100 text-slate-500'
                }`}>
                  {cat.count}
                </span>
              </label>
            ))}
          </div>

          {categoryStats.length > 4 && (
            <button
              onClick={() => setShowAllCategories(!showAllCategories)}
              className="text-[11px] font-bold text-amber-700 hover:text-amber-800 hover:underline flex items-center gap-1 pt-1"
            >
              {showAllCategories ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5" />
                  <span>-- Ver menos --</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5" />
                  <span>-- Ver mais ({categoryStats.length - 4}) --</span>
                </>
              )}
            </button>
          )}
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

          <div className="space-y-2">
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

        <div className="border-t border-slate-100" />

        {/* 3. VALORES */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-900">
            <span className="flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
              <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> Preço Máximo
            </span>
            {maxPriceFilter !== null && (
              <button
                onClick={() => setMaxPriceFilter(null)}
                className="text-[10px] text-emerald-700 font-bold hover:underline"
              >
                Resetar
              </button>
            )}
          </div>

          <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="flex justify-between text-xs font-extrabold text-slate-900">
              <span>Até:</span>
              <span className="text-emerald-700 font-display">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(currentMaxPrice)}
              </span>
            </div>

            <input
              type="range"
              min={priceBounds.min}
              max={priceBounds.max}
              step={500}
              value={currentMaxPrice}
              onChange={(e) => setMaxPriceFilter(parseFloat(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-200 rounded-lg appearance-none"
            />

            <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
              <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(priceBounds.min)}</span>
              <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(priceBounds.max)}</span>
            </div>
          </div>
        </div>

      </div>
    </aside>
  );
}
