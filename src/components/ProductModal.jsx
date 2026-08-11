import React from 'react';
import { X, CheckCircle2, ShieldCheck, Tag, Layers, MessageCircle, Sparkles } from 'lucide-react';

export default function ProductModal({ product, category, brand, onClose }) {
  if (!product) return null;

  const formattedPrice = product.price 
    ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)
    : 'Sob Consulta';

  const whatsappMessage = encodeURIComponent(
    `Olá Athena Soluções Automotivas!\n\nGostaria de mais informações e cotação para o equipamento:\n📌 *${product.name}*\n🏷️ Marca: ${brand?.name || 'N/A'}\n📁 Categoria: ${category?.name || 'N/A'}\n\nPor favor, me informe sobre prazo de entrega, frete e formas de pagamento.`
  );

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="modal-content max-w-3xl relative overflow-hidden bg-white border-slate-200" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors border border-slate-200"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          
          {/* Left Image View */}
          <div className="relative bg-slate-50 p-6 flex flex-col justify-between items-center border-b md:border-b-0 md:border-r border-slate-200">
            <div className="w-full aspect-square rounded-2xl overflow-hidden border border-slate-200 bg-white flex items-center justify-center shadow-sm">
              <img 
                src={product.image || 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&auto=format&fit=crop&q=80'} 
                alt={product.name}
                className="w-full h-full object-cover"
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
              </div>

              {/* Title */}
              <h2 className="text-xl font-bold text-slate-900 leading-snug">
                {product.name}
              </h2>

              {/* Price Banner */}
              <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200 flex items-baseline justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-500 block uppercase">Investimento Estimado</span>
                  <span className="text-2xl font-extrabold text-amber-700 font-display">
                    {formattedPrice}
                  </span>
                </div>
                <span className="text-[11px] text-amber-800 bg-amber-100 px-2.5 py-1 rounded-lg font-semibold">
                  Consulte condições
                </span>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Descrição do Equipamento</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {product.description}
                </p>
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
                className="w-full btn-gold text-sm py-3 justify-center font-extrabold shadow-md"
              >
                <MessageCircle className="w-5 h-5 fill-current" />
                <span>Solicitar Cotação Oficial no WhatsApp</span>
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
