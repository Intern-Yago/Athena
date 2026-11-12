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
  X,
  Search,
  Sparkles,
  Type,
  MousePointerClick,
  AlertTriangle,
  CheckCircle2,
  Layers
} from 'lucide-react';

/**
 * Converte conteúdo armazenado (HTML, Markdown ou BlockNote JSON) para HTML limpo compatível com Tiptap
 */
export function normalizeContentToHtml(rawContent, rawHtml) {
  if (rawHtml && typeof rawHtml === 'string' && rawHtml.trim().length > 0) {
    return rawHtml;
  }

  if (!rawContent) return '';

  if (Array.isArray(rawContent)) {
    return blocksArrayToHtml(rawContent);
  }

  if (typeof rawContent === 'object' && rawContent.type === 'doc' && Array.isArray(rawContent.content)) {
    return '';
  }

  if (typeof rawContent === 'string') {
    const trimmed = rawContent.trim();
    if (!trimmed) return '';

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

    if (/<(p|h[1-6]|ul|ol|li|blockquote|div|strong|em|img)\b/i.test(trimmed)) {
      return trimmed;
    }

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
  title = '',
  onChangeTitle,
  summary = '',
  onChangeSummary,
  initialHtml = '',
  onChangeHtml,
  products = [],
  onRequestImageFromLibrary,
  placeholder = 'Comece a escrever seu parágrafo aqui ou clique em "+ Adicionar Bloco" para inserir Títulos, Imagens, Botões CTA, Alertas ou Cards de Equipamento...'
}) {
  const [activeMode, setActiveMode] = useState('visual'); // 'visual' | 'preview'
  const [showBlockMenu, setShowBlockMenu] = useState(false);

  // Modal de Link
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');

  // Modal de Botão CTA (Estilo WordPress Gutenberg Button Block)
  const [showCtaModal, setShowCtaModal] = useState(false);
  const [ctaLabel, setCtaLabel] = useState('Falar com Consultor Técnico');
  const [ctaUrl, setCtaUrl] = useState('https://wa.me/5561983485671');

  // Modal de Imagem
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');

  // Modal de Card de Equipamento Configurável (Substitui o card engessado antigo)
  const [showProductModal, setShowProductModal] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [selectedProdForBlock, setSelectedProdForBlock] = useState(null);
  const [prodBlockBadge, setProdBlockBadge] = useState('Equipamento em Destaque');
  const [prodBlockTitle, setProdBlockTitle] = useState('');
  const [prodBlockDesc, setProdBlockDesc] = useState(
    'Garanta o equipamento mencionado neste artigo com garantia oficial de fábrica, treinamento operacional e condições exclusivas de parcelamento.'
  );
  const [prodBlockBtnText, setProdBlockBtnText] = useState('Ver Condições Especiais');

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
        class: 'tiptap-editor-canvas focus:outline-none min-h-[460px] text-slate-800 leading-relaxed text-sm sm:text-base'
      }
    },
    onUpdate: ({ editor: ed }) => {
      const html = ed.getHTML();
      if (onChangeHtml) {
        onChangeHtml(html);
      }
    }
  });

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
        Inicializando construtor de páginas WordPress / Gutenberg...
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

  const handleConfirmCtaButton = (e) => {
    e.preventDefault();
    if (!ctaUrl.trim() || !ctaLabel.trim()) return;
    const html = `<p><a href="${ctaUrl.trim()}" class="athena-blog-cta-btn">${ctaLabel.trim()} &rarr;</a></p><p></p>`;
    editor.chain().focus().insertContent(html).run();
    setShowCtaModal(false);
    setStatusAnnouncement('Botão CTA inserido na página');
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
    setStatusAnnouncement('Imagem adicionada à página');
  };

  const handleSelectProdForConfig = (prod) => {
    setSelectedProdForBlock(prod);
    setProdBlockTitle(prod.name || 'Equipamento Athena');
    setProdBlockBadge('Equipamento em Destaque');
    setProdBlockDesc(
      'Garanta o equipamento mencionado neste artigo com garantia oficial de fábrica, treinamento operacional e condições exclusivas de parcelamento.'
    );
    setProdBlockBtnText('Ver Condições Especiais');
  };

  const handleConfirmProductBlock = (e) => {
    e.preventDefault();
    if (!selectedProdForBlock) return;
    const prodUrl = `/produto/${selectedProdForBlock.slug || selectedProdForBlock.id}`;
    const htmlBlock = `
      <blockquote>
        <p><strong>[${prodBlockBadge.trim() || 'Equipamento em Destaque'}] ${prodBlockTitle.trim()}</strong></p>
        <p>${prodBlockDesc.trim()}</p>
        <p><a href="${prodUrl}" class="athena-blog-cta-btn">${prodBlockBtnText.trim() || 'Ver Condições Especiais'} &rarr;</a></p>
      </blockquote>
      <p></p>
    `;
    editor.chain().focus().insertContent(htmlBlock).run();
    setShowProductModal(false);
    setSelectedProdForBlock(null);
    setProductSearch('');
    setStatusAnnouncement('Bloco de equipamento inserido na página');
  };

  const handleInsertCalloutBlock = (type = 'tip') => {
    let titlePrefix = 'Dica Técnica de Oficina:';
    let defaultBody = 'Descreva aqui uma recomendação importante de diagnóstico ou ponto de atenção para o reparador.';
    if (type === 'warning') {
      titlePrefix = 'Atenção Operacional:';
      defaultBody = 'Cuidado essencial durante o procedimento técnico ou manutenção do equipamento.';
    } else if (type === 'conclusion') {
      titlePrefix = 'Resumo & Veredito Técnico:';
      defaultBody = 'Síntese final sobre os ganhos de produtividade e retorno financeiro para a oficina.';
    }

    const htmlBlock = `
      <blockquote>
        <p><strong>${titlePrefix}</strong> ${defaultBody}</p>
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
    <div className="flex flex-col">
      {/* Live Region para Leitores de Tela (WCAG Toolbar) */}
      <p role="status" className="sr-only">
        {statusAnnouncement}
      </p>

      {/* Barra de Ferramentas Superior Fixa Estilo WordPress Gutenberg */}
      <div
        ref={toolbarRef}
        role="toolbar"
        {...({ focusgroup: 'toolbar wrap' })}
        aria-label="Construtor de blocos da página e formatação"
        className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border border-slate-200 px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-2 rounded-2xl shadow-sm mb-6"
      >
        <div className="flex flex-wrap items-center gap-1">
          {/* Botão WordPress "+" Inserir Bloco */}
          <div className="relative" ref={blockMenuRef}>
            <button
              type="button"
              onClick={() => setShowBlockMenu((prev) => !prev)}
              aria-label="Inserir novo bloco na página"
              title="Inserir Bloco (Estilo WordPress Gutenberg)"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs transition cursor-pointer shadow-xs mr-1"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
              <span>Inserir Bloco</span>
            </button>

            {showBlockMenu && (
              <div className="absolute left-0 top-full mt-2 w-80 bg-white rounded-2xl border border-slate-200 shadow-2xl p-3 z-50 space-y-2 max-h-[75vh] overflow-y-auto">
                <div className="px-2 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  1. Blocos de Texto & Títulos
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      editor.chain().focus().toggleHeading({ level: 2 }).run();
                      setShowBlockMenu(false);
                    }}
                    className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-amber-50 text-left transition cursor-pointer border border-transparent hover:border-amber-200"
                  >
                    <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center shrink-0">
                      <Heading2 className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">Título H2</span>
                      <span className="text-[10px] text-slate-500">Seção principal</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      editor.chain().focus().toggleHeading({ level: 3 }).run();
                      setShowBlockMenu(false);
                    }}
                    className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-amber-50 text-left transition cursor-pointer border border-transparent hover:border-amber-200"
                  >
                    <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center shrink-0">
                      <Heading3 className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">Subtítulo H3</span>
                      <span className="text-[10px] text-slate-500">Subseção</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      editor.chain().focus().toggleBulletList().run();
                      setShowBlockMenu(false);
                    }}
                    className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-amber-50 text-left transition cursor-pointer border border-transparent hover:border-amber-200"
                  >
                    <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center shrink-0">
                      <List className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">Lista Pontos</span>
                      <span className="text-[10px] text-slate-500">Marcadores</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      editor.chain().focus().toggleOrderedList().run();
                      setShowBlockMenu(false);
                    }}
                    className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-amber-50 text-left transition cursor-pointer border border-transparent hover:border-amber-200"
                  >
                    <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center shrink-0">
                      <ListOrdered className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">Numerada</span>
                      <span className="text-[10px] text-slate-500">Passo a passo</span>
                    </div>
                  </button>
                </div>

                <div className="px-2 pt-2 pb-1 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  2. Blocos Visuais, Mídia & Conversão
                </div>

                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      setShowBlockMenu(false);
                      setShowImageModal(true);
                    }}
                    className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-amber-50 text-left transition cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                      <ImageIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">Bloco de Imagem (R2 ou URL)</span>
                      <span className="text-[10px] text-slate-500">Insira fotos ou diagramas no meio da página</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowBlockMenu(false);
                      setShowCtaModal(true);
                    }}
                    className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-amber-50 text-left transition cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                      <MousePointerClick className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">Botão de Ação (CTA)</span>
                      <span className="text-[10px] text-slate-500">Botão destacado dourado com link customizável</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowBlockMenu(false);
                      setSelectedProdForBlock(null);
                      setShowProductModal(true);
                    }}
                    className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-amber-50 text-left transition cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                      <Package className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">Bloco de Equipamento em Destaque</span>
                      <span className="text-[10px] text-slate-500">Você escolhe o produto, título, texto e botão</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleInsertCalloutBlock('tip')}
                    className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-amber-50 text-left transition cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">Caixa de Dica Técnica</span>
                      <span className="text-[10px] text-slate-500">Quadro de destaque para recomendações</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleInsertCalloutBlock('warning')}
                    className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-amber-50 text-left transition cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">Caixa de Alerta / Cuidado</span>
                      <span className="text-[10px] text-slate-500">Aviso importante de segurança ou operação</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      editor.chain().focus().setHorizontalRule().run();
                      setShowBlockMenu(false);
                    }}
                    className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-amber-50 text-left transition cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                      <Minus className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">Divisor Horizontal de Seção</span>
                      <span className="text-[10px] text-slate-500">Linha separadora entre tópicos</span>
                    </div>
                  </button>
                </div>
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
              title="Parágrafo Normal"
              className={`min-w-7 min-h-7 px-2 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                editor.isActive('paragraph')
                  ? 'bg-slate-900 text-amber-400 shadow-2xs'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Type className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">Parágrafo</span>
            </button>

            <button
              type="button"
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              aria-pressed={editor.isActive('heading', { level: 2 })}
              aria-label="Título H2"
              title="Título de Seção (H2)"
              className={`min-w-7 min-h-7 px-2 py-1 rounded-lg text-xs font-extrabold transition cursor-pointer flex items-center gap-1 ${
                editor.isActive('heading', { level: 2 })
                  ? 'bg-slate-900 text-amber-400 shadow-2xs'
                  : 'text-slate-700 hover:bg-slate-100'
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
                  : 'text-slate-700 hover:bg-slate-100'
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
                  : 'text-slate-700 hover:bg-slate-100'
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
                  : 'text-slate-700 hover:bg-slate-100'
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
                  : 'text-slate-700 hover:bg-slate-100'
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
                  : 'text-slate-700 hover:bg-slate-100'
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
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <List className="w-4 h-4" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              aria-pressed={editor.isActive('orderedList')}
              aria-label="Lista numerada"
              title="Lista Numerada"
              className={`min-w-7 min-h-7 p-1.5 rounded-lg transition cursor-pointer ${
                editor.isActive('orderedList')
                  ? 'bg-slate-900 text-amber-400 shadow-2xs'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <ListOrdered className="w-4 h-4" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              aria-pressed={editor.isActive('blockquote')}
              aria-label="Citação ou Destaque"
              title="Bloco de Citação / Destaque"
              className={`min-w-7 min-h-7 p-1.5 rounded-lg transition cursor-pointer ${
                editor.isActive('blockquote')
                  ? 'bg-slate-900 text-amber-400 shadow-2xs'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Quote className="w-4 h-4" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              aria-pressed={editor.isActive('codeBlock')}
              aria-label="Bloco de código"
              title="Bloco de Código"
              className={`min-w-7 min-h-7 p-1.5 rounded-lg transition cursor-pointer ${
                editor.isActive('codeBlock')
                  ? 'bg-slate-900 text-amber-400 shadow-2xs'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Code className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>

          <span role="separator" aria-orientation="vertical" className="h-5 w-px bg-slate-200 mx-1" />

          {/* Grupo: Inserções Rápidas (Link, Imagem, Botão CTA, Produto) */}
          <div role="group" aria-label="Inserir elementos" className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={handleOpenLinkDialog}
              aria-pressed={editor.isActive('link')}
              aria-label="Inserir link"
              title="Inserir Link"
              className={`min-w-7 min-h-7 p-1.5 rounded-lg transition cursor-pointer ${
                editor.isActive('link')
                  ? 'bg-slate-900 text-amber-400 shadow-2xs'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <LinkIcon className="w-4 h-4" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={() => setShowImageModal(true)}
              aria-label="Inserir imagem"
              title="Inserir Imagem"
              className="min-w-7 min-h-7 p-1.5 rounded-lg text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              <ImageIcon className="w-4 h-4" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={() => setShowCtaModal(true)}
              aria-label="Inserir botão CTA"
              title="Inserir Botão de Ação (CTA)"
              className="min-w-7 min-h-7 px-2 py-1 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer flex items-center gap-1"
            >
              <MousePointerClick className="w-3.5 h-3.5 text-amber-600" aria-hidden="true" />
              <span className="hidden xl:inline">Botão CTA</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedProdForBlock(null);
                setShowProductModal(true);
              }}
              aria-label="Inserir bloco de equipamento"
              title="Inserir Card de Equipamento Configurável"
              className="min-w-7 min-h-7 px-2 py-1 rounded-lg text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 transition cursor-pointer flex items-center gap-1 ml-0.5"
            >
              <Package className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="hidden md:inline">+ Equipamento</span>
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
              className="min-w-7 min-h-7 p-1.5 rounded-lg text-slate-700 hover:bg-slate-100 aria-disabled:opacity-35 transition cursor-pointer"
            >
              <Undo2 className="w-4 h-4" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={() => editor.chain().focus().redo().run()}
              aria-disabled={!editor.can().redo()}
              aria-label="Refazer"
              title="Refazer (Ctrl+Y)"
              className="min-w-7 min-h-7 p-1.5 rounded-lg text-slate-700 hover:bg-slate-100 aria-disabled:opacity-35 transition cursor-pointer"
            >
              <Redo2 className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Alternador entre Construtor Visual e Pré-visualização Real */}
        <div role="group" aria-label="Modo de visualização" className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => setActiveMode('visual')}
            aria-pressed={activeMode === 'visual'}
            className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
              activeMode === 'visual'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Construtor</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('preview')}
            aria-pressed={activeMode === 'preview'}
            className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
              activeMode === 'preview'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Ver Página Pronta</span>
          </button>
        </div>
      </div>

      {/* FOLHA DE PÁGINA ESTILO WORDPRESS GUTENBERG (Canvas Unificado: Título + Lead + Conteúdo em Blocos) */}
      {activeMode === 'visual' ? (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-md px-6 sm:px-14 py-8 sm:py-12 space-y-6">
          {/* Bloco de Título Nativo Estilo WordPress */}
          <div className="space-y-3 border-b border-slate-100 pb-6">
            <textarea
              rows={2}
              placeholder="Adicionar título da página / artigo..."
              value={title}
              onChange={(e) => onChangeTitle && onChangeTitle(e.target.value)}
              className="w-full text-2xl sm:text-4xl font-black text-slate-950 placeholder:text-slate-300 border-0 focus:outline-none resize-none leading-tight tracking-tight bg-transparent"
            />

            <textarea
              rows={2}
              placeholder="Adicionar subtítulo ou resumo de abertura (aparece abaixo do título e na busca do Google)..."
              value={summary}
              onChange={(e) => onChangeSummary && onChangeSummary(e.target.value)}
              className="w-full text-sm sm:text-base font-medium text-slate-500 placeholder:text-slate-300 border-0 focus:outline-none resize-none leading-relaxed bg-transparent"
            />
          </div>

          {/* Corpo de Blocos da Página */}
          <div
            onClick={() => {
              if (!editor.isFocused) {
                editor.commands.focus();
              }
            }}
            className="cursor-text"
          >
            <EditorContent editor={editor} />
          </div>

          {/* Barra Rápida de Adição de Bloco no Final da Folha (Igual ao rodapé do WordPress) */}
          <div className="pt-6 border-t border-dashed border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-slate-400">
              Você tem controle 100% livre sobre o que aparece na página. Nenhum bloco extra será adicionado sem você pedir.
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className="px-3 py-1.5 rounded-xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50 text-xs font-bold text-slate-700 cursor-pointer transition flex items-center gap-1.5"
              >
                <Heading2 className="w-3.5 h-3.5 text-amber-600" />
                <span>+ Título H2</span>
              </button>
              <button
                type="button"
                onClick={() => setShowImageModal(true)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50 text-xs font-bold text-slate-700 cursor-pointer transition flex items-center gap-1.5"
              >
                <ImageIcon className="w-3.5 h-3.5 text-amber-600" />
                <span>+ Imagem</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedProdForBlock(null);
                  setShowProductModal(true);
                }}
                className="px-3 py-1.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-xs font-bold text-amber-900 cursor-pointer transition flex items-center gap-1.5"
              >
                <Package className="w-3.5 h-3.5 text-amber-700" />
                <span>+ Equipamento em Destaque</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-md px-6 sm:px-14 py-8 sm:py-12 space-y-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-black uppercase tracking-wider">
            <Eye className="w-3.5 h-3.5" />
            <span>Simulação Exata da Página Publicada</span>
          </div>

          <header className="space-y-3 border-b border-slate-200 pb-6">
            <h1 className="text-2xl sm:text-4xl font-black text-slate-950 leading-tight">
              {title || 'Título do Artigo'}
            </h1>
            {summary && (
              <p className="text-base text-slate-600 leading-relaxed font-medium">
                {summary}
              </p>
            )}
          </header>

          <div
            className="blog-article-content max-w-none text-slate-800 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: editor.getHTML() }}
          />
        </div>
      )}

      {/* Modal de Inserção de Link */}
      {showLinkModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-amber-600" />
                <span>Inserir Link no Texto</span>
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

      {/* Modal de Inserção de Botão de Ação (CTA) Estilo WordPress */}
      {showCtaModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <MousePointerClick className="w-4 h-4 text-amber-600" />
                <span>Criar Bloco de Botão (CTA)</span>
              </h4>
              <button
                type="button"
                onClick={() => setShowCtaModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Texto do Botão *</label>
                <input
                  type="text"
                  placeholder="Ex: Solicitar Orçamento no WhatsApp"
                  value={ctaLabel}
                  onChange={(e) => setCtaLabel(e.target.value)}
                  className="form-input text-xs w-full rounded-xl"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Link de Destino do Botão *</label>
                <input
                  type="text"
                  placeholder="https://wa.me/5561983485671 ou /produto/..."
                  value={ctaUrl}
                  onChange={(e) => setCtaUrl(e.target.value)}
                  className="form-input text-xs w-full rounded-xl"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCtaModal(false)}
                className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmCtaButton}
                className="btn-gold text-xs font-bold py-2 px-4 rounded-xl cursor-pointer"
              >
                Inserir Botão na Página
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
                <span>Inserir Bloco de Imagem</span>
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
                <label className="text-xs font-bold text-slate-700 block mb-1">Legenda / Alt Text (SEO)</label>
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

      {/* Modal de Bloco de Equipamento em Destaque (100% Configurável pelo Usuário) */}
      {showProductModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Package className="w-4 h-4 text-amber-600" />
                <span>
                  {selectedProdForBlock
                    ? 'Personalizar Textos do Card de Equipamento'
                    : 'Escolher Equipamento para Inserir no Artigo'}
                </span>
              </h4>
              <button
                type="button"
                onClick={() => {
                  setShowProductModal(false);
                  setSelectedProdForBlock(null);
                }}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {!selectedProdForBlock ? (
              <>
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
                        onClick={() => handleSelectProdForConfig(prod)}
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
                        <span className="text-[11px] font-bold text-amber-600 shrink-0">Configurar &rarr;</span>
                      </button>
                    ))
                  )}
                </div>
              </>
            ) : (
              <form onSubmit={handleConfirmProductBlock} className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Selo Superior (Badge)</label>
                  <input
                    type="text"
                    value={prodBlockBadge}
                    onChange={(e) => setProdBlockBadge(e.target.value)}
                    className="form-input text-xs w-full rounded-xl"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Título do Equipamento *</label>
                  <input
                    type="text"
                    required
                    value={prodBlockTitle}
                    onChange={(e) => setProdBlockTitle(e.target.value)}
                    className="form-input text-xs w-full rounded-xl"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Texto de Chamada *</label>
                  <textarea
                    rows={2}
                    required
                    value={prodBlockDesc}
                    onChange={(e) => setProdBlockDesc(e.target.value)}
                    className="form-textarea text-xs w-full rounded-xl"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Texto do Botão</label>
                  <input
                    type="text"
                    value={prodBlockBtnText}
                    onChange={(e) => setProdBlockBtnText(e.target.value)}
                    className="form-input text-xs w-full rounded-xl"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedProdForBlock(null)}
                    className="text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                  >
                    &larr; Trocar Produto
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowProductModal(false)}
                      className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="btn-gold text-xs font-bold py-2 px-4 rounded-xl cursor-pointer"
                    >
                      Inserir Bloco na Página
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
