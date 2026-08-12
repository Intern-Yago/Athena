import React from 'react';
import { PackageCheck, Layers, Tag, MessageCircle, Home } from 'lucide-react';

export default function BottomNavBar({ activeTab, onNavigate }) {
  const whatsappUrl = "https://wa.me/5561983485671?text=Ol%C3%A1%21+Vim+pelo+site+da+Athena+Solu%C3%A7%C3%B5es+Automotivas+e+gostaria+de+um+or%C3%A7amento.";

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] py-1.5 px-2">
      <div className="grid grid-cols-4 gap-1 items-center justify-items-center">
        
        {/* Catálogo */}
        <button
          onClick={() => onNavigate('catalog')}
          className={`flex flex-col items-center justify-center gap-0.5 py-1 px-2 rounded-xl transition-colors w-full ${
            activeTab === 'catalog' || activeTab === ''
              ? 'text-amber-600 font-extrabold'
              : 'text-slate-500 hover:text-slate-900 font-medium'
          }`}
        >
          <PackageCheck className={`w-5 h-5 ${activeTab === 'catalog' || activeTab === '' ? 'text-amber-600' : 'text-slate-500'}`} />
          <span className="text-[10px] tracking-tight">Catálogo</span>
        </button>

        {/* Categorias */}
        <button
          onClick={() => onNavigate('categories')}
          className={`flex flex-col items-center justify-center gap-0.5 py-1 px-2 rounded-xl transition-colors w-full ${
            activeTab === 'categories' || activeTab.startsWith('category')
              ? 'text-amber-600 font-extrabold'
              : 'text-slate-500 hover:text-slate-900 font-medium'
          }`}
        >
          <Layers className={`w-5 h-5 ${activeTab === 'categories' || activeTab.startsWith('category') ? 'text-amber-600' : 'text-slate-500'}`} />
          <span className="text-[10px] tracking-tight">Categorias</span>
        </button>

        {/* Marcas */}
        <button
          onClick={() => onNavigate('brands')}
          className={`flex flex-col items-center justify-center gap-0.5 py-1 px-2 rounded-xl transition-colors w-full ${
            activeTab === 'brands' || activeTab.startsWith('brand')
              ? 'text-amber-600 font-extrabold'
              : 'text-slate-500 hover:text-slate-900 font-medium'
          }`}
        >
          <Tag className={`w-5 h-5 ${activeTab === 'brands' || activeTab.startsWith('brand') ? 'text-amber-600' : 'text-slate-500'}`} />
          <span className="text-[10px] tracking-tight">Marcas</span>
        </button>

        {/* WhatsApp */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center gap-0.5 py-1 px-2 rounded-xl text-emerald-600 font-extrabold transition-colors w-full text-decoration-none"
        >
          <MessageCircle className="w-5 h-5 fill-current text-emerald-600" />
          <span className="text-[10px] tracking-tight text-emerald-700">Cotar</span>
        </a>

      </div>
    </div>
  );
}
