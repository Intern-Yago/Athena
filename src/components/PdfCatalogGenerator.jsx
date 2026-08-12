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
    const printWindow = window.open('', '_blank');

    const productsHtml = filteredProducts.map((p) => {
      const cat = categories.find(c => c.id === p.categoryId)?.name || '';
      const brand = brands.find(b => b.id === p.brandId)?.name || '';
      const priceText = showPrices && p.price > 0 && !p.priceNegotiable
        ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.price)
        : 'Sob Consulta';

      const specsList = (p.specs || []).map(s => `<li>${s}</li>`).join('');

      return `
        <div class="product-card">
          <div class="img-box">
            <img src="${p.image || 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=400'}" alt="${p.name}" />
          </div>
          <div class="info-box">
            <div class="pills">
              <span class="pill cat-pill">${cat}</span>
              <span class="pill brand-pill">${brand}</span>
            </div>
            <h3 class="prod-title">${p.name}</h3>
            <p class="desc">${p.description || ''}</p>
            ${specsList ? `<ul class="specs">${specsList}</ul>` : ''}
            <div class="price-box">
              <span>Valor Estimado:</span>
              <strong class="price-val">${priceText}</strong>
            </div>
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
          body { background: #fff; color: #0f172a; padding: 30px; font-size: 12px; }
          header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #f59e0b; padding-bottom: 20px; margin-bottom: 25px; }
          .logo-area { display: flex; align-items: center; gap: 15px; }
          .logo-area img { width: 60px; height: 60px; border-radius: 12px; object-fit: cover; }
          .brand-title { font-size: 22px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px; }
          .brand-sub { font-size: 11px; font-weight: 700; color: #d97706; text-transform: uppercase; }
          .contact-info { text-align: right; font-size: 11px; color: #475569; line-height: 1.5; }
          .contact-info strong { color: #0f172a; }
          .catalog-summary { background: #f8fafc; border: 1px solid #e2e8f0; padding: 12px 18px; border-radius: 12px; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: center; }
          .summary-text { font-size: 11px; color: #64748b; font-weight: 600; }
          .products-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
          .product-card { border: 1px solid #e2e8f0; border-radius: 16px; padding: 15px; background: #fff; display: flex; gap: 15px; page-break-inside: avoid; }
          .img-box { width: 130px; height: 130px; border-radius: 12px; overflow: hidden; background: #f1f5f9; shrink: 0; }
          .img-box img { width: 100%; height: 100%; object-fit: cover; }
          .info-box { flex: 1; display: flex; flex-direction: column; justify-content: space-between; }
          .pills { display: flex; gap: 6px; margin-bottom: 6px; }
          .pill { font-size: 9px; font-weight: 800; padding: 2px 8px; border-radius: 20px; text-transform: uppercase; }
          .cat-pill { background: #fef3c7; color: #92400e; }
          .brand-pill { background: #e0f2fe; color: #075985; }
          .prod-title { font-size: 13px; font-weight: 800; color: #0f172a; margin-bottom: 6px; line-height: 1.3; }
          .desc { font-size: 10px; color: #64748b; margin-bottom: 8px; line-clamp: 2; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
          .specs { font-size: 9.5px; color: #334155; padding-left: 14px; margin-bottom: 10px; }
          .specs li { margin-bottom: 2px; }
          .price-box { background: #fffbeb; border: 1px solid #fde68a; padding: 6px 12px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; }
          .price-box span { font-size: 10px; font-weight: 700; color: #78350f; }
          .price-val { font-size: 14px; font-weight: 800; color: #b45309; }
          footer { margin-top: 40px; border-top: 1px solid #e2e8f0; pt: 15px; text-align: center; font-size: 10px; color: #94a3b8; }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="margin-bottom: 20px; text-align: right;">
          <button onclick="window.print()" style="background: #d97706; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; cursor: pointer;">
            🖨️ Imprimir / Salvar PDF
          </button>
        </div>

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
            <p><strong>Site:</strong> athenaautomotivas.com.br</p>
          </div>
        </header>

        <div class="catalog-summary">
          <span class="summary-text">CATÁLOGO DE EQUIPAMENTOS E FERRAMENTAS AUTOMOTIVAS</span>
          <span class="summary-text"><strong>${filteredProducts.length}</strong> equipamento(s) selecionado(s)</span>
        </div>

        <div class="products-grid">
          ${productsHtml}
        </div>

        <footer>
          <p>© Athena Soluções Automotivas — Todos os direitos reservados. Valores e disponibilidade sujeitos a alteração sem aviso prévio.</p>
        </footer>

        <script>
          window.onload = function() {
            setTimeout(function() { window.print(); }, 800);
          }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content max-w-lg p-6 bg-white border-slate-200 relative" onClick={(e) => e.stopPropagation()}>
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Gerador de Catálogo em PDF</h3>
              <p className="text-xs text-slate-500">Filtre os produtos desejados para gerar um catálogo impresso comercial.</p>
            </div>
          </div>

          {/* Filter Categories */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-amber-600" /> Categorias a Incluir:
            </label>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setSelectedCatIds([])}
                className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
                  selectedCatIds.length === 0 ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                Todas as Categorias
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => toggleCat(c.id)}
                  className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
                    selectedCatIds.includes(c.id) ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
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
              <Tag className="w-3.5 h-3.5 text-sky-600" /> Marcas a Incluir:
            </label>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setSelectedBrandIds([])}
                className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
                  selectedBrandIds.length === 0 ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                Todas as Marcas
              </button>
              {brands.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => toggleBrand(b.id)}
                  className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
                    selectedBrandIds.includes(b.id) ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
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
              <DollarSign className="w-4 h-4 text-emerald-600" /> Exibir Valores no PDF
            </span>
            <input
              type="checkbox"
              checked={showPrices}
              onChange={(e) => setShowPrices(e.target.checked)}
              className="w-4 h-4 accent-amber-600 rounded cursor-pointer"
            />
          </div>

          {/* Result Counter & Generate CTA */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800">
              Total: <strong>{filteredProducts.length}</strong> equipamento(s)
            </span>

            <div className="flex items-center gap-2">
              <button type="button" onClick={onClose} className="btn-secondary text-xs">Cancelar</button>
              <button
                type="button"
                onClick={handleGeneratePdf}
                disabled={filteredProducts.length === 0}
                className="btn-gold text-xs font-bold py-2.5 px-4 gap-1.5 disabled:opacity-40"
              >
                <Printer className="w-4 h-4" />
                <span>Gerar PDF Comercial</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
