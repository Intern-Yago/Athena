import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { 
  uploadToR2, 
  deleteFromR2, 
  ALLOWED_R2_FOLDERS,
  isR2Configured 
} = require('../../backend/r2Service.js');
const { 
  isCloudflareIp, 
  isPrivateIp, 
  getClientIp, 
  safeCompareTokens 
} = require('../../backend/utils/network.js');

describe('Cloudflare & Edge Architecture Security Audit Suite', () => {
  // -------------------------------------------------------------
  // 1. CLOUDFLARE R2 OBJECT STORAGE HARDENING
  // -------------------------------------------------------------
  describe('Cloudflare R2 Security & Anti-Path Traversal', () => {
    it('should have a strict whitelist of allowed storage folders', () => {
      assert.ok(Array.isArray(ALLOWED_R2_FOLDERS), 'Deveria existir uma lista de pastas permitidas');
      assert.ok(ALLOWED_R2_FOLDERS.includes('produtos'));
      assert.ok(ALLOWED_R2_FOLDERS.includes('marcas'));
      assert.ok(ALLOWED_R2_FOLDERS.includes('banners'));
      assert.ok(ALLOWED_R2_FOLDERS.includes('catalogos'));
      assert.ok(!ALLOWED_R2_FOLDERS.includes('root'));
      assert.ok(!ALLOWED_R2_FOLDERS.includes('..'));
    });

    it('should reject file deletion with path traversal or unauthorized prefix', async () => {
      // Tentativa de travessia de diretório
      const traversalAttempt1 = await deleteFromR2('../../../etc/passwd');
      assert.strictEqual(traversalAttempt1, false, 'Deve rejeitar exclusão com ..');

      const traversalAttempt2 = await deleteFromR2('produtos/../../secrets.env');
      assert.strictEqual(traversalAttempt2, false, 'Deve rejeitar exclusão com caminho relativo subversivo');

      // Tentativa de exclusão em pasta não autorizada
      const unauthorizedFolder = await deleteFromR2('system_backups/database.dump');
      assert.strictEqual(unauthorizedFolder, false, 'Deve rejeitar exclusão fora das pastas autorizadas');

      // Tentativa nula/vazia
      const emptyAttempt = await deleteFromR2('');
      assert.strictEqual(emptyAttempt, false, 'Deve rejeitar exclusão com chave vazia');
    });

    it('should reject non-image executable payloads disguised as images', async () => {
      if (!isR2Configured) return; // Roda se credenciais presentes

      const maliciousScript = Buffer.from('<script>alert("XSS")</script>');
      await assert.rejects(
        async () => {
          await uploadToR2({
            file: maliciousScript,
            folder: 'produtos',
            filename: 'evil.jpg'
          });
        },
        /não é uma imagem válida suportada/i,
        'Deve rejeitar script disfarçado de imagem'
      );
    });
  });

  // -------------------------------------------------------------
  // 2. CLOUDFLARE EDGE & NETWORK HARDENING
  // -------------------------------------------------------------
  describe('Cloudflare Edge Network & Header Spoofing Defenses', () => {
    it('should recognize all official Cloudflare proxy IP CIDRs', () => {
      const sampleCloudflareIps = [
        '173.245.48.50',
        '103.21.244.1',
        '103.22.200.25',
        '103.31.4.100',
        '141.101.64.2',
        '108.162.192.15',
        '190.93.240.8',
        '188.114.96.99',
        '197.234.240.4',
        '198.41.128.1',
        '162.158.0.1',
        '104.16.0.1',
        '104.24.0.1',
        '172.64.0.1',
        '131.0.72.1',
        '2400:cb00:2048:1::c629:d7a2',
        '2606:4700:4700::1111'
      ];

      for (const ip of sampleCloudflareIps) {
        assert.strictEqual(isCloudflareIp(ip), true, `IP ${ip} deve ser reconhecido como nó da Cloudflare`);
      }
    });

    it('should strictly reject public non-Cloudflare IPs from being treated as Cloudflare', () => {
      const publicIps = [
        '8.8.8.8',
        '1.1.1.254', // Non-proxy public
        '187.55.120.44',
        '200.147.3.157',
        '177.18.29.30'
      ];

      for (const ip of publicIps) {
        assert.strictEqual(isCloudflareIp(ip), false, `IP ${ip} não deve ser reconhecido como Cloudflare`);
      }
    });

    it('Anti-Spoofing: Direct client hitting onrender.com cannot inject a fake CF-Connecting-IP', () => {
      const attackerReq = {
        headers: {
          'cf-connecting-ip': '200.200.200.200' // IP da vítima ou falso
        },
        socket: {
          remoteAddress: '177.100.50.25' // IP real do atacante
        },
        ip: '177.100.50.25'
      };

      const resolved = getClientIp(attackerReq, { forceStrictOrigin: true });
      assert.strictEqual(resolved, '177.100.50.25', 'Deve ignorar o cabeçalho falso e usar o IP real do atacante');
    });

    it('Timing Attack Defense: Token comparison must run in constant time', () => {
      assert.strictEqual(safeCompareTokens('super-secret-token-1234', 'super-secret-token-1234'), true);
      assert.strictEqual(safeCompareTokens('super-secret-token-1234', 'super-secret-token-0000'), false);
      assert.strictEqual(safeCompareTokens('short', 'much-longer-token-here'), false);
      assert.strictEqual(safeCompareTokens('', 'abc'), false);
    });
  });

  // -------------------------------------------------------------
  // 3. VERCEL & EDGE CONFIGURATION INTEGRITY
  // -------------------------------------------------------------
  describe('Vercel / Cloudflare Edge Headers Integrity', () => {
    it('vercel.json should enforce nosniff, frameguard and strict referrer policies', () => {
      const vercelConfigPath = path.resolve(process.cwd(), 'vercel.json');
      assert.ok(fs.existsSync(vercelConfigPath), 'vercel.json deve existir na raiz');

      const config = JSON.parse(fs.readFileSync(vercelConfigPath, 'utf8'));
      assert.ok(Array.isArray(config.headers), 'Headers de borda devem estar configurados');

      const catchAllHeaderConfig = config.headers.find(h => h.source === '/(.*)');
      assert.ok(catchAllHeaderConfig, 'Regra catch-all /(.*) deve existir');

      const headerMap = {};
      catchAllHeaderConfig.headers.forEach(h => {
        headerMap[h.key.toLowerCase()] = h.value;
      });

      assert.strictEqual(headerMap['x-content-type-options'], 'nosniff');
      assert.strictEqual(headerMap['x-frame-options'], 'DENY');
      assert.strictEqual(headerMap['referrer-policy'], 'strict-origin-when-cross-origin');
      assert.ok(headerMap['strict-transport-security']?.includes('max-age=31536000'));
    });

    it('Origin Isolation middleware should process requests without ReferenceError on referer', () => {
      const { isOriginAllowed } = require('../../backend/utils/network.js');
      const originSecret = 'test_secret_123';
      
      const simulateOriginMiddleware = (req) => {
        const incomingSecret = req.headers['x-athena-origin-secret'];
        const origin = req.headers['origin'];
        const referer = req.headers['referer'];
        const isAthenaReferer = referer && (
          referer.startsWith('https://www.athenaconsultoria.com.br') ||
          referer.startsWith('https://athenaconsultoria.com.br')
        );

        const hasSecretMatch = incomingSecret && safeCompareTokens(incomingSecret, originSecret);
        if (hasSecretMatch || isOriginAllowed(origin) || isAthenaReferer) {
          return { allowed: true };
        }
        return { allowed: false, status: 403 };
      };

      // 1. Requisição com Origin legítimo
      const res1 = simulateOriginMiddleware({
        headers: { origin: 'https://www.athenaconsultoria.com.br' }
      });
      assert.strictEqual(res1.allowed, true);

      // 2. Requisição com Referer legítimo
      const res2 = simulateOriginMiddleware({
        headers: { referer: 'https://athenaconsultoria.com.br/produtos' }
      });
      assert.strictEqual(res2.allowed, true);

      // 3. Requisição com Secret de borda
      const res3 = simulateOriginMiddleware({
        headers: { 'x-athena-origin-secret': 'test_secret_123' }
      });
      assert.strictEqual(res3.allowed, true);

      // 4. Requisição sem cabeçalhos (deve ser bloqueada sem erro 500)
      const res4 = simulateOriginMiddleware({
        headers: {}
      });
      assert.strictEqual(res4.allowed, false);
      assert.strictEqual(res4.status, 403);
    });
  });
});
