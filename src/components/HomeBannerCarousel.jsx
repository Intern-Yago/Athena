import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * HomeBannerCarousel
 * Carrossel de Banners rotativos de alta performance para o topo da HomePage.
 * 
 * Funcionalidades:
 * - Imagens dedicadas para Desktop e Mobile (tag <picture> responsiva).
 * - Autoplay contínuo com transição suave lateral (slide effect).
 * - Pausa automática no autoplay ao passar o mouse por cima (hover pause).
 * - Navegação por setas laterais (exibidas somente se houver mais de 1 banner).
 * - Indicadores visuais de posição (dots na base) clicáveis.
 * - Suporte a gestos touch/swipe em smartphones e tablets.
 * - Redirecionamento configurável por banner (links internos ou externos).
 */
export default function HomeBannerCarousel({ banners = [], onNavigate }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const touchStartXRef = useRef(0);
  const touchDeltaXRef = useRef(0);
  const timerRef = useRef(null);

  // Filtra apenas banners ativos e que tenham pelo menos a imagem desktop
  const activeBanners = (banners || []).filter(
    (b) => b && (b.isActive !== false) && (b.desktopImage || b.desktop_image)
  );

  const total = activeBanners.length;

  // Ajusta currentIndex se a lista de banners diminuir
  useEffect(() => {
    if (currentIndex >= total && total > 0) {
      setCurrentIndex(0);
    }
  }, [total, currentIndex]);

  const handleNext = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const handlePrev = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Autoplay com intervalo de 5 segundos
  useEffect(() => {
    if (total <= 1 || isHovered) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      handleNext();
    }, 5000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [total, isHovered, handleNext, currentIndex]);

  // Gestos de toque (Touch Swipe) para celulares
  const handleTouchStart = (e) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchDeltaXRef.current = 0;
  };

  const handleTouchMove = (e) => {
    touchDeltaXRef.current = e.touches[0].clientX - touchStartXRef.current;
  };

  const handleTouchEnd = () => {
    const minSwipeDistance = 45;
    if (touchDeltaXRef.current < -minSwipeDistance) {
      handleNext();
    } else if (touchDeltaXRef.current > minSwipeDistance) {
      handlePrev();
    }
    touchStartXRef.current = 0;
    touchDeltaXRef.current = 0;
  };

  // Clique no banner para navegação
  const handleBannerClick = (banner) => {
    const url = banner.linkUrl || banner.link_url;
    if (!url) return;

    const isBlank = Boolean(banner.targetBlank || banner.target_blank);

    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('wa.me') || isBlank) {
      const fullUrl = url.startsWith('wa.me') ? `https://${url}` : url;
      window.open(fullUrl, isBlank ? '_blank' : '_self', 'noopener,noreferrer');
    } else {
      // Rota interna (ex: /categoria/scanners ou categoria/scanners)
      const cleanPath = url.startsWith('/') ? url.slice(1) : url;
      if (onNavigate) {
        onNavigate(cleanPath);
      } else {
        window.location.href = url.startsWith('/') ? url : `/${url}`;
      }
    }
  };

  if (total === 0) {
    return null;
  }

  return (
    <div className="w-full select-none overflow-hidden bg-slate-950 border-b border-slate-800/80">
      <div
        className="relative w-full overflow-hidden group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Slides Track com aceleração 3D por GPU (translate3d) para nitidez máxima sem blur */}
        <div
          className="flex w-full will-change-transform transition-transform duration-650 ease-[cubic-bezier(0.25,1,0.5,1)]"
          style={{
            transform: `translate3d(-${currentIndex * 100}%, 0, 0)`,
            WebkitTransform: `translate3d(-${currentIndex * 100}%, 0, 0)`,
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden'
          }}
        >
          {activeBanners.map((banner, idx) => {
            const desktopImg = banner.desktopImage || banner.desktop_image;
            const mobileImg = banner.mobileImage || banner.mobile_image || desktopImg;
            const hasLink = Boolean(banner.linkUrl || banner.link_url);

            return (
              <div
                key={banner.id || idx}
                className={`w-full shrink-0 relative overflow-hidden flex items-center justify-center ${
                  hasLink ? 'cursor-pointer' : ''
                }`}
                onClick={() => hasLink && handleBannerClick(banner)}
                title={banner.title || 'Banner Athena'}
                style={{
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden'
                }}
              >
                <picture className="w-full block">
                  {mobileImg && mobileImg !== desktopImg && (
                    <source media="(max-width: 640px)" srcSet={mobileImg} />
                  )}
                  <img
                    src={desktopImg}
                    alt={banner.title || `Banner ${idx + 1}`}
                    loading={idx === 0 ? 'eager' : 'lazy'}
                    decoding="async"
                    className="w-full h-auto max-h-[560px] 2xl:max-h-[680px] object-cover object-center block"
                    style={{
                      imageRendering: 'auto',
                      WebkitFontSmoothing: 'subpixel-antialiased',
                      transform: 'translateZ(0)',
                      WebkitTransform: 'translateZ(0)'
                    }}
                    onError={(e) => {
                      e.target.src =
                        'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=1920&auto=format&fit=crop&q=80';
                    }}
                  />
                </picture>
              </div>
            );
          })}
        </div>

        {/* Setas Laterais de Navegação (Mostradas apenas se houver mais de 1 banner) */}
        {total > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-950/60 hover:bg-amber-500 text-white hover:text-slate-950 flex items-center justify-center backdrop-blur-sm border border-white/15 shadow-xl transition-all active:scale-95 cursor-pointer opacity-90 sm:opacity-0 group-hover:opacity-100"
              title="Banner Anterior"
              aria-label="Banner Anterior"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-950/60 hover:bg-amber-500 text-white hover:text-slate-950 flex items-center justify-center backdrop-blur-sm border border-white/15 shadow-xl transition-all active:scale-95 cursor-pointer opacity-90 sm:opacity-0 group-hover:opacity-100"
              title="Próximo Banner"
              aria-label="Próximo Banner"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
            </button>

            {/* Dots Indicadores na Base */}
            <div className="absolute bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-full bg-slate-950/60 backdrop-blur-md border border-white/15 shadow-md">
              {activeBanners.map((_, dotIdx) => (
                <button
                  key={dotIdx}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIndex(dotIdx);
                  }}
                  className={`transition-all duration-300 rounded-full cursor-pointer ${
                    currentIndex === dotIdx
                      ? 'w-7 sm:w-9 h-2 bg-amber-400 shadow-xs'
                      : 'w-2 sm:w-2.5 h-2 sm:h-2.5 bg-white/40 hover:bg-white/80'
                  }`}
                  title={`Ir para banner ${dotIdx + 1}`}
                  aria-label={`Ir para banner ${dotIdx + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
