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
    .replace(/^\s*[•\-\*]\s+/gm, '')
    .replace(/^\s*\d+[\.\)]\s+/gm, '')
    .trim();
}

/**
 * FormattedDescription Component
 * Renders rich text description supporting bold, italic, underline, colors, highlight, nested bullet lists, and nested numbered lists.
 */
export default function FormattedDescription({ text = '', className = '' }) {
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
                <span className="flex-1">{parseInlineFormatting(item.content)}</span>
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
                <span className="flex-1">{parseInlineFormatting(item.content)}</span>
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
        {parseInlineFormatting(trimmed)}
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
