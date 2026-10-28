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
import CustomersView from './components/CustomersView';
import EquipmentsView from './components/EquipmentsView';
import AgendaView from './components/AgendaView';
import LeadModal from './components/LeadModal';
import FunnelModal from './components/FunnelModal';
import StageModal from './components/StageModal';
import TeamManagementView from './components/TeamManagementView';
import CreateEmployeeModal from './components/CreateEmployeeModal';
import AccountSettingsModal from './components/AccountSettingsModal';
import ForceChangePasswordModal from './components/ForceChangePasswordModal';
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

  // Modais de Equipe e Configurações de Conta
  const [isCreateEmployeeOpen, setIsCreateEmployeeOpen] = useState(false);
  const [isAccountSettingsOpen, setIsAccountSettingsOpen] = useState(false);

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
    // Se for um card do radar_workshops.json ainda sem ID no banco
    if (String(leadId).startsWith('radar_lead_')) {
      const workshopId = Number(leadId.replace('radar_lead_', ''));
      let radarStatus = 'Não Visitado';
      if (targetStageId === 'stg_exp_1') radarStatus = 'Não Visitado';
      else if (targetStageId === 'stg_exp_2') radarStatus = 'Visita Agendada';
      else if (targetStageId === 'stg_exp_3') radarStatus = 'Visitado';
      else if (targetStageId === 'stg_exp_4') radarStatus = 'Negociação';
      else if (targetStageId === 'stg_exp_5') radarStatus = 'Cliente Athena';

      try {
        const stored = localStorage.getItem('athena_edicoes_v3');
        const edicoes = stored ? JSON.parse(stored) : {};
        if (!edicoes[workshopId]) edicoes[workshopId] = {};
        edicoes[workshopId].st = radarStatus;
        localStorage.setItem('athena_edicoes_v3', JSON.stringify(edicoes));
      } catch (_) {}

      document.querySelectorAll('iframe').forEach(ifr => {
        try {
          ifr.contentWindow?.postMessage({
            type: 'SYNC_LEAD_TO_RADAR',
            workshopId,
            status: radarStatus
          }, '*');
        } catch (_) {}
      });

      await handleConvertWorkshopToLead({ id: workshopId, st: radarStatus });
      return;
    }

    // Optimistic update
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, stage_id: targetStageId } : l));

    // Sincronização automática com o Radar de Expansão DF se o lead pertencer ao funil de expansão
    const movedLead = leads.find(l => l.id === leadId);
    const isExpansao = movedLead && (movedLead.funnel_id === 'fun_expansao_df' || activeFunnelId === 'fun_expansao_df');
    if (isExpansao) {
      let radarStatus = 'Não Visitado';
      if (targetStageId === 'stg_exp_1') radarStatus = 'Não Visitado';
      else if (targetStageId === 'stg_exp_2') radarStatus = 'Visita Agendada';
      else if (targetStageId === 'stg_exp_3') radarStatus = 'Visitado';
      else if (targetStageId === 'stg_exp_4') radarStatus = 'Visitado';
      else if (targetStageId === 'stg_exp_5') radarStatus = 'Cliente Athena';

      // Identifica ID da oficina no Radar
      let workshopId = null;
      const match = movedLead.notes?.match(/\[Radar ID:\s*(\d+)\]/);
      if (match) workshopId = match[1];

      // Atualiza localStorage compartilhado entre CRM e radar.html
      try {
        const stored = localStorage.getItem('athena_edicoes_v3');
        const edicoes = stored ? JSON.parse(stored) : {};
        if (workshopId) {
          if (!edicoes[workshopId]) edicoes[workshopId] = {};
          edicoes[workshopId].st = radarStatus;
        }
        localStorage.setItem('athena_edicoes_v3', JSON.stringify(edicoes));
      } catch (e) {
        console.error('Erro ao sincronizar localStorage com radar:', e);
      }

      // Envia notificação em tempo real caso o iframe do radar esteja montado
      const iframes = document.querySelectorAll('iframe');
      iframes.forEach(ifr => {
        try {
          ifr.contentWindow?.postMessage({
            type: 'SYNC_LEAD_TO_RADAR',
            workshopId,
            cnpj: movedLead.cnpj,
            name: movedLead.name,
            status: radarStatus
          }, '*');
        } catch (_) {}
      });
    }

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

  // Sincronização bidirecional: Oficina do Radar de Expansão -> Lead do Funil de Expansão DF
  const handleConvertWorkshopToLead = async (workshop) => {
    // Mapeia status do Radar para estágio correspondente no Funil de Expansão DF
    let targetStageId = 'stg_exp_1';
    if (workshop.st === 'Visita Agendada' || workshop.st === 'Agendado') targetStageId = 'stg_exp_2';
    else if (workshop.st === 'Visitado' || workshop.st === 'Já Visitado' || workshop.st === 'Visita Realizada') targetStageId = 'stg_exp_3';
    else if (workshop.st === 'Negociação') targetStageId = 'stg_exp_4';
    else if (workshop.st === 'Cliente Athena' || workshop.st === 'Parceria Fechada') targetStageId = 'stg_exp_5';

    // Procura se já existe lead correspondente a esta oficina no CRM
    const existingLead = leads.find(l => 
      (l.funnel_id === 'fun_expansao_df') &&
      ((workshop.id && l.notes?.includes(`[Radar ID: ${workshop.id}]`)) ||
       (workshop.cnpj && l.cnpj && l.cnpj.replace(/\D/g, '') === String(workshop.cnpj).replace(/\D/g, '')) ||
       (l.name && workshop.nome && l.name.trim().toLowerCase() === workshop.nome.trim().toLowerCase()))
    );

    if (existingLead) {
      // Se já existe e mudou de estágio, move o lead
      if (existingLead.stage_id !== targetStageId) {
        await handleMoveLeadStage(existingLead.id, targetStageId);
        showNotification(`Lead "${workshop.nome}" atualizado para o estágio correspondente no Funil.`);
      }
    } else {
      // Cria o lead automaticamente na etapa correta do Funil de Expansão DF
      try {
        const leadPayload = {
          name: workshop.nome || 'Oficina DF',
          company: workshop.rz || workshop.nome,
          cnpj: workshop.cnpj || '',
          phone: workshop.tel || '',
          email: '',
          address: workshop.end || '',
          ra_df: workshop.ra || 'DF',
          value: 0,
          notes: `Oficina sincronizada via Radar de Expansão DF • Categoria: ${workshop.cat || 'Mecânica Geral'} [Radar ID: ${workshop.id}]`,
          funnel_id: 'fun_expansao_df',
          stage_id: targetStageId
        };

        const res = await fetch(`${API_BASE_URL}/crm/leads`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(leadPayload)
        });
        const data = await res.json();
        if (data.success && data.data) {
          setLeads(prev => [data.data, ...prev]);
          showNotification(`Oficina "${workshop.nome}" sincronizada no Funil de Expansão!`);
        }
      } catch (err) {
        console.error('Erro ao sincronizar oficina para o funil de expansão:', err);
      }
    }
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
    if (currentPath === '/equipe') return 'Equipe Comercial & Acessos';
    if (currentPath === '/configuracoes') return 'Minha Conta & Segurança';
    if (currentPath.startsWith('/funil') && activeFunnel) return activeFunnel.name;
    if (currentPath.startsWith('/funil')) return 'Funis de Vendas';
    return 'Athena CRM';
  };

  return (
    <div className={`h-screen max-h-screen flex flex-col transition-colors overflow-hidden font-sans ${
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
        onOpenAccountSettings={() => setIsAccountSettingsOpen(true)}
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
        onOpenAccountSettings={() => setIsAccountSettingsOpen(true)}
      />

      {/* Roteador Visual Principal com Altura Fixada (Sem rolagem vertical da página inteira) */}
      <main className="flex-1 min-h-0 flex flex-col overflow-hidden">
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
        ) : currentPath === '/clientes' ? (
          <CustomersView />
        ) : currentPath === '/equipamentos' ? (
          <EquipmentsView />
        ) : currentPath === '/agenda' ? (
          <AgendaView />
        ) : currentPath === '/equipe' ? (
          <TeamManagementView
            onOpenCreateModal={() => setIsCreateEmployeeOpen(true)}
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
      </main>

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

      {/* Modal de Cadastro de Novo Funcionário (com olho para ver a senha digitada) */}
      <CreateEmployeeModal
        isOpen={isCreateEmployeeOpen}
        onClose={() => setIsCreateEmployeeOpen(false)}
        onSaved={() => {
          showNotification('Novo funcionário cadastrado com sucesso!');
        }}
      />

      {/* Modal de Configuração da Conta & Troca de Senha */}
      <AccountSettingsModal
        isOpen={isAccountSettingsOpen}
        onClose={() => setIsAccountSettingsOpen(false)}
      />

      {/* Modal Obrigatório para Usuário com Senha Inicial / Temporária */}
      <ForceChangePasswordModal
        isOpen={Boolean(user?.mustChangePassword)}
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
