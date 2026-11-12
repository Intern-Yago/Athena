import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

// Categorias organizadas em ordem alfabética (com 'all' no topo)
const CATEGORIES = [
  'all',
  'Auto Elétrica',
  'Borracharia / Pneus',
  'Concessionária / Outros',
  'Detail / Estética Automotiva',
  'Lanternagem e Pintura',
  'Mecânica Geral'
];

// Estágios organizados em ordem alfabética de rótulo (com 'all' no topo)
const STAGES = [
  { id: 'all', label: 'Todos os Status' },
  { id: 'cliente_ativo', label: 'Cliente Ativo', color: 'emerald' },
  { id: 'negociacao', label: 'Em Negociação', color: 'amber' },
  { id: 'ganho', label: 'Ganho / Parceria', color: 'emerald' },
  { id: 'lead', label: 'Lead / Prospecção', color: 'slate' },
  { id: 'contato', label: 'Primeiro Contato', color: 'sky' }
];

// Opções de Ordenação do Painel
const SORT_OPTIONS = [
  { id: 'name_asc', label: 'Nome (A → Z)' },
  { id: 'name_desc', label: 'Nome (Z → A)' },
  { id: 'date_desc', label: 'Data de Cadastro (Mais Recentes)' },
  { id: 'date_asc', label: 'Data de Cadastro (Mais Antigos)' }
];

/**
 * Remove acentos, caracteres diacríticos e converte para minúsculas
 * para garantir busca insensível a acentuação (ex: 'alemao' encontra 'Alemão').
 */
const normalizeSearchText = (str) =>
  (str || '')
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

/**
 * Sanitizadores seguros para parâmetros de URL (Proteção contra XSS e injeção)
 */
const sanitizePage = (val) => {
  const p = parseInt(val, 10);
  return Number.isInteger(p) && p > 0 ? p : 1;
};

const sanitizeSafeId = (val) => {
  if (!val || typeof val !== 'string') return '';
  const trimmed = val.trim();
  return /^[a-zA-Z0-9_-]{3,64}$/.test(trimmed) ? trimmed : '';
};

