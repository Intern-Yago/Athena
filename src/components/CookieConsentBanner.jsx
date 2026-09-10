import React, { useState, useEffect } from 'react';
import { ShieldCheck, Cookie, SlidersHorizontal, Check, X, Lock, ExternalLink } from 'lucide-react';

const STORAGE_KEY = 'athena_cookie_consent_v1';

export default function CookieConsentBanner({ onNavigate }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [preferences, setPreferences] = useState({
    necessary: true,
    functionality: true,
    analytics: true,
  });

  useEffect(() => {
    try {
      const savedConsent = localStorage.getItem(STORAGE_KEY);
      if (!savedConsent) {
        // Mostra o banner após pequeno delay para suavidade
        const timer = setTimeout(() => setIsVisible(true), 800);
        return () => clearTimeout(timer);
      } else {
        const parsed = JSON.parse(savedConsent);
        setPreferences(prev => ({ ...prev, ...parsed }));
      }
    } catch (e) {
      setIsVisible(true);
    }

    // Ouvinte para reabrir configurações a qualquer momento pelo rodapé
    const handleOpenPreferences = () => {
      setIsModalOpen(true);
    };

    window.addEventListener('athena:open-cookie-preferences', handleOpenPreferences);
    return () => {
      window.removeEventListener('athena:open-cookie-preferences', handleOpenPreferences);
    };
  }, []);

  const saveConsent = (prefs) => {
    const dataToSave = {
      ...prefs,
      necessary: true,
      timestamp: new Date().toISOString()
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (e) {}
    setPreferences(dataToSave);
    setIsVisible(false);
    setIsModalOpen(false);
  };

  const handleAcceptAll = () => {
    saveConsent({ necessary: true, functionality: true, analytics: true });
  };

  const handleAcceptNecessary = () => {
    saveConsent({ necessary: true, functionality: false, analytics: false });
  };

  const handleSaveCustom = () => {
    saveConsent(preferences);
  };

  return (
    <>
      {/* 1. Floating Banner */}
      {isVisible && !isModalOpen && (
        <div className="fixed bottom-3 left-3 right-3 sm:left-6 sm:right-auto sm:max-w-xl z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="p-5 rounded-3xl bg-slate-900/95 border border-slate-700/80 shadow-2xl backdrop-blur-md text-slate-200 space-y-4">
            
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                <Cookie className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-white">Privacidade & Cookies</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-400 uppercase tracking-wide">
                    LGPD
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Utilizamos cookies essenciais para o funcionamento seguro da loja virtual, carrinho e faturamento. Você pode aceitar todos ou personalizar suas preferências.
                </p>
                <div className="flex items-center gap-3 pt-1 text-[11px]">
                  <button 
                    onClick={() => onNavigate && onNavigate('politica-de-cookies')}
                    className="text-amber-400 hover:underline font-semibold cursor-pointer"
                  >
                    Política de Cookies
                  </button>
                  <span className="text-slate-600">•</span>
                  <button 
                    onClick={() => onNavigate && onNavigate('politica-de-privacidade')}
                    className="text-slate-400 hover:text-slate-200 hover:underline cursor-pointer"
                  >
                    Privacidade (LGPD)
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                onClick={handleAcceptAll}
                className="flex-1 min-w-[120px] py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs transition-colors shadow-md cursor-pointer text-center"
              >
                Aceitar Todos
              </button>
              
              <button
                onClick={handleAcceptNecessary}
                className="flex-1 min-w-[120px] py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-colors cursor-pointer text-center"
              >
                Apenas Essenciais
              </button>

              <button
                onClick={() => setIsModalOpen(true)}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-colors cursor-pointer shrink-0"
                title="Personalizar Preferências de Cookies"
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 2. Preferences Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <SlidersHorizontal className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Preferências de Cookies</h3>
                  <p className="text-xs text-slate-400">Controle quais dados de navegação deseja compartilhar</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 overflow-y-auto text-xs text-slate-300">
              
              {/* Essenciais */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm flex items-center gap-2">
                    <Lock className="w-4 h-4 text-emerald-400" />
                    Cookies Estritamente Necessários
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
                    Sempre Ativo
                  </span>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Obrigatórios para o funcionamento da loja: carrinho de compras, faturamento Asaas, sessão do cliente e segurança CSRF. Não podem ser desativados.
                </p>
              </div>

              {/* Funcionalidade / Preferências */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm">
                    Preferências & Funcionalidades
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.functionality}
                      onChange={(e) => setPreferences({ ...preferences, functionality: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                  </label>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Salvam suas escolhas no catálogo de maquinário, filtros de marcas e categorias para proporcionar uma experiência personalizada.
                </p>
              </div>

              {/* Estatísticas / Análise */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm">
                    Estatísticas & Otimização
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.analytics}
                      onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                  </label>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Coleta métricas agregadas anônimas para avaliarmos velocidade de carregamento e produtos mais acessados, sem identificar o usuário pessoalmente.
                </p>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/50">
              <button
                onClick={handleAcceptAll}
                className="w-full sm:w-auto text-xs text-slate-400 hover:text-white font-semibold cursor-pointer py-2"
              >
                Permitir Todos
              </button>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveCustom}
                  className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs transition-colors shadow-md cursor-pointer"
                >
                  Salvar Preferências
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
