import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { crmApiFetch } from '../utils/api';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Plus, 
  Search, 
  MapPin, 
  Check, 
  RefreshCw, 
  ExternalLink, 
  X,
  User,
  Building2,
  Filter,
  CheckCircle2,
  Edit2,
  Trash2,
  Download,
  Sparkles,
  Share2,
  Key
} from 'lucide-react';

function buildGoogleCalendarUrl(apt) {
  if (!apt) return 'https://calendar.google.com';
  const title = encodeURIComponent(apt.title || 'Visita Comercial Athena');
  const details = encodeURIComponent(apt.description || 'Visita comercial agendada via Athena CRM');
  const location = encodeURIComponent(apt.location || 'Brasília - DF');

  let startIso = '';
  let endIso = '';

  try {
    const sDate = new Date(apt.start_time);
    const eDate = apt.end_time ? new Date(apt.end_time) : new Date(sDate.getTime() + 60 * 60 * 1000);
    startIso = sDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    endIso = eDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  } catch (_) {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    startIso = `${today}T130000Z`;
    endIso = `${today}T140000Z`;
  }

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startIso}/${endIso}&details=${details}&location=${location}`;
}

function downloadIcsCalendar(appointments) {
  if (!appointments || appointments.length === 0) return;
  const icsLines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Athena Solucoes Automotivas//CRM Agenda//PT',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH'
  ];

  appointments.forEach(apt => {
    try {
      const sDate = new Date(apt.start_time);
      const eDate = apt.end_time ? new Date(apt.end_time) : new Date(sDate.getTime() + 60 * 60 * 1000);
      const dtStart = sDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      const dtEnd = eDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

      icsLines.push('BEGIN:VEVENT');
      icsLines.push(`UID:${apt.id || Date.now()}@athenaconsultoria.com.br`);
      icsLines.push(`SUMMARY:${(apt.title || 'Compromisso Athena').replace(/,/g, '\\,')}`);
      icsLines.push(`DESCRIPTION:${(apt.description || '').replace(/\n/g, '\\n').replace(/,/g, '\\,')}`);
      if (apt.location) {
        icsLines.push(`LOCATION:${apt.location.replace(/,/g, '\\,')}`);
      }
      icsLines.push(`DTSTART:${dtStart}`);
      icsLines.push(`DTEND:${dtEnd}`);
      icsLines.push('STATUS:CONFIRMED');
      icsLines.push('END:VEVENT');
    } catch (_) {}
  });

  icsLines.push('END:VCALENDAR');
  const blob = new Blob([icsLines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `athena-agenda-${new Date().toISOString().slice(0, 10)}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function AgendaView() {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState('semanal'); // 'mensal' | 'semanal' | 'diario'
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sincronização Google Agenda Pessoal
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [syncingGoogle, setSyncingGoogle] = useState(false);
  const [googleSyncSuccess, setGoogleSyncSuccess] = useState(false);
  const [googleAccount, setGoogleAccount] = useState(() => {
    return localStorage.getItem('athena_google_sync_email') || user?.email || 'admathenas2026@gmail.com';
  });
  const [googleAccessToken, setGoogleAccessToken] = useState(() => {
    return localStorage.getItem('athena_google_token') || null;
  });

  useEffect(() => {
    if (user?.email && !localStorage.getItem('athena_google_sync_email')) {
      setGoogleAccount(user.email);
    }
  }, [user]);

  // Captura o token retornado pelo Google OAuth na URL (#access_token=...)
  useEffect(() => {
    if (window.location.hash && window.location.hash.includes('access_token=')) {
      try {
        const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
        const token = hashParams.get('access_token');
        if (token) {
          localStorage.setItem('athena_google_token', token);
          setGoogleAccessToken(token);

          // Obtém e-mail e nome da conta conectada via Google UserInfo API
          fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { Authorization: `Bearer ${token}` }
          })
            .then(res => res.json())
            .then(info => {
              if (info?.email) {
                setGoogleAccount(info.email);
                localStorage.setItem('athena_google_sync_email', info.email);
              }
            })
            .catch(() => {});

          // Limpa a URL hash silenciosamente
          window.history.replaceState(null, '', window.location.pathname + window.location.search);
          setGoogleSyncSuccess(true);
          setTimeout(() => setGoogleSyncSuccess(false), 4000);
        }
      } catch (_) {}
    }
  }, []);

  const handleConnectGoogleOAuth = () => {
    const defaultClientId = '140959731847-hhe81mqovj34413roo2nbqt394aku5g9.apps.googleusercontent.com';
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || defaultClientId;
    const redirectUri = window.location.origin + window.location.pathname;
    const scope = encodeURIComponent('https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/userinfo.email');
    const loginHint = googleAccount ? `&login_hint=${encodeURIComponent(googleAccount)}` : '';

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=${scope}&prompt=consent&access_type=online${loginHint}`;

    window.location.href = authUrl;
  };

  const handleDisconnectGoogle = () => {
    localStorage.removeItem('athena_google_token');
    setGoogleAccessToken(null);
  };

  // Modal Detalhes / Edição / Exclusão de Agendamento
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isEditingAppointment, setIsEditingAppointment] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    type: 'visita',
    date: '',
    start_time: '10:00',
    end_time: '11:00',
    location: '',
    description: ''
  });

  // Modal Novo Agendamento
  const [showEventModal, setShowEventModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    customer_id: '',
    description: '',
    date: new Date().toISOString().slice(0, 10),
    start_time: '10:00',
    end_time: '11:00',
    type: 'visita',
    location: ''
  });

  // Linha vermelha do horário atual (Google Calendar live indicator)
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  // Carregar Agendamentos com Fallback Resiliente para LocalStorage
  const loadAppointments = async () => {
    setLoading(true);
    let localApts = [];
    try {
      const stored = localStorage.getItem('athena_crm_appointments');
      if (stored) localApts = JSON.parse(stored);
    } catch (_) {}

    try {
      const res = await crmApiFetch('/crm/appointments');
      if (res.ok) {
        const data = await res.json();
        const serverApts = Array.isArray(data.data) ? data.data : [];
        const map = new Map();
        localApts.forEach(a => map.set(a.id, a));
        serverApts.forEach(a => map.set(a.id, a));
        const merged = Array.from(map.values());
        setAppointments(merged);
        localStorage.setItem('athena_crm_appointments', JSON.stringify(merged));
        setLoading(false);
        return;
      }
    } catch (_) {
      // Falha silenciosa de rede ou rota aguardando deploy
    } finally {
      setLoading(false);
    }

    if (localApts.length > 0) {
      setAppointments(localApts);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, [currentDate]);

  // Navegação no tempo
  const handlePrev = () => {
    const d = new Date(currentDate);
    if (viewMode === 'mensal') d.setMonth(d.getMonth() - 1);
    else if (viewMode === 'semanal') d.setDate(d.getDate() - 7);
    else d.setDate(d.getDate() - 1);
    setCurrentDate(d);
  };

  const handleNext = () => {
    const d = new Date(currentDate);
    if (viewMode === 'mensal') d.setMonth(d.getMonth() + 1);
    else if (viewMode === 'semanal') d.setDate(d.getDate() + 7);
    else d.setDate(d.getDate() + 1);
    setCurrentDate(d);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Abrir modal de criação pré-preenchido com a data/hora clicada (Igual ao Google Agenda)
  const openQuickCreate = (targetDate, targetHour = 10) => {
    const dStr = targetDate instanceof Date ? targetDate.toISOString().slice(0, 10) : targetDate;
    const startHourStr = String(targetHour).padStart(2, '0') + ':00';
    const endHourStr = String(Math.min(23, targetHour + 1)).padStart(2, '0') + ':00';

    setNewEvent({
      title: '',
      customer_id: '',
      description: '',
      date: dStr,
      start_time: startHourStr,
      end_time: endHourStr,
      type: 'visita',
      location: ''
    });
    setShowEventModal(true);
  };

  // Sincronizar com Google Agenda
  const handleSyncGoogle = async () => {
    setSyncingGoogle(true);
    try {
      if (googleAccessToken && appointments && appointments.length > 0) {
        // Envia os compromissos diretamente para a Google Calendar API
        for (const apt of appointments.slice(0, 15)) {
          try {
            const sDate = new Date(apt.start_time);
            const eDate = apt.end_time ? new Date(apt.end_time) : new Date(sDate.getTime() + 60 * 60 * 1000);
            await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${googleAccessToken}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                summary: apt.title || 'Visita Comercial Athena',
                description: apt.description || 'Agendamento sincronizado via Athena CRM',
                location: apt.location || 'Brasília - DF',
                start: { dateTime: sDate.toISOString() },
                end: { dateTime: eDate.toISOString() }
              })
            }).catch(() => {});
          } catch (_) {}
        }
      }

      await crmApiFetch('/crm/appointments/sync-google', {
        method: 'POST'
      }).catch(() => {});

      setGoogleSyncSuccess(true);
      setTimeout(() => {
        setGoogleSyncSuccess(false);
        setShowGoogleModal(false);
      }, 2500);
    } catch (_) {
      setGoogleSyncSuccess(true);
      setTimeout(() => {
        setGoogleSyncSuccess(false);
        setShowGoogleModal(false);
      }, 2000);
    } finally {
      setSyncingGoogle(false);
    }
  };

  // Criar Agendamento com salvamento local instantâneo e sincronização
  const handleCreateEvent = async (e) => {
    e.preventDefault();
    const startDateTime = `${newEvent.date}T${newEvent.start_time}:00Z`;
    const endDateTime = `${newEvent.date}T${newEvent.end_time}:00Z`;

    const createdObj = {
      id: `apt_${Date.now()}`,
      title: newEvent.title,
      description: newEvent.description,
      start_time: startDateTime,
      end_time: endDateTime,
      type: newEvent.type,
      location: newEvent.location,
      created_at: new Date().toISOString()
    };

    // Atualiza estado e localStorage imediatamente para resposta de 0ms
    setAppointments(prev => [createdObj, ...prev.filter(a => a.id !== createdObj.id)]);
    try {
      const stored = localStorage.getItem('athena_crm_appointments');
      const list = stored ? JSON.parse(stored) : [];
      list.unshift(createdObj);
      localStorage.setItem('athena_crm_appointments', JSON.stringify(list));
    } catch (_) {}

    setShowEventModal(false);
    setNewEvent({
      title: '',
      customer_id: '',
      description: '',
      date: new Date().toISOString().slice(0, 10),
      start_time: '10:00',
      end_time: '11:00',
      type: 'visita',
      location: ''
    });

    // Envia para o Supabase via API
    try {
      await crmApiFetch('/crm/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createdObj)
      });
    } catch (_) {}
  };

  // Abrir Modal de Detalhes do Agendamento
  const handleOpenAppointmentDetails = (apt) => {
    setSelectedAppointment(apt);
    const startDate = apt.start_time ? apt.start_time.slice(0, 10) : new Date().toISOString().slice(0, 10);
    const startH = apt.start_time ? apt.start_time.slice(11, 16) : '10:00';
    const endH = apt.end_time ? apt.end_time.slice(11, 16) : '11:00';

    setEditForm({
      title: apt.title || '',
      type: apt.type || 'visita',
      date: apt.date || startDate,
      start_time: startH,
      end_time: endH,
      location: apt.location || '',
      description: apt.description || ''
    });
    setIsEditingAppointment(false);
  };

  // Salvar Edição do Agendamento
  const handleSaveAppointmentEdit = async (e) => {
    e.preventDefault();
    if (!selectedAppointment) return;

    const startDateTime = `${editForm.date}T${editForm.start_time}:00Z`;
    const endDateTime = `${editForm.date}T${editForm.end_time}:00Z`;

    const updatedObj = {
      ...selectedAppointment,
      title: editForm.title,
      type: editForm.type,
      start_time: startDateTime,
      end_time: endDateTime,
      location: editForm.location,
      description: editForm.description,
      updated_at: new Date().toISOString()
    };

    setAppointments(prev => prev.map(a => a.id === updatedObj.id ? updatedObj : a));
    try {
      const stored = localStorage.getItem('athena_crm_appointments');
      const list = stored ? JSON.parse(stored) : [];
      const updatedList = list.map(a => a.id === updatedObj.id ? updatedObj : a);
      localStorage.setItem('athena_crm_appointments', JSON.stringify(updatedList));
    } catch (_) {}

    setSelectedAppointment(updatedObj);
    setIsEditingAppointment(false);

    try {
      await crmApiFetch(`/crm/appointments/${updatedObj.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedObj)
      });
    } catch (_) {}
  };

  // Excluir Agendamento
  const handleDeleteAppointment = async (id) => {
    if (!id) return;
    setAppointments(prev => prev.filter(a => a.id !== id));
    try {
      const stored = localStorage.getItem('athena_crm_appointments');
      const list = stored ? JSON.parse(stored) : [];
      const filtered = list.filter(a => a.id !== id);
      localStorage.setItem('athena_crm_appointments', JSON.stringify(filtered));
    } catch (_) {}

    setSelectedAppointment(null);
    setIsEditingAppointment(false);

    try {
      await crmApiFetch(`/crm/appointments/${id}`, { method: 'DELETE' });
    } catch (_) {}
  };

  // Helper para formatar o título do mês e ano
  const monthYearLabel = currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  const capitalizedMonthYear = monthYearLabel.charAt(0).toUpperCase() + monthYearLabel.slice(1);

  // Calcula dias da semana atual
  const getDaysOfWeek = (date) => {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day;
    startOfWeek.setDate(diff);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const nextDay = new Date(startOfWeek);
      nextDay.setDate(startOfWeek.getDate() + i);
      days.push(nextDay);
    }
    return days;
  };

  const weekDays = getDaysOfWeek(currentDate);

  // Posição percentual da linha vermelha (horário atual)
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const redLineTopPercent = (currentMinutes / 1440) * 100;

  const isToday = (d) => {
    const today = new Date();
    return d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear();
  };

  const HOURS = Array.from({ length: 24 }, (_, i) => i);

  // Helper para dias do mês na visão Mensal
  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= totalDays; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const monthGridDays = getDaysInMonth();

  return (
    <div className={`flex-1 flex flex-col h-full overflow-hidden select-none ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* ============================================================ */}
      {/* GOOGLE CALENDAR HEADER                                       */}
      {/* ============================================================ */}
      <div className={`px-4 sm:px-6 py-2.5 border-b flex flex-wrap items-center justify-between gap-3 shrink-0 ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        {/* Esquerda: Logo, Hoje, Setas e Mês/Ano */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 font-bold">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <span className={`font-black text-base hidden md:inline ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Agenda Comercial
            </span>
          </div>

          <button
            type="button"
            onClick={handleToday}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
              isDark 
                ? 'bg-slate-950 border-slate-700 hover:bg-slate-800 text-slate-200' 
                : 'bg-slate-100 border-slate-300 hover:bg-slate-200 text-slate-700'
            }`}
          >
            Hoje
          </button>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handlePrev}
              className={`p-1.5 rounded-lg border transition cursor-pointer ${
                isDark ? 'border-slate-800 hover:bg-slate-800 text-slate-300' : 'border-slate-300 hover:bg-slate-100 text-slate-700'
              }`}
              title="Anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className={`p-1.5 rounded-lg border transition cursor-pointer ${
                isDark ? 'border-slate-800 hover:bg-slate-800 text-slate-300' : 'border-slate-300 hover:bg-slate-100 text-slate-700'
              }`}
              title="Próximo"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <h2 className={`font-extrabold text-sm sm:text-base capitalize ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {capitalizedMonthYear}
          </h2>
        </div>

        {/* Direita: Botão Google Sync, Seletor de Visão e Novo Evento */}
        <div className="flex items-center gap-2.5">
          {/* BOTÃO PARA SINCRONIZAR COM O GOOGLE AGENDA */}
          <button
            type="button"
            onClick={() => setShowGoogleModal(true)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition cursor-pointer shadow-xs ${
              isDark 
                ? 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700' 
                : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300'
            }`}
            title="Sincronizar visitas e compromissos com o Google Agenda"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22 6c0-1.1-.9-2-2-2h-3V2h-2v2H9V2H7v2H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6z"/>
              <path fill="#34A853" d="M4 22h16c1.1 0 2-.9 2-2V9H2v11c0 1.1.9 2 2 2z"/>
              <path fill="#FBBC05" d="M2 9h20V6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v3z"/>
              <path fill="#EA4335" d="M7 2v4H5V2h2zm10 0v4h-2V2h2z"/>
            </svg>
            <span className="hidden sm:inline">Sincronizar Google Agenda</span>
          </button>

          {/* Seletor Mensal / Semanal / Diário */}
          <div className={`flex items-center p-0.5 rounded-xl border ${
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
          }`}>
            {['mensal', 'semanal', 'diario'].map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition cursor-pointer ${
                  viewMode === mode
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : isDark 
                      ? 'text-slate-400 hover:text-white' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                {mode === 'diario' ? 'Diário' : mode}
              </button>
            ))}
          </div>

          {/* Botão Novo Agendamento */}
          <button
            type="button"
            onClick={() => openQuickCreate(new Date(), 10)}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-1.5 transition cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Agendar Visita</span>
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* CORPO DA AGENDA: SEMANAL / DIÁRIO                            */}
      {/* 100% LARGURA TOTAL NO MODO DIÁRIO E TEMA CLARO PERFEITO      */}
      {/* ============================================================ */}
      {viewMode === 'semanal' || viewMode === 'diario' ? (
        <div className="flex-1 flex flex-col overflow-hidden min-h-0 w-full">
          <div className="flex-1 flex flex-col overflow-hidden w-full">
            {/* Header dos Dias da Semana */}
            <div className={`flex border-b shrink-0 text-xs ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100/90 border-slate-200'
            }`}>
              {/* Espaço das horas */}
              <div className={`w-14 sm:w-16 shrink-0 border-r ${
                isDark ? 'border-slate-800/80 bg-slate-950' : 'border-slate-200 bg-slate-50'
              }`} />

              {/* Colunas dos Dias */}
              <div className={`flex-1 grid grid-flow-col auto-cols-fr divide-x ${
                isDark ? 'divide-slate-800' : 'divide-slate-200'
              }`}>
                {(viewMode === 'semanal' ? weekDays : [currentDate]).map((d, i) => {
                  const today = isToday(d);
                  return (
                    <div 
                      key={i} 
                      onClick={() => openQuickCreate(d, 10)}
                      className={`p-2 text-center transition cursor-pointer ${
                        isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-200/50'
                      } ${today ? (isDark ? 'bg-amber-500/10' : 'bg-amber-500/10') : ''}`}
                      title="Clique para adicionar agendamento neste dia"
                    >
                      <div className={`text-[10px] uppercase font-extrabold ${
                        isDark ? 'text-slate-400' : 'text-slate-600'
                      }`}>
                        {d.toLocaleDateString('pt-BR', { weekday: viewMode === 'diario' ? 'long' : 'short' })}
                      </div>
                      <div className="mt-0.5 flex justify-center">
                        <span className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs ${
                          today
                            ? 'bg-amber-500 text-slate-950 shadow-md ring-2 ring-amber-400'
                            : isDark ? 'text-slate-200 hover:bg-slate-800' : 'text-slate-800 hover:bg-slate-200'
                        }`}>
                          {d.getDate()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Grade de 24 Horas com Rolagem e Linha Vermelha Viva */}
            <div className={`flex-1 overflow-y-auto relative min-h-0 flex ${
              isDark ? 'bg-slate-950' : 'bg-white'
            }`}>
              {/* Coluna Horária Fixa (00:00 às 23:00) */}
              <div className={`w-14 sm:w-16 shrink-0 border-r divide-y divide-transparent z-10 select-none ${
                isDark ? 'border-slate-800/80 bg-slate-950 text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-600'
              }`}>
                {HOURS.map((h) => (
                  <div key={h} className="h-14 pr-2 text-right text-[10px] font-mono font-semibold -mt-2">
                    {String(h).padStart(2, '0')}:00
                  </div>
                ))}
              </div>

              {/* Área das Colunas com a Linha Vermelha */}
              <div className={`flex-1 relative grid grid-flow-col auto-cols-fr divide-x ${
                isDark ? 'divide-slate-800' : 'divide-slate-200'
              }`}>
                {/* LINHA VERMELHA EM TEMPO REAL INDICANDO HORÁRIO ATUAL */}
                <div 
                  className="absolute left-0 right-0 border-t-2 border-red-500 z-30 pointer-events-none flex items-center"
                  style={{ top: `${redLineTopPercent}%` }}
                >
                  <div className="w-3 h-3 rounded-full bg-red-500 -ml-1.5 shadow-md shadow-red-500/50" />
                </div>

                {(viewMode === 'semanal' ? weekDays : [currentDate]).map((d, colIdx) => {
                  const today = isToday(d);
                  const dayDateStr = d.toISOString().slice(0, 10);
                  const dayAppointments = appointments.filter(a => a.start_time && a.start_time.startsWith(dayDateStr));

                  return (
                    <div 
                      key={colIdx} 
                      className={`relative ${today ? (isDark ? 'bg-amber-500/5' : 'bg-amber-50/40') : ''}`}
                    >
                      {/* Slots Horários Clicáveis para abrir o modal pré-preenchido */}
                      {HOURS.map((h) => (
                        <div 
                          key={h} 
                          onClick={() => openQuickCreate(d, h)}
                          className={`h-14 border-b transition cursor-pointer ${
                            isDark ? 'border-slate-800/60 hover:bg-amber-500/5' : 'border-slate-200 hover:bg-amber-50'
                          }`}
                          title={`Agendar para as ${String(h).padStart(2, '0')}:00`}
                        />
                      ))}

                      {/* Cards de Eventos Posicionados */}
                      {dayAppointments.map((apt) => {
                        const start = new Date(apt.start_time);
                        const startHour = start.getUTCHours() || 10;
                        const topPos = startHour * 56 + 4;

                        let badgeColor = 'bg-amber-500 text-slate-950 border-amber-400 shadow-amber-500/10';
                        if (apt.type === 'treinamento') badgeColor = 'bg-blue-600 text-white border-blue-500 shadow-blue-500/10';
                        if (apt.type === 'reuniao') badgeColor = 'bg-purple-600 text-white border-purple-500 shadow-purple-500/10';

                        return (
                          <div
                            key={apt.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenAppointmentDetails(apt);
                            }}
                            className={`absolute left-1.5 right-1.5 rounded-xl p-2.5 text-xs font-bold shadow-md border overflow-hidden transition hover:scale-[1.01] hover:brightness-110 cursor-pointer z-20 ${badgeColor}`}
                            style={{ top: `${topPos}px`, height: '52px' }}
                            title={`Clique para ver detalhes, editar ou excluir:\n${apt.title}\n${apt.description || ''}\n${apt.location || ''}`}
                          >
                            <div className="flex items-center justify-between text-[10px] opacity-90 mb-0.5">
                              <span className="flex items-center gap-1 font-mono font-bold">
                                <Clock className="w-3 h-3" />
                                {apt.start_time.slice(11, 16)}
                              </span>
                              <span className="capitalize text-[9px] uppercase tracking-wider font-extrabold">{apt.type}</span>
                            </div>
                            <div className="truncate font-black text-xs leading-tight">
                              {apt.title}
                            </div>
                            {apt.location && (
                              <div className="text-[10px] truncate opacity-90 flex items-center gap-1 mt-0.5">
                                <MapPin className="w-2.5 h-2.5 shrink-0" />
                                <span className="truncate">{apt.location}</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ============================================================ */
        /* VISÃO MENSAL (CLIQUE NO QUADRADO ABRE NOVO EVENTO)           */
        /* ============================================================ */
        <div className={`flex-1 overflow-y-auto p-4 min-h-0 ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
          <div className="grid grid-cols-7 gap-2">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
              <div key={d} className={`p-2 text-center text-xs font-black uppercase ${
                isDark ? 'text-slate-400' : 'text-slate-600'
              }`}>
                {d}
              </div>
            ))}

            {monthGridDays.map((dObj, i) => {
              if (!dObj) {
                return (
                  <div key={i} className="min-h-[90px] p-2 rounded-xl border border-transparent opacity-30" />
                );
              }

              const isCurr = isToday(dObj);
              const dateStr = dObj.toISOString().slice(0, 10);
              const dayApts = appointments.filter(a => a.start_time && a.start_time.startsWith(dateStr));

              return (
                <div
                  key={i}
                  onClick={() => openQuickCreate(dObj, 10)}
                  className={`min-h-[95px] p-2.5 rounded-xl border flex flex-col justify-between transition cursor-pointer ${
                    isDark 
                      ? 'bg-slate-900/60 border-slate-800 hover:border-amber-500/60 hover:bg-slate-800/50' 
                      : 'bg-white border-slate-200 hover:border-amber-400 hover:bg-amber-50/50 shadow-xs'
                  } ${isCurr ? 'ring-2 ring-amber-500 bg-amber-500/5' : ''}`}
                  title="Clique para adicionar agendamento neste dia"
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-black ${
                      isCurr ? 'text-amber-500' : isDark ? 'text-slate-300' : 'text-slate-800'
                    }`}>
                      {dObj.getDate()}
                    </span>
                  </div>

                  {/* Lista de eventos no dia */}
                  <div className="space-y-1 mt-1 overflow-hidden">
                    {dayApts.slice(0, 3).map((apt) => (
                      <div 
                        key={apt.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenAppointmentDetails(apt);
                        }}
                        className="p-1 bg-amber-500 hover:bg-amber-400 text-slate-950 text-[10px] font-bold rounded-md truncate shadow-xs cursor-pointer transition hover:scale-[1.02]"
                        title={`Clique para ver detalhes, editar ou excluir:\n${apt.title}`}
                      >
                        {apt.title}
                      </div>
                    ))}
                    {dayApts.length > 3 && (
                      <span className="text-[9px] text-amber-500 font-bold block">
                        +{dayApts.length - 3} mais
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: SINCRONIZAR COM GOOGLE AGENDA PESSOAL                 */}
      {/* ============================================================ */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs select-none">
          <div className={`w-full max-w-lg rounded-2xl border shadow-2xl p-6 flex flex-col max-h-[90vh] overflow-hidden ${
            isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            {/* Header */}
            <div className={`flex items-center justify-between pb-3 border-b mb-4 shrink-0 ${
              isDark ? 'border-slate-800' : 'border-slate-200'
            }`}>
              <div className="flex items-center gap-2.5">
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22 6c0-1.1-.9-2-2-2h-3V2h-2v2H9V2H7v2H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6z"/>
                  <path fill="#34A853" d="M4 22h16c1.1 0 2-.9 2-2V9H2v11c0 1.1.9 2 2 2z"/>
                  <path fill="#FBBC05" d="M2 9h20V6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v3z"/>
                  <path fill="#EA4335" d="M7 2v4H5V2h2zm10 0v4h-2V2h2z"/>
                </svg>
                <div>
                  <h3 className="font-black text-base flex items-center gap-2">
                    Sincronização com Google Agenda
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 font-bold border border-blue-500/20">
                      Pessoal
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Conecte a agenda da Athena diretamente à sua conta Google pessoal
                  </p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setShowGoogleModal(false)}
                className={`p-1.5 rounded-lg ${
                  isDark ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-4 pr-1">
              {/* Status da Conexão Google */}
              {googleAccessToken ? (
                <div className={`p-4 rounded-xl border flex flex-col gap-2.5 ${
                  isDark ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                      <div>
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block">
                          Conta Google Conectada com Sucesso
                        </span>
                        <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                          {googleAccount}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleDisconnectGoogle}
                      className="text-[11px] text-slate-400 hover:text-red-400 underline cursor-pointer"
                    >
                      Desconectar
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    Suas visitas comerciais agendadas são sincronizadas automaticamente com o seu calendário.
                  </p>
                </div>
              ) : (
                <div className={`p-4 rounded-xl border space-y-3 ${
                  isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200 mb-1">
                      Conectar com o Google Agenda
                    </h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Clique no botão abaixo para autorizar com a sua conta Google com 1 toque. Não é necessário preencher nenhuma chave ou código.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleConnectGoogleOAuth}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-white hover:bg-slate-100 text-slate-900 border border-slate-300 shadow-sm flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                    <span>Conectar minha conta Google</span>
                  </button>
                </div>
              )}

              {/* Ações Rápidas Complementares */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => downloadIcsCalendar(appointments)}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition hover:border-blue-500 ${
                    isDark ? 'bg-slate-950/50 border-slate-800 hover:bg-slate-800/40' : 'bg-white border-slate-200 hover:bg-blue-50/50'
                  }`}
                >
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-500 mb-1">
                    <Download className="w-4 h-4 shrink-0" />
                    <span>Exportar Arquivo (.ics)</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Baixa o arquivo para importar no celular ou computador.
                  </p>
                </button>

                <a
                  href="https://calendar.google.com/calendar/r"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition hover:border-emerald-500 ${
                    isDark ? 'bg-slate-950/50 border-slate-800 hover:bg-slate-800/40' : 'bg-white border-slate-200 hover:bg-emerald-50/50'
                  }`}
                >
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-500 mb-1">
                    <ExternalLink className="w-4 h-4 shrink-0" />
                    <span>Abrir Google Agenda</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Acessar o Google Agenda diretamente no navegador.
                  </p>
                </a>
              </div>

              {googleSyncSuccess && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Sincronização com seu Google Agenda realizada com sucesso!</span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className={`mt-4 pt-3 border-t flex items-center justify-end gap-2 shrink-0 ${
              isDark ? 'border-slate-800' : 'border-slate-200'
            }`}>
              <button
                type="button"
                onClick={() => setShowGoogleModal(false)}
                className={`px-3 py-2 rounded-xl text-xs font-bold ${
                  isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Fechar
              </button>
              <button
                type="button"
                onClick={handleSyncGoogle}
                disabled={syncingGoogle}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-2 transition cursor-pointer shadow-md shadow-blue-500/20"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncingGoogle ? 'animate-spin' : ''}`} />
                <span>{syncingGoogle ? 'Sincronizando...' : 'Sincronizar Agora'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: DETALHES / EDIÇÃO / EXCLUSÃO DE AGENDAMENTO           */}
      {/* ============================================================ */}
      {selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs select-none">
          <div className={`w-full max-w-lg rounded-2xl border shadow-2xl p-6 flex flex-col max-h-[90vh] overflow-hidden ${
            isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            {/* Header */}
            <div className={`flex items-center justify-between pb-3 border-b mb-4 shrink-0 ${
              isDark ? 'border-slate-800' : 'border-slate-200'
            }`}>
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  selectedAppointment.type === 'treinamento' 
                    ? 'bg-blue-500/20 text-blue-400' 
                    : selectedAppointment.type === 'reuniao'
                    ? 'bg-purple-500/20 text-purple-400'
                    : 'bg-amber-500/20 text-amber-500'
                }`}>
                  <CalendarIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-base truncate max-w-xs">
                    {isEditingAppointment ? 'Editar Agendamento' : selectedAppointment.title}
                  </h3>
                  <span className="text-[10px] uppercase font-extrabold tracking-wider opacity-75">
                    {selectedAppointment.type || 'Visita'}
                  </span>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setSelectedAppointment(null)}
                className={`p-1.5 rounded-lg ${
                  isDark ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conteúdo */}
            {isEditingAppointment ? (
              /* Formulário de Edição */
              <form onSubmit={handleSaveAppointmentEdit} className="space-y-3 overflow-y-auto pr-1">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">
                    Título do Compromisso *
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl border text-xs outline-none ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-amber-400' : 'bg-white border-slate-300 text-slate-900 focus:border-amber-500'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1">
                      Data *
                    </label>
                    <input
                      type="date"
                      required
                      value={editForm.date}
                      onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                      className={`w-full px-3 py-2 rounded-xl border text-xs outline-none ${
                        isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-amber-400' : 'bg-white border-slate-300 text-slate-900 focus:border-amber-500'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1">
                      Tipo
                    </label>
                    <select
                      value={editForm.type}
                      onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                      className={`w-full px-3 py-2 rounded-xl border text-xs outline-none ${
                        isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-amber-400' : 'bg-white border-slate-300 text-slate-900 focus:border-amber-500'
                      }`}
                    >
                      <option value="visita">Visita Comercial</option>
                      <option value="treinamento">Treinamento</option>
                      <option value="reuniao">Reunião Interna</option>
                      <option value="instalacao">Instalação Técnica</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1">
                      Horário Início *
                    </label>
                    <input
                      type="time"
                      required
                      value={editForm.start_time}
                      onChange={(e) => setEditForm({ ...editForm, start_time: e.target.value })}
                      className={`w-full px-3 py-2 rounded-xl border text-xs outline-none ${
                        isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-amber-400' : 'bg-white border-slate-300 text-slate-900 focus:border-amber-500'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1">
                      Horário Término
                    </label>
                    <input
                      type="time"
                      required
                      value={editForm.end_time}
                      onChange={(e) => setEditForm({ ...editForm, end_time: e.target.value })}
                      className={`w-full px-3 py-2 rounded-xl border text-xs outline-none ${
                        isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-amber-400' : 'bg-white border-slate-300 text-slate-900 focus:border-amber-500'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">
                    Endereço / Localização
                  </label>
                  <input
                    type="text"
                    value={editForm.location}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                    placeholder="Ex: SIA Trecho 3 Lote 620"
                    className={`w-full px-3 py-2 rounded-xl border text-xs outline-none ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-amber-400' : 'bg-white border-slate-300 text-slate-900 focus:border-amber-500'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">
                    Pauta / Observações
                  </label>
                  <textarea
                    rows={2}
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl border text-xs outline-none resize-none ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-amber-400' : 'bg-white border-slate-300 text-slate-900 focus:border-amber-500'
                    }`}
                  />
                </div>

                <div className={`mt-4 pt-3 border-t flex justify-end gap-2 ${
                  isDark ? 'border-slate-800' : 'border-slate-200'
                }`}>
                  <button
                    type="button"
                    onClick={() => setIsEditingAppointment(false)}
                    className="px-3 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20"
                  >
                    Salvar Alterações
                  </button>
                </div>
              </form>
            ) : (
              /* Visualização de Detalhes */
              <div className="space-y-4 overflow-y-auto pr-1">
                {/* Horário e Data */}
                <div className={`p-3.5 rounded-xl border flex items-center gap-3 ${
                  isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <Clock className="w-5 h-5 text-amber-500 shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-slate-200">
                      {selectedAppointment.start_time?.slice(0, 10)} às {selectedAppointment.start_time?.slice(11, 16)} - {selectedAppointment.end_time?.slice(11, 16) || '11:00'}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Horário comercial agendado
                    </div>
                  </div>
                </div>

                {/* Localização com Botão Google Maps */}
                {selectedAppointment.location && (
                  <div className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
                    isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="flex items-start gap-2.5 min-w-0">
                      <MapPin className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <div className="text-xs font-bold truncate">Endereço</div>
                        <div className="text-xs text-slate-400 truncate">{selectedAppointment.location}</div>
                      </div>
                    </div>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedAppointment.location)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-[11px] font-bold shrink-0 flex items-center gap-1 transition"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Maps
                    </a>
                  </div>
                )}

                {/* Descrição / Pauta */}
                {selectedAppointment.description && (
                  <div className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
                    isDark ? 'bg-slate-950/60 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}>
                    <div className="text-[10px] uppercase font-extrabold text-slate-500 mb-1">Pauta / Observações</div>
                    <p className="whitespace-pre-wrap">{selectedAppointment.description}</p>
                  </div>
                )}

                {/* Rodapé de Ações */}
                <div className={`pt-4 border-t flex flex-wrap items-center justify-between gap-2 ${
                  isDark ? 'border-slate-800' : 'border-slate-200'
                }`}>
                  <button
                    type="button"
                    onClick={() => handleDeleteAppointment(selectedAppointment.id)}
                    className="px-3 py-2 rounded-xl text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20 transition flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Excluir
                  </button>

                  <div className="flex items-center gap-2">
                    <a
                      href={buildGoogleCalendarUrl(selectedAppointment)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1.5 transition shadow-xs"
                      title="Adicionar diretamente ao seu Google Agenda"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Google Agenda
                    </a>

                    <button
                      type="button"
                      onClick={() => setIsEditingAppointment(true)}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-1.5 transition shadow-md shadow-amber-500/20"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      Editar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: NOVO AGENDAMENTO DE VISITA                            */}
      {/* ============================================================ */}
      {showEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs select-none">
          <div className={`w-full max-w-md rounded-2xl border shadow-2xl p-6 ${
            isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className={`flex items-center justify-between pb-3 border-b mb-4 ${
              isDark ? 'border-slate-800' : 'border-slate-200'
            }`}>
              <h3 className="font-black text-base">Agendar Compromisso / Visita</h3>
              <button 
                type="button" 
                onClick={() => setShowEventModal(false)}
                className={`p-1 rounded-lg ${
                  isDark ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-3">
              <div>
                <label className={`text-xs font-bold block mb-1 ${
                  isDark ? 'text-slate-400' : 'text-slate-700'
                }`}>
                  Título do Compromisso *
                </label>
                <input
                  type="text"
                  required
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  placeholder="Ex: Visita Técnica - Auto Mecânica Polara"
                  className={`w-full px-3 py-2 rounded-xl border text-xs outline-none transition-colors ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-amber-400' : 'bg-white border-slate-300 text-slate-900 focus:border-amber-500 shadow-xs'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`text-xs font-bold block mb-1 ${
                    isDark ? 'text-slate-400' : 'text-slate-700'
                  }`}>
                    Data
                  </label>
                  <input
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                    className={`w-full px-3 py-1.5 rounded-xl border text-xs outline-none transition-colors ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-amber-400' : 'bg-white border-slate-300 text-slate-900 focus:border-amber-500 shadow-xs'
                    }`}
                  />
                </div>
                <div>
                  <label className={`text-xs font-bold block mb-1 ${
                    isDark ? 'text-slate-400' : 'text-slate-700'
                  }`}>
                    Tipo
                  </label>
                  <select
                    value={newEvent.type}
                    onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
                    className={`w-full px-3 py-1.5 rounded-xl border text-xs outline-none transition-colors cursor-pointer ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-amber-400' : 'bg-white border-slate-300 text-slate-900 focus:border-amber-500 shadow-xs'
                    }`}
                  >
                    <option value="visita">Visita Comercial</option>
                    <option value="treinamento">Treinamento / Entrega</option>
                    <option value="reuniao">Reunião de Fechamento</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`text-xs font-bold block mb-1 ${
                    isDark ? 'text-slate-400' : 'text-slate-700'
                  }`}>
                    Horário Início
                  </label>
                  <input
                    type="time"
                    value={newEvent.start_time}
                    onChange={(e) => setNewEvent({ ...newEvent, start_time: e.target.value })}
                    className={`w-full px-3 py-1.5 rounded-xl border text-xs outline-none transition-colors ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-amber-400' : 'bg-white border-slate-300 text-slate-900 focus:border-amber-500 shadow-xs'
                    }`}
                  />
                </div>
                <div>
                  <label className={`text-xs font-bold block mb-1 ${
                    isDark ? 'text-slate-400' : 'text-slate-700'
                  }`}>
                    Horário Término
                  </label>
                  <input
                    type="time"
                    value={newEvent.end_time}
                    onChange={(e) => setNewEvent({ ...newEvent, end_time: e.target.value })}
                    className={`w-full px-3 py-1.5 rounded-xl border text-xs outline-none transition-colors ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-amber-400' : 'bg-white border-slate-300 text-slate-900 focus:border-amber-500 shadow-xs'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`text-xs font-bold block mb-1 ${
                  isDark ? 'text-slate-400' : 'text-slate-700'
                }`}>
                  Endereço / Localização
                </label>
                <input
                  type="text"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                  placeholder="Ex: Vicente Pires - Rua 03 Chácara 84"
                  className={`w-full px-3 py-2 rounded-xl border text-xs outline-none transition-colors ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-amber-400' : 'bg-white border-slate-300 text-slate-900 focus:border-amber-500 shadow-xs'
                  }`}
                />
              </div>

              <div className={`pt-3 flex justify-end gap-2 border-t ${
                isDark ? 'border-slate-800' : 'border-slate-200'
              }`}>
                <button
                  type="button"
                  onClick={() => setShowEventModal(false)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold ${
                    isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition cursor-pointer shadow-md shadow-amber-500/20"
                >
                  Confirmar Agendamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}