/**
 * securityAuditService.js
 * 
 * Servico de Auditoria e Seguranca do Athena OS.
 * Registra incidentes, tentativas de IDOR, violacoes de rate-limit,
 * overrides manuais e tentativas de violacao de escopo pelo Hermes.
 */

const { query } = require('./db');

const SEVERITY_LEVELS = ['info', 'low', 'medium', 'high', 'critical'];

/**
 * Registra um evento de auditoria de seguranca na tabela security_audit_events
 */
async function recordSecurityEvent({
  eventType,
  severity = 'info',
  actorId = null,
  actorEmail = null,
  actorIp = null,
  userAgent = null,
  targetResource = null,
  actionAttempted,
  decision = 'blocked',
  reason = null,
  metadata = {}
}) {
  const safeSeverity = SEVERITY_LEVELS.includes(severity) ? severity : 'info';
  const safeDecision = ['allowed', 'blocked', 'flagged'].includes(decision) ? decision : 'blocked';

  try {
    const res = await query(`
      INSERT INTO security_audit_events (
        event_type, severity, actor_id, actor_email, actor_ip,
        user_agent, target_resource, action_attempted, decision,
        reason, metadata, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
      RETURNING id, created_at
    `, [
      eventType,
      safeSeverity,
      actorId,
      actorEmail,
      actorIp,
      userAgent,
      targetResource,
      actionAttempted,
      safeDecision,
      reason,
      JSON.stringify(metadata || {})
    ]);

    if (safeSeverity === 'high' || safeSeverity === 'critical') {
      console.warn(`🚨 [SECURITY AUDIT ALERT] [${safeSeverity.toUpperCase()}] ${eventType}: ${reason || actionAttempted} (Actor: ${actorEmail || actorId || actorIp})`);
    }

    return res.rows[0];
  } catch (err) {
    console.error('[SECURITY AUDIT LOG FAILURE]', err.message);
    return null;
  }
}

/**
 * Consulta eventos de seguranca com filtros para o painel ou Hermes (Read-Only)
 */
async function getSecurityAuditEvents({ limit = 50, severity = null, eventType = null } = {}) {
  const params = [];
  let whereClauses = [];

  if (severity) {
    params.push(severity);
    whereClauses.push(`severity = $${params.length}`);
  }

  if (eventType) {
    params.push(eventType);
    whereClauses.push(`event_type = $${params.length}`);
  }

  params.push(Math.min(limit, 200));
  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  const res = await query(`
    SELECT id, event_type, severity, actor_id, actor_email, actor_ip,
           target_resource, action_attempted, decision, reason, metadata, created_at
    FROM security_audit_events
    ${whereSql}
    ORDER BY created_at DESC
    LIMIT $${params.length}
  `, params);

  return res.rows;
}

module.exports = {
  recordSecurityEvent,
  getSecurityAuditEvents
};
