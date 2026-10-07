/**
 * orderService.js
 * 
 * Servico Central de Dominio de Pedidos do Athena OS.
 * Implementa a Regra de Ouro:
 * - Recalculo estrito de precos no servidor (ignora totais enviados pelo cliente);
 * - Suporte a pedidos mistos (fisico + digital);
 * - Orquestracao atomica com PointsService, InventoryReservationService, FulfillmentService e ActivationService;
 * - Idempotencia em transicoes de estado e timeline auditavel.
 */

const { query, withTransaction } = require('./db');
const { creditPurchasePoints, debitRedemptionPoints, reverseRedemptionPoints } = require('./pointsService');
const { reserveStock, confirmReservation, releaseReservation } = require('./inventoryReservationService');
const { createInitialShipment } = require('./fulfillmentService');
const { createActivationQueues } = require('./activationService');
const { recordSecurityEvent } = require('./securityAuditService');
const { evaluateCoupon } = require('../utils/coupons');

/**
 * Gera o proximo order_number comercial legivel (ex: '10482' para vendas ou 'R-0012' para resgates)
 */
async function generateOrderNumber(client, orderType = 'sale') {
  if (orderType === 'points_redemption') {
    const res = await client.query("SELECT nextval('order_number_redemption_seq') AS num");
    return `R-${String(res.rows[0].num).padStart(4, '0')}`;
  }
  const res = await client.query("SELECT nextval('order_number_sale_seq') AS num");
  return String(res.rows[0].num);
}

/**
 * Cria um novo pedido no Athena OS com recálculo estrito de preços e reservas no banco de dados.
 */
