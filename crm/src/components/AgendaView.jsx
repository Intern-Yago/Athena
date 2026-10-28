import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
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
  CheckCircle2
} from 'lucide-react';

export default function AgendaView() {
  const { isDark } = useTheme();
  const [viewMode, setViewMode] = useState('semanal'); // 'mensal' | 'semanal' | 'diario'
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sincronização Google Agenda
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [syncingGoogle, setSyncingGoogle] = useState(false);
  const [googleSyncSuccess, setGoogleSyncSuccess] = useState(false);

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

  // Carregar Agendamentos do Supabase
  const loadAppointments = async () => {
    setLoading(true);
    try {
      const res = await crmApiFetch('/crm/appointments');
      if (res.ok) {
        const data = await res.json();
        setAppointments(data.data || []);
      }
    } catch (e) {
      console.warn('Erro ao carregar agenda:', e);
    } finally {
      setLoading(false);
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
      const res = await crmApiFetch('/crm/appointments/sync-google', {
        method: 'POST'
      });
      if (res.ok) {
        setGoogleSyncSuccess(true);
        setTimeout(() => {
          setGoogleSyncSuccess(false);
          setShowGoogleModal(false);
        }, 2500);
      }
    } catch (e) {
      console.warn('Erro ao sincronizar com Google:', e);
    } finally {
      setSyncingGoogle(false);
    }
  };

  // Criar Agendamento
  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      const startDateTime = `${newEvent.date}T${newEvent.start_time}:00Z`;
      const endDateTime = `${newEvent.date}T${newEvent.end_time}:00Z`;

      const res = await crmApiFetch('/crm/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: newEvent.title,
          description: newEvent.description,
          start_time: startDateTime,
          end_time: endDateTime,
          type: newEvent.type,
          location: newEvent.location
        })
      });

      if (res.ok) {
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
        loadAppointments();
      }
    } catch (err) {
      console.warn('Erro ao salvar agendamento:', err);
    }
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
            <span className="font-black text-base hidden md:inline">Agenda Comercial</span>
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

          <h2 className="font-extrabold text-sm sm:text-base text-slate-200 capitalize">
            {capitalizedMonthYear}
          </h2>
        </div>

        {/* Direita: Botão Google Sync, Seletor de Visão e Novo Evento */}
        <div className="flex items-center gap-2.5">
          {/* BOTÃO PARA SINCRONIZAR COM O GOOGLE AGENDA */}
          <button
            type="button"
            onClick={() => setShowGoogleModal(true)}
            className="px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition cursor-pointer bg-white text-slate-800 hover:bg-slate-100 shadow-xs border-slate-300"
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
                    : 'text-slate-400 hover:text-white'
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
      {/* (SEM COLUNA GMT E CENTRALIZADO NO DIÁRIO)                    */}
      {/* ============================================================ */}
      {viewMode === 'semanal' || viewMode === 'diario' ? (
        <div className="flex-1 flex flex-col overflow-hidden min-h-0">
          <div className={`flex-1 flex flex-col overflow-hidden ${viewMode === 'diario' ? 'max-w-3xl mx-auto w-full' : 'w-full'}`}>
            {/* Header dos Dias da Semana (Sem coluna de GMT) */}
            <div className="flex border-b shrink-0 text-xs bg-slate-900 border-slate-800">
              {/* Espaço das horas */}
              <div className="w-14 sm:w-16 shrink-0 border-r border-slate-800/80" />

              {/* Colunas dos Dias */}
              <div className="flex-1 grid grid-flow-col auto-cols-fr divide-x divide-slate-800">
                {(viewMode === 'semanal' ? weekDays : [currentDate]).map((d, i) => {
                  const today = isToday(d);
                  return (
                    <div 
                      key={i} 
                      onClick={() => openQuickCreate(d, 10)}
                      className={`p-2 text-center transition cursor-pointer hover:bg-slate-800/40 ${
                        today ? (isDark ? 'bg-amber-500/5' : 'bg-amber-50/70') : ''
                      }`}
                      title="Clique para adicionar agendamento neste dia"
                    >
                      <div className="text-[10px] uppercase font-bold text-slate-400">
                        {d.toLocaleDateString('pt-BR', { weekday: 'short' })}
                      </div>
                      <div className="mt-0.5 flex justify-center">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-xs ${
                          today
                            ? 'bg-amber-500 text-slate-950 shadow-sm'
                            : isDark ? 'text-slate-200' : 'text-slate-800'
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
            <div className="flex-1 overflow-y-auto relative min-h-0 flex">
              {/* Coluna Horária Fixa (00:00 às 23:00) */}
              <div className="w-14 sm:w-16 shrink-0 border-r border-slate-800/80 divide-y divide-transparent z-10 select-none bg-slate-950">
                {HOURS.map((h) => (
                  <div key={h} className="h-14 pr-2 text-right text-[10px] text-slate-400 font-mono -mt-2">
                    {String(h).padStart(2, '0')}:00
                  </div>
                ))}
              </div>

              {/* Área das Colunas com a Linha Vermelha */}
              <div className="flex-1 relative grid grid-flow-col auto-cols-fr divide-x divide-slate-800">
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
                      className={`relative ${today ? (isDark ? 'bg-amber-500/3' : 'bg-amber-50/40') : ''}`}
                    >
                      {/* Slots Horários Clicáveis para abrir o modal pré-preenchido */}
                      {HOURS.map((h) => (
                        <div 
                          key={h} 
                          onClick={() => openQuickCreate(d, h)}
                          className={`h-14 border-b transition cursor-pointer hover:bg-amber-500/5 ${
                            isDark ? 'border-slate-800/60' : 'border-slate-100'
                          }`}
                          title={`Agendar para as ${String(h).padStart(2, '0')}:00`}
                        />
                      ))}

                      {/* Cards de Eventos Posicionados */}
                      {dayAppointments.map((apt) => {
                        const start = new Date(apt.start_time);
                        const startHour = start.getUTCHours() || 10;
                        const topPos = startHour * 56 + 4;

                        let badgeColor = 'bg-amber-500 text-slate-950 border-amber-400';
                        if (apt.type === 'treinamento') badgeColor = 'bg-blue-500 text-white border-blue-400';
                        if (apt.type === 'reuniao') badgeColor = 'bg-purple-500 text-white border-purple-400';

                        return (
                          <div
                            key={apt.id}
                            className={`absolute left-1 right-1 rounded-xl p-2 text-xs font-bold shadow-md border overflow-hidden transition hover:scale-[1.02] cursor-pointer z-10 ${badgeColor}`}
                            style={{ top: `${topPos}px`, height: '52px' }}
                            title={`${apt.title}\n${apt.description || ''}\n${apt.location || ''}`}
                          >
                            <div className="flex items-center justify-between text-[10px] opacity-90 mb-0.5">
                              <span className="flex items-center gap-1 font-mono">
                                <Clock className="w-3 h-3" />
                                {apt.start_time.slice(11, 16)}
                              </span>
                              <span className="capitalize text-[9px] uppercase tracking-wider">{apt.type}</span>
                            </div>
                            <div className="truncate font-black text-xs leading-tight">
                              {apt.title}
                            </div>
                            {apt.location && (
                              <div className="text-[10px] truncate opacity-85 flex items-center gap-1">
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
        <div className="flex-1 overflow-y-auto p-4 min-h-0">
          <div className="grid grid-cols-7 gap-2">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
              <div key={d} className="p-2 text-center text-xs font-extrabold uppercase text-slate-400">
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
                  className={`min-h-[95px] p-2 rounded-xl border flex flex-col justify-between transition cursor-pointer hover:border-amber-500/60 hover:bg-slate-800/40 ${
                    isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
                  } ${isCurr ? 'ring-2 ring-amber-500 bg-amber-500/5' : ''}`}
                  title="Clique para adicionar agendamento neste dia"
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${
                      isCurr ? 'text-amber-500 font-black' : isDark ? 'text-slate-300' : 'text-slate-700'
                    }`}>
                      {dObj.getDate()}
                    </span>
                  </div>

                  {/* Lista de eventos no dia */}
                  <div className="space-y-1 mt-1 overflow-hidden">
                    {dayApts.slice(0, 2).map((apt) => (
                      <div 
                        key={apt.id}
                        className="p-1 bg-amber-500 text-slate-950 text-[10px] font-bold rounded-md truncate"
                        title={apt.title}
                      >
                        {apt.title}
                      </div>
                    ))}
                    {dayApts.length > 2 && (
                      <span className="text-[9px] text-slate-400 font-bold block">
                        +{dayApts.length - 2} mais
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
      {/* MODAL: SINCRONIZAR COM GOOGLE AGENDA                         */}
      {/* ============================================================ */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs select-none">
          <div className={`w-full max-w-md rounded-2xl border shadow-2xl p-6 ${
            isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2.5">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22 6c0-1.1-.9-2-2-2h-3V2h-2v2H9V2H7v2H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6z"/>
                  <path fill="#34A853" d="M4 22h16c1.1 0 2-.9 2-2V9H2v11c0 1.1.9 2 2 2z"/>
                  <path fill="#FBBC05" d="M2 9h20V6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v3z"/>
                  <path fill="#EA4335" d="M7 2v4H5V2h2zm10 0v4h-2V2h2z"/>
                </svg>
                <h3 className="font-black text-base">Google Calendar Sync</h3>
              </div>
              <button 
                type="button" 
                onClick={() => setShowGoogleModal(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Todas as visitas comerciais, demonstrações práticas de elevadores e alinhadores serão sincronizadas diretamente para o seu Google Agenda no smartphone e computador.
            </p>

            <div className={`p-3 rounded-xl border text-xs space-y-2 mb-4 ${
              isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Conta Google vinculada:</span>
                <strong className="text-amber-500 font-mono">athena.consultoria@gmail.com</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Modo de sincronização:</span>
                <span className="text-emerald-400 font-bold">Bidirecional em Tempo Real</span>
              </div>
            </div>

            {googleSyncSuccess ? (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-bold flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-4 h-4" />
                <span>Eventos sincronizados com seu Google Agenda com sucesso!</span>
              </div>
            ) : null}

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowGoogleModal(false)}
                className={`px-3 py-2 rounded-xl text-xs font-bold ${
                  isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Cancelar
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
      {/* MODAL: NOVO AGENDAMENTO DE VISITA                            */}
      {/* ============================================================ */}
      {showEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs select-none">
          <div className={`w-full max-w-md rounded-2xl border shadow-2xl p-6 ${
            isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="font-black text-base">Agendar Compromisso / Visita</h3>
              <button 
                type="button" 
                onClick={() => setShowEventModal(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">Título do Compromisso *</label>
                <input
                  type="text"
                  required
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  placeholder="Ex: Visita Técnica - Auto Mecânica Polara"
                  className={`w-full px-3 py-2 rounded-xl border text-xs outline-none ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1">Data</label>
                  <input
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                    className={`w-full px-3 py-1.5 rounded-xl border text-xs outline-none ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1">Tipo</label>
                  <select
                    value={newEvent.type}
                    onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
                    className={`w-full px-3 py-1.5 rounded-xl border text-xs outline-none ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
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
                  <label className="text-xs font-bold text-slate-400 block mb-1">Horário Início</label>
                  <input
                    type="time"
                    value={newEvent.start_time}
                    onChange={(e) => setNewEvent({ ...newEvent, start_time: e.target.value })}
                    className={`w-full px-3 py-1.5 rounded-xl border text-xs outline-none ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1">Horário Término</label>
                  <input
                    type="time"
                    value={newEvent.end_time}
                    onChange={(e) => setNewEvent({ ...newEvent, end_time: e.target.value })}
                    className={`w-full px-3 py-1.5 rounded-xl border text-xs outline-none ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">Endereço / Localização</label>
                <input
                  type="text"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                  placeholder="Ex: Vicente Pires - Rua 03 Chácara 84"
                  className={`w-full px-3 py-2 rounded-xl border text-xs outline-none ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-800">
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
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition cursor-pointer"
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
