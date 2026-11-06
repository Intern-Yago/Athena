import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, Layers, Tag, PackageCheck, Info, ChevronDown, ChevronRight, ChevronLeft,
  PhoneCall, Grid, User, LogOut, Package, Gift, Shield, Store, FolderTree,
  Sparkles, Disc, Cpu, Droplet, Wrench, Wind, Box, ArrowRight, Receipt, Truck, Zap
} from 'lucide-react';
import { MACRO_DEPARTMENTS, getCategoriesForDepartment } from '../data/departmentsData';
import { isProductPublished } from '../utils/imageUrl';

// Map icon strings to Lucide components
const DEPT_ICONS = {
  Sparkles,
  Disc,
  Layers,
  Cpu,
  Droplet,
  Wrench,
  Wind,
  Box
};

export default function MobileDrawer({ 
  isOpen, 
  onClose, 
  activeTab = '',
  activeAdminTab = 'products',
  onSelectAdminTab,
  categories = [], 
  brands = [], 
  departments = [],
  products = [], 
  onNavigate,
  currentUser,
  onLogout
}) {
  const [openAccordion, setOpenAccordion] = useState('departments'); // 'departments', 'brands' or null
  const [selectedDept, setSelectedDept] = useState(null); // Drilldown state for sub-menu
  const [viewMode, setViewMode] = useState(activeTab === 'admin' ? 'admin' : 'store');

  const safeCategories = categories || [];
  const safeBrands = brands || [];
  const safeDepartments = departments && departments.length > 0 ? departments : MACRO_DEPARTMENTS;
  const safeProducts = products || [];

  const isStaff = currentUser && ['admin', 'vendedor', 'editor', 'edicao'].includes(currentUser.role);

  // Reset drilldown when drawer closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedDept(null);
    } else {
      if (activeTab === 'admin') {
        setViewMode('admin');
      } else {
        setViewMode('store');
      }
    }
  }, [isOpen, activeTab]);

  // Compute published product counts
  const publishedProducts = useMemo(() => {
    return safeProducts.filter(isProductPublished);
  }, [safeProducts]);

  const categoryCounts = useMemo(() => {
    const map = new Map();
    publishedProducts.forEach(p => {
      if (p.categoryId) {
        map.set(p.categoryId, (map.get(p.categoryId) || 0) + 1);
      }
    });
    return map;
  }, [publishedProducts]);

  // Pre-calculate macro-departments with child categories and equipment counts
  const departmentsWithData = useMemo(() => {
    return safeDepartments.map(dept => {
      const deptCats = getCategoriesForDepartment(dept.id, safeCategories, safeDepartments);
      const totalCount = deptCats.reduce((acc, cat) => acc + (categoryCounts.get(cat.id) || 0), 0);
      return {
        ...dept,
        categories: deptCats,
        totalProducts: totalCount
      };
    });
  }, [safeDepartments, safeCategories, categoryCounts]);

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
      <div className="relative w-full max-w-xs bg-white h-full shadow-2xl z-10 flex flex-col justify-between overflow-hidden animate-slide-right">
        
        {/* Top Header inside Drawer */}
        <div className="shrink-0">
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
              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 cursor-pointer transition-colors"
              title="Fechar menu"
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
                  onClick={() => {
                    setViewMode('store');
                    setSelectedDept(null);
                  }}
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
          <div className="p-4 flex-1 overflow-y-auto space-y-4">
            
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

            {/* Section 0: Vendas & Operações (Athena OS) */}
            <div className="space-y-1">
              <div className="text-[10px] font-black uppercase tracking-wider text-amber-600 px-2 py-1 flex items-center justify-between">
                <span>Vendas & Operações</span>
                <span className="text-[9px] bg-amber-500/10 text-amber-600 px-1 rounded font-mono">Athena OS</span>
              </div>

              <button
                type="button"
                onClick={() => handleSelectAdminTab('orders')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  activeAdminTab === 'orders'
                    ? 'bg-amber-500 text-slate-950 shadow-xs font-black'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Receipt className="w-4 h-4 shrink-0" />
                  <span>Vendas & Pedidos</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectAdminTab('fulfillment')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  activeAdminTab === 'fulfillment'
                    ? 'bg-amber-500 text-slate-950 shadow-xs font-black'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Truck className="w-4 h-4 shrink-0" />
                  <span>Mesa de Expedição</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectAdminTab('activations')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  activeAdminTab === 'activations'
                    ? 'bg-amber-500 text-slate-950 shadow-xs font-black'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Zap className="w-4 h-4 shrink-0" />
                  <span>Ativações Digitais</span>
                </div>
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
                onClick={() => handleSelectAdminTab('departments')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  activeAdminTab === 'departments'
                    ? 'bg-amber-500 text-slate-950 shadow-xs font-black'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FolderTree className="w-4 h-4 shrink-0" />
                  <span>Macro-Categorias</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                  activeAdminTab === 'departments' ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-200 text-slate-700'
                }`}>
                  {safeDepartments.length}
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
          </div>
        ) : (
          /* ================= STORE VIEW: DRILL-DOWN CONTAINER ================= */
          <div className="relative flex-1 overflow-hidden">
            
            {/* PANEL 1: ROOT STORE NAVIGATION */}
            <div 
              className={`absolute inset-0 overflow-y-auto p-4 space-y-3.5 transition-transform duration-300 ease-in-out ${
                selectedDept ? '-translate-x-full pointer-events-none opacity-0' : 'translate-x-0 opacity-100'
              }`}
            >
              {/* User Account / Login Button */}
              {currentUser ? (
                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
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

              {/* Catálogo Principal */}
              <button
                onClick={() => {
                  onNavigate('catalog');
                  onClose();
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-amber-50 text-slate-900 font-bold text-xs border border-slate-200 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <PackageCheck className="w-4 h-4 text-amber-600" />
                  <span>Catálogo Completo</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              {/* SEÇÃO 1: MACRO-DEPARTAMENTOS (DRILL-DOWN TRIGGER) */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50 shadow-2xs">
                <button
                  onClick={() => toggleAccordion('departments')}
                  className="w-full flex items-center justify-between p-3 text-slate-900 font-extrabold text-xs cursor-pointer bg-slate-100/70 border-b border-slate-200/80"
                >
                  <div className="flex items-center gap-2.5">
                    <Layers className="w-4 h-4 text-amber-600" />
                    <span>Departamentos ({departmentsWithData.length})</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${openAccordion === 'departments' ? 'rotate-180' : ''}`} />
                </button>

                {openAccordion === 'departments' && (
                  <div className="bg-white p-2 space-y-1">
                    <button
                      onClick={() => {
                        onNavigate('categories');
                        onClose();
                      }}
                      className="w-full flex items-center justify-between p-2 rounded-xl bg-amber-50 text-amber-900 font-bold text-xs border border-amber-200 cursor-pointer mb-1.5"
                    >
                      <div className="flex items-center gap-2">
                        <Grid className="w-3.5 h-3.5 text-amber-600" />
                        <span>Ver Todas as Categorias</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-amber-600" />
                    </button>

                    {departmentsWithData.map((dept) => {
                      const IconComponent = DEPT_ICONS[dept.icon] || Layers;
                      return (
                        <button
                          key={dept.id}
                          onClick={() => setSelectedDept(dept)}
                          className="w-full p-2.5 rounded-xl text-left bg-white hover:bg-amber-50/60 active:bg-amber-100 border border-slate-100 hover:border-amber-200/80 flex items-center justify-between transition-all cursor-pointer group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-700 border border-amber-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                              <IconComponent className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <span className="font-extrabold text-xs text-slate-900 block truncate group-hover:text-amber-700">
                                {dept.shortName || dept.name}
                              </span>
                              <span className="text-[10px] text-slate-500 block truncate">
                                {dept.categories.length} categorias • {dept.totalProducts} produtos
                              </span>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all shrink-0 ml-1" />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* SEÇÃO 2: MARCAS ACCORDION */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50 shadow-2xs">
                <button
                  onClick={() => toggleAccordion('brands')}
                  className="w-full flex items-center justify-between p-3 text-slate-900 font-extrabold text-xs cursor-pointer bg-slate-100/70 border-b border-slate-200/80"
                >
                  <div className="flex items-center gap-2.5">
                    <Tag className="w-4 h-4 text-sky-600" />
                    <span>Marcas ({safeBrands.length})</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${openAccordion === 'brands' ? 'rotate-180' : ''}`} />
                </button>

                {openAccordion === 'brands' && (
                  <div className="bg-white p-2 space-y-1">
                    <button
                      onClick={() => {
                        onNavigate('brands');
                        onClose();
                      }}
                      className="w-full flex items-center justify-between p-2 rounded-xl bg-sky-50 text-sky-900 font-bold text-xs border border-sky-200 cursor-pointer mb-1.5"
                    >
                      <div className="flex items-center gap-2">
                        <Grid className="w-3.5 h-3.5 text-sky-600" />
                        <span>Ver Todas as Marcas</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-sky-600" />
                    </button>

                    {safeBrands.map((b) => (
                      <button
                        key={b.id}
                        onClick={() => {
                          onNavigate(`brand:${b.id}`);
                          onClose();
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 active:bg-sky-50 flex items-center justify-between cursor-pointer transition-colors"
                      >
                        <span className="truncate">{b.name}</span>
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                          {safeProducts.filter(p => p.brandId === b.id).length}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* SEÇÃO 3: SOBRE & ATENDIMENTO */}
              <button
                onClick={() => {
                  onNavigate('about');
                  onClose();
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-900 font-bold text-xs border border-slate-200 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Info className="w-4 h-4 text-amber-600" />
                  <span>Sobre a Athena</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-between p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-950 font-bold text-xs border border-emerald-200 text-decoration-none transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <PhoneCall className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="truncate">WhatsApp ({formattedPhone})</span>
                </div>
                <ChevronRight className="w-4 h-4 text-emerald-600 shrink-0 ml-1" />
              </a>

            </div>

            {/* PANEL 2: DRILL-DOWN SUB-VIEW (CATEGORIAS DO DEPARTAMENTO SELECIONADO) */}
            <div 
              className={`absolute inset-0 overflow-y-auto p-4 space-y-3.5 bg-white transition-transform duration-300 ease-in-out ${
                selectedDept ? 'translate-x-0 opacity-100' : 'translate-x-full pointer-events-none opacity-0'
              }`}
            >
              {selectedDept && (
                <>
                  {/* Top Back Navigation Bar */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <button
                      type="button"
                      onClick={() => setSelectedDept(null)}
                      className="inline-flex items-center gap-1.5 text-xs font-black text-amber-700 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-xl border border-amber-200 cursor-pointer transition-colors shadow-2xs"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Voltar</span>
                    </button>
                    <span className="text-[10px] uppercase font-black tracking-wider text-slate-400">
                      Departamento
                    </span>
                  </div>

                  {/* Department Banner & Overview */}
                  <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50/40 border border-amber-200/80 space-y-2">
                    <div className="flex items-center gap-2.5">
                      {React.createElement(DEPT_ICONS[selectedDept.icon] || Layers, {
                        className: "w-5 h-5 text-amber-600 shrink-0"
                      })}
                      <h4 className="font-black text-slate-900 text-sm leading-tight">
                        {selectedDept.name}
                      </h4>
                    </div>
                    {selectedDept.description && (
                      <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-3">
                        {selectedDept.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 pt-1 text-[10px] font-extrabold text-amber-800">
                      <span className="bg-amber-100/90 px-2 py-0.5 rounded-md border border-amber-300/80">
                        {selectedDept.categories.length} {selectedDept.categories.length === 1 ? 'categoria' : 'categorias'}
                      </span>
                      <span>•</span>
                      <span>{selectedDept.totalProducts} equipamentos</span>
                    </div>
                  </div>

                  {/* List of Child Categories inside this Department */}
                  <div className="space-y-1">
                    <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-1 py-1">
                      Categorias deste Departamento
                    </div>

                    {selectedDept.categories.length === 0 ? (
                      <p className="text-xs text-slate-400 italic p-3 text-center bg-slate-50 rounded-xl">
                        Nenhuma categoria cadastrada neste departamento.
                      </p>
                    ) : (
                      selectedDept.categories.map((cat) => {
                        const count = categoryCounts.get(cat.id) || 0;
                        return (
                          <button
                            key={cat.id}
                            onClick={() => {
                              onNavigate(`category:${cat.id}`);
                              onClose();
                            }}
                            className="w-full text-left p-3 rounded-xl bg-slate-50 hover:bg-amber-50/70 active:bg-amber-100 text-slate-800 hover:text-amber-900 font-bold text-xs flex items-center justify-between border border-slate-200/80 hover:border-amber-300 transition-all cursor-pointer group"
                          >
                            <span className="truncate pr-2 group-hover:translate-x-0.5 transition-transform">
                              {cat.name}
                            </span>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-white text-slate-600 border border-slate-200 group-hover:bg-amber-100 group-hover:text-amber-800">
                                {count}
                              </span>
                              <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600" />
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>

                  {/* Bottom Return Button */}
                  <button
                    type="button"
                    onClick={() => setSelectedDept(null)}
                    className="w-full py-2.5 text-center text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors pt-2 block cursor-pointer"
                  >
                    ← Ver outros departamentos
                  </button>
                </>
              )}
            </div>

          </div>
        )}

        {/* Footer inside Drawer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-center shrink-0 pb-20 md:pb-4">
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
