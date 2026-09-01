import React from 'react';
import { ExternalLink } from 'lucide-react';
import ProductHoverCard from './ProductHoverCard';

/**
 * Strips rich text formatting tags for plain text contexts (e.g. search, cards line-clamp, meta tags).
 */
export function stripFormattingTags(text = '') {
  if (!text) return '';
  return text
    .replace(/\[(tamanho|size)=[^\]]+\](.*?)\[\/(tamanho|size)\]/gi, '$2')
    .replace(/\[color=[^\]]+\](.*?)\[\/color\]/gi, '$1')
    .replace(/\[cor=[^\]]+\](.*?)\[\/cor\]/gi, '$1')
    .replace(/\[destaque\](.*?)\[\/destaque\]/gi, '$1')
    .replace(/\[highlight\](.*?)\[\/highlight\]/gi, '$1')
    .replace(/<color:[^>]+>(.*?)<\/color>/gi, '$1')
    .replace(/<mark>(.*?)<\/mark>/gi, '$1')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')
    .replace(/<\/?(b|i|u|strong|em|p|span)>/gi, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/^\s*[•\-\*]\s+/gm, '')
    .replace(/^\s*\d+[\.\)]\s+/gm, '')
    .trim();
}

/**
 * Parses inline rich text formatting (bold, italic, underline, custom colors, highlights, font sizes, markdown links).
 */
