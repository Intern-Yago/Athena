import React, { useState, useEffect, useMemo } from 'react';
import { 
  Receipt, 
  Search, 
  Eye, 
  X, 
  User, 
  MapPin, 
  Package, 
  Truck, 
  Zap, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  DollarSign, 
  Coins, 
  RefreshCw, 
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Globe,
  Building2
} from 'lucide-react';
import { decodeHtmlEntities, resolveOrderOrigin } from '../../utils/orderUtils';
import {
  ADMIN_CACHE_KEYS,
  getCachedAdminData,
  setCachedAdminData
} from '../../utils/adminDataCache';

const DEFAULT_METRICS = {
  total_orders: 0,
  total_revenue: 0,
  paid_orders: 0,
  pending_orders: 0,
  cancelled_orders: 0,
  redemption_orders: 0
};

/**
 * OrdersManagementTab
 *
 * Painel de Vendas & Pedidos Comerciais (Athena OS).
 * Inclui cache Stale-While-Revalidate (zero tela vazia ao trocar de aba),
 * identificação e filtro de origem (Site Athena vs Omie ERP sem duplicidade),
 * paginação estruturada e atalho direto para abrir a etapa de expedição da compra
 * já com o popup de romaneio aberto na Mesa de Expedição.
 */
export default function OrdersManagementTab({
  API_BASE_URL,
  currentUser,
  showNotification,
  onOpenOrderInFulfillment
}) {
  const initialCachedOrders = useMemo(
    () => getCachedAdminData(ADMIN_CACHE_KEYS.ADMIN_ORDERS),
    []
  );

  const [orders, setOrders] = useState(
    () => initialCachedOrders?.data?.orders || []
  );
  const [metrics, setMetrics] = useState(
    () => initialCachedOrders?.data?.metrics || DEFAULT_METRICS
  );
  const [loading, setLoading] = useState(() => !initialCachedOrders);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filtros e Paginação
  const [searchTerm, setSearchTerm] = useState('');
  const [originFilter, setOriginFilter] = useState('all'); // all, site, omie
  const [statusFilter, setStatusFilter] = useState('all'); // all, paid, pending, cancelled
  const [typeFilter, setTypeFilter] = useState('all'); // all, sale, points_redemption
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [copiedKey, setCopiedKey] = useState(false);

  const fetchOrders = async ({ silent = false } = {}) => {
    if (!currentUser?.token) return;
    if (!silent && !getCachedAdminData(ADMIN_CACHE_KEYS.ADMIN_ORDERS)) {
      setLoading(true);
    } else {
      setIsRefreshing(true);
    }
    try {
      const res = await fetch(`${API_BASE_URL}/admin/orders`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        const nextOrders = data.orders || [];
        const nextMetrics = data.metrics || DEFAULT_METRICS;
        setOrders(nextOrders);
        setMetrics(nextMetrics);
        setCachedAdminData(ADMIN_CACHE_KEYS.ADMIN_ORDERS, {
          orders: nextOrders,
          metrics: nextMetrics
        });
      } else if (!silent) {
        showNotification?.('Erro ao carregar lista de pedidos.', 'error');
      }
    } catch (e) {
      console.error('Erro ao buscar pedidos:', e);
      if (!silent) {
        showNotification?.('Falha de conexão com o servidor.', 'error');
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    const cached = getCachedAdminData(ADMIN_CACHE_KEYS.ADMIN_ORDERS);
    if (cached) {
      setOrders(cached.data?.orders || []);
      if (cached.data?.metrics) setMetrics(cached.data.metrics);
      setLoading(false);
      if (cached.isFresh) return;
      fetchOrders({ silent: true });
    } else {
      fetchOrders();
    }
  }, [currentUser?.token]);

  // Enriquece cada pedido com sua origem canônica (Site vs Omie ERP)
  const enrichedOrders = useMemo(() => {
    return orders.map(order => ({
      ...order,
      _origin: resolveOrderOrigin(order)
    }));
  }, [orders]);

  const originCounts = useMemo(() => {
    let site = 0;
    let omie = 0;
    enrichedOrders.forEach(o => {
      if (o._origin.originKey === 'site') site++;
      else omie++;
    });
    return { site, omie };
  }, [enrichedOrders]);

  const filteredOrders = useMemo(() => {
    return enrichedOrders.filter(order => {
      // Origin filter (Site vs Omie)
      if (originFilter !== 'all' && order._origin.originKey !== originFilter) return false;

      // Status filter
      if (statusFilter === 'paid' && order.payment_status !== 'paid' && order.payment_status !== 'free') return false;
      if (statusFilter === 'pending' && order.payment_status !== 'pending') return false;
      if (statusFilter === 'cancelled' && order.payment_status !== 'cancelled') return false;

      // Type filter
      if (typeFilter === 'sale' && order.order_type !== 'sale') return false;
      if (typeFilter === 'points_redemption' && order.order_type !== 'points_redemption') return false;

      // Search term
      if (searchTerm.trim()) {
        const term = searchTerm.trim().toLowerCase();
        const num = `#${order.order_number || order.id || ''}`.toLowerCase();
        const name = String(order.customer_snapshot?.name || order.user_name || '').toLowerCase();
        const email = String(order.customer_snapshot?.email || order.user_email || '').toLowerCase();
        const doc = String(order.customer_snapshot?.document || '').toLowerCase();
        return num.includes(term) || name.includes(term) || email.includes(term) || doc.includes(term);
      }

      return true;
    });
  }, [enrichedOrders, originFilter, statusFilter, typeFilter, searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, originFilter, statusFilter, typeFilter, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredOrders.slice(start, start + pageSize);
  }, [filteredOrders, currentPage, pageSize]);

  const hasActiveFilters =
    searchTerm.trim() !== '' ||
    originFilter !== 'all' ||
    statusFilter !== 'all' ||
    typeFilter !== 'all';

  const clearFilters = () => {
    setSearchTerm('');
    setOriginFilter('all');
    setStatusFilter('all');
    setTypeFilter('all');
    setCurrentPage(1);
  };

  const handleCopyText = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* HEADER & REFRESH */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Receipt className="w-5 h-5 text-amber-500" />
            <span>Vendas & Pedidos da Loja</span>
          </h2>
          <p className="text-xs text-slate-500">
            Acompanhe pedidos do Site Athena e faturamentos do Omie ERP com conciliação anti-duplicidade.
          </p>
        </div>
        <button
          onClick={() => fetchOrders({ silent: false })}
          disabled={loading || isRefreshing}
          className="btn-secondary text-xs flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${(loading || isRefreshing) ? 'animate-spin' : ''}`} />
          <span>{isRefreshing ? 'Atualizando...' : 'Atualizar Pedidos'}</span>
        </button>
      </div>

      {/* METRICS CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Faturamento Total</span>
          <span className="text-lg font-black text-slate-900 font-mono">
            R$ {Number(metrics.total_revenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[10px] text-emerald-600 font-bold block">{metrics.paid_orders} pedido(s) pagos</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total de Pedidos</span>
          <span className="text-lg font-black text-slate-900 font-mono">{enrichedOrders.length}</span>
          <span className="text-[10px] text-slate-500 font-bold block">
            {originCounts.site} Site • {originCounts.omie} Omie
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-200/80 bg-amber-50/20 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">Aguardando Pagamento</span>
          <span className="text-lg font-black text-amber-900 font-mono">{metrics.pending_orders}</span>
          <span className="text-[10px] text-amber-600 font-bold block">Boletos / PIX pendentes</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-purple-200/80 bg-purple-50/20 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block">Resgates A-Points</span>
          <span className="text-lg font-black text-purple-900 font-mono">{metrics.redemption_orders}</span>
          <span className="text-[10px] text-purple-600 font-bold block">Fidelidade resgatada</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider block">Cancelados</span>
          <span className="text-lg font-black text-slate-900 font-mono">{metrics.cancelled_orders}</span>
          <span className="text-[10px] text-slate-400 font-bold block">Expirados ou estornados</span>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Buscar por nº (#OMIE-133), cliente, e-mail ou CPF/CNPJ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input text-xs !pl-9 w-full"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Origin Filter: Site vs Omie ERP */}
            <select
              value={originFilter}
              onChange={(e) => setOriginFilter(e.target.value)}
              className="form-select text-xs font-bold"
            >
              <option value="all">Origem: Todas ({enrichedOrders.length})</option>
              <option value="site">🌐 Compras no Site ({originCounts.site})</option>
              <option value="omie">🏢 Pedidos Omie ERP ({originCounts.omie})</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-select text-xs"
            >
              <option value="all">Status: Todos</option>
              <option value="paid">Pagamento: Aprovado</option>
              <option value="pending">Pagamento: Pendente</option>
              <option value="cancelled">Pagamento: Cancelado</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="form-select text-xs"
            >
              <option value="all">Tipo: Todos</option>
              <option value="sale">Vendas Comerciais</option>
              <option value="points_redemption">Resgate de Pontos</option>
            </select>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs font-bold text-amber-800 hover:text-amber-950 px-2.5 py-1.5 rounded-lg bg-amber-50 border border-amber-200 flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Limpar</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ORDERS TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs font-bold space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-amber-500" />
            <p>Carregando pedidos...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs space-y-2">
            <Package className="w-8 h-8 mx-auto text-slate-300" />
            <p className="font-bold text-slate-600">Nenhum pedido encontrado</p>
            <p className="text-[11px]">Tente alterar os filtros de origem, status ou termo de busca.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-black">
                    <th className="py-3.5 px-4">Pedido / Origem</th>
                    <th className="py-3.5 px-4">Data</th>
                    <th className="py-3.5 px-4">Cliente</th>
                    <th className="py-3.5 px-4">Itens</th>
                    <th className="py-3.5 px-4">Total</th>
                    <th className="py-3.5 px-4">Pagamento</th>
                    <th className="py-3.5 px-4">Expedição</th>
                    <th className="py-3.5 px-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {paginatedOrders.map(order => {
                    const isRedemption = order.order_type === 'points_redemption';
                    const isPaid = order.payment_status === 'paid' || order.payment_status === 'free';
                    const isPending = order.payment_status === 'pending';
                    const isCancelled = order.payment_status === 'cancelled';
                    const origin = order._origin;

                    // Verifica status real da remessa caso exista em order.shipments
                    const primaryShipment = order.shipments?.[0];
                    const effectiveFulfillmentStatus = primaryShipment?.status || order.fulfillment_status || 'unfulfilled';

                    const fulfillmentStatusLabels = {
                      unfulfilled: 'Aguardando',
                      pending: 'Aguardando Separação',
                      picking: 'Em Separação',
                      ready: 'Conferido / Pronto',
                      shipped: 'Despachado',
                      fulfilled: 'Despachado',
                      delivered: 'Entregue',
                      cancelled: 'Cancelado'
                    };

                    return (
                      <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-black text-slate-900 font-mono">
                              #{order.order_number || order.id.slice(0, 8)}
                            </span>
                            {isRedemption ? (
                              <span className="text-[9px] font-black uppercase bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded">
                                Pontos
                              </span>
                            ) : (
                              <span className="text-[9px] font-black uppercase bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                                Venda
                              </span>
                            )}
                          </div>
                          <div className="mt-1 flex items-center gap-1.5">
                            <span className={`inline-flex items-center gap-1 text-[9px] font-extrabold px-1.5 py-0.2 rounded border ${origin.badgeClass}`}>
                              {origin.originKey === 'site' ? <Globe className="w-2.5 h-2.5" /> : <Building2 className="w-2.5 h-2.5" />}
                              <span>{origin.shortLabel}</span>
                            </span>
                            {origin.originKey === 'site' && origin.isSyncedWithOmie && (
                              <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200" title={`Sincronizado com Omie ERP (#${origin.omieRef})`}>
                                ✓ Sinc. Omie
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-slate-500 text-[11px] font-mono whitespace-nowrap">
                          {new Date(order.created_at || Date.now()).toLocaleDateString('pt-BR')}
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="space-y-0.5">
                            <p className="font-bold text-slate-900 truncate max-w-[200px]" title={order.customer_snapshot?.name || order.user_name}>
                              {order.customer_snapshot?.name || order.user_name || 'Cliente'}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate max-w-[200px]">
                              {order.customer_snapshot?.email || order.user_email || '-'}
                            </p>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-slate-600 font-mono whitespace-nowrap">
                          {order.items?.length || 0} item(ns)
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {isRedemption ? (
                            <span className="font-bold text-purple-700 flex items-center gap-1 font-mono">
                              <Coins className="w-3 h-3" />
                              <span>{order.points_spent || 0} pts</span>
                            </span>
                          ) : (
                            <span className="font-bold text-slate-900 font-mono">
                              R$ {Number(order.total_amount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {isPaid && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Pago</span>
                            </span>
                          )}
                          {isPending && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200">
                              <Clock className="w-3 h-3" />
                              <span>Pendente</span>
                            </span>
                          )}
                          {isCancelled && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200">
                              <AlertCircle className="w-3 h-3" />
                              <span>Cancelado</span>
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="text-[11px] font-semibold text-slate-700">
                            {fulfillmentStatusLabels[effectiveFulfillmentStatus] || effectiveFulfillmentStatus}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center justify-end gap-1.5">
                            {onOpenOrderInFulfillment && (
                              <button
                                type="button"
                                onClick={() => onOpenOrderInFulfillment(order)}
                                className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-[11px] transition-colors inline-flex items-center gap-1 cursor-pointer shadow-2xs"
                                title="Ir para a Mesa de Expedição já com o romaneio desta compra aberto"
                              >
                                <Truck className="w-3 h-3" />
                                <span>Expedição</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => setSelectedOrder(order)}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-amber-500 hover:text-slate-950 font-bold text-[11px] transition-colors inline-flex items-center gap-1 cursor-pointer border border-slate-200/80"
                            >
                              <Eye className="w-3 h-3" />
                              <span>Detalhes</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* PAGINATION FOOTER */}
            <div className="bg-slate-50/80 px-4 py-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3 text-slate-600">
                <span>
                  Mostrando <strong className="font-mono text-slate-900">{(currentPage - 1) * pageSize + 1}</strong>–
                  <strong className="font-mono text-slate-900">{Math.min(currentPage * pageSize, filteredOrders.length)}</strong> de{' '}
                  <strong className="font-mono text-slate-900">{filteredOrders.length}</strong> pedidos
                </span>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-[11px] font-bold text-slate-700 cursor-pointer"
                >
                  <option value={15}>15 por página</option>
                  <option value={30}>30 por página</option>
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
          </>
        )}
      </div>

      {/* ORDER DETAILS MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overscroll-none animate-in fade-in">
          <div 
            className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* MODAL HEADER */}
            <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-extrabold text-sm sm:text-base font-mono">
                      Pedido #{selectedOrder.order_number || selectedOrder.id}
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                      {selectedOrder.order_type === 'points_redemption' ? 'Resgate A-Points' : 'Venda Comercial'}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30">
                      {selectedOrder._origin?.label || resolveOrderOrigin(selectedOrder).label}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Criado em {new Date(selectedOrder.created_at || Date.now()).toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* MODAL BODY */}
            <div className="p-5 overflow-y-auto space-y-5 text-xs text-slate-700">
              {/* CUSTOMER & PAYMENT INFO */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5">
                  <span className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1">
                    <User className="w-3 h-3" />
                    <span>Dados do Cliente</span>
                  </span>
                  <p className="font-bold text-slate-900 text-sm">
                    {selectedOrder.customer_snapshot?.name || selectedOrder.user_name || 'Cliente'}
                  </p>
                  <p className="text-slate-500">
                    <strong>E-mail:</strong> {selectedOrder.customer_snapshot?.email || selectedOrder.user_email || '-'}
                  </p>
                  <p className="text-slate-500">
                    <strong>Documento:</strong> {selectedOrder.customer_snapshot?.document || '-'}
                  </p>
                  {selectedOrder.customer_snapshot?.phone && (
                    <p className="text-slate-500">
                      <strong>Telefone:</strong> {selectedOrder.customer_snapshot.phone}
                    </p>
                  )}
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5">
                  <span className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    <span>Resumo Financeiro</span>
                  </span>
                  <div className="flex justify-between items-center pt-1">
                    <span>Canal de Origem:</span>
                    <strong className="font-bold text-slate-900">{selectedOrder._origin?.label}</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Método:</span>
                    <strong className="font-bold uppercase text-slate-900">{selectedOrder.payment_method || 'PIX / Faturamento'}</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Status de Pagamento:</span>
                    <strong className="font-bold capitalize text-slate-900">{selectedOrder.payment_status}</strong>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                    <span className="font-extrabold text-slate-900">Total Faturado:</span>
                    <span className="text-sm font-black text-slate-900 font-mono">
                      {selectedOrder.order_type === 'points_redemption' 
                        ? `${selectedOrder.points_spent} pts` 
                        : `R$ ${Number(selectedOrder.total_amount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                    </span>
                  </div>
                </div>
              </div>

              {/* SHIPPING ADDRESS IF PHYSICAL */}
              {selectedOrder.shipping_address?.city && (
                <div className="p-3.5 bg-amber-50/40 rounded-2xl border border-amber-200/60 space-y-1">
                  <span className="text-[10px] font-black uppercase text-amber-800 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-amber-600" />
                    <span>Endereço de Entrega (Expedição)</span>
                  </span>
                  {selectedOrder.shipping_address.street && (
                    <p className="text-slate-800 font-medium">
                      {selectedOrder.shipping_address.street}, {selectedOrder.shipping_address.number || 'S/N'}
                      {selectedOrder.shipping_address.complement ? ` (${selectedOrder.shipping_address.complement})` : ''}
                    </p>
                  )}
                  <p className="text-slate-500">
                    {selectedOrder.shipping_address.city}/{selectedOrder.shipping_address.state}
                    {(selectedOrder.shipping_address.cep || selectedOrder.shipping_address.zipCode || selectedOrder.shipping_address.zip_code)
                      ? ` • CEP: ${selectedOrder.shipping_address.cep || selectedOrder.shipping_address.zipCode || selectedOrder.shipping_address.zip_code}`
                      : ''}
                  </p>
                </div>
              )}

              {/* ITEMS LIST */}
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1">
                  <Package className="w-3 h-3" />
                  <span>Itens do Pedido ({selectedOrder.items?.length || 0})</span>
                </span>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {(selectedOrder.items || []).map((it, idx) => (
                    <div key={idx} className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-3">
                      <div className="space-y-0.5">
                        <p className="font-bold text-slate-900">{decodeHtmlEntities(it.name || it.description)}</p>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400">
                          <span>Qtd: {it.quantity || 1}</span>
                          <span>•</span>
                          <span className="capitalize">{it.fulfillment_type === 'digital' ? 'Digital / Software' : 'Físico / Equipamento'}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-mono font-bold text-slate-900">
                          {Number(it.unit_price) > 0 
                            ? `R$ ${(Number(it.unit_price) * (Number(it.quantity) || 1)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` 
                            : 'Incluso'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SHIPMENTS & TRACKING */}
              {selectedOrder.shipments && selectedOrder.shipments.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <span className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1">
                    <Truck className="w-3 h-3 text-slate-600" />
                    <span>Remessa de Expedição & Rastreio</span>
                  </span>
                  {selectedOrder.shipments.map(s => (
                    <div key={s.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-slate-900">Remessa #{s.shipment_number || s.id.slice(0, 8)}</p>
                        <p className="text-[11px] text-slate-500">
                          Transportadora: <strong>{s.carrier || 'Pendente'}</strong> • Código: <strong className="font-mono">{s.tracking_code || 'Aguardando Despacho'}</strong>
                        </p>
                      </div>
                      {s.tracking_url && (
                        <a 
                          href={s.tracking_url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="btn-gold text-[10px] py-1 px-3 flex items-center gap-1"
                        >
                          <span>Rastrear</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* DIGITAL ACTIVATIONS */}
              {selectedOrder.digital_activations && selectedOrder.digital_activations.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <span className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-500" />
                    <span>Licenças de Software / Ativação Digital</span>
                  </span>
                  {selectedOrder.digital_activations.map(da => (
                    <div key={da.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-slate-900">{da.software_name || 'Software Athena'}</p>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          da.status === 'activated' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {da.status === 'activated' ? 'Ativado' : 'Aguardando Suporte'}
                        </span>
                      </div>
                      {da.license_key && (
                        <div className="flex items-center justify-between bg-white p-2 rounded border border-slate-200 font-mono text-xs">
                          <span>Chave: {da.license_key}</span>
                          <button
                            type="button"
                            onClick={() => handleCopyText(da.license_key)}
                            className="text-[10px] text-amber-700 hover:text-amber-800 font-bold"
                          >
                            {copiedKey ? 'Copiado!' : 'Copiar'}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* MODAL FOOTER */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="btn-secondary text-xs cursor-pointer"
              >
                Fechar
              </button>

              {onOpenOrderInFulfillment && (
                <button
                  type="button"
                  onClick={() => {
                    const target = selectedOrder;
                    setSelectedOrder(null);
                    onOpenOrderInFulfillment(target);
                  }}
                  className="btn-gold text-xs font-bold py-2 px-4 flex items-center gap-1.5 cursor-pointer"
                >
                  <Truck className="w-4 h-4" />
                  <span>Abrir Etapa na Mesa de Expedição</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
