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
  Filter, 
  ChevronRight,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';

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

  // Modal de Criação / Edição de Post
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form State do Post
  const [postForm, setPostForm] = useState({
    title: '',
    slug: '',
    summary: '',
    content: '',
    cover_image_url: '',
    status: 'published',
    category_id: '',
    tags: '',
    related_product_slug: '',
    reading_time_minutes: 5
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
      // 1. Carrega posts administrativos
      const resPosts = await fetch('/api/blog/admin/posts', { headers });
      if (resPosts.ok) {
        const postsData = await resPosts.json();
        setPosts(Array.isArray(postsData) ? postsData : []);
      }

      // 2. Carrega categorias
      const resCats = await fetch('/api/blog/categories');
      if (resCats.ok) {
        const catsData = await resCats.json();
        setCategories(Array.isArray(catsData) ? catsData : []);
      }

      // 3. Carrega comentários
      const resComments = await fetch('/api/blog/admin/comments', { headers });
      if (resComments.ok) {
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

  // Gerador automático de slug a partir do título
  const handleTitleChange = (val) => {
    setPostForm(prev => {
      const isAutoSlug = !editingPost || prev.slug === generateSlug(prev.title);
      return {
        ...prev,
        title: val,
        slug: isAutoSlug ? generateSlug(val) : prev.slug
      };
    });
  };

  const generateSlug = (text) => {
    return (text || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  };

  // Abre editor para novo post ou edição
  const handleOpenEditor = (post = null) => {
    if (post) {
      setEditingPost(post);
      setPostForm({
        title: post.title || '',
        slug: post.slug || '',
        summary: post.summary || '',
        content: post.content || '',
        cover_image_url: post.cover_image_url || '',
        status: post.status || 'published',
        category_id: post.categories?.[0]?.id || '',
        tags: Array.isArray(post.tags) ? post.tags.join(', ') : (post.tags || ''),
        related_product_slug: post.related_product_slug || '',
        reading_time_minutes: post.reading_time_minutes || 5
      });
    } else {
      setEditingPost(null);
      setPostForm({
        title: '',
        slug: '',
        summary: '',
        content: '',
        cover_image_url: '',
        status: 'published',
        category_id: categories[0]?.id || '',
        tags: '',
        related_product_slug: '',
        reading_time_minutes: 5
      });
    }
    setIsEditorOpen(true);
  };

  // Salva artigo (criação ou atualização)
  const handleSavePost = async (e) => {
    e.preventDefault();
    if (!postForm.title.trim()) {
      if (showNotification) showNotification('O título do artigo é obrigatório.', 'error');
      return;
    }

    setIsSaving(true);
    const token = getAuthToken();
    const payload = {
      ...postForm,
      categoryIds: postForm.category_id ? [postForm.category_id] : [],
      tags: typeof postForm.tags === 'string'
        ? postForm.tags.split(',').map(t => t.trim()).filter(Boolean)
        : postForm.tags
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
            editingPost ? 'Artigo atualizado com sucesso!' : 'Novo artigo publicado!',
            'success'
          );
        }
        setIsEditorOpen(false);
        loadBlogData();
      } else {
        const errData = await res.json();
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
          showNotification(`Comentário ${status === 'approved' ? 'aprovado' : status === 'rejected' ? 'rejeitado' : 'marcado como spam'}.`, 'success');
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
    return posts.filter(p => {
      const matchesSearch = !searchFilter.trim() || 
        (p.title || '').toLowerCase().includes(searchFilter.toLowerCase()) ||
        (p.slug || '').toLowerCase().includes(searchFilter.toLowerCase());
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [posts, searchFilter, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Header do Módulo Blog no Admin */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-500" />
            <span>Gestão do Blog & Inteligência Técnica</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
              {posts.length} Artigos
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Gerencie artigos técnicos, publicações sobre diagnósticos automotivos, moderação de comentários e SEO orgânico.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleOpenEditor()}
            className="btn-gold text-xs font-bold py-2.5 px-4 cursor-pointer inline-flex items-center gap-2 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Artigo</span>
          </button>
        </div>
      </div>

      {/* Navegação entre Sub-Abas do Blog */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
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
          onClick={() => setActiveSubTab('comments')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'comments'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Moderação de Comentários ({comments.filter(c => c.status === 'pending').length} Pendentes)</span>
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
              <div className="p-12 text-center text-slate-500 text-xs">
                Nenhum artigo encontrado. Clique em "Novo Artigo" para começar.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold">
                      <th className="p-3.5 pl-4">Capa & Artigo</th>
                      <th className="p-3.5">Categoria</th>
                      <th className="p-3.5">Autor</th>
                      <th className="p-3.5 text-center">Visualizações</th>
                      <th className="p-3.5 text-center">Status</th>
                      <th className="p-3.5 text-right pr-4">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredPosts.map((post) => (
                      <tr key={post.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="p-3.5 pl-4">
                          <div className="flex items-center gap-3">
                            <div className="w-14 h-10 rounded-lg overflow-hidden bg-slate-900 shrink-0 border border-slate-200">
                              <img
                                src={post.cover_image_url || 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=200&auto=format&fit=crop&q=80'}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <span className="font-bold text-slate-900 block truncate max-w-md">
                                {post.title}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono block truncate">
                                /blog/{post.slug}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="p-3.5 text-slate-600 font-medium">
                          {post.categories?.[0]?.name || '-'}
                        </td>

                        <td className="p-3.5 text-slate-600">
                          {post.author_name || 'Athena'}
                        </td>

                        <td className="p-3.5 text-center font-bold text-slate-700">
                          {post.views_count || 0}
                        </td>

                        <td className="p-3.5 text-center">
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                            post.status === 'published'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}>
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
                              title="Visualizar Artigo"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                            <button
                              type="button"
                              onClick={() => handleOpenEditor(post)}
                              className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 transition cursor-pointer"
                              title="Editar Artigo"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setPostToDelete(post)}
                              className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition cursor-pointer"
                              title="Excluir Artigo"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-ABA 2: MODERAÇÃO DE COMENTÁRIOS */}
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
                    </div>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                      c.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                      c.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {c.status}
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
                        Aprovar
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

      {/* MODAL DE CRIAÇÃO / EDIÇÃO DE POST */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-500" />
                <span>{editingPost ? 'Editar Artigo' : 'Novo Artigo para o Blog'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePost} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Título do Artigo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Scanner Thinkcar THINKTOOL LITE com IA"
                    value={postForm.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className="form-input text-xs w-full rounded-xl"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Slug da URL *</label>
                  <input
                    type="text"
                    required
                    placeholder="ex: scanner-thinkcar-thinktool-lite"
                    value={postForm.slug}
                    onChange={(e) => setPostForm(p => ({ ...p, slug: generateSlug(e.target.value) }))}
                    className="form-input text-xs w-full rounded-xl font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Resumo / Lead (Meta Description) *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Breve resumo informativo exibido nos cards e no Google..."
                  value={postForm.summary}
                  onChange={(e) => setPostForm(p => ({ ...p, summary: e.target.value }))}
                  className="form-textarea text-xs w-full rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Imagem de Capa (URL)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      placeholder="https://images.athenaconsultoria.com.br/..."
                      value={postForm.cover_image_url}
                      onChange={(e) => setPostForm(p => ({ ...p, cover_image_url: e.target.value }))}
                      className="form-input text-xs flex-1 rounded-xl"
                    />
                    {onOpenMediaLibrary && (
                      <button
                        type="button"
                        onClick={onOpenMediaLibrary}
                        className="btn-secondary text-xs py-2 px-2.5 flex items-center gap-1.5 shrink-0 cursor-pointer"
                        title="Selecionar imagem da Biblioteca R2"
                      >
                        <Images className="w-3.5 h-3.5 text-amber-600" />
                        <span>R2</span>
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Categoria Principal</label>
                  <select
                    value={postForm.category_id}
                    onChange={(e) => setPostForm(p => ({ ...p, category_id: e.target.value }))}
                    className="form-select text-xs w-full rounded-xl"
                  >
                    <option value="">Selecione uma categoria...</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Tags (Separadas por vírgula)</label>
                  <input
                    type="text"
                    placeholder="Thinkcar, Diagnóstico, ADAS"
                    value={postForm.tags}
                    onChange={(e) => setPostForm(p => ({ ...p, tags: e.target.value }))}
                    className="form-input text-xs w-full rounded-xl"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Produto para Cross-Sell</label>
                  <select
                    value={postForm.related_product_slug}
                    onChange={(e) => setPostForm(p => ({ ...p, related_product_slug: e.target.value }))}
                    className="form-select text-xs w-full rounded-xl"
                  >
                    <option value="">Nenhum produto vinculado</option>
                    {products.slice(0, 30).map((prod) => (
                      <option key={prod.id} value={prod.slug || prod.id}>
                        {prod.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Status de Publicação</label>
                  <select
                    value={postForm.status}
                    onChange={(e) => setPostForm(p => ({ ...p, status: e.target.value }))}
                    className="form-select text-xs w-full rounded-xl"
                  >
                    <option value="published">Publicado no Site</option>
                    <option value="draft">Rascunho (Oculto)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Conteúdo Completo do Artigo (Markdown) *</label>
                <textarea
                  rows={10}
                  required
                  placeholder="Escreva o artigo em Markdown com subtítulos (##), listas e formatação técnica..."
                  value={postForm.content}
                  onChange={(e) => setPostForm(p => ({ ...p, content: e.target.value }))}
                  className="form-textarea text-xs w-full rounded-xl font-mono leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="btn-gold text-xs font-bold py-2.5 px-6 cursor-pointer inline-flex items-center gap-2 shadow-xs"
                >
                  <Check className="w-4 h-4" />
                  <span>{isSaving ? 'Salvando...' : 'Salvar e Publicar'}</span>
                </button>
              </div>
            </form>
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
