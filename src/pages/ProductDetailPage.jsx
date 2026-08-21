import React from 'react';
import ProductCard from '../components/ProductCard';
import ProductImageGallery from '../components/ProductImageGallery';
import { ArrowLeft, ArrowRight, CheckCircle2, ShieldCheck, Tag, Layers, MessageCircle, PhoneCall, Sparkles, Truck, Package, FileText, Download, ArrowLeftRight } from 'lucide-react';

export const formatAttachmentLabel = (fileName) => {
  if (!fileName) return 'Baixe Documento';
  const nameWithoutExt = fileName.replace(/\.[^/.]+$/, "");
  const cleanName = nameWithoutExt.replace(/[-_]/g, " ");
  return `Baixe ${cleanName}`;
};

export default function ProductDetailPage({ 
  productSlugOrId, 
  products, 
  categories, 
  brands, 
  onNavigate, 
  isPreview, 
  previousRoute,
  comparisonList,
  onToggleComparison
}) {
  const product = products.find((p) => p.slug === productSlugOrId || p.id === productSlugOrId) || products[0];

  if (!product) {
    return (
      <div className="py-16 text-center container-custom space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Produto não encontrado</h2>
        <button onClick={() => onNavigate('catalog')} className="btn-gold text-xs">
          Voltar ao Catálogo
        </button>
      </div>
    );
  }

  const category = categories.find((c) => c.id === product.categoryId);
  const brand = brands.find((b) => b.id === product.brandId);

  const formattedPrice = product.price 
    ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)
    : 'Sob Consulta';

  const whatsappMessage = encodeURIComponent(
    `Olá Athena Soluções Automotivas!\n\nGostaria de mais informações e cotação oficial para o equipamento:\n📌 *${product.name}*\n🏷️ Marca: ${brand?.name || 'N/A'}\n📁 Categoria: ${category?.name || 'N/A'}\n\nPor favor, me informe sobre valores, frete para meu CEP e formas de pagamento.`
  );

  // SMART BACK BUTTON LOGIC
  let backTargetRoute = 'catalog';
  let backButtonLabel = 'Voltar ao Catálogo';

  if (previousRoute) {
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

  // Smart Related Products Algorithm
  const sameCatDiffBrand = products.find(
    (p) => p.id !== product.id && p.categoryId === product.categoryId && p.brandId !== product.brandId && p.status !== 'draft'
  );

  const sameBrandDiffCat = products.find(
    (p) => p.id !== product.id && p.brandId === product.brandId && p.categoryId !== product.categoryId && p.status !== 'draft'
  );

  const diffCatDiffBrand = products.find(
    (p) => p.id !== product.id && p.categoryId !== product.categoryId && p.brandId !== product.brandId && p.status !== 'draft'
  );

  const relatedProducts = [sameCatDiffBrand, sameBrandDiffCat, diffCatDiffBrand].filter(Boolean);

  return (
    <div className="py-10">
      <div className="container-custom space-y-10">
        
        {/* Preview Alert Banner */}
        {isPreview && (
          <div className="bg-sky-500 text-white p-4 rounded-2xl border border-sky-600 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-bold">
              <Sparkles className="w-5 h-5 text-amber-300" />
              <span>MODO DE PRÉ-VISUALIZAÇÃO DE RASCUNHO — Este produto ainda não está visível para clientes.</span>
            </div>
            <button 
              onClick={() => onNavigate('admin')}
              className="bg-white text-slate-900 px-3 py-1.5 rounded-xl text-xs font-extrabold hover:bg-slate-100"
            >
              Voltar ao Admin
            </button>
          </div>
        )}

        {/* Smart Breadcrumbs & Back Button */}
        <div className="flex items-center justify-between gap-4 border-b border-slate-200/80 pb-4 text-xs">
          <button 
            onClick={() => onNavigate(backTargetRoute)}
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
          
          {/* Left Column: Image & Badges */}
          {/* Left Column: Interactive Carousel & Zoom Gallery + Trust Badges */}
          <div className="lg:col-span-5 space-y-4">
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

          {/* Right Column: Title, Price, Specs, Attachments, Description & WhatsApp CTA */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            
            <div className="space-y-3">
              {/* Category & Brand Pills */}
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
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                {product.name}
              </h1>
            </div>

            {/* Price Box */}
            <div className="bg-gradient-to-r from-amber-50/80 to-amber-100/50 p-5 rounded-2xl border border-amber-200 flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  {product.price > 0 ? (product.priceNegotiable ? 'Preço Estimado' : 'Valor Comercial') : 'Condição Comercial'}
                </span>
                <span className="text-2xl sm:text-3xl font-extrabold text-amber-800 font-display">
                  {formattedPrice}
                </span>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap">
                {onToggleComparison && (
                  <button
                    onClick={() => onToggleComparison(product)}
                    className={`text-xs py-3 px-4 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      comparisonList?.some(p => p.id === product.id)
                        ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-400 font-extrabold'
                        : 'bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 shadow-xs'
                    }`}
                  >
                    <ArrowLeftRight className="w-4 h-4" />
                    <span>{comparisonList?.some(p => p.id === product.id) ? 'Em Comparação' : 'Comparar Modelo'}</span>
                  </button>
                )}

                <a
                  href={`https://wa.me/5561983485671?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-gold text-xs sm:text-sm py-3 px-5 shadow-md font-extrabold"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  <span>Cotação Instantânea no WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Descrição do Produto</h3>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                {product.description}
              </p>
            </div>

            {/* Technical Specs List */}
            {product.specs && product.specs.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Especificações Técnicas</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {product.specs.map((spec, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="font-semibold">{spec}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Attachments & Documents Downloads Section */}
            {product.attachments && product.attachments.length > 0 && (
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-amber-600" />
                  Manuais e Fichas Técnicas para Download
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {product.attachments.map((att) => (
                    <a
                      key={att.id}
                      href={att.url}
                      download={att.fileName}
                      className="p-3 rounded-xl bg-slate-100 hover:bg-amber-50 border border-slate-200 hover:border-amber-400 text-slate-900 transition-colors flex items-center justify-between gap-3 text-xs font-bold shadow-xs group"
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="truncate">
                          <span className="block truncate text-amber-900 group-hover:text-amber-800">
                            {formatAttachmentLabel(att.fileName)}
                          </span>
                          {att.fileSize && (
                            <span className="text-[10px] text-slate-500 font-medium block">
                              {att.fileSize}
                            </span>
                          )}
                        </div>
                      </div>

                      <Download className="w-4 h-4 text-amber-600 shrink-0 group-hover:scale-110 transition-transform" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Direct Contact Callout */}
            <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
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
                Opções similares da mesma categoria para o seu centro automotivo.
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
    </div>
  );
}
