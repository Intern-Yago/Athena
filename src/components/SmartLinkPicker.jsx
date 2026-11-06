import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Link2, 
  Search, 
  ChevronRight, 
  ArrowLeft, 
  Sparkles, 
  Package, 
  Tag, 
  Building2, 
  User, 
  Home, 
  ExternalLink, 
  X, 
  FileText,
  Check,
  FolderTree
} from 'lucide-react';

/**
 * Páginas fixas / nativas do ecossistema Athena
 */
const SYSTEM_PAGES = [
  {
    id: 'apoints',
    name: 'Programa A-Points (Fidelidade)',
    url: '/pontos',
    type: 'fidelidade',
    badge: 'A-Points',
    description: 'Extrato de pontos, regras de cashback e catálogo de resgate'
  },
  {
    id: 'catalog',
    name: 'Catálogo Geral (Início)',
    url: '/catalogo',
    type: 'page',
    badge: 'Catálogo',
    description: 'Página inicial com todos os equipamentos e busca avançada'
  },
  {
    id: 'account',
    name: 'Minha Conta / Perfil do Cliente',
    url: '/minha-conta',
    type: 'user',
    badge: 'Minha Conta',
    description: 'Painel do usuário, dados cadastrais, CNPJ e endereços'
  },
  {
    id: 'orders',
    name: 'Meus Pedidos & Cotações',
    url: '/pedidos',
    type: 'user',
    badge: 'Pedidos',
    description: 'Histórico de pedidos faturados e rastreamento de envio'
  },
  {
    id: 'all_categories',
    name: 'Todas as Categorias',
    url: '/categorias',
    type: 'category',
    badge: 'Categorias',
    description: 'Página vitrine com todas as categorias de equipamentos'
  },
  {
    id: 'all_brands',
    name: 'Todas as Marcas & Fabricantes',
    url: '/marcas',
    type: 'brand',
    badge: 'Marcas',
    description: 'Página vitrine com todos os fabricantes parceiros'
  },
  {
    id: 'about',
    name: 'Sobre a Athena Soluções',
    url: '/sobre',
    type: 'page',
    badge: 'Institucional',
    description: 'História, suporte técnico e credenciamento'
  },
  {
    id: 'terms',
    name: 'Termos de Uso',
    url: '/termos',
    type: 'page',
    badge: 'Legal',
    description: 'Termos e condições gerais de uso da plataforma'
  },
  {
    id: 'privacy',
    name: 'Política de Privacidade & LGPD',
    url: '/privacidade',
    type: 'page',
    badge: 'Legal',
    description: 'Tratamento de dados conforme a LGPD'
  }
];

/**
 * SmartLinkPicker
 * Seletor de links avançado estilo Shopify com suporte a:
 * 1. Autocomplete em tempo real ao digitar (pesquisa produtos, marcas, categorias e páginas internas).
 * 2. Navegação em árvore (drill-down tree) pelas seções principais.
 * 3. Inserção livre de qualquer URL customizada (externa ou interna).
 */
