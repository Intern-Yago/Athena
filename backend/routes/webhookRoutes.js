/**
 * webhookRoutes.js
 * 
 * Athena OS v2.1 — Ingestão Resiliente de Webhooks Externos (Asaas & Omie)
 * Princípio Fast-Ack: Autenticação -> Validação -> Persistência -> HTTP 200 -> Processamento Assíncrono.
 */

const express = require('express');
const crypto = require('crypto');
const { query } = require('../services/db.js');
const { recordSecurityEvent } = require('../services/securityAuditService.js');
const { confirmPayment, cancelOrder } = require('../services/orderService.js');

const router = express.Router();

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) return forwarded.split(',')[0].trim();
  return req.socket?.remoteAddress || req.ip || 'unknown';
}

function timingSafeEqualStr(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

// -------------------------------------------------------------
// 1. WEBHOOK ASAAS (PAGAMENTOS, PIX, BOLETO, CARTÃO)
// -------------------------------------------------------------
const ASAAS_WEBHOOK_SECRET = process.env.ASAAS_WEBHOOK_SECRET || process.env.ASAAS_WEBHOOK_ACCESS_TOKEN || '';

async function handleAsaasWebhook(req, res) {
  const incomingToken = req.headers['asaas-access-token'] || '';

  // 1. Autenticação estrita com timingSafeEqual
  if (ASAAS_WEBHOOK_SECRET) {
    if (!incomingToken || !timingSafeEqualStr(incomingToken, ASAAS_WEBHOOK_SECRET)) {
      const ip = getClientIp(req);
      await recordSecurityEvent({
        eventType: 'WEBHOOK_AUTH_FAILED',
        severity: 'HIGH',
        actorId: 'asaas_webhook',
        details: {
          provider: 'asaas',
          ip,
          path: req.originalUrl,
          userAgent: req.headers['user-agent']
        }
      });

      return res.status(401).json({ error: 'Token de webhook inválido ou ausente.' });
    }
  }

  const { event, payment } = req.body || {};
  if (!event || !payment) {
    return res.status(400).json({ error: 'Payload de webhook inválido. Faltam event ou payment.' });
  }

  const externalEventId = payment.id || `evt_${Date.now()}_${Math.random().toString(36).substring(7)}`;

  try {
    // 2. Persiste evento no banco de dados ANTES de responder 200 (Garantia de Entrega At-Least-Once)
    // Se o banco falhar, o Asaas recebe 500 e tenta novamente mais tarde
    const insertRes = await query(`
      INSERT INTO integration_webhook_events (
        provider, external_event_id, event_type, payload, status
      ) VALUES ($1, $2, $3, $4, 'received')
      ON CONFLICT (provider, external_event_id) 
      DO UPDATE SET 
        payload = EXCLUDED.payload,
        event_type = EXCLUDED.event_type
      RETURNING id, status
    `, ['asaas', externalEventId, event, JSON.stringify(req.body)]);

    const eventRecordId = insertRes.rows[0]?.id;

    // 3. Fast-Ack: responde 200 imediatamente para o Asaas não dar timeout
    res.status(200).json({
      received: true,
      event_id: externalEventId,
      status: 'queued'
    });

    // 4. Processamento Assíncrono Desacoplado
    setImmediate(async () => {
      try {
        console.log(`[ASAAS ASYNC PROCESSOR] Processando evento ${event} para pagamento ${payment.id}`);
        const orderId = payment.externalReference;

        if (event === 'PAYMENT_RECEIVED' || event === 'PAYMENT_CONFIRMED') {
          if (orderId) {
            await confirmPayment({
              orderId,
              asaasPaymentId: payment.id,
              paidAmount: payment.value,
              paymentMethod: payment.billingType?.toLowerCase() || 'asaas'
            });
          }
        } else if (event === 'PAYMENT_REFUNDED' || event === 'PAYMENT_DELETED') {
          if (orderId) {
            await cancelOrder({
              orderId,
              reason: `Cancelamento ou Estorno registrado via Gateway Asaas (Evento: ${event})`
            });
          }
        }

        // Marca como processado
        await query(`
          UPDATE integration_webhook_events
          SET status = 'processed', processed_at = NOW()
          WHERE id = $1
        `, [eventRecordId]);

      } catch (procErr) {
        console.error(`[ASAAS ASYNC ERROR] Falha ao processar evento ${externalEventId}:`, procErr.message);
        try {
          await query(`
            UPDATE integration_webhook_events
            SET status = 'failed', error_message = $1
            WHERE id = $2
          `, [procErr.message, eventRecordId]);

          await recordSecurityEvent({
            eventType: 'WEBHOOK_PROCESSING_FAILED',
            severity: 'MEDIUM',
            actorId: 'asaas_worker',
            details: {
              externalEventId,
              error: procErr.message,
              event
            }
          });
        } catch (e) {}
      }
    });

  } catch (dbErr) {
    console.error('[ASAAS WEBHOOK DB ERROR] Falha ao persistir evento de webhook:', dbErr);
    // NÃO responde 200 se a persistência falhar, para que o Asaas reenvie
    return res.status(500).json({ error: 'Falha interna ao persistir evento no banco de dados.' });
  }
}

// Rotas de ingestão do Asaas
router.post('/asaas', handleAsaasWebhook);
// Compatibilidade com rotas legadas
router.post('/payments/webhook', handleAsaasWebhook);

// -------------------------------------------------------------
// 2. WEBHOOK OMIE ERP (ESTOQUE, FATURAMENTO, CATÁLOGO)
// -------------------------------------------------------------
router.post('/omie', async (req, res) => {
  try {
    const topic = req.body?.topic || req.body?.event || 'generic';
    const externalEventId = req.body?.messageId || req.body?.id || `omie_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Persiste no Event Store
    const insertRes = await query(`
      INSERT INTO integration_webhook_events (
        provider, external_event_id, event_type, payload, status
      ) VALUES ($1, $2, $3, $4, 'received')
      ON CONFLICT (provider, external_event_id)
      DO UPDATE SET payload = EXCLUDED.payload
      RETURNING id
    `, ['omie', String(externalEventId), topic, JSON.stringify(req.body)]);

    const eventRecordId = insertRes.rows[0]?.id;

    // Fast-Ack
    res.status(200).json({ received: true, externalEventId });

    // Processamento assíncrono
    setImmediate(async () => {
      try {
        // Marca como processado
        await query(`
          UPDATE integration_webhook_events
          SET status = 'processed', processed_at = NOW()
          WHERE id = $1
        `, [eventRecordId]);
      } catch (err) {
        console.error('[OMIE ASYNC ERROR]', err);
      }
    });
  } catch (err) {
    console.error('[OMIE WEBHOOK ERROR]', err);
    return res.status(500).json({ error: 'Erro ao persistir webhook Omie.' });
  }
});

router.handleAsaasWebhook = handleAsaasWebhook;

module.exports = router;
