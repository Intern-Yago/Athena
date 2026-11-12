import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { crmApiFetch } from '../utils/api';
import {
  X,
  UserCheck,
  UserX,
  ShieldAlert,
  Handshake,
  Store,
  HelpCircle,
  Megaphone,
  Check,
  AlertTriangle,
  Loader2
} from 'lucide-react';

const REASONS = [
  {
    id: 'distribuidor',
    label: 'Distribuidor / Parceiro Comercial',
    description: 'Perfil de distribuidor ou parceiro (ex: Altierry). Não é cliente de ponta para ofertas diárias de oficina, mas pode participar de campanhas especiais e rifas.',
    icon: Handshake,
    defaultMarketing: true,
    color: 'sky'
  },
  {
    id: 'bloqueado',
    label: 'Cliente Bloqueado / Mau Caráter / Não Atender',
    description: 'Histórico de inadimplência grave, atrito comercial severo ou desrespeito. A equipe não deve abrir propostas nem atender.',
    icon: ShieldAlert,
    defaultMarketing: false,
    color: 'rose'
  },
  {
    id: 'fechou_oficina',
    label: 'Encerrou Atividades / Fechou Oficina',
    description: 'Oficina fechou as portas ou o profissional encerrou a atuação no ramo automotivo.',
    icon: Store,
    defaultMarketing: false,
    color: 'amber'
  },
  {
    id: 'outro',
    label: 'Outro Motivo',
    description: 'Motivo específico a ser detalhado nas observações internas.',
    icon: HelpCircle,
    defaultMarketing: false,
    color: 'slate'
  }
];

