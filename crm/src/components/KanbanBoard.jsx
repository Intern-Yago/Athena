import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import { 
  Plus, 
  Search, 
  Filter, 
  DollarSign, 
  Phone, 
  MapPin, 
  MessageCircle, 
  Edit2, 
  ArrowLeft, 
  Flame, 
  ArrowRight, 
  GripVertical, 
  Trophy, 
  XCircle, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  CheckCircle2, 
  X, 
  Loader2 
} from 'lucide-react';

export default function KanbanBoard({
  funnel,
  leads = [],
  onMoveLeadStage,
  onReorderStages,
  onOpenLeadModal,
  onOpenStageModal,
  onOpenNewStageModal,
  onOpenNewLeadModal,
  onBackToFunnels
}) {
  const { isDark } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRa, setSelectedRa] = useState('all');
  const [draggedLeadId, setDraggedLeadId] = useState(null);

  // Filtros individuais por coluna e controle de cards visíveis por performance
  const [columnFilters, setColumnFilters] = useState({});
  const [visibleCounts, setVisibleCounts] = useState({});

  // Carga das 9.211 oficinas do Radar quando no Funil de Expansão DF
  const [radarWorkshops, setRadarWorkshops] = useState([]);
  const [loadingRadarWorkshops, setLoadingRadarWorkshops] = useState(false);

  // Carrega oficinas diretamente do Supabase via API do CRM (sem arquivo estático hardcoded)
  useEffect(() => {
    if (funnel?.id === 'fun_expansao_df' && radarWorkshops.length === 0) {
      setLoadingRadarWorkshops(true);
      const token = localStorage.getItem('athena_crm_token') || localStorage.getItem('athena_token') || '';
      fetch('/api/crm/workshops?all=true', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      })
        .then(res => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        })
        .then(data => {
          if (data && Array.isArray(data.workshops)) {
            setRadarWorkshops(data.workshops);
          }
        })
        .catch(err => {
          console.warn('Falha ao carregar oficinas do Supabase:', err.message);
        })
        .finally(() => setLoadingRadarWorkshops(false));
    }
  }, [funnel?.id, radarWorkshops.length]);

  // Reordenação de Colunas (Drag & Drop estilo Trello)
  const [draggedColumnIndex, setDraggedColumnIndex] = useState(null);

  // Controle de Zoom do Kanban para arrastar do 1º ao último card facilmente
  const [zoomLevel, setZoomLevel] = useState(1); // 1, 0.85, 0.7, 0.55

  // Canvas Panning (arrastar para os lados segurando o mouse no fundo)
  const boardRef = useRef(null);
  const isPanningRef = useRef(false);
  const startPosRef = useRef({ x: 0, scrollLeft: 0 });
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);

  const handleCanvasMouseDown = (e) => {
    if (e.button !== 0) return;
    const interactive = e.target.closest('button, input, select, textarea, a, [draggable="true"]');
    if (interactive) return;

    isPanningRef.current = true;
    setIsDraggingCanvas(true);
    startPosRef.current = {
      x: e.pageX,
      scrollLeft: boardRef.current ? boardRef.current.scrollLeft : 0
    };
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isPanningRef.current || !boardRef.current) return;
      e.preventDefault();
      const dx = e.pageX - startPosRef.current.x;
      boardRef.current.scrollLeft = startPosRef.current.scrollLeft - dx;
    };

    const handleMouseUp = () => {
      if (isPanningRef.current) {
        isPanningRef.current = false;
        setIsDraggingCanvas(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // Rolagem horizontal com a roda do mouse quando fora de listas com overflow vertical
  useEffect(() => {
    const el = boardRef.current;
    if (!el) return;

    const handleWheel = (e) => {
      const cardList = e.target.closest('.kanban-card-list');
      if (cardList && cardList.scrollHeight > cardList.clientHeight) {
        const atTop = cardList.scrollTop <= 0 && e.deltaY < 0;
        const atBottom = cardList.scrollTop + cardList.clientHeight >= cardList.scrollHeight - 2 && e.deltaY > 0;
        if (!atTop && !atBottom) {
          return;
        }
      }

      if (Math.abs(e.deltaY) > 0) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', handleWheel);
    };
  }, []);

  const stages = useMemo(() => {
    return [...(funnel?.stages || [])].sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [funnel]);

  // Combina leads cadastrados com todas as 9.211 oficinas do Radar quando no Funil de Expansão
  const combinedLeads = useMemo(() => {
    if (funnel?.id !== 'fun_expansao_df' || radarWorkshops.length === 0) {
      return leads;
    }

    let edicoes = {};
    try {
      const stored = localStorage.getItem('athena_edicoes_v3');
      if (stored) edicoes = JSON.parse(stored);
    } catch (_) {}

    // Identifica leads criados no CRM para não duplicar com os dados brutos do radar
    const crmLeadsByWorkshopId = new Map();
    leads.forEach(l => {
      if (l.funnel_id === 'fun_expansao_df') {
        const match = l.notes?.match(/\[Radar ID:\s*(\d+)\]/);
        if (match) {
          crmLeadsByWorkshopId.set(Number(match[1]), l);
        }
      }
    });

    const allCards = radarWorkshops.map(w => {
      if (crmLeadsByWorkshopId.has(w.id)) {
        return crmLeadsByWorkshopId.get(w.id);
      }

      const currentSt = edicoes[w.id]?.st || w.st || 'Não Visitado';

      let stageId = 'stg_exp_1';
      if (currentSt === 'Visita Agendada' || currentSt === 'Agendado') stageId = 'stg_exp_2';
      else if (currentSt === 'Visitado' || currentSt === 'Já Visitado' || currentSt === 'Visita Realizada') stageId = 'stg_exp_3';
      else if (currentSt === 'Negociação') stageId = 'stg_exp_4';
      else if (currentSt === 'Cliente Athena' || currentSt === 'Parceria Fechada') stageId = 'stg_exp_5';

      return {
        id: `radar_lead_${w.id}`,
        radarWorkshopId: w.id,
        name: edicoes[w.id]?.nome || w.nome || 'Oficina DF',
        company: w.rz || w.nome,
        cnpj: w.cnpj || '',
        phone: edicoes[w.id]?.tel || w.tel || '',
        address: edicoes[w.id]?.end || w.end || '',
        ra_df: edicoes[w.id]?.ra || w.ra || 'DF',
        category: edicoes[w.id]?.cat || w.cat || 'Mecânica Geral',
        estimated_value: 0,
        notes: edicoes[w.id]?.obs || w.obs || `Oficina sincronizada via Radar de Expansão DF [Radar ID: ${w.id}]`,
        stage_id: stageId,
        funnel_id: 'fun_expansao_df'
      };
    });

    return allCards;
  }, [funnel?.id, radarWorkshops, leads]);

  // Filtra leads por busca global e por Região Administrativa do DF
  const filteredLeads = useMemo(() => {
    return combinedLeads.filter(lead => {
      const cleanTerm = searchTerm.trim().toLowerCase();
      const numTerm = cleanTerm.replace(/\D/g, '');

      const matchesSearch = !cleanTerm || 
        (lead.name || '').toLowerCase().includes(cleanTerm) ||
        (lead.company || '').toLowerCase().includes(cleanTerm) ||
        (numTerm && (lead.cnpj || '').replace(/\D/g, '').includes(numTerm)) ||
        (numTerm && (lead.phone || '').replace(/\D/g, '').includes(numTerm)) ||
        (lead.address || '').toLowerCase().includes(cleanTerm) ||
        (lead.notes || '').toLowerCase().includes(cleanTerm);

      const matchesRa = selectedRa === 'all' || lead.ra_df === selectedRa;

      return matchesSearch && matchesRa;
    });
  }, [combinedLeads, searchTerm, selectedRa]);

  // Agrupa leads por estágio
  const leadsByStage = useMemo(() => {
    const map = {};
    stages.forEach(stg => { map[stg.id] = []; });
    filteredLeads.forEach(lead => {
      if (map[lead.stage_id]) {
        map[lead.stage_id].push(lead);
      } else if (stages.length > 0) {
        map[stages[0].id] = map[stages[0].id] || [];
        map[stages[0].id].push(lead);
      }
    });
    return map;
  }, [stages, filteredLeads]);

  // Lista única de RAs encontradas nos leads
  const availableRas = useMemo(() => {
    const set = new Set();
    combinedLeads.forEach(l => { if (l.ra_df) set.add(l.ra_df); });
    return Array.from(set).sort();
  }, [combinedLeads]);

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

  // Drag and Drop de Leads (Cards)
  const handleLeadDragStart = (e, leadId) => {
    setDraggedLeadId(leadId);
    e.dataTransfer.setData('lead/id', leadId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDropLead = (e, targetStageId) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData('lead/id') || draggedLeadId;
    if (leadId && targetStageId) {
      onMoveLeadStage(leadId, targetStageId);
    }
    setDraggedLeadId(null);
  };

  // Drag and Drop de Colunas (Reordenação como no Trello)
  const handleColumnDragStart = (e, index) => {
    setDraggedColumnIndex(index);
    e.dataTransfer.setData('column/index', String(index));
  };

  const handleColumnDrop = (e, targetIndex) => {
    const sourceIndexStr = e.dataTransfer.getData('column/index');
    if (sourceIndexStr !== '') {
      e.preventDefault();
      e.stopPropagation();
      const sourceIndex = parseInt(sourceIndexStr, 10);
      if (!isNaN(sourceIndex) && sourceIndex !== targetIndex && onReorderStages) {
        const newStages = [...stages];
        const [moved] = newStages.splice(sourceIndex, 1);
        newStages.splice(targetIndex, 0, moved);
        onReorderStages(newStages.map(s => s.id));
      }
      setDraggedColumnIndex(null);
    }
  };

  return (
    <div className={`flex-1 flex flex-col h-full max-h-full min-h-0 overflow-hidden select-none relative ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* Header do Funil */}
      <div className={`px-4 sm:px-6 py-4 border-b shrink-0 flex flex-wrap items-center justify-between gap-4 ${
        isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center gap-3">
          {onBackToFunnels && (
            <button
              type="button"
              onClick={onBackToFunnels}
              className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition cursor-pointer active:scale-95 ${
                isDark 
                  ? 'bg-slate-950 text-slate-300 hover:text-amber-400 border-slate-800' 
                  : 'bg-slate-100 text-slate-700 hover:text-amber-700 border-slate-200'
              }`}
              title="Voltar para a lista com todos os funis"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Todos os Funis</span>
            </button>
          )}

          <div>
            <div className="flex items-center gap-2">
              <span 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: funnel?.color || '#f59e0b' }} 
              />
              <h1 className={`text-base sm:text-lg font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {funnel?.name || 'Funil Comercial'}
              </h1>
            </div>
            {funnel?.description && (
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'} mt-0.5 max-w-xl truncate`}>
                {funnel.description}
              </p>
            )}
          </div>
        </div>

        {/* Métricas rápidas no Topo */}
        <div className="flex items-center gap-3">
          <div className={`px-3 py-1.5 rounded-xl border text-xs flex items-center gap-2 ${
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
          }`}>
            <span className="text-slate-400 font-medium">Oportunidades:</span>
            <span className="font-bold font-mono text-amber-500">{filteredLeads.length}</span>
          </div>

          {totalValue > 0 && (
            <div className={`px-3 py-1.5 rounded-xl border text-xs flex items-center gap-2 ${
              isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
            }`}>
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-bold font-mono text-emerald-400">
                R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className={`px-4 sm:px-6 py-2.5 border-b shrink-0 flex flex-wrap items-center justify-between gap-3 ${
        isDark ? 'bg-slate-900/30 border-slate-800' : 'bg-white/80 border-slate-200'
      }`}>
        <div className="flex items-center gap-2 flex-1 min-w-[220px] max-w-md">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar oportunidade, oficina ou telefone..."
              className={`w-full rounded-xl pl-9 pr-3 py-1.5 text-xs focus:outline-none border transition-colors ${
                isDark 
                  ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus:border-amber-400' 
                  : 'bg-slate-100 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-amber-500'
              }`}
            />
          </div>

          {/* Filtro por RA */}
          <div className="relative">
            <select
              value={selectedRa}
              onChange={(e) => setSelectedRa(e.target.value)}
              className={`rounded-xl px-3 py-1.5 text-xs focus:outline-none cursor-pointer border ${
                isDark 
                  ? 'bg-slate-950 border-slate-800 text-slate-300 focus:border-amber-400' 
                  : 'bg-slate-100 border-slate-200 text-slate-700 focus:border-amber-500'
              }`}
            >
              <option value="all">Todas as RAs ({leads.length})</option>
              {availableRas.map(ra => (
                <option key={ra} value={ra}>{ra}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenNewStageModal}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition cursor-pointer active:scale-95 ${
              isDark 
                ? 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-300' 
                : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Adicionar Coluna</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenNewLeadModal && onOpenNewLeadModal('')}
            className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition cursor-pointer active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Nova Oportunidade</span>
          </button>
        </div>
      </div>

      {/* Kanban Columns Horizontal Canvas com Zoom Adaptativo e Panning */}
      <div 
        ref={boardRef}
        onMouseDown={handleCanvasMouseDown}
        className={`flex-1 overflow-x-auto p-4 sm:p-6 overflow-y-hidden min-h-0 select-none ${
          isDraggingCanvas ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      >
        <div 
          className="flex items-stretch gap-4 h-full pb-2 transition-all duration-200 origin-top-left"
          style={{ 
            transform: zoomLevel !== 1 ? `scale(${zoomLevel})` : undefined,
            width: zoomLevel < 1 ? `${(100 / zoomLevel)}%` : undefined,
            height: zoomLevel < 1 ? `${(100 / zoomLevel)}%` : '100%'
          }}
        >
          {stages.map((stage, index) => {
            const stageLeads = leadsByStage[stage.id] || [];
            const stageTotal = stageLeads.reduce((acc, l) => acc + (parseFloat(l.estimated_value) || 0), 0);

            const isWon = Boolean(stage.is_won);
            const isLost = Boolean(stage.is_lost);

            // Filtro específico desta coluna
            const colFilter = (columnFilters[stage.id] || '').trim().toLowerCase();
            const cleanNum = colFilter.replace(/\D/g, '');

            const stageFilteredLeads = colFilter
              ? stageLeads.filter(l => 
                  (l.name || '').toLowerCase().includes(colFilter) ||
                  (l.company || '').toLowerCase().includes(colFilter) ||
                  (cleanNum && (l.cnpj || '').replace(/\D/g, '').includes(cleanNum)) ||
                  (cleanNum && (l.phone || '').replace(/\D/g, '').includes(cleanNum)) ||
                  (l.address || '').toLowerCase().includes(colFilter) ||
                  (l.ra_df || '').toLowerCase().includes(colFilter) ||
                  (l.notes || '').toLowerCase().includes(colFilter)
                )
              : stageLeads;

            const visibleLimit = visibleCounts[stage.id] || 40;
            const visibleLeads = colFilter ? stageFilteredLeads : stageFilteredLeads.slice(0, visibleLimit);

            return (
              <div
                key={stage.id}
                onDragOver={handleDragOver}
                onDrop={(e) => {
                  if (e.dataTransfer.types.includes('column/index')) {
                    handleColumnDrop(e, index);
                  } else {
                    handleDropLead(e, stage.id);
                  }
                }}
                className={`w-72 sm:w-80 shrink-0 border rounded-2xl flex flex-col h-full max-h-full min-h-0 shadow-lg transition-all ${
                  isDark 
                    ? 'bg-slate-900/80 border-slate-800' 
                    : 'bg-white border-slate-200'
                }`}
                style={{
                  borderTopColor: isWon ? '#10b981' : isLost ? '#ef4444' : (stage.color || '#64748b'),
                  borderTopWidth: '4px'
                }}
              >
                {/* Stage Header (Draggable para reordenar colunas) */}
                <div 
                  draggable
                  onDragStart={(e) => handleColumnDragStart(e, index)}
                  className={`p-3.5 border-b flex items-center justify-between gap-2 shrink-0 cursor-grab active:cursor-grabbing ${
                    isDark ? 'border-slate-800' : 'border-slate-100'
                  }`}
                  title="Arraste para reposicionar esta coluna no funil"
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <GripVertical className="w-3.5 h-3.5 text-slate-500 shrink-0 cursor-grab" />
                    
                    <span 
                      className="w-2.5 h-2.5 rounded-full shrink-0" 
                      style={{ backgroundColor: stage.color || '#64748b' }} 
                    />
                    
                    <h3 className={`font-bold text-xs truncate ${isDark ? 'text-white' : 'text-slate-900'}`} title={stage.title}>
                      {stage.title}
                    </h3>
                    
                    <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                      isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'
                    }`} title={`${stageLeads.length} oportunidades no total`}>
                      {stageLeads.length}
                    </span>

                    {/* Indicador de Ganho */}
                    {isWon && (
                      <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-500 font-bold text-[9px] border border-emerald-500/30 flex items-center gap-1 shrink-0" title="Etapa de Sucesso / Fechamento">
                        <Trophy className="w-2.5 h-2.5" />
                        <span>Ganho</span>
                      </span>
                    )}

                    {/* Indicador de Perda */}
                    {isLost && (
                      <span className="px-1.5 py-0.5 rounded-md bg-rose-500/15 text-rose-500 font-bold text-[9px] border border-rose-500/30 flex items-center gap-1 shrink-0" title="Etapa de Perda / Desistência">
                        <XCircle className="w-2.5 h-2.5" />
                        <span>Perda</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => onOpenNewLeadModal(stage.id)}
                      className={`p-1 rounded-lg transition cursor-pointer ${
                        isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                      title="Adicionar lead nesta etapa"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onOpenStageModal(stage)}
                      className={`p-1 rounded-lg transition cursor-pointer ${
                        isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                      title="Editar ou reposicionar coluna"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Input de Filtro Específico da Coluna */}
                <div className={`px-3 py-2 border-b shrink-0 ${
                  isDark ? 'bg-slate-950/70 border-slate-800/80' : 'bg-slate-50/90 border-slate-100'
                }`}>
                  <div className="relative flex items-center">
                    <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={columnFilters[stage.id] || ''}
                      onChange={(e) => setColumnFilters(prev => ({ ...prev, [stage.id]: e.target.value }))}
                      placeholder="Filtrar nesta etapa (nome, cnpj, tel)..."
                      className={`w-full pl-7 pr-7 py-1 text-[11px] rounded-lg border outline-none transition-colors ${
                        isDark 
                          ? 'bg-slate-900 border-slate-800 text-white placeholder-slate-500 focus:border-amber-400' 
                          : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-amber-500'
                      }`}
                    />
                    {columnFilters[stage.id] && (
                      <button
                        type="button"
                        onClick={() => setColumnFilters(prev => ({ ...prev, [stage.id]: '' }))}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5 cursor-pointer"
                        title="Limpar filtro da coluna"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  {colFilter && (
                    <div className="text-[10px] text-amber-500 font-bold mt-1 px-0.5">
                      {stageFilteredLeads.length} {stageFilteredLeads.length === 1 ? 'encontrado' : 'encontrados'}
                    </div>
                  )}
                </div>

                {/* Stage Sub-total */}
                {stageTotal > 0 && (
                  <div className={`px-3.5 py-1.5 text-[10px] font-mono border-b shrink-0 flex items-center justify-between ${
                    isDark ? 'bg-slate-950/40 text-slate-400 border-slate-800/40' : 'bg-slate-50 text-slate-600 border-slate-100'
                  }`}>
                    <span>Valor na etapa:</span>
                    <strong className="text-amber-500 font-bold">
                      R$ {stageTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </strong>
                  </div>
                )}

                {/* Lead Cards List com scroll próprio quando cheio (estilo Trello) */}
                <div className="kanban-card-list flex-1 min-h-0 overflow-y-auto p-3 space-y-2.5">
                  {visibleLeads.map(lead => (
                    <div
                      key={lead.id}
                      draggable
                      onDragStart={(e) => handleLeadDragStart(e, lead.id)}
                      onClick={() => onOpenLeadModal(lead)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer shadow-xs hover:shadow-md group space-y-2 relative ${
                        isDark 
                          ? 'bg-slate-950 border-slate-800 hover:border-amber-400/50' 
                          : 'bg-white border-slate-200 hover:border-amber-400 hover:bg-amber-50/10'
                      }`}
                    >
                      {/* Header: Name + Priority */}
                      <div className="flex items-start justify-between gap-2">
                        <div className={`font-bold text-xs group-hover:text-amber-500 transition-colors line-clamp-1 ${
                          isDark ? 'text-white' : 'text-slate-900'
                        }`}>
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
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-semibold ${
                            isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'
                          }`}>
                            <MapPin className="w-2.5 h-2.5 text-sky-500" />
                            <span>{lead.ra_df}</span>
                          </span>
                        )}

                        {lead.estimated_value > 0 && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-500 font-mono font-bold border border-amber-500/20">
                            R$ {Number(lead.estimated_value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        )}
                      </div>

                      {/* Notes preview */}
                      {lead.notes && (
                        <p className={`text-[10px] line-clamp-2 leading-relaxed italic p-1.5 rounded-lg border ${
                          isDark ? 'bg-slate-900/60 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-100 text-slate-600'
                        }`}>
                          "{lead.notes}"
                        </p>
                      )}

                      {/* Card Actions Footer */}
                      <div className={`pt-2 border-t flex items-center justify-between gap-2 ${
                        isDark ? 'border-slate-900' : 'border-slate-100'
                      }`}>
                        {lead.phone ? (
                          <button
                            type="button"
                            onClick={(e) => handleOpenWhatsApp(e, lead)}
                            className="px-2 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500 text-emerald-500 hover:text-white font-bold text-[10px] flex items-center gap-1 transition cursor-pointer"
                            title="Iniciar conversa no WhatsApp com mensagem personalizada"
                          >
                            <MessageCircle className="w-3 h-3" />
                            <span>WhatsApp</span>
                          </button>
                        ) : <div />}

                        <div className="text-[10px] text-slate-400 flex items-center gap-1 group-hover:text-amber-500 transition">
                          <span>Ver detalhes</span>
                          <ArrowRight className="w-2.5 h-2.5" />
                        </div>
                      </div>
                    </div>
                  ))}

                  {colFilter && visibleLeads.length === 0 && (
                    <div className="py-8 text-center text-slate-500 text-[11px] border border-dashed border-slate-800/40 rounded-xl">
                      Nenhuma oportunidade encontrada para "{columnFilters[stage.id]}".
                    </div>
                  )}

                  {!colFilter && stageFilteredLeads.length > visibleLeads.length && (
                    <button
                      type="button"
                      onClick={() => setVisibleCounts(prev => ({ ...prev, [stage.id]: (prev[stage.id] || 40) + 40 }))}
                      className="w-full py-2.5 px-3 text-center text-[11px] font-bold text-amber-500 hover:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 rounded-xl transition cursor-pointer border border-amber-500/20"
                    >
                      Carregar mais (+40) • {stageFilteredLeads.length - visibleLeads.length} restantes
                    </button>
                  )}

                  {stageLeads.length === 0 && (
                    <div className="py-8 text-center text-slate-500 text-[11px] border border-dashed border-slate-800/40 rounded-xl">
                      Nenhum lead nesta etapa.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Zoom Controller no Rodapé */}
      <div className={`fixed bottom-4 right-6 z-40 rounded-2xl border shadow-2xl flex items-center gap-1.5 p-1.5 backdrop-blur-md transition-all ${
        isDark ? 'bg-slate-900/90 border-slate-700 text-white shadow-black/50' : 'bg-white/95 border-slate-200 text-slate-900 shadow-slate-300/50'
      }`}>
        <button
          type="button"
          onClick={() => setZoomLevel(z => Math.max(0.55, Number((z - 0.15).toFixed(2))))}
          disabled={zoomLevel <= 0.55}
          className="p-1.5 rounded-xl hover:bg-slate-800/20 disabled:opacity-30 cursor-pointer transition"
          title="Diminuir Zoom (Enquadrar todas as colunas na tela)"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        <span className="text-xs font-mono font-bold px-1 min-w-[42px] text-center" title="Nível de Zoom">
          {Math.round(zoomLevel * 100)}%
        </span>

        <button
          type="button"
          onClick={() => setZoomLevel(z => Math.min(1.15, Number((z + 0.15).toFixed(2))))}
          disabled={zoomLevel >= 1.15}
          className="p-1.5 rounded-xl hover:bg-slate-800/20 disabled:opacity-30 cursor-pointer transition"
          title="Aumentar Zoom"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        {zoomLevel !== 1 && (
          <button
            type="button"
            onClick={() => setZoomLevel(1)}
            className="px-2 py-1 rounded-lg text-[10px] font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition cursor-pointer"
            title="Redefinir Zoom para 100%"
          >
            100%
          </button>
        )}
      </div>
    </div>
  );
}