export function parseInlineFormatting(text = '', products = [], onSelectProduct = null) {
  if (!text) return null;

  const parts = [];
  let remaining = text;
  let keyIndex = 0;

  const tokenRegex = /(\[(?:tamanho|size)=(p|pequeno|sm|m|medio|md|g|grande|lg|gg|extra|xl|titulo)\](.*?)\[\/(?:tamanho|size)\]|\[cor=(ambar|azul|verde|vermelho|gold|dourado|sky|blue|emerald|green|red)\](.*?)\[\/cor\]|\[color=([^\]]+)\](.*?)\[\/color\]|\[destaque\](.*?)\[\/destaque\]|\[highlight\](.*?)\[\/highlight\]|<mark>(.*?)<\/mark>|\*\*(.*?)\*\*|<b>(.*?)<\/b>|<strong>(.*?)<\/strong>|\*(.*?)\*|<i>(.*?)<\/i>|<em>(.*?)<\/em>|<u>(.*?)<\/u>|\[([^\]]+)\]\(([^)]+)\))/i;

  while (remaining) {
    const match = remaining.match(tokenRegex);
    if (!match) {
      parts.push(<React.Fragment key={`text-${keyIndex++}`}>{remaining}</React.Fragment>);
      break;
    }

    const matchIndex = match.index;
    if (matchIndex > 0) {
      parts.push(
        <React.Fragment key={`text-${keyIndex++}`}>
          {remaining.substring(0, matchIndex)}
        </React.Fragment>
      );
    }

    const fullMatch = match[0];
    
    // [tamanho=xxx]...[/tamanho] or [size=xxx]...[/size]
    if (match[2] && match[3] !== undefined) {
      const sizeType = match[2].toLowerCase();
      const content = match[3];
      let sizeClass = 'text-sm';
      if (['p', 'pequeno', 'sm'].includes(sizeType)) {
        sizeClass = 'text-xs text-slate-600 inline-block';
      } else if (['g', 'grande', 'lg'].includes(sizeType)) {
        sizeClass = 'text-base sm:text-lg font-bold text-slate-900 inline-block';
      } else if (['gg', 'extra', 'xl', 'titulo'].includes(sizeType)) {
        sizeClass = 'text-lg sm:text-xl font-black text-slate-950 inline-block tracking-tight';
      }
      
      parts.push(
        <span key={`size-${keyIndex++}`} className={sizeClass}>
          {parseInlineFormatting(content, products, onSelectProduct)}
        </span>
      );
    }
    // [cor=xxx]...[/cor]
    else if (match[4] && match[5] !== undefined) {
      const colorType = match[4].toLowerCase();
      const content = match[5];
      let colorClass = 'text-amber-700 font-bold';
      if (colorType === 'azul' || colorType === 'sky' || colorType === 'blue') colorClass = 'text-sky-700 font-bold';
      if (colorType === 'verde' || colorType === 'emerald' || colorType === 'green') colorClass = 'text-emerald-700 font-bold';
      if (colorType === 'vermelho' || colorType === 'red') colorClass = 'text-red-700 font-bold';
      
      parts.push(
        <span key={`color-${keyIndex++}`} className={colorClass}>
          {parseInlineFormatting(content, products, onSelectProduct)}
        </span>
      );
    }
    // [color=custom]...[/color]
    else if (match[6] && match[7] !== undefined) {
      parts.push(
        <span key={`custom-color-${keyIndex++}`} style={{ color: match[6] }} className="font-bold">
          {parseInlineFormatting(match[7], products, onSelectProduct)}
        </span>
      );
    }
    // [destaque] or [highlight] or <mark>
    else if (match[8] !== undefined || match[9] !== undefined || match[10] !== undefined) {
      const content = match[8] || match[9] || match[10];
      parts.push(
        <mark key={`mark-${keyIndex++}`} className="bg-amber-100/90 text-amber-950 px-1 py-0.5 rounded font-medium border border-amber-200/60">
          {parseInlineFormatting(content, products, onSelectProduct)}
        </mark>
      );
    }
    // **bold** or <b> or <strong>
    else if (match[11] !== undefined || match[12] !== undefined || match[13] !== undefined) {
      const content = match[11] || match[12] || match[13];
      parts.push(
        <strong key={`bold-${keyIndex++}`} className="font-extrabold text-slate-900">
          {parseInlineFormatting(content, products, onSelectProduct)}
        </strong>
      );
    }
    // *italic* or <i> or <em>
    else if (match[14] !== undefined || match[15] !== undefined || match[16] !== undefined) {
      const content = match[14] || match[15] || match[16];
      parts.push(
        <em key={`italic-${keyIndex++}`} className="italic">
          {parseInlineFormatting(content, products, onSelectProduct)}
        </em>
      );
    }
    // <u>underline</u>
    else if (match[17] !== undefined) {
      const content = match[17];
      parts.push(
        <u key={`u-${keyIndex++}`} className="underline decoration-amber-500 decoration-1.5 underline-offset-2">
          {parseInlineFormatting(content, products, onSelectProduct)}
        </u>
      );
    }
    // [label](url) Markdown Link
    else if (match[18] !== undefined && match[19] !== undefined) {
      const linkLabel = match[18];
      const linkUrl = match[19];

      let matchedProduct = null;
      if (Array.isArray(products) && products.length > 0) {
        if (linkUrl.includes('/produto/')) {
          const slugOrId = linkUrl.split('/produto/')[1]?.split('?')[0]?.replace(/\/$/, '');
          matchedProduct = products.find(p => p.slug === slugOrId || p.id === slugOrId);
        } else {
          matchedProduct = products.find(p => p.name.toLowerCase().trim() === linkLabel.toLowerCase().trim() || p.slug === linkLabel.toLowerCase().trim());
        }
      }

      if (matchedProduct && matchedProduct.status !== 'draft') {
        parts.push(
          <ProductHoverCard
            key={`prod-chip-${keyIndex++}`}
            product={matchedProduct}
            onSelectProduct={onSelectProduct}
          >
            {linkLabel}
          </ProductHoverCard>
        );
      } else if (matchedProduct && matchedProduct.status === 'draft') {
        // Draft product: render clean non-clickable text for public safety
        parts.push(
          <span key={`draft-label-${keyIndex++}`} className="font-semibold text-slate-700">
            {linkLabel}
          </span>
        );
      } else {
        const isExternal = linkUrl.startsWith('http://') || linkUrl.startsWith('https://') || linkUrl.startsWith('mailto:') || linkUrl.startsWith('tel:');
        parts.push(
          <a
            key={`link-${keyIndex++}`}
            href={linkUrl}
            target={isExternal ? '_blank' : undefined}
            rel={isExternal ? 'noopener noreferrer' : undefined}
            className="text-amber-800 hover:text-amber-950 font-bold underline decoration-amber-400/80 inline-flex items-center gap-0.5"
          >
            <span>{linkLabel}</span>
            {isExternal && <ExternalLink className="w-3 h-3 inline text-amber-600 ml-0.5" />}
          </a>
        );
      }
    }

    remaining = remaining.substring(matchIndex + fullMatch.length);
  }

  return parts;
}

/**
 * FormattedDescription Component
 * Renders rich text description supporting bold, italic, underline, colors, highlight, nested bullet lists, and nested numbered lists.
 */
