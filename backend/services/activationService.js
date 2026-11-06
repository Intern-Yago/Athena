/**
 * activationService.js
 * 
 * Servico de Fila Operacional de Ativacao Tecnica de Softwares e Licencas (Athena OS).
 * Registra tentativas de contato relacional em activation_attempts e gerencia
 * o ciclo de ativacao remota (TeamViewer, AnyDesk, WhatsApp) com controle estrito de SLA.
 */

const { query, withTransaction } = require('./db');

/**
 * Cria os registros na fila de ativacao para os itens digitais de um pedido
 */
async function createActivationQueues(orderId) {
  if (!orderId) throw new Error('orderId é obrigatório para fila de ativação.');

  // Busca itens digitais do pedido
  const itemsRes = await query(`
    SELECT oi.id, oi.name, oi.metadata, o.customer_snapshot, o.order_number, o.equipment_info
    FROM order_items oi
    JOIN orders o ON o.id = oi.order_id
    WHERE oi.order_id = $1 AND oi.fulfillment_type = 'digital'
  `, [orderId]);

  if (itemsRes.rows.length === 0) {
    return { createdCount: 0 };
  }

  let createdCount = 0;
  for (const item of itemsRes.rows) {
    const custPhone = item.customer_snapshot?.phone || 'Não informado';
    const eqModel = item.metadata?.equipmentModel || item.metadata?.model || item.equipment_info?.model || item.equipment_info?.equipmentModel || '';
    const eqSerial = item.metadata?.equipmentSerial || item.metadata?.serialNumber || item.equipment_info?.serialNumber || item.equipment_info?.equipmentSerial || '';

    await query(`
      INSERT INTO digital_activations (
        order_id, order_item_id, software_name, customer_phone, equipment_model, equipment_serial,
        status, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, 'awaiting_activation', NOW())
    `, [orderId, item.id, item.name, custPhone, eqModel || null, eqSerial || null]);

    createdCount++;
  }

  console.log(`[DIGITAL ACTIVATION QUEUE] Pedido #${orderId}: ${createdCount} licença(s) colocadas na fila de ativação.`);
  return { createdCount };
}

/**
 * Registra uma tentativa de contato com o cliente (WhatsApp / Ligação) na tabela relacional activation_attempts
 */
async function recordContactAttempt({
  activationId,
  attemptedBy,
  method = 'whatsapp',
  result = 'answered',
  note = null
}) {
  if (!activationId || !attemptedBy) {
    throw new Error('activationId e attemptedBy são obrigatórios para registrar tentativa de contato.');
  }

  return await withTransaction(async (client) => {
    // 1. Insere tentativa relacional
    const attemptRes = await client.query(`
      INSERT INTO activation_attempts (
        activation_id, attempted_by, method, result, note, created_at
      ) VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING id, created_at
    `, [activationId, attemptedBy, method, result, note]);

    // 2. Atualiza o status da ativacao para 'contacted'
    await client.query(`
      UPDATE digital_activations
      SET status = 'contacted',
          assigned_technician_id = COALESCE(assigned_technician_id, $1)
      WHERE id = $2 AND status = 'awaiting_activation'
    `, [attemptedBy, activationId]);

    // 3. Busca order_id para atualizar order_items
    const actRes = await client.query(`
      SELECT order_id, order_item_id FROM digital_activations WHERE id = $1
    `, [activationId]);

    if (actRes.rows.length > 0) {
      await client.query(`
        UPDATE order_items
        SET fulfillment_status = 'contacted'
        WHERE id = $1
      `, [actRes.rows[0].order_item_id]);

      // Timeline event
      await client.query(`
        INSERT INTO order_events (
          id, order_id, event_type, actor_id, actor_type, actor_name, description, created_at
        ) VALUES ($1, $2, 'ACTIVATION_ATTEMPT_RECORDED', $3, 'staff', 'Suporte Técnico', $4, NOW())
      `, [
        `evt_att_${activationId}_${Date.now()}`,
        actRes.rows[0].order_id,
        attemptedBy,
        `Tentativa de contato via ${method.toUpperCase()} realizada. Resultado: ${result}. ${note ? `Nota: "${note}"` : ''}`
      ]);
    }

    return {
      success: true,
      attemptId: attemptRes.rows[0].id,
      method,
      result,
      status: 'contacted'
    };
  });
}

