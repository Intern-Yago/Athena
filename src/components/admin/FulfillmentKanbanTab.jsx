import React, { useState, useEffect, useMemo } from 'react';
import { 
  Truck, 
  Package, 
  CheckCircle2, 
  RefreshCw, 
  ShieldCheck, 
  X, 
  MapPin, 
  ClipboardList,
  Maximize2,
  GripVertical,
  LayoutGrid,
  List,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Globe,
  Building2
} from 'lucide-react';
import {
  decodeHtmlEntities,
  getMacroRegionByState,
  resolveOrderOrigin,
  matchesShipmentFilters
} from '../../utils/orderUtils';
import {
  ADMIN_CACHE_KEYS,
  getCachedAdminData,
  setCachedAdminData,
  invalidateAdminCache
} from '../../utils/adminDataCache';
import ShipmentDetailModal from './ShipmentDetailModal';
import FulfillmentFilterBar from './FulfillmentFilterBar';

const EMPTY_KANBAN = {
  pending: [],
  picking: [],
  ready: [],
  shipped: [],
  delivered: []
};

/**
 * FulfillmentKanbanTab
 *
 * Consola operacional da Mesa de Expedição & Logística (Athena OS).
 * Suporta visualização híbrida (Kanban Drag & Drop e Tabela Paginada),
 * cache Stale-While-Revalidate (zero tela vazia ao trocar de aba),
 * filtros transversais (Busca, Origem Site/Omie, Status, Volume de Itens, Região/UF)
 * e abertura direta de romaneio a partir da aba de Vendas & Pedidos.
 */
