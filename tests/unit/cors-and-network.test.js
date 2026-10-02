import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { isOriginAllowed, isInfrastructureOrPrivateIp } = require('../../backend/utils/network.js');

describe('Security: CORS & Network Isolation (isOriginAllowed & isInfrastructureOrPrivateIp)', () => {
  it('should allow production Athena domains', () => {
    assert.strictEqual(isOriginAllowed('https://www.athenaconsultoria.com.br'), true);
    assert.strictEqual(isOriginAllowed('https://athenaconsultoria.com.br'), true);
  });

  it('should allow official Render backend domain', () => {
    assert.strictEqual(isOriginAllowed('https://athena-backend-hu1m.onrender.com'), true);
  });

  it('should allow local development origins', () => {
    assert.strictEqual(isOriginAllowed('http://localhost:5173'), true);
    assert.strictEqual(isOriginAllowed('http://localhost:3000'), true);
    assert.strictEqual(isOriginAllowed('http://127.0.0.1:5173'), true);
  });

  it('should allow Vercel preview deployments', () => {
    assert.strictEqual(isOriginAllowed('https://athena-preview-branch.vercel.app'), true);
  });

  it('should reject unauthorized or malicious origins', () => {
    assert.strictEqual(isOriginAllowed('https://attacker-domain.com'), false);
    assert.strictEqual(isOriginAllowed('https://cloned-athena-store.com'), false);
    assert.strictEqual(isOriginAllowed('https://not-athenaconsultoria.com.br.evil.com'), false);
  });

  it('should return false for empty or non-string origins', () => {
    assert.strictEqual(isOriginAllowed(''), false);
    assert.strictEqual(isOriginAllowed(null), false);
    assert.strictEqual(isOriginAllowed(undefined), false);
  });

  it('should identify private RFC 1918 IPs and loopbacks as infrastructure', () => {
    assert.strictEqual(isInfrastructureOrPrivateIp('127.0.0.1'), true);
    assert.strictEqual(isInfrastructureOrPrivateIp('10.0.4.15'), true);
    assert.strictEqual(isInfrastructureOrPrivateIp('172.20.0.5'), true);
    assert.strictEqual(isInfrastructureOrPrivateIp('192.168.1.100'), true);
  });

  it('should identify official Cloudflare proxy IP ranges as infrastructure', () => {
    assert.strictEqual(isInfrastructureOrPrivateIp('173.245.48.1'), true);
    assert.strictEqual(isInfrastructureOrPrivateIp('104.16.12.34'), true);
    assert.strictEqual(isInfrastructureOrPrivateIp('162.158.1.1'), true);
  });

  it('should return false for arbitrary public client IPs', () => {
    assert.strictEqual(isInfrastructureOrPrivateIp('187.55.120.44'), false);
    assert.strictEqual(isInfrastructureOrPrivateIp('201.88.90.12'), false);
  });
});
