import React, { useState, useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Link as LinkIcon,
  Image as ImageIcon,
  Package,
  Minus,
  Undo2,
  Redo2,
  Plus,
  Eye,
  Edit3,
  Check,
  X,
  Search,
  Sparkles,
  Type
} from 'lucide-react';

/**
 * Converte conteúdo armazenado (HTML, Markdown ou BlockNote JSON) para HTML limpo compatível com Tiptap
 */
export function normalizeContentToHtml(rawContent, rawHtml) {
  if (rawHtml && typeof rawHtml === 'string' && rawHtml.trim().length > 0) {
    return rawHtml;
  }

  if (!rawContent) return '';

  // Se for array de blocos (BlockNote JSON ou Tiptap JSON)
  if (Array.isArray(rawContent)) {
    return blocksArrayToHtml(rawContent);
  }

  if (typeof rawContent === 'object' && rawContent.type === 'doc' && Array.isArray(rawContent.content)) {
    return '';
  }

  if (typeof rawContent === 'string') {
    const trimmed = rawContent.trim();
    if (!trimmed) return '';

    // Verifica se é JSON serializado
    if ((trimmed.startsWith('[') && trimmed.endsWith(']')) || (trimmed.startsWith('{') && trimmed.endsWith('}'))) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return blocksArrayToHtml(parsed);
        }
      } catch {
        // Segue como string normal
      }
    }

    // Se já parece HTML
    if (/<(p|h[1-6]|ul|ol|li|blockquote|div|strong|em|img)\b/i.test(trimmed)) {
      return trimmed;
    }

    // Converte Markdown simples para HTML
    return simpleMarkdownToHtml(trimmed);
  }

  return '';
}

function blocksArrayToHtml(blocks) {
  return blocks
    .map((b) => {
      if (!b || typeof b !== 'object') return '';
      const text = extractInlineText(b.content);
      if (b.type === 'heading') {
        const lvl = b.props?.level || 2;
        return `<h${lvl}>${text}</h${lvl}>`;
      }
      if (b.type === 'bulletListItem') return `<ul><li>${text}</li></ul>`;
      if (b.type === 'numberedListItem') return `<ol><li>${text}</ol></li>`;
      if (b.type === 'blockquote') return `<blockquote><p>${text}</p></blockquote>`;
      if (b.type === 'image' && b.props?.url) {
        return `<img src="${b.props.url}" alt="${b.props.caption || ''}" />`;
      }
      return text ? `<p>${text}</p>` : '';
    })
    .filter(Boolean)
    .join('\n');
}

function extractInlineText(content) {
  if (!content) return '';
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content
      .map((item) => {
        if (typeof item === 'string') return item;
        let t = item?.text || '';
        if (item?.styles?.bold) t = `<strong>${t}</strong>`;
        if (item?.styles?.italic) t = `<em>${t}</em>`;
        if (item?.styles?.underline) t = `<u>${t}</u>`;
        return t;
      })
      .join('');
  }
  return '';
}

function simpleMarkdownToHtml(md) {
  const lines = md.split('\n');
  const htmlLines = [];
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) {
      if (inList) {
        htmlLines.push('</ul>');
        inList = false;
      }
      continue;
    }
    if (line === '---') {
      if (inList) { htmlLines.push('</ul>'); inList = false; }
      htmlLines.push('<hr />');
      continue;
    }
    if (line.startsWith('### ')) {
      if (inList) { htmlLines.push('</ul>'); inList = false; }
      htmlLines.push(`<h3>${formatInlineMd(line.slice(4))}</h3>`);
      continue;
    }
    if (line.startsWith('## ')) {
      if (inList) { htmlLines.push('</ul>'); inList = false; }
      htmlLines.push(`<h2>${formatInlineMd(line.slice(3))}</h2>`);
      continue;
    }
    if (line.startsWith('# ')) {
      if (inList) { htmlLines.push('</ul>'); inList = false; }
      htmlLines.push(`<h2>${formatInlineMd(line.slice(2))}</h2>`);
      continue;
    }
    if (line.startsWith('- ') || line.startsWith('* ')) {
      if (!inList) {
        htmlLines.push('<ul>');
        inList = true;
      }
      htmlLines.push(`<li>${formatInlineMd(line.slice(2))}</li>`);
      continue;
    }
    if (inList) {
      htmlLines.push('</ul>');
      inList = false;
    }
    htmlLines.push(`<p>${formatInlineMd(line)}</p>`);
  }
  if (inList) htmlLines.push('</ul>');
  return htmlLines.join('\n');
}

