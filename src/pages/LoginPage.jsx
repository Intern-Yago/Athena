import React, { useState } from 'react';
import { Lock, Mail, Key, Shield, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function LoginPage({ onLoginSuccess, onNavigate, API_BASE_URL }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password })
      });

      if (res.ok) {
        const userData = await res.json();
        onLoginSuccess(userData);
      } else {
        const errData = await res.json().catch(() => ({}));
        setErrorMsg(errData.error || 'E-mail ou senha incorretos.');
      }
    } catch (err) {
      // Local fallback for offline mode
      if (email.trim().toLowerCase() === 'admin@athena.com.br' && (password === 'admin123' || password === 'admin')) {
        onLoginSuccess({
          id: 'user_admin_local',
          name: 'Administrador Geral',
          email: 'admin@athena.com.br',
          role: 'admin',
          token: 'token_local'
        });
      } else {
        setErrorMsg('Servidor de autenticação indisponível ou credenciais inválidas.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-16 flex items-center justify-center container-custom">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-xl p-8 space-y-6">
        
        {/* Header Logo */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-amber-400 p-1 shadow-md">
            <img src="/logo.jpg" alt="Athena Logo" className="w-full h-full object-contain rounded-xl" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold">
            <Shield className="w-3.5 h-3.5 text-amber-600" /> Acesso Restrito a Funcionários
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Painel da Athena
          </h1>
          <p className="text-xs text-slate-500">
            Entre com suas credenciais de funcionário para acessar a plataforma.
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">E-mail Corporativo</label>
            <div className="relative">
              <input
                type="email"
                placeholder="seu.nome@athena.com.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input text-xs pl-9"
                required
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Senha de Acesso</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input text-xs pl-9 pr-9"
                required
              />
              <Key className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-gold text-xs font-bold py-3.5 justify-center shadow-md disabled:opacity-50"
          >
            {loading ? (
              <span>Autenticando...</span>
            ) : (
              <>
                <span>Entrar no Painel</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Initial Seed Help Box */}
        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-center space-y-1 text-[11px] text-slate-500">
          <span className="font-bold text-slate-700 block">Credenciais Padrão do Super Admin:</span>
          <span>E-mail: <strong className="text-amber-800">admin@athena.com.br</strong></span>
          <span className="block">Senha: <strong className="text-amber-800">admin123</strong></span>
        </div>

      </div>
    </div>
  );
}
