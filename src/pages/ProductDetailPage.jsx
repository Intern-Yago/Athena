import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import ProductImageGallery from '../components/ProductImageGallery';
import FormattedDescription, { stripFormattingTags } from '../components/FormattedDescription';
import NotFoundPage from './NotFoundPage';
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
  ExternalLink
} from 'lucide-react';

export function getYouTubeEmbedUrl(url) {
  if (!url || typeof url !== 'string') return null;
  let trimmed = url.trim();
  if (!trimmed) return null;

  // 1. If user pasted raw <iframe ... src="..." ...></iframe> code, extract the src URL
  const iframeSrcMatch = trimmed.match(/<iframe\b[^>]*\bsrc=["']([^"']+)["']/i);
  if (iframeSrcMatch && iframeSrcMatch[1]) {
    trimmed = iframeSrcMatch[1].trim();
  }

  // 2. youtube.com/embed/VIDEO_ID or youtube-nocookie.com/embed/VIDEO_ID
  if (trimmed.includes('youtube.com/embed/') || trimmed.includes('youtube-nocookie.com/embed/')) {
    const parts = trimmed.split(/\/embed\/([a-zA-Z0-9_-]{11})/i);
    if (parts && parts[1]) {
      return `https://www.youtube.com/embed/${parts[1]}`;
    }
    const cleanId = trimmed.split('/embed/')[1]?.split('?')[0]?.split('&')[0];
    if (cleanId) return `https://www.youtube.com/embed/${cleanId}`;
    return trimmed;
  }
  
  // 3. youtu.be/VIDEO_ID
  const shortMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/i);
  if (shortMatch && shortMatch[1]) {
    return `https://www.youtube.com/embed/${shortMatch[1]}`;
  }
  
  // 4. watch?v=VIDEO_ID
  const watchMatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{11})/i);
  if (watchMatch && watchMatch[1]) {
    return `https://www.youtube.com/embed/${watchMatch[1]}`;
  }
  
  // 5. youtube.com/shorts/VIDEO_ID
  const shortsMatch = trimmed.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/i);
  if (shortsMatch && shortsMatch[1]) {
    return `https://www.youtube.com/embed/${shortsMatch[1]}`;
  }

  // 6. Generic YouTube ID match anywhere in the string
  const genericMatch = trimmed.match(/(?:youtube(?:-nocookie)?\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i);
  if (genericMatch && genericMatch[1]) {
    return `https://www.youtube.com/embed/${genericMatch[1]}`;
  }

  return null;
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
    const jsonStr = decodeURIComponent(Array.prototype.map.call(atob(token), (c) => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonStr);
  } catch (e) {
    return null;
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
    return base64;
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
  onToggleComparison
}) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState('specs');

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

  // 2. Check for active draft preview in sessionStorage ONLY if route is explicitly 'preview'
  const sessionDraft = (() => {
    if (productSlugOrId === 'preview' || isPreview) {
      try {
        const saved = sessionStorage.getItem('athena_preview_draft_product');
        if (saved) {
          return JSON.parse(saved);
        }
      } catch (e) {}
    }
    return null;
  })();

  const draftProduct = urlDraft || sessionDraft;
  const isPreviewMode = Boolean(draftProduct) || productSlugOrId === 'preview' || Boolean(isPreview);

  const product = draftProduct || products.find((p) => p.slug === productSlugOrId || p.id === productSlugOrId);

  if (!product) {
    return (
      <NotFoundPage
        onNavigate={onNavigate}
        message={`O equipamento "${productSlugOrId}" não foi encontrado em nosso catálogo ou foi descontinuado.`}
      />
    );
  }

  const category = categories.find((c) => c.id === product.categoryId);
  const brand = brands.find((b) => b.id === product.brandId);

  const formattedPrice = product.price 
    ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)
    : 'Sob Consulta';

  const handleCopyPreviewLink = () => {
    try {
      const token = encodeDraftToShareableUrl(product);
      const shareUrl = `${window.location.origin}/produto/preview?d=${token}`;
      navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch (e) {}
  };

  const whatsappMessage = encodeURIComponent(
    `Olá Athena Soluções Automotivas!\n\nGostaria de mais informações e cotação oficial para o equipamento:\n*${product.name}*\nMarca: ${brand?.name || 'N/A'}\nCategoria: ${category?.name || 'N/A'}\n\nPor favor, me informe sobre valores, frete para meu CEP e formas de pagamento.`
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

  // Smart Related Products Algorithm (Prioritizes same category first, then same brand)
  const sameCategoryProducts = products.filter(
    (p) => p.id !== product.id && p.categoryId === product.categoryId && p.status !== 'draft'
  );

  const sameBrandProducts = products.filter(
    (p) => p.id !== product.id && p.brandId === product.brandId && p.categoryId !== product.categoryId && p.status !== 'draft'
  );

  const relatedProducts = [
    ...sameCategoryProducts,
    ...sameBrandProducts
  ].slice(0, 5);

  const hasSpecs = Array.isArray(product?.specs) && product.specs.length > 0;
  const validCustomTabs = Array.isArray(product?.customTabs) 
    ? product.customTabs.filter(t => t.title && t.title.trim() !== '' && t.content && t.content.trim() !== '') 
    : [];
  const hasAttachments = Array.isArray(product?.attachments) && product.attachments.length > 0;
  const hasVideo = Boolean(product?.videoUrl || product?.youtubeVideoUrl);

  useEffect(() => {
    if (hasSpecs) {
      setActiveTab('specs');
    } else if (validCustomTabs.length > 0) {
      setActiveTab(validCustomTabs[0].id);
    } else if (hasAttachments) {
      setActiveTab('attachments');
    } else if (hasVideo) {
      setActiveTab('video');
    }
  }, [product?.id, hasSpecs, validCustomTabs.length, hasAttachments, hasVideo]);

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
          <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-24 self-start">
            <ProductImageGallery product={product} />

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

                {product.badge && product.badge.trim() && (
                  <span className="badge badge-gold font-bold">
                    {product.badge}
                  </span>
                )}

                {hasVideo && (
                  <button
                    type="button"
                    onClick={() => {
                      document.getElementById('video-demonstrativo')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="badge badge-red hover:bg-red-100 cursor-pointer text-red-700 bg-red-50 border border-red-200 flex items-center gap-1"
                  >
                    <Play className="w-3 h-3 fill-current text-red-600" />
                    <span>Vídeo Demonstrativo</span>
                  </button>
                )}
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                {product.name}
              </h1>

              {/* Modest / Subtle Commercial Condition Banner */}
              <div className="flex flex-wrap items-baseline gap-2 pt-0.5">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {product.price > 0 ? (product.priceNegotiable ? 'Preço Estimado:' : 'Valor Comercial:') : 'Condição Comercial:'}
                </span>
                <span className="text-xl sm:text-2xl font-extrabold text-amber-800 font-display">
                  {formattedPrice}
                </span>
                {product.priceNegotiable && (
                  <span className="text-[11px] text-slate-400 font-medium">
                    (Consulte condições)
                  </span>
                )}
              </div>
            </div>

            {/* Clean Description on Normal White Background */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Descrição do Equipamento</h3>
              <div className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                <FormattedDescription text={product.description} />
              </div>
            </div>

            {/* Action Buttons Below Description */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <a
                href={`https://wa.me/5561983485671?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gold text-xs sm:text-sm py-2.5 px-5 shadow-xs font-bold flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>Cotação Instantânea no WhatsApp</span>
              </a>

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
              const embedUrl = getYouTubeEmbedUrl(product.videoUrl || product.youtubeVideoUrl);
              if (!embedUrl) return null;

              return (
                <div id="video-demonstrativo" className="space-y-3 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                        <Film className="w-4 h-4 text-red-600" />
                        Vídeo & Apresentação do Equipamento
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Demonstração de funcionamento, recursos e orientações de uso deste equipamento.
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-red-50 text-red-700 border border-red-200 text-[10px] font-extrabold flex items-center gap-1.5">
                      <Play className="w-3 h-3 fill-current" /> Vídeo Demonstrativo
                    </span>
                  </div>

                  <div className="aspect-video w-full rounded-2xl overflow-hidden border border-slate-200 shadow-md bg-slate-950">
                    <iframe
                      src={embedUrl}
                      title={`Vídeo - ${product.name}`}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              );
            })()}

            {/* TABS SECTION: "Especificações", Abas Extras Personalizadas, "Ficha Técnica" (se houver) */}
            {(hasSpecs || validCustomTabs.length > 0 || hasAttachments) && (
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

                {/* TAB CONTENT: Abas Personalizadas (Aplicações, Funções, etc.) */}
                {(() => {
                  const currentCustomTab = validCustomTabs.find(t => t.id === activeTab);
                  if (!currentCustomTab) return null;

                  return (
                    <div className="space-y-3 animate-in fade-in duration-150">
                      <div className="p-4 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs sm:text-sm text-slate-700 leading-relaxed">
                        <FormattedDescription text={currentCustomTab.content} />
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

      {/* DISCREET FLOATING ADMIN QUICK-EDIT BUTTON FOR LOGGED-IN USERS */}
      {!isPreviewMode && currentUser && onEditProduct && (
        <div className="fixed bottom-6 right-6 z-40">
          <button
            type="button"
            onClick={() => {
              onEditProduct(product);
            }}
            className="px-4 py-2.5 rounded-2xl bg-slate-900 text-amber-400 hover:bg-slate-800 shadow-2xl border border-amber-500/40 text-xs font-black flex items-center gap-2 transition transform hover:scale-105"
            title="Editar este equipamento no Painel Admin"
          >
            <Edit3 className="w-4 h-4 text-amber-400" />
            <span>Editar Equipamento</span>
          </button>
        </div>
      )}

    </div>
  );
}
