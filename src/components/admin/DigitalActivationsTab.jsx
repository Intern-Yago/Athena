import React, { useState, useEffect, useMemo } from 'react';
import { 
  Zap, 
  ShieldCheck, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw, 
  Phone, 
  MessageCircle, 
  Monitor, 
  Key, 
  X, 
  User, 
  Search,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';

export default function DigitalActivationsTab({ API_BASE_URL, currentUser, showNotification }) {
  const [activations, setActivations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [attemptModalActivation, setAttemptModalActivation] = useState(null);
  const [attemptForm, setAttemptForm] = useState({
    method: 'whatsapp',
    result: 'contacted',
    notes: ''
  });

  const [sessionModalActivation, setSessionModalActivation] = useState(null);
  const [sessionForm, setSessionForm] = useState({
    remoteTool: 'anydesk',
    sessionCode: ''
  });

  const [completeModalActivation, setCompleteModalActivation] = useState(null);
  const [completeForm, setCompleteForm] = useState({
    licenseKey: '',
    machineId: '',
    notes: ''
  });

  const [copiedKey, setCopiedKey] = useState(false);

  const fetchActivations = async () => {
    if (!currentUser?.token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/fulfillment/kanban`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setActivations(data.digital_activations || []);
      } else {
        showNotification?.('Erro ao carregar fila de ativações.', 'error');
      }
    } catch (e) {
      console.error('Erro ao buscar ativações:', e);
      showNotification?.('Falha ao conectar com o servidor.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivations();
  }, [currentUser?.token]);

  const filteredActivations = useMemo(() => {
    return activations.filter(da => {
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      const num = String(da.order_number || da.order_id || '').toLowerCase();
      const name = String(da.customer_snapshot?.name || '').toLowerCase();
      const soft = String(da.software_name || '').toLowerCase();
      return num.includes(term) || name.includes(term) || soft.includes(term);
    });
  }, [activations, searchTerm]);

  // Ação: Registrar Tentativa de Contato
  const handleConfirmAttempt = async () => {
    if (!attemptModalActivation) return;
    setActionLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/activations/activations/attempt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.token}`
        },
        body: JSON.stringify({
          activationId: attemptModalActivation.id,
          method: attemptForm.method,
          result: attemptForm.result,
          notes: attemptForm.notes
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao registrar contato.');
      showNotification?.('Tentativa de contato registrada com sucesso!', 'success');
      setAttemptModalActivation(null);
      fetchActivations();
    } catch (e) {
      showNotification?.(e.message || 'Erro na tentativa de contato.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Ação: Iniciar Sessão Remota
  const handleConfirmSession = async () => {
    if (!sessionModalActivation) return;
    setActionLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/activations/activations/start-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.token}`
        },
        body: JSON.stringify({
          activationId: sessionModalActivation.id,
          remoteTool: sessionForm.remoteTool,
          sessionCode: sessionForm.sessionCode
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao registrar sessão remota.');
      showNotification?.('Sessão remota iniciada com sucesso!', 'success');
      setSessionModalActivation(null);
      fetchActivations();
    } catch (e) {
      showNotification?.(e.message || 'Erro ao iniciar sessão.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Ação: Concluir Ativação com Chave
  const handleConfirmComplete = async () => {
    if (!completeModalActivation) return;
    setActionLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/activations/activations/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.token}`
        },
        body: JSON.stringify({
          activationId: completeModalActivation.id,
          licenseKey: completeForm.licenseKey.trim(),
          machineId: completeForm.machineId.trim(),
          notes: completeForm.notes.trim()
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao concluir ativação.');
      showNotification?.('Ativação digital concluída com sucesso! Licença liberada para o cliente.', 'success');
      setCompleteModalActivation(null);
      fetchActivations();
    } catch (e) {
      showNotification?.(e.message || 'Erro na ativação.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const isSlaBreached = (createdAt) => {
    if (!createdAt) return false;
    const diff = Date.now() - new Date(createdAt).getTime();
    return diff > 24 * 60 * 60 * 1000; // 24h
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            <span>Fila de Ativações Digitais & Suporte Técnico</span>
          </h2>
          <p className="text-xs text-slate-500">
            Gerenciamento de softwares (Launch, Autel), sessões remotas e liberação de chaves de licença com monitoramento de SLA.
          </p>
        </div>
        <button
          onClick={fetchActivations}
          disabled={loading}
          className="btn-secondary text-xs flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Atualizar Fila</span>
        </button>
      </div>

      {/* SEARCH BAR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Buscar por software, cliente ou pedido..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input text-xs !pl-9 w-full"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
        <span className="text-xs text-slate-500 font-bold hidden sm:inline">
          {filteredActivations.length} ativação(ões) na fila
        </span>
      </div>

      {/* ACTIVATIONS LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full p-12 text-center text-slate-400 text-xs font-bold space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-amber-500" />
            <p>Carregando ativações...</p>
          </div>
        ) : filteredActivations.length === 0 ? (
          <div className="col-span-full p-12 text-center text-slate-400 text-xs space-y-2 bg-white rounded-2xl border border-slate-200">
            <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500" />
            <p className="font-bold text-slate-600">Nenhuma ativação pendente no momento</p>
            <p className="text-[11px]">Todas as licenças e softwares comprados estão ativados.</p>
          </div>
        ) : (
          filteredActivations.map(da => {
            const isCompleted = da.status === 'activated';
            const breached = !isCompleted && isSlaBreached(da.created_at);

            return (
              <div 
                key={da.id}
                className={`bg-white rounded-2xl border p-4 shadow-xs space-y-3.5 transition-all flex flex-col justify-between ${
                  breached ? 'border-rose-400 bg-rose-50/10' : 'border-slate-200 hover:border-amber-400'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-black text-xs text-slate-900">
                      #{da.order_number || da.order_id.slice(0, 8)}
                    </span>
                    {breached ? (
                      <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase bg-rose-100 text-rose-800 border border-rose-200 px-2 py-0.5 rounded-full animate-pulse">
                        <AlertCircle className="w-2.5 h-2.5" />
                        <span>SLA Violado (&gt;24h)</span>
                      </span>
                    ) : (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isCompleted ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {isCompleted ? 'Ativado' : 'Aguardando Suporte'}
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="font-black text-slate-900 text-sm">{da.software_name || 'Software Athena'}</h4>
                    <p className="text-xs text-slate-500">
                      Cliente: <strong>{da.customer_snapshot?.name || 'Cliente'}</strong>
                    </p>
                    {da.customer_snapshot?.phone && (
                      <p className="text-[11px] text-slate-400">
                        Telefone/WhatsApp: {da.customer_snapshot.phone}
                      </p>
                    )}
                  </div>

                  {da.license_key && (
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-200 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Chave de Licença:</span>
                      <p className="font-mono font-bold text-xs text-slate-900 truncate">{da.license_key}</p>
                    </div>
                  )}
                </div>

                {/* ACTION BUTTONS */}
                <div className="pt-3 border-t border-slate-100 space-y-1.5">
                  {!isCompleted ? (
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setAttemptModalActivation(da);
                          setAttemptForm({ method: 'whatsapp', result: 'contacted', notes: '' });
                        }}
                        className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 font-bold text-[10px] text-slate-700 flex items-center justify-center gap-1 cursor-pointer transition-colors"
                      >
                        <Phone className="w-3 h-3 text-slate-500" />
                        <span>Registrar Contato</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSessionModalActivation(da);
                          setSessionForm({ remoteTool: 'anydesk', sessionCode: '' });
                        }}
                        className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 font-bold text-[10px] text-slate-700 flex items-center justify-center gap-1 cursor-pointer transition-colors"
                      >
                        <Monitor className="w-3 h-3 text-slate-500" />
                        <span>Sessão Remota</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setCompleteModalActivation(da);
                          setCompleteForm({ licenseKey: '', machineId: '', notes: '' });
                        }}
                        className="col-span-2 btn-gold text-xs font-bold py-2 px-3 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Key className="w-3.5 h-3.5" />
                        <span>Concluir e Liberar Chave</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-emerald-700 py-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Licença Ativada e Entregue</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL: REGISTRAR CONTATO */}
      {attemptModalActivation && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overscroll-none animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-500" />
                <span>Registrar Tentativa de Contato</span>
              </h3>
              <button onClick={() => setAttemptModalActivation(null)} className="cursor-pointer text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Meio de Contato</label>
                <select
                  value={attemptForm.method}
                  onChange={(e) => setAttemptForm({ ...attemptForm, method: e.target.value })}
                  className="form-select text-xs w-full"
                >
                  <option value="whatsapp">WhatsApp</option>
                  <option value="phone">Ligação Telefônica</option>
                  <option value="email">E-mail</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Resultado do Contato</label>
                <select
                  value={attemptForm.result}
                  onChange={(e) => setAttemptForm({ ...attemptForm, result: e.target.value })}
                  className="form-select text-xs w-full"
                >
                  <option value="contacted">Cliente Atendeu / Em conversa</option>
                  <option value="no_answer">Sem Resposta / Caixa Postal</option>
                  <option value="scheduled">Agendado para outro horário</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Observações</label>
                <textarea
                  rows={2}
                  placeholder="Ex: Cliente solicitou ativação às 18h após fechar a oficina..."
                  value={attemptForm.notes}
                  onChange={(e) => setAttemptForm({ ...attemptForm, notes: e.target.value })}
                  className="form-input text-xs w-full"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button onClick={() => setAttemptModalActivation(null)} className="btn-secondary text-xs cursor-pointer">
                Cancelar
              </button>
              <button onClick={handleConfirmAttempt} disabled={actionLoading} className="btn-gold text-xs font-bold py-1.5 px-4 cursor-pointer">
                Salvar Histórico
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: SESSÃO REMOTA */}
      {sessionModalActivation && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overscroll-none animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <Monitor className="w-4 h-4 text-blue-500" />
                <span>Iniciar Sessão de Suporte Remoto</span>
              </h3>
              <button onClick={() => setSessionModalActivation(null)} className="cursor-pointer text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Software de Acesso Remoto</label>
                <select
                  value={sessionForm.remoteTool}
                  onChange={(e) => setSessionForm({ ...sessionForm, remoteTool: e.target.value })}
                  className="form-select text-xs w-full"
                >
                  <option value="anydesk">AnyDesk</option>
                  <option value="teamviewer">TeamViewer</option>
                  <option value="rustdesk">RustDesk</option>
                  <option value="whatsapp">Orientação via Vídeo WhatsApp</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Código de Acesso / ID do Cliente</label>
                <input
                  type="text"
                  placeholder="Ex: 998 123 456"
                  value={sessionForm.sessionCode}
                  onChange={(e) => setSessionForm({ ...sessionForm, sessionCode: e.target.value })}
                  className="form-input text-xs w-full font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button onClick={() => setSessionModalActivation(null)} className="btn-secondary text-xs cursor-pointer">
                Cancelar
              </button>
              <button onClick={handleConfirmSession} disabled={actionLoading} className="btn-gold text-xs font-bold py-1.5 px-4 cursor-pointer">
                Registrar Início da Sessão
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CONCLUIR ATIVAÇÃO */}
      {completeModalActivation && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overscroll-none animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <Key className="w-4 h-4 text-emerald-500" />
                <span>Concluir e Liberar Chave de Licença</span>
              </h3>
              <button onClick={() => setCompleteModalActivation(null)} className="cursor-pointer text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Chave de Ativação / Serial Number *
                </label>
                <input
                  type="text"
                  placeholder="Ex: LAUNCH-2026-KEY-9988-XYZ"
                  value={completeForm.licenseKey}
                  onChange={(e) => setCompleteForm({ ...completeForm, licenseKey: e.target.value })}
                  className="form-input text-xs w-full font-mono font-bold"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  ID do Equipamento / Machine ID (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ex: SN-9876543210"
                  value={completeForm.machineId}
                  onChange={(e) => setCompleteForm({ ...completeForm, machineId: e.target.value })}
                  className="form-input text-xs w-full font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Observações Técnicas de Instalação
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Pacote de montadoras América do Sul e Europa ativado com sucesso..."
                  value={completeForm.notes}
                  onChange={(e) => setCompleteForm({ ...completeForm, notes: e.target.value })}
                  className="form-input text-xs w-full"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button onClick={() => setCompleteModalActivation(null)} className="btn-secondary text-xs cursor-pointer">
                Cancelar
              </button>
              <button 
                onClick={handleConfirmComplete} 
                disabled={actionLoading || !completeForm.licenseKey.trim()} 
                className="btn-gold text-xs font-bold py-1.5 px-4 cursor-pointer"
              >
                Concluir e Notificar Cliente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
