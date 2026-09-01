import React, { useState } from 'react';
import { X, Layers, Tag, PackageCheck, Info, ChevronDown, ChevronRight, PhoneCall, Lock, Grid, User, LogOut, ShoppingBag } from 'lucide-react';

export default function MobileDrawer({ 
  isOpen, 
  onClose, 
  categories = [], 
  brands = [], 
  products = [], 
  onNavigate,
  currentUser,
  onLogout
}) {
  const [openAccordion, setOpenAccordion] = useState(null); // 'categories', 'brands' or null

  if (!isOpen) return null;

  const safeCategories = categories || [];
  const safeBrands = brands || [];
  const safeProducts = products || [];

  const formattedPhone = "(61) 98348-5671";
  const whatsappUrl = "https://wa.me/5561983485671?text=Ol%C3%A1%21+Vim+pelo+site+da+Athena+Solu%C3%A7%C3%B5es+Automotivas+e+gostaria+de+informa%C3%A7%C3%B5es.";

  const toggleAccordion = (section) => {
    setOpenAccordion(openAccordion === section ? null : section);
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
        
        {/* Header inside Drawer */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <img src="/logo.jpg" alt="Athena Logo" className="w-8 h-8 rounded-lg object-contain bg-slate-950 p-0.5 border border-slate-700" />
            <div>
              <span className="font-extrabold text-sm block leading-tight">ATHENA</span>
              <span className="text-[10px] text-amber-400 font-bold uppercase">Soluções Automotivas</span>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Menu Items */}
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
                {/* FIRST OPTION: VER TODOS */}
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
                {/* FIRST OPTION: VER TODOS */}
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

        {/* Footer inside Drawer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-center pb-20 md:pb-4">
          <button
            onClick={() => {
              onNavigate('admin');
              onClose();
            }}
            className="flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 py-1 cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Painel do Administrador</span>
          </button>
        </div>

      </div>
    </div>
  );
}
