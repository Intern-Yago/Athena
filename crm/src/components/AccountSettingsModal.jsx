import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  X, 
  User, 
  Mail, 
  Lock, 
  Shield, 
  Eye, 
  EyeOff, 
  Save, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  KeyRound,
  ShieldCheck
} from 'lucide-react';

export default function AccountSettingsModal({ isOpen, onClose }) {
  const { user, API_BASE_URL, getAuthHeaders } = useAuth();
  const { isDark } = useTheme();

  const [name, setName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setError('');
      setSuccessMsg('');
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!name.trim()) {
      setError('O nome não pode ficar em branco.');
      return;
    }

    if (newPassword) {
      if (newPassword.length < 6) {
        setError('A nova senha deve possuir pelo menos 6 caracteres.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setError('A confirmação da nova senha não confere.');
        return;
      }
      if (!currentPassword) {
        setError('Informe sua senha atual para autorizar a troca.');
        return;
      }
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/crm/account/me`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: name.trim(),
          currentPassword: currentPassword || undefined,
          newPassword: newPassword || undefined
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erro ao atualizar dados da conta.');
      }

      setSuccessMsg('Configurações e credenciais salvas com sucesso!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      setTimeout(() => {
        setSuccessMsg('');
      }, 3000);
    } catch (err) {
      setError(err.message || 'Falha ao conectar com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className={`relative w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden transition-all ${
        isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        {/* Header */}
        <div className={`p-5 border-b flex items-center justify-between ${
          isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center border border-amber-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-tight">Configurações da Minha Conta</h3>
              <p className="text-xs text-slate-400 mt-0.5">Gerencie seu perfil e altere sua senha de acesso</p>
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
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

          {/* Dados Gerais */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Dados do Perfil</h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-400">E-mail de Acesso</label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    disabled
                    value={user?.email || ''}
                    className={`w-full rounded-xl pl-9 pr-3 py-2 text-xs border opacity-70 cursor-not-allowed ${
                      isDark ? 'bg-slate-950/60 border-slate-800 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-600'
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-400">Cargo / Permissão</label>
                <div className="relative">
                  <Shield className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    disabled
                    value={(user?.role || 'staff').toUpperCase()}
                    className={`w-full rounded-xl pl-9 pr-3 py-2 text-xs font-bold border opacity-70 cursor-not-allowed uppercase font-mono ${
                      isDark ? 'bg-slate-950/60 border-slate-800 text-amber-400' : 'bg-slate-100 border-slate-200 text-amber-600'
                    }`}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-400">
                Nome de Exibição <span className="text-amber-500">*</span>
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome"
                  className={`w-full rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none border transition-colors ${
                    isDark 
                      ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-600 focus:border-amber-400' 
                      : 'bg-slate-100 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-amber-500'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Troca de Senha */}
          <div className="pt-2 border-t border-slate-800/80 space-y-3">
            <div className="flex items-center gap-2">
              <KeyRound className="w-3.5 h-3.5 text-amber-500" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Alterar Senha de Acesso</h4>
            </div>

            <div className="space-y-2.5">
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-400">Senha Atual</label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Digite sua senha atual caso vá alterar"
                    className={`w-full rounded-xl pl-9 pr-10 py-2 text-xs focus:outline-none border transition-colors ${
                      isDark 
                        ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-600 focus:border-amber-400' 
                        : 'bg-slate-100 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-amber-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                  >
                    {showCurrentPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-400">Nova Senha</label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className={`w-full rounded-xl pl-9 pr-10 py-2 text-xs focus:outline-none border transition-colors ${
                        isDark 
                          ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-600 focus:border-amber-400' 
                          : 'bg-slate-100 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-amber-500'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      tabIndex={-1}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                    >
                      {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-400">Confirmar Nova Senha</label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repita a nova senha"
                      className={`w-full rounded-xl pl-9 pr-10 py-2 text-xs focus:outline-none border transition-colors ${
                        isDark 
                          ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-600 focus:border-amber-400' 
                          : 'bg-slate-100 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-amber-500'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      tabIndex={-1}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                    >
                      {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                isDark ? 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900'
              }`}
            >
              Fechar
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition cursor-pointer disabled:opacity-50 active:scale-98"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Salvando...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Salvar Alterações</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