async function createOrder({
  customerId,
  orderType = 'sale', // 'sale' | 'points_redemption'
  items = [],
  paymentMethod = 'PIX',
  shippingAddress = {},
  customerSnapshot = {},
  couponCode = null,
  notes = null
}) {
  if (!customerId) throw new Error('customerId é obrigatório para criar um pedido.');
  if (!Array.isArray(items) || items.length === 0) throw new Error('O pedido precisa conter ao menos um item.');

  return await withTransaction(async (client) => {
    // 1. Busca os produtos no banco de dados para garantir integridade e seguranca de precos
    const productIds = items.map(i => i.product_id || i.productId || i.id).filter(Boolean);
    const pRes = await client.query('SELECT id, name, price, product_type, variants, a_points FROM products WHERE id = ANY($1::varchar[])', [productIds]);
    const dbProducts = pRes.rows;

    let subtotalAmount = 0.00;
    let totalPointsSpent = 0;
    const validatedItems = [];

    for (const item of items) {
      const pId = item.product_id || item.productId || item.id;
      const dbProd = dbProducts.find(p => p.id === pId);
      if (!dbProd) throw new Error(`Produto ${pId} não foi encontrado no catálogo.`);

      const qty = Math.max(1, parseInt(item.quantity || 1, 10));
      let unitPrice = Number(dbProd.price || 0);

      // Se houver variacao com preco customizado
      const variantSku = item.variant_sku || item.variantSku || null;
      if (variantSku && Array.isArray(dbProd.variants)) {
        const v = dbProd.variants.find(va => va.sku === variantSku);
        if (v && Number(v.price) > 0) unitPrice = Number(v.price);
      }

      // Define se o item e fisico ou digital
      const isDigital = dbProd.product_type === 'digital' || item.fulfillment_type === 'digital' || item.fulfillmentType === 'digital';
      const fulfillmentType = isDigital ? 'digital' : 'physical';

      let pointsPrice = 0;
      if (orderType === 'points_redemption') {
        pointsPrice = parseInt(item.points_price || item.pointsPrice || dbProd.a_points || 0, 10);
        if (pointsPrice <= 0) throw new Error(`O produto "${dbProd.name}" não possui custo em A-Points configurado para resgate.`);
        totalPointsSpent += pointsPrice * qty;
        unitPrice = 0.00; // Resgate com pontos tem custo monetario zero
      } else {
        subtotalAmount += unitPrice * qty;
      }

      validatedItems.push({
        productId: pId,
        variantSku,
        name: dbProd.name,
        quantity: qty,
        unitPrice,
        totalPrice: unitPrice * qty,
        pointsPrice,
        fulfillmentType,
        fulfillmentStatus: 'pending'
      });
    }

    // 2. Avaliacao de Cupons de Desconto (se aplicavel)
    let discountAmount = 0.00;
    if (couponCode && orderType === 'sale') {
      const cleanCoupon = String(couponCode).trim().toUpperCase();
      const cRes = await client.query('SELECT * FROM coupons WHERE UPPER(code) = $1', [cleanCoupon]);
      if (cRes.rows.length > 0) {
        const coupon = cRes.rows[0];
        const evalRes = evaluateCoupon(coupon, validatedItems, customerSnapshot.email, customerSnapshot.document);
        if (evalRes.valid && evalRes.discountAmount > 0) {
          discountAmount = evalRes.discountAmount;
        }
      }
    }

    const shippingAmount = 0.00; // Frete B2B sob consulta ou embutido
    const totalAmount = Math.max(0.00, subtotalAmount - discountAmount + shippingAmount);

    // 3. Geracao do numero comercial do pedido
    const orderNumber = await generateOrderNumber(client, orderType);

    // 4. Se for resgate por pontos, debita o saldo com lock atomico no PointsService
    if (orderType === 'points_redemption' && totalPointsSpent > 0) {
      await debitRedemptionPoints({
        customerId,
        orderId: orderNumber,
        pointsCost: totalPointsSpent,
        description: `Resgate do Pedido #${orderNumber}`
      });
    }

    // 5. Insercao do pedido na tabela orders
    const initialPaymentStatus = orderType === 'points_redemption' ? 'free' : 'pending';
    const initialStatus = orderType === 'points_redemption' ? 'processing' : 'open';

    const orderInsertRes = await client.query(`
      INSERT INTO orders (
        order_number, customer_id, order_type, status,
        payment_status, fulfillment_status, subtotal_amount,
        discount_amount, shipping_amount, total_amount,
        points_spent, points_earned, payment_method,
        shipping_address, customer_snapshot, notes, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, 'unfulfilled', $6, $7, $8, $9, $10, 0, $11, $12, $13, $14, NOW(), NOW()
      )
      RETURNING id, order_number, status, payment_status, total_amount, created_at
    `, [
      orderNumber,
      customerId,
      orderType,
      initialStatus,
      initialPaymentStatus,
      subtotalAmount,
      discountAmount,
      shippingAmount,
      totalAmount,
      totalPointsSpent,
      paymentMethod,
      JSON.stringify(shippingAddress || {}),
      JSON.stringify(customerSnapshot || {}),
      notes
    ]);

    const createdOrder = orderInsertRes.rows[0];
    const orderUuid = createdOrder.id;

    // 6. Insercao dos itens na tabela order_items
    for (const it of validatedItems) {
      await client.query(`
        INSERT INTO order_items (
          order_id, product_id, variant_sku, name,
          quantity, unit_price, total_price, points_price,
          fulfillment_type, fulfillment_status, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending', NOW())
      `, [
        orderUuid,
        it.productId,
        it.variantSku,
        it.name,
        it.quantity,
        it.unitPrice,
        it.totalPrice,
        it.pointsPrice,
        it.fulfillmentType
      ]);
    }

    // 7. Reserva de Estoque temporaria para itens fisicos
    await reserveStock({
      orderId: orderUuid,
      items: validatedItems,
      paymentMethod
    });

    // 8. Se for resgate 100% pago com pontos, roteia imediatamente para a fila de separacao
    if (orderType === 'points_redemption') {
      const hasPhysical = validatedItems.some(i => i.fulfillmentType === 'physical');
      const hasDigital = validatedItems.some(i => i.fulfillmentType === 'digital');
      if (hasPhysical) await createInitialShipment({ orderId: orderUuid });
      if (hasDigital) await createActivationQueues(orderUuid);
    }

    // 9. Timeline Event
    await client.query(`
      INSERT INTO order_events (
        id, order_id, event_type, actor_id, actor_type, actor_name, description, metadata, created_at
      ) VALUES ($1, $2, 'ORDER_CREATED', $3, 'customer', $4, $5, $6, NOW())
    `, [
      `evt_ord_${orderUuid}_${Date.now()}`,
      orderUuid,
      customerId,
      customerSnapshot.name || 'Cliente',
      `Pedido #${orderNumber} (${orderType === 'sale' ? 'Venda Online' : 'Resgate A-Points'}) criado com sucesso`,
      JSON.stringify({ totalAmount, pointsSpent: totalPointsSpent, itemsCount: validatedItems.length })
    ]);

    console.log(`[ORDER CREATED] Pedido #${orderNumber} (${orderUuid}) registrado com sucesso para o cliente ${customerId}`);

    return {
      id: orderUuid,
      orderNumber,
      orderType,
      status: initialStatus,
      paymentStatus: initialPaymentStatus,
      subtotalAmount,
      discountAmount,
      totalAmount,
      pointsSpent: totalPointsSpent,
      items: validatedItems
    };
  });
}

