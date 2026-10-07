/**
 * fulfillmentService.js
 * 
 * Servico de Expedicao, Picking e Logistica do Athena OS.
 * Implementa romaneio com trava obrigatoria de conferencia antes do despacho,
 * rastreamento multi-volume e auditoria de entregas manuais.
 */

const { query, withTransaction } = require('./db');
const { recordSecurityEvent } = require('./securityAuditService');

/**
 * Cria a remessa inicial de expedicao (Shipment) para um pedido com itens fisicos.
 * Nasce com status 'pending' ou 'ready' (NUNCA direto como 'shipped').
 */
async function createInitialShipment({ orderId, carrier = 'Transportadora Parceira', serviceCode = null, volumesCount = 1 }) {
  if (!orderId) throw new Error('orderId é obrigatório para criar remessa.');

  // Verifica se o pedido possui itens fisicos
  const itemsRes = await query(`
    SELECT id, name, quantity, fulfillment_type
    FROM order_items
    WHERE order_id = $1 AND fulfillment_type = 'physical'
  `, [orderId]);

  if (itemsRes.rows.length === 0) {
    return { skipped: true, reason: 'Pedido não possui itens físicos para expedição.' };
  }

  // 1.5. Idempotência: Se já houver remessa ativa criada para este pedido, retorna existente
  const existingActive = await query(`
    SELECT id, shipment_number, status, created_at
    FROM shipments
    WHERE order_id = $1 AND status IN ('pending', 'picking', 'ready', 'shipped')
    LIMIT 1
  `, [orderId]);
  if (existingActive.rows.length > 0) {
    return existingActive.rows[0];
  }

  // Busca o order_number para criar o shipment_number legivel
  const orderRes = await query('SELECT order_number FROM orders WHERE id = $1', [orderId]);
  const orderNum = orderRes.rows[0]?.order_number || orderId;

  // Conta quantas remessas ja existem para este pedido
  const countRes = await query('SELECT COUNT(*) FROM shipments WHERE order_id = $1', [orderId]);
  let seq = parseInt(countRes.rows[0].count, 10) + 1;
  let shipmentNumber = `SHP-${orderNum}-${String(seq).padStart(2, '0')}`;

  // Garante que o shipmentNumber nunca colida
  let exists = await query('SELECT id FROM shipments WHERE shipment_number = $1', [shipmentNumber]);
  while (exists.rows.length > 0) {
    seq++;
    shipmentNumber = `SHP-${orderNum}-${String(seq).padStart(2, '0')}`;
    exists = await query('SELECT id FROM shipments WHERE shipment_number = $1', [shipmentNumber]);
  }

  const res = await query(`
    INSERT INTO shipments (
      shipment_number, order_id, carrier, service_code,
      volumes_count, status, created_at
    ) VALUES ($1, $2, $3, $4, $5, 'pending', NOW())
    RETURNING id, shipment_number, status, created_at
  `, [shipmentNumber, orderId, carrier, serviceCode, volumesCount]);

  console.log(`[SHIPMENT CREATED] Remessa #${shipmentNumber} criada para o Pedido #${orderNum} (Status: pending)`);
  return res.rows[0];
}

/**
 * Inicia o processo de separacao (Picking) no galpao
 */
async function startPicking({ shipmentId, staffId, staffName = 'Estoquista' }) {
  if (!shipmentId || !staffId) throw new Error('shipmentId e staffId são obrigatórios.');

  return await withTransaction(async (client) => {
    const shipRes = await client.query('SELECT order_id FROM shipments WHERE id = $1', [shipmentId]);
    if (shipRes.rows.length === 0) throw new Error(`Remessa ${shipmentId} não encontrada.`);
    const orderId = shipRes.rows[0].order_id;

    await client.query(`
      UPDATE shipments
      SET picking_by = $1, status = 'pending'
      WHERE id = $2
    `, [staffId, shipmentId]);

    await client.query(`
      UPDATE order_items
      SET fulfillment_status = 'picking'
      WHERE order_id = $1 AND fulfillment_type = 'physical'
    `, [orderId]);

    // Timeline event
    await client.query(`
      INSERT INTO order_events (
        id, order_id, event_type, actor_id, actor_type, actor_name, description, created_at
      ) VALUES ($1, $2, 'PICKING_STARTED', $3, 'staff', $4, $5, NOW())
    `, [
      `evt_pick_${shipmentId}_${Date.now()}`,
      orderId,
      staffId,
      staffName,
      `Separação física de mercadorias iniciada no galpão por ${staffName}`
    ]);

    return { success: true, status: 'picking' };
  });
}

