import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, 
  Layers, 
  MapPin, 
  Plus, 
  LogOut, 
  ChevronDown,
  Sparkles,
  ExternalLink
} from 'lucide-react';

export default function Topbar({ 
  funnels = [], 
  activeFunnelId, 
  onSelectFunnel, 
  activeView, 
  onChangeView, 
  onOpenNewFunnelModal 
}) {
  const { user, logout } = useAuth();
  const activeFunnel = funnels.find(f => f.id === activeFunnelId) || funnels[0];

  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between gap-4 shrink-0 z-30 select-none">
      {/* Left: Brand + View Switcher */}
      <div className="flex items-center gap-4 sm:gap-6 min-w-0">
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-400/30 flex items-center justify-center shadow-xs">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm tracking-tight text-white">Athena</span>
              <span className="px-1.5 py-0.5 rounded-md bg-amber-500 text-slate-950 font-black text-[10px] tracking-wider uppercase">CRM</span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium hidden sm:block">Operações & Expansão</span>
          </div>
        </div>

        {/* View Switcher (Kanban vs Radar DF) */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0">
          <button
            type="button"
            onClick={() => onChangeView('kanban')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeView === 'kanban'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Funis Kanban</span>
          </button>

          <button
            type="button"
            onClick={() => onChangeView('radar')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeView === 'radar'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Radar Oficinas DF</span>
          </button>
        </div>
      </div>

      {/* Middle: Funnel Selector (Only when in Kanban view) */}
      {activeView === 'kanban' && (
        <div className="hidden md:flex items-center gap-2 max-w-md truncate">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
            Funil:
          </label>
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            {funnels.map(funnel => {
              const isSelected = funnel.id === activeFunnelId;
              return (
                <button
                  key={funnel.id}
                  type="button"
                  onClick={() => onSelectFunnel(funnel.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-slate-800 text-amber-400 border border-amber-400/40 shadow-xs'
                      : 'bg-slate-950/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  <span 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: funnel.color || '#f59e0b' }} 
                  />
                  <span>{funnel.name}</span>
                </button>
              );
            })}

            <button
              type="button"
              onClick={onOpenNewFunnelModal}
              className="p-1.5 rounded-xl bg-slate-950 text-slate-400 hover:text-amber-400 hover:bg-slate-800 border border-slate-800 transition cursor-pointer"
              title="Criar Novo Funil"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Right: User Profile & Actions */}
      <div className="flex items-center gap-3 shrink-0">
        <a
          href="https://www.athenaconsultoria.com.br"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden lg:flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-amber-400 transition"
          title="Abrir Loja Athena"
        >
          <span>Loja Online</span>
          <ExternalLink className="w-3 h-3" />
        </a>

        <div className="h-4 w-px bg-slate-800 hidden lg:block" />

        <div className="flex items-center gap-2.5">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-bold text-white truncate max-w-[130px]">
              {user?.name || 'Vendedor'}
            </div>
            <div className="text-[10px] text-amber-400 uppercase font-mono">
              {user?.role || 'Staff'}
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            className="p-2 rounded-xl bg-slate-950 text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-slate-800 transition cursor-pointer"
            title="Sair do CRM"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
