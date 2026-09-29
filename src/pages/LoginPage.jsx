import React, { useState, useMemo, useEffect } from 'react';
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
import { formatCpfCnpj, fetchCnpjData, formatPhone, getPasswordValidation } from '../utils/documentUtils';
export { getPasswordValidation };

function PasswordStrengthIndicator({ password }) {
  if (!password) return null;
  const val = getPasswordValidation(password);

  const getStrengthLabel = () => {
    if (val.score <= 2) return { text: 'Fraca', color: 'text-rose-600', barColor: 'bg-rose-500', width: '25%' };
    if (val.score === 3) return { text: 'Média', color: 'text-amber-600', barColor: 'bg-amber-500', width: '55%' };
    if (val.score === 4) return { text: 'Boa', color: 'text-sky-600', barColor: 'bg-sky-500', width: '80%' };
    return { text: 'Excelente (Forte)', color: 'text-emerald-600', barColor: 'bg-emerald-500', width: '100%' };
  };

  const strength = getStrengthLabel();

  return (
    <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200 mt-2">
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-slate-600 font-medium">Segurança da senha:</span>
        <span className={`font-bold ${strength.color}`}>{strength.text}</span>
      </div>
      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-300 ${strength.barColor}`} 
          style={{ width: strength.width }} 
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 pt-1 text-[10px]">
        <div className={`flex items-center gap-1.5 ${val.minLength ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>
          <CheckCircle2 className={`w-3 h-3 shrink-0 ${val.minLength ? 'text-emerald-600' : 'text-slate-300'}`} />
          <span>Mín. 8 caracteres</span>
        </div>
        <div className={`flex items-center gap-1.5 ${val.hasUpper ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>
          <CheckCircle2 className={`w-3 h-3 shrink-0 ${val.hasUpper ? 'text-emerald-600' : 'text-slate-300'}`} />
          <span>Letra maiúscula (A-Z)</span>
        </div>
        <div className={`flex items-center gap-1.5 ${val.hasLower ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>
          <CheckCircle2 className={`w-3 h-3 shrink-0 ${val.hasLower ? 'text-emerald-600' : 'text-slate-300'}`} />
          <span>Letra minúscula (a-z)</span>
        </div>
        <div className={`flex items-center gap-1.5 ${val.hasNumber ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>
          <CheckCircle2 className={`w-3 h-3 shrink-0 ${val.hasNumber ? 'text-emerald-600' : 'text-slate-300'}`} />
          <span>Número (0-9)</span>
        </div>
        <div className={`flex items-center gap-1.5 sm:col-span-2 ${val.hasSpecial ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>
          <CheckCircle2 className={`w-3 h-3 shrink-0 ${val.hasSpecial ? 'text-emerald-600' : 'text-slate-300'}`} />
          <span>Caractere especial (!@#$%^&*...)</span>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage({ onLoginSuccess, onNavigate, API_BASE_URL }) {
  // Mode: 'login' | 'register'
  const [authMode, setAuthMode] = useState('login');

  // Pre-warm backend container (Render hibernation mitigation: silently ping backend on mount)
  useEffect(() => {
    if (API_BASE_URL) {
      fetch(`${API_BASE_URL}/ping`, { method: 'GET', cache: 'no-store' }).catch(() => {});
    }
  }, [API_BASE_URL]);

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
  const [showRegisterConfirmPassword, setShowRegisterConfirmPassword] = useState(false);

  // Forgot Password Modal State
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: Email Input, 2: Code + New Password
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotCode, setForgotCode] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [showForgotNewPassword, setShowForgotNewPassword] = useState(false);
  const [showForgotConfirmPassword, setShowForgotConfirmPassword] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccessMsg, setForgotSuccessMsg] = useState('');
  const [forgotErrorMsg, setForgotErrorMsg] = useState('');

  // Security, CAPTCHA & Anti-Brute Force State
  const [requiresCaptcha, setRequiresCaptcha] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState('');
  const [isLocked, setIsLocked] = useState(false);
  const [attemptsLeft, setAttemptsLeft] = useState(null);
  const [magicTokenLoading, setMagicTokenLoading] = useState(false);
  const turnstileWidgetRef = React.useRef(null);
  const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || '0x4AAAAAAFJUklvzXjiUat3z';

  // Process Emergency Magic Link on Mount (bypass for legitimate customers)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const urlParams = new URLSearchParams(window.location.search);
    const magicToken = urlParams.get('magic_token');

    if (magicToken && API_BASE_URL) {
      setMagicTokenLoading(true);
      setErrorMsg('');
      fetch(`${API_BASE_URL}/auth/magic-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ magicToken })
      })
        .then(async (res) => {
          const data = await res.json().catch(() => ({}));
          if (res.ok) {
            // Remove token from address bar so it cannot be copied/bookmarked
            const cleanUrl = window.location.pathname;
            window.history.replaceState({}, document.title, cleanUrl);
            setSuccessMsg(data.message || 'Acesso emergencial autenticado com sucesso!');
            setTimeout(() => {
              onLoginSuccess?.(data);
            }, 600);
          } else {
            setErrorMsg(data.error || 'Link de acesso emergencial inválido ou já expirado.');
          }
        })
        .catch(() => {
          setErrorMsg('Não foi possível validar o link emergencial. Verifique sua conexão.');
        })
        .finally(() => {
          setMagicTokenLoading(false);
        });
    }
  }, [API_BASE_URL, onLoginSuccess]);

  // Render Cloudflare Turnstile explicitly when requiresCaptcha is active
  useEffect(() => {
    let timer;
    if (requiresCaptcha && !isLocked && typeof window !== 'undefined') {
      const renderTurnstile = () => {
        const container = document.getElementById('turnstile-container');
        if (container && window.turnstile && !turnstileWidgetRef.current) {
          try {
            container.innerHTML = '';
            turnstileWidgetRef.current = window.turnstile.render('#turnstile-container', {
              sitekey: TURNSTILE_SITE_KEY,
              theme: 'light',
              callback: (token) => {
                setTurnstileToken(token);
                setErrorMsg('');
              },
              'error-callback': () => {
                setTurnstileToken('');
              },
              'expired-callback': () => {
                setTurnstileToken('');
              }
            });
          } catch (e) {
            console.warn('Turnstile render warning:', e);
          }
        }
      };

      timer = setTimeout(renderTurnstile, 150);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [requiresCaptcha, isLocked, TURNSTILE_SITE_KEY]);

  const resetSecurityState = () => {
    setRequiresCaptcha(false);
    setTurnstileToken('');
    setIsLocked(false);
    setAttemptsLeft(null);
    if (turnstileWidgetRef.current && window.turnstile) {
      try {
        window.turnstile.remove(turnstileWidgetRef.current);
      } catch (e) {}
      turnstileWidgetRef.current = null;
    }
  };

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

  // Handle Login Submit with Progressive Delay, Turnstile & Account Lockout
  const handleLogin = async (e) => {
    e.preventDefault();
    if (isLocked) {
      setErrorMsg('Acesso e conta bloqueados por segurança. Entre em contato com o suporte da Athena.');
      return;
    }

    if (requiresCaptcha && !turnstileToken) {
      setErrorMsg('Por favor, resolva a validação de segurança (CAPTCHA) abaixo para prosseguir.');
      return;
    }

    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginEmail.trim(),
          password: loginPassword,
          turnstileToken: turnstileToken || undefined
        })
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        resetSecurityState();
        onLoginSuccess(data);
      } else {
        if (data.isLocked || data.isAccountLocked || data.isIpBlocked || res.status === 403) {
          setIsLocked(true);
          setErrorMsg(data.error || 'Acesso e conta bloqueados por segurança após tentativas excessivas.');
        } else {
          if (data.requiresCaptcha) {
            setRequiresCaptcha(true);
            setTurnstileToken('');
            if (turnstileWidgetRef.current && window.turnstile) {
              try {
                window.turnstile.reset(turnstileWidgetRef.current);
              } catch (e) {}
            }
          }
          if (data.attemptsLeft !== undefined) {
            setAttemptsLeft(data.attemptsLeft);
          }
          setErrorMsg(data.error || 'E-mail ou senha incorretos.');
        }
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

    const pwdVal = getPasswordValidation(registerForm.password);
    if (!pwdVal.isValid) {
      if (!pwdVal.minLength) {
        setErrorMsg('A senha deve ter no mínimo 8 caracteres.');
      } else if (!pwdVal.hasUpper) {
        setErrorMsg('A senha deve conter ao menos uma letra maiúscula (A-Z).');
      } else if (!pwdVal.hasLower) {
        setErrorMsg('A senha deve conter ao menos uma letra minúscula (a-z).');
      } else if (!pwdVal.hasNumber) {
        setErrorMsg('A senha deve conter ao menos um número (0-9).');
      } else if (!pwdVal.hasSpecial) {
        setErrorMsg('A senha deve conter ao menos um caractere especial (!@#$%...).');
      }
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
        setForgotSuccessMsg(data.message || 'E-mail enviado! Se este endereço estiver cadastrado, você receberá o código em instantes.');
        if (data.devCode) {
          setForgotCode(data.devCode);
        }
      } else {
        setForgotErrorMsg(data.error || 'Não foi possível processar o envio. Tente novamente mais tarde.');
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

    const pwdVal = getPasswordValidation(forgotNewPassword);
    if (!pwdVal.isValid) {
      if (!pwdVal.minLength) {
        setForgotErrorMsg('A nova senha deve ter no mínimo 8 caracteres.');
      } else if (!pwdVal.hasUpper) {
        setForgotErrorMsg('A nova senha deve conter ao menos uma letra maiúscula (A-Z).');
      } else if (!pwdVal.hasLower) {
        setForgotErrorMsg('A nova senha deve conter ao menos uma letra minúscula (a-z).');
      } else if (!pwdVal.hasNumber) {
        setForgotErrorMsg('A nova senha deve conter ao menos um número (0-9).');
      } else if (!pwdVal.hasSpecial) {
        setForgotErrorMsg('A nova senha deve conter ao menos um caractere especial (!@#$%...).');
      }
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

        {/* Magic Token Loading Banner */}
        {magicTokenLoading && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-center space-y-2 animate-pulse">
            <div className="w-8 h-8 mx-auto rounded-full bg-amber-500/20 text-amber-700 flex items-center justify-center">
              <KeyRound className="w-4 h-4 animate-spin" />
            </div>
            <p className="text-xs font-bold text-amber-900">Validando link de acesso emergencial seguro...</p>
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

            {/* Cloudflare Turnstile CAPTCHA Widget (Shown after 5 failed attempts) */}
            {requiresCaptcha && !isLocked && (
              <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-2 animate-fadeIn">
                <div className="flex items-center justify-between text-xs font-black text-amber-950">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Validação de Segurança Athena</span>
                  </div>
                </div>
                <p className="text-[11px] text-amber-800 leading-tight">
                  Após tentativas repetidas incorretas, confirme a verificação inteligente da Cloudflare abaixo para continuar.
                </p>
                <div id="turnstile-container" className="flex justify-center pt-1 min-h-[65px]"></div>
              </div>
            )}

            {/* Account / IP Locked Support Box (Shown after failed attempts) */}
            {isLocked && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-300 text-rose-900 space-y-3 animate-fadeIn">
                <div className="flex items-center gap-2 font-black text-xs text-rose-800">
                  <Lock className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Acesso Bloqueado por Segurança</span>
                </div>
                <p className="text-xs text-rose-700 leading-relaxed font-medium">
                  {errorMsg || 'Conta ou endereço IP suspenso por motivos de segurança após repetidas tentativas. Entre em contato com a administração da Athena.'}
                </p>
                <div className="pt-2 border-t border-rose-200 flex flex-col sm:flex-row gap-2">
                  <a
                    href="https://wa.me/5561983485671?text=Ol%C3%A1%2C%20meu%20acesso%20ao%20site%20da%20Athena%20foi%20bloqueado%20por%20tentativas%20incorretas.%20Poderiam%20me%20ajudar%20a%20desbloquear%3F"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors text-center"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Falar no WhatsApp</span>
                  </a>
                  <a
                    href="mailto:administracao@athenaconsultoria.com.br?subject=Solicitação de Desbloqueio de Acesso - Athena"
                    className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors text-center"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Enviar E-mail</span>
                  </a>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || isLocked || (requiresCaptcha && !turnstileToken)}
              className="w-full btn-gold text-xs font-bold py-3.5 justify-center shadow-md disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <span>Autenticando...</span>
              ) : isLocked ? (
                <span>Acesso Bloqueado</span>
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
                    type="tel"
                    placeholder="(61) 99999-9999"
                    value={registerForm.phone}
                    onChange={(e) => setRegisterForm({ ...registerForm, phone: formatPhone(e.target.value) })}
                    className="form-input text-xs !pl-10 font-mono"
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
                <label className="text-xs font-bold text-slate-700 block mb-1">Senha (Mín. 8 caracteres) *</label>
                <div className="relative">
                  <input
                    type={showRegisterPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                    className="form-input text-xs !pl-10 !pr-10"
                    required
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <button
                    type="button"
                    onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                    tabIndex={-1}
                    title={showRegisterPassword ? "Ocultar senha" : "Ver senha"}
                  >
                    {showRegisterPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">Confirmar Senha *</label>
                  {registerForm.confirmPassword && (
                    <span className={`text-[10px] font-bold ${registerForm.password === registerForm.confirmPassword ? 'text-emerald-600' : 'text-rose-500'}`}>
                      {registerForm.password === registerForm.confirmPassword ? '✓ Conferem' : '✕ Diferentes'}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showRegisterConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={registerForm.confirmPassword}
                    onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                    className="form-input text-xs !pl-10 !pr-10"
                    required
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <button
                    type="button"
                    onClick={() => setShowRegisterConfirmPassword(!showRegisterConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                    tabIndex={-1}
                    title={showRegisterConfirmPassword ? "Ocultar confirmação" : "Ver confirmação"}
                  >
                    {showRegisterConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Indicador de Segurança da Senha */}
            <PasswordStrengthIndicator password={registerForm.password} />

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
                  <label className="text-xs font-bold text-slate-700 block mb-1">Nova Senha (Mín. 8 caracteres) *</label>
                  <div className="relative">
                    <input
                      type={showForgotNewPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={forgotNewPassword}
                      onChange={(e) => setForgotNewPassword(e.target.value)}
                      className="form-input text-xs !pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowForgotNewPassword(!showForgotNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                      tabIndex={-1}
                      title={showForgotNewPassword ? "Ocultar senha" : "Ver senha"}
                    >
                      {showForgotNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <PasswordStrengthIndicator password={forgotNewPassword} />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">Confirmar Nova Senha *</label>
                    {forgotConfirmPassword && (
                      <span className={`text-[10px] font-bold ${forgotNewPassword === forgotConfirmPassword ? 'text-emerald-600' : 'text-rose-500'}`}>
                        {forgotNewPassword === forgotConfirmPassword ? '✓ Conferem' : '✕ Diferentes'}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type={showForgotConfirmPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={forgotConfirmPassword}
                      onChange={(e) => setForgotConfirmPassword(e.target.value)}
                      className="form-input text-xs !pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowForgotConfirmPassword(!showForgotConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                      tabIndex={-1}
                      title={showForgotConfirmPassword ? "Ocultar confirmação" : "Ver confirmação"}
                    >
                      {showForgotConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
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
