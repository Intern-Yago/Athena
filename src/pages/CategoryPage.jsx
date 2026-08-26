import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import Pagination from '../components/Pagination';
import NotFoundPage from './NotFoundPage';
import { Layers, ArrowLeft, Package, Search, LayoutGrid, List, SlidersHorizontal } from 'lucide-react';

export default function CategoryPage({ 
  categoryId, 
  categories = [], 
  products = [], 
  brands = [], 
  onSelectProduct, 
  isAdmin, 
  onEditProduct, 
  onDeleteProduct, 
  onNavigate,
  comparisonList,
  onToggleComparison
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [sortBy, setSortBy] = useState('featured');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  const category = categories.find((c) => c.id === categoryId || c.slug === categoryId);

  // Reset to page 1 when category, search or sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [categoryId, searchTerm, sortBy, itemsPerPage]);

  if (!category) {
    return (
      <NotFoundPage
        onNavigate={onNavigate}
        message="A linha de categoria solicitada não foi encontrada ou não possui equipamentos vinculados."
      />
    );
  }

  const normalizeText = (text) => {
    if (!text) return '';
    return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  };

  const rawCategoryProducts = (products || []).filter((p) => p.categoryId === category.id && p.status !== 'draft');

  // Filter products by search term inside category
  const filteredProducts = rawCategoryProducts.filter((prod) => {
    const term = normalizeText(searchTerm);
    if (!term) return true;

    const brand = brands.find((b) => b.id === prod.brandId);
    return (
      normalizeText(prod.name).includes(term) ||
      normalizeText(prod.description).includes(term) ||
      normalizeText(prod.badge).includes(term) ||
      (brand && normalizeText(brand.name).includes(term)) ||
      (prod.specs && prod.specs.some((s) => normalizeText(s).includes(term)))
    );
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'featured') {
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;
      return 0;
    }
    if (sortBy === 'price-low') return (a.price || 0) - (b.price || 0);
    if (sortBy === 'price-high') return (b.price || 0) - (a.price || 0);
    if (sortBy === 'name-az') return (a.name || '').localeCompare(b.name || '');
    return 0;
  });

  // Pagination calculation
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 200, behavior: 'smooth' });
  };

  return (
    <div className="py-10">
      <div className="container-custom space-y-8">
        
        {/* Category Header */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between gap-4 text-xs">
            <button 
              onClick={() => onNavigate('categories')}
              className="btn-secondary text-xs py-2 px-3 gap-1.5 inline-flex font-bold"
            >
              <ArrowLeft className="w-4 h-4 text-amber-600" />
              <span>Voltar para Categorias</span>
            </button>

            <div className="flex items-center gap-2 text-slate-500 font-medium hidden sm:flex">
              <span onClick={() => onNavigate('catalog')} className="hover:text-amber-600 cursor-pointer">Catálogo</span>
              <span>/</span>
              <span onClick={() => onNavigate('categories')} className="hover:text-amber-600 cursor-pointer">Categorias</span>
              <span>/</span>
              <span className="text-slate-900 font-bold">{category.name}</span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold">
                <Layers className="w-3.5 h-3.5 text-amber-600" /> Categoria Oficial
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900">
                {category.name}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {category.description}
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center shrink-0 min-w-[160px]">
              <span className="text-2xl font-extrabold text-amber-700 block font-display">
                {rawCategoryProducts.length}
              </span>
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block mt-0.5">
                Equipamento(s)
              </span>
            </div>
          </div>
        </div>

        {/* Category Products Header & Controls */}
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
                Linha {category.name}
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {sortedProducts.length} encontrados
                </span>
              </h2>
            </div>

            {/* Filter / Search / Sort Controls */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Mini Search inside Category */}
              <div className="relative min-w-[180px] sm:min-w-[220px]">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={`Buscar em ${category.name}...`}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-amber-500 outline-none"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-slate-500 hidden sm:inline">Ordenar:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 outline-none focus:ring-1 focus:ring-amber-500"
                >
                  <option value="featured">Destaques</option>
                  <option value="name-az">Nome (A-Z)</option>
                  <option value="price-low">Menor Preço</option>
                  <option value="price-high">Maior Preço</option>
                </select>
              </div>

              {/* Items Per Page */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-slate-500 hidden sm:inline">Exibir:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 outline-none focus:ring-1 focus:ring-amber-500"
                >
                  <option value={12}>12 por pág.</option>
                  <option value={24}>24 por pág.</option>
                  <option value={48}>48 por pág.</option>
                </select>
              </div>

              {/* Grid / List View Toggle */}
              <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
                  title="Visualização em Grade"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
                  title="Visualização em Lista"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Products Grid / List for this Category */}
          {paginatedProducts.length > 0 ? (
            <>
              <div className={
                viewMode === 'grid'
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                  : "flex flex-col space-y-4"
              }>
                {paginatedProducts.map((product) => {
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

              {/* Pagination Controls */}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={sortedProducts.length}
                itemsPerPage={itemsPerPage}
                onPageChange={goToPage}
                itemName={`equipamentos ${category.name}`}
              />
            </>
          ) : (
            <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-4 max-w-lg mx-auto shadow-xs">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-amber-600">
                <Package className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                {searchTerm ? 'Nenhum equipamento encontrado nesta busca' : 'Nenhum equipamento cadastrado nesta categoria'}
              </h3>
              <p className="text-xs text-slate-500">
                {searchTerm 
                  ? `Não encontramos nenhum resultado para "${searchTerm}" na categoria ${category.name}.`
                  : `Ainda não existem produtos vinculados à categoria "${category.name}".`}
              </p>
              {searchTerm ? (
                <button onClick={() => setSearchTerm('')} className="btn-secondary text-xs">
                  Limpar Busca
                </button>
              ) : (
                <button onClick={() => onNavigate('catalog')} className="btn-gold text-xs">
                  Ver Todos os Produtos
                </button>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
