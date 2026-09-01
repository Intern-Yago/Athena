import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  CreditCard, 
  QrCode, 
  ShieldCheck, 
  Zap, 
  FileText, 
  CheckCircle2, 
  Landmark, 
  Clock, 
  ArrowRight,
  Copy,
  Check,
  Loader2,
  AlertCircle,
  Lock,
  MessageCircle,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { calculateInstallments, calculatePaymentGateways, formatBRL } from '../utils/installmentCalculator';

export default function InstallmentModal({ isOpen, onClose, productName, cashPrice, maxInstallments = 12 }) {
  const [selectedTab, setSelectedTab] = useState('pix');
  
  // Customer Form
  const [customer, setCustomer] = useState({
    name: '',
    email: '',
    cpfCnpj: '',
    phone: ''
  });

  // Credit Card Form
  const [card, setCard] = useState({
    holderName: '',
    number: '',
    expiry: '',
    ccv: '',
    installments: 1
  });

  // State machine
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [paymentResult, setPaymentResult] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('pending'); // 'pending' | 'confirmed' | 'failed'
  const [copied, setCopied] = useState(false);

  // Polling ref
  const pollingRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      // Reset state on close
      setPaymentResult(null);
      setPaymentStatus('pending');
      setErrorMessage(null);
      setIsSubmitting(false);
      if (pollingRef.current) clearInterval(pollingRef.current);
    }
  }, [isOpen]);

  // Polling for PIX / Payment confirmation
  useEffect(() => {
    if (paymentResult?.id && paymentStatus === 'pending') {
      pollingRef.current = setInterval(async () => {
        try {
          const res = await fetch(`/api/payments/charge/${paymentResult.id}/status`);
          if (res.ok) {
            const data = await res.json();
            if (data.status === 'RECEIVED' || data.status === 'CONFIRMED') {
              setPaymentStatus('confirmed');
              if (pollingRef.current) clearInterval(pollingRef.current);
            }
          }
        } catch (e) {
          // Silent polling error
        }
      }, 3500);
    }

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [paymentResult, paymentStatus]);

  if (!isOpen) return null;

  const installments = calculateInstallments(cashPrice, maxInstallments);
  const formattedCash = formatBRL(cashPrice);
  const gateways = calculatePaymentGateways(cashPrice);

  const selectedInstallmentData = installments.find(i => i.installments === Number(card.installments)) || installments[0];

  // Mask Helpers
  const handleCpfChange = (e) => {
    let v = e.target.value.replace(/\D/g, '');
    if (v.length <= 11) {
      v = v.replace(/(\d{3})(\d)/, '$1.$2');
      v = v.replace(/(\d{3})(\d)/, '$1.$2');
      v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    } else {
      v = v.slice(0, 14);
      v = v.replace(/^(\d{2})(\d)/, '$1.$2');
      v = v.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
      v = v.replace(/\.(\d{3})(\d)/, '.$1/$2');
      v = v.replace(/(\d{4})(\d)/, '$1-$2');
    }
    setCustomer(c => ({ ...c, cpfCnpj: v }));
  };

  const handlePhoneChange = (e) => {
    let v = e.target.value.replace(/\D/g, '').slice(0, 11);
    if (v.length > 2) v = `(${v.slice(0, 2)}) ${v.slice(2)}`;
    if (v.length > 9) v = `${v.slice(0, 10)}-${v.slice(10)}`;
    setCustomer(c => ({ ...c, phone: v }));
  };

  const handleCardNumberChange = (e) => {
    let v = e.target.value.replace(/\D/g, '').slice(0, 16);
    v = v.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCard(cd => ({ ...cd, number: v }));
  };

  const handleExpiryChange = (e) => {
    let v = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (v.length >= 2) v = `${v.slice(0, 2)}/${v.slice(2)}`;
    setCard(cd => ({ ...cd, expiry: v }));
  };

  const handleCopyPix = () => {
    const code = paymentResult?.pix?.payload || paymentResult?.pix?.encodedImage;
    if (code) {
      navigator.clipboard.writeText(paymentResult?.pix?.payload || '');
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // Submit Payment
  const handleSubmitPayment = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage(null);

    // Basic Validation
    if (!customer.name.trim()) {
      setErrorMessage('Por favor, informe seu Nome Completo.');
      return;
    }
    if (!customer.email.trim() || !customer.email.includes('@')) {
      setErrorMessage('Por favor, informe um E-mail válido para envio do comprovante.');
      return;
    }
    if (!customer.cpfCnpj.trim() || customer.cpfCnpj.replace(/\D/g, '').length < 11) {
      setErrorMessage('Por favor, informe um CPF ou CNPJ válido.');
      return;
    }

    let billingType = 'PIX';
    let chargeValue = gateways?.pix?.customerAmount || cashPrice;
    let cardPayload = null;

    if (selectedTab === 'pix') {
      billingType = 'PIX';
      chargeValue = gateways?.pix?.customerAmount || cashPrice;
    } else if (selectedTab === 'boleto') {
      billingType = 'BOLETO';
      chargeValue = gateways?.boleto?.customerAmount || cashPrice;
    } else if (selectedTab === 'debit') {
      billingType = 'DEBIT_CARD';
      chargeValue = gateways?.debit?.customerAmount || cashPrice;
    } else if (selectedTab === 'credit') {
      billingType = 'CREDIT_CARD';
      chargeValue = selectedInstallmentData.total;

      if (!card.number.replace(/\s/g, '') || card.number.replace(/\s/g, '').length < 15) {
        setErrorMessage('Por favor, informe um número de cartão de crédito válido.');
        return;
      }
      if (!card.expiry || !card.expiry.includes('/')) {
        setErrorMessage('Por favor, informe a validade do cartão (MM/AA).');
        return;
      }
      if (!card.ccv || card.ccv.length < 3) {
        setErrorMessage('Por favor, informe o código de segurança (CVV).');
        return;
      }

      const [expiryMonth, expiryYear] = card.expiry.split('/');
      const fullYear = expiryYear.length === 2 ? `20${expiryYear}` : expiryYear;

      cardPayload = {
        creditCard: {
          holderName: card.holderName || customer.name,
          number: card.number.replace(/\s/g, ''),
          expiryMonth,
          expiryYear: fullYear,
          ccv: card.ccv
        },
        creditCardHolderInfo: {
          name: card.holderName || customer.name,
          email: customer.email,
          cpfCnpj: customer.cpfCnpj.replace(/\D/g, ''),
          phone: customer.phone ? customer.phone.replace(/\D/g, '') : undefined
        }
      };
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/payments/charge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          customerName: customer.name,
          customerEmail: customer.email,
          customerCpfCnpj: customer.cpfCnpj,
          customerPhone: customer.phone,
          billingType: billingType === 'DEBIT_CARD' ? 'BOLETO' : billingType, // fallback for debit
          value: chargeValue,
          description: `Equipamento: ${productName || 'Athena'}`,
          ...(cardPayload || {})
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao processar o pagamento com o gateway.');
      }

      setPaymentResult(data);
      if (data.status === 'RECEIVED' || data.status === 'CONFIRMED') {
        setPaymentStatus('confirmed');
      }

    } catch (err) {
      setErrorMessage(err.message || 'Falha ao conectar com o serviço de pagamento.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div 
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-5 sm:p-7 max-w-xl w-full my-auto flex flex-col space-y-4 animate-in zoom-in-95 duration-200 max-h-[95vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 font-black flex items-center justify-center shadow-xs shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                Finalizar Compra Segura
              </h3>
              <p className="text-xs text-slate-500 line-clamp-1 max-w-[260px] sm:max-w-[340px]">
                {productName || 'Equipamento Athena'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ============================================================ */}
        {/* SUCCESS CONFIRMED STATE */}
        {/* ============================================================ */}
        {paymentStatus === 'confirmed' ? (
          <div className="py-8 px-4 text-center space-y-4 bg-emerald-50/60 rounded-3xl border border-emerald-200 animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-3xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-600/30">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xl font-black text-emerald-950">Pagamento Confirmado!</h4>
              <p className="text-xs text-emerald-800 max-w-md mx-auto">
                Seu pedido para <strong>{productName}</strong> foi aprovado com sucesso pelo sistema bancário.
              </p>
            </div>
            <div className="p-3 bg-white rounded-2xl border border-emerald-200 text-xs text-slate-600 max-w-sm mx-auto space-y-1 text-left">
              <div className="flex justify-between">
                <span className="text-slate-400">Status:</span>
                <span className="font-bold text-emerald-700">Faturado / Aprovado</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">ID da Transação:</span>
                <span className="font-mono text-[11px] text-slate-700">{paymentResult?.id}</span>
              </div>
            </div>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
              <a
                href={`https://wa.me/5561983485671?text=${encodeURIComponent(`Olá Athena! Acabei de realizar o pagamento do pedido ${paymentResult?.id} para o equipamento "${productName}". Gostaria de confirmar os detalhes do envio.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto btn-gold text-xs py-2.5 px-5 font-bold flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>Avisar no WhatsApp</span>
              </a>
              <button
                onClick={onClose}
                className="w-full sm:w-auto py-2.5 px-5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer"
              >
                Concluir
              </button>
            </div>
          </div>
        ) : paymentResult?.pix ? (
          /* ============================================================ */
          /* PIX QR CODE & COPIA E COLA DISPLAY */
          /* ============================================================ */
          <div className="space-y-4 py-2">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black text-emerald-800 uppercase tracking-wider block">
                  Valor a Pagar no PIX
                </span>
                <span className="text-2xl font-black text-emerald-950">
                  {gateways?.pix?.formattedCustomerAmount || formattedCash}
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-200/90 text-emerald-900 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                <Zap className="w-3 h-3 text-emerald-700" /> Aprovação Imediata
              </span>
            </div>

            {/* QR Code Container */}
            <div className="flex flex-col items-center justify-center p-5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
              {paymentResult.pix.encodedImage ? (
                <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-200">
                  <img 
                    src={`data:image/png;base64,${paymentResult.pix.encodedImage}`} 
                    alt="PIX QR Code" 
                    className="w-48 h-48 object-contain"
                  />
                </div>
              ) : (
                <div className="w-48 h-48 bg-white rounded-2xl border flex items-center justify-center text-slate-400">
                  <QrCode className="w-16 h-16" />
                </div>
              )}

              {/* Status Pulse */}
              <div className="flex items-center gap-2 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full animate-pulse">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Aguardando confirmação do pagamento...</span>
              </div>
            </div>

            {/* Copia e Cola */}
            {paymentResult.pix.payload && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                  Pix Copia e Cola
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={paymentResult.pix.payload}
                    className="flex-1 text-xs font-mono p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={handleCopyPix}
                    className={`py-2.5 px-4 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                      copied 
                        ? 'bg-emerald-600 text-white' 
                        : 'bg-slate-900 text-white hover:bg-slate-800'
                    }`}
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? 'Copiado!' : 'Copiar'}</span>
                  </button>
                </div>
              </div>
            )}

            <div className="pt-2 flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => setPaymentResult(null)}
                className="text-slate-500 hover:text-slate-800 text-[11px] underline cursor-pointer"
              >
                Voltar e alterar dados
              </button>
              <span className="text-[11px] text-slate-400">Expira em 3 dias úteis</span>
            </div>
          </div>
        ) : paymentResult?.bankSlipUrl ? (
          /* ============================================================ */
          /* BOLETO DISPLAY */
          /* ============================================================ */
          <div className="space-y-4 py-2">
            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black text-amber-900 uppercase tracking-wider block">
                  Boleto Gerado com Sucesso
                </span>
                <span className="text-2xl font-black text-amber-950">
                  {gateways?.boleto?.formattedCustomerAmount || formattedCash}
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-amber-200 text-amber-900 text-[10px] font-black uppercase tracking-wider">
                Vencimento em 3 dias
              </span>
            </div>

            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-center">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center mx-auto">
                <FileText className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-black text-slate-900">Seu boleto bancário está pronto!</h4>
                <p className="text-xs text-slate-500">
                  Pague pelo internet banking do seu banco ou imprima para pagar na lotérica/agência.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
                <a
                  href={paymentResult.bankSlipUrl || paymentResult.invoiceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto btn-gold text-xs py-2.5 px-5 font-bold flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Visualizar / Imprimir Boleto PDF</span>
                </a>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setPaymentResult(null)}
              className="text-slate-500 hover:text-slate-800 text-[11px] underline cursor-pointer"
            >
              Voltar e gerar outra forma
            </button>
          </div>
        ) : (
          /* ============================================================ */
          /* FORM / SELECTION STEP */
          /* ============================================================ */
          <form onSubmit={handleSubmitPayment} className="space-y-4">
            
            {/* Payment Method Selector Tabs */}
            <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-100/90 rounded-2xl shrink-0 text-xs font-bold">
              <button
                type="button"
                onClick={() => { setSelectedTab('pix'); setErrorMessage(null); }}
                className={`py-2 px-1 rounded-xl flex flex-col sm:flex-row items-center justify-center gap-1 transition-all cursor-pointer ${
                  selectedTab === 'pix'
                    ? 'bg-white text-emerald-950 shadow-xs border border-slate-200 font-black'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <QrCode className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-[11px]">PIX</span>
              </button>

              <button
                type="button"
                onClick={() => { setSelectedTab('credit'); setErrorMessage(null); }}
                className={`py-2 px-1 rounded-xl flex flex-col sm:flex-row items-center justify-center gap-1 transition-all cursor-pointer ${
                  selectedTab === 'credit'
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200 font-black'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5 text-amber-600" />
                <span className="text-[11px]">Crédito</span>
              </button>

              <button
                type="button"
                onClick={() => { setSelectedTab('debit'); setErrorMessage(null); }}
                className={`py-2 px-1 rounded-xl flex flex-col sm:flex-row items-center justify-center gap-1 transition-all cursor-pointer ${
                  selectedTab === 'debit'
                    ? 'bg-white text-sky-950 shadow-xs border border-slate-200 font-black'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Landmark className="w-3.5 h-3.5 text-sky-600" />
                <span className="text-[11px]">Débito</span>
              </button>

              <button
                type="button"
                onClick={() => { setSelectedTab('boleto'); setErrorMessage(null); }}
                className={`py-2 px-1 rounded-xl flex flex-col sm:flex-row items-center justify-center gap-1 transition-all cursor-pointer ${
                  selectedTab === 'boleto'
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200 font-black'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-amber-700" />
                <span className="text-[11px]">Boleto</span>
              </button>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* TAB-SPECIFIC PRICE SUMMARY */}
            {selectedTab === 'pix' && (
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black text-emerald-800 uppercase tracking-wider block">
                    Total no PIX à Vista
                  </span>
                  <span className="text-xl sm:text-2xl font-black text-emerald-950">
                    {gateways?.pix?.formattedCustomerAmount || formattedCash}
                  </span>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-200/80 text-emerald-900 text-[10px] font-black uppercase tracking-wider">
                  ⚡ Imediato
                </span>
              </div>
            )}

            {selectedTab === 'debit' && (
              <div className="p-3.5 rounded-2xl bg-sky-50/70 border border-sky-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black text-sky-800 uppercase tracking-wider block">
                    Total no Débito Online
                  </span>
                  <span className="text-xl sm:text-2xl font-black text-sky-950">
                    {gateways?.debit?.formattedCustomerAmount || formattedCash}
                  </span>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-sky-200/80 text-sky-900 text-[10px] font-black uppercase tracking-wider">
                  À Vista
                </span>
              </div>
            )}

            {selectedTab === 'boleto' && (
              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black text-amber-900 uppercase tracking-wider block">
                    Total no Boleto Bancário
                  </span>
                  <span className="text-xl sm:text-2xl font-black text-amber-950">
                    {gateways?.boleto?.formattedCustomerAmount || formattedCash}
                  </span>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-amber-200 text-amber-900 text-[10px] font-black uppercase tracking-wider">
                  3 Dias Úteis
                </span>
              </div>
            )}

            {/* TAB-SPECIFIC CREDIT CARD INSTALLMENTS PICKER */}
            {selectedTab === 'credit' && (
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-700 block">
                  Escolha o Parcelamento:
                </label>
                <div className="relative">
                  <select
                    value={card.installments}
                    onChange={(e) => setCard(cd => ({ ...cd, installments: Number(e.target.value) }))}
                    className="w-full text-xs font-bold p-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-800 appearance-none focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  >
                    {installments.map((inst) => (
                      <option key={inst.installments} value={inst.installments}>
                        {inst.installments}x de {inst.formattedInstallment} (Total: {inst.formattedTotal})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3.5 pointer-events-none" />
                </div>
              </div>
            )}

            {/* CUSTOMER CONTACT & FISCAL INFO */}
            <div className="space-y-2.5 pt-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <span>Dados para Faturamento & Entrega</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-600 block mb-1">Nome Completo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: João da Silva"
                    value={customer.name}
                    onChange={(e) => setCustomer(c => ({ ...c, name: e.target.value }))}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-600 block mb-1">CPF ou CNPJ *</label>
                  <input
                    type="text"
                    required
                    placeholder="000.000.000-00"
                    value={customer.cpfCnpj}
                    onChange={handleCpfChange}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-600 block mb-1">E-mail (para envio da NF) *</label>
                  <input
                    type="email"
                    required
                    placeholder="seu@email.com"
                    value={customer.email}
                    onChange={(e) => setCustomer(c => ({ ...c, email: e.target.value }))}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-600 block mb-1">Celular / WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    placeholder="(61) 98888-8888"
                    value={customer.phone}
                    onChange={handlePhoneChange}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* CREDIT CARD FIELDS */}
            {selectedTab === 'credit' && (
              <div className="space-y-2.5 pt-2 border-t border-slate-100">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Dados do Cartão de Crédito
                </div>

                <div className="space-y-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 block mb-1">Nome Impresso no Cartão *</label>
                    <input
                      type="text"
                      placeholder="Como está gravado no cartão"
                      value={card.holderName}
                      onChange={(e) => setCard(cd => ({ ...cd, holderName: e.target.value.toUpperCase() }))}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white uppercase focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="sm:col-span-2">
                      <label className="text-[10px] font-bold text-slate-600 block mb-1">Número do Cartão *</label>
                      <input
                        type="text"
                        placeholder="0000 0000 0000 0000"
                        value={card.number}
                        onChange={handleCardNumberChange}
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white font-mono focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-1.5">
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-1">Validade *</label>
                        <input
                          type="text"
                          placeholder="MM/AA"
                          value={card.expiry}
                          onChange={handleExpiryChange}
                          className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white text-center font-mono focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-1">CVV *</label>
                        <input
                          type="password"
                          maxLength={4}
                          placeholder="123"
                          value={card.ccv}
                          onChange={(e) => setCard(cd => ({ ...cd, ccv: e.target.value.replace(/\D/g, '') }))}
                          className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white text-center font-mono focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ACTION SUBMIT BUTTON */}
            <div className="pt-2 space-y-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full btn-gold text-sm py-3.5 justify-center font-black shadow-md rounded-2xl flex items-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processando Pagamento...</span>
                  </>
                ) : selectedTab === 'pix' ? (
                  <>
                    <Zap className="w-4 h-4 fill-current" />
                    <span>Gerar PIX para Pagamento ({gateways?.pix?.formattedCustomerAmount || formattedCash})</span>
                  </>
                ) : selectedTab === 'credit' ? (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span>Pagar {selectedInstallmentData.formattedTotal} no Cartão</span>
                  </>
                ) : selectedTab === 'boleto' ? (
                  <>
                    <FileText className="w-4 h-4" />
                    <span>Gerar Boleto Bancário ({gateways?.boleto?.formattedCustomerAmount || formattedCash})</span>
                  </>
                ) : (
                  <>
                    <Landmark className="w-4 h-4" />
                    <span>Pagar no Débito ({gateways?.debit?.formattedCustomerAmount || formattedCash})</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <div className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Ambiente Seguro & Criptografia 256-bit</span>
                </div>
                <a
                  href={`https://wa.me/5561983485671?text=${encodeURIComponent(`Olá Athena! Estou na tela de pagamento do equipamento "${productName}" e gostaria de suporte.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-900 hover:text-amber-950 font-bold underline"
                >
                  Ajuda no WhatsApp
                </a>
              </div>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
