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
  ChevronDown,
  ShoppingBag,
  Tag,
  Gift,
  Trash2
} from 'lucide-react';
import { calculateInstallments, calculatePaymentGateways, formatBRL } from '../utils/installmentCalculator';

export default function InstallmentModal({ 
  isOpen, 
  onClose, 
  productName, 
  cashPrice, 
  maxInstallments = 12,
  items = [],
  currentUser = null,
  onOrderCompleted
}) {
  const [selectedTab, setSelectedTab] = useState('pix');
  
  // Normalize items array
  const activeItems = items && items.length > 0 
    ? items 
    : (productName && cashPrice ? [{
        name: productName,
        price: Number(cashPrice),
        quantity: 1
      }] : []);

  const rawSubtotal = activeItems.reduce((sum, item) => sum + (Number(item.price) * (Number(item.quantity) || 1)), 0);

  // Customer Form with pre-fill from currentUser
  const [customer, setCustomer] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    cpfCnpj: currentUser?.document || '',
    phone: currentUser?.phone || ''
  });

  useEffect(() => {
    if (currentUser) {
      setCustomer(prev => ({
        name: prev.name || currentUser.name || '',
        email: prev.email || currentUser.email || '',
        cpfCnpj: prev.cpfCnpj || currentUser.document || '',
        phone: prev.phone || currentUser.phone || ''
      }));
    }
  }, [currentUser]);

  // Coupon Engine State
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

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
  const [showItemsList, setShowItemsList] = useState(false);

  // Polling ref
  const pollingRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      // Reset state on close
      setPaymentResult(null);
      setPaymentStatus('pending');
      setErrorMessage(null);
      setIsSubmitting(false);
      setCouponError(null);
      if (pollingRef.current) clearInterval(pollingRef.current);
    }
  }, [isOpen]);

  // Polling for PIX / Payment confirmation
  useEffect(() => {
    if (paymentResult?.id && paymentStatus === 'pending' && !paymentResult.isFreeOrder) {
      pollingRef.current = setInterval(async () => {
        try {
          const res = await fetch(`/api/payments/charge/${paymentResult.id}/status`);
          if (res.ok) {
            const data = await res.json();
            if (data.status === 'RECEIVED' || data.status === 'CONFIRMED') {
              setPaymentStatus('confirmed');
              if (pollingRef.current) clearInterval(pollingRef.current);
              if (onOrderCompleted) onOrderCompleted(data);
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
  }, [paymentResult, paymentStatus, onOrderCompleted]);

  if (!isOpen) return null;

  // Final Payable Calculation
  const discountedSubtotal = Math.max(0, rawSubtotal - couponDiscount);
  const isFreeOrder = discountedSubtotal === 0 && appliedCoupon !== null;

  const installments = calculateInstallments(discountedSubtotal, maxInstallments);
  const gateways = calculatePaymentGateways(discountedSubtotal);
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
    setCard(c => ({ ...c, number: v }));
  };

  const handleExpiryChange = (e) => {
    let v = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (v.length > 2) v = `${v.slice(0, 2)}/${v.slice(2)}`;
    setCard(c => ({ ...c, expiry: v }));
  };

  const handleCopyPix = () => {
    const code = paymentResult?.pix?.payload;
    if (code) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  // COUPON APPLICATION
  const handleApplyCoupon = async (e) => {
    if (e) e.preventDefault();
    if (!couponCodeInput.trim()) {
      setCouponError('Digite um código de cupom.');
      return;
    }

    setIsValidatingCoupon(true);
    setCouponError(null);

    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCodeInput.trim(),
          items: activeItems,
          customerEmail: customer.email,
          customerCpfCnpj: customer.cpfCnpj
        })
      });

      const data = await res.json();

      if (!res.ok || !data.valid) {
        setCouponError(data.error || 'Cupom inválido ou não aplicável.');
        setAppliedCoupon(null);
        setCouponDiscount(0);
      } else {
        setAppliedCoupon(data.coupon);
        setCouponDiscount(data.discountAmount);
        setCouponError(null);
      }
    } catch (err) {
      setCouponError('Erro ao consultar cupom. Tente novamente.');
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponCodeInput('');
    setCouponError(null);
  };

  // CHECKOUT SUBMISSION
  const handleSubmitPayment = async (method = 'PIX') => {
    setErrorMessage(null);

    // Form Validations
    if (!customer.name.trim()) {
      setErrorMessage('Por favor, preencha seu Nome Completo.');
      return;
    }
    const cleanCpf = customer.cpfCnpj.replace(/\D/g, '');
    if (cleanCpf.length !== 11 && cleanCpf.length !== 14) {
      setErrorMessage('Por favor, informe um CPF (11 dígitos) ou CNPJ (14 dígitos) válido.');
      return;
    }
    if (!customer.email.trim() || !customer.email.includes('@')) {
      setErrorMessage('Por favor, informe um e-mail válido para envio do comprovante e nota fiscal.');
      return;
    }

    // Card Specific Validations
    if (method === 'CREDIT_CARD' && !isFreeOrder) {
      if (!card.holderName.trim()) {
        setErrorMessage('Informe o nome impresso no cartão.');
        return;
      }
      const cleanCardNum = card.number.replace(/\D/g, '');
      if (cleanCardNum.length < 13 || cleanCardNum.length > 16) {
        setErrorMessage('Número do cartão inválido.');
        return;
      }
      if (!card.expiry.includes('/') || card.expiry.length !== 5) {
        setErrorMessage('Data de validade inválida (formato MM/AA).');
        return;
      }
      if (card.ccv.length < 3) {
        setErrorMessage('Código de segurança (CVV) inválido.');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const orderDescription = activeItems.length === 1 
        ? `${activeItems[0].name} - Athena Automotiva`
        : `Pedido Athena (${activeItems.length} itens) - #${Date.now().toString().slice(-6)}`;

      let payload = {
        customerName: customer.name.trim(),
        customerEmail: customer.email.trim().toLowerCase(),
        customerCpfCnpj: customer.cpfCnpj.trim(),
        customerPhone: customer.phone.trim(),
        billingType: isFreeOrder ? 'FREE' : method,
        value: isFreeOrder ? 0 : (
          method === 'PIX' ? gateways.pix.customerAmount :
          method === 'CREDIT_CARD' ? selectedInstallmentData.total :
          method === 'DEBIT_CARD' ? gateways.debit.customerAmount :
          gateways.boleto.customerAmount
        ),
        items: activeItems,
        couponCode: appliedCoupon ? appliedCoupon.code : undefined,
        description: orderDescription
      };

      if (method === 'CREDIT_CARD' && !isFreeOrder) {
        const [expMonth, expYear] = card.expiry.split('/');
        payload.creditCard = {
          holderName: card.holderName.trim(),
          number: card.number.replace(/\D/g, ''),
          expiryMonth: expMonth,
          expiryYear: `20${expYear}`,
          ccv: card.ccv
        };
        payload.creditCardHolderInfo = {
          name: customer.name.trim(),
          email: customer.email.trim(),
          cpfCnpj: customer.cpfCnpj.replace(/\D/g, ''),
          phone: customer.phone.replace(/\D/g, '')
        };
      }

      const res = await fetch('/api/payments/charge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Falha ao processar pagamento.');
      }

      setPaymentResult(data);

      if (data.isFreeOrder || data.status === 'CONFIRMED' || data.status === 'RECEIVED') {
        setPaymentStatus('confirmed');
        if (onOrderCompleted) onOrderCompleted(data);
      } else {
        setPaymentStatus('pending');
      }

    } catch (err) {
      setErrorMessage(err.message || 'Erro inesperado ao conectar ao gateway Asaas.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="relative bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* MODAL HEADER */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-extrabold text-sm sm:text-base leading-tight truncate">
                Finalizar Compra Segura
              </h3>
              <p className="text-xs text-slate-400 truncate">
                {activeItems.length === 1 
                  ? activeItems[0].name 
                  : `${activeItems.length} equipamentos no carrinho`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0 ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">

          {/* 1. ORDER SUMMARY & MULTI-ITEM DRAWER */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-amber-600" />
                <span className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                  Resumo do Pedido ({activeItems.length} {activeItems.length === 1 ? 'item' : 'itens'})
                </span>
              </div>
              {activeItems.length > 1 && (
                <button
                  type="button"
                  onClick={() => setShowItemsList(!showItemsList)}
                  className="text-xs text-amber-800 hover:text-amber-950 font-bold flex items-center gap-1"
                >
                  <span>{showItemsList ? 'Ocultar Itens' : 'Ver Todos os Itens'}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showItemsList ? 'rotate-180' : ''}`} />
                </button>
              )}
            </div>

            {/* Expandable items list */}
            {(showItemsList || activeItems.length === 1) && (
              <div className="space-y-2 pt-2 border-t border-slate-200/80 max-h-48 overflow-y-auto pr-1 divide-y divide-slate-100">
                {activeItems.map((item, idx) => (
                  <div key={idx} className="pt-2 first:pt-0 flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {item.image && (
                        <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 p-0.5 shrink-0 overflow-hidden flex items-center justify-center">
                          <img src={item.image} alt="" className="w-full h-full object-contain" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <span className="font-bold text-slate-900 block truncate">{item.name}</span>
                        <span className="text-[10px] text-slate-500 block">Qtd: {item.quantity || 1} • {formatBRL(item.price)} un.</span>
                      </div>
                    </div>
                    <span className="font-extrabold text-slate-900 shrink-0">
                      {formatBRL(Number(item.price) * (Number(item.quantity) || 1))}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Totals Breakdown */}
            <div className="pt-2 border-t border-slate-200 space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>Subtotal dos Produtos:</span>
                <span className="font-bold text-slate-900">{formatBRL(rawSubtotal)}</span>
              </div>

              {appliedCoupon && (
                <div className="flex items-center justify-between text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  <span className="flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5" /> Cupom {appliedCoupon.code} aplicado:
                  </span>
                  <span>- {formatBRL(couponDiscount)}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-slate-900 pt-1 border-t border-slate-200/60 font-black text-sm sm:text-base">
                <span>Total a Pagar:</span>
                <span className={isFreeOrder ? 'text-emerald-600' : 'text-amber-900'}>
                  {isFreeOrder ? 'GRÁTIS (100% OFF)' : formatBRL(discountedSubtotal)}
                </span>
              </div>
            </div>
          </div>

          {/* 2. COUPON INPUT SECTION */}
          {!paymentResult && (
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Gift className="w-4 h-4 text-amber-600" />
                  <span>Possui um Cupom de Desconto?</span>
                </label>
                {appliedCoupon && (
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-[11px] font-bold text-red-600 hover:text-red-800 flex items-center gap-0.5"
                  >
                    <Trash2 className="w-3 h-3" /> Remover
                  </button>
                )}
              </div>

              {!appliedCoupon ? (
                <form onSubmit={handleApplyCoupon} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={couponCodeInput}
                    onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                    placeholder="Ex: BEMVINDO10"
                    className="form-input text-xs uppercase font-mono tracking-wider flex-1 bg-white"
                  />
                  <button
                    type="submit"
                    disabled={isValidatingCoupon || !couponCodeInput.trim()}
                    className="btn-gold text-xs font-bold py-2 px-4 rounded-xl shadow-xs shrink-0 cursor-pointer disabled:opacity-50"
                  >
                    {isValidatingCoupon ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Aplicar'}
                  </button>
                </form>
              ) : (
                <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold">
                  <span>Cupom <strong>{appliedCoupon.code}</strong> ativado com sucesso!</span>
                  <Check className="w-4 h-4 text-emerald-600" />
                </div>
              )}

              {couponError && (
                <p className="text-[11px] text-red-600 font-semibold flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{couponError}</span>
                </p>
              )}
            </div>
          )}

          {/* 3. PAYMENT STATUS SUCCESS VIEW */}
          {paymentStatus === 'confirmed' ? (
            <div className="p-6 rounded-2xl bg-emerald-50 border-2 border-emerald-500 text-center space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-black text-emerald-950">
                  {isFreeOrder ? 'Pedido Gratuito Concluído!' : 'Pagamento Confirmado com Sucesso!'}
                </h4>
                <p className="text-xs text-emerald-800 max-w-md mx-auto">
                  {isFreeOrder 
                    ? 'Seu pedido cortesia foi faturado e registrado no seu perfil. Em instantes você receberá os detalhes no e-mail cadastrado.' 
                    : 'Recebemos a confirmação da sua transação. A nota fiscal e o comprovante foram encaminhados para o seu e-mail.'}
                </p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-emerald-200 text-xs text-slate-700 inline-block text-left font-mono">
                <div><strong>Pedido:</strong> #{paymentResult?.orderId || paymentResult?.id}</div>
                <div><strong>Status:</strong> FATURADO / APROVADO</div>
                <div><strong>Cliente:</strong> {customer.name}</div>
              </div>

              <div>
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-gold font-extrabold text-xs py-2.5 px-6 rounded-xl shadow-md cursor-pointer"
                >
                  Concluir e Fechar
                </button>
              </div>
            </div>
          ) : paymentResult?.billingType === 'PIX' && paymentResult?.pix?.encodedImage ? (
            /* PIX QR CODE & COPY/PASTE DISPLAY */
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-4 animate-in fade-in">
              <div className="space-y-1">
                <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-extrabold text-xs inline-block">
                  ⚡ Aguardando Pagamento via PIX
                </span>
                <p className="text-xs text-slate-500">
                  Abra o aplicativo do seu banco e escaneie o QR Code abaixo ou utilize o Pix Copia e Cola:
                </p>
              </div>

              {/* QR Code Image */}
              <div className="w-48 h-48 sm:w-56 sm:h-56 mx-auto bg-white p-2.5 rounded-2xl border border-slate-300 shadow-md flex items-center justify-center">
                <img
                  src={`data:image/png;base64,${paymentResult.pix.encodedImage}`}
                  alt="QR Code PIX Asaas"
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Value Indicator */}
              <div className="text-slate-900 font-black text-xl">
                {gateways.pix.formattedCustomerAmount}
              </div>

              {/* Copy Paste Input */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 max-w-md mx-auto">
                  <input
                    type="text"
                    readOnly
                    value={paymentResult.pix.payload}
                    className="form-input text-xs font-mono text-slate-600 bg-white truncate"
                  />
                  <button
                    type="button"
                    onClick={handleCopyPix}
                    className={`btn-gold text-xs font-bold py-2.5 px-4 rounded-xl shadow-xs shrink-0 flex items-center gap-1.5 ${
                      copied ? 'bg-emerald-600 text-white' : ''
                    }`}
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? 'Copiado!' : 'Copiar'}</span>
                  </button>
                </div>
              </div>

              {/* Real-time Polling Status Radar */}
              <div className="flex items-center justify-center gap-2 text-xs text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
                <span>Identificando pagamento em tempo real... Não feche esta janela.</span>
              </div>
            </div>
          ) : (
            /* PAYMENT CHECKOUT FORM & METHOD TABS */
            <div className="space-y-4">
              
              {/* If Free Order (100% OFF) */}
              {isFreeOrder ? (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-3 text-center">
                  <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto">
                    <Gift className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="font-extrabold text-sm text-emerald-950">Pedido Cortesia (100% de Desconto)</h4>
                    <p className="text-xs text-emerald-800">
                      Preencha seus dados abaixo para faturar o pedido e receber o acesso no seu e-mail.
                    </p>
                  </div>
                </div>
              ) : (
                /* Payment Method Switcher Tabs */
                <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200 text-xs font-bold select-none">
                  <button
                    type="button"
                    onClick={() => setSelectedTab('pix')}
                    className={`py-2 px-1 rounded-xl transition-all flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer ${
                      selectedTab === 'pix'
                        ? 'bg-white text-amber-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Zap className={`w-3.5 h-3.5 ${selectedTab === 'pix' ? 'text-amber-600' : 'text-slate-400'}`} />
                    <span>PIX</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedTab('credit')}
                    className={`py-2 px-1 rounded-xl transition-all flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer ${
                      selectedTab === 'credit'
                        ? 'bg-white text-amber-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <CreditCard className={`w-3.5 h-3.5 ${selectedTab === 'credit' ? 'text-amber-600' : 'text-slate-400'}`} />
                    <span>Crédito</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedTab('debit')}
                    className={`py-2 px-1 rounded-xl transition-all flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer ${
                      selectedTab === 'debit'
                        ? 'bg-white text-amber-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Landmark className={`w-3.5 h-3.5 ${selectedTab === 'debit' ? 'text-amber-600' : 'text-slate-400'}`} />
                    <span>Débito</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedTab('boleto')}
                    className={`py-2 px-1 rounded-xl transition-all flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer ${
                      selectedTab === 'boleto'
                        ? 'bg-white text-amber-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <FileText className={`w-3.5 h-3.5 ${selectedTab === 'boleto' ? 'text-amber-600' : 'text-slate-400'}`} />
                    <span>Boleto</span>
                  </button>
                </div>
              )}

              {/* CUSTOMER BILLING DATA (LEAD CAPTURE FOR CRM) */}
              <div className="space-y-3 bg-white p-4 rounded-2xl border border-slate-200">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Dados para Faturamento & Entrega</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: João da Silva"
                      value={customer.name}
                      onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                      className="form-input text-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      CPF ou CNPJ *
                    </label>
                    <input
                      type="text"
                      placeholder="000.000.000-00"
                      value={customer.cpfCnpj}
                      onChange={handleCpfChange}
                      className="form-input text-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      E-mail (para envio da NF) *
                    </label>
                    <input
                      type="email"
                      placeholder="seuemail@empresa.com.br"
                      value={customer.email}
                      onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                      className="form-input text-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Celular / WhatsApp *
                    </label>
                    <input
                      type="tel"
                      placeholder="(61) 98888-8888"
                      value={customer.phone}
                      onChange={handlePhoneChange}
                      className="form-input text-xs"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* CARD DETAILS FORM IF CREDIT CARD */}
              {!isFreeOrder && selectedTab === 'credit' && (
                <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Dados do Cartão de Crédito
                    </h4>
                    <span className="text-[10px] text-slate-400 font-mono">Processamento Seguro</span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        Parcelamento Desejado
                      </label>
                      <select
                        value={card.installments}
                        onChange={(e) => setCard({ ...card, installments: Number(e.target.value) })}
                        className="form-input text-xs font-semibold"
                      >
                        {installments.map((inst) => (
                          <option key={inst.installments} value={inst.installments}>
                            {inst.installments}x de {inst.formattedMonthly} (Total: {inst.formattedTotal})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        Nome Impresso no Cartão *
                      </label>
                      <input
                        type="text"
                        placeholder="NOME COMO NO CARTAO"
                        value={card.holderName}
                        onChange={(e) => setCard({ ...card, holderName: e.target.value.toUpperCase() })}
                        className="form-input text-xs uppercase"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          Número do Cartão *
                        </label>
                        <input
                          type="text"
                          placeholder="0000 0000 0000 0000"
                          value={card.number}
                          onChange={handleCardNumberChange}
                          className="form-input text-xs font-mono"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[11px] font-bold text-slate-700 block mb-1">
                            Validade *
                          </label>
                          <input
                            type="text"
                            placeholder="MM/AA"
                            value={card.expiry}
                            onChange={handleExpiryChange}
                            className="form-input text-xs font-mono text-center"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-slate-700 block mb-1">
                            CVV *
                          </label>
                          <input
                            type="password"
                            maxLength={4}
                            placeholder="123"
                            value={card.ccv}
                            onChange={(e) => setCard({ ...card, ccv: e.target.value.replace(/\D/g, '') })}
                            className="form-input text-xs font-mono text-center"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ERROR MESSAGE DISPLAY */}
              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* ACTION SUBMIT BUTTON */}
              <div className="pt-2 space-y-2">
                {isFreeOrder ? (
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleSubmitPayment('FREE')}
                    className="w-full btn-gold font-extrabold text-sm py-3.5 rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Faturando Pedido Cortesia...</span>
                      </>
                    ) : (
                      <>
                        <Gift className="w-4 h-4" />
                        <span>Resgatar Pedido Gratuito (100% OFF)</span>
                      </>
                    )}
                  </button>
                ) : selectedTab === 'pix' ? (
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleSubmitPayment('PIX')}
                    className="w-full btn-gold font-extrabold text-sm py-3.5 rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Gerando QR Code PIX Asaas...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4" />
                        <span>Gerar PIX para Pagamento ({gateways.pix.formattedCustomerAmount})</span>
                      </>
                    )}
                  </button>
                ) : selectedTab === 'credit' ? (
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleSubmitPayment('CREDIT_CARD')}
                    className="w-full btn-gold font-extrabold text-sm py-3.5 rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Processando no Cartão...</span>
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4" />
                        <span>Pagar {selectedInstallmentData.installments}x de {selectedInstallmentData.formattedMonthly}</span>
                      </>
                    )}
                  </button>
                ) : selectedTab === 'debit' ? (
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleSubmitPayment('DEBIT_CARD')}
                    className="w-full btn-gold font-extrabold text-sm py-3.5 rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Processando Débito...</span>
                      </>
                    ) : (
                      <>
                        <Landmark className="w-4 h-4" />
                        <span>Pagar no Débito Online ({gateways.debit.formattedCustomerAmount})</span>
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleSubmitPayment('BOLETO')}
                    className="w-full btn-gold font-extrabold text-sm py-3.5 rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Emitindo Boleto Bancário...</span>
                      </>
                    ) : (
                      <>
                        <FileText className="w-4 h-4" />
                        <span>Gerar Boleto Bancário ({gateways.boleto.formattedCustomerAmount})</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 shrink-0">
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Pagamento Seguro via Gateway Asaas</span>
          </div>

          <a
            href="https://wa.me/5561983485671?text=Olá!+Preciso+de+ajuda+com+minha+compra+no+site+Athena."
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-800 hover:text-amber-950 font-bold flex items-center gap-1 transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5 text-amber-600" />
            <span>Suporte no WhatsApp</span>
          </a>
        </div>

      </div>
    </div>
  );
}
