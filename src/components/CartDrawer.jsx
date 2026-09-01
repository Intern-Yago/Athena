import React, { useEffect } from 'react';
import { 
  ShoppingCart, 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles,
  Layers,
  CreditCard,
  Zap
} from 'lucide-react';
import { useCart } from '../context/CartContext';

export function CartDrawer() {
  const {
    cartItems,
    totalItemCount,
    subtotal,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    clearCart,
    openCartCheckout
  } = useCart();

  // Lock background scroll when cart drawer is open to eliminate background lag
  useEffect(() => {
    if (isCartOpen) {
      const originalOverflow = document.body.style.overflow;
      const originalPaddingRight = document.body.style.paddingRight;
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

      document.body.style.overflow = 'hidden';
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }

      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.paddingRight = originalPaddingRight;
      };
    }
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  const formatBRL = (val) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-150 overscroll-none">
      {/* Backdrop */}
      <div 
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-slate-950/75 transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between border-l border-slate-200 animate-in slide-in-from-right duration-300">
          
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <ShoppingCart className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm sm:text-base leading-none">
                  Carrinho de Compras
                </h3>
                <span className="text-[11px] text-slate-400 font-medium">
                  {totalItemCount} {totalItemCount === 1 ? 'item selecionado' : 'itens selecionados'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {cartItems.length > 0 && (
                <button
                  type="button"
                  onClick={clearCart}
                  className="text-[11px] text-slate-400 hover:text-red-400 font-semibold px-2 py-1 rounded hover:bg-slate-800 transition-colors"
                  title="Esvaziar carrinho"
                >
                  Limpar
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsCartOpen(false)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-5 space-y-3 divide-y divide-slate-100">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 px-4 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shadow-sm">
                  <ShoppingCart className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-900 text-sm">Seu carrinho está vazio</h4>
                  <p className="text-xs text-slate-500 max-w-xs">
                    Navegue pelo catálogo e adicione equipamentos ou licenças com compra direta.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCartOpen(false)}
                  className="btn-gold text-xs font-bold py-2.5 px-5 rounded-xl shadow-sm inline-flex items-center gap-2 cursor-pointer"
                >
                  <span>Explorar Catálogo</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              cartItems.map((item) => {
                const itemTotal = Number(item.price) * (Number(item.quantity) || 1);
                return (
                  <div key={item.productId} className="pt-3 first:pt-0 flex items-start gap-3 text-xs">
                    {/* Thumbnail */}
                    <div className="w-16 h-16 rounded-xl bg-slate-50 border border-slate-200 p-1 shrink-0 overflow-hidden flex items-center justify-center">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-contain"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block truncate">
                        {item.brandName || 'Athena'}
                      </span>
                      <h5 className="font-bold text-slate-900 leading-snug line-clamp-2">
                        {item.name}
                      </h5>
                      <div className="flex items-center justify-between gap-2 pt-1">
                        <span className="font-extrabold text-amber-900 text-xs sm:text-sm">
                          {formatBRL(itemTotal)}
                        </span>
                        {item.quantity > 1 && (
                          <span className="text-[10px] text-slate-400">
                            ({formatBRL(item.price)} cada)
                          </span>
                        )}
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-1.5 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            className="w-5 h-5 rounded bg-white hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors"
                            title="Diminuir quantidade"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-bold text-xs px-2 text-slate-900 min-w-[20px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            className="w-5 h-5 rounded bg-white hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors"
                            title="Aumentar quantidade"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeFromCart(item.productId)}
                          className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Remover este item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer & Checkout Trigger */}
          {cartItems.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 space-y-3.5">
              {/* Totals Breakdown */}
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Subtotal ({totalItemCount} {totalItemCount === 1 ? 'item' : 'itens'}):</span>
                  <span className="font-bold text-slate-900">{formatBRL(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Pagamento:</span>
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <Zap className="w-3 h-3" /> PIX ou Cartão até 12x
                  </span>
                </div>
                <div className="border-t border-slate-200/80 pt-1.5 flex items-center justify-between">
                  <span className="font-extrabold text-slate-900 text-sm">Total do Pedido:</span>
                  <span className="font-black text-base sm:text-lg text-amber-900">
                    {formatBRL(subtotal)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={openCartCheckout}
                  className="w-full bg-amber-500 hover:bg-amber-600 active:scale-[0.99] text-slate-950 font-black text-sm py-3.5 px-4 rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all border border-amber-400 group"
                >
                  <CreditCard className="w-5 h-5 text-slate-950 group-hover:scale-110 transition-transform shrink-0" />
                  <span className="text-slate-950 font-black tracking-wide">Finalizar Compra Segura</span>
                  <ArrowRight className="w-5 h-5 text-slate-950 shrink-0" />
                </button>

                <button
                  type="button"
                  onClick={() => setIsCartOpen(false)}
                  className="w-full py-2 text-center text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Continuar Comprando
                </button>
              </div>

              {/* Security Seal */}
              <div className="pt-1 flex items-center justify-center gap-2 text-[10px] text-slate-400 border-t border-slate-200/60">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Ambiente Criptografado & Processado via Asaas Gateway</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CartDrawer;
