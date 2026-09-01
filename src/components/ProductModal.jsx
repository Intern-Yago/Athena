import React from 'react';
import FormattedDescription from './FormattedDescription';
import { X, CheckCircle2, ShieldCheck, Tag, Layers, MessageCircle, Sparkles, Play, ExternalLink, CreditCard } from 'lucide-react';
import { calculatePaymentGateways, getBestInstallmentText, formatBRL } from '../utils/installmentCalculator';

export default function ProductModal({ 
  product, 
  category: propCategory, 
  brand: propBrand, 
  categories = [], 
  brands = [], 
  products = [], 
  onClose,
  onSelectProduct 
}) {
  if (!product) return null;

  const category = propCategory || (categories && categories.find(c => c.id === product.categoryId));
  const brand = propBrand || (brands && brands.find(b => b.id === product.brandId));

  const hasPrice = product.price > 0 && !product.priceNegotiable;
  const paymentGateways = hasPrice ? calculatePaymentGateways(product.price) : null;
  const pixCustomerPrice = paymentGateways?.pix?.formattedCustomerAmount || (
    product.price ? formatBRL(product.price) : 'Sob Consulta'
  );

  const formattedPrice = product.price 
    ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)
    : 'Sob Consulta';

  const whatsappBuyMessage = encodeURIComponent(
    `Olá Athena Soluções Automotivas!\n\nGostaria de comprar o equipamento:\n*${product.name}*\nMarca: ${brand?.name || 'Athena'}\nValor: ${pixCustomerPrice} no PIX (ou parcelado no cartão).\n\nPoderia me orientar para concluir o pedido?`
  );

  const whatsappQuoteMessage = encodeURIComponent(
    `Olá Athena Soluções Automotivas!\n\nGostaria de mais informações e cotação para o equipamento:\n*${product.name}*\nMarca: ${brand?.name || 'N/A'}\nCategoria: ${category?.name || 'N/A'}\n\nPor favor, me informe sobre prazo de entrega, frete e formas de pagamento.`
  );

  const whatsappMessage = hasPrice ? whatsappBuyMessage : whatsappQuoteMessage;

  const productUrl = `/produto/${product.slug || product.id}`;

  return (
    <div className="modal-backdrop z-50 !p-2 sm:!p-4" onClick={onClose}>
      <div 
        className="modal-content max-w-3xl w-full relative overflow-hidden bg-white border-slate-200 rounded-3xl shadow-2xl" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors border border-slate-200"
          title="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          
          {/* Left Image View */}
          <div className="relative bg-slate-50 p-6 flex flex-col justify-between items-center border-b md:border-b-0 md:border-r border-slate-200">
            <div className="w-full aspect-square rounded-2xl overflow-hidden border border-slate-200 bg-white flex items-center justify-center shadow-sm">
              <img 
                src={product.image || (product.images && product.images[0]) || 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&auto=format&fit=crop&q=80'} 
                alt={product.name}
                className="w-full h-full object-contain p-2"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80';
                }}
              />
            </div>

            {/* Quality Badges */}
            <div className="w-full mt-4 flex items-center justify-between text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-1.5 text-amber-700 font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>Original Athena</span>
              </div>
              <div className="flex items-center gap-1 text-emerald-600 font-medium">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Entrega Rápida</span>
              </div>
            </div>
          </div>

          {/* Right Product Details */}
          <div className="p-6 flex flex-col justify-between space-y-6">
            
            <div className="space-y-4">
              
              {/* Category & Brand Pills */}
              <div className="flex flex-wrap items-center gap-2">
                {category && (
                  <span className="badge badge-gray">
                    <Layers className="w-3 h-3 text-amber-600" />
                    {category.name}
                  </span>
                )}
                {brand && (
                  <span className="badge badge-blue">
                    <Tag className="w-3 h-3 text-sky-600" />
                    {brand.name}
                  </span>
                )}
                {product.badge && (
                  <span className="badge badge-gold">
                    {product.badge}
                  </span>
                )}
                {(product.videoUrl || product.youtubeVideoUrl) && (
                  <a
                    href={product.videoUrl || product.youtubeVideoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="badge badge-red hover:bg-red-100 flex items-center gap-1 text-red-700 bg-red-50 border-red-200"
                  >
                    <Play className="w-3 h-3 fill-current text-red-600" />
                    <span>Vídeo Demonstrativo</span>
                  </a>
                )}
              </div>

              {/* Title */}
              <h2 className="text-xl font-bold text-slate-900 leading-snug">
                {product.name}
              </h2>

              {/* Price Banner */}
              {hasPrice ? (
                <div className="bg-amber-50/80 p-3.5 rounded-xl border border-amber-200 space-y-1">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-[10px] font-black text-amber-900 uppercase block tracking-wider">À Vista no PIX</span>
                      <span className="text-2xl font-black text-amber-950 font-display">
                        {pixCustomerPrice}
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-amber-800 bg-amber-100/90 px-2 py-0.5 rounded-md">
                      Melhor Preço
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-600 font-medium block">
                    {getBestInstallmentText(product.price, 12)}
                  </span>
                </div>
              ) : (
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex items-baseline justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-500 block uppercase">Investimento Estimado</span>
                    <span className="text-2xl font-extrabold text-amber-800 font-display">
                      {formattedPrice}
                    </span>
                  </div>
                  <span className="text-[11px] text-amber-800 bg-amber-100 px-2.5 py-1 rounded-lg font-semibold">
                    Consulte condições
                  </span>
                </div>
              )}

              {/* Description */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Descrição do Equipamento</h4>
                <div className="text-xs text-slate-600 leading-relaxed max-h-48 overflow-y-auto">
                  <FormattedDescription 
                    text={product.description} 
                    products={products}
                    onSelectProduct={onSelectProduct}
                  />
                </div>
              </div>

              {/* Specs List */}
              {product.specs && product.specs.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Especificações Técnicas</h4>
                  <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                    {product.specs.map((spec, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{spec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-slate-200 space-y-2">
              <a
                href={`https://wa.me/5561983485671?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full text-sm py-3 justify-center font-extrabold shadow-md rounded-2xl flex items-center gap-2 transition-all ${
                  hasPrice ? 'bg-amber-500 hover:bg-amber-600 text-slate-950' : 'btn-gold'
                }`}
              >
                {hasPrice ? <CreditCard className="w-5 h-5 shrink-0" /> : <MessageCircle className="w-5 h-5 fill-current" />}
                <span>{hasPrice ? 'Comprar Agora' : 'Solicitar Cotação Oficial no WhatsApp'}</span>
              </a>

              <a
                href={productUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full btn-secondary text-xs py-2 justify-center font-bold flex items-center gap-1.5 text-slate-700 hover:text-amber-900 hover:border-amber-400"
              >
                <ExternalLink className="w-3.5 h-3.5 text-amber-600" />
                <span>Abrir Página Completa do Equipamento (Nova Aba)</span>
              </a>

              <p className="text-[11px] text-center text-slate-500">
                Atendimento rápido via (61) 98348-5671
              </p>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
