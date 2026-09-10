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
  Loader2,
  Sparkles,
  Coins,
  Gift,
  TrendingUp,
  X
} from 'lucide-react';
import { saveSession } from '../utils/storage';
import { formatCpfCnpj, fetchCnpjData, formatPhone } from '../utils/documentUtils';
import { getPasswordValidation } from './LoginPage';

export default function CustomerAccountPage({
  currentUser,
  onUpdateUser,
  onLogout,
  onNavigate,
  API_BASE_URL,
  showNotification,
  initialTab = 'orders',
  onStartVerification
}) {
  const [activeTab, setActiveTab] = useState(initialTab || 'orders'); // 'orders' | 'points' | 'profile' | 'address' | 'security'
  // Profile State
  const [profileForm, setProfileForm] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone ? formatPhone(currentUser.phone) : '',
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
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

  // Points State & Rewards
  const [pointsData, setPointsData] = useState({ 
    points: currentUser?.a_points || currentUser?.aPoints || 0,
    pointsAvailable: currentUser?.a_points || currentUser?.aPoints || 0,
    pointsPending: 0,
    transactions: [],
    rewards: []
  });
  const [loadingPoints, setLoadingPoints] = useState(false);
  const [redeemingReward, setRedeemingReward] = useState(null);
  const [redeemSuccess, setRedeemSuccess] = useState(null);
  const [confirmRedeemReward, setConfirmRedeemReward] = useState(null);
  const [redeemDeliveryMethod, setRedeemDeliveryMethod] = useState('shipping'); // 'shipping' | 'pickup' | 'with_order'
  const [redeemAddress, setRedeemAddress] = useState({
    cep: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: ''
  });
  const [redeemNotes, setRedeemNotes] = useState('');
  const [searchingRedeemCep, setSearchingRedeemCep] = useState(false);
  const [saveAsDefaultAddress, setSaveAsDefaultAddress] = useState(true);

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

  // Sync tab with initialTab
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

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

  const fetchPoints = async () => {
    if (!currentUser?.token) return;
    setLoadingPoints(true);
    try {
      const res = await fetch(`${API_BASE_URL}/points/me`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setPointsData(data || { points: 0, pointsAvailable: 0, pointsPending: 0, transactions: [], rewards: [] });
      }
    } catch (err) {
      console.warn('Erro ao carregar A-Points:', err);
    } finally {
      setLoadingPoints(false);
    }
  };

  useEffect(() => {
    fetchCustomerOrders();
    fetchPoints();
  }, [currentUser, API_BASE_URL]);

  const handleRedeemReward = (reward) => {
    if (!currentUser?.token) {
      showNotification?.('Faça login para resgatar sua recompensa.', 'error');
      return;
    }
    const currentBal = Number(pointsData.pointsAvailable ?? pointsData.points ?? 0);
    const cost = Number(reward.pointsCost || reward.points_cost || 0);

    if (currentBal < cost) {
      showNotification?.(`Saldo insuficiente. Você possui ${currentBal} pontos e a recompensa requer ${cost} pontos.`, 'error');
      return;
    }

    // Inicializa formulário de recebimento / entrega do brinde
    setRedeemDeliveryMethod('shipping');
    setRedeemAddress({
      cep: currentUser?.address?.cep || addressForm.cep || '',
      street: currentUser?.address?.street || addressForm.street || '',
      number: currentUser?.address?.number || addressForm.number || '',
      complement: currentUser?.address?.complement || addressForm.complement || '',
      neighborhood: currentUser?.address?.neighborhood || addressForm.neighborhood || '',
      city: currentUser?.address?.city || addressForm.city || '',
      state: currentUser?.address?.state || addressForm.state || ''
    });
    setRedeemNotes('');
    setConfirmRedeemReward(reward);
  };

  // Busca de CEP dentro do modal de resgate
  const handleRedeemCepBlur = async () => {
    const cleanCep = (redeemAddress.cep || '').replace(/\D/g, '');
    if (cleanCep.length === 8) {
      setSearchingRedeemCep(true);
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setRedeemAddress((prev) => ({
            ...prev,
            street: data.logradouro || prev.street,
            neighborhood: data.bairro || prev.neighborhood,
            city: data.localidade || prev.city,
            state: data.uf || prev.state
          }));
          showNotification?.('Endereço preenchido automaticamente via CEP!', 'success');
        } else {
          showNotification?.('CEP não localizado. Preencha os campos manualmente.', 'info');
        }
      } catch (e) {
        console.warn('Erro ao consultar ViaCEP no modal:', e);
      } finally {
        setSearchingRedeemCep(false);
      }
    }
  };

  const executeRedeemReward = async (reward) => {
    if (!reward) return;

    const isVoucher = reward.category === 'vouchers' || reward.id.startsWith('rw_cupom');

    if (!isVoucher && redeemDeliveryMethod === 'shipping') {
      if (!redeemAddress.cep || !redeemAddress.street || !redeemAddress.number || !redeemAddress.neighborhood || !redeemAddress.city || !redeemAddress.state) {
        showNotification?.('Por favor, preencha todos os campos obrigatórios do endereço (CEP, logradouro, número, bairro, cidade e UF).', 'error');
        return;
      }
    }

    setRedeemingReward(reward.id);
    try {
      const res = await fetch(`${API_BASE_URL}/rewards/redeem`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.token}`
        },
        body: JSON.stringify({ 
          rewardId: reward.id,
          deliveryMethod: isVoucher ? 'voucher' : redeemDeliveryMethod,
          shippingAddress: (!isVoucher && redeemDeliveryMethod === 'shipping') ? redeemAddress : null,
          deliveryNotes: redeemNotes,
          saveAsDefaultAddress
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao processar resgate.');

      showNotification?.(data.message || 'Resgate realizado com sucesso!', 'success');
      setRedeemSuccess({
        reward,
        remainingPoints: data.remainingPoints,
        txId: data.transactionId,
        deliveryMethod: isVoucher ? 'voucher' : redeemDeliveryMethod
      });

      if (currentUser?.id && onUpdateUser) {
        const updatedUserData = { ...currentUser, a_points: data.remainingPoints, aPoints: data.remainingPoints };
        if (!isVoucher && redeemDeliveryMethod === 'shipping' && saveAsDefaultAddress) {
          updatedUserData.address = redeemAddress;
          setAddressForm(redeemAddress);
        }
        onUpdateUser(updatedUserData);
      }
      fetchPoints();
      setConfirmRedeemReward(null);
    } catch (err) {
      showNotification?.(err.message || 'Erro ao resgatar recompensa.', 'error');
    } finally {
      setRedeemingReward(null);
    }
  };

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
    const pwdVal = getPasswordValidation(passwordForm.newPassword);
    if (!pwdVal.isValid) {
      if (!pwdVal.minLength) {
        showNotification('A nova senha deve ter no mínimo 8 caracteres.', 'error');
      } else if (!pwdVal.hasUpper) {
        showNotification('A nova senha deve conter ao menos uma letra maiúscula (A-Z).', 'error');
      } else if (!pwdVal.hasLower) {
        showNotification('A nova senha deve conter ao menos uma letra minúscula (a-z).', 'error');
      } else if (!pwdVal.hasNumber) {
        showNotification('A nova senha deve conter ao menos um número (0-9).', 'error');
      } else if (!pwdVal.hasSpecial) {
        showNotification('A nova senha deve conter ao menos um caractere especial (!@#$%...).', 'error');
      }
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
        
        {/* Compact, Modern Header Profile Bar */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-700 font-black text-xl shrink-0 shadow-2xs">
              {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'C'}
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wider text-amber-700">
                  <User className="w-3 h-3 text-amber-600" /> Área do Cliente
                </span>
                {currentUser?.isVerified ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> E-mail Verificado
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={onStartVerification}
                    className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[10px] font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 transition-colors cursor-pointer"
                    title="Clique para validar seu e-mail"
                  >
                    <AlertCircle className="w-3 h-3 text-amber-600" /> Confirmar E-mail
                  </button>
                )}
              </div>
              <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-snug">
                Olá, {currentUser?.name || 'Cliente Athena'}!
              </h1>
              <p className="text-xs text-slate-500 flex flex-wrap items-center gap-2">
                <span>{currentUser?.email}</span>
                {currentUser?.phone && (
                  <>
                    <span className="text-slate-300">•</span>
                    <span>{currentUser.phone}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
            {/* Quick A-Points Chip */}
            <button
              type="button"
              onClick={() => setActiveTab('points')}
              className="flex-1 md:flex-initial px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-amber-50/60 text-slate-800 hover:text-amber-900 border border-slate-200 hover:border-amber-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>{pointsData.points || currentUser?.a_points || currentUser?.aPoints || 0} A-Points</span>
            </button>

            {currentUser?.role === 'admin' && (
              <button
                onClick={() => onNavigate('admin')}
                className="flex-1 md:flex-initial px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
              >
                <span>Painel Admin</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={() => onLogout('Você saiu da sua conta.')}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-700 border border-slate-200 hover:border-red-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sair</span>
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
            onClick={() => setActiveTab('points')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'points'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white bg-slate-100/80'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Meus A-Points</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${activeTab === 'points' ? 'bg-amber-800 text-white' : 'bg-amber-100 text-amber-800'}`}>
              {pointsData.points || currentUser?.a_points || currentUser?.aPoints || 0} pts
            </span>
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


        {/* TAB: PROGRAMA DE FIDELIDADE (MEUS A-POINTS) */}
        {activeTab === 'points' && (
          <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
              
              {/* Sober Minimalist Header */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  Programa de Fidelidade Athena
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Meus A-Points
                </h2>
                <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">
                  A cada <strong>R$ 50,00 faturados</strong> em compras elegíveis de equipamentos e ferramentas, você recebe <strong>1 A-Point</strong> automaticamente. Seus pontos são válidos por 12 meses e podem ser trocados por produtos do catálogo de recompensas ou abatimentos comerciais.
                </p>
              </div>

              {/* Balance Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Saldo Disponível */}
                <div className="bg-slate-900 rounded-2xl p-6 text-white flex flex-col justify-between gap-4 border border-slate-800 shadow-sm">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-slate-400">Saldo Disponível para Resgate</p>
                    <div className="flex items-baseline gap-2.5">
                      <span className="text-4xl sm:text-5xl font-black text-amber-400 font-mono tracking-tight">
                        {pointsData.pointsAvailable ?? pointsData.points ?? currentUser?.a_points ?? 0}
                      </span>
                      <span className="text-sm font-bold text-slate-300">
                        A-Points
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Pontos liberados para troca em produtos do catálogo ou desconto em novos pedidos.
                    </p>
                  </div>

                  <a
                    href={`https://wa.me/5561983485671?text=Ol%C3%A1%21+Sou+o+cliente+${encodeURIComponent(currentUser?.name || '')}+e+gostaria+de+consultar+o+resgate+dos+meus+${pointsData.pointsAvailable ?? pointsData.points ?? 0}+A-Points+no+meu+pr%C3%B3ximo+pedido.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs border border-amber-400"
                  >
                    <MessageCircle className="w-4 h-4 text-slate-950" />
                    <span>Resgatar com Consultor no WhatsApp</span>
                  </a>
                </div>

                {/* Saldo Pendente ou Benefício Estimado */}
                <div className="bg-slate-50 rounded-2xl p-6 text-slate-900 flex flex-col justify-between gap-4 border border-slate-200">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-slate-500">Pontos em Processamento</p>
                      {pointsData.pointsPending > 0 ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Em validação
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Atualizado
                        </span>
                      )}
                    </div>
                    <div className="flex items-baseline gap-2.5">
                      <span className="text-4xl sm:text-5xl font-black text-slate-800 font-mono tracking-tight">
                        {pointsData.pointsPending || 0}
                      </span>
                      <span className="text-sm font-bold text-slate-500">
                        Pontos Pendentes
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      {pointsData.pointsPending > 0
                        ? 'Pontos de compras recentes aguardando prazo de liquidação/faturamento.'
                        : 'Você não possui pontos pendentes. Suas compras faturadas no ERP são creditadas aqui automaticamente.'}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-600">
                    <span>Validade dos pontos:</span>
                    <strong className="font-bold text-slate-900">12 meses a partir do crédito</strong>
                  </div>
                </div>
              </div>

              {/* 3 Regras Estratégicas */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <div className="flex items-center gap-2 text-slate-900">
                    <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                    <h3 className="text-xs font-black">R$ 50 = 1 A-Point</h3>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Sem limite artificial de pontos por pedido. Quanto mais você compra, mais acumula.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <div className="flex items-center gap-2 text-slate-900">
                    <Gift className="w-4 h-4 text-amber-600 shrink-0" />
                    <h3 className="text-xs font-black">Catálogo de Recompensas</h3>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Resgate produtos, ferramentas e consumíveis sem desembolso financeiro adicional.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <div className="flex items-center gap-2 text-slate-900">
                    <Coins className="w-4 h-4 text-amber-600 shrink-0" />
                    <h3 className="text-xs font-black">Pontos + Dinheiro</h3>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Utilize seus pontos para abater parcelas e valores em equipamentos de maior porte.
                  </p>
                </div>
              </div>

              {/* Mensagem de sucesso de resgate se houver */}
              {redeemSuccess && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <p className="text-xs font-black">Resgate registrado com sucesso!</p>
                      <p className="text-[11px] text-emerald-800">
                        Item: <strong>{redeemSuccess.reward.name}</strong> • Saldo restante: <strong>{redeemSuccess.remainingPoints} pts</strong>
                      </p>
                    </div>
                  </div>
                  <a
                    href={`https://wa.me/5561983485671?text=Ol%C3%A1%21+Acabei+de+resgatar+a+recompensa+*${encodeURIComponent(redeemSuccess.reward.name)}*+pelo+site+com+meus+pontos+(Protocolo%3A+${redeemSuccess.txId}).+Como+fa%C3%A7o+para+receber%3F`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shrink-0"
                  >
                    Confirmar Envio no WhatsApp &rarr;
                  </a>
                </div>
              )}

              {/* CATÁLOGO DE RECOMPENSAS */}
              <div className="pt-4 border-t border-slate-100 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                      <Gift className="w-4 h-4 text-amber-600" /> Catálogo de Recompensas
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Escolha produtos e vantagens para resgatar com seus pontos disponíveis.
                    </p>
                  </div>
                  <span className="text-xs font-extrabold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/70">
                    Saldo: {pointsData.pointsAvailable ?? pointsData.points ?? 0} pts
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {((pointsData.rewards && pointsData.rewards.length > 0) ? pointsData.rewards : [
                    { id: 'rw_espuma_cera', name: 'Espuma Aplicadora de Cera 100mm', pointsCost: 50, description: 'Espuma macia para aplicação uniforme de ceras e selantes.' },
                    { id: 'rw_toalha_microfibra', name: 'Toalha de Microfibra Especial 40x40cm', pointsCost: 100, description: 'Toalha de alta gramatura anti-risco para secagem e acabamento.' },
                    { id: 'rw_luva_microfibra', name: 'Luva de Lavagem em Microfibra', pointsCost: 150, description: 'Luva anatômica macia para limpeza segura de veículos.' },
                    { id: 'rw_kit_soquetes', name: 'Jogo de Soquetes e Bits 10 Peças', pointsCost: 300, description: 'Conjunto compacto de ferramentas para bancada e oficina.' },
                    { id: 'rw_cupom_300', name: 'Voucher R$ 300 em Equipamentos', pointsCost: 600, description: 'Abatimento direto na compra de elevadores, desmontadoras ou scanners.' },
                    { id: 'rw_cupom_600', name: 'Voucher R$ 600 em Equipamentos Premium', pointsCost: 1200, description: 'Abatimento especial na compra de alinhadores 3D ou recicladoras.' }
                  ]).map((reward) => {
                    const cost = Number(reward.pointsCost || reward.points_cost || 0);
                    const userBalance = Number(pointsData.pointsAvailable ?? pointsData.points ?? 0);
                    const canRedeem = userBalance >= cost;
                    const diff = cost - userBalance;

                    return (
                      <div 
                        key={reward.id}
                        className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-amber-300 transition-all shadow-xs flex flex-col justify-between gap-3"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-mono font-black text-xs text-amber-900 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                              {cost} pts
                            </span>
                            {reward.cashCost > 0 && (
                              <span className="text-[10px] font-bold text-slate-500">
                                + R$ {Number(reward.cashCost).toFixed(2)}
                              </span>
                            )}
                          </div>
                          <h4 className="text-xs font-black text-slate-900 leading-snug">
                            {reward.name}
                          </h4>
                          <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                            {reward.description}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-slate-100">
                          {canRedeem ? (
                            <button
                              type="button"
                              onClick={() => handleRedeemReward(reward)}
                              disabled={redeemingReward === reward.id}
                              className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                            >
                              {redeemingReward === reward.id ? (
                                <>
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  <span>Processando...</span>
                                </>
                              ) : (
                                <>
                                  <Gift className="w-3.5 h-3.5 text-amber-400" />
                                  <span>Resgatar Recompensa</span>
                                </>
                              )}
                            </button>
                          ) : (
                            <div className="w-full py-1.5 px-2.5 rounded-xl bg-slate-100 text-slate-400 font-medium text-[11px] text-center">
                              Faltam {diff} pts
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* EXTRATO DE MOVIMENTAÇÕES (LEDGER COMPLETO) */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Extrato de Movimentações
                  </h4>
                  <span className="text-[10px] text-slate-400">
                    Histórico auditável de compras, resgates e estornos
                  </span>
                </div>

                {loadingPoints ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto text-amber-600 mb-2" />
                    Carregando extrato de pontos...
                  </div>
                ) : pointsData.transactions && pointsData.transactions.length > 0 ? (
                  <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden shadow-2xs">
                    {pointsData.transactions.map((tx, idx) => {
                      const pts = Number(tx.pointsEarned || tx.points_earned || 0);
                      const isNegative = pts < 0 || tx.type === 'REDEEM' || tx.type === 'REVERSE';
                      const isPending = tx.status === 'pending';

                      return (
                        <div key={idx} className="p-3.5 flex items-center justify-between text-xs bg-white hover:bg-slate-50/80 transition-colors gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-extrabold text-slate-900 truncate">
                                {tx.type === 'REDEEM' ? 'Resgate de Recompensa' :
                                 tx.type === 'REVERSE' ? 'Estorno / Devolução de Venda' :
                                 tx.type === 'BONUS' ? 'Bônus de Campanha Promocional' :
                                 tx.orderId ? `Compra Faturada #${tx.orderId}` : 'Crédito de Equipamentos'}
                              </p>

                              {/* Type Badge */}
                              {tx.type === 'REDEEM' && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-blue-100 text-blue-800">
                                  Resgate
                                </span>
                              )}
                              {tx.type === 'REVERSE' && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-red-100 text-red-800">
                                  Estorno
                                </span>
                              )}
                              {tx.type === 'BONUS' && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-purple-100 text-purple-800">
                                  Bônus
                                </span>
                              )}
                              {isPending && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-amber-100 text-amber-800">
                                  Pendente
                                </span>
                              )}
                            </div>

                            <p className="text-[10px] text-slate-400 mt-0.5">
                              {new Date(tx.createdAt || tx.created_at || Date.now()).toLocaleDateString('pt-BR')}
                              {tx.orderValue > 0 && ` • Compra: R$ ${Number(tx.orderValue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                              {tx.notes && ` • ${tx.notes}`}
                              {tx.expiresAt && ` • Validade: ${new Date(tx.expiresAt).toLocaleDateString('pt-BR')}`}
                            </p>
                          </div>

                          <div className="shrink-0 text-right">
                            <span className={`font-mono font-black text-xs px-2.5 py-1 rounded-lg border ${
                              isNegative 
                                ? 'text-red-700 bg-red-50 border-red-200' 
                                : isPending
                                ? 'text-amber-700 bg-amber-50 border-amber-200'
                                : 'text-emerald-700 bg-emerald-50 border-emerald-200'
                            }`}>
                              {pts > 0 ? `+${pts}` : pts} pts
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-8 text-center text-xs text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 space-y-1">
                    <p className="font-bold text-slate-700">Nenhuma movimentação de A-Points registrada ainda.</p>
                    <p>Seus pedidos faturados no ERP Omie geram 1 ponto a cada R$ 50 e aparecerão aqui automaticamente.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DADOS CADASTRAIS */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8 max-w-2xl mx-auto">
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
                      type="tel"
                      required
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: formatPhone(e.target.value) })}
                      placeholder="(61) 99999-9999"
                      className="form-input text-xs !pl-10 font-mono"
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
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8 max-w-2xl mx-auto">
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
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8 max-w-xl mx-auto">
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
                <label className="text-xs font-bold text-slate-700 block mb-1">Nova Senha (Mín. 8 caracteres) *</label>
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                    tabIndex={-1}
                    title={showNewPassword ? "Ocultar senha" : "Ver senha"}
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {(() => {
                  if (!passwordForm.newPassword) return null;
                  const val = getPasswordValidation(passwordForm.newPassword);
                  return (
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 mt-2 space-y-1.5 text-[10px]">
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-slate-500">Critérios de Segurança:</span>
                        <span className={val.isValid ? 'text-emerald-600' : 'text-amber-600'}>
                          {val.isValid ? 'Senha Segura ✓' : 'Em preenchimento...'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-1">
                        <span className={val.minLength ? 'text-emerald-700 font-bold' : 'text-slate-400'}>
                          {val.minLength ? '✓' : '○'} Mín. 8 caracteres
                        </span>
                        <span className={val.hasUpper ? 'text-emerald-700 font-bold' : 'text-slate-400'}>
                          {val.hasUpper ? '✓' : '○'} Letra maiúscula (A-Z)
                        </span>
                        <span className={val.hasLower ? 'text-emerald-700 font-bold' : 'text-slate-400'}>
                          {val.hasLower ? '✓' : '○'} Letra minúscula (a-z)
                        </span>
                        <span className={val.hasNumber ? 'text-emerald-700 font-bold' : 'text-slate-400'}>
                          {val.hasNumber ? '✓' : '○'} Número (0-9)
                        </span>
                        <span className={`col-span-2 ${val.hasSpecial ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>
                          {val.hasSpecial ? '✓' : '○'} Caractere especial (!@#$%...)
                        </span>
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">Confirmar Nova Senha *</label>
                  {passwordForm.confirmPassword && (
                    <span className={`text-[10px] font-bold ${passwordForm.newPassword === passwordForm.confirmPassword ? 'text-emerald-600' : 'text-rose-500'}`}>
                      {passwordForm.newPassword === passwordForm.confirmPassword ? '✓ Conferem' : '✕ Diferentes'}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    placeholder="••••••••"
                    className="form-input text-xs !pl-10 !pr-10"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                    tabIndex={-1}
                    title={showConfirmPassword ? "Ocultar confirmação" : "Ver confirmação"}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
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

      {/* MODAL PERSONALIZADO DE CONFIRMAÇÃO DE RESGATE & ESCOLHA DE ENTREGA */}
      {confirmRedeemReward && (() => {
        const isVoucher = confirmRedeemReward.category === 'vouchers' || confirmRedeemReward.id.startsWith('rw_cupom');
        const cost = confirmRedeemReward.pointsCost || confirmRedeemReward.points_cost || 0;
        const currentBal = pointsData.pointsAvailable ?? pointsData.points ?? 0;
        const afterBal = Math.max(0, currentBal - cost);

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-lg max-h-[90vh] flex flex-col rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 text-slate-100">
              
              {/* Header com gradiente */}
              <div className="p-4 sm:p-5 border-b border-slate-800 bg-linear-to-b from-amber-500/10 to-transparent flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                    <Gift className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">Confirmar Resgate</h3>
                    <p className="text-xs text-slate-400">
                      {isVoucher ? 'Voucher Digital A-Points' : 'Envio e Entrega do Brinde'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setConfirmRedeemReward(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Corpo com Scroll */}
              <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs">
                
                {/* Item Resgatado Card */}
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-3.5">
                  {confirmRedeemReward.image ? (
                    <img
                      src={confirmRedeemReward.image}
                      alt={confirmRedeemReward.name}
                      className="w-14 h-14 rounded-xl object-cover bg-white shrink-0 border border-slate-800"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                      <Gift className="w-7 h-7" />
                    </div>
                  )}
                  <div className="space-y-1 min-w-0">
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                      {confirmRedeemReward.category || 'Recompensa Fidelidade'}
                    </span>
                    <h4 className="text-sm font-bold text-white leading-snug truncate">
                      {confirmRedeemReward.name}
                    </h4>
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-black bg-red-500/10 text-red-400 border border-red-500/20">
                      - {cost} A-Points
                    </span>
                  </div>
                </div>

                {/* Comparativo de Saldo */}
                <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Seu saldo atual:</span>
                    <span className="font-bold text-white">{currentBal} pts</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Custo deste resgate:</span>
                    <span className="font-bold text-red-400">- {cost} pts</span>
                  </div>
                  <div className="border-t border-slate-800 pt-1.5 flex items-center justify-between font-bold">
                    <span className="text-slate-300">Saldo restante após resgate:</span>
                    <span className="text-emerald-400 font-extrabold text-sm">{afterBal} pts</span>
                  </div>
                </div>

                {/* Seção de Entrega (se for item físico) */}
                {!isVoucher ? (
                  <div className="space-y-3 pt-1">
                    <label className="text-xs font-bold text-slate-200 block uppercase tracking-wider">
                      Como deseja receber seu brinde? *
                    </label>

                    {/* 3 Opções de Entrega */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setRedeemDeliveryMethod('shipping')}
                        className={`p-3 rounded-xl border text-left flex flex-col justify-between gap-1 transition-all cursor-pointer ${
                          redeemDeliveryMethod === 'shipping'
                            ? 'bg-amber-500/10 border-amber-500 text-amber-300 font-bold ring-1 ring-amber-500'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <Package className="w-4 h-4 text-amber-400" />
                          <span className="text-xs">Enviar no Endereço</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-normal leading-tight">
                          Correios / Transportadora
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setRedeemDeliveryMethod('pickup')}
                        className={`p-3 rounded-xl border text-left flex flex-col justify-between gap-1 transition-all cursor-pointer ${
                          redeemDeliveryMethod === 'pickup'
                            ? 'bg-amber-500/10 border-amber-500 text-amber-300 font-bold ring-1 ring-amber-500'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <Building className="w-4 h-4 text-amber-400" />
                          <span className="text-xs">Retirar no Balcão</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-normal leading-tight">
                          Sede Athena (DF)
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setRedeemDeliveryMethod('with_order')}
                        className={`p-3 rounded-xl border text-left flex flex-col justify-between gap-1 transition-all cursor-pointer ${
                          redeemDeliveryMethod === 'with_order'
                            ? 'bg-amber-500/10 border-amber-500 text-amber-300 font-bold ring-1 ring-amber-500'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <Truck className="w-4 h-4 text-amber-400" />
                          <span className="text-xs">Próximo Pedido</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-normal leading-tight">
                          Junto com vendedor
                        </span>
                      </button>
                    </div>

                    {/* Formulário de Endereço (se 'shipping') */}
                    {redeemDeliveryMethod === 'shipping' && (
                      <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 animate-in fade-in">
                        <div className="flex items-center justify-between pb-1 border-b border-slate-800/80">
                          <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" /> Endereço de Entrega
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {searchingRedeemCep ? 'Buscando CEP...' : 'Preenchimento automático via CEP'}
                          </span>
                        </div>

                        {/* CEP com Busca */}
                        <div>
                          <label className="text-[11px] font-bold text-slate-300 block mb-1">
                            CEP *
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={redeemAddress.cep}
                              onChange={(e) => setRedeemAddress({ ...redeemAddress, cep: e.target.value })}
                              onBlur={handleRedeemCepBlur}
                              placeholder="70000-000"
                              maxLength={9}
                              className="flex-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                            />
                            <button
                              type="button"
                              onClick={handleRedeemCepBlur}
                              disabled={searchingRedeemCep}
                              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold transition-colors cursor-pointer shrink-0"
                            >
                              {searchingRedeemCep ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Buscar'}
                            </button>
                          </div>
                        </div>

                        {/* Rua e Número */}
                        <div className="grid grid-cols-3 gap-2">
                          <div className="col-span-2">
                            <label className="text-[11px] font-bold text-slate-300 block mb-1">
                              Logradouro / Rua *
                            </label>
                            <input
                              type="text"
                              value={redeemAddress.street}
                              onChange={(e) => setRedeemAddress({ ...redeemAddress, street: e.target.value })}
                              placeholder="Rua, Avenida, Setor..."
                              className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-500"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-bold text-slate-300 block mb-1">
                              Número *
                            </label>
                            <input
                              type="text"
                              value={redeemAddress.number}
                              onChange={(e) => setRedeemAddress({ ...redeemAddress, number: e.target.value })}
                              placeholder="Ex: 100"
                              className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-500"
                            />
                          </div>
                        </div>

                        {/* Complemento e Bairro */}
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[11px] font-bold text-slate-300 block mb-1">
                              Complemento
                            </label>
                            <input
                              type="text"
                              value={redeemAddress.complement}
                              onChange={(e) => setRedeemAddress({ ...redeemAddress, complement: e.target.value })}
                              placeholder="Galpão, Sala..."
                              className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-500"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-bold text-slate-300 block mb-1">
                              Bairro *
                            </label>
                            <input
                              type="text"
                              value={redeemAddress.neighborhood}
                              onChange={(e) => setRedeemAddress({ ...redeemAddress, neighborhood: e.target.value })}
                              placeholder="Bairro ou Setor"
                              className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-500"
                            />
                          </div>
                        </div>

                        {/* Cidade e UF */}
                        <div className="grid grid-cols-3 gap-2">
                          <div className="col-span-2">
                            <label className="text-[11px] font-bold text-slate-300 block mb-1">
                              Cidade *
                            </label>
                            <input
                              type="text"
                              value={redeemAddress.city}
                              onChange={(e) => setRedeemAddress({ ...redeemAddress, city: e.target.value })}
                              placeholder="Cidade"
                              className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-500"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-bold text-slate-300 block mb-1">
                              UF *
                            </label>
                            <input
                              type="text"
                              value={redeemAddress.state}
                              onChange={(e) => setRedeemAddress({ ...redeemAddress, state: e.target.value.toUpperCase() })}
                              placeholder="DF"
                              maxLength={2}
                              className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs uppercase font-mono focus:outline-none focus:border-amber-500 text-center"
                            />
                          </div>
                        </div>

                        {/* Checkbox Salvar Padrão */}
                        <label className="flex items-center gap-2 pt-1 text-[11px] text-slate-400 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={saveAsDefaultAddress}
                            onChange={(e) => setSaveAsDefaultAddress(e.target.checked)}
                            className="rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-0 cursor-pointer"
                          />
                          <span>Salvar como meu endereço padrão de entrega na Athena</span>
                        </label>
                      </div>
                    )}

                    {/* Alerta de Retirada na Sede */}
                    {redeemDeliveryMethod === 'pickup' && (
                      <div className="p-3.5 rounded-2xl bg-slate-950 border border-amber-500/30 text-slate-300 space-y-1.5 animate-in fade-in">
                        <p className="font-bold text-amber-400 flex items-center gap-1.5">
                          <Building className="w-4 h-4" /> Retirada no Balcão da Sede Athena
                        </p>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          Sede Física: <strong>Brasília / DF (Arniqueira / Park Way)</strong>.<br />
                          Horário de Atendimento: Segunda a Sexta, das 08h às 18h.<br />
                          Após a confirmação, seu brinde é reservado e nosso time avisará no seu WhatsApp quando estiver pronto para retirada.
                        </p>
                      </div>
                    )}

                    {/* Alerta de Despacho com Próximo Pedido */}
                    {redeemDeliveryMethod === 'with_order' && (
                      <div className="p-3.5 rounded-2xl bg-slate-950 border border-sky-500/30 text-slate-300 space-y-1.5 animate-in fade-in">
                        <p className="font-bold text-sky-400 flex items-center gap-1.5">
                          <Truck className="w-4 h-4" /> Envio Junto com seu Próximo Pedido
                        </p>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          Se você já está negociando um equipamento ou vai realizar uma compra com seu consultor, o brinde será anexado na mesma remessa de entrega técnica sem custo de frete.
                        </p>
                      </div>
                    )}

                    {/* Observação Adicional */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-400 block mb-1">
                        Observações de Entrega (Opcional)
                      </label>
                      <input
                        type="text"
                        value={redeemNotes}
                        onChange={(e) => setRedeemNotes(e.target.value)}
                        placeholder="Ex: Deixar na portaria, entregar aos cuidados do chefe de oficina..."
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
                      />
                    </div>

                  </div>
                ) : (
                  /* Voucher Digital Info */
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-slate-300 space-y-2">
                    <p className="font-bold text-amber-400 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4" /> Voucher Digital Vinculado
                    </p>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Este voucher ficará disponível no seu extrato e nosso consultor poderá aplicar a bonificação diretamente como abatimento na proposta ou faturamento do seu próximo equipamento no Omie ERP.
                    </p>
                  </div>
                )}

                <p className="text-[11px] text-slate-500 leading-relaxed text-center pt-1">
                  Ao confirmar, os pontos serão debitados da sua conta e um comprovante oficial com protocolo e detalhes de entrega será enviado para o seu e-mail.
                </p>
              </div>

              {/* Ações (Footer fixo) */}
              <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-900/80 flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setConfirmRedeemReward(null)}
                  disabled={redeemingReward === confirmRedeemReward.id}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors cursor-pointer text-center"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => executeRedeemReward(confirmRedeemReward)}
                  disabled={redeemingReward === confirmRedeemReward.id}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  {redeemingReward === confirmRedeemReward.id ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Processando...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Confirmar Resgate</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          </div>
        );
      })()}
    </div>
  );
}
