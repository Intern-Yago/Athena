const { Pool } = require('pg');

/**
 * Dedicated PostgreSQL Pool for Athena CRM
 * Uses dedicated CRM_DATABASE_URL if provided, or falls back to main DATABASE_URL / SUPABASE_DB_URL
 * so leads and custom stages are permanently preserved in PostgreSQL and never lost on server restarts.
 */
const crmDbUrl = process.env.DATABASE_URL || process.env.CRM_DATABASE_URL || process.env.SUPABASE_DB_URL || '';

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
        slug VARCHAR(120),
        description TEXT,
        color VARCHAR(32) DEFAULT '#f59e0b',
        is_default BOOLEAN DEFAULT false,
        funnel_type VARCHAR(32) DEFAULT 'cliente',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      ALTER TABLE crm_funnels DROP CONSTRAINT IF EXISTS crm_funnels_slug_key;
      ALTER TABLE crm_funnels ADD COLUMN IF NOT EXISTS funnel_type VARCHAR(32) DEFAULT 'cliente';
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
        document VARCHAR(40),
        name VARCHAR(180) NOT NULL,
        phone VARCHAR(40),
        phone2 VARCHAR(40),
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
      ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS document VARCHAR(40);
      ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS phone2 VARCHAR(40);
      ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS customer_id VARCHAR(64) REFERENCES crm_customers(id) ON DELETE SET NULL;
      ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS equipment_id VARCHAR(64) REFERENCES crm_equipments(id) ON DELETE SET NULL;
      ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS negotiated_price NUMERIC(12, 2) DEFAULT 0;
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

    // 5. Equipamentos (Omie Sync + Dimensões + 4 Valores de Venda)
    await client.query(`
      CREATE TABLE IF NOT EXISTS crm_equipments (
        id VARCHAR(64) PRIMARY KEY,
        omie_code VARCHAR(64),
        omie_codigo_produto BIGINT,
        name VARCHAR(255) NOT NULL,
        sku VARCHAR(100),
        image_url TEXT,
        stock INT DEFAULT 0,
        cmc_cost NUMERIC(12,2) DEFAULT 0,
        price_fora_df_cnpj NUMERIC(12,2) DEFAULT 0,
        price_fora_df_cpf NUMERIC(12,2) DEFAULT 0,
        price_dentro_df_cnpj NUMERIC(12,2) DEFAULT 0,
        price_dentro_df_cpf NUMERIC(12,2) DEFAULT 0,
        product_height NUMERIC(8,2) DEFAULT 0,
        product_width NUMERIC(8,2) DEFAULT 0,
        product_depth NUMERIC(8,2) DEFAULT 0,
        product_weight NUMERIC(8,2) DEFAULT 0,
        package_height NUMERIC(8,2) DEFAULT 0,
        package_width NUMERIC(8,2) DEFAULT 0,
        package_depth NUMERIC(8,2) DEFAULT 0,
        package_weight NUMERIC(8,2) DEFAULT 0,
        sync_batch INT DEFAULT 0,
        last_synced_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // 6. Base Central de Clientes do CRM
    await client.query(`
      CREATE TABLE IF NOT EXISTS crm_customers (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(180) NOT NULL,
        fantasy_name VARCHAR(180),
        cpf VARCHAR(20),
        cnpj VARCHAR(25),
        phone VARCHAR(40),
        phone2 VARCHAR(40),
        email VARCHAR(180),
        birthday DATE,
        address TEXT,
        city VARCHAR(100) DEFAULT 'Brasília',
        state VARCHAR(10) DEFAULT 'DF',
        cep VARCHAR(20),
        marital_status VARCHAR(40) DEFAULT 'Solteiro(a)',
        spouse_works_in_shop BOOLEAN DEFAULT false,
        spouse_birthday DATE,
        football_team VARCHAR(80),
        hobbies TEXT,
        category VARCHAR(60) DEFAULT 'Mecânica Geral',
        pipeline_stage VARCHAR(60) DEFAULT 'lead',
        notes TEXT,
        equipments JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS crm_customer_branches (
        id VARCHAR(64) PRIMARY KEY,
        customer_id VARCHAR(64) NOT NULL REFERENCES crm_customers(id) ON DELETE CASCADE,
        label VARCHAR(100) NOT NULL,
        address TEXT NOT NULL,
        neighborhood VARCHAR(100),
        city VARCHAR(100),
        state VARCHAR(10),
        cep VARCHAR(20),
        phone VARCHAR(40),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS crm_customer_history (
        id VARCHAR(64) PRIMARY KEY,
        customer_id VARCHAR(64) NOT NULL REFERENCES crm_customers(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        title VARCHAR(180) NOT NULL,
        details JSONB DEFAULT '{}'::jsonb,
        occurred_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // 7. Agenda de Visitas e Compromissos
    await client.query(`
      CREATE TABLE IF NOT EXISTS crm_appointments (
        id VARCHAR(64) PRIMARY KEY,
        customer_id VARCHAR(64) REFERENCES crm_customers(id) ON DELETE SET NULL,
        title VARCHAR(180) NOT NULL,
        description TEXT,
        start_time TIMESTAMP WITH TIME ZONE NOT NULL,
        end_time TIMESTAMP WITH TIME ZONE NOT NULL,
        type VARCHAR(50) DEFAULT 'visita',
        status VARCHAR(40) DEFAULT 'agendado',
        location TEXT,
        google_event_id VARCHAR(120),
        created_by VARCHAR(120),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Índices de performance
    await client.query(`CREATE INDEX IF NOT EXISTS idx_crm_stages_funnel ON crm_stages(funnel_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_crm_leads_funnel ON crm_leads(funnel_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_crm_leads_stage ON crm_leads(stage_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_crm_leads_ra ON crm_leads(ra_df);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_crm_equipments_sku ON crm_equipments(sku);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_crm_customers_doc ON crm_customers(cpf, cnpj);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_crm_customers_phone ON crm_customers(phone);`);
    await client.query(`ALTER TABLE crm_customers ADD COLUMN IF NOT EXISTS phone2 VARCHAR(40);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_crm_appointments_time ON crm_appointments(start_time);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_crm_workshops_status ON crm_workshops(status_visita);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_crm_workshops_ra ON crm_workshops(regiao_administrativa);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_crm_workshops_name ON crm_workshops(nome_fantasia);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_crm_workshops_cnpj ON crm_workshops(cnpj);`);

    // Ativação mandatória de Row Level Security (RLS) nas tabelas do CRM (Segurança Supabase)
    await client.query(`
      ALTER TABLE crm_funnels ENABLE ROW LEVEL SECURITY;
      ALTER TABLE crm_stages ENABLE ROW LEVEL SECURITY;
      ALTER TABLE crm_leads ENABLE ROW LEVEL SECURITY;
      ALTER TABLE crm_activities ENABLE ROW LEVEL SECURITY;
      ALTER TABLE crm_workshops ENABLE ROW LEVEL SECURITY;
      ALTER TABLE crm_equipments ENABLE ROW LEVEL SECURITY;
      ALTER TABLE crm_customers ENABLE ROW LEVEL SECURITY;
      ALTER TABLE crm_customer_branches ENABLE ROW LEVEL SECURITY;
      ALTER TABLE crm_customer_history ENABLE ROW LEVEL SECURITY;
      ALTER TABLE crm_appointments ENABLE ROW LEVEL SECURITY;
    `);

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
        { id: 'stg_rif_clientes', title: 'Clientes', color: '#10b981', order: 0, is_won: false, is_lost: false },
        { id: 'stg_rif_contato1', title: 'Primeiro Contato', color: '#0ea5e9', order: 1, is_won: false, is_lost: false },
        { id: 'stg_rif_contato2', title: 'Segundo Contato', color: '#3b82f6', order: 2, is_won: false, is_lost: false },
        { id: 'stg_rif_interessados', title: 'Interessados', color: '#f59e0b', order: 3, is_won: false, is_lost: false },
        { id: 'stg_rif_paga', title: 'Cota Paga', color: '#22c55e', order: 4, is_won: true, is_lost: false },
        { id: 'stg_rif_seminteresse', title: 'Sem Interesse', color: '#ef4444', order: 5, is_won: false, is_lost: true }
      ];

      for (const s of f2Stages) {
        await client.query(`
          INSERT INTO crm_stages (id, funnel_id, title, color, "order", is_won, is_lost)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [s.id, f2Id, s.title, s.color, s.order, Boolean(s.is_won), Boolean(s.is_lost)]);
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

/**
 * Heartbeat do Supabase: Executa pings recorrentes e mantém os pools ativos,
 * impedindo que instâncias gratuitas do Supabase pausem por inatividade.
 */
async function pingSupabaseHeartbeat() {
  const results = { crm: false, timestamp: new Date().toISOString() };
  if (crmPool) {
    try {
      await crmPool.query('SELECT 1 as heartbeat');
      results.crm = true;
      console.log(`[Supabase Heartbeat] Ping executado com sucesso no CRM Supabase às ${results.timestamp}`);
    } catch (e) {
      console.warn('[Supabase Heartbeat] Falha no ping CRM:', e.message);
    }
  }
  return results;
}

// Dispara heartbeat a cada 4 horas
const heartbeatInterval = setInterval(pingSupabaseHeartbeat, 4 * 60 * 60 * 1000);
if (heartbeatInterval.unref) heartbeatInterval.unref();

module.exports = {
  crmPool,
  isCrmDbAvailable,
  initCrmSchema,
  pingSupabaseHeartbeat
};
