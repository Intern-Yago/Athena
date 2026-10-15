import React from 'react';
import { CheckCircle2, Home, MessageCircle, ArrowRight } from 'lucide-react';

export default function ThankYouPage({ onNavigate }) {
  return (
    <div className="min-h-[70vh] flex items-center justify-center py-16 px-4">
      <div className="max-w-xl w-full text-center space-y-6 bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-xl relative overflow-hidden">
        
        {/* Ambient Top Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

        {/* Success Visual Badge */}
        <div className="space-y-2 relative">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shadow-xs">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/60 text-emerald-800 text-xs font-bold border border-emerald-200">
            <span>Solicitação Recebida com Sucesso!</span>
          </div>
        </div>

        {/* Text Content */}
        <div className="space-y-3">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Obrigado pelo seu interesse!
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
            Recebemos seus dados e nossa equipe de especialistas técnicos entrará em contato em breve para apresentar a melhor proposta, condições de financiamento e cotação de frete para a sua oficina.
          </p>
        </div>

        {/* Priority WhatsApp Box */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-left space-y-2">
          <p className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Precisa de atendimento com urgência?
          </p>
          <p className="text-xs text-slate-500">
            Você pode chamar um consultor técnico diretamente no nosso WhatsApp comercial agora mesmo.
          </p>
          <a
            href="https://wa.me/5561983485671?text=Ol%C3%A1%21+Acabei+de+enviar+um+pedido+de+or%C3%A7amento+no+site+da+Athena+e+gostaria+de+atendimento+priorit%C3%A1rio."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700 hover:text-emerald-800 underline pt-1"
          >
            <MessageCircle className="w-4 h-4 text-emerald-600" />
            <span>Falar no WhatsApp (61) 98348-5671</span>
          </a>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => onNavigate('catalog')}
            className="btn-gold w-full sm:w-auto px-6 py-3 text-xs font-bold flex items-center justify-center gap-2 shadow-md"
          >
            <Home className="w-4 h-4" />
            <span>Continuar Explorando o Catálogo</span>
          </button>
        </div>

        {/* Helpful links */}
        <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-slate-500">
          <button onClick={() => onNavigate('categories')} className="hover:text-amber-600 transition-colors">
            Categorias
          </button>
          <span>•</span>
          <button onClick={() => onNavigate('brands')} className="hover:text-amber-600 transition-colors">
            Fabricantes
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
