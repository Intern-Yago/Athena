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
      { id: 'stg_rif_1', funnel_id: 'fun_rifa_elevador', title: 'Interessados', color: '#64748b', order: 0, is_won: false, is_lost: false },
      { id: 'stg_rif_2', funnel_id: 'fun_rifa_elevador', title: 'Link Enviado', color: '#0ea5e9', order: 1, is_won: false, is_lost: false },
      { id: 'stg_rif_3', funnel_id: 'fun_rifa_elevador', title: 'Números Reservados', color: '#f59e0b', order: 2, is_won: false, is_lost: false },
      { id: 'stg_rif_4', funnel_id: 'fun_rifa_elevador', title: 'Cota Paga (Concluído)', color: '#10b981', order: 3, is_won: true, is_lost: false }
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
  const id = generateId('fun');
  const cleanName = name.trim();
  const slug = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || id;

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

async function createLead({
  funnelId,
  stageId,
  name,
  phone = '',
  email = '',
  company = '',
  address = '',
  ra_df = '',
  estimated_value = 0,
  priority = 'medium',
  notes = '',
  assigned_to = '',
  source = 'manual'
}) {
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
        id, funnel_id, stage_id, name, phone, email, company, address,
        ra_df, estimated_value, priority, notes, assigned_to, source
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `, [
      id, funnelId, targetStage, name.trim(), phone.trim(), email.trim(),
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
    const res = await crmPool.query(`
      UPDATE crm_leads
      SET stage_id = $1,
          "order" = COALESCE($2, "order"),
          updated_at = NOW()
      WHERE id = $3
      RETURNING *
    `, [newStageId, newOrder, leadId]);
    if (res.rows.length === 0) throw new Error('Lead não encontrado.');
    return res.rows[0];
  }

  const lead = memoryLeads.find(l => l.id === leadId);
  if (!lead) throw new Error('Lead não encontrado.');
  lead.stage_id = newStageId;
  if (newOrder !== null) lead.order = newOrder;
  lead.updated_at = new Date().toISOString();
  return lead;
}

async function updateLead(id, data) {
  if (crmPool) {
    const fields = [];
    const params = [];
    const allowed = ['name', 'phone', 'email', 'company', 'address', 'ra_df', 'estimated_value', 'priority', 'status', 'notes', 'assigned_to'];

    for (const key of allowed) {
      if (data[key] !== undefined) {
        params.push(data[key]);
        fields.push(`"${key}" = $${params.length}`);
      }
    }

    if (fields.length === 0) return (await crmPool.query('SELECT * FROM crm_leads WHERE id = $1', [id])).rows[0];

    params.push(id);
    const query = `UPDATE crm_leads SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${params.length} RETURNING *`;
    const res = await crmPool.query(query, params);
    if (res.rows.length === 0) throw new Error('Lead não encontrado.');
    return res.rows[0];
  }

  const idx = memoryLeads.findIndex(l => l.id === id);
  if (idx < 0) throw new Error('Lead não encontrado.');
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
  deleteLead
};
