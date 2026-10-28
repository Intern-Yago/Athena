/**
 * Google Calendar Real-Time Auto-Sync Engine
 * Sincronização automática em tempo real com o Google Agenda pessoal do consultor.
 * Transforma a Agenda do Athena CRM em um espelho bidirecional transparente do Google Agenda.
 */

export function getGoogleToken() {
  try {
    return localStorage.getItem('athena_google_token') || null;
  } catch (_) {
    return null;
  }
}

/**
 * Cria ou atualiza automaticamente o evento no Google Agenda do usuário conectado
 * @param {Object} appointment Objeto do agendamento
 * @returns {Promise<Object>} Agendamento enriquecido com google_event_id
 */
export async function autoSyncEventToGoogle(appointment) {
  if (!appointment) return appointment;
  const token = getGoogleToken();
  if (!token) return appointment; // Usuário ainda não conectou a conta Google

  try {
    const sDate = new Date(appointment.start_time);
    const eDate = appointment.end_time ? new Date(appointment.end_time) : new Date(sDate.getTime() + 60 * 60 * 1000);

    const eventPayload = {
      summary: appointment.title || 'Visita Comercial Athena',
      description: appointment.description || 'Agendamento sincronizado automaticamente via Athena CRM',
      location: appointment.location || 'Brasília - DF',
      start: { 
        dateTime: !isNaN(sDate.getTime()) ? sDate.toISOString() : new Date().toISOString() 
      },
      end: { 
        dateTime: !isNaN(eDate.getTime()) ? eDate.toISOString() : new Date(Date.now() + 3600000).toISOString() 
      }
    };

    let url = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';
    let method = 'POST';

    if (appointment.google_event_id) {
      url = `https://www.googleapis.com/calendar/v3/calendars/primary/events/${encodeURIComponent(appointment.google_event_id)}`;
      method = 'PATCH';
    }

    const res = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(eventPayload)
    });

    if (res.status === 401) {
      console.warn('[Google Sync] Token expirado ou revogado. Necessário reconectar.');
      localStorage.removeItem('athena_google_token');
      return appointment;
    }

    if (res.ok) {
      const gData = await res.json();
      if (gData && gData.id) {
        appointment.google_event_id = gData.id;

        // Atualiza no cache de agendamentos local
        try {
          const stored = localStorage.getItem('athena_crm_appointments');
          if (stored) {
            const list = JSON.parse(stored);
            const idx = list.findIndex(a => a.id === appointment.id);
            if (idx !== -1) {
              list[idx].google_event_id = gData.id;
              localStorage.setItem('athena_crm_appointments', JSON.stringify(list));
            }
          }
        } catch (_) {}
      }
    }
  } catch (err) {
    console.warn('[Google Sync] Falha silenciosa na sincronização em tempo real:', err.message);
  }

  return appointment;
}

/**
 * Remove automaticamente o evento do Google Agenda ao cancelar ou excluir visita
 * @param {string|Object} target google_event_id ou objeto appointment
 */
export async function autoRemoveEventFromGoogle(target) {
  if (!target) return;
  const token = getGoogleToken();
  if (!token) return;

  const googleEventId = typeof target === 'string' ? target : target.google_event_id;
  if (!googleEventId) return;

  try {
    await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${encodeURIComponent(googleEventId)}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  } catch (err) {
    console.warn('[Google Sync] Falha ao deletar evento do Google Agenda:', err.message);
  }
}
