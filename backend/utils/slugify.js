/**
 * slugify.js
 * 
 * Utilitário de geração e validação de slugs para o blog da Athena.
 * Remove acentos, caracteres especiais, normaliza espaços e garante conformidade
 * estrita com o regex kebab-case do PostgreSQL: ^[a-z0-9]+(-[a-z0-9]+)*$
 */

function slugify(text) {
  if (!text || typeof text !== 'string') return '';
  return text
    .normalize('NFD') // Decompõe caracteres acentuados (ex: 'ç' -> 'c' + diacrítico)
    .replace(/[\u0300-\u036f]/g, '') // Remove todos os diacríticos e acentos
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove pontuações e caracteres não alfanuméricos
    .replace(/[\s_]+/g, '-') // Converte espaços e underscores em hífens
    .replace(/-+/g, '-') // Colapsa múltiplos hífens consecutivos
    .replace(/^-+|-+$/g, ''); // Apara hífens nas bordas (início e fim)
}

function isValidSlug(slug, minLength = 3) {
  if (!slug || typeof slug !== 'string') return false;
  if (slug.length < minLength) return false;
  // Regex estritamente compatível com as CHECK constraints do banco
  return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug);
}

module.exports = {
  slugify,
  isValidSlug
};
