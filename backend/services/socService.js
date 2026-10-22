/**
 * socService.js
 *
 * Athena OS v2.1 — Security Operations Center (SOC) Engine
 * ChatOps & Interatividade via Telegram Bot
 *
 * Funcionalidades:
 * - Banimento e Desbloqueio imediato de IPs no Firewall (DB + Memória)
 * - Consulta de blocklist ativa com motivos e timestamps
 * - Investigação Whois / Geolocation / ASN / Detecção de Proxy e VPN
 * - Diagnóstico de integridade do sistema (Postgres, Latência, Uptime, RAM)
 * - Resumo financeiro do dia e limpeza de pedidos de teste
 */

const net = require('net');
const axios = require('axios');
const { query, withTransaction, getPool } = require('./db.js');
const { isInfrastructureOrPrivateIp } = require('../utils/network.js');
const { recordAuditSecurityEvent } = require('./securityAuditService.js');

// Mapa de memória compartilhado (ou fallback local) para bloqueios em tempo real
let sharedMemoryTracker = new Map();

function setMemoryTracker(tracker) {
  if (tracker && typeof tracker.set === 'function') {
    sharedMemoryTracker = tracker;
  }
}

function getMemoryTracker() {
  return sharedMemoryTracker;
}

/**
 * Sanitiza e valida formato de endereço IP (IPv4 ou IPv6)
 */
function sanitizeIp(ip) {
  if (!ip || typeof ip !== 'string') return null;
  const clean = ip.replace('::ffff:', '').trim();
  return net.isIP(clean) ? clean : null;
}

/**
 * Bloqueia um IP manualmente no Firewall da Athena
 */
async function banIp({ ip, reason = 'Bloqueio manual via SOC ChatOps', bannedBy = 'Admin' }) {
  const cleanIp = sanitizeIp(ip);
  if (!cleanIp) {
    return { ok: false, error: 'Endereço IP inválido. Verifique o formato IPv4 ou IPv6.' };
  }

  if (isInfrastructureOrPrivateIp(cleanIp)) {
    return {
      ok: false,
      error: 'Operação Recusada: IPs privados, loopback ou da Cloudflare não podem ser banidos por segurança do sistema.'
    };
  }

  const now = new Date();

  // 1. Atualiza Tracker em Memória imediatamente
  sharedMemoryTracker.set(cleanIp, {
    failedAttempts: 99,
    isBlocked: true,
    blockedAt: now
  });

  // 2. Persiste na tabela security_ip_blocklist do PostgreSQL
  try {
    await query(`
      INSERT INTO security_ip_blocklist (ip, failed_attempts, is_blocked, blocked_at, blocked_reason, updated_at)
      VALUES ($1, 99, true, CURRENT_TIMESTAMP, $2, CURRENT_TIMESTAMP)
      ON CONFLICT (ip) DO UPDATE SET 
        failed_attempts = 99,
        is_blocked = true,
        blocked_at = CURRENT_TIMESTAMP,
        blocked_reason = $2,
        unblocked_by = NULL,
        unblocked_at = NULL,
        updated_at = CURRENT_TIMESTAMP
    `, [cleanIp, reason]);
  } catch (dbErr) {
    console.warn('[SOC BAN DB WARN]:', dbErr.message);
  }

  // 3. Registra na trilha imutável de auditoria
  try {
    await recordAuditSecurityEvent({
      eventType: 'IP_MANUALLY_BLOCKED',
      severity: 'critical',
      actorEmail: bannedBy,
      actorIp: cleanIp,
      reason,
      details: {
        action: 'MANUAL_BAN',
        bannedBy,
        ip: cleanIp
      }
    });
  } catch (_) {}

  return {
    ok: true,
    ip: cleanIp,
    reason,
    bannedBy,
    blockedAt: now
  };
}

/**
 * Desbloqueia um IP previamente banido
 */
async function unbanIp({ ip, unbannedBy = 'Admin' }) {
  const cleanIp = sanitizeIp(ip);
  if (!cleanIp) {
    return { ok: false, error: 'Endereço IP inválido.' };
  }

  const now = new Date();

  // 1. Atualiza Tracker em Memória
  sharedMemoryTracker.set(cleanIp, {
    failedAttempts: 0,
    isBlocked: false,
    blockedAt: null
  });

  // 2. Atualiza PostgreSQL
  try {
    await query(`
      UPDATE security_ip_blocklist 
      SET is_blocked = false, failed_attempts = 0, unblocked_by = $1, unblocked_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE ip = $2
    `, [unbannedBy, cleanIp]);
  } catch (dbErr) {
    console.warn('[SOC UNBAN DB WARN]:', dbErr.message);
  }

  // 3. Auditoria
  try {
    await recordAuditSecurityEvent({
      eventType: 'IP_MANUALLY_UNBLOCKED',
      severity: 'info',
      actorEmail: unbannedBy,
      actorIp: cleanIp,
      reason: 'Desbloqueio manual solicitado via SOC ChatOps',
      details: {
        action: 'MANUAL_UNBAN',
        unbannedBy,
        ip: cleanIp
      }
    });
  } catch (_) {}

  return {
    ok: true,
    ip: cleanIp,
    unbannedBy,
    unblockedAt: now
  };
}

