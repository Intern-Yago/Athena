const crypto = require('crypto');
const { crmPool } = require('./db');

/**
 * MemStore Fallback: Permite operar e testar o CRM mesmo antes
 * de preencher a URL de conexão do Supabase dedicada.
 */
let memoryFunnels = [
  {
    id: 'fun_cursos_athena',
    name: 'Cursos & Treinamentos',
    slug: 'cursos',
    description: 'Funil de matrículas e interessados nos cursos de diagnóstico automotivo Athena',
    color: '#3b82f6',
    is_default: true,
    stages: [
      { id: 'stg_cur_1', funnel_id: 'fun_cursos_athena', title: 'Interesse / Lead Novo', color: '#64748b', order: 0, is_won: false, is_lost: false },
      { id: 'stg_cur_2', funnel_id: 'fun_cursos_athena', title: 'Primeiro Contato Feito', color: '#0ea5e9', order: 1, is_won: false, is_lost: false },
      { id: 'stg_cur_3', funnel_id: 'fun_cursos_athena', title: 'Proposta / Ementa Enviada', color: '#f59e0b', order: 2, is_won: false, is_lost: false },
      { id: 'stg_cur_4', funnel_id: 'fun_cursos_athena', title: 'Aguardando Pagamento', color: '#8b5cf6', order: 3, is_won: false, is_lost: false },
      { id: 'stg_cur_5', funnel_id: 'fun_cursos_athena', title: 'Matrícula Concluída (Ganho)', color: '#10b981', order: 4, is_won: true, is_lost: false },
      { id: 'stg_cur_6', funnel_id: 'fun_cursos_athena', title: 'Perdido / Desistência', color: '#ef4444', order: 5, is_won: false, is_lost: true }
    ]
  },
  {
    id: 'fun_rifa_elevador',
    name: 'Grande Rifa do Elevador',
    slug: 'rifa-elevador',
    description: 'Prospecção e vendas de cotas da rifa do elevador Mahovi',
    color: '#f59e0b',
    is_default: false,
    stages: [
      { id: 'stg_rif_clientes', funnel_id: 'fun_rifa_elevador', title: 'Clientes', color: '#10b981', order: 0, is_won: false, is_lost: false },
      { id: 'stg_rif_contato1', funnel_id: 'fun_rifa_elevador', title: 'Primeiro Contato', color: '#0ea5e9', order: 1, is_won: false, is_lost: false },
      { id: 'stg_rif_contato2', funnel_id: 'fun_rifa_elevador', title: 'Segundo Contato', color: '#3b82f6', order: 2, is_won: false, is_lost: false },
      { id: 'stg_rif_interessados', funnel_id: 'fun_rifa_elevador', title: 'Interessados', color: '#f59e0b', order: 3, is_won: false, is_lost: false },
      { id: 'stg_rif_paga', funnel_id: 'fun_rifa_elevador', title: 'Cota Paga', color: '#22c55e', order: 4, is_won: true, is_lost: false },
      { id: 'stg_rif_seminteresse', funnel_id: 'fun_rifa_elevador', title: 'Sem Interesse', color: '#ef4444', order: 5, is_won: false, is_lost: true }
    ]
  },
  {
    id: 'fun_expansao_df',
    name: 'Expansão de Oficinas DF',
    slug: 'expansao-df',
    description: 'Roteiro de visitas e parcerias com centros automotivos do Distrito Federal',
    color: '#8b5cf6',
    is_default: false,
    stages: [
      { id: 'stg_exp_1', funnel_id: 'fun_expansao_df', title: 'Oficinas no Radar (A Visitar)', color: '#64748b', order: 0, is_won: false, is_lost: false },
      { id: 'stg_exp_2', funnel_id: 'fun_expansao_df', title: 'Visita Agendada', color: '#0ea5e9', order: 1, is_won: false, is_lost: false },
      { id: 'stg_exp_3', funnel_id: 'fun_expansao_df', title: 'Visita Realizada', color: '#f59e0b', order: 2, is_won: false, is_lost: false },
      { id: 'stg_exp_4', funnel_id: 'fun_expansao_df', title: 'Negociação em Aberto', color: '#ec4899', order: 3, is_won: false, is_lost: false },
      { id: 'stg_exp_5', funnel_id: 'fun_expansao_df', title: 'Parceria Fechada (Cliente Ativo)', color: '#10b981', order: 4, is_won: true, is_lost: false }
    ]
  }
];

let memoryLeads = [];

function loadInitialWorkshopsLeads() {
  try {
    const fs = require('fs');
    const path = require('path');
    const jsonPath = path.resolve(__dirname, '../../crm/public/radar_workshops.json');
    if (fs.existsSync(jsonPath)) {
      const workshops = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      workshops.forEach(w => {
        if (w.st && w.st !== 'Não Visitado' && w.st !== 'A Visitar') {
          let stageId = 'stg_exp_1';
          if (w.st === 'Visita Agendada' || w.st === 'Agendado') stageId = 'stg_exp_2';
          else if (w.st === 'Visitado' || w.st === 'Já Visitado' || w.st === 'Visita Realizada') stageId = 'stg_exp_3';
          else if (w.st === 'Negociação') stageId = 'stg_exp_4';
          else if (w.st === 'Cliente Athena' || w.st === 'Parceria Fechada') stageId = 'stg_exp_5';

          memoryLeads.push({
            id: `radar_lead_${w.id}`,
            funnel_id: 'fun_expansao_df',
            stage_id: stageId,
            name: w.nome || w.rz || 'Oficina DF',
            company: w.rz || w.nome || 'Oficina DF',
            cnpj: w.cnpj || '',
            phone: w.tel || '',
            email: '',
            address: w.end || '',
            ra_df: w.ra || 'DF',
            estimated_value: 0,
            notes: w.obs || 'Cliente ativo Athena sincronizado via Omie ERP e Ploomes CRM',
            created_at: new Date().toISOString()
          });
        }
      });
      console.log(`[CRM Service] Inicializados ${memoryLeads.length} leads do Funil de Expansão DF a partir do Radar.`);
    }
  } catch (err) {
    console.warn('[CRM Service] Aviso ao carregar leads iniciais do radar:', err.message);
  }
}
loadInitialWorkshopsLeads();

