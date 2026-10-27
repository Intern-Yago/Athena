import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  X, 
  User, 
  Phone, 
  Mail, 
  Building2, 
  MapPin, 
  DollarSign, 
  FileText, 
  Check, 
  Trash2, 
  Search, 
  Loader2, 
  ShieldCheck, 
  AlertCircle 
} from 'lucide-react';

const RAS_DF = [
  'Ceilândia',
  'Taguatinga',
  'Samambaia',
  'Águas Claras',
  'Vicente Pires',
  'Guará',
  'SIA',
  'Brasília',
  'Gama',
  'Santa Maria',
  'Sobradinho',
  'Recanto das Emas',
  'Riacho Fundo',
  'Núcleo Bandeirante',
  'Brazlândia',
  'Planaltina',
  'Paranoá',
  'São Sebastião',
  'SCIA',
  'Arniqueira',
  'Sudoeste / Octogonal',
  'Lago Sul',
  'Lago Norte',
  'Jardim Botânico'
];

export default function LeadModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  lead = null,
  stages = [],
  funnelId = ''
}) {
  const { API_BASE_URL, getAuthHeaders } = useAuth();
  const { isDark } = useTheme();

  const [form, setForm] = useState({
    name: '',
    document: '',
    phone: '',
    email: '',
    company: '',
    address: '',
    ra_df: 'Taguatinga',
    estimated_value: '',
    priority: 'medium',
    notes: '',
    stage_id: ''
  });

  const [searchingDoc, setSearchingDoc] = useState(false);
  const [lookupSource, setLookupSource] = useState(null);
  const [lookupMessage, setLookupMessage] = useState(null);

  useEffect(() => {
    if (lead) {
      setForm({
        name: lead.name || '',
        document: lead.document || '',
        phone: lead.phone || '',
        email: lead.email || '',
        company: lead.company || '',
        address: lead.address || '',
        ra_df: lead.ra_df || 'Taguatinga',
        estimated_value: lead.estimated_value && lead.estimated_value > 0 ? String(lead.estimated_value) : '',
        priority: lead.priority || 'medium',
        notes: lead.notes || '',
        stage_id: lead.stage_id || (stages[0]?.id || '')
      });
      setLookupSource(null);
      setLookupMessage(null);
    } else {
      setForm({
        name: '',
        document: '',
        phone: '',
        email: '',
        company: '',
        address: '',
        ra_df: 'Taguatinga',
        estimated_value: '',
        priority: 'medium',
        notes: '',
        stage_id: stages[0]?.id || ''
      });
      setLookupSource(null);
      setLookupMessage(null);
    }
  }, [lead, stages, isOpen]);

  if (!isOpen) return null;

  // Consulta cadastral inteligente (Omie -> Ploomes -> Receita Federal)
  const handleLookup = async (docValue) => {
    const raw = docValue || form.document;
    const cleanDoc = String(raw || '').replace(/\D/g, '');
    if (cleanDoc.length !== 11 && cleanDoc.length !== 14) return;

    setSearchingDoc(true);
    setLookupMessage(null);

    try {
      const res = await fetch(`${API_BASE_URL}/crm/lookup?doc=${cleanDoc}`, {
        headers: getAuthHeaders()
      });
      const data = await res.json();

      if (data.success && data.found) {
        setForm(prev => ({
          ...prev,
          document: data.document || prev.document,
          company: data.company || prev.company,
          name: prev.name ? prev.name : (data.name || data.company),
          phone: data.phone || prev.phone,
          email: data.email || prev.email,
          address: data.address || prev.address,
          ra_df: data.ra_df || prev.ra_df
        }));

        setLookupSource({
          source: data.source,
          label: data.sourceLabel || (data.source === 'omie' ? 'Omie ERP' : data.source === 'ploomes' ? 'Ploomes CRM' : 'Receita Federal')
        });
      } else {
        setLookupSource(null);
        setLookupMessage(data.message || 'Nenhum registro encontrado no Omie, Ploomes ou Receita Federal.');
      }
    } catch (err) {
      console.warn('Erro ao consultar documento:', err.message);
      setLookupMessage('Falha ao consultar base cadastral externa.');
    } finally {
      setSearchingDoc(false);
    }
  };

  const handleDocumentChange = (e) => {
    const val = e.target.value;
    setForm(prev => ({ ...prev, document: val }));

    const clean = val.replace(/\D/g, '');
    if (clean.length === 11 || clean.length === 14) {
      handleLookup(val);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    onSave({
      ...form,
      funnelId,
      estimated_value: form.estimated_value ? (parseFloat(form.estimated_value) || 0) : null
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className={`w-full max-w-xl rounded-3xl p-6 shadow-2xl border transition-colors relative ${
        isDark 
          ? 'bg-slate-900 border-slate-800 text-slate-100' 
          : 'bg-white border-slate-200 text-slate-900 shadow-slate-200/50'
      }`}>
        {/* Modal Top Header */}
        <div className={`flex items-center justify-between pb-4 mb-4 border-b ${
          isDark ? 'border-slate-800' : 'border-slate-100'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-500 border border-amber-500/30 flex items-center justify-center shadow-xs">
              <User className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <h2 className={`text-sm sm:text-base font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {lead ? 'Editar Oportunidade' : 'Nova Oportunidade no Funil'}
              </h2>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Preencha os dados comerciais da oficina ou cliente
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`p-1.5 rounded-xl border transition cursor-pointer ${
              isDark 
                ? 'bg-slate-950 text-slate-400 hover:text-white border-slate-800' 
                : 'bg-slate-100 text-slate-500 hover:text-slate-800 border-slate-200'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Campo CPF / CNPJ com Busca Inteligente */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className={`text-xs font-bold flex items-center gap-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                <FileText className="w-3.5 h-3.5 text-amber-500" />
                <span>CNPJ ou CPF (Auto-preenchimento Omie / Receita)</span>
              </label>
              {searchingDoc && (
                <span className="text-[11px] text-amber-500 font-bold flex items-center gap-1 animate-pulse">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Consultando...
                </span>
              )}
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={form.document}
                  onChange={handleDocumentChange}
                  onBlur={() => handleLookup()}
                  placeholder="Digite o CNPJ ou CPF para puxar dados automaticamente..."
                  className={`w-full rounded-xl pl-3 pr-9 py-2 text-xs font-mono border focus:outline-none transition-colors ${
                    isDark 
                      ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-600 focus:border-amber-400' 
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-amber-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => handleLookup()}
                  disabled={searchingDoc}
                  title="Buscar dados deste CNPJ/CPF"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-500 cursor-pointer"
                >
                  {searchingDoc ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                </button>
              </div>

              <button
                type="button"
                onClick={() => handleLookup()}
                disabled={searchingDoc}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 border border-slate-700 cursor-pointer transition active:scale-95 shrink-0"
              >
                <span>Buscar</span>
              </button>
            </div>

            {/* Alerta de Fonte Encontrada */}
            {lookupSource && (
              <div className="mt-2 p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-400">
                <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-500" />
                <span>
                  Dados preenchidos via <strong>{lookupSource.label}</strong>
                </span>
              </div>
            )}

            {lookupMessage && !lookupSource && (
              <div className={`mt-2 p-2 rounded-xl border flex items-center gap-2 text-xs ${
                isDark 
                  ? 'bg-slate-950/60 border-slate-800 text-slate-400' 
                  : 'bg-slate-100 border-slate-200 text-slate-600'
              }`}>
                <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-500" />
                <span>{lookupMessage}</span>
              </div>
            )}
          </div>

          {/* Nome e Empresa */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Nome de Contato ou Responsável *
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ex: Seu João ou Auto Mecânica Silva"
                  className={`w-full rounded-xl pl-9 pr-3 py-2 text-xs border focus:outline-none transition-colors ${
                    isDark 
                      ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-600 focus:border-amber-400' 
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-amber-500'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Razão Social / Nome Fantasia
              </label>
              <div className="relative">
                <Building2 className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                  placeholder="Ex: Silva & Filhos Centro Automotivo"
                  className={`w-full rounded-xl pl-9 pr-3 py-2 text-xs border focus:outline-none transition-colors ${
                    isDark 
                      ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-600 focus:border-amber-400' 
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-amber-500'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Telefone e E-mail */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                WhatsApp / Telefone
              </label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="(61) 99999-9999"
                  className={`w-full rounded-xl pl-9 pr-3 py-2 text-xs border focus:outline-none font-mono transition-colors ${
                    isDark 
                      ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-600 focus:border-amber-400' 
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-amber-500'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                E-mail de Contato
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="oficina@gmail.com"
                  className={`w-full rounded-xl pl-9 pr-3 py-2 text-xs border focus:outline-none transition-colors ${
                    isDark 
                      ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-600 focus:border-amber-400' 
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-amber-500'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Endereço e Região Administrativa */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Endereço Completo
              </label>
              <div className="relative">
                <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="Ex: QNA 12 Lote 3 - Taguatinga Norte"
                  className={`w-full rounded-xl pl-9 pr-3 py-2 text-xs border focus:outline-none transition-colors ${
                    isDark 
                      ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-600 focus:border-amber-400' 
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-amber-500'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Região (DF)
              </label>
              <select
                value={form.ra_df}
                onChange={(e) => setForm({ ...form, ra_df: e.target.value })}
                className={`w-full rounded-xl px-3 py-2 text-xs border focus:outline-none cursor-pointer transition-colors ${
                  isDark 
                    ? 'bg-slate-950 border-slate-800 text-white focus:border-amber-400' 
                    : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-amber-500'
                }`}
              >
                <option value="">Não especificado</option>
                {RAS_DF.map(ra => (
                  <option key={ra} value={ra}>{ra}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Valor Previsto (Opcional), Etapa e Prioridade */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Valor Previsto (Opcional)
              </label>
              <div className="relative">
                <DollarSign className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  step="any"
                  value={form.estimated_value}
                  onChange={(e) => setForm({ ...form, estimated_value: e.target.value })}
                  placeholder="0,00 (opcional)"
                  className={`w-full rounded-xl pl-9 pr-3 py-2 text-xs border focus:outline-none font-mono transition-colors ${
                    isDark 
                      ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-600 focus:border-amber-400' 
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-amber-500'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Etapa do Funil (Coluna)
              </label>
              <select
                value={form.stage_id}
                onChange={(e) => setForm({ ...form, stage_id: e.target.value })}
                className={`w-full rounded-xl px-3 py-2 text-xs border focus:outline-none cursor-pointer transition-colors ${
                  isDark 
                    ? 'bg-slate-950 border-slate-800 text-white focus:border-amber-400' 
                    : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-amber-500'
                }`}
              >
                {stages.map(stg => (
                  <option key={stg.id} value={stg.id}>{stg.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Prioridade
              </label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className={`w-full rounded-xl px-3 py-2 text-xs border focus:outline-none cursor-pointer transition-colors ${
                  isDark 
                    ? 'bg-slate-950 border-slate-800 text-white focus:border-amber-400' 
                    : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-amber-500'
                }`}
              >
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta (Quente)</option>
              </select>
            </div>
          </div>

          {/* Anotações da Negociação */}
          <div>
            <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Anotações da Negociação / Observações
            </label>
            <textarea
              rows={2}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Ex: Interessado em scanner automotivo, entrar em contato na terça..."
              className={`w-full rounded-xl p-3 text-xs border focus:outline-none resize-none transition-colors ${
                isDark 
                  ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-600 focus:border-amber-400' 
                  : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-amber-500'
              }`}
            />
          </div>

          {/* Rodapé e Ações */}
          <div className={`flex items-center justify-between pt-4 border-t gap-3 ${
            isDark ? 'border-slate-800' : 'border-slate-100'
          }`}>
            {lead && onDelete ? (
              <button
                type="button"
                onClick={() => onDelete(lead.id)}
                className="px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Excluir</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className={`px-4 py-2 rounded-xl font-bold text-xs transition cursor-pointer ${
                  isDark 
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' 
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition cursor-pointer active:scale-95"
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>Salvar Lead</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
