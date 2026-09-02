import React, { useState, useEffect, useMemo } from 'react';
import { 
  User, 
  Package, 
  MapPin, 
  Lock, 
  Phone, 
  Mail, 
  Building, 
  FileText, 
  CheckCircle2, 
  Clock, 
  Truck, 
  AlertCircle, 
  LogOut, 
  ChevronRight, 
  ExternalLink, 
  MessageCircle, 
  Save, 
  Eye, 
  EyeOff, 
  Search,
  ShoppingCart,
  ShieldCheck,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { saveSession } from '../utils/storage';
import { formatCpfCnpj, fetchCnpjData } from '../utils/documentUtils';

export default function CustomerAccountPage({
  currentUser,
  onUpdateUser,
  onLogout,
  onNavigate,
  API_BASE_URL,
  showNotification
}) {
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'profile' | 'address' | 'security'
  
  // Profile State
  const [profileForm, setProfileForm] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    document: currentUser?.document || '',
    companyName: currentUser?.companyName || currentUser?.company_name || ''
  });

  // Address State
  const [addressForm, setAddressForm] = useState({
    cep: currentUser?.address?.cep || '',
    street: currentUser?.address?.street || '',
    number: currentUser?.address?.number || '',
    complement: currentUser?.address?.complement || '',
    neighborhood: currentUser?.address?.neighborhood || '',
    city: currentUser?.address?.city || '',
    state: currentUser?.address?.state || ''
  });

  // Password State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Orders State
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [searchingCep, setSearchingCep] = useState(false);
  const [isSearchingCnpj, setIsSearchingCnpj] = useState(false);
  const [cnpjSuccessMsg, setCnpjSuccessMsg] = useState(null);
  const [cnpjErrorMsg, setCnpjErrorMsg] = useState(null);

  const docInfo = useMemo(() => {
    return formatCpfCnpj(profileForm.document);
  }, [profileForm.document]);

  const triggerCnpjLookup = async (manualRaw = null) => {
    const raw = manualRaw || profileForm.document.replace(/[^0-9a-zA-Z]/g, '').toUpperCase();
    if (raw.length !== 14) return;
    setIsSearchingCnpj(true);
    setCnpjErrorMsg(null);
    setCnpjSuccessMsg(null);
    try {
      const data = await fetchCnpjData(raw);
      setProfileForm(prev => ({
        ...prev,
        companyName: data.tradeName || data.companyName || prev.companyName,
        phone: prev.phone || data.phone || ''
      }));
      setAddressForm(prev => ({
        ...prev,
        cep: prev.cep || data.zip || '',
        street: prev.street || data.street || '',
        number: prev.number || data.number || '',
        neighborhood: prev.neighborhood || data.district || '',
        city: prev.city || data.city || '',
        state: prev.state || data.state || ''
      }));
      setCnpjSuccessMsg(`Empresa localizada: ${data.companyName} (${data.city}/${data.state})`);
      setTimeout(() => setCnpjSuccessMsg(null), 5000);
    } catch (err) {
      setCnpjErrorMsg(err.message || 'Erro ao consultar CNPJ');
      setTimeout(() => setCnpjErrorMsg(null), 4000);
    } finally {
      setIsSearchingCnpj(false);
    }
  };

  const handleDocumentChange = (e) => {
    const info = formatCpfCnpj(e.target.value);
    setProfileForm(prev => ({ ...prev, document: info.formatted }));

    if (info.isCnpj && info.isComplete && !profileForm.companyName) {
      triggerCnpjLookup(info.raw);
    }
  };

  // Sync state when currentUser updates
  useEffect(() => {
    if (currentUser) {
      setProfileForm({
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        document: currentUser.document || '',
        companyName: currentUser.companyName || currentUser.company_name || ''
      });

      if (currentUser.address) {
        setAddressForm({
          cep: currentUser.address.cep || '',
          street: currentUser.address.street || '',
          number: currentUser.address.number || '',
          complement: currentUser.address.complement || '',
          neighborhood: currentUser.address.neighborhood || '',
          city: currentUser.address.city || '',
          state: currentUser.address.state || ''
        });
      }
    }
  }, [currentUser]);

  // Fetch Customer Orders
  useEffect(() => {
    const fetchCustomerOrders = async () => {
      if (!currentUser?.token) {
        setLoadingOrders(false);
        return;
      }
      setLoadingOrders(true);
      try {
        const res = await fetch(`${API_BASE_URL}/customer/orders`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${currentUser.token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setOrders(Array.isArray(data) ? data : []);
        } else {
          setOrders([]);
        }
      } catch (err) {
        console.warn('Erro ao buscar pedidos do cliente:', err);
        setOrders([]);
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchCustomerOrders();
  }, [currentUser, API_BASE_URL]);

  // Auto Search CEP via ViaCEP
  const handleCepBlur = async () => {
    const cleanCep = (addressForm.cep || '').replace(/\D/g, '');
    if (cleanCep.length === 8) {
      setSearchingCep(true);
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setAddressForm((prev) => ({
            ...prev,
            street: data.logradouro || prev.street,
            neighborhood: data.bairro || prev.neighborhood,
            city: data.localidade || prev.city,
            state: data.uf || prev.state
          }));
          showNotification('Endereço preenchido automaticamente via CEP!', 'success');
        } else {
          showNotification('CEP não localizado. Por favor, digite o endereço manualmente.', 'info');
        }
      } catch (e) {
        console.warn('Erro ao consultar ViaCEP:', e);
      } finally {
        setSearchingCep(false);
      }
    }
  };

  // Update Profile Info
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await fetch(`${API_BASE_URL}/customer/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser?.token}`
        },
        body: JSON.stringify({
          name: profileForm.name.trim(),
          phone: profileForm.phone.trim(),
          document: profileForm.document.trim(),
          companyName: profileForm.companyName.trim()
        })
      });

      const data = await res.json();
      if (res.ok) {
        const updatedUser = {
          ...currentUser,
          name: profileForm.name.trim(),
          phone: profileForm.phone.trim(),
          document: profileForm.document.trim(),
          companyName: profileForm.companyName.trim(),
          company_name: profileForm.companyName.trim()
        };
        saveSession(updatedUser);
        if (onUpdateUser) onUpdateUser(updatedUser);
        showNotification('Seus dados cadastrais foram atualizados com sucesso!', 'success');
      } else {
        showNotification(data.error || 'Erro ao atualizar dados.', 'error');
      }
    } catch (err) {
      showNotification('Não foi possível conectar ao servidor.', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  // Update Address
  const handleSaveAddress = async (e) => {
    e.preventDefault();
    setSavingAddress(true);
    try {
      const res = await fetch(`${API_BASE_URL}/customer/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser?.token}`
        },
        body: JSON.stringify({
          address: addressForm
        })
      });

      const data = await res.json();
      if (res.ok) {
        const updatedUser = {
          ...currentUser,
          address: addressForm
        };
        saveSession(updatedUser);
        if (onUpdateUser) onUpdateUser(updatedUser);
        showNotification('Endereço de entrega salvo com sucesso!', 'success');
      } else {
        showNotification(data.error || 'Erro ao salvar endereço.', 'error');
      }
    } catch (err) {
      showNotification('Não foi possível conectar ao servidor.', 'error');
    } finally {
      setSavingAddress(false);
    }
  };

  // Update Password
  const handleSavePassword = async (e) => {
    e.preventDefault();
    if (!passwordForm.currentPassword) {
      showNotification('Digite sua senha atual.', 'error');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      showNotification('A nova senha deve ter no mínimo 6 caracteres.', 'error');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showNotification('A confirmação da nova senha não confere.', 'error');
      return;
    }

    setSavingPassword(true);
    try {
      const res = await fetch(`${API_BASE_URL}/customer/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser?.token}`
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });

      const data = await res.json();
      if (res.ok) {
        showNotification('Senha alterada com sucesso! Utilize-a em seu próximo login.', 'success');
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        showNotification(data.error || 'Senha atual incorreta.', 'error');
      }
    } catch (err) {
      showNotification('Não foi possível conectar ao servidor.', 'error');
    } finally {
      setSavingPassword(false);
    }
  };

  // Status mapping badge helper
  const getStatusBadge = (status) => {
    switch (status) {
      case 'entregue':
      case 'concluido':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Entregue
          </span>
        );
      case 'enviado':
      case 'em_transporte':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-sky-50 text-sky-700 border border-sky-200">
            <Truck className="w-3.5 h-3.5 text-sky-600" /> Em Transporte
          </span>
        );
      case 'faturado':
      case 'aprovado':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" /> Aprovado / Faturado
          </span>
        );
      case 'orcamento_gerado':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" /> Orçamento Disponível
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-slate-100 text-slate-700 border border-slate-200">
            <Clock className="w-3.5 h-3.5 text-slate-500" /> Em Análise Técnica
          </span>
        );
    }
  };

  return (
    <div className="py-8 bg-slate-50 min-h-[calc(100vh-140px)]">
      <div className="container-custom space-y-6">
        
        {/* Header Profile Banner */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 font-extrabold text-2xl shadow-inner">
              {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'C'}
            </div>
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/10 text-amber-300 text-[11px] font-bold border border-amber-400/20">
                <User className="w-3 h-3" /> Área do Cliente Athena
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                Olá, {currentUser?.name || 'Cliente Athena'}!
              </h1>
              <p className="text-xs text-slate-400 flex items-center gap-2">
                <span>{currentUser?.email}</span>
                {currentUser?.phone && (
                  <>
                    <span>•</span>
                    <span>{currentUser.phone}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto relative z-10">
            {currentUser?.role === 'admin' && (
              <button
                onClick={() => onNavigate('admin')}
                className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-md"
              >
                <span>Painel Administrativo</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => onLogout('Você saiu da sua conta.')}
              className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-red-300 hover:text-red-200 border border-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sair da Conta</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white bg-slate-100/80'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Meus Pedidos & Cotações</span>
            {orders.length > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${activeTab === 'orders' ? 'bg-amber-800 text-white' : 'bg-slate-200 text-slate-800'}`}>
                {orders.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white bg-slate-100/80'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Dados Cadastrais</span>
          </button>

          <button
            onClick={() => setActiveTab('address')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'address'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white bg-slate-100/80'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Endereço de Entrega</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'security'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white bg-slate-100/80'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Segurança & Senha</span>
          </button>
        </div>

        {/* TAB 1: MEUS PEDIDOS */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {loadingOrders ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs space-y-3">
                <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-slate-500 font-bold">Carregando seus pedidos e cotações...</p>
              </div>
            ) : orders.length > 0 ? (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div 
                    key={order.id}
                    className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4 hover:border-amber-400 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-slate-900">
                            Pedido #{order.id}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            • {new Date(order.created_at || order.createdAt || Date.now()).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">
                          Total:{' '}
                          <strong className="text-slate-900 font-extrabold">
                            {order.total_amount > 0 
                              ? `R$ ${Number(order.total_amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` 
                              : 'Sob Cotação Direta'}
                          </strong>
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        {getStatusBadge(order.status)}
                        <a
                          href={`https://wa.me/5561983485671?text=Ol%C3%A1%2C+sou+o+cliente+${encodeURIComponent(currentUser?.name || '')}+e+gostaria+de+informa%C3%A7%C3%B5es+sobre+o+meu+pedido+%23${order.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Falar no WhatsApp</span>
                        </a>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="space-y-2">
                      <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Itens do Equipamento</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {(order.items || []).map((item, idx) => (
                          <div key={idx} className="flex items-center gap-3 p-2.5 rounded-2xl bg-slate-50 border border-slate-100">
                            {item.image && (
                              <img src={item.image} alt={item.name} className="w-12 h-12 object-contain bg-white rounded-xl border border-slate-200 p-1 shrink-0" />
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold text-slate-900 truncate">{item.name}</p>
                              <p className="text-[11px] text-slate-500">Qtd: {item.quantity || 1}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs space-y-4 max-w-lg mx-auto">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-amber-600 shadow-xs">
                  <ShoppingCart className="w-8 h-8" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-slate-900">
                    Você ainda não possui pedidos ou cotações
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Navegue por nossas linhas de elevadores, scanners de IA, alinhadores 3D e ferramentas para solicitar orçamentos personalizados.
                  </p>
                </div>
                <button
                  onClick={() => onNavigate('catalog')}
                  className="btn-gold text-xs font-bold py-3 px-6 mx-auto inline-flex items-center gap-2 shadow-md cursor-pointer"
                >
                  <span>Explorar Catálogo de Equipamentos</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: DADOS CADASTRAIS */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8 max-w-2xl">
            <form onSubmit={handleSaveProfile} className="space-y-5">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <User className="w-4 h-4 text-amber-600" /> Dados Pessoais & da Oficina
                </h3>
                <p className="text-xs text-slate-500">
                  Mantenha suas informações sempre atualizadas para facilitar a emissão de orçamentos e notas fiscais.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 block mb-1">Nome Completo / Responsável *</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      placeholder="Ex: Carlos Eduardo da Silva"
                      className="form-input text-xs !pl-10"
                    />
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">E-mail de Acesso (Não alterável)</label>
                  <div className="relative">
                    <input
                      type="email"
                      disabled
                      value={profileForm.email}
                      className="form-input text-xs !pl-10 bg-slate-100 text-slate-500 cursor-not-allowed"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">WhatsApp / Telefone *</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      placeholder="(61) 99999-9999"
                      className="form-input text-xs !pl-10"
                    />
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">
                      {docInfo.isCnpj ? 'CNPJ (Pessoa Jurídica)' : 'CPF ou CNPJ'}
                    </label>
                    {docInfo.isCnpj && (
                      <button
                        type="button"
                        onClick={() => triggerCnpjLookup()}
                        disabled={isSearchingCnpj || profileForm.document.replace(/[^0-9a-zA-Z]/g, '').length !== 14}
                        className="text-[10px] font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 cursor-pointer disabled:opacity-40 transition-colors"
                      >
                        {isSearchingCnpj ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin text-amber-600" />
                            <span>Consultando...</span>
                          </>
                        ) : (
                          <>
                            <Search className="w-3 h-3 text-amber-600" />
                            <span>Buscar CNPJ</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={profileForm.document}
                      onChange={handleDocumentChange}
                      placeholder="000.000.000-00 ou 00.000.000/0000-00"
                      className="form-input text-xs !pl-10 font-mono"
                    />
                    <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    {isSearchingCnpj && (
                      <Loader2 className="w-4 h-4 text-amber-600 animate-spin absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    )}
                  </div>
                  {cnpjSuccessMsg && (
                    <p className="text-[10px] font-semibold text-emerald-700 mt-1 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span>{cnpjSuccessMsg}</span>
                    </p>
                  )}
                  {cnpjErrorMsg && (
                    <p className="text-[10px] font-semibold text-rose-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 text-rose-500 shrink-0" />
                      <span>{cnpjErrorMsg}</span>
                    </p>
                  )}
                </div>

                {/* Nome da Oficina / Razão Social - ONLY SHOWN IF CNPJ */}
                {docInfo.isCnpj && (
                  <div className="animate-fadeIn">
                    <label className="text-xs font-bold text-slate-700 block mb-1">Nome da Oficina / Razão Social *</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={profileForm.companyName}
                        onChange={(e) => setProfileForm({ ...profileForm, companyName: e.target.value })}
                        placeholder="Ex: Centro Automotivo Modelo LTDA"
                        className="form-input text-xs !pl-10"
                        required={docInfo.isCnpj}
                      />
                      <Building className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="btn-gold text-xs font-bold py-3 px-6 inline-flex items-center gap-2 shadow-md disabled:opacity-50 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingProfile ? 'Salvando Alterações...' : 'Salvar Dados Cadastrais'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 3: ENDEREÇO DE ENTREGA */}
        {activeTab === 'address' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8 max-w-2xl">
            <form onSubmit={handleSaveAddress} className="space-y-5">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-600" /> Endereço para Entrega e Instalação
                </h3>
                <p className="text-xs text-slate-500">
                  Informe o local onde as máquinas e ferramentas serão entregues ou instaladas pelos nossos técnicos.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">CEP *</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={addressForm.cep}
                      onChange={(e) => setAddressForm({ ...addressForm, cep: e.target.value })}
                      onBlur={handleCepBlur}
                      placeholder="70000-000"
                      className="form-input text-xs !pl-10"
                    />
                    <Search className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${searchingCep ? 'text-amber-500 animate-spin' : 'text-slate-400'}`} />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">Digite o CEP para autocompletar</span>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 block mb-1">Rua / Logradouro *</label>
                  <input
                    type="text"
                    required
                    value={addressForm.street}
                    onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                    placeholder="Av. Principal, Rua 10, etc."
                    className="form-input text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Número *</label>
                  <input
                    type="text"
                    required
                    value={addressForm.number}
                    onChange={(e) => setAddressForm({ ...addressForm, number: e.target.value })}
                    placeholder="123 ou S/N"
                    className="form-input text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Complemento</label>
                  <input
                    type="text"
                    value={addressForm.complement}
                    onChange={(e) => setAddressForm({ ...addressForm, complement: e.target.value })}
                    placeholder="Galpão 2, Loja 05..."
                    className="form-input text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Bairro *</label>
                  <input
                    type="text"
                    required
                    value={addressForm.neighborhood}
                    onChange={(e) => setAddressForm({ ...addressForm, neighborhood: e.target.value })}
                    placeholder="Centro, Setor Industrial..."
                    className="form-input text-xs"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 block mb-1">Cidade *</label>
                  <input
                    type="text"
                    required
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    placeholder="Brasília, São Paulo..."
                    className="form-input text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Estado (UF) *</label>
                  <input
                    type="text"
                    required
                    maxLength={2}
                    value={addressForm.state}
                    onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value.toUpperCase() })}
                    placeholder="DF, SP, MG..."
                    className="form-input text-xs uppercase"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={savingAddress}
                  className="btn-gold text-xs font-bold py-3 px-6 inline-flex items-center gap-2 shadow-md disabled:opacity-50 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingAddress ? 'Gravando Endereço...' : 'Salvar Endereço de Entrega'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 4: SEGURANÇA & SENHA */}
        {activeTab === 'security' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8 max-w-md">
            <form onSubmit={handleSavePassword} className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-600" /> Alteração de Senha
                </h3>
                <p className="text-xs text-slate-500">
                  Para sua segurança, informe sua senha atual antes de cadastrar uma nova senha.
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Senha Atual *</label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    required
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    placeholder="••••••••"
                    className="form-input text-xs !pl-10 !pr-10"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Nova Senha (Mínimo 6 dígitos) *</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    placeholder="••••••••"
                    className="form-input text-xs !pl-10 !pr-10"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Confirmar Nova Senha *</label>
                <input
                  type="password"
                  required
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  placeholder="••••••••"
                  className="form-input text-xs"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={savingPassword}
                  className="btn-gold text-xs font-bold py-3 px-6 w-full justify-center inline-flex items-center gap-2 shadow-md disabled:opacity-50 cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  <span>{savingPassword ? 'Atualizando Senha...' : 'Atualizar Minha Senha'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
