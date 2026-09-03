import React, { useState, useEffect, useMemo } from 'react';
import ProductCard from '../components/ProductCard';
import Pagination from '../components/Pagination';
import NotFoundPage from './NotFoundPage';
import SearchBar from '../components/SearchBar';
import { Tag, ArrowLeft, Layers, ExternalLink, Globe, Search, LayoutGrid, List, SlidersHorizontal, Package, RefreshCw } from 'lucide-react';
import { sortProducts } from '../utils/productSorting';
import { buildProductRelationsMap, matchProductWithRelations } from '../utils/productSearch';

export default function BrandPage({
  brandId,
  brands = [],
  products = [],
  categories = [],
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
  const [shuffleSeed, setShuffleSeed] = useState(() => Math.floor(Math.random() * 1000000));

  const brand = brands.find((b) => b.id === brandId || b.slug === brandId);

  // Reset to page 1 when brand, search, sort or shuffle changes
  useEffect(() => {
    setCurrentPage(1);
  }, [brandId, searchTerm, sortBy, itemsPerPage, shuffleSeed]);

  if (!brand) {
    return (
      <NotFoundPage
        onNavigate={onNavigate}
        message="A marca de fabricante solicitada não foi encontrada em nossa rede de parceiros."
      />
    );
  }

  const normalizeText = (text) => {
    if (!text) return '';
    return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  };

  const rawBrandProducts = (products || []).filter((p) => p.brandId === brand.id && p.status !== 'draft');

  // Build bidirectional relation map across all catalog items
  const relationsMap = useMemo(() => {
    return buildProductRelationsMap(products);
  }, [products]);

  // Filter products by search term inside brand (with related products support)
  const filteredProducts = useMemo(() => {
    const rawTerm = searchTerm.trim();
    if (!rawTerm) return rawBrandProducts;

    const matched = [];
    for (const prod of rawBrandProducts) {
      const searchRes = matchProductWithRelations(prod, rawTerm, relationsMap, categories, brands);
      if (searchRes.matches) {
        matched.push({
          ...prod,
          _searchScore: searchRes.score || 0,
          _matchedVia: !searchRes.isDirectMatch ? searchRes.matchedViaProduct : null
        });
      }
    }

    matched.sort((a, b) => {
      const aDirect = !a._matchedVia ? 1 : 0;
      const bDirect = !b._matchedVia ? 1 : 0;
      if (bDirect !== aDirect) return bDirect - aDirect;
      return (b._searchScore || 0) - (a._searchScore || 0);
    });

    return matched;
  }, [rawBrandProducts, searchTerm, categories, brands, relationsMap]);

  // Sort products (Diversifies categories when sortBy === 'featured', or relevance when searching)
  const sortedProducts = useMemo(() => {
    if (searchTerm.trim() && sortBy === 'featured') {
      return filteredProducts;
    }
    return sortProducts(filteredProducts, sortBy, shuffleSeed);
  }, [filteredProducts, sortBy, shuffleSeed, searchTerm]);

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
        
        {/* Back Button & Breadcrumbs */}
        <div className="flex items-center justify-between gap-4 border-b border-slate-200/80 pb-4 text-xs">
          <button 
            onClick={() => onNavigate('brands')}
            className="btn-secondary text-xs py-2 px-3.5 gap-1.5 font-bold"
          >
            <ArrowLeft className="w-4 h-4 text-sky-600 shrink-0" />
            <span>Voltar para Fabricantes</span>
          </button>

          <div className="flex items-center gap-2 text-slate-500 font-medium hidden sm:flex">
            <span onClick={() => onNavigate('catalog')} className="hover:text-amber-600 cursor-pointer">Catálogo</span>
            <span>/</span>
            <span onClick={() => onNavigate('brands')} className="hover:text-amber-600 cursor-pointer">Marcas</span>
            <span>/</span>
            <span className="text-slate-900 font-bold">{brand.name}</span>
          </div>
        </div>

        {/* Brand Banner Header Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
            
            {/* Logo Image or Fallback Badge */}
            <div className="w-24 h-24 rounded-2xl bg-slate-50 border border-slate-200 overflow-hidden flex items-center justify-center p-3 shrink-0 shadow-xs">
              {brand.logo ? (
                <img 
                  src={brand.logo} 
                  alt={brand.name} 
                  loading="lazy"
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <Tag className="w-10 h-10 text-sky-600" />
              )}
            </div>

            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 text-sky-800 border border-sky-200 text-xs font-bold">
                <Tag className="w-3.5 h-3.5 text-sky-600" /> Fabricante Homologado
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {brand.name}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {brand.description || 'Equipamentos automotivos de alta performance e garantia de fábrica.'}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col items-center gap-3 shrink-0">
            {/* Partner Website Button */}
            {brand.websiteUrl && (
              <a
                href={brand.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary text-xs font-bold py-2.5 px-4 text-sky-900 border-sky-300 bg-sky-50/60 hover:bg-sky-100 flex items-center gap-2 shadow-xs"
              >
                <Globe className="w-4 h-4 text-sky-600" />
                <span>Visitar Site Oficial</span>
                <ExternalLink className="w-3.5 h-3.5 text-sky-500" />
              </a>
            )}

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center w-full min-w-[160px]">
              <span className="text-2xl font-extrabold text-sky-700 font-display block">
                {rawBrandProducts.length}
              </span>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mt-0.5">
                Equipamento(s)
              </span>
            </div>
          </div>
        </div>

        {/* Brand Product Grid Header & Controls */}
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
                Equipamentos {brand.name}
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {sortedProducts.length} encontrados
                </span>
              </h2>
            </div>

            {/* Filter / Search / Sort Controls */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Mini Search inside Brand */}
              <SearchBar
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder={`Buscar em ${brand.name}...`}
                variant="compact"
              />

              {/* Sort Dropdown */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-slate-500 hidden sm:inline">Ordenar:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 outline-none focus:ring-1 focus:ring-amber-500"
                >
                  <option value="featured">Mais Relevantes</option>
                  <option value="name-az">Nome (A-Z)</option>
                  <option value="price-low">Menor Preço</option>
                  <option value="price-high">Maior Preço</option>
                </select>

                {sortBy === 'featured' && (
                  <button
                    type="button"
                    onClick={() => {
                      setShuffleSeed(Math.floor(Math.random() * 1000000));
                      setCurrentPage(1);
                    }}
                    className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded-xl transition-all border border-slate-200 bg-white group"
                    title="Nova combinação de destaques"
                  >
                    <RefreshCw className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-500 text-amber-600" />
                  </button>
                )}
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

          {/* Product Grid / List */}
          {paginatedProducts.length > 0 ? (
            <>
              <div className={
                viewMode === 'grid'
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                  : "flex flex-col space-y-4"
              }>
                {paginatedProducts.map((product) => {
                  const category = categories.find((c) => c.id === product.categoryId);
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
                itemName={`equipamentos ${brand.name}`}
              />
            </>
          ) : (
            <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <Package className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-600">
                {searchTerm 
                  ? `Nenhum equipamento da marca ${brand.name} corresponde à busca "${searchTerm}".`
                  : `Nenhum equipamento cadastrado para a marca ${brand.name} no momento.`}
              </p>
              {searchTerm ? (
                <button onClick={() => setSearchTerm('')} className="btn-secondary text-xs">
                  Limpar Busca
                </button>
              ) : (
                <button onClick={() => onNavigate('catalog')} className="btn-gold text-xs">
                  Ver todo o catálogo
                </button>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
