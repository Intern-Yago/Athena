import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  X, 
  Home, 
  Layers, 
  MapPin, 
  ShoppingBag, 
  Sun, 
  Moon, 
  LogOut, 
  ShieldCheck, 
  ExternalLink,
  ChevronRight
} from 'lucide-react';

export default function SidebarDrawer({ isOpen, onClose, currentRoute, onNavigate }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();

  if (!isOpen) return null;

  const handleNav = (route) => {
    onNavigate(route);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none animate-in fade-in duration-200">
      {/* Backdrop escuro com blur */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Painel lateral que desliza por cima da tela */}
      <div className={`absolute inset-y-0 left-0 max-w-full flex pl-0 pr-12 pointer-events-none`}>
        <div className={`w-80 pointer-events-auto flex flex-col shadow-2xl transition-all duration-300 transform ${
          isDark 
            ? 'bg-slate-900 border-r border-slate-800 text-slate-100' 
            : 'bg-white border-r border-slate-200 text-slate-800'
        }`}>
          {/* Header do Menu */}
          <div className={`p-5 flex items-center justify-between border-b ${
            isDark ? 'border-slate-800' : 'border-slate-100'
          }`}>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-slate-900 border border-amber-500/30 flex items-center justify-center p-1.5 shadow-xs">
                <img src="/favicon.svg" alt="Athena Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className={`font-black text-sm tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Athena
                  </span>
                  <span className="px-1.5 py-0.2 rounded-md bg-amber-500 text-slate-950 font-black text-[9px] uppercase tracking-wider">
                    Interno
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium">Gestão Comercial & Expansão</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className={`p-1.5 rounded-xl transition cursor-pointer ${
                isDark 
                  ? 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800' 
                  : 'bg-slate-100 text-slate-500 hover:text-slate-900 border border-slate-200'
              }`}
              title="Fechar menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Links de Navegação */}
          <div className="flex-1 overflow-y-auto p-4 space-y-1.5">
            <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Módulos Principais
            </div>

            <button
              type="button"
              onClick={() => handleNav('/')}
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition cursor-pointer ${
                currentRoute === '/'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : isDark ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <Home className="w-4 h-4" />
                <span>Página Inicial</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            </button>

            <button
              type="button"
              onClick={() => handleNav('/funil')}
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition cursor-pointer ${
                currentRoute.startsWith('/funil')
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : isDark ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <Layers className="w-4 h-4" />
                <span>Funis de Vendas & CRM</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            </button>

            <button
              type="button"
              onClick={() => handleNav('/radar')}
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition cursor-pointer ${
                currentRoute === '/radar'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : isDark ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-emerald-500" />
                <span>Radar de Oficinas DF</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                isDark ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-100 text-emerald-800'
              }`}>
                9.212
              </span>
            </button>

            <div className="pt-4 pb-2">
              <div className={`h-px w-full ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
            </div>

            <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Acesso Rápido
            </div>

            {/* Botão de Loja Online no Menu */}
            <a
              href="https://www.athenaconsultoria.com.br"
              target="_blank"
              rel="noopener noreferrer"
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition cursor-pointer border ${
                isDark 
                  ? 'bg-slate-950 border-slate-800 text-slate-300 hover:text-amber-400 hover:border-amber-400/40' 
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:text-amber-700 hover:border-amber-400'
              }`}
            >
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-4 h-4 text-amber-500" />
                <span>Loja Online Athena</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 opacity-60" />
            </a>

            {/* Alternador de Tema Claro / Escuro */}
            <button
              type="button"
              onClick={toggleTheme}
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition cursor-pointer border mt-2 ${
                isDark 
                  ? 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700' 
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
                <span>{isDark ? 'Mudar para Tema Claro' : 'Mudar para Tema Escuro'}</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase ${
                isDark ? 'bg-slate-800 text-amber-400' : 'bg-slate-200 text-slate-700'
              }`}>
                {theme}
              </span>
            </button>
          </div>

          {/* Footer: Usuário + Sair */}
          <div className={`p-4 border-t ${isDark ? 'border-slate-800 bg-slate-950/60' : 'border-slate-100 bg-slate-50'}`}>
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className={`text-xs font-bold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {user?.name || 'Membro da Equipe'}
                </div>
                <div className="text-[10px] text-amber-500 font-mono font-semibold uppercase">
                  {user?.role || 'Staff'} • Conectado
                </div>
              </div>

              <button
                type="button"
                onClick={logout}
                className={`p-2 rounded-xl transition cursor-pointer text-xs flex items-center gap-1.5 font-bold ${
                  isDark 
                    ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30' 
                    : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                }`}
                title="Sair do sistema"
              >
                <LogOut className="w-4 h-4" />
                <span>Sair</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
