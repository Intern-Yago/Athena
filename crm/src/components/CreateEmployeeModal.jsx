import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  X, 
  UserPlus, 
  Mail, 
  Lock, 
  User, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  KeyRound, 
  Loader2, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

export default function CreateEmployeeModal({ isOpen, onClose, onSaved }) {
  const { API_BASE_URL, getAuthHeaders } = useAuth();
  const { isDark } = useTheme();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('admathenas2026@gmail.com');
  const [role, setRole] = useState('vendedor');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleGeneratePassword = () => {
    const randomPin = Math.floor(1000 + Math.random() * 9000);
    const generated = `Athena@${randomPin}`;
    setPassword(generated);
    setShowPassword(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!name.trim()) {
      setError('Por favor, informe o nome completo do funcionário.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Por favor, informe um e-mail corporativo válido.');
      return;
    }
    if (!password || password.length < 6) {
      setError('A senha inicial deve possuir no mínimo 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/crm/team`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          role,
          password
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erro ao cadastrar funcionário.');
      }

      setSuccessMsg(data.message || 'Funcionário cadastrado com sucesso!');
      if (onSaved) onSaved(data.data);

      setTimeout(() => {
        setName('');
        setPassword('');
        setSuccessMsg('');
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.message || 'Falha na conexão com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className={`relative w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden transition-all ${
        isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        {/* Modal Header */}
        <div className={`p-5 border-b flex items-center justify-between ${
          isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center border border-amber-500/30">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-tight">Cadastrar Novo Funcionário</h3>
              <p className="text-xs text-slate-400 mt-0.5">Crie acessos para a equipe comercial ou administrativa</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`p-1.5 rounded-xl border transition cursor-pointer ${
              isDark ? 'bg-slate-950 text-slate-400 hover:text-white border-slate-800' : 'bg-slate-100 text-slate-500 hover:text-slate-900 border-slate-200'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Nome Completo */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-400">
              Nome Completo do Funcionário <span className="text-amber-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Carlos Oliveira"
                className={`w-full rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none border transition-colors ${
                  isDark 
                    ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-600 focus:border-amber-400' 
                    : 'bg-slate-100 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-amber-500'
                }`}
              />
            </div>
          </div>

          {/* E-mail Corporativo */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-400">
              E-mail Corporativo <span className="text-amber-500">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admathenas2026@gmail.com"
                className={`w-full rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none border transition-colors ${
                  isDark 
                    ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-600 focus:border-amber-400' 
                    : 'bg-slate-100 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-amber-500'
                }`}
              />
            </div>
            <p className="text-[10px] text-slate-500">
              Este e-mail será usado tanto no CRM quanto no Painel Administrativo da Athena.
            </p>
          </div>

          {/* Cargo / Permissão */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-400">
              Cargo & Nível de Acesso <span className="text-amber-500">*</span>
            </label>
            <div className="relative">
              <ShieldCheck className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className={`w-full rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none border cursor-pointer transition-colors ${
                  isDark 
                    ? 'bg-slate-950 border-slate-800 text-white focus:border-amber-400' 
                    : 'bg-slate-100 border-slate-200 text-slate-900 focus:border-amber-500'
                }`}
              >
                <option value="vendedor">Vendedor Comercial (Acesso a leads, funis e radar)</option>
                <option value="admin">Administrador (Controle total de equipe, funis e configurações)</option>
                <option value="staff">Operações & Atendimento (Gestão de leads e pedidos)</option>
              </select>
            </div>
          </div>

          {/* Senha Inicial com Ícone de Olho para visualizar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-400">
                Senha Inicial <span className="text-amber-500">*</span>
              </label>
              <button
                type="button"
                onClick={handleGeneratePassword}
                className="text-[10px] font-bold text-amber-500 hover:text-amber-400 flex items-center gap-1 cursor-pointer transition"
              >
                <KeyRound className="w-3 h-3" />
                <span>Gerar Senha Aleatória</span>
              </button>
            </div>

            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className={`w-full rounded-xl pl-10 pr-11 py-2.5 text-xs focus:outline-none border transition-colors ${
                  isDark 
                    ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-600 focus:border-amber-400' 
                    : 'bg-slate-100 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-amber-500'
                }`}
              />

              {/* Botão do Olho no canto do input para ver a senha digitada */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg transition cursor-pointer ${
                  isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
                }`}
                title={showPassword ? 'Ocultar senha' : 'Ver o que foi digitado'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[10px] text-slate-500">
              O funcionário poderá alterar sua própria senha a qualquer momento na página de Configuração.
            </p>
          </div>

          {/* Modal Footer / Ações */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                isDark ? 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900'
              }`}
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition cursor-pointer disabled:opacity-50 active:scale-98"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Cadastrando...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Criar Conta</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