function formatInlineMd(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
}

export default function TiptapBlogEditor({
  initialHtml = '',
  onChangeHtml,
  products = [],
  onRequestImageFromLibrary,
  placeholder = 'Comece a escrever seu artigo técnico aqui ou clique no botão "+" para inserir blocos estilo Gutenberg (Títulos, Imagens, Listas, Citações ou Equipamentos do Catálogo)...'
}) {
  const [activeMode, setActiveMode] = useState('visual'); // 'visual' | 'preview'
  const [showBlockMenu, setShowBlockMenu] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [showProductModal, setShowProductModal] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [statusAnnouncement, setStatusAnnouncement] = useState('');

  const toolbarRef = useRef(null);
  const blockMenuRef = useRef(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3, 4]
        },
        link: {
          openOnClick: false,
          HTMLAttributes: {
            class: 'text-amber-600 font-bold underline hover:text-amber-700 cursor-pointer'
          }
        }
      }),
      Image.configure({
        inline: false,
        allowBase64: false,
        HTMLAttributes: {
          class: 'rounded-2xl max-w-full h-auto my-6 border border-slate-200 shadow-sm mx-auto block'
        }
      }),
      Placeholder.configure({
        placeholder
      })
    ],
    content: initialHtml || '<p></p>',
    editorProps: {
      attributes: {
        class: 'tiptap-editor-canvas focus:outline-none min-h-[420px] px-6 sm:px-10 py-6 text-slate-800 leading-relaxed text-sm sm:text-base'
      }
    },
    onUpdate: ({ editor: ed }) => {
      const html = ed.getHTML();
      if (onChangeHtml) {
        onChangeHtml(html);
      }
    }
  });

  // Atualiza conteúdo se o post em edição mudar externamente
  useEffect(() => {
    if (editor && initialHtml !== undefined) {
      const currentHtml = editor.getHTML();
      if (initialHtml && currentHtml !== initialHtml && (currentHtml === '<p></p>' || !editor.isFocused)) {
        editor.commands.setContent(initialHtml, false);
      }
    }
  }, [initialHtml, editor]);

  // Fallback roving tabindex para role="toolbar" quando focusgroup não é nativamente suportado
  useEffect(() => {
    const bar = toolbarRef.current;
    if (!bar || 'focusGroup' in HTMLElement.prototype) return;

    const getItems = () => Array.from(bar.querySelectorAll('button:not([disabled])'));
    const items = getItems();
    items.forEach((b, i) => {
      b.tabIndex = i === 0 ? 0 : -1;
    });

    const handleFocusIn = ({ target }) => {
      const currentItems = getItems();
      if (currentItems.includes(target)) {
        currentItems.forEach((b) => {
          b.tabIndex = b === target ? 0 : -1;
        });
      }
    };

    const handleKeyDown = (e) => {
      const currentItems = getItems();
      const idx = currentItems.indexOf(document.activeElement);
      if (idx === -1) return;

      let nextIdx = null;
      if (e.key === 'ArrowRight') {
        nextIdx = (idx + 1) % currentItems.length;
      } else if (e.key === 'ArrowLeft') {
        nextIdx = (idx - 1 + currentItems.length) % currentItems.length;
      } else if (e.key === 'Home') {
        nextIdx = 0;
      } else if (e.key === 'End') {
        nextIdx = currentItems.length - 1;
      }

      if (nextIdx !== null) {
        e.preventDefault();
        currentItems[nextIdx]?.focus();
      }
    };

    bar.addEventListener('focusin', handleFocusIn);
    bar.addEventListener('keydown', handleKeyDown);
    return () => {
      bar.removeEventListener('focusin', handleFocusIn);
      bar.removeEventListener('keydown', handleKeyDown);
    };
  }, [editor]);

  // Fecha menu de blocos ao clicar fora
  useEffect(() => {
    const handleOutside = (e) => {
      if (blockMenuRef.current && !blockMenuRef.current.contains(e.target)) {
        setShowBlockMenu(false);
      }
    };
    if (showBlockMenu) {
      document.addEventListener('mousedown', handleOutside);
    }
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [showBlockMenu]);

  if (!editor) {
    return (
      <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-500">
        Inicializando editor visual de blocos...
      </div>
    );
  }

  const handleOpenLinkDialog = () => {
    const previousUrl = editor.getAttributes('link').href || '';
    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to, ' ');
    setLinkUrl(previousUrl);
    setLinkText(selectedText || '');
    setShowLinkModal(true);
  };

  const handleConfirmLink = (e) => {
    e.preventDefault();
    if (!linkUrl.trim()) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      setShowLinkModal(false);
      return;
    }

    const cleanUrl = linkUrl.trim();
    const { from, to } = editor.state.selection;
    const hasSelection = from !== to;

    if (!hasSelection && linkText.trim()) {
      editor
        .chain()
        .focus()
        .insertContent(`<a href="${cleanUrl}">${linkText.trim()}</a> `)
        .run();
    } else {
      editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .setLink({ href: cleanUrl })
        .run();
    }

    setShowLinkModal(false);
    setLinkUrl('');
    setLinkText('');
    setStatusAnnouncement('Link inserido no artigo');
  };

  const handleConfirmImage = (e) => {
    e.preventDefault();
    if (!imageUrl.trim()) return;
    editor
      .chain()
      .focus()
      .setImage({
        src: imageUrl.trim(),
        alt: imageAlt.trim() || 'Imagem técnica Athena',
        title: imageAlt.trim() || ''
      })
      .run();
    setShowImageModal(false);
    setImageUrl('');
    setImageAlt('');
    setStatusAnnouncement('Imagem adicionada ao artigo');
  };

  const handleInsertProductBox = (prod) => {
    if (!prod) return;
    const prodUrl = `/produto/${prod.slug || prod.id}`;
    const htmlBlock = `
      <blockquote>
        <p><strong>Equipamento Recomendado Athena:</strong> <a href="${prodUrl}">${prod.name}</a></p>
        <p>Confira especificações técnicas completas, garantia oficial e condições especiais para oficinas no catálogo da Athena Soluções Automotivas.</p>
      </blockquote>
      <p></p>
    `;
    editor.chain().focus().insertContent(htmlBlock).run();
    setShowProductModal(false);
    setProductSearch('');
    setStatusAnnouncement(`Produto ${prod.name} inserido no artigo`);
  };

  const handleInsertCalloutBlock = () => {
    const htmlBlock = `
      <blockquote>
        <p><strong>Dica Técnica de Oficina:</strong> Descreva aqui uma recomendação importante de diagnóstico ou ponto de atenção para o reparador.</p>
      </blockquote>
      <p></p>
    `;
    editor.chain().focus().insertContent(htmlBlock).run();
    setShowBlockMenu(false);
  };

  const filteredProducts = products
    .filter((p) => {
      if (!productSearch.trim()) return true;
      const q = productSearch.toLowerCase();
      return (
        (p.name || '').toLowerCase().includes(q) ||
        (p.sku || '').toLowerCase().includes(q) ||
        (p.brand || '').toLowerCase().includes(q)
      );
    })
    .slice(0, 12);

  return (
    <div className="rounded-2xl border border-slate-300 bg-white shadow-sm overflow-visible flex flex-col">
      {/* Live Region para Leitores de Tela (WCAG Toolbar) */}
      <p role="status" className="sr-only">
        {statusAnnouncement}
      </p>

      {/* Barra de Ferramentas Superior Fixa (Estilo Gutenberg / Tiptap) */}
      <div
        ref={toolbarRef}
        role="toolbar"
        {...({ focusgroup: 'toolbar wrap' })}
        aria-label="Formatação do artigo e inserção de blocos"
        className="sticky top-0 z-20 bg-slate-50/95 backdrop-blur-md border-b border-slate-200 px-3 py-2 flex flex-wrap items-center justify-between gap-2 rounded-t-2xl"
      >
        <div className="flex flex-wrap items-center gap-1">
          {/* Botão Gutenberg "+" Inserir Bloco */}
          <div className="relative" ref={blockMenuRef}>
            <button
              type="button"
              onClick={() => setShowBlockMenu((prev) => !prev)}
              aria-label="Inserir novo bloco de conteúdo"
              title="Inserir Bloco (Estilo Gutenberg)"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs transition cursor-pointer shadow-2xs mr-1"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
              <span>Bloco</span>
            </button>

            {showBlockMenu && (
              <div className="absolute left-0 top-full mt-2 w-72 bg-white rounded-2xl border border-slate-200 shadow-2xl p-2 z-50 space-y-1">
                <div className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Blocos de Estrutura e Mídia
                </div>

                <button
                  type="button"
                  onClick={() => {
                    editor.chain().focus().toggleHeading({ level: 2 }).run();
                    setShowBlockMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-amber-50 text-left transition cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-amber-100 text-slate-700 group-hover:text-amber-800 flex items-center justify-center shrink-0">
                    <Heading2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Título de Seção (H2)</span>
                    <span className="text-[10px] text-slate-500">Subtítulo principal indexado no sumário</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    editor.chain().focus().toggleHeading({ level: 3 }).run();
                    setShowBlockMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-amber-50 text-left transition cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-amber-100 text-slate-700 group-hover:text-amber-800 flex items-center justify-center shrink-0">
                    <Heading3 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Subtítulo Menor (H3)</span>
                    <span className="text-[10px] text-slate-500">Para dividir tópicos técnicos</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    editor.chain().focus().toggleBulletList().run();
                    setShowBlockMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-amber-50 text-left transition cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-amber-100 text-slate-700 group-hover:text-amber-800 flex items-center justify-center shrink-0">
                    <List className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Lista com Marcadores</span>
                    <span className="text-[10px] text-slate-500">Ideal para características e benefícios</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    editor.chain().focus().toggleOrderedList().run();
                    setShowBlockMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-amber-50 text-left transition cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-amber-100 text-slate-700 group-hover:text-amber-800 flex items-center justify-center shrink-0">
                    <ListOrdered className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Passo a Passo Numerado</span>
                    <span className="text-[10px] text-slate-500">Procedimentos de calibração ou teste</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={handleInsertCalloutBlock}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-amber-50 text-left transition cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Destaque / Dica Técnica</span>
                    <span className="text-[10px] text-slate-500">Caixa destacada para avisos de oficina</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowBlockMenu(false);
                    if (onRequestImageFromLibrary) {
                      onRequestImageFromLibrary((selectedUrl) => {
                        if (selectedUrl) {
                          editor.chain().focus().setImage({ src: selectedUrl, alt: 'Imagem técnica Athena' }).run();
                        }
                      });
                    } else {
                      setShowImageModal(true);
                    }
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-amber-50 text-left transition cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                    <ImageIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Imagem da Biblioteca R2 / URL</span>
                    <span className="text-[10px] text-slate-500">Insira fotos no meio do artigo</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowBlockMenu(false);
                    setShowProductModal(true);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-amber-50 text-left transition cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                    <Package className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Card de Equipamento Athena</span>
                    <span className="text-[10px] text-slate-500">Link direto para produto do catálogo</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    editor.chain().focus().setHorizontalRule().run();
                    setShowBlockMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-amber-50 text-left transition cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                    <Minus className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Divisor de Seção</span>
                    <span className="text-[10px] text-slate-500">Linha horizontal separadora</span>
                  </div>
                </button>
              </div>
            )}
          </div>

          <span role="separator" aria-orientation="vertical" className="h-5 w-px bg-slate-200 mx-1" />

          {/* Grupo: Títulos e Parágrafo */}
          <div role="group" aria-label="Cabeçalhos e texto" className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={() => editor.chain().focus().setParagraph().run()}
              aria-pressed={editor.isActive('paragraph')}
              aria-label="Parágrafo normal"
              title="Texto Normal (Parágrafo)"
              className={`min-w-7 min-h-7 px-2 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                editor.isActive('paragraph')
                  ? 'bg-slate-900 text-amber-400 shadow-2xs'
                  : 'text-slate-700 hover:bg-slate-200/70'
              }`}
            >
              <Type className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">Texto</span>
            </button>

            <button
              type="button"
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              aria-pressed={editor.isActive('heading', { level: 2 })}
              aria-label="Título H2"
              title="Título Principal da Seção (H2)"
              className={`min-w-7 min-h-7 px-2 py-1 rounded-lg text-xs font-extrabold transition cursor-pointer flex items-center gap-1 ${
                editor.isActive('heading', { level: 2 })
                  ? 'bg-slate-900 text-amber-400 shadow-2xs'
                  : 'text-slate-700 hover:bg-slate-200/70'
              }`}
            >
              <Heading2 className="w-4 h-4" aria-hidden="true" />
              <span>H2</span>
            </button>

            <button
              type="button"
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              aria-pressed={editor.isActive('heading', { level: 3 })}
              aria-label="Subtítulo H3"
              title="Subtítulo Secundário (H3)"
              className={`min-w-7 min-h-7 px-2 py-1 rounded-lg text-xs font-extrabold transition cursor-pointer flex items-center gap-1 ${
                editor.isActive('heading', { level: 3 })
                  ? 'bg-slate-900 text-amber-400 shadow-2xs'
                  : 'text-slate-700 hover:bg-slate-200/70'
              }`}
            >
              <Heading3 className="w-4 h-4" aria-hidden="true" />
              <span>H3</span>
            </button>
          </div>

          <span role="separator" aria-orientation="vertical" className="h-5 w-px bg-slate-200 mx-1" />

          {/* Grupo: Estilo de Fonte */}
          <div role="group" aria-label="Formatação de texto" className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBold().run()}
              aria-pressed={editor.isActive('bold')}
              aria-label="Negrito"
              title="Negrito (Ctrl+B)"
              className={`min-w-7 min-h-7 p-1.5 rounded-lg transition cursor-pointer ${
                editor.isActive('bold')
                  ? 'bg-slate-900 text-amber-400 shadow-2xs'
                  : 'text-slate-700 hover:bg-slate-200/70'
              }`}
            >
              <Bold className="w-4 h-4" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              aria-pressed={editor.isActive('italic')}
              aria-label="Itálico"
              title="Itálico (Ctrl+I)"
              className={`min-w-7 min-h-7 p-1.5 rounded-lg transition cursor-pointer ${
                editor.isActive('italic')
                  ? 'bg-slate-900 text-amber-400 shadow-2xs'
                  : 'text-slate-700 hover:bg-slate-200/70'
              }`}
            >
              <Italic className="w-4 h-4" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              aria-pressed={editor.isActive('underline')}
              aria-label="Sublinhado"
              title="Sublinhado (Ctrl+U)"
              className={`min-w-7 min-h-7 p-1.5 rounded-lg transition cursor-pointer ${
                editor.isActive('underline')
                  ? 'bg-slate-900 text-amber-400 shadow-2xs'
                  : 'text-slate-700 hover:bg-slate-200/70'
              }`}
            >
              <Underline className="w-4 h-4" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={() => editor.chain().focus().toggleStrike().run()}
              aria-pressed={editor.isActive('strike')}
              aria-label="Tachado"
              title="Texto Tachado"
              className={`min-w-7 min-h-7 p-1.5 rounded-lg transition cursor-pointer ${
                editor.isActive('strike')
                  ? 'bg-slate-900 text-amber-400 shadow-2xs'
                  : 'text-slate-700 hover:bg-slate-200/70'
              }`}
            >
              <Strikethrough className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>

          <span role="separator" aria-orientation="vertical" className="h-5 w-px bg-slate-200 mx-1" />

          {/* Grupo: Listas e Blocos */}
          <div role="group" aria-label="Listas e citações" className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              aria-pressed={editor.isActive('bulletList')}
              aria-label="Lista com marcadores"
              title="Lista com Marcadores"
              className={`min-w-7 min-h-7 p-1.5 rounded-lg transition cursor-pointer ${
                editor.isActive('bulletList')
                  ? 'bg-slate-900 text-amber-400 shadow-2xs'
                  : 'text-slate-700 hover:bg-slate-200/70'
              }`}
            >
              <List className="w-4 h-4" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              aria-pressed={editor.isActive('orderedList')}
              aria-label="Lista numerada"
              title="Lista Numerada (Passo a Passo)"
              className={`min-w-7 min-h-7 p-1.5 rounded-lg transition cursor-pointer ${
                editor.isActive('orderedList')
                  ? 'bg-slate-900 text-amber-400 shadow-2xs'
                  : 'text-slate-700 hover:bg-slate-200/70'
              }`}
            >
              <ListOrdered className="w-4 h-4" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              aria-pressed={editor.isActive('blockquote')}
              aria-label="Citação ou Destaque"
              title="Bloco de Citação / Destaque Técnico"
              className={`min-w-7 min-h-7 p-1.5 rounded-lg transition cursor-pointer ${
                editor.isActive('blockquote')
                  ? 'bg-slate-900 text-amber-400 shadow-2xs'
                  : 'text-slate-700 hover:bg-slate-200/70'
              }`}
            >
              <Quote className="w-4 h-4" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              aria-pressed={editor.isActive('codeBlock')}
              aria-label="Bloco de código ou diagnóstico"
              title="Bloco de Código / Leitura de Scanner"
              className={`min-w-7 min-h-7 p-1.5 rounded-lg transition cursor-pointer ${
                editor.isActive('codeBlock')
                  ? 'bg-slate-900 text-amber-400 shadow-2xs'
                  : 'text-slate-700 hover:bg-slate-200/70'
              }`}
            >
              <Code className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>

          <span role="separator" aria-orientation="vertical" className="h-5 w-px bg-slate-200 mx-1" />

          {/* Grupo: Inserções Rápidas (Link, Imagem, Produto) */}
          <div role="group" aria-label="Inserir mídia e links" className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={handleOpenLinkDialog}
              aria-pressed={editor.isActive('link')}
              aria-label="Inserir ou editar link"
              title="Inserir Link"
              className={`min-w-7 min-h-7 p-1.5 rounded-lg transition cursor-pointer ${
                editor.isActive('link')
                  ? 'bg-slate-900 text-amber-400 shadow-2xs'
                  : 'text-slate-700 hover:bg-slate-200/70'
              }`}
            >
              <LinkIcon className="w-4 h-4" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={() => setShowImageModal(true)}
              aria-label="Inserir imagem no artigo"
              title="Inserir Imagem no Corpo do Artigo"
              className="min-w-7 min-h-7 p-1.5 rounded-lg text-slate-700 hover:bg-slate-200/70 transition cursor-pointer"
            >
              <ImageIcon className="w-4 h-4" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={() => setShowProductModal(true)}
              aria-label="Inserir equipamento do catálogo"
              title="Inserir Card de Produto Athena"
              className="min-w-7 min-h-7 px-2 py-1 rounded-lg text-xs font-bold text-amber-800 bg-amber-100/80 hover:bg-amber-200/80 transition cursor-pointer flex items-center gap-1 ml-0.5"
            >
              <Package className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="hidden md:inline">Produto</span>
            </button>
          </div>

          <span role="separator" aria-orientation="vertical" className="h-5 w-px bg-slate-200 mx-1" />

          {/* Grupo: Desfazer / Refazer */}
          <div role="group" aria-label="Histórico" className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={() => editor.chain().focus().undo().run()}
              aria-disabled={!editor.can().undo()}
              aria-label="Desfazer"
              title="Desfazer (Ctrl+Z)"
              className="min-w-7 min-h-7 p-1.5 rounded-lg text-slate-700 hover:bg-slate-200/70 aria-disabled:opacity-35 transition cursor-pointer"
            >
              <Undo2 className="w-4 h-4" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={() => editor.chain().focus().redo().run()}
              aria-disabled={!editor.can().redo()}
              aria-label="Refazer"
              title="Refazer (Ctrl+Y)"
              className="min-w-7 min-h-7 p-1.5 rounded-lg text-slate-700 hover:bg-slate-200/70 aria-disabled:opacity-35 transition cursor-pointer"
            >
              <Redo2 className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Alternador entre Editor Visual e Pré-visualização de Leitura */}
        <div role="group" aria-label="Modo de visualização" className="flex items-center bg-slate-200/70 p-0.5 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveMode('visual')}
            aria-pressed={activeMode === 'visual'}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition cursor-pointer ${
              activeMode === 'visual'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Edit3 className="w-3 h-3" aria-hidden="true" />
            <span>Editor Visual</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('preview')}
            aria-pressed={activeMode === 'preview'}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition cursor-pointer ${
              activeMode === 'preview'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Eye className="w-3 h-3" aria-hidden="true" />
            <span>Prévia Real</span>
          </button>
        </div>
      </div>

      {/* Área de Edição estilo Gutenberg ou Pré-visualização */}
      {activeMode === 'visual' ? (
        <div
          onClick={() => {
            if (!editor.isFocused) {
              editor.commands.focus();
            }
          }}
          className="bg-white cursor-text rounded-b-2xl"
        >
          <EditorContent editor={editor} />
        </div>
      ) : (
        <div className="p-6 sm:p-10 bg-slate-50/50 min-h-[420px] rounded-b-2xl">
          <div className="max-w-2xl mx-auto bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="text-[10px] font-black uppercase tracking-wider text-amber-600 mb-4 pb-2 border-b border-slate-100 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" />
              <span>Pré-visualização de Como o Artigo Aparecerá no Site</span>
            </div>
            <div
              className="tiptap-editor-canvas prose max-w-none text-slate-800 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: editor.getHTML() }}
            />
          </div>
        </div>
      )}

      {/* Rodapé informativo do Editor */}
      <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 rounded-b-2xl flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
        <span>
          Dica: Use <strong>H2</strong> para criar seções que entram automaticamente no sumário <em>"Neste Artigo"</em>.
        </span>
        <span className="font-semibold text-slate-600">
          Editor Visual em Blocos (Tiptap / Gutenberg)
        </span>
      </div>

      {/* Modal de Inserção de Link */}
      {showLinkModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-amber-600" />
                <span>Inserir Link no Artigo</span>
              </h4>
              <button
                type="button"
                onClick={() => setShowLinkModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Texto do Link (Opcional)</label>
                <input
                  type="text"
                  placeholder="Ex: Ver Scanner EAATA 90"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  className="form-input text-xs w-full rounded-xl"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">URL de Destino *</label>
                <input
                  type="url"
                  placeholder="https://athenaconsultoria.com.br/produto/..."
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="form-input text-xs w-full rounded-xl"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              {editor.isActive('link') && (
                <button
                  type="button"
                  onClick={() => {
                    editor.chain().focus().unsetLink().run();
                    setShowLinkModal(false);
                  }}
                  className="px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl mr-auto cursor-pointer"
                >
                  Remover Link
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowLinkModal(false)}
                className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmLink}
                className="btn-gold text-xs font-bold py-2 px-4 rounded-xl cursor-pointer"
              >
                Aplicar Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Inserção de Imagem no Corpo do Artigo */}
      {showImageModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-amber-600" />
                <span>Inserir Imagem no Artigo</span>
              </h4>
              <button
                type="button"
                onClick={() => setShowImageModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {onRequestImageFromLibrary && (
                <button
                  type="button"
                  onClick={() => {
                    setShowImageModal(false);
                    onRequestImageFromLibrary((selectedUrl) => {
                      if (selectedUrl) {
                        editor.chain().focus().setImage({ src: selectedUrl, alt: imageAlt || 'Imagem técnica Athena' }).run();
                      }
                    });
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition"
                >
                  <ImageIcon className="w-4 h-4 text-amber-600" />
                  <span>Escolher Foto da Biblioteca Cloudflare R2</span>
                </button>
              )}

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Ou cole a URL da Imagem (HTTPS) *</label>
                <input
                  type="url"
                  placeholder="https://images.athenaconsultoria.com.br/..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="form-input text-xs w-full rounded-xl"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Descrição da Imagem (Alt Text SEO)</label>
                <input
                  type="text"
                  placeholder="Ex: Tela de topologia de rede do scanner EAATA 90"
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                  className="form-input text-xs w-full rounded-xl"
                />
              </div>

              {imageUrl && (
                <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-900 aspect-[16/9] max-h-40 flex items-center justify-center">
                  <img
                    src={imageUrl}
                    alt="Prévia"
                    className="max-h-40 w-auto object-contain"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowImageModal(false)}
                className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmImage}
                disabled={!imageUrl.trim()}
                className="btn-gold text-xs font-bold py-2 px-4 rounded-xl cursor-pointer disabled:opacity-40"
              >
                Inserir Imagem
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Inserção de Card de Produto do Catálogo */}
      {showProductModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Package className="w-4 h-4 text-amber-600" />
                <span>Vincular Equipamento do Catálogo no Texto</span>
              </h4>
              <button
                type="button"
                onClick={() => setShowProductModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar equipamento pelo nome, marca ou código..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="form-input text-xs !pl-9 w-full rounded-xl"
                autoFocus
              />
            </div>

            <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 border border-slate-100 rounded-xl">
              {filteredProducts.length === 0 ? (
                <p className="p-4 text-center text-xs text-slate-400">Nenhum equipamento encontrado.</p>
              ) : (
                filteredProducts.map((prod) => (
                  <button
                    key={prod.id}
                    type="button"
                    onClick={() => handleInsertProductBox(prod)}
                    className="w-full p-2.5 hover:bg-amber-50 flex items-center gap-3 text-left transition cursor-pointer"
                  >
                    {prod.image && (
                      <img
                        src={prod.image}
                        alt=""
                        className="w-10 h-10 rounded-lg object-contain bg-white border border-slate-200 p-0.5 shrink-0"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-bold text-slate-900 block truncate">{prod.name}</span>
                      <span className="text-[10px] text-slate-500 block truncate">
                        {prod.brand || 'Athena'} {prod.sku ? `• SKU: ${prod.sku}` : ''}
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-amber-600 shrink-0">Inserir +</span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
