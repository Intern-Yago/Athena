import React, { useState, useEffect, useMemo } from 'react';
import { 
  Receipt, 
  Search, 
  Filter, 
  Eye, 
  X, 
  Calendar, 
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
  FileText, 
  ArrowUpRight,
  ExternalLink,
  ShieldCheck,
  Check
} from 'lucide-react';

export default function OrdersManagementTab({ API_BASE_URL, currentUser, showNotification }) {
  const [orders, setOrders] = useState([]);
  const [metrics, setMetrics] = useState({
    total_orders: 0,
    total_revenue: 0,
    paid_orders: 0,
    pending_orders: 0,
    cancelled_orders: 0,
    redemption_orders: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, paid, pending, cancelled
  const [typeFilter, setTypeFilter] = useState('all'); // all, sale, points_redemption
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [copiedKey, setCopiedKey] = useState(false);

  const fetchOrders = async () => {
    if (!currentUser?.token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/orders`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
        if (data.metrics) setMetrics(data.metrics);
      } else {
        showNotification?.('Erro ao carregar lista de pedidos.', 'error');
      }
    } catch (e) {
      console.error('Erro ao buscar pedidos:', e);
      showNotification?.('Falha de conexão com o servidor.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [currentUser?.token]);

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // Status filter
      if (statusFilter === 'paid' && order.payment_status !== 'paid' && order.payment_status !== 'free') return false;
      if (statusFilter === 'pending' && order.payment_status !== 'pending') return false;
      if (statusFilter === 'cancelled' && order.payment_status !== 'cancelled') return false;

      // Type filter
      if (typeFilter === 'sale' && order.order_type !== 'sale') return false;
      if (typeFilter === 'points_redemption' && order.order_type !== 'points_redemption') return false;

      // Search term
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const num = String(order.order_number || order.id || '').toLowerCase();
        const name = String(order.customer_snapshot?.name || order.user_name || '').toLowerCase();
        const email = String(order.customer_snapshot?.email || order.user_email || '').toLowerCase();
        const doc = String(order.customer_snapshot?.document || '').toLowerCase();
        return num.includes(term) || name.includes(term) || email.includes(term) || doc.includes(term);
      }

      return true;
    });
  }, [orders, statusFilter, typeFilter, searchTerm]);

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
            Acompanhe pedidos de vendas comerciais, resgates de fidelidade A-Points e liquidações.
          </p>
        </div>
        <button
          onClick={fetchOrders}
          disabled={loading}
          className="btn-secondary text-xs flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Atualizar Pedidos</span>
        </button>
      </div>

      {/* METRICS CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Faturamento Total</span>
          <span className="text-lg font-black text-slate-900">
            R$ {Number(metrics.total_revenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[10px] text-emerald-600 font-bold block">{metrics.paid_orders} pedido(s) pagos</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total de Pedidos</span>
          <span className="text-lg font-black text-slate-900">{metrics.total_orders}</span>
          <span className="text-[10px] text-slate-500 font-bold block">Vendas & Resgates</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-200/80 bg-amber-50/20 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">Aguardando Pagamento</span>
          <span className="text-lg font-black text-amber-900">{metrics.pending_orders}</span>
          <span className="text-[10px] text-amber-600 font-bold block">Boletos / PIX pendentes</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-purple-200/80 bg-purple-50/20 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block">Resgates A-Points</span>
          <span className="text-lg font-black text-purple-900">{metrics.redemption_orders}</span>
          <span className="text-[10px] text-purple-600 font-bold block">Fidelidade resgatada</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider block">Cancelados</span>
          <span className="text-lg font-black text-slate-900">{metrics.cancelled_orders}</span>
          <span className="text-[10px] text-slate-400 font-bold block">Expirados ou estornados</span>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Buscar por nº, cliente, e-mail ou CPF/CNPJ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input text-xs !pl-9 w-full"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
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
            <p className="text-[11px]">Tente alterar os filtros ou termo de busca.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-black">
                  <th className="py-3 px-4">Pedido</th>
                  <th className="py-3 px-4">Data</th>
                  <th className="py-3 px-4">Cliente</th>
                  <th className="py-3 px-4">Itens</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Pagamento</th>
                  <th className="py-3 px-4">Expedição</th>
                  <th className="py-3 px-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredOrders.map(order => {
                  const isRedemption = order.order_type === 'points_redemption';
                  const isPaid = order.payment_status === 'paid' || order.payment_status === 'free';
                  const isPending = order.payment_status === 'pending';
                  const isCancelled = order.payment_status === 'cancelled';

                  const fulfillmentStatusLabels = {
                    unfulfilled: 'Aguardando',
                    pending: 'Aguardando Separação',
                    picking: 'Em Separação',
                    ready: 'Pronto / Conferido',
                    shipped: 'Despachado',
                    delivered: 'Entregue',
                    cancelled: 'Cancelado'
                  };

                  return (
                    <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
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
                      </td>

                      <td className="py-3 px-4 text-slate-500 text-[11px]">
                        {new Date(order.created_at || Date.now()).toLocaleDateString('pt-BR')}
                      </td>

                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          <p className="font-bold text-slate-900 truncate max-w-[180px]">
                            {order.customer_snapshot?.name || order.user_name || 'Cliente'}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate max-w-[180px]">
                            {order.customer_snapshot?.email || order.user_email || '-'}
                          </p>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-slate-500">
                        {order.items?.length || 0} item(ns)
                      </td>

                      <td className="py-3 px-4">
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

                      <td className="py-3 px-4">
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

                      <td className="py-3 px-4">
                        <span className="text-[11px] font-semibold text-slate-600">
                          {fulfillmentStatusLabels[order.fulfillment_status] || order.fulfillment_status || 'Aguardando'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedOrder(order)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-amber-500 hover:text-slate-950 font-bold text-[11px] transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Detalhes</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
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
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-sm sm:text-base">
                      Pedido #{selectedOrder.order_number || selectedOrder.id}
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                      {selectedOrder.order_type === 'points_redemption' ? 'Resgate A-Points' : 'Venda Comercial'}
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
                  {selectedOrder.customer_snapshot?.companyName && (
                    <p className="text-slate-500">
                      <strong>Empresa:</strong> {selectedOrder.customer_snapshot.companyName}
                    </p>
                  )}
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5">
                  <span className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    <span>Resumo Financeiro</span>
                  </span>
                  <div className="flex justify-between items-center pt-1">
                    <span>Método:</span>
                    <strong className="font-bold uppercase text-slate-900">{selectedOrder.payment_method || 'PIX'}</strong>
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
              {selectedOrder.shipping_address?.street && (
                <div className="p-3.5 bg-amber-50/40 rounded-2xl border border-amber-200/60 space-y-1">
                  <span className="text-[10px] font-black uppercase text-amber-800 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-amber-600" />
                    <span>Endereço de Entrega (Expedição)</span>
                  </span>
                  <p className="text-slate-800 font-medium">
                    {selectedOrder.shipping_address.street}, {selectedOrder.shipping_address.number || 'S/N'}
                    {selectedOrder.shipping_address.complement ? ` (${selectedOrder.shipping_address.complement})` : ''} - {selectedOrder.shipping_address.neighborhood || ''}
                  </p>
                  <p className="text-slate-500">
                    {selectedOrder.shipping_address.city}/{selectedOrder.shipping_address.state} • CEP: {selectedOrder.shipping_address.cep}
                  </p>
                </div>
              )}

              {/* ITEMS LIST */}
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1">
                  <Package className="w-3 h-3" />
                  <span>Itens do Pedido ({selectedOrder.items?.length || 0})</span>
                </span>
                <div className="space-y-2">
                  {(selectedOrder.items || []).map((it, idx) => (
                    <div key={idx} className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-3">
                      <div className="space-y-0.5">
                        <p className="font-bold text-slate-900">{it.name || it.description}</p>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400">
                          <span>Qtd: {it.quantity || 1}</span>
                          <span>•</span>
                          <span className="capitalize">{it.fulfillment_type === 'digital' ? 'Digital / Software' : 'Físico / Equipamento'}</span>
                        </div>
                      </div>
                      <div className="text-right">
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
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="btn-secondary text-xs cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
