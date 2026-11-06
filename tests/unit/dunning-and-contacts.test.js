/**
 * dunning-and-contacts.test.js
 *
 * Suíte de Testes Unitários — Athena OS v2.1
 * Validação da Régua de Cobrança / Dunning Engine (D0, D1, D15, D30 e 30d+)
 * e Sanitização de Links Telefônicos (Click-to-Call e WhatsApp).
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateDunningMilestone,
  buildContactLinks
} from '../../src/utils/orderUtils.js';

describe('Dunning Engine: Régua de Cobrança e Notificações (1, 15, 30 e 30d+)', () => {
  const BASE_TIME = new Date('2026-10-22T12:00:00.000Z').getTime();
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;

  it('D0: Deve classificar pedido feito hoje como "Iniciado hoje" sem alerta ativo', () => {
    const today = new Date(BASE_TIME);
    const result = calculateDunningMilestone(today, BASE_TIME);

    assert.strictEqual(result.diffDays, 0);
    assert.strictEqual(result.isMilestone, false);
    assert.strictEqual(result.milestone, null);
    assert.strictEqual(result.label, 'Iniciado hoje');
    assert.strictEqual(result.nextMilestoneDay, 1);
    assert.strictEqual(result.daysUntilNext, 1);
  });

  it('D1: Deve ativar o marco da Régua D1 no 1º dia após a compra', () => {
    const d1Date = new Date(BASE_TIME - (1 * ONE_DAY_MS));
    const result = calculateDunningMilestone(d1Date, BASE_TIME);

    assert.strictEqual(result.diffDays, 1);
    assert.strictEqual(result.isMilestone, true);
    assert.strictEqual(result.milestone, 'D1');
    assert.strictEqual(result.label, 'Há 1 dia (Régua D1)');
    assert.match(result.milestoneText, /Lembrete D1/);
    assert.strictEqual(result.nextMilestoneDay, 15);
    assert.strictEqual(result.daysUntilNext, 14);
  });

  it('Dias intermediários (ex: 7 dias): Não deve disparar alerta de marco, apontando próximo para D15', () => {
    const d7Date = new Date(BASE_TIME - (7 * ONE_DAY_MS));
    const result = calculateDunningMilestone(d7Date, BASE_TIME);

    assert.strictEqual(result.diffDays, 7);
    assert.strictEqual(result.isMilestone, false);
    assert.strictEqual(result.milestone, null);
    assert.strictEqual(result.label, 'Há 7 dias');
    assert.strictEqual(result.nextMilestoneDay, 15);
    assert.strictEqual(result.daysUntilNext, 8);
  });

  it('D15: Deve ativar o marco da Régua D15 no 15º dia após a compra', () => {
    const d15Date = new Date(BASE_TIME - (15 * ONE_DAY_MS));
    const result = calculateDunningMilestone(d15Date, BASE_TIME);

    assert.strictEqual(result.diffDays, 15);
    assert.strictEqual(result.isMilestone, true);
    assert.strictEqual(result.milestone, 'D15');
    assert.strictEqual(result.label, 'Há 15 dias (Régua D15)');
    assert.match(result.milestoneText, /Lembrete D15/);
    assert.strictEqual(result.nextMilestoneDay, 30);
    assert.strictEqual(result.daysUntilNext, 15);
  });

  it('D30: Deve ativar o marco da Régua D30 no 30º dia após a compra', () => {
    const d30Date = new Date(BASE_TIME - (30 * ONE_DAY_MS));
    const result = calculateDunningMilestone(d30Date, BASE_TIME);

    assert.strictEqual(result.diffDays, 30);
    assert.strictEqual(result.isMilestone, true);
    assert.strictEqual(result.milestone, 'D30');
    assert.strictEqual(result.label, 'Há 30 dias (Régua D30)');
    assert.match(result.milestoneText, /Lembrete D30/);
    assert.strictEqual(result.nextMilestoneDay, 60);
    assert.strictEqual(result.daysUntilNext, 30);
  });

  it('Ciclos Recorrentes de 30 dias: Deve ativar D60 (2º mês), D90 (3º mês) e D120 (4º mês)', () => {
    const d60Result = calculateDunningMilestone(new Date(BASE_TIME - (60 * ONE_DAY_MS)), BASE_TIME);
    assert.strictEqual(d60Result.diffDays, 60);
    assert.strictEqual(d60Result.isMilestone, true);
    assert.strictEqual(d60Result.milestone, 'D60');
    assert.strictEqual(d60Result.label, 'Há 60 dias (2º mês)');
    assert.strictEqual(d60Result.nextMilestoneDay, 90);

    const d90Result = calculateDunningMilestone(new Date(BASE_TIME - (90 * ONE_DAY_MS)), BASE_TIME);
    assert.strictEqual(d90Result.diffDays, 90);
    assert.strictEqual(d90Result.isMilestone, true);
    assert.strictEqual(d90Result.milestone, 'D90');
    assert.strictEqual(d90Result.label, 'Há 90 dias (3º mês)');
    assert.strictEqual(d90Result.nextMilestoneDay, 120);

    const d120Result = calculateDunningMilestone(new Date(BASE_TIME - (120 * ONE_DAY_MS)), BASE_TIME);
    assert.strictEqual(d120Result.diffDays, 120);
    assert.strictEqual(d120Result.isMilestone, true);
    assert.strictEqual(d120Result.milestone, 'D120');
    assert.strictEqual(d120Result.label, 'Há 120 dias (4º mês)');
    assert.strictEqual(d120Result.nextMilestoneDay, 150);
  });

  it('Resiliência: Deve tratar datas nulas, vazias ou inválidas com fallback seguro', () => {
    assert.strictEqual(calculateDunningMilestone(null).diffDays, 0);
    assert.strictEqual(calculateDunningMilestone(undefined).diffDays, 0);
    assert.strictEqual(calculateDunningMilestone('data_invalida').diffDays, 0);
    assert.strictEqual(calculateDunningMilestone('').diffDays, 0);
  });
});

describe('Contact Links Engine: Higienização de Telefones & WhatsApp', () => {
  it('Deve formatar celular brasileiro com DDD para tel:+55 e wa.me', () => {
    const contact = buildContactLinks('(61) 98348-5671');
    assert.strictEqual(contact.hasValidPhone, true);
    assert.strictEqual(contact.cleanDigits, '61983485671');
    assert.strictEqual(contact.formattedWithCountry, '5561983485671');
    assert.strictEqual(contact.telLink, 'tel:+5561983485671');
    assert.strictEqual(contact.whatsappLink, 'https://wa.me/5561983485671');
  });

  it('Deve remover zero inicial de operadora/DDD (ex: 061 -> 61)', () => {
    const contact = buildContactLinks('061983485671');
    assert.strictEqual(contact.hasValidPhone, true);
    assert.strictEqual(contact.cleanDigits, '61983485671');
    assert.strictEqual(contact.formattedWithCountry, '5561983485671');
    assert.strictEqual(contact.telLink, 'tel:+5561983485671');
  });

  it('Deve manter prefixo internacional se o usuário já digitou com +55', () => {
    const contact = buildContactLinks('+55 11 98765-4321');
    assert.strictEqual(contact.hasValidPhone, true);
    assert.strictEqual(contact.cleanDigits, '5511987654321');
    assert.strictEqual(contact.formattedWithCountry, '5511987654321');
    assert.strictEqual(contact.telLink, 'tel:+5511987654321');
  });

  it('Deve codificar mensagem pré-preenchida no link do WhatsApp com segurança', () => {
    const msg = 'Olá João! Tudo bem? Pedido #10068 no valor de R$ 1.500,00.';
    const contact = buildContactLinks('61983485671', msg);
    assert.strictEqual(contact.hasValidPhone, true);
    assert.ok(contact.whatsappLink.includes('wa.me/5561983485671?text='));
    assert.ok(contact.whatsappLink.includes(encodeURIComponent('Pedido #10068')));
  });

  it('Resiliência: Deve tratar números vazios, nulos ou curtos sem estourar exceções', () => {
    const empty1 = buildContactLinks(null);
    assert.strictEqual(empty1.hasValidPhone, false);
    assert.strictEqual(empty1.telLink, '');
    assert.strictEqual(empty1.whatsappLink, '');

    const empty2 = buildContactLinks('');
    assert.strictEqual(empty2.hasValidPhone, false);

    const tooShort = buildContactLinks('1234');
    assert.strictEqual(tooShort.hasValidPhone, false);
  });
});