/**
 * Confirma o pagamento de um pedido (chamado pelo Asaas Webhook ou conciliacao manual).
 * Executa todas as acoes de dominio correspondentes:
 * 1. Muda payment_status = 'paid', status = 'processing'
 * 2. Consolida reservas de estoque (baixa contabil)
 * 3. Credita A-Points da compra
 * 4. Roteia itens fisicos para Shipment ('pending') e digitais para Ativacao ('awaiting_activation')
 * 5. Registra evento na Timeline
 */
async function confirmPayment(orderIdOrParams, paymentMetadata = {}) {
  let orderId = orderIdOrParams;
  let paymentMeta = paymentMetadata;
  if (orderIdOrParams && typeof orderIdOrParams === 'object') {
    orderId = orderIdOrParams.orderId;
    paymentMeta = {
      paymentId: orderIdOrParams.asaasPaymentId || orderIdOrParams.paymentId,
      paidAmount: orderIdOrParams.paidAmount,
      paymentMethod: orderIdOrParams.paymentMethod,
      ...orderIdOrParams
    };
  }

  if (!orderId) throw new Error('orderId é obrigatório para confirmar pagamento.');

  return await withTransaction(async (client) => {
    // 1. Busca o pedido e valida idempotencia
    const orderRes = await client.query(`
      SELECT id, order_number, customer_id, status, payment_status, total_amount, order_type
      FROM orders
      WHERE id::text = $1 OR order_number = $1
      FOR UPDATE
    `, [String(orderId)]);

    if (orderRes.rows.length === 0) {
      throw new Error(`Pedido ${orderId} não foi encontrado.`);
    }

    const order = orderRes.rows[0];

    // Se ja foi pago, sai de forma idempotente sem reprocessar
    if (order.payment_status === 'paid') {
      console.log(`[PAYMENT IDEMPOTENT SKIP] Pedido #${order.order_number} já possui status 'paid'.`);
      return { alreadyPaid: true, orderId: order.id, orderNumber: order.order_number };
    }

    // 2. Atualiza status do pedido
    await client.query(`
      UPDATE orders
      SET payment_status = 'paid', status = 'processing', paid_at = NOW(),
          asaas_payment_id = COALESCE($1, asaas_payment_id), updated_at = NOW()
      WHERE id = $2
    `, [paymentMeta.paymentId || null, order.id]);

    // 3. Consolida as reservas de estoque (baixa contabil definitiva)
    await confirmReservation(order.id);

    // 4. Credita pontos da compra se for venda comercial
    let pointsCredited = 0;
    if (order.order_type === 'sale' && Number(order.total_amount) >= 50) {
      const ptsRes = await creditPurchasePoints({
        customerId: order.customer_id,
        orderId: order.order_number,
        orderTotal: order.total_amount
      });
      if (!ptsRes.skipped) pointsCredited = ptsRes.delta;
    }

    // 5. Roteamento de Fulfillment (Fisico ➔ Shipment; Digital ➔ Ativacao)
    const itemsRes = await client.query(`
      SELECT fulfillment_type FROM order_items WHERE order_id = $1
    `, [order.id]);

    const hasPhysical = itemsRes.rows.some(r => r.fulfillment_type === 'physical');
    const hasDigital = itemsRes.rows.some(r => r.fulfillment_type === 'digital');

    if (hasPhysical) {
      await createInitialShipment({ orderId: order.id });
    }

    if (hasDigital) {
      await createActivationQueues(order.id);
    }

    // 6. Timeline Event
    await client.query(`
      INSERT INTO order_events (
        id, order_id, event_type, actor_id, actor_type, actor_name, description, metadata, created_at
      ) VALUES ($1, $2, 'PAYMENT_CONFIRMED', $3, 'system', 'Gateway Asaas', $4, $5, NOW())
    `, [
      `evt_pay_${order.id}_${Date.now()}`,
      order.id,
      null,
      `Pagamento de R$ ${Number(order.total_amount).toFixed(2)} confirmado com sucesso via ${paymentMetadata.billingType || 'Gateway'}`,
      JSON.stringify(paymentMetadata)
    ]);

    console.log(`[PAYMENT CONFIRMED] Pedido #${order.order_number} liquidado com sucesso. Fulfillment roteado!`);

    return {
      success: true,
      orderId: order.id,
      orderNumber: order.order_number,
      pointsCredited,
      routedToPhysical: hasPhysical,
      routedToDigital: hasDigital
    };
  });
}

