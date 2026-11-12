import React, { useState, useEffect, useMemo } from 'react';
import { 
  BookOpen, 
  Search, 
  Calendar, 
  Clock, 
  Eye, 
  ArrowRight, 
  Tag, 
  ChevronRight, 
  Sparkles, 
  Wrench, 
  Layers, 
  ChevronLeft,
  X,
  Share2,
  Package
} from 'lucide-react';
import BlogSidebar from '../components/BlogSidebar';

// Artigos de fallback com imagens oficiais corretas (incluindo EAATA 90 e Thinkcar)
const FALLBACK_POSTS = [
  {
    id: 'post_eaata_90',
    slug: 'scanner-topologia-de-rede-ia-eaata-90-oficina',
    title: 'Scanner com Topologia de Rede e IA: Vale a Pena o EAATA 90 para a Sua Oficina?',
    summary: 'Análise técnica completa do scanner EAATA 90: diagnóstico por inteligência artificial, visualização de topologia de rede colorida em tempo real, suporte remoto integrado e ganhos práticos de produtividade para mecânicas e auto centers.',
    cover_image_url: 'https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/athena_produtos/eaata-aa7d50879091.webp',
    published_at: '2026-11-12T15:56:37.269Z',
    reading_time_minutes: 5,
    views_count: 260,
    author_name: 'Equipe Técnica Athena',
    categories: [{ id: 'cat_diag', name: 'Diagnóstico & IA', slug: 'diagnostico-ia' }],
    tags: ['EAATA 90', 'Topologia de Rede', 'Inteligência Artificial', 'Scanner Automotivo']
  },
  {
    id: 'post_thinktool_lite_guia',
    slug: 'como-escolher-o-scanner-automotivo-ideal-para-sua-oficina',
    title: 'Como Escolher o Scanner Automotivo Ideal para sua Oficina Mecânica',
    summary: 'Descubra como o ThinkTool Lite e scanners modernos revolucionam oficinas mecânicas através de diagnósticos inteligentes, leitura rápida de módulos, funções especiais e atualização direta de fábrica.',
    cover_image_url: 'https://images.athenaconsultoria.com.br/produtos/scanner-automotivo-thinkcar-thinktool-lite-fce404d4f151.webp',
    published_at: '2026-11-11T21:22:36.450Z',
    reading_time_minutes: 6,
    views_count: 342,
    author_name: 'Equipe Técnica Athena',
    categories: [{ id: 'cat_diag', name: 'Diagnóstico & IA', slug: 'diagnostico-ia' }],
    tags: ['Thinkcar', 'Scanner Automotivo', 'Diagnóstico', 'Inteligência Artificial']
  },
  {
    id: 'post_calibracao_adas_2026',
    slug: 'calibracao-adas-e-sensores-radar-o-futuro-da-reparacao',
    title: 'Calibração ADAS e Câmeras de Para-brisa: Por Que Toda Oficina Precisa se Adaptar',
    summary: 'A presença massiva de frenagem autônoma e piloto automático exige alinhamento e calibração milimétrica após trocas de para-brisa ou geometria da suspensão. Entenda as oportunidades de faturamento.',
    cover_image_url: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=800&auto=format&fit=crop&q=80',
    published_at: '2026-11-08T14:30:00.000Z',
    reading_time_minutes: 8,
    views_count: 519,
    author_name: 'Consultoria Automotiva',
    categories: [{ id: 'cat_adas', name: 'Sistemas ADAS', slug: 'sistemas-adas' }],
    tags: ['ADAS', 'Segurança Ativa', 'Calibração', 'Alinhamento 3D']
  },
  {
    id: 'post_manutencao_elevadores',
    slug: 'seguranca-e-manutencao-preventiva-em-elevadores-automotivos',
    title: 'Segurança Operacional e Manutenção Preventiva em Elevadores Automotivos',
    summary: 'Checklist prático diário e mensal para garantir vida útil longa, cabos de aço calibrados, travas pneumáticas e conformidade com as normas regulamentadoras NR-12 nas oficinas.',
    cover_image_url: 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=800&auto=format&fit=crop&q=80',
    published_at: '2026-11-05T09:15:00.000Z',
    reading_time_minutes: 5,
    views_count: 288,
    author_name: 'Engenharia de Equipamentos',
    categories: [{ id: 'cat_elev', name: 'Elevadores & Oficinas', slug: 'elevadores-oficinas' }],
    tags: ['Elevadores', 'Manutenção', 'NR-12', 'Oficina Segura']
  }
];

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

