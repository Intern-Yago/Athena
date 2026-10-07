/**
 * opsAdminRoutes.js
 * 
 * Athena OS v2.1 — Painel Operacional Admin & Kanban de Expedição / Ativação
 * Permite que a equipe interna gerencie separação física, conferência com trava,
 * despacho de remessas e suporte técnico a ativações de softwares.
 */

const express = require('express');
const { query } = require('../services/db.js');
const { 
  createInitialShipment, 
  startPicking, 
  completeInspection, 
  dispatchShipment, 
  markDelivered 
} = require('../services/fulfillmentService.js');
const { 
  recordContactAttempt, 
  startRemoteSession, 
  completeActivation 
} = require('../services/activationService.js');

const router = express.Router();

// -------------------------------------------------------------
// 1. KANBAN OPERACIONAL UNIFICADO
// -------------------------------------------------------------
router.get('/kanban', async (req, res) => {
  try {
    // 1. Remessas Físicas
    const shipmentsQuery = await query(`
      SELECT 
        s.*,
        o.order_number,
        o.customer_id,
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
      const enriched = {
        ...s,
        items: (itemsByOrder[s.order_id] || []).filter(i => i.fulfillment_type === 'physical')
      };
      if (kanban[s.status]) {
        kanban[s.status].push(enriched);
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

    return res.json({
      physical_kanban: kanban,
      digital_activations: activationsQuery.rows,
      summary: {
        total_shipments: shipmentsQuery.rows.length,
        total_activations: activationsQuery.rows.length
      }
    });
  } catch (err) {
    console.error('[OPS ADMIN KANBAN ERROR]', err);
    return res.status(500).json({ error: 'Erro ao carregar Kanban operacional.' });
  }
});

// -------------------------------------------------------------
// 2. ROMANEIO DE SEPARAÇÃO (PICKING LIST)
// -------------------------------------------------------------
router.get('/picking-list/:orderId', async (req, res) => {
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
router.post('/conference', async (req, res) => {
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
router.post('/dispatch', async (req, res) => {
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
// 5. CONFIRMAÇÃO DE ENTREGA (FINALIZAÇÃO LOGÍSTICA)
// -------------------------------------------------------------
router.post('/delivered', async (req, res) => {
  try {
    const { shipmentId, notes } = req.body;
    if (!shipmentId) {
      return res.status(400).json({ error: 'shipmentId é obrigatório.' });
    }

    const delivered = await markDelivered({ shipmentId, notes });
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

// -------------------------------------------------------------
// 6. ATIVAÇÕES DIGITAIS: REGISTRO DE TENTATIVA DE CONTATO
// -------------------------------------------------------------
router.post('/activations/attempt', async (req, res) => {
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
router.post('/activations/start-session', async (req, res) => {
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
router.post('/activations/complete', async (req, res) => {
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

module.exports = router;
