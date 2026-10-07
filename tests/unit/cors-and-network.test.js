import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { 
  isOriginAllowed, 
  isPrivateIp,
  isCloudflareIp,
  isInfrastructureOrPrivateIp,
  safeCompareTokens,
  getClientIp 
} = require('../../backend/utils/network.js');

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
    assert.strictEqual(isPrivateIp('10.0.0.1'), true);
    assert.strictEqual(isPrivateIp('172.16.5.4'), true);
  });

  it('should identify official Cloudflare proxy IP ranges as infrastructure', () => {
    assert.strictEqual(isInfrastructureOrPrivateIp('173.245.48.1'), true);
    assert.strictEqual(isInfrastructureOrPrivateIp('104.16.12.34'), true);
    assert.strictEqual(isInfrastructureOrPrivateIp('162.158.1.1'), true);
    assert.strictEqual(isCloudflareIp('173.245.48.1'), true);
    assert.strictEqual(isCloudflareIp('104.16.12.34'), true);
    assert.strictEqual(isCloudflareIp('2400:cb00:2048:1::c629:d7a2'), true);
  });

  it('should return false for arbitrary public client IPs', () => {
    assert.strictEqual(isInfrastructureOrPrivateIp('187.55.120.44'), false);
    assert.strictEqual(isInfrastructureOrPrivateIp('201.88.90.12'), false);
    assert.strictEqual(isCloudflareIp('187.55.120.44'), false);
    assert.strictEqual(isPrivateIp('187.55.120.44'), false);
  });

  it('should protect against timing attacks with safeCompareTokens', () => {
    assert.strictEqual(safeCompareTokens('secret123', 'secret123'), true);
    assert.strictEqual(safeCompareTokens('secret123', 'wrongtoken'), false);
    assert.strictEqual(safeCompareTokens('short', 'muchlongertoken'), false);
    assert.strictEqual(safeCompareTokens(null, 'secret'), false);
  });

  it('Anti-Spoofing: should reject fake CF-Connecting-IP from untrusted public clients hitting origin directly', () => {
    const fakeDirectReq = {
      headers: {
        'cf-connecting-ip': '8.8.8.8' // Attacker spoof attempt
      },
      socket: {
        remoteAddress: '187.55.120.44' // Direct attacker IP (NOT Cloudflare)
      },
      ip: '187.55.120.44'
    };

    const resolvedIp = getClientIp(fakeDirectReq, { forceStrictOrigin: true });
    // Deve ignorar o 8.8.8.8 falso e atribuir o IP real do socket (187.55.120.44)
    assert.strictEqual(resolvedIp, '187.55.120.44');
  });

  it('Anti-Spoofing: should accept real CF-Connecting-IP when peer is a verified Cloudflare proxy', () => {
    const legitimateCfReq = {
      headers: {
        'cf-connecting-ip': '187.55.120.44', // Real client IP behind Cloudflare
        'cf-ray': '82719283719283-GRU'
      },
      socket: {
        remoteAddress: '173.245.48.10' // Verified Cloudflare Proxy node
      },
      ip: '173.245.48.10'
    };

    const resolvedIp = getClientIp(legitimateCfReq, { forceStrictOrigin: true });
    assert.strictEqual(resolvedIp, '187.55.120.44');
  });
});
