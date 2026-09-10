import React, { useState, useEffect } from 'react';
import {
  Users,
  Phone,
  Mail,
  FileText,
  Calendar,
  Coins,
  ShieldCheck,
  KeyRound,
  Package,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  X,
  Check,
  Loader2,
  Copy,
  MessageCircle,
  AlertTriangle,
  Building,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  ShoppingBag
} from 'lucide-react';

/**
 * CustomerDetailModal (CRM do Cliente)
 * Apresenta perfil completo do cliente, data de cadastro,
 * histórico de pedidos/compras com itens detalhados, extrato de fidelidade A-Points
 * e painel centralizado de ações de suporte (senha provisória, e-mail de recuperação e ajuste manual de pontos).
 */
export default function CustomerDetailModal({
  customer,
  isOpen,
  onClose,
  API_BASE_URL,
  getAuthHeaders,
  showNotification,
  onPointsAdjusted,
  onCustomerUpdated,
  onDeleteCustomer
}) {
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'points' | 'support'
  const [loading, setLoading] = useState(false);
  const [historyData, setHistoryData] = useState(null);

  // Support actions state
  const [pointsType, setPointsType] = useState('add');
  const [pointsAmount, setPointsAmount] = useState('');
  const [pointsReason, setPointsReason] = useState('');
  const [submittingPoints, setSubmittingPoints] = useState(false);

  const [generatingTemp, setGeneratingTemp] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);
  const [tempPasswordResult, setTempPasswordResult] = useState(null);

  const apiUrl = API_BASE_URL || (typeof window !== 'undefined' && import.meta.env?.VITE_API_URL) || 'https://athena-backend-hu1m.onrender.com/api';

  const getAuthHeadersRef = React.useRef(getAuthHeaders);
  getAuthHeadersRef.current = getAuthHeaders;

  const showNotificationRef = React.useRef(showNotification);
  showNotificationRef.current = showNotification;

  // Fetch full customer history when modal opens
  useEffect(() => {
    if (!isOpen || !customer?.id) {
      setHistoryData(null);
      setTempPasswordResult(null);
      return;
    }

    let isMounted = true;
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const headers = getAuthHeadersRef.current ? getAuthHeadersRef.current() : {};
        const res = await fetch(`${apiUrl}/admin/users/${customer.id}/history`, { headers });
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setHistoryData(data);
          }
        }
      } catch (err) {
        console.error('Erro ao buscar histórico do cliente:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchHistory();
    return () => { isMounted = false; };
  }, [isOpen, customer?.id, apiUrl]);

  if (!isOpen || !customer) return null;

  const user = historyData?.user || customer;
  const orders = historyData?.orders || [];
  const transactions = historyData?.transactions || [];
  const summary = historyData?.summary || {
    totalOrders: orders.length,
    totalSpent: orders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0),
    pointsEarnedTotal: 0,
    pointsRedeemedTotal: 0,
    currentPoints: Number(user.aPoints || 0)
  };

  const isTemp = Boolean(user.mustChangePassword);
  const rawDate = user.createdAt ? new Date(user.createdAt) : null;
  const formattedDate = rawDate && !isNaN(rawDate.getTime()) 
    ? rawDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
    : 'Cadastro recente';

  // Support: Send reset email
  const handleSendResetEmail = async () => {
    setSendingReset(true);
    try {
      const headers = getAuthHeadersRef.current ? getAuthHeadersRef.current() : {};
      const res = await fetch(`${apiUrl}/admin/users/${user.id}/send-reset-email`, {
        method: 'POST',
        headers
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Falha ao enviar e-mail de recuperação.');

      showNotificationRef.current?.(data.message || 'E-mail com código enviado com sucesso!', 'success');
    } catch (err) {
      showNotificationRef.current?.(err.message || 'Erro ao enviar e-mail.', 'error');
    } finally {
      setSendingReset(false);
    }
  };

  // Support: Generate temporary password
  const handleGenerateTempPassword = async () => {
    setGeneratingTemp(true);
    try {
      const headers = getAuthHeadersRef.current ? getAuthHeadersRef.current() : {};
      const res = await fetch(`${apiUrl}/admin/users/${user.id}/generate-temp-password`, {
        method: 'POST',
        headers
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Falha ao gerar senha temporária.');

      setTempPasswordResult({
        tempPassword: data.tempPassword,
        whatsappMessage: data.whatsappMessage,
        userEmail: data.userEmail,
        userName: user.name
      });
      showNotificationRef.current?.('Senha temporária gerada com sucesso!', 'success');
      onCustomerUpdated?.({ ...user, mustChangePassword: true });
    } catch (err) {
      showNotificationRef.current?.(err.message || 'Erro ao gerar senha provisória.', 'error');
    } finally {
      setGeneratingTemp(false);
    }
  };

  // Support: Adjust points manually
  const handleAdjustPoints = async (e) => {
    e.preventDefault();
    const num = parseInt(pointsAmount, 10);
    if (isNaN(num) || num <= 0) {
      showNotificationRef.current?.('Informe uma quantidade de pontos válida maior que zero.', 'error');
      return;
    }

    const delta = pointsType === 'add' ? num : -num;
    const currentPts = Number(user.aPoints || 0);
    if (delta < 0 && Math.abs(delta) > currentPts) {
      showNotificationRef.current?.(`O cliente possui apenas ${currentPts} pts. Não é possível debitar ${num} pts.`, 'error');
      return;
    }

    setSubmittingPoints(true);
    try {
      const headers = getAuthHeadersRef.current ? getAuthHeadersRef.current() : {};
      const res = await fetch(`${apiUrl}/admin/points/adjust`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: JSON.stringify({
          userId: user.id,
          deltaPoints: delta,
          reason: pointsReason.trim() || (delta > 0 ? 'Bonificação manual no atendimento' : 'Ajuste manual de débito')
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Falha ao ajustar saldo de pontos.');

      const newBalance = data.newBalance !== undefined ? data.newBalance : Math.max(0, currentPts + delta);
      showNotificationRef.current?.(`Saldo atualizado com sucesso para ${newBalance} pts!`, 'success');

      setHistoryData(prev => {
        if (!prev) return prev;
        const newTx = {
          id: `tx_${Date.now()}`,
          pointsEarned: delta,
          type: delta > 0 ? 'ADJUST_CREDIT' : 'ADJUST_DEBIT',
          source: 'manual_admin',
          notes: pointsReason.trim() || 'Ajuste manual pelo suporte',
          createdAt: new Date().toISOString()
        };
        return {
          ...prev,
          user: { ...prev.user, aPoints: newBalance },
          transactions: [newTx, ...(prev.transactions || [])],
          summary: {
            ...prev.summary,
            currentPoints: newBalance,
            pointsEarnedTotal: delta > 0 ? prev.summary.pointsEarnedTotal + delta : prev.summary.pointsEarnedTotal,
            pointsRedeemedTotal: delta < 0 ? prev.summary.pointsRedeemedTotal + Math.abs(delta) : prev.summary.pointsRedeemedTotal
          }
        };
      });

      onPointsAdjusted?.(user.id, newBalance);
      setPointsAmount('');
      setPointsReason('');
    } catch (err) {
      showNotificationRef.current?.(err.message || 'Erro ao ajustar pontos.', 'error');
    } finally {
      setSubmittingPoints(false);
    }
  };

  const copyText = (txt, label = 'Copiado!') => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(txt);
      showNotificationRef.current?.(label, 'success');
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[160] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-4xl h-[94vh] sm:h-auto sm:max-h-[92vh] bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-4 sm:p-6 border-b border-slate-100 bg-linear-to-r from-slate-900 to-slate-950 text-white shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-black text-lg shrink-0">
                {user.name ? user.name.charAt(0).toUpperCase() : <Users className="w-6 h-6" />}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h3 className="text-base sm:text-lg font-black text-white truncate">
                    {user.name}
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold text-[10px] border border-purple-500/30 shrink-0">
                    Cliente do Portal
                  </span>
                  {isTemp ? (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[10px] border border-amber-500/30 flex items-center gap-1">
                      <KeyRound className="w-3 h-3 text-amber-400" /> Senha Provisória Ativa
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px] border border-emerald-500/30 flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-400" /> Acesso Normal
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300 mt-1.5">
                  <span className="flex items-center gap-1 text-slate-400">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    Cliente desde: <strong className="text-slate-200">{formattedDate}</strong>
                  </span>
                  {user.document && (
                    <span className="flex items-center gap-1 font-mono text-[11px] text-slate-300">
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      {user.document}
                    </span>
                  )}
                  {user.companyName && (
                    <span className="flex items-center gap-1 text-slate-300">
                      <Building className="w-3.5 h-3.5 text-slate-400" />
                      {user.companyName}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
              title="Fechar perfil"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Contact Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-3.5 mt-3.5 border-t border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => copyText(user.email, 'E-mail copiado!')}
              className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-200 font-mono text-[11px] flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
              title="Clique para copiar e-mail"
            >
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>{user.email}</span>
              <Copy className="w-2.5 h-2.5 text-slate-400" />
            </button>

            {user.phone ? (
              <a
                href={`https://wa.me/55${user.phone.replace(/\D/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold text-[11px] flex items-center gap-1.5 border border-emerald-500/30 transition-colors"
                title="Abrir conversa no WhatsApp"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>{user.phone}</span>
                <MessageCircle className="w-3 h-3 text-emerald-400" />
              </a>
            ) : (
              <span className="text-[11px] text-slate-500">Sem telefone cadastrado</span>
            )}
          </div>
        </div>

        {/* Highlight Metrics Strip */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 p-3 sm:p-5 bg-slate-50 border-b border-slate-100 shrink-0">
          {/* A-Points Balance */}
          <div className="bg-white p-3 sm:p-4 rounded-2xl border border-amber-200 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-700 flex items-center justify-center shrink-0">
              <Coins className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Saldo A-Points
              </span>
              <span className="text-base sm:text-xl font-black text-amber-900 leading-tight block truncate">
                {Number(user.aPoints || 0)} pts
              </span>
            </div>
          </div>

          {/* Orders Count */}
          <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Total de Pedidos
              </span>
              <span className="text-base sm:text-xl font-black text-slate-900 leading-tight block">
                {orders.length}
              </span>
            </div>
          </div>

          {/* Total Spent */}
          <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <Coins className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Total em Compras
              </span>
              <span className="text-xs sm:text-lg font-black text-emerald-800 leading-tight block truncate">
                {Number(summary.totalSpent || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-4 sm:px-6 pt-3 border-b border-slate-100 bg-white flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`py-2.5 px-3.5 font-bold text-xs rounded-t-xl transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'orders'
                ? 'border-amber-500 text-slate-950 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Package className="w-4 h-4 text-amber-600" />
            <span>O que comprou ({orders.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('points')}
            className={`py-2.5 px-3.5 font-bold text-xs rounded-t-xl transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'points'
                ? 'border-amber-500 text-slate-950 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Coins className="w-4 h-4 text-amber-600" />
            <span>Extrato A-Points ({transactions.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('support')}
            className={`py-2.5 px-3.5 font-bold text-xs rounded-t-xl transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'support'
                ? 'border-amber-500 text-slate-950 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            <span>Recuperação & Suporte</span>
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
              <span className="text-xs font-bold">Carregando histórico do cliente...</span>
            </div>
          ) : activeTab === 'orders' ? (
            /* ORDERS / PURCHASES TAB */
            <div className="space-y-3">
              {orders.length === 0 ? (
                <div className="py-16 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-200 text-slate-400 flex items-center justify-center mx-auto">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-700">Nenhum pedido realizado</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Este cliente ainda não realizou compras registradas no portal.
                  </p>
                </div>
              ) : (
                orders.map((order) => {
                  const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString('pt-BR') : 'Data não informada';
                  const itemsList = Array.isArray(order.items) ? order.items : [];

                  return (
                    <div 
                      key={order.id} 
                      className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-3 hover:border-slate-300 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900">
                            Pedido #{order.id.slice(-6).toUpperCase()}
                          </span>
                          <span className="text-slate-400">•</span>
                          <span className="text-slate-500">{orderDate}</span>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-xs font-black text-slate-900">
                            Total: {(Number(order.totalAmount) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            {order.status || 'Concluído'}
                          </span>
                        </div>
                      </div>

                      {/* Items Purchased */}
                      <div className="space-y-2">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                          Itens do Pedido ({itemsList.length}):
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {itemsList.map((item, idx) => (
                            <div 
                              key={idx} 
                              className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-2 text-xs"
                            >
                              <div className="min-w-0">
                                <div className="font-bold text-slate-800 truncate" title={item.name}>
                                  {item.name}
                                </div>
                                <div className="text-[11px] text-slate-400 font-medium">
                                  Qtd: <strong className="text-slate-700">{item.quantity || 1}</strong>
                                </div>
                              </div>
                              {item.price && (
                                <span className="font-bold text-slate-900 shrink-0">
                                  {(Number(item.price) * (item.quantity || 1)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {order.notes && (
                        <p className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg italic">
                          Obs: {order.notes}
                        </p>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          ) : activeTab === 'points' ? (
            /* FIDELITY POINTS LEDGER TAB */
            <div className="space-y-3">
              {transactions.length === 0 ? (
                <div className="py-16 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-200 text-slate-400 flex items-center justify-center mx-auto">
                    <Coins className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-700">Nenhuma movimentação de pontos</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Este cliente ainda não possui histórico de ganho ou resgate de A-Points.
                  </p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs divide-y divide-slate-100 text-xs">
                  {transactions.map((tx) => {
                    const pts = Number(tx.pointsEarned || 0);
                    const isCredit = pts > 0;
                    const dateStr = tx.createdAt ? new Date(tx.createdAt).toLocaleString('pt-BR') : '';

                    return (
                      <div key={tx.id} className="p-3.5 sm:p-4 flex items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            isCredit ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'
                          }`}>
                            {isCredit ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                          </div>

                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 truncate">
                              {tx.notes || (isCredit ? 'Pontos creditados por compra' : 'Resgate de recompensa')}
                            </div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                              <span>{dateStr}</span>
                              {tx.orderId && (
                                <span className="font-mono text-slate-500">
                                  Pedido #{tx.orderId.slice(-6).toUpperCase()}
                                </span>
                              )}
                              {tx.source && (
                                <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-mono text-[9px]">
                                  {tx.source}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className={`text-sm sm:text-base font-black ${
                            isCredit ? 'text-emerald-600' : 'text-red-600'
                          }`}>
                            {isCredit ? `+${pts}` : pts} pts
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* SUPPORT & ACCOUNT RECOVERY TAB */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* Box 1: Account Recovery & Password Support */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-slate-900 font-black text-sm">
                    <KeyRound className="w-4 h-4 text-amber-600" />
                    <span>Recuperação de Senha & Acesso</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Preste suporte imediato caso o cliente não consiga entrar ou tenha esquecido a senha.
                  </p>

                  {/* Temporary Password Result Alert */}
                  {tempPasswordResult && (
                    <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-300 space-y-2 animate-in fade-in">
                      <div className="text-xs font-bold text-amber-900">
                        Senha temporária gerada:
                      </div>
                      <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-amber-200 font-mono font-black text-amber-950 text-sm">
                        <span>{tempPasswordResult.tempPassword}</span>
                        <button
                          type="button"
                          onClick={() => copyText(tempPasswordResult.tempPassword, 'Senha copiada!')}
                          className="text-xs text-amber-700 hover:text-amber-900 flex items-center gap-1 font-bold cursor-pointer"
                        >
                          <Copy className="w-3 h-3" /> Copiar
                        </button>
                      </div>
                      <p className="text-[10px] text-amber-800">
                        Ao entrar com esta senha, o cliente será obrigado a cadastrar uma nova senha pessoal.
                      </p>
                      {tempPasswordResult.whatsappMessage && (
                        <button
                          type="button"
                          onClick={() => copyText(tempPasswordResult.whatsappMessage, 'Mensagem WhatsApp copiada!')}
                          className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>Copiar Mensagem para WhatsApp</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    disabled={generatingTemp}
                    onClick={handleGenerateTempPassword}
                    className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-2xs"
                  >
                    {generatingTemp ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                    <span>Gerar Senha Provisória Imediata</span>
                  </button>

                  <button
                    type="button"
                    disabled={sendingReset}
                    onClick={handleSendResetEmail}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 border border-slate-200"
                  >
                    {sendingReset ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4 text-slate-500" />}
                    <span>Enviar E-mail com Código de Redefinição</span>
                  </button>
                </div>
              </div>

              {/* Box 2: Manual A-Points Adjustment Form */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-slate-900 font-black text-sm">
                    <Coins className="w-4 h-4 text-amber-600" />
                    <span>Ajuste Manual de Pontos</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Bonifique ou debite A-Points com registro no extrato do cliente.
                  </p>
                </div>

                <form onSubmit={handleAdjustPoints} className="space-y-3">
                  <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setPointsType('add')}
                      className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                        pointsType === 'add' ? 'bg-white text-emerald-800 shadow-2xs font-black' : 'text-slate-500'
                      }`}
                    >
                      + Bonificar (Crédito)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPointsType('sub')}
                      className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                        pointsType === 'sub' ? 'bg-white text-red-800 shadow-2xs font-black' : 'text-slate-500'
                      }`}
                    >
                      - Descontar (Débito)
                    </button>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Quantidade de Pontos *
                    </label>
                    <input
                      type="number"
                      min="1"
                      placeholder="Ex: 50"
                      value={pointsAmount}
                      onChange={(e) => setPointsAmount(e.target.value)}
                      className="w-full py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Motivo / Justificativa *
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Bonificação de cortesia pós-venda"
                      value={pointsReason}
                      onChange={(e) => setPointsReason(e.target.value)}
                      className="w-full py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-amber-500 focus:bg-white"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingPoints || !pointsAmount}
                    className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-2xs"
                  >
                    {submittingPoints ? <Loader2 className="w-4 h-4 animate-spin" /> : <Coins className="w-4 h-4" />}
                    <span>Confirmar Ajuste de Pontos</span>
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:px-6 border-t border-slate-100 bg-white flex items-center justify-between shrink-0 text-xs">
          <span className="text-[11px] text-slate-400">
            ID: <strong className="font-mono text-slate-600">{user.id}</strong>
          </span>

          <div className="flex items-center gap-2">
            {onDeleteCustomer && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onDeleteCustomer(user.id, user.name);
                }}
                className="py-1.5 px-3 rounded-xl text-red-600 hover:bg-red-50 text-xs font-bold transition-colors cursor-pointer"
              >
                Revogar Acesso
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="btn-secondary text-xs py-2 px-5 font-bold cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
