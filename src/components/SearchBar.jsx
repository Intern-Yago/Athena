import React from 'react';
import { Search, X } from 'lucide-react';

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
  autoFocus = false
}) {
  const handleChange = (e) => {
    if (onChange) onChange(e.target.value);
  };

  const handleClear = () => {
    if (onChange) onChange('');
    if (onClear) onClear();
  };

  const handleSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (onSubmit) onSubmit(e);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  // 1. HERO VARIANT
  if (variant === 'hero') {
    return (
      <form onSubmit={handleSubmit} className={`relative group w-full ${className}`}>
        <input
          type="text"
          value={value}
          onChange={handleChange}
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
    );
  }

  // 2. HERO SLIM VARIANT
  if (variant === 'hero-slim') {
    return (
      <form onSubmit={handleSubmit} className={`relative group w-full max-w-2xl mx-auto ${className}`}>
        <input
          type="text"
          value={value}
          onChange={handleChange}
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
    );
  }

  // 3. HEADER DESKTOP VARIANT
  if (variant === 'header') {
    return (
      <form onSubmit={handleSubmit} className={`relative w-64 ${className}`}>
        <input
          type="text"
          value={value}
          onChange={handleChange}
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
    );
  }

  // 4. HEADER MOBILE VARIANT
  if (variant === 'header-mobile') {
    return (
      <form onSubmit={handleSubmit} className={`relative min-w-0 flex-1 max-w-[130px] min-[380px]:max-w-[170px] ${className}`}>
        <input
          type="text"
          value={value}
          onChange={handleChange}
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
            <X className="w-3 h-3" />
          </button>
        )}
      </form>
    );
  }

  // 5. SIDEBAR VARIANT
  if (variant === 'sidebar') {
    return (
      <div className={`relative ${className}`}>
        <input
          type="text"
          value={value}
          onChange={handleChange}
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
    );
  }

  // 6. COMPACT VARIANT (BrandPage, CategoryPage, etc.)
  if (variant === 'compact') {
    return (
      <div className={`relative min-w-[180px] sm:min-w-[220px] ${className}`}>
        <input
          type="text"
          value={value}
          onChange={handleChange}
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
            <X className="w-3 h-3" />
          </button>
        )}
      </div>
    );
  }

  // DEFAULT STANDARD VARIANT
  return (
    <form onSubmit={handleSubmit} className={`relative flex items-center ${className}`}>
      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={handleChange}
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
  );
}