/**
 * workshopsFallback.js
 * Provedor resiliente de oficinas DF para o CRM.
 * Garante que mesmo durante deploys, reinicializações ou instabilidades do Render/Supabase,
 * o Funil de Expansão e o Radar continuem 100% funcionais com todos os 9.211 registros.
 */
import { autoRemoveEventFromGoogle } from './googleCalendarSync';

let memoryCache = null;
let fetchPromise = null;

export async function loadWorkshopsDataset() {
  if (memoryCache && memoryCache.length > 0) {
    return memoryCache;
  }

  if (fetchPromise) {
    return fetchPromise;
  }

  fetchPromise = (async () => {
    try {
      const res = await fetch('/radar_workshops.json');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          memoryCache = data;
          return memoryCache;
        }
      }
    } catch (e) {
      console.warn('Fallback: não foi possível carregar radar_workshops.json:', e);
    }
    return [];
  })();

  const result = await fetchPromise;
  fetchPromise = null;
  return result;
}

export async function fetchOfflineWorkshops({
  ra = 'all',
  search = '',
  status = '',
  page = 1,
  limit = 35
} = {}) {
  const all = await loadWorkshopsDataset();
  
  // Lê eventuais edições locais salvas pelo usuário
  let edits = {};
  try {
    edits = JSON.parse(localStorage.getItem('athena_workshops_edits') || '{}');
  } catch (_) {}

  // Normaliza busca e status
  const q = (search || '').toLowerCase().trim();
  const allowedStatuses = status 
    ? status.split(',').map(s => s.trim().toLowerCase()).filter(Boolean)
    : [];

  const filtered = all.filter(item => {
    const edit = edits[item.id] || {};
    const itemRa = (edit.ra !== undefined ? edit.ra : (item.ra || '')).toLowerCase();
    const itemStatus = (edit.st !== undefined ? edit.st : (item.st || 'Não Visitado')).toLowerCase();
    const nome = (edit.nome !== undefined ? edit.nome : (item.nome || '')).toLowerCase();
    const rz = (item.rz || '').toLowerCase();
    const cnpj = (item.cnpj || '').toLowerCase();
    const tel = (edit.tel !== undefined ? edit.tel : (item.tel || '')).toLowerCase();
    const end = (edit.end !== undefined ? edit.end : (item.end || '')).toLowerCase();

    // Filtro de Região Administrativa
    if (ra && ra !== 'all' && itemRa !== ra.toLowerCase()) {
      return false;
    }

    // Filtro de Status ESTRITO
    // Oficinas "Não Visitado" NUNCA devem aparecer em "Visita Realizada" (Já Visitado), "Agendado", etc.
    if (allowedStatuses.length > 0) {
      const isItemNaoVisitado = itemStatus === 'não visitado' || itemStatus === 'a visitar' || itemStatus === '';
      const matches = allowedStatuses.some(st => {
        if (st === 'não visitado' || st === 'a visitar') {
          return isItemNaoVisitado;
        }
        if (isItemNaoVisitado) {
          return false;
        }
        return itemStatus === st ||
               (st === 'visita realizada' && (itemStatus === 'visitado' || itemStatus === 'já visitado')) ||
               (st === 'visita agendada' && itemStatus === 'agendado') ||
               (st === 'cliente athena' && itemStatus === 'parceria fechada');
      });
      if (!matches) return false;
    }

    // Filtro de Busca
    if (q) {
      const match = nome.includes(q) || rz.includes(q) || cnpj.includes(q) || tel.includes(q) || end.includes(q);
      if (!match) return false;
    }

    return true;
  });

  const total = filtered.length;
  const numLimit = Number(limit) || 35;
  const numPage = Number(page) || 1;
  const totalPages = Math.ceil(total / numLimit) || 1;
  const offset = (numPage - 1) * numLimit;
  const workshops = filtered.slice(offset, offset + numLimit).map(w => {
    const edit = edits[w.id] || {};
    return {
      ...w,
      nome_fantasia: edit.nome !== undefined ? edit.nome : w.nome,
      razao_social: w.rz || w.nome,
      regiao_administrativa: edit.ra !== undefined ? edit.ra : w.ra,
      categoria: edit.cat !== undefined ? edit.cat : w.cat,
      telefone_principal: edit.tel !== undefined ? edit.tel : w.tel,
      endereco_completo: edit.end !== undefined ? edit.end : w.end,
      status_visita: edit.st !== undefined ? edit.st : w.st,
      observacoes: edit.obs !== undefined ? edit.obs : (w.obs || '')
    };
  });

  return {
    success: true,
    workshops,
    total,
    page: numPage,
    limit: numLimit,
    totalPages
  };
}

