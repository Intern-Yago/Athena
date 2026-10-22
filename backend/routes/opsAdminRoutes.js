/**
 * opsAdminRoutes.js
 * 
 * Athena OS v2.1 — Painel Operacional Admin & Kanban de Expedição / Ativação
 * Permite que a equipe interna gerencie separação física, conferência com trava,
 * despacho de remessas e suporte técnico a ativações de softwares.
 */

const express = require('express');
const { query, withTransaction } = require('../services/db.js');
const { 
  createInitialShipment, 
  startPicking, 
  completeInspection, 
  dispatchShipment, 
  updateDeliveryStatus 
} = require('../services/fulfillmentService.js');
const { 
  recordContactAttempt, 
  startRemoteSession, 
  completeActivation 
} = require('../services/activationService.js');
let syncOmieSalesOrders = null;
try {
  const syncModule = require('../scripts/sync_omie_orders_to_fulfillment.js');
  syncOmieSalesOrders = syncModule.syncOmieSalesOrders;
} catch (e) {
  // Script opcional em ambiente isolado de testes
}

const router = express.Router();

// Cache em memória L1 no servidor (evita queries repetidas ao PostgreSQL a cada troca de aba)
const OPS_CACHE_TTL_MS = 20 * 1000; // 20 segundos
const opsServerCache = {
  orders: { data: null, timestamp: 0 },
  kanban: { data: null, timestamp: 0 }
};

function invalidateOpsServerCache() {
  opsServerCache.orders = { data: null, timestamp: 0 };
  opsServerCache.kanban = { data: null, timestamp: 0 };
}

// Qualquer mutação (POST/PUT/PATCH/DELETE) invalida imediatamente o cache operacional
router.use((req, res, next) => {
  if (req.method !== 'GET') {
    invalidateOpsServerCache();
  }
  next();
});

function getFallbackDb() {
  try {
    const fs = require('fs');
    const path = require('path');
    const dbPath = path.join(__dirname, '..', 'data', 'athena-db.json');
    if (fs.existsSync(dbPath)) {
      return JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    }
  } catch (e) {}
  return { orders: [] };
}

