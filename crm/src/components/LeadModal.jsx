import React, { useState, useEffect, useMemo } from 'react';
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
  AlertCircle,
  Users,
  ArrowRight,
  ExternalLink,
  MessageSquare,
  Plus,
  ShieldAlert,
  Handshake,
  Store,
  UserX
} from 'lucide-react';

/**
 * Converte a string de observações em cards estruturados com data, hora e autor
 */
export function parseNotesToCards(notesStr) {
  if (!notesStr || !notesStr.trim()) return [];
  const rawBlocks = notesStr.split(/\n\s*---\s*\n/);
  return rawBlocks.map((block, idx) => {
    const trimmed = block.trim();
    const match = trimmed.match(/^\[(.*?)\]\s*([\s\S]*)$/);
    if (match) {
      const header = match[1];
      const content = match[2].trim();
      const parts = header.split(' - ');
      const timestamp = parts[0] || '';
      const author = parts[1] || '';
      return { id: `note-${idx}`, timestamp, author, content };
    }
    return { id: `note-${idx}`, timestamp: '', author: '', content: trimmed };
  }).filter((n) => n.content.length > 0);
}

/**
 * Converte o array de cards de observação de volta para string cumulativa com delimitadores
 */
export function serializeCardsToNotes(cards) {
  return cards.map((c) => {
    if (c.timestamp) {
      const header = c.author ? `[${c.timestamp} - ${c.author}]` : `[${c.timestamp}]`;
      return `${header}\n${c.content}`;
    }
    return c.content;
  }).join('\n\n---\n\n');
}

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
    phone2: '',
    email: '',
    company: '',
    address: '',
    ra_df: 'Taguatinga',
    estimated_value: '',
    negotiated_price: '',
    priority: 'medium',
    notes: '',
    stage_id: '',
    customer_id: null,
    equipment_id: null
  });

  const [searchingDoc, setSearchingDoc] = useState(false);
  const [lookupSource, setLookupSource] = useState(null);
  const [lookupMessage, setLookupMessage] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Estados da Lupa / Modal de Busca com Infinite Scroll
  const [showCustomerSearchModal, setShowCustomerSearchModal] = useState(false);
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [customerSearchResults, setCustomerSearchResults] = useState([]);
  const [customerSearchPage, setCustomerSearchPage] = useState(1);
  const [loadingCustomerSearch, setLoadingCustomerSearch] = useState(false);
  const [hasMoreCustomers, setHasMoreCustomers] = useState(true);

  // Sugestão em tempo real ao digitar (In-line Auto-lookup)
  const [matchedCustomerSuggestion, setMatchedCustomerSuggestion] = useState(null);
  const [updateCustomerOptIn, setUpdateCustomerOptIn] = useState(false);
  const [linkedCustomerInfo, setLinkedCustomerInfo] = useState(null);

  const { user } = useAuth();
  const [newNoteInput, setNewNoteInput] = useState('');
  const noteCards = useMemo(() => parseNotesToCards(form.notes), [form.notes]);

  const handleAddNewNote = () => {
    if (!newNoteInput.trim()) return;
    const now = new Date();
    const timestamp =
      now.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
      ' ' +
      now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const author = user?.name || user?.email?.split('@')[0] || 'Equipe';
    const newCard = {
      id: `note-${Date.now()}`,
      timestamp,
      author,
      content: newNoteInput.trim()
    };
    const updatedCards = [newCard, ...noteCards];
    setForm((prev) => ({
      ...prev,
      notes: serializeCardsToNotes(updatedCards)
    }));
    setNewNoteInput('');
  };

  useEffect(() => {
    setConfirmDelete(false);
    setMatchedCustomerSuggestion(null);
    setUpdateCustomerOptIn(false);
    setNewNoteInput('');
    if (lead) {
      setForm({
        name: lead.name || '',
        document: lead.document || '',
        phone: lead.phone || '',
        phone2: lead.phone2 || '',
        email: lead.email || '',
        company: lead.company || '',
        address: lead.address || '',
        ra_df: lead.ra_df || 'Taguatinga',
        estimated_value: lead.estimated_value && lead.estimated_value > 0 ? String(lead.estimated_value) : '',
        negotiated_price: lead.negotiated_price && lead.negotiated_price > 0 ? String(lead.negotiated_price) : '',
        priority: lead.priority || 'medium',
        notes: lead.notes || '',
        stage_id: lead.stage_id || (stages[0]?.id || ''),
        customer_id: lead.customer_id || null,
        equipment_id: lead.equipment_id || null
      });
      setLookupSource(lead.customer_id ? { source: 'base_central', label: 'Cliente Vinculado à Base' } : null);
      setLookupMessage(null);
    } else {
      setForm({
        name: '',
        document: '',
        phone: '',
        phone2: '',
        email: '',
        company: '',
        address: '',
        ra_df: 'Taguatinga',
        estimated_value: '',
        negotiated_price: '',
        priority: 'medium',
        notes: '',
        stage_id: stages[0]?.id || '',
        customer_id: null,
        equipment_id: null
      });
      setLinkedCustomerInfo(null);
      setLookupSource(null);
      setLookupMessage(null);
    }
  }, [lead, stages, isOpen]);

  // Consulta status de inativação do cliente vinculado
  useEffect(() => {
    if (form.customer_id) {
      fetch(`${API_BASE_URL}/crm/customers/${form.customer_id}`, { headers: getAuthHeaders() })
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data && data.data) {
            setLinkedCustomerInfo(data.data);
          }
        })
        .catch(() => {});
    } else {
      setLinkedCustomerInfo(null);
    }
  }, [form.customer_id]);

  // Carregamento de clientes para a Lupa (com paginação / infinite scroll)
  const loadCustomersSearch = async (query = '', page = 1, append = false) => {
    setLoadingCustomerSearch(true);
    try {
      const res = await fetch(`${API_BASE_URL}/crm/customers?search=${encodeURIComponent(query)}&page=${page}&limit=20`, {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (data.success && data.data) {
        const list = data.data.customers || [];
        setCustomerSearchResults(prev => append ? [...prev, ...list] : list);
        setHasMoreCustomers(page < (data.data.totalPages || 1));
        setCustomerSearchPage(page);
      }
    } catch (e) {
      console.warn('Erro ao carregar clientes na lupa:', e);
    } finally {
      setLoadingCustomerSearch(false);
    }
  };

  useEffect(() => {
    if (showCustomerSearchModal) {
      const timer = setTimeout(() => {
        loadCustomersSearch(customerSearchQuery, 1, false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [showCustomerSearchModal, customerSearchQuery]);

  const handleScrollCustomerList = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollHeight - scrollTop - clientHeight < 60 && hasMoreCustomers && !loadingCustomerSearch) {
      loadCustomersSearch(customerSearchQuery, customerSearchPage + 1, true);
    }
  };

  const handleSelectCustomer = (cust) => {
    setForm(prev => ({
      ...prev,
      customer_id: cust.id,
      name: cust.name || prev.name,
      company: cust.fantasy_name || prev.company,
      phone: cust.phone || prev.phone,
      phone2: cust.phone2 || prev.phone2,
      email: cust.email || prev.email,
      document: cust.cnpj || cust.cpf || prev.document,
      address: cust.address || prev.address,
      ra_df: cust.city || prev.ra_df
    }));
    setLookupSource({
      source: 'base_central',
      label: 'Base Central de Clientes'
    });
    setLinkedCustomerInfo(cust);
    setMatchedCustomerSuggestion(null);
    setShowCustomerSearchModal(false);
  };

  // In-line auto-lookup enquanto o usuário digita
  useEffect(() => {
    if (form.customer_id) return;
    const cleanDoc = (form.document || '').replace(/\D/g, '');
    const cleanP = (form.phone || '').replace(/\D/g, '');
    const cleanP2 = (form.phone2 || '').replace(/\D/g, '');
    const emailVal = (form.email || '').trim().toLowerCase();

    const term = (cleanDoc.length >= 11 ? cleanDoc : '') ||
                 (cleanP.length >= 8 ? cleanP.slice(-8) : '') ||
                 (cleanP2.length >= 8 ? cleanP2.slice(-8) : '') ||
                 (emailVal.length >= 6 && emailVal.includes('@') ? emailVal : '');

    if (!term) {
      setMatchedCustomerSuggestion(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/crm/customers?search=${encodeURIComponent(term)}&limit=1`, {
          headers: getAuthHeaders()
        });
        const data = await res.json();
        if (data.success && data.data?.customers?.length > 0) {
          const match = data.data.customers[0];
          setMatchedCustomerSuggestion(match);
        } else {
          setMatchedCustomerSuggestion(null);
        }
      } catch (_) {}
    }, 450);

    return () => clearTimeout(timer);
  }, [form.document, form.phone, form.phone2, form.email, form.customer_id]);

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

  const handleDeleteClick = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 5000);
      return;
    }
    if (lead && onDelete) {
      onDelete(lead.id);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    onSave({
      ...form,
      funnelId,
      name: form.name.trim(),
      company: form.company.trim(),
      phone: form.phone.trim(),
      phone2: form.phone2.trim(),
      email: form.email.trim(),
      document: form.document.trim(),
      address: form.address.trim(),
      notes: form.notes.trim(),
      estimated_value: form.estimated_value ? (parseFloat(form.estimated_value) || 0) : null,
      negotiated_price: form.negotiated_price ? (parseFloat(form.negotiated_price) || 0) : (parseFloat(form.estimated_value) || 0),
      update_customer: updateCustomerOptIn
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-start justify-center p-3 sm:p-6 sm:py-8 overflow-y-auto">
      <div className={`w-full max-w-5xl rounded-3xl p-5 sm:p-7 shadow-2xl border my-auto sm:my-6 transition-colors relative ${
        isDark 
          ? 'bg-slate-900 border-slate-800 text-slate-100' 
          : 'bg-white border-slate-200 text-slate-900 shadow-slate-200/50'
      }`}>
        {/* Modal Top Header */}
        <div className={`flex items-center justify-between pb-4 mb-5 border-b ${
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

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Banner de Aviso caso o Cliente Vinculado seja Inativo ou Bloqueado */}
          {linkedCustomerInfo?.is_inactive && (
            <div className={`p-4 rounded-2xl border flex items-start gap-3.5 ${
              linkedCustomerInfo.inactivity_reason === 'bloqueado'
                ? (isDark ? 'bg-rose-950/40 border-rose-500/40 text-rose-200' : 'bg-rose-50 border-rose-300 text-rose-950')
                : linkedCustomerInfo.inactivity_reason === 'distribuidor'
                  ? (isDark ? 'bg-sky-950/40 border-sky-500/40 text-sky-200' : 'bg-sky-50 border-sky-300 text-sky-950')
                  : (isDark ? 'bg-amber-950/30 border-amber-500/40 text-amber-200' : 'bg-amber-50 border-amber-300 text-amber-950')
            }`}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 font-bold ${
                linkedCustomerInfo.inactivity_reason === 'bloqueado'
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                : linkedCustomerInfo.inactivity_reason === 'distribuidor'
                  ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40'
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
              }`}>
                {linkedCustomerInfo.inactivity_reason === 'bloqueado' && <ShieldAlert className="w-5 h-5" />}
                {linkedCustomerInfo.inactivity_reason === 'distribuidor' && <Handshake className="w-5 h-5" />}
                {linkedCustomerInfo.inactivity_reason === 'fechou_oficina' && <Store className="w-5 h-5" />}
                {linkedCustomerInfo.inactivity_reason === 'outro' && <UserX className="w-5 h-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-black text-xs sm:text-sm uppercase tracking-wide">
                    {linkedCustomerInfo.inactivity_reason === 'bloqueado'
                      ? 'Atenção: Cliente Bloqueado / Mau Caráter / Não Atender'
                      : linkedCustomerInfo.inactivity_reason === 'distribuidor'
                        ? 'Cliente Inativo • Perfil Distribuidor / Parceiro Comercial'
                        : linkedCustomerInfo.inactivity_reason === 'fechou_oficina'
                          ? 'Cliente Inativo • Oficina Fechada / Encerrou Atividades'
                          : 'Cliente Marcado como Inativo na Base'}
                  </span>
                  {linkedCustomerInfo.inactivity_reason === 'distribuidor' && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                      linkedCustomerInfo.allow_marketing_campaigns
                        ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}>
                      {linkedCustomerInfo.allow_marketing_campaigns ? 'Campanhas & Rifas: PERMITIDAS' : 'Campanhas: BLOQUEADAS'}
                    </span>
                  )}
                </div>
                <p className="text-xs opacity-90 mt-1 leading-relaxed">
                  {linkedCustomerInfo.inactivity_reason === 'bloqueado'
                    ? 'Atenção comercial: este cliente possui bloqueio grave no CRM Athena. Proibido emitir orçamentos ou negociar sem autorização superior.'
                    : linkedCustomerInfo.inactivity_reason === 'distribuidor'
                      ? 'Este cliente é um parceiro distribuidor. Não deve ser atendido com ofertas comerciais de rotina para oficinas mecânicas.'
                      : 'Este cliente está marcado como inativo na Base Central.'}
                  {linkedCustomerInfo.inactivity_notes && (
                    <span className={`block mt-1 font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      Observações: "{linkedCustomerInfo.inactivity_notes}"
                    </span>
                  )}
                </p>
              </div>
            </div>
          )}

          {/* Layout Split-View: Duas colunas em telas grandes (lg), empilhado no mobile */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Coluna Esquerda: Dados Comerciais do Lead (7 colunas) */}
            <div className="lg:col-span-7 space-y-4">
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

          {/* Banner de Auto-sugestão in-line */}
          {matchedCustomerSuggestion && (
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3 text-xs text-amber-400 animate-in fade-in">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold truncate text-white">
                    Cliente encontrado: {matchedCustomerSuggestion.name}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate">
                    {matchedCustomerSuggestion.fantasy_name || matchedCustomerSuggestion.phone || matchedCustomerSuggestion.city}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleSelectCustomer(matchedCustomerSuggestion)}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shrink-0 transition cursor-pointer"
              >
                Vincular
              </button>
            </div>
          )}

          {/* Nome e Empresa */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className={`block text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Nome de Contato ou Responsável *
                </label>
                <button
                  type="button"
                  onClick={() => setShowCustomerSearchModal(true)}
                  className="text-[11px] font-bold text-amber-500 hover:text-amber-400 flex items-center gap-1 cursor-pointer transition"
                  title="Buscar cliente existente na base central"
                >
                  <Search className="w-3 h-3" />
                  <span>Buscar na Base</span>
                </button>
              </div>
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

          {/* Telefones e E-mail */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                WhatsApp Principal *
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
                Telefone 2 / Recado
              </label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={form.phone2}
                  onChange={(e) => setForm({ ...form, phone2: e.target.value })}
                  placeholder="(61) 98888-8888"
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

            {/* Opt-in de Sincronização Mestre (Refinamento 1) */}
            {form.customer_id && (
              <div className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs ${
                isDark ? 'bg-slate-950/40 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}>
                <input
                  type="checkbox"
                  id="update_cust_optin"
                  checked={updateCustomerOptIn}
                  onChange={(e) => setUpdateCustomerOptIn(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 accent-amber-500 cursor-pointer"
                />
                <label htmlFor="update_cust_optin" className="cursor-pointer text-[11px] leading-tight select-none">
                  Notamos dados comerciais. <strong>Deseja atualizar também o cadastro principal deste cliente na base?</strong>
                </label>
              </div>
            )}
            </div>

            {/* Coluna Direita: Histórico de Negociação & Observações em Cards (5 colunas) */}
            <div className={`lg:col-span-5 flex flex-col space-y-3.5 lg:border-l lg:pl-6 ${
              isDark ? 'border-slate-800' : 'border-slate-200'
            }`}>
              {/* Header da Coluna */}
              <div className="flex items-center justify-between pb-1">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-500 flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className={`text-xs font-black uppercase tracking-wider ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                      Histórico & Observações
                    </h3>
                    <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Interações, acordos e tarefas
                    </p>
                  </div>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'
                }`}>
                  {noteCards.length} {noteCards.length === 1 ? 'nota' : 'notas'}
                </span>
              </div>

              {/* Caixa para Digitar Nova Anotação */}
              <div className={`p-3.5 rounded-2xl border space-y-2.5 ${
                isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <textarea
                  rows={2}
                  value={newNoteInput}
                  onChange={(e) => setNewNoteInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                      e.preventDefault();
                      handleAddNewNote();
                    }
                  }}
                  placeholder="Escreva uma anotação sobre esta oportunidade... (Ctrl + Enter para enviar)"
                  className={`w-full p-2.5 rounded-xl text-xs border outline-none resize-none transition ${
                    isDark 
                      ? 'bg-slate-900 border-slate-800 text-white placeholder-slate-600 focus:border-amber-400' 
                      : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-amber-500'
                  }`}
                />
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">
                    <kbd className="px-1 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[9px]">Ctrl+Enter</kbd> salva rápido
                  </span>
                  <button
                    type="button"
                    onClick={handleAddNewNote}
                    disabled={!newNoteInput.trim()}
                    className="px-3 py-1.5 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 flex items-center gap-1 transition cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Adicionar</span>
                  </button>
                </div>
              </div>

              {/* Lista de Cards de Anotações Cumulativas */}
              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                {noteCards.length === 0 ? (
                  <div className={`p-6 text-center rounded-2xl border border-dashed ${
                    isDark ? 'border-slate-800 text-slate-500' : 'border-slate-200 text-slate-400'
                  }`}>
                    <MessageSquare className="w-6 h-6 opacity-40 mx-auto mb-1.5 text-amber-500" />
                    <p className="text-xs font-bold">Nenhuma observação registrada</p>
                    <p className="text-[11px] mt-0.5">Use o campo acima para salvar a primeira anotação permanente.</p>
                  </div>
                ) : (
                  noteCards.map((card) => (
                    <div
                      key={card.id}
                      className={`p-3 rounded-xl border text-xs leading-relaxed transition ${
                        isDark 
                          ? 'bg-slate-950/90 border-slate-800/90 text-slate-200 shadow-xs' 
                          : 'bg-white border-slate-200 text-slate-800 shadow-xs'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5 text-[10px] text-slate-400">
                        {card.author && (
                          <span className="font-bold text-amber-500 flex items-center gap-1">
                            <User className="w-3 h-3" />
                            <span>{card.author}</span>
                          </span>
                        )}
                        {card.timestamp && (
                          <span className="font-mono text-slate-400 ml-auto">
                            {card.timestamp}
                          </span>
                        )}
                      </div>
                      <p className="whitespace-pre-wrap text-[11px] sm:text-xs">
                        {card.content}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Rodapé e Ações */}
          <div className={`flex items-center justify-between pt-4 border-t gap-3 ${
            isDark ? 'border-slate-800' : 'border-slate-100'
          }`}>
            {lead && onDelete ? (
              <button
                type="button"
                onClick={handleDeleteClick}
                className={`px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer ${
                  confirmDelete 
                    ? 'bg-red-600 text-white animate-pulse' 
                    : 'bg-red-500/10 hover:bg-red-500/20 text-red-500'
                }`}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{confirmDelete ? 'Certeza? Clique para confirmar' : 'Excluir Lead'}</span>
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

        {/* Modal de Busca Rápida de Clientes (Lupa com Infinite Scroll) */}
        {showCustomerSearchModal && (
          <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
            <div className={`w-full max-w-lg rounded-3xl p-5 shadow-2xl border flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150 ${
              isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
            }`}>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center font-bold">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white">Buscar na Base de Clientes</h3>
                    <p className="text-[11px] text-slate-400">Selecione para auto-preencher o card e vincular</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCustomerSearchModal(false)}
                  className="p-1.5 rounded-xl border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Input de Busca Fixo no Topo */}
              <div className="pt-3 pb-2 shrink-0">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    autoFocus
                    value={customerSearchQuery}
                    onChange={(e) => setCustomerSearchQuery(e.target.value)}
                    placeholder="Digite nome, telefone, documento, empresa..."
                    className={`w-full rounded-xl pl-9 pr-3 py-2 text-xs border focus:outline-none transition-colors ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus:border-amber-400' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-amber-500'
                    }`}
                  />
                  {loadingCustomerSearch && (
                    <Loader2 className="w-3.5 h-3.5 text-amber-500 animate-spin absolute right-3 top-1/2 -translate-y-1/2" />
                  )}
                </div>
              </div>

              {/* Lista com Infinite Scroll */}
              <div
                onScroll={handleScrollCustomerList}
                className="flex-1 overflow-y-auto divide-y divide-slate-800/60 pr-1 space-y-1 min-h-[220px]"
              >
                {customerSearchResults.length === 0 && !loadingCustomerSearch ? (
                  <div className="py-12 text-center text-xs text-slate-500">
                    Nenhum cliente encontrado com esse termo.
                  </div>
                ) : (
                  customerSearchResults.map(c => (
                    <div
                      key={c.id}
                      onClick={() => handleSelectCustomer(c)}
                      className={`p-3 rounded-xl transition cursor-pointer flex items-center justify-between gap-3 group ${
                        isDark ? 'hover:bg-slate-800/60' : 'hover:bg-slate-100'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-white group-hover:text-amber-400 transition truncate">
                            {c.name}
                          </span>
                          {c.category && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-slate-800 text-slate-300">
                              {c.category}
                            </span>
                          )}
                        </div>
                        {c.fantasy_name && c.fantasy_name !== c.name && (
                          <p className="text-[11px] text-slate-400 truncate mt-0.5">
                            {c.fantasy_name}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400 mt-1">
                          {c.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-slate-500" /> {c.phone}</span>}
                          {c.phone2 && <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-slate-500" /> {c.phone2}</span>}
                          {c.cnpj || c.cpf ? <span className="flex items-center gap-1"><FileText className="w-3 h-3 text-slate-500" /> {c.cnpj || c.cpf}</span> : null}
                          {c.city && <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-slate-500" /> {c.city} - {c.state || 'DF'}</span>}
                        </div>
                      </div>

                      <button
                        type="button"
                        className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500/10 text-amber-400 group-hover:bg-amber-500 group-hover:text-slate-950 transition shrink-0"
                      >
                        Vincular
                      </button>
                    </div>
                  ))
                )}

                {loadingCustomerSearch && customerSearchResults.length > 0 && (
                  <div className="py-3 text-center text-xs text-amber-500 flex items-center justify-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Carregando mais clientes...</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