/**
 * Retorna os IPs bloqueados atualmente no firewall
 */
async function listBannedIps({ limit = 20 } = {}) {
  try {
    const res = await query(`
      SELECT ip, failed_attempts, is_blocked, blocked_at, blocked_reason, unblocked_by, updated_at
      FROM security_ip_blocklist
      WHERE is_blocked = true
      ORDER BY blocked_at DESC NULLS LAST
      LIMIT $1
    `, [limit]);

    return res.rows.map(row => ({
      ip: row.ip,
      blocked_reason: row.blocked_reason || 'Bloqueio preventivo',
      blocked_at: row.blocked_at,
      blocked_at_formatted: row.blocked_at ? new Date(row.blocked_at).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }) : 'Data indisponível'
    }));
  } catch (dbErr) {
    console.warn('[SOC LIST DB WARN]:', dbErr.message);
    // Fallback: tracker em memória
    const list = [];
    for (const [ip, data] of sharedMemoryTracker.entries()) {
      if (data.isBlocked) {
        list.push({
          ip,
          blocked_reason: 'Bloqueio em memória',
          blocked_at: data.blockedAt,
          blocked_at_formatted: data.blockedAt ? new Date(data.blockedAt).toLocaleString('pt-BR') : 'Data recente'
        });
      }
    }
    return list.slice(0, limit);
  }
}

/**
 * Consulta de Geolocation / ASN / Provedor via Whois público
 */
async function lookupWhois(ip) {
  const cleanIp = sanitizeIp(ip);
  if (!cleanIp) {
    return { ok: false, error: 'Endereço IP inválido.' };
  }

  try {
    const url = `http://ip-api.com/json/${cleanIp}?fields=status,message,country,countryCode,regionName,city,isp,org,as,proxy,hosting,query`;
    const res = await axios.get(url, { timeout: 6000 });

    if (res.data?.status === 'success') {
      return {
        ok: true,
        ip: cleanIp,
        country: res.data.country || 'Desconhecido',
        countryCode: res.data.countryCode || '??',
        region: res.data.regionName || 'Desconhecido',
        city: res.data.city || 'Desconhecido',
        isp: res.data.isp || 'Desconhecido',
        org: res.data.org || res.data.isp || 'Desconhecido',
        as: res.data.as || 'N/A',
        isProxy: Boolean(res.data.proxy || res.data.hosting)
      };
    }

    return {
      ok: false,
      ip: cleanIp,
      error: res.data?.message || 'Dados de geolocalização não encontrados.'
    };
  } catch (err) {
    return {
      ok: false,
      ip: cleanIp,
      error: err.response?.data?.message || err.message
    };
  }
}

/**
 * Retorna diagnóstico completo de saúde e infraestrutura
 */
async function getSystemStatus() {
  let dbOk = false;
  let dbLatencyMs = null;

  const t0 = Date.now();
  try {
    await query('SELECT 1;');
    dbOk = true;
    dbLatencyMs = Date.now() - t0;
  } catch (err) {
    dbOk = false;
    dbLatencyMs = null;
  }

  // Contagem de IPs bloqueados
  let blockedCount = 0;
  try {
    const res = await query('SELECT COUNT(*) as count FROM security_ip_blocklist WHERE is_blocked = true;');
    blockedCount = parseInt(res.rows[0]?.count || 0, 10);
  } catch (_) {
    for (const [, v] of sharedMemoryTracker.entries()) {
      if (v.isBlocked) blockedCount++;
    }
  }

  // Uptime formatado
  const sec = Math.floor(process.uptime());
  const days = Math.floor(sec / 86400);
  const hours = Math.floor((sec % 86400) / 3600);
  const minutes = Math.floor((sec % 3600) / 60);
  const seconds = sec % 60;
  const uptimeFormatted = `${days > 0 ? days + 'd ' : ''}${hours}h ${minutes}m ${seconds}s`;

  // Uso de Memória em MB
  const mem = process.memoryUsage();
  const memoryRssMb = (mem.rss / (1024 * 1024)).toFixed(1);
  const memoryHeapMb = (mem.heapUsed / (1024 * 1024)).toFixed(1);

  return {
    dbOk,
    dbLatencyMs,
    uptime: uptimeFormatted,
    memoryRssMb,
    memoryHeapMb,
    blockedIpsCount: blockedCount,
    nodeEnv: process.env.NODE_ENV || 'production',
    healthy: dbOk
  };
}

