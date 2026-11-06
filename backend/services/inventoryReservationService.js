/**
 * inventoryReservationService.js
 * 
 * Servico de Reservas de Estoque com TTL (Time-To-Live) do Athena OS.
 * Garante que produtos fisicos fiquem reservados durante o processo de pagamento,
 * mas libera automaticamente o estoque caso o pedido expire ou seja abandonado.
 */

const { query, withTransaction } = require('./db');

const TTL_MINUTES = {
  PIX: 30,           // PIX expira em 30 minutos
  CREDIT_CARD: 15,   // Tentativa de cartao: 15 minutos
  BOLETO: 4320,      // Boleto: 3 dias (72 horas)
  A_POINTS: 120,     // Resgate de pontos: 2 horas
  DEFAULT: 30
};

/**
 * Cria a reserva temporaria de estoque para os itens fisicos de um pedido
 */
async function reserveStock({ orderId, items = [], paymentMethod = 'PIX' }) {
  if (!orderId) throw new Error('orderId é obrigatório para reserva de estoque.');
  if (!Array.isArray(items) || items.length === 0) return { reservedCount: 0 };

  const physicalItems = items.filter(it => it.fulfillment_type === 'physical' || it.fulfillmentType === 'physical');
  if (physicalItems.length === 0) return { reservedCount: 0 };

  const ttlMin = TTL_MINUTES[paymentMethod] || TTL_MINUTES.DEFAULT;
  const expiresAt = new Date(Date.now() + ttlMin * 60 * 1000);

  return await withTransaction(async (client) => {
    let reservedCount = 0;

    for (const item of physicalItems) {
      const pId = item.product_id || item.productId || item.id;
      const sku = item.variant_sku || item.variantSku || null;
      const qty = Math.max(1, parseInt(item.quantity || 1, 10));

      await client.query(`
        INSERT INTO inventory_reservations (
          order_id, product_id, variant_sku, quantity,
          status, expires_at, created_at
        ) VALUES ($1, $2, $3, $4, 'reserved', $5, NOW())
      `, [orderId, pId, sku, qty, expiresAt]);

      reservedCount++;
    }

    console.log(`[INVENTORY RESERVED] Pedido #${orderId}: ${reservedCount} item(ns) reservados até ${expiresAt.toISOString()} (TTL: ${ttlMin}m)`);
    return { reservedCount, expiresAt };
  });
}

/**
 * Consolida a reserva de estoque quando o pagamento e confirmado.
 * Converte 'reserved' em 'confirmed' e deduz o estoque contabil na tabela products.
 */
async function confirmReservation(orderId) {
  if (!orderId) return { confirmed: 0 };

  return await withTransaction(async (client) => {
    // 1. Busca as reservas ativas
    const res = await client.query(`
      SELECT product_id, variant_sku, quantity
      FROM inventory_reservations
      WHERE order_id = $1 AND status = 'reserved'
    `, [orderId]);

    if (res.rows.length === 0) {
      return { confirmed: 0 };
    }

    // 2. Deduz o estoque contabil
    for (const r of res.rows) {
      await client.query(`
        UPDATE products
        SET estoque_quantidade = GREATEST(0, COALESCE(estoque_quantidade, 0) - $1),
            updated_at = NOW()
        WHERE id = $2
      `, [r.quantity, r.product_id]);
    }

    // 3. Marca as reservas como confirmadas
    await client.query(`
      UPDATE inventory_reservations
      SET status = 'confirmed'
      WHERE order_id = $1 AND status = 'reserved'
    `, [orderId]);

    console.log(`[INVENTORY CONFIRMED] Pedido #${orderId}: ${res.rows.length} item(ns) baixados no estoque definitivamente.`);
    return { confirmed: res.rows.length };
  });
}

/**
 * Libera reservas de um pedido cancelado ou estornado
 */
async function releaseReservation(orderId, reason = 'Cancelamento') {
  if (!orderId) return { released: 0 };

  const res = await query(`
    UPDATE inventory_reservations
    SET status = 'released', released_at = NOW()
    WHERE order_id = $1 AND status = 'reserved'
    RETURNING id
  `, [orderId]);

  if (res.rowCount > 0) {
    console.log(`[INVENTORY RELEASED] Pedido #${orderId}: ${res.rowCount} reserva(s) liberadas. Motivo: ${reason}`);
  }

  return { released: res.rowCount };
}

/**
 * Rotina do Worker: Localiza e libera reservas expiradas (TTL vencido)
 * Retorna os IDs dos pedidos expirados para cancelamento automatico no OrderService.
 */
async function cleanupExpiredReservations() {
  const expiredOrdersRes = await query(`
    SELECT DISTINCT order_id
    FROM inventory_reservations
    WHERE status = 'reserved' AND expires_at < NOW()
  `);

  if (expiredOrdersRes.rows.length === 0) {
    return { expiredOrdersCount: 0, expiredOrderIds: [] };
  }

  const expiredOrderIds = expiredOrdersRes.rows.map(r => r.order_id);

  // Libera todas as reservas vencidas
  await query(`
    UPDATE inventory_reservations
    SET status = 'released', released_at = NOW()
    WHERE status = 'reserved' AND expires_at < NOW()
  `);

  console.log(`[INVENTORY TTL CLEANUP] ${expiredOrderIds.length} pedido(s) com reserva de estoque expirada: ${expiredOrderIds.join(', ')}`);

  return {
    expiredOrdersCount: expiredOrderIds.length,
    expiredOrderIds
  };
}

module.exports = {
  reserveStock,
  confirmReservation,
  releaseReservation,
  cleanupExpiredReservations,
  TTL_MINUTES
};
