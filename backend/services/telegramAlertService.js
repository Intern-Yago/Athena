/**
 * telegramAlertService.js
 *
 * Athena OS v2.1 — Central Inteligente de Alertas e Notificações no Telegram
 *
 * Classificação de Gravidade com Proteção Anti-Fadiga (Anti-Alert Fatigue):
 * 1. CRITICAL: Sistema fora do ar, banco indisponível, tentativa de fraude financeira.
 *    -> Notificação instantânea com som ativo (disable_notification: false).
 * 2. WARNING: Degradação parcial, APIs terceiras oscilando, força bruta, pedidos de alto valor.
 *    -> Notificação silenciosa (disable_notification: true) com cooldown e agrupamento de 15 min.
 * 3. INFO: Ruído comum de web (404, erro de digitação de CEP, etc.).
 *    -> Registrado apenas no banco / log, NÃO polui o Telegram.
 */

const axios = require('axios');

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// Mapa de Cooldown em memória para prevenir flood e agrupamento
const alertCooldownMap = new Map();
const alertCounters = new Map();

/**
 * Verifica se um alerta específico está dentro da janela de cooldown.
 * Se estiver, incrementa o contador de ocorrências agrupadas.
 */
function checkAndThrottleAlert(key, cooldownMinutes) {
  const now = Date.now();
  const entry = alertCooldownMap.get(key);
  const cooldownMs = cooldownMinutes * 60 * 1000;

  if (entry && (now - entry.timestamp) < cooldownMs) {
    const currentCount = (alertCounters.get(key) || 1) + 1;
    alertCounters.set(key, currentCount);
    return { shouldSend: false, count: currentCount };
  }

  const accumulatedCount = alertCounters.get(key) || 1;
  alertCooldownMap.set(key, { timestamp: now });
  alertCounters.set(key, 1);

  return { shouldSend: true, count: accumulatedCount };
}

/**
 * Envia uma mensagem formatada via Telegram Bot API
 *
 * @param {Object} options
 * @param {'CRITICAL'|'WARNING'|'INFO'} options.level
 * @param {string} options.title
 * @param {string} options.message
 * @param {Object} [options.fields]
 * @param {string} [options.dedupKey]
 * @param {number} [options.cooldownMinutes]
 * @returns {Promise<{ ok: boolean, skipped?: boolean, reason?: string }>}
 */
async function sendTelegramAlert({
  level = 'WARNING',
  title,
  message,
  fields = {},
  dedupKey = null,
  cooldownMinutes = null
}) {
  const normLevel = String(level).toUpperCase();

  // Nível INFO não vai para o Telegram para evitar fadiga de alertas
  if (normLevel === 'INFO') {
    return { ok: true, skipped: true, reason: 'Level INFO is filtered out to prevent alert fatigue' };
  }

  const token = process.env.TELEGRAM_BOT_TOKEN || TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID || TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[TELEGRAM ALERT DRY-RUN] [${normLevel}] ${title}: ${message}`);
    }
    return { ok: true, skipped: true, reason: 'TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not configured' };
  }

  // Define cooldown padrão baseado no nível de gravidade
  const effectiveCooldown = cooldownMinutes !== null 
    ? cooldownMinutes 
    : (normLevel === 'CRITICAL' ? 5 : 15);

  const throttleKey = dedupKey || `${normLevel}_${title}`;
  const throttle = checkAndThrottleAlert(throttleKey, effectiveCooldown);

  if (!throttle.shouldSend) {
    return { ok: true, throttled: true, accumulatedCount: throttle.count };
  }

  // Ícones e cabeçalhos visuais
  let icon = '⚠️';
  let levelBadge = 'AVISO / ATENÇÃO';
  let disableSound = true;

  if (normLevel === 'CRITICAL') {
    icon = '🚨';
    levelBadge = 'CRÍTICO — AÇÃO IMEDIATA';
    disableSound = false; // Toca som alto no celular
  }

  const dateStr = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });

  let text = `${icon} *[${levelBadge}]*\n`;
  text += `*${title}*\n\n`;
  text += `${message}\n\n`;

  // Se houve ocorrências agrupadas no cooldown anterior
  if (throttle.count > 1) {
    text += `🔁 *Ocorrências acumuladas:* ${throttle.count} vezes na última janela.\n`;
  }

  // Metadados adicionais
  const fieldKeys = Object.keys(fields);
  if (fieldKeys.length > 0) {
    text += `━━━━━━━━━━━━━━━━━━━━━\n`;
    for (const k of fieldKeys) {
      const val = fields[k];
      if (val !== undefined && val !== null && val !== '') {
        text += `• *${k}:* \`${String(val).replace(/[`*]/g, '')}\`\n`;
      }
    }
  }

  text += `━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `🕒 *Data:* \`${dateStr}\`\n`;
  text += `🌐 *Ambiente:* \`${process.env.NODE_ENV || 'production'}\` (Athena OS)`;

  try {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const res = await axios.post(
      url,
      {
        chat_id: chatId,
        text,
        parse_mode: 'Markdown',
        disable_notification: disableSound
      },
      { timeout: 5000 }
    );

    return { ok: true, messageId: res.data?.result?.message_id };
  } catch (err) {
    console.warn('[TELEGRAM ALERT DISPATCH WARN]:', err.response?.data?.description || err.message);
    return { ok: false, error: err.message };
  }
}

