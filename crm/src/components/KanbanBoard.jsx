import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';
import { crmApiFetch } from '../utils/api';
import { fetchOfflineWorkshops, getOfflineWorkshopStats, saveOfflineWorkshopStatus, cancelAppointmentsForLead } from '../utils/workshopsFallback';
import ScheduleVisitModal from './ScheduleVisitModal';
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
  Loader2,
  Users,
  Package
} from 'lucide-react';

/**
 * Skeleton Card para transições suaves e eliminação do efeito flash de dados antigos
 */
export function KanbanCardSkeleton() {
  return (
    <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40 animate-pulse space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded-md w-3/4" />
        <div className="h-3.5 w-3.5 bg-slate-200 dark:bg-slate-800 rounded-full shrink-0" />
      </div>
      <div className="h-2.5 bg-slate-200 dark:bg-slate-800 rounded-md w-1/2" />
      <div className="flex items-center gap-2">
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-16" />
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-20" />
      </div>
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
        <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-lg w-20" />
        <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-md w-16" />
      </div>
    </div>
  );
}

export function KanbanLeadCard({
  lead,
  isDark,
  handleLeadDragStart,
  onOpenLeadModal,
  handleOpenWhatsApp,
  handleOpenGoogleMaps
}) {
  const hasLocation = Boolean(lead.address || lead.ra_df || (lead.latitude && lead.longitude));
  const priceDisplay = parseFloat(lead.negotiated_price) || parseFloat(lead.estimated_value) || 0;

  return (
    <div
      draggable
      onDragStart={(e) => handleLeadDragStart(e, lead.id, lead)}
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

      {/* Badges: Vínculo + Equipamento + RA + Valor Negociado */}
      <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
        {lead.customer_id && (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" title="Cliente cadastrado na Base Central">
            <Users className="w-2.5 h-2.5" />
            <span>Cadastrado</span>
          </span>
        )}

        {lead.equipment_id && (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20" title="Equipamento vinculado">
            <Package className="w-2.5 h-2.5" />
            <span>Equipamento</span>
          </span>
        )}

        {lead.ra_df && (
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-semibold ${
            isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'
          }`}>
            <MapPin className="w-2.5 h-2.5 text-sky-500" />
            <span>{lead.ra_df}</span>
          </span>
        )}

        {priceDisplay > 0 && (
          <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-500 font-mono font-bold border border-amber-500/20">
            R$ {priceDisplay.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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

      {/* Card Actions Footer: WhatsApp + Google Maps + Ver detalhes */}
      <div className={`pt-2 border-t flex items-center justify-between gap-2 ${
        isDark ? 'border-slate-900' : 'border-slate-100'
      }`}>
        <div className="flex items-center gap-1.5">
          {lead.phone && (
            <button
              type="button"
              onClick={(e) => handleOpenWhatsApp(e, lead)}
              className="px-2 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500 text-emerald-500 hover:text-white font-bold text-[10px] flex items-center gap-1 transition cursor-pointer"
              title="Iniciar conversa no WhatsApp"
            >
              <MessageCircle className="w-3 h-3" />
              <span>WhatsApp</span>
            </button>
          )}

          {hasLocation && (
            <button
              type="button"
              onClick={(e) => handleOpenGoogleMaps(e, lead)}
              className={`px-2 py-1 rounded-lg border font-bold text-[10px] flex items-center gap-1 transition cursor-pointer ${
                isDark 
                  ? 'bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border-sky-500/20' 
                  : 'bg-sky-50 hover:bg-sky-100 text-sky-600 border-sky-200'
              }`}
              title="Abrir localização no Google Maps em nova aba"
            >
              <MapPin className="w-3 h-3 text-sky-500" />
              <span>Mapa</span>
            </button>
          )}
        </div>

        <div className="text-[10px] text-slate-400 flex items-center gap-1 group-hover:text-amber-500 transition">
          <span>Detalhes</span>
          <ArrowRight className="w-2.5 h-2.5" />
        </div>
      </div>
    </div>
  );
}

export function VirtualizedCardList({
  leads,
  isDark,
  handleLeadDragStart,
  onOpenLeadModal,
  handleOpenWhatsApp,
  handleOpenGoogleMaps
}) {
  const containerRef = useRef(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(600);

  const ITEM_HEIGHT = 135;
  const total = leads.length;

  useEffect(() => {
    if (!containerRef.current) return;
    const updateSize = () => {
      if (containerRef.current) {
        setContainerHeight(containerRef.current.clientHeight || 600);
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const handleScroll = (e) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  if (total <= 35) {
    return (
      <div className="kanban-card-list flex-1 min-h-0 overflow-y-auto p-3 space-y-2.5">
        {leads.map(lead => (
          <KanbanLeadCard
            key={lead.id}
            lead={lead}
            isDark={isDark}
            handleLeadDragStart={handleLeadDragStart}
            onOpenLeadModal={onOpenLeadModal}
            handleOpenWhatsApp={handleOpenWhatsApp}
            handleOpenGoogleMaps={handleOpenGoogleMaps}
          />
        ))}
      </div>
    );
  }

  // Virtualização para colunas com grande volume (>35 cards)
  const buffer = 4;
  const startIndex = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - buffer);
  const endIndex = Math.min(total, Math.ceil((scrollTop + containerHeight) / ITEM_HEIGHT) + buffer);

  const visibleLeads = leads.slice(startIndex, endIndex);
  const paddingTop = startIndex * ITEM_HEIGHT;
  const paddingBottom = Math.max(0, (total - endIndex) * ITEM_HEIGHT);

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="kanban-card-list flex-1 min-h-0 overflow-y-auto p-3"
    >
      <div style={{ paddingTop: `${paddingTop}px`, paddingBottom: `${paddingBottom}px` }} className="space-y-2.5">
        {visibleLeads.map(lead => (
          <KanbanLeadCard
            key={lead.id}
            lead={lead}
            isDark={isDark}
            handleLeadDragStart={handleLeadDragStart}
            onOpenLeadModal={onOpenLeadModal}
            handleOpenWhatsApp={handleOpenWhatsApp}
            handleOpenGoogleMaps={handleOpenGoogleMaps}
          />
        ))}
      </div>
    </div>
  );
}

function getStatusForStage(stageId, stageTitle = '') {
  const lower = (stageTitle || '').toLowerCase();
  if (stageId === 'stg_exp_1' || lower.includes('a visitar') || lower.includes('não visitado') || lower.includes('radar')) {
    return 'Não Visitado';
  }
  if (stageId === 'stg_exp_2' || lower.includes('agendad')) {
    return 'Agendado,Visita Agendada';
  }
  if (stageId === 'stg_exp_3' || lower.includes('realizada') || lower.includes('visitad')) {
    return 'Visitado,Já Visitado,Visita Realizada';
  }
  if (stageId === 'stg_exp_4' || lower.includes('negocia')) {
    return 'Negociação';
  }
  if (stageId === 'stg_exp_5' || lower.includes('parceria') || lower.includes('cliente') || lower.includes('fechada')) {
    return 'Cliente Athena,Parceria Fechada';
  }
  return '';
}

function getWorkshopStatusToSave(stageId, stageTitle = '') {
  const lower = (stageTitle || '').toLowerCase();
  if (stageId === 'stg_exp_1' || lower.includes('a visitar') || lower.includes('não visitado')) return 'Não Visitado';
  if (stageId === 'stg_exp_2' || lower.includes('agendad')) return 'Visita Agendada';
  if (stageId === 'stg_exp_3' || lower.includes('realizada') || lower.includes('visitad')) return 'Visitado';
  if (stageId === 'stg_exp_4' || lower.includes('negocia')) return 'Negociação';
  if (stageId === 'stg_exp_5' || lower.includes('parceria') || lower.includes('cliente')) return 'Cliente Athena';
  return 'Não Visitado';
}

function workshopToLead(w, stageId, funnelId) {
  return {
    id: `radar_lead_${w.id}`,
    radarWorkshopId: w.id,
    name: w.nome_fantasia || w.razao_social || w.nome || 'Oficina DF',
    company: w.razao_social || w.rz || w.nome_fantasia || w.nome || 'Oficina DF',
    cnpj: w.cnpj || '',
    phone: w.telefone_principal || w.tel || '',
    address: w.endereco_completo || w.end || '',
    ra_df: w.regiao_administrativa || w.ra || 'DF',
    category: w.categoria || w.cat || 'Mecânica Geral',
    estimated_value: 0,
    notes: w.observacoes || w.obs || `Oficina sincronizada via Radar de Expansão DF [Radar ID: ${w.id}]`,
    latitude: w.latitude || w.lat,
    longitude: w.longitude || w.lng,
    stage_id: stageId,
    funnel_id: funnelId
  };
}

export default function KanbanBoard({
  funnel,
  leads = [],
  loading = false,
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

  // Modal para Agendamento de Visita vinculado à Agenda
  const [scheduledVisitState, setScheduledVisitState] = useState({
    isOpen: false,
    lead: null,
    leadId: null,
    targetStage: null,
    targetStageId: null
  });

  // Prevenção de flash de dados antigos ao alternar funis
  const [isChangingFunnel, setIsChangingFunnel] = useState(false);
  const prevFunnelIdRef = useRef(funnel?.id);

  useEffect(() => {
    if (prevFunnelIdRef.current !== funnel?.id) {
      prevFunnelIdRef.current = funnel?.id;
      setExpansionStagesData({});
      setColumnFilters({});
      setIsChangingFunnel(true);
      const timer = setTimeout(() => setIsChangingFunnel(false), 300);
      return () => clearTimeout(timer);
    }
  }, [funnel?.id]);

  const stages = useMemo(() => {
    return [...(funnel?.stages || [])].sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [funnel]);

  const isExpansionFunnel = funnel?.id === 'fun_expansao_df' ||
                            funnel?.slug === 'expansao-df' ||
                            (funnel?.name || '').toLowerCase().includes('expans');

  // --------------------------------------------------------------------------
  // PAGINAÇÃO E CARGA LEVE NO BANCO (FUNIL DE EXPANSÃO DF)
  // --------------------------------------------------------------------------
  // Em vez de carregar 9.211 registros na memória do navegador ao mesmo tempo,
  // mantemos dados sob demanda com paginação por coluna (35 por vez) e busca no DB.
  const [columnFilters, setColumnFilters] = useState({});
  const [expansionStagesData, setExpansionStagesData] = useState({});
  const [loadingExpansionStages, setLoadingExpansionStages] = useState({});
  const [availableRas, setAvailableRas] = useState([]);

  // Carrega lista de RAs para o dropdown quando no Funil de Expansão
  // Carrega lista de RAs para o dropdown no Funil de Expansão (completamente offline/resiliente)
  useEffect(() => {
    if (isExpansionFunnel) {
      getOfflineWorkshopStats().then(off => {
        if (off && Array.isArray(off.byRa)) {
          setAvailableRas(off.byRa.map(r => r.ra).filter(Boolean));
        }
      });
    }
  }, [isExpansionFunnel]);

  // Função para carregar uma página de oficinas para um determinado estágio
  const loadStageWorkshops = useCallback(async (stage, page = 1, append = false, query = '', ra = 'all', overrideSearch = null) => {
    const stageId = stage.id;
    const statusParam = getStatusForStage(stageId, stage.title);

    setLoadingExpansionStages(prev => ({ ...prev, [stageId]: true }));
    try {
      const activeSearch = overrideSearch !== null ? overrideSearch : searchTerm;
      const searchParam = query.trim() || (activeSearch || '').trim();

      // Carregamento direto, instantâneo e com 0 erros 404 de rede
      const data = await fetchOfflineWorkshops({
        ra,
        search: searchParam,
        status: statusParam,
        page,
        limit: 35
      });

      if (data && data.success && Array.isArray(data.workshops)) {
        const newLeads = data.workshops.map(w => workshopToLead(w, stageId, funnel?.id));

        setExpansionStagesData(prev => {
          const currentItems = (append && prev[stageId]?.items) ? prev[stageId].items : [];
          return {
            ...prev,
            [stageId]: {
              items: append ? [...currentItems, ...newLeads] : newLeads,
              page,
              total: data.total || 0,
              totalPages: data.totalPages || 1,
              hasMore: page < (data.totalPages || 1)
            }
          };
        });
      }
    } catch (_) {
      // Ignora falhas de conexão de forma graciosa
    } finally {
      setLoadingExpansionStages(prev => ({ ...prev, [stageId]: false }));
    }
  }, [funnel?.id, searchTerm]);

  // Carga e busca no Funil de Expansão (com debounce para digitação suave)
  const globalSearchTimerRef = useRef(null);
  useEffect(() => {
    if (!isExpansionFunnel || stages.length === 0) return;

    if (globalSearchTimerRef.current) {
      clearTimeout(globalSearchTimerRef.current);
    }

    // Debounce de 250ms para buscas instantâneas sem travar a interface
    globalSearchTimerRef.current = setTimeout(() => {
      stages.forEach(stg => {
        loadStageWorkshops(stg, 1, false, columnFilters[stg.id] || '', selectedRa, searchTerm);
      });
    }, searchTerm ? 250 : 0);

    return () => {
      if (globalSearchTimerRef.current) {
        clearTimeout(globalSearchTimerRef.current);
      }
    };
  }, [isExpansionFunnel, funnel?.id, stages, searchTerm, selectedRa]);

  // Debounce para busca por coluna
  const searchTimersRef = useRef({});
  const handleColumnSearchChange = (stage, value) => {
    const stageId = stage.id;
    setColumnFilters(prev => ({ ...prev, [stageId]: value }));

    if (isExpansionFunnel) {
      if (searchTimersRef.current[stageId]) {
        clearTimeout(searchTimersRef.current[stageId]);
      }
      searchTimersRef.current[stageId] = setTimeout(() => {
        loadStageWorkshops(stage, 1, false, value, selectedRa, searchTerm);
      }, 300);
    }
  };

  // Carregar mais (+35) na coluna do Funil de Expansão
  const handleLoadMoreColumn = (stage) => {
    if (!isExpansionFunnel) return;
    const currentData = expansionStagesData[stage.id] || { page: 1, hasMore: false };
    if (currentData.hasMore) {
      loadStageWorkshops(stage, currentData.page + 1, true, columnFilters[stage.id] || '', selectedRa, searchTerm);
    }
  };

  // --------------------------------------------------------------------------
  // LEADS PARA FUNIS NORMAIS (CRM PADRÃO)
  // --------------------------------------------------------------------------
  const [visibleCounts, setVisibleCounts] = useState({});

  const filteredStandardLeads = useMemo(() => {
    if (isExpansionFunnel) return [];

    return leads.filter(lead => {
      // O lead DEVE pertencer estritamente a este funil para evitar cartões fantasmas de outros funis
      if (lead.funnel_id && funnel?.id && lead.funnel_id !== funnel.id) {
        return false;
      }

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
  }, [isExpansionFunnel, funnel?.id, leads, searchTerm, selectedRa]);

  const standardLeadsByStage = useMemo(() => {
    if (isExpansionFunnel) return {};

    const map = {};
    stages.forEach(stg => { map[stg.id] = []; });
    filteredStandardLeads.forEach(lead => {
      // Insere o card APENAS se o stage_id corresponder exatamente a esta coluna
      if (map[lead.stage_id]) {
        map[lead.stage_id].push(lead);
      }
    });
    return map;
  }, [isExpansionFunnel, stages, filteredStandardLeads]);

  // Lista de RAs para funis normais
  const standardRas = useMemo(() => {
    if (isExpansionFunnel) return availableRas;
    const set = new Set();
    leads.forEach(l => { if (l.ra_df) set.add(l.ra_df); });
    return Array.from(set).sort();
  }, [isExpansionFunnel, availableRas, leads]);

  // Métricas do Funil
  const totalValue = useMemo(() => {
    return leads.reduce((acc, l) => acc + (parseFloat(l.estimated_value) || 0), 0);
  }, [leads]);

  const totalCardsCount = useMemo(() => {
    if (isExpansionFunnel) {
      return Object.values(expansionStagesData).reduce((acc, cur) => acc + (cur.total || 0), 0);
    }
    return filteredStandardLeads.length;
  }, [isExpansionFunnel, expansionStagesData, filteredStandardLeads.length]);

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

  // Botão de Google Maps em Nova Aba
  const handleOpenGoogleMaps = (e, lead) => {
    e.stopPropagation();
    let query = '';
    if (lead.latitude && lead.longitude) {
      query = `${lead.latitude},${lead.longitude}`;
    } else if (lead.address) {
      query = `${lead.address}, ${lead.ra_df || 'DF'}, Brasil`;
    } else if (lead.ra_df) {
      query = `${lead.name}, ${lead.ra_df}, Brasil`;
    }
    if (!query) return;
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Drag and Drop de Leads (Cards)
  const handleLeadDragStart = (e, leadId, leadData) => {
    setDraggedLeadId(leadId);
    e.dataTransfer.setData('lead/id', leadId);
    if (leadData) {
      e.dataTransfer.setData('lead/data', JSON.stringify(leadData));
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const executeMoveLead = (leadId, targetStage, leadObj = null) => {
    const targetStageId = targetStage.id;
    const isReturningToUnvisited = targetStageId === 'stg_exp_1' || 
      (targetStage.title && (targetStage.title.toLowerCase().includes('a visitar') || targetStage.title.toLowerCase().includes('não visitado')));

    if (isExpansionFunnel) {
      const workshopId = leadObj?.radarWorkshopId || (String(leadId).startsWith('radar_lead_') ? Number(leadId.replace('radar_lead_', '')) : null);

      if (isReturningToUnvisited) {
        cancelAppointmentsForLead(leadId, workshopId, leadObj?.name || leadObj?.company || leadObj?.nome);
      }

      if (workshopId) {
        const newStatus = getWorkshopStatusToSave(targetStageId, targetStage.title);

        // Atualiza localmente entre as colunas do estado de expansão
        setExpansionStagesData(prev => {
          const next = { ...prev };
          let foundItem = leadObj;

          // Remove da coluna de origem
          Object.keys(next).forEach(stId => {
            if (stId !== targetStageId && next[stId]?.items) {
              const idx = next[stId].items.findIndex(it => it.id === leadId);
              if (idx !== -1) {
                foundItem = next[stId].items[idx];
                next[stId] = {
                  ...next[stId],
                  items: next[stId].items.filter(it => it.id !== leadId),
                  total: Math.max(0, (next[stId].total || 1) - 1)
                };
              }
            }
          });

          // Insere na coluna de destino
          if (foundItem) {
            const updatedItem = { ...foundItem, stage_id: targetStageId };
            const destItems = next[targetStageId]?.items || [];
            next[targetStageId] = {
              ...(next[targetStageId] || { page: 1, hasMore: false }),
              items: [updatedItem, ...destItems.filter(it => it.id !== leadId)],
              total: (next[targetStageId]?.total || 0) + 1
            };
          }

          return next;
        });

        // Persiste alteração localmente e no banco de dados Supabase
        saveOfflineWorkshopStatus(workshopId, { status: newStatus });
        try {
          crmApiFetch(`/crm/workshops/${workshopId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
          }).catch(() => {});
        } catch (_) {}
      }
    }

    if (onMoveLeadStage) {
      onMoveLeadStage(leadId, targetStageId, leadObj);
    }
  };

  const handleDropLead = async (e, targetStage) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData('lead/id') || draggedLeadId;
    const targetStageId = targetStage.id;

    if (!leadId || !targetStageId) {
      setDraggedLeadId(null);
      return;
    }

    const leadDataRaw = e.dataTransfer.getData('lead/data');
    let leadObj = null;
    if (leadDataRaw) {
      try { leadObj = JSON.parse(leadDataRaw); } catch (_) {}
    }

    if (!leadObj) {
      if (isExpansionFunnel) {
        Object.values(expansionStagesData).forEach(stg => {
          if (!leadObj && stg?.items) {
            const f = stg.items.find(it => it.id === leadId);
            if (f) leadObj = f;
          }
        });
      } else {
        leadObj = leads.find(l => l.id === leadId);
      }
    }

    // Se o estágio de destino for "Visita Agendada", abre modal interativo vinculado à Agenda
    const isScheduleStage = targetStageId === 'stg_exp_2' || (targetStage?.title || '').toLowerCase().includes('agendad');
    if (isScheduleStage) {
      setScheduledVisitState({
        isOpen: true,
        lead: leadObj || { id: leadId, name: 'Oficina DF' },
        leadId,
        targetStage,
        targetStageId
      });
      setDraggedLeadId(null);
      return;
    }

    executeMoveLead(leadId, targetStage, leadObj);
    setDraggedLeadId(null);
  };

  // Drag and Drop de Colunas (Reordenação como no Trello)
  const [draggedColumnIndex, setDraggedColumnIndex] = useState(null);

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

  // Zoom do Kanban
  const [zoomLevel, setZoomLevel] = useState(1);

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

  // Intercepta Ctrl + Scroll e atalhos Ctrl/Cmd + / - para controlar o Zoom exclusivo do Kanban
  useEffect(() => {
    const handleGlobalWheel = (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY < 0 ? 0.08 : -0.08;
        setZoomLevel(z => {
          const next = Number((z + delta).toFixed(2));
          return Math.max(0.55, Math.min(1.15, next));
        });
      }
    };

    const handleKeyDown = (e) => {
      if (!e.ctrlKey && !e.metaKey) return;

      // Atalho de Zoom In: Ctrl/Cmd e '+' ou '='
      if (e.key === '+' || e.key === '=' || e.code === 'NumpadAdd') {
        e.preventDefault();
        setZoomLevel(z => Math.min(1.15, Number((z + 0.10).toFixed(2))));
      } 
      // Atalho de Zoom Out: Ctrl/Cmd e '-' ou '_'
      else if (e.key === '-' || e.key === '_' || e.code === 'NumpadSubtract') {
        e.preventDefault();
        setZoomLevel(z => Math.max(0.55, Number((z - 0.10).toFixed(2))));
      } 
      // Atalho de Reset de Zoom: Ctrl/Cmd e '0'
      else if (e.key === '0' || e.code === 'Numpad0') {
        e.preventDefault();
        setZoomLevel(1);
      }
    };

    window.addEventListener('wheel', handleGlobalWheel, { passive: false });
    window.addEventListener('keydown', handleKeyDown, { passive: false });

    return () => {
      window.removeEventListener('wheel', handleGlobalWheel);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Rolagem horizontal com a roda do mouse quando fora de listas com overflow vertical
  useEffect(() => {
    const el = boardRef.current;
    if (!el) return;

    const handleWheel = (e) => {
      if (e.ctrlKey || e.metaKey) return; // Tratado pelo listener de zoom global

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

  const isBoardLoading = loading || isChangingFunnel;

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
            <span className="font-bold font-mono text-amber-500">
              {totalCardsCount.toLocaleString('pt-BR')}
            </span>
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
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar oportunidade, oficina ou telefone..."
              className={`w-full rounded-xl pl-9 pr-8 py-1.5 text-xs focus:outline-none border transition-colors ${
                isDark 
                  ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus:border-amber-400' 
                  : 'bg-slate-100 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-amber-500'
              }`}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-500 p-0.5 rounded-full cursor-pointer transition-colors"
                title="Limpar busca"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
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
              <option value="all">Todas as Regiões</option>
              {standardRas.map(ra => (
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
            const isWon = Boolean(stage.is_won);
            const isLost = Boolean(stage.is_lost);

            // Determina os leads da coluna de acordo com o modo (Expansão vs Padrão)
            let stageLeads = [];
            let stageTotalCount = 0;
            let hasMoreItems = false;
            let isStageLoading = isBoardLoading;

            if (isExpansionFunnel) {
              const expData = expansionStagesData[stage.id] || { items: [], total: 0, hasMore: false };
              stageLeads = expData.items || [];
              stageTotalCount = expData.total || stageLeads.length;
              hasMoreItems = Boolean(expData.hasMore);
              isStageLoading = isBoardLoading || Boolean(loadingExpansionStages[stage.id]);
            } else {
              const allStageLeads = standardLeadsByStage[stage.id] || [];
              const colFilter = (columnFilters[stage.id] || '').trim().toLowerCase();
              const cleanNum = colFilter.replace(/\D/g, '');

              const filtered = colFilter
                ? allStageLeads.filter(l => 
                    (l.name || '').toLowerCase().includes(colFilter) ||
                    (l.company || '').toLowerCase().includes(colFilter) ||
                    (cleanNum && (l.cnpj || '').replace(/\D/g, '').includes(cleanNum)) ||
                    (cleanNum && (l.phone || '').replace(/\D/g, '').includes(cleanNum)) ||
                    (l.address || '').toLowerCase().includes(colFilter) ||
                    (l.ra_df || '').toLowerCase().includes(colFilter) ||
                    (l.notes || '').toLowerCase().includes(colFilter)
                  )
                : allStageLeads;

              const limit = visibleCounts[stage.id] || 40;
              stageLeads = colFilter ? filtered : filtered.slice(0, limit);
              stageTotalCount = allStageLeads.length;
              hasMoreItems = !colFilter && filtered.length > stageLeads.length;
            }

            const stageTotalValue = stageLeads.reduce((acc, l) => acc + (parseFloat(l.estimated_value) || 0), 0);

            return (
              <div
                key={stage.id}
                onDragOver={handleDragOver}
                onDrop={(e) => {
                  if (e.dataTransfer.types.includes('column/index')) {
                    handleColumnDrop(e, index);
                  } else {
                    handleDropLead(e, stage);
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
                    }`} title={`${stageTotalCount} oportunidades no total nesta etapa`}>
                      {stageTotalCount.toLocaleString('pt-BR')}
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
                      onChange={(e) => handleColumnSearchChange(stage, e.target.value)}
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
                        onClick={() => handleColumnSearchChange(stage, '')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5 cursor-pointer"
                        title="Limpar filtro da coluna"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Stage Sub-total */}
                {stageTotalValue > 0 && (
                  <div className={`px-3.5 py-1.5 text-[10px] font-mono border-b shrink-0 flex items-center justify-between ${
                    isDark ? 'bg-slate-950/40 text-slate-400 border-slate-800/40' : 'bg-slate-50 text-slate-600 border-slate-100'
                  }`}>
                    <span>Valor na etapa:</span>
                    <strong className="text-amber-500 font-bold">
                      R$ {stageTotalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </strong>
                  </div>
                )}

                {/* Lead Cards List Virtualizado para manter 60fps independente do volume */}
                {(isStageLoading || isBoardLoading) ? (
                  <div className="kanban-card-list flex-1 min-h-0 overflow-y-auto p-3 space-y-2.5">
                    <KanbanCardSkeleton />
                    <KanbanCardSkeleton />
                    <KanbanCardSkeleton />
                  </div>
                ) : stageLeads.length === 0 ? (
                  <div className="p-3 flex-1 min-h-0 overflow-y-auto">
                    <div className="py-8 text-center text-slate-500 text-[11px] border border-dashed border-slate-800/40 rounded-xl">
                      Nenhuma oportunidade nesta etapa.
                    </div>
                  </div>
                ) : (
                  <VirtualizedCardList
                    leads={stageLeads}
                    isDark={isDark}
                    handleLeadDragStart={handleLeadDragStart}
                    onOpenLeadModal={onOpenLeadModal}
                    handleOpenWhatsApp={handleOpenWhatsApp}
                    handleOpenGoogleMaps={handleOpenGoogleMaps}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Zoom Controller no Rodapé */}
      <div 
        className={`fixed bottom-4 right-6 z-40 rounded-2xl border shadow-2xl flex items-center gap-1.5 p-1.5 backdrop-blur-md transition-all ${
          isDark ? 'bg-slate-900/90 border-slate-700 text-white shadow-black/50' : 'bg-white/95 border-slate-200 text-slate-900 shadow-slate-300/50'
        }`}
        title="Atalhos: Ctrl + Scroll do mouse ou Ctrl e + / -"
      >
        <button
          type="button"
          onClick={() => setZoomLevel(z => Math.max(0.55, Number((z - 0.10).toFixed(2))))}
          disabled={zoomLevel <= 0.55}
          className="p-1.5 rounded-xl hover:bg-slate-800/20 disabled:opacity-30 cursor-pointer transition"
          title="Diminuir Zoom (Ctrl e -)"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        <span className="text-xs font-mono font-bold px-1 min-w-[42px] text-center" title="Nível de Zoom do Kanban (Ctrl + Scroll)">
          {Math.round(zoomLevel * 100)}%
        </span>

        <button
          type="button"
          onClick={() => setZoomLevel(z => Math.min(1.15, Number((z + 0.10).toFixed(2))))}
          disabled={zoomLevel >= 1.15}
          className="p-1.5 rounded-xl hover:bg-slate-800/20 disabled:opacity-30 cursor-pointer transition"
          title="Aumentar Zoom (Ctrl e +)"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        {zoomLevel !== 1 && (
          <button
            type="button"
            onClick={() => setZoomLevel(1)}
            className="px-2 py-1 rounded-lg text-[10px] font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition cursor-pointer"
            title="Redefinir Zoom para 100% (Ctrl e 0)"
          >
            100%
          </button>
        )}
      </div>

      {/* Modal Interativo para Agendar Visita Comercial na Agenda */}
      <ScheduleVisitModal
        isOpen={scheduledVisitState.isOpen}
        lead={scheduledVisitState.lead}
        onClose={() => setScheduledVisitState({ isOpen: false, lead: null, leadId: null, targetStage: null, targetStageId: null })}
        onConfirmSchedule={(appointmentObj) => {
          if (scheduledVisitState.leadId && scheduledVisitState.targetStage) {
            executeMoveLead(scheduledVisitState.leadId, scheduledVisitState.targetStage, scheduledVisitState.lead);
          }
          setScheduledVisitState({ isOpen: false, lead: null, leadId: null, targetStage: null, targetStageId: null });
        }}
        onMoveWithoutSchedule={() => {
          if (scheduledVisitState.leadId && scheduledVisitState.targetStage) {
            executeMoveLead(scheduledVisitState.leadId, scheduledVisitState.targetStage, scheduledVisitState.lead);
          }
          setScheduledVisitState({ isOpen: false, lead: null, leadId: null, targetStage: null, targetStageId: null });
        }}
      />
    </div>
  );
}