/**
 * Inicia a sessao de ativacao remota ativa (ex: conectado via AnyDesk)
 */
async function startActivating({ activationId, technicianId, remoteTool = 'AnyDesk' }) {
  if (!activationId || !technicianId) throw new Error('activationId e technicianId são obrigatórios.');

  const res = await withTransaction(async (client) => {
    await client.query(`
      UPDATE digital_activations
      SET status = 'activating',
          assigned_technician_id = $1,
          remote_tool = $2
      WHERE id = $3
    `, [technicianId, remoteTool, activationId]);

    const actRes = await client.query('SELECT order_id, order_item_id FROM digital_activations WHERE id = $1', [activationId]);
    if (actRes.rows.length > 0) {
      await client.query(`
        UPDATE order_items SET fulfillment_status = 'activating' WHERE id = $1
      `, [actRes.rows[0].order_item_id]);
    }

    return { success: true, status: 'activating' };
  });

  return res;
}

/**
 * Conclui a ativacao tecnica do software e libera a chave/licenca
 */
async function completeActivation({
  activationId,
  licenseKey = null,
  technicianId,
  staffId,
  technicianName = 'Suporte Técnico',
  staffName,
  notes = null,
  note = null,
  validityDays = 365
}) {
  const techId = technicianId || staffId;
  const techName = staffName || technicianName || 'Suporte Técnico';
  const finalNotes = notes || note || null;
  const duration = parseInt(validityDays || 365, 10);
  if (!activationId || !techId) throw new Error('activationId e technicianId são obrigatórios.');

  return await withTransaction(async (client) => {
    // 1. Marca ativacao como concluida e define data de expiracao (SaaS / Recorrencia)
    const actRes = await client.query(`
      UPDATE digital_activations
      SET status = 'activated',
          license_key = COALESCE($1, license_key),
          activated_at = NOW(),
          assigned_technician_id = $2,
          notes = COALESCE($3, notes),
          validity_days = $4::integer,
          expires_at = NOW() + ($4::integer * INTERVAL '1 day'),
          renewal_status = 'active'
      WHERE id = $5
      RETURNING id, order_id, order_item_id, software_name, validity_days, expires_at
    `, [licenseKey, techId, finalNotes, duration, activationId]);

    if (actRes.rows.length === 0) throw new Error(`Ativação ${activationId} não encontrada.`);
    const act = actRes.rows[0];

    // 2. Atualiza order_item
    await client.query(`
      UPDATE order_items
      SET fulfillment_status = 'activated'
      WHERE id = $1
    `, [act.order_item_id]);

    // 3. Se todos os itens do pedido estiverem concluidos, finaliza o pedido central
    const unfulfilledRes = await client.query(`
      SELECT COUNT(*) FROM order_items
      WHERE order_id = $1 AND fulfillment_status NOT IN ('delivered', 'activated', 'cancelled')
    `, [act.order_id]);

    if (parseInt(unfulfilledRes.rows[0].count, 10) === 0) {
      await client.query("UPDATE orders SET status = 'completed', fulfillment_status = 'fulfilled', updated_at = NOW() WHERE id = $1", [act.order_id]);
    }

    // 4. Timeline Event (SEM expor a license_key na timeline pública)
    await client.query(`
      INSERT INTO order_events (
        id, order_id, event_type, actor_id, actor_type, actor_name, description, created_at
      ) VALUES ($1, $2, 'ACTIVATION_COMPLETED', $3, 'staff', $4, $5, NOW())
    `, [
      `evt_actcomp_${activationId}_${Date.now()}`,
      act.order_id,
      techId,
      techName,
      `Ativação técnica do software "${act.software_name}" concluída com sucesso por ${techName}. Validade: ${duration} dias (expira em ${new Date(act.expires_at).toLocaleDateString('pt-BR')}).`
    ]);

    console.log(`[ACTIVATION COMPLETED] Licença #${act.software_name} ativada com sucesso por ${techName} (Validade: ${duration} dias)`);
    return { 
      success: true, 
      status: 'activated', 
      softwareName: act.software_name, 
      license_key: licenseKey,
      validityDays: duration,
      expiresAt: act.expires_at
    };
  });
}

