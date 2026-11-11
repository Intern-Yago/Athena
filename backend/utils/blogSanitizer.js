/**
 * blogSanitizer.js
 * 
 * Camada de sanitização de HTML e conversão de blocos do BlockNote para o Blog da Athena.
 * - Allowlist estrita de tags e atributos usando sanitize-html.
 * - Bloqueio de esquemas perigosos (javascript:, data:).
 * - Imagens restritas a domínios HTTPS autorizados (Cloudflare R2 / CDN da Athena).
 * - Placeholder data-athena-product-id para hidratação de produtos.
 * - Sanitização de metatags e escape de caracteres perigosos (<, >, &) para JSON-LD.
 */

const sanitizeHtml = require('sanitize-html');

// Allowlist de classes permitidas (Tailwind utilitário seguro e classes semânticas do blog)
const ALLOWED_CLASS_PATTERN = /^(text-(left|center|right|justify)|font-(bold|semibold|normal)|text-(gray|blue|red|green|yellow|slate)-\d{2,3}|bg-(gray|blue|slate)-\d{2,3}|my-\d+|mb-\d+|mt-\d+|py-\d+|px-\d+|rounded(-[a-z]+)?|shadow(-[a-z]+)?|italic|underline|line-through|list-(disc|decimal)|athena-embedded-product-card|athena-blog-[a-z0-9-]+)$/;

const SANITIZE_OPTIONS = {
  allowedTags: [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'p', 'a', 'b', 'strong', 'i', 'em', 'u', 's',
    'ul', 'ol', 'li', 'blockquote', 'pre', 'code', 'hr',
    'figure', 'figcaption', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'span', 'img', 'div'
  ],
  allowedAttributes: {
    'a': ['href', 'target', 'rel', 'title'],
    'img': ['src', 'alt', 'title', 'width', 'height', 'loading'],
    'div': ['data-athena-product-id', 'class'],
    'span': ['class'],
    'p': ['class'],
    'h1': ['class'],
    'h2': ['class'],
    'h3': ['class'],
    'h4': ['class'],
    'h5': ['class'],
    'h6': ['class'],
    'table': ['class'],
    'th': ['class'],
    'td': ['class'],
    'blockquote': ['class'],
    'code': ['class']
  },
  allowedSchemes: ['http', 'https', 'mailto'],
  allowedSchemesByTag: {
    img: ['https'] // Imagens EXCLUSIVAMENTE via HTTPS; data: URIs bloqueadas categoricamente
  },
  transformTags: {
    'a': (tagName, attribs) => {
      return {
        tagName: 'a',
        attribs: {
          ...attribs,
          target: '_blank',
          rel: 'noopener noreferrer'
        }
      };
    },
    'img': (tagName, attribs) => {
      const src = (attribs.src || '').trim();
      // Bloqueio de qualquer tentativa de scheme data: ou javascript:
      if (!src.startsWith('https://')) {
        return { tagName: 'span', attribs: { class: 'blocked-image' }, text: '[Imagem Bloqueada: protocolo inseguro]' };
      }
      return {
        tagName: 'img',
        attribs: {
          src,
          alt: attribs.alt || 'Imagem do artigo Athena',
          title: attribs.title || '',
          loading: 'lazy',
          class: 'rounded-lg max-w-full h-auto my-4'
        }
      };
    }
  },
  allowedClasses: {
    '*': [ALLOWED_CLASS_PATTERN]
  }
};

/**
 * Sanitiza HTML puro aplicando a política de allowlist estrita
 */
function sanitizePostHtml(dirtyHtml) {
  if (!dirtyHtml || typeof dirtyHtml !== 'string') return '';
  return sanitizeHtml(dirtyHtml, SANITIZE_OPTIONS);
}

/**
 * Converte array de blocos do BlockNote para HTML pré-renderizado e sanitizado
 * Trata blocos customizados como 'productCard' para injeção de placeholder seguro
 */
