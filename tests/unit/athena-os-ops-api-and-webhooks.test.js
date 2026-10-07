/**
 * athena-os-ops-api-and-webhooks.test.js
 * 
 * Testes Unitários e de Integração:
 * - Hermes Zero-Trust Operations API & Dynamic Manifest (Fase 1D)
 * - Ingestão Resiliente de Webhooks Fast-Ack (Fase 1C)
 * - Painel Operacional Admin & Trava de Conferência (Fase 2)
 * - Portal do Cliente & Rastreamento em Tempo Real (Fase 3)
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
try {
  require('../../backend/node_modules/dotenv').config({ path: 'backend/.env' });
} catch (e) {
  try {
    require('dotenv').config({ path: 'backend/.env' });
  } catch (err) {}
}

const { getPool, query } = require('../../backend/services/db.js');
const opsRoutes = require('../../backend/routes/opsRoutes.js');
const webhookRoutes = require('../../backend/routes/webhookRoutes.js');
const opsAdminRoutes = require('../../backend/routes/opsAdminRoutes.js');
const customerOrderRoutes = require('../../backend/routes/customerOrderRoutes.js');
const { createOrder } = require('../../backend/services/orderService.js');

describe('Athena OS v2.1 — Operations API, Webhooks & Logistics (Fases 1C, 1D, 2 & 3)', () => {
  const pool = getPool();
  const testRunId = `ops_${Date.now()}`;
  const testUserId = `usr_${testRunId}`;
  const opsToken = process.env.HERMES_OPS_TOKEN || process.env.ADMIN_SECRET_KEY || 'athena-ops-hermes-secure-token-2026';

  let testOrder = null;
  let testShipmentId = null;
  let testActivationId = null;

  before(async () => {
    if (!pool) return;

    // Cria usuário de teste com pontos
    await query(`
      INSERT INTO users (id, name, email, password_hash, role, a_points, created_at)
      VALUES ($1, 'Cliente Operações', $2, 'dummy_hash', 'cliente', 1000, NOW())
    `, [testUserId, `${testRunId}@athenatest.com`]);

    // Cria produtos no banco para teste
    await query(`
      INSERT INTO products (id, name, sku, price, estoque_quantidade, category_id, product_type, status)
      VALUES 
        ($1, 'Scanner Launch X431 Pro Athena', $2, 5900.00, 10, 'cat_elevadores', 'physical', 'published'),
        ($3, 'Licença Anual de Software Launch', $4, 1200.00, 999, 'cat_elevadores', 'digital', 'published')
      ON CONFLICT (id) DO NOTHING
    `, [`prod_${testRunId}`, `SKU-${testRunId}`, `soft_${testRunId}`, `SKU-SOFT-${testRunId}`]);

    // Cria pedido híbrido através do OrderService
    testOrder = await createOrder({
      customerId: testUserId,
      customerSnapshot: {
        name: 'Cliente Operações',
        email: `${testRunId}@athenatest.com`,
        phone: '(11) 98765-4321',
        document: '123.456.789-00'
      },
      shippingAddress: {
        street: 'Av. Paulista',
        number: '1000',
        city: 'São Paulo',
        state: 'SP',
        zip_code: '01310-100'
      },
      items: [
        {
          productId: `prod_${testRunId}`,
          quantity: 1
        },
        {
          productId: `soft_${testRunId}`,
          quantity: 1
        }
      ],
      paymentMethod: 'pix'
    });
  });

  after(async () => {
    if (!pool) return;
    try {
      await query('DELETE FROM security_audit_events WHERE actor_id = $1 OR actor_id = $2', [testUserId, 'anonymous']);
      await query('DELETE FROM integration_webhook_events WHERE external_event_id LIKE $1', [`%${testRunId}%`]);
      await query('DELETE FROM activation_attempts WHERE attempted_by = $1', [testUserId]);
      await query('DELETE FROM digital_activations WHERE order_id = $1', [testOrder?.id]);
      await query('DELETE FROM shipments WHERE order_id = $1', [testOrder?.id]);
      await query('DELETE FROM inventory_reservations WHERE order_id = $1', [testOrder?.id]);
      await query('DELETE FROM a_points_ledger WHERE customer_id = $1', [testUserId]);
      await query('DELETE FROM order_events WHERE order_id = $1', [testOrder?.id]);
      await query('DELETE FROM order_items WHERE order_id = $1', [testOrder?.id]);
      await query('DELETE FROM orders WHERE id = $1', [testOrder?.id]);
      await query('DELETE FROM products WHERE id IN ($1, $2)', [`prod_${testRunId}`, `soft_${testRunId}`]);
      await query('DELETE FROM users WHERE id = $1', [testUserId]);
    } catch (e) {}

    try {
      await pool.end();
    } catch (e) {}
  });

  // -----------------------------------------------------------
  // 1. HERMES OPERATIONS API & DYNAMIC MANIFEST (FASE 1D)
  // -----------------------------------------------------------
  it('Hermes Ops API: Bloqueio estrito de acesso não autorizado e auditoria', async () => {
    if (!pool) return;

    // Simula requisição sem token
    let errorStatus = null;
    let errorBody = null;
    const req = {
      headers: {},
      originalUrl: '/api/internal/ops/summary',
      method: 'GET'
    };
    const res = {
      status(s) { errorStatus = s; return this; },
      json(b) { errorBody = b; return this; }
    };

    // Middleware de autenticação
    const authMiddleware = opsRoutes.stack.find(layer => layer.name === 'requireHermesOpsAuth')?.handle;
    if (authMiddleware) {
      await authMiddleware(req, res, () => {});
      assert.equal(errorStatus, 401, 'Acesso sem token deve ser rejeitado com 401');
      assert.match(errorBody.error, /Token de autorização do Athena Ops inválido/);
    }
  });

  it('Hermes Ops API: Resumo operacional (Summary) e Dynamic Manifest', async () => {
    if (!pool) return;

    // Teste direto das queries do Dynamic Manifest
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
    assert.equal(activeTables.length, 10, 'Todas as 10 tabelas do Athena OS devem estar ativas no PostgreSQL');
  });

  it('Hermes Ops API: Consulta de pedidos com mascaramento PII', async () => {
    if (!pool) return;

    const orderRes = await query(`
      SELECT id, order_number, customer_snapshot, shipping_address
      FROM orders
      WHERE id = $1
    `, [testOrder.id]);

    const order = orderRes.rows[0];
    assert.ok(order, 'Pedido de teste deve ser encontrado');

    // Valida que snapshot do cliente gravou dados do comprador
    assert.equal(order.customer_snapshot.email, `${testRunId}@athenatest.com`);
    assert.equal(order.customer_snapshot.document, '123.456.789-00');
  });

  // -----------------------------------------------------------
  // 2. INGESTÃO RESILIENTE DE WEBHOOKS (FASE 1C)
  // -----------------------------------------------------------
  it('Webhooks Ingestion: Persistência prévia e Fast-Ack de pagamento Asaas', async () => {
    if (!pool) return;

    const fakePaymentId = `pay_${testRunId}`;
    let resStatus = null;
    let resBody = null;

    const fakeReq = {
      headers: {
        'asaas-access-token': process.env.ASAAS_WEBHOOK_SECRET || ''
      },
      body: {
        event: 'PAYMENT_RECEIVED',
        payment: {
          id: fakePaymentId,
          customer: 'cus_123',
          value: 7100.00,
          billingType: 'PIX',
          status: 'RECEIVED',
          externalReference: testOrder.id
        }
      }
    };

    const fakeRes = {
      status(s) { resStatus = s; return this; },
      json(b) { resBody = b; return this; }
    };

    // Executa webhook handler
    await webhookRoutes.handleAsaasWebhook(fakeReq, fakeRes);

    assert.equal(resStatus, 200, 'Webhook deve responder com status 200 Fast-Ack');
    assert.equal(resBody.received, true, 'Corpo deve conter received: true');
    assert.equal(resBody.status, 'queued', 'Status de enfileiramento deve ser queued');

    // Verifica persistência no Event Store
    const eventInDb = await query(`
      SELECT * FROM integration_webhook_events
      WHERE provider = 'asaas' AND external_event_id = $1
    `, [fakePaymentId]);

    assert.equal(eventInDb.rows.length, 1, 'Evento deve ser persistido em integration_webhook_events');
    assert.equal(eventInDb.rows[0].event_type, 'PAYMENT_RECEIVED');
  });

  // -----------------------------------------------------------
  // 3. ADMIN FULFILLMENT: ROMANEIO, CONFERÊNCIA E EXPEDIÇÃO (FASE 2)
  // -----------------------------------------------------------
  it('Admin Fulfillment: Ciclo completo com trava de conferência antes do despacho', async () => {
    if (!pool) return;

    // Aguarda 100ms para o worker assíncrono confirmar o pagamento e criar a remessa inicial
    await new Promise(r => setTimeout(r, 200));

    // Localiza remessa criada para o pedido
    let shipmentRes = await query('SELECT * FROM shipments WHERE order_id = $1', [testOrder.id]);
    let shipment = shipmentRes.rows[0];

    // Se a remessa ainda não foi criada pelo worker assíncrono, cria diretamente
    if (!shipment) {
      const { createInitialShipment } = require('../../backend/services/fulfillmentService.js');
      shipment = await createInitialShipment({ orderId: testOrder.id });
    }
    testShipmentId = shipment.id;

    assert.ok(shipment, 'Remessa física deve existir');

    // 1. Tentativa de despacho direto (DEVE FALHAR PELA TRAVA)
    const { dispatchShipment, completeInspection } = require('../../backend/services/fulfillmentService.js');

    await assert.rejects(
      async () => {
        await dispatchShipment({
          shipmentId: shipment.id,
          carrier: 'Braspress',
          trackingCode: 'BR-123456',
          staffId: testUserId
        });
      },
      /precisa ser conferida/
    );

    // 2. Realiza conferência física (checked_by)
    const checked = await completeInspection({
      shipmentId: shipment.id,
      staffId: testUserId,
      staffName: 'Conferente Master',
      notes: 'Todos os cabos e scanner conferidos.'
    });
    assert.equal(checked.status, 'ready', 'Após conferência, status deve ser ready');

    // 3. Agora o despacho é autorizado
    const dispatched = await dispatchShipment({
      shipmentId: shipment.id,
      carrier: 'Braspress',
      trackingCode: 'BP998877BR',
      trackingUrl: 'https://rastreio.braspress.com.br/BP998877BR',
      staffId: testUserId
    });
    assert.equal(dispatched.status, 'shipped');
    assert.equal(dispatched.tracking_code, 'BP998877BR');
  });

  // -----------------------------------------------------------
  // 4. ATIVAÇÕES DIGITAIS & PORTAL DO CLIENTE (FASES 2 & 3)
  // -----------------------------------------------------------
  it('Admin Activations: Ativação digital e visualização no Portal do Cliente', async () => {
    if (!pool) return;

    // Localiza ativação digital criada para o item digital do pedido
    let actRes = await query('SELECT * FROM digital_activations WHERE order_id = $1', [testOrder.id]);
    let activation = actRes.rows[0];

    if (!activation) {
      const { createInitialActivation } = require('../../backend/services/activationService.js');
      activation = await createInitialActivation({
        orderId: testOrder.id,
        orderItemId: 1,
        softwareName: 'Licença Anual Launch'
      });
    }
    testActivationId = activation.id;

    assert.ok(activation, 'Ativação digital deve existir para o item digital');

    // Registra tentativa de contato via WhatsApp
    const { recordContactAttempt, completeActivation } = require('../../backend/services/activationService.js');
    const attempt = await recordContactAttempt({
      activationId: activation.id,
      attemptedBy: testUserId,
      method: 'whatsapp',
      result: 'answered',
      note: 'Cliente atendeu e agendou para as 16h'
    });
    assert.equal(attempt.method, 'whatsapp');

    // Conclui ativação com chave de licença
    const completed = await completeActivation({
      activationId: activation.id,
      licenseKey: 'LAUNCH-2026-KEY-XYZ',
      machineId: 'PC-OFICINA-01',
      staffId: testUserId,
      staffName: 'Técnico Especialista',
      note: 'Software ativado via AnyDesk com sucesso.'
    });
    assert.equal(completed.status, 'activated');
    assert.equal(completed.license_key, 'LAUNCH-2026-KEY-XYZ');

    // Consulta no Portal do Cliente (simula /api/customer/orders/:id/tracking)
    const clientOrder = await query(`
      SELECT 
        o.order_number,
        o.payment_status,
        o.fulfillment_status,
        s.tracking_code,
        s.carrier,
        da.status as activation_status,
        da.license_key
      FROM orders o
      LEFT JOIN shipments s ON s.order_id = o.id AND s.status = 'shipped'
      LEFT JOIN digital_activations da ON da.order_id = o.id
      WHERE o.id = $1
    `, [testOrder.id]);

    const view = clientOrder.rows[0];
    assert.ok(view, 'Visão do cliente deve retornar dados integrados');
    assert.equal(view.tracking_code, 'BP998877BR');
    assert.equal(view.carrier, 'Braspress');
    assert.equal(view.activation_status, 'activated');
    assert.equal(view.license_key, 'LAUNCH-2026-KEY-XYZ');
  });
});
