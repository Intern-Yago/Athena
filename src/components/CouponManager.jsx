import React, { useState, useEffect } from 'react';
import { 
  Gift, 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  Play, 
  Pause, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Tag, 
  Percent, 
  DollarSign, 
  Users, 
  Mail, 
  Calendar, 
  Layers, 
  ShoppingBag, 
  Shuffle, 
  X, 
  Loader2,
  Sparkles,
  ShieldAlert
} from 'lucide-react';

export default function CouponManager({ 
  products = [], 
  categories = [], 
  brands = [], 
  API_BASE_URL = '', 
  getAuthHeaders = () => ({}), 
  showNotification = () => {} 
}) {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'paused' | 'expired'
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form State
  const initialForm = {
    code: '',
    description: '',
    discountType: 'percentage', // 'percentage' | 'fixed'
    discountValue: '',
    maxDiscount: '',
    scopeType: 'all', // 'all' | 'products' | 'categories' | 'brands'
    targetProductIds: [],
    targetCategoryIds: [],
    targetBrandIds: [],
    minOrderAmount: '',
    minItemQuantity: '',
    customerType: 'all', // 'all' | 'registered' | 'specific_email'
    specificEmail: '',
    maxUsageTotal: '',
    maxUsagePerCustomer: '1',
    expiresAt: '',
    status: 'active'
  };

  const [form, setForm] = useState(initialForm);

  // Fetch Coupons
  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/coupons`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        setCoupons(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      showNotification('Erro ao carregar cupons do servidor.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  // Random Code Generator
  const generateRandomCode = () => {
    const prefixes = ['ATHENA', 'PROMO', 'VIP', 'ESPECIAL', 'SUPER', 'OFF'];
    const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
    const newCode = `${randomPrefix}-${randomHex}`;
    setForm(prev => ({ ...prev, code: newCode }));
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingCoupon(null);
    setForm(initialForm);
    generateRandomCode();
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (coupon) => {
    setEditingCoupon(coupon);
    setForm({
      code: coupon.code || '',
      description: coupon.description || '',
      discountType: coupon.discountType || 'percentage',
      discountValue: coupon.discountValue || '',
      maxDiscount: coupon.maxDiscount || '',
      scopeType: coupon.scopeType || 'all',
      targetProductIds: Array.isArray(coupon.targetProductIds) ? coupon.targetProductIds : [],
      targetCategoryIds: Array.isArray(coupon.targetCategoryIds) ? coupon.targetCategoryIds : [],
      targetBrandIds: Array.isArray(coupon.targetBrandIds) ? coupon.targetBrandIds : [],
      minOrderAmount: coupon.minOrderAmount || '',
      minItemQuantity: coupon.minItemQuantity || '',
      customerType: coupon.customerType || 'all',
      specificEmail: coupon.specificEmail || '',
      maxUsageTotal: coupon.maxUsageTotal || '',
      maxUsagePerCustomer: coupon.maxUsagePerCustomer || '1',
      expiresAt: coupon.expiresAt ? coupon.expiresAt.split('T')[0] : '',
      status: coupon.status || 'active'
    });
    setIsModalOpen(true);
  };

  // Save Coupon (Create or Update)
  const handleSaveCoupon = async (e) => {
    e.preventDefault();

    if (!form.code.trim()) {
      showNotification('Informe o código do cupom.', 'error');
      return;
    }

    const numVal = Number(form.discountValue);
    if (isNaN(numVal) || numVal <= 0) {
      showNotification('Informe um valor de desconto válido maior que zero.', 'error');
      return;
    }

    if (form.discountType === 'percentage' && numVal > 100) {
      showNotification('O desconto em porcentagem não pode ultrapassar 100%.', 'error');
      return;
    }

    // Strict Asaas rule hint for fixed value
    if (form.discountType === 'fixed' && numVal > 0 && !form.minOrderAmount) {
      // Suggest minimum order amount to prevent sub-R$ 5 transactions
      const suggestedMin = numVal + 5;
      form.minOrderAmount = suggestedMin;
    }

    setSaving(true);

    try {
      const url = editingCoupon 
        ? `${API_BASE_URL}/coupons/${editingCoupon.id}` 
        : `${API_BASE_URL}/coupons`;
      const method = editingCoupon ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Falha ao salvar cupom.');
      }

      showNotification(
        editingCoupon ? `Cupom "${form.code}" atualizado com sucesso!` : `Cupom "${form.code}" criado com sucesso!`,
        'success'
      );

      setIsModalOpen(false);
      fetchCoupons();
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  // Toggle Pause / Activate Status
  const handleToggleStatus = async (coupon) => {
    const newStatus = coupon.status === 'active' ? 'paused' : 'active';
    try {
      const res = await fetch(`${API_BASE_URL}/coupons/${coupon.id}`, {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        showNotification(
          newStatus === 'active' ? `Cupom "${coupon.code}" reativado!` : `Cupom "${coupon.code}" pausado.`,
          'info'
        );
        fetchCoupons();
      }
    } catch (err) {
      showNotification('Erro ao alterar status do cupom.', 'error');
    }
  };

  // Delete Coupon
  const handleDeleteCoupon = async (coupon) => {
    if (!window.confirm(`Tem certeza que deseja excluir o cupom "${coupon.code}"? Esta ação não pode ser desfeita.`)) {
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/coupons/${coupon.id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (res.ok) {
        showNotification(`Cupom "${coupon.code}" excluído.`, 'success');
        fetchCoupons();
      }
    } catch (err) {
      showNotification('Erro ao excluir cupom.', 'error');
    }
  };

  // Filtered list
  const filteredCoupons = coupons.filter(c => {
    const matchSearch = !searchTerm || 
      c.code.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.specificEmail && c.specificEmail.toLowerCase().includes(searchTerm.toLowerCase()));

    const isExpired = c.expiresAt && new Date(c.expiresAt) < new Date();

    if (statusFilter === 'active') return matchSearch && c.status === 'active' && !isExpired;
    if (statusFilter === 'paused') return matchSearch && c.status === 'paused';
    if (statusFilter === 'expired') return matchSearch && isExpired;
    return matchSearch;
  });

  const formatBRL = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);

  // Only products with price > 0 can be linked to coupons
  const purchasableProducts = products.filter(p => Number(p.price) > 0 && !p.priceNegotiable && p.status !== 'draft');

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Banner & Action */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 shadow-xs">
            <Gift className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-black text-slate-900 text-lg sm:text-xl leading-tight">
              Cupons de Desconto & Vouchers
            </h3>
            <p className="text-xs text-slate-500">
              Crie campanhas promocionais, cupons por e-mail exclusivo e regras de desconto com validação no checkout Asaas.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="btn-gold text-xs sm:text-sm font-extrabold py-3 px-5 rounded-2xl shadow-md inline-flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Criar Novo Cupom</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por código, e-mail ou descrição..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input pl-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          {[
            { id: 'all', label: `Todos (${coupons.length})` },
            { id: 'active', label: 'Ativos' },
            { id: 'paused', label: 'Pausados' },
            { id: 'expired', label: 'Expirados' }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Coupons List / Table */}
      {loading ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-amber-600 mx-auto" />
          <p className="text-xs text-slate-500 font-medium">Carregando cupons cadastrados...</p>
        </div>
      ) : filteredCoupons.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mx-auto">
            <Gift className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-slate-900 text-sm">Nenhum cupom encontrado</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchTerm ? 'Nenhum cupom corresponde à sua busca.' : 'Crie seu primeiro cupom para oferecer descontos aos seus clientes.'}
            </p>
          </div>
          {!searchTerm && (
            <button
              type="button"
              onClick={handleOpenCreate}
              className="btn-gold text-xs font-bold py-2.5 px-5 rounded-xl shadow-xs"
            >
              Criar Primeiro Cupom
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCoupons.map((coupon) => {
            const isExpired = coupon.expiresAt && new Date(coupon.expiresAt) < new Date();
            const isLimitReached = Number(coupon.maxUsageTotal) > 0 && Number(coupon.usedCount) >= Number(coupon.maxUsageTotal);
            const isPaused = coupon.status === 'paused';

            return (
              <div
                key={coupon.id}
                className={`bg-white rounded-3xl border p-5 shadow-2xs flex flex-col justify-between space-y-4 transition-all hover:shadow-md ${
                  isPaused ? 'border-slate-300 opacity-75 bg-slate-50/60' :
                  isExpired ? 'border-red-200 bg-red-50/20' :
                  'border-slate-200 hover:border-amber-400'
                }`}
              >
                {/* Header Card */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-sm px-3 py-1 rounded-xl bg-slate-900 text-amber-400 tracking-wider">
                        {coupon.code}
                      </span>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        isPaused ? 'bg-amber-100 text-amber-800' :
                        isExpired ? 'bg-red-100 text-red-800' :
                        isLimitReached ? 'bg-slate-200 text-slate-700' :
                        'bg-emerald-100 text-emerald-800'
                      }`}>
                        {isPaused ? 'Pausado' : isExpired ? 'Expirado' : isLimitReached ? 'Esgotado' : 'Ativo'}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="font-black text-base text-amber-900">
                        {coupon.discountType === 'percentage' 
                          ? `${coupon.discountValue}% OFF` 
                          : `- ${formatBRL(coupon.discountValue)}`}
                      </span>
                    </div>
                  </div>

                  {coupon.description && (
                    <p className="text-xs text-slate-600 font-medium line-clamp-2">
                      {coupon.description}
                    </p>
                  )}
                </div>

                {/* Details Pills */}
                <div className="space-y-1.5 text-[11px] text-slate-500 border-t border-slate-100 pt-3">
                  <div className="flex items-center justify-between">
                    <span>Escopo:</span>
                    <span className="font-bold text-slate-800">
                      {coupon.scopeType === 'all' ? 'Todo o Catálogo' :
                       coupon.scopeType === 'products' ? `${coupon.targetProductIds?.length || 0} produto(s)` :
                       coupon.scopeType === 'categories' ? `${coupon.targetCategoryIds?.length || 0} categoria(s)` :
                       `${coupon.targetBrandIds?.length || 0} marca(s)`}
                    </span>
                  </div>

                  {coupon.specificEmail && (
                    <div className="flex items-center justify-between text-amber-800 font-bold truncate">
                      <span>E-mail Exclusivo:</span>
                      <span className="truncate max-w-[150px]">{coupon.specificEmail}</span>
                    </div>
                  )}

                  {Number(coupon.minOrderAmount) > 0 && (
                    <div className="flex items-center justify-between">
                      <span>Pedido Mínimo:</span>
                      <span className="font-bold text-slate-800">{formatBRL(coupon.minOrderAmount)}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span>Usos Realizados:</span>
                    <span className="font-bold text-slate-900">
                      {coupon.usedCount || 0} {Number(coupon.maxUsageTotal) > 0 ? `/ ${coupon.maxUsageTotal}` : '(Ilimitado)'}
                    </span>
                  </div>

                  {coupon.expiresAt && (
                    <div className="flex items-center justify-between">
                      <span>Expira em:</span>
                      <span className={`font-bold ${isExpired ? 'text-red-600' : 'text-slate-800'}`}>
                        {new Date(coupon.expiresAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions Footer */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(coupon)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      coupon.status === 'active'
                        ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}
                    title={coupon.status === 'active' ? 'Pausar cupom' : 'Reativar cupom'}
                  >
                    {coupon.status === 'active' ? (
                      <>
                        <Pause className="w-3.5 h-3.5" />
                        <span>Pausar</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5" />
                        <span>Reativar</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(coupon)}
                      className="p-2 rounded-xl text-slate-500 hover:text-amber-800 hover:bg-amber-50 transition-colors"
                      title="Editar cupom"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteCoupon(coupon)}
                      className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Excluir cupom"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
          <div 
            className="relative bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Gift className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base">
                    {editingCoupon ? `Editar Cupom: ${editingCoupon.code}` : 'Criar Novo Cupom de Desconto'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Defina as regras, escopo, segmentação e validade da promoção.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSaveCoupon} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
              
              {/* 1. Código & Descrição */}
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Código do Cupom *
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Ex: BEMVINDO10"
                        value={form.code}
                        onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase().replace(/\s+/g, '') })}
                        className="form-input text-xs font-mono font-bold uppercase tracking-wider bg-slate-50"
                        required
                      />
                      <button
                        type="button"
                        onClick={generateRandomCode}
                        className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 shrink-0"
                        title="Gerar código aleatório"
                      >
                        <Shuffle className="w-3.5 h-3.5 text-amber-600" />
                        <span>Gerar</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Status
                    </label>
                    <select
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value })}
                      className="form-input text-xs font-bold"
                    >
                      <option value="active">🟢 Ativo (Pronto para uso)</option>
                      <option value="paused">⏸️ Pausado</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Descrição / Campanha (Opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Desconto exclusivo de 10% para novos clientes"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="form-input text-xs"
                  />
                </div>
              </div>

              {/* 2. Tipo de Desconto & Valores */}
              <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-3">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-900">
                  Regras de Desconto
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Tipo de Desconto *
                    </label>
                    <select
                      value={form.discountType}
                      onChange={(e) => setForm({ ...form, discountType: e.target.value })}
                      className="form-input text-xs font-bold"
                    >
                      <option value="percentage">Porcentagem (%)</option>
                      <option value="fixed">Valor Fixo (R$)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      {form.discountType === 'percentage' ? 'Porcentagem de Desconto (%) *' : 'Valor do Desconto (R$) *'}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      max={form.discountType === 'percentage' ? '100' : undefined}
                      placeholder={form.discountType === 'percentage' ? '10' : '50.00'}
                      value={form.discountValue}
                      onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                      className="form-input text-xs font-bold"
                      required
                    />
                  </div>

                  {form.discountType === 'percentage' && (
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Teto Máximo (R$) (Opcional)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Ex: 500.00"
                        value={form.maxDiscount}
                        onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })}
                        className="form-input text-xs"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* 3. Escopo de Aplicação */}
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Aplicável em quais produtos? *
                  </label>
                  <select
                    value={form.scopeType}
                    onChange={(e) => setForm({ ...form, scopeType: e.target.value })}
                    className="form-input text-xs font-bold"
                  >
                    <option value="all">Todo o Catálogo (Produtos com Preço de Venda)</option>
                    <option value="products">Produtos Específicos</option>
                    <option value="categories">Categorias Específicas</option>
                    <option value="brands">Marcas Específicas</option>
                  </select>
                </div>

                {/* Scope: Specific Products */}
                {form.scopeType === 'products' && (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <label className="text-[11px] font-bold text-slate-600 block">
                      Selecione os produtos elegíveis ({form.targetProductIds.length} selecionados):
                    </label>
                    <div className="max-h-40 overflow-y-auto space-y-1 pr-1 divide-y divide-slate-100">
                      {purchasableProducts.map(p => {
                        const isSelected = form.targetProductIds.includes(p.id);
                        return (
                          <label key={p.id} className="pt-1 first:pt-0 flex items-center justify-between text-xs cursor-pointer hover:bg-slate-100 p-1 rounded-lg">
                            <div className="flex items-center gap-2 min-w-0">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setForm({ ...form, targetProductIds: [...form.targetProductIds, p.id] });
                                  } else {
                                    setForm({ ...form, targetProductIds: form.targetProductIds.filter(id => id !== p.id) });
                                  }
                                }}
                                className="rounded text-amber-600 focus:ring-amber-500"
                              />
                              <span className="truncate font-medium text-slate-800">{p.name}</span>
                            </div>
                            <span className="font-bold text-slate-900 shrink-0">{formatBRL(p.price)}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Scope: Specific Categories */}
                {form.scopeType === 'categories' && (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <label className="text-[11px] font-bold text-slate-600 block">
                      Selecione as categorias elegíveis:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {categories.map(c => {
                        const isSelected = form.targetCategoryIds.includes(c.id);
                        return (
                          <label key={c.id} className="flex items-center gap-2 text-xs cursor-pointer bg-white p-2 rounded-lg border border-slate-200">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setForm({ ...form, targetCategoryIds: [...form.targetCategoryIds, c.id] });
                                } else {
                                  setForm({ ...form, targetCategoryIds: form.targetCategoryIds.filter(id => id !== c.id) });
                                }
                              }}
                              className="rounded text-amber-600 focus:ring-amber-500"
                            />
                            <span className="font-bold text-slate-800 truncate">{c.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Scope: Specific Brands */}
                {form.scopeType === 'brands' && (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <label className="text-[11px] font-bold text-slate-600 block">
                      Selecione as marcas elegíveis:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {brands.map(b => {
                        const isSelected = form.targetBrandIds.includes(b.id);
                        return (
                          <label key={b.id} className="flex items-center gap-2 text-xs cursor-pointer bg-white p-2 rounded-lg border border-slate-200">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setForm({ ...form, targetBrandIds: [...form.targetBrandIds, b.id] });
                                } else {
                                  setForm({ ...form, targetBrandIds: form.targetBrandIds.filter(id => id !== b.id) });
                                }
                              }}
                              className="rounded text-amber-600 focus:ring-amber-500"
                            />
                            <span className="font-bold text-slate-800 truncate">{b.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* 4. Segmentação & Restrição de Cliente */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                  Segmentação de Cliente
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Público Alvo
                    </label>
                    <select
                      value={form.customerType}
                      onChange={(e) => setForm({ ...form, customerType: e.target.value })}
                      className="form-input text-xs font-bold"
                    >
                      <option value="all">Qualquer Cliente (Público Geral)</option>
                      <option value="registered">Apenas Clientes Cadastrados</option>
                      <option value="specific_email">E-mail Específico (Voucher Individual)</option>
                    </select>
                  </div>

                  {form.customerType === 'specific_email' && (
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        E-mail do Cliente Autorizado *
                      </label>
                      <input
                        type="email"
                        placeholder="cliente@empresa.com.br"
                        value={form.specificEmail}
                        onChange={(e) => setForm({ ...form, specificEmail: e.target.value })}
                        className="form-input text-xs"
                        required
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* 5. Condições Mínimas & Limites de Uso */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Valor Mínimo do Pedido (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={form.minOrderAmount}
                    onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })}
                    className="form-input text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Limite Total de Usos
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0 = Ilimitado"
                    value={form.maxUsageTotal}
                    onChange={(e) => setForm({ ...form, maxUsageTotal: e.target.value })}
                    className="form-input text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Data de Expiração
                  </label>
                  <input
                    type="date"
                    value={form.expiresAt}
                    onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                    className="form-input text-xs"
                  />
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="btn-gold text-xs font-extrabold py-2.5 px-6 rounded-xl shadow-md cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingCoupon ? 'Atualizar Cupom' : 'Salvar e Ativar Cupom'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
