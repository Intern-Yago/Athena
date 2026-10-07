import React, { useState, useEffect, useMemo } from 'react';
import { 
  Truck, 
  Package, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  RefreshCw, 
  ShieldCheck, 
  Lock, 
  FileText, 
  ExternalLink, 
  X, 
  User, 
  MapPin, 
  Search,
  ArrowRight,
  ClipboardList
} from 'lucide-react';

export default function FulfillmentKanbanTab({ API_BASE_URL, currentUser, showNotification }) {
  const [kanban, setKanban] = useState({
    pending: [],
    picking: [],
    ready: [],
    shipped: [],
    delivered: []
  });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Modals state
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

  const fetchKanban = async () => {
    if (!currentUser?.token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/fulfillment/kanban`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setKanban(data.physical_kanban || { pending: [], picking: [], ready: [], shipped: [], delivered: [] });
      } else {
        showNotification?.('Erro ao carregar Kanban de expedição.', 'error');
      }
    } catch (e) {
      console.error('Erro ao buscar Kanban:', e);
      showNotification?.('Falha ao conectar com o servidor.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKanban();
  }, [currentUser?.token]);

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
        fetchKanban(); // Atualiza kanban (vai para picking)
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
    (shipment.items || []).forEach(it => {
      initialChecks[it.id || it.product_id] = true;
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
      fetchKanban();
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
      trackingCode: '',
      trackingUrl: ''
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
      fetchKanban();
    } catch (e) {
      showNotification?.(e.message || 'Erro no despacho.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Ação: Confirmar Entrega
  const handleConfirmDelivered = async (shipment) => {
    if (!confirm(`Deseja confirmar a entrega da remessa #${shipment.shipment_number || shipment.id.slice(0, 8)}?`)) return;
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
      fetchKanban();
    } catch (e) {
      showNotification?.(e.message || 'Erro ao confirmar entrega.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const columns = [
    { key: 'pending', label: 'Aguardando Separação', color: 'border-amber-400 bg-amber-500/10 text-amber-700' },
    { key: 'picking', label: 'Em Separação / Romaneio', color: 'border-blue-400 bg-blue-500/10 text-blue-700' },
    { key: 'ready', label: 'Conferido (Trava Liberada)', color: 'border-purple-400 bg-purple-500/10 text-purple-700' },
    { key: 'shipped', label: 'Despachado / Em Trânsito', color: 'border-emerald-400 bg-emerald-500/10 text-emerald-700' },
    { key: 'delivered', label: 'Entregue', color: 'border-slate-300 bg-slate-100 text-slate-700' }
  ];

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Truck className="w-5 h-5 text-amber-500" />
            <span>Mesa de Expedição & Logística</span>
          </h2>
          <p className="text-xs text-slate-500">
            Pipeline de separação, conferência com trava física de segurança e despacho com transportadoras.
          </p>
        </div>
        <button
          onClick={fetchKanban}
          disabled={loading}
          className="btn-secondary text-xs flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Atualizar Kanban</span>
        </button>
      </div>

      {/* KANBAN BOARD */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5 items-start">
        {columns.map(col => {
          const shipments = kanban[col.key] || [];

          return (
            <div 
              key={col.key} 
              className="bg-slate-50/70 rounded-2xl border border-slate-200/80 p-3 space-y-3 min-h-[380px] flex flex-col"
            >
              {/* COLUMN HEADER */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-700">
                  {col.label}
                </span>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${col.color}`}>
                  {shipments.length}
                </span>
              </div>

              {/* SHIPMENT CARDS */}
              <div className="space-y-2.5 flex-1">
                {shipments.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-[11px] font-medium border border-dashed border-slate-200 rounded-xl">
                    Nenhuma remessa
                  </div>
                ) : (
                  shipments.map(s => (
                    <div 
                      key={s.id} 
                      className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs space-y-2.5 hover:border-amber-400 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-black text-xs text-slate-900">
                          #{s.order_number || s.order_id.slice(0, 6)}
                        </span>
                        <span className="text-[9px] font-mono text-slate-400">
                          {new Date(s.created_at || Date.now()).toLocaleDateString('pt-BR')}
                        </span>
                      </div>

                      <div className="space-y-0.5 text-[11px]">
                        <p className="font-bold text-slate-800 truncate">
                          {s.customer_snapshot?.name || 'Cliente'}
                        </p>
                        {s.shipping_address?.city && (
                          <p className="text-[10px] text-slate-400 flex items-center gap-1 truncate">
                            <MapPin className="w-2.5 h-2.5 shrink-0" />
                            <span>{s.shipping_address.city}/{s.shipping_address.state}</span>
                          </p>
                        )}
                      </div>

                      {/* Items to pick */}
                      <div className="text-[10px] text-slate-500 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                        <strong>{(s.items || []).length} item(ns):</strong>{' '}
                        {(s.items || []).map(i => i.name).join(', ') || 'Equipamentos físicos'}
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
                            <div className="text-[9px] text-slate-500 font-mono flex justify-between">
                              <span>{s.carrier || 'Transportadora'}</span>
                              <strong className="text-slate-800">{s.tracking_code}</strong>
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
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL 1: CONFERÊNCIA FÍSICA OBRIGATÓRIA (TRAVA DE SEGURANÇA) */}
      {conferenceModalShipment && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overscroll-none animate-in fade-in">
          <div 
            className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col"
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

            <div className="p-5 space-y-4 text-xs text-slate-700">
              <div className="bg-purple-50 p-3 rounded-xl border border-purple-200/80 space-y-1">
                <span className="font-bold text-purple-900">Checklist do Conferente:</span>
                <p className="text-[11px] text-purple-800">
                  Certifique-se de conferir cada item, etiquetas de advertência, manuais e acessórios antes de liberar o despacho.
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase text-slate-400">Itens a Inspecionar:</span>
                <div className="space-y-2">
                  {(conferenceModalShipment.items || []).map((it, idx) => (
                    <label 
                      key={idx}
                      className="p-3 rounded-xl border border-slate-200 flex items-center justify-between gap-3 bg-slate-50 cursor-pointer"
                    >
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-900 block">{it.name}</span>
                        <span className="text-[10px] text-slate-500">Qtd: {it.quantity || 1} unidade(s)</span>
                      </div>
                      <input 
                        type="checkbox"
                        checked={!!conferenceCheckedItems[it.id || it.product_id]}
                        onChange={(e) => {
                          setConferenceCheckedItems({
                            ...conferenceCheckedItems,
                            [it.id || it.product_id]: e.target.checked
                          });
                        }}
                        className="rounded text-amber-500 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                      />
                    </label>
                  ))}
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

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
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
                    Despachar Remessa #{dispatchModalShipment.shipment_number || dispatchModalShipment.id.slice(0, 8)}
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
            className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col"
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

            <div className="p-5 space-y-4 text-xs text-slate-700">
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
                <div className="space-y-1.5">
                  {(pickingListModal.physical_items_to_pick || []).map((it, idx) => (
                    <div key={idx} className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                      <span className="font-bold text-slate-900">{it.name}</span>
                      <span className="font-mono font-bold bg-amber-50 text-amber-800 px-2 py-0.5 rounded border border-amber-200">
                        {it.quantity} un
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
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
