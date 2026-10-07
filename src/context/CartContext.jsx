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
   * Adds an item to the shopping cart or quote list.
   * Supports variations (color, size, model) with smart fallback to parent price and image.
   * Dual-mode:
   * - Products with valid price can be purchased directly via checkout.
   * - Products Sob Consulta (quote-only) enter the list as quote items for multi-item WhatsApp quote generation.
   */
  const addToCart = (product, quantity = 1, selectedVariant = null) => {
    if (!product) return false;

    // Identifica se o item é para cotação (Sob Consulta / sem preço)
    const isQuoteItem = isProductQuoteOnly(product) || !(Number(product.price) > 0);

    // Se uma variação foi selecionada e o produto pode ser comprado online, valida disponibilidade
    if (selectedVariant && !isQuoteItem) {
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
    const effectivePrice = isQuoteItem
      ? 0
      : (selectedVariant?.price != null && Number(selectedVariant.price) > 0
          ? Number(selectedVariant.price)
          : Number(product.price) || 0);

    const brandObj = brands.find(b => b.id === product.brandId);
    const catObj = categories.find(c => c.id === product.categoryId);
    const cartItemId = selectedVariant ? `cart_${product.id}_${selectedVariant.id}` : `cart_${product.id}`;

    // Image with fallback: if variant has custom image, use it; otherwise use product image
    const effectiveImage = selectedVariant?.image || product.image || (Array.isArray(product.images) && product.images[0]) || '';

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
        isQuote: isQuoteItem,
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
      if (isQuoteItem) {
        showNotification(`"${product.name}${variantSuffix}" adicionado à sua lista de orçamento!`, 'success');
      } else {
        showNotification(`"${product.name}${variantSuffix}" adicionado ao carrinho!`, 'success');
      }
    }

    setIsCartOpen(true);
    return true;
  };

  /**
   * Adds multiple items/variants to the cart in a single batch operation.
   * Useful for B2B multi-variant matrix orders (e.g. spray guns with multiple nozzle sizes).
   */
  const addMultipleToCart = (itemsToAdd = []) => {
    if (!Array.isArray(itemsToAdd) || itemsToAdd.length === 0) return false;

    const brandMap = new Map((brands || []).map(b => [b.id, b.name]));
    const catMap = new Map((categories || []).map(c => [c.id, c.name]));

    setCartItems(prev => {
      let currentItems = [...prev];

      itemsToAdd.forEach(({ product, variant, quantity }) => {
        if (!product || !quantity || quantity <= 0) return;

        const isQuoteItem = isProductQuoteOnly(product) || !(Number(product.price) > 0);
        const effectivePrice = isQuoteItem
          ? 0
          : (variant?.price != null && Number(variant.price) > 0
              ? Number(variant.price)
              : Number(product.price) || 0);

        const cartItemId = variant ? `cart_${product.id}_${variant.id}` : `cart_${product.id}`;
        const effectiveImage = variant?.image || product.image || (Array.isArray(product.images) && product.images[0]) || '';

        const existingIdx = currentItems.findIndex(
          item => item.id === cartItemId || (item.productId === product.id && item.variantId === (variant?.id || null))
        );

        if (existingIdx !== -1) {
          currentItems[existingIdx] = {
            ...currentItems[existingIdx],
            quantity: currentItems[existingIdx].quantity + quantity
          };
        } else {
          currentItems.push({
            id: cartItemId,
            productId: product.id,
            name: product.name,
            slug: product.slug || product.id,
            price: effectivePrice,
            isQuote: isQuoteItem,
            image: effectiveImage,
            brandId: product.brandId,
            brandName: brandMap.get(product.brandId) || 'Athena',
            categoryId: product.categoryId,
            categoryName: catMap.get(product.categoryId) || '',
            variantId: variant?.id || null,
            variantName: variant?.name || null,
            variantColorHex: variant?.colorHex || null,
            sku: variant?.sku || product.sku || product.id,
            quantity: Math.max(1, quantity)
          });
        }
      });

      return currentItems;
    });

    const totalQty = itemsToAdd.reduce((sum, i) => sum + (Number(i.quantity) || 1), 0);
    if (showNotification) {
      showNotification(`${totalQty} item(ns) adicionado(s) à sua lista de orçamento!`, 'success');
    }

    setIsCartOpen(true);
    return true;
  };

  const removeFromCart = (targetId) => {
    setCartItems(prev => prev.filter(item => {
      if (item.id === targetId) return false;
      if (!item.variantId && item.productId === targetId) return false;
      return true;
    }));
    if (showNotification) {
      showNotification('Item removido do carrinho.', 'info');
    }
  };

  const updateQuantity = (targetId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(targetId);
      return;
    }

    setCartItems(prev =>
      prev.map(item => {
        const isMatch = item.id === targetId || (!item.variantId && item.productId === targetId);
        return isMatch
          ? { ...item, quantity: Math.min(99, Math.max(1, newQuantity)) }
          : item;
      })
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
    const effectiveImage = selectedVariant?.image || product.image || (Array.isArray(product.images) && product.images[0]) || '';

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

    const buyableItems = cartItems.filter(item => !item.isQuote && Number(item.price) > 0);

    if (buyableItems.length === 0) {
      if (showNotification) {
        showNotification('Os itens selecionados estão sob consulta. Utilize o botão "Solicitar Orçamento no WhatsApp" para falar com nossos consultores.', 'info');
      }
      return;
    }

    setCheckoutTarget({
      items: [...buyableItems]
    });

    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const closeCheckout = () => {
    setIsCheckoutOpen(false);
    setCheckoutTarget(null);
  };

  const totalItemCount = cartItems.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
  const quoteItems = cartItems.filter(item => item.isQuote || !(Number(item.price) > 0));
  const buyableItems = cartItems.filter(item => !item.isQuote && Number(item.price) > 0);
  const quoteItemCount = quoteItems.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
  const buyableItemCount = buyableItems.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
  const subtotal = buyableItems.reduce((sum, item) => sum + (Number(item.price) * (Number(item.quantity) || 1)), 0);

  /**
   * Generates formatted WhatsApp URL with all products selected in the cart for a quote.
   */
  const getWhatsAppQuoteUrl = () => {
    if (cartItems.length === 0) return 'https://wa.me/5561983485671';
    
    let message = 'Olá! Vim pelo site da Athena Soluções Automotivas e gostaria de fazer um orçamento dos seguintes produtos:\n\n';
    cartItems.forEach((item, idx) => {
      const brand = item.brandName ? ` [Marca: ${item.brandName}]` : '';
      const sku = item.sku ? ` (Cód/SKU: ${item.sku})` : '';
      const variantDisplay = item.variantName ? ` (${item.variantName})` : '';
      const priceText = (!item.isQuote && Number(item.price) > 0)
        ? ` - Ref. Valor: R$ ${(Number(item.price) * (Number(item.quantity) || 1)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
        : ' - Sob Consulta';
      message += `${idx + 1}. *${item.quantity}x ${item.name}${variantDisplay}*${brand}${sku}${priceText}\n`;
    });

    message += '\nPoderia me informar valores, condições comerciais, disponibilidade e prazo de entrega?';
    return `https://wa.me/5561983485671?text=${encodeURIComponent(message)}`;
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        totalItemCount,
        quoteItems,
        buyableItems,
        quoteItemCount,
        buyableItemCount,
        subtotal,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        addMultipleToCart,
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
        getWhatsAppQuoteUrl,
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
