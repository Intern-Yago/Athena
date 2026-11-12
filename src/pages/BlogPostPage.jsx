import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Eye, 
  Share2, 
  Check, 
  ChevronRight, 
  Sparkles, 
  MessageSquare, 
  Send, 
  Package, 
  ArrowRight,
  ShieldCheck,
  User,
  ExternalLink,
  Tag
} from 'lucide-react';

// Fallback detalhado para artigos caso a API esteja sem registros
const FALLBACK_POST_DETAILS = {
  'guia-definitivo-thinkcar-thinktool-lite-diagnostico-ia': {
    id: 'post_thinktool_lite_guia',
    slug: 'guia-definitivo-thinkcar-thinktool-lite-diagnostico-ia',
    title: 'Guia Definitivo: Scanner Thinkcar THINKTOOL LITE e Diagnóstico com IA',
    summary: 'Descubra como o ThinkTool Lite revoluciona oficinas mecânicas através de diagnósticos inteligentes, leitura rápida de módulos, funções especiais e atualização direta de fábrica.',
    cover_image_url: 'https://images.athenaconsultoria.com.br/produtos/scanner-automotivo-thinkcar-thinktool-lite-fce404d4f151.webp',
    published_at: '2026-11-10T10:00:00.000Z',
    reading_time_minutes: 6,
    views_count: 342,
    author_name: 'Eng. Ricardo Silveira',
    author_role: 'Especialista em Diagnóstico Avançado Athena',
    categories: [{ id: 'cat_diag', name: 'Diagnóstico & IA', slug: 'diagnostico-ia' }],
    tags: ['Thinkcar', 'Scanner Automotivo', 'Diagnóstico', 'Inteligência Artificial'],
    related_product_slug: 'prod_starkx_thinktool-lite',
    related_product_name: 'Scanner Automotivo Multimarcas Thinkcar THINKTOOL LITE',
    content: `
## A Nova Era do Diagnóstico Automotivo com Inteligência Artificial

A evolução dos veículos modernos com dezenas de módulos eletrônicos interconectados (ECU, TCU, ABS, Airbag, BCM, ADAS) tornou os scanners genéricos obsoletos. Falhas intermitentes em redes CAN e FlexRay exigem velocidade de processamento e diagramas elétricos integrados.

Nesse cenário, o **Thinkcar THINKTOOL LITE** se estabeleceu como o padrão ouro para auto centers que buscam diagnósticos rápidos, profundos e precisos sem mensalidades abusivas.

---

## Principais Funcionalidades que Transformam sua Oficina

1. **Varredura Completa de Topologia de Rede**: Mapeamento visual em segundos de todas as centrais eletrônicas do veículo, indicando visualmente módulos saudáveis em verde e módulos com falhas em vermelho.
2. **Funções Especiais de Reset e Calibração**: Sangria de freio eletrônico (EPB), aprendizado de ângulo de direção (SAS), regeneração de filtro de partículas (DPF), calibração de corpo de borboleta e codificação de injetores.
3. **Módulo de Diagnóstico Remoto e IA**: Conexão com suporte técnico e assistente inteligente para interpretação instantânea de códigos de falha (DTCs) com base no histórico global da Thinkcar.
4. **VCI Compacto Bluetooth 5.0**: Mobilidade total na oficina sem cabos atrapalhando a circulação ao redor do veículo.

---

## Retorno sobre o Investimento (ROI) para Auto Centers

Investir em um scanner com alta taxa de cobertura multimarcas se paga nos primeiros 30 a 60 dias de operação:
- **Redução do Tempo de Triagem**: O que antes levava 40 minutos em testes manuais é identificado em menos de 3 minutos de varredura automatizada.
- **Cobrança de Serviços Especiais**: Resets de bateria e calibrações pós-alinhamento geram receita direta adicional em cada ordem de serviço.
- **Confiança do Cliente**: Emissão de relatórios profissionais em PDF com a marca da sua oficina para envio direto no WhatsApp do cliente.

---

## Conclusão e Suporte Oficial Athena

Ter o equipamento certo é apenas metade da equação; contar com assistência técnica autorizada, treinamento especializado e garantia oficial em território nacional é o que garante sua oficina operando sem paradas não programadas.
    `
  }
};