export default function CustomersView() {
  const { isDark } = useTheme();

  // Leitura e validação inicial de parâmetros seguros da URL
  const initialParams = useMemo(() => new URLSearchParams(window.location.search), []);
  const initialPage = useMemo(() => sanitizePage(initialParams.get('page')), [initialParams]);
  const initialSearch = useMemo(() => (initialParams.get('q') || initialParams.get('search') || '').slice(0, 100), [initialParams]);
  const initialId = useMemo(() => sanitizeSafeId(initialParams.get('id') || initialParams.get('clienteId')), [initialParams]);

  // Grade de Cards como padrão solicitado pelo usuário
  const [viewMode, setViewMode] = useState('grid'); // 'grid' ou 'lista'
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Filtros & Ordenação
  const [search, setSearch] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStage, setSelectedStage] = useState('all');
  const [sortBy, setSortBy] = useState('name_asc');

  // Filtros Avançados por Equipamento & Modelo
  const [catalogOptions, setCatalogOptions] = useState([
    { category: 'Elevador', models: [] },
    { category: 'Scanner automotivo', models: [] },
    { category: 'Alinhamento', models: [] },
    { category: 'ATF (troca de fluido)', models: [] },
    { category: 'Recuperadora de gás', models: [] },
    { category: 'Troca de líquido de arrefecimento', models: [] }
  ]);
  const [equipmentFilters, setEquipmentFilters] = useState(() => {
    try {
      const saved = initialParams.get('eqFilters');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (_) {}
    return [];
  });
  const [showEquipFilterBar, setShowEquipFilterBar] = useState(false);
  const [filterEquipType, setFilterEquipType] = useState('Elevador');
  const [filterEquipModel, setFilterEquipModel] = useState('');

  // Carrega opções de equipamentos do backend para autocompletar no filtro
  useEffect(() => {
    let isMounted = true;
    crmApiFetch('/crm/customer-equipment-options')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (isMounted && data && Array.isArray(data.data) && data.data.length > 0) {
          setCatalogOptions(data.data);
        }
      })
      .catch(() => {});
    return () => { isMounted = false; };
  }, []);

  // Modelos disponíveis para o tipo de equipamento atualmente selecionado
  const selectedCatModels = useMemo(() => {
    const found = catalogOptions.find(
      c => c.category.toLowerCase() === filterEquipType.toLowerCase()
    );
    return Array.isArray(found?.models) ? found.models : [];
  }, [catalogOptions, filterEquipType]);

  const handleAddEquipmentFilter = () => {
    if (!filterEquipType && !filterEquipModel) return;
    const newFilter = {
      id: `ef_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type: filterEquipType.trim(),
      model: filterEquipModel.trim()
    };
    setEquipmentFilters(prev => [...prev, newFilter]);
    setFilterEquipModel('');
  };

  const handleRemoveEquipmentFilter = (filterId) => {
    setEquipmentFilters(prev => prev.filter(f => f.id !== filterId));
  };

  // Paginação no Banco de Dados (PostgreSQL LIMIT/OFFSET)
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(48);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Debounce da busca textual para sincronização com o banco
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 280);
    return () => clearTimeout(timer);
  }, [search]);

  // Sempre que filtros ou ordenação mudam após o carregamento inicial, volta para a página 1
  const isInitialFilterMount = useRef(true);
  useEffect(() => {
    if (isInitialFilterMount.current) {
      isInitialFilterMount.current = false;
      return;
    }
    setCurrentPage(1);
  }, [selectedCategory, selectedStage, debouncedSearch, sortBy, pageSize, equipmentFilters]);

  // Modal de Detalhes (Ficha Completa)
  const [activeCustomer, setActiveCustomer] = useState(null);

  // Auto-carregamento do cliente caso informado com segurança na URL (?id=cust_xxx)
  useEffect(() => {
    if (initialId) {
      crmApiFetch(`/crm/customers/${initialId}?_t=${Date.now()}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && data.data) {
            setActiveCustomer(data.data);
          }
        })
        .catch((err) => {
          console.warn('[CustomersView] Falha ao carregar cliente da URL:', err);
        });
    }
  }, [initialId]);

  // Sincronização segura da URL do navegador (sem recarregar a tela)
  useEffect(() => {
    try {
      const url = new URL(window.location.href);

      // Sincroniza ID do cliente ativo
      if (activeCustomer?.id && sanitizeSafeId(activeCustomer.id)) {
        url.searchParams.set('id', activeCustomer.id);
      } else {
        url.searchParams.delete('id');
        url.searchParams.delete('clienteId');
      }

      // Sincroniza Paginação
      if (currentPage > 1) {
        url.searchParams.set('page', String(currentPage));
      } else {
        url.searchParams.delete('page');
      }

      // Sincroniza Busca Textual
      if (debouncedSearch && debouncedSearch.trim()) {
        url.searchParams.set('q', debouncedSearch.trim());
      } else {
        url.searchParams.delete('q');
        url.searchParams.delete('search');
      }

      // Sincroniza Filtros de Equipamentos
      if (equipmentFilters.length > 0) {
        url.searchParams.set('eqFilters', JSON.stringify(equipmentFilters));
      } else {
        url.searchParams.delete('eqFilters');
      }

      const nextUrl = url.pathname + (url.search ? url.search : '');
      window.history.replaceState({}, '', nextUrl);
    } catch (_) {}
  }, [activeCustomer, currentPage, debouncedSearch, equipmentFilters]);

  // Modal de Cadastro Rápido de Novo Cliente
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCustomerData, setNewCustomerData] = useState({
    name: '',
    fantasy_name: '',
    cpf: '',
    cnpj: '',
    phone: '',
    phone2: '',
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

  // Carregar Clientes diretamente do PostgreSQL via API do Backend com Paginação Real
  const loadCustomers = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: String(pageSize),
        _t: String(Date.now())
      });
      if (debouncedSearch.trim()) params.append('search', debouncedSearch.trim());
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (selectedStage !== 'all') params.append('stage', selectedStage);
      if (sortBy) params.append('sortBy', sortBy);
      if (equipmentFilters.length > 0) params.append('equipmentFilters', JSON.stringify(equipmentFilters));

      const res = await crmApiFetch(`/crm/customers?${params.toString()}`);
      if (!res.ok) {
        throw new Error(`Servidor respondeu com status ${res.status}`);
      }
      const data = await res.json();
      setCustomers(Array.isArray(data.customers) ? data.customers : []);
      setTotalCustomers(typeof data.total === 'number' ? data.total : (data.customers?.length || 0));
      setTotalPages(typeof data.totalPages === 'number' ? Math.max(1, data.totalPages) : 1);
    } catch (err) {
      console.error('[CustomersView] Erro ao carregar clientes do PostgreSQL:', err);
      setErrorMsg('Não foi possível conectar ao banco de dados no momento.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [selectedCategory, selectedStage, debouncedSearch, sortBy, currentPage, pageSize, equipmentFilters]);

  // Filtragem responsiva instantânea em memória e ordenação flexível
  const filteredCustomers = useMemo(() => {
    const q = normalizeSearchText(search);
    const cleanDigits = (search || '').replace(/\D/g, '');

    const filtered = customers.filter(c => {
      // Filtro de Categoria
      if (selectedCategory !== 'all' && c.category !== selectedCategory) {
        return false;
      }
      // Filtro de Status / Estágio
      if (selectedStage !== 'all') {
        const stage = c.pipeline_stage || 'lead';
        if (stage !== selectedStage) return false;
      }
      // Busca Textual Accent-Insensitive
      if (q) {
        const matchName = normalizeSearchText(c.name).includes(q);
        const matchFantasy = normalizeSearchText(c.fantasy_name).includes(q);
        const matchEmail = normalizeSearchText(c.email).includes(q);
        const matchPhone = cleanDigits && (
          (c.phone || '').replace(/\D/g, '').includes(cleanDigits) ||
          (c.phone2 || '').replace(/\D/g, '').includes(cleanDigits)
        );
        const matchDoc = cleanDigits && (
          (c.cnpj || c.cpf || '').replace(/\D/g, '').includes(cleanDigits)
        );
        const matchCity = normalizeSearchText(c.city).includes(q);
        const matchNotes = normalizeSearchText(c.notes).includes(q);
        if (!matchName && !matchFantasy && !matchEmail && !matchPhone && !matchDoc && !matchCity && !matchNotes) {
          return false;
        }
      }

      // Filtros por Equipamentos & Modelos (Interseção AND: cliente deve possuir todos os critérios configurados)
      if (equipmentFilters.length > 0) {
        const cEquips = Array.isArray(c.equipments) ? c.equipments : [];
        const matchesAllEquipFilters = equipmentFilters.every(ef => {
          const targetType = normalizeSearchText(ef.type || '');
          const targetModel = normalizeSearchText(ef.model || '');
          if (!targetType && !targetModel) return true;

          return cEquips.some(eq => {
            if (typeof eq === 'string') {
              const norm = normalizeSearchText(eq);
              const mType = !targetType || norm.includes(targetType);
              const mModel = !targetModel || norm.includes(targetModel);
              return mType && mModel;
            }
            if (typeof eq === 'object' && eq !== null) {
              const eqType = normalizeSearchText(eq.type || '');
              const eqModel = normalizeSearchText(eq.model || '');
              const mType = !targetType || eqType.includes(targetType);
              const mModel = !targetModel || eqModel.includes(targetModel);
              return mType && mModel;
            }
            return false;
          });
        });

        if (!matchesAllEquipFilters) return false;
      }

      return true;
    });

    // Ordenação (Alfabética ou por Data de Cadastro)
    return [...filtered].sort((a, b) => {
      if (sortBy === 'name_asc') {
        const nameA = (a.fantasy_name || a.name || '').trim();
        const nameB = (b.fantasy_name || b.name || '').trim();
        return nameA.localeCompare(nameB, 'pt-BR', { sensitivity: 'base' });
      }
      if (sortBy === 'name_desc') {
        const nameA = (a.fantasy_name || a.name || '').trim();
        const nameB = (b.fantasy_name || b.name || '').trim();
        return nameB.localeCompare(nameA, 'pt-BR', { sensitivity: 'base' });
      }
      if (sortBy === 'date_asc') {
        const dateA = new Date(a.created_at || a.updated_at || 0).getTime();
        const dateB = new Date(b.created_at || b.updated_at || 0).getTime();
        return dateA - dateB;
      }
      // date_desc (padrão para novidades)
      const dateA = new Date(a.created_at || a.updated_at || 0).getTime();
      const dateB = new Date(b.created_at || b.updated_at || 0).getTime();
      return dateB - dateA;
    });
  }, [customers, search, selectedCategory, selectedStage, sortBy, equipmentFilters]);

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
        phone2: '',
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
                {totalCustomers} {totalCustomers === 1 ? 'cliente' : 'clientes'}
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

          {/* Ordenação Alfabética e Temporal */}
          <div className="flex items-center gap-1.5 shrink-0">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              title="Ordenar lista de clientes"
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition outline-none cursor-pointer ${
                sortBy !== 'name_asc'
                  ? 'bg-amber-500/10 border-amber-500/40 text-amber-500'
                  : isDark 
                    ? 'bg-slate-950 border-slate-800 text-slate-300' 
                    : 'bg-slate-50 border-slate-300 text-slate-700'
              }`}
            >
              {SORT_OPTIONS.map(opt => (
                <option key={opt.id} value={opt.id}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Botão de Filtro por Equipamento */}
          <button
            type="button"
            onClick={() => setShowEquipFilterBar(!showEquipFilterBar)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
              equipmentFilters.length > 0 || showEquipFilterBar
                ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-xs font-black'
                : isDark 
                  ? 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700' 
                  : 'bg-slate-50 border-slate-300 text-slate-700 hover:text-slate-900 hover:border-slate-400'
            }`}
            title="Filtrar clientes por máquinas instaladas e modelos específicos"
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Equipamentos</span>
            {equipmentFilters.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-slate-950 text-amber-400 text-[10px] font-black flex items-center justify-center">
                {equipmentFilters.length}
              </span>
            )}
          </button>

          {(search || selectedCategory !== 'all' || selectedStage !== 'all' || sortBy !== 'name_asc' || equipmentFilters.length > 0) && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setSelectedCategory('all');
                setSelectedStage('all');
                setSortBy('name_asc');
                setEquipmentFilters([]);
              }}
              className="text-[11px] font-bold text-amber-500 hover:underline px-2 py-1 cursor-pointer shrink-0"
            >
              Limpar Filtros
            </button>
          )}
        </div>
      </div>

      {/* Barra Expansível de Filtro por Equipamento & Modelo */}
      {(showEquipFilterBar || equipmentFilters.length > 0) && (
        <div className={`px-4 sm:px-6 py-3 border-b flex flex-col gap-2.5 transition animate-in fade-in shrink-0 ${
          isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-100/70 border-slate-200'
        }`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5" />
                Filtrar por Máquinas & Modelos
              </span>
              <span className="text-[11px] text-slate-400 hidden sm:inline">
                (Combine múltiplos equipamentos: ex: Elevador geral + Scanner eaata90)
              </span>
            </div>

            {equipmentFilters.length > 0 && (
              <button
                type="button"
                onClick={() => setEquipmentFilters([])}
                className="text-[11px] font-bold text-rose-400 hover:underline cursor-pointer flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                <span>Limpar Critérios de Equipamento</span>
              </button>
            )}
          </div>

          {/* Form para adicionar critério de filtro */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5">
              <label className="text-[11px] font-bold text-slate-400">Tipo:</label>
              <select
                value={filterEquipType}
                onChange={(e) => {
                  setFilterEquipType(e.target.value);
                  setFilterEquipModel('');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition outline-none cursor-pointer ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-amber-500' : 'bg-white border-slate-300 text-slate-900 focus:border-amber-500'
                }`}
              >
                {catalogOptions.map(cat => (
                  <option key={cat.id || cat.category} value={cat.category}>{cat.category}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5 flex-1 min-w-[200px] max-w-sm">
              <label className="text-[11px] font-bold text-slate-400">Modelo:</label>
              <input
                type="text"
                list="crm-equip-models-datalist"
                value={filterEquipModel}
                onChange={(e) => setFilterEquipModel(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddEquipmentFilter(); } }}
                placeholder="Ex: eaata90, 4T... (deixe em branco para qualquer modelo)"
                className={`w-full px-3 py-1.5 rounded-xl text-xs border transition outline-none ${
                  isDark 
                    ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus:border-amber-500' 
                    : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-amber-500'
                }`}
              />
              <datalist id="crm-equip-models-datalist">
                {selectedCatModels.map((m, idx) => (
                  <option key={idx} value={m} />
                ))}
              </datalist>
            </div>

            <button
              type="button"
              onClick={handleAddEquipmentFilter}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Adicionar Critério</span>
            </button>
          </div>

          {/* Tags dos Filtros Ativos */}
          {equipmentFilters.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap pt-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Ativos:</span>
              {equipmentFilters.map((ef) => (
                <span
                  key={ef.id}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border ${
                    isDark ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-amber-50 text-amber-900 border-amber-300'
                  }`}
                >
                  <Wrench className="w-3 h-3 text-amber-500" />
                  <span>{ef.type}</span>
                  {ef.model ? (
                    <span className="font-mono text-[11px] opacity-90">• Modelo: <strong>"{ef.model}"</strong></span>
                  ) : (
                    <span className="text-[10px] opacity-75">(Geral / Qualquer modelo)</span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveEquipmentFilter(ef.id)}
                    className="hover:text-rose-400 p-0.5 rounded cursor-pointer transition"
                    title="Remover filtro"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <span className="text-[11px] text-slate-400 ml-1">
                • {filteredCustomers.length} {filteredCustomers.length === 1 ? 'cliente compatível' : 'clientes compatíveis'}
              </span>
            </div>
          )}
        </div>
      )}

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
            {search || selectedCategory !== 'all' || selectedStage !== 'all' || sortBy !== 'name_asc' ? (
              <button
                type="button"
                onClick={() => { setSearch(''); setSelectedCategory('all'); setSelectedStage('all'); setSortBy('name_asc'); }}
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

                      {/* Telefone 2 / Recado */}
                      {cust.phone2 && (
                        <div className="flex items-center justify-between gap-2 text-[11px]">
                          <span className="flex items-center gap-1.5 font-semibold truncate text-slate-400">
                            <Phone className="w-3 h-3 text-slate-500 shrink-0" />
                            <span className="truncate">{cust.phone2} <span className="text-[9px] text-amber-500/80 font-normal">(Tel 2)</span></span>
                          </span>
                          {cust.phone2.replace(/\D/g, '') && (
                            <a
                              href={`https://wa.me/55${cust.phone2.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="px-2 py-0.5 rounded-md bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white font-bold text-[10px] flex items-center gap-1 transition"
                              title="Conversar no WhatsApp (Tel 2)"
                            >
                              <MessageCircle className="w-2.5 h-2.5" />
                              <span>WhatsApp</span>
                            </a>
                          )}
                        </div>
                      )}

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

                      {/* Localidade (Mapa exibido estritamente se houver endereço cadastrado) */}
                      <div className="flex items-center justify-between gap-2 text-[11px] pt-0.5">
                        <span className="flex items-center gap-1 text-slate-400 truncate">
                          <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                          <span className="truncate">{cust.address?.trim() || `${cust.city || 'Brasília'} • ${cust.state || 'DF'}`}</span>
                        </span>
                        {cust.address && cust.address.trim() && (
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${cust.address.trim()}, ${cust.city || 'DF'}`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="px-1.5 py-0.5 rounded-md bg-blue-500/10 hover:bg-blue-500 text-blue-400 hover:text-white text-[10px] font-bold flex items-center gap-1 transition shrink-0"
                            title="Abrir endereço no Google Maps"
                          >
                            <span>Mapa</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Equipamentos */}
                    {equipments.length > 0 && (
                      <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                        <Wrench className="w-3 h-3 text-amber-500 shrink-0" />
                        {equipments.slice(0, 3).map((eq, idx) => {
                          const eqLabel = typeof eq === 'string'
                            ? eq
                            : (eq.model ? `${eq.type} (${eq.model})` : eq.type);
                          return (
                            <span 
                              key={idx} 
                              className="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 truncate max-w-[150px]"
                              title={eqLabel}
                            >
                              {eqLabel}
                            </span>
                          );
                        })}
                        {equipments.length > 3 && (
                          <span className="text-[10px] text-slate-500 font-bold">+{equipments.length - 3}</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Rodapé do Card com Ação de Abrir Ficha */}
                  <div className="mt-4 pt-3 border-t border-slate-800/40 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 font-medium truncate max-w-[150px]">
                      {cust.category || 'Oficina'}
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
                        {Array.isArray(cust.equipments) && cust.equipments.length > 0 && (
                          <div className="flex items-center gap-1 mt-1 flex-wrap">
                            <Wrench className="w-2.5 h-2.5 text-amber-500 shrink-0" />
                            {cust.equipments.slice(0, 2).map((eq, idx) => {
                              const eqLabel = typeof eq === 'string' ? eq : (eq.model ? `${eq.type} (${eq.model})` : eq.type);
                              return (
                                <span key={idx} className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 truncate max-w-[130px]" title={eqLabel}>
                                  {eqLabel}
                                </span>
                              );
                            })}
                            {cust.equipments.length > 2 && (
                              <span className="text-[9px] text-slate-500 font-bold">+{cust.equipments.length - 2}</span>
                            )}
                          </div>
                        )}
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
                        <div className="space-y-0.5">
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
                          {cust.phone2 && (
                            <div className="flex items-center gap-1.5 text-slate-400 text-[10px]">
                              <span>{cust.phone2}</span>
                              {cust.phone2.replace(/\D/g, '') && (
                                <a 
                                  href={`https://wa.me/55${cust.phone2.replace(/\D/g, '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-emerald-400/80 hover:text-emerald-300"
                                  title="WhatsApp (Tel 2)"
                                >
                                  <MessageCircle className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="text-slate-400 truncate max-w-[160px]">{cust.email || '—'}</div>
                      </td>
                      <td className="p-3.5 text-[11px] text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <span>{cust.address?.trim() || `${cust.city || 'Brasília'} • ${cust.state || 'DF'}`}</span>
                          {cust.address && cust.address.trim() && (
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${cust.address.trim()}, ${cust.city || 'DF'}`)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="p-1 rounded-md bg-blue-500/10 hover:bg-blue-500 text-blue-400 hover:text-white transition"
                              title="Abrir endereço no Google Maps"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
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

      {/* BARRA FIXA DE PAGINAÇÃO NO BANCO DE DADOS (POSTGRESQL LIMIT/OFFSET) */}
      {totalCustomers > 0 && (
        <div className={`px-4 sm:px-6 py-2.5 border-t flex flex-wrap items-center justify-between gap-3 shrink-0 ${
          isDark ? 'bg-slate-900/95 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          {/* Informações de Exibição */}
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>
              Exibindo <strong className={isDark ? 'text-white' : 'text-slate-900'}>
                {Math.min((currentPage - 1) * pageSize + 1, totalCustomers)}–{Math.min(currentPage * pageSize, totalCustomers)}
              </strong> de <strong className={isDark ? 'text-white' : 'text-slate-900'}>{totalCustomers}</strong> clientes
            </span>
            {(search || selectedCategory !== 'all' || selectedStage !== 'all') && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 font-semibold border border-amber-500/20">
                filtrados
              </span>
            )}
          </div>

          {/* Controles de Navegação e Tamanho de Página */}
          <div className="flex items-center gap-3">
            {/* Seletor de Itens por Página */}
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span className="hidden sm:inline">Por página:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className={`px-2 py-1 rounded-lg text-xs font-bold border transition outline-none cursor-pointer ${
                  isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-white border-slate-300 text-slate-700'
                }`}
              >
                <option value={24}>24</option>
                <option value={48}>48</option>
                <option value={96}>96</option>
                <option value={200}>200</option>
              </select>
            </div>

            {/* Botões de Página Anterior / Próxima */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1 || loading}
                title="Página Anterior"
                className={`px-2.5 py-1 rounded-lg border text-xs font-bold flex items-center gap-1 transition cursor-pointer ${
                  currentPage <= 1 || loading
                    ? 'opacity-40 cursor-not-allowed border-transparent text-slate-500'
                    : isDark
                      ? 'border-slate-800 hover:bg-slate-800 text-slate-200'
                      : 'border-slate-300 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Anterior</span>
              </button>

              <span className="px-2 py-1 text-xs font-extrabold text-amber-500">
                {currentPage} / {totalPages}
              </span>

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages || loading}
                title="Próxima Página"
                className={`px-2.5 py-1 rounded-lg border text-xs font-bold flex items-center gap-1 transition cursor-pointer ${
                  currentPage >= totalPages || loading
                    ? 'opacity-40 cursor-not-allowed border-transparent text-slate-500'
                    : isDark
                      ? 'border-slate-800 hover:bg-slate-800 text-slate-200'
                      : 'border-slate-300 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <span className="hidden sm:inline">Próxima</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1">Telefone Principal (WhatsApp)</label>
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
                  <label className="text-xs font-bold text-slate-400 block mb-1">Telefone 2 / Recado</label>
                  <input
                    type="text"
                    value={newCustomerData.phone2}
                    onChange={(e) => setNewCustomerData({ ...newCustomerData, phone2: e.target.value })}
                    placeholder="(61) 98888-8888"
                    className={`w-full px-3 py-1.5 rounded-xl border text-xs outline-none ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1">Tipo de Oficina</label>
                  <select
                    value={newCustomerData.category}
                    onChange={(e) => setNewCustomerData({ ...newCustomerData, category: e.target.value })}
                    className={`w-full px-3 py-1.5 rounded-xl border text-xs outline-none ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  >
                    {CATEGORIES.filter(c => c !== 'all').map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1">Email</label>
                  <input
                    type="email"
                    value={newCustomerData.email}
                    onChange={(e) => setNewCustomerData({ ...newCustomerData, email: e.target.value })}
                    placeholder="contato@oficina.com.br"
                    className={`w-full px-3 py-1.5 rounded-xl border text-xs outline-none ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
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
