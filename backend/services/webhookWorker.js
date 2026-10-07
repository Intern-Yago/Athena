/**
 * webhookWorker.js
 * 
 * Athena OS v2.1 — Fila e Worker Resiliente de Webhooks Externos
 * Substitui o setImmediate() volátil por um processador durável e transacional no PostgreSQL.
 * 
 * Ciclo de Vida:
 * 1. RECEIVED (persistido no Fast-Ack HTTP 200)
 * 2. PROCESSING (travado via SELECT ... FOR UPDATE SKIP LOCKED)
 * 3. PROCESSED (sucesso idempotente)
 * 4. QUEUED (retry agendado com backoff exponencial se falhar temporariamente)
 * 5. FAILED (Dead-Letter Queue após esgotar max_attempts + Alerta no SecurityAudit)
 */

const { getPool, withTransaction, query } = require('./db.js');
const { recordSecurityEvent } = require('./securityAuditService.js');
const { confirmPayment, cancelOrder } = require('./orderService.js');

let workerTimer = null;
let isRunningBatch = false;

/**
 * Calcula tempo de espera para o próximo retry (Backoff Exponencial)
 * Tentativa 1: +30s
 * Tentativa 2: +60s
 * Tentativa 3: +120s
 * Tentativa 4: +240s
 */
function calculateNextRetryDate(attemptsCount) {
  const baseSeconds = 30;
  const backoffMultiplier = Math.pow(2, Math.max(0, attemptsCount - 1));
  const delayMs = baseSeconds * backoffMultiplier * 1000;
  return new Date(Date.now() + delayMs);
}

/**
 * Processa um único evento de forma atômica
 */
async function processSingleEvent(event) {
  const { id, provider, external_event_id, event_type, payload } = event;
  const parsedPayload = typeof payload === 'string' ? JSON.parse(payload) : payload;

  console.log(`[WEBHOOK WORKER] ⚙️ Iniciando processamento do evento #${external_event_id} (${provider}::${event_type})`);

  if (provider === 'asaas') {
    const payment = parsedPayload.payment || {};
    const orderId = payment.externalReference;

    if (event_type === 'PAYMENT_RECEIVED' || event_type === 'PAYMENT_CONFIRMED') {
      if (orderId) {
        await confirmPayment({
          orderId,
          asaasPaymentId: payment.id,
          paidAmount: payment.value,
          paymentMethod: payment.billingType?.toLowerCase() || 'asaas'
        });
      }
    } else if (event_type === 'PAYMENT_REFUNDED' || event_type === 'PAYMENT_DELETED') {
      if (orderId) {
        await cancelOrder({
          orderId,
          reason: `Cancelamento ou Estorno registrado via Asaas Webhook (Evento: ${event_type})`
        });
      }
    }
  } else if (provider === 'omie') {
    // Integração futura com catálogo/NF Omie
    console.log(`[WEBHOOK WORKER] Omie evento #${external_event_id} processado com sucesso.`);
  }

  // Marca como PROCESSED
  await query(`
    UPDATE integration_webhook_events
    SET status = 'processed',
        processed_at = NOW(),
        last_error = NULL
    WHERE id = $1
  `, [id]);

  console.log(`[WEBHOOK WORKER] ✅ Evento #${external_event_id} concluído com status PROCESSED.`);
  return { success: true, eventId: id };
}

/**
 * Puxa e processa o próximo evento da fila com lock pessimista (SKIP LOCKED)
 */
async function processNextEvent() {
  return await withTransaction(async (client) => {
    // 1. Busca o próximo evento pendente ou agendado para retry que não esteja travado por outro worker
    const selectRes = await client.query(`
      SELECT id, provider, external_event_id, event_type, payload, attempts_count, max_attempts
      FROM integration_webhook_events
      WHERE status IN ('received', 'queued')
        AND (next_retry_at IS NULL OR next_retry_at <= NOW())
        AND attempts_count < max_attempts
      ORDER BY received_at ASC
      LIMIT 1
      FOR UPDATE SKIP LOCKED
    `);

    if (selectRes.rows.length === 0) {
      return null; // Nada a processar no momento
    }

    const event = selectRes.rows[0];

    // 2. Marca imediatamente como PROCESSING e incrementa tentativas
    const newAttempts = event.attempts_count + 1;
    await client.query(`
      UPDATE integration_webhook_events
      SET status = 'processing',
          attempts_count = $1
      WHERE id = $2
    `, [newAttempts, event.id]);

    event.attempts_count = newAttempts;
    return event;
  });
}

