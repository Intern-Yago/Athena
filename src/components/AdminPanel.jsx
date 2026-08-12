import React, { useState, useEffect } from 'react';
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
  ArrowDown,
  Globe,
  Users,
  Printer,
  LogOut,
  UserCheck,
  UserX,
  Lock
} from 'lucide-react';
import { formatAttachmentLabel } from '../pages/ProductDetailPage';
import PdfCatalogGenerator from './PdfCatalogGenerator';

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
  onUpdateBrand,
  onDeleteBrand,
  showNotification,
  editingProduct,
  setEditingProduct,
  onNavigate,
  currentUser,
  onLogout,
  API_BASE_URL
}) {
  const [activeAdminTab, setActiveAdminTab] = useState('products');
  const [imageSourceMode, setImageSourceMode] = useState('upload');
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  // User Role checks
  const userRole = currentUser?.role || 'admin';
  const isAdminRole = userRole === 'admin';
  const canEditContent = userRole === 'admin' || userRole === 'editor' || userRole === 'edicao';

  // Employees Management State
  const [usersList, setUsersList] = useState([]);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'vendedor'
  });

  // Fetch Users List
  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/users`);
      if (res.ok) {
        const data = await res.json();
        setUsersList(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (isAdminRole) {
      fetchUsers();
    }
  }, [isAdminRole]);

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

  // Quick Category Modal State
  const [isQuickCatModalOpen, setIsQuickCatModalOpen] = useState(false);
  const [quickCatName, setQuickCatName] = useState('');

  // Brand Modal State
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [brandForm, setBrandForm] = useState({
    name: '',
    description: '',
    logo: '',
    websiteUrl: '',
    imageSourceMode: 'upload'
  });

  const [isProductModalOpen, setIsProductModalOpen] = useState(!!editingProduct);
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [isDraggingBrandLogo, setIsDraggingBrandLogo] = useState(false);

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

  const handleImageFileUpload = async (file) => {
    if (!file || !file.type.startsWith('image/')) {
      showNotification('Por favor, selecione um arquivo de imagem válido (JPG/PNG).', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64Data = e.target.result;
      setProductForm((prev) => ({ ...prev, image: base64Data }));
      showNotification('Enviando imagem para a nuvem Cloudinary...', 'info');

      try {
        const res = await fetch(`${API_BASE_URL}/upload`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ file: base64Data, folder: 'athena_produtos' })
        });
        if (res.ok) {
          const data = await res.json();
          setProductForm((prev) => ({ ...prev, image: data.url }));
          showNotification('Foto enviada para o Cloudinary com sucesso! ☁️', 'success');
        }
      } catch (err) {
        showNotification('Imagem salva localmente.', 'info');
      }
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

  const handleBrandLogoFileUpload = async (file) => {
    if (!file || !file.type.startsWith('image/')) {
      showNotification('Selecione uma imagem válida para a logo da marca.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64Data = e.target.result;
      setBrandForm((prev) => ({ ...prev, logo: base64Data }));
      showNotification('Enviando logo para a nuvem Cloudinary...', 'info');

      try {
        const res = await fetch(`${API_BASE_URL}/upload`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ file: base64Data, folder: 'athena_marcas' })
        });
        if (res.ok) {
          const data = await res.json();
          setBrandForm((prev) => ({ ...prev, logo: data.url }));
          showNotification('Logo enviada para o Cloudinary com sucesso! ☁️', 'success');
        }
      } catch (err) {
        showNotification('Logo salva localmente.', 'info');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDropBrandLogo = (e) => {
    e.preventDefault();
    setIsDraggingBrandLogo(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleBrandLogoFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleAttachmentUpload = async (file) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64Data = e.target.result;
      const fileSizeFormatted = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
      
      showNotification(`Enviando anexo "${file.name}" para a nuvem...`, 'info');

      let finalUrl = base64Data;
      try {
        const res = await fetch(`${API_BASE_URL}/upload`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ file: base64Data, folder: 'athena_anexos' })
        });
        if (res.ok) {
          const data = await res.json();
          finalUrl = data.url;
        }
      } catch (err) {
        console.error('Cloudinary fallback:', err);
      }

      const newAtt = {
        id: `att_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
        fileName: file.name,
        url: finalUrl,
        fileSize: fileSizeFormatted
      };

      setProductForm((prev) => ({
        ...prev,
        attachments: [...(prev.attachments || []), newAtt]
      }));

      showNotification(`Anexo "${file.name}" salvo na nuvem com sucesso! 📄☁️`, 'success');
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

  const generateAutoAltText = () => {
    const cat = categories.find((c) => c.id === productForm.categoryId)?.name || '';
    const brand = brands.find((b) => b.id === productForm.brandId)?.name || '';
    const autoText = `${productForm.name || 'Equipamento'} ${cat} ${brand} Athena Soluções Automotivas`.trim();
    setProductForm((prev) => ({ ...prev, altText: autoText }));
    showNotification('Alt Text gerado para SEO!', 'info');
  };

  const toggleProductStatus = (product) => {
    if (!canEditContent) return;
    const newStatus = product.status === 'published' ? 'draft' : 'published';
    const updated = { ...product, status: newStatus };
    onUpdateProduct(updated);
    showNotification(
      `Status do produto "${product.name}" alterado para ${newStatus === 'published' ? 'Publicado' : 'Rascunho'}.`,
      'info'
    );
  };

  const moveCategoryOrder = (index, direction) => {
    if (!canEditContent) return;
    const newCategories = [...categories];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newCategories.length) return;

    const temp = newCategories[index];
    newCategories[index] = newCategories[targetIndex];
    newCategories[targetIndex] = temp;

    newCategories.forEach((c, idx) => { c.order = idx + 1; });
    localStorage.setItem('athena_categories', JSON.stringify(newCategories));
    showNotification(`Ordem das categorias atualizada!`, 'success');
  };

  const moveBrandOrder = (index, direction) => {
    if (!canEditContent) return;
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

  const openNewBrandModal = () => {
    setEditingBrand(null);
    setBrandForm({
      name: '',
      description: '',
      logo: '',
      websiteUrl: '',
      imageSourceMode: 'upload'
    });
    setIsBrandModalOpen(true);
  };

  const openEditBrandModal = (brandObj) => {
    setEditingBrand(brandObj);
    setBrandForm({
      name: brandObj.name || '',
      description: brandObj.description || '',
      logo: brandObj.logo || '',
      websiteUrl: brandObj.websiteUrl || '',
      imageSourceMode: 'upload'
    });
    setIsBrandModalOpen(true);
  };

  const handleBrandSubmit = (e) => {
    e.preventDefault();
    if (!brandForm.name.trim()) {
      showNotification('Informe o nome da marca.', 'error');
      return;
    }

    const slug = generateSlug(brandForm.name);
    const newBrandObj = {
      id: editingBrand ? editingBrand.id : `brand_${Date.now()}`,
      name: brandForm.name.trim(),
      slug: slug,
      description: brandForm.description || 'Fabricante parceiro de equipamentos automotivos.',
      logo: brandForm.logo || 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=200&auto=format&fit=crop&q=80',
      websiteUrl: brandForm.websiteUrl.trim() || '',
      order: editingBrand ? editingBrand.order : brands.length + 1
    };

    if (editingBrand) {
      if (onUpdateBrand) {
        onUpdateBrand(newBrandObj);
      } else {
        const updatedBrands = brands.map(b => b.id === editingBrand.id ? newBrandObj : b);
        localStorage.setItem('athena_brands', JSON.stringify(updatedBrands));
      }
      showNotification(`Marca "${newBrandObj.name}" atualizada!`, 'success');
    } else {
      onAddBrand(newBrandObj);
      setProductForm((prev) => ({ ...prev, brandId: newBrandObj.id }));
      showNotification(`Marca "${newBrandObj.name}" criada com sucesso!`, 'success');
    }

    setIsBrandModalOpen(false);
    setEditingBrand(null);
  };

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

  // Submit New Employee User Form (Admin Only)
  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!userForm.name || !userForm.email || !userForm.password) {
      showNotification('Preencha nome, e-mail e senha do funcionário.', 'error');
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userForm)
      });

      if (res.ok) {
        showNotification(`Funcionário "${userForm.name}" cadastrado com sucesso!`, 'success');
        setUserForm({ name: '', email: '', password: '', role: 'vendedor' });
        setIsUserModalOpen(false);
        fetchUsers();
      } else {
        const data = await res.json().catch(() => ({}));
        showNotification(data.error || 'Erro ao cadastrar funcionário.', 'error');
      }
    } catch (err) {
      showNotification('Erro ao conectar ao servidor de usuários.', 'error');
    }
  };

  // Revoke Employee Access / Delete User (Admin Only)
  const handleDeleteUser = async (userId, userName) => {
    if (confirm(`Tem certeza que deseja revogar o acesso de "${userName}"? Ele será removido permanentemente.`)) {
      try {
        const res = await fetch(`${API_BASE_URL}/users/${userId}`, { method: 'DELETE' });
        if (res.ok) {
          showNotification(`Acesso de "${userName}" revogado com sucesso.`, 'info');
          fetchUsers();
        }
      } catch (err) {
        showNotification('Erro ao revogar acesso.', 'error');
      }
    }
  };

  return (
    <div className="py-8">
      <div className="container-custom space-y-6">
        
        {/* Admin Header Banner */}
        <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-400/30">
                  <Shield className="w-3.5 h-3.5" /> PAINEL ADMINISTRATIVO ATHENA
                </div>
                {currentUser && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-800 text-slate-200 text-xs font-bold border border-slate-700">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{currentUser.name} ({userRole.toUpperCase()})</span>
                  </span>
                )}
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                Gestão da Plataforma
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                {userRole === 'vendedor' 
                  ? 'Modo Vendedor (Leitura & Geração de Catálogos em PDF para Clientes).' 
                  : 'Gerencie equipamentos, fotos no Cloudinary, marcas parceiras e usuários da equipe.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* PDF Catalog Button */}
              <button
                onClick={() => setIsPdfModalOpen(true)}
                className="btn-secondary text-xs sm:text-sm font-bold py-3 px-4 shadow-md shrink-0 bg-slate-800 text-amber-400 border-slate-700 hover:bg-slate-700"
              >
                <Printer className="w-4 h-4 text-amber-400" />
                <span>Gerar Catálogo PDF</span>
              </button>

              {canEditContent && (
                <button
                  onClick={openNewProductModal}
                  className="btn-gold text-xs sm:text-sm font-bold py-3 px-5 shadow-md shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Novo Equipamento</span>
                </button>
              )}

              {onLogout && (
                <button
                  onClick={onLogout}
                  className="btn-danger text-xs font-bold py-3 px-3 shrink-0"
                  title="Sair da Conta"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
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

          {/* ADMIN ONLY: Employees & Access Management Tab */}
          {isAdminRole && (
            <button
              onClick={() => setActiveAdminTab('users')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-colors whitespace-nowrap ${
                activeAdminTab === 'users'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Funcionários & Permissões ({usersList.length})</span>
            </button>
          )}
        </div>

        {/* PRODUCTS MANAGEMENT TAB */}
        {activeAdminTab === 'products' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-amber-600" /> Lista de Produtos
              </h3>
              {canEditContent && (
                <button onClick={openNewProductModal} className="btn-blue text-xs py-2 px-3">
                  <Plus className="w-3.5 h-3.5" /> Adicionar Produto
                </button>
              )}
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
                              disabled={!canEditContent}
                              onClick={() => toggleProductStatus(prod)}
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors ${
                                canEditContent ? 'cursor-pointer' : 'cursor-default'
                              } ${
                                isPublished 
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                                  : 'bg-amber-50 text-amber-800 border-amber-300'
                              }`}
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

                              {canEditContent && (
                                <>
                                  <button
                                    onClick={() => openEditProductModal(prod)}
                                    className="p-2 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200"
                                    title="Editar"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>

                                  {isAdminRole && (
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
                                  )}
                                </>
                              )}
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

        {/* CATEGORIES MANAGEMENT TAB */}
        {activeAdminTab === 'categories' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Gerenciar & Reordenar Categorias</h3>
                <p className="text-xs text-slate-500">Defina a ordem de exibição comercial no filtro (as de topo aparecem primeiro).</p>
              </div>

              {canEditContent && (
                <button onClick={() => setIsQuickCatModalOpen(true)} className="btn-gold text-xs font-bold py-2 px-3">
                  <Plus className="w-3.5 h-3.5" /> Nova Categoria
                </button>
              )}
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
                    {canEditContent && (
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
                    )}

                    {isAdminRole && (
                      <button onClick={() => onDeleteCategory(cat.id)} className="btn-danger text-xs p-2">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BRANDS MANAGEMENT TAB */}
        {activeAdminTab === 'brands' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Gerenciar, Fotos & Links de Marcas</h3>
                <p className="text-xs text-slate-500">Cadastre fotos por Upload/URL e insira o site oficial do parceiro.</p>
              </div>

              {canEditContent && (
                <button onClick={openNewBrandModal} className="btn-gold text-xs font-bold py-2 px-3">
                  <Plus className="w-3.5 h-3.5" /> Nova Marca / Parceiro
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3">
              {brands.map((b, idx) => (
                <div key={b.id} className="p-3.5 rounded-xl border border-slate-200 flex items-center justify-between bg-slate-50">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-800 font-extrabold text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>

                    <div className="w-12 h-10 rounded-lg bg-white border border-slate-200 overflow-hidden flex items-center justify-center p-1 shrink-0">
                      {b.logo ? (
                        <img src={b.logo} alt={b.name} className="max-h-full max-w-full object-contain" />
                      ) : (
                        <Tag className="w-5 h-5 text-slate-400" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900">{b.name}</span>
                        {b.websiteUrl && (
                          <a href={b.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-sky-700 hover:underline flex items-center gap-0.5 font-bold">
                            <Globe className="w-3 h-3 text-sky-600" /> Site Oficial ↗
                          </a>
                        )}
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">/marca/{b.slug || b.id}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {canEditContent && (
                      <>
                        <div className="flex items-center gap-1 border-r border-slate-200 pr-2">
                          <button
                            onClick={() => moveBrandOrder(idx, 'up')}
                            disabled={idx === 0}
                            className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 disabled:opacity-30 hover:bg-slate-100"
                            title="Subir posição"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => moveBrandOrder(idx, 'down')}
                            disabled={idx === brands.length - 1}
                            className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 disabled:opacity-30 hover:bg-slate-100"
                            title="Descer posição"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <button onClick={() => openEditBrandModal(b)} className="p-2 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200" title="Editar Marca">
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}

                    {isAdminRole && (
                      <button onClick={() => onDeleteBrand(b.id)} className="btn-danger text-xs p-2" title="Apagar Marca">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* EMPLOYEES & ACCESS CONTROL TAB (ADMIN ONLY) */}
        {activeAdminTab === 'users' && isAdminRole && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-amber-600" />
                  Gerenciamento de Funcionários & Níveis de Acesso
                </h3>
                <p className="text-xs text-slate-500">Cadastre contas de funcionários e revogue o acesso quando necessário.</p>
              </div>

              <button onClick={() => setIsUserModalOpen(true)} className="btn-gold text-xs font-bold py-2 px-3">
                <Plus className="w-3.5 h-3.5" /> Cadastrar Funcionário
              </button>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-100 uppercase text-[11px] text-slate-600 border-b border-slate-200 font-bold">
                  <tr>
                    <th className="py-3 px-4">Funcionário</th>
                    <th className="py-3 px-4">E-mail Corporativo</th>
                    <th className="py-3 px-4">Nível de Permissão</th>
                    <th className="py-3 px-4 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {usersList.map((user) => {
                    const roleLabels = {
                      admin: { label: 'Administrador Geral', color: 'bg-amber-100 text-amber-900 border-amber-300' },
                      editor: { label: 'Edição / Gestor de Conteúdo', color: 'bg-sky-100 text-sky-900 border-sky-300' },
                      edicao: { label: 'Edição / Gestor de Conteúdo', color: 'bg-sky-100 text-sky-900 border-sky-300' },
                      vendedor: { label: 'Vendedor (Somente Leitura & PDF)', color: 'bg-emerald-100 text-emerald-900 border-emerald-300' }
                    };
                    const roleObj = roleLabels[user.role] || roleLabels.vendedor;

                    return (
                      <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-900">
                          {user.name}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-600">
                          {user.email}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${roleObj.color}`}>
                            {roleObj.label}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          {user.id !== currentUser?.id ? (
                            <button
                              onClick={() => handleDeleteUser(user.id, user.name)}
                              className="btn-danger text-xs py-1.5 px-2.5"
                              title="Revogar Acesso / Apagar"
                            >
                              <UserX className="w-3.5 h-3.5" /> Revogar Acesso
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-semibold italic">Você</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* NEW EMPLOYEE MODAL (ADMIN ONLY) */}
        {isUserModalOpen && (
          <div className="modal-backdrop" onClick={() => setIsUserModalOpen(false)}>
            <div className="modal-content max-w-md p-6 bg-white border-slate-200 relative" onClick={(e) => e.stopPropagation()}>
              <button 
                onClick={() => setIsUserModalOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900"
              >
                <X className="w-5 h-5" />
              </button>

              <h4 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-600" /> Cadastrar Novo Funcionário
              </h4>

              <form onSubmit={handleCreateUser} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Nome Completo *</label>
                  <input
                    type="text"
                    placeholder="Ex: Carlos Silva"
                    value={userForm.name}
                    onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                    className="form-input text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">E-mail Corporativo *</label>
                  <input
                    type="email"
                    placeholder="carlos@athena.com.br"
                    value={userForm.email}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    className="form-input text-xs font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Senha Inicial *</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={userForm.password}
                    onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                    className="form-input text-xs font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Nível de Permissão (Acesso) *</label>
                  <select
                    value={userForm.role}
                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                    className="form-select text-xs font-bold"
                  >
                    <option value="vendedor">Vendedor (Somente Leitura + Gerador de PDF)</option>
                    <option value="editor">Edição / Gestor (Criar e Editar Conteúdo)</option>
                    <option value="admin">Administrador Geral (Acesso Total + Gestão de Usuários)</option>
                  </select>
                </div>

                <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                  <button type="button" onClick={() => setIsUserModalOpen(false)} className="btn-secondary text-xs">Cancelar</button>
                  <button type="submit" className="btn-gold text-xs font-bold py-2.5 px-4">
                    <Check className="w-4 h-4" /> Criar Conta
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* FULL PRODUCT FORM MODAL */}
        {isProductModalOpen && canEditContent && (
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
                        onClick={openNewBrandModal}
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
                        className="form-input text-xs !pl-10"
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

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Descrição</label>
                  <textarea
                    placeholder="Descreva as características técnicas do produto..."
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    className="form-textarea text-xs h-20"
                  />
                </div>

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

        {/* BRAND MODAL */}
        {isBrandModalOpen && canEditContent && (
          <div className="modal-backdrop" onClick={() => setIsBrandModalOpen(false)}>
            <div className="modal-content max-w-md p-6 bg-white border-slate-200 relative" onClick={(e) => e.stopPropagation()}>
              <button 
                onClick={() => setIsBrandModalOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900"
              >
                <X className="w-5 h-5" />
              </button>

              <h4 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Tag className="w-5 h-5 text-sky-600" />
                {editingBrand ? 'Editar Marca / Parceiro' : 'Cadastrar Nova Marca / Parceiro'}
              </h4>

              <form onSubmit={handleBrandSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Nome da Marca *</label>
                  <input
                    type="text"
                    placeholder="Ex: Mahovi, Engecass, Launch"
                    value={brandForm.name}
                    onChange={(e) => setBrandForm({ ...brandForm, name: e.target.value })}
                    className="form-input text-xs"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700">Logo / Foto da Marca</label>
                    <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
                      <button
                        type="button"
                        onClick={() => setBrandForm({ ...brandForm, imageSourceMode: 'upload' })}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          brandForm.imageSourceMode === 'upload' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                        }`}
                      >
                        Upload Arquivo
                      </button>
                      <button
                        type="button"
                        onClick={() => setBrandForm({ ...brandForm, imageSourceMode: 'url' })}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          brandForm.imageSourceMode === 'url' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                        }`}
                      >
                        URL da Imagem
                      </button>
                    </div>
                  </div>

                  {brandForm.imageSourceMode === 'upload' ? (
                    <div 
                      onDragOver={(e) => { e.preventDefault(); setIsDraggingBrandLogo(true); }}
                      onDragLeave={() => setIsDraggingBrandLogo(false)}
                      onDrop={handleDropBrandLogo}
                      className={`border-2 border-dashed rounded-2xl p-4 text-center transition-colors cursor-pointer ${
                        isDraggingBrandLogo ? 'border-sky-500 bg-sky-50' : 'border-slate-300 hover:border-sky-400 bg-slate-50'
                      }`}
                    >
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => e.target.files && handleBrandLogoFileUpload(e.target.files[0])}
                        className="hidden" 
                        id="brandLogoFileInput"
                      />

                      <label htmlFor="brandLogoFileInput" className="cursor-pointer space-y-1 block">
                        <Upload className="w-5 h-5 mx-auto text-sky-600" />
                        <span className="text-xs font-bold text-slate-800 block">
                          Arraste e solte o logo ou clique para escolher
                        </span>
                        <span className="text-[10px] text-slate-400">JPG, PNG ou SVG</span>
                      </label>
                    </div>
                  ) : (
                    <div className="relative">
                      <input
                        type="url"
                        placeholder="https://marca.com/logo.png"
                        value={brandForm.logo}
                        onChange={(e) => setBrandForm({ ...brandForm, logo: e.target.value })}
                        className="form-input text-xs !pl-10"
                      />
                      <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    </div>
                  )}

                  {brandForm.logo && (
                    <div className="flex items-center gap-3 p-2 bg-slate-100 rounded-xl border border-slate-200">
                      <img src={brandForm.logo} alt="Preview Logo" className="w-10 h-10 object-contain rounded-lg bg-white p-1 border" />
                      <span className="text-xs text-slate-600 truncate flex-1">Logo definida</span>
                      <button type="button" onClick={() => setBrandForm({ ...brandForm, logo: '' })} className="text-xs text-red-600 font-bold">Remover</button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Site Oficial do Parceiro (Opcional)
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      placeholder="https://www.fabricante.com.br"
                      value={brandForm.websiteUrl}
                      onChange={(e) => setBrandForm({ ...brandForm, websiteUrl: e.target.value })}
                      className="form-input text-xs !pl-10"
                    />
                    <Globe className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Descrição Breve</label>
                  <textarea
                    placeholder="Descrição da marca, história ou especialidade..."
                    value={brandForm.description}
                    onChange={(e) => setBrandForm({ ...brandForm, description: e.target.value })}
                    className="form-textarea text-xs h-20"
                  />
                </div>

                <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                  <button type="button" onClick={() => setIsBrandModalOpen(false)} className="btn-secondary text-xs">Cancelar</button>
                  <button type="submit" className="btn-gold text-xs font-bold py-2.5 px-4">
                    <Check className="w-4 h-4" /> Salvar Marca
                  </button>
                </div>

              </form>
            </div>
          </div>
        )}

        {/* QUICK CATEGORY MODAL */}
        {isQuickCatModalOpen && canEditContent && (
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

        {/* COMMERCIAL PDF CATALOG GENERATOR MODAL */}
        <PdfCatalogGenerator
          products={products}
          categories={categories}
          brands={brands}
          isOpen={isPdfModalOpen}
          onClose={() => setIsPdfModalOpen(false)}
        />

      </div>
    </div>
  );
}
