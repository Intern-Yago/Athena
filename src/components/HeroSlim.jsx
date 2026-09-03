import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Layers } from 'lucide-react';
import SearchBar from './SearchBar';

export default function HeroSlim({ 
  searchTerm, 
  setSearchTerm, 
  categories = [], 
  selectedCategory, 
  setSelectedCategory 
}) {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 5);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [categories]);

  const handleScroll = (direction) => {
    if (!scrollRef.current) return;
    const scrollAmount = direction === 'left' ? -280 : 280;
    scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    setTimeout(checkScroll, 320);
  };

  return (
    <div className="relative bg-slate-950 text-white border-b border-slate-800 py-8 sm:py-12 overflow-hidden shadow-lg">
      
      {/* Background Image with High Visibility */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/hero-bg.jpg" 
          alt="Oficina Automotiva Athena" 
          className="w-full h-full object-cover object-center opacity-80 filter brightness-95 contrast-105 scale-105 transition-transform duration-1000"
        />
        {/* Soft Contrast Overlay for Image Depth & Text Legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/35 to-slate-950/70" />
      </div>

      <div className="container-custom relative z-10">
        <div className="max-w-4xl mx-auto space-y-4 text-center">
          
          {/* Header Title with Special Class .hero-catalog-title (No capsule wrapper) */}
          <div className="space-y-2">
            <h1 className="hero-catalog-title text-2xl sm:text-4xl font-black tracking-tight">
              Catálogo de Equipamentos Automotivos
            </h1>

            <p className="text-xs sm:text-sm text-slate-200 max-w-xl mx-auto font-semibold drop-shadow-md">
              Elevadores hidráulicos, scanners de diagnóstico com IA, alinhadores 3D e ferramentas para o seu centro automotivo.
            </p>
          </div>

          {/* Quick Search & Single-Line Category Carousel */}
          <div className="space-y-3 max-w-3xl mx-auto pt-1">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              variant="hero-slim"
            />

            {/* Single-Line Category Carousel with Smooth Lateral Scrolling */}
            <div className="relative flex items-center justify-center pt-1">
              {/* Left Arrow Button */}
              {canScrollLeft && (
                <button
                  type="button"
                  onClick={() => handleScroll('left')}
                  className="absolute left-0 z-20 w-8 h-8 rounded-full bg-slate-900/90 hover:bg-amber-600 text-white border border-slate-700 hover:border-amber-400 flex items-center justify-center shadow-xl -translate-x-2 sm:-translate-x-4 transition-all cursor-pointer"
                  title="Ver categorias anteriores"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              )}

              {/* Scrollable Track in 1 Single Line */}
              <div
                ref={scrollRef}
                onScroll={checkScroll}
                className="flex items-center gap-2 overflow-x-auto scroll-smooth py-1.5 px-3 w-full max-w-3xl select-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
              >
                <button
                  type="button"
                  onClick={() => setSelectedCategory('all')}
                  className={`px-4 py-1.5 rounded-full text-xs font-extrabold whitespace-nowrap transition-all border shrink-0 cursor-pointer ${
                    selectedCategory === 'all'
                      ? 'bg-amber-600 text-white border-amber-400 shadow-md scale-105'
                      : 'bg-slate-900/90 text-slate-200 border-slate-700 hover:bg-slate-800 hover:text-white hover:border-amber-400'
                  }`}
                >
                  Todas
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-4 py-1.5 rounded-full text-xs font-extrabold whitespace-nowrap transition-all border shrink-0 cursor-pointer ${
                      selectedCategory === cat.id
                        ? 'bg-amber-600 text-white border-amber-400 shadow-md scale-105'
                        : 'bg-slate-900/90 text-slate-200 border-slate-700 hover:bg-slate-800 hover:text-white hover:border-amber-400'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* Right Arrow Button */}
              {canScrollRight && (
                <button
                  type="button"
                  onClick={() => handleScroll('right')}
                  className="absolute right-0 z-20 w-8 h-8 rounded-full bg-slate-900/90 hover:bg-amber-600 text-white border border-slate-700 hover:border-amber-400 flex items-center justify-center shadow-xl translate-x-2 sm:translate-x-4 transition-all cursor-pointer"
                  title="Ver mais categorias"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
