import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import FilterSidebar from './FilterSidebar';
import { Package, RefreshCw, Plus, Layers, Tag, DollarSign, Search, X, SlidersHorizontal, ChevronLeft, ChevronRight, LayoutGrid, List } from 'lucide-react';

const ITEMS_PER_PAGE = 20;

export default function Catalog({ 
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
  onSelectProduct,
  isAdmin,
  onEditProduct,
  onDeleteProduct,
  onOpenAddProduct,
  comparisonList,
  onToggleComparison
}) {
  const [sortBy, setSortBy] = useState('featured');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('grid');

  // Reset to page 1 whenever any filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategories, selectedBrands, maxPriceFilter, searchTerm, sortBy]);

  // Helper for accent-insensitive search matching
  const normalizeText = (text) => {
    if (!text) return '';
    return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  };

  // Filter products according to all active multi-selections
  const filteredProducts = products.filter((prod) => {
    const term = normalizeText(searchTerm);
    const category = categories.find((c) => c.id === prod.categoryId);
    const brand = brands.find((b) => b.id === prod.brandId);

    const matchesSearch = !term || 
      normalizeText(prod.name).includes(term) ||
      normalizeText(prod.description).includes(term) ||
      normalizeText(prod.badge).includes(term) ||
      normalizeText(prod.altText).includes(term) ||
      normalizeText(prod.slug).includes(term) ||
      (category && (normalizeText(category.name).includes(term) || normalizeText(category.description).includes(term) || normalizeText(category.slug).includes(term))) ||
      (brand && (normalizeText(brand.name).includes(term) || normalizeText(brand.description).includes(term) || normalizeText(brand.slug).includes(term))) ||
      (prod.specs && prod.specs.some(s => normalizeText(s).includes(term)));

    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(prod.categoryId);
    const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(prod.brandId);
    const matchesPrice = maxPriceFilter === null || (prod.price > 0 ? prod.price <= maxPriceFilter : true);

    return matchesSearch && matchesCategory && matchesBrand && matchesPrice;
  });

  // Sort products (Featured priority when sortBy === 'featured')
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'featured') {
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;
      return 0;
    }
    if (sortBy === 'price-low') return (a.price || 0) - (b.price || 0);
    if (sortBy === 'price-high') return (b.price || 0) - (a.price || 0);
    if (sortBy === 'name-az') return a.name.localeCompare(b.name);
    return 0;
  });

  // Pagination calculation
  const totalPages = Math.ceil(sortedProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const hasActiveFilters = 
    selectedCategories.length > 0 || 
    selectedBrands.length > 0 || 
    maxPriceFilter !== null || 
    searchTerm !== '';

  const resetAllFilters = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setMaxPriceFilter(null);
    setSearchTerm('');
    setSortBy('featured');
    setCurrentPage(1);
  };

  const removeCategoryFilter = (catId) => {
    setSelectedCategories(selectedCategories.filter(id => id !== catId));
  };

  const removeBrandFilter = (brandId) => {
    setSelectedBrands(selectedBrands.filter(id => id !== brandId));
  };

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  return (
    <section className="py-6 sm:py-8 w-full">
      <div className="w-full px-3 sm:px-6 lg:px-8 space-y-6">
        
        {/* Full-Width E-commerce Layout: Sidebar Glued to Far Left + Cards Fill Entire Monitor */}
        <div className="flex flex-col lg:flex-row gap-5 lg:gap-6 items-start relative w-full">
          
          {/* Sidebar Glued to Left Edge */}
          <div className="w-full lg:w-72 shrink-0 lg:sticky lg:top-24 z-30">
            <FilterSidebar
              products={products}
              categories={categories}
              brands={brands}
              selectedCategories={selectedCategories}
              setSelectedCategories={setSelectedCategories}
              selectedBrands={selectedBrands}
              setSelectedBrands={setSelectedBrands}
              maxPriceFilter={maxPriceFilter}
              setMaxPriceFilter={setMaxPriceFilter}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              onResetFilters={resetAllFilters}
            />
          </div>

          {/* Product Grid Area (Takes 100% of remaining viewport width) */}
          <div className="flex-1 min-w-0 space-y-6 w-full">
            
            {/* Top Toolbar */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <Package className="w-6 h-6 text-amber-600 shrink-0" />
                    Catálogo de Equipamentos
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Exibindo <span className="text-amber-700 font-bold">{paginatedProducts.length}</span> de {sortedProducts.length} equipamentos
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {isAdmin && (
                    <button
                      onClick={onOpenAddProduct}
                      className="btn-gold text-xs font-bold py-2 px-3.5 shadow-xs"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Cadastrar Produto</span>
                    </button>
                  )}

                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-slate-500 hidden sm:inline" />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="form-select text-xs py-2 px-3 bg-slate-50 border-slate-300 w-auto font-semibold"
                    >
                      <option value="featured">Destaques Athena</option>
                      <option value="price-low">Menor Preço</option>
                      <option value="price-high">Maior Preço</option>
                      <option value="name-az">Nome (A - Z)</option>
                    </select>
                  </div>

                  {/* View Mode Switcher (Grid / List) */}
                  <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                        viewMode === 'grid'
                          ? 'bg-white text-amber-700 shadow-xs'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                      title="Visualização em Grade Ampla"
                    >
                      <LayoutGrid className="w-4 h-4" />
                      <span className="hidden md:inline">Grade</span>
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                        viewMode === 'list'
                          ? 'bg-white text-amber-700 shadow-xs'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                      title="Visualização em Lista / Ficha Técnica"
                    >
                      <List className="w-4 h-4" />
                      <span className="hidden md:inline">Lista</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Accumulative Active Badges Bar */}
              {hasActiveFilters && (
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Filtros Selecionados:
                    </span>

                    {selectedCategories.map((catId) => {
                      const catObj = categories.find(c => c.id === catId);
                      if (!catObj) return null;
                      return (
                        <span key={catId} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                          <Layers className="w-3 h-3 text-amber-700" />
                          <span>{catObj.name}</span>
                          <button 
                            onClick={() => removeCategoryFilter(catId)}
                            className="p-0.5 hover:bg-amber-200 rounded-full text-amber-800 transition-colors"
                            title="Remover filtro"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </span>
                      );
                    })}

                    {selectedBrands.map((brandId) => {
                      const brandObj = brands.find(b => b.id === brandId);
                      if (!brandObj) return null;
                      return (
                        <span key={brandId} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-900 border border-sky-300">
                          <Tag className="w-3 h-3 text-sky-700" />
                          <span>{brandObj.name}</span>
                          <button 
                            onClick={() => removeBrandFilter(brandId)}
                            className="p-0.5 hover:bg-sky-200 rounded-full text-sky-800 transition-colors"
                            title="Remover filtro"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </span>
                      );
                    })}

                    {maxPriceFilter !== null && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Até {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(maxPriceFilter)}</span>
                        <button 
                          onClick={() => setMaxPriceFilter(null)}
                          className="p-0.5 hover:bg-emerald-200 rounded-full text-emerald-800 transition-colors"
                          title="Remover limite de preço"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    )}

                    {searchTerm && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-200 text-slate-800 border border-slate-300">
                        <Search className="w-3 h-3 text-slate-600" />
                        <span>Busca: "{searchTerm}"</span>
                        <button 
                          onClick={() => setSearchTerm('')}
                          className="p-0.5 hover:bg-slate-300 rounded-full text-slate-800 transition-colors"
                          title="Limpar busca"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    )}
                  </div>

                  <button
                    onClick={resetAllFilters}
                    className="text-xs font-bold text-amber-700 hover:text-amber-800 hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Limpar Todos</span>
                  </button>
                </div>
              )}
            </div>

            {/* Dynamic Product Grid / List */}
            {paginatedProducts.length > 0 ? (
              <>
                <div className={
                  viewMode === 'grid'
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6"
                    : "flex flex-col space-y-4"
                }>
                  {paginatedProducts.map((product) => {
                    const category = categories.find((c) => c.id === product.categoryId);
                    const brand = brands.find((b) => b.id === product.brandId);
                    return (
                      <ProductCard
                        key={product.id}
                        product={product}
                        category={category}
                        brand={brand}
                        onSelectProduct={onSelectProduct}
                        isAdmin={isAdmin}
                        onEditProduct={onEditProduct}
                        onDeleteProduct={onDeleteProduct}
                        isInComparison={comparisonList?.some((p) => p.id === product.id)}
                        onToggleComparison={onToggleComparison}
                        viewMode={viewMode}
                      />
                    );
                  })}
                </div>

                {/* PAGINATION CONTROLS (Rendered if >= 20 items or totalPages > 1) */}
                {(sortedProducts.length >= ITEMS_PER_PAGE || totalPages > 1) && (
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-bold shadow-xs">
                    <span className="text-slate-500 font-medium">
                      Página <strong className="text-slate-900">{currentPage}</strong> de <strong className="text-slate-900">{totalPages}</strong> ({sortedProducts.length} itens)
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="btn-secondary py-2 px-3 text-xs gap-1 disabled:opacity-40"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span>Anterior</span>
                      </button>

                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                        <button
                          key={pageNum}
                          onClick={() => goToPage(pageNum)}
                          className={`w-8 h-8 rounded-xl font-extrabold text-xs transition-colors flex items-center justify-center ${
                            currentPage === pageNum
                              ? 'bg-amber-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {pageNum}
                        </button>
                      ))}

                      <button
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="btn-secondary py-2 px-3 text-xs gap-1 disabled:opacity-40"
                      >
                        <span>Próxima</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-4 max-w-lg mx-auto shadow-xs">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-amber-600">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Nenhum equipamento encontrado</h3>
                <p className="text-xs text-slate-500">
                  Não encontramos nenhum produto correspondente à combinação de filtros selecionados.
                </p>
                <div className="pt-2 flex justify-center gap-3">
                  <button onClick={resetAllFilters} className="btn-secondary text-xs">
                    Limpar Todos os Filtros
                  </button>
                  {isAdmin && (
                    <button onClick={onOpenAddProduct} className="btn-gold text-xs font-bold">
                      <Plus className="w-4 h-4" /> Cadastrar Produto
                    </button>
                  )}
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </section>
  );
}
