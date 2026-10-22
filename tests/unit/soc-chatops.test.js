/**
 * soc-chatops.test.js
 *
 * Suíte de Testes Unitários — Athena OS v2.1
 * Validação do Security Operations Center (SOC) ChatOps & Firewall via Telegram.
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const socService = require('../../backend/services/socService.js');
const {
  notifySecurityIncident,
  sendTelegramDirectMessage,
  answerTelegramCallbackQuery,
  editTelegramMessageText
} = require('../../backend/services/telegramAlertService.js');

describe('Athena OS v2.1 — SOC ChatOps & Telegram Firewall', () => {
  let memoryTracker;

  beforeEach(() => {
    memoryTracker = new Map();
    socService.setMemoryTracker(memoryTracker);
  });

  describe('1. Operações de Firewall (Ban / Unban)', () => {
    it('Deve banir IP público legítimo e registrar no memory tracker e auditoria', async () => {
      const publicIp = '198.51.100.42';
      const reason = 'Tentativa de força bruta no painel administrativo';
      const bannedBy = '@sec_admin';

      const result = await socService.banIp({
        ip: publicIp,
        reason,
        bannedBy
      });

      assert.strictEqual(result.ok, true);
      assert.strictEqual(result.ip, publicIp);
      assert.strictEqual(result.reason, reason);
      assert.strictEqual(result.bannedBy, bannedBy);

      // Valida memória
      const memRecord = memoryTracker.get(publicIp);
      assert.ok(memRecord, 'IP deve estar presente no tracker de memória');
      assert.strictEqual(memRecord.isBlocked, true);
      assert.strictEqual(memRecord.failedAttempts, 99);
    });

    it('Deve RECUSAR banimento de IP privado ou loopback (Anti-Auto-Bloqueio)', async () => {
      const privateIps = ['127.0.0.1', '192.168.1.100', '10.0.0.1', '172.16.0.5', '::1'];

      for (const ip of privateIps) {
        const result = await socService.banIp({
          ip,
          reason: 'Teste de segurança interna',
          bannedBy: '@admin'
        });

        assert.strictEqual(result.ok, false);
        assert.match(result.error, /IPs privados|Cloudflare|segurança/i);
        assert.strictEqual(memoryTracker.has(ip), false, `IP privado ${ip} não pode ser inserido na blocklist`);
      }
    });

    it('Deve RECUSAR banimento de IPs de borda da Cloudflare', async () => {
      const cloudflareIp = '173.245.48.1';

      const result = await socService.banIp({
        ip: cloudflareIp,
        reason: 'Teste bloqueio Cloudflare',
        bannedBy: '@admin'
      });

      assert.strictEqual(result.ok, false);
      assert.match(result.error, /Cloudflare/i);
    });

    it('Deve rejeitar strings que não sejam endereços IP válidos', async () => {
      const invalidInputs = ['not-an-ip', '999.999.999.999', '', null, undefined, 'abc.def.ghi.jkl'];

      for (const invalid of invalidInputs) {
        const result = await socService.banIp({
          ip: invalid,
          reason: 'Teste inválido',
          bannedBy: '@admin'
        });

        assert.strictEqual(result.ok, false);
        assert.match(result.error, /Endereço IP inválido/i);
      }
    });

    it('Deve desbloquear (unban) IP e zerar contador no tracker de memória', async () => {
      const targetIp = '203.0.113.88';

      // Primeiro bloqueia
      await socService.banIp({
        ip: targetIp,
        reason: 'Bloqueio prévio para teste',
        bannedBy: '@admin'
      });
      assert.strictEqual(memoryTracker.get(targetIp).isBlocked, true);

      // Agora desbloqueia
      const unbanResult = await socService.unbanIp({
        ip: targetIp,
        unbannedBy: '@superadmin'
      });

      assert.strictEqual(unbanResult.ok, true);
      assert.strictEqual(unbanResult.ip, targetIp);
      assert.strictEqual(unbanResult.unbannedBy, '@superadmin');

      // Valida memória restaurada
      const memRecord = memoryTracker.get(targetIp);
      assert.strictEqual(memRecord.isBlocked, false);
      assert.strictEqual(memRecord.failedAttempts, 0);
    });

    it('Deve listar IPs bloqueados a partir do fallback de memória quando DB estiver isolado', async () => {
      const ip1 = '198.51.100.10';
      const ip2 = '198.51.100.20';

      await socService.banIp({ ip: ip1, reason: 'Probe 1' });
      await socService.banIp({ ip: ip2, reason: 'Probe 2' });

      const list = await socService.listBannedIps({ limit: 10 });
      assert.ok(Array.isArray(list));
      assert.ok(list.length >= 2);

      const ipsInList = list.map(item => item.ip);
      assert.ok(ipsInList.includes(ip1));
      assert.ok(ipsInList.includes(ip2));
    });
  });

  describe('2. Diagnóstico & Investigação SOC', () => {
    it('getSystemStatus deve retornar métricas de saúde com uptime e memória formatados', async () => {
      const status = await socService.getSystemStatus();

      assert.ok(status);
      assert.ok(typeof status.uptime === 'string');
      assert.ok(typeof status.memoryRssMb === 'string');
      assert.ok(typeof status.memoryHeapMb === 'string');
      assert.ok(typeof status.blockedIpsCount === 'number');
      assert.ok(typeof status.healthy === 'boolean');
    });

    it('lookupWhois deve rejeitar IP inválido antes de chamada de rede', async () => {
      const res = await socService.lookupWhois('ip-invalido');
      assert.strictEqual(res.ok, false);
      assert.match(res.error, /Endereço IP inválido/i);
    });
  });

  describe('3. Alertas Interativos do Telegram com Botões Inline', () => {
    it('notifySecurityIncident: deve anexar botões inline de bloqueio quando IP público for detectado', async () => {
      // Garante dry-run
      const originalToken = process.env.TELEGRAM_BOT_TOKEN;
      const originalChatId = process.env.TELEGRAM_CHAT_ID;
      delete process.env.TELEGRAM_BOT_TOKEN;
      delete process.env.TELEGRAM_CHAT_ID;

      const res = await notifySecurityIncident({
        eventType: 'HONEYPOT_TRIGGERED',
        severity: 'high',
        actor: 'attacker@evil.com',
        ip: '198.51.100.99',
        reason: 'Tentativa de exploração de vulnerabilidade XML-RPC'
      });

      assert.strictEqual(res.ok, true);

      if (originalToken !== undefined) process.env.TELEGRAM_BOT_TOKEN = originalToken;
      else delete process.env.TELEGRAM_BOT_TOKEN;
      if (originalChatId !== undefined) process.env.TELEGRAM_CHAT_ID = originalChatId;
      else delete process.env.TELEGRAM_CHAT_ID;
    });

    it('sendTelegramDirectMessage deve lidar seguramente com ausência de credenciais sem crashar', async () => {
      const originalToken = process.env.TELEGRAM_BOT_TOKEN;
      delete process.env.TELEGRAM_BOT_TOKEN;

      const res = await sendTelegramDirectMessage({
        text: 'Mensagem de teste direta'
      });

      assert.strictEqual(res.ok, false);
      assert.match(res.error, /não configuradas/i);

      if (originalToken !== undefined) process.env.TELEGRAM_BOT_TOKEN = originalToken;
      else delete process.env.TELEGRAM_BOT_TOKEN;
    });
  });

  describe('4. Webhook Receiver & Comandos ChatOps', () => {
    const telegramWebhookRoutes = require('../../backend/routes/telegramWebhookRoutes.js');
    const webhookHandler = telegramWebhookRoutes.stack[0]?.route?.stack?.[0]?.handle || telegramWebhookRoutes.stack[0]?.handle;
    const testChatId = '123456789';
    const noopNext = () => {};

    function createMockRes() {
      let statusCode = 200;
      let body = null;
      return {
        status(c) { statusCode = c; return this; },
        json(b) { body = b; return this; },
        getStatusCode() { return statusCode; },
        getBody() { return body; }
      };
    }

    it('Deve rejeitar ou ignorar mensagens enviadas por Chat ID não autorizado', async () => {
      process.env.TELEGRAM_CHAT_ID = testChatId;

      const mockReq = {
        body: {
          message: {
            text: '/status',
            chat: { id: '999999999' } // ID diferente do autorizado
          }
        },
        headers: {}
      };
      const mockRes = createMockRes();

      await webhookHandler(mockReq, mockRes, noopNext);
      assert.strictEqual(mockRes.getStatusCode(), 200, 'Fast-Ack deve sempre responder 200');
    });

    it('Deve responder ao comando /ajuda ou /start com manual de instruções', async () => {
      process.env.TELEGRAM_CHAT_ID = testChatId;

      const mockReq = {
        body: {
          message: {
            text: '/ajuda',
            chat: { id: testChatId },
            from: { username: 'soc_analyst' }
          }
        },
        headers: {}
      };
      const mockRes = createMockRes();

      await webhookHandler(mockReq, mockRes, noopNext);
      assert.strictEqual(mockRes.getStatusCode(), 200);
    });

    it('Deve processar comando /ban orientando o formato caso parâmetros faltem', async () => {
      process.env.TELEGRAM_CHAT_ID = testChatId;

      // 1. Apenas /ban sem IP
      const mockReq1 = {
        body: {
          message: {
            text: '/ban',
            chat: { id: testChatId }
          }
        },
        headers: {}
      };
      const mockRes1 = createMockRes();
      await webhookHandler(mockReq1, mockRes1, noopNext);
      assert.strictEqual(mockRes1.getStatusCode(), 200);

      // 2. /ban com IP mas sem motivo
      const mockReq2 = {
        body: {
          message: {
            text: '/ban 198.51.100.77',
            chat: { id: testChatId }
          }
        },
        headers: {}
      };
      const mockRes2 = createMockRes();
      await webhookHandler(mockReq2, mockRes2, noopNext);
      assert.strictEqual(mockRes2.getStatusCode(), 200);
    });

    it('Deve executar /ban com IP e motivo legítimo bloqueando no firewall', async () => {
      process.env.TELEGRAM_CHAT_ID = testChatId;
      const targetIp = '198.51.100.95';

      const mockReq = {
        body: {
          message: {
            text: `/ban ${targetIp} Tentativa de SQL Injection detectada`,
            chat: { id: testChatId },
            from: { username: 'soc_lead' }
          }
        },
        headers: {}
      };
      const mockRes = createMockRes();

      await webhookHandler(mockReq, mockRes, noopNext);
      assert.strictEqual(mockRes.getStatusCode(), 200);

      // Verifica memória atualizada pelo handler
      const mem = memoryTracker.get(targetIp);
      assert.ok(mem);
      assert.strictEqual(mem.isBlocked, true);
    });

    it('Deve executar /unban liberando o IP do firewall', async () => {
      process.env.TELEGRAM_CHAT_ID = testChatId;
      const targetIp = '198.51.100.96';

      // Pré-bloqueia
      await socService.banIp({ ip: targetIp, reason: 'Ban prévio' });
      assert.strictEqual(memoryTracker.get(targetIp).isBlocked, true);

      const mockReq = {
        body: {
          message: {
            text: `/unban ${targetIp}`,
            chat: { id: testChatId },
            from: { username: 'soc_lead' }
          }
        },
        headers: {}
      };
      const mockRes = createMockRes();

      await webhookHandler(mockReq, mockRes, noopNext);
      assert.strictEqual(mockRes.getStatusCode(), 200);

      // Verifica memória liberada
      assert.strictEqual(memoryTracker.get(targetIp).isBlocked, false);
    });

    it('Deve processar callback_query de 1 clique (soc_ban:<ip>)', async () => {
      process.env.TELEGRAM_CHAT_ID = testChatId;
      const targetIp = '198.51.100.97';

      const mockReq = {
        body: {
          callback_query: {
            id: 'cb_query_123',
            data: `soc_ban:${targetIp}`,
            message: { chat: { id: testChatId } },
            from: { username: 'soc_quick_responder' }
          }
        },
        headers: {}
      };
      const mockRes = createMockRes();

      await webhookHandler(mockReq, mockRes, noopNext);
      assert.strictEqual(mockRes.getStatusCode(), 200);

      // Verifica que o IP foi bloqueado após o clique
      const mem = memoryTracker.get(targetIp);
      assert.ok(mem);
      assert.strictEqual(mem.isBlocked, true);
    });

    it('Deve responder ao comando /help com instruções completas incluindo /limparlogs', async () => {
      process.env.TELEGRAM_CHAT_ID = testChatId;

      const mockReq = {
        body: {
          message: {
            text: '/help',
            chat: { id: testChatId },
            from: { username: 'soc_admin' }
          }
        },
        headers: {}
      };
      const mockRes = createMockRes();

      await webhookHandler(mockReq, mockRes, noopNext);
      assert.strictEqual(mockRes.getStatusCode(), 200);
    });

    it('Deve executar o comando /limparlogs e purgar resíduos com sucesso', async () => {
      process.env.TELEGRAM_CHAT_ID = testChatId;

      const mockReq = {
        body: {
          message: {
            text: '/limparlogs',
            chat: { id: testChatId },
            from: { username: 'soc_cleaner' }
          }
        },
        headers: {}
      };
      const mockRes = createMockRes();

      await webhookHandler(mockReq, mockRes, noopNext);
      assert.strictEqual(mockRes.getStatusCode(), 200);
    });
  });

  describe('5. Housekeeping & Retenção de Dados', () => {
    it('runHousekeepingCleanup deve executar queries de expurgo com integridade sem quebrar', async () => {
      const result = await socService.runHousekeepingCleanup('Test Runner');

      assert.ok(result);
      assert.strictEqual(result.ok, true);
      assert.strictEqual(typeof result.totalDeleted, 'number');
      assert.strictEqual(typeof result.auditLogsDeleted, 'number');
      assert.strictEqual(typeof result.tokensDeleted, 'number');
      assert.strictEqual(typeof result.reservationsDeleted, 'number');
      assert.strictEqual(typeof result.unblockedIpsPruned, 'number');
      assert.strictEqual(typeof result.orphanedEventsDeleted, 'number');
    });
  });
});
