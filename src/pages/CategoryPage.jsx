import React from 'react';
import ProductCard from '../components/ProductCard';
import { Layers, ArrowLeft, Package } from 'lucide-react';

export default function CategoryPage({ 
  categoryId, 
  categories, 
  products, 
  brands, 
  onSelectProduct, 
  isAdmin, 
  onEditProduct, 
  onDeleteProduct, 
  onNavigate,
  comparisonList,
  onToggleComparison
}) {
  const category = categories.find((c) => c.id === categoryId) || categories[0];
  const categoryProducts = products.filter((p) => p.categoryId === category?.id);

  if (!category) {
    return (
      <div className="py-16 text-center container-custom space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Categoria não encontrada</h2>
        <button onClick={() => onNavigate('categories')} className="btn-gold text-xs">
          Ver Todas as Categorias
        </button>
      </div>
    );
  }

  return (
    <div className="py-10">
      <div className="container-custom space-y-8">
        
        {/* Category Header */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <button 
            onClick={() => onNavigate('categories')}
            className="btn-secondary text-xs py-2 px-3 gap-1.5 inline-flex"
          >
            <ArrowLeft className="w-4 h-4 text-slate-600" />
            <span>Voltar para Categorias</span>
          </button>

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

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center shrink-0">
              <span className="text-2xl font-extrabold text-amber-700 block font-display">
                {categoryProducts.length}
              </span>
              <span className="text-xs text-slate-500 font-medium">Equipamento(s)</span>
            </div>
          </div>
        </div>

        {/* Products Grid for this Category (2 columns on mobile) */}
        {categoryProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-6">
            {categoryProducts.map((product) => {
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
                />
              );
            })}
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-4 max-w-lg mx-auto shadow-xs">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-amber-600">
              <Package className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Nenhum equipamento cadastrado nesta categoria</h3>
            <p className="text-xs text-slate-500">
              Ainda não existem produtos vinculados à categoria "{category.name}".
            </p>
            <button onClick={() => onNavigate('catalog')} className="btn-gold text-xs">
              Ver Todos os Produtos
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
