import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2, X } from 'lucide-react';

export default function ProductImageGallery({ product }) {
  // Collect all images (primary product.image + optional product.images array)
  const rawImages = [
    product?.image,
    ...(Array.isArray(product?.images) ? product.images : [])
  ].filter(Boolean);

  // Remove duplicates while preserving order
  const imageList = Array.from(new Set(rawImages));

  const fallbackImage = 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&auto=format&fit=crop&q=80';
  const displayImages = imageList.length > 0 ? imageList : [fallbackImage];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [zoomState, setZoomState] = useState({ show: false, x: 50, y: 50 });
  const [zoomLevel, setZoomLevel] = useState(2.5); // Default 2.5x magnification
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const containerRef = useRef(null);

  // Reset index if product changes
  useEffect(() => {
    setCurrentIndex(0);
    setZoomLevel(2.5);
  }, [product?.id]);

  // Lock background scroll and handle ESC/arrow keys when lightbox is open
  useEffect(() => {
    if (isLightboxOpen) {
      const orig = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          setIsLightboxOpen(false);
        } else if (e.key === 'ArrowLeft') {
          setCurrentIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
        } else if (e.key === 'ArrowRight') {
          setCurrentIndex((prev) => (prev + 1) % displayImages.length);
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = orig;
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isLightboxOpen, displayImages.length]);

  // Add non-passive wheel event listener to container so e.preventDefault() works smoothly
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleWheelEvent = (e) => {
      e.preventDefault();
      // Scroll Up (deltaY < 0) = Zoom IN; Scroll Down (deltaY > 0) = Zoom OUT
      const delta = e.deltaY < 0 ? 0.3 : -0.3;
      setZoomLevel((prev) => {
        const next = Math.max(1.2, Math.min(5.0, Number((prev + delta).toFixed(1))));
        return next;
      });
    };

    el.addEventListener('wheel', handleWheelEvent, { passive: false });
    return () => {
      el.removeEventListener('wheel', handleWheelEvent);
    };
  }, []);

  const handlePrev = (e) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
  };

  const handleNext = (e) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % displayImages.length);
  };

  // Mouse move handler for Desktop PC Lens Magnifier Zoom
  const handleMouseMove = (e) => {
    // If hovering over any interactive button or control (arrows, dots, expand button), immediately turn off zoom
    if (e.target.closest('button') || e.target.closest('.no-zoom-control')) {
      if (zoomState.show) {
        setZoomState((prev) => ({ ...prev, show: false }));
      }
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomState({ show: true, x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
  };

  const handleMouseLeave = () => {
    setZoomState((prev) => ({ ...prev, show: false }));
  };

  const currentImageUrl = displayImages[currentIndex] || fallbackImage;

  return (
    <div className="space-y-3 select-none">
      
      {/* Main Image Viewport with Hover Zoom Lens + Click to Expand */}
      <div 
        ref={containerRef}
        onClick={() => setIsLightboxOpen(true)}
        className="bg-white p-3 rounded-3xl border border-slate-200 shadow-xs aspect-square relative flex items-center justify-center overflow-hidden cursor-pointer group"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        title="Clique para abrir e ver a foto expandida"
      >
        <img 
          src={currentImageUrl} 
          alt={product?.name || 'Equipamento Athena'} 
          decoding="async"
          className="w-full h-full object-cover rounded-2xl transition-opacity duration-300"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80';
          }}
        />

        {/* Badge Overlay */}
        {product?.badge && (
          <span className="absolute top-4 left-4 badge badge-gold shadow-md z-10 pointer-events-none">
            {product.badge}
          </span>
        )}

        {/* Click to Expand Trigger Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsLightboxOpen(true);
          }}
          onMouseEnter={(e) => {
            e.stopPropagation();
            setZoomState((prev) => ({ ...prev, show: false }));
          }}
          onMouseMove={(e) => {
            e.stopPropagation();
            setZoomState((prev) => ({ ...prev, show: false }));
          }}
          className="no-zoom-control absolute top-4 right-4 z-30 p-2 rounded-xl bg-white/90 hover:bg-amber-600 text-slate-800 hover:text-white shadow-md transition-all flex items-center gap-1.5 text-xs font-bold backdrop-blur-xs"
          title="Ver foto expandida sem zoom"
        >
          <Maximize2 className="w-4 h-4 text-amber-600 hover:text-white transition-colors" />
          <span className="hidden sm:inline text-[11px]">Ampliar</span>
        </button>

        {/* Desktop PC Magnifier Zoom Layer (Triggers on Hover) */}
        {zoomState.show && (
          <div 
            className="absolute inset-0 z-20 pointer-events-none rounded-2xl bg-no-repeat shadow-inner hidden md:block"
            style={{
              backgroundImage: `url("${currentImageUrl}")`,
              backgroundPosition: `${zoomState.x}% ${zoomState.y}%`,
              backgroundSize: `${zoomLevel * 100}%`,
              backgroundColor: '#ffffff'
            }}
          >
            {/* Live Zoom Level Indicator & Control Prompt */}
            <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-slate-900/90 backdrop-blur-md text-white text-[11px] font-bold flex items-center gap-2 shadow-xl border border-slate-700">
              <ZoomIn className="w-3.5 h-3.5 text-amber-400" />
              <span>Zoom: {zoomLevel.toFixed(1)}x</span>
              <span className="text-[9px] text-slate-400 border-l border-slate-700 pl-2">
                (Clique para tela cheia)
              </span>
            </div>
          </div>
        )}

        {/* Previous / Next Arrow Controls (Shown when multiple images exist) */}
        {displayImages.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              onMouseEnter={(e) => {
                e.stopPropagation();
                setZoomState((prev) => ({ ...prev, show: false }));
              }}
              onMouseMove={(e) => {
                e.stopPropagation();
                setZoomState((prev) => ({ ...prev, show: false }));
              }}
              className="no-zoom-control absolute left-3 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-white/90 text-slate-800 shadow-md hover:bg-amber-600 hover:text-white transition-all opacity-80 group-hover:opacity-100 active:scale-95"
              title="Foto Anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={handleNext}
              onMouseEnter={(e) => {
                e.stopPropagation();
                setZoomState((prev) => ({ ...prev, show: false }));
              }}
              onMouseMove={(e) => {
                e.stopPropagation();
                setZoomState((prev) => ({ ...prev, show: false }));
              }}
              className="no-zoom-control absolute right-3 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-white/90 text-slate-800 shadow-md hover:bg-amber-600 hover:text-white transition-all opacity-80 group-hover:opacity-100 active:scale-95"
              title="Próxima Foto"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Autoplay Progress Dots / Counter */}
            <div 
              onMouseEnter={(e) => {
                e.stopPropagation();
                setZoomState((prev) => ({ ...prev, show: false }));
              }}
              onMouseMove={(e) => {
                e.stopPropagation();
                setZoomState((prev) => ({ ...prev, show: false }));
              }}
              className="no-zoom-control absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/75 backdrop-blur-xs text-white text-[10px] font-bold"
            >
              {displayImages.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIndex(idx);
                  }}
                  onMouseEnter={(e) => {
                    e.stopPropagation();
                    setZoomState((prev) => ({ ...prev, show: false }));
                  }}
                  className={`w-2 h-2 rounded-full transition-all ${
                    currentIndex === idx ? 'bg-amber-400 w-4' : 'bg-white/60 hover:bg-white'
                  }`}
                  title={`Foto ${idx + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails Row (Shown when multiple images exist) */}
      {displayImages.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {displayImages.map((imgUrl, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 bg-white shadow-xs ${
                currentIndex === idx
                  ? 'border-amber-500 scale-105 shadow-md'
                  : 'border-slate-200 hover:border-amber-300 opacity-70 hover:opacity-100'
              }`}
            >
              <img 
                src={imgUrl} 
                alt={`Miniatura ${idx + 1}`} 
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = fallbackImage;
                }}
              />
            </button>
          ))}
        </div>
      )}

      {/* FULL SCREEN EXPANDED PHOTO LIGHTBOX MODAL */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-between p-4 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setIsLightboxOpen(false)}
        >
          {/* Top Header of Lightbox */}
          <div 
            className="w-full max-w-5xl flex items-center justify-between text-white pb-3 border-b border-slate-800 z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <span className="font-bold text-sm sm:text-base text-slate-200 truncate max-w-xs sm:max-w-md">
                {product?.name || 'Equipamento'}
              </span>
              {displayImages.length > 1 && (
                <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold shrink-0">
                  Foto {currentIndex + 1} de {displayImages.length}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Fechar visualizador (ESC)"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Main Full Image Viewport */}
          <div 
            className="flex-1 w-full max-w-5xl flex items-center justify-center relative p-2 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {displayImages.length > 1 && (
              <button
                type="button"
                onClick={handlePrev}
                className="absolute left-2 sm:left-4 z-20 p-3 rounded-full bg-slate-900/80 hover:bg-amber-600 text-white shadow-xl transition-all active:scale-95"
                title="Foto Anterior (Seta Esquerda)"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            <img
              src={currentImageUrl}
              alt={product?.name || 'Equipamento Athena'}
              className="max-h-[75vh] max-w-full object-contain rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 select-none bg-white/5 p-2"
            />

            {displayImages.length > 1 && (
              <button
                type="button"
                onClick={handleNext}
                className="absolute right-2 sm:right-4 z-20 p-3 rounded-full bg-slate-900/80 hover:bg-amber-600 text-white shadow-xl transition-all active:scale-95"
                title="Próxima Foto (Seta Direita)"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Bottom Thumbnails in Lightbox */}
          {displayImages.length > 1 && (
            <div 
              className="w-full max-w-2xl flex items-center justify-center gap-2 overflow-x-auto py-2 z-10"
              onClick={(e) => e.stopPropagation()}
            >
              {displayImages.map((imgUrl, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`relative w-14 h-14 rounded-xl overflow-hidden border-2 transition-all shrink-0 bg-slate-900 ${
                    currentIndex === idx
                      ? 'border-amber-400 scale-105 shadow-lg ring-2 ring-amber-400/40'
                      : 'border-slate-700 opacity-60 hover:opacity-100 hover:border-slate-400'
                  }`}
                >
                  <img
                    src={imgUrl}
                    alt={`Miniatura ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