export default function BlogListingPage({ onNavigate }) {
  const [posts, setPosts] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('athena_blog_posts_cache_v1');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {
        // Ignora erro de parse
      }
    }
    return FALLBACK_POSTS;
  });

  const [categories, setCategories] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('athena_blog_cats_cache_v1');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {
        // Ignora erro de parse
      }
    }
    return [
      { id: 'cat_diag', name: 'Diagnóstico & IA', slug: 'diagnostico-ia' },
      { id: 'cat_adas', name: 'Sistemas ADAS', slug: 'sistemas-adas' },
      { id: 'cat_elev', name: 'Elevadores & Oficinas', slug: 'elevadores-oficinas' },
      { id: 'cat_gest', name: 'Gestão de Auto Centers', slug: 'gestao-auto-centers' }
    ];
  });
  
  // Persistência de categoria selecionada via URL search param e sessionStorage
  const [selectedCategory, setSelectedCategory] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const urlCat = new URLSearchParams(window.location.search).get('categoria');
        if (urlCat) return urlCat;
        const savedCat = sessionStorage.getItem('athena_blog_selected_cat');
        if (savedCat) return savedCat;
      } catch {
        // Fallback seguro
      }
    }
    return 'all';
  });

  const [searchQuery, setSearchQuery] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        return new URLSearchParams(window.location.search).get('busca') || '';
      } catch {
        return '';
      }
    }
    return '';
  });

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  // Inicia com false porque já temos os artigos pré-carregados (Stale-While-Revalidate instantâneo)
  const [isLoading, setIsLoading] = useState(false);

  // Manipulador com persistência de categoria
  const handleSelectCategory = (catSlug) => {
    const targetSlug = catSlug || 'all';
    setSelectedCategory(targetSlug);
    setPage(1);

    if (typeof window !== 'undefined') {
      try {
        const url = new URL(window.location.href);
        if (targetSlug !== 'all') {
          sessionStorage.setItem('athena_blog_selected_cat', targetSlug);
          url.searchParams.set('categoria', targetSlug);
        } else {
          sessionStorage.removeItem('athena_blog_selected_cat');
          url.searchParams.delete('categoria');
        }
        window.history.replaceState({}, '', url.toString());
      } catch {
        // Sem efeitos colaterais
      }
    }
  };

  // Manipulador de pesquisa com atualização de URL
  const handleSearchSubmit = (query) => {
    setSearchQuery(query);
    setPage(1);
    if (typeof window !== 'undefined') {
      try {
        const url = new URL(window.location.href);
        if (query) {
          url.searchParams.set('busca', query);
        } else {
          url.searchParams.delete('busca');
        }
        window.history.replaceState({}, '', url.toString());
      } catch {
        // Sem efeitos colaterais
      }
    }
  };

  // Carrega categorias disponíveis em segundo plano (Stale-While-Revalidate)
  useEffect(() => {
    let isMounted = true;
    async function loadCategories() {
      try {
        const res = await fetch('/api/blog/categories');
        if (res.ok) {
          const data = await res.json();
          if (isMounted && Array.isArray(data) && data.length > 0) {
            setCategories(data);
            try {
              localStorage.setItem('athena_blog_cats_cache_v1', JSON.stringify(data));
            } catch {}
          }
        }
      } catch (err) {
        // Mantém categorias já exibidas
      }
    }
    loadCategories();
    return () => { isMounted = false; };
  }, []);

  // Carrega posts com paginação e filtro de categoria em segundo plano sem bloquear a tela
  useEffect(() => {
    let isMounted = true;
    async function loadPosts() {
      // Só mostra spinner se não houver nenhum post na lista atual
      if (!posts || posts.length === 0) {
        setIsLoading(true);
      }
      try {
        const catParam = selectedCategory !== 'all' ? `&category=${encodeURIComponent(selectedCategory)}` : '';
        const res = await fetch(`/api/blog/posts?page=${page}&limit=9${catParam}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data && Array.isArray(data.posts) && data.posts.length > 0) {
            setPosts(data.posts);
            const total = data.total || data.posts.length;
            setTotalPages(Math.max(1, Math.ceil(total / 9)));
            setIsLoading(false);

            if (page === 1 && selectedCategory === 'all') {
              try {
                localStorage.setItem('athena_blog_posts_cache_v1', JSON.stringify(data.posts));
              } catch {}
            }
            return;
          }
        }
      } catch (err) {
        // Fallback controlado
      }

      // Aplica filtro local se a API ainda estiver em cold start
      if (isMounted) {
        let baseList = FALLBACK_POSTS;
        try {
          const cached = localStorage.getItem('athena_blog_posts_cache_v1');
          if (cached) {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed) && parsed.length > 0) baseList = parsed;
          }
        } catch {}

        if (selectedCategory !== 'all') {
          baseList = baseList.filter(p => p.categories?.some(c => c.slug === selectedCategory));
        }
        setPosts(baseList);
        setTotalPages(1);
        setIsLoading(false);
      }
    }

    loadPosts();
    return () => { isMounted = false; };
  }, [page, selectedCategory]);

  // Filtragem local adicional pela barra de pesquisa
  const filteredPosts = useMemo(() => {
    if (!searchQuery.trim()) return posts;
    const query = searchQuery.toLowerCase().trim();
    return posts.filter(post => 
      (post.title || '').toLowerCase().includes(query) ||
      (post.summary || '').toLowerCase().includes(query) ||
      (post.excerpt || '').toLowerCase().includes(query) ||
      (post.tags || []).some(t => t.toLowerCase().includes(query))
    );
  }, [posts, searchQuery]);

  // Artigo em Destaque (primeiro artigo da lista se na página 1 e sem busca)
  const featuredPost = useMemo(() => {
    if (page === 1 && !searchQuery.trim() && selectedCategory === 'all' && (filteredPosts || []).length > 0) {
      return filteredPosts[0];
    }
    return null;
  }, [filteredPosts, page, searchQuery, selectedCategory]);

  const regularPosts = useMemo(() => {
    if (featuredPost) {
      return (filteredPosts || []).slice(1);
    }
    return filteredPosts || [];
  }, [filteredPosts, featuredPost]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return '';
    }
  };

  const handlePostClick = (slug) => {
    if (!slug) return;
    // Pré-salva o resumo do artigo clicado para abertura em 0ms na página do post
    try {
      const targetPost = (posts || []).find(p => p.slug === slug);
      if (targetPost) {
        sessionStorage.setItem(`athena_blog_post_preview_${slug}`, JSON.stringify(targetPost));
      }
    } catch {}

    if (onNavigate) {
      onNavigate(`blog/${slug}`);
    } else {
      window.location.href = `/blog/${slug}`;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-6 sm:py-10">
      <div className="container-custom space-y-8 sm:space-y-10">
        {/* Breadcrumb de Navegação */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <button 
            type="button" 
            onClick={() => onNavigate ? onNavigate('catalog') : window.location.href = '/'}
            className="hover:text-amber-600 transition cursor-pointer"
          >
            Início
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-900 font-bold">Blog & Inteligência Automotiva</span>
          {selectedCategory !== 'all' && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-amber-700 font-bold">
                {categories.find(c => c.slug === selectedCategory)?.name || selectedCategory}
              </span>
            </>
          )}
        </nav>

        {/* Hero Banner do Blog */}
        <header className="relative rounded-3xl bg-slate-950 text-white p-6 sm:p-12 overflow-hidden border border-slate-800 shadow-xl">
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative max-w-3xl space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Inteligência Técnica & Inovação</span>
            </span>

            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
              Blog Athena: Soluções e Guias para Oficinas do Futuro
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
              Análises especializadas em diagnóstico automotivo com IA, topologia de rede, calibração ADAS, elevadores e gestão de alta rentabilidade para auto centers.
            </p>
          </div>
        </header>

        {/* Layout Principal em Grade: Artigos (8 cols) + Menu Lateral Aside (4 cols) */}
        <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-start">
          {/* Coluna Principal com Artigos */}
          <main className="lg:col-span-8 min-w-0 space-y-8">
            {/* Pílulas de Categorias para Acesso Rápido em Mobile / Topo */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <button
                type="button"
                onClick={() => handleSelectCategory('all')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  selectedCategory === 'all'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                Todos os Artigos
              </button>

              {categories.map((cat) => (
                <button
                  key={cat.id || cat.slug}
                  type="button"
                  onClick={() => handleSelectCategory(cat.slug)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    selectedCategory === cat.slug
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3 text-slate-500">
                <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Carregando artigos...</span>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && (filteredPosts || []).length === 0 && (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-4 max-w-lg mx-auto">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Nenhum artigo encontrado</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Não encontramos nenhum artigo correspondente à sua busca ou categoria selecionada.
                </p>
                <button
                  type="button"
                  onClick={() => { handleSelectCategory('all'); setSearchQuery(''); }}
                  className="btn-gold text-xs font-bold py-2.5 px-6 inline-flex items-center gap-2 cursor-pointer"
                >
                  Ver todos os artigos
                </button>
              </div>
            )}

            {/* Artigo em Destaque (Hero Card) */}
            {!isLoading && featuredPost && (
              <article 
                onClick={() => handlePostClick(featuredPost.slug)}
                className="group bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col"
              >
                <div className="relative aspect-[16/9] overflow-hidden bg-slate-900">
                  <img
                    src={getPostCover(featuredPost)}
                    alt={featuredPost.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                    onError={(e) => {
                      e.target.src = 'https://images.athenaconsultoria.com.br/produtos/scanner-automotivo-thinkcar-thinktool-lite-fce404d4f151.webp';
                    }}
                  />
                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    <span className="bg-amber-500 text-slate-950 font-black text-[10px] sm:text-xs px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                      Destaque Principal
                    </span>
                    {featuredPost.categories?.[0] && (
                      <span className="bg-slate-950/80 backdrop-blur-md text-white font-bold text-[10px] sm:text-xs px-3 py-1 rounded-full border border-white/20">
                        {featuredPost.categories[0].name}
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-6 sm:p-8 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{formatDate(featuredPost.published_at)}</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{featuredPost.reading_time_minutes || 5} min de leitura</span>
                      </span>
                    </div>

                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 group-hover:text-amber-600 transition leading-snug">
                      <a
                        href={`/blog/${featuredPost.slug}`}
                        onClick={(e) => { e.preventDefault(); handlePostClick(featuredPost.slug); }}
                        className="hover:underline"
                      >
                        {featuredPost.title}
                      </a>
                    </h2>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3">
                      {featuredPost.summary || featuredPost.excerpt}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">
                      {featuredPost.author_name || 'Equipe Athena'}
                    </span>
                    <span className="text-xs font-bold text-amber-600 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1.5">
                      <span>Ler Artigo</span>
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </article>
            )}

            {/* Grid dos Demais Artigos */}
            {!isLoading && (regularPosts || []).length > 0 && (
              <section aria-label="Lista de Artigos" className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {regularPosts.map((post) => {
                  const cover = getPostCover(post);
                  return (
                    <article
                      key={post.id || post.slug}
                      onClick={() => handlePostClick(post.slug)}
                      className="group bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
                    >
                      <div>
                        <div className="relative aspect-[16/9] overflow-hidden bg-slate-900">
                          <img
                            src={cover}
                            alt={post.title}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => {
                              e.target.src = 'https://images.athenaconsultoria.com.br/produtos/scanner-automotivo-thinkcar-thinktool-lite-fce404d4f151.webp';
                            }}
                          />
                          {post.categories?.[0] && (
                            <span className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md text-amber-400 font-black text-[10px] px-2.5 py-1 rounded-full border border-white/10 uppercase tracking-wider">
                              {post.categories[0].name}
                            </span>
                          )}
                        </div>

                        <div className="p-5 sm:p-6 space-y-3">
                          <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              <span>{formatDate(post.published_at)}</span>
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span>{post.reading_time_minutes || 5} min</span>
                            </span>
                            {post.views_count > 0 && (
                              <>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <Eye className="w-3 h-3 text-slate-400" />
                                  <span>{post.views_count}</span>
                                </span>
                              </>
                            )}
                          </div>

                          <h3 className="text-base font-bold text-slate-900 group-hover:text-amber-600 transition leading-snug line-clamp-2">
                            <a
                              href={`/blog/${post.slug}`}
                              onClick={(e) => { e.preventDefault(); handlePostClick(post.slug); }}
                              className="hover:underline"
                            >
                              {post.title}
                            </a>
                          </h3>

                          <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                            {post.summary || post.excerpt}
                          </p>
                        </div>
                      </div>

                      <div className="p-5 sm:p-6 pt-0 border-t border-slate-100 flex items-center justify-between mt-4">
                        <span className="text-[11px] font-bold text-slate-600">
                          {post.author_name || 'Athena'}
                        </span>
                        <span className="text-xs font-bold text-amber-600 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                          <span>Acessar</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </article>
                  );
                })}
              </section>
            )}

            {/* Paginação */}
            {!isLoading && totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-6">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => { setPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition"
                  title="Página Anterior"
                >
                  <ChevronLeft className="w-4 h-4 text-slate-700" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => { setPage(num); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className={`w-9 h-9 rounded-xl text-xs font-bold transition cursor-pointer ${
                      page === num
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {num}
                  </button>
                ))}

                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => { setPage(p => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition"
                  title="Próxima Página"
                >
                  <ChevronRight className="w-4 h-4 text-slate-700" />
                </button>
              </div>
            )}
          </main>

          {/* Menu Lateral Direito (Aside) Fixo na Rolagem */}
          <div className="lg:col-span-4 min-w-0 mt-8 lg:mt-0 lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100dvh-7rem)] lg:overflow-y-auto lg:pr-1 [overscroll-behavior:contain]">
            <BlogSidebar
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={handleSelectCategory}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onSearchSubmit={handleSearchSubmit}
              recommendedPosts={posts}
              onNavigatePost={handlePostClick}
            />
          </div>
        </div>

        {/* CTA Cross-Sell para o Catálogo Athena */}
        <section className="rounded-3xl bg-gradient-to-r from-amber-600 to-amber-700 text-slate-950 p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-xs font-black uppercase tracking-wider bg-black/10 px-3 py-1 rounded-full">
              Equipamentos de Diagnóstico & Infraestrutura
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-slate-950">
              Modernize a Tecnologia e o Faturamento da Sua Oficina
            </h3>
            <p className="text-xs sm:text-sm text-slate-900/90 max-w-xl">
              Elevadores certificados, scanners EAATA e Thinkcar multimarcas com inteligência artificial, alinhadores 3D e descarbonizadoras com condições exclusivas e suporte direto de fábrica.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigate ? onNavigate('catalog') : window.location.href = '/catalogo'}
            className="shrink-0 px-6 py-3.5 rounded-xl bg-slate-950 hover:bg-slate-900 text-white font-extrabold text-xs sm:text-sm shadow-xl flex items-center gap-2 cursor-pointer transition-transform active:scale-95"
          >
            <Package className="w-4 h-4 text-amber-400" />
            <span>Explorar Catálogo Completo</span>
          </button>
        </section>
      </div>
    </div>
  );
}
