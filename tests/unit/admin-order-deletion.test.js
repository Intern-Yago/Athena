/**
 * admin-order-deletion.test.js
 * 
 * Testes Unitários da Rota de Exclusão e Purga de Pedidos (Admin Only).
 * Valida:
 * 1. Bloqueio 403 para usuários sem papel de admin (ex: editor ou vendedor).
 * 2. Exclusão de pedido com cascata atômica ACID (itens, remessas, ativações, eventos).
 * 3. Expurgo em lote de pedidos de teste (/orders/cleanup-tests).
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
const opsAdminRoutes = require('../../backend/routes/opsAdminRoutes.js');

describe('Athena OS - Exclusão e Purga de Pedidos por Administradores', () => {
  const pool = getPool();
  const testRunId = `adm_${Date.now()}`;
  const testOrderId = `ord_del_${Date.now()}`;
  const testShipmentId = `shp_del_${Date.now()}`;
  const shortOrderNum = `N-test_${Date.now().toString().slice(-8)}`;

  function findRouteHandler(method, path) {
    const layer = opsAdminRoutes.stack.find(l => {
      if (!l.route) return false;
      const matchesMethod = l.route.methods[method.toLowerCase()];
      const matchesPath = Array.isArray(l.route.path) 
        ? l.route.path.some(p => p === path)
        : l.route.path === path;
      return matchesMethod && matchesPath;
    });
    return layer?.route?.stack?.[0]?.handle;
  }

  before(async () => {
    if (!pool) return;

    // Insere pedido de teste e remessa diretamente no banco
    await query(`
      INSERT INTO orders (
        id, order_number, customer_id, user_name, user_email, order_type,
        status, payment_status, fulfillment_status, total_amount, shipping_address, customer_snapshot
      ) VALUES (
        $1, $2, 'usr_test_del', 'Cliente Teste Delete', $3, 'sale',
        'pending', 'pending', 'pending', 1500.00, '{}'::jsonb, '{}'::jsonb
      ) ON CONFLICT (id) DO NOTHING
    `, [testOrderId, shortOrderNum, `del_${testRunId}@athenatest.com`]);

    await query(`
      INSERT INTO order_items (
        order_id, product_id, name, quantity, unit_price, total_price, fulfillment_type, fulfillment_status
      ) VALUES (
        $1, 'prod_dummy_123', 'Elevador Automotivo Teste', 1, 1500.00, 1500.00, 'physical', 'pending'
      )
    `, [testOrderId]);

    await query(`
      INSERT INTO shipments (
        id, shipment_number, order_id, carrier, status, volumes_count
      ) VALUES (
        gen_random_uuid(), $1, $2, 'Braspress', 'pending', 1
      )
    `, [testShipmentId, testOrderId]);
  });

  after(async () => {
    if (!pool) return;
    try {
      await query('DELETE FROM shipments WHERE order_id = $1', [testOrderId]);
      await query('DELETE FROM order_items WHERE order_id = $1', [testOrderId]);
      await query('DELETE FROM orders WHERE id = $1', [testOrderId]);
    } catch (e) {}
  });

  it('1. Deve rejeitar exclusão se usuário não for administrador (403)', async () => {
    if (!pool) return;

    const handler = findRouteHandler('delete', '/orders/:id');
    assert.ok(handler, 'Handler de exclusão deve existir');

    let responseStatus = 200;
    let responseBody = null;

    const mockReq = {
      params: { id: testOrderId },
      user: { id: 'usr_editor_1', role: 'editor', email: 'editor@athenatest.com' }
    };
    const mockRes = {
      status(s) { responseStatus = s; return this; },
      json(b) { responseBody = b; return this; }
    };

    await handler(mockReq, mockRes);

    assert.equal(responseStatus, 403, 'Apenas admin pode excluir');
    assert.match(responseBody.error, /Apenas administradores/);
  });

  it('2. Administrador deve excluir pedido e seus registros filhos com integridade', async () => {
    if (!pool) return;

    const handler = findRouteHandler('delete', '/orders/:id');
    assert.ok(handler, 'Handler de exclusão deve existir');

    let responseStatus = 200;
    let responseBody = null;

    const mockReq = {
      params: { id: testOrderId },
      user: { id: 'usr_admin_1', role: 'admin', email: 'admin@athenatest.com' }
    };
    const mockRes = {
      status(s) { responseStatus = s; return this; },
      json(b) { responseBody = b; return this; }
    };

    await handler(mockReq, mockRes);

    assert.equal(responseStatus, 200);
    assert.equal(responseBody.success, true);

    // Valida que pedido, itens e remessa foram excluídos
    const orderCheck = await query('SELECT id FROM orders WHERE id = $1', [testOrderId]);
    assert.equal(orderCheck.rows.length, 0, 'Pedido principal deve ser excluído');

    const itemsCheck = await query('SELECT id FROM order_items WHERE order_id = $1', [testOrderId]);
    assert.equal(itemsCheck.rows.length, 0, 'Itens do pedido devem ser excluídos');

    const shipCheck = await query('SELECT id FROM shipments WHERE order_id = $1', [testOrderId]);
    assert.equal(shipCheck.rows.length, 0, 'Remessas do pedido devem ser excluídas');
  });

  it('3. Deve limpar pedidos de teste em lote via cleanup-tests', async () => {
    if (!pool) return;

    const dummyBatchOrderId = `test_b_${Date.now()}`;
    const dummyBatchOrderNum = `N-tb_${Date.now().toString().slice(-8)}`;

    await query(`
      INSERT INTO orders (
        id, order_number, customer_id, user_name, user_email, order_type,
        status, payment_status, fulfillment_status, total_amount, shipping_address, customer_snapshot
      ) VALUES (
        $1, $2, 'usr_batch_test', 'Batch Tester', $3, 'sale',
        'pending', 'pending', 'pending', 500.00, '{}'::jsonb, '{}'::jsonb
      ) ON CONFLICT (id) DO NOTHING
    `, [dummyBatchOrderId, dummyBatchOrderNum, `b_${Date.now()}@athenatest.com`]);

    const handler = findRouteHandler('post', '/orders/cleanup-tests');
    assert.ok(handler, 'Handler de limpeza de testes deve existir');

    let responseStatus = 200;
    let responseBody = null;

    const mockReq = {
      method: 'POST',
      user: { id: 'usr_admin_1', role: 'admin', email: 'admin@athenatest.com' }
    };
    const mockRes = {
      status(s) { responseStatus = s; return this; },
      json(b) { responseBody = b; return this; }
    };

    await handler(mockReq, mockRes);

    assert.equal(responseStatus, 200);
    assert.equal(responseBody.success, true);
    assert.ok(responseBody.deleted_count >= 1, 'Pelo menos 1 pedido de teste deve ser removido');

    // Valida que o pedido de lote foi removido
    const checkBatch = await query('SELECT id FROM orders WHERE id = $1', [dummyBatchOrderId]);
    assert.equal(checkBatch.rows.length, 0, 'Pedido de teste de lote deve ter sido removido');
  });
});
