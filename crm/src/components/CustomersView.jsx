import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { crmApiFetch } from '../utils/api';
import CustomerDetailsModal from './CustomerDetailsModal';
import { 
  Users, 
  Search, 
  LayoutGrid, 
  List, 
  Filter, 
  Plus, 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Wrench, 
  CheckCircle2, 
  RefreshCw,
  X,
  ChevronRight,
  MessageCircle,
  Clock
} from 'lucide-react';

const INITIAL_SAMPLE_CUSTOMERS = [
  {
    id: 'cust_sample_1',
    name: 'Carlos Eduardo Ferreira',
    fantasy_name: 'Polara Samambaia',
    razao_social: 'Auto Mecânica Polara Ltda',
    cpf: '023.491.821-44',
    cnpj: '07.850.203/0001-16',
    phone: '(61) 98112-9527',
    email: 'carlos@polara.com.br',
    city: 'Brasília',
    state: 'DF',
    category: 'Mecânica Geral',
    pipeline_stage: 'cliente_ativo',
    notes: 'Cliente parceiro com elevador e alinhador 3D Mahovi',
    marital_status: 'Casado(a)',
    spouse_works_in_shop: true,
    spouse_birthday: '1988-06-14',
    equipments: ['Elevador Automotivo 4T', 'Alinhador 3D Mahovi']
  },
  {
    id: 'cust_sample_2',
    name: 'Ademilson Domingos Soares',
    fantasy_name: 'Recuperauto Águas Claras',
    razao_social: 'Ademilson Domingos Soares',
    cpf: '198.441.721-09',
    cnpj: '38.061.826/0001-33',
    phone: '(61) 98562-8244',
    email: 'recuperauto@gmail.com',
    city: 'Brasília',
    state: 'DF',
    category: 'Mecânica Geral',
    pipeline_stage: 'negociacao',
    notes: 'Em negociação para montagem de rampa pneumática',
    marital_status: 'Solteiro(a)',
    equipments: ['Rampa Pneumática']
  }
];

