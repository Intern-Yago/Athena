import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { crmApiFetch } from '../utils/api';
import { autoSyncEventToGoogle } from '../utils/googleCalendarSync';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Building2, 
  User, 
  FileText, 
  CheckCircle2, 
  X,
  Sparkles
} from 'lucide-react';

export default function ScheduleVisitModal({
  lead,
  isOpen,
  onClose,
  onConfirmSchedule,
  onMoveWithoutSchedule,
  user
}) {
  const { isDark } = useTheme();

  // Data padrão: amanhã (ou hoje se for cedo)
  const tomorrowStr = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  })();

  const [date, setDate] = useState(tomorrowStr);
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('11:00');
  const [visitType, setVisitType] = useState('Visita Comercial Presencial');
  const [consultant, setConsultant] = useState(user?.name || 'Equipe Comercial Athena');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !lead) return null;

  const leadName = lead.name || lead.company || lead.nome || 'Oficina DF';
  const rawAddress = lead.address || lead.end || '';
  const leadRa = lead.ra_df || lead.ra || '';
  const leadAddress = rawAddress 
    ? (rawAddress.includes('DF') || rawAddress.includes('Brasília') ? rawAddress : `${rawAddress}${leadRa ? `, ${leadRa}` : ''} - DF, Brasil`)
    : `${leadName}${leadRa ? `, ${leadRa}` : ''} - DF, Brasil`;

  const workshopId = lead.radarWorkshopId || (String(lead.id).startsWith('radar_lead_') ? Number(lead.id.replace('radar_lead_', '')) : null);
  const mapsQueryUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(leadAddress)}`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const startDateTime = `${date}T${startTime}:00Z`;
    const endDateTime = `${date}T${endTime}:00Z`;

    const appointmentObj = {
      id: `apt_${Date.now()}`,
      title: `${visitType}: ${leadName}`,
      description: `Visita Comercial com ${leadName}\n📍 Endereço: ${leadAddress}\n🔗 Abrir no Google Maps: ${mapsQueryUrl}\n\n${notes ? `Pauta: ${notes}\n` : ''}Responsável: ${consultant}`,
      date: date,
      start_time: startDateTime,
      end_time: endDateTime,
      type: 'visita',
      location: leadAddress,
      customer_id: lead.id || '',
      workshop_id: workshopId,
      created_at: new Date().toISOString()
    };

    // 1. Salva imediatamente em LocalStorage para garantir 0ms de resposta na Agenda
    try {
      const stored = localStorage.getItem('athena_crm_appointments');
      const list = stored ? JSON.parse(stored) : [];
      list.unshift(appointmentObj);
      localStorage.setItem('athena_crm_appointments', JSON.stringify(list));
    } catch (_) {}

    // 2. Dispara persistência assíncrona no backend
    try {
      crmApiFetch('/crm/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointmentObj)
      }).catch(() => {});
    } catch (_) {}

    // 3. Sincronização automática em tempo real com o Google Agenda do consultor
    autoSyncEventToGoogle(appointmentObj).catch(() => {});

    setIsSubmitting(false);
    if (onConfirmSchedule) {
      onConfirmSchedule(appointmentObj);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className={`w-full max-w-lg rounded-2xl shadow-2xl border overflow-hidden flex flex-col max-h-[90vh] ${
          isDark 
            ? 'bg-slate-900 border-slate-800 text-slate-100' 
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between shrink-0 ${
          isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold flex items-center gap-2">
                Agendar Visita Comercial
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 font-semibold border border-amber-500/20 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" /> Google Agenda Link
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Adicione data e horário para vincular diretamente ao calendário
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {/* Card de Resumo da Oficina */}
          <div className={`p-3.5 rounded-xl border flex items-start gap-3 ${
            isDark ? 'bg-slate-950/60 border-slate-800/80' : 'bg-slate-50 border-slate-200'
          }`}>
            <Building2 className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-bold truncate">{leadName}</h4>
              <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-500" />
                {leadAddress}
              </p>
            </div>
          </div>

          {/* Data da Visita */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-500" />
              Data da Visita *
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/40 transition ${
                isDark ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
              }`}
            />
          </div>

          {/* Horários */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                Horário de Início *
              </label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/40 transition ${
                  isDark ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
                }`}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                Término Estimado
              </label>
              <input
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/40 transition ${
                  isDark ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
                }`}
              />
            </div>
          </div>

          {/* Tipo de Visita & Consultor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Tipo de Visita
              </label>
              <select
                value={visitType}
                onChange={(e) => setVisitType(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/40 transition ${
                  isDark ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
                }`}
              >
                <option value="Visita Comercial Presencial">Visita Comercial Presencial</option>
                <option value="Apresentação de Equipamentos">Apresentação de Equipamentos</option>
                <option value="Demonstração Elevador/Rampa">Demonstração Elevador/Rampa</option>
                <option value="Diagnóstico & Pós-Venda">Diagnóstico & Pós-Venda</option>
                <option value="Fechamento de Proposta">Fechamento de Proposta</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-500" />
                Responsável
              </label>
              <input
                type="text"
                value={consultant}
                onChange={(e) => setConsultant(e.target.value)}
                placeholder="Ex: Yago / Consultor Athena"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/40 transition ${
                  isDark ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
                }`}
              />
            </div>
          </div>

          {/* Pauta / Observações */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              Pauta da Reunião / Observações
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Apresentar condições especiais para troca de elevador e novos cursos técnicos..."
              className={`w-full px-3.5 py-2 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/40 transition resize-none ${
                isDark ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
              }`}
            />
          </div>

          {/* Ações */}
          <div className="pt-2 flex flex-col gap-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              Confirmar e Agendar na Agenda
            </button>

            <button
              type="button"
              onClick={onMoveWithoutSchedule}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold border transition ${
                isDark 
                  ? 'bg-slate-800/60 border-slate-700/80 hover:bg-slate-800 text-slate-300' 
                  : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-700'
              }`}
            >
              Mover para Agendado sem Definir Data Agora
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
