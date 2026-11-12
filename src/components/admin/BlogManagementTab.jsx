import React, { useState, useEffect, useMemo } from 'react';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Eye, 
  Check, 
  X, 
  Calendar, 
  Clock, 
  MessageSquare, 
  ShieldCheck, 
  Sparkles, 
  Images, 
  ExternalLink, 
  Tag, 
  Layers, 
  ChevronRight,
  AlertTriangle,
  Package,
  ArrowLeft
} from 'lucide-react';
import TiptapBlogEditor, { normalizeContentToHtml } from './TiptapBlogEditor';

// Helper para garantir URL pública válida para imagem de capa no Admin
function resolveAdminPostCover(postOrUrl, slug = '') {
  if (!postOrUrl) {
    if (slug && String(slug).includes('eaata')) {
      return 'https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/athena_produtos/eaata-aa7d50879091.webp';
    }
    return '';
  }

  const raw = typeof postOrUrl === 'string'
    ? postOrUrl.trim()
    : (postOrUrl.cover_image_url || postOrUrl.cover_image_key || postOrUrl.coverImage || '').trim();

  if (!raw) {
    const targetSlug = typeof postOrUrl === 'object' ? postOrUrl.slug : slug;
    if (targetSlug && String(targetSlug).includes('eaata')) {
      return 'https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/athena_produtos/eaata-aa7d50879091.webp';
    }
    return '';
  }

  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
  return `https://pub-fd5d45a1dd144e14aa81b6a686385df9.r2.dev/${raw.replace(/^\//, '')}`;
}

