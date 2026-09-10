import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  Images, 
  Search, 
  X, 
  Check, 
  Star, 
  Trash2, 
  Loader2, 
  Plus, 
  Upload, 
  ExternalLink,
  Copy,
  Maximize2,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Package,
  Info
} from 'lucide-react';

/**
 * ImageLibraryModal
 * Permite navegar por todas as fotos armazenadas no Cloudflare R2,
 * com busca em tempo real, filtros por uso (todas, em uso, não utilizadas, neste produto),
 * visualização expandida em lightbox ao clicar na foto, scroll estável (sem reset)
 * e confirmação in-app elegante com aviso de desvinculação automática de produtos.
 */
export default function ImageLibraryModal({
  isOpen,
  onClose,
  currentImages = [],
  currentCover = '',
  onSelectImage,
  onRemoveImageFromProduct,
  onSetAsCover,
  products = [],
  API_BASE_URL,
  getAuthHeaders,
  showNotification,
  isStandalone = false
}) {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [usageFilter, setUsageFilter] = useState('all'); // 'all' | 'in_use' | 'unused' | 'current_product'
  const [expandedImage, setExpandedImage] = useState(null);
  const [deletingKey, setDeletingKey] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [uploadingDirect, setUploadingDirect] = useState(false);

  const scrollContainerRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  // Keep latest callbacks in refs to avoid fetchLibrary churn and scroll resets
  const getAuthHeadersRef = useRef(getAuthHeaders);
  useEffect(() => { getAuthHeadersRef.current = getAuthHeaders; });
  const showNotificationRef = useRef(showNotification);
  useEffect(() => { showNotificationRef.current = showNotification; });

  const apiUrl = API_BASE_URL || (typeof window !== 'undefined' && import.meta.env?.VITE_API_URL) || 'https://athena-backend-hu1m.onrender.com/api';

  // Map of URL -> Array of product names using it
  const usedImagesMap = useMemo(() => {
    const map = new Map();
    (products || []).forEach(prod => {
      const allUrls = [prod.image, ...(Array.isArray(prod.images) ? prod.images : [])].filter(Boolean);
      allUrls.forEach(url => {
        if (!map.has(url)) map.set(url, []);
        const list = map.get(url);
        if (!list.includes(prod.name)) {
          list.push(prod.name);
        }
      });
    });
    return map;
  }, [products]);

  // Debounce search query
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 350);
    return () => clearTimeout(searchTimeoutRef.current);
  }, [searchQuery]);

  // Fetch library page - only depends on apiUrl
  const fetchLibrary = useCallback(async (pageNum = 1, search = '', append = false) => {
    if (pageNum === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const params = new URLSearchParams({
        page: String(pageNum),
        limit: '36',
        search: search
      });

      const headers = getAuthHeadersRef.current ? getAuthHeadersRef.current() : {};
      const res = await fetch(`${apiUrl}/upload/library?${params.toString()}`, { headers });

      if (!res.ok) {
        throw new Error('Falha ao carregar imagens do storage.');
      }

      const data = await res.json();
      const newItems = data.items || [];

      if (append) {
        setItems(prev => {
          const existingKeys = new Set(prev.map(i => i.key));
          const filtered = newItems.filter(i => !existingKeys.has(i.key));
          return [...prev, ...filtered];
        });
      } else {
        setItems(newItems);
      }

      setPage(data.page || pageNum);
      setHasMore(Boolean(data.hasMore));
      setTotalCount(data.total || 0);
    } catch (err) {
      console.error('Erro na biblioteca de imagens:', err);
      showNotificationRef.current?.(err.message || 'Erro ao consultar fotos do R2.', 'error');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [apiUrl]);

  // Initial load or search query change
  useEffect(() => {
    if (isOpen) {
      fetchLibrary(1, debouncedSearch, false);
    } else {
      setItems([]);
      setPage(1);
      setSearchQuery('');
      setDebouncedSearch('');
      setItemToDelete(null);
      setExpandedImage(null);
      setUsageFilter('all');
    }
  }, [isOpen, debouncedSearch, fetchLibrary]);

  // Close submodals on ESC
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') {
        if (expandedImage) {
          e.stopPropagation();
          setExpandedImage(null);
          return;
        }
        if (itemToDelete && !deletingKey) {
          e.stopPropagation();
          setItemToDelete(null);
          return;
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [expandedImage, itemToDelete, deletingKey]);

  // Infinite Scroll Trigger via Scroll Listener
  const handleScroll = () => {
    if (!scrollContainerRef.current || loading || loadingMore || !hasMore) return;
    const { scrollTop, clientHeight, scrollHeight } = scrollContainerRef.current;
    if (scrollTop + clientHeight >= scrollHeight - 350) {
      const nextPage = page + 1;
      fetchLibrary(nextPage, debouncedSearch, true);
    }
  };

  // Direct upload within library
  const handleDirectUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadingDirect(true);
    showNotificationRef.current?.('Enviando nova imagem para a biblioteca...', 'info');

    let successCount = 0;
    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) continue;
      try {
        const reader = new FileReader();
        const base64 = await new Promise((resolve, reject) => {
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        const headers = getAuthHeadersRef.current ? getAuthHeadersRef.current() : {};
        const res = await fetch(`${apiUrl}/upload`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ file: base64, folder: 'athena_produtos' })
        });

        if (res.ok) {
          successCount++;
        }
      } catch (err) {
        console.error('Falha no upload direto da biblioteca:', err);
      }
    }

    setUploadingDirect(false);
    if (successCount > 0) {
      showNotificationRef.current?.(`${successCount} nova(s) imagem(ns) adicionada(s) à biblioteca!`, 'success');
      fetchLibrary(1, debouncedSearch, false);
    }
    e.target.value = '';
  };

  // Confirm and delete permanently from Cloudflare R2 without resetting scroll
  const confirmDeleteFromStorage = async (item) => {
    if (!item) return;

    setDeletingKey(item.key);
    try {
      const headers = getAuthHeadersRef.current ? getAuthHeadersRef.current() : {};
      const res = await fetch(`${apiUrl}/upload/delete`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ url: item.url })
      });

      if (!res.ok) {
        throw new Error('Falha ao excluir arquivo do Cloudflare R2.');
      }

      const resData = await res.json().catch(() => ({}));
      const affected = resData.affectedProducts || 0;

      // Stable in-place deletion: preserve scroll position
      setItems(prev => prev.filter(i => i.key !== item.key));
      setTotalCount(prev => Math.max(0, prev - 1));

      const successMsg = affected > 0 
        ? `Foto excluída e desvinculada de ${affected} produto(s) automaticamente!`
        : 'Foto excluída com sucesso do Cloudflare R2.';
      showNotificationRef.current?.(successMsg, 'success');

      // If this image was in current product, notify parent
      if (currentImages.includes(item.url)) {
        onRemoveImageFromProduct?.(item.url);
      }
      setItemToDelete(null);
      if (expandedImage?.key === item.key) {
        setExpandedImage(null);
      }
    } catch (err) {
      showNotificationRef.current?.(err.message || 'Erro ao excluir imagem.', 'error');
    } finally {
      setDeletingKey(null);
    }
  };

  const handleCopyLink = (url) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(url);
      showNotificationRef.current?.('Link da imagem copiado para a área de transferência!', 'success');
    }
  };

  // Filter items according to usageFilter
  const displayedItems = useMemo(() => {
    return items.filter(item => {
      if (usageFilter === 'in_use') {
        return usedImagesMap.has(item.url);
      }
      if (usageFilter === 'unused') {
        return !usedImagesMap.has(item.url);
      }
      if (usageFilter === 'current_product') {
        return currentImages.includes(item.url);
      }
      return true;
    });
  }, [items, usageFilter, usedImagesMap, currentImages]);

  // Counts for tabs
  const countInUse = useMemo(() => items.filter(i => usedImagesMap.has(i.url)).length, [items, usedImagesMap]);
  const countUnused = useMemo(() => items.filter(i => !usedImagesMap.has(i.url)).length, [items, usedImagesMap]);
  const countCurrentProduct = useMemo(() => items.filter(i => currentImages.includes(i.url)).length, [items, currentImages]);

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 z-[150] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200"
        onClick={onClose}
      >
        <div 
          className="w-full max-w-5xl h-[94vh] sm:h-auto sm:max-h-[92vh] bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Header Bar */}
          <div className="p-3 sm:p-5 border-b border-slate-100 bg-linear-to-r from-slate-900 to-slate-950 text-white flex flex-col gap-3 shrink-0">
            {/* Top Row: Title + Counts + Close Button */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                  <Images className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-xs sm:text-base font-black text-white truncate">
                      Biblioteca de Fotos (Cloudflare R2)
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[10px] border border-amber-500/30 shrink-0">
                      {totalCount} fotos no storage
                    </span>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-slate-400 hidden sm:block truncate">
                    {isStandalone 
                      ? 'Clique em qualquer imagem para expandir em tela cheia, filtrar por fotos não utilizadas ou copiar links.'
                      : 'Clique na foto para expandir e verificar detalhes, ou use os botões rápidos para adicionar ao equipamento.'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                title="Fechar biblioteca"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Bar + Direct Upload Actions Row */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar foto por nome do arquivo..."
                  className="w-full pl-8 pr-7 py-1.5 sm:py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder:text-slate-400 text-xs focus:outline-none focus:border-amber-500 transition-colors"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <label 
                className="btn-gold text-xs font-bold py-1.5 sm:py-2 px-3 sm:px-4 flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs"
                title="Fazer upload de nova foto diretamente para o R2"
              >
                {uploadingDirect ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Upload className="w-3.5 h-3.5" />
                )}
                <span className="hidden sm:inline">Enviar Foto</span>
                <span className="sm:hidden">Enviar</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  disabled={uploadingDirect}
                  onChange={handleDirectUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Filter Tabs Row: Todas | Em Uso | Não Utilizadas | Neste Equipamento */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none text-xs">
              <button
                type="button"
                onClick={() => setUsageFilter('all')}
                className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer shrink-0 text-xs flex items-center gap-1.5 ${
                  usageFilter === 'all'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'bg-slate-800/90 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span>Todas</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${usageFilter === 'all' ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-900 text-slate-400'}`}>
                  {items.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setUsageFilter('in_use')}
                className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer shrink-0 text-xs flex items-center gap-1.5 ${
                  usageFilter === 'in_use'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'bg-slate-800/90 text-slate-300 hover:bg-slate-800'
                }`}
                title="Fotos vinculadas a pelo menos um equipamento do catálogo"
              >
                <Package className="w-3.5 h-3.5" />
                <span>Em Uso nos Produtos</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${usageFilter === 'in_use' ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-900 text-slate-400'}`}>
                  {countInUse}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setUsageFilter('unused')}
                className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer shrink-0 text-xs flex items-center gap-1.5 ${
                  usageFilter === 'unused'
                    ? 'bg-emerald-500 text-slate-950 shadow-xs'
                    : 'bg-slate-800/90 text-slate-300 hover:bg-slate-800'
                }`}
                title="Fotos livres que NÃO estão vinculadas a nenhum produto (ideais para excluir e liberar espaço)"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Não Utilizadas (Livres)</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${usageFilter === 'unused' ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-900 text-emerald-400 font-bold'}`}>
                  {countUnused}
                </span>
              </button>

              {!isStandalone && (
                <button
                  type="button"
                  onClick={() => setUsageFilter('current_product')}
                  className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer shrink-0 text-xs flex items-center gap-1.5 ${
                    usageFilter === 'current_product'
                      ? 'bg-amber-500 text-slate-950 shadow-xs'
                      : 'bg-slate-800/90 text-slate-300 hover:bg-slate-800'
                  }`}
                  title="Fotos já vinculadas a este equipamento em edição"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Neste Equipamento</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${usageFilter === 'current_product' ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-900 text-slate-400'}`}>
                    {countCurrentProduct}
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Scrollable Grid of Images with Infinite Scroll */}
          <div 
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto p-2.5 sm:p-5 md:p-6 bg-slate-50/70"
          >
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
                <span className="text-xs font-bold">Consultando imagens no Cloudflare R2...</span>
              </div>
            ) : displayedItems.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-200 text-slate-400 flex items-center justify-center mx-auto">
                  <Images className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-700">Nenhuma imagem encontrada</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  {usageFilter === 'in_use'
                    ? 'Nenhuma imagem na página atual está vinculada a produtos.'
                    : usageFilter === 'unused'
                    ? 'Todas as imagens carregadas estão sendo usadas em produtos.'
                    : usageFilter === 'current_product'
                    ? 'Nenhuma foto deste equipamento encontrada nesta página.'
                    : debouncedSearch
                    ? `Nenhum arquivo corresponde a "${debouncedSearch}".`
                    : 'Sua biblioteca no Cloudflare R2 ainda não possui imagens salvas.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3 md:gap-3.5">
                {displayedItems.map((item) => {
                  const isInGallery = currentImages.includes(item.url);
                  const isCover = currentCover === item.url;
                  const productsUsing = usedImagesMap.get(item.url) || [];
                  const isUsedInAnyProduct = productsUsing.length > 0;
                  const kbSize = item.size ? `${(item.size / 1024).toFixed(0)} KB` : '';

                  return (
                    <div
                      key={item.key}
                      className={`group relative rounded-2xl bg-white border p-1.5 flex flex-col transition-all shadow-xs hover:shadow-md ${
                        isCover 
                          ? 'ring-2 ring-amber-500 border-amber-400 bg-amber-50/20'
                          : isInGallery
                          ? 'ring-2 ring-emerald-500/80 border-emerald-400 bg-emerald-50/10'
                          : 'border-slate-200 hover:border-amber-400'
                      }`}
                    >
                      {/* Thumbnail Container - Click to Expand Lightbox */}
                      <div 
                        className="aspect-square rounded-xl overflow-hidden bg-slate-100 relative group/thumb flex items-center justify-center cursor-zoom-in select-none"
                        onClick={() => setExpandedImage(item)}
                        title="Clique para expandir foto em alta resolução"
                      >
                        <img
                          src={item.url}
                          alt={item.filename}
                          loading="lazy"
                          className="w-full h-full object-contain p-1.5 transition-transform duration-200 group-hover/thumb:scale-105"
                        />

                        {/* Expand Icon Overlay */}
                        <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                          <span className="p-2 rounded-xl bg-slate-950/80 text-white shadow-md">
                            <Maximize2 className="w-4 h-4" />
                          </span>
                        </div>

                        {/* Cover Badge */}
                        {!isStandalone && isCover && (
                          <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-lg bg-amber-500 text-slate-950 font-black text-[9px] uppercase tracking-wider shadow-xs flex items-center gap-1">
                            <Star className="w-2.5 h-2.5 fill-current" /> Capa
                          </span>
                        )}

                        {/* In Gallery Badge */}
                        {!isStandalone && isInGallery && !isCover && (
                          <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-lg bg-emerald-600 text-white font-black text-[9px] uppercase tracking-wider shadow-xs flex items-center gap-1">
                            <Check className="w-2.5 h-2.5 stroke-[3]" /> Na Galeria
                          </span>
                        )}

                        {/* Used / Free status indicator */}
                        {isUsedInAnyProduct ? (
                          <span 
                            className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-md bg-slate-900/80 text-amber-400 font-bold text-[8px] flex items-center gap-1 shadow-2xs"
                            title={`Em uso em: ${productsUsing.join(', ')}`}
                          >
                            <Package className="w-2.5 h-2.5 text-amber-400" />
                            <span>{productsUsing.length} prod</span>
                          </span>
                        ) : (
                          <span 
                            className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-md bg-emerald-700/80 text-white font-bold text-[8px] shadow-2xs"
                            title="Foto não vinculada a nenhum produto (livre)"
                          >
                            Livre
                          </span>
                        )}

                        {/* Size Badge */}
                        {kbSize && (
                          <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-slate-900/70 text-white font-mono text-[8px]">
                            {kbSize}
                          </span>
                        )}
                      </div>

                      {/* Metadata & Actions */}
                      <div className="pt-2 px-0.5 space-y-1.5 flex-1 flex flex-col justify-between">
                        <div 
                          className="truncate text-[11px] font-bold text-slate-800 cursor-pointer hover:text-amber-700" 
                          onClick={() => setExpandedImage(item)}
                          title={item.filename}
                        >
                          {item.filename}
                        </div>

                        <div className="pt-1 flex items-center gap-1 border-t border-slate-100">
                          {isStandalone ? (
                            <button
                              type="button"
                              onClick={() => handleCopyLink(item.url)}
                              className="flex-1 py-1 px-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[10px] transition-colors cursor-pointer text-center flex items-center justify-center gap-1 shadow-2xs"
                              title="Copiar link público da foto"
                            >
                              <Copy className="w-3 h-3" />
                              <span>Copiar</span>
                            </button>
                          ) : isInGallery ? (
                            <button
                              type="button"
                              onClick={() => onRemoveImageFromProduct?.(item.url)}
                              className="flex-1 py-1 px-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 font-bold text-[10px] transition-colors cursor-pointer text-center"
                              title="Remover foto do produto atual"
                            >
                              Remover
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => onSelectImage?.(item.url)}
                              className="flex-1 py-1 px-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[10px] transition-colors cursor-pointer text-center flex items-center justify-center gap-0.5 shadow-2xs"
                              title="Adicionar à galeria do equipamento"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Adicionar</span>
                            </button>
                          )}

                          {!isStandalone && !isCover && (
                            <button
                              type="button"
                              onClick={() => onSetAsCover?.(item.url)}
                              className="p-1 rounded-lg bg-slate-100 hover:bg-amber-100 hover:text-amber-800 text-slate-600 transition-colors cursor-pointer"
                              title="Definir como foto de capa principal"
                            >
                              <Star className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => setItemToDelete(item)}
                            className="p-1 rounded-lg bg-slate-100 hover:bg-red-100 hover:text-red-700 text-slate-400 transition-colors cursor-pointer"
                            title="Excluir permanentemente do Cloudflare R2"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Infinite Scroll Loader at bottom */}
            {loadingMore && (
              <div className="py-6 flex items-center justify-center gap-2 text-slate-400 text-xs font-bold">
                <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                <span>Carregando mais fotos do Cloudflare R2...</span>
              </div>
            )}

            {!hasMore && items.length > 0 && !loading && (
              <div className="py-6 text-center text-[11px] text-slate-400 font-semibold">
                ✓ Você visualizou todas as {totalCount} fotos da biblioteca.
              </div>
            )}
          </div>

          {/* Bottom Status & Close Bar */}
          <div className="p-3 sm:px-6 border-t border-slate-100 bg-white flex items-center justify-between gap-2 shrink-0 text-xs">
            <div className="flex items-center gap-2 sm:gap-3 text-slate-600 min-w-0">
              {!isStandalone ? (
                <div className="text-[11px] sm:text-xs truncate">
                  No produto atual: <strong className="text-slate-900 font-bold">{currentImages.length} fotos</strong>
                  {currentCover && (
                    <span className="text-amber-700 font-semibold ml-2 hidden xs:inline">
                      • Capa ativa
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-[11px] sm:text-xs text-slate-500 truncate">
                  Mostrando {displayedItems.length} de {items.length} fotos carregadas
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="btn-gold text-xs py-2 px-4 sm:px-6 font-bold cursor-pointer shrink-0 shadow-xs"
            >
              {isStandalone ? 'Fechar' : 'Concluir Seleção'}
            </button>
          </div>

        </div>
      </div>

      {/* EXPANDED IMAGE LIGHTBOX MODAL (Click to Zoom in HD) */}
      {expandedImage && (
        <div 
          className="fixed inset-0 z-[180] flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-150"
          onClick={() => setExpandedImage(null)}
        >
          <div 
            className="w-full max-w-3xl bg-white rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-2xl animate-in zoom-in-95 duration-150 flex flex-col gap-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Lightbox Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <span className="px-2.5 py-0.5 rounded-lg bg-amber-100 text-amber-900 font-black text-xs">
                  Visualizador HD
                </span>
                <span className="font-bold text-slate-800 truncate text-xs" title={expandedImage.filename}>
                  {expandedImage.filename}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={expandedImage.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                  title="Abrir URL original em nova aba"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button
                  type="button"
                  onClick={() => setExpandedImage(null)}
                  className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                  title="Fechar visualizador"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Lightbox Image Preview Area */}
            <div className="w-full max-h-[62vh] rounded-2xl bg-slate-900/5 p-2 flex items-center justify-center overflow-hidden border border-slate-200">
              <img 
                src={expandedImage.url} 
                alt={expandedImage.filename} 
                className="max-h-[58vh] max-w-full object-contain rounded-xl shadow-xs"
              />
            </div>

            {/* Product Usage Badge Info */}
            {(() => {
              const productsUsing = usedImagesMap.get(expandedImage.url) || [];
              return (
                <div className="text-xs">
                  {productsUsing.length > 0 ? (
                    <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200 flex items-center gap-2 text-amber-900">
                      <Package className="w-4 h-4 text-amber-600 shrink-0" />
                      <span className="text-[11px]">
                        Em uso em <strong>{productsUsing.length}</strong> produto(s): <em>{productsUsing.join(', ')}</em>
                      </span>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200 flex items-center gap-2 text-emerald-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="text-[11px]">
                        Foto livre (não vinculada a nenhum produto do catálogo).
                      </span>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Lightbox Bottom Actions */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
              <button
                type="button"
                onClick={() => handleCopyLink(expandedImage.url)}
                className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5 cursor-pointer font-bold"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar Link</span>
              </button>

              <div className="flex items-center gap-2">
                {!isStandalone && (
                  <>
                    {currentImages.includes(expandedImage.url) ? (
                      <button
                        type="button"
                        onClick={() => {
                          onRemoveImageFromProduct?.(expandedImage.url);
                          showNotificationRef.current?.('Foto removida da galeria do equipamento.', 'info');
                        }}
                        className="py-2 px-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs transition cursor-pointer"
                      >
                        Remover do Equipamento
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          onSelectImage?.(expandedImage.url);
                          showNotificationRef.current?.('Foto adicionada ao equipamento!', 'success');
                        }}
                        className="py-2 px-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition flex items-center gap-1 cursor-pointer shadow-2xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Adicionar ao Equipamento</span>
                      </button>
                    )}

                    {currentCover !== expandedImage.url && (
                      <button
                        type="button"
                        onClick={() => {
                          onSetAsCover?.(expandedImage.url);
                          showNotificationRef.current?.('Foto definida como capa principal!', 'success');
                        }}
                        className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900 font-bold text-xs transition flex items-center gap-1 cursor-pointer"
                      >
                        <Star className="w-3.5 h-3.5 text-amber-600" />
                        <span>Definir como Capa</span>
                      </button>
                    )}
                  </>
                )}

                <button
                  type="button"
                  onClick={() => setItemToDelete(expandedImage)}
                  className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-700 font-bold text-xs transition flex items-center gap-1 cursor-pointer"
                  title="Excluir permanentemente do Cloudflare R2"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-500" />
                  <span>Excluir do R2</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* IN-APP CONFIRMATION MODAL FOR R2 DELETION */}
      {itemToDelete && (
        <div 
          className="fixed inset-0 z-[190] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => !deletingKey && setItemToDelete(null)}
        >
          <div 
            className="w-full max-w-sm sm:max-w-md bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-2xl animate-in zoom-in-95 duration-150 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-2xl bg-red-50 text-red-600 border border-red-200 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm sm:text-base font-extrabold text-slate-900 leading-tight">
                  Excluir foto do Cloudflare R2?
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Esta foto será apagada permanentemente do armazenamento em nuvem e liberará espaço.
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl bg-white border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                <img src={itemToDelete.url} alt="" className="w-full h-full object-contain p-1" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-slate-800 truncate" title={itemToDelete.filename}>
                  {itemToDelete.filename}
                </div>
                {itemToDelete.size && (
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                    {(itemToDelete.size / 1024).toFixed(0)} KB
                  </div>
                )}
              </div>
            </div>

            {/* Product Usage Warning */}
            {(() => {
              const productsUsing = usedImagesMap.get(itemToDelete.url) || [];
              if (productsUsing.length > 0) {
                return (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs space-y-1">
                    <div className="font-extrabold flex items-center gap-1.5 text-amber-800">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Em uso em {productsUsing.length} equipamento(s):</span>
                    </div>
                    <p className="text-[11px] text-amber-700 line-clamp-2">
                      {productsUsing.join(', ')}
                    </p>
                    <p className="text-[10px] text-amber-600 font-semibold pt-0.5">
                      ✓ Ao confirmar, o sistema desvinculará esta imagem de todos os produtos automaticamente para evitar erros de imagem quebrada.
                    </p>
                  </div>
                );
              }
              return (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-[11px]">Foto livre: não vinculada a nenhum produto do catálogo.</span>
                </div>
              );
            })()}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                disabled={Boolean(deletingKey)}
                onClick={() => setItemToDelete(null)}
                className="btn-secondary text-xs py-2 px-4 font-bold cursor-pointer disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={Boolean(deletingKey)}
                onClick={() => confirmDeleteFromStorage(itemToDelete)}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {deletingKey ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Excluindo...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Sim, Excluir do R2</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
