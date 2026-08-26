import React, { useState } from 'react';
import { FileText, Printer, Check, X, Layers, Tag, DollarSign, Download, Package } from 'lucide-react';

export default function PdfCatalogGenerator({ products, categories, brands, isOpen, onClose }) {
  const [selectedCatIds, setSelectedCatIds] = useState([]);
  const [selectedBrandIds, setSelectedBrandIds] = useState([]);
  const [showPrices, setShowPrices] = useState(true);

  if (!isOpen) return null;

  const toggleCat = (id) => {
    if (selectedCatIds.includes(id)) {
      setSelectedCatIds(selectedCatIds.filter(c => c !== id));
    } else {
      setSelectedCatIds([...selectedCatIds, id]);
    }
  };

  const toggleBrand = (id) => {
    if (selectedBrandIds.includes(id)) {
      setSelectedBrandIds(selectedBrandIds.filter(b => b !== id));
    } else {
      setSelectedBrandIds([...selectedBrandIds, id]);
    }
  };

  const filteredProducts = products.filter((p) => {
    if (p.status === 'draft') return false;
    const matchesCat = selectedCatIds.length === 0 || selectedCatIds.includes(p.categoryId);
    const matchesBrand = selectedBrandIds.length === 0 || selectedBrandIds.includes(p.brandId);
    return matchesCat && matchesBrand;
  });

  const handleGeneratePdf = () => {
    // Remove previous print iframe if exists
    const existingIframe = document.getElementById('athena-print-iframe');
    if (existingIframe) {
      existingIframe.remove();
    }

    // Grouping by Brand -> Category -> Products
    const brandIdsWithProds = [...new Set(filteredProducts.map(p => p.brandId))];
    const activeBrands = brands.filter(b => brandIdsWithProds.includes(b.id));

    // If there are products without matching brand ID in state
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

          const specsList = (p.specs || []).map(s => `<li>${s}</li>`).join('');

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

          return `
            <div class="product-card">
              <div class="img-box">
                <img src="${p.image || 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=400'}" alt="${p.name}" />
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
            ${brand.logo ? `<img src="${brand.logo}" alt="${brand.name}" class="brand-logo" />` : ''}
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
        <title>Catálogo Comercial — Athena Soluções Automotivas</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
          * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Plus Jakarta Sans', sans-serif; }
          
          @page {
            size: A4 portrait;
            margin: 10mm 8mm 12mm 8mm;
          }

          body { 
            background: #fff; 
            color: #0f172a; 
            font-size: 11.5px; 
            -webkit-print-color-adjust: exact; 
            print-color-adjust: exact;
            padding: 10px;
          }
          
          header { 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            border-bottom: 2.5px solid #d97706; 
            padding-bottom: 12px; 
            margin-bottom: 12px; 
          }
          .logo-area { display: flex; align-items: center; gap: 12px; }
          .logo-area img { width: 50px; height: 50px; border-radius: 10px; object-fit: cover; }
          .brand-title { font-size: 20px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px; line-height: 1.1; }
          .brand-sub { font-size: 10px; font-weight: 700; color: #d97706; text-transform: uppercase; letter-spacing: 0.5px; }
          .contact-info { text-align: right; font-size: 10px; color: #475569; line-height: 1.4; }
          .contact-info strong { color: #0f172a; }

          .catalog-summary { 
            background: #f8fafc; 
            border: 1px solid #e2e8f0; 
            padding: 8px 14px; 
            border-radius: 10px; 
            margin-bottom: 16px; 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
          }
          .summary-text { font-size: 10.5px; color: #64748b; font-weight: 700; text-transform: uppercase; }

          /* BRAND SECTION (FLUID FLOW WITHOUT PAGE 1 CUT) */
          .brand-section { 
            margin-bottom: 22px; 
          }
          .brand-header { 
            display: flex; 
            align-items: center; 
            gap: 12px; 
            background: #0f172a; 
            color: white; 
            padding: 10px 16px; 
            border-radius: 10px; 
            margin-bottom: 14px; 
            border-left: 5px solid #d97706;
            break-after: avoid;
            page-break-after: avoid;
          }
          .brand-logo { width: 38px; height: 38px; object-fit: contain; background: white; padding: 3px; border-radius: 6px; flex-shrink: 0; }
          .brand-name { font-size: 16px; font-weight: 800; color: #ffffff; letter-spacing: -0.3px; line-height: 1.2; }
          .brand-desc { font-size: 9.5px; color: #94a3b8; font-weight: 500; }

          /* CATEGORY BLOCK */
          .category-block { 
            margin-bottom: 18px; 
          }
          .category-header { 
            display: flex; 
            align-items: center; 
            gap: 6px; 
            margin-bottom: 10px; 
            border-bottom: 1.5px solid #e2e8f0; 
            padding-bottom: 6px; 
            break-after: avoid;
            page-break-after: avoid;
          }
          .cat-bullet { width: 8px; height: 8px; border-radius: 50%; background: #d97706; display: inline-block; }
          .category-title { font-size: 12.5px; font-weight: 800; color: #1e293b; text-transform: uppercase; letter-spacing: 0.3px; }
          .cat-count { font-size: 10px; font-weight: 600; color: #64748b; }

          /* PRODUCTS GRID */
          .products-grid { 
            display: grid; 
            grid-template-columns: repeat(2, 1fr); 
            gap: 12px; 
          }
          .product-card { 
            border: 1px solid #e2e8f0; 
            border-radius: 10px; 
            padding: 10px; 
            background: #ffffff; 
            display: flex; 
            gap: 10px; 
            break-inside: avoid; 
            page-break-inside: avoid;
            box-shadow: 0 1px 2px rgba(0,0,0,0.03); 
          }
          .img-box { 
            width: 95px; 
            height: 95px; 
            border-radius: 8px; 
            overflow: hidden; 
            background: #f8fafc; 
            flex-shrink: 0; 
            border: 1px solid #f1f5f9; 
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 4px;
          }
          .img-box img { width: 100%; height: 100%; object-fit: contain; }
          .info-box { flex: 1; display: flex; flex-direction: column; justify-content: space-between; }
          .title-wrap { display: flex; align-items: flex-start; justify-content: space-between; gap: 4px; margin-bottom: 3px; }
          .prod-title { font-size: 11px; font-weight: 800; color: #0f172a; line-height: 1.25; }
          .feat-tag { font-size: 8.5px; font-weight: 800; background: #fef3c7; color: #92400e; border: 1px solid #fde68a; padding: 1px 5px; border-radius: 4px; white-space: nowrap; }
          .desc { font-size: 9px; color: #64748b; margin-bottom: 4px; line-clamp: 2; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.3; }
          .specs { font-size: 8.5px; color: #334155; padding-left: 10px; margin-bottom: 6px; }
          .specs li { margin-bottom: 1px; }
          .price-box { background: #fffbeb; border: 1px solid #fde68a; padding: 4px 8px; border-radius: 6px; display: flex; justify-content: space-between; align-items: center; }
          .price-box span { font-size: 8.5px; font-weight: 700; color: #78350f; }
          .price-val { font-size: 11px; font-weight: 800; color: #b45309; }

          footer { 
            margin-top: 30px; 
            border-top: 1px solid #e2e8f0; 
            padding-top: 12px; 
            text-align: center; 
            font-size: 9.5px; 
            color: #94a3b8; 
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
            <p><strong>Email:</strong> contato@athenaconsultoria.com.br</p>
          </div>
        </header>

        <div class="catalog-summary">
          <span class="summary-text">Catálogo Oficial de Equipamentos & Ferramentas</span>
          <span class="summary-text"><strong>${filteredProducts.length}</strong> produtos em <strong>${activeBrands.length}</strong> fabricante(s)</span>
        </div>

        <div class="catalog-body">
          ${groupedCatalogHtml}
        </div>

        <footer>
          <p>© Athena Soluções Automotivas — Todos os direitos reservados. Equipamentos com garantia e suporte de fábrica.</p>
        </footer>
      </body>
      </html>
    `;

    // Create hidden printing iframe
    const iframe = document.createElement('iframe');
    iframe.id = 'athena-print-iframe';
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentDocument || iframe.contentWindow.document;
    doc.open();
    doc.write(htmlContent);
    doc.close();

    // Print after document and images have rendered
    setTimeout(() => {
      try {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
      } catch (err) {
        console.error('Print iframe error:', err);
      }
    }, 600);
  };

  return (
    <div className="modal-backdrop p-3 sm:p-6" onClick={onClose}>
      <div 
        className="modal-content w-full max-w-lg p-4 sm:p-6 bg-white border-slate-200 relative max-h-[90vh] overflow-y-auto overflow-x-hidden rounded-3xl shadow-2xl" 
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
              <p className="text-[11px] sm:text-xs text-slate-500">Organizado por Marca ➔ Categoria. Filtre como desejar.</p>
            </div>
          </div>

          {/* Filter Categories */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-amber-600 shrink-0" /> Categorias a Incluir:
            </label>
            <div className="max-h-36 overflow-y-auto p-1.5 border border-slate-200/80 rounded-2xl bg-slate-50/50 flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setSelectedCatIds([])}
                className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
                  selectedCatIds.length === 0 ? 'bg-amber-600 text-white' : 'bg-white text-slate-700 border border-slate-200'
                }`}
              >
                Todas as Categorias
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => toggleCat(c.id)}
                  className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all truncate max-w-[160px] sm:max-w-none ${
                    selectedCatIds.includes(c.id) ? 'bg-amber-600 text-white' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Filter Brands */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-sky-600 shrink-0" /> Marcas a Incluir:
            </label>
            <div className="max-h-36 overflow-y-auto p-1.5 border border-slate-200/80 rounded-2xl bg-slate-50/50 flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setSelectedBrandIds([])}
                className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
                  selectedBrandIds.length === 0 ? 'bg-sky-600 text-white' : 'bg-white text-slate-700 border border-slate-200'
                }`}
              >
                Todas as Marcas
              </button>
              {brands.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => toggleBrand(b.id)}
                  className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all truncate max-w-[160px] sm:max-w-none ${
                    selectedBrandIds.includes(b.id) ? 'bg-sky-600 text-white' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {b.name}
                </button>
              ))}
            </div>
          </div>

          {/* Include Prices Option */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-600 shrink-0" /> Exibir Valores no PDF
            </span>
            <input
              type="checkbox"
              checked={showPrices}
              onChange={(e) => setShowPrices(e.target.checked)}
              className="w-4 h-4 accent-amber-600 rounded cursor-pointer shrink-0"
            />
          </div>

          {/* Result Counter & Generate CTA */}
          <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <span className="text-xs font-bold text-amber-800 text-center sm:text-left">
              Total: <strong>{filteredProducts.length}</strong> equipamento(s)
            </span>

            <div className="flex items-center gap-2">
              <button type="button" onClick={onClose} className="btn-secondary text-xs flex-1 sm:flex-none justify-center py-2.5">Cancelar</button>
              <button
                type="button"
                onClick={handleGeneratePdf}
                disabled={filteredProducts.length === 0}
                className="btn-gold text-xs font-bold py-2.5 px-4 gap-1.5 flex-1 sm:flex-none justify-center disabled:opacity-40"
              >
                <Printer className="w-4 h-4 shrink-0" />
                <span>Gerar PDF Comercial</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
