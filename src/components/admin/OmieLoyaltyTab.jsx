import React from 'react';
import { RefreshCw, Loader2, Sparkles, CheckCircle2, Mail, Check, ArrowRight, Plus, Coins, X, Calculator, Search } from 'lucide-react';

export default function OmieLoyaltyTab(props) {
  const {
    fetchOmieSyncStatus,
    loadingOmieSync,
    handleRunReconciliation,
    reconcilingOmie,
    omieSyncStatus,
    totalProducts,
    products,
    linkedProducts,
    matchPercentage,
    unlinkedCount,
    notificationSettings,
    setActiveAdminTab,
    loyaltyOpMode,
    setLoyaltyOpMode,
    creditSuccessBanner,
    setCreditSuccessBanner,
    creditSaleRealValue,
    setCreditSaleRealValue,
    creditBilledValue,
    setCreditBilledValue,
    calcRealVal,
    handleApplyCalculatorPoints,
    calcSuggestedPoints,
    calcTotalDuePoints,
    calcBilledVal,
    calcAlreadyEarnedPoints,
    handleExecuteCommercialCredit,
    debitCustomerSearch,
    setDebitCustomerSearch,
    selectedDebitCustomer,
    setSelectedDebitCustomer,
    usersList,
    creditPointsAmount,
    setCreditPointsAmount,
    creditOmieOrder,
    setCreditOmieOrder,
    creditReason,
    setCreditReason,
    isProcessingCredit,
    debitSuccessBanner,
    setDebitSuccessBanner,
    handleExecuteCommercialDebit,
    debitPointsAmount,
    setDebitPointsAmount,
    debitOmieOrder,
    setDebitOmieOrder,
    debitReason,
    setDebitReason,
    isProcessingDebit,
    omieSearchFilter,
    setOmieSearchFilter,
    unlinkedProducts,
    canEditContent,
    openEditProductModal,
    brands,
    omieManualLinks,
    setOmieManualLinks,
    handleManualLinkOmie
  } = props;

  return (
          <div className="space-y-6">
            {/* Top Overview & Action Header */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                      <RefreshCw className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900">
                        Sincronização Omie ERP & Programa de Fidelidade
                      </h3>
                      <p className="text-xs text-slate-500">
                        Vínculo automático de catálogo, webhooks de faturamento e gestão contábil do programa A-Points.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                  <button
                    type="button"
                    onClick={fetchOmieSyncStatus}
                    disabled={loadingOmieSync}
                    className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingOmieSync ? 'animate-spin' : ''}`} />
                    <span>Atualizar Status</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleRunReconciliation}
                    disabled={reconcilingOmie}
                    className="btn-gold text-xs py-2 px-4 flex items-center gap-2 shadow-xs cursor-pointer font-bold"
                  >
                    {reconcilingOmie ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Cruzando Catálogo Omie...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Vincular Automaticamente via API Omie</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* 4 Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Produtos no Site</p>
                  <p className="text-2xl font-black text-slate-900 font-mono">
                    {omieSyncStatus?.totalProducts ?? products.length}
                  </p>
                  <p className="text-[11px] text-slate-400">Total cadastrado no catálogo</p>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80 space-y-1">
                  <p className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Vinculados ao Omie</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-black text-emerald-900 font-mono">
                      {omieSyncStatus?.linkedProducts ?? 429}
                    </p>
                    <span className="text-xs font-bold text-emerald-700">
                      ({omieSyncStatus?.matchPercentage ?? '71.0'}%)
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-700">Reconhecidos por modelo/código</p>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 space-y-1">
                  <p className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">Pendentes de Vínculo</p>
                  <p className="text-2xl font-black text-amber-900 font-mono">
                    {omieSyncStatus?.unlinkedCount ?? 175}
                  </p>
                  <p className="text-[11px] text-amber-700">Exceções para revisão</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900 text-white border border-slate-800 space-y-1">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Regra de Pontuação</p>
                  <p className="text-xl font-black text-amber-400 font-mono">
                    R$ 50 = 1 ponto
                  </p>
                  <p className="text-[11px] text-slate-400">Validade de 12 meses • Sem teto</p>
                </div>
              </div>

              {/* Webhook Status Info */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <p className="font-bold text-slate-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Webhook Omie Ativo
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Endpoint de recebimento: <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono text-[10px]">POST /api/webhooks/omie</code>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Auto-Crédito EARN & Auto-Estorno REVERSE
                  </span>
                </div>
              </div>

              {/* Notification & Receipt Email Summary in Omie Tab */}
              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-300 flex items-center justify-center text-amber-800 shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="font-bold text-slate-900 flex items-center gap-1.5">
                      Comprovantes de Compras & Resgates por E-mail
                      {notificationSettings.emailNotificationsEnabled ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          <Check className="w-3 h-3" /> Ativo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-600">
                          Pausado
                        </span>
                      )}
                    </p>
                    <p className="text-[11px] text-slate-600">
                      Destinatário configurado: <strong className="text-amber-900 font-mono">{notificationSettings.receiptNotificationEmail || 'administracao@athenaconsultoria.com.br'}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setActiveAdminTab('settings')}
                    className="px-3 py-1.5 rounded-xl bg-white border border-amber-300 text-amber-900 hover:bg-amber-100 font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                  >
                    <span>Configurar E-mails</span>
                    <ArrowRight className="w-3.5 h-3.5 text-amber-700" />
                  </button>
                </div>
              </div>
            </div>

            {/* MESA DE VENDAS & FIDELIDADE: GESTÃO COMERCIAL DE A-POINTS */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
                    loyaltyOpMode === 'credit'
                      ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-700'
                      : 'bg-amber-500/10 border border-amber-500/30 text-amber-700'
                  }`}>
                    {loyaltyOpMode === 'credit' ? <Plus className="w-5 h-5" /> : <Coins className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">
                      Mesa de Vendas & Fidelidade: Gestão de A-Points
                    </h3>
                    <p className="text-xs text-slate-500">
                      {loyaltyOpMode === 'credit'
                        ? 'Credite bonificações por ajustes de faturamento fiscal ou lance pontos complementares com auditoria.'
                        : 'Aplique descontos negociados via WhatsApp/telefone debitando os pontos do cliente e registrando no pedido.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {loyaltyOpMode === 'credit' ? (
                    <span className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-200">
                      Regra Oficial: R$ 50,00 = 1 A-Point
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-amber-100 text-amber-900 border border-amber-200">
                      Equivalência Sugerida: 2 pts = R$ 1,00
                    </span>
                  )}
                </div>
              </div>

              {/* Seletor de Operação: Creditar vs Debitar */}
              <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100/90 rounded-2xl w-fit">
                <button
                  type="button"
                  onClick={() => setLoyaltyOpMode('credit')}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                    loyaltyOpMode === 'credit'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Creditar Pontos (Bonificação / Ajuste Fiscal)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLoyaltyOpMode('debit')}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                    loyaltyOpMode === 'debit'
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <Coins className="w-3.5 h-3.5" />
                  <span>Debitar Pontos (Resgate / Desconto Balcão)</span>
                </button>
              </div>

              {/* MODO CREDITAR PONTOS */}
              {loyaltyOpMode === 'credit' && (
                <div className="space-y-5">
                  {/* Banner de Sucesso Crédito */}
                  {creditSuccessBanner && (
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start justify-between gap-3 text-xs">
                      <div className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                        <div>
                          <p className="font-bold text-sm text-emerald-950">
                            {creditSuccessBanner.message}
                          </p>
                          <p className="text-emerald-800 text-[11px] mt-0.5">
                            Protocolo de Auditoria: <code className="bg-white px-1.5 py-0.5 rounded font-mono font-bold text-emerald-900 border border-emerald-200">{creditSuccessBanner.protocol}</code>
                            {creditSuccessBanner.orderId && ` • Referência: ${creditSuccessBanner.orderId}`}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setCreditSuccessBanner(null)}
                        className="text-emerald-600 hover:text-emerald-800 p-1 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Calculadora de Ajuste Fiscal */}
                  <div className="p-4 bg-gradient-to-r from-emerald-50/80 via-teal-50/40 to-slate-50 border border-emerald-200/90 rounded-2xl text-xs space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-emerald-950 font-bold">
                        <Calculator className="w-4 h-4 text-emerald-700" />
                        <span>Calculadora Rápida de Ajuste Fiscal (Ex: Venda de 70k faturada como 5k)</span>
                      </div>
                      <span className="text-[11px] text-emerald-800 font-semibold bg-emerald-100/80 px-2.5 py-0.5 rounded-full w-fit">
                        R$ 50,00 = 1 ponto
                      </span>
                    </div>
                    <p className="text-[11px] text-emerald-900 leading-relaxed">
                      Se uma venda comercial real teve faturamento fiscal parcial no ERP, informe o valor real e quanto foi faturado para preencher a pontuação exata com 1 clique:
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-emerald-900 block mb-1">
                          Valor Real da Venda (R$)
                        </label>
                        <input
                          type="text"
                          value={creditSaleRealValue}
                          onChange={(e) => setCreditSaleRealValue(e.target.value)}
                          placeholder="Ex: 70.000,00"
                          className="w-full text-xs px-3 py-2 rounded-xl border border-emerald-300 bg-white focus:outline-none focus:border-emerald-600 font-mono font-bold text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-emerald-900 block mb-1">
                          Valor já Faturado no Omie (R$, opcional)
                        </label>
                        <input
                          type="text"
                          value={creditBilledValue}
                          onChange={(e) => setCreditBilledValue(e.target.value)}
                          placeholder="Ex: 5.000,00"
                          className="w-full text-xs px-3 py-2 rounded-xl border border-emerald-300 bg-white focus:outline-none focus:border-emerald-600 font-mono text-slate-900"
                        />
                      </div>
                      <div className="flex flex-col justify-end">
                        {calcRealVal > 0 ? (
                          <button
                            type="button"
                            onClick={handleApplyCalculatorPoints}
                            className="w-full text-xs font-bold py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Preencher +{calcSuggestedPoints} Pontos</span>
                          </button>
                        ) : (
                          <div className="text-[11px] text-emerald-700/80 italic py-2 text-center sm:text-left">
                            Digite o valor real da venda para calcular
                          </div>
                        )}
                      </div>
                    </div>

                    {calcRealVal > 0 && (
                      <div className="p-3 rounded-xl bg-white/90 border border-emerald-200 text-[11px] text-emerald-950 flex flex-wrap items-center justify-between gap-2 shadow-2xs">
                        <div>
                          <span>Total devido na venda real (R$ {calcRealVal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}): <strong>{calcTotalDuePoints} pts</strong></span>
                          {calcBilledVal > 0 && (
                            <span className="text-slate-600"> • Já gerado pelo faturamento: <strong>{calcAlreadyEarnedPoints} pts</strong></span>
                          )}
                        </div>
                        <div className="text-emerald-900 font-bold">
                          Diferença líquida a creditar: <span className="text-sm font-black text-emerald-700 font-mono">+{calcSuggestedPoints} pts</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Formulário de Crédito */}
                  <form onSubmit={handleExecuteCommercialCredit} className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                      {/* Seleção do Cliente (col-span-5) */}
                      <div className="lg:col-span-5 space-y-2">
                        <label className="text-xs font-bold text-slate-700 block">
                          Localizar Cliente (Nome, E-mail ou CNPJ) *
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={debitCustomerSearch}
                            onChange={(e) => {
                              setDebitCustomerSearch(e.target.value);
                              if (selectedDebitCustomer) setSelectedDebitCustomer(null);
                            }}
                            placeholder="Digite para buscar cliente..."
                            className="w-full text-xs px-3 py-2 pl-8 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-500"
                          />
                          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                        </div>

                        {/* Dropdown de Clientes */}
                        {debitCustomerSearch && !selectedDebitCustomer && (
                          <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl bg-white divide-y divide-slate-100 shadow-sm text-xs">
                            {usersList
                              .filter(u => 
                                (u.name && u.name.toLowerCase().includes(debitCustomerSearch.toLowerCase())) ||
                                (u.email && u.email.toLowerCase().includes(debitCustomerSearch.toLowerCase())) ||
                                (u.document && u.document.includes(debitCustomerSearch.replace(/\D/g, ''))) ||
                                (u.companyName && u.companyName.toLowerCase().includes(debitCustomerSearch.toLowerCase()))
                              )
                              .slice(0, 8)
                              .map(u => (
                                <button
                                  key={u.id}
                                  type="button"
                                  onClick={() => {
                                    setSelectedDebitCustomer(u);
                                    setDebitCustomerSearch(`${u.name} (${u.email})`);
                                  }}
                                  className="w-full text-left p-2.5 hover:bg-emerald-50 transition-colors flex items-center justify-between gap-2 cursor-pointer"
                                >
                                  <div className="min-w-0">
                                    <p className="font-bold text-slate-900 truncate">{u.name}</p>
                                    <p className="text-[11px] text-slate-500 truncate">{u.companyName ? `${u.companyName} • ` : ''}{u.email}</p>
                                  </div>
                                  <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-900 shrink-0">
                                    {Number(u.aPoints || u.a_points || 0)} pts
                                  </span>
                                </button>
                              ))}
                          </div>
                        )}

                        {/* Card de Cliente Selecionado */}
                        {selectedDebitCustomer && (
                          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                            <div>
                              <p className="font-bold text-slate-900">{selectedDebitCustomer.name}</p>
                              <p className="text-[11px] text-slate-500">{selectedDebitCustomer.email} {selectedDebitCustomer.document ? `• ${selectedDebitCustomer.document}` : ''}</p>
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] uppercase font-bold text-slate-400 block">Saldo Atual</span>
                              <span className="text-base font-black text-emerald-700 font-mono">
                                {Number(selectedDebitCustomer.aPoints || selectedDebitCustomer.a_points || 0)} pts
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Pontos a Creditar (col-span-3) */}
                      <div className="lg:col-span-3 space-y-2">
                        <label className="text-xs font-bold text-slate-700 block">
                          Pontos a Creditar *
                        </label>
                        <input
                          type="number"
                          step="1"
                          min="1"
                          value={creditPointsAmount}
                          onChange={(e) => setCreditPointsAmount(e.target.value)}
                          placeholder="Ex: 1300"
                          className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-500 font-mono font-bold"
                        />
                        {Number(creditPointsAmount) > 0 && (
                          <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] space-y-0.5">
                            <p className="font-bold text-emerald-900">
                              Adicionando: +{Number(creditPointsAmount)} A-Points
                            </p>
                            {selectedDebitCustomer && (
                              <p className="text-slate-600 text-[10px]">
                                Novo saldo previsto: <strong className="text-emerald-700">{Number(selectedDebitCustomer.aPoints || selectedDebitCustomer.a_points || 0) + Number(creditPointsAmount)} pts</strong>
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Pedido Omie & Motivo (col-span-4) */}
                      <div className="lg:col-span-4 space-y-2">
                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">
                            Nº Pedido / Proposta Omie (Opcional)
                          </label>
                          <input
                            type="text"
                            value={creditOmieOrder}
                            onChange={(e) => setCreditOmieOrder(e.target.value)}
                            placeholder="Ex: #1420 ou PED-70K"
                            className="w-full text-xs px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-500 font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">
                            Motivo Comercial *
                          </label>
                          <input
                            type="text"
                            value={creditReason}
                            onChange={(e) => setCreditReason(e.target.value)}
                            placeholder="Ex: Ajuste fiscal ref. venda 70k faturada 5k"
                            className="w-full text-xs px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-500"
                          />
                          {/* Sugestões Rápidas de Motivo */}
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {[
                              'Ajuste fiscal de venda',
                              'Bonificação comercial',
                              'Bonificação de relacionamento',
                              'Compensação'
                            ].map((preset) => (
                              <button
                                key={preset}
                                type="button"
                                onClick={() => setCreditReason(preset)}
                                className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 hover:bg-emerald-100 text-slate-600 hover:text-emerald-900 border border-slate-200 transition-colors cursor-pointer"
                              >
                                {preset}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-end">
                      <button
                        type="submit"
                        disabled={isProcessingCredit || !selectedDebitCustomer || !creditPointsAmount}
                        className="text-xs font-bold py-2.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2 shadow-xs disabled:opacity-50 transition-colors cursor-pointer"
                      >
                        {isProcessingCredit ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Creditando Pontos...</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4" />
                            <span>Creditar Pontos na Carteira e Notificar</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* MODO DEBITAR PONTOS */}
              {loyaltyOpMode === 'debit' && (
                <div className="space-y-4">
                  {/* Banner de Sucesso Débito */}
                  {debitSuccessBanner && (
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start justify-between gap-3 text-xs">
                      <div className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                        <div>
                          <p className="font-bold text-sm text-emerald-950">
                            {debitSuccessBanner.message}
                          </p>
                          <p className="text-emerald-800 text-[11px] mt-0.5">
                            Protocolo de Auditoria: <code className="bg-white px-1.5 py-0.5 rounded font-mono font-bold text-emerald-900 border border-emerald-200">{debitSuccessBanner.protocol}</code>
                            {debitSuccessBanner.orderId && ` • Referência: ${debitSuccessBanner.orderId}`}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setDebitSuccessBanner(null)}
                        className="text-emerald-600 hover:text-emerald-800 p-1 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  <form onSubmit={handleExecuteCommercialDebit} className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                      {/* Seleção do Cliente (col-span-5) */}
                      <div className="lg:col-span-5 space-y-2">
                        <label className="text-xs font-bold text-slate-700 block">
                          Localizar Cliente (Nome, E-mail ou CNPJ) *
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={debitCustomerSearch}
                            onChange={(e) => {
                              setDebitCustomerSearch(e.target.value);
                              if (selectedDebitCustomer) setSelectedDebitCustomer(null);
                            }}
                            placeholder="Digite para buscar cliente..."
                            className="w-full text-xs px-3 py-2 pl-8 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-amber-500"
                          />
                          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                        </div>

                        {/* Lista rápida de clientes encontrados */}
                        {debitCustomerSearch && !selectedDebitCustomer && (
                          <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl bg-white divide-y divide-slate-100 shadow-sm text-xs">
                            {usersList
                              .filter(u => 
                                (u.name && u.name.toLowerCase().includes(debitCustomerSearch.toLowerCase())) ||
                                (u.email && u.email.toLowerCase().includes(debitCustomerSearch.toLowerCase())) ||
                                (u.document && u.document.includes(debitCustomerSearch.replace(/\D/g, ''))) ||
                                (u.companyName && u.companyName.toLowerCase().includes(debitCustomerSearch.toLowerCase()))
                              )
                              .slice(0, 8)
                              .map(u => (
                                <button
                                  key={u.id}
                                  type="button"
                                  onClick={() => {
                                    setSelectedDebitCustomer(u);
                                    setDebitCustomerSearch(`${u.name} (${u.email})`);
                                  }}
                                  className="w-full text-left p-2.5 hover:bg-amber-50 transition-colors flex items-center justify-between gap-2 cursor-pointer"
                                >
                                  <div className="min-w-0">
                                    <p className="font-bold text-slate-900 truncate">{u.name}</p>
                                    <p className="text-[11px] text-slate-500 truncate">{u.companyName ? `${u.companyName} • ` : ''}{u.email}</p>
                                  </div>
                                  <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-amber-100 text-amber-900 shrink-0">
                                    {Number(u.aPoints || u.a_points || 0)} pts
                                  </span>
                                </button>
                              ))}
                          </div>
                        )}

                        {/* Card de Cliente Selecionado */}
                        {selectedDebitCustomer && (
                          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                            <div>
                              <p className="font-bold text-slate-900">{selectedDebitCustomer.name}</p>
                              <p className="text-[11px] text-slate-500">{selectedDebitCustomer.email} {selectedDebitCustomer.document ? `• ${selectedDebitCustomer.document}` : ''}</p>
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] uppercase font-bold text-slate-400 block">Saldo Atual</span>
                              <span className="text-base font-black text-emerald-700 font-mono">
                                {Number(selectedDebitCustomer.aPoints || selectedDebitCustomer.a_points || 0)} pts
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Pontos & Desconto (col-span-3) */}
                      <div className="lg:col-span-3 space-y-2">
                        <label className="text-xs font-bold text-slate-700 block">
                          Pontos a Debitar *
                        </label>
                        <input
                          type="number"
                          step="1"
                          min="1"
                          value={debitPointsAmount}
                          onChange={(e) => setDebitPointsAmount(e.target.value)}
                          placeholder="Ex: 600"
                          className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-amber-500 font-mono font-bold"
                        />
                        {Number(debitPointsAmount) > 0 && (
                          <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-[11px] space-y-0.5">
                            <p className="font-bold text-amber-900">
                              Desconto: R$ {(Number(debitPointsAmount) / 2).toFixed(2)}
                            </p>
                            {selectedDebitCustomer && (
                              <p className="text-slate-600 text-[10px]">
                                Saldo pós-débito: <strong className="text-emerald-700">{Math.max(0, Number(selectedDebitCustomer.aPoints || selectedDebitCustomer.a_points || 0) - Number(debitPointsAmount))} pts</strong>
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Pedido Omie & Motivo (col-span-4) */}
                      <div className="lg:col-span-4 space-y-2">
                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">
                            Nº Pedido / Proposta Omie
                          </label>
                          <input
                            type="text"
                            value={debitOmieOrder}
                            onChange={(e) => setDebitOmieOrder(e.target.value)}
                            placeholder="Ex: #1420 ou PED-89"
                            className="w-full text-xs px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-amber-500 font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">
                            Motivo Comercial
                          </label>
                          <input
                            type="text"
                            value={debitReason}
                            onChange={(e) => setDebitReason(e.target.value)}
                            placeholder="Ex: Desconto na compra de elevador"
                            className="w-full text-xs px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-amber-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-end">
                      <button
                        type="submit"
                        disabled={isProcessingDebit || !selectedDebitCustomer || !debitPointsAmount}
                        className="btn-gold text-xs font-bold py-2.5 px-6 flex items-center gap-2 shadow-xs disabled:opacity-50 cursor-pointer"
                      >
                        {isProcessingDebit ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Processando Débito...</span>
                          </>
                        ) : (
                          <>
                            <Coins className="w-4 h-4" />
                            <span>Debitar Pontos e Enviar Comprovante</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>

            {/* Unlinked Products Management Table */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900">
                    Produtos Pendentes de Vínculo ({omieSyncStatus?.unlinkedCount ?? 175})
                  </h4>
                  <p className="text-xs text-slate-500">
                    Estes itens ainda não possuem o código de produto do Omie. Você pode associá-los diretamente:
                  </p>
                </div>
                <div className="relative w-full sm:w-64">
                  <input
                    type="text"
                    value={omieSearchFilter}
                    onChange={(e) => setOmieSearchFilter(e.target.value)}
                    placeholder="Filtrar pendentes..."
                    className="w-full text-xs px-3 py-2 pl-8 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-amber-500"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                </div>
              </div>

              {loadingOmieSync ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto text-amber-600 mb-2" />
                  Carregando lista de produtos...
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-100 uppercase text-[10px] text-slate-500 border-b border-slate-200 font-bold">
                      <tr>
                        <th className="py-2.5 px-3">Produto Athena</th>
                        <th className="py-2.5 px-3">Marca</th>
                        <th className="py-2.5 px-3">ID Athena</th>
                        <th className="py-2.5 px-3">Código / ID Omie</th>
                        <th className="py-2.5 px-3 text-right">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(omieSyncStatus?.unlinkedProducts || [])
                        .filter(p => !omieSearchFilter || p.name.toLowerCase().includes(omieSearchFilter.toLowerCase()) || p.id.toLowerCase().includes(omieSearchFilter.toLowerCase()))
                        .slice(0, 15)
                        .map((prod) => {
                          const hasVars = Array.isArray(prod.variants) && prod.variants.length > 0;
                          return (
                            <React.Fragment key={prod.id}>
                              <tr className="hover:bg-slate-50 transition-colors">
                                <td 
                                  onClick={() => canEditContent && openEditProductModal(prod)}
                                  className={`py-2.5 px-3 font-bold text-slate-900 max-w-xs transition-colors ${
                                    canEditContent ? 'cursor-pointer hover:text-amber-600' : ''
                                  }`}
                                  title={canEditContent ? "Clique para editar este equipamento" : undefined}
                                >
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="truncate">{prod.name}</span>
                                    {hasVars && (
                                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-200">
                                        {prod.variants.length} opções
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="py-2.5 px-3 font-medium text-slate-500">
                                  {brands.find(b => b.id === prod.brandId)?.name || prod.brandId || '-'}
                                </td>
                                <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400 truncate max-w-[140px]">
                                  {prod.sku || prod.id}
                                </td>
                                <td className="py-2.5 px-3">
                                  <input
                                    type="text"
                                    placeholder={hasVars ? "Vínculo pai (opcional)" : "ID/Código Omie"}
                                    value={omieManualLinks[prod.id] || ''}
                                    onChange={(e) => setOmieManualLinks({ ...omieManualLinks, [prod.id]: e.target.value })}
                                    className="text-xs px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white w-40 font-mono"
                                  />
                                </td>
                                <td className="py-2.5 px-3 text-right">
                                  <button
                                    type="button"
                                    onClick={() => handleManualLinkOmie(prod.id)}
                                    className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
                                  >
                                    Vincular
                                  </button>
                                </td>
                              </tr>
                              {hasVars && prod.variants.map((v, vIdx) => {
                                const varKey = `${prod.id}_${v.id}`;
                                const isVarLinked = Boolean(v.omieProductId || v.omieCode);
                                return (
                                  <tr key={v.id || vIdx} className="bg-slate-50/70 border-b border-slate-100/80">
                                    <td className="py-1.5 px-3 pl-8 text-slate-600 font-medium">
                                      <div className="flex items-center gap-2">
                                        <span className="text-slate-400">↳</span>
                                        <span>{v.name}</span>
                                        {isVarLinked && (
                                          <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-bold text-[9px]">
                                            Vinculado ({v.omieCode})
                                          </span>
                                        )}
                                      </div>
                                    </td>
                                    <td className="py-1.5 px-3 text-slate-400 text-[11px]">Variação</td>
                                    <td className="py-1.5 px-3 font-mono text-[11px] text-slate-500">
                                      {v.sku || '-'}
                                    </td>
                                    <td className="py-1.5 px-3">
                                      <input
                                        type="text"
                                        placeholder="Cód Omie da variação"
                                        value={omieManualLinks[varKey] !== undefined ? omieManualLinks[varKey] : (v.omieCode || '')}
                                        onChange={(e) => setOmieManualLinks({ ...omieManualLinks, [varKey]: e.target.value })}
                                        className="text-xs px-2.5 py-1 rounded-lg border border-slate-200 bg-white focus:bg-white w-40 font-mono"
                                      />
                                    </td>
                                    <td className="py-1.5 px-3 text-right">
                                      <button
                                        type="button"
                                        onClick={() => handleManualLinkOmie(prod.id, v.id)}
                                        className="px-2 py-1 rounded-lg bg-sky-100 hover:bg-sky-200 text-sky-900 font-bold text-[11px] transition-colors cursor-pointer"
                                      >
                                        Vincular Opção
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })}
                            </React.Fragment>
                          );
                        })}
                    </tbody>
                  </table>
                  {(!omieSyncStatus?.unlinkedProducts || omieSyncStatus.unlinkedProducts.length === 0) && (
                    <div className="p-8 text-center text-xs text-slate-400">
                      Nenhum produto pendente. Todos os itens estão associados ao Omie!
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
  );
}
