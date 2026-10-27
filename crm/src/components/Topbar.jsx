import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  Menu, 
  ShieldCheck, 
  Sun, 
  Moon, 
  LogOut,
  ChevronLeft
} from 'lucide-react';

export default function Topbar({ 
  onOpenMenu, 
  currentRoute = '/', 
  onBack,
  pageTitle = ''
}) {
  const { user, logout } = useAuth();
  const { toggleTheme, isDark } = useTheme();

  return (
    <header className={`h-16 px-4 sm:px-6 flex items-center justify-between gap-4 shrink-0 z-30 select-none border-b transition-colors ${
      isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
    }`}>
      {/* Left: Hamburguer Menu Button + Brand */}
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        <button
          type="button"
          onClick={onOpenMenu}
          className={`p-2.5 rounded-xl transition cursor-pointer border flex items-center justify-center ${
            isDark 
              ? 'bg-slate-950 text-slate-300 hover:text-white border-slate-800 hover:bg-slate-800' 
              : 'bg-slate-100 text-slate-700 hover:text-slate-900 border-slate-200 hover:bg-slate-200'
          }`}
          title="Abrir Menu Lateral"
        >
          <Menu className="w-5 h-5" />
        </button>

        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className={`p-2 rounded-xl transition cursor-pointer text-xs font-bold flex items-center gap-1 border ${
              isDark 
                ? 'bg-slate-950 text-slate-300 hover:text-amber-400 border-slate-800' 
                : 'bg-slate-100 text-slate-700 hover:text-amber-700 border-slate-200'
            }`}
            title="Voltar"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Voltar</span>
          </button>
        )}

        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-slate-900 border border-amber-500/30 flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
            <img src="/logo.jpg" alt="Athena Logo" className="w-full h-full object-cover" />
          </div>
          <div className="truncate">
            <div className="flex items-center gap-1.5">
              <span className={`font-black text-sm tracking-tight truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {pageTitle || 'Athena Interno'}
              </span>
              <span className="px-1.5 py-0.2 rounded-md bg-amber-500 text-slate-950 font-black text-[9px] uppercase tracking-wider shrink-0">
                CRM
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Theme Toggle + User Info */}
      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
        <button
          type="button"
          onClick={toggleTheme}
          className={`p-2 rounded-xl transition cursor-pointer border flex items-center justify-center ${
            isDark 
              ? 'bg-slate-950 text-amber-400 border-slate-800 hover:bg-slate-800' 
              : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
          }`}
          title={isDark ? "Mudar para Tema Claro" : "Mudar para Tema Escuro"}
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <div className={`h-4 w-px hidden sm:block ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />

        <div className="flex items-center gap-2.5">
          <div className="text-right hidden sm:block">
            <div className={`text-xs font-bold truncate max-w-[140px] ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {user?.name || 'Membro da Equipe'}
            </div>
            <div className="text-[10px] text-amber-500 font-mono font-semibold uppercase">
              {user?.role || 'Staff'}
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            className={`p-2 rounded-xl transition cursor-pointer ${
              isDark 
                ? 'bg-slate-950 text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-slate-800' 
                : 'bg-slate-100 text-slate-500 hover:text-red-600 hover:bg-red-50 border border-slate-200'
            }`}
            title="Sair do sistema"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
