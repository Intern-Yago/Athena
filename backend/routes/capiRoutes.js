/**
 * capiRoutes.js
 *
 * Server-Side Telemetry Gateway: Meta Conversions API (CAPI) + TikTok Events API (v1.3).
 *
 * Envia eventos de conversão e navegação diretamente do servidor Node.js para:
 * 1. Graph API da Meta (v19.0) nos dois Datasets (`2181846082544846` e `2198770257418355`).
 * 2. TikTok Events API (`/open_api/v1.3/event/track/`) no Pixel (`DBCEG2JC77UASCMGEM1G`).
 *
 * Contorna bloqueadores de anúncio (AdBlock / ITP Safari) e realiza desduplicação nativa
 * com o navegador via `event_id`.
 * Todos os tokens de acesso vêm estritamente de variáveis de ambiente (`.env`).
 */

const express = require('express');
const crypto = require('crypto');
const axios = require('axios');

const router = express.Router();

const DEFAULT_META_DATASET_IDS = ['2181846082544846', '2198770257418355'];
const DEFAULT_TIKTOK_PIXEL_ID = 'DBCEG2JC77UASCMGEM1G';

function sha256Hash(value) {
  if (!value) return undefined;
  const clean = String(value).trim().toLowerCase();
  if (!clean) return undefined;
  return crypto.createHash('sha256').update(clean).digest('hex');
}

/**
 * POST /api/analytics/capi
 * Recebe o evento do frontend e retransmite via Server-Side para Meta CAPI e TikTok Events API.
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
      ttp,
      ttclid,
      testEventCode
    } = req.body || {};

    if (!eventName) {
      return res.status(400).json({ ok: false, error: 'eventName é obrigatório.' });
    }

    // Responde imediatamente ao navegador (202 Accepted) para zero impacto na latência do cliente
    res.status(202).json({ ok: true, eventId });

    const rawIp =
      req.headers['cf-connecting-ip'] ||
      (req.headers['x-forwarded-for'] ? String(req.headers['x-forwarded-for']).split(',')[0].trim() : '') ||
      req.socket?.remoteAddress ||
      '';
    const userAgent = req.headers['user-agent'] || '';
    const finalEventId = eventId || `evt_${Date.now()}`;
    const finalUrl = eventSourceUrl || 'https://www.athenaconsultoria.com.br/';
    const eventTimeSec = Math.floor(Date.now() / 1000);

    const hashedEmail = userData.email ? sha256Hash(userData.email) : undefined;
    const hashedPhone = userData.phone ? sha256Hash(String(userData.phone).replace(/\D/g, '')) : undefined;
    const hashedExternalId = userData.userId ? sha256Hash(userData.userId) : undefined;

    const tasks = [];

    // =========================================================================
    // 1. DISPARO META CONVERSIONS API (CAPI) - 2 DATASETS
    // =========================================================================
    const primaryMetaToken =
      process.env.META_CAPI_ACCESS_TOKEN ||
      process.env.META_CAPI_TOKEN ||
      process.env.FACEBOOK_CAPI_TOKEN ||
      '';
    const secondaryMetaToken = process.env.META_CAPI_TOKEN_SECONDARY || primaryMetaToken;

    if (primaryMetaToken) {
      const metaUserPayload = {
        client_ip_address: rawIp || undefined,
        client_user_agent: userAgent || undefined,
        fbp: fbp || undefined,
        fbc: fbc || undefined,
        em: hashedEmail ? [hashedEmail] : undefined,
        ph: hashedPhone ? [hashedPhone] : undefined,
        external_id: hashedExternalId ? [hashedExternalId] : undefined,
        country: [sha256Hash('br')]
      };

      Object.keys(metaUserPayload).forEach(k => {
        if (metaUserPayload[k] === undefined) delete metaUserPayload[k];
      });

      const metaEventPayload = {
        event_name: eventName,
        event_time: eventTimeSec,
        event_id: finalEventId,
        action_source: 'website',
        event_source_url: finalUrl,
        user_data: metaUserPayload,
        custom_data: customData
      };

      const metaTargets = [
        { datasetId: DEFAULT_META_DATASET_IDS[0], token: primaryMetaToken },
        { datasetId: DEFAULT_META_DATASET_IDS[1], token: secondaryMetaToken }
      ].filter(t => Boolean(t.token));

      metaTargets.forEach(({ datasetId, token }) => {
        const body = {
          data: [metaEventPayload],
          ...(testEventCode ? { test_event_code: testEventCode } : {})
        };
        tasks.push(
          axios.post(
            `https://graph.facebook.com/v19.0/${datasetId}/events?access_token=${encodeURIComponent(token)}`,
            body,
            { timeout: 6000 }
          )
        );
      });
    }

    // =========================================================================
    // 2. DISPARO TIKTOK EVENTS API (v1.3)
    // =========================================================================
    const tiktokToken = process.env.TIKTOK_EVENTS_API_TOKEN || '';
    const tiktokPixelCode = process.env.TIKTOK_PIXEL_ID || DEFAULT_TIKTOK_PIXEL_ID;

    if (tiktokToken && tiktokPixelCode) {
      const ttEventName = eventName === 'Lead' ? 'SubmitForm' : eventName;
      const contentIds = Array.isArray(customData.content_ids) ? customData.content_ids : [];
      const primaryId = String(
        contentIds[0] || customData.product_id || customData.sku || customData.category_id || customData.brand_id || 'athena_catalog'
      );
      const primaryName = String(
        customData.content_name || customData.product_name || customData.category_name || customData.brand_name || 'Catálogo Athena'
      );
      const itemValue = Number(customData.value || customData.shipping_price || 1.0);
      const qty = Number(customData.quantity || customData.num_items || 1);

      const ttUser = {
        ...(hashedEmail ? { email: hashedEmail } : {}),
        ...(hashedPhone ? { phone: hashedPhone } : {}),
        ...(hashedExternalId ? { external_id: hashedExternalId } : {}),
        ...(rawIp ? { ip: rawIp } : {}),
        ...(userAgent ? { user_agent: userAgent } : {}),
        ...(ttp ? { ttp } : {}),
        ...(ttclid ? { ttclid } : {})
      };

      const ttProperties = {
        content_type: customData.content_type || 'product',
        currency: customData.currency || 'BRL',
        value: itemValue,
        description: customData.descricao || primaryName,
        ...(eventName === 'Search' ? { query: customData.search_string || '' } : {}),
        contents: [
          {
            content_id: primaryId,
            content_type: customData.content_type || 'product',
            content_name: primaryName,
            content_category: customData.content_category || customData.secao || 'Equipamentos Automotivos',
            brand: customData.brand_name || 'Athena',
            price: itemValue,
            quantity: qty
          }
        ]
      };

      const tiktokBody = {
        event_source: 'web',
        event_source_id: tiktokPixelCode,
        data: [
          {
            event: ttEventName,
            event_time: eventTimeSec,
            event_id: finalEventId,
            user: ttUser,
            page: {
              url: finalUrl
            },
            properties: ttProperties
          }
        ]
      };

      tasks.push(
        axios.post('https://business-api.tiktok.com/open_api/v1.3/event/track/', tiktokBody, {
          headers: {
            'Access-Token': tiktokToken,
            'Content-Type': 'application/json'
          },
          timeout: 6000
        })
      );
    }

    if (tasks.length > 0) {
      await Promise.allSettled(tasks);
    }
  } catch (err) {
    console.warn('[Server CAPI Warning]:', err.message);
  }
});

module.exports = router;
