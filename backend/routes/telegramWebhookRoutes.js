/**
 * telegramWebhookRoutes.js
 *
 * Athena OS v2.1 — Telegram SOC Webhook Receiver & Interactive ChatOps
 * Recebe comandos (/ban, /unban, /whois, /status, /pedidos, /limpartestes)
 * e cliques em botões inline disparados em alertas de segurança.
 */

const express = require('express');
const router = express.Router();
const socService = require('../services/socService.js');
const {
  sendTelegramDirectMessage,
  answerTelegramCallbackQuery,
  editTelegramMessageText
} = require('../services/telegramAlertService.js');

/**
 * Validação de Autorização:
 * Garante que somente o Chat ID oficial configurado tenha acesso aos comandos do SOC.
 */
function isChatAuthorized(incomingChatId) {
  const configuredChatId = process.env.TELEGRAM_CHAT_ID;
  if (!configuredChatId || configuredChatId === 'undefined') {
    // Se não há CHAT_ID configurado no ambiente, recusa por segurança
    return false;
  }
  return String(incomingChatId) === String(configuredChatId);
}

/**
 * Endpoint de Recepção do Webhook do Telegram
 * Aceita tanto POST /webhook quanto POST /
 */
router.post(['/', '/webhook'], async (req, res) => {
  // Fast-Ack HTTP 200 para evitar que o Telegram reenvie a mesma mensagem
  res.status(200).json({ ok: true });

  const update = req.body;
  if (!update || typeof update !== 'object') {
    return;
  }

  // 1. Opcional: Validação de Secret Token do Webhook
  const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (webhookSecret && webhookSecret !== 'undefined') {
    const incomingSecret = req.headers['x-telegram-bot-api-secret-token'];
    if (incomingSecret !== webhookSecret) {
      console.warn('[TELEGRAM WEBHOOK WARN] Secret token inválido recebido.');
      return;
    }
  }

  try {
    // -----------------------------------------------------------
    // CASO A: Clique em Botão Inline (Callback Query)
    // -----------------------------------------------------------
    if (update.callback_query) {
      const cb = update.callback_query;
      const callbackId = cb.id;
      const data = cb.data || '';
      const chatId = cb.message?.chat?.id;
      const senderName = cb.from?.username ? `@${cb.from.username}` : (cb.from?.first_name || 'Operador');

      if (!isChatAuthorized(chatId)) {
        await answerTelegramCallbackQuery({
          callbackQueryId: callbackId,
          text: 'Acesso não autorizado ao SOC Athena.',
          showAlert: true
        });
        return;
      }

      if (data.startsWith('soc_ban:')) {
        const targetIp = data.replace('soc_ban:', '').trim();
        await answerTelegramCallbackQuery({
          callbackQueryId: callbackId,
          text: `Bloqueando IP ${targetIp}...`,
          showAlert: false
        });

        const banResult = await socService.banIp({
          ip: targetIp,
          reason: 'Bloqueio rápido via Botão de Alerta SOC',
          bannedBy: senderName
        });

        if (banResult.ok) {
          const dateStr = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
          await sendTelegramDirectMessage({
            chatId,
            text: `🛑 *[SOC ChatOps — IP Bloqueado]*\n\n• *IP:* \`${targetIp}\`\n• *Ação:* Bloqueado no firewall do gateway\n• *Operador:* ${senderName}\n• *Data:* \`${dateStr}\`\n\n_Todas as requisições deste IP agora são rejeitadas com HTTP 403._`
          });
        } else {
          await sendTelegramDirectMessage({
            chatId,
            text: `⚠️ *Falha ao bloquear IP:* ${banResult.error}`
          });
        }
        return;
      }

      if (data.startsWith('soc_whois:')) {
        const targetIp = data.replace('soc_whois:', '').trim();
        await answerTelegramCallbackQuery({
          callbackQueryId: callbackId,
          text: `Consultando Whois de ${targetIp}...`,
          showAlert: false
        });

        const whois = await socService.lookupWhois(targetIp);
        if (whois.ok) {
          const text = `🌐 *[SOC Whois & Geolocalização]*\n\n` +
            `• *IP:* \`${whois.ip}\`\n` +
            `• *País:* ${whois.country} (${whois.countryCode})\n` +
            `• *Região / Cidade:* ${whois.region} / ${whois.city}\n` +
            `• *ISP / Provedor:* ${whois.isp}\n` +
            `• *Organização:* ${whois.org}\n` +
            `• *ASN:* \`${whois.as}\`\n` +
            `• *Proxy / Hosting / VPN:* ${whois.isProxy ? '⚠️ SIM (Detectado)' : 'Não detectado'}`;

          await sendTelegramDirectMessage({ chatId, text });
        } else {
          await sendTelegramDirectMessage({
            chatId,
            text: `⚠️ *Whois indisponível para* \`${targetIp}\`: ${whois.error}`
          });
        }
        return;
      }
    }

    // -----------------------------------------------------------
    // CASO B: Mensagem de Texto com Comando
    // -----------------------------------------------------------
    if (update.message && update.message.text) {
      const msg = update.message;
      const text = msg.text.trim();
      const chatId = msg.chat?.id;
      const senderName = msg.from?.username ? `@${msg.from.username}` : (msg.from?.first_name || 'Operador');

      // Se a mensagem não começa com '/', ignora
      if (!text.startsWith('/')) {
        return;
      }

      // Validação de Chat ID
      if (!isChatAuthorized(chatId)) {
        console.warn(`[TELEGRAM SOC REJECTED] Chat ID não autorizado: ${chatId}`);
        return;
      }

      // Extrai comando e parâmetros (remove eventual sufixo @NomeDoBot)
      const parts = text.split(/\s+/);
      const rawCommand = parts[0].toLowerCase().split('@')[0];
      const args = parts.slice(1);

      // --- 1. AJUDA / START ---
      if (['/start', '/help', '/ajuda', '/comandos'].includes(rawCommand)) {
        const helpMessage = 
          `🛡️ *Athena OS — Central de Operações de Segurança (SOC)*\n\n` +
          `Bem-vindo ao ChatOps interativo de segurança e operações da Athena.\n\n` +
          `📌 *Comandos de Firewall:*\n` +
          `• \`/ban <ip> <motivo>\` : Bloqueia um IP suspeito no firewall com registro de motivo\n` +
          `• \`/unban <ip>\` ou \`/ban unblock <ip>\` : Desbloqueia um IP\n` +
          `• \`/ban lista\` ou \`/banlist\` : Lista os últimos IPs bloqueados com motivos\n\n` +
          `🔍 *Comandos de Investigação & Diagnóstico:*\n` +
          `• \`/whois <ip>\` : Investiga país, ISP, ASN e proxy de um IP suspeito\n` +
          `• \`/status\` ou \`/saude\` : Diagnóstico em tempo real (Postgres, Latência, RAM, Uptime)\n\n` +
          `📊 *Comandos de Negócio & Manutenção:*\n` +
          `• \`/pedidos\` ou \`/vendas\` : Resumo financeiro e de pedidos de hoje\n` +
          `• \`/limparlogs\` ou \`/faxina\` : Purga preventiva de logs antigos e tokens expirados\n` +
          `• \`/limpartestes\` : Remove com segurança pedidos e dados de teste\n` +
          `• \`/help\` ou \`/ajuda\` : Mostra esta mensagem de ajuda\n\n` +
          `_Dica: Alertas de invasão enviados a este canal possuem botões interativos de 1 clique para bloqueio imediato._`;

        await sendTelegramDirectMessage({ chatId, text: helpMessage });
        return;
      }

      // --- 2. BAN LISTA ---
      if (rawCommand === '/banlist' || (rawCommand === '/ban' && args[0]?.toLowerCase() === 'lista')) {
        const banned = await socService.listBannedIps({ limit: 15 });
        if (banned.length === 0) {
          await sendTelegramDirectMessage({
            chatId,
            text: `🛡️ *Nenhum IP bloqueado no momento.*\nO firewall da Athena está operando normalmente sem bloqueios ativos.`
          });
          return;
        }

        let reply = `🛑 *IPs Bloqueados no Firewall (${banned.length}):*\n\n`;
        banned.forEach((b, idx) => {
          reply += `${idx + 1}. \`${b.ip}\`\n`;
          reply += `   • *Motivo:* _${b.blocked_reason || 'Bloqueio preventivo'}_\n`;
          reply += `   • *Data:* \`${b.blocked_at_formatted}\`\n\n`;
        });
        reply += `_Para desbloquear um IP:_ \`/unban <ip>\``;

        await sendTelegramDirectMessage({ chatId, text: reply });
        return;
      }

      // --- 3. UNBAN ---
      if (rawCommand === '/unban' || (rawCommand === '/ban' && args[0]?.toLowerCase() === 'unblock')) {
        const targetIp = rawCommand === '/unban' ? args[0] : args[1];
        if (!targetIp) {
          await sendTelegramDirectMessage({
            chatId,
            text: `⚠️ *Uso incorreto!*\nInforme o IP que deseja desbloquear:\n\`/unban <ip>\` ou \`/ban unblock <ip>\`\nExemplo: \`/unban 185.220.101.5\``
          });
          return;
        }

        const unbanResult = await socService.unbanIp({
          ip: targetIp,
          unbannedBy: senderName
        });

        if (unbanResult.ok) {
          const dateStr = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
          await sendTelegramDirectMessage({
            chatId,
            text: `✅ *[SOC ChatOps — IP Desbloqueado]*\n\n• *IP:* \`${unbanResult.ip}\`\n• *Operador:* ${senderName}\n• *Data:* \`${dateStr}\`\n\n_O tráfego deste IP foi restabelecido normalmente._`
          });
        } else {
          await sendTelegramDirectMessage({
            chatId,
            text: `⚠️ *Falha ao desbloquear IP:* ${unbanResult.error}`
          });
        }
        return;
      }

      // --- 4. BAN COM MOTIVO ---
      if (rawCommand === '/ban') {
        const targetIp = args[0];
        const reason = args.slice(1).join(' ').trim();

        if (!targetIp) {
          await sendTelegramDirectMessage({
            chatId,
            text: `⚠️ *Como utilizar o comando /ban:*\n\nFormato: \`/ban <ip> <motivo>\`\nExemplo: \`/ban 45.33.32.156 Tentativa de força bruta no painel admin\`\n\n_Para consultar a lista de IPs banidos use:_ \`/ban lista\``
          });
          return;
        }

        // Se informou IP mas omitiu o motivo, orienta a fornecer o motivo
        if (!reason) {
          await sendTelegramDirectMessage({
            chatId,
            text: `⚠️ *Motivo do bloqueio obrigatório!*\nPara fins de auditoria e conformidade de segurança, especifique o motivo:\n\n\`/ban ${targetIp} <motivo do bloqueio>\`\n\nExemplo: \`/ban ${targetIp} Scanner de vulnerabilidades WP interceptado\``
          });
          return;
        }

        const banResult = await socService.banIp({
          ip: targetIp,
          reason,
          bannedBy: senderName
        });

        if (banResult.ok) {
          const dateStr = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
          await sendTelegramDirectMessage({
            chatId,
            text: `🛑 *[SOC ChatOps — IP Bloqueado]*\n\n• *IP:* \`${banResult.ip}\`\n• *Motivo:* ${reason}\n• *Operador:* ${senderName}\n• *Data:* \`${dateStr}\`\n\n_Bloqueio aplicado com sucesso no banco de dados e memória do firewall._`
          });
        } else {
          await sendTelegramDirectMessage({
            chatId,
            text: `⚠️ *Falha ao bloquear:* ${banResult.error}`
          });
        }
        return;
      }

      // --- 5. WHOIS ---
      if (rawCommand === '/whois') {
        const targetIp = args[0];
        if (!targetIp) {
          await sendTelegramDirectMessage({
            chatId,
            text: `⚠️ *Uso incorreto!*\nInforme o IP para investigação:\n\`/whois <ip>\`\nExemplo: \`/whois 185.220.101.5\``
          });
          return;
        }

        const whois = await socService.lookupWhois(targetIp);
        if (whois.ok) {
          const text = `🌐 *[SOC Whois & Geolocalização]*\n\n` +
            `• *IP:* \`${whois.ip}\`\n` +
            `• *País:* ${whois.country} (${whois.countryCode})\n` +
            `• *Região / Cidade:* ${whois.region} / ${whois.city}\n` +
            `• *ISP / Provedor:* ${whois.isp}\n` +
            `• *Organização:* ${whois.org}\n` +
            `• *ASN:* \`${whois.as}\`\n` +
            `• *Proxy / Hosting / VPN:* ${whois.isProxy ? '⚠️ SIM (Detectado)' : 'Não detectado'}`;

          await sendTelegramDirectMessage({
            chatId,
            text,
            replyMarkup: {
              inline_keyboard: [
                [
                  { text: `🛑 Bloquear ${whois.ip}`, callback_data: `soc_ban:${whois.ip}` }
                ]
              ]
            }
          });
        } else {
          await sendTelegramDirectMessage({
            chatId,
            text: `⚠️ *Erro na consulta Whois para* \`${targetIp}\`: ${whois.error}`
          });
        }
        return;
      }

      // --- 6. STATUS / SAÚDE DO SISTEMA ---
      if (['/status', '/saude', '/health'].includes(rawCommand)) {
        const status = await socService.getSystemStatus();
        const text = 
          `🛡️ *[Athena OS — Diagnóstico de Saúde]*\n\n` +
          `• *PostgreSQL:* ${status.dbOk ? `🟢 Conectado (\`${status.dbLatencyMs}ms\`)` : '🔴 Desconectado / Falha'}\n` +
          `• *Tempo de Atividade (Uptime):* \`${status.uptime}\`\n` +
          `• *Memória RAM (RSS):* \`${status.memoryRssMb} MB\`\n` +
          `• *Memória Heap Usada:* \`${status.memoryHeapMb} MB\`\n` +
          `• *IPs Bloqueados Ativos:* \`${status.blockedIpsCount}\`\n` +
          `• *Ambiente:* \`${status.nodeEnv}\`\n` +
          `• *Status Geral:* ${status.healthy ? '✅ Todos os serviços operacionais' : '⚠️ Atenção requerida'}`;

        await sendTelegramDirectMessage({ chatId, text });
        return;
      }

      // --- 7. PEDIDOS / VENDAS DO DIA ---
      if (['/pedidos', '/vendas', '/faturamento'].includes(rawCommand)) {
        const summary = await socService.getTodayOrdersSummary();
        const dateStr = new Date().toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });

        const text = 
          `📊 *[Athena OS — Resumo Comercial do Dia]*\n` +
          `📅 *Data:* \`${dateStr}\`\n\n` +
          `• *Total de Pedidos:* \`${summary.totalCount}\`\n` +
          `• *Faturamento Geral:* \`R$ ${summary.totalRevenueFormatted}\`\n` +
          `• *Pagos / Aprovados:* \`${summary.paidCount}\` (\`R$ ${summary.paidRevenueFormatted}\`)\n` +
          `• *Aguardando Pagamento:* \`${summary.pendingCount}\`\n` +
          `• *Cancelados / Falhos:* \`${summary.failedCount}\``;

        await sendTelegramDirectMessage({ chatId, text });
        return;
      }

      // --- 8. LIMPAR TESTES ---
      if (['/limpartestes', '/cleanuptests'].includes(rawCommand)) {
        const result = await socService.cleanupTestOrders(senderName);
        if (result.ok) {
          await sendTelegramDirectMessage({
            chatId,
            text: `🧹 *[SOC Manutenção — Limpeza Concluída]*\n\n${result.deletedCount} pedido(s) de teste e registros associados foram removidos da base com sucesso por ${senderName}.`
          });
        } else {
          await sendTelegramDirectMessage({
            chatId,
            text: `⚠️ *Falha ao limpar pedidos de teste:* ${result.error}`
          });
        }
        return;
      }

      // --- 9. LIMPEZA PREVENTIVA DE LOGS (HOUSEKEEPING) ---
      if (['/limparlogs', '/faxina', '/housekeeping', '/purga'].includes(rawCommand)) {
        const result = await socService.runHousekeepingCleanup(senderName);
        if (result.ok) {
          const text = 
            `🧹 *[Athena OS — Housekeeping & Retenção de Dados]*\n\n` +
            `Limpeza preventiva executada com sucesso por ${senderName}!\n\n` +
            `• *Logs de Auditoria Expurgados:* \`${result.auditLogsDeleted}\`\n` +
            `• *Tokens Expirados Limpos:* \`${result.tokensDeleted}\`\n` +
            `• *Reservas Antigas Descartadas:* \`${result.reservationsDeleted}\`\n` +
            `• *IPs Desbloqueados Prunados:* \`${result.unblockedIpsPruned}\`\n` +
            `• *Eventos Órfãos Removidos:* \`${result.orphanedEventsDeleted}\`\n` +
            `━━━━━━━━━━━━━━━━━━━━━\n` +
            `✨ *Total de Registros Limpos:* \`${result.totalDeleted}\`\n` +
            `_O banco de dados PostgreSQL permanece leve e otimizado._`;

          await sendTelegramDirectMessage({ chatId, text });
        } else {
          await sendTelegramDirectMessage({
            chatId,
            text: `⚠️ *Falha ao executar limpeza de logs:* ${result.error}`
          });
        }
        return;
      }

      // Comando desconhecido
      await sendTelegramDirectMessage({
        chatId,
        text: `❓ Comando \`${rawCommand}\` não reconhecido.\nEnvie \`/help\` ou \`/ajuda\` para consultar os comandos disponíveis do SOC.`
      });
    }
  } catch (err) {
    console.error('[TELEGRAM WEBHOOK PROCESSING ERROR]:', err);
  }
});

module.exports = router;