export async function getOfflineWorkshopStats() {
  const all = await loadWorkshopsDataset();
  let edits = {};
  try {
    edits = JSON.parse(localStorage.getItem('athena_workshops_edits') || '{}');
  } catch (_) {}

  const raMap = {};
  const statusMap = {};

  all.forEach(item => {
    const edit = edits[item.id] || {};
    const ra = edit.ra !== undefined ? edit.ra : (item.ra || 'Outros');
    const st = edit.st !== undefined ? edit.st : (item.st || 'Não Visitado');

    raMap[ra] = (raMap[ra] || 0) + 1;
    statusMap[st] = (statusMap[st] || 0) + 1;
  });

  const byRa = Object.entries(raMap).map(([ra, count]) => ({ ra, count })).sort((a, b) => b.count - a.count);
  const byStatus = Object.entries(statusMap).map(([status, count]) => ({ status, count }));

  return {
    success: true,
    total: all.length,
    byStatus,
    byRa
  };
}

export function saveOfflineWorkshopStatus(id, { status, observacoes }) {
  try {
    const edits = JSON.parse(localStorage.getItem('athena_workshops_edits') || '{}');
    edits[id] = {
      ...(edits[id] || {}),
      st: status,
      obs: observacoes !== undefined ? observacoes : (edits[id]?.obs || '')
    };
    localStorage.setItem('athena_workshops_edits', JSON.stringify(edits));
  } catch (e) {
    console.warn('Erro ao salvar edição local de oficina:', e);
  }
}

/**
 * Cancela e remove automaticamente agendamentos da Agenda ao tirar o lead de "Visita Agendada"
 */
export function cancelAppointmentsForLead(leadId, workshopId = null, leadName = '') {
  try {
    const stored = localStorage.getItem('athena_crm_appointments');
    if (!stored) return;
    const list = JSON.parse(stored);
    if (!Array.isArray(list)) return;

    const toRemove = [];
    const remaining = list.filter(apt => {
      const matchCustomerId = apt.customer_id && (
        apt.customer_id === leadId || 
        (workshopId && apt.customer_id === `radar_lead_${workshopId}`) ||
        (workshopId && String(apt.customer_id) === String(workshopId))
      );
      const matchWorkshopId = workshopId && apt.workshop_id && Number(apt.workshop_id) === Number(workshopId);
      const cleanLeadName = (leadName || '').toLowerCase().trim();
      const matchName = cleanLeadName && cleanLeadName.length > 3 && apt.title && apt.title.toLowerCase().includes(cleanLeadName);

      if (matchCustomerId || matchWorkshopId || matchName) {
        toRemove.push(apt.id);
        if (apt.google_event_id) {
          autoRemoveEventFromGoogle(apt.google_event_id);
        }
        return false;
      }
      return true;
    });

    if (toRemove.length > 0) {
      localStorage.setItem('athena_crm_appointments', JSON.stringify(remaining));
      toRemove.forEach(aptId => {
        fetch(`/api/crm/appointments/${aptId}`, { method: 'DELETE' }).catch(() => {});
      });
    }
  } catch (e) {
    console.warn('Erro ao cancelar agendamentos do lead:', e);
  }
}

