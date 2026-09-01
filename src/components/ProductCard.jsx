import React from 'react';
import { stripFormattingTags } from './FormattedDescription';
import { Eye, MessageCircle, Edit3, Trash2, Tag, CheckCircle2, ArrowLeftRight, FileText, CreditCard, ShoppingCart } from 'lucide-react';
import { getBestInstallmentText, calculatePaymentGateways, formatBRL } from '../utils/installmentCalculator';

export default function ProductCard({ 
  product, 
  category, 
  brand, 
  onSelectProduct, 
  isAdmin, 
  onEditProduct, 
  onDeleteProduct,
  isInComparison,
  onToggleComparison,
  viewMode = 'grid'
}) {
  const hasPrice = product.price > 0 && !product.priceNegotiable;
  const paymentGateways = hasPrice ? calculatePaymentGateways(product.price) : null;
  const pixCustomerPrice = paymentGateways?.pix?.formattedCustomerAmount || (
    product.price ? formatBRL(product.price) : 'Sob Consulta'
  );

  const formattedPrice = product.price 
    ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)
    : 'Sob Consulta';

  const whatsappText = hasPrice
    ? encodeURIComponent(
        `Olá! Vim pelo site da Athena Soluções Automotivas e gostaria de comprar o equipamento: *${product.name}* (Marca: ${brand?.name || 'Athena'} - Valor: ${pixCustomerPrice} no PIX / Cartão). Poderia me orientar para concluir o pedido?`
      )
    : encodeURIComponent(
        `Olá! Vim pelo site da Athena Soluções Automotivas e gostaria de um orçamento para o equipamento: *${product.name}* (Marca: ${brand?.name || 'Athena'}). Poderia me informar valor, prazo de entrega e formas de pagamento?`
      );

  const isDraft = product.status === 'draft';

  // ==========================================
  // LIST VIEW LAYOUT
  // ==========================================
  if (viewMode === 'list') {
    return (
      <div className="group flex flex-col md:flex-row bg-white border border-slate-200 hover:border-amber-400 hover:shadow-md transition-all rounded-2xl overflow-hidden">
        
        {/* Left: Large Photo Area */}
        <div 
          className="relative w-full md:w-80 h-64 md:h-auto bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center p-4 cursor-pointer shrink-0 border-b md:border-b-0 md:border-r border-slate-200/80 overflow-hidden"
          onClick={() => onSelectProduct(product)}
        >
          <img 
            src={product.image || 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&auto=format&fit=crop&q=80'} 
            alt={product.altText || product.name}
            loading="lazy"
            decoding="async"
            className="w-full h-full max-h-56 object-contain group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80';
            }}
          />

          {/* Badges Overlay */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10 pointer-events-none">
            {product.badge && (
              <span className="badge bg-amber-500 text-slate-950 font-extrabold text-[10px] px-2.5 py-0.5 shadow-xs">
                {product.badge}
              </span>
            )}
            {isDraft && (
              <span className="badge bg-slate-700 text-white font-bold text-[10px] px-2.5 py-0.5">
                Rascunho
              </span>
            )}
          </div>

          {/* Comparison Toggle */}
          {onToggleComparison && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleComparison(product);
              }}
              className={`absolute bottom-3 left-3 z-20 px-2.5 py-1 rounded-lg text-[11px] font-extrabold flex items-center gap-1.5 shadow-md transition-all ${
                isInComparison
                  ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-300'
                  : 'bg-slate-900/80 hover:bg-slate-950 text-white backdrop-blur-xs'
              }`}
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>{isInComparison ? 'Comparando' : 'Comparar'}</span>
            </button>
          )}
        </div>

        {/* Right: Detailed Content Area */}
        <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {brand && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200">
                    <Tag className="w-3 h-3 text-amber-600" />
                    {brand.name}
                  </span>
                )}
                {category && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-md">
                    {category.name}
                  </span>
                )}
              </div>

              {/* Admin Actions */}
              {isAdmin && (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onEditProduct(product)}
                    className="p-1.5 rounded-lg bg-sky-600 text-white hover:bg-sky-700 text-xs flex items-center gap-1 font-bold px-2.5"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Editar</span>
                  </button>
                  <button
                    onClick={() => onDeleteProduct(product.id)}
                    className="p-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 text-xs flex items-center justify-center p-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            <h3 
              onClick={() => onSelectProduct(product)}
              className="text-base sm:text-lg font-bold text-slate-900 hover:text-amber-600 cursor-pointer transition-colors leading-snug"
            >
              {product.name}
            </h3>

            <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
              {stripFormattingTags(product.description)}
            </p>

            {/* Technical Specs List */}
            {product.specs && product.specs.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-2 bg-slate-50/80 p-3 rounded-xl border border-slate-200/80">
                {product.specs.slice(0, 4).map((spec, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate font-medium">{spec}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bottom Bar: Action & Quote */}
          <div className="pt-3 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-black text-amber-900 uppercase tracking-wide block">
                {hasPrice ? 'À Vista no PIX' : (product.price > 0 ? 'Preço Estimado' : 'Condição Comercial')}
              </span>
              <span className="text-sm font-extrabold text-amber-800 font-display bg-amber-50 px-3 py-1 rounded-lg border border-amber-200 inline-block mt-0.5">
                {hasPrice ? pixCustomerPrice : formattedPrice}
              </span>
              {hasPrice && (
                <span className="text-[10px] text-slate-500 font-medium block mt-0.5">
                  {getBestInstallmentText(product.price, 12)}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => onSelectProduct(product)}
                className="btn-secondary text-xs py-2 px-4 font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-4 h-4 text-slate-600" />
                <span>Ver Ficha Técnica</span>
              </button>

              <a
                href={`https://wa.me/5561983485671?text=${whatsappText}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`py-2 px-4 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1.5 shadow-xs transition-colors ${
                  hasPrice ? 'bg-amber-500 hover:bg-amber-600 !text-slate-950 font-extrabold' : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {hasPrice ? <CreditCard className="w-4 h-4 shrink-0" /> : <MessageCircle className="w-4 h-4 fill-current shrink-0" />}
                <span>{hasPrice ? 'Comprar Agora' : 'Solicitar Cotação'}</span>
              </a>
            </div>
          </div>

        </div>
      </div>
    );
  }

  // ==========================================
  // GRID VIEW LAYOUT (LARGE CARDS)
  // ==========================================
  return (
    <div className="group flex flex-col h-full bg-white border border-slate-200 hover:border-amber-400 hover:shadow-lg transition-all duration-200 rounded-2xl overflow-hidden">
      
      {/* Large Image Container */}
      <div 
        className="relative h-64 sm:h-72 w-full bg-gradient-to-b from-slate-50 to-slate-100/70 flex items-center justify-center p-4 cursor-pointer overflow-hidden border-b border-slate-100" 
        onClick={() => onSelectProduct(product)}
      >
        <img 
          src={product.image || 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&auto=format&fit=crop&q=80'} 
          alt={product.altText || product.name}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80';
          }}
        />

        {/* Top Badges (Category & Custom Badges) */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2 pointer-events-none z-10">
          <div className="flex flex-col gap-1.5">
            {product.badge && (
              <span className="bg-amber-500 text-slate-950 font-extrabold text-[10px] sm:text-[11px] px-2.5 py-1 rounded-lg shadow-sm border border-amber-400">
                {product.badge}
              </span>
            )}
            {isDraft && (
              <span className="bg-slate-800 text-white font-bold text-[10px] px-2.5 py-0.5 rounded-lg">
                Rascunho
              </span>
            )}
          </div>

          {category && (
            <span className="bg-slate-900/85 backdrop-blur-xs text-white text-[10px] sm:text-[11px] font-bold px-3 py-1 rounded-full shadow-xs border border-white/20 max-w-[170px] truncate">
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

        {/* Comparison Toggle Button */}
        {onToggleComparison && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleComparison(product);
            }}
            className={`absolute bottom-3 left-3 z-20 px-2.5 py-1 rounded-lg text-[11px] font-extrabold flex items-center gap-1.5 shadow-md transition-all ${
              isInComparison
                ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-300'
                : 'bg-slate-900/85 hover:bg-slate-950 text-white backdrop-blur-xs'
            }`}
            title={isInComparison ? 'Remover da comparação' : 'Comparar com outros modelos'}
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
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
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3 sm:space-y-4">
        
        <div className="space-y-2">
          {/* Brand Tag */}
          {brand && (
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
              <Tag className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span className="text-amber-700 font-extrabold uppercase tracking-wider">{brand.name}</span>
            </div>
          )}

          {/* Title */}
          <h3 
            onClick={() => onSelectProduct(product)}
            className="text-sm sm:text-base font-extrabold text-slate-900 line-clamp-2 hover:text-amber-600 cursor-pointer transition-colors leading-snug"
          >
            {product.name}
          </h3>

          {/* Short Description */}
          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {stripFormattingTags(product.description)}
          </p>
        </div>

        {/* Specs Highlights (Up to 3 items) */}
        {product.specs && product.specs.length > 0 && (
          <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
            {product.specs.slice(0, 3).map((spec, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs text-slate-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate font-medium">{spec}</span>
              </div>
            ))}
          </div>
        )}

        {/* Price & Action Buttons */}
        <div className="pt-3 border-t border-slate-200/80 space-y-3">
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[10px] font-black text-amber-900 uppercase tracking-wide">
                {hasPrice ? 'À Vista no PIX' : (product.price > 0 ? 'Preço Estimado' : 'Condição Comercial')}
              </span>
              <span className="text-xs font-extrabold text-amber-800 font-display bg-amber-100/70 px-2.5 py-0.5 rounded-lg border border-amber-300">
                {hasPrice ? pixCustomerPrice : formattedPrice}
              </span>
            </div>
            {hasPrice && (
              <span className="text-[10px] text-slate-500 font-medium block text-right">
                {getBestInstallmentText(product.price, 12)}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onSelectProduct(product)}
              className="btn-secondary text-xs py-2.5 px-2 w-full justify-center font-bold cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-slate-600 shrink-0" />
              <span>Detalhes</span>
            </button>

            <a
              href={`https://wa.me/5561983485671?text=${whatsappText}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`py-2.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors text-decoration-none ${
                hasPrice ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold' : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              {hasPrice ? <CreditCard className="w-3.5 h-3.5 shrink-0" /> : <MessageCircle className="w-3.5 h-3.5 fill-current shrink-0" />}
              <span>{hasPrice ? 'Comprar' : 'Cotar'}</span>
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
