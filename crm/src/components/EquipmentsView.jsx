import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { 
  Package, 
  Search, 
  RefreshCw, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  DollarSign, 
  Ruler, 
  Box, 
  History, 
  Edit3, 
  Save, 
  X, 
  ChevronLeft, 
  ChevronRight,
  TrendingUp,
  MapPin,
  Building2,
  Calendar
} from 'lucide-react';

export default function EquipmentsView() {
  const { isDark } = useTheme();
  const [equipments, setEquipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Sync state
  const [syncStatus, setSyncStatus] = useState(null);
  const [syncing, setSyncing] = useState(false);

  // Edit Modal State
  const [selectedEqp, setSelectedEqp] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [savingEdit, setSavingEdit] = useState(false);

  // Sales History Modal State
  const [salesHistoryEqp, setSalesHistoryEqp] = useState(null);
  const [salesList, setSalesList] = useState([]);
  const [loadingSales, setLoadingSales] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Carrega lista de equipamentos
  const loadEquipments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('athena_crm_token') || localStorage.getItem('athena_token') || '';
      const params = new URLSearchParams({
        page: String(page),
        limit: '24',
        search: search.trim()
      });
      const res = await fetch(`/api/crm/equipments?${params.toString()}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        setEquipments(data.equipments || []);
        setTotalPages(data.totalPages || 1);
        setTotalCount(data.total || 0);
      }
    } catch (e) {
      console.warn('Erro ao carregar equipamentos:', e);
    } finally {
      setLoading(false);
    }
  };

  // Carrega status da sincronização com Omie
  const loadSyncStatus = async () => {
    try {
      const token = localStorage.getItem('athena_crm_token') || localStorage.getItem('athena_token') || '';
      const res = await fetch('/api/crm/equipments/sync-status', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        setSyncStatus(data.status);
      }
    } catch (e) {
      console.warn('Erro ao carregar status do sync:', e);
    }
  };

  useEffect(() => {
    loadEquipments();
  }, [page, search]);

  useEffect(() => {
    loadSyncStatus();
    const interval = setInterval(loadSyncStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  // Disparar sincronização escalonada (50 produtos por ciclo, 10 min de pausa)
  const handleTriggerSync = async () => {
    setSyncing(true);
    try {
      const token = localStorage.getItem('athena_crm_token') || localStorage.getItem('athena_token') || '';
      const res = await fetch('/api/crm/equipments/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      const data = await res.json();
      if (data.success) {
        showToast('Lote de 50 produtos sincronizado! Próximo ciclo em 10 minutos.');
        setSyncStatus(data.status);
        loadEquipments();
      } else {
        showToast(data.message || 'Sincronização em andamento.');
      }
    } catch (e) {
      showToast('Falha ao acionar sincronização com o Omie.');
    } finally {
      setSyncing(false);
    }
  };

  // Abre modal de edição de preços e dimensões
  const openEditModal = (eqp) => {
    setSelectedEqp(eqp);
    setEditFormData({
      price_fora_df_cnpj: eqp.price_fora_df_cnpj || 0,
      price_fora_df_cpf: eqp.price_fora_df_cpf || 0,
      price_dentro_df_cnpj: eqp.price_dentro_df_cnpj || 0,
      price_dentro_df_cpf: eqp.price_dentro_df_cpf || 0,
      product_height: eqp.product_height || 0,
      product_width: eqp.product_width || 0,
      product_depth: eqp.product_depth || 0,
      product_weight: eqp.product_weight || 0,
      package_height: eqp.package_height || 0,
      package_width: eqp.package_width || 0,
      package_depth: eqp.package_depth || 0,
      package_weight: eqp.package_weight || 0,
      cmc_cost: eqp.cmc_cost || 0
    });
  };

  // Salvar alterações de preços e dimensões
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!selectedEqp) return;
    setSavingEdit(true);

    try {
      const token = localStorage.getItem('athena_crm_token') || localStorage.getItem('athena_token') || '';
      const res = await fetch(`/api/crm/equipments/${selectedEqp.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(editFormData)
      });
      if (res.ok) {
        showToast('Preços e dimensões atualizados com sucesso no Supabase!');
        setSelectedEqp(null);
        loadEquipments();
      } else {
        showToast('Erro ao salvar no banco de dados.');
      }
    } catch (err) {
      showToast('Falha na conexão com o servidor.');
    } finally {
      setSavingEdit(false);
    }
  };

  // Abrir histórico de vendas
  const openSalesHistory = async (eqp) => {
    setSalesHistoryEqp(eqp);
    setLoadingSales(true);
    try {
      const token = localStorage.getItem('athena_crm_token') || localStorage.getItem('athena_token') || '';
      const res = await fetch(`/api/crm/equipments/${eqp.id}/sales`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        setSalesList(data.data || []);
      }
    } catch (e) {
      console.warn('Erro ao carregar histórico:', e);
    } finally {
      setLoadingSales(false);
    }
  };

  return (
    <div className={`flex-1 flex flex-col h-full overflow-hidden select-none ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'
    }`}>
      {/* Top Banner de Sincronização Escalonada com o Omie ERP */}
      <div className={`px-4 sm:px-6 py-3 border-b flex flex-wrap items-center justify-between gap-3 shrink-0 ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 font-bold">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className={`font-black text-base sm:text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Catálogo de Equipamentos & Tabela de Vendas
              </h1>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
              }`}>
                {totalCount} itens
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Sincronizado com Omie ERP em lotes de 50 produtos com 10 min de intervalo • CMC e 4 tabelas de venda
            </p>
          </div>
        </div>

        {/* Status do Cooldown & Botão de Sync */}
        <div className="flex items-center gap-3">
          {syncStatus && (
            <div className={`hidden sm:flex items-center gap-2 text-xs px-3 py-1.5 rounded-xl border ${
              syncStatus.isRunning 
                ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
            }`}>
              <Clock className="w-3.5 h-3.5" />
              <span>
                {syncStatus.isRunning 
                  ? `Lote ${syncStatus.currentBatch}: Em pausa até próximo lote`
                  : `Pronto (${syncStatus.syncedCount || 1657}/${syncStatus.totalProducts || 1657} itens)`
                }
              </span>
            </div>
          )}

          <button
            type="button"
            onClick={handleTriggerSync}
            disabled={syncing || syncStatus?.isRunning}
            className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-2 transition cursor-pointer ${
              syncStatus?.isRunning
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-sm shadow-amber-500/20'
            }`}
            title="Sincronizar lote de 50 produtos do Omie"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'Sincronizando...' : 'Sincronizar Omie'}</span>
          </button>
        </div>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className={`px-4 sm:px-6 py-2.5 border-b flex items-center justify-between gap-4 shrink-0 ${
        isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Buscar equipamento por nome, SKU ou código Omie..."
            className={`w-full pl-9 pr-4 py-1.5 text-xs rounded-xl border transition outline-none ${
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

        {/* Paginação compacta */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 hidden sm:inline">
            Página <strong className={isDark ? 'text-white' : 'text-slate-900'}>{page}</strong> de {totalPages}
          </span>
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
            className={`p-1.5 rounded-lg border transition ${
              page <= 1 
                ? 'opacity-40 cursor-not-allowed' 
                : isDark ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100 text-slate-700'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            className={`p-1.5 rounded-lg border transition ${
              page >= totalPages 
                ? 'opacity-40 cursor-not-allowed' 
                : isDark ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100 text-slate-700'
            }`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid Principal de Equipamentos com Scroll Exclusivo */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 min-h-0">
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
            <span className="text-xs text-slate-400">Carregando catálogo de equipamentos...</span>
          </div>
        ) : equipments.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center gap-2 text-slate-400">
            <Package className="w-10 h-10 opacity-30" />
            <span className="text-sm font-bold">Nenhum equipamento encontrado</span>
            <span className="text-xs">Tente buscar por outro termo ou sincronize do Omie.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {equipments.map((eqp) => (
              <div 
                key={eqp.id}
                className={`rounded-2xl border p-4.5 flex flex-col justify-between transition-all duration-200 shadow-sm hover:shadow-md ${
                  isDark 
                    ? 'bg-slate-900/90 border-slate-800/80 hover:border-slate-700' 
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  {/* Topo do Card: Imagem e Dados de Identificação */}
                  <div className="flex gap-3.5 mb-3.5">
                    <div className={`w-20 h-20 rounded-xl border shrink-0 overflow-hidden flex items-center justify-center ${
                      isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
                    }`}>
                      {eqp.image_url ? (
                        <img 
                          src={eqp.image_url} 
                          alt={eqp.name} 
                          className="w-full h-full object-contain p-1"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <Package className="w-8 h-8 text-slate-500/40" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md font-bold ${
                          isDark ? 'bg-slate-800 text-amber-400' : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}>
                          SKU: {eqp.sku || eqp.omie_code || 'S/N'}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                          (eqp.stock || 0) > 0 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          Estoque: {eqp.stock || 0} un
                        </span>
                      </div>
                      <h2 className={`font-black text-xs sm:text-sm line-clamp-2 leading-tight ${
                        isDark ? 'text-white' : 'text-slate-900'
                      }`} title={eqp.name}>
                        {eqp.name}
                      </h2>
                      <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-400">
                        <span>CMC (Custo Médio):</span>
                        <strong className="text-amber-500 font-mono">
                          R$ {Number(eqp.cmc_cost || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* 4 TABELAS DE VALORES DE VENDA (Solicitadas pelo usuário) */}
                  <div className={`rounded-xl p-3 border mb-3 ${
                    isDark ? 'bg-slate-950/70 border-slate-800/80' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3 text-emerald-500" />
                        Valores de Venda
                      </span>
                      <span className="text-[9px] text-slate-500">Tributação Diferenciada</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      {/* Fora de Brasília CNPJ */}
                      <div className={`p-2 rounded-lg border ${
                        isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'
                      }`}>
                        <span className="text-[10px] text-slate-400 block">Fora DF • CNPJ</span>
                        <strong className="font-mono text-emerald-400 text-xs">
                          R$ {Number(eqp.price_fora_df_cnpj || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </strong>
                      </div>

                      {/* Fora de Brasília CPF */}
                      <div className={`p-2 rounded-lg border ${
                        isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'
                      }`}>
                        <span className="text-[10px] text-slate-400 block">Fora DF • CPF</span>
                        <strong className="font-mono text-emerald-400 text-xs">
                          R$ {Number(eqp.price_fora_df_cpf || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </strong>
                      </div>

                      {/* Dentro de Brasília CNPJ */}
                      <div className={`p-2 rounded-lg border ${
                        isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'
                      }`}>
                        <span className="text-[10px] text-slate-400 block">Dentro DF • CNPJ</span>
                        <strong className="font-mono text-amber-400 text-xs">
                          R$ {Number(eqp.price_dentro_df_cnpj || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </strong>
                      </div>

                      {/* Dentro de Brasília CPF */}
                      <div className={`p-2 rounded-lg border ${
                        isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'
                      }`}>
                        <span className="text-[10px] text-slate-400 block">Dentro DF • CPF</span>
                        <strong className="font-mono text-amber-400 text-xs">
                          R$ {Number(eqp.price_dentro_df_cpf || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* DIMENSÕES DO PRODUTO & PACOTE */}
                  <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 mb-3">
                    <div className={`p-2 rounded-xl border flex flex-col gap-1 ${
                      isDark ? 'bg-slate-950/40 border-slate-800/60' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <div className="flex items-center gap-1 font-bold text-slate-300">
                        <Ruler className="w-3 h-3 text-amber-500" />
                        <span>Tam. Produto</span>
                      </div>
                      <span>Alt x Larg x Prof:</span>
                      <strong className="text-slate-200">
                        {eqp.product_height || 0} x {eqp.product_width || 0} x {eqp.product_depth || 0} cm
                      </strong>
                      <span>Peso: <strong>{eqp.product_weight || 0} kg</strong></span>
                    </div>

                    <div className={`p-2 rounded-xl border flex flex-col gap-1 ${
                      isDark ? 'bg-slate-950/40 border-slate-800/60' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <div className="flex items-center gap-1 font-bold text-slate-300">
                        <Box className="w-3 h-3 text-blue-400" />
                        <span>Tam. Pacote</span>
                      </div>
                      <span>Caixa (A x L x P):</span>
                      <strong className="text-slate-200">
                        {eqp.package_height || 0} x {eqp.package_width || 0} x {eqp.package_depth || 0} cm
                      </strong>
                      <span>Peso Bruto: <strong>{eqp.package_weight || 0} kg</strong></span>
                    </div>
                  </div>
                </div>

                {/* Ações: Editar e Histórico de Vendas */}
                <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => openSalesHistory(eqp)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                      isDark 
                        ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' 
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    <History className="w-3.5 h-3.5" />
                    <span>Vendas</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => openEditModal(eqp)}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Editar Valores & Dimensões</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL: EDIÇÃO DE VALORES DE VENDA & DIMENSÕES */}
      {selectedEqp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs select-none">
          <div className={`w-full max-w-xl rounded-2xl border shadow-2xl p-6 overflow-hidden ${
            isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div>
                <h3 className="font-black text-base">Editar Valores de Venda & Dimensões</h3>
                <p className="text-xs text-slate-400 line-clamp-1">{selectedEqp.name}</p>
              </div>
              <button 
                type="button" 
                onClick={() => setSelectedEqp(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
              {/* CMC Custo Médio Contábil */}
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">
                  CMC (Custo Médio Contábil) R$
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={editFormData.cmc_cost}
                  onChange={(e) => setEditFormData({ ...editFormData, cmc_cost: parseFloat(e.target.value) || 0 })}
                  className={`w-full px-3 py-2 rounded-xl border text-xs outline-none ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              {/* 4 Valores de Venda */}
              <div className="space-y-2">
                <span className="text-xs font-black uppercase text-amber-500 tracking-wider">
                  Valores de Venda
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">Fora de Brasília (CNPJ) R$</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editFormData.price_fora_df_cnpj}
                      onChange={(e) => setEditFormData({ ...editFormData, price_fora_df_cnpj: parseFloat(e.target.value) || 0 })}
                      className={`w-full px-3 py-1.5 rounded-xl border text-xs font-mono outline-none ${
                        isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">Fora de Brasília (CPF) R$</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editFormData.price_fora_df_cpf}
                      onChange={(e) => setEditFormData({ ...editFormData, price_fora_df_cpf: parseFloat(e.target.value) || 0 })}
                      className={`w-full px-3 py-1.5 rounded-xl border text-xs font-mono outline-none ${
                        isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">Dentro de Brasília (CNPJ) R$</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editFormData.price_dentro_df_cnpj}
                      onChange={(e) => setEditFormData({ ...editFormData, price_dentro_df_cnpj: parseFloat(e.target.value) || 0 })}
                      className={`w-full px-3 py-1.5 rounded-xl border text-xs font-mono outline-none ${
                        isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">Dentro de Brasília (CPF) R$</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editFormData.price_dentro_df_cpf}
                      onChange={(e) => setEditFormData({ ...editFormData, price_dentro_df_cpf: parseFloat(e.target.value) || 0 })}
                      className={`w-full px-3 py-1.5 rounded-xl border text-xs font-mono outline-none ${
                        isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Dimensões do Produto */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <span className="text-xs font-black uppercase text-amber-500 tracking-wider">
                  Dimensões do Produto
                </span>
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Altura (cm)</label>
                    <input
                      type="number"
                      value={editFormData.product_height}
                      onChange={(e) => setEditFormData({ ...editFormData, product_height: parseFloat(e.target.value) || 0 })}
                      className={`w-full px-2 py-1.5 rounded-xl border text-xs outline-none ${
                        isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Largura (cm)</label>
                    <input
                      type="number"
                      value={editFormData.product_width}
                      onChange={(e) => setEditFormData({ ...editFormData, product_width: parseFloat(e.target.value) || 0 })}
                      className={`w-full px-2 py-1.5 rounded-xl border text-xs outline-none ${
                        isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Profund. (cm)</label>
                    <input
                      type="number"
                      value={editFormData.product_depth}
                      onChange={(e) => setEditFormData({ ...editFormData, product_depth: parseFloat(e.target.value) || 0 })}
                      className={`w-full px-2 py-1.5 rounded-xl border text-xs outline-none ${
                        isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Peso (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={editFormData.product_weight}
                      onChange={(e) => setEditFormData({ ...editFormData, product_weight: parseFloat(e.target.value) || 0 })}
                      className={`w-full px-2 py-1.5 rounded-xl border text-xs outline-none ${
                        isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Dimensões do Pacote / Embalagem */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <span className="text-xs font-black uppercase text-blue-400 tracking-wider">
                  Dimensões do Pacote (Caixa de Transporte)
                </span>
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Altura Caixa (cm)</label>
                    <input
                      type="number"
                      value={editFormData.package_height}
                      onChange={(e) => setEditFormData({ ...editFormData, package_height: parseFloat(e.target.value) || 0 })}
                      className={`w-full px-2 py-1.5 rounded-xl border text-xs outline-none ${
                        isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Largura Caixa (cm)</label>
                    <input
                      type="number"
                      value={editFormData.package_width}
                      onChange={(e) => setEditFormData({ ...editFormData, package_width: parseFloat(e.target.value) || 0 })}
                      className={`w-full px-2 py-1.5 rounded-xl border text-xs outline-none ${
                        isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Profund. Caixa (cm)</label>
                    <input
                      type="number"
                      value={editFormData.package_depth}
                      onChange={(e) => setEditFormData({ ...editFormData, package_depth: parseFloat(e.target.value) || 0 })}
                      className={`w-full px-2 py-1.5 rounded-xl border text-xs outline-none ${
                        isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Peso Bruto (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={editFormData.package_weight}
                      onChange={(e) => setEditFormData({ ...editFormData, package_weight: parseFloat(e.target.value) || 0 })}
                      className={`w-full px-2 py-1.5 rounded-xl border text-xs outline-none ${
                        isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedEqp(null)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-2 transition cursor-pointer shadow-md shadow-amber-500/20"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingEdit ? 'Salvando...' : 'Salvar no Supabase'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: HISTÓRICO DE VENDAS PARA CLIENTES */}
      {salesHistoryEqp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs select-none">
          <div className={`w-full max-w-lg rounded-2xl border shadow-2xl p-6 overflow-hidden ${
            isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div>
                <h3 className="font-black text-base flex items-center gap-2">
                  <History className="w-4 h-4 text-amber-500" />
                  Histórico de Vendas para Clientes
                </h3>
                <p className="text-xs text-slate-400 line-clamp-1">{salesHistoryEqp.name}</p>
              </div>
              <button 
                type="button" 
                onClick={() => setSalesHistoryEqp(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingSales ? (
              <div className="py-8 flex items-center justify-center gap-2 text-xs text-slate-400">
                <RefreshCw className="w-4 h-4 animate-spin text-amber-500" />
                <span>Consultando histórico de pedidos...</span>
              </div>
            ) : salesList.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Nenhuma venda registrada para este produto até o momento.
              </div>
            ) : (
              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                {salesList.map((sale) => (
                  <div 
                    key={sale.id}
                    className={`p-3 rounded-xl border flex flex-col gap-1.5 ${
                      isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-amber-500" />
                        {sale.client_name}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                        {sale.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Doc: {sale.client_document} • {sale.city}</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {sale.date}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/60">
                      <span className="text-slate-400">Qtd: <strong>{sale.quantity}x</strong> ({sale.pricing_type})</span>
                      <strong className="text-emerald-400 font-mono">
                        R$ {Number(sale.total_value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </strong>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setSalesHistoryEqp(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 transition"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifier */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-200">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
