import React, { useState } from 'react';
import {
  Package,
  X,
  User,
  MapPin,
  ClipboardList,
  Search,
  ShieldCheck,
  Truck,
  CheckCircle2,
  Globe,
  Building2
} from 'lucide-react';
import { decodeHtmlEntities, resolveOrderOrigin } from '../../utils/orderUtils';

/**
 * ShipmentDetailModal
 *
 * Popup de inspeção detalhada de uma remessa física (acionado pelo botão de expandir
 * nos cards do Kanban, na Tabela de Expedição ou via atalho direto de Vendas & Pedidos).
 */
export default function ShipmentDetailModal({
  shipment,
  columnMap = {},
  onClose,
  onStartPicking,
  onOpenConference,
  onOpenDispatch,
  onConfirmDelivered
}) {
  const [itemSearch, setItemSearch] = useState('');

  if (!shipment) return null;

  const statusKey = shipment._resolvedStatus || shipment._statusKey || shipment.status || 'pending';
  const statusInfo = columnMap[statusKey];
  const origin = shipment._origin || resolveOrderOrigin(shipment);
  const items = Array.isArray(shipment.items) ? shipment.items : [];

  const filteredItems = items.filter(it => {
    if (!itemSearch.trim()) return true;
    return decodeHtmlEntities(it.name).toLowerCase().includes(itemSearch.trim().toLowerCase());
  });

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overscroll-none animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[88vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
              <Package className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-mono font-black text-base sm:text-lg text-white">
                  #{shipment.order_number || shipment.order_id?.slice(0, 8)}
                </h3>

                {/* Badge de Origem (Site vs Omie ERP) */}
                <span className={`inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full border ${
                  origin.originKey === 'site'
                    ? 'bg-amber-400/20 text-amber-300 border-amber-400/40'
                    : 'bg-sky-400/20 text-sky-300 border-sky-400/40'
                }`}>
                  {origin.originKey === 'site' ? <Globe className="w-3 h-3" /> : <Building2 className="w-3 h-3" />}
                  <span>{origin.label}</span>
                </span>

                {/* Badge de Etapa Logística */}
                <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                  statusInfo?.color || 'bg-slate-800 text-slate-200 border-slate-700'
                }`}>
                  {statusInfo?.label || statusKey}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                Remessa: {shipment.shipment_number || shipment.id?.slice(0, 8)} • Data: {new Date(shipment.created_at || Date.now()).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* Customer & Address Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <User className="w-3 h-3 text-amber-600" /> Cliente / Destinatário
              </span>
              <p className="font-extrabold text-slate-900 text-xs sm:text-sm">
                {shipment.customer_snapshot?.name || 'Cliente'}
              </p>
              {shipment.customer_snapshot?.document && (
                <p className="text-[11px] font-mono text-slate-500">
                  CPF/CNPJ: {shipment.customer_snapshot.document}
                </p>
              )}
              {shipment.customer_snapshot?.email && (
                <p className="text-[11px] text-slate-500 truncate">
                  E-mail: {shipment.customer_snapshot.email}
                </p>
              )}
              {shipment.customer_snapshot?.phone && (
                <p className="text-[11px] text-slate-500">
                  Tel: {shipment.customer_snapshot.phone}
                </p>
              )}
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-amber-600" /> Local de Entrega
              </span>
              {shipment.shipping_address?.city ? (
                <>
                  <p className="font-extrabold text-slate-900 text-xs sm:text-sm">
                    {shipment.shipping_address.city} / {shipment.shipping_address.state}
                  </p>
                  {shipment.shipping_address.street && (
                    <p className="text-[11px] text-slate-600">
                      {shipment.shipping_address.street}
                      {shipment.shipping_address.number ? `, ${shipment.shipping_address.number}` : ''}
                    </p>
                  )}
                  {(shipment.shipping_address.zip_code || shipment.shipping_address.zipCode || shipment.shipping_address.cep) && (
                    <p className="text-[11px] font-mono text-slate-500">
                      CEP: {shipment.shipping_address.zip_code || shipment.shipping_address.zipCode || shipment.shipping_address.cep}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-slate-400 italic">Endereço não detalhado</p>
              )}
            </div>
          </div>

          {/* Items List Header + Quick Filter inside Popup */}
          <div className="space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <ClipboardList className="w-4 h-4 text-amber-600" />
                <span>
                  Romaneio de Itens ({items.length} {items.length === 1 ? 'item' : 'itens'})
                </span>
              </span>

              {items.length > 4 && (
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={itemSearch}
                    onChange={(e) => setItemSearch(e.target.value)}
                    placeholder="Filtrar item neste pedido..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-2.5 py-1 text-[11px] font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              )}
            </div>

            <div className="border border-slate-200 rounded-2xl divide-y divide-slate-100 overflow-hidden bg-white max-h-[300px] overflow-y-auto">
              {filteredItems.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs">
                  Nenhum item corresponde ao filtro digitado.
                </div>
              ) : (
                filteredItems.map((it, idx) => (
                  <div key={idx} className="p-3 hover:bg-slate-50 flex items-center justify-between gap-3">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <span className="font-mono text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 shrink-0 mt-0.5">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 leading-snug break-words">
                          {decodeHtmlEntities(it.name)}
                        </p>
                        {(it.variant_sku || it.product_id) && (
                          <span className="text-[10px] font-mono text-slate-400">
                            Cód/Ref: {it.variant_sku || it.product_id}
                          </span>
                        )}
                      </div>
                    </div>

                    <span className="font-mono font-black text-xs bg-amber-50 text-amber-900 px-2.5 py-1 rounded-lg border border-amber-200 shrink-0">
                      {it.quantity || 1} un
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary text-xs cursor-pointer"
          >
            Fechar
          </button>

          <div className="flex items-center gap-2">
            {statusKey === 'pending' && onStartPicking && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onStartPicking(shipment);
                }}
                className="btn-gold text-xs font-bold py-2 px-4 flex items-center gap-1.5 cursor-pointer"
              >
                <ClipboardList className="w-4 h-4" />
                <span>Iniciar Separação</span>
              </button>
            )}

            {statusKey === 'picking' && onOpenConference && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenConference(shipment);
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold py-2 px-4 flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Conferir (Liberar Trava)</span>
              </button>
            )}

            {statusKey === 'ready' && onOpenDispatch && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenDispatch(shipment);
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold py-2 px-4 flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Truck className="w-4 h-4" />
                <span>Despachar Remessa</span>
              </button>
            )}

            {statusKey === 'shipped' && onConfirmDelivered && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onConfirmDelivered(shipment);
                }}
                className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold py-2 px-4 flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Confirmar Entrega</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