/**
 * Consulta licencas ativas e historico de licencas de um cliente
 */
async function getCustomerLicenses({ userId, email }) {
  const res = await query(`
    SELECT 
      da.id,
      da.order_id,
      da.software_name,
      da.status,
      da.license_key,
      da.equipment_model,
      da.equipment_serial,
      da.validity_days,
      da.expires_at,
      da.renewal_status,
      da.activated_at,
      da.created_at,
      o.order_number,
      CASE 
        WHEN da.expires_at IS NULL THEN NULL
        ELSE GREATEST(0, CEIL(EXTRACT(EPOCH FROM (da.expires_at - NOW())) / 86400))::int
      END as days_remaining
    FROM digital_activations da
    JOIN orders o ON o.id = da.order_id
    WHERE (o.customer_id = $1 OR o.customer_snapshot->>'email' = $2)
    ORDER BY da.created_at DESC
  `, [userId || '', (email || '').toLowerCase().trim()]);

  return res.rows.map(row => {
    const daysRemaining = row.days_remaining !== null ? Number(row.days_remaining) : null;
    let computedStatus = row.renewal_status || 'active';
    if (row.expires_at) {
      if (new Date(row.expires_at) < new Date()) {
        computedStatus = 'expired';
      } else if (daysRemaining !== null && daysRemaining <= 30) {
        computedStatus = 'expiring_soon';
      }
    }
    return {
      ...row,
      daysRemaining,
      computedStatus,
      isExpiringSoon: daysRemaining !== null && daysRemaining <= 30 && daysRemaining > 0,
      isExpired: row.expires_at ? new Date(row.expires_at) < new Date() : false
    };
  });
}

/**
 * Consulta licencas que estao vencendo para envio de lembretes e controle administrativo
 */
async function getExpiringLicenses({ withinDays = 30 } = {}) {
  const days = parseInt(withinDays, 10);
  const res = await query(`
    SELECT 
      da.id,
      da.order_id,
      da.software_name,
      da.customer_phone,
      da.equipment_model,
      da.equipment_serial,
      da.validity_days,
      da.expires_at,
      da.renewal_status,
      da.renewal_reminders_sent,
      o.customer_id,
      o.customer_snapshot,
      GREATEST(0, CEIL(EXTRACT(EPOCH FROM (da.expires_at - NOW())) / 86400))::int as days_remaining
    FROM digital_activations da
    JOIN orders o ON o.id = da.order_id
    WHERE da.status = 'activated'
      AND da.expires_at IS NOT NULL
      AND da.expires_at <= (NOW() + ($1::integer * INTERVAL '1 day'))
    ORDER BY da.expires_at ASC
  `, [days]);

  return res.rows;
}

/**
 * Consulta ativacoes e tentativas de um pedido
 */
async function getActivationsByOrder(orderId) {
  const activations = await query(`
    SELECT id, order_item_id, software_name, customer_phone, status,
           assigned_technician_id, remote_tool, activated_at, notes, created_at
    FROM digital_activations
    WHERE order_id = $1
    ORDER BY created_at ASC
  `, [orderId]);

  const result = [];
  for (const act of activations.rows) {
    const attempts = await query(`
      SELECT id, attempted_by, method, result, note, created_at
      FROM activation_attempts
      WHERE activation_id = $1
      ORDER BY created_at ASC
    `, [act.id]);

    result.push({
      ...act,
      attempts: attempts.rows
    });
  }

  return result;
}

module.exports = {
  createActivationQueues,
  createInitialActivation: createActivationQueues,
  recordContactAttempt,
  startActivating,
  startRemoteSession: startActivating,
  completeActivation,
  getCustomerLicenses,
  getExpiringLicenses,
  getActivationsByOrder
};