/**
 * Trava de Conferencia: Operador confere o romaneio/picking list no galpao.
 * O pedido soh pode ser despachado se esta etapa for concluida com sucesso.
 */
async function completeInspection({ shipmentId, staffId, staffName = 'Conferente' }) {
  if (!shipmentId || !staffId) throw new Error('shipmentId e staffId são obrigatórios para conferência.');

  return await withTransaction(async (client) => {
    const shipRes = await client.query('SELECT order_id FROM shipments WHERE id = $1', [shipmentId]);
    if (shipRes.rows.length === 0) throw new Error(`Remessa ${shipmentId} não encontrada.`);
    const orderId = shipRes.rows[0].order_id;

    // Atualiza shipment com checked_by e muda para 'ready'
    await client.query(`
      UPDATE shipments
      SET checked_by = $1, checked_at = NOW(), status = 'ready'
      WHERE id = $2
    `, [staffId, shipmentId]);

    await client.query(`
      UPDATE order_items
      SET fulfillment_status = 'packed'
      WHERE order_id = $1 AND fulfillment_type = 'physical'
    `, [orderId]);

    // Timeline event
    await client.query(`
      INSERT INTO order_events (
        id, order_id, event_type, actor_id, actor_type, actor_name, description, created_at
      ) VALUES ($1, $2, 'ORDER_INSPECTED', $3, 'staff', $4, $5, NOW())
    `, [
      `evt_insp_${shipmentId}_${Date.now()}`,
      orderId,
      staffId,
      staffName,
      `Romaneio conferido e mercadorias embaladas por ${staffName}. Pronto para despacho.`
    ]);

    console.log(`[SHIPMENT CHECKED] Remessa #${shipmentId} conferida com sucesso por ${staffName} (Status: ready)`);
    return { success: true, status: 'ready' };
  });
}

/**
 * Despacha o pedido e vincula a Transportadora e Codigo de Rastreio.
 * TRAVA DE SEGURANCA: Bloqueia se o pedido nao tiver passado por completeInspection (checked_by obrigatorio).
 */
async function dispatchShipment({
  shipmentId,
  carrier,
  serviceCode = null,
  trackingCode,
  trackingUrl = null,
  volumesCount = 1,
  weightKg = null,
  staffId,
  staffName = 'Expedição'
}) {
  if (!shipmentId || !carrier || !trackingCode) {
    throw new Error('shipmentId, carrier e trackingCode são obrigatórios para despacho.');
  }

  return await withTransaction(async (client) => {
    // 1. Validacao da Trava de Conferencia
    const shipRes = await client.query(`
      SELECT order_id, status, checked_by, checked_at
      FROM shipments
      WHERE id = $1
    `, [shipmentId]);

    if (shipRes.rows.length === 0) throw new Error(`Remessa ${shipmentId} não encontrada.`);
    const ship = shipRes.rows[0];

    if (!ship.checked_by || ship.status !== 'ready') {
      await recordSecurityEvent({
        eventType: 'DISPATCH_WITHOUT_CHECK_BLOCKED',
        severity: 'medium',
        actorId: staffId,
        targetResource: `shipments/${shipmentId}`,
        actionAttempted: 'Tentativa de despachar mercadoria sem conferência prévia do romaneio',
        decision: 'blocked',
        reason: 'Trava de conferência física violada'
      });
      throw new Error('Operação bloqueada: A remessa precisa ser conferida (completeInspection) antes de ser despachada.');
    }

    const orderId = ship.order_id;

    // 2. Atualiza status da remessa para 'shipped'
    await client.query(`
      UPDATE shipments
      SET carrier = $1, service_code = $2, tracking_code = $3,
          tracking_url = $4, volumes_count = $5, weight_kg = $6,
          shipped_by = $7, shipped_at = NOW(), status = 'shipped'
      WHERE id = $8
    `, [
      carrier,
      serviceCode,
      trackingCode,
      trackingUrl,
      volumesCount,
      weightKg,
      staffId,
      shipmentId
    ]);

    // 3. Atualiza os itens fisicos e o pedido central
    await client.query(`
      UPDATE order_items
      SET fulfillment_status = 'shipped'
      WHERE order_id = $1 AND fulfillment_type = 'physical'
    `, [orderId]);

    await client.query(`
      UPDATE orders
      SET fulfillment_status = 'fulfilled', status = 'processing', updated_at = NOW()
      WHERE id = $1
    `, [orderId]);

    // 4. Timeline Event
    await client.query(`
      INSERT INTO order_events (
        id, order_id, event_type, actor_id, actor_type, actor_name, description, metadata, created_at
      ) VALUES ($1, $2, 'ORDER_DISPATCHED', $3, 'staff', $4, $5, $6, NOW())
    `, [
      `evt_disp_${shipmentId}_${Date.now()}`,
      orderId,
      staffId,
      staffName,
      `Carga despachada via ${carrier} (Rastreio: ${trackingCode}) por ${staffName}`,
      JSON.stringify({ carrier, trackingCode, trackingUrl, volumesCount, weightKg })
    ]);

    console.log(`[SHIPMENT DISPATCHED] Remessa #${shipmentId} despachada via ${carrier} (${trackingCode})`);
    return { success: true, status: 'shipped', trackingCode, tracking_code: trackingCode };
  });
}