// -------------------------------------------------------------
// 0. LISTAGEM GERAL DE PEDIDOS COM MÉTRICAS (PAINEL ADMIN)
// -------------------------------------------------------------
router.get(['/', '/orders', '/ops/orders'], async (req, res) => {
  try {
    const now = Date.now();
    if (
      req.query.force !== 'true' &&
      opsServerCache.orders.data &&
      now - opsServerCache.orders.timestamp < OPS_CACHE_TTL_MS
    ) {
      return res.json(opsServerCache.orders.data);
    }

    const ordersRes = await query(`
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
        o.omie_pedido_id,
        o.omie_nfe_number,
        o.shipping_address,
        o.customer_snapshot,
        COALESCE(o.customer_snapshot->>'phone', u.phone) AS customer_phone,
        COALESCE(o.customer_snapshot->>'document', u.document) AS customer_document,
        o.user_name,
        o.user_email,
        o.created_at,
        o.paid_at
      FROM orders o
      LEFT JOIN users u ON o.customer_id = u.id::varchar
      ORDER BY o.created_at DESC
    `);

    const orderIds = ordersRes.rows.map(o => o.id);
    let itemsMap = {};
    let shipmentsMap = {};
    let activationsMap = {};

    if (orderIds.length > 0) {
      const itemsRes = await query(`
        SELECT order_id, id, product_id, name, quantity, unit_price, total_price, fulfillment_type, fulfillment_status
        FROM order_items
        WHERE order_id = ANY($1)
      `, [orderIds]);
      itemsRes.rows.forEach(it => {
        if (!itemsMap[it.order_id]) itemsMap[it.order_id] = [];
        itemsMap[it.order_id].push(it);
      });

      const shipmentsRes = await query(`
        SELECT order_id, id, shipment_number, carrier, tracking_code, tracking_url, status, shipped_at, delivered_at
        FROM shipments
        WHERE order_id = ANY($1)
      `, [orderIds]);
      shipmentsRes.rows.forEach(s => {
        if (!shipmentsMap[s.order_id]) shipmentsMap[s.order_id] = [];
        shipmentsMap[s.order_id].push(s);
      });

      const actsRes = await query(`
        SELECT order_id, id, software_name, status, remote_tool, license_key, activated_at
        FROM digital_activations
        WHERE order_id = ANY($1)
      `, [orderIds]);
      actsRes.rows.forEach(a => {
        if (!activationsMap[a.order_id]) activationsMap[a.order_id] = [];
        activationsMap[a.order_id].push(a);
      });
    }

    // Deduplicação defensiva: se um pedido nasceu no Site e possui omie_pedido_id vinculado,
    // oculta eventual registro legado 'ord_omie_{omie_pedido_id}' duplicado.
    const siteSyncedOmieIds = new Set(
      ordersRes.rows
        .filter(o => !String(o.id).startsWith('ord_omie_') && o.omie_pedido_id)
        .map(o => String(o.omie_pedido_id))
    );

    const deduplicatedRows = ordersRes.rows.filter(o => {
      if (String(o.id).startsWith('ord_omie_') && o.omie_pedido_id && siteSyncedOmieIds.has(String(o.omie_pedido_id))) {
        return false;
      }
      return true;
    });

    const orders = deduplicatedRows.map(o => ({
      ...o,
      items: (itemsMap[o.id] && itemsMap[o.id].length > 0) ? itemsMap[o.id] : (Array.isArray(o.items) ? o.items : []),
      shipments: shipmentsMap[o.id] || [],
      digital_activations: activationsMap[o.id] || []
    }));

    // Métricas
    const totalOrders = orders.length;
    const paidOrders = orders.filter(o => o.payment_status === 'paid' || o.payment_status === 'free');
    const totalRevenue = paidOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
    const pendingOrders = orders.filter(o => o.payment_status === 'pending').length;
    const cancelledOrders = orders.filter(o => o.payment_status === 'cancelled').length;
    const redemptionOrders = orders.filter(o => o.order_type === 'points_redemption').length;

    const payload = {
      orders,
      metrics: {
        total_orders: totalOrders,
        total_revenue: totalRevenue,
        paid_orders: paidOrders.length,
        pending_orders: pendingOrders,
        cancelled_orders: cancelledOrders,
        redemption_orders: redemptionOrders
      }
    };
    opsServerCache.orders = { data: payload, timestamp: Date.now() };
    return res.json(payload);
  } catch (err) {
    console.error('[OPS ADMIN ORDERS ERROR]', err.message);
    const db = getFallbackDb();
    const orders = Array.isArray(db.orders) ? db.orders : [];
    return res.json({
      orders,
      metrics: {
        total_orders: orders.length,
        total_revenue: orders.reduce((acc, o) => acc + (Number(o.total_amount) || 0), 0),
        paid_orders: orders.filter(o => o.status === 'paid' || o.payment_status === 'paid').length,
        pending_orders: orders.filter(o => o.status === 'pending').length,
        cancelled_orders: orders.filter(o => o.status === 'cancelled').length,
        redemption_orders: orders.filter(o => o.order_type === 'points_redemption').length
      }
    });
  }
});

