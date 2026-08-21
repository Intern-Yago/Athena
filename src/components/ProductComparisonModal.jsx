import React from 'react';
import { X, ArrowLeftRight, CheckCircle2, MessageCircle, Eye, Tag, Layers, Trash2, Download } from 'lucide-react';

export default function ProductComparisonModal({
  isOpen,
  onClose,
  comparisonList,
  categories,
  brands,
  onRemoveItem,
  onClearComparison,
  onNavigate
}) {
  if (!isOpen || !comparisonList || comparisonList.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 md:p-6 animate-fade-in">
      <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black font-display text-white">
                Comparativo de Equipamentos
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400">
                Análise técnica lado a lado de {comparisonList.length} modelos
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClearComparison}
              className="px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors hidden sm:flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" /> Limpar Todos
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content - Side by side columns */}
        <div className="overflow-y-auto overflow-x-auto p-4 sm:p-6 flex-1">
          <div className={`grid gap-4 sm:gap-6 min-w-[550px] ${
            comparisonList.length === 2 ? 'grid-cols-2' : 'grid-cols-3'
          }`}>
            {comparisonList.map((prod) => {
              const category = categories.find((c) => c.id === prod.categoryId);
              const brand = brands.find((b) => b.id === prod.brandId);

              const formattedPrice = prod.price 
                ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(prod.price)
                : 'Sob Consulta';

              const whatsappText = encodeURIComponent(
                `Olá Athena Soluções Automotivas! Estive comparando o equipamento *${prod.name}* (Marca: ${brand?.name || 'Athena'}) no site e gostaria de uma proposta oficial com prazo de entrega e condições.`
              );

              return (
                <div 
                  key={prod.id} 
                  className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-4 hover:border-amber-400 transition-colors"
                >
                  
                  {/* Top Bar with Remove */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-full bg-white text-slate-700 border border-slate-200">
                      {category?.name || 'Equipamento'}
                    </span>

                    <button
                      onClick={() => onRemoveItem(prod.id)}
                      className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Remover este produto da comparação"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Product Image */}
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-white border border-slate-200">
                    <img
                      src={prod.image || 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&auto=format&fit=crop&q=80'}
                      alt={prod.name}
                      className="w-full h-full object-cover"
                    />
                    {prod.badge && (
                      <span className="absolute top-2 left-2 bg-amber-500 text-slate-950 font-extrabold text-[10px] px-2 py-0.5 rounded-md shadow-xs">
                        {prod.badge}
                      </span>
                    )}
                  </div>

                  {/* Brand & Title */}
                  <div className="space-y-1">
                    {brand && (
                      <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500">
                        <Tag className="w-3 h-3 text-amber-600" />
                        <span>{brand.name}</span>
                      </div>
                    )}
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                      {prod.name}
                    </h3>
                  </div>

                  {/* Price Block */}
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">
                      {prod.price > 0 ? (prod.priceNegotiable ? 'Preço Estimado' : 'Valor Comercial') : 'Condição Comercial'}
                    </span>
                    <span className="text-sm sm:text-base font-extrabold text-amber-800 font-display">
                      {formattedPrice}
                    </span>
                  </div>

                  {/* Technical Specifications Checklist */}
                  <div className="space-y-2 flex-1">
                    <span className="text-[11px] font-extrabold text-slate-900 uppercase tracking-wide block">
                      Especificações Técnicas:
                    </span>
                    <div className="space-y-1.5 bg-white p-3 rounded-xl border border-slate-200 text-[11px] text-slate-700">
                      {prod.specs && prod.specs.length > 0 ? (
                        prod.specs.map((spec, idx) => (
                          <div key={idx} className="flex items-start gap-1.5 leading-relaxed">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{spec}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-slate-400 italic">Consulte a ficha técnica completa.</p>
                      )}
                    </div>
                  </div>

                  {/* Action CTAs */}
                  <div className="space-y-2 pt-2 border-t border-slate-200">
                    <a
                      href={`https://wa.me/5561983485671?text=${whatsappText}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 px-3 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 flex items-center justify-center gap-1.5 shadow-sm transition-colors text-decoration-none"
                    >
                      <MessageCircle className="w-4 h-4 fill-current shrink-0" />
                      <span>Cotar este Modelo</span>
                    </a>

                    <button
                      onClick={() => {
                        onClose();
                        onNavigate(`produto/${prod.slug || prod.id}`);
                      }}
                      className="w-full btn-secondary text-xs py-2 justify-center"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-600" />
                      <span>Ver Página Completa</span>
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 bg-slate-100 border-t border-slate-200 text-center text-[11px] text-slate-600">
          💡 <strong>Dica Athena:</strong> Nossos consultores técnicos auxiliam no dimensionamento elétrico, alvenaria e compatibilidade de equipamentos para sua oficina.
        </div>

      </div>
    </div>
  );
}
