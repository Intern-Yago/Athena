import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  X, 
  ExternalLink, 
  Phone, 
  Coins, 
  KeyRound, 
  Check, 
  Eye,
  Lock,
  ShieldCheck
} from 'lucide-react';

export default function ClientsManagementTab({
  clientsList = [],
  setSelectedCustomerForModal
}) {
  const [clientSearch, setClientSearch] = useState('');

  const filteredClients = clientsList.filter(c => {
    if (!clientSearch) return true;
    const term = clientSearch.toLowerCase();
    const nameMatch = (c.name || '').toLowerCase().includes(term);
    const emailMatch = (c.email || '').toLowerCase().includes(term);
    const phoneMatch = (c.phone || '').replace(/\D/g, '').includes(term.replace(/\D/g, ''));
    const docMatch = (c.document || '').replace(/\D/g, '').includes(term.replace(/\D/g, ''));
    return nameMatch || emailMatch || phoneMatch || docMatch;
  });

  return (
    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700 shadow-2xs">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">
                Clientes do Site & Recuperação de Acesso
              </h3>
              <p className="text-xs text-slate-500">
                Consulte clientes cadastrados no portal, saldo de fidelidade A-Points e preste suporte imediato de recuperação de senha.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3.5 py-2 rounded-xl border border-slate-200">
            Total de Clientes: <strong className="text-purple-700">{clientsList.length}</strong>
          </span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={clientSearch}
            onChange={(e) => setClientSearch(e.target.value)}
            placeholder="Buscar por nome, e-mail, telefone ou CPF/CNPJ..."
            className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white transition-colors"
          />
          {clientSearch && (
            <button
              type="button"
              onClick={() => setClientSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="text-[11px] font-medium text-slate-400">
          Mostrando <strong className="text-slate-700">{filteredClients.length}</strong> de {clientsList.length} clientes
        </div>
      </div>

      {/* Customers Table */}
      <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-100 uppercase text-[10px] text-slate-600 border-b border-slate-200 font-black tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Cliente / Cadastro</th>
                <th className="py-3.5 px-4">Contato & Documento</th>
                <th className="py-3.5 px-4 text-center">Saldo A-Points</th>
                <th className="py-3.5 px-4 text-center">Status de Acesso</th>
                <th className="py-3.5 px-4 text-right">Suporte ao Cliente</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-400 text-xs">
                    {clientSearch ? 'Nenhum cliente encontrado para os termos pesquisados.' : 'Nenhum cliente cadastrado no portal Athena até o momento.'}
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => {
                  const isTemp = Boolean(client.mustChangePassword);
                  const isLocked = Boolean(client.isLocked || client.is_locked);
                  const isCooldown = Boolean(client.lockedUntil && new Date(client.lockedUntil) > new Date());

                  return (
                    <tr key={client.id} className={`hover:bg-slate-50/80 transition-colors ${isLocked ? 'bg-rose-50/30' : isCooldown ? 'bg-amber-50/20' : ''}`}>
                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={() => setSelectedCustomerForModal(client)}
                          className="font-bold text-slate-900 hover:text-amber-600 transition-colors text-sm flex items-center gap-1.5 group cursor-pointer text-left"
                          title="Abrir perfil detalhado, compras e pontos"
                        >
                          <span>{client.name}</span>
                          <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-amber-500 shrink-0" />
                        </button>
                        <div className="text-[10px] text-slate-400">
                          {client.createdAt ? `Desde ${new Date(client.createdAt).toLocaleDateString('pt-BR')}` : 'Cadastro direto'}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-mono text-slate-700 font-medium select-all">{client.email}</div>
                        <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-slate-500">
                          {client.phone ? (
                            <a
                              href={`https://wa.me/55${client.phone.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 hover:bg-emerald-100 transition-colors"
                              title="Conversar no WhatsApp"
                            >
                              <Phone className="w-3 h-3 text-emerald-600 shrink-0" />
                              <span>{client.phone}</span>
                            </a>
                          ) : (
                            <span className="text-slate-400 text-[10px]">Sem telefone</span>
                          )}
                          {client.document && (
                            <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 font-mono text-[10px] border border-slate-200">
                              {client.document}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => setSelectedCustomerForModal(client)}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs cursor-pointer transition-colors"
                          title="Ver extrato completo de pontos"
                        >
                          <Coins className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>{Number(client.aPoints || 0)} pts</span>
                        </button>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        {isLocked ? (
                          <button
                            type="button"
                            onClick={() => setSelectedCustomerForModal(client)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-100 hover:bg-rose-200 text-rose-800 border border-rose-300 animate-pulse cursor-pointer transition-colors"
                            title="Conta com bloqueio definitivo após 8+ falhas. Clique para gerenciar ou desbloquear."
                          >
                            <Lock className="w-3 h-3 text-rose-700" />
                            <span>Bloqueado (Admin)</span>
                          </button>
                        ) : isCooldown ? (
                          <button
                            type="button"
                            onClick={() => setSelectedCustomerForModal(client)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 animate-pulse cursor-pointer transition-colors"
                            title="Conta em pausa de segurança de 24 horas (7 falhas). Clique para gerar link emergencial de acesso."
                          >
                            <Lock className="w-3 h-3 text-amber-700" />
                            <span>Pausa 24h ({client.failedAttempts || 7} falhas)</span>
                          </button>
                        ) : isTemp ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 animate-pulse" title="Cliente acessando com senha temporária. O sistema obrigará a troca de senha no próximo login.">
                            <KeyRound className="w-3 h-3 text-amber-700" />
                            <span>Senha Provisória Ativa</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span>Acesso Normal</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedCustomerForModal(client)}
                          className="inline-flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 hover:text-amber-300 font-bold text-xs shadow-xs cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
                          title="Ver perfil completo, histórico de compras, extrato de pontos e suporte"
                        >
                          <Eye className="w-3.5 h-3.5 text-amber-400" />
                          <span>Ver Histórico</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
