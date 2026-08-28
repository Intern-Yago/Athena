import React, { useState } from 'react';
import { Search, Layers, Tag, PackageCheck, PhoneCall, Menu, ChevronDown, Info, X } from 'lucide-react';
import MegaMenu from './MegaMenu';
import MobileDrawer from './MobileDrawer';

export default function Header({ 
  activeTab, 
  onNavigate,
  searchTerm, 
  setSearchTerm,
  productsCount,
  categoriesCount,
  brandsCount,
  categories,
  brands,
  products
}) {
  const [activeMegaMenu, setActiveMegaMenu] = useState(null);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  const formattedPhone = "(61) 98348-5671";
  const whatsappUrl = "https://wa.me/5561983485671?text=Ol%C3%A1%21+Vim+pelo+site+da+Athena+Solu%C3%A7%C3%B5es+Automotivas+e+gostaria+de+informa%C3%A7%C3%B5es.";

  const toggleMegaMenu = (menuType) => {
    setActiveMegaMenu(activeMegaMenu === menuType ? null : menuType);
  };

  const handleSearchSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setActiveMegaMenu(null);
    if (onNavigate) {
      onNavigate('catalog');
    }
    window.scrollTo({ top: 350, behavior: 'smooth' });
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200/90 shadow-md">
        <div className="container-custom">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-2">
            
            {/* Logo & Brand Name */}
            <div 
              onClick={() => onNavigate('catalog')} 
              className="flex items-center gap-2 sm:gap-3 cursor-pointer group shrink-0"
            >
              <div className="relative w-9 h-9 sm:w-12 sm:h-12 rounded-xl border border-slate-200 overflow-hidden bg-slate-950 p-0.5 sm:p-1 shadow-xs shrink-0">
                <img 
                  src="/logo.jpg" 
                  alt="Athena Soluções Automotivas Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              
              <div className="flex flex-col">
                <span className="font-display font-black text-base sm:text-xl tracking-tight text-slate-900 group-hover:text-amber-600 transition-colors leading-none">
                  ATHENA
                </span>
                <span className="hidden min-[380px]:block text-[9px] sm:text-[11px] font-bold text-amber-700 uppercase tracking-wider mt-0.5 whitespace-nowrap">
                  Soluções Automotivas
                </span>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center justify-center gap-1 bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/90">
              <button
                onClick={() => {
                  onNavigate('catalog');
                  setActiveMegaMenu(null);
                }}
                className={`flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${
                  activeTab === 'catalog' && !activeMegaMenu
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                }`}
              >
                <PackageCheck className="w-4 h-4 shrink-0" />
                <span>Catálogo</span>
              </button>

              <button
                onClick={() => toggleMegaMenu('categories')}
                className={`flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${
                  activeMegaMenu === 'categories' || activeTab.startsWith('category')
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                }`}
              >
                <Layers className="w-4 h-4 shrink-0" />
                <span>Categorias</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeMegaMenu === 'categories' ? 'rotate-180' : ''}`} />
              </button>

              <button
                onClick={() => toggleMegaMenu('brands')}
                className={`flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${
                  activeMegaMenu === 'brands' || activeTab.startsWith('brand')
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                }`}
              >
                <Tag className="w-4 h-4 shrink-0" />
                <span>Marcas</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeMegaMenu === 'brands' ? 'rotate-180' : ''}`} />
              </button>

              <button
                onClick={() => {
                  onNavigate('about');
                  setActiveMegaMenu(null);
                }}
                className={`flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${
                  activeTab === 'about'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                }`}
              >
                <Info className="w-4 h-4 shrink-0" />
                <span>Sobre</span>
              </button>
            </nav>

            {/* Desktop Search Bar & Phone */}
            <div className="hidden lg:flex items-center gap-3">
              <form onSubmit={handleSearchSubmit} className="relative w-64">
                <input
                  type="text"
                  placeholder="Buscar equipamento..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearchSubmit(e);
                    }
                  }}
                  className="w-full bg-slate-50 border border-slate-300 focus:border-amber-500 focus:bg-white text-slate-900 placeholder-slate-400 text-xs rounded-xl !pl-9 pr-14 py-2.5 outline-none transition-colors"
                />
                <button
                  type="submit"
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-amber-600 transition-colors"
                  title="Pesquisar no catálogo"
                >
                  <Search className="w-4 h-4" />
                </button>
                {searchTerm && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setSearchTerm('')}
                      className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
                      title="Limpar busca"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="submit"
                      className="px-1.5 py-0.5 rounded bg-amber-500 text-white text-[10px] font-bold hover:bg-amber-600 transition-colors"
                      title="Pesquisar"
                    >
                      Ir
                    </button>
                  </div>
                )}
              </form>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 rounded-xl hover:bg-emerald-100 transition-colors shadow-xs shrink-0"
              >
                <PhoneCall className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{formattedPhone}</span>
              </a>
            </div>

            {/* Mobile Header: Search Input + Hamburger (Locked on Screen) */}
            <div className="flex md:hidden items-center gap-1.5 min-w-0 shrink">
              <form onSubmit={handleSearchSubmit} className="relative min-w-0 flex-1 max-w-[140px] min-[380px]:max-w-[190px]">
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearchSubmit(e);
                    }
                  }}
                  className="w-full bg-slate-50 border border-slate-300 focus:bg-white text-slate-900 placeholder-slate-400 text-xs rounded-lg !pl-7 pr-6 py-1.5 outline-none"
                />
                <button
                  type="submit"
                  className="absolute left-1.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-amber-600"
                  title="Pesquisar"
                >
                  <Search className="w-3.5 h-3.5" />
                </button>
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="absolute right-1 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-700"
                    title="Limpar busca"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </form>

              <button
                onClick={() => setIsMobileDrawerOpen(true)}
                className="p-1.5 rounded-xl bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-200 shadow-xs shrink-0"
                title="Abrir Menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>

          </div>
        </div>

        {/* Mega Menu Dropdown */}
        {activeMegaMenu && (
          <MegaMenu
            type={activeMegaMenu}
            categories={categories}
            brands={brands}
            products={products}
            onNavigate={onNavigate}
            onClose={() => setActiveMegaMenu(null)}
          />
        )}
      </header>

      {/* Mobile Drawer */}
      <MobileDrawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        activeTab={activeTab}
        onNavigate={onNavigate}
        categories={categories}
        brands={brands}
        products={products}
      />
    </>
  );
}
