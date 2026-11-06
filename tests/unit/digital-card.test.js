import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  DIGITAL_CARD_CONFIG,
  isDigitalCardSubdomain,
  getDigitalCardProfile,
  buildVCardContent,
} from '../../src/config/digitalCardConfig.js';

describe('Athena NFC Digital Card Configuration & Routing', () => {
  it('should point to the existing transparent official logo in public/logo_semfundo.png', () => {
    assert.strictEqual(DIGITAL_CARD_CONFIG.logoUrl, '/logo_semfundo.png');
    const logoFilePath = path.resolve(process.cwd(), 'public', 'logo_semfundo.png');
    assert.strictEqual(fs.existsSync(logoFilePath), true, 'public/logo_semfundo.png must exist');
  });

  it('should configure official website and Instagram destinations', () => {
    assert.strictEqual(DIGITAL_CARD_CONFIG.websiteUrl, 'https://www.athenaconsultoria.com.br/');
    assert.strictEqual(
      DIGITAL_CARD_CONFIG.instagramUrl,
      'https://www.instagram.com/athena.solucoes.automotivas/'
    );
  });

  it('should properly format and URL-encode Commercial (Lidiane) and Technical Support (Henrique) WhatsApp links with DDD 61', () => {
    assert.strictEqual(DIGITAL_CARD_CONFIG.commercialWhatsAppNumber, '5561983485671');
    assert.strictEqual(DIGITAL_CARD_CONFIG.technicalSupportWhatsAppNumber, '5561984884099');

    assert.ok(
      DIGITAL_CARD_CONFIG.commercialWhatsAppUrl.startsWith('https://wa.me/5561983485671?text='),
      'Commercial WhatsApp URL must use https://wa.me/5561983485671'
    );
    assert.ok(
      DIGITAL_CARD_CONFIG.technicalSupportWhatsAppUrl.startsWith('https://wa.me/5561984884099?text='),
      'Technical Support WhatsApp URL must use https://wa.me/5561984884099'
    );

    const commercialUrlObj = new URL(DIGITAL_CARD_CONFIG.commercialWhatsAppUrl);
    assert.strictEqual(
      commercialUrlObj.searchParams.get('text'),
      'Olá! Conheci a Athena pelo cartão digital e gostaria de informações sobre seus produtos e soluções.'
    );

    const supportUrlObj = new URL(DIGITAL_CARD_CONFIG.technicalSupportWhatsAppUrl);
    assert.strictEqual(
      supportUrlObj.searchParams.get('text'),
      'Olá, Henrique! Acessei o cartão digital da Athena e preciso de suporte técnico.'
    );
  });

  it('should strictly activate only on cartao.athenaconsultoria.com.br subdomain (or localhost ?cartao=1)', () => {
    assert.strictEqual(isDigitalCardSubdomain('cartao.athenaconsultoria.com.br'), true);
    assert.strictEqual(isDigitalCardSubdomain('CARTAO.athenaconsultoria.com.br'), true);
    assert.strictEqual(isDigitalCardSubdomain('www.athenaconsultoria.com.br'), false);
    assert.strictEqual(isDigitalCardSubdomain('athenaconsultoria.com.br'), false);
    assert.strictEqual(isDigitalCardSubdomain('localhost', ''), false);
    assert.strictEqual(isDigitalCardSubdomain('localhost', '?cartao=1'), true);
  });

  it('should bundle both separate contacts (Lidiane + Henrique) on root path and single contacts on /lidiane and /henrique', () => {
    const defaultProfile = getDigitalCardProfile('/');
    assert.strictEqual(defaultProfile.key, 'default');
    assert.strictEqual(defaultProfile.buttonLabel, 'Salvar Contatos na Agenda');

    const multiVcf = buildVCardContent(defaultProfile);
    const vcardCount = (multiVcf.match(/BEGIN:VCARD/g) || []).length;
    assert.strictEqual(vcardCount, 2, 'Default vCard must contain 2 separate VCARD blocks');
    assert.ok(multiVcf.includes('FN:Lidiane - Athena Consultoria Automotiva'));
    assert.ok(multiVcf.includes('+5561983485671'));
    assert.ok(multiVcf.includes('FN:Henrique - Athena Suporte Técnico'));
    assert.ok(multiVcf.includes('+5561984884099'));

    const lidianeProfile = getDigitalCardProfile('/lidiane');
    assert.strictEqual(lidianeProfile.key, 'lidiane');
    assert.strictEqual(lidianeProfile.buttonLabel, 'Salvar Contato — Lidiane');
    const lidianeVcf = buildVCardContent(lidianeProfile);
    assert.strictEqual((lidianeVcf.match(/BEGIN:VCARD/g) || []).length, 1);
    assert.ok(lidianeVcf.includes('FN:Lidiane - Athena Consultoria Automotiva'));
    assert.ok(lidianeVcf.includes('+5561983485671'));
    assert.ok(!lidianeVcf.includes('+5561984884099'));

    const henriqueProfile = getDigitalCardProfile('/henrique');
    assert.strictEqual(henriqueProfile.key, 'henrique');
    assert.strictEqual(henriqueProfile.buttonLabel, 'Salvar Contato — Henrique');
    const henriqueVcf = buildVCardContent(henriqueProfile);
    assert.strictEqual((henriqueVcf.match(/BEGIN:VCARD/g) || []).length, 1);
    assert.ok(henriqueVcf.includes('FN:Henrique - Athena Suporte Técnico'));
    assert.ok(henriqueVcf.includes('+5561984884099'));
    assert.ok(!henriqueVcf.includes('+5561983485671'));
  });
});