export default function CustomerInactivityModal({ customer, isOpen, onClose, onSuccess }) {
  const { isDark } = useTheme();
  const { user } = useAuth();

  const [isInactive, setIsInactive] = useState(Boolean(customer?.is_inactive));
  const [reason, setReason] = useState(customer?.inactivity_reason || 'distribuidor');
  const [notes, setNotes] = useState(customer?.inactivity_notes || '');
  const [allowMarketing, setAllowMarketing] = useState(
    customer?.allow_marketing_campaigns !== undefined 
      ? Boolean(customer.allow_marketing_campaigns) 
      : true
  );
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Sincroniza estado quando o modal abre ou o cliente muda
  useEffect(() => {
    if (customer && isOpen) {
      const activeInactive = Boolean(customer.is_inactive);
      setIsInactive(activeInactive);
      const curReason = customer.inactivity_reason || 'distribuidor';
      setReason(curReason);
      setNotes(customer.inactivity_notes || '');
      setAllowMarketing(
        customer.allow_marketing_campaigns !== undefined
          ? Boolean(customer.allow_marketing_campaigns)
          : (curReason === 'distribuidor')
      );
      setErrorMsg('');
    }
  }, [customer, isOpen]);

  if (!isOpen || !customer) return null;

  const handleSelectReason = (newReason) => {
    setReason(newReason);
    const meta = REASONS.find(r => r.id === newReason);
    if (meta) {
      setAllowMarketing(meta.defaultMarketing);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setErrorMsg('');
    try {
      const userName = user?.name || user?.email || 'Equipe Comercial';
      const payload = {
        is_inactive: Boolean(isInactive),
        inactivity_reason: isInactive ? reason : null,
        inactivity_notes: isInactive ? notes.trim() : null,
        allow_marketing_campaigns: isInactive ? Boolean(allowMarketing) : false,
        user_name: userName
      };

      const res = await crmApiFetch(`/crm/customers/${customer.id}/inactivity`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Erro HTTP ${res.status}`);
      }

      const data = await res.json();
      if (onSuccess) {
        onSuccess(data.data);
      }
      onClose();
    } catch (err) {
      console.error('[CustomerInactivityModal] Erro ao salvar status de inativação:', err);
      setErrorMsg(err.message || 'Falha ao salvar status do cliente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className={`w-full max-w-xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${
          isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div className={`px-5 py-4 border-b flex items-center justify-between shrink-0 ${
          isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
              isInactive
                ? (reason === 'bloqueado' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30' : 'bg-sky-500/10 text-sky-400 border border-sky-500/30')
                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
            }`}>
              {isInactive ? <UserX className="w-5 h-5" /> : <UserCheck className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="font-black text-base sm:text-lg tracking-tight">
                Gestão de Status do Cliente
              </h2>
              <p className="text-xs text-slate-400 line-clamp-1">
                {customer.fantasy_name || customer.name} {customer.cnpj ? `• CNPJ: ${customer.cnpj}` : customer.cpf ? `• CPF: ${customer.cpf}` : ''}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`p-2 rounded-xl border transition cursor-pointer ${
              isDark ? 'border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800' : 'border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body com Scroll */}
        <div className="p-5 overflow-y-auto space-y-5">
          {errorMsg && (
            <div className="p-3.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-400 text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Seletor de Estado: Ativo vs Inativo */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Status Comercial
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setIsInactive(false)}
                className={`p-3.5 rounded-xl border flex items-center gap-3 transition cursor-pointer text-left ${
                  !isInactive
                    ? (isDark ? 'bg-emerald-500/15 border-emerald-500/60 text-emerald-400 shadow-sm' : 'bg-emerald-50 border-emerald-400 text-emerald-800 shadow-sm')
                    : (isDark ? 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700' : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300')
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  !isInactive ? 'bg-emerald-500 text-slate-950 font-black' : 'bg-slate-800 text-slate-400'
                }`}>
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs">Cliente Ativo</div>
                  <div className="text-[11px] opacity-75">Atendimento e vendas normais</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setIsInactive(true)}
                className={`p-3.5 rounded-xl border flex items-center gap-3 transition cursor-pointer text-left ${
                  isInactive
                    ? (isDark ? 'bg-amber-500/15 border-amber-500/60 text-amber-400 shadow-sm' : 'bg-amber-50 border-amber-400 text-amber-900 shadow-sm')
                    : (isDark ? 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700' : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300')
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  isInactive ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-800 text-slate-400'
                }`}>
                  <UserX className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs">Cliente Inativo</div>
                  <div className="text-[11px] opacity-75">Restrito, distribuidor ou bloqueado</div>
                </div>
              </button>
            </div>
          </div>

          {/* Opções exibidas somente quando Inativo */}
          {isInactive && (
            <div className="space-y-4 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Motivo da Inativação
                </label>
                <div className="space-y-2">
                  {REASONS.map((r) => {
                    const Icon = r.icon;
                    const isSelected = reason === r.id;
                    return (
                      <div
                        key={r.id}
                        onClick={() => handleSelectReason(r.id)}
                        className={`p-3 rounded-xl border transition cursor-pointer flex items-start gap-3 ${
                          isSelected
                            ? (isDark ? 'bg-slate-800 border-amber-500/70 shadow-sm' : 'bg-amber-50/60 border-amber-400 shadow-sm')
                            : (isDark ? 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700' : 'bg-slate-50/70 border-slate-200 hover:border-slate-300')
                        }`}
                      >
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                          isSelected
                            ? (r.color === 'rose' ? 'bg-rose-500/20 text-rose-400' : r.color === 'sky' ? 'bg-sky-500/20 text-sky-400' : 'bg-amber-500/20 text-amber-400')
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className={`text-xs font-bold ${
                              isSelected ? (isDark ? 'text-white' : 'text-slate-900') : 'text-slate-300'
                            }`}>
                              {r.label}
                            </span>
                            {isSelected && (
                              <div className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                                <Check className="w-2.5 h-2.5" />
                              </div>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                            {r.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Toggle de Campanhas de Marketing */}
              <div className={`p-4 rounded-xl border ${
                allowMarketing
                  ? (isDark ? 'bg-sky-500/10 border-sky-500/30' : 'bg-sky-50 border-sky-200')
                  : (isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-100 border-slate-200')
              }`}>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      allowMarketing ? 'bg-sky-500/20 text-sky-400' : 'bg-slate-800 text-slate-400'
                    }`}>
                      <Megaphone className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold">
                        Permitir inclusão em Campanhas de Marketing
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                        Permite que este contato receba comunicados gerais, disparos da Grande Rifa do Elevador e convites de eventos institucionais da Athena.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setAllowMarketing(!allowMarketing)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                      allowMarketing ? 'bg-sky-500' : (isDark ? 'bg-slate-800' : 'bg-slate-300')
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        allowMarketing ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {reason === 'bloqueado' && allowMarketing && (
                  <div className="mt-2.5 p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[11px] flex items-center gap-1.5 font-semibold">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>Atenção: clientes bloqueados normalmente não devem receber campanhas nem rifas.</span>
                  </div>
                )}
              </div>

              {/* Observações / Justificativa Interna */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Observações e Justificativa Interna
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Ex: Altierry é nosso distribuidor na Bahia. Não vender na rotina normal de oficina, mas manter elegível para a campanha da rifa do elevador."
                  className={`w-full px-3.5 py-2.5 text-xs rounded-xl border transition outline-none resize-none ${
                    isDark 
                      ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus:border-amber-500' 
                      : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-amber-500'
                  }`}
                />
              </div>

              {/* Metadados de Inativação anterior */}
              {customer.inactivated_at && (
                <div className="text-[11px] text-slate-400 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/80">
                  Inativado originalmente em {new Date(customer.inactivated_at).toLocaleDateString('pt-BR')} às {new Date(customer.inactivated_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  {customer.inactivated_by ? ` por ${customer.inactivated_by}` : ''}.
                </div>
              )}
            </div>
          )}

          {!isInactive && customer.is_inactive && (
            <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs leading-relaxed">
              Ao salvar como <strong>Ativo</strong>, o cliente voltará a aparecer normalmente na lista principal de atendimento comercial e qualquer bloqueio anterior será cancelado.
            </div>
          )}
        </div>

        {/* Footer com Ações */}
        <div className={`px-5 py-3.5 border-t flex items-center justify-between gap-3 shrink-0 ${
          isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
              isDark ? 'border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800' : 'border-slate-300 text-slate-600 hover:bg-slate-100'
            }`}
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className={`px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer shadow-sm ${
              !isInactive
                ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black'
                : (reason === 'bloqueado' ? 'bg-rose-500 hover:bg-rose-400 text-white font-black' : 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-black')
            }`}
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Salvando...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>{!isInactive ? 'Reativar Cliente' : 'Confirmar Inativação'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
