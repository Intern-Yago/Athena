import React from 'react';
import { Wrench, Target, Cpu, Disc, Wind, Layers, Sparkles } from 'lucide-react';

export const WORKSHOP_SEGMENTS = [
  {
    id: 'todos',
    title: 'Todos os Equipamentos',
    subtitle: 'Catálogo Geral Completo',
    icon: Layers,
    categoryIds: [],
    badge: 'Catálogo'
  },
  {
    id: 'centro_automotivo',
    title: 'Centro Automotivo & Alinhamento',
    subtitle: 'Alinhadores 3D, Elevadores e Rodas',
    icon: Target,
    categoryIds: ['cat_alinhadores', 'cat_elevadores', 'cat_desmontadoras'],
    badge: 'Mais Buscado'
  },
  {
    id: 'oficina_mecanica',
    title: 'Oficina Mecânica Geral',
    subtitle: 'Elevadores, Prensas e Ferramental',
    icon: Wrench,
    categoryIds: ['cat_elevadores', 'cat_ferramentas'],
    badge: 'Essencial'
  },
  {
    id: 'autoeletrica_diagnostico',
    title: 'Autoelétrica & Diagnóstico',
    subtitle: 'Scanners com IA e Osciloscópios',
    icon: Cpu,
    categoryIds: ['cat_scanners', 'cat_ferramentas'],
    badge: 'Alta Tecnologia'
  },
  {
    id: 'truck_borracharia',
    title: 'Borracharia & Truck Center',
    subtitle: 'Desmontadoras, Balanceadoras e Pesados',
    icon: Disc,
    categoryIds: ['cat_desmontadoras', 'cat_alinhadores'],
    badge: 'Linha Pesada'
  },
  {
    id: 'climatizacao_injecao',
    title: 'Injeção & Ar-Condicionado',
    subtitle: 'Recicladoras de AC e Limpadoras GDI',
    icon: Wind,
    categoryIds: ['cat_ferramentas', 'cat_scanners'],
    badge: 'Especializado'
  }
];

export default function WorkshopSegments({ 
  activeSegmentId, 
  onSelectSegment 
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-amber-600 font-extrabold text-[11px] uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Soluções por Segmento
          </span>
          <h2 className="text-base sm:text-lg font-black text-slate-900 font-display">
            Qual é o perfil da sua oficina?
          </h2>
        </div>
      </div>

      {/* Segments Horizontal Carousel / Grid */}
      <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-none no-scrollbar snap-x">
        {WORKSHOP_SEGMENTS.map((seg) => {
          const Icon = seg.icon;
          const isActive = activeSegmentId === seg.id;

          return (
            <button
              key={seg.id}
              onClick={() => onSelectSegment(seg)}
              className={`group shrink-0 snap-start text-left p-3 sm:p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between min-w-[200px] sm:min-w-[220px] max-w-[240px] ${
                isActive
                  ? 'bg-slate-900 border-amber-500 text-white shadow-md ring-2 ring-amber-500/20'
                  : 'bg-white border-slate-200/90 text-slate-800 hover:border-amber-400 hover:shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between w-full mb-2">
                <div className={`p-2 rounded-xl transition-colors ${
                  isActive ? 'bg-amber-500 text-slate-950' : 'bg-slate-100 text-amber-700 group-hover:bg-amber-50 group-hover:text-amber-800'
                }`}>
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                {seg.badge && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {seg.badge}
                  </span>
                )}
              </div>

              <div>
                <h3 className={`text-xs sm:text-sm font-bold line-clamp-1 ${
                  isActive ? 'text-white' : 'text-slate-900 group-hover:text-amber-700'
                }`}>
                  {seg.title}
                </h3>
                <p className={`text-[10px] sm:text-[11px] line-clamp-1 mt-0.5 ${
                  isActive ? 'text-slate-300' : 'text-slate-500'
                }`}>
                  {seg.subtitle}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
