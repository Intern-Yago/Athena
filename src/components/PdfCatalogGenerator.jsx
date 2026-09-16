import React, { useState, useMemo, useEffect } from 'react';
import { 
  FileText, 
  Printer, 
  Check, 
  X, 
  Layers, 
  Tag, 
  DollarSign, 
  Download, 
  Package, 
  Star, 
  AlertTriangle, 
  Info,
  Loader2 
} from 'lucide-react';
import { isProductPublished } from '../utils/imageUrl';

function getOptimizedPdfImage(url) {
  if (!url) return 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=220&q=70&auto=format';
  const clean = String(url).trim();
  if (clean.includes('images.unsplash.com')) {
    return clean.replace(/w=\d+/, 'w=220').replace(/q=\d+/, 'q=70');
  }
  if (clean.includes('res.cloudinary.com') && !clean.includes('/c_scale') && !clean.includes('/c_thumb')) {
    return clean.replace('/upload/', '/upload/c_scale,w_220,q_70,f_auto/');
  }
  return clean;
}

export default function PdfCatalogGenerator({ products, categories, brands, isOpen, onClose }) {
  const [selectedCatIds, setSelectedCatIds] = useState([]);
  const [selectedBrandIds, setSelectedBrandIds] = useState([]);
  const [showPrices, setShowPrices] = useState(true);
  const [onlyFeatured, setOnlyFeatured] = useState(false);
  const [maxProducts, setMaxProducts] = useState(40); // 40 is fast and prevents browser lockup
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  // 1. Compute available brands with published product counts
  const availableBrands = useMemo(() => {
    const brandCounts = new Map();
    products.forEach(p => {
      if (isProductPublished(p) && p.brandId) {
        brandCounts.set(p.brandId, (brandCounts.get(p.brandId) || 0) + 1);
      }
    });

    return brands
      .map(b => ({
        ...b,
        productCount: brandCounts.get(b.id) || 0
      }))
      .filter(b => b.productCount > 0);
  }, [products, brands]);

  // 2. Compute available categories DYNAMICALLY based on selected brand(s)
  // When a brand (e.g. Delta) is selected, only categories that Delta actually has appear!
  const availableCategories = useMemo(() => {
    const brandProducts = products.filter(p => {
      if (!isProductPublished(p)) return false;
      if (selectedBrandIds.length === 0) return true;
      return selectedBrandIds.includes(p.brandId);
    });

    const activeCatCounts = new Map();
    brandProducts.forEach(p => {
      if (p.categoryId) {
        activeCatCounts.set(p.categoryId, (activeCatCounts.get(p.categoryId) || 0) + 1);
      }
    });

    return categories
      .filter(c => activeCatCounts.has(c.id))
      .map(c => ({
        ...c,
        productCount: activeCatCounts.get(c.id) || 0
      }));
  }, [products, categories, selectedBrandIds]);

  // 3. Auto-prune any selected categories that are no longer valid for the newly selected brand(s)
  useEffect(() => {
    if (selectedCatIds.length > 0) {
      const validCatIds = new Set(availableCategories.map(c => c.id));
      const pruned = selectedCatIds.filter(id => validCatIds.has(id));
      if (pruned.length !== selectedCatIds.length) {
        setSelectedCatIds(pruned);
      }
    }
  }, [availableCategories, selectedCatIds]);

  const toggleBrand = (id) => {
    if (selectedBrandIds.includes(id)) {
      setSelectedBrandIds(selectedBrandIds.filter(b => b !== id));
    } else {
      setSelectedBrandIds([...selectedBrandIds, id]);
    }
  };

  const toggleCat = (id) => {
    if (selectedCatIds.includes(id)) {
      setSelectedCatIds(selectedCatIds.filter(c => c !== id));
    } else {
      setSelectedCatIds([...selectedCatIds, id]);
    }
  };

  // Compute all matching products before applying the max products cutoff
  const allMatchingProducts = useMemo(() => {
    return products.filter((p) => {
      if (!isProductPublished(p)) return false;
      const matchesBrand = selectedBrandIds.length === 0 || selectedBrandIds.includes(p.brandId);
      const matchesCat = selectedCatIds.length === 0 || selectedCatIds.includes(p.categoryId);
      const matchesFeatured = !onlyFeatured || Boolean(p.isFeatured);
      return matchesBrand && matchesCat && matchesFeatured;
    });
  }, [products, selectedCatIds, selectedBrandIds, onlyFeatured]);

  // Apply maximum products slice to keep PDF lightweight and avoid freezing browser
  const filteredProducts = useMemo(() => {
    if (maxProducts > 0 && allMatchingProducts.length > maxProducts) {
      return allMatchingProducts.slice(0, maxProducts);
    }
    return allMatchingProducts;
  }, [allMatchingProducts, maxProducts]);

  const handleGeneratePdf = () => {
    if (filteredProducts.length === 0 || isGenerating) return;

    setIsGenerating(true);

    // Remove previous print iframe if exists
    const existingIframe = document.getElementById('athena-print-iframe');
    if (existingIframe) {
      existingIframe.remove();
    }

    // Grouping by Brand -> Category -> Products
    const brandIdsWithProds = [...new Set(filteredProducts.map(p => p.brandId))];
    const activeBrands = brands.filter(b => brandIdsWithProds.includes(b.id));

    // Fallback if products don't map to a recognized brand
    if (activeBrands.length === 0 && filteredProducts.length > 0) {
      activeBrands.push({ id: 'other', name: 'Equipamentos Athena', logo: '' });
    }

    const groupedCatalogHtml = activeBrands.map((brand) => {
      const brandProducts = filteredProducts.filter(p => p.brandId === brand.id || (brand.id === 'other' && !p.brandId));
      if (brandProducts.length === 0) return '';

      const catIdsInBrand = [...new Set(brandProducts.map(p => p.categoryId))];
      const activeCatsInBrand = categories.filter(c => catIdsInBrand.includes(c.id));

      const categoriesHtml = activeCatsInBrand.map((cat) => {
        const catProds = brandProducts.filter(p => p.categoryId === cat.id);
        if (catProds.length === 0) return '';

        const productsGridHtml = catProds.map((p) => {
          const priceText = showPrices && p.price > 0 && !p.priceNegotiable
            ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.price)
            : 'Sob Consulta';

          // Limit specs to 3 items for compact and clean layout
          const specsList = (p.specs || []).slice(0, 3).map(s => `<li>${s}</li>`).join('');

          const formattedDesc = (p.description || '')
            .replace(/\[(?:color|cor)=([a-zA-Z0-9_\-]+)\](.*?)\[\/(?:color|cor)\]/gi, (_, color, text) => {
              const hex = color.includes('azul') || color.includes('blue') ? '#0284c7' : (color.includes('verde') || color.includes('green') ? '#059669' : (color.includes('vermelho') || color.includes('red') ? '#dc2626' : '#d97706'));
              return `<span style="color:${hex};font-weight:bold;">${text}</span>`;
            })
            .replace(/\[(?:destaque|highlight)\](.*?)\[\/(?:destaque|highlight)\]/gi, '<mark style="background:#fef3c7;color:#78350f;padding:1px 4px;border-radius:3px;">$1</mark>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/<u>(.*?)<\/u>/g, '<u>$1</u>')
            .replace(/^[•\-\*]\s+(.*)$/gm, '&bull; $1<br/>');

          const optImage = getOptimizedPdfImage(p.image);

          return `
            <div class="product-card">
              <div class="img-box">
                <img src="${optImage}" alt="${p.name}" loading="eager" decoding="async" width="85" height="85" />
              </div>
              <div class="info-box">
                <div class="title-wrap">
                  <h4 class="prod-title">${p.name}</h4>
                  ${p.isFeatured ? '<span class="feat-tag">⭐ Destaque</span>' : ''}
                </div>
                <p class="desc">${formattedDesc}</p>
                ${specsList ? `<ul class="specs">${specsList}</ul>` : ''}
                <div class="price-box">
                  <span>Condição Comercial:</span>
                  <strong class="price-val">${priceText}</strong>
                </div>
              </div>
            </div>
          `;
        }).join('');

        return `
          <div class="category-block">
            <div class="category-header">
              <span class="cat-bullet"></span>
              <h3 class="category-title">${cat.name}</h3>
              <span class="cat-count">(${catProds.length} item(s))</span>
            </div>
            <div class="products-grid">
              ${productsGridHtml}
            </div>
          </div>
        `;
      }).join('');

      return `
        <div class="brand-section">
          <div class="brand-header">
            ${brand.logo ? `<img src="${brand.logo}" alt="${brand.name}" class="brand-logo" width="32" height="32" />` : ''}
            <div>
              <h2 class="brand-name">${brand.name}</h2>
              <p class="brand-desc">${brand.description || 'Fabricante parceiro oficial homologado.'}</p>
            </div>
          </div>
          <div class="brand-categories">
            ${categoriesHtml}
          </div>
        </div>
      `;
    }).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8" />
        <title>Catálogo Athena</title>
        <style>
          * { 
            box-sizing: border-box; 
            margin: 0; 
            padding: 0; 
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; 
          }
          
          /* ELIMINATE BROWSER HEADER (DATE) & FOOTER (URL/LINK) */
          @page {
            size: A4 portrait;
            margin: 0mm !important;
          }

          @media print {
            @page {
              size: A4 portrait;
              margin: 0mm !important;
            }
            html, body {
              margin: 0mm !important;
              padding: 0mm !important;
              background: #ffffff !important;
            }
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              box-shadow: none !important;
              text-shadow: none !important;
            }
          }

          body { 
            background: #ffffff; 
            color: #0f172a; 
            font-size: 11px; 
            line-height: 1.35;
            padding: 10mm 10mm 12mm 10mm;
          }
          
          header { 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            border-bottom: 2.5px solid #d97706; 
            padding-bottom: 10px; 
            margin-bottom: 12px; 
          }
          .logo-area { display: flex; align-items: center; gap: 10px; }
          .logo-area img { width: 44px; height: 44px; border-radius: 8px; object-fit: cover; }
          .brand-title { font-size: 18px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px; line-height: 1.1; }
          .brand-sub { font-size: 9.5px; font-weight: 700; color: #d97706; text-transform: uppercase; letter-spacing: 0.5px; }
          .contact-info { text-align: right; font-size: 9.5px; color: #475569; line-height: 1.35; }
          .contact-info strong { color: #0f172a; }

          .catalog-summary { 
            background: #f8fafc; 
            border: 1px solid #e2e8f0; 
            padding: 7px 12px; 
            border-radius: 8px; 
            margin-bottom: 14px; 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
          }
          .summary-text { font-size: 10px; color: #475569; font-weight: 700; text-transform: uppercase; }

          /* BRAND SECTION */
          .brand-section { 
            margin-bottom: 18px; 
          }
          .brand-header { 
            display: flex; 
            align-items: center; 
            gap: 10px; 
            background: #0f172a; 
            color: #ffffff; 
            padding: 8px 12px; 
            border-radius: 8px; 
            margin-bottom: 12px; 
            border-left: 5px solid #d97706;
            break-after: avoid;
            page-break-after: avoid;
          }
          .brand-logo { width: 32px; height: 32px; object-fit: contain; background: white; padding: 2px; border-radius: 4px; flex-shrink: 0; }
          .brand-name { font-size: 14px; font-weight: 800; color: #ffffff; letter-spacing: -0.3px; line-height: 1.2; }
          .brand-desc { font-size: 9px; color: #94a3b8; font-weight: 500; }

          /* CATEGORY BLOCK */
          .category-block { 
            margin-bottom: 14px; 
          }
          .category-header { 
            display: flex; 
            align-items: center; 
            gap: 6px; 
            margin-bottom: 8px; 
            border-bottom: 1px solid #e2e8f0; 
            padding-bottom: 4px; 
            break-after: avoid;
            page-break-after: avoid;
          }
          .cat-bullet { width: 7px; height: 7px; border-radius: 50%; background: #d97706; display: inline-block; }
          .category-title { font-size: 11.5px; font-weight: 800; color: #1e293b; text-transform: uppercase; letter-spacing: 0.3px; }
          .cat-count { font-size: 9.5px; font-weight: 600; color: #64748b; }

          /* PRODUCTS GRID (Optimized, no expensive CSS filters) */
          .products-grid { 
            display: grid; 
            grid-template-columns: repeat(2, 1fr); 
            gap: 10px; 
          }
          .product-card { 
            border: 1px solid #cbd5e1; 
            border-radius: 8px; 
            padding: 8px; 
            background: #ffffff; 
            display: flex; 
            gap: 8px; 
            break-inside: avoid; 
            page-break-inside: avoid;
            box-shadow: none !important;
          }
          .img-box { 
            width: 85px; 
            height: 85px; 
            border-radius: 6px; 
            overflow: hidden; 
            background: #f8fafc; 
            flex-shrink: 0; 
            border: 1px solid #e2e8f0; 
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2px; 
          }
          .img-box img { width: 100%; height: 100%; object-fit: contain; }
          .info-box { flex: 1; display: flex; flex-direction: column; justify-content: space-between; }
          .title-wrap { display: flex; align-items: flex-start; justify-content: space-between; gap: 4px; margin-bottom: 2px; }
          .prod-title { font-size: 10.5px; font-weight: 800; color: #0f172a; line-height: 1.25; }
          .feat-tag { font-size: 8px; font-weight: 800; background: #fef3c7; color: #92400e; border: 1px solid #fde68a; padding: 1px 4px; border-radius: 3px; white-space: nowrap; }
          .desc { font-size: 8.5px; color: #475569; margin-bottom: 3px; line-clamp: 2; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.25; }
          .specs { font-size: 8px; color: #334155; padding-left: 8px; margin-bottom: 4px; }
          .specs li { margin-bottom: 1px; }
          .price-box { background: #fffbeb; border: 1px solid #fde68a; padding: 3px 6px; border-radius: 5px; display: flex; justify-content: space-between; align-items: center; }
          .price-box span { font-size: 8px; font-weight: 700; color: #78350f; }
          .price-val { font-size: 10.5px; font-weight: 800; color: #b45309; }

          footer { 
            margin-top: 24px; 
            border-top: 1px solid #e2e8f0; 
            padding-top: 10px; 
            text-align: center; 
            font-size: 9px; 
            color: #64748b; 
            break-inside: avoid;
            page-break-inside: avoid;
          }
        </style>
      </head>
      <body>
        <header>
          <div class="logo-area">
            <img src="${window.location.origin}/logo.jpg" onError="this.style.display='none'" />
            <div>
              <div class="brand-title">ATHENA</div>
              <div class="brand-sub">Soluções Automotivas</div>
            </div>
          </div>
          <div class="contact-info">
            <p><strong>Atendimento Comercial:</strong> (61) 98348-5671</p>
            <p><strong>Instagram:</strong> @athena.solucoes.automotivas</p>
            <p><strong>E-mail:</strong> contato@athenaconsultoria.com.br</p>
          </div>
        </header>

        <div class="catalog-summary">
          <span class="summary-text">Catálogo Comercial Oficial</span>
          <span class="summary-text"><strong>${filteredProducts.length}</strong> produtos em <strong>${activeBrands.length}</strong> fabricante(s)</span>
        </div>

        <div class="catalog-body">
          ${groupedCatalogHtml}
        </div>

        <footer>
          <p>© Athena Soluções Automotivas — Equipamentos com garantia e suporte direto de fábrica.</p>
        </footer>
      </body>
      </html>
    `;

    // Hidden printing iframe
    const iframe = document.createElement('iframe');
    iframe.id = 'athena-print-iframe';
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.zIndex = '-9999';
    document.body.appendChild(iframe);

    const doc = iframe.contentDocument || iframe.contentWindow.document;
    doc.open();
    doc.write(htmlContent);
    doc.close();

    // Fast print execution after DOM is parsed
    setTimeout(() => {
      try {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
      } catch (err) {
        console.error('Print iframe error:', err);
      } finally {
        setIsGenerating(false);
      }
    }, 450);
  };

  // Names of currently selected brands for context hint
  const selectedBrandNames = useMemo(() => {
    if (selectedBrandIds.length === 0) return '';
    return selectedBrandIds
      .map(id => brands.find(b => b.id === id)?.name)
      .filter(Boolean)
      .join(', ');
  }, [selectedBrandIds, brands]);

  return (
    <div className="modal-backdrop p-3 sm:p-6" onClick={onClose}>
      <div 
        className="modal-content w-full max-w-xl p-4 sm:p-6 bg-white border-slate-200 relative max-h-[92vh] overflow-y-auto overflow-x-hidden rounded-3xl shadow-2xl" 
        onClick={(e) => e.stopPropagation()}
      >
        
        <button 
          onClick={onClose}
          className="absolute top-3 sm:top-4 right-3 sm:right-4 p-2 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-4">
          <div className="flex items-center gap-3 pr-8">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">Gerador de Catálogo em PDF</h3>
              <p className="text-[11px] sm:text-xs text-slate-500">Gere catálogos limpos, leves e organizados para seus clientes.</p>
            </div>
          </div>

          {/* Clean PDF Header & Footer Advisory */}
          <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200/80 text-[11px] text-amber-900 flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong>Impressão 100% Limpa:</strong> O sistema remove data e links automaticamente via CSS. Na janela de impressão do seu navegador, confirme que <u>"Cabeçalhos e rodapés"</u> está desmarcado e <u>"Gráficos de segundo plano"</u> está marcado.
            </div>
          </div>

          {/* Quantity Limiter & Featured Toggle (Prevents PC and Browser freeze) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
              <label className="text-xs font-bold text-slate-800 block">
                Limite de Equipamentos:
              </label>
              <select
                value={maxProducts}
                onChange={(e) => setMaxProducts(Number(e.target.value))}
                className="w-full text-xs font-semibold px-2.5 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
              >
                <option value={30}>30 equipamentos (Ultra rápido & leve)</option>
                <option value={40}>40 equipamentos (Recomendado)</option>
                <option value={80}>80 equipamentos (Catálogo médio)</option>
                <option value={150}>150 equipamentos (Extenso)</option>
                <option value={0}>Todos os equipamentos (Atenção: pesado)</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> Apenas Destaques
                </span>
                <p className="text-[10px] text-slate-500">Filtrar somente itens em evidência</p>
              </div>
              <input
                type="checkbox"
                checked={onlyFeatured}
                onChange={(e) => setOnlyFeatured(e.target.checked)}
                className="w-4 h-4 accent-amber-600 rounded cursor-pointer shrink-0"
              />
            </div>
          </div>

          {/* STEP 1: Filter Brands First */}
          <div className="space-y-2 pt-1 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-sky-600 shrink-0" /> 1. Fabricantes / Marcas a Incluir:
              </label>
              <span className="text-[10px] text-slate-500">
                {selectedBrandIds.length === 0 ? 'Todas inclusas' : `${selectedBrandIds.length} selecionada(s)`}
              </span>
            </div>
            <div className="max-h-32 overflow-y-auto p-1.5 border border-slate-200/80 rounded-2xl bg-slate-50/50 flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setSelectedBrandIds([])}
                className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
                  selectedBrandIds.length === 0 ? 'bg-sky-600 text-white shadow-sm' : 'bg-white text-slate-700 border border-slate-200'
                }`}
              >
                Todas as Marcas
              </button>
              {availableBrands.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => toggleBrand(b.id)}
                  className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all truncate max-w-[170px] sm:max-w-none ${
                    selectedBrandIds.includes(b.id) 
                      ? 'bg-sky-600 text-white shadow-sm' 
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                  title={`${b.name} (${b.productCount} produtos)`}
                >
                  {b.name} <span className="opacity-75 text-[10px]">({b.productCount})</span>
                </button>
              ))}
            </div>
          </div>

          {/* STEP 2: Filter Categories Dynamically based on Selected Brand(s) */}
          <div className="space-y-2 pt-1 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-amber-600 shrink-0" /> 2. Categorias a Incluir:
              </label>
              <span className="text-[10px] text-slate-500">
                {selectedCatIds.length === 0 ? 'Todas da(s) marca(s)' : `${selectedCatIds.length} selecionada(s)`}
              </span>
            </div>

            {selectedBrandNames && (
              <p className="text-[11px] text-sky-800 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-100 flex items-center gap-1.5">
                <span className="font-semibold">Categorias com produtos em:</span>
                <span className="truncate">{selectedBrandNames}</span>
              </p>
            )}

            <div className="max-h-36 overflow-y-auto p-1.5 border border-slate-200/80 rounded-2xl bg-slate-50/50 flex flex-wrap gap-1.5">
              {availableCategories.length === 0 ? (
                <p className="text-xs text-slate-500 p-2 italic w-full text-center">
                  Nenhuma categoria com produtos cadastrados para o filtro atual.
                </p>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setSelectedCatIds([])}
                    className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
                      selectedCatIds.length === 0 ? 'bg-amber-600 text-white shadow-sm' : 'bg-white text-slate-700 border border-slate-200'
                    }`}
                  >
                    Todas as Categorias ({availableCategories.length})
                  </button>
                  {availableCategories.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => toggleCat(c.id)}
                      className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all truncate max-w-[200px] sm:max-w-none ${
                        selectedCatIds.includes(c.id) 
                          ? 'bg-amber-600 text-white shadow-sm' 
                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                      }`}
                      title={`${c.name} (${c.productCount} produtos)`}
                    >
                      {c.name} <span className="opacity-75 text-[10px]">({c.productCount})</span>
                    </button>
                  ))}
                </>
              )}
            </div>
          </div>

          {/* Include Prices Option */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-600 shrink-0" /> Exibir Preços Comerciais no PDF
              </span>
              <p className="text-[10px] text-slate-500">Se desmarcado, exibirá "Sob Consulta"</p>
            </div>
            <input
              type="checkbox"
              checked={showPrices}
              onChange={(e) => setShowPrices(e.target.checked)}
              className="w-4 h-4 accent-amber-600 rounded cursor-pointer shrink-0"
            />
          </div>

          {/* Heavy Selection Warning */}
          {filteredProducts.length > 80 && (
            <div className="p-2.5 bg-amber-50/90 rounded-xl border border-amber-300 text-[11px] text-amber-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Gerar mais de 80 itens de uma vez pode deixar a pré-visualização do navegador lenta. Para maior agilidade, recomendamos filtrar por Categoria ou Marca.</span>
            </div>
          )}

          {/* Result Counter & Generate CTA */}
          <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="text-center sm:text-left">
              <span className="text-xs font-bold text-slate-800 block">
                Total a imprimir: <strong className="text-amber-700">{filteredProducts.length}</strong> equipamento(s)
              </span>
              {maxProducts > 0 && allMatchingProducts.length > maxProducts && (
                <span className="text-[10px] text-slate-500">
                  (Limitado aos primeiros {maxProducts} de {allMatchingProducts.length} disponíveis)
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button 
                type="button" 
                onClick={onClose} 
                disabled={isGenerating}
                className="btn-secondary text-xs flex-1 sm:flex-none justify-center py-2.5 px-3.5"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleGeneratePdf}
                disabled={filteredProducts.length === 0 || isGenerating}
                className="btn-gold text-xs font-bold py-2.5 px-4 gap-1.5 flex-1 sm:flex-none justify-center disabled:opacity-40"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 shrink-0 animate-spin" />
                    <span>Preparando PDF...</span>
                  </>
                ) : (
                  <>
                    <Printer className="w-4 h-4 shrink-0" />
                    <span>Gerar PDF Comercial</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