router.get(['/orders/:id', '/ops/orders/:id', '/:id([0-9a-fA-F-]{10,}|[0-9]+)'], async (req, res) => {
  try {
    const { id } = req.params;
    const orderRes = await query(`
      SELECT 
        o.*,
        COALESCE(o.customer_snapshot->>'phone', u.phone) AS customer_phone,
        COALESCE(o.customer_snapshot->>'document', u.document) AS customer_document
      FROM orders o
      LEFT JOIN users u ON o.customer_id = u.id::varchar
      WHERE o.id = $1 OR o.order_number = $1 
      LIMIT 1
    `, [id]);
    if (orderRes.rows.length === 0) return res.status(404).json({ error: 'Pedido não encontrado.' });
    const order = orderRes.rows[0];

    const itemsRes = await query('SELECT * FROM order_items WHERE order_id = $1', [order.id]);
    const shipmentsRes = await query('SELECT * FROM shipments WHERE order_id = $1', [order.id]);
    const actsRes = await query('SELECT * FROM digital_activations WHERE order_id = $1', [order.id]);
    const eventsRes = await query('SELECT * FROM order_events WHERE order_id = $1 ORDER BY created_at ASC', [order.id]);

    return res.json({
      order,
      items: itemsRes.rows.length > 0 ? itemsRes.rows : (Array.isArray(order.items) ? order.items : []),
      shipments: shipmentsRes.rows,
      digital_activations: actsRes.rows,
      events: eventsRes.rows
    });
  } catch (err) {
    console.error('[OPS ADMIN ORDER DETAIL ERROR]', err);
    return res.status(500).json({ error: 'Erro ao buscar detalhes do pedido.' });
  }
});

// -------------------------------------------------------------
// EXPURGO EM LOTE DE PEDIDOS DE TESTE (ADMIN ONLY)
// -------------------------------------------------------------
const handleCleanupTestOrders = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ 
        error: 'Permissão negada. Apenas administradores do sistema podem limpar pedidos de teste.' 
      });
    }

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
    } catch (dbErr) {
      console.warn('[CLEANUP TEST ORDERS DB WARN]', dbErr.message);
    }

    // Limpa também do JSON local se houver
    try {
      const fs = require('fs');
      const path = require('path');
      const dbPath = path.join(__dirname, '..', 'data', 'athena-db.json');
      if (fs.existsSync(dbPath)) {
        const fileContent = fs.readFileSync(dbPath, 'utf-8');
        const db = JSON.parse(fileContent);
        if (Array.isArray(db.orders)) {
          const prev = db.orders.length;
          db.orders = db.orders.filter(o => 
            !String(o.user_email || '').includes('@athenatest.com') &&
            !String(o.customer_snapshot?.email || '').includes('@athenatest.com') &&
            !String(o.order_number || '').startsWith('N-test_') &&
            !String(o.order_number || '').startsWith('N-RACE-') &&
            !String(o.id || '').startsWith('test_') &&
            !deletedOrderIds.includes(o.id)
          );
          if (db.orders.length < prev) {
            fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf-8');
          }
        }
      }
    } catch (fsErr) {
      console.warn('[CLEANUP TEST ORDERS FS WARN]', fsErr.message);
    }

    invalidateOpsServerCache();

    return res.json({
      success: true,
      deleted_count: deletedOrderIds.length,
      message: `${deletedOrderIds.length} pedido(s) de teste removido(s) com sucesso.`
    });
  } catch (err) {
    console.error('[OPS ADMIN CLEANUP TEST ORDERS ERROR]', err);
    return res.status(500).json({ error: 'Erro ao limpar pedidos de teste: ' + err.message });
  }
};

router.post(['/orders/cleanup-tests', '/cleanup-tests'], handleCleanupTestOrders);
router.delete(['/orders/cleanup-tests', '/cleanup-tests'], handleCleanupTestOrders);

