import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { requireAdmin, requireStaff } = require('../../backend/utils/authMiddlewares.js');

function createMockReqRes(user) {
  const req = {
    user,
    headers: { 'user-agent': 'Athena-Test-Agent' }
  };
  const res = {
    statusCode: null,
    jsonData: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.jsonData = data;
      return this;
    }
  };
  let nextCalled = false;
  const next = () => { nextCalled = true; };

  return { req, res, next, wasNextCalled: () => nextCalled };
}

describe('Security: RBAC Authorization Middlewares (requireAdmin & requireStaff)', () => {
  describe('requireAdmin', () => {
    it('should allow authenticated users with admin role', () => {
      const { req, res, next, wasNextCalled } = createMockReqRes({ id: 'u1', role: 'admin' });
      requireAdmin(req, res, next);
      assert.strictEqual(wasNextCalled(), true);
      assert.strictEqual(res.statusCode, null);
    });

    it('should reject unauthenticated requests with 403', () => {
      const { req, res, next, wasNextCalled } = createMockReqRes(null);
      requireAdmin(req, res, next);
      assert.strictEqual(wasNextCalled(), false);
      assert.strictEqual(res.statusCode, 403);
      assert.match(res.jsonData.error, /administradores/i);
    });

    it('should reject non-admin roles (customer, vendedor) with 403', () => {
      const customerMock = createMockReqRes({ id: 'u2', role: 'customer' });
      requireAdmin(customerMock.req, customerMock.res, customerMock.next);
      assert.strictEqual(customerMock.wasNextCalled(), false);
      assert.strictEqual(customerMock.res.statusCode, 403);

      const sellerMock = createMockReqRes({ id: 'u3', role: 'vendedor' });
      requireAdmin(sellerMock.req, sellerMock.res, sellerMock.next);
      assert.strictEqual(sellerMock.wasNextCalled(), false);
      assert.strictEqual(sellerMock.res.statusCode, 403);
    });

    it('should block emergency magic link sessions from admin access (Anti-Privilege Escalation)', () => {
      const { req, res, next, wasNextCalled } = createMockReqRes({ 
        id: 'u1', 
        role: 'admin', 
        isMagicLinkSession: true 
      });
      requireAdmin(req, res, next);
      assert.strictEqual(wasNextCalled(), false);
      assert.strictEqual(res.statusCode, 403);
      assert.match(res.jsonData.error, /Link Emergencial/i);
    });
  });

  describe('requireStaff', () => {
    it('should allow internal staff roles (admin, vendedor, editor, edicao)', () => {
      for (const role of ['admin', 'vendedor', 'editor', 'edicao']) {
        const { req, res, next, wasNextCalled } = createMockReqRes({ id: 's1', role });
        requireStaff(req, res, next);
        assert.strictEqual(wasNextCalled(), true, `Staff check should allow role ${role}`);
      }
    });

    it('should reject customer role with 403', () => {
      const { req, res, next, wasNextCalled } = createMockReqRes({ id: 'c1', role: 'customer' });
      requireStaff(req, res, next);
      assert.strictEqual(wasNextCalled(), false);
      assert.strictEqual(res.statusCode, 403);
      assert.match(res.jsonData.error, /equipe interna/i);
    });

    it('should block emergency magic link sessions from staff operations', () => {
      const { req, res, next, wasNextCalled } = createMockReqRes({ 
        id: 's1', 
        role: 'vendedor', 
        isMagicLinkSession: true 
      });
      requireStaff(req, res, next);
      assert.strictEqual(wasNextCalled(), false);
      assert.strictEqual(res.statusCode, 403);
      assert.match(res.jsonData.error, /Link Emergencial/i);
    });
  });
});
