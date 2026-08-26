import React from 'react';

/**
 * Strips rich text formatting tags for plain text contexts (e.g. search, cards line-clamp, meta tags).
 */
export function stripFormattingTags(text = '') {
  if (!text) return '';
  return text
    .replace(/\[color=[^\]]+\](.*?)\[\/color\]/gi, '$1')
    .replace(/\[cor=[^\]]+\](.*?)\[\/cor\]/gi, '$1')
    .replace(/\[destaque\](.*?)\[\/destaque\]/gi, '$1')
    .replace(/\[highlight\](.*?)\[\/highlight\]/gi, '$1')
    .replace(/<color:[^>]+>(.*?)<\/color>/gi, '$1')
    .replace(/<mark>(.*?)<\/mark>/gi, '$1')
    .replace(/<\/?(b|i|u|strong|em|p|span)>/gi, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/^[•\-\*]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '')
    .trim();
}

/**
 * Parses inline formatting (bold, italic, underline, colors, highlight) into React nodes.
 */
function parseInlineFormatting(text) {
  if (!text) return null;

  // Tokenize the line into formatting markers
  // Supports: **bold**, *italic*, <u>underline</u>, [color=...], [cor=...], [destaque], <color:...>, <mark>
  const tokens = [];
  let remaining = text;

  const patterns = [
    { type: 'bold', regex: /^(\*\*(.+?)\*\*|<b>(.+?)<\/b>|<strong>(.+?)<\/strong>)/ },
    { type: 'italic', regex: /^(\*(.+?)\*|<i>(.+?)<\/i>|<em>(.+?)<\/em>)/ },
    { type: 'underline', regex: /^(<u>(.+?)<\/u>|__(.+?)__)/ },
    { type: 'color', regex: /^(\[(?:color|cor)=([a-zA-Z0-9_\-]+)\](.*?)\[\/(?:color|cor)\]|<color:([a-zA-Z0-9_\-]+)>(.*?)<\/color>)/ },
    { type: 'highlight', regex: /^(\[(?:destaque|highlight)\](.*?)\[\/(?:destaque|highlight)\]|<mark>(.*?)<\/mark>)/ }
  ];

  let keyCounter = 0;

  while (remaining.length > 0) {
    let matched = false;

    for (const { type, regex } of patterns) {
      const match = remaining.match(regex);
      if (match) {
        matched = true;
        const fullMatch = match[0];
        keyCounter++;

        if (type === 'bold') {
          const content = match[2] || match[3] || match[4];
          tokens.push(
            <strong key={keyCounter} className="font-bold text-slate-900">
              {parseInlineFormatting(content)}
            </strong>
          );
        } else if (type === 'italic') {
          const content = match[2] || match[3] || match[4];
          tokens.push(
            <em key={keyCounter} className="italic text-slate-800">
              {parseInlineFormatting(content)}
            </em>
          );
        } else if (type === 'underline') {
          const content = match[2] || match[3];
          tokens.push(
            <u key={keyCounter} className="underline decoration-amber-500/70 underline-offset-2">
              {parseInlineFormatting(content)}
            </u>
          );
        } else if (type === 'color') {
          const colorName = (match[2] || match[4] || '').toLowerCase();
          const content = match[3] || match[5] || '';
          
          let colorClass = 'text-amber-700 font-bold';
          if (colorName === 'azul' || colorName === 'blue' || colorName === 'sky') {
            colorClass = 'text-sky-700 font-bold';
          } else if (colorName === 'verde' || colorName === 'green' || colorName === 'emerald') {
            colorClass = 'text-emerald-700 font-bold';
          } else if (colorName === 'vermelho' || colorName === 'red') {
            colorClass = 'text-red-700 font-bold';
          } else if (colorName === 'cinza' || colorName === 'gray' || colorName === 'slate') {
            colorClass = 'text-slate-600 font-bold';
          } else if (colorName === 'preto' || colorName === 'black') {
            colorClass = 'text-slate-950 font-extrabold';
          }

          tokens.push(
            <span key={keyCounter} className={colorClass}>
              {parseInlineFormatting(content)}
            </span>
          );
        } else if (type === 'highlight') {
          const content = match[2] || match[3] || '';
          tokens.push(
            <mark key={keyCounter} className="bg-amber-100 text-amber-950 px-1.5 py-0.5 rounded font-bold border border-amber-300/60 not-italic inline-block my-0.5">
              {parseInlineFormatting(content)}
            </mark>
          );
        }

        remaining = remaining.slice(fullMatch.length);
        break;
      }
    }

    if (!matched) {
      // Find the next index of any formatting trigger character
      const nextSpecial = remaining.search(/[\*<\[_]/);
      if (nextSpecial === -1) {
        tokens.push(remaining);
        remaining = '';
      } else if (nextSpecial === 0) {
        // First char triggered no regex match, consume 1 char as plain text
        tokens.push(remaining[0]);
        remaining = remaining.slice(1);
      } else {
        tokens.push(remaining.slice(0, nextSpecial));
        remaining = remaining.slice(nextSpecial);
      }
    }
  }

  return tokens;
}

/**
 * FormattedDescription Component
 * Renders rich text description supporting bold, italic, underline, colors, highlight, bullet lists, and numbered lists.
 */
export default function FormattedDescription({ text = '', className = '' }) {
  if (!text || !text.trim()) {
    return null;
  }

  const rawLines = text.split(/\r?\n/);
  const elements = [];
  let currentList = null; // { type: 'bullet' | 'ordered', items: [] }

  const flushList = () => {
    if (!currentList) return;
    const listIndex = elements.length;
    if (currentList.type === 'bullet') {
      elements.push(
        <ul key={`list-${listIndex}`} className="space-y-1.5 my-2.5 pl-1">
          {currentList.items.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 text-slate-700 leading-relaxed">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-2 shrink-0" />
              <span className="flex-1">{parseInlineFormatting(item)}</span>
            </li>
          ))}
        </ul>
      );
    } else if (currentList.type === 'ordered') {
      elements.push(
        <ol key={`list-${listIndex}`} className="space-y-1.5 my-2.5 pl-1">
          {currentList.items.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2.5 text-slate-700 leading-relaxed">
              <span className="w-4.5 h-4.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300/70 text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <span className="flex-1">{parseInlineFormatting(item)}</span>
            </li>
          ))}
        </ol>
      );
    }
    currentList = null;
  };

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i].trim();

    if (!line) {
      flushList();
      continue;
    }

    // Check if line is a bullet point: starts with • or - or * (when followed by space)
    const bulletMatch = line.match(/^[•\-\*]\s+(.*)$/);
    if (bulletMatch) {
      if (currentList && currentList.type !== 'bullet') {
        flushList();
      }
      if (!currentList) {
        currentList = { type: 'bullet', items: [] };
      }
      currentList.items.push(bulletMatch[1]);
      continue;
    }

    // Check if line is a numbered list: starts with 1. or 2) etc.
    const orderedMatch = line.match(/^(\d+)[\.\)]\s+(.*)$/);
    if (orderedMatch) {
      if (currentList && currentList.type !== 'ordered') {
        flushList();
      }
      if (!currentList) {
        currentList = { type: 'ordered', items: [] };
      }
      currentList.items.push(orderedMatch[2]);
      continue;
    }

    // Regular text paragraph
    flushList();
    elements.push(
      <p key={`p-${elements.length}`} className="leading-relaxed my-1.5 text-slate-700">
        {parseInlineFormatting(line)}
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