// -------------------------------------------------------------
// EXCLUSÃO DE PEDIDO INDIVIDUAL (ADMIN ONLY)
// -------------------------------------------------------------
router.delete(['/orders/:id', '/ops/orders/:id', '/:id'], async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ 
        error: 'Permissão negada. Apenas administradores do sistema podem excluir pedidos.' 
      });
    }

    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: 'ID do pedido não informado.' });
    }

    let targetOrder = null;
    try {
      const orderRes = await query(
        'SELECT id, order_number, user_email FROM orders WHERE id = $1 OR order_number = $1 LIMIT 1',
        [id]
      );
      if (orderRes.rows.length > 0) {
        targetOrder = orderRes.rows[0];
      }
    } catch (errDb) {
      console.warn('[DELETE ORDER DB QUERY WARN]', errDb.message);
    }

    if (targetOrder) {
      const orderId = targetOrder.id;

      await withTransaction(async (client) => {
        await client.query(`
          DELETE FROM activation_attempts 
          WHERE activation_id IN (SELECT id FROM digital_activations WHERE order_id = $1)
        `, [orderId]);
        await client.query('DELETE FROM digital_activations WHERE order_id = $1', [orderId]);
        await client.query('DELETE FROM shipments WHERE order_id = $1', [orderId]);
        await client.query('DELETE FROM inventory_reservations WHERE order_id = $1', [orderId]);
        await client.query('DELETE FROM order_items WHERE order_id = $1', [orderId]);
        await client.query('DELETE FROM order_events WHERE order_id = $1', [orderId]);
        await client.query('DELETE FROM a_points_ledger WHERE order_id = $1', [orderId]);
        try {
          await client.query('DELETE FROM a_points_transactions WHERE order_id = $1', [orderId]);
        } catch (_) {}
        await client.query('DELETE FROM orders WHERE id = $1', [orderId]);
      });
    }

    // Remove do fallback local athena-db.json se existir
    let removedFromFallback = false;
    try {
      const fs = require('fs');
      const path = require('path');
      const dbPath = path.join(__dirname, '..', 'data', 'athena-db.json');
      if (fs.existsSync(dbPath)) {
        const fileContent = fs.readFileSync(dbPath, 'utf-8');
        const db = JSON.parse(fileContent);
        if (Array.isArray(db.orders)) {
          const prev = db.orders.length;
          db.orders = db.orders.filter(o => o.id !== id && o.order_number !== id && (!targetOrder || o.id !== targetOrder.id));
          if (db.orders.length < prev) {
            fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf-8');
            removedFromFallback = true;
          }
        }
      }
    } catch (fsErr) {
      console.warn('[DELETE ORDER FALLBACK FS WARN]', fsErr.message);
    }

    if (!targetOrder && !removedFromFallback) {
      return res.status(404).json({ error: 'Pedido não encontrado para exclusão.' });
    }

    invalidateOpsServerCache();

    return res.json({
      success: true,
      message: `Pedido #${targetOrder?.order_number || id} excluído com sucesso.`
    });
  } catch (err) {
    console.error('[OPS ADMIN DELETE ORDER ERROR]', err);
    return res.status(500).json({ error: 'Erro ao excluir pedido: ' + err.message });
  }
});