/**
 * Atualiza status de entrega.
 * Se for marcado 'delivered' manualmente pelo painel, exige justificativa e gera auditoria de seguranca.
 */
async function updateDeliveryStatus({ shipmentId, status = 'delivered', isManual = false, reason = null, actorId = null }) {
  if (!shipmentId) throw new Error('shipmentId é obrigatório.');

  if (isManual && status === 'delivered') {
    if (!reason || reason.trim().length < 5) {
      throw new Error('A confirmação manual de entrega exige uma justificativa operacional com no mínimo 5 caracteres.');
    }

    await recordSecurityEvent({
      eventType: 'MANUAL_DELIVERY_OVERRIDE',
      severity: 'medium',
      actorId,
      targetResource: `shipments/${shipmentId}`,
      actionAttempted: 'Baixa manual de entrega de mercadoria física',
      decision: 'allowed',
      reason: `Baixa manual autorizada: ${reason}`
    });
  }

  const res = await withTransaction(async (client) => {
    const shipRes = await client.query('SELECT order_id FROM shipments WHERE id = $1', [shipmentId]);
    if (shipRes.rows.length === 0) throw new Error(`Remessa ${shipmentId} não encontrada.`);
    const orderId = shipRes.rows[0].order_id;

    await client.query(`
      UPDATE shipments
      SET status = $1, delivered_at = CASE WHEN $1 = 'delivered' THEN NOW() ELSE delivered_at END,
          is_manual_delivery = $2, manual_delivery_reason = $3
      WHERE id = $4
    `, [status, isManual, reason, shipmentId]);

    if (status === 'delivered') {
      await client.query(`
        UPDATE order_items
        SET fulfillment_status = 'delivered'
        WHERE order_id = $1 AND fulfillment_type = 'physical'
      `, [orderId]);

      // Se todos os itens do pedido estiverem concluidos, finaliza o pedido
      const unfulfilledRes = await client.query(`
        SELECT COUNT(*) FROM order_items
        WHERE order_id = $1 AND fulfillment_status NOT IN ('delivered', 'activated', 'cancelled')
      `, [orderId]);

      if (parseInt(unfulfilledRes.rows[0].count, 10) === 0) {
        await client.query("UPDATE orders SET status = 'completed', updated_at = NOW() WHERE id = $1", [orderId]);
      }

      await client.query(`
        INSERT INTO order_events (
          id, order_id, event_type, actor_id, actor_type, actor_name, description, created_at
        ) VALUES ($1, $2, 'ORDER_DELIVERED', $3, 'system', 'Sistema de Logística', $4, NOW())
      `, [
        `evt_delv_${shipmentId}_${Date.now()}`,
        orderId,
        actorId,
        `Mercadoria entregue com sucesso.${isManual ? ` (Baixa manual: ${reason})` : ''}`
      ]);
    }

    return { success: true, status };
  });

  return res;
}

/**
 * Consulta remessas de um pedido
 */
async function getShipmentsByOrder(orderId) {
  const res = await query(`
    SELECT id, shipment_number, carrier, service_code, tracking_code, tracking_url,
           volumes_count, weight_kg, status, picking_by, checked_by, shipped_by,
           is_manual_delivery, manual_delivery_reason, checked_at, shipped_at, delivered_at, created_at
    FROM shipments
    WHERE order_id = $1
    ORDER BY created_at ASC
  `, [orderId]);
  return res.rows;
}

module.exports = {
  createInitialShipment,
  startPicking,
  completeInspection,
  dispatchShipment,
  updateDeliveryStatus,
  getShipmentsByOrder
};
