import React, { useState, useEffect, useMemo } from 'react';
import { useTheme } from '../context/ThemeContext';
import { crmApiFetch } from '../utils/api';
import CustomerProfilePage from './CustomerProfilePage';
import { 
  Users, 
  Search, 
  LayoutGrid, 
  List, 
  Plus, 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  Wrench, 
  CheckCircle2, 
  RefreshCw,
  X,
  MessageCircle,
  ExternalLink,
  ShieldCheck,
  Tag,
  Filter
} from 'lucide-react';

const CATEGORIES = [
  'all',
  'Mecânica Geral',
  'Lanternagem e Pintura',
  'Detail / Estética Automotiva',
  'Borracharia / Pneus',
  'Auto Elétrica',
  'Concessionária / Outros'
];

const STAGES = [
  { id: 'all', label: 'Todos os Status' },
  { id: 'cliente_ativo', label: 'Cliente Ativo', color: 'emerald' },
  { id: 'ganho', label: 'Ganho / Parceria', color: 'emerald' },
  { id: 'negociacao', label: 'Em Negociação', color: 'amber' },
  { id: 'contato', label: 'Primeiro Contato', color: 'sky' },
  { id: 'lead', label: 'Lead / Prospecção', color: 'slate' }
];

export default function CustomersView() {
  const { isDark } = useTheme();
  // Grade de Cards como padrão solicitado pelo usuário
  const [viewMode, setViewMode] = useState('grid'); // 'grid' ou 'lista'
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Filtros
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStage, setSelectedStage] = useState('all');

  // Modal de Detalhes (Ficha Completa)
  const [activeCustomer, setActiveCustomer] = useState(null);

  // Modal de Cadastro Rápido de Novo Cliente
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCustomerData, setNewCustomerData] = useState({
    name: '',
    fantasy_name: '',
    cpf: '',
    cnpj: '',
    phone: '',
    email: '',
    city: 'Brasília',
    state: 'DF',
    category: 'Mecânica Geral',
    pipeline_stage: 'cliente_ativo'
  });
  const [creating, setCreating] = useState(false);

  // Limpeza de cache legado com dados mock (ex: Ademilson) do navegador
  useEffect(() => {
    try {
      localStorage.removeItem('athena_crm_customers');
    } catch (_) {}
  }, []);

  // Carregar Clientes diretamente do PostgreSQL via API do Backend
  const loadCustomers = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const params = new URLSearchParams({
        limit: '250',
        _t: String(Date.now())
      });
      if (search.trim()) params.append('search', search.trim());
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (selectedStage !== 'all') params.append('stage', selectedStage);

      const res = await crmApiFetch(`/crm/customers?${params.toString()}`);
      if (!res.ok) {
        throw new Error(`Servidor respondeu com status ${res.status}`);
      }
      const data = await res.json();
      setCustomers(Array.isArray(data.customers) ? data.customers : []);
    } catch (err) {
      console.error('[CustomersView] Erro ao carregar clientes do PostgreSQL:', err);
      setErrorMsg('Não foi possível conectar ao banco de dados no momento.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [selectedCategory, selectedStage]);

  // Filtragem responsiva instantânea em memória sobre o conjunto retornado
  const filteredCustomers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return customers.filter(c => {
      // Filtro de Categoria
      if (selectedCategory !== 'all' && c.category !== selectedCategory) {
        return false;
      }
      // Filtro de Status / Estágio
      if (selectedStage !== 'all') {
        const stage = c.pipeline_stage || 'lead';
        if (stage !== selectedStage) return false;
      }
      // Busca Textual
      if (q) {
        const matchName = (c.name || '').toLowerCase().includes(q);
        const matchFantasy = (c.fantasy_name || '').toLowerCase().includes(q);
        const matchEmail = (c.email || '').toLowerCase().includes(q);
        const matchPhone = (c.phone || '').replace(/\D/g, '').includes(q.replace(/\D/g, ''));
        const matchDoc = (c.cnpj || c.cpf || '').replace(/\D/g, '').includes(q.replace(/\D/g, ''));
        const matchCity = (c.city || '').toLowerCase().includes(q);
        const matchNotes = (c.notes || '').toLowerCase().includes(q);
        if (!matchName && !matchFantasy && !matchEmail && !matchPhone && !matchDoc && !matchCity && !matchNotes) {
          return false;
        }
      }
      return true;
    });
  }, [customers, search, selectedCategory, selectedStage]);

  // Abrir detalhes completos com busca de filiais e histórico
  const handleOpenDetails = async (cust) => {
    try {
      const res = await crmApiFetch(`/crm/customers/${cust.id}?_t=${Date.now()}`);
      if (res.ok) {
        const full = await res.json();
        setActiveCustomer(full.data || cust);
      } else {
        setActiveCustomer(cust);
      }
    } catch (_) {
      setActiveCustomer(cust);
    }
  };

  // Criar Novo Cliente diretamente no Banco PostgreSQL
  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    if (!newCustomerData.name.trim()) return;
    setCreating(true);

    try {
      const res = await crmApiFetch('/crm/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCustomerData)
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Erro HTTP ${res.status}`);
      }

      setShowCreateModal(false);
      setNewCustomerData({
        name: '',
        fantasy_name: '',
        cpf: '',
        cnpj: '',
        phone: '',
        email: '',
        city: 'Brasília',
        state: 'DF',
        category: 'Mecânica Geral',
        pipeline_stage: 'cliente_ativo'
      });
      await loadCustomers();
    } catch (err) {
      alert(`Falha ao salvar cliente no banco: ${err.message}`);
    } finally {
      setCreating(false);
    }
  };

  // Cores dinâmicas para avatar inicial
  const getAvatarColor = (name = '') => {
    const colors = [
      'from-amber-500 to-orange-600',
      'from-emerald-500 to-teal-600',
      'from-blue-500 to-indigo-600',
      'from-purple-500 to-pink-600',
      'from-cyan-500 to-blue-600'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  const getInitials = (name = '') => {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 0 || !parts[0]) return 'C';
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Se houver um cliente selecionado, exibe a página dedicada completa (sem popup)
  if (activeCustomer) {
    return (
      <CustomerProfilePage
        customer={activeCustomer}
        onBack={() => setActiveCustomer(null)}
        onCustomerUpdated={(updated) => {
          setActiveCustomer(updated);
          loadCustomers();
        }}
      />
    );
  }

  return (
    <div className={`flex-1 flex flex-col h-full overflow-hidden select-none ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'
    }`}>
      {/* Top Header da Página de Clientes */}
      <div className={`px-4 sm:px-6 py-3.5 border-b flex flex-wrap items-center justify-between gap-3 shrink-0 ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 font-bold shadow-xs">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className={`font-black text-base sm:text-lg tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Base Central de Clientes
              </h1>
              <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
                isDark ? 'bg-slate-800/80 border-slate-700 text-amber-400' : 'bg-amber-50 border-amber-200 text-amber-700'
              }`}>
                {filteredCustomers.length} {filteredCustomers.length === 1 ? 'cliente' : 'clientes'}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Visualização individual por cards com telefones, WhatsApp, documentos e histórico
            </p>
          </div>
        </div>

        {/* Alternador de Visualização (Grade de Cards vs Tabela) & Botão Novo Cliente */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={loadCustomers}
            disabled={loading}
            title="Recarregar clientes do banco de dados"
            className={`p-2 rounded-xl border text-xs font-bold transition cursor-pointer ${
              isDark ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white' : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-500' : ''}`} />
          </button>

          <div className={`flex items-center p-1 rounded-xl border ${
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
          }`}>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Grade de Cards</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('lista')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                viewMode === 'lista'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Tabela</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-1.5 transition cursor-pointer shadow-sm shadow-amber-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Cliente</span>
          </button>
        </div>
      </div>

      {/* Barra de Filtros e Busca em Tempo Real */}
      <div className={`px-4 sm:px-6 py-2.5 border-b flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shrink-0 ${
        isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        {/* Campo de Busca Universal */}
        <div className="relative flex-1 min-w-[260px] max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por Nome, Fantasia, CPF, CNPJ, Tel ou Email..."
            className={`w-full pl-9 pr-8 py-1.5 text-xs rounded-xl border transition outline-none ${
              isDark 
                ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus:border-amber-500' 
                : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-amber-500'
            }`}
          />
          {search && (
            <button 
              type="button" 
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filtros de Categoria & Status */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <div className="flex items-center gap-1.5 shrink-0">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition outline-none cursor-pointer ${
                selectedCategory !== 'all'
                  ? 'bg-amber-500/10 border-amber-500/40 text-amber-500'
                  : isDark 
                    ? 'bg-slate-950 border-slate-800 text-slate-300' 
                    : 'bg-slate-50 border-slate-300 text-slate-700'
              }`}
            >
              <option value="all">Todas as Categorias</option>
              {CATEGORIES.filter(c => c !== 'all').map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition outline-none cursor-pointer ${
                selectedStage !== 'all'
                  ? 'bg-amber-500/10 border-amber-500/40 text-amber-500'
                  : isDark 
                    ? 'bg-slate-950 border-slate-800 text-slate-300' 
                    : 'bg-slate-50 border-slate-300 text-slate-700'
              }`}
            >
              {STAGES.map(stg => (
                <option key={stg.id} value={stg.id}>{stg.label}</option>
              ))}
            </select>
          </div>

          {(search || selectedCategory !== 'all' || selectedStage !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setSelectedCategory('all');
                setSelectedStage('all');
              }}
              className="text-[11px] font-bold text-amber-500 hover:underline px-2 py-1 cursor-pointer shrink-0"
            >
              Limpar Filtros
            </button>
          )}
        </div>
      </div>

      {/* Conteúdo Principal: GRADE DE CARDS OU TABELA */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 min-h-0">
        {loading && customers.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center gap-3 text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin text-amber-500" />
            <p className="text-sm font-semibold">Carregando clientes da base de dados PostgreSQL...</p>
          </div>
        ) : errorMsg && customers.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center gap-3 text-rose-400">
            <p className="text-sm font-bold">{errorMsg}</p>
            <button
              type="button"
              onClick={loadCustomers}
              className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold"
            >
              Tentar Novamente
            </button>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="h-72 flex flex-col items-center justify-center gap-3 text-slate-400">
            <Users className="w-12 h-12 opacity-30 text-amber-500" />
            <h3 className="text-base font-bold text-slate-300">Nenhum cliente encontrado</h3>
            <p className="text-xs text-slate-500 max-w-sm text-center">
              {search || selectedCategory !== 'all' || selectedStage !== 'all'
                ? 'Nenhum resultado corresponde aos filtros selecionados. Tente ajustar a busca.'
                : 'Sua base de clientes está pronta no PostgreSQL. Comece cadastrando o primeiro cliente.'}
            </p>
            {search || selectedCategory !== 'all' || selectedStage !== 'all' ? (
              <button
                type="button"
                onClick={() => { setSearch(''); setSelectedCategory('all'); setSelectedStage('all'); }}
                className="mt-2 px-3.5 py-1.5 rounded-xl bg-slate-800 text-amber-400 text-xs font-bold hover:bg-slate-700 cursor-pointer"
              >
                Limpar Filtros
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="mt-2 px-4 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-400 cursor-pointer"
              >
                Cadastrar Primeiro Cliente
              </button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          /* ======================================================== */
          /* GRADE DE CARDS (VISUALIZAÇÃO PADRÃO SOLICITADA)          */
          /* ======================================================== */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredCustomers.map((cust) => {
              const cleanDigits = (cust.phone || '').replace(/\D/g, '');
              const doc = (cust.cnpj || cust.cpf || '').trim();
              const isCnpj = doc.replace(/\D/g, '').length > 11;
              const equipments = Array.isArray(cust.equipments) ? cust.equipments : [];

              return (
                <div
                  key={cust.id}
                  onClick={() => handleOpenDetails(cust)}
                  className={`group relative rounded-2xl border p-6 sm:p-7 transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                    isDark
                      ? 'bg-slate-900/90 border-slate-800/80 hover:border-amber-500/50 hover:bg-slate-900 shadow-lg shadow-black/20'
                      : 'bg-white border-slate-200/90 hover:border-amber-500/50 hover:shadow-md'
                  }`}
                >
                  {/* Top do Card: Avatar, Nome e Tag de Categoria */}
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-10 h-10 rounded-xl bg-linear-to-br ${getAvatarColor(cust.name || '')} text-white font-black text-sm flex items-center justify-center shrink-0 shadow-xs`}>
                          {getInitials(cust.name || cust.fantasy_name || 'C')}
                        </div>
                        <div className="min-w-0">
                          <h3 className={`font-black text-xs sm:text-sm truncate leading-snug ${
                            isDark ? 'text-white group-hover:text-amber-400' : 'text-slate-900 group-hover:text-amber-600'
                          }`}>
                            {cust.name}
                          </h3>
                          {cust.fantasy_name && cust.fantasy_name !== cust.name ? (
                            <p className="text-[11px] font-bold text-amber-500 truncate flex items-center gap-1 mt-0.5">
                              <Building2 className="w-3 h-3 shrink-0" />
                              <span className="truncate">{cust.fantasy_name}</span>
                            </p>
                          ) : (
                            <p className="text-[11px] text-slate-500 truncate mt-0.5">
                              {cust.city || 'Brasília'} • {cust.state || 'DF'}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Tags: Categoria e Status */}
                    <div className="flex items-center gap-1.5 flex-wrap mb-3.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                        isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                      }`}>
                        {cust.category || 'Mecânica Geral'}
                      </span>

                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                        (cust.pipeline_stage === 'cliente_ativo' || cust.pipeline_stage === 'ganho')
                          ? isDark ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                          : cust.pipeline_stage === 'negociacao'
                            ? isDark ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-amber-50 border-amber-200 text-amber-700'
                            : isDark ? 'bg-slate-800/60 border-slate-700 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'
                      }`}>
                        {cust.pipeline_stage === 'cliente_ativo' ? 'Cliente Ativo' : cust.pipeline_stage === 'ganho' ? 'Parceria Fechada' : cust.pipeline_stage === 'negociacao' ? 'Em Negociação' : 'Lead'}
                      </span>
                    </div>

                    {/* Informações de Contato e Documento */}
                    <div className="space-y-1.5 text-xs text-slate-400 pt-1 border-t border-slate-800/40">
                      {/* Telefone & WhatsApp */}
                      <div className="flex items-center justify-between gap-2 text-[11px]">
                        <span className="flex items-center gap-1.5 font-semibold truncate text-slate-300">
                          <Phone className="w-3 h-3 text-slate-500 shrink-0" />
                          <span className="truncate">{cust.phone || 'Sem telefone'}</span>
                        </span>
                        {cleanDigits && (
                          <a
                            href={`https://wa.me/55${cleanDigits}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="px-2 py-0.5 rounded-md bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white font-bold text-[10px] flex items-center gap-1 transition"
                            title="Conversar no WhatsApp"
                          >
                            <MessageCircle className="w-2.5 h-2.5" />
                            <span>WhatsApp</span>
                          </a>
                        )}
                      </div>

                      {/* Email */}
                      {cust.email && (
                        <div className="flex items-center gap-1.5 text-[11px] truncate text-slate-400">
                          <Mail className="w-3 h-3 text-slate-500 shrink-0" />
                          <span className="truncate">{cust.email}</span>
                        </div>
                      )}

                      {/* CNPJ / CPF */}
                      {doc && (
                        <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
                          <ShieldCheck className="w-3 h-3 text-slate-500 shrink-0" />
                          <span>{isCnpj ? `CNPJ: ${doc}` : `CPF: ${doc}`}</span>
                        </div>
                      )}

                      {/* Localidade com Link Google Maps */}
                      <div className="flex items-center justify-between gap-2 text-[11px] pt-0.5">
                        <span className="flex items-center gap-1 text-slate-400 truncate">
                          <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                          <span className="truncate">{cust.address || `${cust.city || 'Brasília'} • ${cust.state || 'DF'}`}</span>
                        </span>
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cust.address ? `${cust.address}, ${cust.city || 'DF'}` : `${cust.name}, ${cust.city || 'Brasília DF'}`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="px-1.5 py-0.5 rounded-md bg-blue-500/10 hover:bg-blue-500 text-blue-400 hover:text-white text-[10px] font-bold flex items-center gap-1 transition shrink-0"
                          title="Abrir no Google Maps"
                        >
                          <span>Mapa</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                    </div>

                    {/* Equipamentos */}
                    {equipments.length > 0 && (
                      <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                        <Wrench className="w-3 h-3 text-amber-500 shrink-0" />
                        {equipments.slice(0, 2).map((eq, idx) => (
                          <span key={idx} className="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 truncate max-w-[140px]">
                            {eq}
                          </span>
                        ))}
                        {equipments.length > 2 && (
                          <span className="text-[10px] text-slate-500">+{equipments.length - 2}</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Rodapé do Card com Ação de Abrir Ficha */}
                  <div className="mt-4 pt-3 border-t border-slate-800/40 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 font-medium">
                      Código: <span className="font-mono text-slate-400">{cust.id.replace('cust_', '').substring(0, 8)}</span>
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenDetails(cust);
                      }}
                      className="text-xs font-bold text-amber-500 hover:text-amber-400 flex items-center gap-1 transition cursor-pointer"
                    >
                      <span>Abrir Ficha</span>
                      <span>&rarr;</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ======================================================== */
          /* MODO TABELA / LISTA                                      */
          /* ======================================================== */
          <div className={`overflow-x-auto border rounded-2xl shadow-xs ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <table className="w-full text-left border-collapse text-xs">
              <thead className={`border-b text-[11px] uppercase tracking-wider font-extrabold ${
                isDark ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'
              }`}>
                <tr>
                  <th className="p-3.5">Cliente & Fantasia</th>
                  <th className="p-3.5">Tipo / Categoria</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Documentos</th>
                  <th className="p-3.5">Contato</th>
                  <th className="p-3.5">Localidade</th>
                  <th className="p-3.5 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {filteredCustomers.map((cust) => {
                  const cleanPhone = (cust.phone || '').replace(/\D/g, '');
                  return (
                    <tr 
                      key={cust.id}
                      onClick={() => handleOpenDetails(cust)}
                      className={`transition cursor-pointer ${
                        isDark ? 'hover:bg-slate-800/60' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="p-3.5">
                        <div className="font-black text-xs text-white">{cust.name}</div>
                        <div className="text-[11px] text-amber-500 font-semibold">{cust.fantasy_name || '—'}</div>
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {cust.category || 'Mecânica Geral'}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          cust.pipeline_stage === 'cliente_ativo' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {cust.pipeline_stage === 'cliente_ativo' ? 'Ativo' : 'Lead'}
                        </span>
                      </td>
                      <td className="p-3.5 text-[11px] text-slate-400 font-mono">
                        <div>{cust.cnpj || cust.cpf || '—'}</div>
                      </td>
                      <td className="p-3.5 text-[11px]">
                        <div className="flex items-center gap-1.5 font-bold">
                          <span>{cust.phone || '—'}</span>
                          {cleanPhone && (
                            <a 
                              href={`https://wa.me/55${cleanPhone}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-emerald-400"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                        <div className="text-slate-400 truncate max-w-[160px]">{cust.email || '—'}</div>
                      </td>
                      <td className="p-3.5 text-[11px] text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <span>{cust.city || 'Brasília'} • {cust.state || 'DF'}</span>
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cust.address ? `${cust.address}, ${cust.city || 'DF'}` : `${cust.name}, ${cust.city || 'Brasília DF'}`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-1 rounded-md bg-blue-500/10 hover:bg-blue-500 text-blue-400 hover:text-white transition"
                            title="Abrir no Google Maps"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </td>
                      <td className="p-3.5 text-right">
                        <span className="text-amber-500 font-bold hover:underline">
                          Abrir Ficha &rarr;
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL DE CADASTRO RÁPIDO DE CLIENTE */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs select-none">
          <div className={`w-full max-w-md rounded-2xl border shadow-2xl p-6 ${
            isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="font-black text-base">Cadastrar Novo Cliente</h3>
              <button 
                type="button" 
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">Nome do Cliente / Responsável *</label>
                <input
                  type="text"
                  required
                  value={newCustomerData.name}
                  onChange={(e) => setNewCustomerData({ ...newCustomerData, name: e.target.value })}
                  placeholder="Ex: Carlos Eduardo"
                  className={`w-full px-3 py-2 rounded-xl border text-xs outline-none ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">Nome Fantasia da Oficina</label>
                <input
                  type="text"
                  value={newCustomerData.fantasy_name}
                  onChange={(e) => setNewCustomerData({ ...newCustomerData, fantasy_name: e.target.value })}
                  placeholder="Ex: Auto Mecânica Polara"
                  className={`w-full px-3 py-2 rounded-xl border text-xs outline-none ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1">CPF</label>
                  <input
                    type="text"
                    value={newCustomerData.cpf}
                    onChange={(e) => setNewCustomerData({ ...newCustomerData, cpf: e.target.value })}
                    placeholder="000.000.000-00"
                    className={`w-full px-3 py-1.5 rounded-xl border text-xs outline-none ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1">CNPJ</label>
                  <input
                    type="text"
                    value={newCustomerData.cnpj}
                    onChange={(e) => setNewCustomerData({ ...newCustomerData, cnpj: e.target.value })}
                    placeholder="00.000.000/0001-00"
                    className={`w-full px-3 py-1.5 rounded-xl border text-xs outline-none ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1">Telefone / WhatsApp</label>
                  <input
                    type="text"
                    value={newCustomerData.phone}
                    onChange={(e) => setNewCustomerData({ ...newCustomerData, phone: e.target.value })}
                    placeholder="(61) 90000-0000"
                    className={`w-full px-3 py-1.5 rounded-xl border text-xs outline-none ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1">Tipo de Oficina</label>
                  <select
                    value={newCustomerData.category}
                    onChange={(e) => setNewCustomerData({ ...newCustomerData, category: e.target.value })}
                    className={`w-full px-3 py-1.5 rounded-xl border text-xs outline-none ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  >
                    <option value="Mecânica Geral">Mecânica Geral</option>
                    <option value="Borracharia / Pneus">Borracharia / Pneus</option>
                    <option value="Lanternagem e Pintura">Lanternagem e Pintura</option>
                    <option value="Detail / Estética Automotiva">Detail / Estética</option>
                    <option value="Auto Elétrica">Auto Elétrica</option>
                    <option value="Concessionária / Outros">Concessionária / Outros</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">Email</label>
                <input
                  type="email"
                  value={newCustomerData.email}
                  onChange={(e) => setNewCustomerData({ ...newCustomerData, email: e.target.value })}
                  placeholder="cliente@email.com"
                  className={`w-full px-3 py-1.5 rounded-xl border text-xs outline-none ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold cursor-pointer ${
                    isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{creating ? 'Salvando...' : 'Cadastrar no Banco'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
