import React, { useState, useMemo } from 'react';
import { ShieldCheck, Lock, Eye, EyeOff, Check, X, AlertCircle, Loader2, KeyRound } from 'lucide-react';
import { getPasswordValidation } from '../pages/LoginPage';
import { saveSession } from '../utils/storage';

export default function ForceChangePasswordModal({
  isOpen,
  currentUser,
  onSuccess,
  onLogout,
  API_BASE_URL,
  showNotification
}) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const validation = useMemo(() => {
    return getPasswordValidation(newPassword);
  }, [newPassword]);

  if (!isOpen || !currentUser?.mustChangePassword) {
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!validation.isValid) {
      setErrorMessage('Por favor, atenda a todos os critérios de segurança da senha listados abaixo.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('A confirmação de senha não confere com a nova senha.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/force-change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.token}`
        },
        body: JSON.stringify({ newPassword })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao cadastrar nova senha.');
      }

      const updatedUser = {
        ...currentUser,
        mustChangePassword: false
      };
      saveSession(updatedUser);
      showNotification?.(data.message || 'Senha definitiva definida com sucesso!', 'success');
      onSuccess?.(updatedUser);
    } catch (err) {
      setErrorMessage(err.message || 'Erro ao comunicar com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 text-slate-100">
        
        {/* Header com ícone de alta segurança */}
        <div className="p-6 border-b border-slate-800 bg-linear-to-b from-amber-500/15 via-transparent to-transparent text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
            <KeyRound className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-black text-white tracking-tight">
            Definição Obrigatória de Senha
          </h2>
          <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
            Você acessou com uma <strong className="text-amber-400">senha temporária</strong> fornecida pelo suporte. Por segurança, crie sua nova senha definitiva agora.
          </p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Campo Nova Senha */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 block">
              Nova Senha Definitiva *
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Digite sua nova senha..."
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-500 transition-colors"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 cursor-pointer"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Campo Confirmar Nova Senha */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 block">
              Confirmar Nova Senha *
            </label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repita a nova senha..."
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-500 transition-colors"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 cursor-pointer"
                tabIndex={-1}
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Checklist de Validação */}
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2 text-[11px]">
            <p className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
              Requisitos de Segurança:
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              <div className={`flex items-center gap-1.5 ${validation.hasMinLength ? 'text-emerald-400' : 'text-slate-500'}`}>
                {validation.hasMinLength ? <Check className="w-3.5 h-3.5 shrink-0" /> : <X className="w-3.5 h-3.5 shrink-0" />}
                <span>Mínimo 8 dígitos</span>
              </div>
              <div className={`flex items-center gap-1.5 ${validation.hasUpper ? 'text-emerald-400' : 'text-slate-500'}`}>
                {validation.hasUpper ? <Check className="w-3.5 h-3.5 shrink-0" /> : <X className="w-3.5 h-3.5 shrink-0" />}
                <span>Letra maiúscula (A-Z)</span>
              </div>
              <div className={`flex items-center gap-1.5 ${validation.hasLower ? 'text-emerald-400' : 'text-slate-500'}`}>
                {validation.hasLower ? <Check className="w-3.5 h-3.5 shrink-0" /> : <X className="w-3.5 h-3.5 shrink-0" />}
                <span>Letra minúscula (a-z)</span>
              </div>
              <div className={`flex items-center gap-1.5 ${validation.hasNumber ? 'text-emerald-400' : 'text-slate-500'}`}>
                {validation.hasNumber ? <Check className="w-3.5 h-3.5 shrink-0" /> : <X className="w-3.5 h-3.5 shrink-0" />}
                <span>Ao menos 1 número</span>
              </div>
              <div className={`flex items-center gap-1.5 col-span-2 ${validation.hasSpecial ? 'text-emerald-400' : 'text-slate-500'}`}>
                {validation.hasSpecial ? <Check className="w-3.5 h-3.5 shrink-0" /> : <X className="w-3.5 h-3.5 shrink-0" />}
                <span>Caractere especial (!@#$%...)</span>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || !validation.isValid || !confirmPassword}
              className="w-full py-3 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs transition-colors shadow-md flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Salvando Senha Definitiva...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Salvar Nova Senha e Acessar Minha Conta</span>
                </>
              )}
            </button>
          </div>
        </form>

        {onLogout && (
          <div className="px-6 pb-6 text-center border-t border-slate-800/60 pt-4">
            <button
              type="button"
              onClick={() => onLogout('Você saiu da sua conta.')}
              className="text-xs text-slate-500 hover:text-slate-300 font-medium transition-colors cursor-pointer"
            >
              ← Sair da conta por agora
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
