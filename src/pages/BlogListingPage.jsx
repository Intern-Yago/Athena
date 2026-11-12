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

// Artigos de fallback enriquecidos (caso o backend esteja inicializando ou sem posts cadastrados)
const FALLBACK_POSTS = [
  {
    id: 'post_thinktool_lite_guia',
    slug: 'guia-definitivo-thinkcar-thinktool-lite-diagnostico-ia',
    title: 'Guia Definitivo: Scanner Thinkcar THINKTOOL LITE e Diagnóstico com IA',
    summary: 'Descubra como o ThinkTool Lite revoluciona oficinas mecânicas através de diagnósticos inteligentes, leitura rápida de módulos, funções especiais e atualização direta de fábrica.',
    cover_image_url: 'https://images.athenaconsultoria.com.br/produtos/scanner-automotivo-thinkcar-thinktool-lite-fce404d4f151.webp',
    published_at: '2026-11-10T10:00:00.000Z',
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

export default function BlogListingPage({ onNavigate }) {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Carrega categorias disponíveis
  useEffect(() => {
    let isMounted = true;
    async function loadCategories() {
      try {
        const res = await fetch('/api/blog/categories');
        if (res.ok) {
          const data = await res.json();
          if (isMounted && Array.isArray(data) && data.length > 0) {
            setCategories(data);
          }
        }
      } catch (err) {
        // Fallback para categorias padrão
        if (isMounted) {
          setCategories([
            { id: 'cat_diag', name: 'Diagnóstico & IA', slug: 'diagnostico-ia' },
            { id: 'cat_adas', name: 'Sistemas ADAS', slug: 'sistemas-adas' },
            { id: 'cat_elev', name: 'Elevadores & Oficinas', slug: 'elevadores-oficinas' },
            { id: 'cat_gest', name: 'Gestão de Auto Centers', slug: 'gestao-auto-centers' }
          ]);
        }
      }
    }
    loadCategories();
    return () => { isMounted = false; };
  }, []);

  // Carrega posts com paginação e filtro
  useEffect(() => {
    let isMounted = true;
    async function loadPosts() {
      setIsLoading(true);
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
            return;
          }
        }
      } catch (err) {
        // Fallback controlado
      }

      // Aplica fallback se a API não retornou artigos
      if (isMounted) {
        let filtered = FALLBACK_POSTS;
        if (selectedCategory !== 'all') {
          filtered = filtered.filter(p => p.categories?.some(c => c.slug === selectedCategory));
        }
        setPosts(filtered);
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
    if (onNavigate) {
      onNavigate(`blog/${slug}`);
    } else {
      window.location.href = `/blog/${slug}`;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-6 sm:py-10">
      <div className="container-custom space-y-8 sm:space-y-12">
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
              Análises especializadas em diagnóstico automotivo, calibração ADAS, manutenção de elevadores, eletrônica embarcada e gestão de alta rentabilidade para auto centers.
            </p>
          </div>
        </header>

        {/* Barra de Filtros e Busca */}
        <section aria-label="Filtros e Pesquisa" className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Pílulas de Categorias */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
              <button
                type="button"
                onClick={() => { setSelectedCategory('all'); setPage(1); }}
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
                  onClick={() => { setSelectedCategory(cat.slug); setPage(1); }}
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

            {/* Input de Busca */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por tema, scanner ou assunto..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input text-xs !pl-10 !pr-8 py-2.5 w-full rounded-xl bg-white border-slate-200 focus:border-amber-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  title="Limpar busca"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </section>

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
              Não encontramos nenhum artigo correspondente à sua busca ou categoria selecionada. Tente outros termos ou limpe o filtro.
            </p>
            <button
              type="button"
              onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
              className="btn-gold text-xs font-bold py-2.5 px-6 inline-flex items-center gap-2 cursor-pointer"
            >
              Ver todos os artigos
            </button>
          </div>
        )}

        {/* Artigo em Destaque (Hero Post Card) */}
        {!isLoading && featuredPost && (
          <article 
            onClick={() => handlePostClick(featuredPost.slug)}
            className="group bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer grid grid-cols-1 lg:grid-cols-12"
          >
            <div className="lg:col-span-7 relative aspect-[16/9] lg:aspect-auto overflow-hidden bg-slate-900">
              <img
                src={featuredPost.cover_image_url || 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=1000&auto=format&fit=crop&q=80'}
                alt={featuredPost.title}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=1000&auto=format&fit=crop&q=80';
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

            <div className="lg:col-span-5 p-6 sm:p-10 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
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

                <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 group-hover:text-amber-600 transition leading-snug">
                  <a
                    href={`/blog/${featuredPost.slug}`}
                    onClick={(e) => { e.preventDefault(); handlePostClick(featuredPost.slug); }}
                    className="hover:underline"
                  >
                    {featuredPost.title}
                  </a>
                </h2>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3">
                  {featuredPost.summary}
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
          <section aria-label="Lista de Artigos" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {regularPosts.map((post) => (
              <article
                key={post.id || post.slug}
                onClick={() => handlePostClick(post.slug)}
                className="group bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-[16/9] overflow-hidden bg-slate-900">
                    <img
                      src={post.cover_image_url || 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=600&auto=format&fit=crop&q=80'}
                      alt={post.title}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=600&auto=format&fit=crop&q=80';
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
                      {post.summary}
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
            ))}
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

        {/* CTA Cross-Sell para o Catálogo */}
        <section className="rounded-3xl bg-gradient-to-r from-amber-600 to-amber-700 text-slate-950 p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-xs font-black uppercase tracking-wider bg-black/10 px-3 py-1 rounded-full">
              Equipamentos de Diagnóstico & Infraestrutura
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-slate-950">
              Modernize a Tecnologia e o Faturamento da Sua Oficina
            </h3>
            <p className="text-xs sm:text-sm text-slate-900/90 max-w-xl">
              Elevadores certificados, scanners Thinkcar multimarcas com inteligência artificial, alinhadores 3D e descarbonizadoras com condições exclusivas e suporte direto de fábrica.
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
