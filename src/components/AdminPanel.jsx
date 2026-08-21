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
  Lock,
  Star,
  Key,
  Settings,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
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
  onReorderProducts,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  onReorderCategories,
  onAddBrand,
  onUpdateBrand,
  onDeleteBrand,
  onReorderBrands,
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
  const [productImageUrlInput, setProductImageUrlInput] = useState('');
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  // Category Modal State (Creating / Editing)
  const [editingCategory, setEditingCategory] = useState(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    slug: '',
    icon: 'Layers'
  });

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

  // Search, Filter & Pagination State for Products Table
  const [adminProductSearch, setAdminProductSearch] = useState('');
  const [adminBrandFilter, setAdminBrandFilter] = useState('');
  const [adminCategoryFilter, setAdminCategoryFilter] = useState('');
  const [adminStatusFilter, setAdminStatusFilter] = useState('');
  const [adminPage, setAdminPage] = useState(1);
  const [adminItemsPerPage, setAdminItemsPerPage] = useState(10);

  // Reset to page 1 on filter or per-page change
  useEffect(() => {
    setAdminPage(1);
  }, [adminProductSearch, adminBrandFilter, adminCategoryFilter, adminStatusFilter, adminItemsPerPage]);

  // Password & Profile Settings Form State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [profileForm, setProfileForm] = useState({
    name: currentUser?.name || 'Administrador Geral',
    email: currentUser?.email || 'administracao@athenaconsultoria.com.br'
  });

  useEffect(() => {
    if (currentUser) {
      setProfileForm({
        name: currentUser.name || 'Administrador Geral',
        email: currentUser.email || 'administracao@athenaconsultoria.com.br'
      });
    }
  }, [currentUser]);

  const [isChangingPassword, setIsChangingPassword] = useState(false);

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
      isFeatured: false,
      image: '',
      images: [],
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
      isFeatured: false,
      image: '',
      images: [],
      altText: '',
      description: '',
      specs: [],
      attachments: []
    });
    setIsProductModalOpen(true);
  };

  const openEditProductModal = (product) => {
    setEditingProduct(product);
    setProductForm({
      ...product,
      isFeatured: !!product.isFeatured,
      images: Array.isArray(product.images) ? [...product.images] : [],
      specs: Array.isArray(product.specs) ? [...product.specs] : [],
      attachments: product.attachments ? [...product.attachments] : []
    });
    setIsProductModalOpen(true);
  };

  const handleAddSpec = (specText = '') => {
    setProductForm(prev => ({
      ...prev,
      specs: [...(prev.specs || []), specText]
    }));
  };

  const handleUpdateSpec = (index, value) => {
    setProductForm(prev => {
      const next = [...(prev.specs || [])];
      next[index] = value;
      return { ...prev, specs: next };
    });
  };

  const handleRemoveSpec = (index) => {
    setProductForm(prev => {
      const next = (prev.specs || []).filter((_, i) => i !== index);
      return { ...prev, specs: next };
    });
  };

  const handleMoveSpec = (index, direction) => {
    setProductForm(prev => {
      const specs = [...(prev.specs || [])];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= specs.length) return prev;
      const temp = specs[index];
      specs[index] = specs[targetIndex];
      specs[targetIndex] = temp;
      return { ...prev, specs };
    });
  };

  // Smart Parser & Extractor from Description
  const handleExtractSpecsFromDescription = () => {
    const text = (productForm.description || '') + '\n' + (productForm.name || '');
    if (!text.trim()) {
      showNotification('Digite ou cole uma descrição técnica antes de extrair.', 'error');
      return;
    }

    const lines = text.split(/\r?\n|[;•·\t]/).map(l => l.trim()).filter(Boolean);
    const extracted = [];
    const seen = new Set((productForm.specs || []).map(s => s.toLowerCase().trim()));

    for (const rawLine of lines) {
      let line = rawLine.replace(/^[•\-\*–—\d+\.\)]+\s*/, '').trim();
      if (line.length < 3 || line.length > 150) continue;

      if (
        line.includes(':') ||
        /\b(capacidade|altura|largura|tensão|voltagem|potência|motor|peso|pressão|torque|display|bateria|garantia|consumo|curso|velocidade|protocolo|dimensões|aro|diâmetro|bloqueio|frequência)\b/i.test(line)
      ) {
        if (!seen.has(line.toLowerCase())) {
          seen.add(line.toLowerCase());
          extracted.push(line);
        }
      }
    }

    if (extracted.length > 0) {
      setProductForm(prev => ({
        ...prev,
        specs: [...(prev.specs || []), ...extracted]
      }));
      showNotification(`✨ ${extracted.length} especificação(ões) identificada(s) e adicionada(s)!`, 'success');
    } else {
      showNotification('Nenhum padrão técnico identificado na descrição. Utilize as sugestões rápidas abaixo.', 'info');
    }
  };

  const handleMultipleImageUpload = async (files) => {
    if (!files || files.length === 0) return;
    const fileList = Array.from(files).filter(f => f && f.type && f.type.startsWith('image/'));
    if (fileList.length === 0) {
      showNotification('Selecione arquivos de imagem válidos (JPG/PNG/WEBP).', 'error');
      return;
    }

    showNotification(`Processando ${fileList.length} imagem(ns)...`, 'info');

    for (const file of fileList) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Data = e.target.result;
        try {
          const res = await fetch(`${API_BASE_URL}/upload`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ file: base64Data, folder: 'athena_produtos' })
          });
          const uploadedUrl = res.ok ? (await res.json()).url : base64Data;
          setProductForm((prev) => {
            const currentImages = Array.isArray(prev.images) ? [...prev.images] : [];
            const newImages = currentImages.includes(uploadedUrl) ? currentImages : [...currentImages, uploadedUrl];
            return {
              ...prev,
              image: prev.image || uploadedUrl,
              images: newImages
            };
          });
          showNotification('Foto adicionada com sucesso!', 'success');
        } catch (err) {
          setProductForm((prev) => {
            const currentImages = Array.isArray(prev.images) ? [...prev.images] : [];
            return {
              ...prev,
              image: prev.image || base64Data,
              images: [...currentImages, base64Data]
            };
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageFileUpload = (file) => {
    if (file) handleMultipleImageUpload([file]);
  };

  const handleDropImage = (e) => {
    e.preventDefault();
    setIsDraggingImage(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleMultipleImageUpload(e.dataTransfer.files);
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

    // If trying to publish a draft product, check if brand or category is in draft
    if (product.status === 'draft') {
      const brand = brands.find(b => b.id === product.brandId);
      const category = categories.find(c => c.id === product.categoryId);

      if (brand && brand.status === 'draft') {
        showNotification(
          `⚠️ Bloqueado: A marca "${brand.name}" está em Rascunho. Ative/publique a marca no painel para liberar a publicação deste equipamento.`,
          'warning'
        );
        return;
      }

      if (category && category.status === 'draft') {
        showNotification(
          `⚠️ Bloqueado: A categoria "${category.name}" está em Rascunho. Ative/publique a categoria no painel para liberar este equipamento.`,
          'warning'
        );
        return;
      }
    }

    const newStatus = product.status === 'published' ? 'draft' : 'published';
    const updated = { ...product, status: newStatus };
    onUpdateProduct(updated);
    showNotification(
      `Status do equipamento "${product.name}" alterado para ${newStatus === 'published' ? 'Publicado' : 'Rascunho'}.`,
      'info'
    );
  };

  const toggleBrandStatus = (brandObj) => {
    if (!canEditContent) return;
    const newStatus = brandObj.status === 'draft' ? 'published' : 'draft';
    const updatedBrand = { ...brandObj, status: newStatus };
    onUpdateBrand(updatedBrand);

    if (newStatus === 'draft') {
      const relatedProds = products.filter(p => p.brandId === brandObj.id && p.status === 'published');
      relatedProds.forEach(p => {
        onUpdateProduct({ ...p, status: 'draft' });
      });
      showNotification(
        `Marca "${brandObj.name}" colocada em Rascunho. ${relatedProds.length} equipamento(s) foram colocados em Rascunho e bloqueados.`,
        'warning'
      );
    } else {
      showNotification(
        `Marca "${brandObj.name}" foi Publicada! Agora você pode liberar os equipamentos desta marca.`,
        'success'
      );
    }
  };

  const toggleCategoryStatus = (catObj) => {
    if (!canEditContent) return;
    const newStatus = catObj.status === 'draft' ? 'published' : 'draft';
    const updatedCat = { ...catObj, status: newStatus };
    onUpdateCategory(updatedCat);

    if (newStatus === 'draft') {
      const relatedProds = products.filter(p => p.categoryId === catObj.id && p.status === 'published');
      relatedProds.forEach(p => {
        onUpdateProduct({ ...p, status: 'draft' });
      });
      showNotification(
        `Categoria "${catObj.name}" colocada em Rascunho. ${relatedProds.length} equipamento(s) foram colocados em Rascunho e bloqueados.`,
        'warning'
      );
    } else {
      showNotification(
        `Categoria "${catObj.name}" foi Publicada! Agora você pode liberar os equipamentos desta categoria.`,
        'success'
      );
    }
  };

  const moveCategoryOrder = (index, direction) => {
    if (!canEditContent) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= categories.length) return;

    const newCategories = [...categories];
    const temp = newCategories[index];
    newCategories[index] = newCategories[targetIndex];
    newCategories[targetIndex] = temp;

    newCategories.forEach((c, idx) => { c.order = idx + 1; });
    if (onReorderCategories) {
      onReorderCategories(newCategories);
    }
    showNotification(`Ordem das categorias atualizada!`, 'success');
  };

  const autoSortCategoriesByCount = () => {
    if (!canEditContent) return;
    const newCategories = [...categories].sort((a, b) => {
      const countA = products.filter(p => p.categoryId === a.id).length;
      const countB = products.filter(p => p.categoryId === b.id).length;
      if (countB !== countA) return countB - countA;
      return a.name.localeCompare(b.name);
    });

    newCategories.forEach((c, idx) => { c.order = idx + 1; });
    if (onReorderCategories) {
      onReorderCategories(newCategories);
    }
    showNotification('Categorias reordenadas por quantidade de produtos com sucesso!', 'success');
  };

  const moveBrandOrder = (index, direction) => {
    if (!canEditContent) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= brands.length) return;

    const newBrands = [...brands];
    const temp = newBrands[index];
    newBrands[index] = newBrands[targetIndex];
    newBrands[targetIndex] = temp;

    newBrands.forEach((b, idx) => { b.order = idx + 1; });
    if (onReorderBrands) {
      onReorderBrands(newBrands);
    }
    showNotification(`Ordem das marcas atualizada!`, 'success');
  };

  const autoSortBrandsByCount = () => {
    if (!canEditContent) return;
    const newBrands = [...brands].sort((a, b) => {
      const countA = products.filter(p => p.brandId === a.id).length;
      const countB = products.filter(p => p.brandId === b.id).length;
      if (countB !== countA) return countB - countA;
      return a.name.localeCompare(b.name);
    });

    newBrands.forEach((b, idx) => { b.order = idx + 1; });
    if (onReorderBrands) {
      onReorderBrands(newBrands);
    }
    showNotification('Marcas reordenadas por quantidade de produtos com sucesso!', 'success');
  };

  const moveProductOrder = (productId, direction) => {
    if (!canEditContent) return;
    const index = products.findIndex(p => p.id === productId);
    if (index === -1) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= products.length) return;

    const newProducts = [...products];
    const temp = newProducts[index];
    newProducts[index] = newProducts[targetIndex];
    newProducts[targetIndex] = temp;

    if (onReorderProducts) {
      onReorderProducts(newProducts);
    }
    showNotification('Ordem dos produtos atualizada!', 'success');
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
      showNotification(`Marca "${newBrandObj.name}" criada com sucesso!`, 'success');
    }

    setIsBrandModalOpen(false);
    setEditingBrand(null);
  };

      const openNewCategoryModal = () => {
        setEditingCategory(null);
        setCategoryForm({
          name: '',
          description: '',
          slug: '',
          icon: 'Layers'
        });
        setIsCategoryModalOpen(true);
      };

      const openEditCategoryModal = (cat) => {
        setEditingCategory(cat);
        setCategoryForm({
          name: cat.name || '',
          description: cat.description || '',
          slug: cat.slug || '',
          icon: cat.icon || 'Layers'
        });
        setIsCategoryModalOpen(true);
      };

      const handleCategorySubmit = (e) => {
        e.preventDefault();
        if (!categoryForm.name.trim()) {
          showNotification('Informe o nome da categoria.', 'error');
          return;
        }

        const catSlug = categoryForm.slug.trim() || generateSlug(categoryForm.name);
        const categoryObj = {
          id: editingCategory ? editingCategory.id : `cat_${Date.now()}`,
          name: categoryForm.name.trim(),
          slug: catSlug,
          description: categoryForm.description.trim() || 'Equipamentos e soluções para oficina automotiva.',
          icon: categoryForm.icon || 'Layers',
          order: editingCategory ? editingCategory.order : categories.length + 1
        };

        if (editingCategory) {
          if (onUpdateCategory) {
            onUpdateCategory(categoryObj);
          } else {
            const updated = categories.map(c => c.id === editingCategory.id ? categoryObj : c);
            localStorage.setItem('athena_categories', JSON.stringify(updated));
          }
          showNotification(`Categoria "${categoryObj.name}" atualizada com sucesso!`, 'success');
        } else {
          onAddCategory(categoryObj);
          showNotification(`Categoria "${categoryObj.name}" criada com sucesso!`, 'success');
        }

        setIsCategoryModalOpen(false);
        setEditingCategory(null);
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

  // Change Admin / User Password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!passwordForm.currentPassword) {
      showNotification('Informe sua senha atual.', 'error');
      return;
    }
    if (!passwordForm.newPassword || passwordForm.newPassword.length < 4) {
      showNotification('A nova senha deve ter no mínimo 4 caracteres.', 'error');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showNotification('A confirmação da nova senha não confere.', 'error');
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await fetch(`${API_BASE_URL}/users/${currentUser?.id || 'user_admin_default'}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });

      const data = await res.json();
      if (res.ok) {
        showNotification('Senha alterada com sucesso! Utilize a nova senha no próximo login.', 'success');
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        showNotification(data.error || 'Erro ao alterar senha. Verifique a senha atual.', 'error');
      }
    } catch (err) {
      showNotification('Erro ao conectar ao servidor para alterar a senha.', 'error');
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Update Admin Profile Info (Name / Email)
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/users/${currentUser?.id || 'user_admin_default'}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profileForm.name,
          email: profileForm.email
        })
      });

      const data = await res.json();
      if (res.ok) {
        showNotification('Dados de perfil atualizados com sucesso!', 'success');
        const updatedUser = {
          ...(currentUser || {}),
          id: currentUser?.id || 'user_admin_default',
          name: profileForm.name,
          email: profileForm.email,
          role: currentUser?.role || 'admin'
        };
        localStorage.setItem('athena_user', JSON.stringify(updatedUser));
      } else {
        showNotification(data.error || 'Erro ao atualizar dados do perfil.', 'error');
      }
    } catch (err) {
      showNotification('Erro ao conectar ao servidor para atualizar perfil.', 'error');
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
              <span>Funcionários ({usersList.length})</span>
            </button>
          )}

          {/* Settings & Password Tab */}
          <button
            onClick={() => setActiveAdminTab('settings')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-colors whitespace-nowrap ${
              activeAdminTab === 'settings'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Configurações & Senha</span>
          </button>
        </div>

        {/* PRODUCTS MANAGEMENT TAB WITH PAGINATION */}
        {activeAdminTab === 'products' && (() => {
          const filteredAdminProducts = products.filter((prod) => {
            const matchSearch = !adminProductSearch || 
              prod.name.toLowerCase().includes(adminProductSearch.toLowerCase()) ||
              (prod.slug && prod.slug.toLowerCase().includes(adminProductSearch.toLowerCase()));
            const matchBrand = !adminBrandFilter || prod.brandId === adminBrandFilter;
            const matchCategory = !adminCategoryFilter || prod.categoryId === adminCategoryFilter;
            const matchStatus = !adminStatusFilter || 
              (adminStatusFilter === 'featured' ? prod.isFeatured : prod.status === adminStatusFilter);
            return matchSearch && matchBrand && matchCategory && matchStatus;
          });

          const totalItems = filteredAdminProducts.length;
          const isAll = adminItemsPerPage === 'all';
          const perPageNum = isAll ? (totalItems || 1) : Number(adminItemsPerPage);
          const totalPages = isAll ? 1 : Math.max(1, Math.ceil(totalItems / perPageNum));
          const currentPageSafe = Math.min(Math.max(1, adminPage), totalPages);
          const startIndex = isAll ? 0 : (currentPageSafe - 1) * perPageNum;
          const paginatedAdminProducts = isAll 
            ? filteredAdminProducts 
            : filteredAdminProducts.slice(startIndex, startIndex + perPageNum);

          return (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Package className="w-5 h-5 text-amber-600" /> Lista Geral de Equipamentos
                  </h3>
                  <p className="text-xs text-slate-500">
                    Exibindo <span className="font-bold text-amber-700">{totalItems > 0 ? startIndex + 1 : 0}–{Math.min(startIndex + perPageNum, totalItems)}</span> de {totalItems} equipamentos cadastrados.
                  </p>
                </div>

                {canEditContent && (
                  <button onClick={openNewProductModal} className="btn-gold text-xs py-2.5 px-4 flex items-center gap-2 shrink-0">
                    <Plus className="w-4 h-4" /> Adicionar Equipamento
                  </button>
                )}
              </div>

              {/* Quick Search & Filters Bar */}
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col lg:flex-row items-center gap-3">
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Filtrar por nome ou código do equipamento..."
                    value={adminProductSearch}
                    onChange={(e) => setAdminProductSearch(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-amber-500 focus:bg-white text-xs rounded-xl pl-9 pr-8 py-2.5 outline-none"
                  />
                  {adminProductSearch && (
                    <button onClick={() => setAdminProductSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                  <select
                    value={adminBrandFilter}
                    onChange={(e) => setAdminBrandFilter(e.target.value)}
                    className="bg-slate-50 border border-slate-200 focus:border-amber-500 text-xs rounded-xl px-3 py-2.5 outline-none flex-1 sm:w-36 font-semibold text-slate-700"
                  >
                    <option value="">Todas as Marcas</option>
                    {brands.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>

                  <select
                    value={adminCategoryFilter}
                    onChange={(e) => setAdminCategoryFilter(e.target.value)}
                    className="bg-slate-50 border border-slate-200 focus:border-amber-500 text-xs rounded-xl px-3 py-2.5 outline-none flex-1 sm:w-40 font-semibold text-slate-700"
                  >
                    <option value="">Todas as Categorias</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>

                  <select
                    value={adminStatusFilter}
                    onChange={(e) => setAdminStatusFilter(e.target.value)}
                    className="bg-slate-50 border border-slate-200 focus:border-amber-500 text-xs rounded-xl px-3 py-2.5 outline-none flex-1 sm:w-36 font-semibold text-slate-700"
                  >
                    <option value="">Todos os Status</option>
                    <option value="published">🟢 Publicados</option>
                    <option value="draft">🟡 Rascunhos</option>
                    <option value="featured">⭐ Destaques</option>
                  </select>

                  {(adminProductSearch || adminBrandFilter || adminCategoryFilter || adminStatusFilter) && (
                    <button
                      onClick={() => {
                        setAdminProductSearch('');
                        setAdminBrandFilter('');
                        setAdminCategoryFilter('');
                        setAdminStatusFilter('');
                      }}
                      className="text-xs text-amber-700 font-bold hover:underline px-2 shrink-0"
                    >
                      Limpar
                    </button>
                  )}
                </div>
              </div>

              {/* Products Table */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-100 uppercase text-[11px] text-slate-600 border-b border-slate-200 font-bold">
                      <tr>
                        <th className="py-3 px-4">Equipamento</th>
                        <th className="py-3 px-4">Marca & Categoria</th>
                        <th className="py-3 px-4 text-center">Destaque</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {paginatedAdminProducts.length > 0 ? (
                        paginatedAdminProducts.map((prod) => {
                          const isPublished = prod.status === 'published';
                          const brandObj = brands.find(b => b.id === prod.brandId);
                          const catObj = categories.find(c => c.id === prod.categoryId);
                          const isFeatured = !!prod.isFeatured;

                          return (
                            <tr key={prod.id} className={`hover:bg-slate-50 transition-colors ${isFeatured ? 'bg-amber-50/30' : ''}`}>
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                  <img 
                                    src={prod.image} 
                                    alt={prod.altText || prod.name}
                                    loading="lazy"
                                    className="w-12 h-12 rounded-xl object-contain bg-slate-50 border border-slate-200 shrink-0 p-1" 
                                  />
                                  <div>
                                    <span className="font-bold text-slate-900 text-xs block leading-snug">
                                      {prod.name}
                                    </span>
                                    <span className="text-[11px] font-mono text-slate-400 block truncate max-w-xs">
                                      /produto/{prod.slug || prod.id}
                                    </span>
                                  </div>
                                </div>
                              </td>

                              <td className="py-3 px-4">
                                <div className="space-y-0.5">
                                  <span className="inline-block px-2 py-0.5 rounded-md bg-sky-50 text-sky-800 border border-sky-200 font-bold text-[10px]">
                                    {brandObj?.name || 'Sem Marca'}
                                  </span>
                                  <span className="text-[11px] text-slate-500 block">
                                    {catObj?.name || 'Sem Categoria'}
                                  </span>
                                </div>
                              </td>

                              {/* 1-Click Toggle Featured Star */}
                              <td className="py-3 px-4 text-center">
                                {canEditContent ? (
                                  <button
                                    onClick={() => {
                                      const updated = { ...prod, isFeatured: !isFeatured };
                                      onUpdateProduct(updated);
                                      showNotification(`Produto "${prod.name}" ${!isFeatured ? 'marcado como Destaque ⭐' : 'removido dos destaques'}.`, 'success');
                                    }}
                                    className={`p-2 rounded-xl border transition-all ${
                                      isFeatured 
                                        ? 'bg-amber-400 text-amber-950 border-amber-500 shadow-xs' 
                                        : 'bg-slate-50 text-slate-400 border-slate-200 hover:text-amber-500 hover:bg-amber-50'
                                    }`}
                                    title={isFeatured ? 'Remover dos Destaques Athena' : 'Marcar como Destaque Athena (Exibir no topo)'}
                                  >
                                    <Star className={`w-4 h-4 ${isFeatured ? 'fill-amber-950 text-amber-950' : ''}`} />
                                  </button>
                                ) : (
                                  <Star className={`w-4 h-4 mx-auto ${isFeatured ? 'fill-amber-500 text-amber-500' : 'text-slate-300'}`} />
                                )}
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

                              <td className="py-3 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => onNavigate(`produto/${prod.slug || prod.id}`)}
                                    className="p-2 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                                    title="Visualizar no Site"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </button>

                                  {canEditContent && (
                                    <>
                                      <button
                                        onClick={() => moveProductOrder(prod.id, 'up')}
                                        disabled={products.findIndex(p => p.id === prod.id) === 0}
                                        className="p-2 rounded-lg bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200 disabled:opacity-30"
                                        title="Subir posição no catálogo"
                                      >
                                        <ArrowUp className="w-3.5 h-3.5" />
                                      </button>

                                      <button
                                        onClick={() => moveProductOrder(prod.id, 'down')}
                                        disabled={products.findIndex(p => p.id === prod.id) === products.length - 1}
                                        className="p-2 rounded-lg bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200 disabled:opacity-30"
                                        title="Descer posição no catálogo"
                                      >
                                        <ArrowDown className="w-3.5 h-3.5" />
                                      </button>

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
                        })
                      ) : (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-slate-500">
                            Nenhum equipamento encontrado com os filtros selecionados.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* PAGINATION FOOTER */}
                {totalItems > 0 && (
                  <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                    {/* Items Per Page Selector */}
                    <div className="flex items-center gap-2 text-slate-600">
                      <span>Exibir:</span>
                      <select
                        value={adminItemsPerPage}
                        onChange={(e) => setAdminItemsPerPage(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                        className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-700 outline-none focus:border-amber-500"
                      >
                        <option value={10}>10 por página</option>
                        <option value={20}>20 por página</option>
                        <option value={50}>50 por página</option>
                        <option value="all">Exibir Todos ({totalItems})</option>
                      </select>
                    </div>

                    {/* Page Navigation Controls */}
                    {!isAll && totalPages > 1 && (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setAdminPage(1)}
                          disabled={currentPageSafe === 1}
                          className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Primeira Página"
                        >
                          <ChevronsLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setAdminPage(prev => Math.max(1, prev - 1))}
                          disabled={currentPageSafe === 1}
                          className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Página Anterior"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>

                        <div className="flex items-center gap-1 px-2 font-bold text-slate-700 text-xs">
                          <span>Página</span>
                          <span className="px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 font-black">
                            {currentPageSafe}
                          </span>
                          <span>de {totalPages}</span>
                        </div>

                        <button
                          onClick={() => setAdminPage(prev => Math.min(totalPages, prev + 1))}
                          disabled={currentPageSafe === totalPages}
                          className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Próxima Página"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setAdminPage(totalPages)}
                          disabled={currentPageSafe === totalPages}
                          className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Última Página"
                        >
                          <ChevronsRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* CATEGORIES MANAGEMENT TAB */}
        {activeAdminTab === 'categories' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Gerenciar & Reordenar Categorias</h3>
                <p className="text-xs text-slate-500">Defina a ordem de exibição comercial no filtro (as de topo aparecem primeiro).</p>
              </div>

              {canEditContent && (
                <div className="flex items-center gap-2">
                  <button 
                    onClick={autoSortCategoriesByCount} 
                    className="btn-secondary text-xs font-bold py-2 px-3 flex items-center gap-1.5"
                    title="Ordenar automaticamente da categoria com maior quantidade de produtos para a menor"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Ordenar Automaticamente</span>
                  </button>

                  <button onClick={openNewCategoryModal} className="btn-gold text-xs font-bold py-2 px-3">
                    <Plus className="w-3.5 h-3.5" /> Nova Categoria
                  </button>
                </div>
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
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900">{cat.name}</span>
                        {cat.status === 'draft' && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-500 text-white text-[9px] font-bold">
                            Rascunho
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">/categoria/{cat.slug || cat.id}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {canEditContent && (
                      <>
                        <div className="flex items-center gap-1 border-r border-slate-200 pr-2">
                          <button
                            onClick={() => toggleCategoryStatus(cat)}
                            className={`p-1.5 rounded-lg border text-xs font-bold flex items-center gap-1 ${
                              cat.status === 'draft'
                                ? 'bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                            }`}
                            title={cat.status === 'draft' ? 'Publicar Categoria' : 'Colocar Categoria em Rascunho'}
                          >
                            {cat.status === 'draft' ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            <span className="hidden sm:inline">{cat.status === 'draft' ? 'Rascunho' : 'Publicada'}</span>
                          </button>

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

                        <button
                          onClick={() => openEditCategoryModal(cat)}
                          className="p-2 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200"
                          title="Editar Categoria"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}

                    {isAdminRole && (
                      <button onClick={() => onDeleteCategory(cat.id)} className="btn-danger text-xs p-2" title="Apagar Categoria">
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
                <div className="flex items-center gap-2">
                  <button 
                    onClick={autoSortBrandsByCount} 
                    className="btn-secondary text-xs font-bold py-2 px-3 flex items-center gap-1.5"
                    title="Ordenar automaticamente da marca com maior quantidade de produtos para a menor"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                    <span>Ordenar Automaticamente</span>
                  </button>

                  <button onClick={openNewBrandModal} className="btn-gold text-xs font-bold py-2 px-3">
                    <Plus className="w-3.5 h-3.5" /> Nova Marca / Parceiro
                  </button>
                </div>
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
                        {b.status === 'draft' && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-500 text-white text-[9px] font-bold">
                            Rascunho
                          </span>
                        )}
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
                            onClick={() => toggleBrandStatus(b)}
                            className={`p-1.5 rounded-lg border text-xs font-bold flex items-center gap-1 ${
                              b.status === 'draft'
                                ? 'bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                            }`}
                            title={b.status === 'draft' ? 'Publicar Marca' : 'Colocar Marca em Rascunho'}
                          >
                            {b.status === 'draft' ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            <span className="hidden sm:inline">{b.status === 'draft' ? 'Rascunho' : 'Publicada'}</span>
                          </button>

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

        {/* SETTINGS & PASSWORD MANAGEMENT TAB */}
        {activeAdminTab === 'settings' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Password Change Card */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Alterar Senha de Acesso
                  </h3>
                  <p className="text-xs text-slate-500">
                    Defina uma nova senha segura para o seu login.
                  </p>
                </div>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    Senha Atual *
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      placeholder="Digite sua senha atual"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      required
                      className="w-full bg-slate-50 border border-slate-300 focus:border-amber-500 focus:bg-white text-slate-900 text-xs rounded-xl pl-9 pr-4 py-3 outline-none"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    Nova Senha *
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      placeholder="Digite a nova senha (mínimo 4 caracteres)"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      required
                      minLength={4}
                      className="w-full bg-slate-50 border border-slate-300 focus:border-amber-500 focus:bg-white text-slate-900 text-xs rounded-xl pl-9 pr-4 py-3 outline-none"
                    />
                    <Key className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    Confirmar Nova Senha *
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      placeholder="Repita a nova senha"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      required
                      minLength={4}
                      className="w-full bg-slate-50 border border-slate-300 focus:border-amber-500 focus:bg-white text-slate-900 text-xs rounded-xl pl-9 pr-4 py-3 outline-none"
                    />
                    <Key className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="w-full btn-gold text-xs font-bold py-3.5 shadow-md flex items-center justify-center gap-2 mt-2"
                >
                  <Check className="w-4 h-4" />
                  <span>{isChangingPassword ? 'Salvando...' : 'Atualizar Minha Senha'}</span>
                </button>
              </form>
            </div>

            {/* Profile Info Card */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-700">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Dados do Administrador
                  </h3>
                  <p className="text-xs text-slate-500">
                    Informações da conta de gerenciamento.
                  </p>
                </div>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    Nome de Exibição
                  </label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    required
                    className="w-full bg-slate-50 border border-slate-300 focus:border-sky-500 focus:bg-white text-slate-900 text-xs rounded-xl px-4 py-3 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    E-mail de Login
                  </label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    required
                    className="w-full bg-slate-50 border border-slate-300 focus:border-sky-500 focus:bg-white text-slate-900 text-xs rounded-xl px-4 py-3 outline-none"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 text-xs text-slate-600">
                  <span className="font-bold text-slate-900 block">Nível de Permissão:</span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 font-extrabold text-[10px]">
                    <Shield className="w-3.5 h-3.5" /> Administrador Geral (Acesso Total)
                  </span>
                </div>

                <button
                  type="submit"
                  className="w-full btn-secondary text-xs font-bold py-3.5 border-slate-300 hover:bg-slate-50 flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Salvar Dados de Perfil</span>
                </button>
              </form>
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
                
                {/* PROMINENT DESTAQUE ATHENA BANNER AT TOP OF MODAL */}
                <div 
                  onClick={() => setProductForm(p => ({ ...p, isFeatured: !p.isFeatured }))}
                  className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    productForm.isFeatured 
                      ? 'bg-amber-100/90 border-amber-500 shadow-xs' 
                      : 'bg-slate-50 border-slate-200 hover:border-amber-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${
                      productForm.isFeatured ? 'bg-amber-500 text-slate-950 shadow-xs' : 'bg-slate-200 text-slate-400'
                    }`}>
                      <Star className={`w-5 h-5 ${productForm.isFeatured ? 'fill-slate-950 text-slate-950' : 'text-slate-400'}`} />
                    </div>
                    <div>
                      <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                        ⭐ PRODUTO EM DESTAQUE ATHENA
                        {productForm.isFeatured && (
                          <span className="bg-amber-500 text-slate-950 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                            ATIVO NO TOPO
                          </span>
                        )}
                      </span>
                      <span className="text-[11px] text-slate-600 block mt-0.5">
                        {productForm.isFeatured 
                          ? 'Selo dourado ativo. O equipamento aparecerá nas primeiras posições do catálogo.' 
                          : 'Clique para ativar e fixar este produto no topo do catálogo com selo dourado.'}
                      </span>
                    </div>
                  </div>

                  <div className="relative inline-flex items-center shrink-0">
                    <input
                      type="checkbox"
                      checked={!!productForm.isFeatured}
                      onChange={(e) => setProductForm(p => ({ ...p, isFeatured: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-12 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                  </div>
                </div>

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

                {/* Fotos & Galeria de Imagens do Produto */}
                <div className="space-y-3 pt-2 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-xs font-bold text-slate-900 block">Fotos do Produto (Galeria & Capa)</label>
                      <p className="text-[11px] text-slate-500">Você pode adicionar múltiplas fotos para o carrossel e zoom.</p>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
                      <button
                        type="button"
                        onClick={() => setImageSourceMode('upload')}
                        className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                          imageSourceMode === 'upload' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                        }`}
                      >
                        Upload de Fotos
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageSourceMode('url')}
                        className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                          imageSourceMode === 'url' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                        }`}
                      >
                        Adicionar por URL
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
                        multiple
                        onChange={(e) => e.target.files && handleMultipleImageUpload(e.target.files)}
                        className="hidden" 
                        id="fileDropInputModal"
                      />

                      <label htmlFor="fileDropInputModal" className="cursor-pointer space-y-1 block">
                        <Upload className="w-6 h-6 mx-auto text-amber-600" />
                        <span className="text-xs font-bold text-slate-800 block">
                          Arraste e solte fotos aqui ou clique para selecionar (aceita várias)
                        </span>
                        <span className="text-[10px] text-slate-400">Arquivos JPG, PNG ou WEBP</span>
                      </label>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type="url"
                          placeholder="https://suaimagem.com/foto.jpg"
                          value={productImageUrlInput}
                          onChange={(e) => setProductImageUrlInput(e.target.value)}
                          className="form-input text-xs !pl-10"
                        />
                        <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (!productImageUrlInput.trim()) return;
                          const url = productImageUrlInput.trim();
                          setProductForm((prev) => {
                            const current = Array.isArray(prev.images) ? [...prev.images] : [];
                            const updated = current.includes(url) ? current : [...current, url];
                            return {
                              ...prev,
                              image: prev.image || url,
                              images: updated
                            };
                          });
                          setProductImageUrlInput('');
                          showNotification('Foto adicionada à galeria!', 'success');
                        }}
                        className="btn-secondary text-xs font-bold py-2 px-3 shrink-0"
                      >
                        + Adicionar Foto
                      </button>
                    </div>
                  )}

                  {/* Visual Gallery Grid Preview */}
                  {(() => {
                    const allImages = Array.from(
                      new Set([
                        ...(productForm.image ? [productForm.image] : []),
                        ...(Array.isArray(productForm.images) ? productForm.images : [])
                      ].filter(Boolean))
                    );

                    if (allImages.length === 0) return null;

                    return (
                      <div className="space-y-2 pt-2">
                        <span className="text-[11px] font-bold text-slate-600 block">
                          Galeria ({allImages.length} foto{allImages.length > 1 ? 's' : ''}):
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                          {allImages.map((imgUrl, i) => {
                            const isCover = productForm.image === imgUrl;
                            return (
                              <div 
                                key={i} 
                                className={`relative rounded-xl border p-1 bg-white flex flex-col justify-between overflow-hidden group shadow-xs ${
                                  isCover ? 'border-amber-500 ring-2 ring-amber-400/40' : 'border-slate-200'
                                }`}
                              >
                                <div className="aspect-square rounded-lg overflow-hidden bg-slate-50 flex items-center justify-center p-1 relative">
                                  <img src={imgUrl} alt={`Foto ${i + 1}`} className="max-h-full max-w-full object-contain" />
                                  {isCover && (
                                    <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-amber-500 text-white font-extrabold text-[9px] shadow-xs flex items-center gap-0.5">
                                      ⭐ Capa
                                    </span>
                                  )}
                                </div>

                                <div className="pt-1.5 flex items-center justify-between text-[10px]">
                                  {!isCover ? (
                                    <button
                                      type="button"
                                      onClick={() => setProductForm({ ...productForm, image: imgUrl })}
                                      className="text-amber-700 hover:text-amber-900 font-bold hover:underline"
                                    >
                                      Tornar Capa
                                    </button>
                                  ) : (
                                    <span className="text-slate-400 font-bold">Principal</span>
                                  )}

                                  <button
                                    type="button"
                                    onClick={() => {
                                      const remainingImages = allImages.filter(img => img !== imgUrl);
                                      setProductForm({
                                        ...productForm,
                                        image: isCover ? (remainingImages[0] || '') : productForm.image,
                                        images: remainingImages
                                      });
                                    }}
                                    className="text-red-600 hover:text-red-800 font-bold ml-auto"
                                    title="Remover esta foto"
                                  >
                                    Excluir
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}
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

                {/* SMART TECHNICAL SPECIFICATIONS MANAGER */}
                <div className="space-y-3 pt-3 border-t border-slate-200">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-amber-600" />
                        Especificações Técnicas
                      </label>
                      <p className="text-[11px] text-slate-500">Adicione itens no formato "Rótulo: Valor" para destacar na página do produto.</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleExtractSpecsFromDescription}
                        className="btn-secondary text-xs font-bold py-1.5 px-2.5 gap-1 text-amber-800 border-amber-300 bg-amber-50 hover:bg-amber-100 inline-flex items-center"
                        title="Extrair dados técnicos da descrição automaticamente"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        <span>🪄 Extrair da Descrição</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAddSpec('')}
                        className="btn-secondary text-xs font-bold py-1.5 px-2.5 gap-1 inline-flex items-center"
                      >
                        <Plus className="w-3.5 h-3.5 text-amber-600" />
                        <span>+ Nova Linha</span>
                      </button>
                    </div>
                  </div>

                  {/* Quick Suggestion Chips */}
                  <div className="space-y-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      💡 Sugestões Rápidas (Clique para adicionar):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        'Capacidade de Carga: 4.000 kg',
                        'Altura Máx. Elevação: 1.900 mm',
                        'Tempo de Elevação: 50 seg',
                        'Motor: 220V/380V Trifásico 4.0 HP',
                        'Trava de Segurança: Automática bilateral',
                        'Torque Máximo: 1.200 Nm',
                        'Display: Touchscreen 10.1" HD',
                        'Protocolos: CAN-FD, DoIP, J2534',
                        'Pressão de Trabalho: 6 a 8 Bar',
                        'Diâmetro do Aro: 10" a 24"',
                        'Garantia: 12 meses oficial'
                      ].map((sug, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleAddSpec(sug)}
                          className="px-2 py-1 rounded-lg bg-white border border-slate-200 hover:border-amber-400 text-slate-700 hover:text-amber-900 text-[10px] font-semibold transition-all hover:bg-amber-50 shadow-2xs"
                        >
                          + {sug}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Active Specs List */}
                  {productForm.specs && productForm.specs.length > 0 ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-slate-500 font-bold px-1">
                        <span>Itens Cadastrados ({productForm.specs.length}):</span>
                        <button
                          type="button"
                          onClick={() => setProductForm(prev => ({ ...prev, specs: [] }))}
                          className="text-red-600 hover:underline text-[10px]"
                        >
                          Limpar Todos
                        </button>
                      </div>

                      <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                        {productForm.specs.map((specItem, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
                            <span className="w-5 text-center text-[10px] font-bold text-slate-400 shrink-0">
                              {idx + 1}
                            </span>
                            <input
                              type="text"
                              placeholder="Ex: Capacidade de Carga: 4.000 kg"
                              value={specItem}
                              onChange={(e) => handleUpdateSpec(idx, e.target.value)}
                              className="form-input text-xs flex-1 !py-1.5 !px-2.5 border-none focus:ring-1 focus:ring-amber-500 bg-slate-50 rounded-lg font-medium text-slate-800"
                            />
                            
                            <button
                              type="button"
                              onClick={() => handleMoveSpec(idx, 'up')}
                              disabled={idx === 0}
                              className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-20"
                              title="Mover para cima"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveSpec(idx, 'down')}
                              disabled={idx === productForm.specs.length - 1}
                              className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-20"
                              title="Mover para baixo"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleRemoveSpec(idx)}
                              className="p-1.5 rounded-lg text-red-500 hover:bg-red-50"
                              title="Remover especificação"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
                      Nenhuma especificação adicionada ainda. Digite a descrição e clique em <strong>🪄 Extrair da Descrição</strong> ou use as sugestões acima.
                    </div>
                  )}
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

        {/* CATEGORY MODAL (CREATE / EDIT) */}
        {isCategoryModalOpen && canEditContent && (
          <div className="modal-backdrop" onClick={() => setIsCategoryModalOpen(false)}>
            <div className="modal-content max-w-md p-6 bg-white border-slate-200 relative" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-amber-600" />
                  {editingCategory ? `Editar Categoria "${editingCategory.name}"` : 'Criar Nova Categoria'}
                </h4>
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCategorySubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Nome da Categoria *
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Elevadores Automotivos"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                    className="form-input text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Slug / URL Amigável
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400">/categoria/</span>
                    <input
                      type="text"
                      placeholder="elevadores-automotivos"
                      value={categoryForm.slug}
                      onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                      className="form-input text-xs !pl-24 font-mono"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">Deixe vazio para gerar automaticamente a partir do nome.</span>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Descrição da Categoria
                  </label>
                  <textarea
                    placeholder="Breve descrição da linha de produtos desta categoria..."
                    value={categoryForm.description}
                    onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                    className="form-textarea text-xs h-20"
                  />
                </div>

                <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                  <button type="button" onClick={() => setIsCategoryModalOpen(false)} className="btn-secondary text-xs">
                    Cancelar
                  </button>
                  <button type="submit" className="btn-gold text-xs font-bold py-2.5 px-4 flex items-center gap-1.5">
                    <Check className="w-4 h-4" />
                    <span>{editingCategory ? 'Salvar Alterações' : 'Criar Categoria'}</span>
                  </button>
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
