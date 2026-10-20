/**
 * capiRoutes.js
 *
 * Meta Conversions API (CAPI) Server-Side Telemetry Endpoint.
 * Envia eventos de conversão e navegação diretamente do servidor Node.js para
 * o Graph API da Meta (v19.0), contornando bloqueadores de anúncio (AdBlock / ITP Safari)
 * e realizando desduplicação nativa com o Pixel do navegador via `event_id`.
 *
 * Suporta envio simultâneo para os dois Conjuntos de Dados (Datasets) da Athena:
 * - 2181846082544846 (Dataset Principal / Catálogo)
 * - 2198770257418355 (Dataset Secundário)
 */

const express = require('express');
const crypto = require('crypto');
const axios = require('axios');

const router = express.Router();

const DEFAULT_DATASET_IDS = ['2181846082544846', '2198770257418355'];

function sha256Hash(value) {
  if (!value) return undefined;
  const clean = String(value).trim().toLowerCase();
  if (!clean) return undefined;
  return crypto.createHash('sha256').update(clean).digest('hex');
}

/**
 * POST /api/analytics/capi
 * Recebe o evento do frontend e retransmite via Server-Side para a API de Conversões da Meta.
 */
router.post('/capi', async (req, res) => {
  try {
    const {
      eventName,
      eventId,
      eventSourceUrl,
      customData = {},
      userData = {},
      fbp,
      fbc,
      testEventCode
    } = req.body || {};

    if (!eventName) {
      return res.status(400).json({ ok: false, error: 'eventName é obrigatório.' });
    }

    // Responde imediatamente ao navegador (202 Accepted) para zero impacto na latência do cliente
    res.status(202).json({ ok: true, eventId });

    // Coleta tokens configurados no ambiente (suporta token único ou tokens por dataset)
    const primaryToken = process.env.META_CAPI_TOKEN || process.env.FACEBOOK_CAPI_TOKEN || '';
    const secondaryToken = process.env.META_CAPI_TOKEN_SECONDARY || primaryToken;

    if (!primaryToken) {
      // Sem token configurado no .env ainda: ignora silenciosamente no servidor
      return;
    }

    const rawIp =
      req.headers['cf-connecting-ip'] ||
      (req.headers['x-forwarded-for'] ? String(req.headers['x-forwarded-for']).split(',')[0].trim() : '') ||
      req.socket?.remoteAddress ||
      '';
    const userAgent = req.headers['user-agent'] || '';

    const userPayload = {
      client_ip_address: rawIp || undefined,
      client_user_agent: userAgent || undefined,
      fbp: fbp || undefined,
      fbc: fbc || undefined,
      em: userData.email ? [sha256Hash(userData.email)] : undefined,
      ph: userData.phone ? [sha256Hash(String(userData.phone).replace(/\D/g, ''))] : undefined,
      external_id: userData.userId ? [sha256Hash(userData.userId)] : undefined,
      country: [sha256Hash('br')]
    };

    // Remove chaves undefined
    Object.keys(userPayload).forEach(k => {
      if (userPayload[k] === undefined) delete userPayload[k];
    });

    const eventPayload = {
      event_name: eventName,
      event_time: Math.floor(Date.now() / 1000),
      event_id: eventId || `evt_${Date.now()}`,
      action_source: 'website',
      event_source_url: eventSourceUrl || 'https://www.athenaconsultoria.com.br/',
      user_data: userPayload,
      custom_data: customData
    };

    const targets = [
      { datasetId: DEFAULT_DATASET_IDS[0], token: primaryToken },
      { datasetId: DEFAULT_DATASET_IDS[1], token: secondaryToken }
    ].filter(t => Boolean(t.token));

    await Promise.allSettled(
      targets.map(({ datasetId, token }) => {
        const body = {
          data: [eventPayload],
          ...(testEventCode ? { test_event_code: testEventCode } : {})
        };
        return axios.post(
          `https://graph.facebook.com/v19.0/${datasetId}/events?access_token=${encodeURIComponent(token)}`,
          body,
          { timeout: 6000 }
        );
      })
    );
  } catch (err) {
    console.warn('[Meta CAPI Warning]:', err.message);
  }
});

module.exports = router;