// -------------------------------------------------------------
// 1. KANBAN OPERACIONAL UNIFICADO
// -------------------------------------------------------------
router.get(['/kanban', '/fulfillment/kanban', '/ops/kanban'], async (req, res) => {
  try {
    const shouldSyncOmie = req.query.sync === 'true' || req.query.sync_omie === 'true';
    if (shouldSyncOmie && typeof syncOmieSalesOrders === 'function') {
      try {
        await syncOmieSalesOrders();
        invalidateOpsServerCache();
      } catch (errSync) {
        console.warn('[KANBAN OMIE SYNC WARN]:', errSync.message);
      }
    } else if (
      req.query.force !== 'true' &&
      opsServerCache.kanban.data &&
      Date.now() - opsServerCache.kanban.timestamp < OPS_CACHE_TTL_MS
    ) {
      return res.json(opsServerCache.kanban.data);
    }

    // 1. Remessas Físicas
    const shipmentsQuery = await query(`
      SELECT 
        s.*,
        o.order_number,
        o.customer_id,
        o.order_type,
        o.omie_pedido_id,
        o.customer_snapshot,
        o.shipping_address,
        o.created_at AS order_created_at
      FROM shipments s
      JOIN orders o ON s.order_id = o.id
      ORDER BY s.created_at ASC
    `);

    // 2. Itens dos pedidos
    const orderIds = [...new Set(shipmentsQuery.rows.map(s => s.order_id))];
    let itemsByOrder = {};
    if (orderIds.length > 0) {
      const itemsRes = await query(`
        SELECT order_id, product_id, name, quantity, fulfillment_type, fulfillment_status
        FROM order_items
        WHERE order_id = ANY($1)
      `, [orderIds]);
      itemsRes.rows.forEach(it => {
        if (!itemsByOrder[it.order_id]) itemsByOrder[it.order_id] = [];
        itemsByOrder[it.order_id].push(it);
      });
    }

    const kanban = {
      pending: [],
      picking: [],
      ready: [],
      shipped: [],
      delivered: []
    };

    shipmentsQuery.rows.forEach(s => {
      const effectiveStatus = (s.status === 'pending' && s.picking_by) ? 'picking' : s.status;
      const enriched = {
        ...s,
        status: effectiveStatus,
        items: (itemsByOrder[s.order_id] || []).filter(i => i.fulfillment_type === 'physical')
      };
      if (kanban[effectiveStatus]) {
        kanban[effectiveStatus].push(enriched);
      }
    });

    // 3. Fila de Ativações Digitais
    const activationsQuery = await query(`
      SELECT 
        da.*,
        o.order_number,
        o.customer_snapshot,
        o.created_at AS order_created_at
      FROM digital_activations da
      JOIN orders o ON da.order_id = o.id
      ORDER BY da.created_at ASC
    `);

    const payload = {
      physical_kanban: kanban,
      digital_activations: activationsQuery.rows,
      summary: {
        total_shipments: shipmentsQuery.rows.length,
        total_activations: activationsQuery.rows.length
      }
    };
    opsServerCache.kanban = { data: payload, timestamp: Date.now() };
    return res.json(payload);
  } catch (err) {
    console.error('[OPS ADMIN KANBAN ERROR]', err.message);
    return res.json({
      physical_kanban: {
        pending: [],
        picking: [],
        packing: [],
        shipped: [],
        delivered: []
      },
      digital_activations: [],
      summary: {
        total_shipments: 0,
        total_activations: 0
      }
    });
  }
});

// -------------------------------------------------------------
// 2. ROMANEIO DE SEPARAÇÃO (PICKING LIST)
// -------------------------------------------------------------
router.get(['/picking-list/:orderId', '/fulfillment/picking-list/:orderId'], async (req, res) => {
  try {
    const { orderId } = req.params;
    const staffId = req.user?.id || 'staff';
    const staffName = req.user?.name || 'Operador de Separação';

    const orderRes = await query('SELECT * FROM orders WHERE id = $1 OR order_number = $1', [orderId]);
    if (orderRes.rows.length === 0) {
      return res.status(404).json({ error: 'Pedido não encontrado.' });
    }
    const order = orderRes.rows[0];

    const itemsRes = await query(`
      SELECT id, product_id, name, quantity, fulfillment_type, fulfillment_status
      FROM order_items
      WHERE order_id = $1 AND fulfillment_type = 'physical'
    `, [order.id]);

    // Localiza remessa existente ou cria inicial se não existir
    let shipmentRes = await query('SELECT * FROM shipments WHERE order_id = $1 LIMIT 1', [order.id]);
    let shipment = shipmentRes.rows[0];
    if (!shipment) {
      shipment = await createInitialShipment({ orderId: order.id });
    }

    // Se estiver pendente, avança automaticamente para picking
    if (shipment.status === 'pending') {
      shipment = await startPicking({
        shipmentId: shipment.id,
        staffId,
        staffName
      });
    }

    return res.json({
      order_number: order.order_number,
      shipment_id: shipment.id,
      shipment_status: shipment.status,
      customer: order.customer_snapshot,
      shipping_address: order.shipping_address,
      physical_items_to_pick: itemsRes.rows,
      generated_at: new Date().toISOString()
    });
  } catch (err) {
    console.error('[PICKING LIST ERROR]', err);
    return res.status(500).json({ error: 'Erro ao gerar lista de separação.' });
  }
});

