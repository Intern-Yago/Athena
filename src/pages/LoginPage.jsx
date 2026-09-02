import React, { useState, useMemo } from 'react';
import { 
  Lock, 
  Mail, 
  Key, 
  User, 
  Phone, 
  Building, 
  FileText, 
  ArrowRight, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  HelpCircle, 
  ArrowLeft,
  ShieldCheck,
  Sparkles,
  Send,
  RefreshCw,
  Search,
  Loader2
} from 'lucide-react';
import { formatCpfCnpj, fetchCnpjData } from '../utils/documentUtils';

export default function LoginPage({ onLoginSuccess, onNavigate, API_BASE_URL }) {
  // Mode: 'login' | 'register'
  const [authMode, setAuthMode] = useState('login');

  // Login Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register Form State
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    phone: '',
    document: '',
    companyName: '',
    password: '',
    confirmPassword: ''
  });
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);

  // Forgot Password Modal State
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: Email Input, 2: Code + New Password
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotCode, setForgotCode] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccessMsg, setForgotSuccessMsg] = useState('');
  const [forgotErrorMsg, setForgotErrorMsg] = useState('');

  // General Status State
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSearchingCnpj, setIsSearchingCnpj] = useState(false);
  const [cnpjSuccessMsg, setCnpjSuccessMsg] = useState(null);
  const [cnpjErrorMsg, setCnpjErrorMsg] = useState(null);

  const docInfo = useMemo(() => {
    return formatCpfCnpj(registerForm.document);
  }, [registerForm.document]);

  const triggerCnpjLookup = async (manualRaw = null) => {
    const raw = manualRaw || registerForm.document.replace(/[^0-9a-zA-Z]/g, '').toUpperCase();
    if (raw.length !== 14) return;
    setIsSearchingCnpj(true);
    setCnpjErrorMsg(null);
    setCnpjSuccessMsg(null);
    try {
      const data = await fetchCnpjData(raw);
      setRegisterForm(prev => ({
        ...prev,
        companyName: data.tradeName || data.companyName || prev.companyName,
        phone: prev.phone || data.phone || ''
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
    setRegisterForm(prev => ({ ...prev, document: info.formatted }));

    if (info.isCnpj && info.isComplete && !registerForm.companyName) {
      triggerCnpjLookup(info.raw);
    }
  };
  const [loading, setLoading] = useState(false);

  // Handle Login Submit
  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginEmail.trim(),
          password: loginPassword
        })
      });

      if (res.ok) {
        const userData = await res.json();
        onLoginSuccess(userData);
      } else {
        const errData = await res.json().catch(() => ({}));
        setErrorMsg(errData.error || 'E-mail ou senha incorretos.');
      }
    } catch (err) {
      setErrorMsg('Não foi possível conectar ao servidor. Verifique sua conexão com a internet.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Register Submit
  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (registerForm.password.length < 6) {
      setErrorMsg('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    if (registerForm.password !== registerForm.confirmPassword) {
      setErrorMsg('A confirmação da senha não confere.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: registerForm.name.trim(),
          email: registerForm.email.trim(),
          phone: registerForm.phone.trim(),
          document: registerForm.document.trim(),
          companyName: registerForm.companyName.trim(),
          password: registerForm.password
        })
      });

      const data = await res.json();
      if (res.ok) {
        onLoginSuccess(data);
      } else {
        setErrorMsg(data.error || 'Erro ao realizar cadastro.');
      }
    } catch (err) {
      setErrorMsg('Não foi possível conectar ao servidor para efetuar o cadastro.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Forgot Password - Step 1: Send Code via Google SMTP
  const handleSendForgotCode = async (e) => {
    e.preventDefault();
    setForgotErrorMsg('');
    setForgotSuccessMsg('');
    setForgotLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail.trim() })
      });

      const data = await res.json();
      if (res.ok) {
        setForgotStep(2);
        setForgotSuccessMsg('Código de 6 dígitos enviado para seu e-mail! Verifique sua caixa de entrada e spam.');
        if (data.devCode) {
          setForgotCode(data.devCode);
        }
      } else {
        setForgotErrorMsg(data.error || 'E-mail não localizado no sistema.');
      }
    } catch (err) {
      setForgotErrorMsg('Não foi possível conectar ao servidor de e-mail.');
    } finally {
      setForgotLoading(false);
    }
  };

  // Handle Forgot Password - Step 2: Reset Password with Code
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setForgotErrorMsg('');
    setForgotSuccessMsg('');

    if (forgotNewPassword.length < 6) {
      setForgotErrorMsg('A nova senha deve ter no mínimo 6 caracteres.');
      return;
    }

    if (forgotNewPassword !== forgotConfirmPassword) {
      setForgotErrorMsg('A confirmação da nova senha não confere.');
      return;
    }

    setForgotLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: forgotEmail.trim(),
          code: forgotCode.trim(),
          newPassword: forgotNewPassword
        })
      });

      const data = await res.json();
      if (res.ok) {
        setIsForgotModalOpen(false);
        setForgotStep(1);
        setForgotEmail('');
        setForgotCode('');
        setForgotNewPassword('');
        setForgotConfirmPassword('');
        setAuthMode('login');
        setLoginEmail(forgotEmail);
        setSuccessMsg('Senha alterada com sucesso! Você já pode entrar com sua nova senha.');
      } else {
        setForgotErrorMsg(data.error || 'Código inválido ou expirado.');
      }
    } catch (err) {
      setForgotErrorMsg('Erro ao conectar ao servidor para redefinir senha.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="py-12 flex items-center justify-center container-custom">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 space-y-6">
        
        {/* Header Logo */}
        <div className="text-center space-y-3">
          <div 
            onClick={() => onNavigate('catalog')}
            className="w-16 h-16 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center mx-auto text-amber-400 p-1 shadow-md cursor-pointer group"
          >
            <img src="/logo.jpg" alt="Athena Logo" className="w-full h-full object-contain rounded-xl group-hover:scale-105 transition-transform" />
          </div>
          
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {authMode === 'login' ? 'Acesse sua Conta' : 'Criar Minha Conta'}
            </h1>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              {authMode === 'login'
                ? 'Entre para acompanhar seus pedidos, cotações e ofertas exclusivas da Athena.'
                : 'Cadastre-se para solicitar orçamentos rápidos e gerenciar seus equipamentos.'}
            </p>
          </div>
        </div>

        {/* Tabs: Entrar vs Criar Conta */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl border border-slate-200 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setAuthMode('login');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`py-2.5 rounded-xl transition-all cursor-pointer ${
              authMode === 'login'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Já sou Cadastrado
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthMode('register');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`py-2.5 rounded-xl transition-all cursor-pointer ${
              authMode === 'register'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Criar Nova Conta
          </button>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* FORM 1: LOGIN */}
        {authMode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">E-mail Cadastrado</label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="seu.email@exemplo.com.br"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="form-input text-xs !pl-10"
                  required
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">Senha de Acesso</label>
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotModalOpen(true);
                    setForgotEmail(loginEmail);
                    setForgotErrorMsg('');
                    setForgotSuccessMsg('');
                  }}
                  className="text-[11px] text-amber-700 hover:text-amber-800 font-bold hover:underline cursor-pointer"
                >
                  Esqueci minha senha
                </button>
              </div>
              <div className="relative">
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="form-input text-xs !pl-10 !pr-10"
                  required
                />
                <Key className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                >
                  {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-gold text-xs font-bold py-3.5 justify-center shadow-md disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <span>Autenticando...</span>
              ) : (
                <>
                  <span>Entrar na Minha Conta</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* FORM 2: REGISTER */}
        {authMode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3.5">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Nome Completo / Responsável *</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ex: Roberto Almeida"
                  value={registerForm.name}
                  onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                  className="form-input text-xs !pl-10"
                  required
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">E-mail *</label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="roberto@oficina.com.br"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                  className="form-input text-xs !pl-10"
                  required
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">WhatsApp / Telefone *</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="(61) 99999-9999"
                    value={registerForm.phone}
                    onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                    className="form-input text-xs !pl-10"
                    required
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
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
                      disabled={isSearchingCnpj || registerForm.document.replace(/[^0-9a-zA-Z]/g, '').length !== 14}
                      className="text-[10px] font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 cursor-pointer disabled:opacity-40 transition-colors"
                    >
                      {isSearchingCnpj ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin text-amber-600" />
                          <span>Buscando...</span>
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
                    placeholder="000.000.000-00 ou 00.000.000/0000-00"
                    value={registerForm.document}
                    onChange={handleDocumentChange}
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
            </div>

            {/* Nome da Oficina / Razão Social - ONLY SHOWN IF CNPJ */}
            {docInfo.isCnpj && (
              <div className="animate-fadeIn">
                <label className="text-xs font-bold text-slate-700 block mb-1">Nome da Oficina / Razão Social *</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Ex: Centro Automotivo Almeida LTDA"
                    value={registerForm.companyName}
                    onChange={(e) => setRegisterForm({ ...registerForm, companyName: e.target.value })}
                    className="form-input text-xs !pl-10"
                    required={docInfo.isCnpj}
                  />
                  <Building className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Senha (Mín. 6 dígitos) *</label>
                <div className="relative">
                  <input
                    type={showRegisterPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                    className="form-input text-xs !pl-10"
                    required
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Confirmar Senha *</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={registerForm.confirmPassword}
                  onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                  className="form-input text-xs"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-gold text-xs font-bold py-3.5 justify-center shadow-md disabled:opacity-50 cursor-pointer pt-2"
            >
              {loading ? (
                <span>Criando Conta...</span>
              ) : (
                <>
                  <span>Concluir Cadastro e Entrar</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Back to Catalog Link */}
        <div className="pt-4 border-t border-slate-100 text-center">
          <button
            type="button"
            onClick={() => onNavigate('catalog')}
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 font-bold transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar ao Catálogo de Equipamentos</span>
          </button>
        </div>

      </div>

      {/* FORGOT PASSWORD MODAL (GOOGLE SMTP INTEGRATED) */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 max-w-md w-full space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">Recuperação de Senha</h3>
                  <span className="text-[10px] text-slate-400">Google SMTP Oficial Athena</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsForgotModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            {forgotSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{forgotSuccessMsg}</span>
              </div>
            )}

            {forgotErrorMsg && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{forgotErrorMsg}</span>
              </div>
            )}

            {/* STEP 1: Enter Email */}
            {forgotStep === 1 && (
              <form onSubmit={handleSendForgotCode} className="space-y-4">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Digite seu e-mail cadastrado para receber um código de 6 dígitos e redefinir sua senha:
                </p>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">E-mail Cadastrado</label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      placeholder="seu.email@exemplo.com.br"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="form-input text-xs !pl-10"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsForgotModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="btn-gold text-xs font-bold py-2.5 px-5 shadow-md disabled:opacity-50 inline-flex items-center gap-2 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{forgotLoading ? 'Enviando...' : 'Enviar Código'}</span>
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: Enter Code & New Password */}
            {forgotStep === 2 && (
              <form onSubmit={handleResetPassword} className="space-y-3.5">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Código de 6 Dígitos (Enviado por E-mail)</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="123456"
                    value={forgotCode}
                    onChange={(e) => setForgotCode(e.target.value)}
                    className="form-input text-sm font-mono text-center tracking-widest font-black !py-2.5"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Nova Senha (Mín. 6 dígitos) *</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={forgotNewPassword}
                    onChange={(e) => setForgotNewPassword(e.target.value)}
                    className="form-input text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Confirmar Nova Senha *</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={forgotConfirmPassword}
                    onChange={(e) => setForgotConfirmPassword(e.target.value)}
                    className="form-input text-xs"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setForgotStep(1)}
                    className="text-xs font-bold text-slate-500 hover:text-slate-800"
                  >
                    ← Voltar
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="btn-gold text-xs font-bold py-2.5 px-5 shadow-md disabled:opacity-50 inline-flex items-center gap-2 cursor-pointer"
                  >
                    <Key className="w-3.5 h-3.5" />
                    <span>{forgotLoading ? 'Redefinindo...' : 'Salvar Nova Senha'}</span>
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