export default function BlogPostPage({ slug, onNavigate }) {
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Estados de comentários
  const [comments, setComments] = useState([]);
  const [commentForm, setCommentForm] = useState({
    authorName: '',
    authorEmail: '',
    content: '',
    honeypot: '' // Campo oculto antispam
  });
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [commentSuccessMsg, setCommentSuccessMsg] = useState(null);
  const [commentErrorMsg, setCommentErrorMsg] = useState(null);

  // Carrega dados do post por slug
  useEffect(() => {
    let isMounted = true;
    async function loadPost() {
      setIsLoading(true);
      setError(null);
      setCommentSuccessMsg(null);
      setCommentErrorMsg(null);

      try {
        const res = await fetch(`/api/blog/posts/${slug}`);
        if (res.ok) {
          const data = await res.json();
          // Tratamento de redirect 301
          if (data.redirect && data.targetSlug) {
            if (onNavigate) {
              onNavigate(`blog/${data.targetSlug}`);
            } else {
              window.location.href = `/blog/${data.targetSlug}`;
            }
            return;
          }

          if (isMounted && data) {
            const articleData = data.post || data;
            setPost(articleData);
            if (Array.isArray(data.comments)) {
              setComments(data.comments);
            }
            setIsLoading(false);

            // Incremento atômico de visualização silencioso
            if (data.id) {
              fetch(`/api/blog/posts/${data.id}/view`, { method: 'POST' }).catch(() => {});
            }
            return;
          }
        }
      } catch (err) {
        // Fallback
      }

      // Fallback local se não encontrado na API
      if (isMounted) {
        const fallback = FALLBACK_POST_DETAILS[slug] || FALLBACK_POST_DETAILS['guia-definitivo-thinkcar-thinktool-lite-diagnostico-ia'];
        if (fallback) {
          setPost(fallback);
          setIsLoading(false);
        } else {
          setError('Artigo não encontrado ou indisponível.');
          setIsLoading(false);
        }
      }
    }

    if (slug) {
      loadPost();
    }
    return () => { isMounted = false; };
  }, [slug, onNavigate]);

  // Formatação de data
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
    } catch {
      return '';
    }
  };

  // Compartilhamento
  const shareUrl = typeof window !== 'undefined' ? window.location.href : `https://athenaconsultoria.com.br/blog/${slug}`;
  const shareTitle = post?.title || 'Artigo Técnico Athena Soluções Automotivas';

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(`Confira este artigo técnico da Athena: "${shareTitle}" - ${shareUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  const handleShareLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank', 'noopener,noreferrer');
  };

  // Envio de comentário
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!post?.id || !commentForm.authorName || !commentForm.authorEmail || !commentForm.content) {
      setCommentErrorMsg('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    // Se o honeypot foi preenchido, é um bot; simula sucesso silencioso
    if (commentForm.honeypot) {
      setCommentSuccessMsg('Comentário enviado com sucesso e encaminhado para moderação.');
      setCommentForm({ authorName: '', authorEmail: '', content: '', honeypot: '' });
      return;
    }

    setIsSubmittingComment(true);
    setCommentErrorMsg(null);
    setCommentSuccessMsg(null);

    try {
      const res = await fetch(`/api/blog/posts/${post.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(commentForm)
      });

      const data = await res.json();
      if (res.ok) {
        setCommentSuccessMsg('Comentário enviado com sucesso! Ele será publicado após rápida moderação de segurança.');
        setCommentForm({ authorName: '', authorEmail: '', content: '', honeypot: '' });
      } else {
        setCommentErrorMsg(data.error || 'Erro ao enviar comentário.');
      }
    } catch (err) {
      setCommentErrorMsg('Falha de conexão ao enviar comentário. Tente novamente.');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Extração de tópicos para sumário automático
  const tocItems = useMemo(() => {
    if (!post) return [];
    const items = [];

    if (typeof post.content === 'string') {
      const lines = post.content.split('\n');
      lines.forEach((line) => {
        const trimmed = line.trim();
        if (trimmed.startsWith('## ')) {
          const text = trimmed.replace(/^##\s+/, '').trim();
          const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          items.push({ id, text });
        }
      });
    } else if (post.content_html && typeof post.content_html === 'string') {
      const headingMatches = post.content_html.matchAll(/<h[23][^>]*>(.*?)<\/h[23]>/gi);
      for (const match of headingMatches) {
        const rawText = match[1].replace(/<[^>]+>/g, '').trim();
        if (rawText) {
          const id = rawText.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          items.push({ id, text: rawText });
        }
      }
    }
    return items;
  }, [post]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8 text-slate-500">
        <div className="w-9 h-9 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mb-3" />
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Carregando artigo...</span>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 sm:p-12 text-center max-w-md border border-slate-200 space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Artigo Indisponível</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            O artigo solicitado não foi localizado ou ainda está em fase de revisão técnica.
          </p>
          <button
            type="button"
            onClick={() => onNavigate ? onNavigate('blog') : window.location.href = '/blog'}
            className="btn-gold text-xs font-bold py-2.5 px-6 inline-flex items-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar ao Blog</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-6 sm:py-10">
      <div className="container-custom space-y-8 sm:space-y-10">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500 font-medium overflow-x-auto whitespace-nowrap">
          <button 
            type="button" 
            onClick={() => onNavigate ? onNavigate('catalog') : window.location.href = '/'}
            className="hover:text-amber-600 transition cursor-pointer"
          >
            Início
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <button 
            type="button" 
            onClick={() => onNavigate ? onNavigate('blog') : window.location.href = '/blog'}
            className="hover:text-amber-600 transition cursor-pointer"
          >
            Blog Athena
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="text-slate-900 font-bold truncate max-w-xs">{post.title}</span>
        </nav>

        {/* Artigo Principal */}
        <article className="max-w-4xl mx-auto space-y-8">
          {/* Header do Artigo */}
          <header className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              {post.categories?.[0] && (
                <span className="bg-amber-100 text-amber-900 font-black text-xs px-3 py-1 rounded-full uppercase tracking-wider border border-amber-300">
                  {post.categories[0].name}
                </span>
              )}
              <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{formatDate(post.published_at)}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{post.reading_time_minutes || 5} min de leitura</span>
                </span>
                {post.views_count > 0 && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-slate-400" />
                      <span>{post.views_count} visualizações</span>
                    </span>
                  </>
                )}
              </div>
            </div>

            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-950 tracking-tight leading-tight">
              {post.title}
            </h1>

            {post.summary && (
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-medium">
                {post.summary}
              </p>
            )}

            {/* Linha do Autor e Compartilhamento */}
            <div className="pt-4 pb-2 border-y border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-800 flex items-center justify-center font-bold text-sm border border-amber-300">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    {post.author_name || 'Equipe Técnica Athena'}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {post.author_role || 'Consultoria Técnica em Equipamentos'}
                  </span>
                </div>
              </div>

              {/* Botões de Compartilhamento */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-400 mr-1">Compartilhar:</span>
                <button
                  type="button"
                  onClick={handleShareWhatsApp}
                  className="p-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition cursor-pointer"
                  title="Compartilhar no WhatsApp"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleShareLinkedIn}
                  className="p-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 transition cursor-pointer"
                  title="Compartilhar no LinkedIn"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                  title="Copiar Link"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Copiado!</span>
                    </>
                  ) : (
                    <span>Copiar Link</span>
                  )}
                </button>
              </div>
            </div>
          </header>

          {/* Imagem de Capa do Artigo */}
          {post.cover_image_url && (
            <div className="relative rounded-3xl overflow-hidden aspect-[16/9] bg-slate-950 border border-slate-200 shadow-md">
              <img
                src={post.cover_image_url}
                alt={post.title}
                loading="eager"
                decoding="async"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Sumário do Artigo (se houver tópicos identificados) */}
          {(tocItems || []).length > 0 && (
            <div className="p-6 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
              <span className="text-xs font-black uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Neste Artigo:</span>
              </span>
              <ul className="space-y-1.5 text-xs">
                {tocItems.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-amber-950">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Conteúdo Formatado do Artigo */}
          <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-xs space-y-6 text-slate-800 leading-relaxed text-sm sm:text-base">
            {post.content_html ? (
              <div
                className="space-y-4 font-sans leading-relaxed text-sm sm:text-base prose max-w-none text-slate-800"
                dangerouslySetInnerHTML={{ __html: post.content_html }}
              />
            ) : typeof post.content === 'string' ? (
              <div className="space-y-6 whitespace-pre-line font-sans">
                {post.content}
              </div>
            ) : (
              <p className="text-slate-500 italic">Conteúdo em processamento.</p>
            )}

            {/* Tags do Artigo */}
            {Array.isArray(post.tags) && post.tags.length > 0 && (
              <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center gap-2">
                <Tag className="w-4 h-4 text-slate-400 mr-1" />
                {post.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Cross-Sell Inteligente com Equipamentos do Catálogo Athena */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-950 rounded-3xl p-6 sm:p-8 text-white border border-amber-500/30 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <span className="text-[10px] font-black uppercase tracking-wider bg-amber-500 text-slate-950 px-2.5 py-0.5 rounded-full">
                Equipamento Recomendado
              </span>
              <h3 className="text-lg sm:text-xl font-black text-white">
                {post.related_product_name || 'Scanner Thinkcar THINKTOOL LITE com IA'}
              </h3>
              <p className="text-xs text-slate-300 max-w-lg leading-relaxed">
                Garanta o equipamento mencionado neste artigo com garantia oficial de fábrica, suporte técnico dedicado e parcelamento em até 12x no cartão.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                const target = post.related_product_slug || 'prod_starkx_thinktool-lite';
                if (onNavigate) {
                  onNavigate(`produto/${target}`);
                } else {
                  window.location.href = `/produto/${target}`;
                }
              }}
              className="shrink-0 btn-gold text-xs font-bold py-3 px-6 inline-flex items-center gap-2 cursor-pointer shadow-lg"
            >
              <Package className="w-4 h-4" />
              <span>Ver Condições Especiais</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Seção de Comentários */}
          <section aria-label="Comentários" className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-amber-500" />
                <span>Comentários Técnicos ({(comments || []).length})</span>
              </h3>
              <span className="text-[11px] text-slate-500 font-medium">Moderação ativa</span>
            </div>

            {/* Lista de Comentários Aprovados */}
            {(comments || []).length > 0 ? (
              <div className="space-y-4">
                {comments.map((c) => (
                  <div key={c.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900">{c.author_name}</span>
                      <span className="text-[11px] text-slate-400">{formatDate(c.created_at)}</span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                      {c.content}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">
                Nenhum comentário publicado ainda. Seja o primeiro a compartilhar sua experiência ou dúvida técnica!
              </p>
            )}

            {/* Formulário de Envio de Comentário */}
            <form onSubmit={handleSubmitComment} className="pt-4 border-t border-slate-100 space-y-4">
              <span className="text-xs font-bold text-slate-900 block">Deixe sua dúvida ou consideração técnica:</span>

              {commentSuccessMsg && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-medium flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{commentSuccessMsg}</span>
                </div>
              )}

              {commentErrorMsg && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 font-medium">
                  {commentErrorMsg}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Seu Nome / Oficina *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Carlos Mecânica e Auto Center"
                    value={commentForm.authorName}
                    onChange={(e) => setCommentForm(p => ({ ...p, authorName: e.target.value }))}
                    className="form-input text-xs w-full rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Seu E-mail Corporativo *</label>
                  <input
                    type="email"
                    required
                    placeholder="carlos@oficina.com.br (não divulgado)"
                    value={commentForm.authorEmail}
                    onChange={(e) => setCommentForm(p => ({ ...p, authorEmail: e.target.value }))}
                    className="form-input text-xs w-full rounded-xl"
                  />
                </div>
              </div>

              {/* Honeypot Invisível para Bloqueio de Robôs Spammers */}
              <input
                type="text"
                name="empresa_fantasma_hp"
                value={commentForm.honeypot}
                onChange={(e) => setCommentForm(p => ({ ...p, honeypot: e.target.value }))}
                style={{ display: 'none' }}
                tabIndex={-1}
                autoComplete="off"
              />

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Comentário / Pergunta *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Escreva aqui seu comentário ou dúvida para nossos especialistas..."
                  value={commentForm.content}
                  onChange={(e) => setCommentForm(p => ({ ...p, content: e.target.value }))}
                  className="form-textarea text-xs w-full rounded-xl"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingComment}
                className="btn-gold text-xs font-bold py-2.5 px-6 inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmittingComment ? 'Enviando...' : 'Enviar Comentário para Moderação'}</span>
              </button>
            </form>
          </section>

          {/* Botão de Retorno */}
          <div className="pt-4 text-center">
            <button
              type="button"
              onClick={() => onNavigate ? onNavigate('blog') : window.location.href = '/blog'}
              className="px-6 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-xs font-bold text-slate-700 inline-flex items-center gap-2 cursor-pointer transition shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4 text-slate-500" />
              <span>Voltar para Todos os Artigos do Blog</span>
            </button>
          </div>
        </article>
      </div>
    </div>
  );
}