export default function FulfillmentKanbanTab({
  API_BASE_URL,
  currentUser,
  showNotification,
  focusedOrder = null,
  onClearFocusedOrder = null
}) {
  const initialCachedKanban = useMemo(
    () => getCachedAdminData(ADMIN_CACHE_KEYS.FULFILLMENT_KANBAN),
    []
  );

  const [kanban, setKanban] = useState(
    () => initialCachedKanban?.data || EMPTY_KANBAN
  );
  const [loading, setLoading] = useState(() => !initialCachedKanban);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // View Toggle: 'kanban' | 'table'
  const [viewMode, setViewMode] = useState('kanban');

  // Drag & Drop State
  const [draggedShipment, setDraggedShipment] = useState(null);
  const [draggedFromCol, setDraggedFromCol] = useState(null);
  const [dragOverCol, setDragOverCol] = useState(null);

  // Popup de Expansão Completa do Card
  const [expandedShipment, setExpandedShipment] = useState(null);

  // Filtros Compartilhados (Kanban + Tabela) e Paginação
  const [searchQuery, setSearchQuery] = useState('');
  const [originFilter, setOriginFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [itemsFilter, setItemsFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals operacionais de transição
  const [conferenceModalShipment, setConferenceModalShipment] = useState(null);
  const [conferenceNotes, setConferenceNotes] = useState('');
  const [conferenceCheckedItems, setConferenceCheckedItems] = useState({});

  const [dispatchModalShipment, setDispatchModalShipment] = useState(null);
  const [dispatchForm, setDispatchForm] = useState({
    carrier: 'Braspress',
    trackingCode: '',
    trackingUrl: ''
  });

  const [pickingListModal, setPickingListModal] = useState(null);

  const columns = useMemo(() => [
    { 
      key: 'pending', 
      label: 'Aguardando Separação', 
      shortLabel: 'Aguardando',
      color: 'border-amber-400 bg-amber-500/10 text-amber-800',
      dotColor: 'bg-amber-500'
    },
    { 
      key: 'picking', 
      label: 'Em Separação / Romaneio', 
      shortLabel: 'Em Separação',
      color: 'border-blue-400 bg-blue-500/10 text-blue-800',
      dotColor: 'bg-blue-500'
    },
    { 
      key: 'ready', 
      label: 'Conferido (Trava Liberada)', 
      shortLabel: 'Conferido',
      color: 'border-purple-400 bg-purple-500/10 text-purple-800',
      dotColor: 'bg-purple-600'
    },
    { 
      key: 'shipped', 
      label: 'Despachado / Em Trânsito', 
      shortLabel: 'Despachado',
      color: 'border-emerald-400 bg-emerald-500/10 text-emerald-800',
      dotColor: 'bg-emerald-500'
    },
    { 
      key: 'delivered', 
      label: 'Entregue', 
      shortLabel: 'Entregue',
      color: 'border-slate-300 bg-slate-100 text-slate-700',
      dotColor: 'bg-slate-500'
    }
  ], []);

  const columnMap = useMemo(() => {
    const map = {};
    columns.forEach(c => { map[c.key] = c; });
    return map;
  }, [columns]);

  const fetchKanban = async (syncWithOmie = false, { silent = false } = {}) => {
    if (!currentUser?.token) return;
    if (!silent && !getCachedAdminData(ADMIN_CACHE_KEYS.FULFILLMENT_KANBAN)) {
      setLoading(true);
    } else {
      setIsRefreshing(true);
    }
    try {
      const url = syncWithOmie 
        ? `${API_BASE_URL}/admin/fulfillment/kanban?sync=true` 
        : `${API_BASE_URL}/admin/fulfillment/kanban`;
      const res = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        const nextKanban = data.physical_kanban || EMPTY_KANBAN;
        setKanban(nextKanban);
        setCachedAdminData(ADMIN_CACHE_KEYS.FULFILLMENT_KANBAN, nextKanban);
        if (data.digital_activations) {
          setCachedAdminData(ADMIN_CACHE_KEYS.DIGITAL_ACTIVATIONS, data.digital_activations);
        }
        if (syncWithOmie) {
          invalidateAdminCache(ADMIN_CACHE_KEYS.ADMIN_ORDERS);
          showNotification?.('Kanban sincronizado com pedidos do Omie!', 'success');
        }
      } else if (!silent) {
        showNotification?.('Erro ao carregar Kanban de expedição.', 'error');
      }
    } catch (e) {
      console.error('Erro ao buscar Kanban:', e);
      if (!silent) {
        showNotification?.('Falha ao conectar com o servidor.', 'error');
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    const cached = getCachedAdminData(ADMIN_CACHE_KEYS.FULFILLMENT_KANBAN);
    if (cached) {
      setKanban(cached.data);
      setLoading(false);
      // Se o cache já está fresco (< 60s), não dispara requisição desnecessária ao trocar de aba
      if (cached.isFresh) return;
      // Se o cache tem mais de 60s, revalida silenciosamente em background sem esvaziar a tela
      fetchKanban(false, { silent: true });
    } else {
      fetchKanban(false);
    }
  }, [currentUser?.token]);

  // Enriquece todas as remessas com metadados de origem, região e contagens
  const enrichedByColumn = useMemo(() => {
    const map = {};
    columns.forEach(col => {
      map[col.key] = (kanban[col.key] || []).map(s => {
        const stateUf = (s.shipping_address?.state || '').trim().toUpperCase();
        return {
          ...s,
          _statusKey: col.key,
          _statusLabel: col.label,
          _statusShortLabel: col.shortLabel,
          _statusColor: col.color,
          _dotColor: col.dotColor,
          _stateUf: stateUf,
          _macroRegion: getMacroRegionByState(stateUf),
          _itemCount: (s.items || []).length,
          _origin: resolveOrderOrigin(s)
        };
      });
    });
    return map;
  }, [kanban, columns]);

  const allShipments = useMemo(() => {
    const list = [];
    columns.forEach(col => {
      list.push(...(enrichedByColumn[col.key] || []));
    });
    return list.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
  }, [enrichedByColumn, columns]);

  // Quando o usuário clica em "Expedição" lá na aba de Vendas & Pedidos, abre o popup da remessa correspondente automaticamente
  useEffect(() => {
    if (!focusedOrder || loading) return;

    const targetOrderId = String(focusedOrder.id || '');
    const targetOrderNum = String(focusedOrder.order_number || '');

    const matchedShipment = allShipments.find(
      s => String(s.order_id) === targetOrderId || String(s.order_number) === targetOrderNum
    );

    if (matchedShipment) {
      setExpandedShipment({
        ...matchedShipment,
        _resolvedStatus: matchedShipment._statusKey
      });
    } else {
      // Fallback caso o pedido ainda não tenha remessa física gerada no banco
      const fallbackStatus = focusedOrder.fulfillment_status === 'fulfilled' ? 'shipped' : 'pending';
      setExpandedShipment({
        id: focusedOrder.shipments?.[0]?.id || focusedOrder.id,
        order_id: focusedOrder.id,
        order_number: focusedOrder.order_number,
        shipment_number: focusedOrder.shipments?.[0]?.shipment_number || `PED-${focusedOrder.order_number || focusedOrder.id?.slice(0, 6)}`,
        customer_id: focusedOrder.customer_id,
        omie_pedido_id: focusedOrder.omie_pedido_id,
        customer_snapshot: focusedOrder.customer_snapshot,
        shipping_address: focusedOrder.shipping_address,
        items: focusedOrder.items || [],
        created_at: focusedOrder.created_at,
        _resolvedStatus: fallbackStatus,
        _origin: resolveOrderOrigin(focusedOrder)
      });
    }

    if (onClearFocusedOrder) {
      onClearFocusedOrder();
    }
  }, [focusedOrder, loading, allShipments]);

  const availableStates = useMemo(() => {
    const set = new Set();
    allShipments.forEach(s => {
      if (s._stateUf) set.add(s._stateUf);
    });
    return Array.from(set).sort();
  }, [allShipments]);

  const activeFiltersObj = useMemo(() => ({
    searchQuery,
    originFilter,
    statusFilter,
    itemsFilter,
    regionFilter
  }), [searchQuery, originFilter, statusFilter, itemsFilter, regionFilter]);

  const filteredShipments = useMemo(() => {
    return allShipments.filter(s => matchesShipmentFilters(s, activeFiltersObj));
  }, [allShipments, activeFiltersObj]);

  const kanbanCounts = useMemo(() => {
    const counts = {};
    columns.forEach(c => {
      counts[c.key] = (kanban[c.key] || []).length;
    });
    return counts;
  }, [kanban, columns]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, originFilter, statusFilter, itemsFilter, regionFilter, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filteredShipments.length / pageSize));
  const paginatedShipments = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredShipments.slice(start, start + pageSize);
  }, [filteredShipments, currentPage, pageSize]);

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    originFilter !== 'all' ||
    statusFilter !== 'all' ||
    itemsFilter !== 'all' ||
    regionFilter !== 'all';

  const clearAllFilters = () => {
    setSearchQuery('');
    setOriginFilter('all');
    setStatusFilter('all');
    setItemsFilter('all');
    setRegionFilter('all');
    setCurrentPage(1);
  };

  // Ação: Iniciar Picking / Romaneio
  const handleOpenPickingList = async (shipment) => {
    setActionLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/fulfillment/picking-list/${shipment.order_id}`, {
        headers: {
          'Authorization': `Bearer ${currentUser.token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setPickingListModal(data);
        invalidateAdminCache(ADMIN_CACHE_KEYS.ADMIN_ORDERS);
        fetchKanban(false, { silent: true });
      } else {
        showNotification?.('Erro ao abrir lista de separação.', 'error');
      }
    } catch (e) {
      showNotification?.('Erro de conexão.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Ação: Realizar Conferência Física com Trava
  const handleOpenConference = (shipment) => {
    setConferenceModalShipment(shipment);
    setConferenceNotes('Conferência 100% aprovada. SKU, números de série e integridade da embalagem validados.');
    const initialChecks = {};
    (shipment.items || []).forEach((it, idx) => {
      initialChecks[it.id || it.product_id || idx] = true;
    });
    setConferenceCheckedItems(initialChecks);
  };

  const handleConfirmConference = async () => {
    if (!conferenceModalShipment) return;
    setActionLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/fulfillment/conference`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.token}`
        },
        body: JSON.stringify({
          shipmentId: conferenceModalShipment.id,
          notes: conferenceNotes
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao realizar conferência.');
      showNotification?.('Conferência aprovada! Trava liberada para despacho.', 'success');
      setConferenceModalShipment(null);
      invalidateAdminCache(ADMIN_CACHE_KEYS.ADMIN_ORDERS);
      fetchKanban(false, { silent: true });
    } catch (e) {
      showNotification?.(e.message || 'Erro na conferência.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Ação: Despacho com Transportadora
  const handleOpenDispatch = (shipment) => {
    setDispatchModalShipment(shipment);
    setDispatchForm({
      carrier: shipment.carrier || 'Braspress',
      trackingCode: shipment.tracking_code || '',
      trackingUrl: shipment.tracking_url || ''
    });
  };

  const handleConfirmDispatch = async () => {
    if (!dispatchModalShipment || !dispatchForm.carrier.trim()) return;
    setActionLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/fulfillment/dispatch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.token}`
        },
        body: JSON.stringify({
          shipmentId: dispatchModalShipment.id,
          carrier: dispatchForm.carrier.trim(),
          trackingCode: dispatchForm.trackingCode.trim() || 'SEM_RASTREIO',
          trackingUrl: dispatchForm.trackingUrl.trim() || null
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao despachar remessa.');
      showNotification?.('Remessa despachada com sucesso!', 'success');
      setDispatchModalShipment(null);
      invalidateAdminCache(ADMIN_CACHE_KEYS.ADMIN_ORDERS);
      fetchKanban(false, { silent: true });
    } catch (e) {
      showNotification?.(e.message || 'Erro no despacho.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Ação: Confirmar Entrega
  const handleConfirmDelivered = async (shipment) => {
    if (!confirm(`Deseja confirmar a entrega da remessa #${shipment.order_number || shipment.shipment_number || shipment.id.slice(0, 8)}?`)) return;
    setActionLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/fulfillment/delivered`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.token}`
        },
        body: JSON.stringify({
          shipmentId: shipment.id,
          notes: 'Entrega confirmada pelo transportador / cliente.'
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao registrar entrega.');
      showNotification?.('Entrega registrada com sucesso!', 'success');
      invalidateAdminCache(ADMIN_CACHE_KEYS.ADMIN_ORDERS);
      fetchKanban(false, { silent: true });
    } catch (e) {
      showNotification?.(e.message || 'Erro ao confirmar entrega.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Movimentação direta via Drag and Drop no Kanban
  const handleDirectStatusTransition = async (shipment, fromCol, toCol) => {
    setKanban(prev => {
      const sourceList = (prev[fromCol] || []).filter(item => item.id !== shipment.id);
      const targetList = [{ ...shipment, status: toCol }, ...(prev[toCol] || [])];
      const next = {
        ...prev,
        [fromCol]: sourceList,
        [toCol]: targetList
      };
      setCachedAdminData(ADMIN_CACHE_KEYS.FULFILLMENT_KANBAN, next);
      return next;
    });

    try {
      const res = await fetch(`${API_BASE_URL}/admin/fulfillment/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.token}`
        },
        body: JSON.stringify({
          shipmentId: shipment.id,
          targetStatus: toCol
        })
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Não foi possível mover a remessa.');
      }
      const label = columnMap[toCol]?.shortLabel || toCol;
      showNotification?.(`Remessa #${shipment.order_number || shipment.id.slice(0, 6)} movida para "${label}".`, 'success');
      invalidateAdminCache(ADMIN_CACHE_KEYS.ADMIN_ORDERS);
      fetchKanban(false, { silent: true });
    } catch (e) {
      showNotification?.(e.message || 'Erro ao mover remessa.', 'error');
      fetchKanban(false, { silent: true });
    }
  };

  const handleDragStart = (e, shipment, colKey) => {
    setDraggedShipment(shipment);
    setDraggedFromCol(colKey);
    e.dataTransfer.effectAllowed = 'move';
    try {
      e.dataTransfer.setData('text/plain', shipment.id);
    } catch {}
  };

  const handleDragEnd = () => {
    setDraggedShipment(null);
    setDraggedFromCol(null);
    setDragOverCol(null);
  };

  const handleDragOverColumn = (e, colKey) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverCol !== colKey) {
      setDragOverCol(colKey);
    }
  };

  const handleDropOnColumn = (e, targetColKey) => {
    e.preventDefault();
    const shipment = draggedShipment;
    const sourceColKey = draggedFromCol;
    setDraggedShipment(null);
    setDraggedFromCol(null);
    setDragOverCol(null);

    if (!shipment || !sourceColKey || sourceColKey === targetColKey) return;

    if (targetColKey === 'pending' || targetColKey === 'picking') {
      handleDirectStatusTransition(shipment, sourceColKey, targetColKey);
      return;
    }

    if (targetColKey === 'ready') {
      handleOpenConference(shipment);
      return;
    }

    if (targetColKey === 'shipped') {
      if (sourceColKey !== 'ready' && !shipment.checked_by) {
        showNotification?.('Trava de Segurança: Confirme a conferência física antes de despachar.', 'warning');
        handleOpenConference(shipment);
        return;
      }
      handleOpenDispatch(shipment);
      return;
    }

    if (targetColKey === 'delivered') {
      handleConfirmDelivered(shipment);
    }
  };

  const openExpandPopup = (shipment, statusKey = null) => {
    setExpandedShipment({
      ...shipment,
      _resolvedStatus: statusKey || shipment._statusKey || shipment.status || 'pending'
    });
  };

  return (
    <div className="space-y-4">
      {/* HEADER + VIEW TOGGLE + SYNC */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center shrink-0 shadow-xs">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  Mesa de Expedição & Logística
                </h2>
                <span className="text-[11px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200">
                  {allShipments.length} {allShipments.length === 1 ? 'remessa' : 'remessas'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Pipeline de separação, conferência com trava física de segurança e despacho com transportadoras.
              </p>
            </div>
          </div>

          {/* Segmented View Toggle (Kanban | Tabela) */}
          <div 
            className="inline-flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/90 self-start sm:self-center shrink-0"
            role="group"
            aria-label="Alternar visualização da expedição"
          >
            <button
              type="button"
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                viewMode === 'kanban'
                  ? 'bg-slate-900 text-amber-400 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-slate-900 text-amber-400 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Tabela</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start lg:self-auto">
          <button
            onClick={() => fetchKanban(true)}
            disabled={loading || isRefreshing}
            className="btn-secondary text-xs font-bold py-2 px-3.5 flex items-center gap-2 cursor-pointer"
            title="Sincroniza pedidos e remessas em tempo real com o Omie ERP"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${(loading || isRefreshing) ? 'animate-spin text-amber-600' : 'text-slate-600'}`} />
            <span>{isRefreshing ? 'Sincronizando...' : 'Atualizar Kanban'}</span>
          </button>
        </div>
      </div>

      {/* BARRA UNIFICADA DE FILTROS E BUSCA (Funciona tanto no Kanban quanto na Tabela!) */}
      <FulfillmentFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        originFilter={originFilter}
        onOriginChange={setOriginFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        itemsFilter={itemsFilter}
        onItemsChange={setItemsFilter}
        regionFilter={regionFilter}
        onRegionChange={setRegionFilter}
        columns={columns}
        kanbanCounts={kanbanCounts}
        availableStates={availableStates}
        totalCount={allShipments.length}
        filteredCount={filteredShipments.length}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearAllFilters}
      />

      {/* =====================================================================
          MODO 1: KANBAN COM DRAG & DROP E CARDS COMPACTOS (3 LINHAS + EXPANDIR)
         ===================================================================== */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5 items-start">
          {columns.map(col => {
            const rawColShipments = enrichedByColumn[col.key] || [];
            const colShipments = rawColShipments.filter(s => matchesShipmentFilters(s, activeFiltersObj));
            const isDropTarget = dragOverCol === col.key && draggedFromCol !== col.key;

            return (
              <div 
                key={col.key}
                onDragOver={(e) => handleDragOverColumn(e, col.key)}
                onDragLeave={() => {
                  if (dragOverCol === col.key) setDragOverCol(null);
                }}
                onDrop={(e) => handleDropOnColumn(e, col.key)}
                className={`rounded-2xl border p-3 space-y-3 min-h-[420px] flex flex-col transition-all ${
                  isDropTarget
                    ? 'bg-amber-50/70 border-amber-400 ring-2 ring-amber-400/50 shadow-md'
                    : 'bg-slate-50/80 border-slate-200/90'
                }`}
              >
                {/* COLUMN HEADER */}
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/90">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${col.dotColor}`} />
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-800 truncate">
                      {col.label}
                    </span>
                  </div>
                  <span className={`text-[10px] font-mono font-black px-2 py-0.5 rounded-full border shrink-0 ${col.color}`}>
                    {hasActiveFilters && colShipments.length !== rawColShipments.length
                      ? `${colShipments.length}/${rawColShipments.length}`
                      : colShipments.length}
                  </span>
                </div>

                {/* DROP INDICATOR BANNER */}
                {isDropTarget && (
                  <div className="p-2.5 rounded-xl border-2 border-dashed border-amber-400 bg-amber-100/50 text-amber-900 text-[11px] font-extrabold text-center animate-pulse">
                    Soltar para mover para {col.shortLabel}
                  </div>
                )}

                {/* SHIPMENT CARDS */}
                <div className="space-y-2.5 flex-1">
                  {colShipments.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 text-[11px] font-medium border border-dashed border-slate-200 rounded-xl">
                      {hasActiveFilters && rawColShipments.length > 0
                        ? 'Oculto pelos filtros'
                        : 'Nenhuma remessa'}
                    </div>
                  ) : (
                    colShipments.map(s => {
                      const isDraggingThis = draggedShipment?.id === s.id;
                      const origin = s._origin;
                      const formattedItemsText = (s.items || [])
                        .map(i => {
                          const qty = Number(i.quantity) > 1 ? `${i.quantity}x ` : '';
                          return `${qty}${decodeHtmlEntities(i.name)}`;
                        })
                        .join(', ') || 'Equipamentos físicos';

                      return (
                        <div 
                          key={s.id}
                          draggable={!actionLoading}
                          onDragStart={(e) => handleDragStart(e, s, col.key)}
                          onDragEnd={handleDragEnd}
                          className={`group bg-white rounded-xl border p-3 shadow-2xs space-y-2.5 transition-all select-none ${
                            isDraggingThis
                              ? 'opacity-40 scale-[0.98] border-amber-400 ring-2 ring-amber-400'
                              : 'border-slate-200/90 hover:border-amber-400/90 hover:shadow-sm'
                          } ${!actionLoading ? 'cursor-grab active:cursor-grabbing' : ''}`}
                        >
                          {/* Top Bar: Grip + Order ID + Origin Pill + Expand Icon */}
                          <div className="flex items-center justify-between gap-1.5">
                            <div className="flex items-center gap-1 min-w-0">
                              <GripVertical className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 shrink-0 -ml-1 transition-colors" />
                              <span className="font-mono font-black text-xs text-slate-900 truncate">
                                #{s.order_number || s.order_id.slice(0, 6)}
                              </span>
                              <span
                                className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded border shrink-0 ${origin.badgeClass}`}
                                title={origin.label}
                              >
                                {origin.originKey === 'site' ? 'Site' : 'Omie'}
                              </span>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <span className="text-[9px] font-mono text-slate-400">
                                {new Date(s.created_at || Date.now()).toLocaleDateString('pt-BR')}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openExpandPopup(s, col.key);
                                }}
                                className="w-6 h-6 rounded-lg bg-slate-100/80 hover:bg-slate-900 text-slate-500 hover:text-amber-400 flex items-center justify-center transition-all cursor-pointer border border-slate-200/70 hover:border-slate-900"
                                title="Expandir detalhes e lista completa de itens"
                              >
                                <Maximize2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          {/* Customer & Destination */}
                          <div className="space-y-0.5 text-[11px]">
                            <p className="font-bold text-slate-800 truncate" title={s.customer_snapshot?.name || 'Cliente'}>
                              {s.customer_snapshot?.name || 'Cliente'}
                            </p>
                            {s.shipping_address?.city && (
                              <p className="text-[10px] text-slate-500 flex items-center gap-1 truncate">
                                <MapPin className="w-2.5 h-2.5 text-amber-600 shrink-0" />
                                <span>{s.shipping_address.city}/{s.shipping_address.state}</span>
                              </p>
                            )}
                          </div>

                          {/* Items to pick: Clamped to strictly 3 lines with ellipsis */}
                          <div 
                            onClick={() => openExpandPopup(s, col.key)}
                            className="text-[10px] text-slate-600 bg-slate-50/90 hover:bg-slate-100/80 p-2 rounded-lg border border-slate-100 transition-colors cursor-pointer"
                            title="Clique para ver todos os itens no popup"
                          >
                            <div className="line-clamp-3 overflow-hidden text-ellipsis leading-relaxed">
                              <strong className="text-slate-900 font-extrabold">
                                {(s.items || []).length} item(ns):
                              </strong>{' '}
                              {formattedItemsText}
                            </div>
                          </div>

                          {/* ACTIONS PER STATUS */}
                          <div className="pt-1 border-t border-slate-100 flex items-center justify-between gap-1.5">
                            {col.key === 'pending' && (
                              <button
                                type="button"
                                onClick={() => handleOpenPickingList(s)}
                                disabled={actionLoading}
                                className="w-full btn-gold text-[10px] font-bold py-1.5 px-2 flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <ClipboardList className="w-3 h-3" />
                                <span>Iniciar Separação</span>
                              </button>
                            )}

                            {col.key === 'picking' && (
                              <button
                                type="button"
                                onClick={() => handleOpenConference(s)}
                                disabled={actionLoading}
                                className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-[10px] font-bold py-1.5 px-2 flex items-center justify-center gap-1 cursor-pointer transition-colors"
                              >
                                <ShieldCheck className="w-3 h-3" />
                                <span>Conferir (Trava)</span>
                              </button>
                            )}

                            {col.key === 'ready' && (
                              <button
                                type="button"
                                onClick={() => handleOpenDispatch(s)}
                                disabled={actionLoading}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold py-1.5 px-2 flex items-center justify-center gap-1 cursor-pointer transition-colors"
                              >
                                <Truck className="w-3 h-3" />
                                <span>Despachar</span>
                              </button>
                            )}

                            {col.key === 'shipped' && (
                              <div className="w-full space-y-1">
                                <div className="text-[9px] text-slate-500 font-mono flex justify-between truncate">
                                  <span className="truncate">{s.carrier || 'Transportadora'}</span>
                                  <strong className="text-slate-800 shrink-0">{s.tracking_code}</strong>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleConfirmDelivered(s)}
                                  disabled={actionLoading}
                                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-[10px] font-bold py-1 px-2 flex items-center justify-center gap-1 cursor-pointer transition-colors"
                                >
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  <span>Marcar Entregue</span>
                                </button>
                              </div>
                            )}

                            {col.key === 'delivered' && (
                              <div className="w-full flex items-center justify-center gap-1 text-[10px] font-bold text-emerald-700">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Concluído</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* =====================================================================
          MODO 2: TABELA OPERACIONAL COM FILTROS E PAGINAÇÃO
         ===================================================================== */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/90 border-b border-slate-200 text-[11px] font-black uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4">Pedido / Origem</th>
                  <th className="py-3.5 px-4">Cliente</th>
                  <th className="py-3.5 px-4">Região / Destino</th>
                  <th className="py-3.5 px-4">Itens da Remessa</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {paginatedShipments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 px-4 text-center text-slate-500">
                      <div className="max-w-xs mx-auto space-y-2">
                        <Package className="w-8 h-8 text-slate-300 mx-auto" />
                        <p className="font-bold text-slate-700">Nenhuma remessa encontrada</p>
                        <p className="text-[11px] text-slate-400">
                          Ajuste os filtros de origem, status, itens, região ou termo pesquisado.
                        </p>
                        {hasActiveFilters && (
                          <button
                            type="button"
                            onClick={clearAllFilters}
                            className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-amber-700 hover:text-amber-900 cursor-pointer"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Resetar filtros</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedShipments.map(s => {
                    const origin = s._origin;
                    const itemsSummary = (s.items || [])
                      .map(i => `${Number(i.quantity) > 1 ? `${i.quantity}x ` : ''}${decodeHtmlEntities(i.name)}`)
                      .join(', ') || 'Equipamentos físicos';

                    return (
                      <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* Pedido / Origem / Data */}
                        <td className="py-3.5 px-4 align-top whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-black text-slate-900 text-xs">
                              #{s.order_number || s.order_id.slice(0, 6)}
                            </span>
                            <span className={`inline-flex items-center gap-1 text-[9px] font-black px-1.5 py-0.5 rounded border ${origin.badgeClass}`}>
                              {origin.originKey === 'site' ? <Globe className="w-2.5 h-2.5" /> : <Building2 className="w-2.5 h-2.5" />}
                              <span>{origin.shortLabel}</span>
                            </span>
                          </div>
                          <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                            {new Date(s.created_at || Date.now()).toLocaleDateString('pt-BR')}
                            {origin.originKey === 'site' && origin.isSyncedWithOmie && (
                              <span className="ml-1.5 text-emerald-700 font-bold">• Sinc. Omie</span>
                            )}
                          </div>
                        </td>

                        {/* Cliente */}
                        <td className="py-3.5 px-4 align-top max-w-[200px]">
                          <div className="font-bold text-slate-900 truncate" title={s.customer_snapshot?.name}>
                            {s.customer_snapshot?.name || 'Cliente'}
                          </div>
                          {s.customer_snapshot?.document && (
                            <div className="text-[10px] font-mono text-slate-400 truncate">
                              Doc: {s.customer_snapshot.document}
                            </div>
                          )}
                        </td>

                        {/* Região / Destino */}
                        <td className="py-3.5 px-4 align-top whitespace-nowrap">
                          {s.shipping_address?.city ? (
                            <div>
                              <div className="font-bold text-slate-800 flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-amber-600 shrink-0" />
                                <span>{s.shipping_address.city}/{s._stateUf}</span>
                              </div>
                              <span className="text-[10px] text-slate-400 font-medium">
                                {s._macroRegion}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-[11px]">Não informado</span>
                          )}
                        </td>

                        {/* Itens da Remessa (Clamped + Botão Expandir) */}
                        <td className="py-3.5 px-4 align-top max-w-md">
                          <div className="flex items-start justify-between gap-2">
                            <div 
                              onClick={() => openExpandPopup(s, s._statusKey)}
                              className="line-clamp-2 text-[11px] text-slate-600 leading-relaxed cursor-pointer hover:text-slate-900"
                              title="Clique para abrir lista completa de itens"
                            >
                              <span className="font-mono font-extrabold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded mr-1.5 border border-slate-200">
                                {s._itemCount} {s._itemCount === 1 ? 'item' : 'itens'}
                              </span>
                              {itemsSummary}
                            </div>
                            <button
                              type="button"
                              onClick={() => openExpandPopup(s, s._statusKey)}
                              className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-900 text-slate-500 hover:text-amber-400 flex items-center justify-center shrink-0 transition-colors cursor-pointer border border-slate-200/80"
                              title="Expandir romaneio completo"
                            >
                              <Maximize2 className="w-3 h-3" />
                            </button>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4 align-top whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1 rounded-full border ${s._statusColor}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${s._dotColor}`} />
                            {s._statusShortLabel}
                          </span>
                          {s.tracking_code && (
                            <div className="text-[10px] font-mono text-slate-500 mt-1">
                              {s.carrier}: <strong className="text-slate-800">{s.tracking_code}</strong>
                            </div>
                          )}
                        </td>

                        {/* Ações */}
                        <td className="py-3.5 px-4 align-top text-right whitespace-nowrap">
                          <div className="inline-flex items-center justify-end gap-1.5">
                            {s._statusKey === 'pending' && (
                              <button
                                type="button"
                                onClick={() => handleOpenPickingList(s)}
                                disabled={actionLoading}
                                className="btn-gold text-[11px] font-bold py-1.5 px-3 rounded-lg inline-flex items-center gap-1 cursor-pointer"
                              >
                                <ClipboardList className="w-3.5 h-3.5" />
                                <span>Separar</span>
                              </button>
                            )}

                            {s._statusKey === 'picking' && (
                              <button
                                type="button"
                                onClick={() => handleOpenConference(s)}
                                disabled={actionLoading}
                                className="bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-bold py-1.5 px-3 rounded-lg inline-flex items-center gap-1 cursor-pointer transition-colors"
                              >
                                <ShieldCheck className="w-3.5 h-3.5" />
                                <span>Conferir</span>
                              </button>
                            )}

                            {s._statusKey === 'ready' && (
                              <button
                                type="button"
                                onClick={() => handleOpenDispatch(s)}
                                disabled={actionLoading}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold py-1.5 px-3 rounded-lg inline-flex items-center gap-1 cursor-pointer transition-colors"
                              >
                                <Truck className="w-3.5 h-3.5" />
                                <span>Despachar</span>
                              </button>
                            )}

                            {s._statusKey === 'shipped' && (
                              <button
                                type="button"
                                onClick={() => handleConfirmDelivered(s)}
                                disabled={actionLoading}
                                className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold py-1.5 px-3 rounded-lg inline-flex items-center gap-1 cursor-pointer transition-colors border border-slate-200"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Entregue</span>
                              </button>
                            )}

                            {s._statusKey === 'delivered' && (
                              <span className="text-[11px] font-bold text-emerald-700 inline-flex items-center gap-1 px-2">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Concluído</span>
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION FOOTER */}
          {filteredShipments.length > 0 && (
            <div className="bg-slate-50/80 px-4 py-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3 text-slate-600">
                <span>
                  Mostrando <strong className="font-mono text-slate-900">{(currentPage - 1) * pageSize + 1}</strong>–
                  <strong className="font-mono text-slate-900">{Math.min(currentPage * pageSize, filteredShipments.length)}</strong> de{' '}
                  <strong className="font-mono text-slate-900">{filteredShipments.length}</strong>
                </span>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-[11px] font-bold text-slate-700 cursor-pointer"
                >
                  <option value={10}>10 por página</option>
                  <option value={25}>25 por página</option>
                  <option value={50}>50 por página</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Anterior</span>
                </button>

                <span className="px-3 py-1.5 font-mono font-bold text-slate-700">
                  Página {currentPage} de {totalPages}
                </span>

                <button
                  type="button"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <span>Próxima</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* POPUP MODULAR DE EXPANSÃO DO CARD / REMESSA */}
      <ShipmentDetailModal
        shipment={expandedShipment}
        columnMap={columnMap}
        onClose={() => setExpandedShipment(null)}
        onStartPicking={handleOpenPickingList}
        onOpenConference={handleOpenConference}
        onOpenDispatch={handleOpenDispatch}
        onConfirmDelivered={handleConfirmDelivered}
      />

      {/* MODAL 1: CONFERÊNCIA FÍSICA OBRIGATÓRIA (TRAVA DE SEGURANÇA) */}
      {conferenceModalShipment && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overscroll-none animate-in fade-in">
          <div 
            className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full max-h-[88vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-purple-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base">
                    Conferência Física Obrigatória
                  </h3>
                  <p className="text-[11px] text-purple-200">
                    Trava de Segurança: A remessa só poderá ser despachada após esta validação.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setConferenceModalShipment(null)}
                className="w-8 h-8 rounded-full bg-purple-800 hover:bg-purple-700 flex items-center justify-center text-purple-300 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs text-slate-700 overflow-y-auto flex-1">
              <div className="bg-purple-50 p-3 rounded-xl border border-purple-200/80 space-y-1">
                <span className="font-bold text-purple-900">Checklist do Conferente:</span>
                <p className="text-[11px] text-purple-800">
                  Certifique-se de conferir cada item, etiquetas de advertência, manuais e acessórios antes de liberar o despacho.
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase text-slate-400">
                  Itens a Inspecionar ({(conferenceModalShipment.items || []).length}):
                </span>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {(conferenceModalShipment.items || []).map((it, idx) => {
                    const key = it.id || it.product_id || idx;
                    return (
                      <label 
                        key={key}
                        className="p-3 rounded-xl border border-slate-200 flex items-center justify-between gap-3 bg-slate-50 cursor-pointer"
                      >
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-900 block">{decodeHtmlEntities(it.name)}</span>
                          <span className="text-[10px] text-slate-500">Qtd: {it.quantity || 1} unidade(s)</span>
                        </div>
                        <input 
                          type="checkbox"
                          checked={!!conferenceCheckedItems[key]}
                          onChange={(e) => {
                            setConferenceCheckedItems({
                              ...conferenceCheckedItems,
                              [key]: e.target.checked
                            });
                          }}
                          className="rounded text-amber-500 focus:ring-amber-500 w-4 h-4 cursor-pointer shrink-0"
                        />
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Observações da Inspeção *
                </label>
                <textarea
                  rows={2}
                  value={conferenceNotes}
                  onChange={(e) => setConferenceNotes(e.target.value)}
                  className="form-input text-xs"
                  required
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setConferenceModalShipment(null)}
                className="btn-secondary text-xs cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmConference}
                disabled={actionLoading}
                className="btn-gold text-xs font-bold py-2 px-4 cursor-pointer flex items-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{actionLoading ? 'Gravando...' : 'Aprovar e Liberar Despacho'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: DESPACHO DA REMESSA (TRANSPORTADORA & RASTREIO) */}
      {dispatchModalShipment && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overscroll-none animate-in fade-in">
          <div 
            className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base">
                    Despachar Remessa #{dispatchModalShipment.order_number || dispatchModalShipment.shipment_number || dispatchModalShipment.id.slice(0, 8)}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Insira os dados da transportadora e código de rastreamento.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDispatchModalShipment(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3.5 text-xs text-slate-700">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Transportadora / Modal de Envio *
                </label>
                <input
                  type="text"
                  placeholder="Ex: Braspress, Jadlog, Correios (Sedex), Frota Própria"
                  value={dispatchForm.carrier}
                  onChange={(e) => setDispatchForm({ ...dispatchForm, carrier: e.target.value })}
                  className="form-input text-xs"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Código de Rastreamento *
                </label>
                <input
                  type="text"
                  placeholder="Ex: BP123456789BR ou QB998877BR"
                  value={dispatchForm.trackingCode}
                  onChange={(e) => setDispatchForm({ ...dispatchForm, trackingCode: e.target.value })}
                  className="form-input text-xs font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Link Direto de Rastreamento (Opcional)
                </label>
                <input
                  type="url"
                  placeholder="https://rastreamento.braspress.com.br/..."
                  value={dispatchForm.trackingUrl}
                  onChange={(e) => setDispatchForm({ ...dispatchForm, trackingUrl: e.target.value })}
                  className="form-input text-xs"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDispatchModalShipment(null)}
                className="btn-secondary text-xs cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDispatch}
                disabled={actionLoading || !dispatchForm.carrier.trim()}
                className="btn-gold text-xs font-bold py-2 px-4 cursor-pointer flex items-center gap-1.5"
              >
                <Truck className="w-4 h-4" />
                <span>{actionLoading ? 'Registrando...' : 'Confirmar Despacho'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: ROMANEIO DE SEPARAÇÃO (PICKING LIST) */}
      {pickingListModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overscroll-none animate-in fade-in">
          <div 
            className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full max-h-[88vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300">
                  <ClipboardList className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base">
                    Romaneio de Separação #{pickingListModal.order_number}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Itens físicos enviados para o operador de picking no estoque.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPickingListModal(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs text-slate-700 overflow-y-auto flex-1">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <p className="font-bold text-slate-900">Destino da Encomenda:</p>
                <p className="text-slate-600">
                  {pickingListModal.customer?.name} ({pickingListModal.customer?.companyName || 'Pessoa Física'})
                </p>
                {pickingListModal.shipping_address?.street && (
                  <p className="text-[11px] text-slate-500">
                    {pickingListModal.shipping_address.street}, {pickingListModal.shipping_address.number} - {pickingListModal.shipping_address.city}/{pickingListModal.shipping_address.state}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase text-slate-400">Equipamentos a Retirar:</span>
                <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                  {(pickingListModal.physical_items_to_pick || []).map((it, idx) => (
                    <div key={idx} className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-2">
                      <span className="font-bold text-slate-900">{decodeHtmlEntities(it.name)}</span>
                      <span className="font-mono font-bold bg-amber-50 text-amber-800 px-2 py-0.5 rounded border border-amber-200 shrink-0">
                        {it.quantity} un
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setPickingListModal(null)}
                className="btn-gold text-xs py-2 px-4 cursor-pointer"
              >
                Fechar e Iniciar Separação
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
