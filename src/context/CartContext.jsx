import React, { createContext, useContext, useState, useEffect } from 'react';
import { safeStorageGet, safeStorageSet } from '../utils/storage';
import { isProductQuoteOnly, getVariantAvailability } from '../utils/productVariants';

const CartContext = createContext();

export function CartProvider({ children, showNotification, brands = [], categories = [], requireVerification }) {
  const [cartItems, setCartItems] = useState(() => {
    const saved = safeStorageGet('athena_cart_items', []);
    return Array.isArray(saved) ? saved : [];
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutTarget, setCheckoutTarget] = useState(null); // null = cart checkout, { items: [...] } = direct buy
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  // Sync to localStorage
  useEffect(() => {
    safeStorageSet('athena_cart_items', cartItems);
  }, [cartItems]);

  /**
   * Adds an item to the shopping cart.
   * Supports variations (color, size, model) with smart fallback to parent price and image.
   * STRICT RULE: Only products with a valid price (not negotiable / not quote-only) can enter the cart.
   */
  const addToCart = (product, quantity = 1, selectedVariant = null) => {
    if (!product) return false;

    // Regra 1: Se o produto principal estiver "Sob Consulta", TODAS as variações ficam sob consulta
    if (isProductQuoteOnly(product)) {
      if (showNotification) {
        showNotification('Este equipamento e suas opções estão sob consulta e devem ser cotados diretamente com nossos consultores.', 'info');
      }
      return false;
    }

    // Regra 2: Se uma variação foi selecionada, valida a disponibilidade para venda
    if (selectedVariant) {
      const avail = getVariantAvailability(selectedVariant, product);
      if (!avail.canBuy) {
        if (showNotification) {
          if (avail.reason === 'auto_inactive') {
            showNotification(`A opção "${selectedVariant.name}" esgotou no estoque e foi desativada automaticamente.`, 'warning');
          } else {
            showNotification(`A opção "${selectedVariant.name}" está desativada no momento.`, 'warning');
          }
        }
        return false;
      }
    }

    // Price with fallback: if variant has custom price, use it; otherwise use product base price
    const effectivePrice = selectedVariant?.price != null && Number(selectedVariant.price) > 0
      ? Number(selectedVariant.price)
      : Number(product.price);

    const hasPrice = effectivePrice > 0;
    if (!hasPrice) {
      if (showNotification) {
        showNotification('Este equipamento está sob consulta e deve ser cotado diretamente com nossos consultores.', 'info');
      }
      return false;
    }

    const brandObj = brands.find(b => b.id === product.brandId);
    const catObj = categories.find(c => c.id === product.categoryId);
    const cartItemId = selectedVariant ? `cart_${product.id}_${selectedVariant.id}` : `cart_${product.id}`;

    // Image with fallback: if variant has custom image, use it; otherwise use product image
    const effectiveImage = selectedVariant?.image || product.image || (product.images && product.images[0]) || 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=200';

    setCartItems(prev => {
      const existingIdx = prev.findIndex(item => item.id === cartItemId || (item.productId === product.id && item.variantId === (selectedVariant?.id || null)));
      if (existingIdx !== -1) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: updated[existingIdx].quantity + quantity
        };
        return updated;
      }

      const newItem = {
        id: cartItemId,
        productId: product.id,
        name: product.name,
        slug: product.slug || product.id,
        price: effectivePrice,
        image: effectiveImage,
        brandId: product.brandId,
        brandName: brandObj?.name || 'Athena',
        categoryId: product.categoryId,
        categoryName: catObj?.name || '',
        variantId: selectedVariant?.id || null,
        variantName: selectedVariant?.name || null,
        variantColorHex: selectedVariant?.colorHex || null,
        sku: selectedVariant?.sku || product.sku || product.id,
        quantity: Math.max(1, quantity)
      };

      return [...prev, newItem];
    });

    if (showNotification) {
      const variantSuffix = selectedVariant?.name ? ` (${selectedVariant.name})` : '';
      showNotification(`"${product.name}${variantSuffix}" adicionado ao carrinho!`, 'success');
    }

    setIsCartOpen(true);
    return true;
  };

  const removeFromCart = (itemIdOrProductId) => {
    setCartItems(prev => prev.filter(item => item.id !== itemIdOrProductId && item.productId !== itemIdOrProductId));
    if (showNotification) {
      showNotification('Item removido do carrinho.', 'info');
    }
  };

  const updateQuantity = (itemIdOrProductId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(itemIdOrProductId);
      return;
    }

    setCartItems(prev =>
      prev.map(item =>
        (item.id === itemIdOrProductId || item.productId === itemIdOrProductId)
          ? { ...item, quantity: Math.min(99, Math.max(1, newQuantity)) }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    setAppliedCoupon(null);
  };

  // Direct checkout for single product (Buy Now)
  const openDirectCheckout = (product, quantity = 1, selectedVariant = null) => {
    if (requireVerification && requireVerification(() => openDirectCheckout(product, quantity, selectedVariant))) {
      return false;
    }

    // Regra 1: Se o produto principal estiver "Sob Consulta", TODAS as variações ficam sob consulta
    if (isProductQuoteOnly(product)) {
      if (showNotification) {
        showNotification('Este equipamento e suas opções estão sob consulta e devem ser cotados diretamente com nossos consultores.', 'info');
      }
      return false;
    }

    // Regra 2: Se uma variação foi selecionada, valida a disponibilidade para venda
    if (selectedVariant) {
      const avail = getVariantAvailability(selectedVariant, product);
      if (!avail.canBuy) {
        if (showNotification) {
          if (avail.reason === 'auto_inactive') {
            showNotification(`A opção "${selectedVariant.name}" esgotou no estoque e foi desativada automaticamente.`, 'warning');
          } else {
            showNotification(`A opção "${selectedVariant.name}" está desativada no momento.`, 'warning');
          }
        }
        return false;
      }
    }

    const effectivePrice = selectedVariant?.price != null && Number(selectedVariant.price) > 0
      ? Number(selectedVariant.price)
      : Number(product.price);

    const hasPrice = effectivePrice > 0;
    if (!hasPrice) {
      if (showNotification) {
        showNotification('Este equipamento está sob consulta e deve ser cotado diretamente com nossos consultores.', 'info');
      }
      return false;
    }

    const brandObj = brands.find(b => b.id === product.brandId);
    const catObj = categories.find(c => c.id === product.categoryId);
    const effectiveImage = selectedVariant?.image || product.image || (product.images && product.images[0]) || 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=200';

    setCheckoutTarget({
      items: [{
        id: selectedVariant ? `direct_${product.id}_${selectedVariant.id}` : `direct_${product.id}`,
        productId: product.id,
        name: product.name,
        slug: product.slug || product.id,
        price: effectivePrice,
        image: effectiveImage,
        brandId: product.brandId,
        brandName: brandObj?.name || 'Athena',
        categoryId: product.categoryId,
        categoryName: catObj?.name || '',
        variantId: selectedVariant?.id || null,
        variantName: selectedVariant?.name || null,
        variantColorHex: selectedVariant?.colorHex || null,
        sku: selectedVariant?.sku || product.sku || product.id,
        quantity: Math.max(1, quantity)
      }]
    });

    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  // Open checkout for all items in the cart
  const openCartCheckout = () => {
    if (requireVerification && requireVerification(() => openCartCheckout())) {
      return false;
    }

    if (cartItems.length === 0) {
      if (showNotification) {
        showNotification('Seu carrinho está vazio. Adicione produtos para prosseguir.', 'error');
      }
      return;
    }

    setCheckoutTarget({
      items: [...cartItems]
    });

    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const closeCheckout = () => {
    setIsCheckoutOpen(false);
    setCheckoutTarget(null);
  };

  const totalItemCount = cartItems.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
  const subtotal = cartItems.reduce((sum, item) => sum + (Number(item.price) * (Number(item.quantity) || 1)), 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        totalItemCount,
        subtotal,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        appliedCoupon,
        setAppliedCoupon,
        isCheckoutOpen,
        checkoutTarget,
        openDirectCheckout,
        openCartCheckout,
        closeCheckout,
        requireVerification
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
