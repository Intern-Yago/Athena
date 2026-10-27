import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './components/LoginPage';
import Topbar from './components/Topbar';
import KanbanBoard from './components/KanbanBoard';
import RadarView from './components/RadarView';
import LeadModal from './components/LeadModal';
import FunnelModal from './components/FunnelModal';
import StageModal from './components/StageModal';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';

function CRMContent() {
  const { user, loading: authLoading, API_BASE_URL, getAuthHeaders } = useAuth();
  
  const [funnels, setFunnels] = useState([]);
  const [activeFunnelId, setActiveFunnelId] = useState('');
  const [leads, setLeads] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [activeView, setActiveView] = useState('kanban'); // 'kanban' | 'radar'
  const [notification, setNotification] = useState(null);

  // Modals state
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [leadTargetStageId, setLeadTargetStageId] = useState('');

  const [isFunnelModalOpen, setIsFunnelModalOpen] = useState(false);
  const [editingFunnel, setEditingFunnel] = useState(null);

  const [isStageModalOpen, setIsStageModalOpen] = useState(false);
  const [editingStage, setEditingStage] = useState(null);

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
        if (data.data.length > 0 && !activeFunnelId) {
          setActiveFunnelId(data.data[0].id);
        }
      }
    } catch (err) {
      console.error('Erro ao carregar funis:', err);
    }
  }, [API_BASE_URL, getAuthHeaders, activeFunnelId]);

  // Carrega Leads do Funil Ativo
  const loadLeads = useCallback(async (funnelId) => {
    if (!funnelId) return;
    try {
      const res = await fetch(`${API_BASE_URL}/crm/leads?funnelId=${funnelId}`, {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setLeads(data.data);
      }
    } catch (err) {
      console.error('Erro ao carregar leads:', err);
    }
  }, [API_BASE_URL, getAuthHeaders]);

  // Initial load
  useEffect(() => {
    if (user) {
      setLoadingData(true);
      loadFunnels().finally(() => setLoadingData(false));
    }
  }, [user, loadFunnels]);

  // When activeFunnelId changes
  useEffect(() => {
    if (activeFunnelId) {
      loadLeads(activeFunnelId);
    }
  }, [activeFunnelId, loadLeads]);

  const activeFunnel = funnels.find(f => f.id === activeFunnelId) || funnels[0];

  // -------------------------------------------------------------
  // HANDLERS: FUNIL
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

      showNotification(editingFunnel ? 'Funil atualizado!' : 'Novo funil criado com sucesso!');
      setIsFunnelModalOpen(false);
      setEditingFunnel(null);
      await loadFunnels();
      if (!editingFunnel && data.data?.id) {
        setActiveFunnelId(data.data.id);
      }
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  const handleDeleteFunnel = async (funnelId) => {
    if (!window.confirm('Tem certeza que deseja excluir este funil e todas as suas etapas e leads?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/crm/funnels/${funnelId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (!res.ok) throw new Error('Falha ao excluir funil.');

      showNotification('Funil excluído.');
      setIsFunnelModalOpen(false);
      setEditingFunnel(null);
      setActiveFunnelId('');
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

      showNotification(editingStage ? 'Coluna atualizada!' : 'Nova coluna criada!');
      setIsStageModalOpen(false);
      setEditingStage(null);
      await loadFunnels();
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  const handleDeleteStage = async (stageId) => {
    if (!window.confirm('Excluir esta coluna? Os leads nela também serão excluídos.')) return;
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
    if (!window.confirm('Deseja excluir este lead?')) return;
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
    // Optimistic UI update
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, stage_id: targetStageId } : l));

    try {
      const res = await fetch(`${API_BASE_URL}/crm/leads/${leadId}/stage`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ stageId: targetStageId })
      });
      if (!res.ok) {
        // Rollback
        loadLeads(activeFunnelId);
      }
    } catch (err) {
      console.error('Erro ao mover lead:', err);
      loadLeads(activeFunnelId);
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

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden font-sans">
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
        funnels={funnels}
        activeFunnelId={activeFunnelId}
        onSelectFunnel={(id) => setActiveFunnelId(id)}
        activeView={activeView}
        onChangeView={(v) => setActiveView(v)}
        onOpenNewFunnelModal={() => {
          setEditingFunnel(null);
          setIsFunnelModalOpen(true);
        }}
      />

      {/* Main View Area */}
      {activeView === 'kanban' ? (
        <KanbanBoard
          funnel={activeFunnel}
          leads={leads}
          onMoveLeadStage={handleMoveLeadStage}
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
        <RadarView />
      )}

      {/* Modals */}
      <LeadModal
        isOpen={isLeadModalOpen}
        onClose={() => {
          setIsLeadModalOpen(false);
          setEditingLead(null);
        }}
        onSave={handleSaveLead}
        onDelete={handleDeleteLead}
        lead={editingLead}
        stages={activeFunnel?.stages || []}
        funnelId={activeFunnelId}
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
        funnelId={activeFunnelId}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CRMContent />
    </AuthProvider>
  );
}
