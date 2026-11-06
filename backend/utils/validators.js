// Standard Password Security Validator (OWASP ASVS & NIST Guidelines)
function validatePasswordStandard(password) {
  if (!password || typeof password !== 'string') {
    return { valid: false, message: 'A senha é obrigatória.' };
  }
  if (password.length < 8) {
    return { valid: false, message: 'A senha deve conter no mínimo 8 caracteres.' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'A senha deve conter ao menos uma letra maiúscula (A-Z).' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'A senha deve conter ao menos uma letra minúscula (a-z).' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'A senha deve conter ao menos um número (0-9).' };
  }
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~]/.test(password)) {
    return { valid: false, message: 'A senha deve conter ao menos um caractere especial (!@#$%...).' };
  }
  return { valid: true };
}

module.exports = {
  validatePasswordStandard
};
