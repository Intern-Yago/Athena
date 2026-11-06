/**
 * telegram-alert.test.js
 *
 * Suíte de Testes Unitários — Athena OS v2.1
 * Validação do Serviço Inteligente de Alertas do Telegram (Níveis, Cooldown e Anti-Spam).
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const {
  sendTelegramAlert,
  notifySystemOutage,
  notifySecurityIncident,
  notifyHighValueOrder,
  testTelegramConnection
} = require('../../backend/services/telegramAlertService.js');

describe('Telegram Alert Service: Classificação Inteligente & Anti-Spam', () => {

  it('Nível INFO: Deve ser descartado silenciosamente para evitar fadiga de alertas', async () => {
    const res = await sendTelegramAlert({
      level: 'INFO',
      title: 'Robô escaneando 404',
      message: 'Tentativa de acesso em /wp-login.php'
    });

    assert.strictEqual(res.ok, true);
    assert.strictEqual(res.skipped, true);
    assert.match(res.reason, /prevent alert fatigue/i);
  });

  it('Modo Seguro (Sem Token): Deve executar dry-run seguro sem quebrar o servidor', async () => {
    // Quando as variáveis TELEGRAM_BOT_TOKEN / CHAT_ID não estão definidas no ambiente local de teste
    const originalToken = process.env.TELEGRAM_BOT_TOKEN;
    const originalChatId = process.env.TELEGRAM_CHAT_ID;
    delete process.env.TELEGRAM_BOT_TOKEN;
    delete process.env.TELEGRAM_CHAT_ID;

    const res = await sendTelegramAlert({
      level: 'CRITICAL',
      title: 'Teste de Falha Crítica',
      message: 'Banco de dados inacessível'
    });

    assert.strictEqual(res.ok, true);
    assert.strictEqual(res.skipped, true);

    if (originalToken !== undefined) process.env.TELEGRAM_BOT_TOKEN = originalToken;
    else delete process.env.TELEGRAM_BOT_TOKEN;
    if (originalChatId !== undefined) process.env.TELEGRAM_CHAT_ID = originalChatId;
    else delete process.env.TELEGRAM_CHAT_ID;
  });

  it('Throttling / Cooldown: Deve barrar mensagens duplicadas no intervalo de resfriamento', async () => {
    const uniqueKey = `test_throttle_${Date.now()}`;

    // 1º Envio
    const res1 = await sendTelegramAlert({
      level: 'WARNING',
      title: 'API de Frete Lenta',
      message: 'Melhor Envio demorando a responder',
      dedupKey: uniqueKey,
      cooldownMinutes: 10
    });
    assert.strictEqual(res1.ok, true);

    // 2º Envio imediato com a mesma chave (deve ser throttled / agrupado)
    const res2 = await sendTelegramAlert({
      level: 'WARNING',
      title: 'API de Frete Lenta',
      message: 'Melhor Envio demorando a responder',
      dedupKey: uniqueKey,
      cooldownMinutes: 10
    });
    assert.strictEqual(res2.ok, true);
    assert.strictEqual(res2.throttled, true);
    assert.strictEqual(res2.accumulatedCount, 2);
  });

  it('notifyHighValueOrder: Deve ignorar pedidos normais (< R$ 10.000) e notificar apenas pedidos de grande porte', async () => {
    // Pedido comum de R$ 500,00 -> Ignorado
    const smallOrderRes = await notifyHighValueOrder({
      id: 'ord_small_123',
      order_number: 'N-10001',
      total_amount: 500.00,
      order_type: 'sale'
    });
    assert.strictEqual(smallOrderRes.skipped, true);

    // Pedido de grande porte de R$ 15.000,00 -> Dispara alerta
    const bigOrderRes = await notifyHighValueOrder({
      id: `ord_big_${Date.now()}`,
      order_number: 'N-99999',
      total_amount: 15000.00,
      order_type: 'sale',
      user_name: 'Cliente Vip Teste'
    });
    assert.strictEqual(bigOrderRes.ok, true);
  });

  it('testTelegramConnection: Deve reportar status amigável quando variáveis não estão configuradas', async () => {
    const res = await testTelegramConnection();
    assert.strictEqual(typeof res.success, 'boolean');
    assert.strictEqual(typeof res.configured, 'boolean');
  });
});