/**
 * Resumo de pedidos e faturamento do dia (America/Sao_Paulo)
 */
async function getTodayOrdersSummary() {
  try {
    const res = await query(`
      SELECT 
        COUNT(*) as total_orders,
        COALESCE(SUM(total_amount), 0) as total_amount,
        COUNT(*) FILTER (WHERE status IN ('paid', 'approved', 'CONFIRMED', 'RECEIVED')) as paid_orders,
        COALESCE(SUM(total_amount) FILTER (WHERE status IN ('paid', 'approved', 'CONFIRMED', 'RECEIVED')), 0) as paid_amount,
        COUNT(*) FILTER (WHERE status IN ('pending', 'PENDING', 'AWAITING_PAYMENT')) as pending_orders,
        COUNT(*) FILTER (WHERE status IN ('cancelled', 'failed', 'REFUNDED')) as failed_orders
      FROM orders
      WHERE (created_at AT TIME ZONE 'America/Sao_Paulo')::date = (CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo')::date
    `);

    const row = res.rows[0] || {};
    const totalCount = parseInt(row.total_orders || 0, 10);
    const totalRevenue = parseFloat(row.total_amount || 0);
    const paidCount = parseInt(row.paid_orders || 0, 10);
    const paidRevenue = parseFloat(row.paid_amount || 0);
    const pendingCount = parseInt(row.pending_orders || 0, 10);
    const failedCount = parseInt(row.failed_orders || 0, 10);

    return {
      ok: true,
      totalCount,
      totalRevenueFormatted: totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
      paidCount,
      paidRevenueFormatted: paidRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
      pendingCount,
      failedCount
    };
  } catch (err) {
    console.warn('[SOC TODAY ORDERS DB WARN]:', err.message);
    return {
      ok: false,
      error: err.message,
      totalCount: 0,
      totalRevenueFormatted: '0,00',
      paidCount: 0,
      paidRevenueFormatted: '0,00',
      pendingCount: 0,
      failedCount: 0
    };
  }
}

/**
 * Limpa pedidos de teste com purga de registros relacionados
 */
async function cleanupTestOrders(actor = 'Telegram SOC') {
  let deletedOrderIds = [];

  try {
    const testOrdersRes = await query(`
      SELECT id, order_number, user_email 
      FROM orders 
      WHERE 
        user_email ILIKE '%@athenatest.com%' 
        OR customer_snapshot->>'email' ILIKE '%@athenatest.com%'
        OR order_number LIKE 'N-test_%'
        OR order_number LIKE 'N-tb_%'
        OR order_number LIKE 'N-RACE-%'
        OR id LIKE 'ord_ful_test_%'
        OR id LIKE 'ord_race_ful_%'
        OR id LIKE 'test_%'
    `);

    deletedOrderIds = testOrdersRes.rows.map(o => o.id);

    if (deletedOrderIds.length > 0) {
      await withTransaction(async (client) => {
        await client.query(`
          DELETE FROM activation_attempts 
          WHERE activation_id IN (SELECT id FROM digital_activations WHERE order_id = ANY($1))
        `, [deletedOrderIds]);
        await client.query('DELETE FROM digital_activations WHERE order_id = ANY($1)', [deletedOrderIds]);
        await client.query('DELETE FROM shipments WHERE order_id = ANY($1)', [deletedOrderIds]);
        await client.query('DELETE FROM inventory_reservations WHERE order_id = ANY($1)', [deletedOrderIds]);
        await client.query('DELETE FROM order_items WHERE order_id = ANY($1)', [deletedOrderIds]);
        await client.query('DELETE FROM order_events WHERE order_id = ANY($1)', [deletedOrderIds]);
        await client.query('DELETE FROM a_points_ledger WHERE order_id = ANY($1)', [deletedOrderIds]);
        try {
          await client.query('DELETE FROM a_points_transactions WHERE order_id = ANY($1)', [deletedOrderIds]);
        } catch (_) {}
        await client.query('DELETE FROM orders WHERE id = ANY($1)', [deletedOrderIds]);
      });
    }

    // Auditoria
    await recordAuditSecurityEvent({
      eventType: 'TEST_ORDERS_PURGED',
      severity: 'info',
      actorEmail: actor,
      reason: `Purga de ${deletedOrderIds.length} pedido(s) de teste solicitada via Telegram SOC`,
      details: { deletedCount: deletedOrderIds.length, actor }
    });

    return { ok: true, deletedCount: deletedOrderIds.length, actor };
  } catch (err) {
    console.error('[SOC CLEANUP TEST ORDERS ERROR]:', err.message);
    return { ok: false, error: err.message, deletedCount: 0 };
  }
}