let currentBatchPromise = null;

/**
 * Executa um lote de eventos da fila com exclusão mútua assíncrona
 */
async function processQueueBatch(maxBatchSize = 10) {
  while (currentBatchPromise) {
    try {
      await currentBatchPromise;
    } catch (e) {}
  }

  let resolveBatch;
  currentBatchPromise = new Promise(resolve => { resolveBatch = resolve; });

  let processedCount = 0;

  try {
    // Recupera eventos que ficaram travados em 'processing' por mais de 5 minutos (ex: container crash)
    await query(`
      UPDATE integration_webhook_events
      SET status = 'queued',
          next_retry_at = NOW()
      WHERE status = 'processing'
        AND received_at < NOW() - INTERVAL '5 minutes'
    `);

    for (let i = 0; i < maxBatchSize; i++) {
      const eventToProcess = await processNextEvent();
      if (!eventToProcess) break; // Fila vazia

      try {
        await processSingleEvent(eventToProcess);
        processedCount++;
      } catch (err) {
        console.error(`[WEBHOOK WORKER ERROR] Falha no processamento do evento #${eventToProcess.external_event_id}:`, err.message);

        const isExhausted = eventToProcess.attempts_count >= eventToProcess.max_attempts;

        if (isExhausted) {
          // Dead-Letter Queue
          await query(`
            UPDATE integration_webhook_events
            SET status = 'failed',
                last_error = $1
            WHERE id = $2
          `, [err.message, eventToProcess.id]);

          await recordSecurityEvent({
            eventType: 'WEBHOOK_DEAD_LETTER_EVENT',
            severity: 'HIGH',
            actorId: 'webhook_worker',
            details: {
              eventId: eventToProcess.id,
              externalEventId: eventToProcess.external_event_id,
              provider: eventToProcess.provider,
              attempts: eventToProcess.attempts_count,
              error: err.message
            }
          });
        } else {
          // Re-enfileira com backoff exponencial
          const nextRetry = calculateNextRetryDate(eventToProcess.attempts_count);
          await query(`
            UPDATE integration_webhook_events
            SET status = 'queued',
                next_retry_at = $1,
                last_error = $2
            WHERE id = $3
          `, [nextRetry, err.message, eventToProcess.id]);
        }
      }
    }
  } catch (err) {
    console.error('[WEBHOOK WORKER BATCH ERROR]', err);
  } finally {
    currentBatchPromise = null;
    if (resolveBatch) resolveBatch();
  }

  return { processed: processedCount };
}

/**
 * Gatilho instantâneo chamado pela rota de webhook assim que o HTTP 200 é enviado
 */
function triggerImmediateProcessing() {
  setImmediate(() => {
    processQueueBatch().catch(err => console.error('[IMMEDIATE QUEUE ERROR]', err));
  });
}

/**
 * Inicia o worker periódico em background
 */
function startWebhookWorker(intervalMs = 5000) {
  if (workerTimer) return;
  console.log(`[WEBHOOK WORKER] 🚀 Inicializado com ciclo de polling a cada ${intervalMs}ms.`);
  workerTimer = setInterval(() => {
    processQueueBatch().catch(() => {});
  }, intervalMs);

  // Executa uma primeira passagem imediata
  processQueueBatch().catch(() => {});
}

/**
 * Para o worker (útil para testes unitários ou graceful shutdown)
 */
function stopWebhookWorker() {
  if (workerTimer) {
    clearInterval(workerTimer);
    workerTimer = null;
    console.log('[WEBHOOK WORKER] 🛑 Parado com sucesso.');
  }
}

module.exports = {
  processSingleEvent,
  processNextEvent,
  processQueueBatch,
  triggerImmediateProcessing,
  startWebhookWorker,
  stopWebhookWorker,
  calculateNextRetryDate
};
