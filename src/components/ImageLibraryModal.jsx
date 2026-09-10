import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Eye, 
  AlertCircle,
  ExternalLink
} from 'lucide-react';

/**
 * ImageLibraryModal
 * Permite navegar por todas as fotos armazenadas no Cloudflare R2,
 * com busca em tempo real, lazy loading e scroll infinito (estilo feed/Facebook).
 */
export default function ImageLibraryModal({
  isOpen,
  onClose,
  currentImages = [],
  currentCover = '',
  onSelectImage,
  onRemoveImageFromProduct,
  onSetAsCover,
  API_BASE_URL,
  getAuthHeaders,
  showNotification
}) {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [deletingKey, setDeletingKey] = useState(null);
  const [uploadingDirect, setUploadingDirect] = useState(false);

  const scrollContainerRef = useRef(null);
  const searchTimeoutRef = useRef(null);

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

  // Fetch first page on open or search change
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

      const res = await fetch(`${API_BASE_URL}/upload/library?${params.toString()}`, {
        headers: getAuthHeaders?.() || {}
      });

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
      showNotification?.(err.message || 'Erro ao consultar fotos do R2.', 'error');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [API_BASE_URL, getAuthHeaders, showNotification]);

  // Initial load or search update
  useEffect(() => {
    if (isOpen) {
      fetchLibrary(1, debouncedSearch, false);
    } else {
      setItems([]);
      setPage(1);
      setSearchQuery('');
      setDebouncedSearch('');
    }
  }, [isOpen, debouncedSearch, fetchLibrary]);

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
    showNotification?.('Enviando nova imagem para a biblioteca...', 'info');

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

        const res = await fetch(`${API_BASE_URL}/upload`, {
          method: 'POST',
          headers: getAuthHeaders?.() || {},
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
      showNotification?.(`${successCount} nova(s) imagem(ns) adicionada(s) à biblioteca!`, 'success');
      fetchLibrary(1, debouncedSearch, false);
    }
    e.target.value = '';
  };

  // Delete an image permanently from Cloudflare R2
  const handleDeleteFromStorage = async (item) => {
    const confirmed = window.confirm(
      `Deseja realmente apagar esta imagem permanentemente do Cloudflare R2?\n\n` +
      `Arquivo: ${item.filename}\n` +
      `Esta ação liberará espaço no armazenamento e não poderá ser desfeita.`
    );
    if (!confirmed) return;

    setDeletingKey(item.key);
    try {
      const res = await fetch(`${API_BASE_URL}/upload/delete`, {
        method: 'POST',
        headers: getAuthHeaders?.() || {},
        body: JSON.stringify({ url: item.url })
      });

      if (!res.ok) {
        throw new Error('Falha ao excluir arquivo do Cloudflare R2.');
      }

      setItems(prev => prev.filter(i => i.key !== item.key));
      setTotalCount(prev => Math.max(0, prev - 1));
      showNotification?.('Foto excluída com sucesso do Cloudflare R2.', 'success');

      // If this image was in current product, notify parent
      if (currentImages.includes(item.url)) {
        onRemoveImageFromProduct?.(item.url);
      }
    } catch (err) {
      showNotification?.(err.message, 'error');
    } finally {
      setDeletingKey(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-5xl max-h-[92vh] bg-white rounded-3xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-linear-to-r from-slate-900 to-slate-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Images className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-white">
                  Biblioteca de Fotos (Cloudflare R2)
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[10px] border border-amber-500/30">
                  {totalCount} imagens
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Selecione imagens existentes para a galeria do equipamento ou defina como capa.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Search Input in Top Corner */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nome..."
                className="w-full pl-8 pr-7 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder:text-slate-400 text-xs focus:outline-none focus:border-amber-500 transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Quick Upload directly to Library */}
            <label 
              className="btn-gold text-xs font-bold py-1.5 px-3 flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs"
              title="Fazer upload de nova foto diretamente para o R2"
            >
              {uploadingDirect ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Upload className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">Enviar Foto</span>
              <input
                type="file"
                accept="image/*"
                multiple
                disabled={uploadingDirect}
                onChange={handleDirectUpload}
                className="hidden"
              />
            </label>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Fechar biblioteca"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Grid of Images with Infinite Scroll */}
        <div 
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/70"
        >
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
              <span className="text-xs font-bold">Consultando imagens no Cloudflare R2...</span>
            </div>
          ) : items.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-200 text-slate-400 flex items-center justify-center mx-auto">
                <Images className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-700">Nenhuma imagem encontrada</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {debouncedSearch 
                  ? `Nenhum arquivo corresponde ao termo "${debouncedSearch}". Tente outro termo.`
                  : 'Sua biblioteca no Cloudflare R2 ainda não possui imagens salvas.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {items.map((item) => {
                const isInGallery = currentImages.includes(item.url);
                const isCover = currentCover === item.url;
                const isDeleting = deletingKey === item.key;
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
                    {/* Thumbnail */}
                    <div className="aspect-square rounded-xl overflow-hidden bg-slate-100 relative group/thumb flex items-center justify-center">
                      <img
                        src={item.url}
                        alt={item.filename}
                        loading="lazy"
                        className="w-full h-full object-contain p-1.5 transition-transform duration-200 group-hover/thumb:scale-105"
                      />

                      {/* Cover Badge */}
                      {isCover && (
                        <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-lg bg-amber-500 text-slate-950 font-black text-[9px] uppercase tracking-wider shadow-xs flex items-center gap-1">
                          <Star className="w-2.5 h-2.5 fill-current" /> Capa
                        </span>
                      )}

                      {/* In Gallery Badge */}
                      {isInGallery && !isCover && (
                        <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-lg bg-emerald-600 text-white font-black text-[9px] uppercase tracking-wider shadow-xs flex items-center gap-1">
                          <Check className="w-2.5 h-2.5 stroke-[3]" /> Na Galeria
                        </span>
                      )}

                      {/* Size Badge */}
                      {kbSize && (
                        <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-slate-900/60 text-white font-mono text-[8px]">
                          {kbSize}
                        </span>
                      )}
                    </div>

                    {/* Metadata & Actions */}
                    <div className="pt-2 px-1 space-y-1.5 flex-1 flex flex-col justify-between">
                      <div className="truncate text-[11px] font-bold text-slate-800" title={item.filename}>
                        {item.filename}
                      </div>

                      <div className="pt-1 flex items-center gap-1 border-t border-slate-100">
                        {isInGallery ? (
                          <button
                            type="button"
                            onClick={() => onRemoveImageFromProduct?.(item.url)}
                            className="flex-1 py-1 px-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 font-bold text-[10px] transition-colors cursor-pointer text-center"
                            title="Remover foto do produto"
                          >
                            Remover
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onSelectImage?.(item.url)}
                            className="flex-1 py-1 px-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[10px] transition-colors cursor-pointer text-center flex items-center justify-center gap-0.5 shadow-2xs"
                            title="Adicionar à galeria do produto"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Adicionar</span>
                          </button>
                        )}

                        {!isCover && (
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
                          disabled={isDeleting}
                          onClick={() => handleDeleteFromStorage(item)}
                          className="p-1 rounded-lg bg-slate-100 hover:bg-red-100 hover:text-red-700 text-slate-400 transition-colors cursor-pointer disabled:opacity-50"
                          title="Excluir permanentemente do Cloudflare R2 (liberar espaço)"
                        >
                          {isDeleting ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-red-600" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
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
        <div className="p-3.5 px-6 border-t border-slate-100 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0 text-xs">
          <div className="flex items-center gap-3 text-slate-500">
            <span>
              Fotos no produto atual: <strong className="text-slate-900">{currentImages.length}</strong>
            </span>
            {currentCover && (
              <span className="text-[11px] text-amber-700 font-medium hidden sm:inline">
                • Capa selecionada
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="btn-secondary text-xs py-2 px-5 font-bold cursor-pointer"
          >
            Concluir Seleção
          </button>
        </div>

      </div>
    </div>
  );
}