/**
 * Executa política de retenção de dados e limpeza preventiva (Housekeeping)
 * - Remove logs antigos de auditoria (info/warning > 30d, high > 90d, critical > 180d)
 * - Remove tokens de email e password resets expirados (> 1d)
 * - Remove reservas de estoque antigas/abandonadas (> 7d)
 * - Remove registros de IPs que já foram desbloqueados (> 30d)
 * - Remove eventos órfãos de pedidos excluídos
 */
async function runHousekeepingCleanup(actor = 'Telegram SOC') {
  let auditLogsDeleted = 0;
  let tokensDeleted = 0;
  let reservationsDeleted = 0;
  let unblockedIpsPruned = 0;
  let orphanedEventsDeleted = 0;

  try {
    // 1. Expurgar logs de auditoria antigos por nível de severidade
    try {
      const resAudit = await query(`
        DELETE FROM security_audit_events
        WHERE 
          (severity = 'info' AND created_at < NOW() - INTERVAL '30 days')
          OR (severity IN ('warning', 'low') AND created_at < NOW() - INTERVAL '60 days')
          OR (severity = 'high' AND created_at < NOW() - INTERVAL '90 days')
          OR (severity = 'critical' AND created_at < NOW() - INTERVAL '180 days')
      `);
      auditLogsDeleted = resAudit.rowCount || 0;
    } catch (e) {
      console.warn('[HOUSEKEEPING AUDIT DELETE WARN]:', e.message);
    }

    // 2. Limpar tokens expirados de email e redefinição de senha
    try {
      const resEmailTokens = await query(`
        DELETE FROM email_verifications 
        WHERE expires_at < NOW() - INTERVAL '1 day'
      `);
      tokensDeleted += (resEmailTokens.rowCount || 0);
    } catch (_) {}

    try {
      const resPwTokens = await query(`
        DELETE FROM password_resets 
        WHERE expires_at < NOW() - INTERVAL '1 day'
      `);
      tokensDeleted += (resPwTokens.rowCount || 0);
    } catch (_) {}

    // 3. Limpar reservas de estoque antigas/abandonadas
    try {
      const resRes = await query(`
        DELETE FROM inventory_reservations 
        WHERE expires_at < NOW() - INTERVAL '7 days'
      `);
      reservationsDeleted = resRes.rowCount || 0;
    } catch (_) {}

    // 4. Limpar IPs que já foram desbloqueados há mais de 30 dias (mantém os bloqueados intactos)
    try {
      const resIps = await query(`
        DELETE FROM security_ip_blocklist 
        WHERE is_blocked = false AND unblocked_at < NOW() - INTERVAL '30 days'
      `);
      unblockedIpsPruned = resIps.rowCount || 0;
    } catch (_) {}

    // 5. Limpar eventos órfãos de pedidos excluídos
    try {
      const resEvents = await query(`
        DELETE FROM order_events 
        WHERE order_id NOT IN (SELECT id FROM orders)
      `);
      orphanedEventsDeleted = resEvents.rowCount || 0;
    } catch (_) {}

    const totalDeleted = auditLogsDeleted + tokensDeleted + reservationsDeleted + unblockedIpsPruned + orphanedEventsDeleted;

    // Registra na trilha de auditoria
    try {
      await recordAuditSecurityEvent({
        eventType: 'HOUSEKEEPING_PRUNED',
        severity: 'info',
        actorEmail: actor,
        reason: `Limpeza preventiva executada por ${actor}. Total de registros expurgados: ${totalDeleted}`,
        details: {
          auditLogsDeleted,
          tokensDeleted,
          reservationsDeleted,
          unblockedIpsPruned,
          orphanedEventsDeleted,
          totalDeleted
        }
      });
    } catch (_) {}

    return {
      ok: true,
      totalDeleted,
      auditLogsDeleted,
      tokensDeleted,
      reservationsDeleted,
      unblockedIpsPruned,
      orphanedEventsDeleted,
      actor
    };
  } catch (err) {
    console.error('[HOUSEKEEPING ERROR]:', err.message);
    return {
      ok: false,
      error: err.message,
      totalDeleted: 0
    };
  }
}

module.exports = {
  banIp,
  unbanIp,
  listBannedIps,
  lookupWhois,
  getSystemStatus,
  getTodayOrdersSummary,
  cleanupTestOrders,
  runHousekeepingCleanup,
  setMemoryTracker,
  getMemoryTracker,
  sanitizeIp
};
