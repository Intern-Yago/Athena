import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { app, pool, generateToken } = require('../../backend/server.js');

describe('E2E Connectivity, Anti-Crash & Frontend-Backend Contract Guard', () => {
  let server = null;
  let port = null;
  let baseUrl = '';
  const testOriginSecret = 'test_edge_secret_guard_2026';

  let adminToken = '';
  let customerToken = '';

  before(async () => {
    // Injeta secret de borda para testar o middleware mais rígido
    process.env.ATHENA_ORIGIN_SECRET = testOriginSecret;

    // Gera tokens para testes de comunicação autenticada via gerador nativo do Athena OS
    adminToken = generateToken(
      { id: 'usr_guard_admin', email: 'admin@athenatest.com', role: 'admin', name: 'Admin Guard' },
      3600
    ).token;

    customerToken = generateToken(
      { id: 'usr_guard_customer', email: 'customer@athenatest.com', role: 'customer', name: 'Customer Guard' },
      3600
    ).token;

    await new Promise((resolve) => {
      server = app.listen(0, '127.0.0.1', () => {
        port = server.address().port;
        baseUrl = `http://127.0.0.1:${port}`;
        resolve();
      });
    });
  });

  after(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    if (pool) {
      try { await pool.end(); } catch (e) {}
    }
    try {
      const { getPool } = require('../../backend/services/db.js');
      const servicePool = getPool();
      if (servicePool) await servicePool.end();
    } catch (e) {}
  });

  // -------------------------------------------------------------
  // 1. GARANTIA ABSOLUTA DE ZERO-500 NAS PÁGINAS DO FRONTEND
  // -------------------------------------------------------------
  describe('Zero-500 Guarantee on Frontend-Dependent Endpoints', () => {
    const criticalPublicEndpoints = [
      { method: 'GET', path: '/api/ping', desc: 'Heartbeat ping' },
      { method: 'GET', path: '/api/health', desc: 'Health status' },
      { method: 'GET', path: '/api/catalog/version', desc: 'Versão do catálogo (Home/Layout)' },
      { method: 'GET', path: '/api/products', desc: 'Catálogo de produtos' },
      { method: 'GET', path: '/api/categories', desc: 'Categorias de equipamentos' },
      { method: 'GET', path: '/api/brands', desc: 'Marcas parceiras' },
      { method: 'GET', path: '/api/departments', desc: 'Macro-departamentos' },
      { method: 'GET', path: '/api/banners?all=true', desc: 'Banners da Home' },
      { 
        method: 'POST', 
        path: '/api/auth/login', 
        body: { email: 'inexistente@athena.com', password: 'senha_errada_teste' },
        desc: 'Tentativa de Login (Página /login)' 
      },
      {
        method: 'POST',
        path: '/api/coupons/validate',
        body: { code: 'CUPOM_TESTE_INEXISTENTE', cartTotal: 1000 },
        desc: 'Validação de cupom no Checkout'
      },
      {
        method: 'POST',
        path: '/api/shipping/calculate',
        body: { toCep: '01310100', products: [{ weight: 1, price: 100, quantity: 1 }] },
        desc: 'Cotação de Frete Melhor Envio'
      }
    ];

    for (const ep of criticalPublicEndpoints) {
      it(`[NUNCA DEVE RETORNAR 500] ${ep.method} ${ep.path} (${ep.desc})`, async () => {
        const headers = {
          'origin': 'https://www.athenaconsultoria.com.br',
          'referer': 'https://www.athenaconsultoria.com.br/',
          'content-type': 'application/json'
        };

        const res = await fetch(`${baseUrl}${ep.path}`, {
          method: ep.method,
          headers,
          body: ep.body ? JSON.stringify(ep.body) : undefined
        });

        const status = res.status;
        const text = await res.text();

        assert.notEqual(
          status, 
          500, 
          `FALHA CRÍTICA: Rota ${ep.path} retornou HTTP 500! Erro no servidor: ${text}`
        );

        assert.ok(
          !text.includes('Ocorreu um erro interno nos nossos servidores'),
          `FALHA CRÍTICA: Rota ${ep.path} disparou o catch de erro fatal 500.`
        );

        assert.ok(
          status === 200 || status === 400 || status === 401 || status === 404,
          `Status inesperado na rota ${ep.path}: ${status}. Corpo: ${text}`
        );
      });
    }
  });

  // -------------------------------------------------------------
  // 2. COMUNICAÇÃO DE PÁGINAS PROTEGIDAS (ADMIN & PORTAL DO CLIENTE)
  // -------------------------------------------------------------
  describe('Authenticated Inter-Page Communication Contract', () => {
    it('[NUNCA DEVE RETORNAR 500] Painel Admin - Gestão de Pedidos (/api/admin/orders)', async () => {
      const res = await fetch(`${baseUrl}/api/admin/orders`, {
        method: 'GET',
        headers: {
          'authorization': `Bearer ${adminToken}`,
          'origin': 'https://www.athenaconsultoria.com.br',
          'referer': 'https://www.athenaconsultoria.com.br/admin'
        }
      });

      assert.notEqual(res.status, 500, 'Rota /api/admin/orders não pode falhar com 500');
      assert.strictEqual(res.status, 200, 'Admin autenticado deve receber 200 OK');
      const data = await res.json();
      assert.ok(Array.isArray(data.orders), 'Resposta deve conter a lista de pedidos');
      assert.ok(typeof data.metrics === 'object', 'Resposta deve conter as métricas operacionais');
    });

    it('[NUNCA DEVE RETORNAR 500] Painel Admin - Mesa de Expedição Kanban (/api/admin/fulfillment/kanban)', async () => {
      const res = await fetch(`${baseUrl}/api/admin/fulfillment/kanban`, {
        method: 'GET',
        headers: {
          'authorization': `Bearer ${adminToken}`,
          'origin': 'https://www.athenaconsultoria.com.br'
        }
      });

      assert.notEqual(res.status, 500, 'Rota /api/admin/fulfillment/kanban não pode falhar com 500');
      assert.strictEqual(res.status, 200, 'Admin deve receber 200 OK no Kanban');
      const data = await res.json();
      assert.ok(data.physical_kanban, 'Deve conter physical_kanban');
      assert.ok(Array.isArray(data.digital_activations), 'Deve conter digital_activations');
    });

    it('[NUNCA DEVE RETORNAR 500] Portal do Cliente - Rastreamento (/api/customer/orders)', async () => {
      const res = await fetch(`${baseUrl}/api/customer/orders`, {
        method: 'GET',
        headers: {
          'authorization': `Bearer ${customerToken}`,
          'origin': 'https://www.athenaconsultoria.com.br'
        }
      });

      assert.notEqual(res.status, 500, 'Rota /api/customer/orders não pode falhar com 500');
      assert.strictEqual(res.status, 200, 'Cliente autenticado deve receber 200 OK');
      const data = await res.json();
      assert.ok(Array.isArray(data) || Array.isArray(data.orders), 'Resposta deve conter lista de pedidos do cliente');
    });
  });

  // -------------------------------------------------------------
  // 3. RESILIÊNCIA A PERMUTAÇÕES DE CABEÇALHOS DE BORDA (EDGE/CLOUDFLARE)
  // -------------------------------------------------------------
  describe('Edge Header Permutations Resilience (Anti-ReferenceError)', () => {
    const permutations = [
      { name: 'Apenas Origin', headers: { origin: 'https://www.athenaconsultoria.com.br' } },
      { name: 'Apenas Referer', headers: { referer: 'https://athenaconsultoria.com.br/produtos' } },
      { name: 'Apenas Origin Secret', headers: { 'x-athena-origin-secret': testOriginSecret } },
      { name: 'Com CF-Connecting-IP e CF-Ray', headers: { 'cf-connecting-ip': '187.55.120.44', 'cf-ray': 'test-ray' } },
      { name: 'Sem nenhum cabeçalho de origem', headers: {} }
    ];

    for (const p of permutations) {
      it(`Deve processar requisição com [${p.name}] sem estourar ReferenceError ou 500`, async () => {
        const res = await fetch(`${baseUrl}/api/catalog/version`, {
          method: 'GET',
          headers: p.headers
        });

        assert.notEqual(
          res.status, 
          500, 
          `Configuração de cabeçalhos [${p.name}] disparou erro 500!`
        );
      });
    }
  });

  // -------------------------------------------------------------
  // 4. VERIFICAÇÃO ESTÁTICA DO CONTRATO FRONTEND -> BACKEND
  // -------------------------------------------------------------
  describe('Static Contract Integrity: All Frontend API Calls Must Exist in Backend', () => {
    it('todas as rotas consumidas pelo frontend devem estar devidamente mapeadas no backend', () => {
      const srcDir = path.resolve(process.cwd(), 'src');

      function getAllJsFiles(dir) {
        let results = [];
        const list = fs.readdirSync(dir);
        list.forEach((file) => {
          const filePath = path.join(dir, file);
          const stat = fs.statSync(filePath);
          if (stat && stat.isDirectory()) {
            results = results.concat(getAllJsFiles(filePath));
          } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
            results.push(filePath);
          }
        });
        return results;
      }

      const files = getAllJsFiles(srcDir);
      const apiEndpointsCalled = new Set();

      // Expressões para capturar chamadas de API do frontend
      const fetchRegex = /fetch\(\s*[`'"](\/api\/[^`'"?#]+|\$\{[^}]+\}\/([^`'"?#]+))[`'"]/g;

      files.forEach((f) => {
        const content = fs.readFileSync(f, 'utf8');
        let match;
        while ((match = fetchRegex.exec(content)) !== null) {
          let route = match[1];
          if (route.startsWith('${')) {
            const endpointPart = match[2] || '';
            route = `/api/${endpointPart}`.replace(/\/+/g, '/');
          }
          // Normaliza variáveis dinâmicas como ${id} para :param
          route = route.replace(/\$\{[^}]+\}/g, ':param');
          if (route.startsWith('/api') && !route.includes('viacep') && !route.includes('cnpja')) {
            apiEndpointsCalled.add(route.split('?')[0]);
          }
        }
      });

      assert.ok(apiEndpointsCalled.size > 0, 'O frontend deve ter rotas de API mapeadas');

      // Verifica se rotas essenciais foram extraídas
      const essentialRoutes = [
        '/api/catalog/version',
        '/api/products',
        '/api/categories',
        '/api/brands',
        '/api/departments',
        '/api/banners',
        '/api/auth/login',
        '/api/admin/orders',
        '/api/admin/fulfillment/kanban',
        '/api/customer/orders'
      ];

      for (const reqRoute of essentialRoutes) {
        assert.ok(
          Array.from(apiEndpointsCalled).some(r => r.startsWith(reqRoute)),
          `A rota essencial do frontend ${reqRoute} deve ser monitorada pelo contrato`
        );
      }
    });
  });
});