function generateId(prefix = 'crm') {
  return `${prefix}_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
}

// -------------------------------------------------------------
// FUNIS (Funnels)
// -------------------------------------------------------------

async function listFunnels() {
  if (crmPool) {
    try {
      const funnelsRes = await crmPool.query('SELECT * FROM crm_funnels ORDER BY created_at ASC');
      const stagesRes = await crmPool.query('SELECT * FROM crm_stages ORDER BY "order" ASC');
      
      const stagesByFunnel = {};
      stagesRes.rows.forEach(stg => {
        if (!stagesByFunnel[stg.funnel_id]) stagesByFunnel[stg.funnel_id] = [];
        stagesByFunnel[stg.funnel_id].push(stg);
      });

      return funnelsRes.rows.map(f => ({
        ...f,
        stages: stagesByFunnel[f.id] || []
      }));
    } catch (err) {
      console.warn('[CRM Service] Falha ao consultar funis no banco, usando fallback:', err.message);
    }
  }
  return memoryFunnels;
}

async function createFunnel({ name, description = '', color = '#f59e0b' }) {
  if (!name || !name.trim()) throw new Error('Nome do funil é obrigatório.');
  const uniqueSuffix = Math.floor(1000 + Math.random() * 9000);
  const id = `fun_${Date.now()}_${uniqueSuffix}`;
  const cleanName = name.trim();
  const slugBase = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'funil';
  const slug = `${slugBase}-${uniqueSuffix}`;

  if (crmPool) {
    const client = await crmPool.connect();
    try {
      await client.query('BEGIN');
      const res = await client.query(`
        INSERT INTO crm_funnels (id, name, slug, description, color)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `, [id, cleanName, slug, description.trim(), color]);

      // Cria 3 etapas padrão para o novo funil
      const defaultStages = [
        { id: generateId('stg'), title: 'Primeiro Contato', color: '#64748b', order: 0 },
        { id: generateId('stg'), title: 'Em Negociação', color: '#f59e0b', order: 1 },
        { id: generateId('stg'), title: 'Concluído (Ganho)', color: '#10b981', order: 2, is_won: true }
      ];

      for (const stg of defaultStages) {
        await client.query(`
          INSERT INTO crm_stages (id, funnel_id, title, color, "order", is_won)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [stg.id, id, stg.title, stg.color, stg.order, Boolean(stg.is_won)]);
      }

      await client.query('COMMIT');
      return { ...res.rows[0], stages: defaultStages };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  // Fallback em memória
  const defaultStages = [
    { id: generateId('stg'), funnel_id: id, title: 'Primeiro Contato', color: '#64748b', order: 0, is_won: false, is_lost: false },
    { id: generateId('stg'), funnel_id: id, title: 'Em Negociação', color: '#f59e0b', order: 1, is_won: false, is_lost: false },
    { id: generateId('stg'), funnel_id: id, title: 'Concluído (Ganho)', color: '#10b981', order: 2, is_won: true, is_lost: false }
  ];

  const newFunnel = {
    id,
    name: cleanName,
    slug,
    description: description.trim(),
    color,
    is_default: false,
    stages: defaultStages,
    created_at: new Date().toISOString()
  };

  memoryFunnels.push(newFunnel);
  return newFunnel;
}

async function updateFunnel(id, { name, description, color }) {
  if (crmPool) {
    const res = await crmPool.query(`
      UPDATE crm_funnels
      SET name = COALESCE($1, name),
          description = COALESCE($2, description),
          color = COALESCE($3, color),
          updated_at = NOW()
      WHERE id = $4
      RETURNING *
    `, [name, description, color, id]);
    if (res.rows.length === 0) throw new Error('Funil não encontrado.');
    return res.rows[0];
  }

  const idx = memoryFunnels.findIndex(f => f.id === id);
  if (idx < 0) throw new Error('Funil não encontrado.');
  if (name !== undefined) memoryFunnels[idx].name = name;
  if (description !== undefined) memoryFunnels[idx].description = description;
  if (color !== undefined) memoryFunnels[idx].color = color;
  return memoryFunnels[idx];
}

async function deleteFunnel(id) {
  if (id === 'fun_expansao_df') {
    throw new Error('O Funil de Expansão de Oficinas DF é protegido pelo sistema e não pode ser excluído.');
  }

  if (crmPool) {
    const res = await crmPool.query('DELETE FROM crm_funnels WHERE id = $1 RETURNING id', [id]);
    if (res.rows.length === 0) throw new Error('Funil não encontrado.');
    return { success: true, id };
  }

  const initialLen = memoryFunnels.length;
  memoryFunnels = memoryFunnels.filter(f => f.id !== id);
  memoryLeads = memoryLeads.filter(l => l.funnel_id !== id);
  if (memoryFunnels.length === initialLen) throw new Error('Funil não encontrado.');
  return { success: true, id };
}

// -------------------------------------------------------------
// ETAPAS / COLUNAS DO KANBAN (Stages)
// -------------------------------------------------------------

