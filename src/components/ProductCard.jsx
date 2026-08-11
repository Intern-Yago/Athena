import React from 'react';
import { Eye, MessageCircle, Edit3, Trash2, Tag, CheckCircle2 } from 'lucide-react';

export default function ProductCard({ 
  product, 
  category, 
  brand, 
  onSelectProduct, 
  isAdmin, 
  onEditProduct, 
  onDeleteProduct 
}) {
  const formattedPrice = product.price 
    ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)
    : 'Sob Consulta';

  const whatsappText = encodeURIComponent(
    `Olá! Vim pelo site da Athena Soluções Automotivas e gostaria de um orçamento para o equipamento: *${product.name}* (Marca: ${brand?.name || 'Athena'}). Poderia me informar valor, prazo de entrega e formas de pagamento?`
  );

  const isDraft = product.status === 'draft';

  return (
    <div className="card group flex flex-col h-full bg-white border border-slate-200 hover:border-amber-400 shadow-xs">
      
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

        {/* Top Floating Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
          <div className="flex items-center gap-1.5">
            {product.badge && (
              <span className="badge badge-gold shadow-xs">
                {product.badge}
              </span>
            )}
            {isDraft && (
              <span className="badge bg-amber-500 text-white shadow-xs font-bold text-[10px]">
                Rascunho
              </span>
            )}
          </div>

          {category && (
            <span className="badge badge-gray bg-white/95 shadow-xs">
              {category.name}
            </span>
          )}
        </div>

        {/* Admin Quick Action Overlay */}
        {isAdmin && (
          <div className="absolute top-3 right-3 flex items-center gap-1.5 z-20" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => onEditProduct(product)}
              className="p-2 rounded-lg bg-sky-600 text-white hover:bg-sky-700 shadow-md transition-transform active:scale-95 flex items-center justify-center"
              title="Editar Produto"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDeleteProduct(product.id)}
              className="p-2 rounded-lg bg-red-600 text-white hover:bg-red-700 shadow-md transition-transform active:scale-95 flex items-center justify-center"
              title="Excluir Produto"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Quick View Hover Prompt */}
        <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <span className="px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md">
            <Eye className="w-4 h-4" /> Ver Ficha Técnica
          </span>
        </div>
      </div>

      {/* Content Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        
        <div className="space-y-2">
          {/* Brand Tag */}
          {brand && (
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
              <Tag className="w-3 h-3 text-amber-600 shrink-0" />
              <span>{brand.name}</span>
            </div>
          )}

          {/* Title */}
          <h3 
            onClick={() => onSelectProduct(product)}
            className="text-base font-bold text-slate-900 line-clamp-2 hover:text-amber-600 cursor-pointer transition-colors leading-snug"
          >
            {product.name}
          </h3>

          {/* Short Description */}
          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Specs highlights */}
        {product.specs && product.specs.length > 0 && (
          <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
            {product.specs.slice(0, 2).map((spec, idx) => (
              <div key={idx} className="flex items-center gap-2 text-[11px] text-slate-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate font-medium">{spec}</span>
              </div>
            ))}
          </div>
        )}

        {/* Price & Action Buttons */}
        <div className="pt-3 border-t border-slate-200/80 space-y-3">
          <div className="flex items-baseline justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
              {product.priceNegotiable ? 'Preço Estimado' : 'Valor'}
            </span>
            <span className="text-lg font-extrabold text-amber-700 font-display">
              {formattedPrice}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => onSelectProduct(product)}
              className="btn-secondary text-xs py-2.5 px-2 w-full justify-center"
            >
              <Eye className="w-3.5 h-3.5 text-slate-600 shrink-0" />
              <span>Detalhes</span>
            </button>

            <a
              href={`https://wa.me/5561983485671?text=${whatsappText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 flex items-center justify-center gap-1.5 shadow-xs transition-colors text-decoration-none"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-current shrink-0" />
              <span>Orçamento</span>
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