export default function FormattedDescription({ 
  text = '', 
  className = '',
  products = [],
  onSelectProduct = null
}) {
  if (!text || !text.trim()) {
    return null;
  }

  const rawLines = text.split(/\r?\n/);
  const elements = [];
  let currentList = null; // { type: 'bullet' | 'ordered', items: [] }

  const flushList = () => {
    if (!currentList || currentList.items.length === 0) return;
    const listIndex = elements.length;

    if (currentList.type === 'bullet') {
      elements.push(
        <ul key={`list-${listIndex}`} className="space-y-1.5 my-2.5">
          {currentList.items.map((item, idx) => {
            const level = item.level || 0;
            // Indent padding styles according to nesting level
            const paddingClass = level === 0 ? 'pl-1' : level === 1 ? 'pl-5 sm:pl-6' : 'pl-9 sm:pl-11';
            
            return (
              <li key={idx} className={`flex items-start gap-2.5 text-slate-700 leading-relaxed ${paddingClass}`}>
                {level === 0 ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-2 shrink-0 shadow-2xs" />
                ) : level === 1 ? (
                  <span className="w-1.5 h-1.5 rounded-full border-2 border-amber-600 bg-white mt-2 shrink-0" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-2xs bg-slate-500 mt-2 shrink-0" />
                )}
                <span className="flex-1">{parseInlineFormatting(item.content, products, onSelectProduct)}</span>
              </li>
            );
          })}
        </ul>
      );
    } else if (currentList.type === 'ordered') {
      // Counter tracking for sub-levels
      let level0Counter = 0;
      let level1Counter = 0;
      let level2Counter = 0;

      elements.push(
        <ol key={`list-${listIndex}`} className="space-y-1.5 my-2.5">
          {currentList.items.map((item, idx) => {
            const level = item.level || 0;
            const paddingClass = level === 0 ? 'pl-1' : level === 1 ? 'pl-5 sm:pl-6' : 'pl-9 sm:pl-11';
            
            let label = '';
            if (level === 0) {
              level0Counter++;
              level1Counter = 0;
              level2Counter = 0;
              label = `${level0Counter}`;
            } else if (level === 1) {
              level1Counter++;
              level2Counter = 0;
              const letter = String.fromCharCode(96 + ((level1Counter - 1) % 26 + 1));
              label = `${letter}`;
            } else {
              level2Counter++;
              label = `${level2Counter}`;
            }

            return (
              <li key={idx} className={`flex items-start gap-2.5 text-slate-700 leading-relaxed ${paddingClass}`}>
                {level === 0 ? (
                  <span className="w-5 h-5 rounded-md bg-amber-100 text-amber-900 border border-amber-300/70 text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    {label}
                  </span>
                ) : level === 1 ? (
                  <span className="w-4.5 h-4.5 rounded-md bg-slate-100 text-slate-800 border border-slate-300 text-[10px] font-extrabold flex items-center justify-center shrink-0 mt-0.5">
                    {label}
                  </span>
                ) : (
                  <span className="w-4 h-4 rounded bg-slate-50 text-slate-600 border border-slate-200 text-[9px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {label}
                  </span>
                )}
                <span className="flex-1">{parseInlineFormatting(item.content, products, onSelectProduct)}</span>
              </li>
            );
          })}
        </ol>
      );
    }
    currentList = null;
  };

  for (let i = 0; i < rawLines.length; i++) {
    const rawLine = rawLines[i];
    const trimmed = rawLine.trim();

    if (!trimmed) {
      flushList();
      continue;
    }

    // Check if line is a bullet point with possible indentation: e.g. "  • item" or "• item" or "- item"
    const bulletMatch = rawLine.match(/^(\s*)(?:[•\-\*])\s+(.*)$/);
    if (bulletMatch) {
      const indentSpaces = bulletMatch[1].length;
      const level = Math.min(Math.floor(indentSpaces / 2), 3);
      const content = bulletMatch[2];

      if (currentList && currentList.type !== 'bullet') {
        flushList();
      }
      if (!currentList) {
        currentList = { type: 'bullet', items: [] };
      }
      currentList.items.push({ level, content });
      continue;
    }

    // Check if line is a numbered list with possible indentation: e.g. "  1. item" or "1. item"
    const orderedMatch = rawLine.match(/^(\s*)(\d+)[\.\)]\s+(.*)$/);
    if (orderedMatch) {
      const indentSpaces = orderedMatch[1].length;
      const level = Math.min(Math.floor(indentSpaces / 2), 3);
      const content = orderedMatch[3];

      if (currentList && currentList.type !== 'ordered') {
        flushList();
      }
      if (!currentList) {
        currentList = { type: 'ordered', items: [] };
      }
      currentList.items.push({ level, content, rawNum: orderedMatch[2] });
      continue;
    }

    // Regular text paragraph
    flushList();
    elements.push(
      <p key={`p-${elements.length}`} className="leading-relaxed my-1.5 text-slate-700">
        {parseInlineFormatting(trimmed, products, onSelectProduct)}
      </p>
    );
  }

  flushList();

  return (
    <div className={`formatted-description space-y-1.5 ${className}`}>
      {elements}
    </div>
  );
}