export default function CustomersView() {
  const { isDark } = useTheme();
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' ou 'lista'
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedEquipmentFilter, setSelectedEquipmentFilter] = useState('all');

  // Modal de Detalhes
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
    category: 'Mecânica Geral',
    pipeline_stage: 'lead'
  });
  const [creating, setCreating] = useState(false);

  // Carregar Clientes com Fallback Resiliente
  const loadCustomers = async () => {
    setLoading(true);
    let localCusts = [];
    try {
      const stored = localStorage.getItem('athena_crm_customers');
      if (stored) localCusts = JSON.parse(stored);
    } catch (_) {}

    try {
      const params = new URLSearchParams({
        search: search.trim(),
        category: selectedCategory !== 'all' ? selectedCategory : '',
        limit: '100'
      });

      const res = await crmApiFetch(`/crm/customers?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        const serverCusts = data.customers || [];
        const map = new Map();
        localCusts.forEach(c => map.set(c.id, c));
        serverCusts.forEach(c => map.set(c.id, c));
        const merged = Array.from(map.values());
        setCustomers(merged);
        localStorage.setItem('athena_crm_customers', JSON.stringify(merged));
        setLoading(false);
        return;
      }
    } catch (_) {}
    finally {
      setLoading(false);
    }

    if (localCusts.length > 0) {
      setCustomers(localCusts);
    } else {
      setCustomers(INITIAL_SAMPLE_CUSTOMERS);
      try {
        localStorage.setItem('athena_crm_customers', JSON.stringify(INITIAL_SAMPLE_CUSTOMERS));
      } catch (_) {}
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [search, selectedCategory]);

  // Filtro adicional em memória por equipamento
  const filteredCustomers = customers.filter(c => {
    if (selectedEquipmentFilter !== 'all') {
      const eqps = Array.isArray(c.equipments) ? c.equipments : [];
      if (!eqps.some(eq => eq.toLowerCase().includes(selectedEquipmentFilter.toLowerCase()))) {
        return false;
      }
    }
    return true;
  });

  // Abrir detalhes completos com busca de filiais e histórico
  const handleOpenDetails = async (cust) => {
    try {
      const res = await crmApiFetch(`/crm/customers/${cust.id}`);
      if (res.ok) {
        const full = await res.json();
        setActiveCustomer(full.data);
      } else {
        setActiveCustomer(cust);
      }
    } catch (e) {
      setActiveCustomer(cust);
    }
  };

  // Criar Novo Cliente
  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    if (!newCustomerData.name.trim()) return;
    setCreating(true);

    const createdCust = {
      id: `cust_${Date.now()}`,
      name: newCustomerData.name,
      fantasy_name: newCustomerData.fantasy_name || newCustomerData.name,
      cpf: newCustomerData.cpf,
      cnpj: newCustomerData.cnpj,
      phone: newCustomerData.phone,
      email: newCustomerData.email,
      category: newCustomerData.category || 'Mecânica Geral',
      pipeline_stage: newCustomerData.pipeline_stage || 'lead',
      city: 'Brasília',
      state: 'DF',
      equipments: [],
      created_at: new Date().toISOString()
    };

    // Atualiza estado e localStorage instantaneamente
    setCustomers(prev => [createdCust, ...prev]);
    try {
      const stored = localStorage.getItem('athena_crm_customers');
      const list = stored ? JSON.parse(stored) : [];
      list.unshift(createdCust);
      localStorage.setItem('athena_crm_customers', JSON.stringify(list));
    } catch (_) {}

    setShowCreateModal(false);
    setNewCustomerData({
      name: '',
      fantasy_name: '',
      cpf: '',
      cnpj: '',
      phone: '',
      email: '',
      category: 'Mecânica Geral',
      pipeline_stage: 'lead'
    });

    try {
      await crmApiFetch('/crm/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(createdCust)
      });
    } catch (_) {
      // Continua com persistência local garantida
    } finally {
      setCreating(false);
    }
  };

  // Estágios para visão Kanban de Clientes
  const KANBAN_STAGES = [
    { id: 'lead', title: 'Leads & Prospecção', color: '#64748b' },
    { id: 'contato', title: 'Primeiro Contato Feito', color: '#0ea5e9' },
    { id: 'visita', title: 'Visita Agendada / Realizada', color: '#f59e0b' },
    { id: 'negociacao', title: 'Em Negociação', color: '#ec4899' },
    { id: 'ganho', title: 'Clientes Ativos Athena', color: '#10b981' }
  ];

  return (
    <div className={`flex-1 flex flex-col h-full overflow-hidden select-none ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'
    }`}>
      {/* Top Header da Página de Clientes */}
      <div className={`px-4 sm:px-6 py-3 border-b flex flex-wrap items-center justify-between gap-3 shrink-0 ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 font-bold">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className={`font-black text-base sm:text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Base Central de Clientes
              </h1>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
              }`}>
                {filteredCustomers.length} cadastros
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Gestão de relacionamento, filiais, histórico de compras, visitas e dados familiares
            </p>
          </div>
        </div>

        {/* Alternador de Visualização (Kanban vs Lista) & Botão Novo Cliente */}
        <div className="flex items-center gap-3">
          <div className={`flex items-center p-1 rounded-xl border ${
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
          }`}>
            <button
              type="button"
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                viewMode === 'kanban'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Kanban</span>
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
              <span>Lista</span>
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

      {/* Barra de Busca Universal e Filtros (Nome, CPF/CNPJ, Fantasia, Telefone, Email) */}
      <div className={`px-4 sm:px-6 py-2.5 border-b flex flex-wrap items-center justify-between gap-3 shrink-0 ${
        isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        {/* Campo de Busca Universal */}
        <div className="relative flex-1 min-w-[280px] max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pesquisar por Nome, Fantasia, CPF, CNPJ, Tel ou Email..."
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
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filtros por Categoria / Tipo */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-400 font-bold hidden sm:inline">Tipo:</span>
          {['all', 'Mecânica Geral', 'Borracharia / Pneus', 'Lanternagem e Pintura', 'Detail / Estética Automotiva'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition cursor-pointer border ${
                selectedCategory === cat
                  ? 'bg-amber-500 border-amber-500 text-slate-950'
                  : isDark 
                    ? 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white' 
                    : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
              }`}
            >
              {cat === 'all' ? 'Todos os Tipos' : cat.split('/')[0].trim()}
            </button>
          ))}
        </div>
      </div>

      {/* Conteúdo Principal: Visualização em Kanban ou Lista */}
      <div className="flex-1 overflow-hidden min-h-0 flex flex-col p-4 sm:p-6">
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
            <span className="text-xs text-slate-400">Carregando clientes do Supabase...</span>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center gap-2 text-slate-400">
            <Users className="w-10 h-10 opacity-30" />
            <span className="text-sm font-bold">Nenhum cliente cadastrado com esses critérios</span>
            <span className="text-xs">Clique no botão "Novo Cliente" para adicionar o primeiro.</span>
          </div>
        ) : viewMode === 'kanban' ? (
          /* ======================================================== */
          /* MODO KANBAN DE CLIENTES                                  */
          /* ======================================================== */
          <div className="flex-1 overflow-x-auto min-h-0 flex items-stretch gap-4 pb-2">
            {KANBAN_STAGES.map((stg) => {
              const stageClients = filteredCustomers.filter(c => (c.pipeline_stage || 'lead') === stg.id);
              return (
                <div 
                  key={stg.id}
                  className={`w-72 sm:w-80 shrink-0 border rounded-2xl flex flex-col h-full max-h-full min-h-0 shadow-lg ${
                    isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200'
                  }`}
                >
                  {/* Cabeçalho da Coluna */}
                  <div className={`p-3.5 border-b flex items-center justify-between shrink-0 ${
                    isDark ? 'border-slate-800/80 bg-slate-950/40' : 'border-slate-200 bg-slate-50'
                  }`}>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: stg.color }} />
                      <h3 className="font-black text-xs sm:text-sm">{stg.title}</h3>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-200 border-slate-300 text-slate-800'
                    }`}>
                      {stageClients.length}
                    </span>
                  </div>

                  {/* Lista de Cards da Coluna com Scroll Vertical Estrito */}
                  <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5 min-h-0">
                    {stageClients.map((cust) => {
                      const cleanPhone = (cust.phone || '').replace(/\D/g, '');
                      return (
                        <div
                          key={cust.id}
                          onClick={() => handleOpenDetails(cust)}
                          className={`p-3 rounded-xl border transition-all duration-150 cursor-pointer shadow-xs hover:shadow-md ${
                            isDark 
                              ? 'bg-slate-950/80 border-slate-800 hover:border-amber-500/50 text-slate-200' 
                              : 'bg-white border-slate-200 hover:border-amber-500/60 text-slate-800'
                          }`}
                        >
                          {/* Nome e Nome Fantasia */}
                          <div className="mb-2">
                            <h4 className="font-black text-xs truncate leading-tight">
                              {cust.name}
                            </h4>
                            <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-500 truncate mt-0.5">
                              <Building2 className="w-3 h-3 shrink-0" />
                              <span className="truncate">{cust.fantasy_name || 'Sem Fantasia'}</span>
                            </div>
                          </div>

                          {/* Tag de Categoria */}
                          <div className="mb-2">
                            <span className={`text-[9px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider ${
                              isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'
                            }`}>
                              {cust.category}
                            </span>
                          </div>

                          {/* Contato & Localização com Botão Mapa */}
                          <div className="space-y-1.5 text-[11px] text-slate-400 pt-2 border-t border-slate-800/60">
                            {cust.phone && (
                              <div className="flex items-center justify-between">
                                <span className="flex items-center gap-1 truncate">
                                  <Phone className="w-3 h-3 text-emerald-500 shrink-0" />
                                  <span className="truncate">{cust.phone}</span>
                                </span>
                                {cleanPhone && (
                                  <a 
                                    href={`https://wa.me/55${cleanPhone}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="text-emerald-400 hover:text-emerald-300"
                                    title="Conversar no WhatsApp"
                                  >
                                    <MessageCircle className="w-3.5 h-3.5" />
                                  </a>
                                )}
                              </div>
                            )}
                            
                            {/* Localização e Botão Direto para o Google Maps */}
                            <div className="flex items-center justify-between gap-1 pt-0.5">
                              <span className="flex items-center gap-1 truncate">
                                <MapPin className="w-3 h-3 text-amber-500 shrink-0" />
                                <span className="truncate">{cust.city || 'Brasília'} • {cust.state || 'DF'}</span>
                              </span>

                              <a
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cust.address ? `${cust.address}, ${cust.city || 'DF'}` : `${cust.name}, ${cust.city || 'Brasília DF'}`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="px-2 py-0.5 rounded-md bg-blue-500/10 hover:bg-blue-500 text-blue-400 hover:text-white font-bold text-[10px] flex items-center gap-1 transition"
                                title="Abrir localização exata no Google Maps"
                              >
                                <span>Mapa</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ======================================================== */
          /* MODO TABELA / LISTA DE CLIENTES                          */
          /* ======================================================== */
          <div className={`flex-1 overflow-y-auto border rounded-2xl shadow-sm min-h-0 ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <table className="w-full text-left border-collapse text-xs">
              <thead className={`sticky top-0 z-10 border-b text-[11px] uppercase tracking-wider font-extrabold ${
                isDark ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'
              }`}>
                <tr>
                  <th className="p-3.5">Cliente & Fantasia</th>
                  <th className="p-3.5">Tipo / Categoria</th>
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
                        <div className="font-black text-xs">{cust.name}</div>
                        <div className="text-[11px] text-amber-500 font-semibold">{cust.fantasy_name || '—'}</div>
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {cust.category}
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

      {/* MODAL DETALHADO DO CLIENTE (FICHA + HISTÓRICO) */}
      {activeCustomer && (
        <CustomerDetailsModal
          customer={activeCustomer}
          onClose={() => setActiveCustomer(null)}
          onCustomerUpdated={(updated) => {
            setActiveCustomer(updated);
            loadCustomers();
          }}
        />
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
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
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
                  </select>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold ${
                    isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-1.5 transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>{creating ? 'Salvando...' : 'Cadastrar'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
