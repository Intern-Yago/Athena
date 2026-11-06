const path = require('path');
const https = require('https');
const crypto = require('crypto');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const OMIE_APP_KEY = process.env.OMIE_APP_KEY;
const OMIE_APP_SECRET = process.env.OMIE_APP_SECRET;

function callOmie(endpoint, callName, paramObj) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      call: callName,
      app_key: OMIE_APP_KEY,
      app_secret: OMIE_APP_SECRET,
      param: [paramObj]
    });

    const req = https.request(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(null);
        }
      });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

// Cache de clientes do Omie para não fazer 98 requisições repetidas
const clientCache = new Map();

async function getClientDetails(clientId) {
  if (!clientId) return null;
  if (clientCache.has(clientId)) return clientCache.get(clientId);

  try {
    const res = await callOmie('https://app.omie.com.br/api/v1/geral/clientes/', 'ConsultarCliente', {
      codigo_cliente_omie: Number(clientId)
    });
    if (res) {
      const client = {
        name: res.nome_fantasia || res.razao_social || 'Cliente Omie',
        doc: (res.cnpj_cpf || '').replace(/\D/g, ''),
        email: (res.email || '').toLowerCase().trim(),
        phone: res.telefone1_numero ? `(${res.telefone1_ddd || ''}) ${res.telefone1_numero}` : '',
        address: {
          street: res.endereco || '',
          number: res.endereco_numero || 'S/N',
          complement: res.complemento || '',
          neighborhood: res.bairro || '',
          city: res.cidade || '',
          state: res.estado || '',
          zipCode: res.cep || ''
        }
      };
      clientCache.set(clientId, client);
      return client;
    }
  } catch (e) {}
  return null;
}

