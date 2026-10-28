import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  Users, 
  UserPlus, 
  Search, 
  ShieldCheck, 
  Lock, 
  Unlock, 
  Trash2, 
  KeyRound, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  Mail,
  Shield,
  UserCheck,
  UserX,
  Clock,
  Eye,
  EyeOff
} from 'lucide-react';

export default function TeamManagementView({ onOpenCreateModal }) {
  const { user: currentUser, API_BASE_URL, getAuthHeaders } = useAuth();
  const { isDark } = useTheme();

  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [feedback, setFeedback] = useState({ text: '', type: '' });

  // Estado para exclusão segura em 2 etapas
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Estado para modal/popover de reset de senha
  const [resetModalUser, setResetModalUser] = useState(null);
  const [resetPasswordVal, setResetPasswordVal] = useState('');
  const [showResetPass, setShowResetPass] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const loadTeam = async () => {
    setLoading(true);
    try {
      let res = await fetch(`${API_BASE_URL}/crm/team`, {
        headers: getAuthHeaders()
      });
      // Fallback para /users caso o endpoint /crm/team ainda esteja propagando
      if (!res.ok) {
        res = await fetch(`${API_BASE_URL}/users`, {
          headers: getAuthHeaders()
        });
      }

      if (!res.ok) {
        throw new Error(`Falha HTTP ${res.status}`);
      }

      const data = await res.json();
      let list = [];
      if (Array.isArray(data)) list = data;
      else if (data.success && Array.isArray(data.data)) list = data.data;
      else if (Array.isArray(data.data)) list = data.data;

      // Filtra clientes comuns, mantendo apenas a equipe comercial e administradores
      const teamList = list.filter(u => u.role !== 'cliente');

      // Garante que a conta do administrador logado sempre conste na lista
      if (currentUser && !teamList.some(u => String(u.id) === String(currentUser.id) || (u.email && u.email.toLowerCase() === currentUser.email?.toLowerCase()))) {
        teamList.unshift({
          id: currentUser.id,
          name: currentUser.name || 'Você (Administrador)',
          email: currentUser.email,
          role: currentUser.role || 'admin',
          isLocked: false,
          createdAt: new Date().toISOString()
        });
      }

      setTeam(teamList);
    } catch (err) {
      console.warn('Erro ao consultar equipe na nuvem, aplicando fallback local:', err);
      // Fallback resiliente: se falhar a requisição, exibe pelo menos o usuário atual logado
      if (currentUser) {
        setTeam([{
          id: currentUser.id,
          name: currentUser.name || 'Você (Administrador)',
          email: currentUser.email,
          role: currentUser.role || 'admin',
          isLocked: false,
          createdAt: new Date().toISOString()
        }]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeam();
  }, []);

  const showToast = (text, type = 'success') => {
    setFeedback({ text, type });
    setTimeout(() => {
      setFeedback({ text: '', type: '' });
    }, 4000);
  };

  // Toggle Bloqueio
  const handleToggleLock = async (user) => {
    if (user.id === currentUser?.id) {
      showToast('Você não pode bloquear seu próprio acesso de administrador.', 'error');
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/crm/team/${user.id}/toggle-lock`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (data.success) {
        setTeam(prev => prev.map(u => u.id === user.id ? { ...u, isLocked: data.isLocked } : u));
        showToast(data.message, 'success');
      } else {
        showToast(data.error || 'Erro ao alterar status.', 'error');
      }
    } catch (err) {
      showToast('Falha na comunicação com o servidor.', 'error');
    }
  };

  // Exclusão com confirmação em 2 cliques
  const handleDeleteUser = async (userId) => {
    if (userId === currentUser?.id) {
      showToast('Você não pode excluir sua própria conta.', 'error');
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/crm/team/${userId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (data.success) {
        setTeam(prev => prev.filter(u => u.id !== userId));
        setDeleteConfirmId(null);
        showToast('Funcionário removido com sucesso!', 'success');
      } else {
        showToast(data.error || 'Erro ao excluir funcionário.', 'error');
      }
    } catch (err) {
      showToast('Falha ao excluir funcionário.', 'error');
    }
  };

  // Reset de senha
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetModalUser || !resetPasswordVal || resetPasswordVal.length < 6) {
      showToast('A nova senha deve possuir no mínimo 6 caracteres.', 'error');
      return;
    }

    setResetLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/crm/team/${resetModalUser.id}/reset-password`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ newPassword: resetPasswordVal })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Senha de ${resetModalUser.name} redefinida com sucesso!`, 'success');
        setResetModalUser(null);
        setResetPasswordVal('');
      } else {
        showToast(data.error || 'Erro ao redefinir senha.', 'error');
      }
    } catch (err) {
      showToast('Falha ao redefinir senha.', 'error');
    } finally {
      setResetLoading(false);
    }
  };

  const filteredTeam = team.filter(member => {
    const matchesSearch = !search.trim() ||
      (member.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (member.email || '').toLowerCase().includes(search.toLowerCase());

    const matchesRole = roleFilter === 'all' || member.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className={`flex-1 flex flex-col min-h-0 select-none ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* Top Header */}
      <div className={`px-4 sm:px-6 py-4 border-b flex flex-wrap items-center justify-between gap-4 shrink-0 ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center border border-amber-500/30">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className={`text-base sm:text-lg font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Equipe Comercial & Acessos
              </h1>
              <span className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold ${
                isDark ? 'bg-slate-800 text-amber-400' : 'bg-amber-100 text-amber-800'
              }`}>
                {filteredTeam.length} membros
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Controle de contas sincronizado em tempo real com o Painel Administrativo da Athena
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadTeam}
            disabled={loading}
            className={`p-2 rounded-xl border text-xs flex items-center gap-1.5 transition cursor-pointer ${
              isDark 
                ? 'bg-slate-950 text-slate-400 hover:text-white border-slate-800' 
                : 'bg-slate-100 text-slate-700 hover:text-slate-900 border-slate-200'
            }`}
            title="Atualizar lista"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Atualizar</span>
          </button>

          <button
            type="button"
            onClick={onOpenCreateModal}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow-md shadow-amber-500/20 transition cursor-pointer active:scale-95"
          >
            <UserPlus className="w-4 h-4 stroke-[2.5]" />
            <span>Novo Funcionário</span>
          </button>
        </div>
      </div>

      {/* Toast Feedback */}
      {feedback.text && (
        <div className={`mx-4 sm:mx-6 mt-4 p-3 rounded-xl border text-xs flex items-center gap-2 transition-all ${
          feedback.type === 'error'
            ? 'bg-rose-500/15 border-rose-500/30 text-rose-300'
            : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
        }`}>
          {feedback.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Barra de Filtros */}
      <div className={`px-4 sm:px-6 py-3 border-b flex flex-wrap items-center justify-between gap-3 shrink-0 ${
        isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-white/80 border-slate-200'
      }`}>
        <div className="flex items-center gap-2 flex-1 min-w-[240px] max-w-md">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Pesquisar por nome ou e-mail corporativo..."
              className={`w-full rounded-xl pl-9 pr-3 py-1.5 text-xs focus:outline-none border transition-colors ${
                isDark 
                  ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus:border-amber-400' 
                  : 'bg-slate-100 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-amber-500'
              }`}
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className={`rounded-xl px-3 py-1.5 text-xs focus:outline-none cursor-pointer border ${
              isDark 
                ? 'bg-slate-950 border-slate-800 text-slate-300 focus:border-amber-400' 
                : 'bg-slate-100 border-slate-200 text-slate-700 focus:border-amber-500'
            }`}
          >
            <option value="all">Todos os Cargos</option>
            <option value="admin">Administrador</option>
            <option value="vendedor">Vendedor Comercial</option>
            <option value="staff">Operações / Staff</option>
          </select>
        </div>
      </div>

      {/* Tabela de Membros da Equipe */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 min-h-0">
        <div className={`rounded-2xl border shadow-xl overflow-hidden ${
          isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className={`border-b text-[10px] font-bold uppercase tracking-wider ${
                isDark ? 'bg-slate-950/70 border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'
              }`}>
                <tr>
                  <th className="py-3 px-4">Funcionário</th>
                  <th className="py-3 px-4">E-mail Corporativo</th>
                  <th className="py-3 px-4">Cargo / Nível</th>
                  <th className="py-3 px-4">Status de Acesso</th>
                  <th className="py-3 px-4 text-right">Ações de Gestão</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-slate-800/60' : 'divide-slate-100'}`}>
                {filteredTeam.map(member => {
                  const isLocked = Boolean(member.isLocked);
                  const isPending = member.status === 'pendente' || (!member.firstLoginAt && !member.lastLoginAt && member.role !== 'admin');
                  const isCurrent = member.id === currentUser?.id;
                  const isDeleting = deleteConfirmId === member.id;

                  const roleBadge = member.role === 'admin'
                    ? { label: 'Administrador', bg: 'bg-amber-500/15 text-amber-400 border-amber-500/30' }
                    : member.role === 'vendedor'
                    ? { label: 'Vendedor Comercial', bg: 'bg-sky-500/15 text-sky-400 border-sky-500/30' }
                    : { label: 'Operações & Staff', bg: 'bg-purple-500/15 text-purple-400 border-purple-500/30' };

                  return (
                    <tr 
                      key={member.id}
                      className={`transition-colors ${
                        isDark ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50'
                      }`}
                    >
                      {/* Nome + Avatar */}
                      <td className="py-3.5 px-4 font-bold">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 border ${
                            member.role === 'admin'
                              ? 'bg-amber-500 text-slate-950 border-amber-400'
                              : isDark ? 'bg-slate-800 text-white border-slate-700' : 'bg-slate-200 text-slate-800 border-slate-300'
                          }`}>
                            {(member.name || 'F')[0].toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className={`font-bold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                {member.name}
                              </span>
                              {isCurrent && (
                                <span className="px-1.5 py-0.2 rounded-md bg-amber-500/20 text-amber-400 font-bold text-[9px] uppercase">
                                  Você
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-500 font-normal">
                              Cadastrado em {new Date(member.createdAt || Date.now()).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* E-mail */}
                      <td className="py-3.5 px-4 font-mono text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3 h-3 text-slate-500" />
                          <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>{member.email}</span>
                        </div>
                      </td>

                      {/* Cargo */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold border ${roleBadge.bg}`}>
                          <ShieldCheck className="w-3 h-3" />
                          <span>{roleBadge.label}</span>
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {isLocked ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                            <UserX className="w-3 h-3" />
                            <span>Bloqueado</span>
                          </span>
                        ) : isPending ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30" title="Aguardando primeiro acesso do funcionário">
                            <Clock className="w-3 h-3 animate-pulse" />
                            <span>Pendente (1º Acesso)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            <UserCheck className="w-3 h-3" />
                            <span>Ativo</span>
                          </span>
                        )}
                      </td>

                      {/* Ações */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Redefinir Senha */}
                          <button
                            type="button"
                            onClick={() => {
                              setResetModalUser(member);
                              setResetPasswordVal('');
                            }}
                            className={`p-1.5 rounded-lg border text-xs transition cursor-pointer ${
                              isDark 
                                ? 'bg-slate-950 text-slate-400 hover:text-amber-400 border-slate-800 hover:border-amber-400/30' 
                                : 'bg-slate-100 text-slate-600 hover:text-amber-700 border-slate-200 hover:border-amber-400'
                            }`}
                            title="Redefinir senha de acesso deste funcionário"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                          </button>

                          {/* Bloquear / Desbloquear */}
                          <button
                            type="button"
                            onClick={() => handleToggleLock(member)}
                            disabled={isCurrent}
                            className={`p-1.5 rounded-lg border text-xs transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                              isLocked
                                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500 hover:text-white'
                                : 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500 hover:text-white'
                            }`}
                            title={isLocked ? "Desbloquear acesso" : "Bloquear acesso"}
                          >
                            {isLocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                          </button>

                          {/* Excluir (confirmação em 2 cliques) */}
                          {isDeleting ? (
                            <button
                              type="button"
                              onClick={() => handleDeleteUser(member.id)}
                              className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-black text-[10px] animate-pulse cursor-pointer shadow-md"
                              title="Clique novamente para confirmar a exclusão"
                            >
                              Certeza?
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmId(member.id)}
                              disabled={isCurrent}
                              className={`p-1.5 rounded-lg border text-xs transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                                isDark 
                                  ? 'bg-slate-950 text-slate-500 hover:text-rose-400 border-slate-800 hover:border-rose-500/30' 
                                  : 'bg-slate-100 text-slate-500 hover:text-rose-600 border-slate-200 hover:border-rose-300'
                              }`}
                              title="Remover funcionário"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredTeam.length === 0 && (
                  <tr>
                    <td colSpan="5" className="py-12 text-center text-slate-500">
                      Nenhum funcionário encontrado com os filtros atuais.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal de Redefinir Senha do Funcionário */}
      {resetModalUser && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`w-full max-w-sm rounded-2xl border p-5 shadow-2xl space-y-4 ${
            isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-amber-500" />
                <h3 className="font-extrabold text-sm">Redefinir Senha</h3>
              </div>
              <button 
                type="button" 
                onClick={() => setResetModalUser(null)} 
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Digite a nova senha para <strong className="text-amber-400">{resetModalUser.name}</strong> ({resetModalUser.email}):
            </p>

            <form onSubmit={handleResetPassword} className="space-y-3">
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showResetPass ? 'text' : 'password'}
                  required
                  value={resetPasswordVal}
                  onChange={(e) => setResetPasswordVal(e.target.value)}
                  placeholder="Nova senha (min. 6 dígitos)"
                  className={`w-full rounded-xl pl-9 pr-10 py-2 text-xs border focus:outline-none ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-100 border-slate-200 text-slate-900'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowResetPass(!showResetPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                >
                  {showResetPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setResetModalUser(null)}
                  className="px-3 py-1.5 rounded-xl border text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs"
                >
                  {resetLoading ? 'Salvando...' : 'Salvar Senha'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
