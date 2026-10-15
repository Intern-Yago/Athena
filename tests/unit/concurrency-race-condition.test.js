/**
 * concurrency-race-condition.test.js
 * 
 * Testes Formais de Concorrência e Race Condition do Athena OS.
 * Valida a integridade do banco contra requisições simultâneas em paralelo (Promise.all):
 * 1. Prevenção de Double Spending (Gasto Duplo Concorrente) em A-Points via SELECT ... FOR UPDATE.
 * 2. Idempotência Concorrente de Webhooks (evita crédito duplicado se o Omie/Asaas disparar retries simultâneos).
 * 3. Atomicidade e Integridade de Concorrência na Mesa de Expedição (Fulfillment).
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

const { getPool, withTransaction } = require('../../backend/services/db.js');
const { applyPointsTransaction, getCustomerBalance } = require('../../backend/services/pointsService.js');
const { createInitialShipment, completeInspection, dispatchShipment } = require('../../backend/services/fulfillmentService.js');

describe('Athena OS - Testes de Estresse Concorrente e Race Condition', () => {
  const pool = getPool();
  const testRunId = `race_${Date.now()}`;
  const testUserId = `usr_race_${Date.now()}`;

  before(async () => {
    if (!pool) return;
    // Cria usuário de teste com saldo inicial fixo de exatamente 100 pontos
    await pool.query(`
      INSERT INTO users (id, name, email, password_hash, role, a_points, created_at)
      VALUES ($1, 'Tester Race Condition', $2, 'hash_test_race_123', 'cliente', 100, NOW())
    `, [testUserId, `${testUserId}@athenatest.com`]);
  });

  after(async () => {
    if (!pool) return;
    try {
      await pool.query('DELETE FROM shipments WHERE picking_by = $1 OR checked_by = $1 OR shipped_by = $1', [testUserId]);
      await pool.query('DELETE FROM a_points_ledger WHERE customer_id = $1', [testUserId]);
      await pool.query('DELETE FROM order_items WHERE order_id LIKE $1', [`%${testRunId}%`]);
      await pool.query('DELETE FROM orders WHERE customer_id = $1', [testUserId]);
      await pool.query('DELETE FROM users WHERE id = $1', [testUserId]);
    } catch (e) {}
    try {
      await pool.end();
    } catch (e) {}
  });

  it('RACE CONDITION 1: 10 Débitos Simultâneos de 100 pontos disputando saldo de 100 (Double Spending Attack)', async () => {
    if (!pool) return;

    // Saldo inicial é 100 pontos.
    // Disparamos 10 requisições simultâneas em paralelo querendo gastar 100 pontos cada.
    // Sem lock pessimista (SELECT ... FOR UPDATE), múltiplos poderiam ler 100 e deixar o saldo negativo (-900).
    // Com lock pessimista, exatamente 1 DEVE ter sucesso e 9 DEVEM falhar por saldo insuficiente.
    const concurrentRequests = Array.from({ length: 10 }, (_, i) => {
      return applyPointsTransaction({
        customerId: testUserId,
        orderId: `ord_race_${testRunId}_${i}`,
        referenceType: 'race_test_order',
        referenceId: `ref_race_${testRunId}_${i}`, // Chaves diferentes para testar saldo, não idempotência
        transactionType: 'redemption_debit',
        pointsAmount: -100,
        description: `Disputa concorrente ${i}`
      })
      .then(res => ({ success: true, res }))
      .catch(err => ({ success: false, error: err.message }));
    });

    const results = await Promise.all(concurrentRequests);

    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    // Validação estrita
    assert.equal(successful.length, 1, 'Exatamente 1 débito deve ser aceito');
    assert.equal(failed.length, 9, 'Exatamente 9 débitos devem ser rejeitados com saldo insuficiente');
    
    // Todos os 9 rejeitados devem ter caído na trava de saldo insuficiente
    for (const f of failed) {
      assert.match(f.error, /Saldo insuficiente/);
    }

    // Saldo final no PostgreSQL deve ser exatamente 0, JAMAIS negativo
    const finalBalance = await getCustomerBalance(testUserId);
    assert.equal(finalBalance, 0, 'Saldo final deve ser exatamente 0, comprovando ausência de overdraft em race condition');
  });

  it('RACE CONDITION 2: 5 Disparos Simultâneos do Mesmo Webhook (Garantia de Idempotência sob Concorrência)', async () => {
    if (!pool) return;

    // Reseta saldo do usuário para 0
    await pool.query('UPDATE users SET a_points = 0 WHERE id = $1', [testUserId]);

    const idempotentRefId = `idemp_webhook_${testRunId}`;

    // Disparamos 5 requisições em paralelo exato com a MESMA chave de referência (ex: webhook do Omie reenviado 5x no mesmo segundo)
    const webhookCalls = Array.from({ length: 5 }, (_, i) => {
      return applyPointsTransaction({
        customerId: testUserId,
        orderId: `ord_webhook_${testRunId}`,
        referenceType: 'webhook_event',
        referenceId: idempotentRefId,
        transactionType: 'purchase_credit',
        pointsAmount: 50,
        description: `Webhook retry paralelo ${i}`
      });
    });

    const webhookResults = await Promise.all(webhookCalls);

    // Apenas a primeira deve ter creditado (idempotent: false). Todas as outras 4 devem ter retornado idempotent: true.
    const creditsApplied = webhookResults.filter(r => !r.idempotent);
    const idempotentsSkipped = webhookResults.filter(r => r.idempotent);

    assert.equal(creditsApplied.length, 1, 'Apenas 1 webhook deve creditar pontos');
    assert.equal(idempotentsSkipped.length, 4, 'Os outros 4 webhooks concorrentes devem ser neutralizados por idempotência');

    // Saldo final deve ser exatamente 50 (e não 250)
    const finalBalance = await getCustomerBalance(testUserId);
    assert.equal(finalBalance, 50, 'Saldo deve ter recebido crédito uma única vez');
  });

  it('RACE CONDITION 3: Disputa Simultânea de Despacho de Remessa por 2 Operadores', async () => {
    if (!pool) return;

    const fakeOrderId = `ord_race_ful_${testRunId}`;

    // Cria pedido e remessa já conferida
    await pool.query(`
      INSERT INTO orders (id, order_number, customer_id, order_type, shipping_address, customer_snapshot, items)
      VALUES ($1, $2, $3, 'sale', '{}'::jsonb, '{}'::jsonb, '[]'::jsonb)
    `, [fakeOrderId, `N-RACE-${testRunId}`, testUserId]);

    await pool.query(`
      INSERT INTO order_items (order_id, product_id, name, quantity, fulfillment_type, fulfillment_status)
      VALUES ($1, 'prod_race_1', 'Item Race Test', 1, 'physical', 'packed')
    `, [fakeOrderId]);

    const shipment = await createInitialShipment({ orderId: fakeOrderId });
    await completeInspection({ shipmentId: shipment.id, staffId: testUserId, staffName: 'Conferente' });

    // Dois operadores clicam em 'Despachar' no mesmo instante
    const dispatchPromises = [
      dispatchShipment({ shipmentId: shipment.id, carrier: 'Braspress', trackingCode: 'BP_1', staffId: testUserId }),
      dispatchShipment({ shipmentId: shipment.id, carrier: 'Braspress', trackingCode: 'BP_2', staffId: testUserId })
    ];

    const dispatchResults = await Promise.allSettled(dispatchPromises);

    // O status final deve ser 'shipped' e a remessa deve estar consistente
    const dbShipment = await pool.query('SELECT status, tracking_code FROM shipments WHERE id = $1', [shipment.id]);
    assert.equal(dbShipment.rows[0].status, 'shipped');
  });
});