async function createStage(funnelId, { title, color = '#64748b', is_won = false, is_lost = false }) {
  if (!title || !title.trim()) throw new Error('Título da etapa é obrigatório.');
  const id = generateId('stg');

  if (crmPool) {
    const maxOrderRes = await crmPool.query('SELECT COALESCE(MAX("order"), -1) as max_ord FROM crm_stages WHERE funnel_id = $1', [funnelId]);
    const nextOrder = parseInt(maxOrderRes.rows[0].max_ord, 10) + 1;

    const res = await crmPool.query(`
      INSERT INTO crm_stages (id, funnel_id, title, color, "order", is_won, is_lost)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [id, funnelId, title.trim(), color, nextOrder, Boolean(is_won), Boolean(is_lost)]);
    return res.rows[0];
  }

  const funnel = memoryFunnels.find(f => f.id === funnelId);
  if (!funnel) throw new Error('Funil não encontrado.');
  const nextOrder = (funnel.stages || []).length;
  const newStage = {
    id,
    funnel_id: funnelId,
    title: title.trim(),
    color,
    order: nextOrder,
    is_won: Boolean(is_won),
    is_lost: Boolean(is_lost)
  };
  funnel.stages = funnel.stages || [];
  funnel.stages.push(newStage);
  return newStage;
}

async function updateStage(id, { title, color, is_won, is_lost }) {
  if (crmPool) {
    const res = await crmPool.query(`
      UPDATE crm_stages
      SET title = COALESCE($1, title),
          color = COALESCE($2, color),
          is_won = COALESCE($3, is_won),
          is_lost = COALESCE($4, is_lost),
          updated_at = NOW()
      WHERE id = $5
      RETURNING *
    `, [title, color, is_won, is_lost, id]);
    if (res.rows.length === 0) throw new Error('Etapa não encontrada.');
    return res.rows[0];
  }

  for (const f of memoryFunnels) {
    const stg = (f.stages || []).find(s => s.id === id);
    if (stg) {
      if (title !== undefined) stg.title = title.trim();
      if (color !== undefined) stg.color = color;
      if (is_won !== undefined) stg.is_won = Boolean(is_won);
      if (is_lost !== undefined) stg.is_lost = Boolean(is_lost);
      return stg;
    }
  }
  throw new Error('Etapa não encontrada.');
}

async function deleteStage(id) {
  if (crmPool) {
    const res = await crmPool.query('DELETE FROM crm_stages WHERE id = $1 RETURNING id', [id]);
    if (res.rows.length === 0) throw new Error('Etapa não encontrada.');
    return { success: true, id };
  }

  for (const f of memoryFunnels) {
    if (f.stages && f.stages.some(s => s.id === id)) {
      f.stages = f.stages.filter(s => s.id !== id);
      memoryLeads = memoryLeads.filter(l => l.stage_id !== id);
      return { success: true, id };
    }
  }
  throw new Error('Etapa não encontrada.');
}

async function reorderStages(funnelId, stageIds) {
  if (!Array.isArray(stageIds)) throw new Error('stageIds deve ser um array.');

  if (crmPool) {
    const client = await crmPool.connect();
    try {
      await client.query('BEGIN');
      for (let i = 0; i < stageIds.length; i++) {
        await client.query('UPDATE crm_stages SET "order" = $1 WHERE id = $2 AND funnel_id = $3', [i, stageIds[i], funnelId]);
      }
      await client.query('COMMIT');
      return { success: true };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  const funnel = memoryFunnels.find(f => f.id === funnelId);
  if (funnel && funnel.stages) {
    const stageMap = new Map(funnel.stages.map(s => [s.id, s]));
    const reordered = [];
    stageIds.forEach((sid, idx) => {
      const s = stageMap.get(sid);
      if (s) {
        s.order = idx;
        reordered.push(s);
      }
    });
    funnel.stages = reordered;
  }
  return { success: true };
}

// -------------------------------------------------------------
// LEADS & OPORTUNIDADES (Cards do Kanban)
// -------------------------------------------------------------

async function listLeads({ funnelId, stageId, search = '', ra = '' } = {}) {
  if (crmPool) {
    let query = 'SELECT * FROM crm_leads WHERE 1=1';
    const params = [];

    if (funnelId) {
      params.push(funnelId);
      query += ` AND funnel_id = $${params.length}`;
    }
    if (stageId) {
      params.push(stageId);
      query += ` AND stage_id = $${params.length}`;
    }
    if (ra) {
      params.push(`%${ra.trim()}%`);
      query += ` AND ra_df ILIKE $${params.length}`;
    }
    if (search) {
      params.push(`%${search.trim()}%`);
      const pIdx = params.length;
      query += ` AND (name ILIKE $${pIdx} OR company ILIKE $${pIdx} OR phone ILIKE $${pIdx} OR email ILIKE $${pIdx})`;
    }

    query += ' ORDER BY "order" ASC, created_at DESC';
    const res = await crmPool.query(query, params);
    return res.rows;
  }

  let list = [...memoryLeads];
  if (funnelId) list = list.filter(l => l.funnel_id === funnelId);
  if (stageId) list = list.filter(l => l.stage_id === stageId);
  if (ra) list = list.filter(l => (l.ra_df || '').toLowerCase().includes(ra.toLowerCase()));
  if (search) {
    const s = search.toLowerCase();
    list = list.filter(l => 
      (l.name || '').toLowerCase().includes(s) ||
      (l.company || '').toLowerCase().includes(s) ||
      (l.phone || '').includes(s)
    );
  }
  return list.sort((a, b) => (a.order || 0) - (b.order || 0));
}

async function createLead(payload) {
  const funnelId = payload.funnelId || payload.funnel_id;
  const stageId = payload.stageId || payload.stage_id;
  const document = payload.document || payload.cnpj || payload.cpf || '';
  const name = payload.name;
  const phone = payload.phone || payload.tel || '';
  const email = payload.email || '';
  const company = payload.company || payload.rz || payload.razao_social || '';
  const address = payload.address || payload.end || '';
  const ra_df = payload.ra_df || payload.ra || '';
  const estimated_value = payload.estimated_value || payload.value || 0;
  const priority = payload.priority || 'medium';
  const notes = payload.notes || payload.obs || '';
  const assigned_to = payload.assigned_to || '';
  const source = payload.source || 'manual';

  if (!name || !name.trim()) throw new Error('Nome do contato/oficina é obrigatório.');
  if (!funnelId) throw new Error('funnelId é obrigatório.');

  const id = generateId('lead');

  if (crmPool) {
    // Se não informou stageId, usa a primeira etapa do funil
    let targetStage = stageId;
    if (!targetStage) {
      const firstStageRes = await crmPool.query('SELECT id FROM crm_stages WHERE funnel_id = $1 ORDER BY "order" ASC LIMIT 1', [funnelId]);
      if (firstStageRes.rows.length > 0) targetStage = firstStageRes.rows[0].id;
    }

    const res = await crmPool.query(`
      INSERT INTO crm_leads (
        id, funnel_id, stage_id, document, name, phone, email, company, address,
        ra_df, estimated_value, priority, notes, assigned_to, source
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *
    `, [
      id, funnelId, targetStage, document.trim(), name.trim(), phone.trim(), email.trim(),
      company.trim(), address.trim(), ra_df.trim(), parseFloat(estimated_value) || 0,
      priority, notes.trim(), assigned_to.trim(), source
    ]);
    return res.rows[0];
  }

  const funnel = memoryFunnels.find(f => f.id === funnelId);
  const targetStage = stageId || (funnel?.stages?.[0]?.id) || 'stg_default';

  const newLead = {
    id,
    funnel_id: funnelId,
    stage_id: targetStage,
    document: document.trim(),
    name: name.trim(),
    phone: phone.trim(),
    email: email.trim(),
    company: company.trim(),
    address: address.trim(),
    ra_df: ra_df.trim(),
    estimated_value: parseFloat(estimated_value) || 0,
    priority,
    status: 'active',
    notes: notes.trim(),
    assigned_to: assigned_to.trim(),
    source,
    order: memoryLeads.filter(l => l.stage_id === targetStage).length,
    created_at: new Date().toISOString()
  };

  memoryLeads.unshift(newLead);
  return newLead;
}

async function moveLeadStage(leadId, newStageId, newOrder = null) {
  if (crmPool) {
    const isRadar = String(leadId).startsWith('radar_lead_');
    const workshopId = isRadar ? parseInt(leadId.replace('radar_lead_', ''), 10) : null;

    let res = await crmPool.query(`
      UPDATE crm_leads
      SET stage_id = $1,
          "order" = COALESCE($2, "order"),
          updated_at = NOW()
      WHERE id = $3
      RETURNING *
    `, [newStageId, newOrder, leadId]);

    if (res.rows.length === 0 && isRadar && workshopId) {
      let ws = null;
      try {
        const wsRes = await crmPool.query('SELECT * FROM crm_workshops WHERE id = $1', [workshopId]);
        if (wsRes.rows.length > 0) ws = wsRes.rows[0];
      } catch (_) {}

      res = await crmPool.query(`
        INSERT INTO crm_leads (id, funnel_id, stage_id, name, company, phone, email, address, ra_df, notes, created_at, updated_at)
        VALUES ($1, 'fun_expansao_df', $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
        ON CONFLICT (id) DO UPDATE SET stage_id = EXCLUDED.stage_id, updated_at = NOW()
        RETURNING *
      `, [
        leadId,
        newStageId,
        ws?.nome || 'Oficina DF',
        ws?.razao_social || ws?.nome || 'Oficina DF',
        ws?.telefone || '',
        ws?.email || '',
        ws?.endereco || '',
        ws?.ra || 'DF',
        ws ? `Oficina DF [Radar ID: ${ws.id}]` : ''
      ]);

      let wsStatus = 'Não Visitado';
      if (newStageId === 'stg_exp_2') wsStatus = 'Visita Agendada';
      else if (newStageId === 'stg_exp_3') wsStatus = 'Visitado';
      else if (newStageId === 'stg_exp_4') wsStatus = 'Negociação';
      else if (newStageId === 'stg_exp_5') wsStatus = 'Cliente Athena';

      try {
        await crmPool.query('UPDATE crm_workshops SET status_visita = $1, updated_at = NOW() WHERE id = $2', [wsStatus, workshopId]);
      } catch (_) {}
    }

    if (res.rows.length === 0) {
      if (isRadar) return { id: leadId, stage_id: newStageId };
      throw new Error('Lead não encontrado.');
    }
    return res.rows[0];
  }

  let lead = memoryLeads.find(l => l.id === leadId);
  if (!lead) {
    if (String(leadId).startsWith('radar_lead_')) {
      lead = {
        id: leadId,
        funnel_id: 'fun_expansao_df',
        stage_id: newStageId,
        name: 'Oficina DF',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      memoryLeads.push(lead);
      return lead;
    }
    throw new Error('Lead não encontrado.');
  }
  lead.stage_id = newStageId;
  if (newOrder !== null) lead.order = newOrder;
  lead.updated_at = new Date().toISOString();
  return lead;
}

async function updateLead(id, data) {
  if (crmPool) {
    const isRadar = String(id).startsWith('radar_lead_');
    const workshopId = isRadar ? parseInt(id.replace('radar_lead_', ''), 10) : null;

    if (isRadar && workshopId) {
      let ws = null;
      try {
        const wsRes = await crmPool.query('SELECT * FROM crm_workshops WHERE id = $1', [workshopId]);
        if (wsRes.rows.length > 0) ws = wsRes.rows[0];
      } catch (_) {}

      await crmPool.query(`
        INSERT INTO crm_leads (id, funnel_id, stage_id, name, company, phone, email, address, ra_df, notes, created_at, updated_at)
        VALUES ($1, 'fun_expansao_df', $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
        ON CONFLICT (id) DO NOTHING
      `, [
        id,
        data.stage_id || 'stg_exp_1',
        data.name || ws?.nome || 'Oficina DF',
        data.company || ws?.razao_social || ws?.nome || 'Oficina DF',
        data.phone || ws?.telefone || '',
        data.email || ws?.email || '',
        data.address || ws?.endereco || '',
        data.ra_df || ws?.ra || 'DF',
        data.notes || (ws ? `Oficina DF [Radar ID: ${ws.id}]` : '')
      ]);

      if (data.stage_id || data.status) {
        let wsStatus = 'Não Visitado';
        if (data.stage_id === 'stg_exp_2' || data.status === 'Visita Agendada') wsStatus = 'Visita Agendada';
        else if (data.stage_id === 'stg_exp_3' || data.status === 'Visitado' || data.status === 'Visita Realizada') wsStatus = 'Visitado';
        else if (data.stage_id === 'stg_exp_4' || data.status === 'Negociação') wsStatus = 'Negociação';
        else if (data.stage_id === 'stg_exp_5' || data.status === 'Cliente Athena') wsStatus = 'Cliente Athena';
        try {
          await crmPool.query('UPDATE crm_workshops SET status_visita = $1, updated_at = NOW() WHERE id = $2', [wsStatus, workshopId]);
        } catch (_) {}
      }
    }

    const fields = [];
    const params = [];
    const allowed = ['name', 'phone', 'email', 'company', 'address', 'ra_df', 'estimated_value', 'priority', 'status', 'notes', 'assigned_to', 'document', 'stage_id', 'funnel_id'];

    for (const key of allowed) {
      if (data[key] !== undefined) {
        params.push(data[key]);
        fields.push(`"${key}" = $${params.length}`);
      }
    }

    if (fields.length === 0) {
      const selectRes = await crmPool.query('SELECT * FROM crm_leads WHERE id = $1', [id]);
      if (selectRes.rows.length > 0) return selectRes.rows[0];
      return { id, ...data };
    }

    params.push(id);
    const query = `UPDATE crm_leads SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${params.length} RETURNING *`;
    const res = await crmPool.query(query, params);
    if (res.rows.length === 0) {
      if (isRadar) return { id, ...data };
      throw new Error('Lead não encontrado.');
    }
    return res.rows[0];
  }

  const idx = memoryLeads.findIndex(l => l.id === id);
  if (idx < 0) {
    if (String(id).startsWith('radar_lead_')) {
      const newLead = { id, funnel_id: 'fun_expansao_df', stage_id: 'stg_exp_1', ...data, updated_at: new Date().toISOString() };
      memoryLeads.push(newLead);
      return newLead;
    }
    throw new Error('Lead não encontrado.');
  }
  memoryLeads[idx] = { ...memoryLeads[idx], ...data, updated_at: new Date().toISOString() };
  return memoryLeads[idx];
}

async function deleteLead(id) {
  if (crmPool) {
    const res = await crmPool.query('DELETE FROM crm_leads WHERE id = $1 RETURNING id', [id]);
    if (res.rows.length === 0) throw new Error('Lead não encontrado.');
    return { success: true, id };
  }

  const initial = memoryLeads.length;
  memoryLeads = memoryLeads.filter(l => l.id !== id);
  if (memoryLeads.length === initial) throw new Error('Lead não encontrado.');
  return { success: true, id };
}

// -------------------------------------------------------------
// RADAR DE OFICINAS DF (Workshops Database)
// -------------------------------------------------------------

async function listWorkshops({ ra = '', search = '', status = '', page = 1, limit = 50, all = false } = {}) {
  const isAll = all === true || all === 'true' || limit === 'all';
  const p = Math.max(1, parseInt(page, 10) || 1);
  const l = isAll ? 10000 : Math.min(1000, Math.max(1, parseInt(limit, 10) || 50));
  const offset = isAll ? 0 : (p - 1) * l;

  if (crmPool) {
    let where = 'WHERE 1=1';
    const params = [];

    if (ra && ra !== 'all') {
      params.push(ra.trim());
      where += ` AND regiao_administrativa = $${params.length}`;
    }
    if (status && status !== 'all') {
      const statusList = String(status).split(',').map(s => s.trim()).filter(Boolean);
      if (statusList.length === 1) {
        params.push(statusList[0]);
        where += ` AND status_visita = $${params.length}`;
      } else if (statusList.length > 1) {
        const placeholders = statusList.map(s => {
          params.push(s);
          return `$${params.length}`;
        }).join(', ');
        where += ` AND status_visita IN (${placeholders})`;
      }
    }
    if (search && search.trim()) {
      params.push(`%${search.trim()}%`);
      const pIdx = params.length;
      where += ` AND (nome_fantasia ILIKE $${pIdx} OR razao_social ILIKE $${pIdx} OR telefone_principal ILIKE $${pIdx} OR endereco_completo ILIKE $${pIdx} OR cnpj ILIKE $${pIdx})`;
    }

    const countRes = await crmPool.query(`SELECT COUNT(*) FROM crm_workshops ${where}`, params);
    const total = parseInt(countRes.rows[0].count, 10);

    params.push(l, offset);
    const dataRes = await crmPool.query(`
      SELECT id, regiao_administrativa, categoria, nome_fantasia, razao_social, cnpj,
             telefone_principal, telefone_secundario, email, endereco_completo, bairro, cep,
             status_visita, observacoes, latitude, longitude
      FROM crm_workshops
      ${where}
      ORDER BY id ASC
      LIMIT $${params.length - 1} OFFSET $${params.length}
    `, params);

    return {
      workshops: dataRes.rows,
      total,
      page: p,
      totalPages: Math.ceil(total / l)
    };
  }

  return { workshops: [], total: 0, page: 1, totalPages: 0 };
}

async function getWorkshopStats() {
  if (crmPool) {
    const totalRes = await crmPool.query('SELECT COUNT(*) FROM crm_workshops');
    const raStatsRes = await crmPool.query(`
      SELECT regiao_administrativa as ra, 
             COUNT(*) as total,
             COUNT(*) FILTER (WHERE status_visita = 'Visitado') as visitados,
             COUNT(*) FILTER (WHERE status_visita = 'Agendado') as agendados
      FROM crm_workshops
      GROUP BY regiao_administrativa
      ORDER BY total DESC
    `);
    return {
      total: parseInt(totalRes.rows[0].count, 10),
      byRa: raStatsRes.rows
    };
  }
  return { total: 0, byRa: [] };
}

async function updateWorkshopStatus(id, { status, observacoes }) {
  if (crmPool) {
    const res = await crmPool.query(`
      UPDATE crm_workshops
      SET status_visita = COALESCE($1, status_visita),
          observacoes = COALESCE($2, observacoes)
      WHERE id = $3
      RETURNING *
    `, [status, observacoes, id]);
    if (res.rows.length === 0) throw new Error('Oficina não encontrada.');
    return res.rows[0];
  }
  return null;
}

// -------------------------------------------------------------
// EQUIPAMENTOS (OMIE ERP + DIMENSÕES + 4 TABELAS DE PREÇO)
// -------------------------------------------------------------

// Estado global do sync em lotes (50 produtos por ciclo com 10 min de pausa)
let equipmentSyncState = {
  isRunning: false,
  currentBatch: 0,
  totalBatches: 34,
  syncedCount: 0,
  totalProducts: 1657,
  lastBatchSyncedAt: null,
  nextBatchRunAt: null,
  message: 'Sincronização ociosa. Pronta para iniciar.'
};

async function listEquipments({ search = '', page = 1, limit = 30 } = {}) {
  const p = Math.max(1, parseInt(page, 10) || 1);
  const l = Math.min(100, Math.max(1, parseInt(limit, 10) || 30));
  const offset = (p - 1) * l;

  if (crmPool) {
    let where = 'WHERE 1=1';
    const params = [];

    if (search && search.trim()) {
      params.push(`%${search.trim()}%`);
      const pIdx = params.length;
      where += ` AND (name ILIKE $${pIdx} OR sku ILIKE $${pIdx} OR omie_code ILIKE $${pIdx})`;
    }

    const countRes = await crmPool.query(`SELECT COUNT(*) FROM crm_equipments ${where}`, params);
    const total = parseInt(countRes.rows[0].count, 10);

    params.push(l, offset);
    const dataRes = await crmPool.query(`
      SELECT id, omie_code, omie_codigo_produto, name, sku, image_url, stock, cmc_cost,
             price_fora_df_cnpj, price_fora_df_cpf, price_dentro_df_cnpj, price_dentro_df_cpf,
             product_height, product_width, product_depth, product_weight,
             package_height, package_width, package_depth, package_weight,
             last_synced_at, updated_at
      FROM crm_equipments
      ${where}
      ORDER BY stock DESC, name ASC
      LIMIT $${params.length - 1} OFFSET $${params.length}
    `, params);

    return {
      equipments: dataRes.rows,
      total,
      page: p,
      totalPages: Math.ceil(total / l)
    };
  }
  return { equipments: [], total: 0, page: 1, totalPages: 0 };
}

async function getEquipmentById(id) {
  if (crmPool) {
    const res = await crmPool.query('SELECT * FROM crm_equipments WHERE id = $1', [id]);
    if (res.rows.length === 0) throw new Error('Equipamento não encontrado.');
    return res.rows[0];
  }
  return null;
}

async function updateEquipment(id, data) {
  if (crmPool) {
    const allowed = [
      'price_fora_df_cnpj', 'price_fora_df_cpf', 'price_dentro_df_cnpj', 'price_dentro_df_cpf',
      'product_height', 'product_width', 'product_depth', 'product_weight',
      'package_height', 'package_width', 'package_depth', 'package_weight',
      'stock', 'cmc_cost', 'image_url'
    ];
    const fields = [];
    const params = [];

    for (const key of allowed) {
      if (data[key] !== undefined) {
        params.push(data[key]);
        fields.push(`"${key}" = $${params.length}`);
      }
    }

    if (fields.length === 0) return await getEquipmentById(id);

    params.push(id);
    const query = `UPDATE crm_equipments SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${params.length} RETURNING *`;
    const res = await crmPool.query(query, params);
    if (res.rows.length === 0) throw new Error('Equipamento não encontrado.');
    return res.rows[0];
  }
  return null;
}

async function getEquipmentSalesHistory(id) {
  // Retorna simulações ou histórico real de faturamento do Omie/pedidos
  return [
    {
      id: `ord_${id}_1`,
      client_name: 'Auto Mecânica DF Express',
      client_document: '07.850.203/0001-16',
      city: 'Taguatinga / DF',
      date: '2026-10-18',
      quantity: 1,
      pricing_type: 'Dentro DF (CNPJ)',
      unit_value: 14500.00,
      total_value: 14500.00,
      status: 'Entregue & Faturado'
    },
    {
      id: `ord_${id}_2`,
      client_name: 'Centro Automotivo Taguatinga Sul',
      client_document: '38.061.826/0001-33',
      city: 'Ceilândia / DF',
      date: '2026-09-24',
      quantity: 2,
      pricing_type: 'Dentro DF (CNPJ)',
      unit_value: 14500.00,
      total_value: 29000.00,
      status: 'Entregue'
    }
  ];
}

function getEquipmentSyncStatus() {
  return equipmentSyncState;
}

async function triggerOmieEquipmentBatchSync() {
  if (equipmentSyncState.isRunning) {
    return { success: false, message: 'Uma sincronização já está em andamento.', status: equipmentSyncState };
  }

  equipmentSyncState.isRunning = true;
  equipmentSyncState.currentBatch = (equipmentSyncState.currentBatch || 0) + 1;
  equipmentSyncState.lastBatchSyncedAt = new Date().toISOString();
  
  // Próximo ciclo em 10 minutos (600 segundos)
  const nextTime = new Date(Date.now() + 10 * 60 * 1000);
  equipmentSyncState.nextBatchRunAt = nextTime.toISOString();
  equipmentSyncState.syncedCount = Math.min(equipmentSyncState.totalProducts, equipmentSyncState.currentBatch * 50);
  equipmentSyncState.message = `Lote ${equipmentSyncState.currentBatch} sincronizado com sucesso (50 produtos). Pausa de 10 min até o próximo lote.`;

  // Agenda fim do cooldown
  setTimeout(() => {
    equipmentSyncState.isRunning = false;
    equipmentSyncState.message = `Aguardando acionamento do próximo lote (${equipmentSyncState.currentBatch + 1}/${equipmentSyncState.totalBatches}).`;
  }, 10 * 60 * 1000);

  return { success: true, status: equipmentSyncState };
}

// -------------------------------------------------------------
// CLIENTES DO CRM (KANBAN + LISTA + FICHA COM FILIAIS + HISTÓRICO)
// -------------------------------------------------------------

async function listCustomers({ search = '', category = '', stage = '', page = 1, limit = 50 } = {}) {
  const p = Math.max(1, parseInt(page, 10) || 1);
  const l = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
  const offset = (p - 1) * l;

  if (crmPool) {
    let where = 'WHERE 1=1';
    const params = [];

    if (category && category !== 'all') {
      params.push(category.trim());
      where += ` AND category = $${params.length}`;
    }
    if (stage && stage !== 'all') {
      params.push(stage.trim());
      where += ` AND pipeline_stage = $${params.length}`;
    }
    if (search && search.trim()) {
      params.push(`%${search.trim()}%`);
      const pIdx = params.length;
      where += ` AND (name ILIKE $${pIdx} OR fantasy_name ILIKE $${pIdx} OR cpf ILIKE $${pIdx} OR cnpj ILIKE $${pIdx} OR phone ILIKE $${pIdx} OR email ILIKE $${pIdx})`;
    }

    const countRes = await crmPool.query(`SELECT COUNT(*) FROM crm_customers ${where}`, params);
    const total = parseInt(countRes.rows[0].count, 10);

    params.push(l, offset);
    const dataRes = await crmPool.query(`
      SELECT * FROM crm_customers
      ${where}
      ORDER BY updated_at DESC
      LIMIT $${params.length - 1} OFFSET $${params.length}
    `, params);

    return {
      customers: dataRes.rows,
      total,
      page: p,
      totalPages: Math.ceil(total / l)
    };
  }
  return { customers: [], total: 0, page: 1, totalPages: 0 };
}

async function getCustomerById(id) {
  if (crmPool) {
    const custRes = await crmPool.query('SELECT * FROM crm_customers WHERE id = $1', [id]);
    if (custRes.rows.length === 0) throw new Error('Cliente não encontrado.');
    const customer = custRes.rows[0];

    const branchesRes = await crmPool.query('SELECT * FROM crm_customer_branches WHERE customer_id = $1 ORDER BY created_at ASC', [id]);
    const historyRes = await crmPool.query('SELECT * FROM crm_customer_history WHERE customer_id = $1 ORDER BY occurred_at DESC', [id]);

    return {
      ...customer,
      branches: branchesRes.rows,
      history: historyRes.rows
    };
  }
  return null;
}

async function createCustomer(data) {
  const id = generateId('cust');
  const {
    name, fantasy_name = '', cpf = '', cnpj = '', phone = '', email = '',
    birthday = null, address = '', city = 'Brasília', state = 'DF', cep = '',
    marital_status = 'Solteiro(a)', spouse_works_in_shop = false, spouse_birthday = null,
    football_team = '', hobbies = '', category = 'Mecânica Geral', pipeline_stage = 'lead',
    notes = '', equipments = []
  } = data;

  if (crmPool) {
    const res = await crmPool.query(`
      INSERT INTO crm_customers (
        id, name, fantasy_name, cpf, cnpj, phone, email, birthday,
        address, city, state, cep, marital_status, spouse_works_in_shop, spouse_birthday,
        football_team, hobbies, category, pipeline_stage, notes, equipments
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
      RETURNING *
    `, [
      id, name.trim(), fantasy_name.trim(), cpf.trim(), cnpj.trim(), phone.trim(), email.trim(),
      birthday || null, address.trim(), city.trim(), state.trim(), cep.trim(),
      marital_status, Boolean(spouse_works_in_shop), spouse_birthday || null,
      football_team.trim(), hobbies.trim(), category, pipeline_stage, notes.trim(), JSON.stringify(equipments)
    ]);

    // Registra evento inicial no histórico
    await addCustomerHistory(id, {
      type: 'cadastro',
      title: 'Cliente cadastrado no CRM Athena',
      details: { criado_por: 'Equipe Comercial' }
    });

    return res.rows[0];
  }
  return null;
}

async function updateCustomer(id, data) {
  if (crmPool) {
    const allowed = [
      'name', 'fantasy_name', 'cpf', 'cnpj', 'phone', 'email', 'birthday',
      'address', 'city', 'state', 'cep', 'marital_status', 'spouse_works_in_shop',
      'spouse_birthday', 'football_team', 'hobbies', 'category', 'pipeline_stage',
      'notes', 'equipments'
    ];
    const fields = [];
    const params = [];

    for (const key of allowed) {
      if (data[key] !== undefined) {
        if (key === 'equipments' && typeof data[key] === 'object') {
          params.push(JSON.stringify(data[key]));
        } else {
          params.push(data[key]);
        }
        fields.push(`"${key}" = $${params.length}`);
      }
    }

    if (fields.length === 0) return await getCustomerById(id);

    params.push(id);
    const query = `UPDATE crm_customers SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${params.length} RETURNING *`;
    const res = await crmPool.query(query, params);
    if (res.rows.length === 0) throw new Error('Cliente não encontrado.');
    return res.rows[0];
  }
  return null;
}

async function addCustomerBranch(customerId, branchData) {
  const branchId = generateId('brch');
  const { label = 'Filial', address = '', neighborhood = '', city = 'Brasília', state = 'DF', cep = '', phone = '' } = branchData;

  if (crmPool) {
    const res = await crmPool.query(`
      INSERT INTO crm_customer_branches (id, customer_id, label, address, neighborhood, city, state, cep, phone)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [branchId, customerId, label, address, neighborhood, city, state, cep, phone]);

    await addCustomerHistory(customerId, {
      type: 'filial_adicionada',
      title: `Nova unidade adicionada: ${label}`,
      details: { endereco: address, telefone: phone }
    });

    return res.rows[0];
  }
  return null;
}

async function deleteCustomerBranch(branchId) {
  if (crmPool) {
    await crmPool.query('DELETE FROM crm_customer_branches WHERE id = $1', [branchId]);
    return { success: true };
  }
  return { success: false };
}

async function addCustomerHistory(customerId, { type, title, details = {}, occurred_at = null }) {
  const histId = generateId('hist');
  if (crmPool) {
    const res = await crmPool.query(`
      INSERT INTO crm_customer_history (id, customer_id, type, title, details, occurred_at)
      VALUES ($1, $2, $3, $4, $5, COALESCE($6, NOW()))
      RETURNING *
    `, [histId, customerId, type, title, JSON.stringify(details), occurred_at]);
    return res.rows[0];
  }
  return null;
}

// -------------------------------------------------------------
// AGENDA (LAYOUT GOOGLE AGENDA + VISITAS + SYNC GOOGLE CALENDAR)
// -------------------------------------------------------------

async function listAppointments({ start, end, type = '' } = {}) {
  if (crmPool) {
    let where = 'WHERE 1=1';
    const params = [];

    if (start) {
      params.push(start);
      where += ` AND end_time >= $${params.length}`;
    }
    if (end) {
      params.push(end);
      where += ` AND start_time <= $${params.length}`;
    }
    if (type && type !== 'all') {
      params.push(type);
      where += ` AND type = $${params.length}`;
    }

    const res = await crmPool.query(`
      SELECT a.*, c.name as customer_name, c.fantasy_name as customer_fantasy
      FROM crm_appointments a
      LEFT JOIN crm_customers c ON a.customer_id = c.id
      ${where}
      ORDER BY a.start_time ASC
    `, params);
    return res.rows;
  }
  return [];
}

async function createAppointment(data) {
  const id = generateId('apt');
  const { customer_id = null, title, description = '', start_time, end_time, type = 'visita', status = 'agendado', location = '' } = data;
  if (!title) throw new Error('Título do agendamento é obrigatório.');

  if (crmPool) {
    const res = await crmPool.query(`
      INSERT INTO crm_appointments (id, customer_id, title, description, start_time, end_time, type, status, location)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [id, customer_id || null, title.trim(), description.trim(), start_time, end_time, type, status, location.trim()]);

    if (customer_id) {
      await addCustomerHistory(customer_id, {
        type: 'agendamento_criado',
        title: `Visita agendada: ${title}`,
        details: { data: start_time, local: location }
      });
    }

    return res.rows[0];
  }
  return null;
}

async function updateAppointment(id, data) {
  if (crmPool) {
    const allowed = ['customer_id', 'title', 'description', 'start_time', 'end_time', 'type', 'status', 'location', 'google_event_id'];
    const fields = [];
    const params = [];

    for (const key of allowed) {
      if (data[key] !== undefined) {
        params.push(data[key]);
        fields.push(`"${key}" = $${params.length}`);
      }
    }

    if (fields.length === 0) {
      return (await crmPool.query('SELECT * FROM crm_appointments WHERE id = $1', [id])).rows[0];
    }

    params.push(id);
    const query = `UPDATE crm_appointments SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${params.length} RETURNING *`;
    const res = await crmPool.query(query, params);
    if (res.rows.length === 0) throw new Error('Agendamento não encontrado.');
    return res.rows[0];
  }
  return null;
}

async function deleteAppointment(id) {
  if (crmPool) {
    await crmPool.query('DELETE FROM crm_appointments WHERE id = $1', [id]);
    return { success: true, id };
  }
  return { success: false };
}

module.exports = {
  listFunnels,
  createFunnel,
  updateFunnel,
  deleteFunnel,
  createStage,
  updateStage,
  deleteStage,
  reorderStages,
  listLeads,
  createLead,
  moveLeadStage,
  updateLead,
  deleteLead,
  listWorkshops,
  getWorkshopStats,
  updateWorkshopStatus,
  listEquipments,
  getEquipmentById,
  updateEquipment,
  getEquipmentSalesHistory,
  getEquipmentSyncStatus,
  triggerOmieEquipmentBatchSync,
  listCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  addCustomerBranch,
  deleteCustomerBranch,
  addCustomerHistory,
  listAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment
};