export default function SmartLinkPicker({
  value = '',
  onChange,
  targetBlank = false,
  onTargetBlankChange,
  products = [],
  categories = [],
  brands = []
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentView, setCurrentView] = useState('root'); // 'root' | 'pages' | 'categories' | 'brands' | 'products'
  const [drillSearch, setDrillSearch] = useState('');
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Fecha o popover ao clicar fora
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Normaliza string para busca
  const cleanStr = (str) =>
    (str || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();

  const query = cleanStr(value);
  const isCustomUrl = value.startsWith('http://') || value.startsWith('https://') || value.startsWith('wa.me');

  // Sugestões instantâneas ao digitar no campo
  const searchResults = useMemo(() => {
    if (!query || isCustomUrl || query.length < 2) return null;

    const matchedPages = SYSTEM_PAGES.filter(p => 
      cleanStr(p.name).includes(query) || cleanStr(p.url).includes(query) || cleanStr(p.description).includes(query)
    );

    const matchedCategories = (categories || []).filter(c => 
      cleanStr(c.name).includes(query) || cleanStr(c.slug).includes(query)
    ).slice(0, 8);

    const matchedBrands = (brands || []).filter(b => 
      cleanStr(b.name).includes(query) || cleanStr(b.slug).includes(query)
    ).slice(0, 8);

    const matchedProducts = (products || []).filter(p => 
      cleanStr(p.name).includes(query) || cleanStr(p.sku).includes(query)
    ).slice(0, 10);

    const totalCount = matchedPages.length + matchedCategories.length + matchedBrands.length + matchedProducts.length;

    return {
      pages: matchedPages,
      categories: matchedCategories,
      brands: matchedBrands,
      products: matchedProducts,
      totalCount
    };
  }, [query, isCustomUrl, categories, brands, products]);

  // Manipulador de seleção de rota interna
  const handleSelectRoute = (routeUrl, autoBlank = false) => {
    onChange(routeUrl);
    if (onTargetBlankChange) {
      onTargetBlankChange(autoBlank);
    }
    setIsOpen(false);
    setCurrentView('root');
    setDrillSearch('');
  };

  // Identificação do rótulo atual se for rota interna conhecida
  const matchedKnownItem = useMemo(() => {
    if (!value) return null;
    const cleanVal = value.trim();

    const page = SYSTEM_PAGES.find(p => p.url === cleanVal);
    if (page) return { label: page.name, badge: page.badge, icon: Sparkles };

    if (cleanVal.startsWith('/categoria/')) {
      const slug = cleanVal.replace('/categoria/', '');
      const cat = categories.find(c => c.slug === slug || c.id === slug || String(c.id) === slug);
      if (cat) return { label: `Categoria: ${cat.name}`, badge: 'Categoria', icon: Tag };
    }

    if (cleanVal.startsWith('/marca/')) {
      const slug = cleanVal.replace('/marca/', '');
      const brand = brands.find(b => b.slug === slug || b.id === slug || String(b.id) === slug);
      if (brand) return { label: `Marca: ${brand.name}`, badge: 'Marca', icon: Building2 };
    }

    if (cleanVal.startsWith('/produto/')) {
      const slug = cleanVal.replace('/produto/', '');
      const prod = products.find(p => p.slug === slug || p.id === slug || String(p.id) === slug);
      if (prod) return { label: prod.name, badge: 'Produto', icon: Package };
    }

    if (isCustomUrl) {
      return { label: 'Link Externo', badge: 'URL Web', icon: ExternalLink };
    }

    return null;
  }, [value, categories, brands, products, isCustomUrl]);

  return (
    <div ref={containerRef} className="relative w-full space-y-2">
      {/* Campo Principal de Input com Ações Integradas */}
      <div className="relative flex items-center">
        <div className="absolute left-3 text-slate-400 pointer-events-none flex items-center">
          <Link2 className="w-4 h-4" />
        </div>

        <input
          ref={inputRef}
          type="text"
          placeholder="Digite uma URL externa (https://...) ou pesquise páginas, marcas, produtos..."
          value={value}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            const val = e.target.value;
            onChange(val);
            if (!isOpen) setIsOpen(true);
            // Se o usuário colou URL externa, sugere abrir em nova aba
            if ((val.startsWith('http://') || val.startsWith('https://') || val.startsWith('wa.me')) && onTargetBlankChange) {
              onTargetBlankChange(true);
            }
          }}
          className="form-input text-xs pl-9 pr-24 py-2.5 w-full font-mono text-slate-900 border-slate-300 focus:border-amber-500 focus:ring-amber-500/20 rounded-xl"
        />

        <div className="absolute right-2 flex items-center gap-1">
          {value && (
            <button
              type="button"
              onClick={() => {
                onChange('');
                setDrillSearch('');
                inputRef.current?.focus();
              }}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              title="Limpar link"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              setIsOpen(!isOpen);
              if (!isOpen) setCurrentView('root');
            }}
            className={`px-2 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition cursor-pointer ${
              isOpen 
                ? 'bg-amber-500 text-slate-950 shadow-xs' 
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
            title="Abrir árvore de links"
          >
            <FolderTree className="w-3.5 h-3.5" />
            <span>Navegar</span>
          </button>
        </div>
      </div>

      {/* Badge de Reconhecimento do Link Atual */}
      {matchedKnownItem && (
        <div className="flex items-center gap-2 text-[11px] px-2.5 py-1 bg-amber-50/80 border border-amber-200/80 rounded-lg text-amber-950 animate-in fade-in">
          <matchedKnownItem.icon className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span className="font-semibold">{matchedKnownItem.label}</span>
          <span className="ml-auto text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-200/60 text-amber-900 font-bold">
            {matchedKnownItem.badge}
          </span>
        </div>
      )}

      {/* Popover de Navegação em Árvore & Sugestões Estilo Shopify */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 z-[9999] bg-white rounded-2xl border border-slate-200/90 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-xs">
          
          {/* MODO 1: RESULTADOS DE AUTOCOMPLETE AO DIGITAR */}
          {searchResults && searchResults.totalCount > 0 ? (
            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
              <div className="p-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                <span>Sugestões para "<strong>{value}</strong>" ({searchResults.totalCount})</span>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Páginas do Sistema */}
              {searchResults.pages.length > 0 && (
                <div className="p-2 space-y-1">
                  <div className="text-[10px] font-black uppercase text-amber-900 tracking-wider px-2 py-0.5">
                    Páginas & Recursos
                  </div>
                  {searchResults.pages.map(page => (
                    <button
                      key={page.id}
                      type="button"
                      onClick={() => handleSelectRoute(page.url, false)}
                      className="w-full text-left p-2 rounded-xl hover:bg-amber-50/80 transition flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                          <Sparkles className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 truncate group-hover:text-amber-950">
                            {page.name}
                          </div>
                          <div className="text-[10px] text-slate-500 truncate font-mono">
                            {page.url}
                          </div>
                        </div>
                      </div>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 shrink-0">
                        {page.badge}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Categorias */}
              {searchResults.categories.length > 0 && (
                <div className="p-2 space-y-1">
                  <div className="text-[10px] font-black uppercase text-blue-900 tracking-wider px-2 py-0.5">
                    Categorias
                  </div>
                  {searchResults.categories.map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleSelectRoute(`/categoria/${cat.slug || cat.id}`, false)}
                      className="w-full text-left p-2 rounded-xl hover:bg-blue-50/80 transition flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
                          <Tag className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 truncate group-hover:text-blue-950">
                            {cat.name}
                          </div>
                          <div className="text-[10px] text-slate-500 truncate font-mono">
                            /categoria/{cat.slug || cat.id}
                          </div>
                        </div>
                      </div>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 shrink-0">
                        Categoria
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Marcas */}
              {searchResults.brands.length > 0 && (
                <div className="p-2 space-y-1">
                  <div className="text-[10px] font-black uppercase text-purple-900 tracking-wider px-2 py-0.5">
                    Marcas / Fabricantes
                  </div>
                  {searchResults.brands.map(brand => (
                    <button
                      key={brand.id}
                      type="button"
                      onClick={() => handleSelectRoute(`/marca/${brand.slug || brand.id}`, false)}
                      className="w-full text-left p-2 rounded-xl hover:bg-purple-50/80 transition flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-6 h-6 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center shrink-0">
                          <Building2 className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 truncate group-hover:text-purple-950">
                            {brand.name}
                          </div>
                          <div className="text-[10px] text-slate-500 truncate font-mono">
                            /marca/{brand.slug || brand.id}
                          </div>
                        </div>
                      </div>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 shrink-0">
                        Marca
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Produtos */}
              {searchResults.products.length > 0 && (
                <div className="p-2 space-y-1">
                  <div className="text-[10px] font-black uppercase text-emerald-900 tracking-wider px-2 py-0.5">
                    Equipamentos & Ferramentas
                  </div>
                  {searchResults.products.map(product => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => handleSelectRoute(`/produto/${product.slug || product.id}`, false)}
                      className="w-full text-left p-2 rounded-xl hover:bg-emerald-50/80 transition flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                          <Package className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 truncate group-hover:text-emerald-950">
                            {product.name}
                          </div>
                          <div className="text-[10px] text-slate-500 truncate font-mono">
                            /produto/{product.slug || product.id}
                          </div>
                        </div>
                      </div>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 shrink-0">
                        Produto
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* MODO 2: ÁRVORE INTERATIVA (SHOPIFY TREE DRILL-DOWN) */
            <div className="max-h-84 overflow-y-auto">
              
              {/* NÍVEL RAIZ ('root') */}
              {currentView === 'root' && (
                <div className="divide-y divide-slate-100">
                  <div className="p-3 bg-slate-50/80 flex items-center justify-between">
                    <span className="font-bold text-slate-700 text-xs flex items-center gap-1.5">
                      <FolderTree className="w-4 h-4 text-amber-600" />
                      Escolha o destino do banner
                    </span>
                    <span className="text-[10px] text-slate-400">Estilo Shopify Tree</span>
                  </div>

                  <div className="p-2 space-y-1">
                    {/* A-Points Especial */}
                    <button
                      type="button"
                      onClick={() => handleSelectRoute('/pontos', false)}
                      className="w-full text-left p-2.5 rounded-xl hover:bg-amber-50 transition flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 font-black flex items-center justify-center shadow-xs">
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 group-hover:text-amber-950 text-xs">
                            Programa A-Points (Fidelidade)
                          </div>
                          <div className="text-[10px] text-slate-500">
                            Direciona para extrato e regras de pontos (/pontos)
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                        Recomendado
                      </span>
                    </button>

                    {/* Catálogo Geral */}
                    <button
                      type="button"
                      onClick={() => handleSelectRoute('/catalogo', false)}
                      className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 transition flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                          <Home className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-xs">
                            Catálogo Geral (Início)
                          </div>
                          <div className="text-[10px] text-slate-500">
                            Página inicial com todos os produtos (/catalogo)
                          </div>
                        </div>
                      </div>
                      <Check className="w-4 h-4 text-slate-300 group-hover:text-slate-700" />
                    </button>

                    {/* Pasta: Categorias */}
                    <div className="flex items-center gap-1 p-1 rounded-xl hover:bg-blue-50/50 transition">
                      <button
                        type="button"
                        onClick={() => handleSelectRoute('/categorias', false)}
                        className="flex-1 text-left p-1.5 flex items-center gap-2.5 cursor-pointer"
                        title="Ir para a página de todas as categorias (/categorias)"
                      >
                        <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
                          <Tag className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-xs">Categorias</div>
                          <div className="text-[10px] text-slate-500">{categories.length} categorias cadastradas</div>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentView('categories');
                          setDrillSearch('');
                        }}
                        className="py-1.5 px-2.5 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-900 font-bold text-[11px] flex items-center gap-1 cursor-pointer transition shrink-0"
                        title="Ver categorias específicas"
                      >
                        <span>Ver lista</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Pasta: Marcas */}
                    <div className="flex items-center gap-1 p-1 rounded-xl hover:bg-purple-50/50 transition">
                      <button
                        type="button"
                        onClick={() => handleSelectRoute('/marcas', false)}
                        className="flex-1 text-left p-1.5 flex items-center gap-2.5 cursor-pointer"
                        title="Ir para a página de todas as marcas (/marcas)"
                      >
                        <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center shrink-0">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-xs">Marcas & Fabricantes</div>
                          <div className="text-[10px] text-slate-500">{brands.length} marcas parceiras</div>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentView('brands');
                          setDrillSearch('');
                        }}
                        className="py-1.5 px-2.5 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-900 font-bold text-[11px] flex items-center gap-1 cursor-pointer transition shrink-0"
                        title="Ver marcas específicas"
                      >
                        <span>Ver lista</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Pasta: Produtos Específicos */}
                    <div className="flex items-center gap-1 p-1 rounded-xl hover:bg-emerald-50/50 transition">
                      <button
                        type="button"
                        onClick={() => handleSelectRoute('/catalogo', false)}
                        className="flex-1 text-left p-1.5 flex items-center gap-2.5 cursor-pointer"
                        title="Ir para todos os produtos (/catalogo)"
                      >
                        <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                          <Package className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-xs">Produtos / Equipamentos</div>
                          <div className="text-[10px] text-slate-500">{products.length} produtos no catálogo</div>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentView('products');
                          setDrillSearch('');
                        }}
                        className="py-1.5 px-2.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold text-[11px] flex items-center gap-1 cursor-pointer transition shrink-0"
                        title="Escolher produto específico"
                      >
                        <span>Ver lista</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Pasta: Área do Cliente / Páginas */}
                    <div className="flex items-center gap-1 p-1 rounded-xl hover:bg-amber-50/50 transition">
                      <button
                        type="button"
                        onClick={() => handleSelectRoute('/minha-conta', false)}
                        className="flex-1 text-left p-1.5 flex items-center gap-2.5 cursor-pointer"
                        title="Ir para a Minha Conta (/minha-conta)"
                      >
                        <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                          <User className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-xs">Área do Usuário & Outras Páginas</div>
                          <div className="text-[10px] text-slate-500">Minha Conta, Pedidos, Sobre, Termos...</div>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentView('pages');
                          setDrillSearch('');
                        }}
                        className="py-1.5 px-2.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-[11px] flex items-center gap-1 cursor-pointer transition shrink-0"
                      >
                        <span>Ver todas</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* SUB-NÍVEL: CATEGORIAS ('categories') */}
              {currentView === 'categories' && (
                <div className="p-3 space-y-2">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <button
                      type="button"
                      onClick={() => setCurrentView('root')}
                      className="flex items-center gap-1 font-bold text-slate-700 hover:text-amber-800 text-xs cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Voltar para Início</span>
                    </button>
                    <span className="font-black text-blue-900 text-xs">Categorias</span>
                  </div>

                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Filtrar categoria..."
                      value={drillSearch}
                      onChange={(e) => setDrillSearch(e.target.value)}
                      className="form-input text-xs pl-8 py-1.5 w-full rounded-xl"
                      autoFocus
                    />
                  </div>

                  <div className="max-h-60 overflow-y-auto space-y-1 pt-1">
                    <button
                      type="button"
                      onClick={() => handleSelectRoute('/categorias', false)}
                      className="w-full text-left p-2 rounded-xl bg-blue-50/60 hover:bg-blue-100 text-blue-950 font-bold flex items-center justify-between text-xs cursor-pointer"
                    >
                      <span>📂 Todas as Categorias (Geral)</span>
                      <span className="text-[10px] font-mono">/categorias</span>
                    </button>

                    {(categories || [])
                      .filter(c => cleanStr(c.name).includes(cleanStr(drillSearch)))
                      .map(cat => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => handleSelectRoute(`/categoria/${cat.slug || cat.id}`, false)}
                          className="w-full text-left p-2 rounded-xl hover:bg-slate-50 flex items-center justify-between group cursor-pointer text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <Tag className="w-3.5 h-3.5 text-blue-600" />
                            <span className="font-semibold text-slate-800 group-hover:text-blue-950">
                              {cat.name}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">
                            /categoria/{cat.slug || cat.id}
                          </span>
                        </button>
                      ))}
                  </div>
                </div>
              )}

              {/* SUB-NÍVEL: MARCAS ('brands') */}
              {currentView === 'brands' && (
                <div className="p-3 space-y-2">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <button
                      type="button"
                      onClick={() => setCurrentView('root')}
                      className="flex items-center gap-1 font-bold text-slate-700 hover:text-amber-800 text-xs cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Voltar para Início</span>
                    </button>
                    <span className="font-black text-purple-900 text-xs">Marcas & Fabricantes</span>
                  </div>

                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Filtrar marca..."
                      value={drillSearch}
                      onChange={(e) => setDrillSearch(e.target.value)}
                      className="form-input text-xs pl-8 py-1.5 w-full rounded-xl"
                      autoFocus
                    />
                  </div>

                  <div className="max-h-60 overflow-y-auto space-y-1 pt-1">
                    <button
                      type="button"
                      onClick={() => handleSelectRoute('/marcas', false)}
                      className="w-full text-left p-2 rounded-xl bg-purple-50/60 hover:bg-purple-100 text-purple-950 font-bold flex items-center justify-between text-xs cursor-pointer"
                    >
                      <span>🏢 Todas as Marcas (Geral)</span>
                      <span className="text-[10px] font-mono">/marcas</span>
                    </button>

                    {(brands || [])
                      .filter(b => cleanStr(b.name).includes(cleanStr(drillSearch)))
                      .map(brand => (
                        <button
                          key={brand.id}
                          type="button"
                          onClick={() => handleSelectRoute(`/marca/${brand.slug || brand.id}`, false)}
                          className="w-full text-left p-2 rounded-xl hover:bg-slate-50 flex items-center justify-between group cursor-pointer text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <Building2 className="w-3.5 h-3.5 text-purple-600" />
                            <span className="font-semibold text-slate-800 group-hover:text-purple-950">
                              {brand.name}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">
                            /marca/{brand.slug || brand.id}
                          </span>
                        </button>
                      ))}
                  </div>
                </div>
              )}

              {/* SUB-NÍVEL: PRODUTOS ('products') */}
              {currentView === 'products' && (
                <div className="p-3 space-y-2">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <button
                      type="button"
                      onClick={() => setCurrentView('root')}
                      className="flex items-center gap-1 font-bold text-slate-700 hover:text-amber-800 text-xs cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Voltar para Início</span>
                    </button>
                    <span className="font-black text-emerald-900 text-xs">Equipamentos</span>
                  </div>

                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Buscar por nome ou SKU..."
                      value={drillSearch}
                      onChange={(e) => setDrillSearch(e.target.value)}
                      className="form-input text-xs pl-8 py-1.5 w-full rounded-xl"
                      autoFocus
                    />
                  </div>

                  <div className="max-h-60 overflow-y-auto space-y-1 pt-1">
                    <button
                      type="button"
                      onClick={() => handleSelectRoute('/catalogo', false)}
                      className="w-full text-left p-2 rounded-xl bg-emerald-50/60 hover:bg-emerald-100 text-emerald-950 font-bold flex items-center justify-between text-xs cursor-pointer"
                    >
                      <span>📦 Todos os Produtos (Catálogo Geral)</span>
                      <span className="text-[10px] font-mono">/catalogo</span>
                    </button>

                    {(products || [])
                      .filter(p => cleanStr(p.name).includes(cleanStr(drillSearch)) || cleanStr(p.sku).includes(cleanStr(drillSearch)))
                      .slice(0, 30)
                      .map(prod => (
                        <button
                          key={prod.id}
                          type="button"
                          onClick={() => handleSelectRoute(`/produto/${prod.slug || prod.id}`, false)}
                          className="w-full text-left p-2 rounded-xl hover:bg-slate-50 flex items-center justify-between group cursor-pointer text-xs"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <Package className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span className="font-semibold text-slate-800 truncate group-hover:text-emerald-950">
                              {prod.name}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono shrink-0 ml-2">
                            {prod.sku || `/produto/${prod.slug || prod.id}`}
                          </span>
                        </button>
                      ))}
                  </div>
                </div>
              )}

              {/* SUB-NÍVEL: PÁGINAS DO SISTEMA ('pages') */}
              {currentView === 'pages' && (
                <div className="p-3 space-y-2">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <button
                      type="button"
                      onClick={() => setCurrentView('root')}
                      className="flex items-center gap-1 font-bold text-slate-700 hover:text-amber-800 text-xs cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Voltar para Início</span>
                    </button>
                    <span className="font-black text-amber-900 text-xs">Páginas Institucionais</span>
                  </div>

                  <div className="max-h-60 overflow-y-auto space-y-1 pt-1">
                    {SYSTEM_PAGES.map(page => (
                      <button
                        key={page.id}
                        type="button"
                        onClick={() => handleSelectRoute(page.url, false)}
                        className="w-full text-left p-2 rounded-xl hover:bg-slate-50 flex items-center justify-between group cursor-pointer text-xs"
                      >
                        <div>
                          <div className="font-semibold text-slate-800 group-hover:text-amber-950">
                            {page.name}
                          </div>
                          <div className="text-[10px] text-slate-400">{page.description}</div>
                        </div>
                        <span className="text-[10px] font-mono text-slate-500 font-bold">
                          {page.url}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* Rodapé explicativo do Popover */}
          <div className="p-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
            <span>💡 Digite para pesquisar ou cole qualquer link externo</span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-amber-800 font-bold hover:underline cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* Checkbox de Abrir em Nova Aba */}
      <div className="flex items-center justify-between pt-1">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={targetBlank}
            onChange={(e) => onTargetBlankChange && onTargetBlankChange(e.target.checked)}
            className="rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
          />
          <span className="text-xs text-slate-600 font-medium">
            Abrir link em nova aba (`target="_blank"`)
          </span>
        </label>

        {isCustomUrl && (
          <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md font-semibold">
            Link Externo Detectado
          </span>
        )}
      </div>
    </div>
  );
}
