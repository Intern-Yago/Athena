import React from 'react';
import { Eye, MessageCircle, Edit3, Trash2, Tag, CheckCircle2, ArrowLeftRight } from 'lucide-react';

export default function ProductCard({ 
  product, 
  category, 
  brand, 
  onSelectProduct, 
  isAdmin, 
  onEditProduct, 
  onDeleteProduct,
  isInComparison,
  onToggleComparison
}) {
  const formattedPrice = product.price 
    ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)
    : 'Sob Consulta';

  const whatsappText = encodeURIComponent(
    `Olá! Vim pelo site da Athena Soluções Automotivas e gostaria de um orçamento para o equipamento: *${product.name}* (Marca: ${brand?.name || 'Athena'}). Poderia me informar valor, prazo de entrega e formas de pagamento?`
  );

  const isDraft = product.status === 'draft';

  return (
    <div className="card group flex flex-col h-full bg-white border border-slate-200 hover:border-amber-400 shadow-xs rounded-2xl overflow-hidden">
      
      {/* Image Container */}
      <div 
        className="relative aspect-[4/3] overflow-hidden bg-slate-100 cursor-pointer" 
        onClick={() => onSelectProduct(product)}
      >
        <img 
          src={product.image || 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&auto=format&fit=crop&q=80'} 
          alt={product.altText || product.name}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80';
          }}
        />

        {/* Top Floating Badges (Category Badge Only) */}
        <div className="absolute top-2 sm:top-3 left-2 sm:left-3 right-2 sm:right-3 flex items-center justify-between pointer-events-none z-10">
          <div>
            {isDraft && (
              <span className="badge bg-amber-500 text-white shadow-xs font-bold text-[9px] sm:text-[10px] px-2 py-0.5">
                Rascunho
              </span>
            )}
          </div>

          {category && (
            <span className="badge badge-gray bg-white/95 shadow-xs text-[9px] sm:text-xs px-2.5 py-0.5 truncate max-w-[110px] sm:max-w-none">
              {category.name}
            </span>
          )}
        </div>

        {/* Admin Quick Action Overlay */}
        {isAdmin && (
          <div className="absolute top-2 right-2 flex items-center gap-1 z-20" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => onEditProduct(product)}
              className="p-1.5 sm:p-2 rounded-lg bg-sky-600 text-white hover:bg-sky-700 shadow-md transition-transform active:scale-95 flex items-center justify-center"
              title="Editar Produto"
            >
              <Edit3 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </button>
            <button
              onClick={() => onDeleteProduct(product.id)}
              className="p-1.5 sm:p-2 rounded-lg bg-red-600 text-white hover:bg-red-700 shadow-md transition-transform active:scale-95 flex items-center justify-center"
              title="Excluir Produto"
            >
              <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </button>
          </div>
        )}

        {/* Comparison Toggle Button */}
        {onToggleComparison && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleComparison(product);
            }}
            className={`absolute bottom-2 left-2 z-20 px-2 sm:px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-extrabold flex items-center gap-1 shadow-md transition-all ${
              isInComparison
                ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-300'
                : 'bg-slate-900/80 hover:bg-slate-950 text-white backdrop-blur-xs'
            }`}
            title={isInComparison ? 'Remover da comparação' : 'Comparar com outros modelos'}
          >
            <ArrowLeftRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>{isInComparison ? 'Comparando' : 'Comparar'}</span>
          </button>
        )}

        {/* Quick View Hover Prompt */}
        <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none hidden sm:flex">
          <span className="px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md">
            <Eye className="w-4 h-4" /> Ver Ficha Técnica
          </span>
        </div>
      </div>

      {/* Content Body */}
      <div className="p-3 sm:p-5 flex-1 flex flex-col justify-between space-y-3 sm:space-y-4">
        
        <div className="space-y-1.5 sm:space-y-2">
          {/* Brand Tag */}
          {brand && (
            <div className="flex items-center gap-1 text-[10px] sm:text-xs font-bold text-slate-500">
              <Tag className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-600 shrink-0" />
              <span className="truncate">{brand.name}</span>
            </div>
          )}

          {/* Title */}
          <h3 
            onClick={() => onSelectProduct(product)}
            className="text-xs sm:text-base font-bold text-slate-900 line-clamp-2 hover:text-amber-600 cursor-pointer transition-colors leading-snug"
          >
            {product.name}
          </h3>

          {/* Short Description */}
          <p className="text-[11px] sm:text-xs text-slate-600 line-clamp-2 leading-relaxed hidden sm:block">
            {product.description}
          </p>
        </div>

        {/* Specs highlights */}
        {product.specs && product.specs.length > 0 && (
          <div className="space-y-1 bg-slate-50 p-2 sm:p-3 rounded-xl border border-slate-200/80">
            {product.specs.slice(0, 2).map((spec, idx) => (
              <div key={idx} className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-slate-700">
                <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                <span className="truncate font-medium">{spec}</span>
              </div>
            ))}
          </div>
        )}

        {/* Price & Action Buttons */}
        <div className="pt-2 sm:pt-3 border-t border-slate-200/80 space-y-2 sm:space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-0.5 sm:gap-0">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wide">
              {product.priceNegotiable ? 'Preço Estimado' : 'Valor'}
            </span>
            <span className="text-sm sm:text-lg font-extrabold text-amber-700 font-display">
              {formattedPrice}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1.5 sm:gap-2.5">
            <button
              onClick={() => onSelectProduct(product)}
              className="btn-secondary text-[11px] sm:text-xs py-2 px-1.5 w-full justify-center"
            >
              <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-600 shrink-0" />
              <span>Ver</span>
            </button>

            <a
              href={`https://wa.me/5561983485671?text=${whatsappText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2 px-1.5 rounded-xl text-[11px] sm:text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 flex items-center justify-center gap-1 shadow-xs transition-colors text-decoration-none"
            >
              <MessageCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current shrink-0" />
              <span>Cotar</span>
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
