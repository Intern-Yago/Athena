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
  Tag,
  TrendingUp
} from 'lucide-react';
import BlogSidebar from '../components/BlogSidebar';

// Fallback detalhado para artigos técnicos caso a API esteja indisponível
const FALLBACK_POST_DETAILS = {
  'scanner-topologia-de-rede-ia-eaata-90-oficina': {
    id: 'd7f7f07a-126d-4d68-8db9-6fc1438ad289',
    slug: 'scanner-topologia-de-rede-ia-eaata-90-oficina',
    title: 'Scanner com Topologia de Rede e IA: Vale a Pena o EAATA 90 para a Sua Oficina?',
    summary: 'Análise técnica aprofundada sobre o scanner EAATA 90 com inteligência artificial, topologia de rede automotiva colorida em tempo real, suporte remoto integrado e vantagens competitivas para reparadores mecânicos.',
    cover_image_url: 'https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/athena_produtos/eaata-aa7d50879091.webp',
    published_at: '2026-11-12T15:56:37.269Z',
    reading_time_minutes: 5,
    views_count: 260,
    author_name: 'Equipe Técnica Athena',
    author_role: 'Especialista em Diagnóstico Avançado & Redes Veiculares',
    categories: [{ id: 'cat_diag', name: 'Diagnóstico & IA', slug: 'diagnostico-ia' }],
    tags: ['EAATA 90', 'Topologia de Rede', 'Inteligência Artificial', 'Scanner Automotivo'],
    related_product_slug: 'scanner-automotivo-eaata-90-com-diagnostico-por-topologia-e-ia-eaata',
    related_product_name: 'Scanner Automotivo EAATA 90 com Diagnóstico por Topologia e IA',
    content: `
## O Que é Diagnóstico por Topologia de Rede em Tempo Real?

Nos veículos modernos, dezenas de módulos eletrônicos (ECU, TCU, ABS, ESP, BCM, Airbag, Painel e Gateway Central) comunicam-se ininterruptamente através de múltiplos barramentos: redes CAN High Speed, CAN Low Speed, LIN e Ethernet automotiva.

Quando ocorre uma falha intermitente na linha de comunicação — como curto na fiação ou falha em um nó terminal —, um scanner comum apenas lista dezenas de códigos DTC sem hierarquia. O **EAATA 90**, por sua vez, desenha um diagrama topológico completo e colorido na tela em segundos. Módulos que respondem normalmente aparecem em verde; módulos com falhas em vermelho; e módulos que não responderam na linha aparecem destacados em cinza, revelando com precisão o ponto exato da interrupção.

---

## Recursos Diferenciais do EAATA 90 para a Oficina

1. **Topologia Dinâmica de Barramento CAN**: Visualize o mapa completo da arquitetura eletrônica do veículo em um único toque, eliminando horas de medições manuais com multímetro.
2. **Assistente de Diagnóstico Integrado com IA**: Interpreta códigos de falha complexos, correlaciona causas prováveis com sintomas relatados e sugere testes de atuadores com base em bancos de dados de montadoras globais.
3. **Funções Especiais de Oficina**: Calibração de ângulo de direção (SAS), sangria eletrônica de freio (EPB), regeneração de DPF, codificação de bicos injetores e reset de bateria BMS.
4. **Hardware Robusto com VCI Sem Fio**: Tablet industrial resistente a quedas, poeira e derivados de petróleo com conexão sem fio de longo alcance para movimentação livre no pátio.

---

## Retorno Financeiro e Eficiência de Mão de Obra

Investir no EAATA 90 reduz expressivamente o tempo médio de triagem de veículos com panes elétricas misteriosas:
- **Diagnóstico em Minutos**: O que antes demandava horas de desmontagem de painéis é identificado em uma varredura visual de 2 minutos.
- **Relatório Profissional em PDF**: Gere relatórios com o logotipo da sua oficina mecânica e envie diretamente no WhatsApp do cliente antes e depois do reparo, transmitindo autoridade imediata.
- **Suporte Técnico Dedicado Athena**: Garantia nacional, treinamento operacional e canal direto com especialistas em diagnóstico automotivo.
    `
  },
  'como-escolher-o-scanner-automotivo-ideal-para-sua-oficina': {
    id: 'a2faa5cc-757d-4b6c-89f3-76c19b2d1f16',
    slug: 'como-escolher-o-scanner-automotivo-ideal-para-sua-oficina',
    title: 'Como Escolher o Scanner Automotivo Ideal para sua Oficina Mecânica',
    summary: 'Descubra como o ThinkTool Lite e scanners modernos revolucionam oficinas mecânicas através de diagnósticos inteligentes, leitura rápida de módulos, funções especiais e atualização direta de fábrica.',
    cover_image_url: 'https://images.athenaconsultoria.com.br/produtos/scanner-automotivo-thinkcar-thinktool-lite-fce404d4f151.webp',
    published_at: '2026-11-11T21:22:36.450Z',
    reading_time_minutes: 6,
    views_count: 342,
    author_name: 'Eng. Ricardo Silveira',
    author_role: 'Especialista em Diagnóstico Avançado Athena',
    categories: [{ id: 'cat_diag', name: 'Diagnóstico & IA', slug: 'diagnostico-ia' }],
    tags: ['Thinkcar', 'Scanner Automotivo', 'Diagnóstico', 'Inteligência Artificial'],
    related_product_slug: 'prod_starkx_thinktool-lite',
    related_product_name: 'Scanner Automotivo Multimarcas Thinkcar THINKTOOL LITE',
    content: `
## A Importância da Escolha Certa do Scanner na Oficina Moderna

Com a complexidade crescente dos veículos e sistemas híbridos e elétricos, escolher o equipamento de diagnóstico correto impacta diretamente a produtividade, a reputação e o faturamento de qualquer oficina mecânica.

Equipamentos defasados geram perdas de tempo e recusas de serviços por falta de cobertura de sistemas como EPB, SAS e calibrações de transmissões automatizadas. Scanners multimarcas com suporte de inteligência artificial oferecem cobertura atualizada e orientação passo a passo nos testes.

---

## 4 Fatores Essenciais na Escolha:

1. **Cobertura de Frotas e Montadoras**: Verifique se o equipamento atende ampla linha de veículos nacionais e importados com protocolos modernos como DoIP e CAN FD.
2. **Topologia de Rede Visual**: Facilita a localização rápida de perdas de sinal em barramentos CAN sem necessidade de osciloscópio prévio.
3. **Custo de Atualização e Assinaturas**: Prefira equipamentos com atualizações inclusas ou modelos de pagamento claros e sem bloqueios surpresa.
4. **Assistência Técnica e Garantia Nacional**: Comprar de distribuidores oficiais como a Athena assegura treinamento, garantia e reposição imediata de peças.
    `
  },
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

A evolução dos veículos modernos com dezenas de módulos eletrônicos interconectados tornou os scanners genéricos obsoletos. Falhas em redes exigem velocidade e diagramas práticos.

Nesse cenário, o **Thinkcar THINKTOOL LITE** se estabeleceu como o padrão ouro para auto centers que buscam diagnósticos rápidos, profundos e precisos sem mensalidades abusivas.
    `
  }
};

// Helper para normalizar e garantir a URL correta da imagem de capa
function getPostCover(post) {
  if (!post) return 'https://images.athenaconsultoria.com.br/produtos/scanner-automotivo-thinkcar-thinktool-lite-fce404d4f151.webp';
  const img = post.cover_image_url || post.cover_image_key || post.coverImage;
  if (!img) {
    if (post.slug && post.slug.includes('eaata')) {
      return 'https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/athena_produtos/eaata-aa7d50879091.webp';
    }
    return 'https://images.athenaconsultoria.com.br/produtos/scanner-automotivo-thinkcar-thinktool-lite-fce404d4f151.webp';
  }
  if (img.startsWith('http://') || img.startsWith('https://')) return img;
  return `https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/${img.replace(/^\//, '')}`;
}

export default function BlogPostPage({ slug, onNavigate }) {
  const [post, setPost] = useState(null);
  const [allPosts, setAllPosts] = useState([]);
  const [categories, setCategories] = useState([]);
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

  // Carrega lista geral de artigos para recomendação
  useEffect(() => {
    let isMounted = true;
    async function loadRecommended() {
      try {
        const [postsRes, catRes] = await Promise.all([
          fetch('/api/blog/posts?limit=6'),
          fetch('/api/blog/categories')
        ]);
        if (postsRes.ok) {
          const data = await postsRes.json();
          if (isMounted && data?.posts) {
            setAllPosts(data.posts);
          }
        }
        if (catRes.ok) {
          const cats = await catRes.json();
          if (isMounted && Array.isArray(cats)) {
            setCategories(cats);
          }
        }
      } catch {
        // Fallback para artigos locais
        if (isMounted) {
          setAllPosts(Object.values(FALLBACK_POST_DETAILS));
        }
      }
    }
    loadRecommended();
    return () => { isMounted = false; };
  }, []);

  // Carrega dados do post por slug (somente quando slug mudar, sem recarregamento desnecessário)
  useEffect(() => {
    let isMounted = true;
    async function loadPost() {
      // Se já temos o post atual carregado na memória, não limpa a tela para evitar flash
      if (!post || post.slug !== slug) {
        setIsLoading(true);
      }
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
            if (articleData?.id) {
              fetch(`/api/blog/posts/${articleData.id}/view`, { method: 'POST' }).catch(() => {});
            }
            return;
          }
        }
      } catch (err) {
        // Fallback
      }

      // Fallback local se não encontrado na API
      if (isMounted) {
        const fallback = FALLBACK_POST_DETAILS[slug] || 
          FALLBACK_POST_DETAILS['scanner-topologia-de-rede-ia-eaata-90-oficina'] || 
          FALLBACK_POST_DETAILS['guia-definitivo-thinkcar-thinktool-lite-diagnostico-ia'];
        
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
  }, [slug]);

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

  // Artigos recomendados (excluindo o atual)
  const recommendedArticles = useMemo(() => {
    const list = (allPosts && allPosts.length > 0) 
      ? allPosts 
      : Object.values(FALLBACK_POST_DETAILS);
    return list.filter(p => p.slug !== slug).slice(0, 3);
  }, [allPosts, slug]);

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

  const coverUrl = getPostCover(post);

  return (
    <div className="min-h-screen bg-slate-50 py-6 sm:py-10">
      <div className="container-custom space-y-8 sm:space-y-10">
        {/* Breadcrumb de Navegação */}
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

        {/* Layout Principal com Menu Lateral Aside à Direita */}
        <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-start">
          {/* Coluna Principal do Artigo (8 colunas) */}
          <main className="lg:col-span-8 min-w-0 space-y-8">
            <article className="space-y-8">
              {/* Header do Artigo */}
              <header className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  {post.categories?.[0] && (
                    <button
                      type="button"
                      onClick={() => onNavigate ? onNavigate(`blog?categoria=${post.categories[0].slug}`) : window.location.href = `/blog?categoria=${post.categories[0].slug}`}
                      className="bg-amber-100 hover:bg-amber-200 text-amber-900 font-black text-xs px-3 py-1 rounded-full uppercase tracking-wider border border-amber-300 cursor-pointer transition"
                    >
                      {post.categories[0].name}
                    </button>
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

                {(post.summary || post.excerpt) && (
                  <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-medium">
                    {post.summary || post.excerpt}
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

              {/* Imagem de Capa do Artigo com aspect-ratio fixo */}
              <div className="relative rounded-3xl overflow-hidden aspect-[16/9] bg-slate-950 border border-slate-200 shadow-md">
                <img
                  src={coverUrl}
                  alt={post.title}
                  loading="eager"
                  decoding="async"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://images.athenaconsultoria.com.br/produtos/scanner-automotivo-thinkcar-thinktool-lite-fce404d4f151.webp';
                  }}
                />
              </div>

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
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
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
                    className="blog-article-content space-y-4 font-sans leading-relaxed text-sm sm:text-base max-w-none text-slate-800"
                    dangerouslySetInnerHTML={{ __html: post.content_html }}
                  />
                ) : typeof post.content === 'string' ? (
                  <div className="blog-article-content space-y-6 whitespace-pre-line font-sans">
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

              {/* Seção de Artigos Recomendados (Cards no final da página) */}
              {recommendedArticles.length > 0 && (
                <section aria-label="Artigos Recomendados" className="space-y-4 pt-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-amber-600" />
                      <span>Artigos Recomendados para Você</span>
                    </h3>
                    <button
                      type="button"
                      onClick={() => onNavigate ? onNavigate('blog') : window.location.href = '/blog'}
                      className="text-xs font-bold text-amber-600 hover:text-amber-700 cursor-pointer"
                    >
                      Ver todos
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {recommendedArticles.map((rec) => {
                      const recCover = getPostCover(rec);
                      return (
                        <div
                          key={rec.id || rec.slug}
                          onClick={() => onNavigate ? onNavigate(`blog/${rec.slug}`) : window.location.href = `/blog/${rec.slug}`}
                          className="group bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-2xs hover:shadow-md transition cursor-pointer flex flex-col justify-between"
                        >
                          <div>
                            <div className="relative aspect-[16/9] overflow-hidden bg-slate-900">
                              <img
                                src={recCover}
                                alt={rec.title}
                                loading="lazy"
                                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                                onError={(e) => {
                                  e.target.src = 'https://images.athenaconsultoria.com.br/produtos/scanner-automotivo-thinkcar-thinktool-lite-fce404d4f151.webp';
                                }}
                              />
                            </div>
                            <div className="p-4 space-y-2">
                              <span className="text-[10px] text-slate-400 font-medium block">
                                {formatDate(rec.published_at)} • {rec.reading_time_minutes || 5} min
                              </span>
                              <h4 className="text-xs font-bold text-slate-900 group-hover:text-amber-600 transition line-clamp-2 leading-snug">
                                {rec.title}
                              </h4>
                            </div>
                          </div>

                          <div className="p-4 pt-0 text-[11px] font-bold text-amber-600 flex items-center gap-1">
                            <span>Ler artigo</span>
                            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

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
          </main>

          {/* Menu Lateral Direito Aside (4 colunas) Fixo na Rolagem */}
          <div className="lg:col-span-4 min-w-0 mt-8 lg:mt-0 lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100dvh-7rem)] lg:overflow-y-auto lg:pr-1 [overscroll-behavior:contain]">
            <BlogSidebar
              categories={categories}
              selectedCategory={post?.categories?.[0]?.slug || 'all'}
              onSelectCategory={(catSlug) => {
                if (catSlug === 'all') {
                  if (onNavigate) onNavigate('blog');
                  else window.location.href = '/blog';
                } else {
                  if (onNavigate) onNavigate(`blog?categoria=${catSlug}`);
                  else window.location.href = `/blog?categoria=${catSlug}`;
                }
              }}
              recommendedPosts={allPosts}
              currentPostSlug={slug}
              onNavigatePost={(targetSlug) => {
                if (onNavigate) onNavigate(`blog/${targetSlug}`);
                else window.location.href = `/blog/${targetSlug}`;
              }}
              onSearchSubmit={(q) => {
                if (onNavigate) onNavigate(`blog?busca=${encodeURIComponent(q)}`);
                else window.location.href = `/blog?busca=${encodeURIComponent(q)}`;
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