/**
 * Cancela um pedido, liberando estoque reservado e estornando pontos se aplicavel
 */
async function cancelOrder(orderId, reason = 'Cancelamento solicitado', actorId = null, actorName = 'Administração') {
  if (!orderId) throw new Error('orderId é obrigatório para cancelar pedido.');

  return await withTransaction(async (client) => {
    const orderRes = await client.query(`
      SELECT id, order_number, customer_id, status, payment_status, points_spent, order_type
      FROM orders
      WHERE id::text = $1 OR order_number = $1
      FOR UPDATE
    `, [String(orderId)]);

    if (orderRes.rows.length === 0) throw new Error(`Pedido ${orderId} não encontrado.`);
    const order = orderRes.rows[0];

    // Atualiza status do pedido
    await client.query(`
      UPDATE orders
      SET status = 'cancelled', cancelled_at = NOW(), updated_at = NOW()
      WHERE id = $1
    `, [order.id]);

    // Libera reservas de estoque
    await releaseReservation(order.id, reason);

    // Se o pedido usou A-Points (resgate), estorna os pontos para o cliente
    let pointsReversed = 0;
    if (order.points_spent > 0) {
      await reverseRedemptionPoints({
        customerId: order.customer_id,
        orderId: order.order_number,
        pointsRefunded: order.points_spent,
        reason
      });
      pointsReversed = order.points_spent;
    }

    // Timeline event
    await client.query(`
      INSERT INTO order_events (
        id, order_id, event_type, actor_id, actor_type, actor_name, description, created_at
      ) VALUES ($1, $2, 'ORDER_CANCELLED', $3, 'staff', $4, $5, NOW())
    `, [
      `evt_canc_${order.id}_${Date.now()}`,
      order.id,
      actorId,
      actorName,
      `Pedido cancelado. Motivo: ${reason}. ${pointsReversed > 0 ? `(${pointsReversed} pontos estornados)` : ''}`
    ]);

    console.log(`[ORDER CANCELLED] Pedido #${order.order_number} cancelado com sucesso.`);
    return { success: true, orderNumber: order.order_number, pointsReversed };
  });
}

/**
 * Consulta completa de um pedido com todas as suas entidades e timeline
 */
async function getOrderDetails(orderId) {
  const orderRes = await query(`
    SELECT * FROM orders WHERE id::text = $1 OR order_number = $1
  `, [String(orderId)]);

  if (orderRes.rows.length === 0) return null;
  const order = orderRes.rows[0];

  const itemsRes = await query(`
    SELECT * FROM order_items WHERE order_id = $1 ORDER BY created_at ASC
  `, [order.id]);

  const shipmentsRes = await query(`
    SELECT * FROM shipments WHERE order_id = $1 ORDER BY created_at ASC
  `, [order.id]);

  const activationsRes = await query(`
    SELECT da.*, 
           COALESCE(json_agg(aa.*) FILTER (WHERE aa.id IS NOT NULL), '[]') as attempts
    FROM digital_activations da
    LEFT JOIN activation_attempts aa ON aa.activation_id = da.id
    WHERE da.order_id = $1
    GROUP BY da.id
    ORDER BY da.created_at ASC
  `, [order.id]);

  const eventsRes = await query(`
    SELECT * FROM order_events WHERE order_id = $1 ORDER BY created_at ASC
  `, [order.id]);

  return {
    ...order,
    items: itemsRes.rows,
    shipments: shipmentsRes.rows,
    activations: activationsRes.rows,
    timeline: eventsRes.rows
  };
}

module.exports = {
  createOrder,
  confirmPayment,
  cancelOrder,
  getOrderDetails
};
