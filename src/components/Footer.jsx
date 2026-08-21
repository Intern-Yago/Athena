import React from 'react';
import { PhoneCall, Mail, MapPin, Instagram, ExternalLink, ArrowUp, Lock } from 'lucide-react';

export default function Footer({ setActiveTab }) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formattedPhone = "(61) 98348-5671";
  const whatsappUrl = "https://wa.me/5561983485671?text=Ol%C3%A1%21+Vim+pelo+site+da+Athena+Solu%C3%A7%C3%B5es+Automotivas+e+gostaria+de+informa%C3%A7%C3%B5es.";
  const instagramUrl = "https://www.instagram.com/athena.solucoes.automotivas/";

  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800 mt-auto">
      <div className="container-custom space-y-10">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Col 1: Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl border border-slate-700 overflow-hidden bg-slate-900 p-0.5 shadow-md">
                <img 
                  src="/logo.jpg" 
                  alt="Athena Soluções Automotivas Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <span className="font-display font-extrabold text-lg text-white block leading-tight">
                  ATHENA
                </span>
                <span className="text-[10px] font-bold text-amber-400 tracking-wider uppercase">
                  Soluções Automotivas
                </span>
              </div>
            </div>

            <p className="text-xs leading-relaxed text-slate-400">
              Especialistas em equipamentos automotivos de alta tecnologia. Elevadores, scanners de diagnóstico com IA, alinhadores 3D e soluções completas para auto centers.
            </p>

            <div className="pt-1">
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs font-semibold text-amber-400 hover:text-amber-300 hover:border-amber-500 transition-all"
              >
                <Instagram className="w-3.5 h-3.5" />
                <span>@athena.solucoes.automotivas</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Navegação</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => { setActiveTab('catalog'); scrollToTop(); }} className="hover:text-amber-400 transition-colors">
                  Catálogo de Equipamentos
                </button>
              </li>
              <li>
                <button onClick={() => { setActiveTab('categories'); scrollToTop(); }} className="hover:text-amber-400 transition-colors">
                  Categorias de Produtos
                </button>
              </li>
              <li>
                <button onClick={() => { setActiveTab('brands'); scrollToTop(); }} className="hover:text-amber-400 transition-colors">
                  Marcas Parceiras
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Equipamentos Principais */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Equipamentos</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>Elevadores 2 e 4 Colunas</li>
              <li>Elevadores Tesoura Pantográficos</li>
              <li>Scanners de Diagnóstico Multimarca</li>
              <li>Alinhadores 3D Computadorizados</li>
              <li>Desmontadoras e Balanceadoras</li>
            </ul>
          </div>

          {/* Col 4: Contact & Support */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Atendimento</h4>
            <div className="space-y-2.5 text-xs text-slate-300">
              
              {/* WhatsApp Clicável */}
              <div className="flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-emerald-400 shrink-0" />
                <a 
                  href={whatsappUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:underline text-emerald-400 hover:text-emerald-300 font-bold inline-flex items-center gap-1"
                >
                  <span>WhatsApp: {formattedPhone}</span>
                  <ExternalLink className="w-3 h-3 opacity-70" />
                </a>
              </div>

              {/* Instagram abaixo do WhatsApp */}
              <div className="flex items-center gap-2">
                <Instagram className="w-4 h-4 text-pink-400 shrink-0" />
                <a 
                  href={instagramUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:underline text-slate-300 hover:text-pink-400 font-medium inline-flex items-center gap-1"
                >
                  <span>Instagram: @athena.solucoes.automotivas</span>
                  <ExternalLink className="w-3 h-3 opacity-70" />
                </a>
              </div>

              {/* E-mail Oficial */}
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <a 
                  href="mailto:contato@athenaconsultoria.com.br" 
                  className="hover:underline text-slate-300 hover:text-amber-400 font-medium"
                >
                  contato@athenaconsultoria.com.br
                </a>
              </div>

              <div className="flex items-start gap-2 pt-1">
                <MapPin className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <span className="text-slate-400">Atendimento comercial para todo o Brasil</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-4">
            <p>© {new Date().getFullYear()} Athena Soluções Automotivas. Todos os direitos reservados.</p>
          </div>
          
          <button 
            onClick={scrollToTop}
            className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-amber-400 hover:border-amber-500 transition-all flex items-center justify-center gap-1 text-[11px]"
          >
            <span>Voltar ao Topo</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </footer>
  );
}
