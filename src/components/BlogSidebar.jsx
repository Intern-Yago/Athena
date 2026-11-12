import React, { useState } from 'react';
import { 
  Search, 
  X, 
  Layers, 
  ChevronRight, 
  Sparkles, 
  Calendar, 
  Clock, 
  MessageCircle, 
  Package, 
  ArrowRight,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';

export default function BlogSidebar({
  categories = [],
  selectedCategory = 'all',
  onSelectCategory,
  searchQuery = '',
  onSearchChange,
  onSearchSubmit,
  recommendedPosts = [],
  onNavigatePost,
  currentPostSlug = null,
  showSearch = true,
  className = ''
}) {
  const [localSearch, setLocalSearch] = useState(searchQuery || '');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearchSubmit) {
      onSearchSubmit(localSearch.trim());
    }
  };

  const handleSearchChange = (val) => {
    setLocalSearch(val);
    if (onSearchChange) {
      onSearchChange(val);
    }
  };

  const handleClearSearch = () => {
    setLocalSearch('');
    if (onSearchChange) onSearchChange('');
    if (onSearchSubmit) onSearchSubmit('');
  };

  const getPostCover = (p) => {
    if (!p) return 'https://images.athenaconsultoria.com.br/produtos/scanner-automotivo-thinkcar-thinktool-lite-fce404d4f151.webp';
    const img = p.cover_image_url || p.cover_image_key || p.coverImage;
    if (!img) {
      if (p.slug && p.slug.includes('eaata')) {
        return 'https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/athena_produtos/eaata-aa7d50879091.webp';
      }
      return 'https://images.athenaconsultoria.com.br/produtos/scanner-automotivo-thinkcar-thinktool-lite-fce404d4f151.webp';
    }
    if (img.startsWith('http')) return img;
    return `https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/${img.replace(/^\//, '')}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
    } catch {
      return '';
    }
  };

  // Filtrar para não mostrar o post atual na lista de recomendados
  const filteredRecommendations = (recommendedPosts || [])
    .filter(p => !currentPostSlug || p.slug !== currentPostSlug)
    .slice(0, 4);

  return (
    <aside aria-label="Barra Lateral do Blog" className={`space-y-6 ${className}`}>
      {/* Widget 1: Busca Rápida no Blog */}
      {showSearch && (
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 mb-2.5 block">
            Pesquisa no Blog
          </span>
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar tema ou scanner..."
              value={localSearch}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full text-xs pl-9 pr-8 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-amber-500 transition-colors placeholder:text-slate-400 outline-none"
            />
            {localSearch && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                title="Limpar busca"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>
        </div>
      )}

      {/* Widget 2: Categorias Temáticas */}
      {Array.isArray(categories) && categories.length > 0 && (
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-amber-600" />
              <span>Categorias</span>
            </span>
            {selectedCategory !== 'all' && (
              <button
                type="button"
                onClick={() => onSelectCategory && onSelectCategory('all')}
                className="text-[11px] font-bold text-amber-600 hover:text-amber-700 cursor-pointer"
              >
                Limpar filtro
              </button>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <button
              type="button"
              onClick={() => onSelectCategory && onSelectCategory('all')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <span>Todos os Artigos</span>
              <ChevronRight className={`w-3.5 h-3.5 ${selectedCategory === 'all' ? 'text-white' : 'text-slate-400'}`} />
            </button>

            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.slug;
              return (
                <button
                  key={cat.id || cat.slug}
                  type="button"
                  onClick={() => onSelectCategory && onSelectCategory(cat.slug)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <span className="truncate">{cat.name}</span>
                  <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Widget 3: Artigos Recomendados */}
      {filteredRecommendations.length > 0 && (
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs space-y-3">
          <div className="flex items-center gap-1.5 pb-2 border-b border-slate-100">
            <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
            <span className="text-xs font-black uppercase tracking-wider text-slate-900">
              Artigos Recomendados
            </span>
          </div>

          <div className="space-y-3">
            {filteredRecommendations.map((post) => {
              const cover = getPostCover(post);
              return (
                <div
                  key={post.id || post.slug}
                  onClick={() => onNavigatePost && onNavigatePost(post.slug)}
                  className="group flex items-start gap-3 p-1.5 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <div className="relative w-20 h-16 rounded-xl overflow-hidden bg-slate-900 shrink-0 border border-slate-200">
                    <img
                      src={cover}
                      alt={post.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.target.src = 'https://images.athenaconsultoria.com.br/produtos/scanner-automotivo-thinkcar-thinktool-lite-fce404d4f151.webp';
                      }}
                    />
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-amber-600 transition-colors line-clamp-2 leading-snug">
                      {post.title}
                    </h4>

                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                      {post.published_at && (
                        <span>{formatDate(post.published_at)}</span>
                      )}
                      {post.reading_time_minutes && (
                        <>
                          <span>•</span>
                          <span>{post.reading_time_minutes} min</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Widget 4: Card de Consultoria Especializada Athena */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white p-6 border border-amber-500/30 shadow-md space-y-4">
        <div className="space-y-1.5">
          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-amber-500 text-slate-950 px-2.5 py-0.5 rounded-full">
            <ShieldCheck className="w-3 h-3" />
            <span>Consultoria Oficial</span>
          </span>
          <h4 className="text-sm font-black text-white leading-snug">
            Dúvidas sobre Scanners ou Equipamentos para sua Oficina?
          </h4>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            Fale com nossos engenheiros de aplicação e consultores comerciais. Atendimento técnico especializado para mecânicas em todo o Brasil.
          </p>
        </div>

        <a
          href="https://wa.me/5561983485671?text=Ol%C3%A1%21+Estou+lendo+o+blog+da+Athena+e+gostaria+de+falar+com+um+consultor+t%C3%A9cnico."
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs inline-flex items-center justify-center gap-2 transition cursor-pointer shadow-md"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Falar no WhatsApp Oficial</span>
        </a>
      </div>
    </aside>
  );
}
