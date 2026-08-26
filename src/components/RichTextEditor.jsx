import React, { useState, useRef, useEffect } from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  Highlighter, 
  Eraser, 
  Eye, 
  Edit3, 
  Sparkles,
  ChevronDown,
  Indent,
  Outdent,
  Undo2,
  Redo2,
  HelpCircle
} from 'lucide-react';
import FormattedDescription from './FormattedDescription';

export default function RichTextEditor({
  value = '',
  onChange,
  onOptimize,
  placeholder = 'Descreva as características técnicas e comerciais do produto...'
}) {
  const textareaRef = useRef(null);
  const [activeTab, setActiveTab] = useState('write'); // 'write' | 'preview'
  const [showColorMenu, setShowColorMenu] = useState(false);
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);

  // Undo / Redo History Stack
  const historyRef = useRef([value]);
  const historyIndexRef = useRef(0);
  const isInternalChangeRef = useRef(false);

  useEffect(() => {
    if (isInternalChangeRef.current) {
      isInternalChangeRef.current = false;
      return;
    }
    const history = historyRef.current;
    const currentIndex = historyIndexRef.current;
    if (history[currentIndex] !== value) {
      const newHistory = history.slice(0, currentIndex + 1);
      newHistory.push(value);
      if (newHistory.length > 50) newHistory.shift();
      historyRef.current = newHistory;
      historyIndexRef.current = newHistory.length - 1;
    }
  }, [value]);

  const updateWithHistory = (newValue, newCursorPos = null, newCursorEnd = null) => {
    isInternalChangeRef.current = true;
    const history = historyRef.current.slice(0, historyIndexRef.current + 1);
    history.push(newValue);
    if (history.length > 50) history.shift();
    historyRef.current = history;
    historyIndexRef.current = history.length - 1;
    onChange(newValue);

    if (newCursorPos !== null) {
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(
            newCursorPos,
            newCursorEnd !== null ? newCursorEnd : newCursorPos
          );
        }
      }, 0);
    }
  };

  const handleUndo = () => {
    if (historyIndexRef.current > 0) {
      historyIndexRef.current--;
      const prevVal = historyRef.current[historyIndexRef.current];
      isInternalChangeRef.current = true;
      onChange(prevVal);
    }
  };

  const handleRedo = () => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyIndexRef.current++;
      const nextVal = historyRef.current[historyIndexRef.current];
      isInternalChangeRef.current = true;
      onChange(nextVal);
    }
  };

  // Helper to wrap or insert formatting at selection
  const applyFormatting = (before, after = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);

    let replacement = '';
    let newCursorStart = start;
    let newCursorEnd = start;

    if (selectedText) {
      replacement = `${before}${selectedText}${after}`;
      newCursorStart = start + before.length;
      newCursorEnd = newCursorStart + selectedText.length;
    } else {
      const defaultSample = before.includes('•') || before.includes('1.') ? 'Item' : 'texto';
      replacement = `${before}${defaultSample}${after}`;
      newCursorStart = start + before.length;
      newCursorEnd = newCursorStart + defaultSample.length;
    }

    const updatedValue = value.substring(0, start) + replacement + value.substring(end);
    updateWithHistory(updatedValue, newCursorStart, newCursorEnd);
  };

  // Helper to handle Indentation (Tab / Indent button) & Outdentation (Shift+Tab / Outdent button)
  const handleIndent = (isOutdent = false) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const { selectionStart, selectionEnd } = textarea;
    const text = value;

    // Find start and end line boundaries of current selection
    const lineStart = text.lastIndexOf('\n', selectionStart - 1) + 1;
    let lineEnd = text.indexOf('\n', selectionEnd);
    if (lineEnd === -1) lineEnd = text.length;

    const selectedBlock = text.substring(lineStart, lineEnd);
    const lines = selectedBlock.split('\n');

    let startOffsetDelta = 0;
    let totalLengthDelta = 0;

    let modifiedLines = [];
    if (isOutdent) {
      // Remove up to 2 leading spaces
      modifiedLines = lines.map((line, idx) => {
        if (line.startsWith('  ')) {
          if (idx === 0) startOffsetDelta = -2;
          return line.substring(2);
        } else if (line.startsWith(' ')) {
          if (idx === 0) startOffsetDelta = -1;
          return line.substring(1);
        }
        return line;
      });
    } else {
      // Add 2 spaces indentation
      modifiedLines = lines.map((line, idx) => {
        if (idx === 0) startOffsetDelta = 2;
        return '  ' + line;
      });
    }

    const replacement = modifiedLines.join('\n');
    totalLengthDelta = replacement.length - selectedBlock.length;
    const updatedValue = text.substring(0, lineStart) + replacement + text.substring(lineEnd);

    let newSelStart = Math.max(lineStart, selectionStart + startOffsetDelta);
    let newSelEnd = selectionStart === selectionEnd
      ? newSelStart
      : Math.max(newSelStart, selectionEnd + totalLengthDelta);

    updateWithHistory(updatedValue, newSelStart, newSelEnd);
  };

  // Helper to apply bullet or numbered list to current line or selection
  const applyListFormatting = (type = 'bullet') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const { selectionStart, selectionEnd } = textarea;
    const text = value;

    const lineStart = text.lastIndexOf('\n', selectionStart - 1) + 1;
    let lineEnd = text.indexOf('\n', selectionEnd);
    if (lineEnd === -1) lineEnd = text.length;

    const selectedBlock = text.substring(lineStart, lineEnd);
    const lines = selectedBlock.split('\n');

    let counter = 1;
    const formattedLines = lines.map((line) => {
      const match = line.match(/^(\s*)(?:[•\-\*]|\d+[\.\)])\s*(.*)$/);
      const indent = match ? match[1] : (line.match(/^(\s*)/)[1] || '');
      const content = match ? match[2] : line.trimStart();

      const prefix = type === 'bullet' ? '• ' : `${counter++}. `;
      return `${indent}${prefix}${content}`;
    });

    const replacement = formattedLines.join('\n');
    const updatedValue = text.substring(0, lineStart) + replacement + text.substring(lineEnd);
    updateWithHistory(updatedValue, lineStart, lineStart + replacement.length);
  };

  // Helper to re-sync sequential numbers in numbered lists
  const syncNumberedList = () => {
    const lines = value.split('\n');
    let counter = 1;
    let inNumberedList = false;

    const synced = lines.map((line) => {
      const numMatch = line.match(/^(\s*)(\d+)[\.\)]\s*(.*)$/);
      if (numMatch) {
        inNumberedList = true;
        const indent = numMatch[1];
        const content = numMatch[3];
        const res = `${indent}${counter}. ${content}`;
        counter++;
        return res;
      } else {
        if (!line.trim()) {
          inNumberedList = false;
          counter = 1;
        }
        return line;
      }
    });

    const newValue = synced.join('\n');
    if (newValue !== value) {
      updateWithHistory(newValue);
    }
  };

  // Helper to clear formatting tags from selection
  const clearFormatting = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    if (!selectedText) return;

    const cleaned = selectedText
      .replace(/\[color=[^\]]+\](.*?)\[\/color\]/gi, '$1')
      .replace(/\[cor=[^\]]+\](.*?)\[\/cor\]/gi, '$1')
      .replace(/\[destaque\](.*?)\[\/destaque\]/gi, '$1')
      .replace(/\[highlight\](.*?)\[\/highlight\]/gi, '$1')
      .replace(/<\/?(b|i|u|strong|em|p|span)>/gi, '')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/__(.*?)__/g, '$1')
      .replace(/^\s*[•\-\*]\s+/gm, '')
      .replace(/^\s*\d+[\.\)]\s+/gm, '');

    const updatedValue = value.substring(0, start) + cleaned + value.substring(end);
    updateWithHistory(updatedValue, start, start + cleaned.length);
  };

  // Smart Word-style keyboard shortcuts and interactions
  const handleKeyDown = (e) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const { selectionStart, selectionEnd } = textarea;
    const isSingleCursor = selectionStart === selectionEnd;

    // 1. Undo / Redo Shortcuts (Ctrl+Z / Ctrl+Y / Ctrl+Shift+Z)
    if ((e.ctrlKey || e.metaKey) && !e.altKey) {
      const key = e.key.toLowerCase();
      if (key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
        return;
      }
      if (key === 'y') {
        e.preventDefault();
        handleRedo();
        return;
      }
      // Rich Text Shortcuts
      if (key === 'b') {
        e.preventDefault();
        applyFormatting('**', '**');
        return;
      }
      if (key === 'i') {
        e.preventDefault();
        applyFormatting('*', '*');
        return;
      }
      if (key === 'u') {
        e.preventDefault();
        applyFormatting('<u>', '</u>');
        return;
      }
      if (key === 'h' || key === 'k') {
        e.preventDefault();
        applyFormatting('[destaque]', '[/destaque]');
        return;
      }
    }

    // 2. Tab & Shift+Tab (Indentar / Recuar)
    if (e.key === 'Tab') {
      e.preventDefault();
      handleIndent(e.shiftKey);
      return;
    }

    // 3. Enter Key (Continuar Lista & Sair no Enter Duplo / Item Vazio)
    if (e.key === 'Enter' && !e.shiftKey) {
      const textBefore = value.substring(0, selectionStart);
      const textAfter = value.substring(selectionEnd);
      const lineStart = textBefore.lastIndexOf('\n') + 1;
      const currentLine = textBefore.substring(lineStart);

      const bulletMatch = currentLine.match(/^(\s*)([•\-\*])\s*(.*)$/);
      const numberMatch = currentLine.match(/^(\s*)(\d+)[\.\)]\s*(.*)$/);

      // Bullet item handling on Enter
      if (bulletMatch) {
        const [_, indent, bulletChar, content] = bulletMatch;

        // If line is empty bullet (Enter duplo ou Enter em item vazio)
        if (!content.trim()) {
          e.preventDefault();
          if (indent.length >= 2) {
            // Unindent by 2 spaces (recuar nível)
            const newIndent = indent.slice(2);
            const newLine = `${newIndent}• `;
            const updatedValue = value.substring(0, lineStart) + newLine + textAfter;
            updateWithHistory(updatedValue, lineStart + newLine.length);
          } else {
            // Exit list completely (sair do modelo de lista)
            const updatedValue = value.substring(0, lineStart) + textAfter;
            updateWithHistory(updatedValue, lineStart);
          }
          return;
        }

        // Line has content -> Continue bullet on new line
        e.preventDefault();
        const insertion = `\n${indent}• `;
        const updatedValue = textBefore + insertion + textAfter;
        updateWithHistory(updatedValue, selectionStart + insertion.length);
        return;
      }

      // Numbered item handling on Enter
      if (numberMatch) {
        const [_, indent, numStr, content] = numberMatch;
        const currentNum = parseInt(numStr, 10);

        // If line is empty numbered item (Enter duplo ou Enter em item vazio)
        if (!content.trim()) {
          e.preventDefault();
          if (indent.length >= 2) {
            // Unindent by 2 spaces (recuar nível)
            const newIndent = indent.slice(2);
            const newLine = `${newIndent}1. `;
            const updatedValue = value.substring(0, lineStart) + newLine + textAfter;
            updateWithHistory(updatedValue, lineStart + newLine.length);
          } else {
            // Exit list completely (sair do modelo de lista)
            const updatedValue = value.substring(0, lineStart) + textAfter;
            updateWithHistory(updatedValue, lineStart);
          }
          return;
        }

        // Line has content -> Continue next number
        e.preventDefault();
        const nextNum = currentNum + 1;
        const insertion = `\n${indent}${nextNum}. `;
        const updatedValue = textBefore + insertion + textAfter;
        updateWithHistory(updatedValue, selectionStart + insertion.length);
        return;
      }
    }

    // 4. Backspace Key (Apagar no início do item da lista)
    if (e.key === 'Backspace' && isSingleCursor) {
      const textBefore = value.substring(0, selectionStart);
      const textAfter = value.substring(selectionEnd);
      const lineStart = textBefore.lastIndexOf('\n') + 1;
      const currentLine = textBefore.substring(lineStart);

      const emptyBulletMatch = currentLine.match(/^(\s*)([•\-\*])\s*$/);
      const emptyNumberMatch = currentLine.match(/^(\s*)(\d+)[\.\)]\s*$/);

      // Backspace on empty marker
      if (emptyBulletMatch || emptyNumberMatch) {
        e.preventDefault();
        const indent = (emptyBulletMatch || emptyNumberMatch)[1];
        if (indent.length >= 2) {
          // Unindent
          const marker = emptyBulletMatch ? '• ' : '1. ';
          const newLine = `${indent.slice(2)}${marker}`;
          const updatedValue = value.substring(0, lineStart) + newLine + textAfter;
          updateWithHistory(updatedValue, lineStart + newLine.length);
        } else {
          // Remove list marker completely
          const updatedValue = value.substring(0, lineStart) + textAfter;
          updateWithHistory(updatedValue, lineStart);
        }
        return;
      }
    }

    // 5. Space Key (Auto-formatação ao digitar como no Word / Markdown)
    if (e.key === ' ' && isSingleCursor) {
      const textBefore = value.substring(0, selectionStart);
      const textAfter = value.substring(selectionEnd);
      const lineStart = textBefore.lastIndexOf('\n') + 1;
      const currentLine = textBefore.substring(lineStart);

      // Typing "- " or "* " or "+ " converts to "• "
      const rawBulletMatch = currentLine.match(/^(\s*)([\-\*\+])$/);
      if (rawBulletMatch) {
        e.preventDefault();
        const indent = rawBulletMatch[1];
        const newLine = `${indent}• `;
        const updatedValue = value.substring(0, lineStart) + newLine + textAfter;
        updateWithHistory(updatedValue, lineStart + newLine.length);
        return;
      }

      // Typing "1." or "1)" converts to "1. "
      const rawNumberMatch = currentLine.match(/^(\s*)(\d+)[\.\)]$/);
      if (rawNumberMatch) {
        e.preventDefault();
        const indent = rawNumberMatch[1];
        const num = rawNumberMatch[2];
        const newLine = `${indent}${num}. `;
        const updatedValue = value.substring(0, lineStart) + newLine + textAfter;
        updateWithHistory(updatedValue, lineStart + newLine.length);
        return;
      }
    }
  };

  return (
    <div className="space-y-2">
      {/* Top Header with Tab Switcher & Quick Optimizer */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('write')}
            className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'write'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Editar</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'preview'
                ? 'bg-white text-amber-800 shadow-xs font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-amber-600" />
            <span>Pré-visualizar</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowShortcutsHelp(!showShortcutsHelp)}
            className="text-[11px] font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors"
            title="Ver atalhos do teclado estilo Word"
          >
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            <span>Atalhos Word</span>
          </button>

          {onOptimize && value && value.trim().length > 5 && (
            <button
              type="button"
              onClick={onOptimize}
              className="text-[11px] font-bold text-amber-800 hover:text-amber-950 bg-amber-50 hover:bg-amber-100/90 px-2.5 py-1 rounded-lg border border-amber-300 inline-flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
              title="Corrige o texto e extrai medidas e especificações automaticamente para a tabela abaixo"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Otimizar Texto e Especificações</span>
            </button>
          )}
        </div>
      </div>

      {/* Shortcuts Helper Panel */}
      {showShortcutsHelp && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-[11px] text-slate-600 space-y-1.5 shadow-2xs">
          <div className="flex items-center justify-between font-bold text-slate-800 border-b border-slate-200 pb-1 mb-1">
            <span>Produtividade Estilo Word:</span>
            <button
              type="button"
              onClick={() => setShowShortcutsHelp(false)}
              className="text-slate-400 hover:text-slate-700 text-xs"
            >
              Fechar
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
            <div><kbd className="px-1.5 py-0.5 bg-white rounded border border-slate-300 font-mono text-[10px]">Enter</kbd> : Continua a lista na linha de baixo</div>
            <div><kbd className="px-1.5 py-0.5 bg-white rounded border border-slate-300 font-mono text-[10px]">Enter Duplo</kbd> : Sai do modelo de lista</div>
            <div><kbd className="px-1.5 py-0.5 bg-white rounded border border-slate-300 font-mono text-[10px]">Tab</kbd> : Avança o recuo do item (sub-item)</div>
            <div><kbd className="px-1.5 py-0.5 bg-white rounded border border-slate-300 font-mono text-[10px]">Shift + Tab</kbd> : Volta o recuo do item</div>
            <div><kbd className="px-1.5 py-0.5 bg-white rounded border border-slate-300 font-mono text-[10px]">Backspace</kbd> : Apaga o marcador ou recuo vazio</div>
            <div><kbd className="px-1.5 py-0.5 bg-white rounded border border-slate-300 font-mono text-[10px]">- + Espaço</kbd> : Cria marcador automaticamente</div>
            <div><kbd className="px-1.5 py-0.5 bg-white rounded border border-slate-300 font-mono text-[10px]">Ctrl + B</kbd> : Negrito / <kbd className="px-1.5 py-0.5 bg-white rounded border border-slate-300 font-mono text-[10px]">Ctrl + I</kbd> : Itálico</div>
            <div><kbd className="px-1.5 py-0.5 bg-white rounded border border-slate-300 font-mono text-[10px]">Ctrl + Z</kbd> : Desfazer / <kbd className="px-1.5 py-0.5 bg-white rounded border border-slate-300 font-mono text-[10px]">Ctrl + Y</kbd> : Refazer</div>
          </div>
        </div>
      )}

      {/* Editor Container */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs focus-within:border-amber-500 focus-within:ring-1 focus-within:ring-amber-500 transition-all">
        {/* Word-style Rich Text Toolbar */}
        <div className="bg-slate-50/90 p-1.5 border-b border-slate-200 flex flex-wrap items-center gap-1 select-none text-xs">
          
          {/* Undo / Redo */}
          <button
            type="button"
            onClick={handleUndo}
            title="Desfazer (Ctrl+Z)"
            className="w-7 h-7 rounded-lg hover:bg-slate-200/80 text-slate-700 hover:text-slate-950 flex items-center justify-center transition-colors"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleRedo}
            title="Refazer (Ctrl+Y)"
            className="w-7 h-7 rounded-lg hover:bg-slate-200/80 text-slate-700 hover:text-slate-950 flex items-center justify-center transition-colors"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>

          <div className="h-4 w-px bg-slate-300 mx-0.5" />

          {/* Bold Button */}
          <button
            type="button"
            onClick={() => applyFormatting('**', '**')}
            title="Negrito (Ctrl+B)"
            className="w-7 h-7 rounded-lg hover:bg-slate-200/80 text-slate-700 hover:text-slate-950 flex items-center justify-center font-black transition-colors"
          >
            <Bold className="w-3.5 h-3.5 stroke-[2.8]" />
          </button>

          {/* Italic Button */}
          <button
            type="button"
            onClick={() => applyFormatting('*', '*')}
            title="Itálico (Ctrl+I)"
            className="w-7 h-7 rounded-lg hover:bg-slate-200/80 text-slate-700 hover:text-slate-950 flex items-center justify-center transition-colors"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>

          {/* Underline Button */}
          <button
            type="button"
            onClick={() => applyFormatting('<u>', '</u>')}
            title="Sublinhado (Ctrl+U)"
            className="w-7 h-7 rounded-lg hover:bg-slate-200/80 text-slate-700 hover:text-slate-950 flex items-center justify-center transition-colors"
          >
            <Underline className="w-3.5 h-3.5" />
          </button>

          {/* Highlight Button */}
          <button
            type="button"
            onClick={() => applyFormatting('[destaque]', '[/destaque]')}
            title="Destaque com fundo amarelo ([destaque]texto[/destaque])"
            className="w-7 h-7 rounded-lg hover:bg-amber-100 text-amber-800 flex items-center justify-center transition-colors"
          >
            <Highlighter className="w-3.5 h-3.5 text-amber-600" />
          </button>

          <div className="h-4 w-px bg-slate-300 mx-0.5" />

          {/* Bullet List Button */}
          <button
            type="button"
            onClick={() => applyListFormatting('bullet')}
            title="Lista com marcadores (• item)"
            className="w-7 h-7 rounded-lg hover:bg-slate-200/80 text-slate-700 hover:text-slate-950 flex items-center justify-center transition-colors"
          >
            <List className="w-3.5 h-3.5" />
          </button>

          {/* Numbered List Button */}
          <button
            type="button"
            onClick={() => applyListFormatting('ordered')}
            title="Lista numerada (1. item)"
            className="w-7 h-7 rounded-lg hover:bg-slate-200/80 text-slate-700 hover:text-slate-950 flex items-center justify-center transition-colors"
          >
            <ListOrdered className="w-3.5 h-3.5" />
          </button>

          {/* Indent Forward (Tab) Button */}
          <button
            type="button"
            onClick={() => handleIndent(false)}
            title="Avançar Recuo (Tab)"
            className="w-7 h-7 rounded-lg hover:bg-slate-200/80 text-slate-700 hover:text-slate-950 flex items-center justify-center transition-colors"
          >
            <Indent className="w-3.5 h-3.5" />
          </button>

          {/* Outdent Back (Shift+Tab) Button */}
          <button
            type="button"
            onClick={() => handleIndent(true)}
            title="Diminuir Recuo (Shift+Tab)"
            className="w-7 h-7 rounded-lg hover:bg-slate-200/80 text-slate-700 hover:text-slate-950 flex items-center justify-center transition-colors"
          >
            <Outdent className="w-3.5 h-3.5" />
          </button>

          <div className="h-4 w-px bg-slate-300 mx-0.5" />

          {/* Text Color Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowColorMenu(!showColorMenu)}
              title="Cor do Texto"
              className="h-7 px-2 rounded-lg hover:bg-slate-200/80 text-slate-700 hover:text-slate-950 flex items-center gap-1 font-bold text-[11px] transition-colors"
            >
              <span className="w-3 h-3 rounded-full bg-amber-600 inline-block" />
              <span>Cor</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showColorMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowColorMenu(false)}
                />
                <div className="absolute top-full left-0 mt-1 w-36 bg-white rounded-xl shadow-lg border border-slate-200 p-1.5 z-50 space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      applyFormatting('[cor=ambar]', '[/cor]');
                      setShowColorMenu(false);
                    }}
                    className="w-full text-left px-2 py-1 rounded-lg hover:bg-amber-50 text-[11px] font-bold text-amber-700 flex items-center gap-2"
                  >
                    <span className="w-3 h-3 rounded-full bg-amber-600 shrink-0" />
                    <span>Dourado / Âmbar</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      applyFormatting('[cor=azul]', '[/cor]');
                      setShowColorMenu(false);
                    }}
                    className="w-full text-left px-2 py-1 rounded-lg hover:bg-sky-50 text-[11px] font-bold text-sky-700 flex items-center gap-2"
                  >
                    <span className="w-3 h-3 rounded-full bg-sky-600 shrink-0" />
                    <span>Azul</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      applyFormatting('[cor=verde]', '[/cor]');
                      setShowColorMenu(false);
                    }}
                    className="w-full text-left px-2 py-1 rounded-lg hover:bg-emerald-50 text-[11px] font-bold text-emerald-700 flex items-center gap-2"
                  >
                    <span className="w-3 h-3 rounded-full bg-emerald-600 shrink-0" />
                    <span>Verde</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      applyFormatting('[cor=vermelho]', '[/cor]');
                      setShowColorMenu(false);
                    }}
                    className="w-full text-left px-2 py-1 rounded-lg hover:bg-red-50 text-[11px] font-bold text-red-700 flex items-center gap-2"
                  >
                    <span className="w-3 h-3 rounded-full bg-red-600 shrink-0" />
                    <span>Vermelho</span>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Clear Formatting Button */}
          <button
            type="button"
            onClick={clearFormatting}
            title="Limpar Formatação do texto selecionado"
            className="w-7 h-7 rounded-lg hover:bg-slate-200/80 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors ml-auto"
          >
            <Eraser className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Editor Body */}
        {activeTab === 'write' ? (
          <textarea
            ref={textareaRef}
            rows={8}
            placeholder={placeholder}
            value={value}
            onKeyDown={handleKeyDown}
            onChange={(e) => updateWithHistory(e.target.value)}
            className="w-full p-3.5 text-xs text-slate-800 placeholder-slate-400 border-none outline-none resize-y min-h-[180px] font-sans leading-relaxed focus:ring-0"
          />
        ) : (
          <div className="p-4 bg-slate-50 min-h-[180px] text-xs">
            {value && value.trim() ? (
              <FormattedDescription text={value} />
            ) : (
              <span className="text-slate-400 italic">Nenhum texto informado para pré-visualização.</span>
            )}
          </div>
        )}
      </div>

      {/* Live Preview footer when in write mode */}
      {activeTab === 'write' && value && (value.includes('**') || value.includes('*') || value.includes('•') || value.includes('1.') || value.includes('[cor=') || value.includes('[destaque]')) && (
        <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/70 text-xs">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 block mb-1.5">
            Pré-visualização em Tempo Real:
          </span>
          <FormattedDescription text={value} />
        </div>
      )}

      <div className="flex items-center justify-between text-[10px] text-slate-400">
        <span>
          Digite <kbd className="px-1 py-0.2 bg-slate-100 rounded border font-mono">- </kbd> para iniciar lista, <kbd className="px-1 py-0.2 bg-slate-100 rounded border font-mono">Tab</kbd> para avançar recuo, <kbd className="px-1 py-0.2 bg-slate-100 rounded border font-mono">Enter duplo</kbd> para sair.
        </span>
        <button
          type="button"
          onClick={syncNumberedList}
          className="text-amber-700 hover:text-amber-900 font-bold hover:underline"
          title="Recalcula a numeração sequencial das listas numeradas"
        >
          Renumerar Lista
        </button>
      </div>
    </div>
  );
}
