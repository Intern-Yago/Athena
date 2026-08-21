import React from 'react';
import ProductCard from '../components/ProductCard';
import { Tag, ArrowLeft, Layers, ShieldCheck, ExternalLink, Globe } from 'lucide-react';

export default function BrandPage({
  brandId,
  brands,
  products,
  categories,
  onSelectProduct,
  isAdmin,
  onEditProduct,
  onDeleteProduct,
  onNavigate,
  comparisonList,
  onToggleComparison
}) {
  const brand = brands.find((b) => b.id === brandId || b.slug === brandId) || brands[0];

  if (!brand) {
    return (
      <div className="py-16 text-center container-custom space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Marca não encontrada</h2>
        <button onClick={() => onNavigate('brands')} className="btn-gold text-xs">
          Ver todas as marcas
        </button>
      </div>
    );
  }

  const brandProducts = products.filter((p) => p.brandId === brand.id && p.status !== 'draft');

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
            {/* Partner Website Button (If websiteUrl is present) */}
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
                {brandProducts.length}
              </span>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mt-0.5">
                Equipamento(s)
              </span>
            </div>
          </div>
        </div>

        {/* Brand Product Grid */}
        <div className="space-y-4">
          <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            Equipamentos da Marca {brand.name}
          </h2>

          {brandProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {brandProducts.map((product) => {
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
                  />
                );
              })}
            </div>
          ) : (
            <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
              <p className="text-sm font-semibold text-slate-600">
                Nenhum equipamento cadastrado para a marca {brand.name} no momento.
              </p>
              <button onClick={() => onNavigate('catalog')} className="btn-gold text-xs">
                Ver todo o catálogo
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
