import React from 'react';
import { Home, ArrowLeft, Search, AlertCircle, MessageCircle, HelpCircle } from 'lucide-react';

export default function NotFoundPage({ onNavigate, message }) {
  return (
    <div className="min-h-[70vh] flex items-center justify-center py-16 px-4">
      <div className="max-w-xl w-full text-center space-y-6 bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-xl relative overflow-hidden">
        
        {/* Ambient Top Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

        {/* 404 Visual Badge */}
        <div className="space-y-2 relative">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-50 border border-amber-200 flex items-center justify-center shadow-xs">
            <span className="text-3xl font-extrabold text-amber-600">404</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            <span>Página Não Encontrada</span>
          </div>
        </div>

        {/* Text Content */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Ops! Não encontramos este conteúdo.
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
            {message || 'O link que você acessou pode estar desatualizado, ter sido removido ou o endereço digitado contém algum erro.'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => onNavigate('catalog')}
            className="btn-gold w-full sm:w-auto px-6 py-3 text-xs font-bold flex items-center justify-center gap-2 shadow-md"
          >
            <Home className="w-4 h-4" />
            <span>Ir para o Catálogo Athena</span>
          </button>

          <a
            href="https://wa.me/5511999999999?text=Ol%C3%A1%2C%20estava%20navegando%20no%20cat%C3%A1logo%20Athena%20e%20n%C3%A3o%20encontrei%20um%20equipamento."
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary w-full sm:w-auto px-5 py-3 text-xs font-bold flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-4 h-4 text-emerald-600" />
            <span>Falar com Consultor</span>
          </a>
        </div>

        {/* Helpful links */}
        <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-slate-500">
          <button onClick={() => onNavigate('categories')} className="hover:text-amber-600 transition-colors">
            Explorar Categorias
          </button>
          <span>•</span>
          <button onClick={() => onNavigate('brands')} className="hover:text-amber-600 transition-colors">
            Ver Fabricantes
          </button>
          <span>•</span>
          <button onClick={() => onNavigate('about')} className="hover:text-amber-600 transition-colors">
            Sobre a Athena
          </button>
        </div>

      </div>
    </div>
  );
}
