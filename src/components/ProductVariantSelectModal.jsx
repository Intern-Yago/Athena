import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  ShoppingCart, 
  MessageCircle, 
  Check, 
  Minus, 
  Plus, 
  Layers, 
  ExternalLink, 
  Package,
  AlertCircle,
  Tag
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { isProductQuoteOnly, getVariantAvailability, isVariantVisibleInCatalog } from '../utils/productVariants';
import { formatBRL } from '../utils/installmentCalculator';

export default function ProductVariantSelectModal({
  isOpen,
  onClose,
  product,
  brand,
  category,
  onSelectProduct
}) {
  const { addMultipleToCart } = useCart();

  // Get active/visible variants
  const variants = useMemo(() => {
    if (!product || !Array.isArray(product.variants)) return [];
    return product.variants.filter(v => isVariantVisibleInCatalog(v, product));
  }, [product]);

  // Track quantities for each variant
  const [quantities, setQuantities] = useState({});
  const [activePreviewVariant, setActivePreviewVariant] = useState(null);

  // Initialize quantities when modal opens or product changes
  useEffect(() => {
    if (isOpen && variants.length > 0) {
      const initial = {};
      const firstAvailable = variants.find(v => {
        const avail = getVariantAvailability(v, product);
        return avail.available;
      }) || variants[0];

      variants.forEach(v => {
        // By default, preselect 1 for the first available variant and 0 for others
        initial[v.id] = (v.id === firstAvailable?.id) ? 1 : 0;
      });
      setQuantities(initial);
      setActivePreviewVariant(firstAvailable);
    }
  }, [isOpen, product?.id, variants]);

  // Lock background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      const originalPaddingRight = document.body.style.paddingRight;
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

      document.body.style.overflow = 'hidden';
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }

      const handleKeyDown = (e) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);

      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.paddingRight = originalPaddingRight;
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen || !product) return null;

  const isQuoteOnly = isProductQuoteOnly(product);

  const handleQuantityChange = (variantId, delta) => {
    setQuantities(prev => {
      const current = prev[variantId] || 0;
      const next = Math.max(0, Math.min(99, current + delta));
      return { ...prev, [variantId]: next };
    });
  };

  const handleDirectQuantityInput = (variantId, value) => {
    const parsed = parseInt(value, 10);
    const next = isNaN(parsed) ? 0 : Math.max(0, Math.min(99, parsed));
    setQuantities(prev => ({ ...prev, [variantId]: next }));
  };

  // Selected items with quantity > 0
  const selectedItems = variants
    .map(variant => ({
      product,
      variant,
      quantity: quantities[variant.id] || 0
    }))
    .filter(item => item.quantity > 0);

  const totalSelectedQty = selectedItems.reduce((acc, item) => acc + item.quantity, 0);

  // Preview image: active selected variant or base product image
  const displayImage = activePreviewVariant?.image || product.image || (Array.isArray(product.images) && product.images[0]) || '';

  // Add all selected items to cart
  const handleAddToCart = () => {
    if (selectedItems.length === 0) return;
    if (addMultipleToCart) {
      addMultipleToCart(selectedItems);
    }
    onClose();
  };

  // Generate direct WhatsApp quote message with all selected items
  const handleQuoteViaWhatsApp = () => {
    if (selectedItems.length === 0) return;

    let message = `Olá! Vim pelo site da Athena Soluções Automotivas e gostaria de fazer um orçamento do seguinte equipamento:\n\n*${product.name}*\nMarca: ${brand?.name || 'Athena'}${category?.name ? ` | Categoria: ${category.name}` : ''}\n\n*Opções e quantidades desejadas:*`;

    selectedItems.forEach((item, idx) => {
      const sku = item.variant.sku ? ` (Cód/SKU: ${item.variant.sku})` : '';
      message += `\n${idx + 1}. *${item.quantity}x ${item.variant.name}*${sku}`;
    });

    message += '\n\nPoderia me informar valores, disponibilidade e opções de frete?';
    const whatsappUrl = `https://wa.me/5561983485671?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Modal / Bottom Sheet Content */}
      <div 
        className="relative w-full sm:max-w-xl bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl z-10 flex flex-col max-h-[92vh] sm:max-h-[85vh] overflow-hidden animate-slide-up sm:animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile drag handle */}
        <div className="sm:hidden w-12 h-1.5 bg-slate-300 rounded-full mx-auto my-2 shrink-0" />

        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-start justify-between gap-3 bg-gradient-to-b from-slate-50 to-white shrink-0">
          <div className="flex items-center gap-3.5 min-w-0">
            {/* Thumbnail */}
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-white border border-slate-200 p-1 shrink-0 overflow-hidden flex items-center justify-center shadow-2xs">
              {displayImage ? (
                <img 
                  src={displayImage} 
                  alt={activePreviewVariant?.name || product.name} 
                  className="w-full h-full object-contain"
                />
              ) : (
                <Package className="w-6 h-6 text-slate-300" />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                {brand && (
                  <span className="text-[10px] font-black text-amber-800 bg-amber-100/90 border border-amber-300 px-2 py-0.5 rounded-md uppercase">
                    {brand.name}
                  </span>
                )}
                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                  {variants.length} opções disponíveis
                </span>
              </div>
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 leading-snug truncate mt-1">
                {product.name}
              </h3>
              <p className="text-[11px] text-slate-500 truncate mt-0.5">
                Selecione as opções e defina as quantidades para o orçamento
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer shrink-0"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Variants List / Matrix */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-2.5 divide-y divide-slate-100">
          {variants.map((v) => {
            const avail = getVariantAvailability(v, product);
            const qty = quantities[v.id] || 0;
            const isSelected = qty > 0;
            const isPreviewing = activePreviewVariant?.id === v.id;
            const variantImage = v.image || product.image;

            return (
              <div 
                key={v.id}
                onClick={() => setActivePreviewVariant(v)}
                className={`pt-2.5 first:pt-0 p-3 rounded-xl border transition-all cursor-pointer ${
                  isSelected 
                    ? 'bg-amber-50/60 border-amber-300 shadow-2xs' 
                    : isPreviewing 
                      ? 'bg-slate-50 border-slate-300' 
                      : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  {/* Left: Thumbnail & Name */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* Variant Thumbnail */}
                    <div className="w-11 h-11 rounded-lg bg-white border border-slate-200 p-0.5 shrink-0 overflow-hidden flex items-center justify-center">
                      {variantImage ? (
                        <img 
                          src={variantImage} 
                          alt={v.name} 
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <Layers className="w-4 h-4 text-slate-400" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {v.colorHex && (
                          <span 
                            className="w-3.5 h-3.5 rounded-full border border-slate-300 shadow-2xs shrink-0" 
                            style={{ backgroundColor: v.colorHex }} 
                            title={v.name}
                          />
                        )}
                        <span className="font-extrabold text-xs text-slate-900 block truncate">
                          {v.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                        {v.sku && (
                          <span className="font-mono text-[10px] text-slate-400">
                            Cód: {v.sku}
                          </span>
                        )}
                        <span>•</span>
                        <span className={`text-[10px] font-bold ${
                          isQuoteOnly 
                            ? 'text-amber-800' 
                            : Number(v.price) > 0 
                              ? 'text-emerald-700 font-extrabold' 
                              : 'text-slate-600'
                        }`}>
                          {isQuoteOnly 
                            ? 'Sob Consulta' 
                            : (Number(v.price) > 0 ? formatBRL(v.price) : 'Sob Consulta')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Stepper [-] [ Qtd ] [+] */}
                  <div 
                    className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(v.id, -1)}
                      disabled={qty === 0}
                      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                        qty === 0 
                          ? 'text-slate-300 bg-slate-50 cursor-not-allowed' 
                          : 'text-slate-700 hover:bg-slate-100 active:scale-95'
                      }`}
                      title="Diminuir"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>

                    <input
                      type="number"
                      min="0"
                      max="99"
                      value={qty}
                      onChange={(e) => handleDirectQuantityInput(v.id, e.target.value)}
                      className="w-9 text-center font-extrabold text-xs text-slate-900 bg-transparent focus:outline-hidden"
                    />

                    <button
                      type="button"
                      onClick={() => handleQuantityChange(v.id, 1)}
                      className="w-7 h-7 rounded-lg text-slate-700 hover:bg-slate-100 active:scale-95 flex items-center justify-center transition-all cursor-pointer"
                      title="Aumentar"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 shrink-0 space-y-3">
          {/* Summary line */}
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span>Total de itens selecionados:</span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-black ${
              totalSelectedQty > 0 
                ? 'bg-amber-500 text-slate-950' 
                : 'bg-slate-200 text-slate-600'
            }`}>
              {totalSelectedQty} {totalSelectedQty === 1 ? 'item' : 'itens'}
            </span>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={totalSelectedQty === 0}
              className={`py-3 px-4 rounded-xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all ${
                totalSelectedQty > 0
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer active:scale-98'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <ShoppingCart className="w-4 h-4 shrink-0" />
              <span>
                {totalSelectedQty > 0
                  ? `+ Adicionar à Lista (${totalSelectedQty})`
                  : 'Selecione uma opção'}
              </span>
            </button>

            <button
              type="button"
              onClick={handleQuoteViaWhatsApp}
              disabled={totalSelectedQty === 0}
              className={`py-3 px-4 rounded-xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all ${
                totalSelectedQty > 0
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer active:scale-98'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <MessageCircle className="w-4 h-4 shrink-0" />
              <span>Cotar no WhatsApp</span>
            </button>
          </div>

          {/* Bottom link to view full product page */}
          {onSelectProduct && (
            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => {
                  onSelectProduct(product);
                  onClose();
                }}
                className="text-[11px] font-bold text-slate-500 hover:text-amber-700 inline-flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>Ver página com especificações completas deste equipamento</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
