import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';

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
    <div className="container-custom pt-4 sm:pt-6 pb-2 select-none">
      <div
        className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-slate-200/80 bg-slate-950 group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Slides Track com transição lateral suave */}
        <div
          className="flex w-full transition-transform duration-650 ease-[cubic-bezier(0.25,1,0.5,1)]"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
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
                    className="w-full h-auto max-h-[460px] object-cover block filter group-hover:brightness-[1.02] transition-[filter] duration-300"
                    onError={(e) => {
                      e.target.src =
                        'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=1920&auto=format&fit=crop&q=80';
                    }}
                  />
                </picture>

                {/* Sutil indicador de link no canto para banners com ação */}
                {hasLink && (
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950/70 hover:bg-amber-600 text-white p-1.5 rounded-lg backdrop-blur-xs shadow-md">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </div>
                )}
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
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-slate-950/60 hover:bg-amber-500 text-white hover:text-slate-950 flex items-center justify-center backdrop-blur-sm border border-white/10 shadow-lg transition-all active:scale-95 cursor-pointer opacity-80 sm:opacity-0 group-hover:opacity-100"
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
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-slate-950/60 hover:bg-amber-500 text-white hover:text-slate-950 flex items-center justify-center backdrop-blur-sm border border-white/10 shadow-lg transition-all active:scale-95 cursor-pointer opacity-80 sm:opacity-0 group-hover:opacity-100"
              title="Próximo Banner"
              aria-label="Próximo Banner"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
            </button>

            {/* Dots Indicadores na Base */}
            <div className="absolute bottom-2.5 sm:bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-full bg-slate-950/50 backdrop-blur-md border border-white/10">
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
                      ? 'w-6 sm:w-8 h-2 bg-amber-400 shadow-xs'
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
