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
  Building2,
  Package,
  Calendar,
  UserCheck
} from 'lucide-react';

export default function HomeDashboard({ 
  funnels = [], 
  leads = [], 
  onNavigate 
}) {
  const { isDark } = useTheme();

  const totalLeads = leads.length;
  const totalValue = leads.reduce((acc, l) => acc + (parseFloat(l.estimated_value) || 0), 0);

  const MODULES = [
    {
      id: 'funil',
      route: '/funil',
      title: 'Funis de Vendas & CRM',
      badge: `${funnels.length} Funis Ativos`,
      desc: 'Kanban para Cursos, Rifas e Venda de Equipamentos. Arraste cards, filtre por coluna e acione o WhatsApp.',
      icon: Layers,
      color: '#f59e0b',
      btnText: 'Abrir Funis de Vendas'
    },
    {
      id: 'radar',
      route: '/radar',
      title: 'Radar de Oficinas DF',
      badge: '9.211 Oficinas no Supabase',
      desc: 'Mapa georreferenciado com 9.211 oficinas do Distrito Federal organizadas por RA. Integração direta ao CRM.',
      icon: MapPin,
      color: '#10b981',
      btnText: 'Abrir Radar DF'
    },
    {
      id: 'clientes',
      route: '/clientes',
      title: 'Base Central de Clientes',
      badge: 'Kanban & Lista',
      desc: 'Ficha completa do cliente: filiais, estado civil, cônjuge, time de futebol, hobbies e linha do tempo de compras.',
      icon: UserCheck,
      color: '#38bdf8',
      btnText: 'Ver Clientes & Fichas'
    },
    {
      id: 'equipamentos',
      route: '/equipamentos',
      title: 'Equipamentos & Valores Omie',
      badge: 'Omie ERP Sync',
      desc: 'Catálogo sincronizado em lotes de 50 produtos com 10 min de pausa. CMC, dimensões e 4 tabelas de venda.',
      icon: Package,
      color: '#f59e0b',
      btnText: 'Ver Catálogo & Preços'
    },
    {
      id: 'agenda',
      route: '/agenda',
      title: 'Agenda Comercial (Google)',
      badge: 'Visão Semanal / Diária',
      desc: 'Layout idêntico ao Google Agenda com linha vermelha em tempo real e botão de sincronização com o Google.',
      icon: Calendar,
      color: '#a855f7',
      btnText: 'Abrir Agenda Comercial'
    }
  ];

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-8 max-w-6xl mx-auto w-full select-none">
      {/* Boas-vindas Header */}
      <div className="mb-8 space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 font-bold text-xs border border-amber-500/20 mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Painel Interno Athena CRM OS</span>
        </div>
        <h1 className={`text-2xl sm:text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
          O que você deseja gerenciar hoje?
        </h1>
        <p className={`text-xs sm:text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          Selecione um dos módulos abaixo para acessar funis, radar, base de clientes, catálogo ou agenda.
        </p>
      </div>

      {/* Grid de Quadrados Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        {MODULES.map((mod) => {
          const IconComp = mod.icon;
          return (
            <div
              key={mod.id}
              onClick={() => onNavigate(mod.route)}
              className={`p-6 rounded-3xl border transition-all cursor-pointer group relative overflow-hidden flex flex-col justify-between min-h-[240px] shadow-md hover:shadow-xl hover:-translate-y-1 duration-200 ${
                isDark 
                  ? 'bg-slate-900/90 border-slate-800 hover:border-amber-400/60 hover:bg-slate-900' 
                  : 'bg-white border-slate-200 hover:border-amber-400 hover:shadow-amber-500/10'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div 
                    className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: `${mod.color}20`, color: mod.color, borderColor: `${mod.color}40`, borderWidth: 1 }}
                  >
                    <IconComp className="w-6 h-6" />
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                    isDark ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}>
                    {mod.badge}
                  </span>
                </div>

                <h2 className={`text-lg font-black mb-1.5 group-hover:text-amber-500 transition-colors ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}>
                  {mod.title}
                </h2>

                <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {mod.desc}
                </p>
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-slate-800/40 mt-4">
                <span className="text-xs font-bold text-amber-500 flex items-center gap-1.5 group-hover:translate-x-1 transition-transform">
                  <span>{mod.btnText}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
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
            <div className="text-[10px] uppercase font-bold text-slate-400">Oportunidades Ativas</div>
            <div className={`text-sm sm:text-base font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {totalLeads} Leads
            </div>
          </div>
        </div>

        <div className={`h-8 w-px hidden md:block ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-500">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Oficinas no Radar Supabase</div>
            <div className={`text-sm sm:text-base font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
              9.211 Centros DF
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
