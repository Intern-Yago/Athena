/**
 * athena-os-adversarial-security.test.js
 * 
 * Suíte de Testes Adversariais, de Concorrência e Abuso — Athena OS v2.1
 * 
 * Vetores Testados:
 * 1. Race Condition A-Points (Double-Spend sob concorrência simultânea)
 * 2. Webhook Duplicado Simultâneo (Idempotência sob alta concorrência)
 * 3. Token Tampering & Replay no Webhook (Timing-Safe + Auditoria)
 * 4. Vazamento de PII (LGPD) e Escopos Zero-Trust do Hermes
 * 5. Prevenção de Vazamento de License Key na Timeline pública
 * 6. IDOR (Isolamento entre Contas de Clientes no Portal)
 * 7. Fila Durável e Dead-Letter Queue (Recuperação e Retry Exponencial)
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
const { applyPointsTransaction, getCustomerBalance } = require('../../backend/services/pointsService.js');
const { createOrder, confirmPayment } = require('../../backend/services/orderService.js');
const { handleAsaasWebhook } = require('../../backend/routes/webhookRoutes.js');
const opsRoutes = require('../../backend/routes/opsRoutes.js');
const customerOrderRoutes = require('../../backend/routes/customerOrderRoutes.js');
const { completeActivation } = require('../../backend/services/activationService.js');
const { processQueueBatch } = require('../../backend/services/webhookWorker.js');

describe('Athena OS v2.1 — Adversarial Security, Concurrency & Abuse Suite', () => {
  const pool = getPool();
  const testRunId = `adv_${Date.now()}`;
  const aliceUserId = `usr_alice_${testRunId}`;
  const bobUserId = `usr_bob_${testRunId}`;
  const opsToken = process.env.HERMES_OPS_TOKEN || process.env.ADMIN_SECRET_KEY || 'athena-ops-hermes-secure-token-2026';

  let aliceOrder = null;

  before(async () => {
    if (!pool) return;

    // 1. Cria Usuário Alice (Saldo inicial: 500 pontos)
    await query(`
      INSERT INTO users (id, name, email, password_hash, role, a_points, created_at)
      VALUES ($1, 'Alice Test', $2, 'hash_alice', 'cliente', 500, NOW())
    `, [aliceUserId, `alice_${testRunId}@athenatest.com`]);

    // 2. Cria Usuário Bob (Saldo inicial: 0 pontos)
    await query(`
      INSERT INTO users (id, name, email, password_hash, role, a_points, created_at)
      VALUES ($1, 'Bob Test', $2, 'hash_bob', 'cliente', 0, NOW())
    `, [bobUserId, `bob_${testRunId}@athenatest.com`]);

    // 3. Cria produto de teste
    await query(`
      INSERT INTO products (id, name, sku, price, estoque_quantidade, category_id, product_type, status)
      VALUES ($1, 'Scanner Adversarial Test', $2, 1000.00, 50, 'cat_elevadores', 'physical', 'published')
      ON CONFLICT (id) DO NOTHING
    `, [`prod_${testRunId}`, `SKU-ADV-${testRunId}`]);

    // 4. Cria pedido da Alice
    aliceOrder = await createOrder({
      customerId: aliceUserId,
      customerSnapshot: {
        name: 'Alice Test',
        email: `alice_${testRunId}@athenatest.com`,
        phone: '(11) 98765-4321',
        document: '123.456.789-00'
      },
      shippingAddress: {
        street: 'Rua das Flores',
        number: '123',
        city: 'Curitiba',
        state: 'PR'
      },
      items: [{ productId: `prod_${testRunId}`, quantity: 1 }],
      paymentMethod: 'pix'
    });
  });

  after(async () => {
    if (!pool) return;
    try {
      await query('DELETE FROM security_audit_events WHERE actor_id IN ($1, $2, $3, $4)', [aliceUserId, bobUserId, 'anonymous', 'webhook_worker']);
      await query('DELETE FROM integration_webhook_events WHERE external_event_id LIKE $1', [`%${testRunId}%`]);
      await query('DELETE FROM digital_activations WHERE order_id = $1', [aliceOrder?.id]);
      await query('DELETE FROM shipments WHERE order_id = $1', [aliceOrder?.id]);
      await query('DELETE FROM inventory_reservations WHERE order_id = $1', [aliceOrder?.id]);
      await query('DELETE FROM a_points_ledger WHERE customer_id IN ($1, $2)', [aliceUserId, bobUserId]);
      await query('DELETE FROM order_events WHERE order_id = $1', [aliceOrder?.id]);
      await query('DELETE FROM order_items WHERE order_id = $1', [aliceOrder?.id]);
      await query('DELETE FROM orders WHERE customer_id IN ($1, $2)', [aliceUserId, bobUserId]);
      await query('DELETE FROM products WHERE id = $1', [`prod_${testRunId}`]);
      await query('DELETE FROM users WHERE id IN ($1, $2)', [aliceUserId, bobUserId]);
    } catch (e) {}

    try {
      await pool.end();
    } catch (e) {}
  });

  // -----------------------------------------------------------
  // 1. CONCURRÊNCIA ATÔMICA: RACE CONDITION EM A-POINTS (DOUBLE-SPEND)
  // -----------------------------------------------------------
  it('Concurrency: Previne Double-Spend de A-Points em requisições simultâneas', async () => {
    if (!pool) return;

    // Alice tem 500 pontos. Dois débitos de 500 são disparados rigorosamente no mesmo instante!
    const results = await Promise.allSettled([
      applyPointsTransaction({
        customerId: aliceUserId,
        orderId: `ord_simult_1_${testRunId}`,
        referenceType: 'order_redemption',
        referenceId: `tx_conc_A_${testRunId}`,
        pointsAmount: -500,
        description: 'Débito Concorrente A'
      }),
      applyPointsTransaction({
        customerId: aliceUserId,
        orderId: `ord_simult_2_${testRunId}`,
        referenceType: 'order_redemption',
        referenceId: `tx_conc_B_${testRunId}`,
        pointsAmount: -500,
        description: 'Débito Concorrente B'
      })
    ]);

    const fulfilled = results.filter(r => r.status === 'fulfilled');
    const rejected = results.filter(r => r.status === 'rejected');

    // EXATAMENTE 1 deve ter sucesso, e EXATAMENTE 1 deve ser rejeitado por saldo insuficiente
    assert.equal(fulfilled.length, 1, 'Apenas uma das transações concorrentes pode ter sucesso');
    assert.equal(rejected.length, 1, 'A segunda transação concorrente deve ser bloqueada por falta de saldo');
    assert.match(rejected[0].reason.message, /Saldo insuficiente/);

    // O saldo no banco de dados DEVE ser exatamente 0, NUNCA negativo (-500)
    const finalBalance = await getCustomerBalance(aliceUserId);
    assert.equal(finalBalance, 0, 'Saldo final deve ser exatamente 0 pontos');

    // Valida que o evento de segurança de tentativa de saldo negativo foi registrado
    const auditRes = await query(`
      SELECT * FROM security_audit_events
      WHERE actor_id = $1 AND event_type = 'POINTS_OVERDRAFT_BLOCKED'
    `, [aliceUserId]);
    assert.ok(auditRes.rows.length >= 1, 'Auditoria de segurança deve registrar tentativa de estouro de saldo');
  });

  // -----------------------------------------------------------
  // 2. CONCORRÊNCIA EM WEBHOOKS: WEBHOOK DUPLICADO SIMULTÂNEO
  // -----------------------------------------------------------
  it('Concurrency: Webhook idêntico disparado simultaneamente responde Fast-Ack sem duplicidade', async () => {
    if (!pool) return;

    const fakePaymentId = `pay_dup_${testRunId}`;
    let resStatusA = null, resBodyA = null;
    let resStatusB = null, resBodyB = null;

    const createFakeReq = () => ({
      headers: {
        'asaas-access-token': process.env.ASAAS_WEBHOOK_SECRET || ''
      },
      body: {
        event: 'PAYMENT_RECEIVED',
        payment: {
          id: fakePaymentId,
          customer: 'cus_dup_123',
          value: 1000.00,
          billingType: 'PIX',
          status: 'RECEIVED',
          externalReference: aliceOrder.id
        }
      }
    });

    const fakeResA = {
      status(s) { resStatusA = s; return this; },
      json(b) { resBodyA = b; return this; }
    };
    const fakeResB = {
      status(s) { resStatusB = s; return this; },
      json(b) { resBodyB = b; return this; }
    };

    // Dois webhooks simultâneos do Asaas com o mesmo external_event_id
    await Promise.all([
      handleAsaasWebhook(createFakeReq(), fakeResA),
      handleAsaasWebhook(createFakeReq(), fakeResB)
    ]);

    // Ambos recebem 200 Fast-Ack com segurança
    assert.equal(resStatusA, 200);
    assert.equal(resStatusB, 200);

    // No banco de dados, devido ao constraint uq_webhook_provider_event, só pode existir 1 linha!
    const eventsInDb = await query(`
      SELECT * FROM integration_webhook_events
      WHERE provider = 'asaas' AND external_event_id = $1
    `, [fakePaymentId]);

    assert.equal(eventsInDb.rows.length, 1, 'Deve existir exatamente 1 registro no Event Store');
  });

  // -----------------------------------------------------------
  // 3. SEGURANÇA DE WEBHOOKS: TOKEN TAMPERING & REPLAY MALICIOSO
  // -----------------------------------------------------------
  it('Security: Webhook com token adulterado/inválido é bloqueado com 401 e auditado', async () => {
    if (!pool) return;

    let resStatus = null;
    let resBody = null;

    const tamperedReq = {
      headers: {
        'asaas-access-token': 'token_malicioso_falsificado_123'
      },
      originalUrl: '/api/webhooks/asaas',
      body: {
        event: 'PAYMENT_RECEIVED',
        payment: { id: `tampered_${testRunId}`, externalReference: aliceOrder.id }
      }
    };

    const fakeRes = {
      status(s) { resStatus = s; return this; },
      json(b) { resBody = b; return this; }
    };

    await handleAsaasWebhook(tamperedReq, fakeRes);

    assert.equal(resStatus, 401, 'Token adulterado deve receber HTTP 401');
    assert.match(resBody.error, /Token de webhook inválido/);

    // Valida auditoria de tentativa de intrusão
    const auditRes = await query(`
      SELECT * FROM security_audit_events
      WHERE event_type = 'WEBHOOK_AUTH_FAILED' AND actor_id = 'asaas_webhook'
    `);
    assert.ok(auditRes.rows.length >= 1, 'Falha de token de webhook deve ser auditada');
  });

  // -----------------------------------------------------------
  // 4. PROTEÇÃO LGPD & ESCOPOS ZERO-TRUST DO HERMES (PII LEAKAGE)
  // -----------------------------------------------------------
  it('Privacy: Hermes sem escopo pii:read tem CPF, telefone e email estritamente mascarados', async () => {
    if (!pool) return;

    let resBody = null;
    const req = {
      headers: {
        'authorization': `Bearer ${opsToken}`
        // SEM o header X-Athena-Ops-Scope: pii:read
      },
      params: { id: aliceOrder.id },
      opsScopes: []
    };
    const res = {
      json(b) { resBody = b; return this; },
      status() { return this; }
    };

    // Executa a rota de detalhe de pedido
    const orderHandler = opsRoutes.stack.find(l => l.route?.path === '/orders/:id')?.route?.stack[1]?.handle;
    assert.ok(orderHandler, 'Handler da rota /orders/:id deve existir');

    await orderHandler(req, res);

    assert.ok(resBody, 'Corpo da resposta deve ser retornado');
    assert.ok(resBody.customer_snapshot, 'Snapshot do cliente deve estar presente');

    // Documento (CPF) deve estar mascarado como ***.***.789-**
    assert.match(resBody.customer_snapshot.document, /\*\*\*\.\*\*\*\.789-\*\*/, 'CPF deve ser mascarado');
    // Telefone deve estar mascarado
    assert.match(resBody.customer_snapshot.phone, /11 \*\*\*\*-4321/, 'Telefone deve ser mascarado');
    // E-mail deve estar mascarado
    assert.match(resBody.customer_snapshot.email, /a\*\*\*.*@athenatest\.com/, 'E-mail deve ser mascarado');
    // Endereço exato deve estar protegido
    assert.equal(resBody.shipping_address.street, '*** Logradouro Protegido ***', 'Logradouro deve estar mascarado');
  });

  // -----------------------------------------------------------
  // 5. VAZAMENTO DE DADOS SENSÍVEIS (LICENSE KEY NÃO PODE VAZAR NA TIMELINE)
  // -----------------------------------------------------------
  it('Confidentiality: Chave de ativação (license_key) nunca é exposta na timeline pública do pedido', async () => {
    if (!pool) return;

    // 1. Busca item do pedido para chave estrangeira correta
    const itemRes = await query('SELECT id FROM order_items WHERE order_id = $1 LIMIT 1', [aliceOrder.id]);
    const orderItemId = itemRes.rows[0]?.id;

    // Cria ativação digital
    const actRes = await query(`
      INSERT INTO digital_activations (order_id, order_item_id, software_name, customer_phone, status, created_at)
      VALUES ($1, $2, 'Launch Software Super Pro', '(11) 98765-4321', 'awaiting_activation', NOW())
      RETURNING id
    `, [aliceOrder.id, orderItemId]);
    const activationId = actRes.rows[0].id;

    // 2. Conclui ativação com chave de licença secreta
    const SECRET_KEY = 'LAUNCH-SECRET-PRO-999-XYZ';
    await completeActivation({
      activationId,
      licenseKey: SECRET_KEY,
      technicianId: 'tech_01',
      technicianName: 'Técnico Especialista'
    });

    // 3. Consulta a timeline de eventos do pedido (order_events)
    const events = await query(`
      SELECT description, metadata FROM order_events WHERE order_id = $1
    `, [aliceOrder.id]);

    for (const evt of events.rows) {
      assert.doesNotMatch(evt.description, new RegExp(SECRET_KEY), 'A chave de licença não pode aparecer na descrição pública do evento');
      const metaStr = JSON.stringify(evt.metadata || {});
      assert.doesNotMatch(metaStr, new RegExp(SECRET_KEY), 'A chave de licença não pode aparecer nos metadados de eventos públicos');
    }
  });

  // -----------------------------------------------------------
  // 6. ISOLAMENTO MULTI-TENANT & IDOR NO PORTAL DO CLIENTE
  // -----------------------------------------------------------
  it('Authorization (IDOR): Usuário Bob não pode rastrear pedido pertencente à Alice', async () => {
    if (!pool) return;

    let resStatus = 200;
    let resBody = null;

    // Bob tenta acessar o pedido da Alice
    const req = {
      params: { id: aliceOrder.id },
      user: {
        id: bobUserId,
        email: `bob_${testRunId}@athenatest.com`
      }
    };
    const res = {
      status(s) { resStatus = s; return this; },
      json(b) { resBody = b; return this; }
    };

    const trackingHandler = customerOrderRoutes.stack.find(l => l.route?.path === '/:id/tracking')?.route?.stack[0]?.handle;
    assert.ok(trackingHandler, 'Handler da rota de rastreamento do cliente deve existir');

    await trackingHandler(req, res);

    // DEVE retornar 404 / Não encontrado para prevenir vazamento e enumeração de IDs
    assert.equal(resStatus, 404, 'Acesso a pedido de outro cliente deve ser bloqueado com 404');
    assert.match(resBody.error, /não encontrado ou acesso não autorizado/);
  });

  // -----------------------------------------------------------
  // 7. FILA RESILIENTE & DEAD-LETTER QUEUE DO WEBHOOK WORKER
  // -----------------------------------------------------------
  it('Reliability: Webhook Worker executa retentativas com backoff e move para Dead-Letter ao esgotar', async () => {
    if (!pool) return;

    const deadLetterEventId = `dlq_${testRunId}`;

    // Insere evento com payload inválido e next_retry_at pronto para execução
    await query(`
      INSERT INTO integration_webhook_events (
        provider, external_event_id, event_type, payload, status, attempts_count, max_attempts, next_retry_at
      ) VALUES ($1, $2, 'PAYMENT_RECEIVED', $3, 'queued', 4, 5, NOW() - INTERVAL '1 second')
    `, ['asaas', deadLetterEventId, JSON.stringify({
      payment: {
        id: 'pay_invalid_none',
        externalReference: 'ord_inexistente_que_vai_falhar_123'
      }
    })]);

    // Executa lote de processamento do worker
    await processQueueBatch(5);

    // O evento atingiu 5 tentativas -> DEVE estar marcado como 'failed' (Dead-Letter)
    const deadEvent = await query(`
      SELECT status, attempts_count, last_error FROM integration_webhook_events
      WHERE external_event_id = $1
    `, [deadLetterEventId]);

    assert.equal(deadEvent.rows[0].status, 'failed', 'Evento que esgotou retentativas deve ir para status failed');
    assert.equal(deadEvent.rows[0].attempts_count, 5, 'Deve ter contabilizado 5 tentativas');
    assert.ok(deadEvent.rows[0].last_error, 'Deve conter registro do erro no last_error');

    // Valida que o incidente foi gerado no SecurityAuditEvents
    const secInc = await query(`
      SELECT * FROM security_audit_events
      WHERE event_type = 'WEBHOOK_DEAD_LETTER_EVENT'
        AND metadata->>'externalEventId' = $1
    `, [deadLetterEventId]);

    assert.equal(secInc.rows.length, 1, 'Incidente de Dead-Letter deve ser gerado no SecurityAudit');
  });
});