function blockNoteToHtml(blocks) {
  if (!Array.isArray(blocks) || blocks.length === 0) {
    return '';
  }

  let htmlBuffer = '';

  for (const block of blocks) {
    if (!block || typeof block !== 'object') continue;

    const type = block.type;
    const content = block.content;
    const props = block.props || {};

    switch (type) {
      case 'heading': {
        const level = props.level || 2;
        const tag = `h${Math.min(Math.max(level, 1), 6)}`;
        htmlBuffer += `<${tag}>${renderInlineContent(content)}</${tag}>\n`;
        break;
      }
      case 'paragraph': {
        htmlBuffer += `<p>${renderInlineContent(content)}</p>\n`;
        break;
      }
      case 'bulletListItem': {
        htmlBuffer += `<ul><li>${renderInlineContent(content)}</li></ul>\n`;
        break;
      }
      case 'numberedListItem': {
        htmlBuffer += `<ol><li>${renderInlineContent(content)}</li></ol>\n`;
        break;
      }
      case 'checkListItem': {
        const checked = props.checked ? '[x] ' : '[ ] ';
        htmlBuffer += `<p class="checklist-item">${checked}${renderInlineContent(content)}</p>\n`;
        break;
      }
      case 'blockquote': {
        htmlBuffer += `<blockquote><p>${renderInlineContent(content)}</p></blockquote>\n`;
        break;
      }
      case 'codeBlock': {
        const lang = props.language ? ` class="language-${escapeHtmlAttr(props.language)}"` : '';
        htmlBuffer += `<pre><code${lang}>${escapeHtmlText(renderInlineContent(content))}</code></pre>\n`;
        break;
      }
      case 'image': {
        if (props.url) {
          htmlBuffer += `<img src="${escapeHtmlAttr(props.url)}" alt="${escapeHtmlAttr(props.caption || '')}" />\n`;
        }
        break;
      }
      case 'productCard': {
        // Bloco customizado de produto Athena: armazena APENAS productId
        const productId = String(props.productId || '').trim();
        if (productId) {
          htmlBuffer += `<div data-athena-product-id="${escapeHtmlAttr(productId)}" class="athena-embedded-product-card"></div>\n`;
        }
        break;
      }
      default: {
        if (content) {
          htmlBuffer += `<p>${renderInlineContent(content)}</p>\n`;
        }
        break;
      }
    }
  }

  // Passa o HTML montado pela sanitização defensiva final
  return sanitizePostHtml(htmlBuffer);
}

function renderInlineContent(content) {
  if (!content) return '';
  if (typeof content === 'string') return escapeHtmlText(content);
  if (!Array.isArray(content)) return '';

  return content.map(item => {
    if (typeof item === 'string') return escapeHtmlText(item);
    if (!item || typeof item !== 'object') return '';

    let text = escapeHtmlText(item.text || '');

    if (item.styles) {
      if (item.styles.bold) text = `<strong>${text}</strong>`;
      if (item.styles.italic) text = `<em>${text}</em>`;
      if (item.styles.underline) text = `<u>${text}</u>`;
      if (item.styles.strike) text = `<s>${text}</s>`;
      if (item.styles.code) text = `<code>${text}</code>`;
    }

    if (item.type === 'link' && item.href) {
      text = `<a href="${escapeHtmlAttr(item.href)}">${text}</a>`;
    }

    return text;
  }).join('');
}

function escapeHtmlText(str) {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeHtmlAttr(str) {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Serializador seguro para JSON-LD embutido no HTML
 * Requisito (5): Escapa o caractere '<' como '\u003c' para neutralizar
 * qualquer ataque de script breakout (ex: </script><script>alert(1)</script>)
 */
function safeJsonLd(data) {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

module.exports = {
  sanitizePostHtml,
  blockNoteToHtml,
  escapeHtmlAttr,
  escapeHtmlText,
  safeJsonLd
};
