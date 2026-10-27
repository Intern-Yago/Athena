import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { 
  Layers, 
  Plus, 
  ArrowRight, 
  Edit2, 
  Users, 
  DollarSign, 
  Columns3,
  Sparkles
} from 'lucide-react';

export default function FunnelsListPage({
  funnels = [],
  leads = [],
  onSelectFunnel,
  onOpenNewFunnelModal,
  onOpenEditFunnelModal
}) {
  const { isDark } = useTheme();

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-8 max-w-6xl mx-auto w-full select-none">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 font-bold text-xs border border-amber-500/20 mb-2">
            <Layers className="w-3.5 h-3.5" />
            <span>Gestão de Pipelines</span>
          </div>
          <h1 className={`text-2xl sm:text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Funis de Vendas & CRM
          </h1>
          <p className={`text-xs sm:text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Selecione qual funil deseja abrir no Kanban ou crie um novo funil para suas campanhas.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenNewFunnelModal}
          className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition cursor-pointer shrink-0 active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>+ Criar Novo Funil</span>
        </button>
      </div>

      {/* Grid de Funis */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {funnels.map(funnel => {
          const funnelLeads = leads.filter(l => l.funnel_id === funnel.id);
          const funnelValue = funnelLeads.reduce((acc, l) => acc + (parseFloat(l.estimated_value) || 0), 0);
          const stageCount = (funnel.stages || []).length;

          return (
            <div
              key={funnel.id}
              onClick={() => onSelectFunnel(funnel.id)}
              className={`p-6 rounded-3xl border transition-all cursor-pointer group relative flex flex-col justify-between shadow-md hover:shadow-xl ${
                isDark 
                  ? 'bg-slate-900/80 border-slate-800 hover:border-amber-400/50 hover:bg-slate-900' 
                  : 'bg-white border-slate-200 hover:border-amber-400 hover:shadow-amber-500/10'
              }`}
            >
              <div>
                {/* Header do Card */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <span 
                      className="w-3.5 h-3.5 rounded-full shadow-xs shrink-0" 
                      style={{ backgroundColor: funnel.color || '#f59e0b' }} 
                    />
                    <h3 className={`font-black text-base group-hover:text-amber-500 transition-colors line-clamp-1 ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}>
                      {funnel.name}
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenEditFunnelModal(funnel);
                    }}
                    className={`p-1.5 rounded-lg transition cursor-pointer ${
                      isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                    title="Editar informações do funil"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {funnel.description && (
                  <p className={`text-xs line-clamp-2 leading-relaxed mb-4 ${
                    isDark ? 'text-slate-400' : 'text-slate-600'
                  }`}>
                    {funnel.description}
                  </p>
                )}

                {/* Métricas do Funil */}
                <div className={`p-3 rounded-2xl border grid grid-cols-2 gap-2 mb-4 ${
                  isDark ? 'bg-slate-950/60 border-slate-800/80' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
                      <Columns3 className="w-3 h-3 text-slate-500" />
                      <span>Colunas</span>
                    </div>
                    <div className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {stageCount} etapas
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
                      <Users className="w-3 h-3 text-slate-500" />
                      <span>Leads</span>
                    </div>
                    <div className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {funnelLeads.length} contatos
                    </div>
                  </div>
                </div>

                {funnelValue > 0 && (
                  <div className="flex items-center justify-between text-xs font-bold mb-2">
                    <span className="text-slate-400 text-[11px]">Valor Previsto:</span>
                    <span className="text-amber-500 font-mono font-black">
                      R$ {funnelValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}
              </div>

              {/* Botão de Ação */}
              <div className="pt-4 border-t border-slate-800/40 flex items-center justify-between text-xs font-bold text-amber-500">
                <span className="group-hover:translate-x-1 transition-transform flex items-center gap-1.5">
                  <span>Abrir Kanban</span>
                  <ArrowRight className="w-4 h-4" />
                </span>

                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md ${
                  isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600'
                }`}>
                  /funil?id={funnel.id}
                </span>
              </div>
            </div>
          );
        })}

        {/* Card pontilhado para adicionar novo funil */}
        <button
          type="button"
          onClick={onOpenNewFunnelModal}
          className={`p-6 rounded-3xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-3 min-h-[220px] ${
            isDark 
              ? 'border-slate-800 hover:border-amber-400/60 bg-slate-900/20 hover:bg-slate-900/50 text-slate-400 hover:text-amber-400' 
              : 'border-slate-200 hover:border-amber-400 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-amber-600'
          }`}
        >
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
            isDark ? 'bg-slate-800' : 'bg-white shadow-xs'
          }`}>
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="font-black text-sm">Criar Outro Funil</div>
            <p className="text-[11px] text-slate-400 mt-0.5 max-w-[200px]">
              Ex: Cursos, Rifas, Elevadores ou Campanhas Especiais
            </p>
          </div>
        </button>
      </div>
    </div>
  );
}