export default function BlogManagementTab({
  currentUser,
  showNotification,
  products = [],
  onOpenMediaLibrary
}) {
  const [activeSubTab, setActiveSubTab] = useState('posts'); // 'posts' | 'comments' | 'categories'
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'published' | 'draft'

  // Modal / Tela de Criação e Edição de Post (Estilo Gutenberg)
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [coverPreviewError, setCoverPreviewError] = useState(false);

  // Estado de Nova Categoria Rápida
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDesc, setNewCategoryDesc] = useState('');
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);

  // Form State do Post
  const [postForm, setPostForm] = useState({
    title: '',
    slug: '',
    summary: '',
    contentHtml: '',
    cover_image_url: '',
    status: 'published',
    category_id: '',
    tags: '',
    related_product_slug: '',
    metaTitle: '',
    metaDescription: ''
  });

  // Modal de Exclusão de Post
  const [postToDelete, setPostToDelete] = useState(null);

  // Helper de token de autenticação
  const getAuthToken = () => {
    return currentUser?.token || localStorage.getItem('athena_token') || sessionStorage.getItem('athena_token') || '';
  };

  // Carrega posts, categorias e comentários
  const loadBlogData = async () => {
    setIsLoading(true);
    const token = getAuthToken();
    const headers = { 'Authorization': `Bearer ${token}` };

    try {
      const [resPosts, resCats, resComments] = await Promise.all([
        fetch('/api/blog/admin/posts', { headers }).catch(() => null),
        fetch('/api/blog/categories').catch(() => null),
        fetch('/api/blog/admin/comments', { headers }).catch(() => null)
      ]);

      if (resPosts && resPosts.ok) {
        const postsData = await resPosts.json();
        setPosts(Array.isArray(postsData) ? postsData : []);
      }

      if (resCats && resCats.ok) {
        const catsData = await resCats.json();
        setCategories(Array.isArray(catsData) ? catsData : []);
      }

      if (resComments && resComments.ok) {
        const commentsData = await resComments.json();
        setComments(Array.isArray(commentsData) ? commentsData : []);
      }
    } catch (err) {
      if (showNotification) {
        showNotification('Erro ao sincronizar dados do blog.', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBlogData();
  }, []);

  // Reseta erro da imagem de capa sempre que a URL mudar
  useEffect(() => {
    setCoverPreviewError(false);
  }, [postForm.cover_image_url]);

  const generateSlug = (text) => {
    return (text || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  };

  // Gerador automático de slug a partir do título
  const handleTitleChange = (val) => {
    setPostForm((prev) => {
      const isAutoSlug = !editingPost || prev.slug === generateSlug(prev.title);
      return {
        ...prev,
        title: val,
        slug: isAutoSlug ? generateSlug(val) : prev.slug
      };
    });
  };

  // Abre editor visual Tiptap / Gutenberg para novo post ou edição de existente
  const handleOpenEditor = (post = null) => {
    setCoverPreviewError(false);
    if (post) {
      setEditingPost(post);
      const resolvedCover = resolveAdminPostCover(post, post.slug);
      const normalizedHtml = normalizeContentToHtml(post.content, post.content_html);

      setPostForm({
        title: post.title || '',
        slug: post.slug || '',
        summary: post.excerpt || post.summary || '',
        contentHtml: normalizedHtml || '<p></p>',
        cover_image_url: resolvedCover,
        status: post.status || 'published',
        category_id: post.categories?.[0]?.id || categories[0]?.id || '',
        tags: Array.isArray(post.tags) ? post.tags.join(', ') : (post.tags || ''),
        related_product_slug: post.related_product_slug || '',
        metaTitle: post.meta_title || post.title || '',
        metaDescription: post.meta_description || post.excerpt || post.summary || ''
      });
    } else {
      setEditingPost(null);
      setPostForm({
        title: '',
        slug: '',
        summary: '',
        contentHtml: '<p></p>',
        cover_image_url: '',
        status: 'published',
        category_id: categories[0]?.id || '',
        tags: '',
        related_product_slug: '',
        metaTitle: '',
        metaDescription: ''
      });
    }
    setIsEditorOpen(true);
  };

  // Salva artigo (criação ou atualização)
  const handleSavePost = async (e, overrideStatus = null) => {
    if (e && e.preventDefault) e.preventDefault();

    if (!postForm.title.trim()) {
      if (showNotification) showNotification('Por favor, informe o título do artigo.', 'error');
      return;
    }

    const finalStatus = overrideStatus || postForm.status || 'published';
    setIsSaving(true);
    const token = getAuthToken();

    const payload = {
      title: postForm.title.trim(),
      slug: postForm.slug.trim() || generateSlug(postForm.title),
      excerpt: postForm.summary.trim(),
      summary: postForm.summary.trim(),
      content: postForm.contentHtml,
      contentHtml: postForm.contentHtml,
      content_html: postForm.contentHtml,
      cover_image_url: postForm.cover_image_url.trim() || null,
      coverImageKey: postForm.cover_image_url.trim() || null,
      status: finalStatus,
      categoryIds: postForm.category_id ? [postForm.category_id] : [],
      metaTitle: (postForm.metaTitle || postForm.title).trim().slice(0, 150),
      metaDescription: (postForm.metaDescription || postForm.summary).trim().slice(0, 250)
    };

    try {
      const url = editingPost
        ? `/api/blog/admin/posts/${editingPost.id}`
        : '/api/blog/admin/posts';
      const method = editingPost ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        if (showNotification) {
          showNotification(
            editingPost
              ? 'Artigo atualizado com sucesso!'
              : finalStatus === 'published'
              ? 'Novo artigo publicado no Blog!'
              : 'Rascunho salvo com sucesso!',
            'success'
          );
        }
        setIsEditorOpen(false);
        setEditingPost(null);
        loadBlogData();
      } else {
        const errData = await res.json().catch(() => ({}));
        if (showNotification) {
          showNotification(errData.error || 'Erro ao salvar artigo.', 'error');
        }
      }
    } catch (err) {
      if (showNotification) {
        showNotification('Falha de rede ao salvar artigo.', 'error');
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Criar nova categoria de blog
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    setIsCreatingCategory(true);
    const token = getAuthToken();

    try {
      const res = await fetch('/api/blog/admin/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newCategoryName.trim(),
          slug: generateSlug(newCategoryName),
          description: newCategoryDesc.trim() || null
        })
      });

      if (res.ok) {
        const created = await res.json();
        setCategories((prev) => [...prev, created]);
        setNewCategoryName('');
        setNewCategoryDesc('');
        if (showNotification) showNotification('Categoria criada com sucesso!', 'success');
      } else {
        const err = await res.json().catch(() => ({}));
        if (showNotification) showNotification(err.error || 'Erro ao criar categoria.', 'error');
      }
    } catch {
      if (showNotification) showNotification('Falha de rede ao criar categoria.', 'error');
    } finally {
      setIsCreatingCategory(false);
    }
  };

  const handleDeleteCategory = async (catId) => {
    if (!window.confirm('Deseja excluir esta categoria do blog?')) return;
    const token = getAuthToken();
    try {
      const res = await fetch(`/api/blog/admin/categories/${catId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setCategories((prev) => prev.filter((c) => c.id !== catId));
        if (showNotification) showNotification('Categoria removida.', 'success');
      }
    } catch {
      if (showNotification) showNotification('Erro ao remover categoria.', 'error');
    }
  };

  // Exclui artigo
  const handleConfirmDelete = async () => {
    if (!postToDelete) return;
    const token = getAuthToken();

    try {
      const res = await fetch(`/api/blog/admin/posts/${postToDelete.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        if (showNotification) showNotification('Artigo removido com sucesso.', 'success');
        setPostToDelete(null);
        loadBlogData();
      } else {
        if (showNotification) showNotification('Erro ao excluir artigo.', 'error');
      }
    } catch {
      if (showNotification) showNotification('Falha de rede ao excluir artigo.', 'error');
    }
  };

  // Moderação de comentário (aprovar / rejeitar / spam)
  const handleModerateComment = async (commentId, status) => {
    const token = getAuthToken();
    try {
      const res = await fetch(`/api/blog/admin/comments/${commentId}/moderate`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      if (res.ok) {
        if (showNotification) {
          showNotification(
            `Comentário ${status === 'approved' ? 'aprovado' : status === 'rejected' ? 'rejeitado' : 'marcado como spam'}.`,
            'success'
          );
        }
        loadBlogData();
      } else {
        if (showNotification) showNotification('Erro ao moderar comentário.', 'error');
      }
    } catch {
      if (showNotification) showNotification('Falha de rede.', 'error');
    }
  };

  // Rotina LGPD de expurgo de IPs
  const handlePurgeOldIps = async () => {
    const token = getAuthToken();
    try {
      const res = await fetch('/api/blog/admin/comments/purge-ips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ daysToRetain: 30 })
      });

      if (res.ok) {
        const data = await res.json();
        if (showNotification) {
          showNotification(data.message || 'Governança LGPD executada com sucesso!', 'success');
        }
      }
    } catch {
      if (showNotification) showNotification('Falha ao executar expurgo de IPs.', 'error');
    }
  };

  // Filtragem de posts
  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      const matchesSearch =
        !searchFilter.trim() ||
        (p.title || '').toLowerCase().includes(searchFilter.toLowerCase()) ||
        (p.slug || '').toLowerCase().includes(searchFilter.toLowerCase());
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [posts, searchFilter, statusFilter]);

  const resolvedFormCoverPreview = resolveAdminPostCover(postForm.cover_image_url, postForm.slug);

  return (
    <div className="space-y-6">
      {/* Header do Módulo Blog no Admin */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
        <div>
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-500" />
            <span>Gestão do Blog & Editor Visual (Tiptap / Gutenberg)</span>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
              {posts.length} Artigos
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Clique no título de qualquer artigo para abrir o editor em blocos, gerenciar imagens de capa da R2, categorias e SEO.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleOpenEditor(null)}
            className="btn-gold text-xs font-bold py-2.5 px-5 cursor-pointer inline-flex items-center gap-2 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Criar Novo Artigo</span>
          </button>
        </div>
      </div>

      {/* Navegação entre Sub-Abas do Blog */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveSubTab('posts')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'posts'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Artigos ({posts.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('categories')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'categories'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Categorias ({categories.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('comments')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'comments'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Comentários ({comments.filter((c) => c.status === 'pending').length} Pendentes)</span>
        </button>

        <button
          type="button"
          onClick={handlePurgeOldIps}
          className="ml-auto px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-[11px] font-bold text-slate-600 cursor-pointer flex items-center gap-1.5"
          title="Executar expurgo de IPs de comentários com mais de 30 dias para conformidade com a LGPD"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Expurgo LGPD (IPs)</span>
        </button>
      </div>

      {/* SUB-ABA 1: LISTAGEM DE ARTIGOS */}
      {activeSubTab === 'posts' && (
        <div className="space-y-4">
          {/* Barra de Filtros */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filtrar artigos por título ou slug..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="form-input text-xs !pl-10 py-2 w-full rounded-xl"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="form-select text-xs py-2 px-3 rounded-xl border-slate-300"
              >
                <option value="all">Todos os Status</option>
                <option value="published">Apenas Publicados</option>
                <option value="draft">Apenas Rascunhos</option>
              </select>
            </div>
          </div>

          {/* Tabela de Artigos */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            {isLoading ? (
              <div className="p-12 text-center text-slate-500 text-xs">
                <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                Carregando artigos...
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-xs space-y-3">
                <p>Nenhum artigo encontrado.</p>
                <button
                  type="button"
                  onClick={() => handleOpenEditor(null)}
                  className="btn-gold text-xs font-bold py-2 px-4 cursor-pointer"
                >
                  Criar Primeiro Artigo
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold">
                      <th className="p-3.5 pl-4">Capa & Artigo (Clique para Editar)</th>
                      <th className="p-3.5">Categoria</th>
                      <th className="p-3.5">Autor</th>
                      <th className="p-3.5 text-center">Visualizações</th>
                      <th className="p-3.5 text-center">Status</th>
                      <th className="p-3.5 text-right pr-4">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredPosts.map((post) => {
                      const coverThumb =
                        resolveAdminPostCover(post, post.slug) ||
                        'https://images.athenaconsultoria.com.br/produtos/scanner-automotivo-thinkcar-thinktool-lite-fce404d4f151.webp';

                      return (
                        <tr key={post.id} className="hover:bg-amber-50/30 transition-colors group">
                          <td className="p-3.5 pl-4">
                            <div
                              onClick={() => handleOpenEditor(post)}
                              className="flex items-center gap-3 cursor-pointer"
                              title="Clique para editar este artigo"
                            >
                              <div className="w-16 h-11 rounded-lg overflow-hidden bg-slate-900 shrink-0 border border-slate-200 group-hover:border-amber-400 transition-colors">
                                <img
                                  src={coverThumb}
                                  alt={post.title}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.src =
                                      'https://images.athenaconsultoria.com.br/produtos/scanner-automotivo-thinkcar-thinktool-lite-fce404d4f151.webp';
                                  }}
                                />
                              </div>
                              <div className="min-w-0">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenEditor(post);
                                  }}
                                  className="font-bold text-slate-900 group-hover:text-amber-600 hover:underline text-left block truncate max-w-md cursor-pointer transition-colors"
                                >
                                  {post.title}
                                </button>
                                <span className="text-[10px] text-slate-400 font-mono block truncate">
                                  /blog/{post.slug}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="p-3.5 text-slate-600 font-medium">
                            {post.categories?.[0]?.name ? (
                              <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold">
                                {post.categories[0].name}
                              </span>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>

                          <td className="p-3.5 text-slate-600">
                            {post.author_name || 'Equipe Athena'}
                          </td>

                          <td className="p-3.5 text-center font-bold text-slate-700">
                            {post.view_count ?? post.views_count ?? 0}
                          </td>

                          <td className="p-3.5 text-center">
                            <span
                              className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase ${
                                post.status === 'published'
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : 'bg-slate-100 text-slate-600 border border-slate-200'
                              }`}
                            >
                              {post.status === 'published' ? 'Publicado' : 'Rascunho'}
                            </span>
                          </td>

                          <td className="p-3.5 pr-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <a
                                href={`/blog/${post.slug}`}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                                title="Visualizar Artigo no Site"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                              <button
                                type="button"
                                onClick={() => handleOpenEditor(post)}
                                className="px-2.5 py-1.5 rounded-lg text-amber-700 bg-amber-50 hover:bg-amber-100 font-bold text-[11px] flex items-center gap-1 transition cursor-pointer"
                                title="Editar Artigo"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>Editar</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setPostToDelete(post)}
                                className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition cursor-pointer"
                                title="Excluir Artigo"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-ABA 2: CATEGORIAS DO BLOG */}
      {activeSubTab === 'categories' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Plus className="w-4 h-4 text-amber-600" />
              <span>Nova Categoria do Blog</span>
            </h3>
            <form onSubmit={handleCreateCategory} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Nome da Categoria *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Diagnóstico & IA"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="form-input text-xs w-full rounded-xl"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Descrição Curta</label>
                <textarea
                  rows={2}
                  placeholder="Assuntos abordados nesta categoria..."
                  value={newCategoryDesc}
                  onChange={(e) => setNewCategoryDesc(e.target.value)}
                  className="form-textarea text-xs w-full rounded-xl"
                />
              </div>
              <button
                type="submit"
                disabled={isCreatingCategory}
                className="btn-gold text-xs font-bold py-2.5 px-4 w-full cursor-pointer"
              >
                {isCreatingCategory ? 'Criando...' : 'Adicionar Categoria'}
              </button>
            </form>
          </div>

          <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-sm font-black text-slate-900">Categorias Cadastradas ({categories.length})</h3>
            {categories.length === 0 ? (
              <p className="text-xs text-slate-400 py-4">Nenhuma categoria cadastrada.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {categories.map((cat) => (
                  <div key={cat.id} className="py-3 flex items-center justify-between gap-4">
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">{cat.name}</span>
                      <span className="text-[10px] font-mono text-slate-400">Slug: {cat.slug}</span>
                      {cat.description && (
                        <p className="text-xs text-slate-500 mt-0.5">{cat.description}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer"
                      title="Excluir Categoria"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-ABA 3: MODERAÇÃO DE COMENTÁRIOS */}
      {activeSubTab === 'comments' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-black text-slate-900">Comentários Submetidos</h3>
            <span className="text-xs text-slate-500">Total: {comments.length}</span>
          </div>

          {comments.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">Nenhum comentário registrado.</p>
          ) : (
            <div className="space-y-3">
              {comments.map((c) => (
                <div key={c.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <strong className="text-slate-900">{c.author_name}</strong>
                      <span className="text-slate-400 ml-2">({c.author_email})</span>
                      {c.post_title && (
                        <span className="text-amber-700 font-bold ml-2">• Artigo: {c.post_title}</span>
                      )}
                    </div>
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                        c.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : c.status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {c.status === 'approved' ? 'Aprovado' : c.status === 'rejected' ? 'Rejeitado' : 'Pendente'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 bg-white p-3 rounded-lg border border-slate-100">
                    {c.content}
                  </p>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    {c.status !== 'approved' && (
                      <button
                        type="button"
                        onClick={() => handleModerateComment(c.id, 'approved')}
                        className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition cursor-pointer"
                      >
                        Aprovar Comentário
                      </button>
                    )}
                    {c.status !== 'rejected' && (
                      <button
                        type="button"
                        onClick={() => handleModerateComment(c.id, 'rejected')}
                        className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-red-600 text-white hover:bg-red-700 transition cursor-pointer"
                      >
                        Rejeitar
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =====================================================================
          ESTÚDIO DE CRIAÇÃO / EDIÇÃO DE ARTIGO (ESTILO GUTENBERG + TIPTAP)
         ===================================================================== */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-slate-50 rounded-3xl max-w-6xl w-full h-[94vh] flex flex-col border border-slate-200 shadow-2xl overflow-hidden">
            {/* Top Bar Fixa do Estúdio de Edição */}
            <div className="bg-white px-5 py-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition cursor-pointer flex items-center gap-1.5 text-xs font-bold"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Voltar</span>
                </button>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>{editingPost ? 'Editando Artigo do Blog' : 'Novo Artigo no Blog Athena'}</span>
                  </h3>
                  <span className="text-[11px] text-slate-500 block">
                    URL amigável: <strong className="font-mono text-slate-700">/blog/{postForm.slug || 'novo-artigo'}</strong>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={(e) => handleSavePost(e, 'draft')}
                  className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-xs font-bold text-slate-700 transition cursor-pointer disabled:opacity-50"
                >
                  Salvar como Rascunho
                </button>

                <button
                  type="button"
                  disabled={isSaving}
                  onClick={(e) => handleSavePost(e, 'published')}
                  className="btn-gold text-xs font-bold py-2.5 px-5 cursor-pointer inline-flex items-center gap-2 shadow-sm disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>{isSaving ? 'Salvando...' : editingPost ? 'Salvar e Atualizar Artigo' : 'Publicar Artigo Agora'}</span>
                </button>
              </div>
            </div>

            {/* Corpo do Editor em 2 Colunas (Folha WordPress Gutenberg 8 cols + Painel Lateral de Configurações 4 cols) */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* COLUNA ESQUERDA: Construtor de Página Estilo WordPress (Título + Resumo + Blocos na mesma folha) */}
                <div className="lg:col-span-8">
                  <TiptapBlogEditor
                    key={editingPost?.id || 'new_post'}
                    title={postForm.title}
                    onChangeTitle={(val) => handleTitleChange(val)}
                    summary={postForm.summary}
                    onChangeSummary={(val) => setPostForm((p) => ({ ...p, summary: val }))}
                    initialHtml={postForm.contentHtml}
                    onChangeHtml={(html) => setPostForm((p) => ({ ...p, contentHtml: html }))}
                    products={products}
                    onRequestImageFromLibrary={
                      onOpenMediaLibrary
                        ? (callback) => onOpenMediaLibrary(callback)
                        : null
                    }
                  />
                </div>

                {/* COLUNA DIREITA: Configurações do Documento (Capa com Preview ao Vivo, Categoria, Slug, SEO) */}
                <aside className="lg:col-span-4 space-y-5 lg:sticky lg:top-0">
                  {/* Card 1: Imagem de Capa com Preview ao Vivo */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                        <Images className="w-4 h-4 text-amber-600" />
                        <span>Imagem de Capa</span>
                      </label>
                      {onOpenMediaLibrary && (
                        <button
                          type="button"
                          onClick={() =>
                            onOpenMediaLibrary((selectedUrl) => {
                              if (selectedUrl) {
                                setPostForm((p) => ({ ...p, cover_image_url: selectedUrl }));
                              }
                            })
                          }
                          className="text-[11px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-200 cursor-pointer transition flex items-center gap-1"
                        >
                          <Images className="w-3.5 h-3.5" />
                          <span>Biblioteca R2</span>
                        </button>
                      )}
                    </div>

                    {/* Preview Visual da Imagem de Capa */}
                    <div className="relative aspect-[16/9] rounded-xl overflow-hidden bg-slate-900 border border-slate-200 flex items-center justify-center">
                      {resolvedFormCoverPreview && !coverPreviewError ? (
                        <img
                          src={resolvedFormCoverPreview}
                          alt="Prévia da Capa"
                          className="w-full h-full object-cover"
                          onError={() => setCoverPreviewError(true)}
                        />
                      ) : (
                        <div className="text-center p-4 space-y-1">
                          <Images className="w-7 h-7 text-slate-500 mx-auto" />
                          <span className="text-[11px] text-slate-400 block">
                            {coverPreviewError
                              ? 'Não foi possível carregar esta URL de imagem.'
                              : 'Nenhuma imagem de capa selecionada'}
                          </span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">
                        URL da Imagem de Capa
                      </label>
                      <input
                        type="text"
                        placeholder="https://images.athenaconsultoria.com.br/..."
                        value={postForm.cover_image_url}
                        onChange={(e) => setPostForm((p) => ({ ...p, cover_image_url: e.target.value }))}
                        className="form-input text-xs w-full rounded-xl"
                      />
                    </div>
                  </div>

                  {/* Card 2: Publicação, Categoria e URL */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5 pb-2 border-b border-slate-100">
                      <Layers className="w-4 h-4 text-amber-600" />
                      <span>Classificação & URL</span>
                    </h4>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Status de Visibilidade</label>
                      <select
                        value={postForm.status}
                        onChange={(e) => setPostForm((p) => ({ ...p, status: e.target.value }))}
                        className="form-select text-xs w-full rounded-xl"
                      >
                        <option value="published">Publicado (Visível no Blog)</option>
                        <option value="draft">Rascunho (Oculto)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Categoria Principal</label>
                      <select
                        value={postForm.category_id}
                        onChange={(e) => setPostForm((p) => ({ ...p, category_id: e.target.value }))}
                        className="form-select text-xs w-full rounded-xl"
                      >
                        <option value="">Selecione uma categoria...</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Slug da URL *</label>
                      <input
                        type="text"
                        required
                        placeholder="ex: scanner-eaata-90-topologia"
                        value={postForm.slug}
                        onChange={(e) => setPostForm((p) => ({ ...p, slug: generateSlug(e.target.value) }))}
                        className="form-input text-xs w-full rounded-xl font-mono"
                      />
                    </div>
                  </div>

                  {/* Card 3: SEO Avançado */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5 pb-2 border-b border-slate-100">
                      <Tag className="w-4 h-4 text-amber-600" />
                      <span>Otimização Google (SEO)</span>
                    </h4>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        Título SEO (Meta Title)
                      </label>
                      <input
                        type="text"
                        placeholder={postForm.title || 'Título para o Google...'}
                        value={postForm.metaTitle}
                        onChange={(e) => setPostForm((p) => ({ ...p, metaTitle: e.target.value }))}
                        className="form-input text-xs w-full rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        Descrição SEO (Meta Description)
                      </label>
                      <textarea
                        rows={2}
                        placeholder={postForm.summary || 'Resumo para aparecer nos resultados de busca...'}
                        value={postForm.metaDescription}
                        onChange={(e) => setPostForm((p) => ({ ...p, metaDescription: e.target.value }))}
                        className="form-textarea text-xs w-full rounded-xl"
                      />
                    </div>
                  </div>
                </aside>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO */}
      {postToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 border border-slate-200 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Excluir Artigo?</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Tem certeza que deseja excluir o artigo <strong>"{postToDelete.title}"</strong>? Esta ação não pode ser desfeita.
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPostToDelete(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition cursor-pointer"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
