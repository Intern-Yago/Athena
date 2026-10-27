const { Pool } = require('pg');

/**
 * Dedicated PostgreSQL Pool for Athena CRM
 * Fully isolated from the main e-commerce database to protect free plan egress limits.
 */
const crmDbUrl = process.env.CRM_DATABASE_URL || '';

let crmPool = null;
let isCrmDbAvailable = false;

if (crmDbUrl && crmDbUrl.trim().startsWith('postgres')) {
  try {
    crmPool = new Pool({
      connectionString: crmDbUrl.trim(),
      ssl: crmDbUrl.includes('localhost') ? false : { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000
    });

    crmPool.on('error', (err) => {
      console.error('[CRM Database] Erro inesperado na pool:', err.message);
    });

    isCrmDbAvailable = true;
    console.log('[CRM Database] Conexão configurada para base dedicada do CRM.');
  } catch (err) {
    console.warn('[CRM Database] Falha ao instanciar Pool do CRM:', err.message);
    crmPool = null;
  }
} else {
  console.log('[CRM Database] CRM_DATABASE_URL não configurada ou vazia. Operando com armazenamento em memória / aguardando URI.');
}

/**
 * Inicializa as tabelas do CRM automaticamente quando a conexão estiver ativa.
 */
async function initCrmSchema() {
  if (!crmPool) return false;

  const client = await crmPool.connect();
  try {
    await client.query('BEGIN');

    // 1. Funis do CRM
    await client.query(`
      CREATE TABLE IF NOT EXISTS crm_funnels (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(120) NOT NULL,
        slug VARCHAR(120) UNIQUE NOT NULL,
        description TEXT,
        color VARCHAR(32) DEFAULT '#f59e0b',
        is_default BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // 2. Etapas / Colunas do Kanban
    await client.query(`
      CREATE TABLE IF NOT EXISTS crm_stages (
        id VARCHAR(64) PRIMARY KEY,
        funnel_id VARCHAR(64) NOT NULL REFERENCES crm_funnels(id) ON DELETE CASCADE,
        title VARCHAR(120) NOT NULL,
        color VARCHAR(32) DEFAULT '#64748b',
        "order" INT DEFAULT 0,
        is_won BOOLEAN DEFAULT false,
        is_lost BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // 3. Leads / Clientes nos Funis
    await client.query(`
      CREATE TABLE IF NOT EXISTS crm_leads (
        id VARCHAR(64) PRIMARY KEY,
        funnel_id VARCHAR(64) NOT NULL REFERENCES crm_funnels(id) ON DELETE CASCADE,
        stage_id VARCHAR(64) NOT NULL REFERENCES crm_stages(id) ON DELETE CASCADE,
        name VARCHAR(180) NOT NULL,
        phone VARCHAR(40),
        email VARCHAR(180),
        company VARCHAR(180),
        address TEXT,
        ra_df VARCHAR(100),
        estimated_value NUMERIC(12, 2) DEFAULT 0,
        priority VARCHAR(32) DEFAULT 'medium',
        status VARCHAR(32) DEFAULT 'active',
        notes TEXT,
        assigned_to VARCHAR(120),
        "order" INT DEFAULT 0,
        source VARCHAR(64) DEFAULT 'manual',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // 4. Histórico e Atividades dos Leads
    await client.query(`
      CREATE TABLE IF NOT EXISTS crm_activities (
        id VARCHAR(64) PRIMARY KEY,
        lead_id VARCHAR(64) NOT NULL REFERENCES crm_leads(id) ON DELETE CASCADE,
        type VARCHAR(40) NOT NULL,
        description TEXT NOT NULL,
        created_by VARCHAR(120),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Índices de performance
    await client.query(`CREATE INDEX IF NOT EXISTS idx_crm_stages_funnel ON crm_stages(funnel_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_crm_leads_funnel ON crm_leads(funnel_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_crm_leads_stage ON crm_leads(stage_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_crm_leads_ra ON crm_leads(ra_df);`);

    // Semente inicial de Funis padrões se a tabela estiver vazia
    const countCheck = await client.query('SELECT COUNT(*) FROM crm_funnels');
    if (parseInt(countCheck.rows[0].count, 10) === 0) {
      console.log('[CRM Database] Populando funis e etapas padrão (Cursos, Rifas, Expansão DF)...');

      // Funil 1: Cursos & Treinamentos
      const f1Id = 'fun_cursos_athena';
      await client.query(`
        INSERT INTO crm_funnels (id, name, slug, description, color, is_default)
        VALUES ($1, 'Cursos & Treinamentos', 'cursos', 'Funil de matrículas e interessados nos cursos de diagnóstico automotivo Athena', '#3b82f6', true)
      `, [f1Id]);

      const f1Stages = [
        { id: 'stg_cur_1', title: 'Interesse / Lead Novo', color: '#64748b', order: 0 },
        { id: 'stg_cur_2', title: 'Primeiro Contato Feito', color: '#0ea5e9', order: 1 },
        { id: 'stg_cur_3', title: 'Proposta / Ementa Enviada', color: '#f59e0b', order: 2 },
        { id: 'stg_cur_4', title: 'Aguardando Pagamento', color: '#8b5cf6', order: 3 },
        { id: 'stg_cur_5', title: 'Matrícula Concluída (Ganho)', color: '#10b981', order: 4, is_won: true },
        { id: 'stg_cur_6', title: 'Perdido / Desistência', color: '#ef4444', order: 5, is_lost: true }
      ];

      for (const s of f1Stages) {
        await client.query(`
          INSERT INTO crm_stages (id, funnel_id, title, color, "order", is_won, is_lost)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [s.id, f1Id, s.title, s.color, s.order, Boolean(s.is_won), Boolean(s.is_lost)]);
      }

      // Funil 2: Rifa Elevador Automotivo
      const f2Id = 'fun_rifa_elevador';
      await client.query(`
        INSERT INTO crm_funnels (id, name, slug, description, color)
        VALUES ($1, 'Grande Rifa do Elevador', 'rifa-elevador', 'Prospecção e vendas de cotas da rifa do elevador Mahovi', '#f59e0b')
      `, [f2Id]);

      const f2Stages = [
        { id: 'stg_rif_1', title: 'Interessados', color: '#64748b', order: 0 },
        { id: 'stg_rif_2', title: 'Link Enviado', color: '#0ea5e9', order: 1 },
        { id: 'stg_rif_3', title: 'Números Reservados', color: '#f59e0b', order: 2 },
        { id: 'stg_rif_4', title: 'Cota Paga (Concluído)', color: '#10b981', order: 3, is_won: true }
      ];

      for (const s of f2Stages) {
        await client.query(`
          INSERT INTO crm_stages (id, funnel_id, title, color, "order", is_won, is_lost)
          VALUES ($1, $2, $3, $4, $5, $6, false)
        `, [s.id, f2Id, s.title, s.color, s.order, Boolean(s.is_won)]);
      }

      // Funil 3: Expansão de Oficinas DF (Radar)
      const f3Id = 'fun_expansao_df';
      await client.query(`
        INSERT INTO crm_funnels (id, name, slug, description, color)
        VALUES ($1, 'Expansão de Oficinas DF', 'expansao-df', 'Roteiro de visitas e parcerias com centros automotivos do Distrito Federal', '#8b5cf6')
      `, [f3Id]);

      const f3Stages = [
        { id: 'stg_exp_1', title: 'Oficinas no Radar (A Visitar)', color: '#64748b', order: 0 },
        { id: 'stg_exp_2', title: 'Visita Agendada', color: '#0ea5e9', order: 1 },
        { id: 'stg_exp_3', title: 'Visita Realizada', color: '#f59e0b', order: 2 },
        { id: 'stg_exp_4', title: 'Negociação em Aberto', color: '#ec4899', order: 3 },
        { id: 'stg_exp_5', title: 'Parceria Fechada (Cliente Ativo)', color: '#10b981', order: 4, is_won: true }
      ];

      for (const s of f3Stages) {
        await client.query(`
          INSERT INTO crm_stages (id, funnel_id, title, color, "order", is_won, is_lost)
          VALUES ($1, $2, $3, $4, $5, $6, false)
        `, [s.id, f3Id, s.title, s.color, s.order, Boolean(s.is_won)]);
      }
    }

    await client.query('COMMIT');
    console.log('[CRM Database] Esquema de tabelas do CRM inicializado com sucesso.');
    return true;
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[CRM Database] Erro ao inicializar esquema do CRM:', err.message);
    return false;
  } finally {
    client.release();
  }
}

// Inicia schema se o pool estiver configurado
if (crmPool) {
  initCrmSchema().catch(e => console.warn('[CRM Database] Aviso na checagem de schema:', e.message));
}

module.exports = {
  crmPool,
  isCrmDbAvailable,
  initCrmSchema
};
