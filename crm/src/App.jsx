import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import LoginPage from './components/LoginPage';
import Topbar from './components/Topbar';
import SidebarDrawer from './components/SidebarDrawer';
import HomeDashboard from './components/HomeDashboard';
import FunnelsListPage from './components/FunnelsListPage';
import KanbanBoard from './components/KanbanBoard';
import RadarView from './components/RadarView';
import LeadModal from './components/LeadModal';
import FunnelModal from './components/FunnelModal';
import StageModal from './components/StageModal';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';

function CRMContent() {
  const { user, loading: authLoading, API_BASE_URL, getAuthHeaders } = useAuth();
  const { isDark } = useTheme();

  // Rotas: '/' | '/funil' | '/funil?id=...' | '/radar'
  const [currentPath, setCurrentPath] = useState(() => {
    return window.location.pathname + window.location.search || '/';
  });

  const [funnels, setFunnels] = useState([]);
  const [activeFunnelId, setActiveFunnelId] = useState('');
  const [leads, setLeads] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [notification, setNotification] = useState(null);

  // Modais
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [leadTargetStageId, setLeadTargetStageId] = useState('');

  const [isFunnelModalOpen, setIsFunnelModalOpen] = useState(false);
  const [editingFunnel, setEditingFunnel] = useState(null);

  const [isStageModalOpen, setIsStageModalOpen] = useState(false);
  const [editingStage, setEditingStage] = useState(null);

  // Sincroniza rota com URL do navegador
  const navigateTo = (path) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname + window.location.search);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Extrai id do funil da URL (ex: /funil?id=fun_123)
  useEffect(() => {
    if (currentPath.startsWith('/funil')) {
      const params = new URLSearchParams(window.location.search);
      const urlId = params.get('id');
      if (urlId) {
        setActiveFunnelId(urlId);
      } else {
        setActiveFunnelId('');
      }
    }
  }, [currentPath]);

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Carrega Funis
  const loadFunnels = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/crm/funnels`, {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setFunnels(data.data);
      }
    } catch (err) {
      console.error('Erro ao carregar funis:', err);
    }
  }, [API_BASE_URL, getAuthHeaders]);

  // Carrega Todos os Leads ou Leads do Funil Ativo
  const loadLeads = useCallback(async (funnelId = '') => {
    try {
      const url = funnelId 
        ? `${API_BASE_URL}/crm/leads?funnelId=${funnelId}` 
        : `${API_BASE_URL}/crm/leads`;
      const res = await fetch(url, { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setLeads(data.data);
      }
    } catch (err) {
      console.error('Erro ao carregar leads:', err);
    }
  }, [API_BASE_URL, getAuthHeaders]);

  useEffect(() => {
    if (user) {
      setLoadingData(true);
      loadFunnels()
        .then(() => loadLeads(activeFunnelId))
        .finally(() => setLoadingData(false));
    }
  }, [user, loadFunnels, activeFunnelId, loadLeads]);

  const activeFunnel = funnels.find(f => f.id === activeFunnelId) || null;

  // -------------------------------------------------------------
  // HANDLERS: FUNIS
  // -------------------------------------------------------------
  const handleSaveFunnel = async (formData) => {
    try {
      const url = editingFunnel 
        ? `${API_BASE_URL}/crm/funnels/${editingFunnel.id}`
        : `${API_BASE_URL}/crm/funnels`;
      const method = editingFunnel ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (!res.ok || !data.success) throw new Error(data.error || 'Falha ao salvar funil.');

      showNotification(editingFunnel ? 'Funil atualizado!' : 'Novo funil criado!');
      setIsFunnelModalOpen(false);
      setEditingFunnel(null);
      await loadFunnels();

      if (!editingFunnel && data.data?.id) {
        navigateTo(`/funil?id=${data.data.id}`);
      }
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  const handleDeleteFunnel = async (funnelId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/crm/funnels/${funnelId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (!res.ok) throw new Error('Falha ao excluir funil.');

      showNotification('Funil excluído com sucesso.');
      setIsFunnelModalOpen(false);
      setEditingFunnel(null);
      navigateTo('/funil');
      await loadFunnels();
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  // -------------------------------------------------------------
  // HANDLERS: ETAPAS
  // -------------------------------------------------------------
  const handleSaveStage = async (formData) => {
    try {
      const url = editingStage
        ? `${API_BASE_URL}/crm/stages/${editingStage.id}`
        : `${API_BASE_URL}/crm/funnels/${activeFunnelId}/stages`;
      const method = editingStage ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (!res.ok || !data.success) throw new Error(data.error || 'Falha ao salvar etapa.');

      // Se informou targetOrder e temos as etapas carregadas, reordena
      if (formData.targetOrder !== undefined && activeFunnel) {
        const currentStages = [...(activeFunnel.stages || [])];
        const savedId = editingStage?.id || data.data?.id;
        const filtered = currentStages.filter(s => s.id !== savedId);
        filtered.splice(formData.targetOrder, 0, { id: savedId });
        const newOrderIds = filtered.map(s => s.id);

        await fetch(`${API_BASE_URL}/crm/stages/reorder`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify({ funnelId: activeFunnelId, stageIds: newOrderIds })
        });
      }

      showNotification(editingStage ? 'Coluna atualizada!' : 'Nova coluna criada!');
      setIsStageModalOpen(false);
      setEditingStage(null);
      await loadFunnels();
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  const handleReorderStages = async (reorderedStageIds) => {
    try {
      // Atualização otimista no estado local
      setFunnels(prev => prev.map(f => {
        if (f.id === activeFunnelId) {
          const stageMap = new Map((f.stages || []).map(s => [s.id, s]));
          const newStages = reorderedStageIds.map((id, idx) => ({ ...stageMap.get(id), order: idx }));
          return { ...f, stages: newStages };
        }
        return f;
      }));

      await fetch(`${API_BASE_URL}/crm/stages/reorder`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ funnelId: activeFunnelId, stageIds: reorderedStageIds })
      });
    } catch (err) {
      console.warn('Erro ao salvar reordenação de colunas:', err.message);
      await loadFunnels();
    }
  };

  const handleDeleteStage = async (stageId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/crm/stages/${stageId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (!res.ok) throw new Error('Falha ao excluir etapa.');

      showNotification('Coluna excluída.');
      setIsStageModalOpen(false);
      setEditingStage(null);
      await loadFunnels();
      await loadLeads(activeFunnelId);
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  // -------------------------------------------------------------
  // HANDLERS: LEADS
  // -------------------------------------------------------------
  const handleSaveLead = async (formData) => {
    try {
      const url = editingLead
        ? `${API_BASE_URL}/crm/leads/${editingLead.id}`
        : `${API_BASE_URL}/crm/leads`;
      const method = editingLead ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (!res.ok || !data.success) throw new Error(data.error || 'Falha ao salvar lead.');

      showNotification(editingLead ? 'Lead atualizado!' : 'Lead adicionado ao funil!');
      setIsLeadModalOpen(false);
      setEditingLead(null);
      await loadLeads(activeFunnelId);
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  const handleDeleteLead = async (leadId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/crm/leads/${leadId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (!res.ok) throw new Error('Falha ao excluir lead.');

      showNotification('Lead excluído.');
      setIsLeadModalOpen(false);
      setEditingLead(null);
      await loadLeads(activeFunnelId);
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  const handleMoveLeadStage = async (leadId, targetStageId) => {
    // Optimistic update
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, stage_id: targetStageId } : l));

    try {
      const res = await fetch(`${API_BASE_URL}/crm/leads/${leadId}/stage`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ stageId: targetStageId })
      });
      if (!res.ok) {
        loadLeads(activeFunnelId);
      }
    } catch (err) {
      console.error('Erro ao mover lead:', err);
      loadLeads(activeFunnelId);
    }
  };

  // Conversão de oficina do Radar direto para lead do funil
  const handleConvertWorkshopToLead = (workshop) => {
    const targetFunnel = activeFunnel || funnels[0];
    const defaultStageId = targetFunnel?.stages?.[0]?.id || '';

    setEditingLead({
      name: workshop.nome_fantasia || workshop.razao_social,
      company: workshop.razao_social || workshop.nome_fantasia,
      phone: workshop.telefone_principal || workshop.telefone_secundario || '',
      email: workshop.email || '',
      address: workshop.endereco_completo || '',
      ra_df: workshop.regiao_administrativa || 'Taguatinga',
      notes: `Origem: Radar DF • Categoria: ${workshop.categoria || 'Mecânica'} • CNPJ: ${workshop.cnpj || ''}`,
      stage_id: defaultStageId,
      funnel_id: targetFunnel?.id
    });
    setIsLeadModalOpen(true);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-amber-500">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  // Define título do Header de acordo com a tela
  const getHeaderTitle = () => {
    if (currentPath === '/') return 'Painel de Controle';
    if (currentPath === '/radar') return 'Radar de Expansão DF';
    if (currentPath.startsWith('/funil') && activeFunnel) return activeFunnel.name;
    if (currentPath.startsWith('/funil')) return 'Funis de Vendas';
    return 'Athena CRM';
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors overflow-hidden font-sans ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* Toast Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold border transition-all animate-in fade-in slide-in-from-top-4 ${
          notification.type === 'error'
            ? 'bg-red-950/90 border-red-500 text-red-200'
            : 'bg-emerald-950/90 border-emerald-500 text-emerald-200'
        }`}>
          {notification.type === 'error' ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle className="w-4 h-4 shrink-0" />}
          <span>{notification.msg}</span>
        </div>
      )}

      {/* Top Header */}
      <Topbar
        onOpenMenu={() => setIsMenuOpen(true)}
        currentRoute={currentPath}
        pageTitle={getHeaderTitle()}
        onBack={
          currentPath.startsWith('/funil') && activeFunnelId
            ? () => navigateTo('/funil')
            : currentPath !== '/'
            ? () => navigateTo('/')
            : null
        }
      />

      {/* Menu Lateral Retrátil (Overlay por cima da tela sem empurrar) */}
      <SidebarDrawer
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        currentRoute={currentPath}
        onNavigate={navigateTo}
      />

      {/* Roteador Visual Principal */}
      {currentPath === '/' ? (
        <HomeDashboard
          funnels={funnels}
          leads={leads}
          onNavigate={navigateTo}
        />
      ) : currentPath === '/radar' ? (
        <RadarView
          onConvertWorkshopToLead={handleConvertWorkshopToLead}
        />
      ) : currentPath.startsWith('/funil') && activeFunnel ? (
        <KanbanBoard
          funnel={activeFunnel}
          leads={leads}
          onMoveLeadStage={handleMoveLeadStage}
          onReorderStages={handleReorderStages}
          onBackToFunnels={() => navigateTo('/funil')}
          onOpenLeadModal={(lead) => {
            setEditingLead(lead);
            setIsLeadModalOpen(true);
          }}
          onOpenStageModal={(stage) => {
            setEditingStage(stage);
            setIsStageModalOpen(true);
          }}
          onOpenNewStageModal={() => {
            setEditingStage(null);
            setIsStageModalOpen(true);
          }}
          onOpenNewLeadModal={(stageId) => {
            setEditingLead(null);
            setLeadTargetStageId(stageId || '');
            setIsLeadModalOpen(true);
          }}
        />
      ) : (
        /* /funil (Lista com todos os funis) */
        <FunnelsListPage
          funnels={funnels}
          leads={leads}
          onSelectFunnel={(id) => navigateTo(`/funil?id=${id}`)}
          onOpenNewFunnelModal={() => {
            setEditingFunnel(null);
            setIsFunnelModalOpen(true);
          }}
          onOpenEditFunnelModal={(f) => {
            setEditingFunnel(f);
            setIsFunnelModalOpen(true);
          }}
        />
      )}

      {/* Modais Compartilhados */}
      <LeadModal
        isOpen={isLeadModalOpen}
        onClose={() => {
          setIsLeadModalOpen(false);
          setEditingLead(null);
        }}
        onSave={handleSaveLead}
        onDelete={handleDeleteLead}
        lead={editingLead}
        stages={activeFunnel?.stages || funnels[0]?.stages || []}
        funnelId={activeFunnelId || funnels[0]?.id || ''}
      />

      <FunnelModal
        isOpen={isFunnelModalOpen}
        onClose={() => {
          setIsFunnelModalOpen(false);
          setEditingFunnel(null);
        }}
        onSave={handleSaveFunnel}
        onDelete={handleDeleteFunnel}
        funnel={editingFunnel}
      />

      <StageModal
        isOpen={isStageModalOpen}
        onClose={() => {
          setIsStageModalOpen(false);
          setEditingStage(null);
        }}
        onSave={handleSaveStage}
        onDelete={handleDeleteStage}
        stage={editingStage}
        allStages={activeFunnel?.stages || []}
        funnelId={activeFunnelId}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CRMContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
