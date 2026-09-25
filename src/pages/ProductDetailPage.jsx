import React, { useState, useEffect, useMemo } from 'react';
import ProductCard from '../components/ProductCard';
import ProductImageGallery from '../components/ProductImageGallery';
import FormattedDescription, { stripFormattingTags } from '../components/FormattedDescription';
import ProductModal from '../components/ProductModal';
import InstallmentModal from '../components/InstallmentModal';
import { getBestInstallmentText, calculatePaymentGateways, formatBRL } from '../utils/installmentCalculator';
import NotFoundPage from './NotFoundPage';
import { isProductPublished, normalizeProduct } from '../utils/imageUrl';
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Tag, 
  Layers, 
  MessageCircle, 
  PhoneCall, 
  Sparkles, 
  Truck, 
  Package, 
  FileText, 
  Download, 
  ArrowLeftRight,
  Eye,
  Edit3,
  Share2,
  Copy,
  Check,
  Play,
  Film,
  ExternalLink,
  CreditCard,
  QrCode,
  ShoppingCart,
  Zap,
  AlertTriangle,
  Box,
  Loader2
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { isProductQuoteOnly, getVariantAvailability, isVariantActiveForSale } from '../utils/productVariants';

export function getVideoEmbedInfo(url) {
  if (!url || typeof url !== 'string') return null;
  let trimmed = url.trim();
  if (!trimmed) return null;

  // Extract src from iframe if user pasted embed code
  const iframeSrcMatch = trimmed.match(/<iframe\b[^>]*\bsrc=["']([^"']+)["']/i);
  if (iframeSrcMatch && iframeSrcMatch[1]) {
    trimmed = iframeSrcMatch[1].trim();
  }

  // 1. Instagram: reel, post (p), or tv
  const instaMatch = trimmed.match(/(?:instagram\.com|instagr\.am)\/(?:reel|p|tv)\/([a-zA-Z0-9_-]+)/i);
  if (instaMatch && instaMatch[1]) {
    const code = instaMatch[1];
    const isReel = trimmed.includes('/reel/');
    return {
      type: 'instagram',
      platform: 'Instagram',
      embedUrl: `https://www.instagram.com/${isReel ? 'reel' : 'p'}/${code}/embed/`,
      isVertical: true,
      originalUrl: trimmed
    };
  }

  // 2. YouTube Shorts
  const shortsMatch = trimmed.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/i);
  if (shortsMatch && shortsMatch[1]) {
    return {
      type: 'youtube-shorts',
      platform: 'YouTube Shorts',
      embedUrl: `https://www.youtube.com/embed/${shortsMatch[1]}`,
      isVertical: true,
      originalUrl: trimmed
    };
  }

  // 3. YouTube Standard (watch?v=, youtu.be, embed/)
  const ytMatch = trimmed.match(/(?:youtube(?:-nocookie)?\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i);
  if (ytMatch && ytMatch[1]) {
    return {
      type: 'youtube',
      platform: 'YouTube',
      embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}`,
      isVertical: false,
      originalUrl: trimmed
    };
  }

  // 4. Direct embed url fallback
  if (trimmed.startsWith('https://www.youtube.com/embed/')) {
    return {
      type: 'youtube',
      platform: 'YouTube',
      embedUrl: trimmed,
      isVertical: false,
      originalUrl: trimmed
    };
  }

  return null;
}

export function getYouTubeEmbedUrl(url) {
  const info = getVideoEmbedInfo(url);
  return info ? info.embedUrl : null;
}

export const formatAttachmentLabel = (fileName) => {
  if (!fileName || typeof fileName !== 'string') return 'Documento';
  
  // 1. If it's a URL or path, extract just the file name at the end
  let cleanName = fileName.split('/').pop().split('?')[0] || fileName;
  
  // 2. Remove file extension (.pdf, .PDF, .doc, etc.)
  cleanName = cleanName.replace(/\.[^/.]+$/, '');
  
  // 3. Decode URI and replace underscores and multiple hyphens with spaces
  try {
    cleanName = decodeURIComponent(cleanName);
  } catch (e) {}
  
  cleanName = cleanName.replace(/[_]/g, ' ').replace(/-+/g, ' ').replace(/\.+/g, ' ');
  
  // 4. Normalize spaces
  cleanName = cleanName.replace(/\s+/g, ' ').trim();
  if (!cleanName) return 'Documento';
  
  // 5. Capitalize words (preserving uppercase acronyms / model codes like MAH, 3004, REV02)
  const words = cleanName.split(' ');
  const capitalized = words.map(w => {
    if (!w) return '';
    if (w.length > 1 && w === w.toUpperCase() && !/[a-z]/.test(w)) return w;
    return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
  }).join(' ');

  return capitalized;
};

export function decodeDraftFromToken(token) {
  try {
    if (!token || typeof token !== 'string') return null;
    let clean = token.trim();
    try {
      clean = decodeURIComponent(clean);
    } catch (e) {}
    // URLSearchParams automatically converts '+' into ' '. Normalize back to '+' for base64 decoding:
    const normalized = clean.replace(/ /g, '+').replace(/-/g, '+').replace(/_/g, '/');
    const jsonStr = decodeURIComponent(Array.prototype.map.call(atob(normalized), (c) => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonStr);
  } catch (e) {
    try {
      let clean = token.trim();
      try {
        clean = decodeURIComponent(clean);
      } catch (e) {}
      const normalized = clean.replace(/ /g, '+').replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(atob(normalized));
    } catch (e2) {
      return null;
    }
  }
}

export function encodeDraftToShareableUrl(draftProduct) {
  try {
    const compactDraft = {
      ...draftProduct,
      isDraftPreview: true,
      previewGeneratedAt: Date.now()
    };
    const jsonStr = JSON.stringify(compactDraft);
    const base64 = btoa(encodeURIComponent(jsonStr).replace(/%([0-9A-F]{2})/g, (match, p1) => {
      return String.fromCharCode('0x' + p1);
    }));
    return encodeURIComponent(base64);
  } catch (e) {
    return null;
  }
}

export default function ProductDetailPage({ 
  productSlugOrId, 
  products = [], 
  categories = [], 
  brands = [], 
  onNavigate, 
  isPreview, 
  previousRoute,
  currentUser,
  onEditProduct,
  comparisonList,
  onToggleComparison,
  API_BASE_URL,
  isLoadingCatalog = false,
  onProductLoaded
}) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState('specs');
  const [selectedQuickViewProduct, setSelectedQuickViewProduct] = useState(null);
  const [isInstallmentModalOpen, setIsInstallmentModalOpen] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState(null);
  const { addToCart, openDirectCheckout, requireVerification } = useCart();

  // State for direct fetch when product is not yet in global products list (e.g. fresh page load)
  const [directProduct, setDirectProduct] = useState(null);
  const [isDirectFetching, setIsDirectFetching] = useState(false);
  const [hasAttemptedDirectFetch, setHasAttemptedDirectFetch] = useState(false);
  const [directFetch404, setDirectFetch404] = useState(false);

  // 1. Check for shareable encoded draft in URL search params (?d=... or ?token=...)
  const urlDraft = (() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('d') || params.get('token') || params.get('draft');
      if (token) {
        return decodeDraftFromToken(token);
      }
    } catch (e) {}
    return null;
  })();

  // 2. Check for active draft preview in sessionStorage or localStorage if route is explicitly 'preview'
  const sessionDraft = (() => {
    if (productSlugOrId === 'preview' || isPreview) {
      try {
        const saved = sessionStorage.getItem('athena_preview_draft_product') || localStorage.getItem('athena_preview_draft_product');
        if (saved) {
          return JSON.parse(saved);
        }
      } catch (e) {}
    }
    return null;
  })();

  const draftProduct = urlDraft || sessionDraft;
  const isPreviewMode = Boolean(draftProduct) || 
    productSlugOrId === 'preview' || 
    Boolean(isPreview) ||
    (typeof window !== 'undefined' && (
      new URLSearchParams(window.location.search).get('preview') === 'true' ||
      new URLSearchParams(window.location.search).get('preview') === '1' ||
      window.location.search.includes('draft=true')
    ));

  const matchedProductInCatalog = useMemo(() => {
    if (!productSlugOrId || productSlugOrId === 'preview') return null;
    return products.find((p) => p.slug === productSlugOrId || p.id === productSlugOrId) || null;
  }, [products, productSlugOrId]);

  const product = draftProduct || matchedProductInCatalog || directProduct;

  // Direct fetch for cold visits / direct links when product is not found in initial products list
  useEffect(() => {
    if (draftProduct || matchedProductInCatalog || !productSlugOrId || productSlugOrId === 'preview') {
      setIsDirectFetching(false);
      setHasAttemptedDirectFetch(true);
      return;
    }

    let isMounted = true;
    setIsDirectFetching(true);
    setDirectFetch404(false);
    setHasAttemptedDirectFetch(false);

    const apiUrl = API_BASE_URL || (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:3001/api' : import.meta.env?.VITE_API_URL)) || 'https://athena-backend-hu1m.onrender.com/api';

    const fetchDirectProduct = async () => {
      try {
        const res = await fetch(`${apiUrl}/products/${encodeURIComponent(productSlugOrId)}`);
        if (!isMounted) return;
        if (res.ok) {
          const data = await res.json();
          if (data && (data.id || data.name)) {
            const norm = normalizeProduct(data);
            setDirectProduct(norm);
            setHasAttemptedDirectFetch(true);
            setDirectFetch404(false);
            if (typeof onProductLoaded === 'function') {
              onProductLoaded(norm);
            }
            return;
          }
        }
        if (res.status === 404) {
          setDirectFetch404(true);
        }
      } catch (err) {
        console.warn('[ProductDetailPage] Erro na busca direta do produto:', err);
      } finally {
        if (isMounted) {
          setIsDirectFetching(false);
          setHasAttemptedDirectFetch(true);
        }
      }
    };

    fetchDirectProduct();

    return () => {
      isMounted = false;
    };
  }, [productSlugOrId, matchedProductInCatalog, draftProduct, API_BASE_URL]);

  // Determining if we are currently waiting to confirm if product exists
  const isVerifyingProduct = !product && (
    isDirectFetching || 
    !hasAttemptedDirectFetch ||
    (isLoadingCatalog && !directFetch404)
  );

  // Dynamic Variants handling with smart fallback to base product
  const variants = Array.isArray(product?.variants) ? product.variants : [];
  const hasVariants = variants.length > 0;

  // Regra 1: Se o produto principal estiver "Sob Consulta", TODAS as variações ficam sob consulta
  const isQuoteOnly = isProductQuoteOnly(product);

  // Auto-select first available variant on load or when product changes
  useEffect(() => {
    if (hasVariants) {
      try {
        const params = new URLSearchParams(window.location.search);
        const vParam = params.get('v') || params.get('var') || params.get('variant');
        if (vParam) {
          const match = variants.find(v => v.id === vParam || v.sku === vParam || v.name?.toLowerCase() === vParam.toLowerCase());
          if (match) {
            setSelectedVariantId(match.id);
            return;
          }
        }
      } catch (e) {}
      const firstAvailable = variants.find(v => {
        const avail = getVariantAvailability(v, product);
        return avail.available;
      }) || variants[0];
      setSelectedVariantId(firstAvailable.id);
    } else {
      setSelectedVariantId(null);
    }
  }, [product?.id, hasVariants]);

  const selectedVariant = hasVariants 
    ? (variants.find(v => v.id === selectedVariantId) || variants[0])
    : null;

  // Regra 2: Disponibilidade da variação selecionada (Manual vs Estoque)
  const selectedVariantAvail = selectedVariant ? getVariantAvailability(selectedVariant, product) : null;
  const isSelectedVariantActive = selectedVariant ? (selectedVariantAvail?.canBuy || (isQuoteOnly && selectedVariantAvail?.available)) : true;

  // Smart Price Fallback: use variant price if defined and > 0, otherwise fallback to product base price
  const activePrice = (selectedVariant?.price != null && Number(selectedVariant.price) > 0)
    ? Number(selectedVariant.price)
    : Number(product?.price || 0);

  // Smart Image Fallback: if variant has custom image, prioritize it in the gallery; otherwise use product image
  const effectiveProduct = (selectedVariant?.image)
    ? {
        ...product,
        image: selectedVariant.image,
        images: [
          selectedVariant.image,
          ...(Array.isArray(product?.images) ? product.images.filter(img => img !== selectedVariant.image) : [])
        ]
      }
    : product;

  const isAdminUser = Boolean(currentUser && (currentUser.role === 'admin' || currentUser.isAdmin));
  const canAccessDraft = isPreviewMode || isAdminUser;

  const category = (product ? categories.find((c) => c.id === product.categoryId) : null) || (
    product?.categoryName ? { id: product.categoryId, name: product.categoryName, slug: product.categorySlug } : null
  );
  const brand = (product ? brands.find((b) => b.id === product.brandId) : null) || (
    product?.brandName ? { id: product.brandId, name: product.brandName, slug: product.brandSlug } : null
  );

  const canBuyOnline = !isQuoteOnly && Number(activePrice) > 0;

  const paymentGateways = canBuyOnline ? calculatePaymentGateways(activePrice) : null;
  const pixCustomerPrice = paymentGateways?.pix?.formattedCustomerAmount || (
    canBuyOnline ? formatBRL(activePrice) : 'Sob Consulta'
  );

  const potentialPoints = (product?.aPoints && Number(product.aPoints) > 0) 
    ? Number(product.aPoints) 
    : (Number(activePrice) > 0 ? Math.floor(Number(activePrice) / 50) : 0);
  const earnedPoints = canBuyOnline ? potentialPoints : 0;

  const formattedPrice = canBuyOnline 
    ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(activePrice)
    : 'Sob Consulta';

  const handleCopyPreviewLink = () => {
    if (!product) return;
    try {
      const token = encodeDraftToShareableUrl(product);
      const shareUrl = `${window.location.origin}/produto/preview?d=${token}`;
      navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch (e) {}
  };

  const variantSuffixText = selectedVariant
    ? `\n*Opção Selecionada:* ${selectedVariant.name}${selectedVariant.sku ? ` (Cód/SKU: ${selectedVariant.sku})` : ''}${isQuoteOnly ? ' [Sob Consulta]' : (!selectedVariantAvail?.canBuy ? (selectedVariantAvail?.reason === 'auto_inactive' ? ' [Esgotado no estoque - solicito previsão]' : ' [Opção desativada - solicito previsão]') : '')}`
    : '';

  const whatsappMessage = canBuyOnline
    ? encodeURIComponent(
        `Olá Athena Soluções Automotivas!\n\nTenho interesse em comprar o equipamento:\n*${product?.name || ''}*${variantSuffixText}\nValor: ${pixCustomerPrice} no PIX (ou parcelado no cartão).\nMarca: ${brand?.name || 'Athena'}\n\nGostaria de orientações para fechar o pedido ou tirar dúvidas sobre o envio.`
      )
    : encodeURIComponent(
        `Olá Athena Soluções Automotivas!\n\nGostaria de um orçamento oficial para o equipamento:\n*${product?.name || ''}*${variantSuffixText}\nMarca: ${brand?.name || 'Athena'}\nCategoria: ${category?.name || 'Geral'}\n\nPor favor, me informe sobre valores, frete para meu CEP e formas de pagamento.`
      );

  // DYNAMIC SEO, OPENGRAPH & SCHEMA.ORG JSON-LD INJECTION
  useEffect(() => {
    if (!product) return;

    const originalTitle = document.title;
    const cleanDesc = stripFormattingTags(product.description || '').slice(0, 160) || 
      `Conheça o equipamento ${product.name} da marca ${brand?.name || 'Athena'}. Especificações completas, fotos em alta resolução e cotação oficial.`;

    document.title = `${product.name} | ${brand?.name ? brand.name + ' - ' : ''}Athena Soluções Automotivas`;

    // Meta Description
    let metaDesc = document.querySelector('meta[name="description"]');
    const originalDesc = metaDesc ? metaDesc.getAttribute('content') : '';
    if (metaDesc) {
      metaDesc.setAttribute('content', cleanDesc);
    }

    // Canonical
    let canonical = document.querySelector('link[rel="canonical"]');
    const originalCanonical = canonical ? canonical.getAttribute('href') : '';
    const productUrl = `https://www.athenaconsultoria.com.br/produto/${product.slug || product.id}`;
    if (canonical) {
      canonical.setAttribute('href', productUrl);
    }

    // OpenGraph Tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', `${product.name} | Athena Soluções Automotivas`);
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', cleanDesc);
    const ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage && product.image) ogImage.setAttribute('content', product.image);
    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.setAttribute('content', productUrl);

    // Dynamic JSON-LD Product Schema
    const scriptId = 'product-json-ld';
    let script = document.getElementById(scriptId);
    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }

    const productSchema = {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": product.name,
      "image": product.images && product.images.length > 0 ? product.images : [product.image],
      "description": cleanDesc,
      "sku": product.id,
      "mpn": product.slug,
      "brand": {
        "@type": "Brand",
        "name": brand?.name || "Athena Soluções Automotivas"
      },
      "category": category?.name || "Equipamentos Automotivos",
      "offers": {
        "@type": "Offer",
        "url": productUrl,
        "priceCurrency": "BRL",
        "price": product.price ? product.price : "0.00",
        "priceValidUntil": "2027-12-31",
        "itemCondition": "https://schema.org/NewCondition",
        "availability": product.inStock !== false ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        "seller": {
          "@type": "Organization",
          "name": "Athena Soluções Automotivas"
        }
      }
    };

    script.textContent = JSON.stringify(productSchema);

    return () => {
      document.title = originalTitle;
      if (metaDesc && originalDesc) metaDesc.setAttribute('content', originalDesc);
      if (canonical && originalCanonical) canonical.setAttribute('href', originalCanonical);
      const existingScript = document.getElementById(scriptId);
      if (existingScript) existingScript.remove();
    };
  }, [product, brand, category]);

  // SMART BACK BUTTON LOGIC
  let backTargetRoute = 'catalog';
  let backButtonLabel = 'Voltar ao Catálogo';

  if (previousRoute === 'admin' || isPreviewMode) {
    backTargetRoute = 'admin';
    backButtonLabel = 'Voltar para o Painel Admin';
  } else if (previousRoute) {
    if (previousRoute.startsWith('categoria/') || previousRoute.startsWith('category:')) {
      const catSlugOrId = previousRoute.includes('/') ? previousRoute.split('/')[1] : previousRoute.split(':')[1];
      const prevCat = categories.find(c => c.slug === catSlugOrId || c.id === catSlugOrId);
      backTargetRoute = previousRoute;
      backButtonLabel = prevCat ? `Voltar para ${prevCat.name}` : 'Voltar para Categoria';
    } else if (previousRoute.startsWith('marca/') || previousRoute.startsWith('brand:')) {
      const brandSlugOrId = previousRoute.includes('/') ? previousRoute.split('/')[1] : previousRoute.split(':')[1];
      const prevBrand = brands.find(b => b.slug === brandSlugOrId || b.id === brandSlugOrId);
      backTargetRoute = previousRoute;
      backButtonLabel = prevBrand ? `Voltar para ${prevBrand.name}` : 'Voltar para Marca';
    }
  }

  const handleReturnToEdit = () => {
    sessionStorage.setItem('athena_reopen_editor', 'true');
    if (onEditProduct && product) {
      onEditProduct(product);
    } else {
      onNavigate('admin');
    }
  };

  // Smart Related / Recommended Products Algorithm:
  // 1. Manually pinned recommendations (recommendedProductIds) are mandatory and appear first
  // 2. Remaining slots up to 5 are filled automatically (same category, then same brand)
  const pinnedRecommended = (Array.isArray(product?.recommendedProductIds) ? product.recommendedProductIds : [])
    .map(id => products.find(p => p.id === id && p.id !== product?.id && (canAccessDraft || isProductPublished(p))))
    .filter(Boolean);

  const pinnedIds = new Set(pinnedRecommended.map(p => p.id));

  const sameCategoryProducts = products.filter(
    (p) => product && p.id !== product.id && !pinnedIds.has(p.id) && p.categoryId === product.categoryId && (canAccessDraft || isProductPublished(p))
  );

  const sameBrandProducts = products.filter(
    (p) => product && p.id !== product.id && !pinnedIds.has(p.id) && p.brandId === product.brandId && p.categoryId !== product.categoryId && (canAccessDraft || isProductPublished(p))
  );

  const relatedProducts = [
    ...pinnedRecommended,
    ...sameCategoryProducts,
    ...sameBrandProducts
  ].slice(0, 5);

  // COMPATIBLE & ACCESSORY PRODUCTS COMPUTATION
  const directCompatIds = Array.isArray(product?.compatibleProductIds) ? product.compatibleProductIds : [];
  
  // Extract any /produto/ links mentioned in customTabs or description
  const textContent = `${product?.description || ''} ${(product?.customTabs || []).map(t => t.content || '').join(' ')}`;
  const linkMatches = textContent.match(/\/produto\/([a-zA-Z0-9_-]+)/g) || [];
  const linkedSlugs = linkMatches.map(m => m.replace('/produto/', ''));
  const linkedProductIds = products
    .filter(p => (canAccessDraft || isProductPublished(p)) && (linkedSlugs.includes(p.slug) || linkedSlugs.includes(p.id)))
    .map(p => p.id);

  // Inbound references (products in catalog that mark this equipment as compatible)
  const incomingProductIds = products
    .filter(p => (canAccessDraft || isProductPublished(p)) && p.id !== product?.id && (
      (Array.isArray(p.compatibleProductIds) && p.compatibleProductIds.includes(product?.id)) ||
      (product?.slug && Array.isArray(p.customTabs) && p.customTabs.some(t => t.content && t.content.includes(product.slug)))
    ))
    .map(p => p.id);

  const allCompatProductIds = Array.from(new Set([...directCompatIds, ...linkedProductIds, ...incomingProductIds]));
  const compatibleProductsList = allCompatProductIds
    .map(id => products.find(p => p.id === id && p.id !== product?.id))
    .filter(p => Boolean(p) && (canAccessDraft || isProductPublished(p)));

  const hasCompatibles = compatibleProductsList.length > 0;

  const hasSpecs = Array.isArray(product?.specs) && product.specs.length > 0;
  const rawCustomTabs = Array.isArray(product?.customTabs) 
    ? product.customTabs.filter(t => t.title && t.title.trim() !== '' && t.content && t.content.trim() !== '') 
    : [];

  const canonicalCompatTab = rawCustomTabs.find(t => t.title && t.title.toLowerCase().trim() === 'acessórios & itens compatíveis');
  const validCustomTabs = rawCustomTabs.filter(t => t !== canonicalCompatTab);
  const showCompatTab = Boolean(canonicalCompatTab) || hasCompatibles;
  const hasAttachments = Array.isArray(product?.attachments) && product.attachments.length > 0;
  const hasVideo = Boolean(product?.videoUrl || product?.youtubeVideoUrl);

  useEffect(() => {
    if (!product) return;
    if (hasSpecs) {
      setActiveTab('specs');
    } else if (showCompatTab) {
      setActiveTab('compatibles');
    } else if (validCustomTabs.length > 0) {
      setActiveTab(validCustomTabs[0].id);
    } else if (hasAttachments) {
      setActiveTab('attachments');
    } else if (hasVideo) {
      setActiveTab('video');
    }
  }, [product?.id, hasSpecs, showCompatTab, validCustomTabs.length, hasAttachments, hasVideo]);

  // 1. If we are currently verifying or loading the equipment, show the loading skeleton state
  if (isVerifyingProduct) {
    return (
      <div className="min-h-[75vh] py-8 sm:py-12">
        <div className="container-custom max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Breadcrumb / Back placeholder */}
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={() => onNavigate('catalog')}
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-amber-600 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar ao Catálogo</span>
            </button>
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200/80 shadow-xs">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />
              <span>Carregando equipamento...</span>
            </div>
          </div>

          {/* Main 2-column skeleton matching product detail layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left Column: Image Gallery Skeleton */}
            <div className="lg:col-span-7 space-y-4">
              <div className="aspect-square sm:aspect-4/3 w-full rounded-3xl bg-slate-100 border border-slate-200/80 shadow-xs relative overflow-hidden flex flex-col items-center justify-center p-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200/60 flex items-center justify-center mb-4 shadow-xs">
                  <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
                </div>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-800 tracking-tight">
                  Localizando Equipamento
                </h3>
                <p className="text-xs text-slate-500 max-w-xs mt-1.5 leading-relaxed">
                  Buscando especificações técnicas, fotos e disponibilidade no catálogo Athena...
                </p>
              </div>

              {/* Thumbnails row skeleton */}
              <div className="grid grid-cols-4 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="aspect-square rounded-2xl bg-slate-100 border border-slate-200/70 animate-pulse" />
                ))}
              </div>
            </div>

            {/* Right Column: Info & Action Skeleton */}
            <div className="lg:col-span-5 space-y-6">
              {/* Badges */}
              <div className="flex items-center gap-2">
                <div className="h-6 w-24 rounded-full bg-slate-200 animate-pulse" />
                <div className="h-6 w-20 rounded-full bg-amber-100 animate-pulse" />
              </div>

              {/* Title & SKU */}
              <div className="space-y-3">
                <div className="h-8 w-11/12 rounded-xl bg-slate-200 animate-pulse" />
                <div className="h-8 w-3/4 rounded-xl bg-slate-200 animate-pulse" />
                <div className="h-4 w-36 rounded-md bg-slate-100 animate-pulse" />
              </div>

              {/* Price card skeleton */}
              <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-4">
                <div className="h-10 w-44 rounded-xl bg-slate-200 animate-pulse" />
                <div className="h-6 w-56 rounded-lg bg-emerald-100/60 animate-pulse" />
                <div className="h-4 w-40 rounded-md bg-slate-200 animate-pulse" />
              </div>

              {/* CTA Buttons skeleton */}
              <div className="space-y-3 pt-2">
                <div className="h-13 w-full rounded-2xl bg-amber-500/20 border border-amber-500/30 animate-pulse" />
                <div className="h-13 w-full rounded-2xl bg-slate-100 border border-slate-200 animate-pulse" />
              </div>

              {/* Trust badges */}
              <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-3">
                <div className="h-10 rounded-xl bg-slate-100 animate-pulse" />
                <div className="h-10 rounded-xl bg-slate-100 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. If verification finished and product does NOT exist in catalog
  if (!product) {
    return (
      <NotFoundPage
        onNavigate={onNavigate}
        message={`O equipamento "${productSlugOrId}" não foi encontrado em nosso catálogo. Verifique o link digitado ou explore outros modelos disponíveis.`}
      />
    );
  }

  // 3. If product exists but is a draft and user cannot access drafts
  if (!isProductPublished(product) && !canAccessDraft) {
    return (
      <NotFoundPage
        onNavigate={onNavigate}
        message={`O equipamento "${product.name || productSlugOrId}" encontra-se em modo de rascunho e não está disponível publicamente no momento.`}
      />
    );
  }

  return (
    <div className="pb-12">
      {/* SHOPIFY-STYLE STICKY PREVIEW BAR */}
      {isPreviewMode && (
        <div className="bg-slate-900 text-white border-b border-amber-500/40 py-2.5 px-4 sm:px-8 shadow-xl sticky top-16 sm:top-20 z-30 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-amber-500 text-slate-950 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider shadow-2xs">
              <Eye className="w-3.5 h-3.5" />
              <span>Modo de Pré-visualização</span>
            </div>
            <div className="text-xs">
              <span className="font-bold text-slate-200">{product.name}</span>
              <span className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded ml-2 ${
                product.status === 'published' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}>
                {product.status === 'published' ? 'Publicado' : 'Rascunho / Prévia'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleCopyPreviewLink}
              className={`text-xs font-bold py-1.5 px-3 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
                copiedLink 
                  ? 'bg-emerald-600 text-white border-emerald-500 font-black' 
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
              title="Copie o link temporário com hash para enviar para clientes ou outros computadores"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
              <span>{copiedLink ? 'Link Copiado!' : 'Copiar Link de Prévia'}</span>
            </button>

            <button
              type="button"
              onClick={handleReturnToEdit}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black py-1.5 px-3 rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Voltar para Edição</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('catalog')}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold py-1.5 px-3 rounded-lg border border-slate-700 transition-colors"
            >
              Ver Catálogo
            </button>
          </div>
        </div>
      )}

      <div className="container-custom space-y-8 pt-6">

        {/* Smart Breadcrumbs & Back Button */}
        <div className="flex items-center justify-between gap-4 border-b border-slate-200/80 pb-4 text-xs">
          <button 
            onClick={() => {
              if (backTargetRoute === 'admin' && isPreviewMode) {
                handleReturnToEdit();
              } else {
                onNavigate(backTargetRoute);
              }
            }}
            className="btn-secondary text-xs py-2 px-3.5 gap-1.5 font-bold"
          >
            <ArrowLeft className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{backButtonLabel}</span>
          </button>

          <div className="flex items-center gap-2 text-slate-500 font-medium hidden sm:flex">
            <span 
              onClick={() => onNavigate('catalog')} 
              className="hover:text-amber-600 cursor-pointer"
            >
              Catálogo
            </span>
            <span>/</span>
            {category && (
              <span 
                onClick={() => onNavigate(`categoria/${category.slug || category.id}`)} 
                className="hover:text-amber-600 cursor-pointer"
              >
                {category.name}
              </span>
            )}
            <span>/</span>
            <span className="text-slate-900 font-bold truncate max-w-xs">{product.name}</span>
          </div>
        </div>

        {/* Product Details Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Interactive Carousel & Zoom Gallery + Trust Badges */}
          <div id="product-gallery-section" className="lg:col-span-5 space-y-4 lg:sticky lg:top-24 self-start">
            <ProductImageGallery product={effectiveProduct || product} />

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0" />
                <div className="text-[11px]">
                  <span className="font-bold text-slate-900 block">Garantia Athena</span>
                  <span className="text-slate-500">Produto Homologado</span>
                </div>
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-2.5">
                <Truck className="w-5 h-5 text-sky-600 shrink-0" />
                <div className="text-[11px]">
                  <span className="font-bold text-slate-900 block">Envio Nacional</span>
                  <span className="text-slate-500">Entregas no Brasil</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Title, Modest Price, Clean Description, WhatsApp CTA & Dynamic Tabs */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-5">
            
            <div className="space-y-3">
              {/* Category & Brand Pills + Quick Video Access */}
              <div className="flex flex-wrap items-center gap-2">
                {category && (
                  <button 
                    onClick={() => onNavigate(`categoria/${category.slug || category.id}`)}
                    className="badge badge-gray hover:bg-slate-200 cursor-pointer"
                  >
                    <Layers className="w-3 h-3 text-amber-600" />
                    {category.name}
                  </button>
                )}

                {brand && (
                  <button 
                    onClick={() => onNavigate(`marca/${brand.slug || brand.id}`)}
                    className="badge badge-blue hover:bg-sky-100 cursor-pointer"
                  >
                    <Tag className="w-3 h-3 text-sky-600" />
                    {brand.name}
                  </button>
                )}

                {product.productType === 'digital' && (
                  <span className="badge bg-emerald-600 text-white font-bold flex items-center gap-1 shadow-xs">
                    <Zap className="w-3 h-3" />
                    <span>Licença / Produto Digital</span>
                  </span>
                )}

                {product.badge && product.badge.trim() && (
                  <span className="badge badge-gold font-bold">
                    {product.badge}
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                {product.name}
              </h1>
            </div>

            {/* Clean Description on Normal White Background */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Descrição do Equipamento</h3>
              <div className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                <FormattedDescription 
                  text={product.description} 
                  products={products}
                  onSelectProduct={(p) => setSelectedQuickViewProduct(p)}
                />
              </div>
            </div>

            {/* Dynamic Variations Selector (Colors, Sizes, Models) */}
            {hasVariants && (
              <div className="pt-3 pb-1 border-t border-slate-100 space-y-2.5">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      {variants.some(v => v.colorHex) ? 'Opção de Cor:' : 'Opção / Modelo:'}
                    </span>
                    <span className="text-xs font-extrabold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200">
                      {selectedVariant?.name}
                    </span>
                    {isQuoteOnly && (
                      <span className="text-[10px] font-black text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                        Sob Consulta
                      </span>
                    )}
                  </div>

                  {selectedVariant?.sku && (
                    <span className="text-[11px] font-mono font-medium text-slate-400">
                      Ref / SKU: <span className="font-bold text-slate-600">{selectedVariant.sku}</span>
                    </span>
                  )}
                </div>

                {/* Options Display */}
                <div className="flex items-center gap-2.5 flex-wrap">
                  {variants.map((v) => {
                    const isSelected = v.id === selectedVariant?.id;
                    const hasColor = Boolean(v.colorHex && v.colorHex.trim());
                    const vAvail = getVariantAvailability(v, product);
                    const isSelectable = isQuoteOnly ? vAvail.available : vAvail.canBuy;

                    if (hasColor) {
                      // Color Swatch Circle
                      return (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => setSelectedVariantId(v.id)}
                          className={`group relative p-1 rounded-full transition-all cursor-pointer flex items-center justify-center ${
                            isSelected
                              ? 'ring-2 ring-amber-500 ring-offset-2 scale-110 shadow-sm'
                              : 'hover:scale-105 opacity-80 hover:opacity-100'
                          } ${!isSelectable ? '!opacity-45 hover:!opacity-70' : ''}`}
                          title={`${v.name}${isQuoteOnly ? ' (Sob Consulta)' : (!isSelectable ? ` (${vAvail.label})` : (v.price ? ` - ${formatBRL(v.price)}` : ''))}`}
                        >
                          <span
                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-slate-300 shadow-2xs block relative overflow-hidden"
                            style={{ backgroundColor: v.colorHex }}
                          >
                            {!isSelectable && (
                              <span className="absolute inset-0 flex items-center justify-center">
                                <span className="w-full h-0.5 bg-red-500/80 rotate-45 transform" />
                              </span>
                            )}
                          </span>
                          {isSelected && (
                            <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <Check className="w-3.5 h-3.5 text-white drop-shadow-md stroke-[3]" />
                            </span>
                          )}
                        </button>
                      );
                    }

                    // Pill / Chip for Sizes, Models, Voltages
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setSelectedVariantId(v.id)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-amber-500 text-slate-950 border-amber-400 font-extrabold shadow-sm ring-1 ring-amber-400'
                            : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                        } ${!isSelectable ? 'opacity-55 line-through' : ''}`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 text-slate-950 shrink-0" />}
                        <span>{v.name}</span>
                        {!isSelectable ? (
                          <span className="text-[10px] ml-1 px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-bold no-underline">
                            {vAvail.reason === 'auto_inactive' ? 'Esgotado' : 'Indisponível'}
                          </span>
                        ) : (
                          !isQuoteOnly && v.price != null && Number(v.price) > 0 && Number(v.price) !== Number(product.price) && (
                            <span className={`text-[10px] ml-1 px-1.5 py-0.5 rounded ${
                              isSelected ? 'bg-black/10 text-slate-950' : 'bg-slate-100 text-slate-500'
                            }`}>
                              {formatBRL(v.price)}
                            </span>
                          )
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Variant Stock / Availability Note */}
                {selectedVariant && (
                  <div className="flex items-center gap-2 text-xs pt-0.5">
                    {isQuoteOnly ? (
                      <span className="text-[11px] font-bold text-amber-900 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-2xs">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>Equipamento sob consulta comercial. Esta opção será incluída no seu orçamento.</span>
                      </span>
                    ) : selectedVariantAvail?.reason === 'manual_inactive' ? (
                      <span className="text-[11px] font-bold text-slate-700 bg-slate-100 border border-slate-300 px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-2xs">
                        <AlertTriangle className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span>Opção desativada temporariamente</span>
                      </span>
                    ) : selectedVariantAvail?.reason === 'auto_inactive' ? (
                      <span className="text-[11px] font-bold text-red-600 bg-red-50 border border-red-200 px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-2xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                        <span>Esgotado nesta opção (Desativada automaticamente pelo estoque)</span>
                      </span>
                    ) : selectedVariantAvail?.statusControl === 'manual_active' ? (
                      <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100/90 border border-emerald-300 px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-2xs">
                        <Check className="w-3.5 h-3.5 text-emerald-700 stroke-[2.5] shrink-0" />
                        <span>{selectedVariantAvail.stockQty !== null && selectedVariantAvail.stockQty <= 0 ? 'Disponível sob encomenda (Prioridade manual)' : (selectedVariantAvail.stockQty ? `${selectedVariantAvail.stockQty} un disponíveis` : 'Disponível para pedido')}</span>
                      </span>
                    ) : selectedVariantAvail?.stockQty != null && selectedVariantAvail.stockQty > 0 ? (
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-2xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                        <span>{selectedVariantAvail.stockQty} {selectedVariantAvail.stockQty === 1 ? 'unidade disponível' : 'unidades disponíveis'}</span>
                      </span>
                    ) : null}
                  </div>
                )}
              </div>
            )}

            {/* Commercial Condition / Price Banner (Positioned above CTA Buttons) */}
            {canBuyOnline ? (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-amber-100/50 border border-amber-200/80 space-y-2">
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-amber-200/80 text-amber-900">
                    À Vista no PIX
                  </span>
                  <span className="text-2xl sm:text-3xl font-black text-amber-950 font-display">
                    {pixCustomerPrice}
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-amber-200/60 text-xs">
                  <span className="font-bold text-slate-700 flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-amber-700" />
                    {getBestInstallmentText(activePrice, 12)}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsInstallmentModalOpen(true)}
                    className="text-amber-900 hover:text-amber-950 font-black underline cursor-pointer text-[11px] flex items-center gap-1"
                  >
                    <span>Opções de parcelamento e pagamento</span>
                  </button>
                </div>

                {earnedPoints > 0 && (
                  <div className="pt-2.5 border-t border-amber-200/60 space-y-1">
                    <div className="flex items-center justify-between text-xs text-amber-950">
                      <span className="flex items-center gap-1.5 font-bold text-slate-700">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        Programa Fidelidade A-Points:
                      </span>
                      <span className="font-extrabold bg-white/90 border border-amber-300 text-amber-900 px-2.5 py-0.5 rounded-lg shadow-2xs text-xs">
                        Compre e ganhe até +{earnedPoints} pts*
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 italic leading-snug">
                      *Comprando este produto você pode ganhar até {earnedPoints} pontos. A pontuação final creditada pode variar conforme o método de pagamento, cupons aplicados ou condições comerciais negociadas.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Condição Comercial:
                  </span>
                  <span className="text-xl sm:text-2xl font-extrabold text-amber-800 font-display">
                    Sob Consulta
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">
                    (Consulte condições, prazos e faturamento)
                  </span>
                </div>
                {potentialPoints > 0 && (
                  <div className="pt-1.5 border-t border-slate-200/60 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1 text-[11px] font-bold text-slate-600">
                        <Sparkles className="w-3 h-3 text-amber-600 shrink-0" />
                        Programa A-Points:
                      </span>
                      <span className="text-[11px] font-extrabold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                        Acumule até +{potentialPoints} pts na cotação*
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 italic leading-snug">
                      *Na contratação ou faturamento deste equipamento você pode acumular até {potentialPoints} pontos. A pontuação final creditada pode variar conforme as condições comerciais negociadas na cotação.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons Below Price */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              {canBuyOnline ? (
                <>
                  <button
                    type="button"
                    disabled={selectedVariant && !selectedVariantAvail?.canBuy}
                    onClick={() => openDirectCheckout(product, 1, selectedVariant)}
                    className={`btn-gold text-xs sm:text-sm py-2.5 px-5 shadow-xs font-black flex items-center gap-2 ${
                      selectedVariant && !selectedVariantAvail?.canBuy ? 'opacity-50 cursor-not-allowed filter grayscale' : 'cursor-pointer'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>{selectedVariant && !selectedVariantAvail?.canBuy ? (selectedVariantAvail?.reason === 'auto_inactive' ? 'Opção Esgotada' : 'Opção Desativada') : 'Comprar Agora'}</span>
                  </button>

                  <button
                    type="button"
                    disabled={selectedVariant && !selectedVariantAvail?.canBuy}
                    onClick={() => addToCart(product, 1, selectedVariant)}
                    className={`py-2.5 px-4 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all ${
                      selectedVariant && !selectedVariantAvail?.canBuy 
                        ? 'opacity-50 cursor-not-allowed bg-slate-100 text-slate-400 border border-slate-200' 
                        : 'text-slate-800 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 shadow-2xs cursor-pointer'
                    }`}
                  >
                    <ShoppingCart className="w-4 h-4 text-amber-700" />
                    <span>+ Carrinho</span>
                  </button>

                  <a
                    href={`https://wa.me/5561983485671?text=${whatsappMessage}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      if (requireVerification && requireVerification(() => {
                        window.open(`https://wa.me/5561983485671?text=${whatsappMessage}`, '_blank');
                      })) {
                        e.preventDefault();
                      }
                    }}
                    className="py-2.5 px-4 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 shadow-2xs flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-600 fill-emerald-600/20" />
                    <span>{selectedVariant && !selectedVariantAvail?.canBuy ? 'Consultar Previsão' : 'Dúvidas no WhatsApp'}</span>
                  </a>
                </>
              ) : (
                <a
                  href={`https://wa.me/5561983485671?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    if (requireVerification && requireVerification(() => {
                      window.open(`https://wa.me/5561983485671?text=${whatsappMessage}`, '_blank');
                    })) {
                      e.preventDefault();
                    }
                  }}
                  className="btn-gold text-xs sm:text-sm py-3 px-6 shadow-md font-extrabold flex items-center gap-2 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  <span>{selectedVariant ? `Solicitar Orçamento da Opção "${selectedVariant.name}" no WhatsApp` : 'Solicitar Orçamento no WhatsApp'}</span>
                </a>
              )}

              {onToggleComparison && (
                <button
                  onClick={() => onToggleComparison(product)}
                  className={`text-xs py-2.5 px-4 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    comparisonList?.some(p => p.id === product.id)
                      ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-400 font-extrabold'
                      : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-2xs'
                  }`}
                >
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                  <span>{comparisonList?.some(p => p.id === product.id) ? 'Em Comparação' : 'Comparar Modelo'}</span>
                </button>
              )}
            </div>


            {/* VIDEO EMBED: Between Description / CTA and Custom Tabs */}
            {(() => {
              const videoInfo = getVideoEmbedInfo(product.videoUrl || product.youtubeVideoUrl);
              if (!videoInfo) return null;

              return (
                <div id="video-demonstrativo" className="space-y-3 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                        <Film className="w-4 h-4 text-slate-700" />
                        Vídeo Demonstrativo ({videoInfo.platform})
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Demonstração de funcionamento e orientações de uso deste equipamento.
                      </p>
                    </div>
                    {videoInfo.originalUrl && (
                      <a
                        href={videoInfo.originalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        Abrir no {videoInfo.platform}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>

                  <div className={
                    videoInfo.type === 'instagram'
                      ? "w-full max-w-[420px] mx-auto min-h-[580px] rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-white"
                      : videoInfo.isVertical
                      ? "w-full max-w-[360px] mx-auto aspect-[9/16] rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-black"
                      : "aspect-video w-full rounded-2xl overflow-hidden border border-slate-200 shadow-md bg-slate-950"
                  }>
                    <iframe
                      src={videoInfo.embedUrl}
                      title={`Vídeo - ${product.name}`}
                      className={`w-full h-full ${videoInfo.type === 'instagram' ? 'min-h-[560px]' : ''}`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      frameBorder="0"
                      scrolling="no"
                    />
                  </div>
                </div>
              );
            })()}

            {/* TABS SECTION: "Especificações", "Acessórios & Itens Compatíveis", Abas Extras Personalizadas, "Ficha Técnica" */}
            {(hasSpecs || showCompatTab || validCustomTabs.length > 0 || hasAttachments) && (
              <div id="tabs-section" className="pt-5 border-t border-slate-200/80 space-y-4">
                
                {/* Tab Navigation Buttons */}
                <div className="flex items-center gap-2 border-b border-slate-200 pb-2.5 overflow-x-auto">
                  {hasSpecs && (
                    <button
                      type="button"
                      onClick={() => setActiveTab('specs')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                        activeTab === 'specs'
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                      }`}
                    >
                      <Layers className={`w-3.5 h-3.5 ${activeTab === 'specs' ? 'text-amber-400' : 'text-slate-500'}`} />
                      <span>Especificações</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${activeTab === 'specs' ? 'bg-slate-800 text-amber-300' : 'bg-slate-200 text-slate-600'}`}>
                        {product.specs.length}
                      </span>
                    </button>
                  )}

                  {showCompatTab && (
                    <button
                      type="button"
                      onClick={() => setActiveTab('compatibles')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                        activeTab === 'compatibles'
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                      }`}
                    >
                      <Sparkles className={`w-3.5 h-3.5 ${activeTab === 'compatibles' ? 'text-amber-400' : 'text-slate-500'}`} />
                      <span>Acessórios & Itens Compatíveis</span>
                      {compatibleProductsList.length > 0 && (
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${activeTab === 'compatibles' ? 'bg-slate-800 text-amber-300' : 'bg-slate-200 text-slate-600'}`}>
                          {compatibleProductsList.length}
                        </span>
                      )}
                    </button>
                  )}

                  {validCustomTabs.map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                        activeTab === tab.id
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                      }`}
                    >
                      <Sparkles className={`w-3.5 h-3.5 ${activeTab === tab.id ? 'text-amber-400' : 'text-slate-500'}`} />
                      <span>{tab.title}</span>
                    </button>
                  ))}

                  {hasAttachments && (
                    <button
                      type="button"
                      onClick={() => setActiveTab('attachments')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                        activeTab === 'attachments'
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                      }`}
                    >
                      <FileText className={`w-3.5 h-3.5 ${activeTab === 'attachments' ? 'text-amber-400' : 'text-slate-500'}`} />
                      <span>Ficha Técnica</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${activeTab === 'attachments' ? 'bg-slate-800 text-amber-300' : 'bg-slate-200 text-slate-600'}`}>
                        {product.attachments.length}
                      </span>
                    </button>
                  )}
                </div>

                {/* TAB CONTENT: Especificações */}
                {activeTab === 'specs' && hasSpecs && (
                  <div className="space-y-3 animate-in fade-in duration-150">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {product.specs.map((spec, idx) => {
                        const colonIndex = spec.indexOf(':');
                        const hasColon = colonIndex !== -1;
                        const label = hasColon ? spec.slice(0, colonIndex).trim() : null;
                        const value = hasColon ? spec.slice(colonIndex + 1).trim() : spec;

                        return (
                          <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 text-xs text-slate-800 transition-colors shadow-2xs">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            <div className="space-y-0.5 min-w-0 flex-1">
                              {label && (
                                <span className="font-extrabold text-[10px] uppercase tracking-wider text-slate-500 block">
                                  {label}
                                </span>
                              )}
                              <span className={label ? "font-bold text-slate-900 block leading-snug break-words" : "font-semibold text-slate-800"}>
                                {value}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* TAB CONTENT: Acessórios & Itens Compatíveis */}
                {activeTab === 'compatibles' && showCompatTab && (
                  <div className="space-y-4 animate-in fade-in duration-150">
                    {canonicalCompatTab && canonicalCompatTab.content && (
                      <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs sm:text-sm text-slate-700 leading-relaxed">
                        <FormattedDescription 
                          text={canonicalCompatTab.content} 
                          products={products}
                          onSelectProduct={(p) => setSelectedQuickViewProduct(p)}
                        />
                      </div>
                    )}

                    {compatibleProductsList.length > 0 && (
                      <div className="space-y-2.5">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                          <span>Equipamentos e Acessórios Vinculados ({compatibleProductsList.length}):</span>
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {compatibleProductsList.map((cProd) => {
                            const cBrand = brands.find(b => b.id === cProd.brandId);
                            const cPrice = cProd.price 
                              ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cProd.price)
                              : 'Sob Consulta';

                            return (
                              <div
                                key={cProd.id}
                                className="p-3 rounded-2xl bg-white border border-slate-200 hover:border-amber-400 hover:shadow-md transition-all flex flex-col justify-between space-y-3 group"
                              >
                                <div className="flex items-start gap-3">
                                  <div className="w-16 h-16 rounded-xl bg-slate-50 border border-slate-200 p-1 overflow-hidden shrink-0 flex items-center justify-center">
                                    <img
                                      src={cProd.image || (cProd.images && cProd.images[0]) || 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=200'}
                                      alt={cProd.name}
                                      className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                                    />
                                  </div>

                                  <div className="min-w-0 flex-1">
                                    <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">
                                      {cBrand?.name || 'Athena'}
                                    </span>
                                    <h5 className="font-bold text-xs text-slate-900 leading-snug line-clamp-2 mt-0.5 group-hover:text-amber-900 transition-colors">
                                      {cProd.name}
                                    </h5>
                                    <span className="text-xs font-extrabold text-amber-800 block mt-1">
                                      {cPrice}
                                    </span>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-slate-100 text-[11px] font-bold">
                                  <button
                                    type="button"
                                    onClick={() => setSelectedQuickViewProduct(cProd)}
                                    className="px-2 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 border border-amber-500/20 flex items-center justify-center gap-1 cursor-pointer transition-colors"
                                    title="Pré-visualizar sem sair da página"
                                  >
                                    <Eye className="w-3.5 h-3.5 text-amber-700" />
                                    <span>Ver Rápido</span>
                                  </button>

                                  <a
                                    href={`/produto/${cProd.slug || cProd.id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-2 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center gap-1 transition-colors"
                                    title="Abrir página completa do produto em nova aba"
                                  >
                                    <span>Página</span>
                                    <ExternalLink className="w-3 h-3 text-slate-500" />
                                  </a>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB CONTENT: Abas Personalizadas (Aplicações, Funções, etc.) */}
                {(() => {
                  const currentCustomTab = validCustomTabs.find(t => t.id === activeTab);
                  if (!currentCustomTab) return null;

                  return (
                    <div className="space-y-3 animate-in fade-in duration-150">
                      <div className="p-4 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs sm:text-sm text-slate-700 leading-relaxed">
                        <FormattedDescription 
                          text={currentCustomTab.content} 
                          products={products}
                          onSelectProduct={(p) => setSelectedQuickViewProduct(p)}
                        />
                      </div>
                    </div>
                  );
                })()}

                {/* TAB CONTENT: Ficha Técnica & Downloads */}
                {activeTab === 'attachments' && hasAttachments && (
                  <div className="space-y-3 animate-in fade-in duration-150">
                    <p className="text-xs text-slate-500">
                      Documentos oficiais, manuais de operação e folhetos técnicos disponíveis para visualização e download:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {product.attachments.map((att) => {
                        const displayLabel = att.title || att.name || formatAttachmentLabel(att.fileName);
                        return (
                          <a
                            key={att.id}
                            href={att.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3.5 rounded-2xl bg-slate-50 hover:bg-amber-50/80 border border-slate-200 hover:border-amber-400 text-slate-900 transition-colors flex items-center justify-between gap-3 text-xs font-bold shadow-xs group"
                          >
                            <div className="flex items-center gap-2.5 overflow-hidden">
                              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                                <FileText className="w-5 h-5 text-amber-700" />
                              </div>
                              <div className="truncate">
                                <span className="block truncate text-slate-900 group-hover:text-amber-900">
                                  {displayLabel}
                                </span>
                                <span className="text-[10px] text-slate-500 font-medium block">
                                  {att.fileSize ? `${att.fileSize} • ` : ''}Abrir em Nova Aba
                                </span>
                              </div>
                            </div>

                            <span className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 group-hover:border-amber-400 text-slate-700 group-hover:text-amber-900 text-[11px] font-bold flex items-center gap-1.5 shrink-0 shadow-2xs">
                              <ExternalLink className="w-3.5 h-3.5 text-amber-600" />
                              <span>Visualizar PDF</span>
                            </span>
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* Direct Contact Callout */}
            <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-emerald-600" />
                <span>Atendimento comercial via WhatsApp: <strong>(61) 98348-5671</strong></span>
              </div>
              <span className="text-[11px] text-slate-400">Segunda a Sexta, 8h às 18h</span>
            </div>

          </div>

        </div>

        {/* SMART RELATED PRODUCTS SECTION (Ultra-Compact Mini Cards) */}
        {relatedProducts.length > 0 && (
          <div className="pt-8 border-t border-slate-200 space-y-4">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-amber-600 shrink-0" />
                <span>Equipamentos Relacionados</span>
              </h2>
              <p className="text-xs text-slate-500">
                {sameCategoryProducts.length > 0 
                  ? `Opções similares da linha de ${category?.name || 'equipamentos'} para o seu centro automotivo.` 
                  : `Outros equipamentos recomendados da marca ${brand?.name || 'Athena'} para o seu centro automotivo.`}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {relatedProducts.map((relProduct) => {
                const relCat = categories.find((c) => c.id === relProduct.categoryId);
                const relBrand = brands.find((b) => b.id === relProduct.brandId);
                const relPrice = relProduct.price 
                  ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(relProduct.price)
                  : 'Sob Consulta';

                return (
                  <div 
                    key={relProduct.id}
                    onClick={() => onNavigate(`produto/${relProduct.slug || relProduct.id}`)}
                    className="group bg-white border border-slate-200 hover:border-amber-400 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      {/* Compact Image */}
                      <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                        <img 
                          src={relProduct.image || 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&auto=format&fit=crop&q=80'} 
                          alt={relProduct.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {relCat && (
                          <span className="absolute top-1.5 right-1.5 bg-white/95 text-slate-800 text-[8px] font-bold px-1.5 py-0.5 rounded shadow-xs truncate max-w-[80px]">
                            {relCat.name}
                          </span>
                        )}
                      </div>

                      {/* Compact Content */}
                      <div className="p-2.5 space-y-1">
                        {relBrand && (
                          <span className="text-[9px] font-bold text-slate-400 block truncate">
                            {relBrand.name}
                          </span>
                        )}
                        <h3 className="text-xs font-bold text-slate-900 line-clamp-2 leading-tight group-hover:text-amber-600 transition-colors">
                          {relProduct.name}
                        </h3>
                      </div>
                    </div>

                    {/* Price & Action */}
                    <div className="p-2.5 pt-0 space-y-1.5">
                      <div className="text-xs font-extrabold text-amber-700">
                        {relPrice}
                      </div>
                      <button className="w-full py-1.5 rounded-lg bg-slate-100 group-hover:bg-amber-600 group-hover:text-white text-slate-700 text-[10px] font-bold transition-colors flex items-center justify-center gap-1">
                        <span>Ver Ficha</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* QUICK VIEW MODAL FOR COMPATIBLE PRODUCTS / INLINE LINKS */}
      {selectedQuickViewProduct && (
        <ProductModal
          product={selectedQuickViewProduct}
          products={products}
          categories={categories}
          brands={brands}
          onClose={() => setSelectedQuickViewProduct(null)}
          onSelectProduct={(newP) => setSelectedQuickViewProduct(newP)}
        />
      )}

      {/* FULL INSTALLMENT BREAKDOWN MODAL */}
      <InstallmentModal
        isOpen={isInstallmentModalOpen}
        onClose={() => setIsInstallmentModalOpen(false)}
        productName={selectedVariant ? `${product.name} (${selectedVariant.name})` : product.name}
        cashPrice={activePrice}
        maxInstallments={12}
      />

    </div>
  );
}
