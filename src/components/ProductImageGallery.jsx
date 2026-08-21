import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';

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

  const containerRef = useRef(null);

  // Reset index if product changes
  useEffect(() => {
    setCurrentIndex(0);
    setZoomLevel(2.5);
  }, [product?.id]);

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
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomState({ show: true, x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
  };

  const handleMouseLeave = () => {
    setZoomState((prev) => ({ ...prev, show: false }));
  };

  const handleMouseEnter = () => {
    // hover zoom active
  };

  const currentImageUrl = displayImages[currentIndex] || fallbackImage;

  return (
    <div className="space-y-3 select-none">
      
      {/* Main Image Viewport with Hover Zoom Lens */}
      <div 
        ref={containerRef}
        className="bg-white p-3 rounded-3xl border border-slate-200 shadow-xs aspect-square relative flex items-center justify-center overflow-hidden cursor-crosshair group"
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <img 
          src={currentImageUrl} 
          alt={product?.name || 'Equipamento Athena'} 
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
                (Role a rodinha do mouse para ajustar)
              </span>
            </div>
          </div>
        )}

        {/* Previous / Next Arrow Controls (Shown when multiple images exist) */}
        {displayImages.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-white/90 text-slate-800 shadow-md hover:bg-amber-600 hover:text-white transition-all opacity-80 group-hover:opacity-100 active:scale-95"
              title="Foto Anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-white/90 text-slate-800 shadow-md hover:bg-amber-600 hover:text-white transition-all opacity-80 group-hover:opacity-100 active:scale-95"
              title="Próxima Foto"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Autoplay Progress Dots / Counter */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/75 backdrop-blur-xs text-white text-[10px] font-bold">
              {displayImages.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIndex(idx);
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
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = fallbackImage;
                }}
              />
            </button>
          ))}
        </div>
      )}

    </div>
  );
}
