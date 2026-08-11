import React from 'react';
import ProductCard from '../components/ProductCard';
import { Tag, ArrowLeft, Package } from 'lucide-react';

export default function BrandPage({ brandId, brands, products, categories, onSelectProduct, isAdmin, onEditProduct, onDeleteProduct, onNavigate }) {
  const brand = brands.find((b) => b.id === brandId) || brands[0];
  const brandProducts = products.filter((p) => p.brandId === brand?.id);

  if (!brand) {
    return (
      <div className="py-16 text-center container-custom space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Marca não encontrada</h2>
        <button onClick={() => onNavigate('brands')} className="btn-gold text-xs">
          Ver Todas as Marcas
        </button>
      </div>
    );
  }

  return (
    <div className="py-10">
      <div className="container-custom space-y-8">
        
        {/* Brand Header */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <button 
            onClick={() => onNavigate('brands')}
            className="btn-secondary text-xs py-2 px-3 gap-1.5 inline-flex"
          >
            <ArrowLeft className="w-4 h-4 text-slate-600" />
            <span>Voltar para Marcas</span>
          </button>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-2">
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 rounded-2xl bg-slate-50 border border-slate-200 overflow-hidden flex items-center justify-center p-3 shrink-0">
                <img 
                  src={brand.logo || 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=200&auto=format&fit=crop&q=80'} 
                  alt={brand.name} 
                  className="max-h-full max-w-full object-contain"
                />
              </div>

              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 text-sky-800 border border-sky-200 text-xs font-bold">
                  <Tag className="w-3.5 h-3.5 text-sky-600" /> Fabricante Parceiro
                </div>
                <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900">
                  {brand.name}
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
                  {brand.description}
                </p>
              </div>
            </div>

            <div className="bg-sky-50/60 p-4 rounded-2xl border border-sky-200 text-center shrink-0">
              <span className="text-2xl font-extrabold text-sky-700 block font-display">
                {brandProducts.length}
              </span>
              <span className="text-xs text-sky-800 font-medium">Equipamento(s)</span>
            </div>
          </div>
        </div>

        {/* Products Grid for this Brand */}
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
                />
              );
            })}
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-4 max-w-lg mx-auto shadow-xs">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-sky-600">
              <Package className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Nenhum equipamento cadastrado desta marca</h3>
            <p className="text-xs text-slate-500">
              Ainda não existem produtos vinculados à marca "{brand.name}".
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
