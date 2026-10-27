import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { 
  Layers, 
  MapPin, 
  ArrowRight, 
  TrendingUp, 
  Users, 
  CheckCircle2, 
  Sparkles,
  Building2
} from 'lucide-react';

export default function HomeDashboard({ 
  funnels = [], 
  leads = [], 
  onNavigate 
}) {
  const { isDark } = useTheme();

  const totalLeads = leads.length;
  const totalValue = leads.reduce((acc, l) => acc + (parseFloat(l.estimated_value) || 0), 0);

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-8 max-w-6xl mx-auto w-full select-none">
      {/* Boas-vindas Header */}
      <div className="mb-8 space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 font-bold text-xs border border-amber-500/20 mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Painel Interno Athena OS</span>
        </div>
        <h1 className={`text-2xl sm:text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
          O que você deseja gerenciar hoje?
        </h1>
        <p className={`text-xs sm:text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          Selecione um dos módulos abaixo para acessar os funis ou o mapa de prospecção.
        </p>
      </div>

      {/* Grid de Quadrados Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Quadrado 1: Funis de Vendas */}
        <div
          onClick={() => onNavigate('/funil')}
          className={`p-6 sm:p-8 rounded-3xl border transition-all cursor-pointer group relative overflow-hidden flex flex-col justify-between min-h-[260px] shadow-lg hover:shadow-2xl ${
            isDark 
              ? 'bg-slate-900/90 border-slate-800 hover:border-amber-400/60 hover:bg-slate-900' 
              : 'bg-white border-slate-200 hover:border-amber-400 hover:shadow-amber-500/10'
          }`}
        >
          {/* Fundo decorativo sutil */}
          <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl group-hover:scale-125 transition-transform pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-500 border border-amber-400/30 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                <Layers className="w-7 h-7" />
              </div>

              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                isDark 
                  ? 'bg-slate-800 text-amber-400 border-slate-700' 
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}>
                {funnels.length} Funis Ativos
              </span>
            </div>

            <h2 className={`text-xl font-black mb-2 group-hover:text-amber-500 transition-colors ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              Funis de Vendas & CRM
            </h2>

            <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Gerencie pipelines em Kanban para Cursos, Rifas, Venda de Equipamentos e Parcerias. Crie etapas, arraste oportunidades e acione o WhatsApp em 1 clique.
            </p>
          </div>

          <div className="pt-6 flex items-center justify-between border-t border-slate-800/40 mt-4">
            <span className="text-xs font-bold text-amber-500 flex items-center gap-1.5 group-hover:translate-x-1 transition-transform">
              <span>Abrir Funis de Vendas</span>
              <ArrowRight className="w-4 h-4" />
            </span>

            <div className="flex items-center gap-1.5">
              {funnels.slice(0, 3).map(f => (
                <span 
                  key={f.id} 
                  className="w-2.5 h-2.5 rounded-full" 
                  style={{ backgroundColor: f.color || '#f59e0b' }} 
                  title={f.name}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Quadrado 2: Radar de Oficinas DF */}
        <div
          onClick={() => onNavigate('/radar')}
          className={`p-6 sm:p-8 rounded-3xl border transition-all cursor-pointer group relative overflow-hidden flex flex-col justify-between min-h-[260px] shadow-lg hover:shadow-2xl ${
            isDark 
              ? 'bg-slate-900/90 border-slate-800 hover:border-emerald-400/60 hover:bg-slate-900' 
              : 'bg-white border-slate-200 hover:border-emerald-400 hover:shadow-emerald-500/10'
          }`}
        >
          {/* Fundo decorativo sutil */}
          <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl group-hover:scale-125 transition-transform pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-500 border border-emerald-400/30 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                <MapPin className="w-7 h-7" />
              </div>

              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                isDark 
                  ? 'bg-slate-800 text-emerald-400 border-slate-700' 
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200'
              }`}>
                9.212 Oficinas Mapeadas
              </span>
            </div>

            <h2 className={`text-xl font-black mb-2 group-hover:text-emerald-500 transition-colors ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              Radar de Expansão DF
            </h2>

            <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Mapa georreferenciado interativo com 9.212 oficinas mecânicas do Distrito Federal organizadas por Região Administrativa. Localize oficinas em campo e envie direto para o CRM.
            </p>
          </div>

          <div className="pt-6 flex items-center justify-between border-t border-slate-800/40 mt-4">
            <span className="text-xs font-bold text-emerald-500 flex items-center gap-1.5 group-hover:translate-x-1 transition-transform">
              <span>Abrir Radar de Oficinas DF</span>
              <ArrowRight className="w-4 h-4" />
            </span>

            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md ${
              isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600'
            }`}>
              Base Supabase Oficial
            </span>
          </div>
        </div>
      </div>

      {/* Barra de Indicadores Rápidos */}
      <div className={`p-4 sm:p-5 rounded-2xl border flex flex-wrap items-center justify-around gap-4 ${
        isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
      }`}>
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-500">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Total em Negociação</div>
            <div className={`text-sm sm:text-base font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
              R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        <div className={`h-8 w-px hidden md:block ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/15 text-blue-500">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Leads Registrados</div>
            <div className={`text-sm sm:text-base font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {totalLeads} Oportunidades
            </div>
          </div>
        </div>

        <div className={`h-8 w-px hidden md:block ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-500">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Oficinas no Radar DF</div>
            <div className={`text-sm sm:text-base font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
              9.212 Empresas
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
