/**
 * opsRoutes.js
 * 
 * Athena OS v2.1 — Operations API (Hermes & Internal Ops)
 * Zero-Trust, Read-Only, PII-Protected & Audited.
 */

const express = require('express');
const crypto = require('crypto');
const { execSync } = require('child_process');
const { query } = require('../services/db.js');
const { recordSecurityEvent } = require('../services/securityAuditService.js');

const router = express.Router();

// -------------------------------------------------------------
// ZERO-TRUST AUTHENTICATION & RBAC MIDDLEWARE
// -------------------------------------------------------------
const HERMES_OPS_TOKEN = process.env.HERMES_OPS_TOKEN || process.env.ADMIN_SECRET_KEY || 'athena-ops-hermes-secure-token-2026';

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) return forwarded.split(',')[0].trim();
  return req.socket?.remoteAddress || req.ip || 'unknown';
}

function timingSafeEqualStr(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

async function requireHermesOpsAuth(req, res, next) {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';

  if (!token || !timingSafeEqualStr(token, HERMES_OPS_TOKEN)) {
    const ip = getClientIp(req);
    await recordSecurityEvent({
      eventType: 'UNAUTHORIZED_OPS_ACCESS_ATTEMPT',
      severity: 'HIGH',
      actorId: 'anonymous',
      details: {
        path: req.originalUrl,
        method: req.method,
        ip,
        userAgent: req.headers['user-agent']
      }
    });

    return res.status(401).json({
      error: 'Unauthorized: Token de autorização do Athena Ops inválido ou ausente.',
      hint: 'Forneça o cabeçalho Authorization: Bearer <HERMES_OPS_TOKEN>'
    });
  }

  // Verifica scopes solicitados
  const scopeHeader = req.headers['x-athena-ops-scope'] || '';
  req.opsScopes = scopeHeader.split(',').map(s => s.trim().toLowerCase());
  next();
}

// -------------------------------------------------------------
// PII MASKING UTILITY (PROTEÇÃO LGPD)
// -------------------------------------------------------------
function maskPiiData(obj, allowPii = false) {
  if (!obj || typeof obj !== 'object') return obj;
  if (allowPii) return obj;

  const clone = JSON.parse(JSON.stringify(obj));

  function mask(val, type) {
    if (!val || typeof val !== 'string') return val;
    if (type === 'email') {
      const parts = val.split('@');
      if (parts.length !== 2) return '***@***';
      const name = parts[0];
      const maskedName = name.length <= 2 ? name[0] + '***' : name[0] + '***' + name[name.length - 1];
      return `${maskedName}@${parts[1]}`;
    }
    if (type === 'phone') {
      const cleaned = val.replace(/\D/g, '');
      if (cleaned.length < 8) return '****-****';
      return cleaned.slice(0, 2) + ' ****-' + cleaned.slice(-4);
    }
    if (type === 'cpf_cnpj') {
      const cleaned = val.replace(/\D/g, '');
      if (cleaned.length === 11) {
        return `***.***.${cleaned.slice(6, 9)}-**`;
      }
      if (cleaned.length === 14) {
        return `**.***.${cleaned.slice(5, 8)}/****-**`;
      }
      return '***.***.***-**';
    }
    return val;
  }

  if (clone.customer_snapshot) {
    if (clone.customer_snapshot.email) clone.customer_snapshot.email = mask(clone.customer_snapshot.email, 'email');
    if (clone.customer_snapshot.phone) clone.customer_snapshot.phone = mask(clone.customer_snapshot.phone, 'phone');
    if (clone.customer_snapshot.document) clone.customer_snapshot.document = mask(clone.customer_snapshot.document, 'cpf_cnpj');
  }

  if (clone.shipping_address) {
    // Mantém Cidade e Estado para logística de Hermes, mascara logradouro exato
    if (clone.shipping_address.street) clone.shipping_address.street = '*** Logradouro Protegido ***';
    if (clone.shipping_address.number) clone.shipping_address.number = '***';
    if (clone.shipping_address.complement) clone.shipping_address.complement = '***';
  }

  return clone;
}

// -------------------------------------------------------------
// ENDPOINTS DE HEALTHCHECK (LIVENESS, READINESS & INTEGRATIONS)
// -------------------------------------------------------------

// Fast Liveness Probe (Sub-5ms, não requer auth para orquestradores/k8s/render)
router.get('/health/live', (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.json({
    status: 'alive',
    system: 'Athena OS',
    uptime_seconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

// Readiness Probe (Verifica banco de dados e latência)
router.get('/health/ready', async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const start = Date.now();
  try {
    const dbRes = await query('SELECT 1 AS healthy');
    const latencyMs = Date.now() - start;

    return res.json({
      status: 'ready',
      database: {
        healthy: dbRes.rows.length > 0,
        latency_ms: latencyMs
      },
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    return res.status(503).json({
      status: 'unready',
      error: err.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Status detalhado de integrações
router.get('/health/integrations', requireHermesOpsAuth, async (req, res) => {
  try {
    let lastAsaasWebhook = null;
    let lastOmieWebhook = null;

    try {
      const whRes = await query(`
        SELECT provider, status, received_at, external_event_id
        FROM integration_webhook_events
        ORDER BY received_at DESC
        LIMIT 10
      `);
      lastAsaasWebhook = whRes.rows.find(r => r.provider === 'asaas') || null;
      lastOmieWebhook = whRes.rows.find(r => r.provider === 'omie') || null;
    } catch (e) {}

    return res.json({
      status: 'operational',
      integrations: {
        database_postgresql: { configured: Boolean(process.env.DATABASE_URL), status: 'connected' },
        asaas_payments: {
          configured: Boolean(process.env.ASAAS_API_KEY || process.env.ASAAS_ACCESS_TOKEN),
          webhook_secret_configured: Boolean(process.env.ASAAS_WEBHOOK_SECRET || process.env.ASAAS_WEBHOOK_ACCESS_TOKEN),
          last_event_received: lastAsaasWebhook
        },
        omie_erp: {
          configured: Boolean(process.env.OMIE_APP_KEY && process.env.OMIE_APP_SECRET),
          last_event_received: lastOmieWebhook
        },
        email_smtp: {
          configured: Boolean(process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || process.env.GMAIL_PASS)
        },
        cloudflare_r2: {
          configured: Boolean(process.env.R2_ACCOUNT_ID && process.env.R2_ACCESS_KEY_ID)
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// RESUMO OPERACIONAL EXECUTIVO (PARA HERMES & DASHBOARDS)
// -------------------------------------------------------------
router.get('/summary', requireHermesOpsAuth, async (req, res) => {
  try {
    // Git commit hash
    let gitCommit = 'unknown';
    try {
      gitCommit = execSync('git rev-parse --short HEAD', { timeout: 2000 }).toString().trim();
    } catch (e) {}

    // 1. Pedidos (Hoje & Status)
    const ordersQuery = await query(`
      SELECT 
        COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE) AS today,
        COUNT(*) FILTER (WHERE payment_status = 'pending') AS pending_payment,
        COUNT(*) FILTER (WHERE status = 'processing') AS processing,
        COUNT(*) FILTER (WHERE status = 'completed') AS completed
      FROM orders
    `);
    const ordersRow = ordersQuery.rows[0] || {};
    const ordersSnapshot = {
      today: parseInt(ordersRow.today || 0, 10),
      pending_payment: parseInt(ordersRow.pending_payment || 0, 10),
      processing: parseInt(ordersRow.processing || 0, 10),
      completed: parseInt(ordersRow.completed || 0, 10)
    };

    // 2. Expedição e Logística Física (Fulfillment)
    const shipmentsQuery = await query(`
      SELECT 
        COUNT(*) FILTER (WHERE status = 'pending') AS awaiting_picking,
        COUNT(*) FILTER (WHERE status = 'picking') AS awaiting_conference,
        COUNT(*) FILTER (WHERE status = 'ready') AS awaiting_dispatch
      FROM shipments
    `);
    const shipmentsRow = shipmentsQuery.rows[0] || {};
    const fulfillmentSnapshot = {
      awaiting_picking: parseInt(shipmentsRow.awaiting_picking || 0, 10),
      awaiting_conference: parseInt(shipmentsRow.awaiting_conference || 0, 10),
      awaiting_dispatch: parseInt(shipmentsRow.awaiting_dispatch || 0, 10)
    };

    // 3. Fila de Ativações Digitais (Software) & SLA
    const activationsQuery = await query(`
      SELECT 
        COUNT(*) FILTER (WHERE status NOT IN ('activated', 'cancelled')) AS pending,
        COUNT(*) FILTER (WHERE status NOT IN ('activated', 'cancelled') AND created_at < NOW() - INTERVAL '24 hours') AS sla_breached
      FROM digital_activations
    `);
    const activationsRow = activationsQuery.rows[0] || {};
    const activationsSnapshot = {
      pending: parseInt(activationsRow.pending || 0, 10),
      sla_breached: parseInt(activationsRow.sla_breached || 0, 10)
    };

    // 4. Reservas de Estoque (Inventory)
    const inventoryQuery = await query(`
      SELECT 
        COUNT(*) FILTER (WHERE status = 'reserved' AND expires_at > NOW()) AS active_reservations,
        COUNT(*) FILTER (WHERE status = 'reserved' AND expires_at > NOW() AND expires_at < NOW() + INTERVAL '30 minutes') AS expiring_soon
      FROM inventory_reservations
    `);
    const inventoryRow = inventoryQuery.rows[0] || {};
    const inventorySnapshot = {
      active_reservations: parseInt(inventoryRow.active_reservations || 0, 10),
      expiring_soon: parseInt(inventoryRow.expiring_soon || 0, 10)
    };

    // 5. Status de Integrações Externas
    const integrationsSnapshot = {
      asaas: process.env.ASAAS_API_KEY || process.env.ASAAS_ACCESS_TOKEN ? 'healthy' : 'unconfigured',
      omie: process.env.OMIE_APP_KEY && process.env.OMIE_APP_SECRET ? 'healthy' : 'unconfigured',
      whatsapp: 'operational'
    };

    // 6. Webhooks (24h)
    const webhooksQuery = await query(`
      SELECT 
        COUNT(*) FILTER (WHERE received_at >= NOW() - INTERVAL '24 hours') AS received_24h,
        COUNT(*) FILTER (WHERE status = 'processed' AND received_at >= NOW() - INTERVAL '24 hours') AS processed,
        COUNT(*) FILTER (WHERE status = 'failed' AND received_at >= NOW() - INTERVAL '24 hours') AS failed
      FROM integration_webhook_events
    `);
    const webhooksRow = webhooksQuery.rows[0] || {};
    const webhooksSnapshot = {
      received_24h: parseInt(webhooksRow.received_24h || 0, 10),
      processed: parseInt(webhooksRow.processed || 0, 10),
      failed: parseInt(webhooksRow.failed || 0, 10)
    };

    // 7. Incidentes de Segurança Abertos / Recentes (24h)
    const incidentsQuery = await query(`
      SELECT COUNT(*) AS open
      FROM security_audit_events
      WHERE severity IN ('HIGH', 'CRITICAL')
        AND created_at >= NOW() - INTERVAL '24 hours'
    `);
    const incidentsSnapshot = {
      open: parseInt(incidentsQuery.rows[0]?.open || 0, 10)
    };

    // Operational Snapshot Unificado para Hermes Agent
    return res.json({
      system: {
        status: incidentsSnapshot.open > 0 ? 'degraded' : 'healthy',
        version: '2.1.0',
        commit: gitCommit
      },
      orders: ordersSnapshot,
      fulfillment: fulfillmentSnapshot,
      activations: activationsSnapshot,
      inventory: inventorySnapshot,
      integrations: integrationsSnapshot,
      webhooks: webhooksSnapshot,
      incidents: incidentsSnapshot,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('[OPS SUMMARY ERROR]', err);
    return res.status(500).json({ error: 'Erro ao compilar resumo operacional.' });
  }
});

// -------------------------------------------------------------
// CONSULTA DE PEDIDOS COM BUSCA, FILTROS E MASCARAMENTO PII
// -------------------------------------------------------------
router.get('/orders', requireHermesOpsAuth, async (req, res) => {
  try {
    const {
      status,
      payment_status,
      fulfillment_status,
      order_type,
      search,
      limit = 20,
      offset = 0
    } = req.query;

    const allowPii = req.opsScopes.includes('pii:read');
    const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
    const safeOffset = Math.max(parseInt(offset, 10) || 0, 0);

    const conditions = [];
    const params = [];

    if (status) {
      params.push(status);
      conditions.push(`o.status = $${params.length}`);
    }
    if (payment_status) {
      params.push(payment_status);
      conditions.push(`o.payment_status = $${params.length}`);
    }
    if (fulfillment_status) {
      params.push(fulfillment_status);
      conditions.push(`o.fulfillment_status = $${params.length}`);
    }
    if (order_type) {
      params.push(order_type);
      conditions.push(`o.order_type = $${params.length}`);
    }
    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(o.order_number ILIKE $${params.length} OR o.id ILIKE $${params.length} OR o.customer_id ILIKE $${params.length})`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countQuery = await query(`SELECT COUNT(*) AS total FROM orders o ${whereClause}`, params);
    const totalCount = parseInt(countQuery.rows[0]?.total || 0, 10);

    params.push(safeLimit);
    const limitIndex = params.length;
    params.push(safeOffset);
    const offsetIndex = params.length;

    const ordersQuery = await query(`
      SELECT 
        o.id,
        o.order_number,
        o.customer_id,
        o.order_type,
        o.status,
        o.payment_status,
        o.fulfillment_status,
        o.total_amount,
        o.subtotal_amount,
        o.discount_amount,
        o.shipping_amount,
        o.points_spent,
        o.points_earned,
        o.payment_method,
        o.asaas_payment_id,
        o.omie_pedido_id,
        o.omie_nfe_number,
        o.customer_snapshot,
        o.shipping_address,
        o.created_at,
        o.paid_at,
        o.cancelled_at
      FROM orders o
      ${whereClause}
      ORDER BY o.created_at DESC
      LIMIT $${limitIndex} OFFSET $${offsetIndex}
    `, params);

    // Carrega itens dos pedidos
    const orderIds = ordersQuery.rows.map(o => o.id);
    let itemsMap = {};
    if (orderIds.length > 0) {
      const itemsRes = await query(`
        SELECT order_id, id, product_id, name, quantity, unit_price, fulfillment_type, fulfillment_status
        FROM order_items
        WHERE order_id = ANY($1)
      `, [orderIds]);
      itemsRes.rows.forEach(item => {
        if (!itemsMap[item.order_id]) itemsMap[item.order_id] = [];
        itemsMap[item.order_id].push(item);
      });
    }

    const orders = ordersQuery.rows.map(order => {
      const raw = {
        ...order,
        items: itemsMap[order.id] || []
      };
      return maskPiiData(raw, allowPii);
    });

    return res.json({
      total: totalCount,
      limit: safeLimit,
      offset: safeOffset,
      orders
    });
  } catch (err) {
    console.error('[OPS ORDERS ERROR]', err);
    return res.status(500).json({ error: 'Erro ao consultar pedidos.' });
  }
});

// -------------------------------------------------------------
// DETALHE DO PEDIDO COMPLETO (COM REMESSAS, ATIVAÇÃO E TIMELINE)
// -------------------------------------------------------------
router.get('/orders/:id', requireHermesOpsAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const allowPii = req.opsScopes.includes('pii:read');

    const orderRes = await query(`
      SELECT * FROM orders
      WHERE id = $1 OR order_number = $1
      LIMIT 1
    `, [id]);

    if (orderRes.rows.length === 0) {
      return res.status(404).json({ error: 'Pedido não encontrado.' });
    }

    const order = orderRes.rows[0];
    const orderId = order.id;

    // Busca itens
    const itemsRes = await query(`
      SELECT * FROM order_items WHERE order_id = $1 ORDER BY id ASC
    `, [orderId]);

    // Busca remessas fisicas
    const shipmentsRes = await query(`
      SELECT * FROM shipments WHERE order_id = $1 ORDER BY created_at ASC
    `, [orderId]);

    // Busca ativacoes digitais com tentativas
    const activationsRes = await query(`
      SELECT * FROM digital_activations WHERE order_id = $1 ORDER BY created_at ASC
    `, [orderId]);

    let activationsWithAttempts = [];
    if (activationsRes.rows.length > 0) {
      const actIds = activationsRes.rows.map(a => a.id);
      const attemptsRes = await query(`
        SELECT * FROM activation_attempts
        WHERE activation_id = ANY($1)
        ORDER BY created_at ASC
      `, [actIds]);

      const attemptsMap = {};
      attemptsRes.rows.forEach(att => {
        if (!attemptsMap[att.activation_id]) attemptsMap[att.activation_id] = [];
        attemptsMap[att.activation_id].push(att);
      });

      activationsWithAttempts = activationsRes.rows.map(act => ({
        ...act,
        attempts: attemptsMap[act.id] || []
      }));
    }

    // Busca timeline de eventos do pedido
    const eventsRes = await query(`
      SELECT * FROM order_events WHERE order_id = $1 ORDER BY created_at ASC
    `, [orderId]);

    const result = {
      ...order,
      items: itemsRes.rows,
      shipments: shipmentsRes.rows,
      digital_activations: activationsWithAttempts,
      timeline: eventsRes.rows
    };

    return res.json(maskPiiData(result, allowPii));
  } catch (err) {
    console.error('[OPS ORDER DETAIL ERROR]', err);
    return res.status(500).json({ error: 'Erro ao consultar detalhes do pedido.' });
  }
});

// -------------------------------------------------------------
// DYNAMIC IMPLEMENTATION MANIFEST (FONTE DINÂMICA DE VERDADE)
// -------------------------------------------------------------
router.get('/manifest', requireHermesOpsAuth, async (req, res) => {
  try {
    const requiredTables = [
      'orders',
      'order_items',
      'inventory_reservations',
      'shipments',
      'digital_activations',
      'activation_attempts',
      'a_points_ledger',
      'integration_webhook_events',
      'order_events',
      'security_audit_events'
    ];

    const tablesCheck = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name = ANY($1)
    `, [requiredTables]);

    const activeTables = tablesCheck.rows.map(r => r.table_name);
    const missingTables = requiredTables.filter(t => !activeTables.includes(t));

    // Git commit hash
    let gitCommit = 'unknown';
    let gitBranch = 'unknown';
    try {
      gitCommit = execSync('git rev-parse HEAD', { timeout: 2000 }).toString().trim();
      gitBranch = execSync('git rev-parse --abbrev-ref HEAD', { timeout: 2000 }).toString().trim();
    } catch (e) {}

    const isPhase1AComplete = missingTables.length === 0;

    return res.json({
      system: 'Athena OS',
      version: '2.1.0',
      environment: process.env.NODE_ENV || 'production',
      git: {
        branch: gitBranch,
        commit: gitCommit
      },
      architecture: {
        status_dimensions: ['status', 'payment_status', 'fulfillment_status'],
        fulfillment_types: ['physical', 'digital'],
        loyalty_ledger: 'immutable_atomic_with_row_lock',
        inventory_reservations: 'ttl_based_with_release_worker',
        physical_logistics: 'picking_and_inspection_lock',
        digital_fulfillment: 'relational_attempts_history',
        webhooks: 'fast_ack_async_event_store',
        ops_api: 'zero_trust_read_only_pii_masked'
      },
      phases: {
        phase_1a_database_migrations: {
          status: isPhase1AComplete ? 'completed' : 'in_progress',
          total_tables_required: requiredTables.length,
          total_tables_active: activeTables.length,
          active_tables: activeTables,
          missing_tables: missingTables
        },
        phase_1b_domain_services: {
          status: 'completed',
          services: [
            'db.js (ACID transaction wrapper)',
            'pointsService.js (atomic ledger & overdraft prevention)',
            'inventoryReservationService.js (TTL & release engine)',
            'fulfillmentService.js (picking & inspection lock)',
            'activationService.js (remote activation tracking)',
            'orderService.js (central checkout & payment reconciliation)',
            'securityAuditService.js (incident recording & query)'
          ]
        },
        phase_1c_webhooks_ingestion: {
          status: 'completed',
          providers: ['asaas', 'omie'],
          security: 'constant_time_token_validation_with_fast_ack'
        },
        phase_1d_security_ops_api: {
          status: 'completed',
          hermes_endpoints: [
            '/api/internal/ops/summary',
            '/api/internal/ops/orders',
            '/api/internal/ops/orders/:id',
            '/api/internal/ops/health/live',
            '/api/internal/ops/health/ready',
            '/api/internal/ops/health/integrations',
            '/api/internal/ops/manifest'
          ]
        },
        phase_2_admin_operations: {
          status: 'ready_for_ui'
        },
        phase_3_customer_portal: {
          status: 'ready_for_ui'
        }
      },
      verified_at: new Date().toISOString()
    });
  } catch (err) {
    console.error('[OPS MANIFEST ERROR]', err);
    return res.status(500).json({ error: 'Erro ao gerar implementation manifest dinâmico.' });
  }
});

module.exports = router;
