import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  DollarSign, 
  Phone, 
  MapPin, 
  MessageCircle, 
  MoreVertical, 
  Edit2, 
  CheckCircle2, 
  XCircle,
  MoveHorizontal,
  Flame,
  ArrowRight
} from 'lucide-react';

export default function KanbanBoard({
  funnel,
  leads = [],
  onMoveLeadStage,
  onOpenLeadModal,
  onOpenStageModal,
  onOpenNewStageModal,
  onOpenNewLeadModal
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRa, setSelectedRa] = useState('all');
  const [draggedLeadId, setDraggedLeadId] = useState(null);

  const stages = useMemo(() => {
    return [...(funnel?.stages || [])].sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [funnel]);

  // Filtra leads por busca e por Região Administrativa do DF
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const matchesSearch = !searchTerm.trim() || 
        (lead.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (lead.company || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (lead.phone || '').includes(searchTerm) ||
        (lead.notes || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRa = selectedRa === 'all' || lead.ra_df === selectedRa;

      return matchesSearch && matchesRa;
    });
  }, [leads, searchTerm, selectedRa]);

  // Agrupa leads por estágio
  const leadsByStage = useMemo(() => {
    const map = {};
    stages.forEach(stg => { map[stg.id] = []; });
    filteredLeads.forEach(lead => {
      if (map[lead.stage_id]) {
        map[lead.stage_id].push(lead);
      } else if (stages.length > 0) {
        // Fallback para primeira etapa
        map[stages[0].id] = map[stages[0].id] || [];
        map[stages[0].id].push(lead);
      }
    });
    return map;
  }, [stages, filteredLeads]);

  // Lista única de RAs encontradas nos leads
  const availableRas = useMemo(() => {
    const set = new Set();
    leads.forEach(l => { if (l.ra_df) set.add(l.ra_df); });
    return Array.from(set).sort();
  }, [leads]);

  // Métricas do Funil
  const totalValue = useMemo(() => {
    return leads.reduce((acc, l) => acc + (parseFloat(l.estimated_value) || 0), 0);
  }, [leads]);

  // Disparo de WhatsApp com 1 clique
  const handleOpenWhatsApp = (e, lead) => {
    e.stopPropagation();
    if (!lead.phone) return;
    const cleanPhone = lead.phone.replace(/\D/g, '');
    const phoneWithCountry = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;

    let msg = `Olá ${lead.name}, tudo bem? Aqui é da Athena Soluções Automotivas.`;
    const funnelSlug = (funnel?.slug || '').toLowerCase();

    if (funnelSlug.includes('curso')) {
      msg = `Olá ${lead.name}, tudo bem? Aqui é da Athena Soluções Automotivas. Vi seu interesse nos nossos treinamentos de diagnóstico automotivo e gostaria de te passar a ementa completa!`;
    } else if (funnelSlug.includes('rifa')) {
      msg = `Olá amigo da ${lead.company || lead.name}! Tudo bem? Sou da Athena. Gostaria de te apresentar a Grande Rifa do Elevador Automotivo Mahovi que estamos promovendo para as oficinas do DF!`;
    } else if (funnelSlug.includes('expansao')) {
      msg = `Olá ${lead.name}, tudo bem? Aqui é da Athena Soluções Automotivas. Estamos no seu setor em ${lead.ra_df || 'Brasília'} visitando oficinas parceiras e gostaríamos de apresentar nossas condições especiais para equipamentos!`;
    }

    const url = `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Drag and Drop handlers
  const handleDragStart = (e, leadId) => {
    setDraggedLeadId(leadId);
    e.dataTransfer.setData('text/plain', leadId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetStageId) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData('text/plain') || draggedLeadId;
    if (leadId && targetStageId) {
      onMoveLeadStage(leadId, targetStageId);
    }
    setDraggedLeadId(null);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-950 overflow-hidden select-none">
      {/* Sub-header: Filters & Funnel Stats */}
      <div className="bg-slate-900/60 border-b border-slate-800/80 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2.5 flex-1 min-w-[240px] max-w-lg">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por contato, oficina, telefone ou nota..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none"
            />
          </div>

          <div className="relative shrink-0">
            <select
              value={selectedRa}
              onChange={(e) => setSelectedRa(e.target.value)}
              className="bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="all">Todas as RAs (DF)</option>
              {availableRas.map(ra => (
                <option key={ra} value={ra}>{ra}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Funnel Metrics & Quick Actions */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
              {leads.length} Leads no Funil
            </div>
            <div className="text-xs font-black text-amber-400">
              R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenNewStageModal}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border border-slate-700"
          >
            <Plus className="w-3.5 h-3.5 text-amber-400" />
            <span>Nova Coluna</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenNewLeadModal()}
            className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Adicionar Lead</span>
          </button>
        </div>
      </div>

      {/* Kanban Columns Horizontal Canvas */}
      <div className="flex-1 overflow-x-auto p-4 sm:p-6 flex items-start gap-4">
        {stages.map(stage => {
          const stageLeads = leadsByStage[stage.id] || [];
          const stageTotal = stageLeads.reduce((acc, l) => acc + (parseFloat(l.estimated_value) || 0), 0);

          return (
            <div
              key={stage.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage.id)}
              className="w-72 sm:w-80 shrink-0 bg-slate-900/70 border border-slate-800/90 rounded-2xl flex flex-col max-h-full shadow-lg"
            >
              {/* Stage Header */}
              <div className="p-3.5 border-b border-slate-800/80 flex items-center justify-between gap-2 shrink-0">
                <div className="flex items-center gap-2 min-w-0">
                  <span 
                    className="w-2.5 h-2.5 rounded-full shrink-0" 
                    style={{ backgroundColor: stage.color || '#64748b' }} 
                  />
                  <h3 className="font-bold text-xs text-white truncate" title={stage.title}>
                    {stage.title}
                  </h3>
                  <span className="px-1.5 py-0.5 rounded-md bg-slate-800 text-[10px] text-slate-300 font-mono font-bold">
                    {stageLeads.length}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onOpenNewLeadModal(stage.id)}
                    className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                    title="Adicionar lead nesta etapa"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onOpenStageModal(stage)}
                    className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                    title="Editar coluna"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Stage Sub-total */}
              {stageTotal > 0 && (
                <div className="px-3.5 py-1.5 bg-slate-950/40 text-[10px] text-slate-400 font-mono border-b border-slate-800/40 flex items-center justify-between">
                  <span>Valor na etapa:</span>
                  <strong className="text-amber-400">
                    R$ {stageTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </strong>
                </div>
              )}

              {/* Lead Cards List */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2.5 min-h-[140px]">
                {stageLeads.map(lead => (
                  <div
                    key={lead.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, lead.id)}
                    onClick={() => onOpenLeadModal(lead)}
                    className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/90 hover:border-amber-400/50 transition-all cursor-pointer shadow-sm hover:shadow-md group space-y-2 relative"
                  >
                    {/* Header: Name + Priority */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-bold text-xs text-white group-hover:text-amber-400 transition-colors line-clamp-1">
                        {lead.name}
                      </div>

                      {lead.priority === 'high' && (
                        <span className="shrink-0 text-amber-500" title="Prioridade Alta">
                          <Flame className="w-3.5 h-3.5 fill-amber-500/20" />
                        </span>
                      )}
                    </div>

                    {lead.company && lead.company !== lead.name && (
                      <div className="text-[11px] text-slate-400 truncate">
                        {lead.company}
                      </div>
                    )}

                    {/* Badges: RA + Value */}
                    <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                      {lead.ra_df && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-semibold">
                          <MapPin className="w-2.5 h-2.5 text-sky-400" />
                          <span>{lead.ra_df}</span>
                        </span>
                      )}

                      {lead.estimated_value > 0 && (
                        <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 font-mono font-bold border border-amber-500/20">
                          R$ {Number(lead.estimated_value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      )}
                    </div>

                    {/* Notes preview */}
                    {lead.notes && (
                      <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed italic bg-slate-900/50 p-1.5 rounded-lg border border-slate-800/50">
                        "{lead.notes}"
                      </p>
                    )}

                    {/* Card Actions Footer */}
                    <div className="pt-2 border-t border-slate-900 flex items-center justify-between gap-2">
                      {lead.phone ? (
                        <button
                          type="button"
                          onClick={(e) => handleOpenWhatsApp(e, lead)}
                          className="px-2 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 font-bold text-[10px] flex items-center gap-1 transition cursor-pointer"
                          title="Iniciar conversa no WhatsApp com mensagem personalizada"
                        >
                          <MessageCircle className="w-3 h-3" />
                          <span>WhatsApp</span>
                        </button>
                      ) : <div />}

                      <div className="text-[10px] text-slate-500 flex items-center gap-1 group-hover:text-slate-300 transition">
                        <span>Ver detalhes</span>
                        <ArrowRight className="w-2.5 h-2.5" />
                      </div>
                    </div>
                  </div>
                ))}

                {stageLeads.length === 0 && (
                  <div className="h-28 rounded-xl border border-dashed border-slate-800/80 flex flex-col items-center justify-center text-center p-3 text-slate-500 text-[11px]">
                    <span>Nenhum lead nesta etapa</span>
                    <button
                      type="button"
                      onClick={() => onOpenNewLeadModal(stage.id)}
                      className="mt-1 text-amber-400 hover:underline text-[10px] font-bold cursor-pointer"
                    >
                      + Adicionar lead
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Add Stage Column Trigger */}
        <button
          type="button"
          onClick={onOpenNewStageModal}
          className="w-72 sm:w-80 shrink-0 h-32 rounded-2xl border-2 border-dashed border-slate-800 hover:border-amber-400/50 bg-slate-900/20 hover:bg-slate-900/50 text-slate-400 hover:text-amber-400 font-bold text-xs flex flex-col items-center justify-center gap-2 transition cursor-pointer"
        >
          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">
            <Plus className="w-4 h-4" />
          </div>
          <span>+ Adicionar Nova Coluna</span>
        </button>
      </div>
    </div>
  );
}
