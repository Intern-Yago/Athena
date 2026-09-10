import React, { useState, useEffect } from 'react';
import { 
  X, Layers, Tag, PackageCheck, Info, ChevronDown, ChevronRight, 
  PhoneCall, Lock, Grid, User, LogOut, ShoppingCart, 
  Package, Gift, Users, ShieldCheck, RefreshCw, Shield, Store
} from 'lucide-react';

export default function MobileDrawer({ 
  isOpen, 
  onClose, 
  activeTab = '',
  activeAdminTab = 'products',
  onSelectAdminTab,
  categories = [], 
  brands = [], 
  products = [], 
  onNavigate,
  currentUser,
  onLogout
}) {
  const [openAccordion, setOpenAccordion] = useState(null); // 'categories', 'brands' or null
  const [viewMode, setViewMode] = useState(activeTab === 'admin' ? 'admin' : 'store');

  const safeCategories = categories || [];
  const safeBrands = brands || [];
  const safeProducts = products || [];

  const isStaff = currentUser && ['admin', 'vendedor', 'editor', 'edicao'].includes(currentUser.role);
  const isAdminRole = currentUser?.role === 'admin';

  useEffect(() => {
    if (isOpen) {
      if (activeTab === 'admin') {
        setViewMode('admin');
      } else {
        setViewMode('store');
      }
    }
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  const formattedPhone = "(61) 98348-5671";
  const whatsappUrl = "https://wa.me/5561983485671?text=Ol%C3%A1%21+Vim+pelo+site+da+Athena+Solu%C3%A7%C3%B5es+Automotivas+e+gostaria+de+informa%C3%A7%C3%B5es.";

  const toggleAccordion = (section) => {
    setOpenAccordion(openAccordion === section ? null : section);
  };

  const handleSelectAdminTab = (tab) => {
    if (onSelectAdminTab) {
      onSelectAdminTab(tab);
    }
    if (activeTab !== 'admin' && onNavigate) {
      onNavigate('admin');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" 
        onClick={onClose}
      />

      {/* Drawer Sidebar Content */}
      <div className="relative w-full max-w-xs bg-white h-full shadow-2xl z-10 flex flex-col justify-between overflow-y-auto animate-slide-right">
        
        {/* Top Header inside Drawer */}
        <div>
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
            <div className="flex items-center gap-2.5">
              <img src="/logo.jpg" alt="Athena Logo" className="w-8 h-8 rounded-lg object-contain bg-slate-950 p-0.5 border border-slate-700" />
              <div>
                <span className="font-extrabold text-sm block leading-tight">ATHENA</span>
                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">Soluções Automotivas</span>
              </div>
            </div>

            <button 
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mode Switcher Pills (Only shown for staff/admin users) */}
          {isStaff && (
            <div className="p-2.5 bg-slate-950 border-b border-slate-800">
              <div className="grid grid-cols-2 p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs font-black">
                <button
                  type="button"
                  onClick={() => setViewMode('admin')}
                  className={`py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    viewMode === 'admin'
                      ? 'bg-amber-500 text-slate-950 shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Painel Admin</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('store')}
                  className={`py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    viewMode === 'store'
                      ? 'bg-amber-500 text-slate-950 shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Store className="w-3.5 h-3.5" />
                  <span>Ver Loja</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ================= ADMIN VIEW ================= */}
        {viewMode === 'admin' && isStaff ? (
          <div className="p-4 flex-1 space-y-4">
            
            {/* User Account Mini Card */}
            <div className="p-3 rounded-2xl bg-slate-900 text-white flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                  {(currentUser?.name || 'A')[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-black text-white truncate">{currentUser?.name || 'Administrador'}</p>
                  <p className="text-[10px] text-amber-400 font-bold uppercase truncate">
                    {currentUser?.role === 'admin' ? 'Administrador Geral' : currentUser?.role === 'vendedor' ? 'Vendedor' : 'Gestão'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  if (onLogout) onLogout();
                  onClose();
                }}
                className="p-1.5 rounded-lg bg-slate-800 text-red-400 hover:bg-slate-700 hover:text-red-300 transition-colors cursor-pointer"
                title="Sair"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

            {/* Section 1: Catálogo & Loja */}
            <div className="space-y-1">
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-2 py-1">
                Catálogo & Loja
              </div>

              <button
                type="button"
                onClick={() => handleSelectAdminTab('products')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  activeAdminTab === 'products'
                    ? 'bg-amber-500 text-slate-950 shadow-xs font-black'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Package className="w-4 h-4 shrink-0" />
                  <span>Produtos</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                  activeAdminTab === 'products' ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-200 text-slate-700'
                }`}>
                  {safeProducts.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectAdminTab('categories')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  activeAdminTab === 'categories'
                    ? 'bg-amber-500 text-slate-950 shadow-xs font-black'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Layers className="w-4 h-4 shrink-0" />
                  <span>Categorias</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                  activeAdminTab === 'categories' ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-200 text-slate-700'
                }`}>
                  {safeCategories.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectAdminTab('brands')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  activeAdminTab === 'brands'
                    ? 'bg-amber-500 text-slate-950 shadow-xs font-black'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Tag className="w-4 h-4 shrink-0" />
                  <span>Marcas</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                  activeAdminTab === 'brands' ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-200 text-slate-700'
                }`}>
                  {safeBrands.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectAdminTab('coupons')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  activeAdminTab === 'coupons'
                    ? 'bg-amber-500 text-slate-950 shadow-xs font-black'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Gift className="w-4 h-4 shrink-0" />
                  <span>Cupons & Vouchers</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            {/* Section 2: Clientes & Fidelidade */}
            <div className="space-y-1">
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-2 py-1">
                Clientes & Fidelidade
              </div>

              <button
                type="button"
                onClick={() => handleSelectAdminTab('clients')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  activeAdminTab === 'clients'
                    ? 'bg-amber-500 text-slate-950 shadow-xs font-black'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 shrink-0" />
                  <span>Clientes do Site</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              {isAdminRole && (
                <button
                  type="button"
                  onClick={() => handleSelectAdminTab('omie')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                    activeAdminTab === 'omie'
                      ? 'bg-amber-500 text-slate-950 shadow-xs font-black'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <RefreshCw className="w-4 h-4 shrink-0" />
                    <span>Omie ERP & Pontos</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              )}
            </div>

            {/* Section 3: Administração & Equipe */}
            <div className="space-y-1">
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-2 py-1">
                Administração & Equipe
              </div>

              {isAdminRole && (
                <button
                  type="button"
                  onClick={() => handleSelectAdminTab('users')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                    activeAdminTab === 'users'
                      ? 'bg-amber-500 text-slate-950 shadow-xs font-black'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <span>Equipe & Acessos</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              )}

              <button
                type="button"
                onClick={() => handleSelectAdminTab('settings')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  activeAdminTab === 'settings'
                    ? 'bg-amber-500 text-slate-950 shadow-xs font-black'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Lock className="w-4 h-4 shrink-0" />
                  <span>Configurações & Senha</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>

          </div>
        ) : (
          /* ================= STORE VIEW ================= */
          <div className="p-5 flex-1 space-y-3">
            
            {/* User Account / Login Button */}
            {currentUser ? (
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-amber-600 text-white flex items-center justify-center text-xs font-black">
                      {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-black text-slate-900 truncate">Olá, {currentUser.name ? currentUser.name.split(' ')[0] : 'Cliente'}</p>
                      <p className="text-[10px] text-slate-500 truncate">{currentUser.email}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  <button
                    onClick={() => {
                      if (currentUser.role === 'admin') {
                        onNavigate('admin');
                        setViewMode('admin');
                      } else {
                        onNavigate('minha-conta');
                      }
                      onClose();
                    }}
                    className="py-1.5 px-2.5 rounded-xl bg-amber-600 text-white font-bold text-[11px] flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>{currentUser.role === 'admin' ? 'Painel Admin' : 'Minha Conta'}</span>
                  </button>
                  <button
                    onClick={() => {
                      if (onLogout) onLogout();
                      onClose();
                    }}
                    className="py-1.5 px-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-[11px] flex items-center justify-center gap-1 hover:bg-slate-50 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5 text-red-500" />
                    <span>Sair</span>
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => {
                  onNavigate('login');
                  onClose();
                }}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-sm transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <User className="w-4 h-4" />
                  <span>Entrar ou Criar Conta</span>
                </div>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}

            {/* Item 1: Catálogo */}
            <button
              onClick={() => {
                onNavigate('catalog');
                onClose();
              }}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-amber-50 text-slate-900 font-bold text-xs border border-slate-200 cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <PackageCheck className="w-4 h-4 text-amber-600" />
                <span>Catálogo Principal</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            {/* Item 2: Categorias Accordion */}
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
              <button
                onClick={() => toggleAccordion('categories')}
                className="w-full flex items-center justify-between p-3 text-slate-900 font-bold text-xs cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Layers className="w-4 h-4 text-amber-600" />
                  <span>Categorias ({safeCategories.length})</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openAccordion === 'categories' ? 'rotate-180' : ''}`} />
              </button>

              {openAccordion === 'categories' && (
                <div className="bg-white border-t border-slate-200 p-2 space-y-1">
                  <button
                    onClick={() => {
                      onNavigate('categories');
                      onClose();
                    }}
                    className="w-full flex items-center gap-2 p-2 rounded-lg bg-amber-50 text-amber-800 font-bold text-xs border border-amber-200 cursor-pointer"
                  >
                    <Grid className="w-3.5 h-3.5 text-amber-600" />
                    <span>VER TODAS AS CATEGORIAS</span>
                  </button>

                  {safeCategories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        onNavigate(`category:${cat.id}`);
                        onClose();
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 flex items-center justify-between cursor-pointer"
                    >
                      <span>{cat.name}</span>
                      <span className="text-[10px] text-slate-400">
                        {safeProducts.filter(p => p.categoryId === cat.id).length}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Item 3: Marcas Accordion */}
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
              <button
                onClick={() => toggleAccordion('brands')}
                className="w-full flex items-center justify-between p-3 text-slate-900 font-bold text-xs cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Tag className="w-4 h-4 text-sky-600" />
                  <span>Marcas ({safeBrands.length})</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openAccordion === 'brands' ? 'rotate-180' : ''}`} />
              </button>

              {openAccordion === 'brands' && (
                <div className="bg-white border-t border-slate-200 p-2 space-y-1">
                  <button
                    onClick={() => {
                      onNavigate('brands');
                      onClose();
                    }}
                    className="w-full flex items-center gap-2 p-2 rounded-lg bg-sky-50 text-sky-800 font-bold text-xs border border-sky-200 cursor-pointer"
                  >
                    <Grid className="w-3.5 h-3.5 text-sky-600" />
                    <span>VER TODAS AS MARCAS</span>
                  </button>

                  {safeBrands.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => {
                        onNavigate(`brand:${b.id}`);
                        onClose();
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 flex items-center justify-between cursor-pointer"
                    >
                      <span>{b.name}</span>
                      <span className="text-[10px] text-slate-400">
                        {safeProducts.filter(p => p.brandId === b.id).length}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Item 4: Sobre */}
            <button
              onClick={() => {
                onNavigate('about');
                onClose();
              }}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-900 font-bold text-xs border border-slate-200 cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Info className="w-4 h-4 text-amber-600" />
                <span>Sobre a Athena</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            {/* Item 5: Falar no WhatsApp */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-between p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold text-xs border border-emerald-200 text-decoration-none transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <PhoneCall className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Falar no WhatsApp ({formattedPhone})</span>
              </div>
              <ChevronRight className="w-4 h-4 text-emerald-500" />
            </a>

          </div>
        )}

        {/* Footer inside Drawer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-center pb-20 md:pb-4">
          {viewMode === 'admin' ? (
            <button
              type="button"
              onClick={() => {
                onNavigate('catalog');
                onClose();
              }}
              className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <Store className="w-3.5 h-3.5 text-amber-400" />
              <span>Visualizar Loja Pública</span>
            </button>
          ) : (
            isStaff && (
              <button
                type="button"
                onClick={() => {
                  onNavigate('admin');
                  setViewMode('admin');
                  onClose();
                }}
                className="w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Abrir Painel Admin</span>
              </button>
            )
          )}
        </div>

      </div>
    </div>
  );
}
