/**
 * customerOrderRoutes.js
 * 
 * Athena OS v2.1 — Portal do Cliente & Rastreamento em Tempo Real
 * Permite ao comprador visualizar status desacoplado (pagamento, expedição, ativação),
 * código de rastreamento com link da transportadora e histórico de suporte técnico.
 */

const express = require('express');
const { query } = require('../services/db.js');

const router = express.Router();

// -------------------------------------------------------------
// LISTA DE PEDIDOS DO CLIENTE LOGADO
// -------------------------------------------------------------
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const userEmail = req.user.email;

    // Busca pedidos do usuário
    const ordersRes = await query(`
      SELECT 
        o.id,
        o.order_number,
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
        o.shipping_address,
        o.created_at,
        o.paid_at
      FROM orders o
      WHERE o.customer_id = $1 
         OR o.user_id = $1
         OR (o.customer_snapshot->>'email') = $2
         OR o.user_email = $2
      ORDER BY o.created_at DESC
    `, [userId, userEmail]);

    const orderIds = ordersRes.rows.map(o => o.id);
    let itemsMap = {};
    let shipmentsMap = {};
    let activationsMap = {};

    if (orderIds.length > 0) {
      // 1. Itens
      const itemsRes = await query(`
        SELECT order_id, id, product_id, name, quantity, unit_price, fulfillment_type, fulfillment_status
        FROM order_items
        WHERE order_id = ANY($1)
      `, [orderIds]);
      itemsRes.rows.forEach(it => {
        if (!itemsMap[it.order_id]) itemsMap[it.order_id] = [];
        itemsMap[it.order_id].push(it);
      });

      // 2. Remessas (Rastreamento físico)
      const shipmentsRes = await query(`
        SELECT order_id, id, shipment_number, carrier, tracking_code, tracking_url, status, shipped_at, delivered_at
        FROM shipments
        WHERE order_id = ANY($1)
      `, [orderIds]);
      shipmentsRes.rows.forEach(s => {
        if (!shipmentsMap[s.order_id]) shipmentsMap[s.order_id] = [];
        shipmentsMap[s.order_id].push(s);
      });

      // 3. Ativações (Suporte digital)
      const actsRes = await query(`
        SELECT order_id, id, software_name, status, remote_tool, activated_at
        FROM digital_activations
        WHERE order_id = ANY($1)
      `, [orderIds]);
      actsRes.rows.forEach(a => {
        if (!activationsMap[a.order_id]) activationsMap[a.order_id] = [];
        activationsMap[a.order_id].push(a);
      });
    }

    const enrichedOrders = ordersRes.rows.map(o => ({
      ...o,
      items: itemsMap[o.id] || [],
      shipments: shipmentsMap[o.id] || [],
      digital_activations: activationsMap[o.id] || []
    }));

    return res.json(enrichedOrders);
  } catch (err) {
    console.error('[CUSTOMER ORDERS ERROR]', err);
    return res.status(500).json({ error: 'Erro ao carregar pedidos do cliente.' });
  }
});

// -------------------------------------------------------------
// DETALHE E RASTREAMENTO DO PEDIDO DO CLIENTE
// -------------------------------------------------------------
router.get('/:id/tracking', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userEmail = req.user.email;

    const orderRes = await query(`
      SELECT 
        o.id,
        o.order_number,
        o.order_type,
        o.status,
        o.payment_status,
        o.fulfillment_status,
        o.total_amount,
        o.shipping_address,
        o.created_at,
        o.paid_at
      FROM orders o
      WHERE (o.id = $1 OR o.order_number = $1)
        AND (o.customer_id = $2 OR o.customer_snapshot->>'email' = $3)
      LIMIT 1
    `, [id, userId, userEmail]);

    if (orderRes.rows.length === 0) {
      return res.status(404).json({ error: 'Pedido não encontrado ou acesso não autorizado.' });
    }

    const order = orderRes.rows[0];
    const orderId = order.id;

    // Itens
    const itemsRes = await query(`
      SELECT id, product_id, name, quantity, fulfillment_type, fulfillment_status
      FROM order_items
      WHERE order_id = $1
    `, [orderId]);

    // Remessas físicas
    const shipmentsRes = await query(`
      SELECT id, shipment_number, carrier, tracking_code, tracking_url, status, shipped_at, delivered_at
      FROM shipments
      WHERE order_id = $1
    `, [orderId]);

    // Ativações digitais
    const actsRes = await query(`
      SELECT id, software_name, status, remote_tool, activated_at
      FROM digital_activations
      WHERE order_id = $1
    `, [orderId]);

    // Linha do tempo pública/cliente
    const eventsRes = await query(`
      SELECT event_type, description, created_at
      FROM order_events
      WHERE order_id = $1
      ORDER BY created_at ASC
    `, [orderId]);

    return res.json({
      order,
      items: itemsRes.rows,
      shipments: shipmentsRes.rows,
      digital_activations: actsRes.rows,
      timeline: eventsRes.rows
    });
  } catch (err) {
    console.error('[CUSTOMER TRACKING ERROR]', err);
    return res.status(500).json({ error: 'Erro ao buscar rastreamento do pedido.' });
  }
});

module.exports = router;