async function syncOmieSalesOrders(dbPool = pool) {
  console.log('========================================================================');
  console.log(' SINCRONIZAÇÃO KANBAN: PEDIDOS DE VENDA OMIE ➔ MESA DE EXPEDIÇÃO ');
  console.log('========================================================================\n');

  let page = 1;
  let totalOrdersFetched = 0;
  let totalImported = 0;
  let skippedCancelled = 0;

  while (true) {
    const res = await callOmie('https://app.omie.com.br/api/v1/produtos/pedido/', 'ListarPedidos', {
      pagina: page,
      registros_por_pagina: 50,
      apenas_importado_api: 'N'
    });

    if (!res || !res.pedido_venda_produto || res.pedido_venda_produto.length === 0) break;

    for (const p of res.pedido_venda_produto) {
      totalOrdersFetched++;
      const cab = p.cabecalho || {};
      const info = p.infoCadastro || {};
      const tot = p.total_pedido || {};
      const frete = p.frete || {};
      const itens = p.det || [];

      // Ignora pedidos cancelados
      if (info.cancelado === 'S') {
        skippedCancelled++;
        continue;
      }

      const codigoPedido = cab.codigo_pedido;
      const numeroPedido = cab.numero_pedido;
      const codigoPedidoIntegracao = cab.codigo_pedido_integracao ? String(cab.codigo_pedido_integracao).trim() : null;
      const etapa = String(cab.etapa || '00');
      const totalAmount = Number(tot.valor_total_pedido || 0);
      const clientId = cab.codigo_cliente;

      // Mapeamento Etapa Omie -> Status da Remessa no Kanban Athena:
      // '00' / '10': pending (Aguardando Separação)
      // '20': ready (Conferido / Trava Liberada)
      // '50' / '60': shipped (Despachado / Em Trânsito)
      // '70': delivered (Entregue)
      let shipmentStatus = 'pending';
      if (etapa === '20') shipmentStatus = 'ready';
      else if (etapa === '50' || etapa === '60') shipmentStatus = 'shipped';
      else if (etapa === '70') shipmentStatus = 'delivered';

      // PREVENÇÃO DE DUPLICIDADE (SITE ➔ OMIE):
      // Se o pedido nasceu no Site Athena e foi integrado ao Omie, vinculamos o omie_pedido_id
      // ao pedido original do Site e NÃO criamos um segundo registro "OMIE-X" duplicado.
      const existingSiteOrderRes = await dbPool.query(`
        SELECT id, order_number FROM orders
        WHERE id NOT LIKE 'ord_omie_%'
          AND (
            omie_pedido_id = $1
            OR ($2::text IS NOT NULL AND (id = $2 OR order_number = $2))
          )
        LIMIT 1
      `, [String(codigoPedido), codigoPedidoIntegracao]);

      if (existingSiteOrderRes.rows.length > 0) {
        const siteOrder = existingSiteOrderRes.rows[0];
        await dbPool.query(`
          UPDATE orders
          SET omie_pedido_id = $1,
              updated_at = NOW()
          WHERE id = $2
        `, [String(codigoPedido), siteOrder.id]);
        totalImported++;
        continue;
      }

      const orderId = `ord_omie_${codigoPedido}`;
      const orderNumber = `OMIE-${numeroPedido}`;
      const shipmentNumber = `REM-OMIE-${numeroPedido}`;

      const clientInfo = await getClientDetails(clientId);
      const customerSnapshot = {
        name: clientInfo?.name || 'Cliente Omie',
        document: clientInfo?.doc || '',
        email: clientInfo?.email || '',
        phone: clientInfo?.phone || '',
        omie_cliente_id: clientId
      };

      const shippingAddress = clientInfo?.address || {
        street: 'Logística Omie',
        number: 'S/N',
        neighborhood: 'Geral',
        city: 'Brasília',
        state: 'DF',
        zipCode: '71996-413'
      };

      // 1. Upsert em orders
      await dbPool.query(`
        INSERT INTO orders (
          id, order_number, customer_id, order_type,
          status, total_amount, payment_status,
          customer_snapshot, shipping_address,
          omie_pedido_id, items, created_at, updated_at
        ) VALUES (
          $1, $2, $3, 'sale',
          'approved', $4, 'paid',
          $5::jsonb, $6::jsonb,
          $7, '[]'::jsonb, NOW(), NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
          status = 'approved',
          total_amount = EXCLUDED.total_amount,
          customer_snapshot = EXCLUDED.customer_snapshot,
          shipping_address = EXCLUDED.shipping_address,
          updated_at = NOW()
      `, [
        orderId,
        orderNumber,
        `usr_omie_${clientId || 'anon'}`,
        totalAmount,
        JSON.stringify(customerSnapshot),
        JSON.stringify(shippingAddress),
        String(codigoPedido)
      ]);

      // 2. Upsert em order_items
      await dbPool.query(`DELETE FROM order_items WHERE order_id = $1`, [orderId]);

      for (const it of itens) {
        const prod = it.produto || {};
        const itemId = crypto.randomUUID();
        const pId = prod.codigo_produto ? `prod_omie_${prod.codigo_produto}` : 'prod_desconhecido';
        const pName = prod.descricao || 'Item Omie';
        const qty = Math.max(1, parseInt(prod.quantidade || 1, 10));
        const unitVal = Number(prod.valor_unitario || 0);
        const totVal = Number(prod.valor_total || (unitVal * qty));

        await dbPool.query(`
          INSERT INTO order_items (
            id, order_id, product_id, variant_sku, name,
            quantity, unit_price, total_price,
            fulfillment_type, fulfillment_status, created_at
          ) VALUES (
            $1, $2, $3, $4, $5,
            $6, $7, $8,
            'physical', $9, NOW()
          )
        `, [
          itemId,
          orderId,
          pId,
          prod.codigo || null,
          pName,
          qty,
          unitVal,
          totVal,
          shipmentStatus === 'delivered' ? 'delivered' : (shipmentStatus === 'shipped' ? 'shipped' : 'pending')
        ]);
      }

      // 3. Upsert em shipments (Mesa de Expedição)
      const carrierName = frete.codigo_transportadora ? `Transportadora #${frete.codigo_transportadora}` : 'Braspress';
      const trackingCode = frete.codigo_rastreio || null;
      const trackingUrl = frete.link_rastreio || null;
      const volumesCount = Math.max(1, parseInt(frete.quantidade_volumes || 1, 10));
      const weightKg = Number(frete.peso_bruto || 0);

      const checkedAt = ['ready', 'shipped', 'delivered'].includes(shipmentStatus) ? new Date() : null;
      const shippedAt = ['shipped', 'delivered'].includes(shipmentStatus) ? new Date() : null;
      const deliveredAt = shipmentStatus === 'delivered' ? new Date() : null;

      // Checa se remessa já existe
      const existingShipment = (await dbPool.query(`SELECT id FROM shipments WHERE order_id = $1`, [orderId])).rows[0];

      if (existingShipment) {
        await dbPool.query(`
          UPDATE shipments
          SET
            status = $1,
            carrier = COALESCE($2, carrier),
            tracking_code = COALESCE($3, tracking_code),
            tracking_url = COALESCE($4, tracking_url),
            volumes_count = $5,
            weight_kg = $6,
            checked_at = COALESCE(checked_at, $7),
            shipped_at = COALESCE(shipped_at, $8),
            delivered_at = COALESCE(delivered_at, $9)
          WHERE id = $10
        `, [
          shipmentStatus,
          carrierName,
          trackingCode,
          trackingUrl,
          volumesCount,
          weightKg,
          checkedAt,
          shippedAt,
          deliveredAt,
          existingShipment.id
        ]);
      } else {
        const shipmentId = crypto.randomUUID();
        await dbPool.query(`
          INSERT INTO shipments (
            id, order_id, shipment_number, status,
            carrier, tracking_code, tracking_url,
            volumes_count, weight_kg,
            checked_at, shipped_at, delivered_at, created_at
          ) VALUES (
            $1, $2, $3, $4,
            $5, $6, $7,
            $8, $9,
            $10, $11, $12,
            NOW()
          )
        `, [
          shipmentId,
          orderId,
          shipmentNumber,
          shipmentStatus,
          carrierName,
          trackingCode,
          trackingUrl,
          volumesCount,
          weightKg,
          checkedAt,
          shippedAt,
          deliveredAt
        ]);
      }

      totalImported++;
    }

    if (page >= (res.total_de_paginas || 1)) break;
    page++;
  }

  console.log('\n========================================================================');
  console.log(' RESULTADO DA SINCRONIZAÇÃO DE EXPEDIÇÃO:');
  console.log('========================================================================');
  console.log(`📦 Total de pedidos consultados no Omie: ${totalOrdersFetched}`);
  console.log(`🚫 Pedidos cancelados ignorados: ${skippedCancelled}`);
  console.log(`🚀 Remessas sincronizadas no Kanban de Expedição: ${totalImported}`);

  return { totalOrdersFetched, skippedCancelled, totalImported };
}

if (require.main === module) {
  syncOmieSalesOrders()
    .then(() => pool.end())
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { syncOmieSalesOrders };
