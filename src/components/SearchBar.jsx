import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, X, ArrowRight } from 'lucide-react';
import { getSearchSuggestions, findUniqueDirectMatch } from '../utils/productSearch';

/**
 * Universal SearchBar Component for Athena Catalogo
 *
 * Supports variants:
 * - 'hero': Big prominent search input with shadow and amber accents
 * - 'hero-slim': Elegant medium search bar
 * - 'header': Desktop navbar search bar with "Ir" and "Limpar" buttons
 * - 'header-mobile': Compact mobile header search bar
 * - 'sidebar': Filter sidebar search input
 * - 'compact': Mini search for BrandPage and CategoryPage
 * - 'default': Standard input
 */
export default function SearchBar({
  value = '',
  onChange,
  onSubmit,
  onClear,
  placeholder,
  variant = 'default',
  className = '',
  inputClassName = '',
  autoFocus = false,
  products = [],
  categories = [],
  brands = [],
  onSelectProduct,
  onNavigate
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef(null);

  // Computa sugestões ranqueadas em tempo real com prioridade em títulos
  const { suggestions, totalMatches } = useMemo(() => {
    if (!products || products.length === 0 || !value || !value.trim()) {
      return { suggestions: [], totalMatches: 0 };
    }
    return getSearchSuggestions(products, value, categories, brands, 6);
  }, [products, value, categories, brands]);

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (e) => {
    const val = e.target.value;
    if (onChange) onChange(val);
    setIsOpen(Boolean(val.trim()));
    setSelectedIndex(-1);
  };

  const handleClear = () => {
    if (onChange) onChange('');
    if (onClear) onClear();
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  const handleSelectProductItem = (prod) => {
    setIsOpen(false);
    setSelectedIndex(-1);
    if (onSelectProduct) {
      onSelectProduct(prod);
    } else if (onNavigate) {
      onNavigate(`produto/${prod.slug || prod.id}`);
    } else {
      window.location.href = `/produto/${prod.slug || prod.id}`;
    }
  };

  const executeSearch = (e) => {
    if (e && e.preventDefault) e.preventDefault();

    // 1. Se o usuário selecionou uma sugestão via setas do teclado
    if (selectedIndex >= 0 && suggestions[selectedIndex]) {
      handleSelectProductItem(suggestions[selectedIndex].product);
      return;
    }

    // 2. Identificação inteligente no Enter:
    // Se houver correspondência exata de título/SKU ou exatamente 1 único produto
    // contendo o termo no título em todo o catálogo, abre direto a página do produto!
    if (products && products.length > 0 && value.trim()) {
      const uniqueDirectMatch = findUniqueDirectMatch(products, value);
      if (uniqueDirectMatch) {
        handleSelectProductItem(uniqueDirectMatch);
        return;
      }
    }

    // 3. Caso haja múltiplos produtos ou busca ampla, fecha o dropdown e submete para o catálogo
    setIsOpen(false);
    setSelectedIndex(-1);
    if (onSubmit) {
      onSubmit(e);
    } else if (onNavigate) {
      onNavigate('catalog');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      if (suggestions.length > 0) {
        e.preventDefault();
        setIsOpen(true);
        setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
      }
    } else if (e.key === 'ArrowUp') {
      if (suggestions.length > 0) {
        e.preventDefault();
        setIsOpen(true);
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setSelectedIndex(-1);
    } else if (e.key === 'Enter') {
      executeSearch(e);
    }
  };

  // Renderiza o Dropdown de Sugestões de Opções
  const renderSuggestionsDropdown = () => {
    if (!isOpen || suggestions.length === 0 || !value.trim()) return null;

    let dropdownWidthClass = 'w-full left-0';
    if (variant === 'header') {
      dropdownWidthClass = 'w-80 sm:w-96 right-0 left-auto';
    } else if (variant === 'header-mobile') {
      dropdownWidthClass = 'w-[88vw] max-w-sm -right-8 sm:right-0';
    }

    return (
      <div
        className={`absolute top-full mt-2 bg-white rounded-2xl border border-slate-200/90 shadow-2xl overflow-hidden z-50 text-left animate-in fade-in slide-in-from-top-2 duration-150 ${dropdownWidthClass}`}
      >
        {/* Cabeçalho do Dropdown */}
        <div className="px-3.5 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Sugestões no Catálogo
          </span>
          <span className="text-[10px] font-bold text-amber-900 bg-amber-100/80 px-2 py-0.5 rounded-full">
            {totalMatches} {totalMatches === 1 ? 'encontrado' : 'encontrados'}
          </span>
        </div>

        {/* Lista de Itens */}
        <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
          {suggestions.map((item, index) => {
            const prod = item.product;
            const isHighlighted = selectedIndex === index;
            const isQuoteOnly = Boolean(prod.priceNegotiable !== false);
            const canBuyOnline = Number(prod.price) > 0 && !isQuoteOnly;

            return (
              <div
                key={prod.id}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelectProductItem(prod);
                }}
                onClick={() => handleSelectProductItem(prod)}
                onMouseEnter={() => setSelectedIndex(index)}
                className={`px-3 py-2.5 flex items-center gap-3 transition-colors cursor-pointer group ${
                  isHighlighted ? 'bg-amber-50/90' : 'hover:bg-amber-50/50'
                }`}
              >
                {/* Miniatura do Equipamento */}
                <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-200/80 p-1 shrink-0 flex items-center justify-center overflow-hidden">
                  <img
                    src={prod.image || (prod.images && prod.images[0]) || '/logo.jpg'}
                    alt={prod.name}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=100&auto=format&fit=crop&q=80';
                    }}
                  />
                </div>

                {/* Título e Marca */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 text-[10px] font-bold text-amber-700 uppercase tracking-wide truncate mb-0.5">
                    <span>{item.brandName}</span>
                    {item.categoryName && (
                      <span className="text-slate-400 font-normal">
                        • {item.categoryName}
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm font-extrabold text-slate-900 group-hover:text-amber-600 transition-colors line-clamp-1 leading-snug">
                    {prod.name}
                  </p>
                </div>

                {/* Preço / Sob Consulta */}
                <div className="shrink-0 text-right">
                  {canBuyOnline ? (
                    <span className="text-xs font-black text-amber-900 font-display block">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(prod.price)}
                    </span>
                  ) : (
                    <span className="text-[10px] font-extrabold text-amber-800 bg-amber-100/80 border border-amber-300 px-2 py-0.5 rounded-lg block">
                      Sob Consulta
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Rodapé: Ver todos os resultados */}
        <div
          onMouseDown={(e) => {
            e.preventDefault();
            executeSearch(e);
          }}
          onClick={executeSearch}
          className="p-2.5 bg-slate-50 hover:bg-amber-100/70 border-t border-slate-100 flex items-center justify-between text-xs font-extrabold text-amber-800 hover:text-amber-950 cursor-pointer transition-colors"
        >
          <div className="flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5 text-amber-600" />
            <span>Ver todos os {totalMatches} resultados no catálogo</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-amber-600" />
        </div>
      </div>
    );
  };

  // 1. HERO VARIANT
  if (variant === 'hero') {
    return (
      <div ref={containerRef} className={`relative z-40 group w-full ${className}`}>
        <form onSubmit={executeSearch} className="relative w-full">
          <input
            type="text"
            value={value}
            onChange={handleChange}
            onFocus={() => { if (value.trim()) setIsOpen(true); }}
            onKeyDown={handleKeyDown}
            autoFocus={autoFocus}
            placeholder={placeholder || 'Busque por produto, marca ou categoria (ex: Elevador, Scanner, Launch)...'}
            className={`w-full bg-white border-2 border-slate-300 focus:border-amber-500 text-slate-900 placeholder-slate-400 text-sm sm:text-base rounded-2xl pl-12 pr-28 py-4 shadow-md shadow-slate-200/50 transition-all outline-none ${inputClassName}`}
          />
          <Search className="w-5 h-5 text-amber-600 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:scale-110 transition-transform pointer-events-none" />
          {value ? (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
            >
              Limpar
            </button>
          ) : (
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hidden sm:inline-block pointer-events-none">
              Pressione Enter
            </span>
          )}
        </form>
        {renderSuggestionsDropdown()}
      </div>
    );
  }

  // 2. HERO SLIM VARIANT
  if (variant === 'hero-slim') {
    return (
      <div ref={containerRef} className={`relative z-40 group w-full max-w-2xl mx-auto ${className}`}>
        <form onSubmit={executeSearch} className="relative w-full">
          <input
            type="text"
            value={value}
            onChange={handleChange}
            onFocus={() => { if (value.trim()) setIsOpen(true); }}
            onKeyDown={handleKeyDown}
            autoFocus={autoFocus}
            placeholder={placeholder || 'Buscar por elevador, scanner, alinhador ou marca (ex: Launch, Engecass)...'}
            className={`w-full bg-white text-slate-900 placeholder-slate-500 text-xs sm:text-sm rounded-2xl pl-11 pr-24 py-3.5 shadow-2xl border-2 border-amber-400/60 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30 transition-all outline-none ${inputClassName}`}
          />
          <Search className="w-4 h-4 text-amber-600 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
            >
              Limpar
            </button>
          )}
        </form>
        {renderSuggestionsDropdown()}
      </div>
    );
  }

  // 3. HEADER DESKTOP VARIANT
  if (variant === 'header') {
    return (
      <div ref={containerRef} className={`relative z-40 w-64 ${className}`}>
        <form onSubmit={executeSearch} className="relative w-full">
          <input
            type="text"
            value={value}
            onChange={handleChange}
            onFocus={() => { if (value.trim()) setIsOpen(true); }}
            onKeyDown={handleKeyDown}
            autoFocus={autoFocus}
            placeholder={placeholder || 'Buscar equipamento...'}
            className={`w-full bg-slate-50 border border-slate-300 focus:border-amber-500 focus:bg-white text-slate-900 placeholder-slate-400 text-xs rounded-xl !pl-9 pr-14 py-2.5 outline-none transition-colors ${inputClassName}`}
          />
          <button
            type="submit"
            className="absolute left-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-amber-600 transition-colors cursor-pointer"
            title="Pesquisar no catálogo"
          >
            <Search className="w-4 h-4" />
          </button>
          {value && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <button
                type="button"
                onClick={handleClear}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                title="Limpar busca"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <button
                type="submit"
                className="px-1.5 py-0.5 rounded bg-amber-500 text-white text-[10px] font-bold hover:bg-amber-600 transition-colors cursor-pointer"
                title="Pesquisar"
              >
                Ir
              </button>
            </div>
          )}
        </form>
        {renderSuggestionsDropdown()}
      </div>
    );
  }

  // 4. HEADER MOBILE VARIANT
  if (variant === 'header-mobile') {
    return (
      <div ref={containerRef} className={`relative z-40 min-w-0 flex-1 max-w-[130px] min-[380px]:max-w-[170px] ${className}`}>
        <form onSubmit={executeSearch} className="relative w-full">
          <input
            type="text"
            value={value}
            onChange={handleChange}
            onFocus={() => { if (value.trim()) setIsOpen(true); }}
            onKeyDown={handleKeyDown}
            autoFocus={autoFocus}
            placeholder={placeholder || 'Buscar...'}
            className={`w-full bg-slate-50 border border-slate-300 focus:bg-white text-slate-900 placeholder-slate-400 text-xs rounded-lg !pl-7 pr-6 py-1.5 outline-none ${inputClassName}`}
          />
          <button
            type="submit"
            className="absolute left-1.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-amber-600 cursor-pointer"
            title="Pesquisar"
          >
            <Search className="w-3.5 h-3.5" />
          </button>
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-1 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-700 cursor-pointer"
              title="Limpar busca"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </form>
        {renderSuggestionsDropdown()}
      </div>
    );
  }

  // 5. SIDEBAR VARIANT
  if (variant === 'sidebar') {
    return (
      <div ref={containerRef} className={`relative z-30 ${className}`}>
        <div className="relative w-full">
          <input
            type="text"
            value={value}
            onChange={handleChange}
            onFocus={() => { if (value.trim()) setIsOpen(true); }}
            onKeyDown={handleKeyDown}
            autoFocus={autoFocus}
            placeholder={placeholder || 'Digite o nome...'}
            className={`w-full bg-slate-50 border border-slate-300 focus:border-amber-500 focus:bg-white text-slate-900 placeholder-slate-400 text-xs rounded-xl pl-8 pr-7 py-2 outline-none transition-colors ${inputClassName}`}
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded text-slate-400 hover:text-slate-700 cursor-pointer"
              title="Limpar busca"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        {renderSuggestionsDropdown()}
      </div>
    );
  }

  // 6. COMPACT VARIANT (BrandPage, CategoryPage, etc.)
  if (variant === 'compact') {
    return (
      <div ref={containerRef} className={`relative z-30 min-w-[180px] sm:min-w-[220px] ${className}`}>
        <div className="relative w-full">
          <input
            type="text"
            value={value}
            onChange={handleChange}
            onFocus={() => { if (value.trim()) setIsOpen(true); }}
            onKeyDown={handleKeyDown}
            autoFocus={autoFocus}
            placeholder={placeholder || 'Buscar equipamentos...'}
            className={`w-full pl-8 pr-7 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-amber-500 outline-none transition-colors ${inputClassName}`}
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded text-slate-400 hover:text-slate-700 cursor-pointer"
              title="Limpar busca"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        {renderSuggestionsDropdown()}
      </div>
    );
  }

  // DEFAULT STANDARD VARIANT
  return (
    <div ref={containerRef} className={`relative z-30 flex items-center ${className}`}>
      <form onSubmit={executeSearch} className="relative w-full flex items-center">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={value}
          onChange={handleChange}
          onFocus={() => { if (value.trim()) setIsOpen(true); }}
          onKeyDown={handleKeyDown}
          autoFocus={autoFocus}
          placeholder={placeholder || 'Buscar...'}
          className={`w-full bg-slate-50 border border-slate-300 focus:border-amber-500 focus:bg-white text-slate-900 placeholder-slate-400 text-xs sm:text-sm rounded-xl pl-9 pr-8 py-2 outline-none transition-colors ${inputClassName}`}
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded text-slate-400 hover:text-slate-700 cursor-pointer"
            title="Limpar busca"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </form>
      {renderSuggestionsDropdown()}
    </div>
  );
}