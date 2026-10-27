import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  MapPin, 
  Search, 
  Filter, 
  RefreshCw, 
  Maximize2, 
  Minimize2, 
  ExternalLink,
  MessageCircle,
  Plus,
  Building2,
  Phone,
  CheckCircle,
  Clock,
  Layers
} from 'lucide-react';

export default function RadarView({ onConvertWorkshopToLead }) {
  const { API_BASE_URL, getAuthHeaders } = useAuth();
  const { isDark } = useTheme();

  const [activeTab, setActiveTab] = useState('map'); // 'map' | 'list'
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const iframeRef = React.useRef(null);

  // Sincroniza tema com o iframe do radar em tempo real
  useEffect(() => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ 
        type: 'THEME_CHANGE', 
        theme: isDark ? 'dark' : 'light' 
      }, '*');
    }
  }, [isDark]);

  // Estados da lista de oficinas via Supabase
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedRa, setSelectedRa] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [stats, setStats] = useState({ total: 9211, byRa: [] });

  const loadWorkshops = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '30',
        search: search.trim(),
        ra: selectedRa
      });

      const res = await fetch(`${API_BASE_URL}/crm/workshops?${params.toString()}`, {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (data.success) {
        setWorkshops(data.workshops || []);
        setTotalPages(data.totalPages || 1);
        setTotalCount(data.total || 0);
      }
    } catch (err) {
      console.error('Erro ao consultar oficinas no Supabase:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/crm/workshops/stats`, {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (data.success) {
        setStats({ total: data.total, byRa: data.byRa || [] });
      }
    } catch (err) {
      console.error('Erro ao carregar estatísticas do radar:', err);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'list') {
      loadWorkshops();
    }
  }, [activeTab, page, selectedRa]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadWorkshops();
  };

  const handleOpenWhatsApp = (workshop) => {
    if (!workshop.telefone_principal) return;
    const cleanPhone = workshop.telefone_principal.replace(/\D/g, '');
    const phoneWithCountry = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
    const msg = `Olá! Sou da equipe Athena Soluções Automotivas. Gostaria de falar com o responsável pela ${workshop.nome_fantasia || 'oficina'}.`;
    const url = `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className={`flex-1 flex flex-col min-h-0 select-none ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    } ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Top Header do Radar */}
      <div className={`px-4 sm:px-6 py-3 border-b flex flex-wrap items-center justify-between gap-3 shrink-0 ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className={`font-black text-sm sm:text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Radar de Expansão DF
            </span>
          </div>

          {/* Toggle entre Mapa Visual e Lista Supabase */}
          <div className={`flex items-center p-1 rounded-xl border ${
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
          }`}>
            <button
              type="button"
              onClick={() => setActiveTab('map')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'map'
                  ? 'bg-emerald-500 text-slate-950 font-black shadow-xs'
                  : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              Mapa Interativo
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('list')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'list'
                  ? 'bg-emerald-500 text-slate-950 font-black shadow-xs'
                  : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              Lista Supabase ({stats.total || 9212})
            </button>
          </div>
        </div>

        {/* Controles de Ação */}
        <div className="flex items-center gap-2">
          {activeTab === 'map' && (
            <>
              <button
                type="button"
                onClick={() => setIframeKey(k => k + 1)}
                className={`p-1.5 rounded-xl border text-xs flex items-center gap-1.5 transition cursor-pointer ${
                  isDark 
                    ? 'bg-slate-950 text-slate-400 hover:text-white border-slate-800' 
                    : 'bg-slate-100 text-slate-700 hover:text-slate-900 border-slate-200'
                }`}
                title="Recarregar Mapa"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Recarregar</span>
              </button>

              <button
                type="button"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className={`p-1.5 rounded-xl border text-xs flex items-center gap-1.5 transition cursor-pointer ${
                  isDark 
                    ? 'bg-slate-950 text-slate-400 hover:text-white border-slate-800' 
                    : 'bg-slate-100 text-slate-700 hover:text-slate-900 border-slate-200'
                }`}
                title={isFullscreen ? "Sair da Tela Cheia" : "Tela Cheia"}
              >
                {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{isFullscreen ? "Minimizar" : "Tela Cheia"}</span>
              </button>

              <a
                href="/radar.html"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500 text-emerald-500 hover:text-slate-950 font-bold text-xs flex items-center gap-1.5 transition"
                title="Abrir em Nova Aba"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Abrir em Nova Aba</span>
              </a>
            </>
          )}
        </div>
      </div>

      {/* Conteúdo: Mapa Visual vs Lista */}
      {activeTab === 'map' ? (
        <div className={`flex-1 w-full h-full relative overflow-hidden ${
          isDark ? 'bg-slate-950' : 'bg-slate-100'
        }`}>
          <iframe
            ref={iframeRef}
            key={`${iframeKey}-${isDark ? 'dark' : 'light'}`}
            src={`/radar.html?theme=${isDark ? 'dark' : 'light'}`}
            title="Radar de Expansão de Oficinas DF"
            className="w-full h-full border-0 absolute inset-0"
            loading="lazy"
          />
        </div>
      ) : (
        /* Lista de Oficinas com dados do Supabase */
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Barra de Filtros da Lista */}
          <div className={`p-4 border-b flex flex-wrap items-center justify-between gap-3 shrink-0 ${
            isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 flex-1 min-w-[240px] max-w-lg">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Pesquisar por nome, CNPJ, telefone ou endereço..."
                  className={`w-full rounded-xl pl-9 pr-3 py-1.5 text-xs focus:outline-none border transition-colors ${
                    isDark 
                      ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus:border-emerald-500' 
                      : 'bg-slate-100 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-500'
                  }`}
                />
              </div>

              <button
                type="submit"
                className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs cursor-pointer transition"
              >
                Buscar
              </button>
            </form>

            <div className="flex items-center gap-2">
              <select
                value={selectedRa}
                onChange={(e) => {
                  setSelectedRa(e.target.value);
                  setPage(1);
                }}
                className={`rounded-xl px-3 py-1.5 text-xs focus:outline-none cursor-pointer border ${
                  isDark 
                    ? 'bg-slate-950 border-slate-800 text-slate-300 focus:border-emerald-500' 
                    : 'bg-slate-100 border-slate-200 text-slate-700 focus:border-emerald-500'
                }`}
              >
                <option value="all">Todas as Regiões ({stats.total})</option>
                {stats.byRa.map(item => (
                  <option key={item.ra} value={item.ra}>
                    {item.ra} ({item.total})
                  </option>
                ))}
              </select>

              <span className="text-xs font-mono text-slate-400 font-bold">
                {totalCount} encontradas
              </span>
            </div>
          </div>

          {/* Tabela / Cards de Oficinas */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
            {workshops.map(workshop => (
              <div
                key={workshop.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs ${
                  isDark 
                    ? 'bg-slate-900/70 border-slate-800 hover:border-emerald-500/50' 
                    : 'bg-white border-slate-200 hover:border-emerald-500'
                }`}
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className={`font-black text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {workshop.nome_fantasia || workshop.razao_social}
                    </h3>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-500 font-bold text-[10px]">
                      {workshop.regiao_administrativa}
                    </span>
                    <span className={`text-[10px] font-mono ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      CNPJ: {workshop.cnpj || 'Não inf.'}
                    </span>
                  </div>

                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'} line-clamp-1`}>
                    {workshop.endereco_completo || 'Endereço não cadastrado'}
                  </p>

                  <div className="flex items-center gap-3 text-xs text-slate-400 pt-1">
                    {workshop.telefone_principal && (
                      <span className="flex items-center gap-1 font-mono text-amber-500 font-bold">
                        <Phone className="w-3 h-3" />
                        <span>{workshop.telefone_principal}</span>
                      </span>
                    )}
                    {workshop.categoria && (
                      <span>• Categoria: {workshop.categoria}</span>
                    )}
                  </div>
                </div>

                {/* Ações da Oficina */}
                <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/40">
                  {workshop.telefone_principal && (
                    <button
                      type="button"
                      onClick={() => handleOpenWhatsApp(workshop)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500 text-emerald-500 hover:text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                      title="Chamar no WhatsApp"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => onConvertWorkshopToLead && onConvertWorkshopToLead(workshop)}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition cursor-pointer"
                    title="Adicionar esta oficina como um Card de Lead no Funil de Vendas"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Enviar para o Funil</span>
                  </button>
                </div>
              </div>
            ))}

            {workshops.length === 0 && !loading && (
              <div className="py-12 text-center text-slate-400 text-xs">
                Nenhuma oficina encontrada com os filtros selecionados.
              </div>
            )}
          </div>

          {/* Paginação */}
          {totalPages > 1 && (
            <div className={`p-3 border-t flex items-center justify-between text-xs shrink-0 ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-3 py-1 rounded-lg border border-slate-700 disabled:opacity-40 cursor-pointer"
              >
                Anterior
              </button>
              <span className="text-slate-400">
                Página {page} de {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className="px-3 py-1 rounded-lg border border-slate-700 disabled:opacity-40 cursor-pointer"
              >
                Próxima
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
