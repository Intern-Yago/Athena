/**
 * athena-os-domain-services.test.js
 * 
 * Testes Unitarios e de Integracao dos Servicos de Dominio do Athena OS (Fase 1B)
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

const { getPool } = require('../../backend/services/db.js');
const { applyPointsTransaction, getCustomerBalance } = require('../../backend/services/pointsService.js');
const { reserveStock, confirmReservation, releaseReservation } = require('../../backend/services/inventoryReservationService.js');
const { createInitialShipment, completeInspection, dispatchShipment } = require('../../backend/services/fulfillmentService.js');
const { recordSecurityEvent, getSecurityAuditEvents } = require('../../backend/services/securityAuditService.js');

describe('Athena OS Domain Services (Fase 1B)', () => {
  const pool = getPool();
  const testRunId = `test_${Date.now()}`;
  const testUserId = `usr_${testRunId}`;

  before(async () => {
    if (!pool) return;
    await pool.query(`
      INSERT INTO users (id, name, email, password_hash, role, a_points, created_at)
      VALUES ($1, 'Tester Athena OS', $2, 'hash_test_dummy_123', 'cliente', 500, NOW())
    `, [testUserId, `${testRunId}@athenatest.com`]);
  });

  after(async () => {
    if (!pool) return;
    try {
      await pool.query('DELETE FROM security_audit_events WHERE actor_id = $1', [testUserId]);
      await pool.query('DELETE FROM order_events WHERE actor_id = $1', [testUserId]);
      await pool.query('DELETE FROM shipments WHERE picking_by = $1 OR checked_by = $1 OR shipped_by = $1', [testUserId]);
      await pool.query('DELETE FROM inventory_reservations WHERE order_id LIKE $1', [`%${testRunId}%`]);
      await pool.query('DELETE FROM a_points_ledger WHERE customer_id = $1', [testUserId]);
      await pool.query('DELETE FROM order_items WHERE order_id LIKE $1', [`%${testRunId}%`]);
      await pool.query('DELETE FROM orders WHERE customer_id = $1', [testUserId]);
      await pool.query('DELETE FROM users WHERE id = $1', [testUserId]);
    } catch (e) {}
    try {
      await pool.end();
    } catch (e) {}
  });

  it('PointsService: Ledger atômico, bloqueio de saldo negativo e idempotência', async () => {
    if (!pool) return;

    // 1. Débito com sucesso
    const debitRes = await applyPointsTransaction({
      customerId: testUserId,
      orderId: `ord_${testRunId}`,
      referenceType: 'order_redemption',
      referenceId: `ref_deb_${testRunId}`,
      transactionType: 'redemption_debit',
      pointsAmount: -200,
      description: 'Débito teste de resgate'
    });

    assert.equal(debitRes.newBalance, 300);
    assert.equal(debitRes.idempotent, false);

    // 2. Teste de Idempotência: Mesma transação repetida não altera saldo
    const repeatRes = await applyPointsTransaction({
      customerId: testUserId,
      orderId: `ord_${testRunId}`,
      referenceType: 'order_redemption',
      referenceId: `ref_deb_${testRunId}`,
      transactionType: 'redemption_debit',
      pointsAmount: -200,
      description: 'Tentativa duplicada'
    });

    assert.equal(repeatRes.idempotent, true);
    const balanceAfterRepeat = await getCustomerBalance(testUserId);
    assert.equal(balanceAfterRepeat, 300, 'Saldo deve permanecer 300 sem debitar novamente');

    // 3. Bloqueio de saldo negativo (Overdraft Protection)
    await assert.rejects(
      async () => {
        await applyPointsTransaction({
          customerId: testUserId,
          referenceType: 'order_redemption',
          referenceId: `ref_deb_excess_${testRunId}`,
          transactionType: 'redemption_debit',
          pointsAmount: -9999,
          description: 'Tentativa de saldo negativo'
        });
      },
      /Saldo insuficiente/
    );
  });

  it('InventoryReservationService: TTL e ciclo de vida de reservas', async () => {
    if (!pool) return;
    const fakeOrderId = `ord_res_${testRunId}`;
    
    // Reserva PIX (TTL de 30 min)
    const res = await reserveStock({
      orderId: fakeOrderId,
      items: [
        { product_id: 'prod_elevador_teste', quantity: 2, fulfillment_type: 'physical' }
      ],
      paymentMethod: 'PIX'
    });

    assert.equal(res.reservedCount, 1);
    assert.ok(res.expiresAt > new Date());

    // Confirmação
    const confirmRes = await confirmReservation(fakeOrderId);
    assert.equal(confirmRes.confirmed, 1);

    // Liberação
    const releaseRes = await releaseReservation(fakeOrderId, 'Teste');
    assert.equal(releaseRes.released, 0, 'Já estava confirmed, nada liberado como reserved');
  });

  it('FulfillmentService: Trava de conferência antes do despacho', async () => {
    if (!pool) return;
    const fakeOrderId = `ord_ful_${testRunId}`;

    // Cria pedido e item fisico temporarios
    await pool.query(`
      INSERT INTO orders (id, order_number, customer_id, order_type, shipping_address, customer_snapshot, items)
      VALUES ($1, $2, $3, 'sale', '{}'::jsonb, '{}'::jsonb, '[]'::jsonb)
    `, [fakeOrderId, `N-${testRunId}`, testUserId]);

    await pool.query(`
      INSERT INTO order_items (order_id, product_id, name, quantity, fulfillment_type, fulfillment_status)
      VALUES ($1, 'prod_1', 'Elevador Teste', 1, 'physical', 'pending')
    `, [fakeOrderId]);

    // 1. Cria remessa inicial (status: pending)
    const shipment = await createInitialShipment({ orderId: fakeOrderId });
    assert.equal(shipment.status, 'pending');

    // 2. Tentativa de despacho SEM conferência física (DEVE SER BLOQUEADA PELA TRAVA)
    await assert.rejects(
      async () => {
        await dispatchShipment({
          shipmentId: shipment.id,
          carrier: 'Braspress',
          trackingCode: 'BP123456',
          staffId: testUserId
        });
      },
      /precisa ser conferida/
    );

    // 3. Executa a conferência física obrigatória (checked_by)
    const inspectRes = await completeInspection({
      shipmentId: shipment.id,
      staffId: testUserId,
      staffName: 'Conferente Teste'
    });
    assert.equal(inspectRes.status, 'ready');

    // 4. Agora o despacho deve ser permitido
    const dispatchRes = await dispatchShipment({
      shipmentId: shipment.id,
      carrier: 'Braspress',
      trackingCode: 'BP123456',
      staffId: testUserId
    });
    assert.equal(dispatchRes.status, 'shipped');
    assert.equal(dispatchRes.trackingCode, 'BP123456');
  });

  it('SecurityAuditService: Registro e consulta de eventos de segurança', async () => {
    if (!pool) return;
    const auditRes = await recordSecurityEvent({
      eventType: 'TEST_AUDIT_EVENT',
      severity: 'medium',
      actorId: testUserId,
      targetResource: 'orders/test',
      actionAttempted: 'Teste de auditoria',
      decision: 'blocked',
      reason: 'Validando pipeline de segurança'
    });

    assert.ok(auditRes.id);

    const events = await getSecurityAuditEvents({ limit: 5, eventType: 'TEST_AUDIT_EVENT' });
    assert.ok(events.length > 0);
    assert.equal(events[0].event_type, 'TEST_AUDIT_EVENT');
  });
});
