import React, { createContext, useContext, useState, useEffect } from 'react';
import { safeStorageGet, safeStorageSet } from '../utils/storage';

const CartContext = createContext();

export function CartProvider({ children, showNotification, brands = [], categories = [] }) {
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
   * STRICT RULE: Only products with a valid price (not negotiable / not quote-only) can enter the cart.
   */
  const addToCart = (product, quantity = 1) => {
    if (!product) return false;

    // Quote-only / negotiable check
    const hasPrice = Number(product.price) > 0 && !product.priceNegotiable;
    if (!hasPrice) {
      if (showNotification) {
        showNotification('Este equipamento está sob consulta e deve ser cotado diretamente com nossos consultores.', 'info');
      }
      return false;
    }

    const brandObj = brands.find(b => b.id === product.brandId);
    const catObj = categories.find(c => c.id === product.categoryId);

    setCartItems(prev => {
      const existingIdx = prev.findIndex(item => item.productId === product.id);
      if (existingIdx !== -1) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: updated[existingIdx].quantity + quantity
        };
        return updated;
      }

      const newItem = {
        id: `cart_${product.id}`,
        productId: product.id,
        name: product.name,
        slug: product.slug || product.id,
        price: Number(product.price),
        image: product.image || (product.images && product.images[0]) || 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=200',
        brandId: product.brandId,
        brandName: brandObj?.name || 'Athena',
        categoryId: product.categoryId,
        categoryName: catObj?.name || '',
        quantity: Math.max(1, quantity)
      };

      return [...prev, newItem];
    });

    if (showNotification) {
      showNotification(`"${product.name}" adicionado ao carrinho!`, 'success');
    }

    setIsCartOpen(true);
    return true;
  };

  const removeFromCart = (productId) => {
    setCartItems(prev => prev.filter(item => item.productId !== productId));
    if (showNotification) {
      showNotification('Item removido do carrinho.', 'info');
    }
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCartItems(prev =>
      prev.map(item =>
        item.productId === productId
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
  const openDirectCheckout = (product, quantity = 1) => {
    const hasPrice = Number(product.price) > 0 && !product.priceNegotiable;
    if (!hasPrice) {
      if (showNotification) {
        showNotification('Este equipamento está sob consulta e deve ser cotado diretamente com nossos consultores.', 'info');
      }
      return false;
    }

    const brandObj = brands.find(b => b.id === product.brandId);
    const catObj = categories.find(c => c.id === product.categoryId);

    setCheckoutTarget({
      items: [{
        id: `direct_${product.id}`,
        productId: product.id,
        name: product.name,
        slug: product.slug || product.id,
        price: Number(product.price),
        image: product.image || (product.images && product.images[0]) || 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=200',
        brandId: product.brandId,
        brandName: brandObj?.name || 'Athena',
        categoryId: product.categoryId,
        categoryName: catObj?.name || '',
        quantity: Math.max(1, quantity)
      }]
    });

    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  // Open checkout for all items in the cart
  const openCartCheckout = () => {
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
        closeCheckout
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
