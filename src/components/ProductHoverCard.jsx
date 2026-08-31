import React, { useState, useRef, useEffect } from 'react';
import { Eye, ExternalLink, Sparkles, Check, ArrowRight } from 'lucide-react';

export default function ProductHoverCard({
  product,
  onSelectProduct,
  children,
  className = ''
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);
  const hoverTimeoutRef = useRef(null);

  if (!product) {
    return <>{children}</>;
  }

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        setCoords({
          top: rect.bottom + window.scrollY + 8,
          left: Math.max(16, Math.min(window.innerWidth - 300, rect.left + window.scrollX))
        });
        setIsOpen(true);
      }
    }, 220);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 180);
  };

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  const formattedPrice = product.price
    ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)
    : 'Sob Consulta';

  return (
    <>
      <span
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={(e) => {
          e.preventDefault();
          if (onSelectProduct) {
            onSelectProduct(product);
          }
        }}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-950 hover:text-amber-900 border border-amber-300/80 hover:border-amber-400 font-bold text-xs transition-all cursor-pointer shadow-2xs group ${className}`}
        title={`Clique para ver detalhes rápidos de "${product.name}"`}
      >
        <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 group-hover:scale-125 transition-transform" />
        <span className="underline decoration-amber-400/60 underline-offset-2">{children || product.name}</span>
        <Eye className="w-3 h-3 text-amber-700 opacity-70 group-hover:opacity-100 shrink-0" />
      </span>

      {/* Floating Hovercard (Desktop Only) */}
      {isOpen && (
        <div
          onMouseEnter={() => {
            if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
            setIsOpen(true);
          }}
          onMouseLeave={handleMouseLeave}
          style={{
            position: 'absolute',
            top: `${coords.top}px`,
            left: `${coords.left}px`,
            zIndex: 9999
          }}
          className="w-72 p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xl space-y-3 animate-in fade-in zoom-in-95 duration-150 text-left pointer-events-auto"
        >
          {/* Card Header with Image & Title */}
          <div className="flex gap-3 items-start">
            <div className="w-16 h-16 rounded-xl bg-slate-50 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0 p-1">
              <img
                src={product.image || (product.images && product.images[0]) || 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=400&auto=format&fit=crop&q=80'}
                alt={product.name}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-md inline-block mb-1">
                Equipamento Compatível
              </span>
              <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2">
                {product.name}
              </h4>
            </div>
          </div>

          {/* Key Specs Preview (up to 2) */}
          {product.specs && product.specs.length > 0 && (
            <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 space-y-1">
              {product.specs.slice(0, 2).map((spec, i) => (
                <div key={i} className="text-[11px] text-slate-600 flex items-center gap-1.5 truncate">
                  <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span className="truncate">{spec}</span>
                </div>
              ))}
            </div>
          )}

          {/* Price & Action Buttons */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-100">
            <div>
              <span className="text-[9px] font-bold uppercase text-slate-400 block">Preço</span>
              <span className="text-xs font-black text-amber-800 font-display">
                {formattedPrice}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                  if (onSelectProduct) onSelectProduct(product);
                }}
                className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold transition shadow-xs flex items-center gap-1 cursor-pointer"
                title="Abrir prévia rápida na tela"
              >
                <Eye className="w-3 h-3" />
                <span>Ver Rápido</span>
              </button>

              <a
                href={`/produto/${product.slug || product.id}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs transition border border-slate-200 cursor-pointer"
                title="Abrir página completa em nova aba"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
