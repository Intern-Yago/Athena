import React, { useState, useRef } from 'react';
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
  ChevronDown
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

  // Helper to wrap or insert text at current selection in textarea
  const applyFormatting = (before, after = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);

    let replacement = '';
    let newCursorPos = start;

    if (selectedText) {
      replacement = `${before}${selectedText}${after}`;
      newCursorPos = start + replacement.length;
    } else {
      // If nothing selected, insert sample placeholder or empty tags
      const defaultSample = before.includes('•') || before.includes('1.') ? 'Item' : 'texto';
      replacement = `${before}${defaultSample}${after}`;
      newCursorPos = start + before.length + defaultSample.length;
    }

    const updatedValue = value.substring(0, start) + replacement + value.substring(end);
    onChange(updatedValue);

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 10);
  };

  // Helper to apply bullet or numbered list to multi-line selection
  const applyListFormatting = (type = 'bullet') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);

    if (!selectedText) {
      const linePrefix = type === 'bullet' ? '• ' : '1. ';
      applyFormatting(linePrefix, '');
      return;
    }

    const lines = selectedText.split('\n');
    const formattedLines = lines.map((line, idx) => {
      const clean = line.replace(/^[•\-\*]\s+/, '').replace(/^\d+[\.\)]\s+/, '');
      const prefix = type === 'bullet' ? '• ' : `${idx + 1}. `;
      return `${prefix}${clean}`;
    });

    const replacement = formattedLines.join('\n');
    const updatedValue = value.substring(0, start) + replacement + value.substring(end);
    onChange(updatedValue);

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(start, start + replacement.length);
      }
    }, 10);
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
      .replace(/__(.*?)__/g, '$1');

    const updatedValue = value.substring(0, start) + cleaned + value.substring(end);
    onChange(updatedValue);

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(start, start + cleaned.length);
      }
    }, 10);
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

      {/* Editor Container */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs focus-within:border-amber-500 focus-within:ring-1 focus-within:ring-amber-500 transition-all">
        {/* Word-style Rich Text Toolbar */}
        <div className="bg-slate-50/90 p-1.5 border-b border-slate-200 flex flex-wrap items-center gap-1 select-none text-xs">
          {/* Bold Button */}
          <button
            type="button"
            onClick={() => applyFormatting('**', '**')}
            title="Negrito (**texto**)"
            className="w-7 h-7 rounded-lg hover:bg-slate-200/80 text-slate-700 hover:text-slate-950 flex items-center justify-center font-black transition-colors"
          >
            <Bold className="w-3.5 h-3.5 stroke-[2.8]" />
          </button>

          {/* Italic Button */}
          <button
            type="button"
            onClick={() => applyFormatting('*', '*')}
            title="Itálico (*texto*)"
            className="w-7 h-7 rounded-lg hover:bg-slate-200/80 text-slate-700 hover:text-slate-950 flex items-center justify-center transition-colors"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>

          {/* Underline Button */}
          <button
            type="button"
            onClick={() => applyFormatting('<u>', '</u>')}
            title="Sublinhado (<u>texto</u>)"
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
            rows={5}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full p-3 text-xs text-slate-800 placeholder-slate-400 border-none outline-none resize-y min-h-[120px] font-sans leading-relaxed focus:ring-0"
          />
        ) : (
          <div className="p-4 bg-slate-50 min-h-[120px] text-xs">
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

      <p className="text-[10px] text-slate-400">
        Dica: Selecione o texto e use a barra de ferramentas para aplicar <strong>Negrito</strong>, <em>Itálico</em>, <u>Sublinhado</u>, cores, marcadores e listas.
      </p>
    </div>
  );
}