// -------------------------------------------------------------
// 3. CONFERÊNCIA FÍSICA OBRIGATÓRIA (TRAVA DE SEGURANÇA)
// -------------------------------------------------------------
router.post(['/conference', '/fulfillment/conference'], async (req, res) => {
  try {
    const { shipmentId, notes } = req.body;
    if (!shipmentId) {
      return res.status(400).json({ error: 'ID da remessa (shipmentId) é obrigatório.' });
    }

    const staffId = req.user?.id || 'staff_conferente';
    const staffName = req.user?.name || 'Conferente Responsável';

    const updatedShipment = await completeInspection({
      shipmentId,
      staffId,
      staffName,
      notes: notes || 'Conferência física 100% aprovada (SKU, Qtd e Acessórios)'
    });

    return res.json({
      success: true,
      message: 'Conferência registrada com sucesso. Remessa liberada para despacho.',
      shipment: updatedShipment
    });
  } catch (err) {
    console.error('[CONFERENCE ERROR]', err);
    return res.status(400).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// 4. DESPACHO DA REMESSA (TRANSPORTADORA & RASTREIO)
// -------------------------------------------------------------
router.post(['/dispatch', '/fulfillment/dispatch'], async (req, res) => {
  try {
    const { shipmentId, carrier, trackingCode, trackingUrl } = req.body;
    if (!shipmentId || !carrier) {
      return res.status(400).json({ error: 'shipmentId e carrier (transportadora) são obrigatórios.' });
    }

    const staffId = req.user?.id || 'staff_expedicao';

    const dispatched = await dispatchShipment({
      shipmentId,
      carrier,
      trackingCode: trackingCode || 'SEM_RASTREIO',
      trackingUrl: trackingUrl || null,
      staffId
    });

    return res.json({
      success: true,
      message: 'Remessa despachada com sucesso!',
      shipment: dispatched
    });
  } catch (err) {
    console.error('[DISPATCH ERROR]', err);
    return res.status(400).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// 5. CONFIRMAÇÃO DE ENTREGA E TRANSIÇÃO RÁPIDA (DRAG & DROP)
// -------------------------------------------------------------
router.post(['/delivered', '/fulfillment/delivered'], async (req, res) => {
  try {
    const { shipmentId, notes } = req.body;
    if (!shipmentId) {
      return res.status(400).json({ error: 'shipmentId é obrigatório.' });
    }

    const delivered = await updateDeliveryStatus({
      shipmentId,
      status: 'delivered',
      isManual: true,
      reason: notes || 'Entrega confirmada pelo operador logístico no painel.',
      actorId: req.user?.id || 'staff_expedicao'
    });
    return res.json({
      success: true,
      message: 'Entrega confirmada com sucesso.',
      shipment: delivered
    });
  } catch (err) {
    console.error('[DELIVERY ERROR]', err);
    return res.status(400).json({ error: err.message });
  }
});

router.post(['/status', '/fulfillment/status'], async (req, res) => {
  try {
    const { shipmentId, targetStatus } = req.body;
    if (!shipmentId || !targetStatus) {
      return res.status(400).json({ error: 'shipmentId e targetStatus são obrigatórios.' });
    }

    const staffId = req.user?.id || 'staff_expedicao';
    const staffName = req.user?.name || 'Operador Logístico';

    if (targetStatus === 'pending') {
      const shipRes = await query('SELECT order_id FROM shipments WHERE id = $1', [shipmentId]);
      if (shipRes.rows.length === 0) return res.status(404).json({ error: 'Remessa não encontrada.' });
      const orderId = shipRes.rows[0].order_id;

      await query(`
        UPDATE shipments
        SET status = 'pending', picking_by = NULL
        WHERE id = $1
      `, [shipmentId]);

      await query(`
        UPDATE order_items
        SET fulfillment_status = 'pending'
        WHERE order_id = $1 AND fulfillment_type = 'physical'
      `, [orderId]);

      return res.json({ success: true, status: 'pending' });
    }

    if (targetStatus === 'picking') {
      const result = await startPicking({ shipmentId, staffId, staffName });
      return res.json(result);
    }

    if (targetStatus === 'delivered') {
      const delivered = await updateDeliveryStatus({
        shipmentId,
        status: 'delivered',
        isManual: true,
        reason: 'Entrega confirmada via movimentação no quadro de expedição.',
        actorId: staffId
      });
      return res.json(delivered);
    }

    return res.status(400).json({ error: `Transição para '${targetStatus}' requer validação modal específica.` });
  } catch (err) {
    console.error('[STATUS TRANSITION ERROR]', err);
    return res.status(400).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// 6. ATIVAÇÕES DIGITAIS: REGISTRO DE TENTATIVA DE CONTATO
// -------------------------------------------------------------
router.post(['/attempt', '/activations/attempt', '/activations/activations/attempt'], async (req, res) => {
  try {
    const { activationId, method, result, notes } = req.body;
    if (!activationId || !method || !result) {
      return res.status(400).json({ error: 'activationId, method e result são obrigatórios.' });
    }

    const staffId = req.user?.id || 'tecnico_athena';

    const recorded = await recordContactAttempt({
      activationId,
      attemptedBy: staffId,
      method,
      result,
      note: notes || ''
    });

    return res.json({
      success: true,
      message: 'Tentativa de contato registrada.',
      attempt: recorded
    });
  } catch (err) {
    console.error('[ACTIVATION ATTEMPT ERROR]', err);
    return res.status(400).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// 7. ATIVAÇÕES DIGITAIS: INICIAR SESSÃO REMOTA
// -------------------------------------------------------------
router.post(['/start-session', '/activations/start-session', '/activations/activations/start-session'], async (req, res) => {
  try {
    const { activationId, remoteTool, sessionCode } = req.body;
    if (!activationId || !remoteTool) {
      return res.status(400).json({ error: 'activationId e remoteTool (anydesk, teamviewer, whatsapp) são obrigatórios.' });
    }

    const staffId = req.user?.id || 'tecnico_athena';

    const session = await startRemoteSession({
      activationId,
      remoteTool,
      sessionCode: sessionCode || '',
      staffId
    });

    return res.json({
      success: true,
      message: 'Sessão de suporte remoto iniciada.',
      activation: session
    });
  } catch (err) {
    console.error('[START SESSION ERROR]', err);
    return res.status(400).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// 8. ATIVAÇÕES DIGITAIS: CONCLUSÃO DA ATIVAÇÃO (LICENÇA/CHAVE)
// -------------------------------------------------------------
router.post(['/complete', '/activations/complete', '/activations/activations/complete'], async (req, res) => {
  try {
    const { activationId, licenseKey, machineId, notes } = req.body;
    if (!activationId) {
      return res.status(400).json({ error: 'activationId é obrigatório.' });
    }

    const staffId = req.user?.id || 'tecnico_athena';
    const staffName = req.user?.name || 'Técnico Especialista';

    const completed = await completeActivation({
      activationId,
      licenseKey: licenseKey || '',
      machineId: machineId || '',
      staffId,
      staffName,
      note: notes || 'Software ativado e validado com sucesso no cliente.'
    });

    return res.json({
      success: true,
      message: 'Ativação digital concluída com sucesso.',
      activation: completed
    });
  } catch (err) {
    console.error('[COMPLETE ACTIVATION ERROR]', err);
    return res.status(400).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// 9. TELEGRAM ALERT BOT DIAGNOSTIC & TEST (ADMIN ONLY)
// -------------------------------------------------------------
router.get(['/telegram/status', '/ops/telegram/status'], async (req, res) => {
  const isConfigured = Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID);
  return res.json({
    configured: isConfigured,
    hasToken: Boolean(process.env.TELEGRAM_BOT_TOKEN),
    hasChatId: Boolean(process.env.TELEGRAM_CHAT_ID)
  });
});

router.post(['/telegram/test', '/ops/telegram/test'], async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Apenas administradores podem testar o bot do Telegram.' });
    }
    const { testTelegramConnection } = require('../services/telegramAlertService');
    const result = await testTelegramConnection();
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao disparar teste no Telegram: ' + err.message });
  }
});

module.exports = router;
