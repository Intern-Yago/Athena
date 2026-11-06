import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { validatePasswordStandard } = require('../../backend/utils/validators.js');

describe('Security: Password Standard Validator (validatePasswordStandard)', () => {
  it('should accept a strong password that meets all criteria', () => {
    const result = validatePasswordStandard('Athena@2026Secure!');
    assert.strictEqual(result.valid, true);
    assert.strictEqual(result.message, undefined);
  });

  it('should reject empty or null passwords', () => {
    assert.strictEqual(validatePasswordStandard('').valid, false);
    assert.strictEqual(validatePasswordStandard(null).valid, false);
    assert.strictEqual(validatePasswordStandard(undefined).valid, false);
  });

  it('should reject passwords shorter than 8 characters', () => {
    const result = validatePasswordStandard('Aa1!abc');
    assert.strictEqual(result.valid, false);
    assert.match(result.message, /mínimo 8 caracteres/i);
  });

  it('should reject passwords without uppercase letters', () => {
    const result = validatePasswordStandard('athena2026@secure');
    assert.strictEqual(result.valid, false);
    assert.match(result.message, /letra maiúscula/i);
  });

  it('should reject passwords without lowercase letters', () => {
    const result = validatePasswordStandard('ATHENA2026@SECURE');
    assert.strictEqual(result.valid, false);
    assert.match(result.message, /letra minúscula/i);
  });

  it('should reject passwords without numbers', () => {
    const result = validatePasswordStandard('Athena@SecureOnly');
    assert.strictEqual(result.valid, false);
    assert.match(result.message, /número/i);
  });

  it('should reject passwords without special characters', () => {
    const result = validatePasswordStandard('Athena2026Secure');
    assert.strictEqual(result.valid, false);
    assert.match(result.message, /caractere especial/i);
  });
});
