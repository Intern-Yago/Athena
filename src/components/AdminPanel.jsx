import React, { useState } from 'react';
import { 
  Package, 
  Layers, 
  Tag, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  Shield,
  Upload,
  Eye,
  Sparkles,
  Link as LinkIcon,
  ToggleLeft,
  ToggleRight,
  FileText,
  Paperclip,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { formatAttachmentLabel } from '../pages/ProductDetailPage';

export default function AdminPanel({
  products,
  categories,
  brands,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onAddCategory,
  onDeleteCategory,
  onAddBrand,
  onDeleteBrand,
  showNotification,
  editingProduct,
  setEditingProduct,
  onNavigate
}) {
  const [activeAdminTab, setActiveAdminTab] = useState('products');
  const [imageSourceMode, setImageSourceMode] = useState('upload');

  // Product Form State
  const [productForm, setProductForm] = useState(
    editingProduct || {
      name: '',
      slug: '',
      categoryId: categories[0]?.id || '',
      brandId: brands[0]?.id || '',
      price: '',
      priceNegotiable: true,
      badge: 'Disponível',
      status: 'published',
      image: '',
      altText: '',
      description: '',
      specs: ['Elevada resistência e durabilidade', 'Manual e certificado inclusos', 'Garantia de fábrica'],
      attachments: []
    }
  );

  // Quick Modals
  const [isQuickCatModalOpen, setIsQuickCatModalOpen] = useState(false);
  const [isQuickBrandModalOpen, setIsQuickBrandModalOpen] = useState(false);
  const [quickCatName, setQuickCatName] = useState('');
  const [quickBrandName, setQuickBrandName] = useState('');

  // Form Modal & Drag/Drop state
  const [isProductModalOpen, setIsProductModalOpen] = useState(!!editingProduct);
  const [isDraggingImage, setIsDraggingImage] = useState(false);

  // Auto Generate Slug
  const generateSlug = (nameStr) => {
    return nameStr
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  };

  const openNewProductModal = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      slug: '',
      categoryId: categories[0]?.id || '',
      brandId: brands[0]?.id || '',
      price: '',
      priceNegotiable: true,
      badge: 'Disponível',
      status: 'published',
      image: '',
      altText: '',
      description: '',
      specs: ['Elevada resistência e durabilidade', 'Manual e certificado inclusos', 'Garantia de fábrica'],
      attachments: []
    });
    setIsProductModalOpen(true);
  };

  const openEditProductModal = (product) => {
    setEditingProduct(product);
    setProductForm({
      ...product,
      specs: product.specs && product.specs.length ? [...product.specs] : ['', ''],
      attachments: product.attachments ? [...product.attachments] : []
    });
    setIsProductModalOpen(true);
  };

  // Image Upload File Handler (Base64)
  const handleImageFileUpload = (file) => {
    if (!file || !file.type.startsWith('image/')) {
      showNotification('Por favor, selecione um arquivo de imagem válido (JPG/PNG).', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setProductForm((prev) => ({ ...prev, image: e.target.result }));
      showNotification('Imagem carregada com sucesso!', 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleDropImage = (e) => {
    e.preventDefault();
    setIsDraggingImage(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageFileUpload(e.dataTransfer.files[0]);
    }
  };

  // Attachment File Upload Handler
  const handleAttachmentUpload = (file) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const fileSizeFormatted = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
      const newAtt = {
        id: `att_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
        fileName: file.name,
        url: e.target.result,
        fileSize: fileSizeFormatted
      };

      setProductForm((prev) => ({
        ...prev,
        attachments: [...(prev.attachments || []), newAtt]
      }));

      showNotification(`Anexo "${file.name}" adicionado!`, 'success');
    };

    reader.readAsDataURL(file);
  };

  const removeAttachment = (attId) => {
    setProductForm((prev) => ({
      ...prev,
      attachments: (prev.attachments || []).filter(a => a.id !== attId)
    }));
    showNotification('Anexo removido.', 'info');
  };

  // Auto Generate Alt Text
  const generateAutoAltText = () => {
    const cat = categories.find((c) => c.id === productForm.categoryId)?.name || '';
    const brand = brands.find((b) => b.id === productForm.brandId)?.name || '';
    const autoText = `${productForm.name || 'Equipamento'} ${cat} ${brand} Athena Soluções Automotivas`.trim();
    setProductForm((prev) => ({ ...prev, altText: autoText }));
    showNotification('Alt Text gerado para SEO!', 'info');
  };

  // Toggle Status directly from table list
  const toggleProductStatus = (product) => {
    const newStatus = product.status === 'published' ? 'draft' : 'published';
    const updated = { ...product, status: newStatus };
    onUpdateProduct(updated);
    showNotification(
      `Status do produto "${product.name}" alterado para ${newStatus === 'published' ? 'Publicado' : 'Rascunho'}.`,
      'info'
    );
  };

  // Move Category Up or Down in Manual Order
  const moveCategoryOrder = (index, direction) => {
    const newCategories = [...categories];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newCategories.length) return;

    const temp = newCategories[index];
    newCategories[index] = newCategories[targetIndex];
    newCategories[targetIndex] = temp;

    // Update order property
    newCategories.forEach((c, idx) => { c.order = idx + 1; });
    localStorage.setItem('athena_categories', JSON.stringify(newCategories));
    showNotification(`Ordem das categorias atualizada!`, 'success');
  };

  // Move Brand Up or Down in Manual Order
  const moveBrandOrder = (index, direction) => {
    const newBrands = [...brands];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newBrands.length) return;

    const temp = newBrands[index];
    newBrands[index] = newBrands[targetIndex];
    newBrands[targetIndex] = temp;

    newBrands.forEach((b, idx) => { b.order = idx + 1; });
    localStorage.setItem('athena_brands', JSON.stringify(newBrands));
    showNotification(`Ordem das marcas atualizada!`, 'success');
  };

  // Quick Category Create
  const handleQuickCategoryCreate = (e) => {
    e.preventDefault();
    if (!quickCatName.trim()) return;

    const slug = generateSlug(quickCatName);
    const newCat = {
      id: `cat_${Date.now()}`,
      name: quickCatName.trim(),
      slug: slug,
      order: categories.length + 1,
      description: 'Equipamentos e ferramentas da linha.',
      icon: 'Layers'
    };

    onAddCategory(newCat);
    setProductForm((prev) => ({ ...prev, categoryId: newCat.id }));
    setQuickCatName('');
    setIsQuickCatModalOpen(false);
    showNotification(`Categoria "${newCat.name}" criada!`, 'success');
  };

  // Quick Brand Create
  const handleQuickBrandCreate = (e) => {
    e.preventDefault();
    if (!quickBrandName.trim()) return;

    const slug = generateSlug(quickBrandName);
    const newBrand = {
      id: `brand_${Date.now()}`,
      name: quickBrandName.trim(),
      slug: slug,
      order: brands.length + 1,
      description: 'Fabricante de equipamentos automotivos.',
      logo: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=200&auto=format&fit=crop&q=80'
    };

    onAddBrand(newBrand);
    setProductForm((prev) => ({ ...prev, brandId: newBrand.id }));
    setQuickBrandName('');
    setIsQuickBrandModalOpen(false);
    showNotification(`Marca "${newBrand.name}" criada!`, 'success');
  };

  // Handle Product Submit
  const handleProductSubmit = (e) => {
    e.preventDefault();

    if (!productForm.name.trim()) {
      showNotification('Por favor, informe o nome do produto.', 'error');
      return;
    }

    const finalSlug = productForm.slug.trim() || generateSlug(productForm.name);
    const cleanedSpecs = productForm.specs.filter(s => s.trim() !== '');

    const finalProduct = {
      ...productForm,
      slug: finalSlug,
      price: productForm.priceNegotiable ? 0 : parseFloat(productForm.price) || 0,
      specs: cleanedSpecs,
      attachments: productForm.attachments || [],
      image: productForm.image || 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&auto=format&fit=crop&q=80',
      altText: productForm.altText || productForm.name
    };

    if (editingProduct) {
      onUpdateProduct(finalProduct);
      showNotification(`Produto "${finalProduct.name}" atualizado!`, 'success');
    } else {
      onAddProduct({
        ...finalProduct,
        id: `prod_${Date.now()}`
      });
      showNotification(`Produto "${finalProduct.name}" cadastrado!`, 'success');
    }

    setIsProductModalOpen(false);
    setEditingProduct(null);
  };

  return (
    <div className="py-8">
      <div className="container-custom space-y-6">
        
        {/* Admin Header Banner */}
        <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-400/30">
                <Shield className="w-3.5 h-3.5" /> GESTÃO DE PRODUTOS & CATÁLOGO ATHENA
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                Painel Administrativo
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                Reordene manualmente marcas e categorias comerciais, envie anexos opcionais e alterne o status de publicação.
              </p>
            </div>

            <button
              onClick={openNewProductModal}
              className="btn-gold text-xs sm:text-sm font-bold py-3 px-5 shadow-md shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Equipamento</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveAdminTab('products')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-colors whitespace-nowrap ${
              activeAdminTab === 'products'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Produtos ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveAdminTab('categories')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-colors whitespace-nowrap ${
              activeAdminTab === 'categories'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Categorias ({categories.length})</span>
          </button>

          <button
            onClick={() => setActiveAdminTab('brands')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-colors whitespace-nowrap ${
              activeAdminTab === 'brands'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>Marcas ({brands.length})</span>
          </button>
        </div>

        {/* PRODUCTS MANAGEMENT TAB */}
        {activeAdminTab === 'products' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-amber-600" /> Lista de Produtos
              </h3>
              <button onClick={openNewProductModal} className="btn-blue text-xs py-2 px-3">
                <Plus className="w-3.5 h-3.5" /> Adicionar Produto
              </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-100 uppercase text-[11px] text-slate-600 border-b border-slate-200 font-bold">
                    <tr>
                      <th className="py-3 px-4">Equipamento</th>
                      <th className="py-3 px-4">URL / Slug</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Anexos</th>
                      <th className="py-3 px-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {products.map((prod) => {
                      const cat = categories.find(c => c.id === prod.categoryId);
                      const br = brands.find(b => b.id === prod.brandId);
                      const isPublished = prod.status === 'published';
                      const attCount = prod.attachments ? prod.attachments.length : 0;

                      return (
                        <tr key={prod.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <img 
                                src={prod.image} 
                                alt={prod.altText || prod.name}
                                loading="lazy"
                                className="w-10 h-10 rounded-lg object-cover bg-slate-100 border border-slate-200 shrink-0" 
                              />
                              <div>
                                <span className="font-bold text-slate-900 text-xs block leading-snug line-clamp-1">
                                  {prod.name}
                                </span>
                                <span className="text-[10px] text-amber-700 font-semibold">
                                  {prod.badge || 'Disponível'}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-[11px] font-mono text-slate-500 block truncate max-w-xs">
                              /produto/{prod.slug || prod.id}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => toggleProductStatus(prod)}
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors cursor-pointer ${
                                isPublished 
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                                  : 'bg-amber-50 text-amber-800 border-amber-300'
                              }`}
                              title="Clique para alternar o status"
                            >
                              {isPublished ? <ToggleRight className="w-3.5 h-3.5 text-emerald-600" /> : <ToggleLeft className="w-3.5 h-3.5 text-amber-600" />}
                              <span>{isPublished ? 'Publicado' : 'Rascunho'}</span>
                            </button>
                          </td>
                          <td className="py-3 px-4">
                            {attCount > 0 ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-sky-50 text-sky-800 border border-sky-200 font-bold text-[10px]">
                                <Paperclip className="w-3 h-3 text-sky-600" /> {attCount} arquivo(s)
                              </span>
                            ) : (
                              <span className="text-[11px] text-slate-400 font-medium">Nenhum</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => onNavigate(`produto/${prod.slug || prod.id}`)}
                                className="p-2 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                                title="Abrir Página do Produto"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => openEditProductModal(prod)}
                                className="p-2 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200"
                                title="Editar"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => {
                                  if (confirm(`Tem certeza que deseja apagar "${prod.name}"?`)) {
                                    onDeleteProduct(prod.id);
                                    showNotification('Produto apagado.', 'info');
                                  }
                                }}
                                className="p-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
                                title="Apagar"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* CATEGORIES MANAGEMENT TAB (WITH MANUAL REORDERING) */}
        {activeAdminTab === 'categories' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Gerenciar & Reordenar Categorias</h3>
                <p className="text-xs text-slate-500">Defina a ordem de exibição comercial no filtro (as de topo aparecem primeiro).</p>
              </div>

              <button onClick={() => setIsQuickCatModalOpen(true)} className="btn-gold text-xs font-bold py-2 px-3">
                <Plus className="w-3.5 h-3.5" /> Nova Categoria
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {categories.map((cat, idx) => (
                <div key={cat.id} className="p-3.5 rounded-xl border border-slate-200 flex items-center justify-between bg-slate-50">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 font-extrabold text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <div>
                      <span className="font-bold text-xs text-slate-900 block">{cat.name}</span>
                      <span className="text-[10px] font-mono text-slate-400">/categoria/{cat.slug || cat.id}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 border-r border-slate-200 pr-2">
                      <button
                        onClick={() => moveCategoryOrder(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 disabled:opacity-30 hover:bg-slate-100"
                        title="Subir posição no filtro"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => moveCategoryOrder(idx, 'down')}
                        disabled={idx === categories.length - 1}
                        className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 disabled:opacity-30 hover:bg-slate-100"
                        title="Descer posição no filtro"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button onClick={() => onDeleteCategory(cat.id)} className="btn-danger text-xs p-2">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BRANDS MANAGEMENT TAB (WITH MANUAL REORDERING) */}
        {activeAdminTab === 'brands' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Gerenciar & Reordenar Marcas</h3>
                <p className="text-xs text-slate-500">Coloque marcas prioritárias (como Mahovi ou Engecass) no topo dos filtros.</p>
              </div>

              <button onClick={() => setIsQuickBrandModalOpen(true)} className="btn-gold text-xs font-bold py-2 px-3">
                <Plus className="w-3.5 h-3.5" /> Nova Marca
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {brands.map((b, idx) => (
                <div key={b.id} className="p-3.5 rounded-xl border border-slate-200 flex items-center justify-between bg-slate-50">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-800 font-extrabold text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <div>
                      <span className="font-bold text-xs text-slate-900 block">{b.name}</span>
                      <span className="text-[10px] font-mono text-slate-400">/marca/{b.slug || b.id}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 border-r border-slate-200 pr-2">
                      <button
                        onClick={() => moveBrandOrder(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 disabled:opacity-30 hover:bg-slate-100"
                        title="Subir posição no filtro"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => moveBrandOrder(idx, 'down')}
                        disabled={idx === brands.length - 1}
                        className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 disabled:opacity-30 hover:bg-slate-100"
                        title="Descer posição no filtro"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button onClick={() => onDeleteBrand(b.id)} className="btn-danger text-xs p-2">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FORM MODAL (CADASTRO E EDIÇÃO) */}
        {isProductModalOpen && (
          <div className="modal-backdrop" onClick={() => setIsProductModalOpen(false)}>
            <div className="modal-content max-w-2xl p-6 bg-white border-slate-200 relative" onClick={(e) => e.stopPropagation()}>
              
              <button 
                onClick={() => setIsProductModalOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-amber-600" />
                {editingProduct ? 'Editar Equipamento' : 'Cadastrar Novo Equipamento'}
              </h3>

              <form onSubmit={handleProductSubmit} className="space-y-4">
                
                {/* Title & Slug */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Nome do Equipamento *
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Elevador Automotivo 2 Colunas 4.000kg"
                      value={productForm.name}
                      onChange={(e) => {
                        const val = e.target.value;
                        setProductForm({ 
                          ...productForm, 
                          name: val,
                          slug: productForm.slug ? productForm.slug : generateSlug(val)
                        });
                      }}
                      className="form-input text-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Slug da URL (SEO)
                    </label>
                    <input
                      type="text"
                      placeholder="elevador-automotivo-2-colunas"
                      value={productForm.slug}
                      onChange={(e) => setProductForm({ ...productForm, slug: generateSlug(e.target.value) })}
                      className="form-input text-xs font-mono"
                    />
                  </div>
                </div>

                {/* Category & Brand Selectors */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-700">Categoria *</label>
                      <button
                        type="button"
                        onClick={() => setIsQuickCatModalOpen(true)}
                        className="text-[11px] text-amber-700 font-bold hover:underline flex items-center gap-0.5"
                      >
                        <Plus className="w-3 h-3" /> Nova Categoria
                      </button>
                    </div>
                    <select
                      value={productForm.categoryId}
                      onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value })}
                      className="form-select text-xs"
                      required
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-700">Marca / Fabricante *</label>
                      <button
                        type="button"
                        onClick={() => setIsQuickBrandModalOpen(true)}
                        className="text-[11px] text-sky-700 font-bold hover:underline flex items-center gap-0.5"
                      >
                        <Plus className="w-3 h-3" /> Nova Marca
                      </button>
                    </div>
                    <select
                      value={productForm.brandId}
                      onChange={(e) => setProductForm({ ...productForm, brandId: e.target.value })}
                      className="form-select text-xs"
                      required
                    >
                      {brands.map((b) => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Status Toggle & Price */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Status de Publicação</label>
                    <select
                      value={productForm.status}
                      onChange={(e) => setProductForm({ ...productForm, status: e.target.value })}
                      className="form-select text-xs font-bold"
                    >
                      <option value="published">Publicado (Default)</option>
                      <option value="draft">Rascunho (Oculto)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Preço (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="18900.00"
                      disabled={productForm.priceNegotiable}
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                      className="form-input text-xs disabled:opacity-40"
                    />
                  </div>

                  <div className="flex items-center gap-2 py-3">
                    <input
                      type="checkbox"
                      id="priceNegotiable"
                      checked={productForm.priceNegotiable}
                      onChange={(e) => setProductForm({ ...productForm, priceNegotiable: e.target.checked })}
                      className="w-4 h-4 accent-amber-600 rounded cursor-pointer"
                    />
                    <label htmlFor="priceNegotiable" className="text-xs font-semibold text-slate-700 cursor-pointer">
                      Preço Sob Consulta (Default)
                    </label>
                  </div>
                </div>

                {/* Foto do Produto */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700">Foto do Produto</label>
                    <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
                      <button
                        type="button"
                        onClick={() => setImageSourceMode('upload')}
                        className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                          imageSourceMode === 'upload' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                        }`}
                      >
                        Upload Local
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageSourceMode('url')}
                        className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                          imageSourceMode === 'url' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                        }`}
                      >
                        URL da Imagem
                      </button>
                    </div>
                  </div>

                  {imageSourceMode === 'upload' ? (
                    <div 
                      onDragOver={(e) => { e.preventDefault(); setIsDraggingImage(true); }}
                      onDragLeave={() => setIsDraggingImage(false)}
                      onDrop={handleDropImage}
                      className={`border-2 border-dashed rounded-2xl p-4 text-center transition-colors cursor-pointer ${
                        isDraggingImage ? 'border-amber-500 bg-amber-50' : 'border-slate-300 hover:border-amber-400 bg-slate-50'
                      }`}
                    >
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => e.target.files && handleImageFileUpload(e.target.files[0])}
                        className="hidden" 
                        id="fileDropInputModal"
                      />

                      <label htmlFor="fileDropInputModal" className="cursor-pointer space-y-1 block">
                        <Upload className="w-6 h-6 mx-auto text-amber-600" />
                        <span className="text-xs font-bold text-slate-800 block">
                          Arraste e solte uma imagem aqui ou clique para selecionar do computador
                        </span>
                        <span className="text-[10px] text-slate-400">Arquivos JPG ou PNG</span>
                      </label>
                    </div>
                  ) : (
                    <div className="relative">
                      <input
                        type="url"
                        placeholder="https://suaimagem.com/foto.jpg"
                        value={productForm.image}
                        onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                        className="form-input text-xs pl-8"
                      />
                      <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    </div>
                  )}

                  {productForm.image && (
                    <div className="flex items-center gap-3 p-2 bg-slate-100 rounded-xl border border-slate-200">
                      <img src={productForm.image} alt="Preview" className="w-10 h-10 object-cover rounded-lg" />
                      <span className="text-xs text-slate-600 truncate flex-1">Imagem definida</span>
                      <button type="button" onClick={() => setProductForm({ ...productForm, image: '' })} className="text-xs text-red-600 font-bold">Remover</button>
                    </div>
                  )}
                </div>

                {/* OPTIONAL ATTACHMENTS MANAGER SECTION */}
                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Paperclip className="w-4 h-4 text-amber-600" />
                      Anexos & Documentos (Opcional — Manuais, Fichas Técnicas em PDF)
                    </label>
                    <span className="text-[10px] text-slate-400 font-medium">Quantos quiser</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      id="attachmentFileInput"
                      className="hidden"
                      onChange={(e) => e.target.files && handleAttachmentUpload(e.target.files[0])}
                    />
                    <label
                      htmlFor="attachmentFileInput"
                      className="btn-secondary text-xs py-2 px-3 gap-1.5 cursor-pointer inline-flex"
                    >
                      <Plus className="w-3.5 h-3.5 text-amber-600" />
                      <span>Adicionar Anexo</span>
                    </label>
                  </div>

                  {productForm.attachments && productForm.attachments.length > 0 && (
                    <div className="space-y-1.5 pt-2">
                      {productForm.attachments.map((att) => (
                        <div key={att.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <FileText className="w-4 h-4 text-amber-600 shrink-0" />
                            <span className="font-bold text-amber-900 truncate">
                              {formatAttachmentLabel(att.fileName)}
                            </span>
                            <span className="text-[10px] text-slate-400 shrink-0">({att.fileName})</span>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeAttachment(att.id)}
                            className="p-1 rounded text-red-600 hover:bg-red-50"
                            title="Remover anexo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Alt Text & Auto Generation */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">Texto Alternativo (Alt Text SEO)</label>
                    <button
                      type="button"
                      onClick={generateAutoAltText}
                      className="text-[11px] text-amber-700 font-bold hover:underline flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" /> Gerar Alt Automático
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Descrição da imagem para SEO e acessibilidade"
                    value={productForm.altText}
                    onChange={(e) => setProductForm({ ...productForm, altText: e.target.value })}
                    className="form-input text-xs"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Descrição</label>
                  <textarea
                    placeholder="Descreva as características técnicas do produto..."
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    className="form-textarea text-xs h-20"
                  />
                </div>

                {/* Modal Action Buttons */}
                <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setIsProductModalOpen(false);
                      onNavigate(`produto/${productForm.slug || 'preview'}`);
                    }}
                    className="btn-secondary text-xs"
                  >
                    <Eye className="w-4 h-4 text-emerald-600" />
                    <span>Pré-visualizar Página</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => setIsProductModalOpen(false)} className="btn-secondary text-xs">Cancelar</button>
                    <button type="submit" className="btn-gold text-xs font-bold py-2.5 px-5">
                      <Check className="w-4 h-4" /> Salvar Produto
                    </button>
                  </div>
                </div>

              </form>
            </div>
          </div>
        )}

        {/* QUICK CATEGORY MODAL */}
        {isQuickCatModalOpen && (
          <div className="modal-backdrop" onClick={() => setIsQuickCatModalOpen(false)}>
            <div className="modal-content max-w-sm p-6 bg-white border-slate-200 relative" onClick={(e) => e.stopPropagation()}>
              <h4 className="text-base font-bold text-slate-900 mb-3">Criar Nova Categoria</h4>
              <form onSubmit={handleQuickCategoryCreate} className="space-y-3">
                <input
                  type="text"
                  placeholder="Nome da categoria (ex: Elevadores Tesoura)"
                  value={quickCatName}
                  onChange={(e) => setQuickCatName(e.target.value)}
                  className="form-input text-xs"
                  required
                />
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setIsQuickCatModalOpen(false)} className="btn-secondary text-xs">Cancelar</button>
                  <button type="submit" className="btn-gold text-xs font-bold py-2 px-4">Salvar</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* QUICK BRAND MODAL */}
        {isQuickBrandModalOpen && (
          <div className="modal-backdrop" onClick={() => setIsQuickBrandModalOpen(false)}>
            <div className="modal-content max-w-sm p-6 bg-white border-slate-200 relative" onClick={(e) => e.stopPropagation()}>
              <h4 className="text-base font-bold text-slate-900 mb-3">Criar Nova Marca</h4>
              <form onSubmit={handleQuickBrandCreate} className="space-y-3">
                <input
                  type="text"
                  placeholder="Nome da marca (ex: Gedore)"
                  value={quickBrandName}
                  onChange={(e) => setQuickBrandName(e.target.value)}
                  className="form-input text-xs"
                  required
                />
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setIsQuickBrandModalOpen(false)} className="btn-secondary text-xs">Cancelar</button>
                  <button type="submit" className="btn-gold text-xs font-bold py-2 px-4">Salvar</button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