/**
 * Alerta de Queda de Sistema ou Banco de Dados (Nível 1 - CRÍTICO)
 */
async function notifySystemOutage(error, context = 'Servidor / Banco de Dados') {
  return sendTelegramAlert({
    level: 'CRITICAL',
    title: 'FALHA DE DISPONIBILIDADE DO SISTEMA',
    message: 'Uma falha grave afetou o funcionamento central da aplicação.',
    fields: {
      'Componente': context,
      'Erro': error.message || error,
      'Código': error.code || 'ERR_UNKNOWN'
    },
    dedupKey: `outage_${error.code || error.message || context}`,
    cooldownMinutes: 5
  });
}

/**
 * Alerta de Fraude ou Incidente de Segurança (Nível 1 ou 2)
 */
async function notifySecurityIncident({
  eventType,
  severity = 'high',
  actor = null,
  reason = null,
  ip = null,
  details = {}
}) {
  const isCritical = severity === 'critical';
  return sendTelegramAlert({
    level: isCritical ? 'CRITICAL' : 'WARNING',
    title: `INCIDENTE DE SEGURANÇA: ${eventType}`,
    message: reason || 'Uma ação suspeita ou não autorizada foi bloqueada pelas travas de segurança.',
    fields: {
      'Severidade': severity.toUpperCase(),
      'Ator': actor || 'Não identificado',
      'IP': ip || 'Desconhecido',
      ...details
    },
    dedupKey: `sec_${eventType}_${ip || actor}`,
    cooldownMinutes: isCritical ? 5 : 15
  });
}

/**
 * Alerta de Pedido de Alto Valor ou Suspeito para Conferência Humana
 */
async function notifyHighValueOrder(order) {
  const amount = Number(order.total_amount || 0);
  if (amount < 10000 && order.order_type !== 'points_redemption') {
    return { ok: true, skipped: true };
  }

  return sendTelegramAlert({
    level: 'WARNING',
    title: 'NOVA VENDA DE ALTO VALOR — CONFERÊNCIA SUGERIDA',
    message: 'Um pedido de montante elevado foi iniciado. Recomendada conferência cadastral antes da expedição.',
    fields: {
      'Pedido': `#${order.order_number || order.id?.slice(0, 8)}`,
      'Valor': `R$ ${amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      'Cliente': order.user_name || order.customer_snapshot?.name || 'Cliente Athena',
      'Origem': order._origin?.label || 'Site Athena'
    },
    dedupKey: `high_order_${order.id}`,
    cooldownMinutes: 60
  });
}

/**
 * Testa a conexão com o Telegram disparando um ping de validação
 */
async function testTelegramConnection() {
  const token = process.env.TELEGRAM_BOT_TOKEN || TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID || TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return {
      success: false,
      configured: false,
      message: 'TELEGRAM_BOT_TOKEN ou TELEGRAM_CHAT_ID não estão configurados no ambiente.'
    };
  }

  try {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const res = await axios.post(
      url,
      {
        chat_id: chatId,
        text: '🛡️ *[Athena OS — Teste de Notificações]*\n\nConexão com o bot do Telegram estabelecida com sucesso! Este canal receberá alertas inteligentes de segurança e integridade do sistema.',
        parse_mode: 'Markdown',
        disable_notification: false
      },
      { timeout: 6000 }
    );

    return {
      success: true,
      configured: true,
      message: 'Mensagem de teste enviada com sucesso ao canal do Telegram!',
      messageId: res.data?.result?.message_id
    };
  } catch (err) {
    return {
      success: false,
      configured: true,
      error: err.response?.data?.description || err.message
    };
  }
}

module.exports = {
  sendTelegramAlert,
  notifySystemOutage,
  notifySecurityIncident,
  notifyHighValueOrder,
  testTelegramConnection
};
