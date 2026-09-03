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
  ArrowLeft,
  ArrowRight,
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
  ChevronsRight,
  ChevronDown,
  ChevronUp,
  Calculator,
  Landmark,
  QrCode,
  CreditCard,
  AlertTriangle,
  HelpCircle,
  ArrowUpDown,
  Film,
  Play,
  ExternalLink,
  Loader2,
  Gift,
  Truck,
  Zap
} from 'lucide-react';
import { formatAttachmentLabel, encodeDraftToShareableUrl, getYouTubeEmbedUrl, getVideoEmbedInfo } from '../pages/ProductDetailPage';
import PdfCatalogGenerator from './PdfCatalogGenerator';
import RichTextEditor from './RichTextEditor';
import FormattedDescription from './FormattedDescription';
import CouponManager from './CouponManager';
import { safeStorageSet, saveSession } from '../utils/storage';
import { calculateInstallments, calculatePaymentGateways, formatBRL } from '../utils/installmentCalculator';
import { cleanAlphanumeric, normalizeSearchText } from '../utils/productSearch';

/**
 * Searchable Combobox Component (Filtragem em tempo real com busca e fallback completo)
 */
/**
 * Searchable Combobox Component (Filtragem em tempo real com busca flexível e suporte a imagens)
 */
function SearchableSelect({
  label,
  value,
  onChange,
  options = [],
  placeholder = 'Selecione uma opção...',
  onAddNew,
  addNewLabel = 'Nova',
  colorTheme = 'amber',
  required = false
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = React.useRef(null);
  const inputRef = React.useRef(null);

  const getOptId = (opt) => (opt?.id !== undefined ? opt.id : (opt?.value !== undefined ? opt.value : ''));
  const getOptName = (opt) => (opt?.name !== undefined ? opt.name : (opt?.label !== undefined ? opt.label : String(opt || '')));

  const selectedOption = options.find((opt) => getOptId(opt) === value);

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  // Focus input automatically when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Normalize string to ignore accents and uppercase/lowercase
  const normalize = (str) =>
    (str || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const cleanAlphanumeric = (str) =>
    (str || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '');

  const filteredOptions = searchTerm.trim() === ''
    ? options
    : options.filter((opt) => {
        const query = normalize(searchTerm);
        const cleanQuery = cleanAlphanumeric(searchTerm);

        const name = normalize(getOptName(opt));
        const cleanName = cleanAlphanumeric(getOptName(opt));
        const sku = normalize(opt.sku || '');
        const cleanSku = cleanAlphanumeric(opt.sku || '');
        const brand = normalize(opt.brand || '');
        const category = normalize(opt.category || '');
        const slug = normalize(opt.slug || '');
        const id = normalize(String(getOptId(opt)));

        return (
          name.includes(query) ||
          cleanName.includes(cleanQuery) ||
          sku.includes(query) ||
          cleanSku.includes(cleanQuery) ||
          brand.includes(query) ||
          category.includes(query) ||
          slug.includes(query) ||
          id.includes(query)
        );
      });

  const MAX_DISPLAY_ITEMS = 30;
  const displayedOptions = filteredOptions.slice(0, MAX_DISPLAY_ITEMS);

  const isAmber = colorTheme === 'amber';
  const themeText = isAmber ? 'text-amber-700 hover:text-amber-900' : 'text-sky-700 hover:text-sky-900';
  const themeActiveBg = isAmber ? 'bg-amber-50 text-amber-900 font-bold' : 'bg-sky-50 text-sky-900 font-bold';
  const themeBorderFocus = isAmber ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-sky-500 ring-2 ring-sky-500/20';

  return (
    <div className="relative" ref={containerRef}>
      {/* Header Label and Quick Creation Trigger */}
      {label && (
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs font-bold text-slate-700">{label}</label>
          {onAddNew && (
            <button
              type="button"
              onClick={onAddNew}
              className={`text-[11px] ${themeText} font-bold hover:underline flex items-center gap-0.5 cursor-pointer`}
            >
              <Plus className="w-3 h-3" /> {addNewLabel}
            </button>
          )}
        </div>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full min-h-[38px] bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs flex items-center justify-between gap-2 text-left cursor-pointer transition-all hover:bg-white hover:border-slate-300 ${
          isOpen ? `bg-white ${themeBorderFocus} shadow-xs` : ''
        }`}
      >
        <div className="flex items-center gap-2 truncate">
          {selectedOption ? (
            <span className="font-semibold text-slate-900 truncate">
              {getOptName(selectedOption)}
            </span>
          ) : (
            <span className="text-slate-400 font-medium">{placeholder}</span>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0 text-slate-400">
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${
              isOpen ? (isAmber ? 'rotate-180 text-amber-600' : 'rotate-180 text-sky-600') : ''
            }`}
          />
        </div>
      </button>

      {/* Hidden input for HTML5 form validation */}
      {required && (
        <input
          type="text"
          value={value || ''}
          required
          onChange={() => {}}
          className="sr-only"
          tabIndex={-1}
        />
      )}

      {/* Floating Options Dropdown with Real-time Filtering */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-2xl border border-slate-200 shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Search Input Filter Bar */}
          <div className="p-2 border-b border-slate-100 bg-slate-50/90">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Digitar para filtrar opções..."
                className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-7 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-500"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setIsOpen(false);
                    setSearchTerm('');
                  } else if (e.key === 'Enter' && filteredOptions.length === 1) {
                    e.preventDefault();
                    onChange(getOptId(filteredOptions[0]));
                    setIsOpen(false);
                    setSearchTerm('');
                  }
                }}
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSearchTerm('');
                    if (inputRef.current) inputRef.current.focus();
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Options List */}
          <div className="max-h-60 overflow-y-auto p-1 divide-y divide-slate-50">
            {displayedOptions.length > 0 ? (
              displayedOptions.map((opt) => {
                const optId = getOptId(opt);
                const optName = getOptName(opt);
                const isSelected = optId === value;
                return (
                  <div
                    key={optId}
                    onClick={() => {
                      onChange(optId);
                      setIsOpen(false);
                      setSearchTerm('');
                    }}
                    className={`px-3 py-2.5 rounded-xl text-xs flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                      isSelected
                        ? themeActiveBg
                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {opt.image && (
                        <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 p-0.5 shrink-0 overflow-hidden flex items-center justify-center">
                          <img src={opt.image} alt="" className="w-full h-full object-contain" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <span className="truncate font-bold block text-slate-900">{optName}</span>
                        {(opt.brand || opt.category || opt.sku) && (
                          <span className="text-[10px] text-slate-500 truncate block font-normal">
                            {[opt.brand, opt.category, opt.sku ? `SKU: ${opt.sku}` : null].filter(Boolean).join(' • ')}
                          </span>
                        )}
                      </div>
                    </div>
                    {isSelected && (
                      <Check
                        className={`w-3.5 h-3.5 shrink-0 ${
                          isAmber ? 'text-amber-600' : 'text-sky-600'
                        }`}
                      />
                    )}
                  </div>
                );
              })
            ) : (
              <div className="p-4 text-center space-y-2">
                <p className="text-xs text-slate-500">
                  Nenhum item encontrado para "<strong>{searchTerm}</strong>"
                </p>
                {onAddNew && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      onAddNew();
                    }}
                    className={`inline-flex items-center gap-1 text-xs font-bold ${themeText} hover:underline`}
                  >
                    <Plus className="w-3.5 h-3.5" /> Criar nova opção
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Footer with options count */}
          <div className="px-3 py-1.5 bg-slate-50 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between">
            <span>
              {filteredOptions.length > MAX_DISPLAY_ITEMS 
                ? `Exibindo 30 de ${filteredOptions.length} itens (digite para filtrar)`
                : `${filteredOptions.length} de ${options.length} ${options.length === 1 ? 'opção' : 'opções'}`
              }
            </span>
            {searchTerm && (
              <span className={isAmber ? 'text-amber-600 font-medium' : 'text-sky-600 font-medium'}>
                Filtro: "{searchTerm}"
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Radial / Circular Progress Indicator (Shopify-style live upload spinner)
 */
function RadialProgressCircle({ progress = 0, size = 48, strokeWidth = 4 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const validProgress = Math.min(100, Math.max(0, progress));
  const strokeDashoffset = circumference - (validProgress / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="w-full h-full -rotate-90 transform" viewBox={`0 0 ${size} ${size}`}>
        {/* Background track circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.25)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Animated fill circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#f59e0b"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-200 ease-out"
        />
      </svg>
      <span className="absolute text-[11px] font-black text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
        {Math.round(validProgress)}%
      </span>
    </div>
  );
}

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

  // Authorization Headers helper
  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    ...(currentUser?.token ? { 'Authorization': `Bearer ${currentUser.token}` } : {})
  });

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
      const res = await fetch(`${API_BASE_URL}/users`, {
        headers: getAuthHeaders()
      });
      if (res.status === 401 || res.status === 403) {
        onLogout && onLogout('Sua sessão expirou no servidor.');
        return;
      }
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
  const [adminSortField, setAdminSortField] = useState('name');
  const [adminSortDirection, setAdminSortDirection] = useState('asc');

  const handleAdminSort = (field) => {
    if (adminSortField === field) {
      setAdminSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setAdminSortField(field);
      setAdminSortDirection('asc');
    }
    setAdminPage(1);
  };

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
      aPoints: '',
      productType: 'physical',
      badge: '',
      status: 'published',
      isFeatured: false,
      image: '',
      images: [],
      altText: '',
      description: '',
      specs: ['Elevada resistência e durabilidade', 'Manual e certificado inclusos', 'Garantia de fábrica'],
      attachments: [],
      videoUrl: '',
      customTabs: [],
      compatibleProductIds: []
    }
  );

  // Modal History Stack for navigating between related products
  const [productModalHistory, setProductModalHistory] = useState([]);

  const navigateToProductInModal = (targetProduct) => {
    if (!targetProduct) return;
    setProductModalHistory(prev => [...prev, { form: { ...productForm }, editing: editingProduct }]);
    setEditingProduct(targetProduct);
    setProductForm({
      ...targetProduct,
      aPoints: targetProduct.aPoints != null ? targetProduct.aPoints : '',
      isFeatured: !!targetProduct.isFeatured,
      productType: targetProduct.productType || 'physical',
      images: Array.isArray(targetProduct.images) ? [...targetProduct.images] : (targetProduct.image ? [targetProduct.image] : []),
      specs: Array.isArray(targetProduct.specs) ? [...targetProduct.specs] : [],
      attachments: Array.isArray(targetProduct.attachments) ? [...targetProduct.attachments] : [],
      videoUrl: targetProduct.videoUrl || targetProduct.youtubeVideoUrl || '',
      customTabs: Array.isArray(targetProduct.customTabs) ? [...targetProduct.customTabs] : [],
      compatibleProductIds: Array.isArray(targetProduct.compatibleProductIds) ? [...targetProduct.compatibleProductIds] : []
    });

    const modalForm = document.getElementById('productMainForm');
    if (modalForm) {
      modalForm.scrollTop = 0;
    }
    showNotification(`Abrindo "${targetProduct.name}" no modal de edição.`, 'info');
  };

  const navigateBackInProductModal = () => {
    if (productModalHistory.length === 0) return;
    const prevEntry = productModalHistory[productModalHistory.length - 1];
    setProductModalHistory(prev => prev.slice(0, -1));
    setEditingProduct(prevEntry.editing || null);
    setProductForm(prevEntry.form);

    const modalForm = document.getElementById('productMainForm');
    if (modalForm) {
      modalForm.scrollTop = 0;
    }
    showNotification(`Retornando para "${prevEntry.form?.name || 'Equipamento Anterior'}".`, 'info');
  };

  // Attachment Form State (Upload vs Direct URL)
  const [newAttachmentForm, setNewAttachmentForm] = useState({
    title: '',
    url: '',
    mode: 'url' // 'url' | 'upload'
  });

  // State for Editing Existing Attachment / PDF
  const [editingAttachmentId, setEditingAttachmentId] = useState(null);
  const [editingAttachmentForm, setEditingAttachmentForm] = useState({
    title: '',
    url: '',
    mode: 'url',
    fileName: '',
    fileSize: ''
  });

  // Quick Category Modal State
  const [isQuickCatModalOpen, setIsQuickCatModalOpen] = useState(false);
  const [quickCatName, setQuickCatName] = useState('');

  // Live Gateway Price Simulation Visibility
  const [showPriceSimulations, setShowPriceSimulations] = useState(false);
  const [priceSimulationTab, setPriceSimulationTab] = useState('credit');

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
  const [previewingImage, setPreviewingImage] = useState(null);

  // Shopify-style image upload queue & progress state
  const [uploadingImages, setUploadingImages] = useState([]);
  const isUploadingImages = uploadingImages.length > 0;
  const gallerySectionRef = React.useRef(null);
  const specsSectionRef = React.useRef(null);

  const scrollToGallery = () => {
    if (gallerySectionRef.current) {
      gallerySectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const scrollToSpecs = () => {
    if (specsSectionRef.current) {
      specsSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Custom Confirmation Modal Popup State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Sim, Confirmar',
    cancelText: 'Cancelar',
    type: 'danger',
    onConfirm: null
  });

  const isAnyModalOpen = isProductModalOpen || isPdfModalOpen || isCategoryModalOpen || isBrandModalOpen || isUserModalOpen || isQuickCatModalOpen || confirmModal?.isOpen || !!previewingImage;

  // Background body scroll lock while any modal is open
  useEffect(() => {
    if (isAnyModalOpen) {
      const orig = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = orig;
      };
    }
  }, [isAnyModalOpen]);

  useEffect(() => {
    const shouldReopen = sessionStorage.getItem('athena_reopen_editor');
    if (shouldReopen === 'true') {
      sessionStorage.removeItem('athena_reopen_editor');
      try {
        const savedDraft = sessionStorage.getItem('athena_preview_draft_product');
        if (savedDraft) {
          const draft = JSON.parse(savedDraft);
          setProductForm(draft);
          setIsProductModalOpen(true);
        }
      } catch (e) {}
    }
  }, []);

  const askConfirmation = ({
    title,
    message,
    confirmText = 'Sim, Confirmar',
    cancelText = 'Cancelar',
    type = 'danger',
    onConfirm
  }) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      confirmText,
      cancelText,
      type,
      onConfirm
    });
  };

  const closeConfirmation = () => {
    setConfirmModal(prev => ({ ...prev, isOpen: false, onConfirm: null }));
  };

  // Revogar Acesso de Usuário / Funcionário
  const handleDeleteUser = (userId, userName) => {
    askConfirmation({
      title: 'Revogar Acesso do Usuário?',
      message: `Tem certeza que deseja revogar o acesso de "${userName}"? Ele não poderá mais fazer login no painel administrativo.`,
      confirmText: 'Sim, Revogar Acesso',
      type: 'danger',
      onConfirm: async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/users/${userId}`, { 
            method: 'DELETE',
            headers: getAuthHeaders()
          });
          if (res.status === 401 || res.status === 403) {
            onLogout && onLogout('Sua sessão expirou.');
            return;
          }
          if (res.ok) {
            showNotification(`Acesso de ${userName} revogado com sucesso.`, 'success');
            setUsersList(prev => prev.filter(u => u.id !== userId));
          } else {
            showNotification('Erro ao remover usuário.', 'error');
          }
        } catch (err) {
          showNotification('Erro de conexão ao remover usuário.', 'error');
        }
      }
    });
  };

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
    setProductModalHistory([]);
    setEditingProduct(null);
    setProductForm({
      name: '',
      slug: '',
      categoryId: categories[0]?.id || '',
      brandId: brands[0]?.id || '',
      price: '',
      priceNegotiable: true,
      aPoints: '',
      productType: 'physical',
      badge: '',
      status: 'published',
      isFeatured: false,
      image: '',
      images: [],
      altText: '',
      description: '',
      specs: [],
      attachments: [],
      videoUrl: '',
      customTabs: [],
      compatibleProductIds: []
    });
    setNewAttachmentForm({ title: '', url: '', mode: 'url' });
    setIsProductModalOpen(true);
  };

  const openEditProductModal = (product) => {
    setProductModalHistory([]);
    setEditingProduct(product);
    setProductForm({
      ...product,
      aPoints: product.aPoints != null ? product.aPoints : '',
      isFeatured: !!product.isFeatured,
      productType: product.productType || 'physical',
      images: Array.isArray(product.images) ? [...product.images] : (product.image ? [product.image] : []),
      specs: Array.isArray(product.specs) ? [...product.specs] : [],
      attachments: Array.isArray(product.attachments) ? [...product.attachments] : [],
      videoUrl: product.videoUrl || product.youtubeVideoUrl || '',
      customTabs: Array.isArray(product.customTabs) ? [...product.customTabs] : [],
      compatibleProductIds: Array.isArray(product.compatibleProductIds) ? [...product.compatibleProductIds] : []
    });
    setNewAttachmentForm({ title: '', url: '', mode: 'url' });
    setIsProductModalOpen(true);
  };

  // Smart Section Extractor from Description
  // Known Section Categories & Canonical Titles
  const KNOWN_SECTION_CATEGORIES = [
    {
      canonical: 'Especificações Técnicas',
      isSpecs: true,
      keywords: [
        'especificações técnicas', 'especificacoes tecnicas', 'especificações', 'especificacoes',
        'especificação', 'especificacao', 'dados técnicos', 'dados tecnicos', 'ficha técnica',
        'ficha tecnica', 'características técnicas', 'caracteristicas tecnicas', 'especificações do produto'
      ]
    },
    {
      canonical: 'Acessórios & Itens Compatíveis',
      isCompatibility: true,
      keywords: [
        'acessórios & itens compatíveis', 'acessorios & itens compativeis',
        'acessórios e itens compatíveis', 'acessorios e itens compativeis',
        'compatibilidade', 'compatibilidades', 'máquinas compatíveis', 'maquinas compativeis',
        'equipamentos compatíveis', 'equipamentos compativeis', 'acessórios compatíveis',
        'acessorios compativeis', 'montadoras e sistemas compatíveis', 'montadoras e sistemas compativeis',
        'montadoras compatíveis', 'montadoras compativeis', 'veículos compatíveis', 'veiculos compativeis',
        'veículos atendidos', 'veiculos atendidos', 'modelos compatíveis', 'modelos compativeis'
      ]
    },
    { canonical: 'Diferenciais', keywords: ['diferenciais', 'diferencial', 'vantagens', 'vantagem', 'benefícios', 'beneficios', 'pontos fortes', 'destaques', 'por que escolher'] },
    { canonical: 'Aplicações', keywords: ['aplicações', 'aplicacoes', 'aplicação', 'aplicacao', 'indicação de uso', 'indicacao de uso', 'onde usar', 'utilização', 'utilizacao', 'aplicabilidade'] },
    { canonical: 'Funções & Recursos', keywords: ['funções e recursos', 'funções & recursos', 'funções', 'funcoes', 'função', 'funcao', 'recursos', 'recurso', 'características', 'caracteristicas', 'funcionamento', 'principais funções', 'tecnologia', 'sistema de operação'] },
    { canonical: 'Itens Inclusos', keywords: ['itens inclusos', 'item incluso', 'acessórios inclusos', 'acessorios inclusos', 'o que acompanha', 'conteúdo da embalagem', 'conteudo da embalagem', 'composição', 'composicao', 'acompanha', 'inclusos'] },
    { canonical: 'Requisitos de Instalação', keywords: ['requisitos de instalação', 'requisitos de instalacao', 'requisitos', 'instalação', 'instalacao', 'infraestrutura', 'exigências', 'exigencias', 'espaço necessário', 'especificações de instalação', 'preparação'] },
    { canonical: 'Garantia & Suporte', keywords: ['garantia e suporte', 'garantia & suporte', 'garantia', 'suporte e garantia', 'assistência técnica', 'assistencia tecnica', 'certificação', 'certificacao', 'homologação', 'homologacao'] },
    { canonical: 'Importante', keywords: ['importante', 'observações', 'observacoes', 'observação', 'observacao', 'atenção', 'atencao', 'aviso', 'avisos', 'requisitos e avisos', 'nota', 'notas', 'informações importantes', 'informacoes importantes'] }
  ];

  // Helper to determine if a line is a section header (100% linear, zero regex catastrophic backtracking)
  const isLineASectionHeader = (line) => {
    if (!line) return null;
    const trimmed = line.trim();
    if (!trimmed || trimmed.length > 80) return null;

    // Never treat a bullet point or numbered item as a section header
    if (/^[•\-\*\+]\s+/.test(trimmed) || /^\d+[\.\)]\s+/.test(trimmed)) {
      return null;
    }

    const isMdHeading = /^#{1,6}\s+/.test(trimmed);
    const clean = trimmed
      .replace(/^#{1,6}\s*/, '')
      .replace(/^\*{1,2}/, '')
      .replace(/\*{1,2}$/, '')
      .trim();

    const cleanNoColon = clean.replace(/[:\-–—]+$/, '').trim();
    if (!cleanNoColon || cleanNoColon.length < 2) return null;

    const lower = cleanNoColon.toLowerCase();
    if (['descrição', 'descricao', 'foto', 'fotos', 'preço', 'preco'].includes(lower)) {
      return null;
    }

    // Match known category keywords
    for (const cat of KNOWN_SECTION_CATEGORIES) {
      if (cat.keywords.some(k => lower === k || lower.startsWith(k) || (k.length > 4 && lower.includes(k)))) {
        return {
          title: cat.canonical,
          isSpecs: !!cat.isSpecs,
          isCompatibility: !!cat.isCompatibility,
          rawHeader: line
        };
      }
    }

    // Custom headers ending with colon or starting with markdown hash
    if (isMdHeading || trimmed.endsWith(':')) {
      if (cleanNoColon.length <= 50 && !cleanNoColon.includes('.')) {
        const formatted = cleanNoColon.charAt(0).toUpperCase() + cleanNoColon.slice(1);
        return {
          title: formatted,
          isSpecs: formatted.toLowerCase().includes('especif'),
          isCompatibility: formatted.toLowerCase().includes('compatib'),
          rawHeader: line
        };
      }
    }

    return null;
  };

  // Linear line-by-line parser for structured descriptions
  const parseDescriptionSections = (rawDescription = '') => {
    if (!rawDescription || !rawDescription.trim()) return { intro: '', sections: [] };

    const lines = rawDescription.split(/\r?\n/);
    const sections = [];
    let currentSection = null;
    const introLines = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const headerInfo = isLineASectionHeader(line);

      if (headerInfo) {
        if (currentSection) {
          sections.push(currentSection);
        }
        currentSection = {
          title: headerInfo.title,
          isSpecsSection: headerInfo.isSpecs,
          isCompatibility: headerInfo.isCompatibility,
          rawHeader: headerInfo.rawHeader,
          lines: []
        };
      } else {
        if (currentSection) {
          currentSection.lines.push(line);
        } else {
          introLines.push(line);
        }
      }
    }

    if (currentSection) {
      sections.push(currentSection);
    }

    const formattedSections = sections.map(sec => {
      const cleanLines = sec.lines.map(l => l.trim()).filter(Boolean);
      const formattedLines = cleanLines.map(l => l.startsWith('-') || l.startsWith('•') || l.startsWith('*') ? l : `- ${l}`);
      return {
        title: sec.title,
        isSpecsSection: sec.isSpecsSection,
        isCompatibility: sec.isCompatibility,
        content: formattedLines.join('\n'),
        rawLines: cleanLines,
        lineCount: cleanLines.length
      };
    }).filter(s => s.lineCount > 0);

    return {
      intro: introLines.join('\n').trim(),
      sections: formattedSections
    };
  };

  const extractSectionFromDescription = (rawDescription = '', targetSectionTitle = '') => {
    if (!rawDescription || !targetSectionTitle) {
      return { extractedContent: '', updatedDescription: rawDescription, found: false };
    }

    const parsed = parseDescriptionSections(rawDescription);
    const targetLower = targetSectionTitle.toLowerCase().trim();
    const matched = parsed.sections.find(s => s.title.toLowerCase().trim() === targetLower);

    if (!matched) {
      return { extractedContent: '', updatedDescription: rawDescription, found: false };
    }

    const remainingSections = parsed.sections.filter(s => s !== matched);
    let updatedDesc = parsed.intro;

    for (const s of remainingSections) {
      updatedDesc += (updatedDesc ? '\n\n' : '') + `${s.title}:\n` + s.rawLines.map(l => (l.startsWith('•') || l.startsWith('-') ? l : `• ${l}`)).join('\n');
    }

    return {
      extractedContent: matched.content,
      updatedDescription: updatedDesc.trim(),
      found: true
    };
  };

  const autoLinkCompatibleProductsInContent = (rawText, catalogProducts = []) => {
    if (!rawText || !Array.isArray(catalogProducts) || catalogProducts.length === 0) {
      return { text: rawText, matchedIds: [] };
    }

    const matchedIds = [];
    let updatedText = rawText;

    for (const prod of catalogProducts) {
      if (!prod || !prod.name) continue;
      if (prod.id === productForm.id || (editingProduct && prod.id === editingProduct.id)) continue;

      const name = prod.name.trim();
      const codeMatches = (name.match(/\b([A-Za-z0-9]{2,6}-[A-Za-z0-9]{2,6})\b/g) || []);
      const candidates = [name, ...codeMatches];

      for (const candidate of candidates) {
        if (!candidate || candidate.length < 4) continue;
        const escaped = candidate.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`\\b(${escaped})\\b`, 'i');
        
        if (regex.test(updatedText)) {
          if (!matchedIds.includes(prod.id)) matchedIds.push(prod.id);
          if (!updatedText.includes(`/produto/${prod.slug || prod.id}`)) {
            updatedText = updatedText.replace(regex, `[${prod.name}](/produto/${prod.slug || prod.id})`);
          }
          break;
        }
      }
    }

    return { text: updatedText, matchedIds };
  };

  const detectAllSectionsInDescription = (rawDescription = '', currentCustomTabs = [], currentSpecs = []) => {
    if (!rawDescription || !rawDescription.trim()) return [];

    const parsed = parseDescriptionSections(rawDescription);
    return parsed.sections.map(sec => {
      const isAlreadyAdded = sec.isSpecsSection
        ? (Array.isArray(currentSpecs) && currentSpecs.length > 0)
        : (currentCustomTabs || []).some(
            t => t.title && t.title.toLowerCase().trim() === sec.title.toLowerCase().trim()
          );

      return {
        ...sec,
        isAlreadyAdded
      };
    });
  };

  const handleExtractToSpecs = (item) => {
    if (!item) return;
    const rawLines = item.rawLines || item.content.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const cleaned = rawLines.map(l => l.replace(/^[•\-\*–—\d+\.\)]+\s*/, '').trim()).filter(Boolean);

    if (cleaned.length === 0) {
      showNotification('Nenhuma linha de especificação válida foi identificada no texto.', 'info');
      return;
    }

    const res = extractSectionFromDescription(productForm.description, item.title);
    const workingDesc = res.found ? res.updatedDescription : productForm.description;

    setProductForm(prev => ({
      ...prev,
      description: workingDesc,
      specs: cleaned
    }));

    showNotification(`${cleaned.length} especificações técnicas cadastradas no local correto e removidas da descrição!`, 'success');

    setTimeout(() => {
      scrollToSpecs();
    }, 80);
  };

  const handleExtractAllDetectedTabs = () => {
    const detected = detectAllSectionsInDescription(productForm.description, productForm.customTabs, productForm.specs);
    const unadded = detected.filter(d => !d.isAlreadyAdded);
    if (unadded.length === 0) {
      showNotification('Nenhuma nova seção estruturada encontrada na descrição.', 'info');
      return;
    }

    const parsed = parseDescriptionSections(productForm.description);
    const newTabs = [...(productForm.customTabs || [])];
    let newSpecs = Array.isArray(productForm.specs) ? [...productForm.specs] : [];
    let newCompatibleIds = Array.isArray(productForm.compatibleProductIds) ? [...productForm.compatibleProductIds] : [];
    let specsAddedCount = 0;
    let tabsAddedCount = 0;

    for (const item of unadded) {
      if (item.isSpecsSection) {
        const cleaned = item.rawLines.map(l => l.replace(/^[•\-\*–—\d+\.\)]+\s*/, '').trim()).filter(Boolean);
        newSpecs = cleaned;
        specsAddedCount = cleaned.length;
      } else {
        let contentToUse = item.content;
        if (item.isCompatibility || item.title === 'Acessórios & Itens Compatíveis') {
          const linkResult = autoLinkCompatibleProductsInContent(contentToUse, products);
          contentToUse = linkResult.text;
          newCompatibleIds = Array.from(new Set([...newCompatibleIds, ...linkResult.matchedIds]));
        }

        newTabs.push({
          id: `tab_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          title: item.title,
          content: contentToUse
        });
        tabsAddedCount++;
      }
    }

    const extractedTitles = unadded.map(u => u.title.toLowerCase().trim());
    const remainingSections = parsed.sections.filter(s => !extractedTitles.includes(s.title.toLowerCase().trim()));

    let updatedDesc = parsed.intro;
    for (const s of remainingSections) {
      updatedDesc += (updatedDesc ? '\n\n' : '') + `${s.title}:\n` + s.rawLines.map(l => (l.startsWith('•') || l.startsWith('-') ? l : `• ${l}`)).join('\n');
    }

    setProductForm(prev => ({
      ...prev,
      description: updatedDesc.trim(),
      specs: newSpecs,
      customTabs: newTabs,
      compatibleProductIds: newCompatibleIds
    }));

    showNotification(
      `Inteligência aplicada: ${specsAddedCount > 0 ? `${specsAddedCount} especificações tabuladas e ` : ''}${tabsAddedCount} abas criadas com sucesso!`,
      'success'
    );
  };

  // Custom Tabs Helpers & Reordering
  const handleAddCustomTab = (title = 'Nova Seção', tryAutoExtract = true) => {
    let initialContent = '';
    let updatedDesc = productForm.description;
    let newCompatibleIds = Array.isArray(productForm.compatibleProductIds) ? [...productForm.compatibleProductIds] : [];

    if (tryAutoExtract && productForm.description && productForm.description.trim()) {
      const result = extractSectionFromDescription(productForm.description, title);
      if (result.found && result.extractedContent) {
        initialContent = result.extractedContent;
        updatedDesc = result.updatedDescription;
        
        if (title === 'Acessórios & Itens Compatíveis') {
          const linkResult = autoLinkCompatibleProductsInContent(initialContent, products);
          initialContent = linkResult.text;
          newCompatibleIds = Array.from(new Set([...newCompatibleIds, ...linkResult.matchedIds]));
        }

        showNotification(`Aba "${title}" criada com conteúdo extraído da descrição!`, 'success');
      }
    }

    const newTab = {
      id: `tab_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      title: title,
      content: initialContent
    };

    setProductForm(prev => ({
      ...prev,
      description: updatedDesc,
      customTabs: [...(prev.customTabs || []), newTab],
      compatibleProductIds: newCompatibleIds
    }));
  };

  // Reorder Custom Tabs (Move Up / Down)
  const handleMoveCustomTab = (index, direction) => {
    const currentTabs = Array.isArray(productForm.customTabs) ? [...productForm.customTabs] : [];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentTabs.length) return;

    const [moved] = currentTabs.splice(index, 1);
    currentTabs.splice(targetIndex, 0, moved);

    setProductForm(prev => ({
      ...prev,
      customTabs: currentTabs
    }));
  };

  // Helper to detect if a custom tab contains technical specifications
  const isSpecsCustomTab = (tab) => {
    if (!tab) return false;
    const title = (tab.title || '').toLowerCase().trim();
    const keywords = [
      'especif', 'dados tecnic', 'dados técnic', 'ficha tecnic', 'ficha técnic', 
      'caracteristicas tecnic', 'características técnic', 'detalhes tecnic', 'detalhes técnic'
    ];
    if (keywords.some(k => title.includes(k))) return true;

    // Check if majority of non-empty lines follow 'Label: Value' pattern
    if (tab.content && typeof tab.content === 'string') {
      const lines = tab.content.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      const withColon = lines.filter(l => l.includes(':'));
      if (lines.length >= 2 && withColon.length >= Math.ceil(lines.length * 0.5)) {
        return true;
      }
    }
    return false;
  };

  // Convert an existing generic custom tab into structured key-value Specs
  const handleConvertTabToSpecs = (tabId) => {
    const tab = (productForm.customTabs || []).find(t => t.id === tabId);
    if (!tab || !tab.content) return;

    const lines = tab.content
      .split(/\r?\n/)
      .map(l => l.replace(/^[•\-\*–—\d+\.\)]+\s*/, '').trim())
      .filter(Boolean);

    if (lines.length === 0) {
      showNotification('A aba selecionada não contém linhas de texto para cadastrar.', 'info');
      return;
    }

    setProductForm(prev => ({
      ...prev,
      specs: lines, // Registers all lines cleanly in the structured specs
      customTabs: (prev.customTabs || []).filter(t => t.id !== tabId)
    }));

    showNotification(`${lines.length} especificações técnicas cadastradas no local correto e aba removida com sucesso!`, 'success');

    // Smoothly focus/scroll to the Specifications Card
    setTimeout(() => {
      scrollToSpecs();
    }, 80);
  };

  const handleExtractTabContentFromDescription = (tabId, tabTitle) => {
    if (!productForm.description || !productForm.description.trim()) {
      showNotification('A descrição principal do produto está vazia.', 'info');
      return;
    }

    const result = extractSectionFromDescription(productForm.description, tabTitle);

    if (result.found && result.extractedContent) {
      setProductForm(prev => {
        const updatedTabs = (prev.customTabs || []).map(t => {
          if (t.id === tabId) {
            const newContent = t.content && t.content.trim() 
              ? `${t.content.trim()}\n\n${result.extractedContent}` 
              : result.extractedContent;
            return { ...t, content: newContent };
          }
          return t;
        });

        return {
          ...prev,
          description: result.updatedDescription,
          customTabs: updatedTabs
        };
      });

      showNotification(`Conteúdo de "${tabTitle}" extraído e removido da descrição!`, 'success');
    } else {
      showNotification(`Não encontramos um bloco com o tema "${tabTitle}" na descrição. Você pode digitar ou colar diretamente.`, 'info');
    }
  };

  const handleUpdateCustomTab = (id, field, value) => {
    setProductForm(prev => ({
      ...prev,
      customTabs: (prev.customTabs || []).map(t => t.id === id ? { ...t, [field]: value } : t)
    }));
  };

  const handleRemoveCustomTab = (id) => {
    setProductForm(prev => ({
      ...prev,
      customTabs: (prev.customTabs || []).filter(t => t.id !== id)
    }));
  };

  // Attachments & PDFs Helpers (Upload + Direct Link with Custom Name)
  const handleAddAttachmentSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!newAttachmentForm.url.trim()) {
      showNotification('Insira a URL do arquivo PDF ou faça o upload.', 'error');
      return;
    }
    const cleanUrl = newAttachmentForm.url.trim();
    const extractedFileName = cleanUrl.split('/').pop().split('?')[0] || 'documento.pdf';
    const displayTitle = newAttachmentForm.title.trim() || formatAttachmentLabel(extractedFileName);

    const newAtt = {
      id: `att_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      title: displayTitle,
      name: displayTitle,
      fileName: extractedFileName,
      url: cleanUrl,
      fileSize: newAttachmentForm.fileSize || 'PDF'
    };

    setProductForm(prev => ({
      ...prev,
      attachments: [...(prev.attachments || []), newAtt]
    }));

    setNewAttachmentForm({ title: '', url: '', mode: 'url' });
    showNotification(`PDF "${displayTitle}" adicionado com sucesso!`, 'success');
  };

  const handleAttachmentFileUpload = (file) => {
    if (!file) return;
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      showNotification('Por favor, selecione um arquivo no formato PDF.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target.result;
      const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
      const sizeStr = sizeInMB > 0 ? `${sizeInMB} MB` : `${Math.round(file.size / 1024)} KB`;
      const autoTitle = formatAttachmentLabel(file.name);
      const displayTitle = newAttachmentForm.title.trim() || autoTitle;

      const newAtt = {
        id: `att_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        title: displayTitle,
        name: displayTitle,
        fileName: file.name,
        url: base64Url,
        fileSize: sizeStr
      };

      setProductForm(prev => ({
        ...prev,
        attachments: [...(prev.attachments || []), newAtt]
      }));

      setNewAttachmentForm({ title: '', url: '', mode: 'upload' });
      showNotification(`PDF "${displayTitle}" anexado com sucesso!`, 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAttachment = (attId) => {
    setProductForm(prev => ({
      ...prev,
      attachments: (prev.attachments || []).filter(a => a.id !== attId)
    }));
    if (editingAttachmentId === attId) {
      setEditingAttachmentId(null);
    }
  };

  const handleStartEditAttachment = (att) => {
    setEditingAttachmentId(att.id);
    setEditingAttachmentForm({
      title: att.title || att.name || '',
      url: att.url || '',
      mode: att.url?.startsWith('data:') ? 'upload' : 'url',
      fileName: att.fileName || '',
      fileSize: att.fileSize || 'PDF'
    });
  };

  const handleSaveEditAttachment = (attId) => {
    if (!editingAttachmentForm.url || !editingAttachmentForm.url.trim()) {
      showNotification('Insira a URL do arquivo PDF ou faça o upload.', 'error');
      return;
    }
    const cleanUrl = editingAttachmentForm.url.trim();
    const extractedFileName = cleanUrl.split('/').pop().split('?')[0] || editingAttachmentForm.fileName || 'documento.pdf';
    const displayTitle = editingAttachmentForm.title?.trim() || formatAttachmentLabel(extractedFileName);

    setProductForm(prev => ({
      ...prev,
      attachments: (prev.attachments || []).map(a => {
        if (a.id === attId) {
          return {
            ...a,
            title: displayTitle,
            name: displayTitle,
            fileName: editingAttachmentForm.fileName || extractedFileName,
            url: cleanUrl,
            fileSize: editingAttachmentForm.fileSize || a.fileSize || 'PDF'
          };
        }
        return a;
      })
    }));

    setEditingAttachmentId(null);
    showNotification(`PDF "${displayTitle}" atualizado com sucesso!`, 'success');
  };

  const handleEditAttachmentFileUpload = (file) => {
    if (!file) return;
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      showNotification('Por favor, selecione um arquivo no formato PDF.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target.result;
      const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
      const sizeStr = sizeInMB > 0 ? `${sizeInMB} MB` : `${Math.round(file.size / 1024)} KB`;
      const autoTitle = formatAttachmentLabel(file.name);

      setEditingAttachmentForm(prev => ({
        ...prev,
        title: prev.title || autoTitle,
        fileName: file.name,
        url: base64Url,
        fileSize: sizeStr
      }));

      showNotification(`Arquivo PDF "${file.name}" carregado.`, 'info');
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateAttachmentTitle = (attId, newTitle) => {
    setProductForm(prev => ({
      ...prev,
      attachments: (prev.attachments || []).map(a => a.id === attId ? { ...a, title: newTitle, name: newTitle } : a)
    }));
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

  const optimizeDescriptionAndSpecs = (rawText = '', nameText = '') => {
    let text = (rawText || '').trim();
    if (!text) return { cleanDescription: '', extractedSpecs: [] };

    const extractedSpecs = [];
    const seen = new Set();
    const segmentsToRemove = [];

    const addSpec = (spec, originalSegment) => {
      let clean = spec.trim().replace(/^[•\-\*–—\d+\.\)]+\s*/, '').trim();
      if (clean.length >= 3 && clean.length <= 140 && !seen.has(clean.toLowerCase())) {
        seen.add(clean.toLowerCase());
        extractedSpecs.push(clean);
      }
      if (originalSegment && typeof originalSegment === 'string' && originalSegment.trim().length > 3) {
        segmentsToRemove.push(originalSegment.trim());
      }
    };

    const lines = text.split(/\r?\n|[;•·\t]/).map(l => l.trim()).filter(Boolean);
    for (const line of lines) {
      if (line.includes(':')) {
        const parts = line.split(':');
        if (parts[0].trim().length > 1 && parts[1].trim().length > 0 && line.length < 90) {
          addSpec(line, line);
        }
      }
    }

    const dimMatch1 = text.match(/(?:tamanho(?:\s*do\s*produto)?|dimens[õo]es(?:\s*do\s*produto)?|medidas(?:\s*do\s*produto)?)\s*[:=]?\s*([\d\.,\s\*xX×\-\/]+(?:mm|cm|m|pol|"))/i);
    if (dimMatch1) {
      const rawVal = dimMatch1[1].trim().replace(/\s*[\*xX×]\s*/g, ' × ');
      addSpec(`Dimensões: ${rawVal}`, dimMatch1[0]);
    } else {
      const dimMatch2 = text.match(/\b(\d+[\.,]?\d*)\s*[\*xX×]\s*(\d+[\.,]?\d*)\s*[\*xX×]\s*(\d+[\.,]?\d*)\s*(mm|cm|m)\b/i);
      if (dimMatch2) {
        addSpec(`Dimensões: ${dimMatch2[1]} × ${dimMatch2[2]} × ${dimMatch2[3]} ${dimMatch2[4]}`, dimMatch2[0]);
      }
    }

    const weightMatch = text.match(/(?:peso\s*bruto|peso\s*líquido|peso\s*total|peso)\s*[:=]?\s*([\d\.,]+\s*(?:kg|t|ton|toneladas|g))/i);
    if (weightMatch) {
      const isBruto = /bruto/i.test(weightMatch[0]);
      const isLiquido = /l[íi]quido/i.test(weightMatch[0]);
      const label = isBruto ? 'Peso Bruto' : (isLiquido ? 'Peso Líquido' : 'Peso');
      addSpec(`${label}: ${weightMatch[1].trim()}`, weightMatch[0]);
    }

    const volMatch = text.match(/(?:volume(?:\s*do\s*produto)?)\s*[:=]?\s*([^\.\n,;]+?(?:m³|m3|m|litros|l|cm³))/i);
    if (volMatch) {
      let val = volMatch[1].trim();
      if (/^[\d\.,\s]+m$/i.test(val)) val = val.replace(/m$/i, 'm³');
      addSpec(`Volume: ${val}`, volMatch[0]);
    }

    const espMatch = text.match(/(?:espessura(?:\s*da\s*chapa|\s*do\s*aço)?)\s*(?:de\s*)?[:=]?\s*([\d\.,]+\s*(?:mm|cm|pol|"))/i);
    if (espMatch) {
      addSpec(`Espessura da Chapa: ${espMatch[1].trim()}`, espMatch[0]);
    }

    const tampoMatch = text.match(/(?:opções\s*(?:com|de)?\s*tampo|tampo)\s*(?:de\s*|:)?\s*([^\.\n;]+?(?:aço\s*inox|madeira|inox|aço|mdf|emborrachado)[^\.\n;]*)/i);
    if (tampoMatch) {
      const formattedTampo = tampoMatch[0].trim().replace(/^opções\s*(?:com|de)?\s*tampo\s*(?:de\s*|:)?/i, 'Tampo ');
      addSpec(`Opções de Tampo: ${formattedTampo}`, tampoMatch[0]);
    }

    const capMatch = text.match(/(capacidade\s*(?:de\s*carga)?\s*(?:de|:)?\s*[\d\.,]+\s*(?:kg|t|ton|toneladas|litros|l|mah|bar|psi))/i);
    if (capMatch) {
      addSpec(`Capacidade: ${capMatch[0].replace(/^capacidade\s*(?:de\s*carga)?\s*(?:de|:)?\s*/i, '').trim()}`, capMatch[0]);
    }

    const altMatch = text.match(/(altura\s*(?:máxima|de\s*elevação)?\s*(?:de|:)?\s*[\d\.,]+\s*(?:mm|cm|m))/i);
    if (altMatch) {
      addSpec(`Altura de Elevação: ${altMatch[0].replace(/^altura\s*(?:máxima|de\s*elevação)?\s*(?:de|:)?\s*/i, '').trim()}`, altMatch[0]);
    }

    const motorMatch = text.match(/(motor\s*(?:trifásico|monofásico|elétrico|hidráulico)?\s*(?:de\s*[\d\.,]+\s*(?:hp|cv|kw))?\s*(?:220v|380v|110v|12v|24v)?(?:\/380v|\/220v)?)/i) ||
                       text.match(/(tensão|voltagem|alimentação)\s*(?:de|:)?\s*(?:220v|380v|110v|12v|24v|bivolt)(?:\/380v|\/220v)?/i);
    if (motorMatch) {
      addSpec(`Motor / Alimentação: ${motorMatch[0].replace(/^(motor|tensão|voltagem|alimentação)\s*(?:de|:)?\s*/i, '').trim()}`, motorMatch[0]);
    }

    const pressMatch = text.match(/(pressão\s*(?:de\s*trabalho|máxima)?\s*(?:de|:)?\s*[\d\.,\-\s]+(?:bar|psi))/i);
    if (pressMatch) {
      addSpec(`Pressão de Trabalho: ${pressMatch[0].replace(/^pressão\s*(?:de\s*trabalho|máxima)?\s*(?:de|:)?\s*/i, '').trim()}`, pressMatch[0]);
    }

    const torqMatch = text.match(/(torque\s*(?:máximo)?\s*(?:de|:)?\s*[\d\.,]+\s*(?:nm|kgfm))/i);
    if (torqMatch) {
      addSpec(`Torque Máximo: ${torqMatch[0].replace(/^torque\s*(?:máximo)?\s*(?:de|:)?\s*/i, '').trim()}`, torqMatch[0]);
    }

    const displayMatch = text.match(/(tela|display|monitor)\s*(?:touchscreen|lcd|led|colorido)?\s*(?:de\s*[\d\.,]+(?:\s*polegadas|\s*pol|"))?/i);
    if (displayMatch && displayMatch[0].length > 6) {
      addSpec(`Display: ${displayMatch[0].replace(/^(tela|display|monitor)\s*(?:de|:)?\s*/i, '').trim()}`, displayMatch[0]);
    }

    const protoMatch = text.match(/(protocolos?\s*(?:suportados?)?:?\s*(?:can-fd|doip|j2534|obd2|iso[\d\-]+)[\w\s\-,/]+)/i);
    if (protoMatch) {
      addSpec(`Protocolos: ${protoMatch[0].replace(/^protocolos?\s*(?:suportados?)?:?\s*/i, '').trim()}`, protoMatch[0]);
    }

    const batMatch = text.match(/(bateria\s*(?:interna|recarregável)?\s*(?:de|:)?\s*[\d\.,]+\s*(?:mah|ah))/i);
    if (batMatch) {
      addSpec(`Bateria: ${batMatch[0].replace(/^bateria\s*(?:interna|recarregável)?\s*(?:de|:)?\s*/i, '').trim()}`, batMatch[0]);
    }

    const aroMatch = text.match(/(?:aro|diâmetro(?:\s*do\s*aro)?)\s*(?:de|:)?\s*([\d\.,\s\-"a]+(?:pol|"))/i);
    if (aroMatch) {
      addSpec(`Diâmetro do Aro: ${aroMatch[1].trim()}`, aroMatch[0]);
    }

    const encaixeMatch = text.match(/(encaixe\s*(?:quadrado)?\s*(?:de|:)?\s*[\d\.,/]+(?:\s*pol|"))/i);
    if (encaixeMatch) {
      addSpec(`Encaixe: ${encaixeMatch[0].replace(/^encaixe\s*(?:quadrado)?\s*(?:de|:)?\s*/i, '').trim()}`, encaixeMatch[0]);
    }

    const garMatch = text.match(/(garantia\s*(?:de\s*fábrica)?\s*(?:de|:)?\s*[\d\.,]+\s*(?:meses|anos?))/i);
    if (garMatch) {
      addSpec(`Garantia: ${garMatch[0].replace(/^garantia\s*(?:de\s*fábrica)?\s*(?:de|:)?\s*/i, '').trim()}`, garMatch[0]);
    }

    let cleanDesc = text;

    for (const seg of segmentsToRemove) {
      const escaped = seg.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      cleanDesc = cleanDesc.replace(new RegExp(escaped, 'gi'), '');
    }

    cleanDesc = cleanDesc
      .replace(/\b(TAMANHO(\s*DO\s*PRODUTO)?|PESO(\s*BRUTO|\s*L[IÍ]QUIDO)?|VOLUME(\s*DO\s*PRODUTO)?|ESPESSURA(\s*DA\s*CHAPA)?|DIMENS[ÕO]ES|MEDIDAS)\b[:=]?/gi, '')
      .replace(/\s{2,}/g, ' ')
      .replace(/\s*,\s*,+/g, ',')
      .replace(/\s*\.\s*\.+/g, '.')
      .replace(/\s*,\s*\./g, '.')
      .replace(/^\s*[,;.\-–—]\s*/, '')
      .trim();

    const commonPrefixFixes = [
      { pattern: /^onjunto\b/i, fix: 'Conjunto' },
      { pattern: /^quipamento\b/i, fix: 'Equipamento' },
      { pattern: /^levador\b/i, fix: 'Elevador' },
      { pattern: /^ompressor\b/i, fix: 'Compressor' },
      { pattern: /^alanceador/i, fix: 'Balanceador' },
      { pattern: /^esmontadora/i, fix: 'Desmontadora' },
      { pattern: /^trutura/i, fix: 'Estrutura' },
      { pattern: /^strutura/i, fix: 'Estrutura' },
      { pattern: /^carrinho\b/i, fix: 'Carrinho' },
      { pattern: /^armário\b/i, fix: 'Armário' },
      { pattern: /^armario\b/i, fix: 'Armário' }
    ];

    for (const { pattern, fix } of commonPrefixFixes) {
      if (pattern.test(cleanDesc)) {
        cleanDesc = cleanDesc.replace(pattern, fix);
        break;
      }
    }

    if (cleanDesc.length > 0) {
      cleanDesc = cleanDesc.charAt(0).toUpperCase() + cleanDesc.slice(1);
    }

    cleanDesc = cleanDesc.replace(/\.\s+([a-zà-ú])/g, (_, letter) => `. ${letter.toUpperCase()}`);

    if (cleanDesc.length > 0 && !/[.!?]$/.test(cleanDesc)) {
      cleanDesc += '.';
    }

    return {
      cleanDescription: cleanDesc,
      extractedSpecs
    };
  };

  const parseSpecsFromText = (descriptionText, nameText = '') => {
    const { extractedSpecs } = optimizeDescriptionAndSpecs(descriptionText, nameText);
    return extractedSpecs;
  };

  const handleOptimizeDescriptionAndSpecs = () => {
    if (!productForm.description || !productForm.description.trim()) {
      showNotification('Digite ou cole a descrição do produto para otimizar.', 'error');
      return;
    }

    const { cleanDescription, extractedSpecs } = optimizeDescriptionAndSpecs(productForm.description, productForm.name);

    const currentSpecsLower = new Set((productForm.specs || []).map(s => s.toLowerCase().trim()));
    const newItems = extractedSpecs.filter(s => !currentSpecsLower.has(s.toLowerCase().trim()));
    const updatedSpecs = [...(productForm.specs || []), ...newItems];

    setProductForm(prev => ({
      ...prev,
      description: cleanDescription || prev.description,
      specs: updatedSpecs
    }));

    if (newItems.length > 0) {
      showNotification(`Descrição otimizada e ${newItems.length} especificação(ões) adicionada(s) à tabela.`, 'success');
    } else {
      showNotification('Descrição otimizada e formatada com sucesso.', 'success');
    }
  };

  const handleExtractSpecsFromDescription = () => {
    const extracted = parseSpecsFromText(productForm.description, productForm.name);
    if (extracted.length === 0) {
      showNotification('Nenhum dado técnico identificado na descrição atual. Digite mais detalhes técnicos acima.', 'error');
      return;
    }

    const currentSpecsLower = new Set((productForm.specs || []).map(s => s.toLowerCase().trim()));
    const newItems = extracted.filter(s => !currentSpecsLower.has(s.toLowerCase().trim()));

    if (newItems.length > 0) {
      setProductForm(prev => ({
        ...prev,
        specs: [...(prev.specs || []), ...newItems]
      }));
      showNotification(`${newItems.length} especificação(ões) extraída(s) com sucesso da descrição.`, 'success');
    } else {
      showNotification('Todas as especificações identificadas na descrição já estão na lista.', 'info');
    }
  };

  const handleMultipleImageUpload = async (files) => {
    if (!files || files.length === 0) return;
    const fileList = Array.from(files).filter(f => f && f.type && f.type.startsWith('image/'));
    if (fileList.length === 0) {
      showNotification('Selecione arquivos de imagem válidos (JPG/PNG/WEBP).', 'error');
      return;
    }

    // 1. Create immediate local preview placeholder tasks
    const newTasks = fileList.map((file, idx) => ({
      id: `up_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
      file,
      fileName: file.name,
      tempUrl: URL.createObjectURL(file),
      progress: 12,
      status: 'uploading' // 'uploading' | 'done' | 'error'
    }));

    setUploadingImages((prev) => [...prev, ...newTasks]);
    showNotification(`Enviando ${newTasks.length} imagem(ns)...`, 'info');

    // Smoothly center the gallery in view so user sees progress immediately
    setTimeout(() => {
      scrollToGallery();
    }, 60);

    // 2. Upload each file concurrently with progressive radial feedback
    for (const task of newTasks) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Data = e.target.result;

        // Progressive smooth radial animation
        const progressTimer = setInterval(() => {
          setUploadingImages((prev) =>
            prev.map((t) => {
              if (t.id === task.id && t.status === 'uploading') {
                const next = t.progress + Math.floor(Math.random() * 18 + 8);
                return { ...t, progress: Math.min(next, 94) };
              }
              return t;
            })
          );
        }, 220);

        try {
          const res = await fetch(`${API_BASE_URL}/upload`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ file: base64Data, folder: 'athena_produtos' })
          });

          clearInterval(progressTimer);

          if (res.status === 401 || res.status === 403) {
            onLogout && onLogout('Sua sessão expirou.');
            setUploadingImages((prev) => prev.filter((t) => t.id !== task.id));
            return;
          }

          const uploadedUrl = res.ok ? (await res.json()).url : base64Data;

          // Mark complete 100%
          setUploadingImages((prev) =>
            prev.map((t) => (t.id === task.id ? { ...t, progress: 100, status: 'done' } : t))
          );

          // Add to productForm images
          setProductForm((prev) => {
            const currentImages = Array.isArray(prev.images) ? [...prev.images] : [];
            const newImages = currentImages.includes(uploadedUrl) ? currentImages : [...currentImages, uploadedUrl];
            return {
              ...prev,
              image: prev.image || uploadedUrl,
              images: newImages
            };
          });

          // Graceful transition cleanup
          setTimeout(() => {
            setUploadingImages((prev) => prev.filter((t) => t.id !== task.id));
            try {
              URL.revokeObjectURL(task.tempUrl);
            } catch (err) {}
          }, 450);

        } catch (err) {
          clearInterval(progressTimer);
          setUploadingImages((prev) =>
            prev.map((t) => (t.id === task.id ? { ...t, status: 'error', error: 'Falha no upload' } : t))
          );
          showNotification(`Erro ao enviar foto "${task.fileName}".`, 'error');
        }
      };
      reader.readAsDataURL(task.file);
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
      showNotification('Enviando logo para a nuvem...', 'info');

      try {
        const res = await fetch(`${API_BASE_URL}/upload`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ file: base64Data, folder: 'athena_marcas' })
        });
        if (res.status === 401 || res.status === 403) {
          onLogout && onLogout('Sua sessão expirou.');
          return;
        }
        if (res.ok) {
          const data = await res.json();
          setBrandForm((prev) => ({ ...prev, logo: data.url }));
          showNotification('Logo enviada com sucesso!', 'success');
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
          headers: getAuthHeaders(),
          body: JSON.stringify({ file: base64Data, folder: 'athena_anexos' })
        });
        if (res.status === 401 || res.status === 403) {
          onLogout && onLogout('Sua sessão expirou.');
          return;
        }
        if (res.ok) {
          const data = await res.json();
          finalUrl = data.url;
        }
      } catch (err) {
        console.error('Upload fallback:', err);
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

      showNotification(`Anexo "${file.name}" salvo na nuvem com sucesso!`, 'success');
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
          `Bloqueado: A marca "${brand.name}" está em Rascunho. Ative/publique a marca no painel para liberar a publicação deste equipamento.`,
          'warning'
        );
        return;
      }

      if (category && category.status === 'draft') {
        showNotification(
          `Bloqueado: A categoria "${category.name}" está em Rascunho. Ative/publique a categoria no painel para liberar este equipamento.`,
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
        safeStorageSet('athena_brands', updatedBrands);
      }
      showNotification(`Marca "${newBrandObj.name}" atualizada!`, 'success');
    } else {
      onAddBrand(newBrandObj);
      setProductForm(prev => ({ ...prev, brandId: newBrandObj.id }));
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
        safeStorageSet('athena_categories', updated);
      }
      showNotification(`Categoria "${categoryObj.name}" atualizada com sucesso!`, 'success');
    } else {
      onAddCategory(categoryObj);
      setProductForm(prev => ({ ...prev, categoryId: categoryObj.id }));
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
    setProductForm(prev => ({ ...prev, categoryId: newCat.id }));
    setQuickCatName('');
    setIsQuickCatModalOpen(false);
    showNotification(`Categoria "${newCat.name}" criada!`, 'success');
  };

  const handleProductSubmit = (e) => {
    e.preventDefault();

    if (isUploadingImages) {
      showNotification('Aguarde o término do envio das fotos para salvar o equipamento.', 'error');
      scrollToGallery();
      return;
    }

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
      aPoints: productForm.aPoints !== '' && !isNaN(productForm.aPoints) ? parseInt(productForm.aPoints, 10) : null,
      badge: (productForm.badge || '').trim(),
      specs: cleanedSpecs,
      attachments: productForm.attachments || [],
      videoUrl: (productForm.videoUrl || '').trim(),
      customTabs: (productForm.customTabs || []).filter(t => t.title && t.title.trim() !== ''),
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

  const handleProductFormKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (isUploadingImages) {
        e.preventDefault();
        e.stopPropagation();
        showNotification('Aguarde o término do envio das fotos para salvar o equipamento.', 'error');
        scrollToGallery();
        return;
      }

      const target = e.target;
      const tagName = target?.tagName?.toLowerCase();

      // Textareas support newline
      if (tagName === 'textarea') return;
      // Buttons support click
      if (tagName === 'button') return;

      // PDF adding input -> add PDF
      if (target?.dataset?.role === 'pdf-input') {
        e.preventDefault();
        e.stopPropagation();
        handleAddAttachmentSubmit(e);
        return;
      }

      // PDF editing input -> save PDF edit
      if (target?.dataset?.role === 'pdf-edit-input') {
        e.preventDefault();
        e.stopPropagation();
        if (editingAttachmentId) {
          handleSaveEditAttachment(editingAttachmentId);
        }
        return;
      }

      // Any other input field -> prevent submitting/closing modal on Enter
      if (tagName === 'input') {
        e.preventDefault();
      }
    }
  };

  // Global Keydown Listener for ESC (close modal without saving) and ENTER (save when not focused on input)
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      // 1. ESC KEY -> Close whichever modal is currently active without saving
      if (e.key === 'Escape') {
        if (previewingImage) {
          setPreviewingImage(null);
          return;
        }
        if (editingAttachmentId) {
          setEditingAttachmentId(null);
          return;
        }
        if (confirmModal?.isOpen) {
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
          return;
        }
        if (isPdfModalOpen) {
          setIsPdfModalOpen(false);
          return;
        }
        if (isCategoryModalOpen) {
          setIsCategoryModalOpen(false);
          setEditingCategory(null);
          return;
        }
        if (isBrandModalOpen) {
          setIsBrandModalOpen(false);
          setEditingBrand(null);
          return;
        }
        if (isUserModalOpen) {
          setIsUserModalOpen(false);
          return;
        }
        if (isQuickCatModalOpen) {
          setIsQuickCatModalOpen(false);
          return;
        }
        if (isProductModalOpen) {
          setIsProductModalOpen(false);
          setEditingProduct(null);
          return;
        }
      }

      // 2. ENTER KEY when NOT focused on any interactive element -> Save active modal
      if (e.key === 'Enter') {
        const activeEl = document.activeElement;
        const tagName = activeEl ? activeEl.tagName.toLowerCase() : '';
        const isInteractive = ['input', 'textarea', 'select', 'button', 'a'].includes(tagName) || activeEl?.isContentEditable;

        if (!isInteractive) {
          if (isProductModalOpen) {
            e.preventDefault();
            handleProductSubmit(e);
          } else if (isCategoryModalOpen) {
            e.preventDefault();
            handleCategorySubmit(e);
          } else if (isBrandModalOpen) {
            e.preventDefault();
            handleBrandSubmit(e);
          } else if (isUserModalOpen) {
            e.preventDefault();
            handleCreateUser(e);
          } else if (isQuickCatModalOpen) {
            e.preventDefault();
            handleQuickCategoryCreate(e);
          }
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [
    isProductModalOpen,
    isCategoryModalOpen,
    isBrandModalOpen,
    isUserModalOpen,
    isQuickCatModalOpen,
    isPdfModalOpen,
    confirmModal?.isOpen,
    previewingImage,
    editingAttachmentId,
    productForm,
    categoryForm,
    brandForm,
    userForm,
    quickCatName,
    editingProduct,
    editingCategory,
    editingBrand
  ]);

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
        headers: getAuthHeaders(),
        body: JSON.stringify(userForm)
      });

      if (res.status === 401 || res.status === 403) {
        onLogout && onLogout('Sua sessão expirou.');
        return;
      }

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
    if (!passwordForm.newPassword || passwordForm.newPassword.length < 6) {
      showNotification('A nova senha deve ter no mínimo 6 caracteres.', 'error');
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
        headers: getAuthHeaders(),
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });

      if (res.status === 401 || res.status === 403) {
        onLogout && onLogout('Sua sessão expirou.');
        return;
      }

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
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: profileForm.name,
          email: profileForm.email
        })
      });

      if (res.status === 401 || res.status === 403) {
        onLogout && onLogout('Sua sessão expirou.');
        return;
      }

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
        saveSession(updatedUser);
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
                  <>
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-800 text-slate-200 text-xs font-bold border border-slate-700">
                      <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{currentUser.name} ({userRole.toUpperCase()})</span>
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-950/80 text-emerald-300 text-[11px] font-medium border border-emerald-500/40" title="Sessão protegida: encerramento automático após 30 minutos de inatividade">
                      <Lock className="w-3 h-3 text-emerald-400" />
                      <span>Sessão Protegida (30m)</span>
                    </span>
                  </>
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

          {/* Cupons & Vouchers Tab */}
          <button
            onClick={() => setActiveAdminTab('coupons')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-colors whitespace-nowrap ${
              activeAdminTab === 'coupons'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Gift className="w-4 h-4" />
            <span>Cupons & Vouchers</span>
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
            const rawAdminSearch = (adminProductSearch || '').trim();
            const cleanSearch = cleanAlphanumeric(rawAdminSearch);
            const normSearch = normalizeSearchText(rawAdminSearch);
            const matchSearch = !rawAdminSearch || 
              normalizeSearchText(prod.name).includes(normSearch) ||
              (cleanSearch.length >= 3 && cleanAlphanumeric(prod.name).includes(cleanSearch)) ||
              (cleanSearch.length >= 3 && cleanAlphanumeric(prod.sku || '').includes(cleanSearch)) ||
              (prod.slug && normalizeSearchText(prod.slug).includes(normSearch));
            const matchBrand = !adminBrandFilter || prod.brandId === adminBrandFilter;
            const matchCategory = !adminCategoryFilter || prod.categoryId === adminCategoryFilter;
            const matchStatus = !adminStatusFilter || 
              (adminStatusFilter === 'featured' ? prod.isFeatured : prod.status === adminStatusFilter);
            return matchSearch && matchBrand && matchCategory && matchStatus;
          });

          // Sort products according to adminSortField and adminSortDirection
          const sortedAdminProducts = [...filteredAdminProducts].sort((a, b) => {
            if (!adminSortField) return 0;
            let comparison = 0;

            if (adminSortField === 'name') {
              comparison = (a.name || '').localeCompare(b.name || '', 'pt-BR', { sensitivity: 'base' });
            } else if (adminSortField === 'brand_category') {
              const brandA = brands.find(br => br.id === a.brandId)?.name || '';
              const brandB = brands.find(br => br.id === b.brandId)?.name || '';
              const catA = categories.find(ca => ca.id === a.categoryId)?.name || '';
              const catB = categories.find(ca => ca.id === b.categoryId)?.name || '';
              const compA = `${brandA} ${catA}`.trim();
              const compB = `${brandB} ${catB}`.trim();
              comparison = compA.localeCompare(compB, 'pt-BR', { sensitivity: 'base' });
            } else if (adminSortField === 'featured') {
              const featA = a.isFeatured ? 1 : 0;
              const featB = b.isFeatured ? 1 : 0;
              comparison = featB - featA; // Default asc: featured first
            } else if (adminSortField === 'status') {
              const statusA = a.status === 'published' ? 1 : 0;
              const statusB = b.status === 'published' ? 1 : 0;
              comparison = statusB - statusA; // Default asc: published first
            }

            return adminSortDirection === 'asc' ? comparison : -comparison;
          });

          const totalItems = sortedAdminProducts.length;
          const isAll = adminItemsPerPage === 'all';
          const perPageNum = isAll ? (totalItems || 1) : Number(adminItemsPerPage);
          const totalPages = isAll ? 1 : Math.max(1, Math.ceil(totalItems / perPageNum));
          const currentPageSafe = Math.min(Math.max(1, adminPage), totalPages);
          const startIndex = isAll ? 0 : (currentPageSafe - 1) * perPageNum;
          const paginatedAdminProducts = isAll 
            ? sortedAdminProducts 
            : sortedAdminProducts.slice(startIndex, startIndex + perPageNum);

          const renderSortIcon = (field) => {
            if (adminSortField !== field) {
              return <ArrowUpDown className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 shrink-0 ml-1 transition" />;
            }
            if (adminSortDirection === 'asc') {
              return <ArrowUp className="w-3.5 h-3.5 text-amber-700 shrink-0 ml-1 font-black" />;
            }
            return <ArrowDown className="w-3.5 h-3.5 text-amber-700 shrink-0 ml-1 font-black" />;
          };

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
                    <option value="published">Publicados</option>
                    <option value="draft">Rascunhos</option>
                    <option value="featured">Destaques</option>
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
                    <thead className="bg-slate-100 uppercase text-[11px] text-slate-600 border-b border-slate-200 font-bold select-none">
                      <tr>
                        <th 
                          onClick={() => handleAdminSort('name')}
                          className="py-3 px-4 cursor-pointer hover:bg-slate-200/80 transition-colors group"
                          title="Clique para ordenar por Equipamento (A-Z ou Z-A)"
                        >
                          <div className="flex items-center gap-1">
                            <span>Equipamento</span>
                            {renderSortIcon('name')}
                          </div>
                        </th>
                        <th 
                          onClick={() => handleAdminSort('brand_category')}
                          className="py-3 px-4 cursor-pointer hover:bg-slate-200/80 transition-colors group"
                          title="Clique para ordenar por Marca e Categoria"
                        >
                          <div className="flex items-center gap-1">
                            <span>Marca & Categoria</span>
                            {renderSortIcon('brand_category')}
                          </div>
                        </th>
                        <th 
                          onClick={() => handleAdminSort('featured')}
                          className="py-3 px-4 text-center cursor-pointer hover:bg-slate-200/80 transition-colors group"
                          title="Clique para ordenar por Destaques"
                        >
                          <div className="flex items-center justify-center gap-1">
                            <span>Destaque</span>
                            {renderSortIcon('featured')}
                          </div>
                        </th>
                        <th 
                          onClick={() => handleAdminSort('status')}
                          className="py-3 px-4 cursor-pointer hover:bg-slate-200/80 transition-colors group"
                          title="Clique para ordenar por Status (Publicado / Rascunho)"
                        >
                          <div className="flex items-center gap-1">
                            <span>Status</span>
                            {renderSortIcon('status')}
                          </div>
                        </th>
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
                                    onClick={() => setPreviewingImage(prod.image)}
                                    className="w-12 h-12 rounded-xl object-contain bg-slate-50 border border-slate-200 shrink-0 p-1 cursor-pointer hover:border-amber-400 hover:scale-105 transition-transform" 
                                    title="Clique para expandir a foto"
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
                                  <a
                                    href={`/produto/${prod.slug || prod.id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 inline-flex items-center justify-center cursor-pointer"
                                    title="Visualizar Produto no Site (Abrir em Nova Aba)"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </a>

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
                                            askConfirmation({
                                              title: 'Excluir Equipamento?',
                                              message: `Tem certeza que deseja apagar permanentemente "${prod.name}"? Esta ação removerá o produto do catálogo e do banco de dados.`,
                                              confirmText: 'Sim, Excluir Produto',
                                              type: 'danger',
                                              onConfirm: () => {
                                                onDeleteProduct(prod.id);
                                                showNotification('Produto excluído com sucesso.', 'info');
                                              }
                                            });
                                          }}
                                          className="p-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
                                          title="Apagar Produto"
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
                      <a
                        href={`/categoria/${cat.slug || cat.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] font-mono text-slate-400 hover:text-amber-700 hover:underline inline-flex items-center gap-0.5"
                        title="Ver Categoria no Site (Nova Aba)"
                      >
                        <span>/categoria/{cat.slug || cat.id}</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
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
                      <button 
                        onClick={() => {
                          askConfirmation({
                            title: 'Excluir Categoria?',
                            message: `Tem certeza que deseja apagar a categoria "${cat.name}"?`,
                            confirmText: 'Sim, Excluir Categoria',
                            type: 'danger',
                            onConfirm: () => {
                              onDeleteCategory(cat.id);
                              showNotification('Categoria excluída com sucesso.', 'info');
                            }
                          });
                        }} 
                        className="btn-danger text-xs p-2" 
                        title="Apagar Categoria"
                      >
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
                      <a
                        href={`/marca/${b.slug || b.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] font-mono text-slate-400 hover:text-sky-700 hover:underline inline-flex items-center gap-0.5"
                        title="Ver Marca no Site (Nova Aba)"
                      >
                        <span>/marca/{b.slug || b.id}</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
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
                      <button 
                        onClick={() => {
                          askConfirmation({
                            title: 'Excluir Marca?',
                            message: `Tem certeza que deseja apagar a marca parceira "${b.name}"?`,
                            confirmText: 'Sim, Excluir Marca',
                            type: 'danger',
                            onConfirm: () => {
                              onDeleteBrand(b.id);
                              showNotification('Marca excluída com sucesso.', 'info');
                            }
                          });
                        }} 
                        className="btn-danger text-xs p-2" 
                        title="Apagar Marca"
                      >
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

        {/* COUPONS & VOUCHERS MANAGEMENT TAB */}
        {activeAdminTab === 'coupons' && (
          <CouponManager
            products={products}
            categories={categories}
            brands={brands}
            API_BASE_URL={API_BASE_URL}
            getAuthHeaders={getAuthHeaders}
            showNotification={showNotification}
          />
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

        {/* FULL PRODUCT FORM MODAL - BALANCED WIDE 2-COLUMN LAYOUT */}
        {isProductModalOpen && canEditContent && (
          <div className="modal-backdrop !p-2 sm:!p-4 md:!p-6" onClick={() => setIsProductModalOpen(false)}>
            <div 
              className="modal-content !max-w-[1440px] !w-[96vw] !max-h-[94vh] !p-0 bg-slate-100/95 border border-slate-300 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden" 
              onClick={(e) => e.stopPropagation()}
            >
              {/* Sticky Top Header */}
              <div className="bg-white px-5 sm:px-8 py-4 border-b border-slate-200 flex items-center justify-between shrink-0 shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center shrink-0">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-extrabold text-slate-900 leading-tight">
                      {editingProduct ? 'Editar Equipamento' : 'Cadastrar Novo Equipamento'}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {productForm.name || 'Preencha as informações comerciais, fotos, vídeos, documentos e especificações'}
                    </p>
                  </div>
                </div>

                <button 
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="p-2 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors"
                  title="Fechar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Back History Navigation Banner when navigating across related products */}
              {productModalHistory.length > 0 && (
                <div className="bg-amber-500/15 border-b border-amber-400/40 px-5 sm:px-8 py-2.5 flex items-center justify-between gap-3 text-xs shrink-0">
                  <div className="flex items-center gap-2 text-amber-950 font-bold min-w-0">
                    <span className="w-2 h-2 rounded-full bg-amber-600 animate-ping shrink-0" />
                    <span className="truncate">Navegando entre equipamentos vinculados:</span>
                    <span className="font-extrabold text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded truncate">
                      {productForm.name || 'Produto Atual'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={navigateBackInProductModal}
                    className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-black text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer shrink-0"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Voltar para {productModalHistory[productModalHistory.length - 1]?.form?.name || 'Equipamento Anterior'}</span>
                  </button>
                </div>
              )}

              {/* Scrollable Form Content */}
              <form id="productMainForm" onSubmit={handleProductSubmit} onKeyDown={handleProductFormKeyDown} className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
                
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  
                  {/* LEFT COLUMN (6 cols): Title, Description, Media, Video, PDFs */}
                  <div className="lg:col-span-6 space-y-6">
                    
                    {/* CARD 1: Informações Gerais (Nome, Slug, Descrição Rica) */}
                    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Informações Principais</h4>

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
                          className="form-input text-sm font-bold !py-2.5"
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
                          className="form-input text-xs font-mono text-slate-600 bg-slate-50"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1.5">
                          Descrição Comercial do Equipamento
                        </label>
                        <RichTextEditor
                          value={productForm.description}
                          onChange={(val) => setProductForm({ ...productForm, description: val })}
                          onOptimize={handleOptimizeDescriptionAndSpecs}
                          products={products}
                          onAddCompatibleProduct={(compatId) => {
                            setProductForm(prev => ({
                              ...prev,
                              compatibleProductIds: Array.from(new Set([...(prev.compatibleProductIds || []), compatId]))
                            }));
                          }}
                          placeholder="Descreva o produto, recursos, diferenciais e materiais..."
                        />
                      </div>

                      {/* Smart Detected Custom Tabs & Specs in Description */}
                      {(() => {
                        const detected = detectAllSectionsInDescription(productForm.description, productForm.customTabs, productForm.specs);
                        const unadded = detected.filter(d => !d.isAlreadyAdded);
                        if (unadded.length === 0) return null;

                        return (
                          <div className="p-3.5 rounded-xl bg-amber-50/90 border border-amber-300/80 space-y-2.5 shadow-2xs">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-950">
                                <Sparkles className="w-4 h-4 text-amber-700" />
                                <span>Detectamos seções estruturadas no texto que podem ser extraídas:</span>
                              </div>
                              {unadded.length > 1 && (
                                <button
                                  type="button"
                                  onClick={handleExtractAllDetectedTabs}
                                  className="text-[11px] font-black text-amber-900 bg-amber-200 hover:bg-amber-300 px-2.5 py-1 rounded-lg transition-all shadow-2xs border border-amber-400 flex items-center gap-1 cursor-pointer"
                                >
                                  <Sparkles className="w-3.5 h-3.5" /> Extrair Todas as {unadded.length} Seções de Uma Vez
                                </button>
                              )}
                            </div>

                            <div className="flex flex-wrap gap-1.5">
                              {unadded.map((item, idx) => {
                                if (item.isSpecsSection) {
                                  return (
                                    <button
                                      key={idx}
                                      type="button"
                                      onClick={() => handleExtractToSpecs(item)}
                                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-black transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                                      title={`Preencher a tabela de Especificações Técnicas com ${item.lineCount} itens e limpar da descrição`}
                                    >
                                      <Layers className="w-3.5 h-3.5 text-emerald-200" />
                                      <span>Preencher <strong>Especificações Técnicas</strong> ({item.lineCount} {item.lineCount === 1 ? 'item' : 'itens'})</span>
                                    </button>
                                  );
                                }

                                return (
                                  <button
                                    key={idx}
                                    type="button"
                                    onClick={() => handleAddCustomTab(item.title, true)}
                                    className="px-2.5 py-1 rounded-lg bg-white border border-amber-300 hover:border-amber-500 text-amber-950 hover:bg-amber-100 text-[11px] font-bold transition-all shadow-2xs flex items-center gap-1 cursor-pointer"
                                    title={`Criar aba "${item.title}" com ${item.lineCount} itens e limpar da descrição`}
                                  >
                                    <Plus className="w-3 h-3 text-amber-600" />
                                    <span>Criar Aba <strong>"{item.title}"</strong> ({item.lineCount} {item.lineCount === 1 ? 'item' : 'itens'})</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* CARD 2: Mídia / Fotos do Produto */}
                    <div ref={gallerySectionRef} className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Fotos do Produto (Galeria & Capa)</h4>
                            {isUploadingImages && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-800 text-[10px] font-extrabold border border-amber-400/40 animate-pulse">
                                <Loader2 className="w-3 h-3 animate-spin text-amber-600" />
                                Enviando {uploadingImages.length} foto(s)...
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500">Adicione imagens em alta qualidade para carrossel e zoom de detalhes.</p>
                        </div>
                      </div>

                      {imageSourceMode === 'upload' ? (
                        <div 
                          onDragOver={(e) => { e.preventDefault(); setIsDraggingImage(true); }}
                          onDragLeave={() => setIsDraggingImage(false)}
                          onDrop={handleDropImage}
                          className={`border-2 border-dashed rounded-2xl p-6 text-center transition-colors cursor-pointer ${
                            isDraggingImage ? 'border-amber-500 bg-amber-50' : 'border-slate-300 hover:border-amber-400 bg-slate-50/70'
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

                          <label htmlFor="fileDropInputModal" className="cursor-pointer space-y-1.5 block">
                            <Upload className="w-8 h-8 mx-auto text-amber-600" />
                            <span className="text-xs font-bold text-slate-800 block">
                              Arraste e solte fotos aqui ou clique para selecionar (aceita várias)
                            </span>
                            <span className="text-[11px] text-slate-400">Arquivos JPG, PNG ou WEBP em alta definição</span>
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
                              showNotification('Foto adicionada à galeria.', 'success');
                            }}
                            className="btn-secondary text-xs font-bold py-2 px-3.5 shrink-0"
                          >
                            + Adicionar Foto
                          </button>
                        </div>
                      )}

                      {/* Visual Gallery Grid Preview (Shopify Style with Real-time Radial Progress) */}
                      {(() => {
                        const allImages = Array.from(
                          new Set([productForm.image, ...(productForm.images || [])].filter(Boolean))
                        );

                        if (allImages.length === 0 && uploadingImages.length === 0) return null;

                        const totalCount = allImages.length + uploadingImages.length;

                        return (
                          <div className="space-y-2 pt-2 border-t border-slate-100">
                            <div className="flex items-center justify-between text-[11px] text-slate-500 font-bold px-1">
                              <span>
                                Galeria do Produto ({totalCount} {totalCount === 1 ? 'foto' : 'fotos'}):
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {isUploadingImages ? 'Aguarde o envio das fotos para salvar' : 'Primeira foto é a capa principal'}
                              </span>
                            </div>

                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                              {/* 1. Completed / Saved Images */}
                              {allImages.map((imgUrl, index) => {
                                const isCover = (productForm.image || allImages[0]) === imgUrl;
                                return (
                                  <div
                                    key={`saved_${index}`}
                                    className={`group relative rounded-xl border p-1 bg-white transition-all ${
                                      isCover ? 'border-amber-500 ring-2 ring-amber-400/40 shadow-xs' : 'border-slate-200 hover:border-slate-300'
                                    }`}
                                  >
                                    <div
                                      onClick={() => setPreviewingImage(imgUrl)}
                                      className="aspect-square rounded-lg overflow-hidden bg-slate-50 relative cursor-pointer group/img"
                                      title="Clique para expandir a foto"
                                    >
                                      <img
                                        src={imgUrl}
                                        alt={`Foto ${index + 1}`}
                                        className="w-full h-full object-contain p-1 group-hover/img:scale-105 transition-transform"
                                      />

                                      {isCover && (
                                        <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md bg-amber-500 text-slate-950 font-black text-[9px] uppercase tracking-wider shadow-xs">
                                          Capa
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
                                          askConfirmation({
                                            title: 'Remover Imagem?',
                                            message: 'Deseja remover esta foto da galeria do equipamento e apagá-la do armazenamento?',
                                            confirmText: 'Sim, Remover Foto',
                                            type: 'danger',
                                            onConfirm: async () => {
                                              const remainingImages = allImages.filter(img => img !== imgUrl);
                                              setProductForm({
                                                ...productForm,
                                                image: isCover ? (remainingImages[0] || '') : productForm.image,
                                                images: remainingImages
                                              });

                                              if (imgUrl && (imgUrl.includes('.r2.dev') || imgUrl.includes('.r2.cloudflarestorage.com') || imgUrl.includes('cloudinary.com'))) {
                                                try {
                                                  const apiUrl = API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
                                                  fetch(`${apiUrl}/upload/delete`, {
                                                    method: 'POST',
                                                    headers: getAuthHeaders(),
                                                    body: JSON.stringify({ url: imgUrl })
                                                  }).catch(() => {});
                                                } catch (err) {}
                                              }
                                              showNotification('Foto removida da galeria.', 'info');
                                            }
                                          });
                                        }}
                                        className="text-red-600 hover:text-red-800 font-bold ml-auto"
                                        title="Remover esta foto e apagar do storage"
                                      >
                                        Excluir
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}

                              {/* 2. Uploading Live Cards with Shopify-style Radial Progress Ring */}
                              {uploadingImages.map((task) => (
                                <div
                                  key={task.id}
                                  className="relative rounded-xl border-2 border-amber-400 p-1 bg-slate-900 shadow-md overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                                >
                                  <div className="aspect-square rounded-lg overflow-hidden relative bg-slate-950 flex items-center justify-center">
                                    {/* Local preview thumbnail */}
                                    <img
                                      src={task.tempUrl}
                                      alt={task.fileName}
                                      className="w-full h-full object-cover opacity-40 blur-[1px]"
                                    />

                                    {/* Centered Dark Overlay with Radial Progress */}
                                    <div className="absolute inset-0 bg-slate-950/65 backdrop-blur-[1px] flex flex-col items-center justify-center p-2 text-center">
                                      {task.status === 'uploading' && (
                                        <>
                                          <RadialProgressCircle progress={task.progress} />
                                          <span className="text-[10px] font-extrabold text-amber-300 mt-1 tracking-tight drop-shadow-xs">
                                            Enviando...
                                          </span>
                                        </>
                                      )}
                                      {task.status === 'done' && (
                                        <div className="flex flex-col items-center animate-in zoom-in-75 duration-150">
                                          <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg">
                                            <Check className="w-5 h-5 stroke-[3]" />
                                          </div>
                                          <span className="text-[9px] font-black text-emerald-300 mt-1">
                                            Pronto!
                                          </span>
                                        </div>
                                      )}
                                      {task.status === 'error' && (
                                        <div className="flex flex-col items-center text-red-400 p-1">
                                          <AlertTriangle className="w-6 h-6 text-red-400" />
                                          <span className="text-[9px] font-bold mt-1 text-center leading-tight">
                                            Falha
                                          </span>
                                          <button
                                            type="button"
                                            onClick={() => setUploadingImages(prev => prev.filter(t => t.id !== task.id))}
                                            className="text-[9px] text-white underline mt-1 font-bold hover:text-red-200 cursor-pointer"
                                          >
                                            Cancelar
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  <div className="pt-1 px-1 flex items-center justify-between text-[10px] text-slate-300">
                                    <span className="truncate max-w-[70px] text-[9px] font-medium" title={task.fileName}>
                                      {task.fileName}
                                    </span>
                                    <span className="text-[9px] font-black text-amber-400">
                                      {task.status === 'done' ? '100%' : `${Math.round(task.progress)}%`}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })()}

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
                    </div>

                    {/* CARD 3: Vídeo do Equipamento (YouTube / iframe) */}
                    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div>
                          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                            <Film className="w-4 h-4 text-red-600" />
                            Vídeo do Equipamento (YouTube / Demonstração)
                          </h4>
                          <p className="text-[11px] text-slate-500">
                            Cole o código <strong>&lt;iframe&gt;...&lt;/iframe&gt;</strong> copiado do YouTube ou o link direto do vídeo.
                          </p>
                        </div>
                      </div>

                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Cole o link do YouTube, YouTube Shorts ou Instagram (Reel/Post)..."
                          value={productForm.videoUrl || ''}
                          onChange={(e) => setProductForm({ ...productForm, videoUrl: e.target.value })}
                          className="form-input text-xs !pl-10 font-mono text-slate-700"
                        />
                        <Film className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      </div>

                      {(() => {
                        const videoInfo = getVideoEmbedInfo(productForm.videoUrl);
                        if (!videoInfo) return null;

                        return (
                          <div className="space-y-2 pt-1">
                            <div className="flex items-center justify-between text-[11px] text-slate-600 font-bold">
                              <span className="flex items-center gap-1 text-slate-800">
                                <Play className="w-3 h-3 text-slate-700 fill-current" />
                                Pré-visualização ({videoInfo.platform}):
                              </span>
                              <button
                                type="button"
                                onClick={() => setProductForm({ ...productForm, videoUrl: '' })}
                                className="text-red-600 hover:underline text-[10px] font-bold"
                              >
                                Remover Vídeo
                              </button>
                            </div>
                            <div className={
                              videoInfo.type === 'instagram'
                                ? "w-full max-w-[380px] mx-auto min-h-[520px] rounded-xl overflow-hidden border border-slate-200 shadow-xs bg-white"
                                : videoInfo.isVertical
                                ? "w-full max-w-[320px] mx-auto aspect-[9/16] rounded-xl overflow-hidden border border-slate-200 shadow-xs bg-black"
                                : "aspect-video w-full rounded-xl overflow-hidden border border-slate-200 shadow-xs bg-black"
                            }>
                              <iframe
                                src={videoInfo.embedUrl}
                                title="Prévia do Vídeo Demonstrativo"
                                className="w-full h-full min-h-[420px]"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                frameBorder="0"
                                scrolling="no"
                              />
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* CARD 4: Anexos, Fichas Técnicas & Manuais em PDF (Upload ou Link Direto) */}
                    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div>
                          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                            <FileText className="w-4 h-4 text-amber-600" />
                            Fichas Técnicas & Manuais em PDF
                          </h4>
                          <p className="text-[11px] text-slate-500">Adicione ou edite manuais e links para os clientes baixarem.</p>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="text-xs font-bold text-slate-700">Adicionar Novo Documento:</span>
                          <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200 shadow-2xs">
                            <button
                              type="button"
                              onClick={() => setNewAttachmentForm(f => ({ ...f, mode: 'url' }))}
                              className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all ${
                                newAttachmentForm.mode === 'url' ? 'bg-slate-900 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                              }`}
                            >
                              <LinkIcon className="w-3 h-3 inline mr-1" /> Link
                            </button>
                            <button
                              type="button"
                              onClick={() => setNewAttachmentForm(f => ({ ...f, mode: 'upload' }))}
                              className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all ${
                                newAttachmentForm.mode === 'upload' ? 'bg-slate-900 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                              }`}
                            >
                              <Upload className="w-3 h-3 inline mr-1" /> PDF
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                          <div className="sm:col-span-5">
                            <input
                              type="text"
                              data-role="pdf-input"
                              placeholder="Nome do Documento (Ex: Manual Técnico)"
                              value={newAttachmentForm.title}
                              onChange={(e) => setNewAttachmentForm({ ...newAttachmentForm, title: e.target.value })}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleAddAttachmentSubmit(e);
                                }
                              }}
                              className="form-input text-xs bg-white"
                            />
                          </div>

                          {newAttachmentForm.mode === 'url' ? (
                            <div className="sm:col-span-7 flex gap-2">
                              <div className="relative flex-1">
                                <input
                                  type="url"
                                  data-role="pdf-input"
                                  placeholder="https://exemplo.com/manual.pdf"
                                  value={newAttachmentForm.url}
                                  onChange={(e) => setNewAttachmentForm({ ...newAttachmentForm, url: e.target.value })}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleAddAttachmentSubmit(e);
                                    }
                                  }}
                                  className="form-input text-xs !pl-8 bg-white"
                                />
                                <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                              </div>
                              <button
                                type="button"
                                onClick={handleAddAttachmentSubmit}
                                className="btn-gold text-xs font-bold py-1.5 px-3 shrink-0 flex items-center gap-1"
                              >
                                <Plus className="w-3.5 h-3.5" /> Adicionar
                              </button>
                            </div>
                          ) : (
                            <div className="sm:col-span-7">
                              <input
                                type="file"
                                id="pdfUploadInput"
                                accept="application/pdf,.pdf"
                                className="hidden"
                                onChange={(e) => e.target.files && handleAttachmentFileUpload(e.target.files[0])}
                              />
                              <label
                                htmlFor="pdfUploadInput"
                                className="btn-secondary text-xs py-2 px-3 gap-1.5 cursor-pointer w-full flex items-center justify-center font-bold border-dashed border-amber-400 bg-amber-50/50 hover:bg-amber-100/60 text-amber-900"
                              >
                                <Upload className="w-3.5 h-3.5 text-amber-600" />
                                <span>Selecionar PDF</span>
                              </label>
                            </div>
                          )}
                        </div>
                      </div>

                      {productForm.attachments && productForm.attachments.length > 0 && (
                        <div className="max-h-72 overflow-y-auto space-y-2.5 pt-1">
                          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block px-1">
                            Documentos Cadastrados ({productForm.attachments.length}):
                          </span>

                          {productForm.attachments.map((att) => {
                            const isEditingThis = editingAttachmentId === att.id;
                            if (isEditingThis) {
                              return (
                                <div key={att.id} className="p-3.5 rounded-xl bg-amber-50/90 border-2 border-amber-400 space-y-3 shadow-xs animate-in fade-in duration-150">
                                  <div className="flex items-center justify-between gap-2 flex-wrap">
                                    <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                                      <Edit3 className="w-3.5 h-3.5 text-amber-700" />
                                      Editando Documento:
                                    </span>
                                    <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-amber-200">
                                      <button
                                        type="button"
                                        onClick={() => setEditingAttachmentForm(f => ({ ...f, mode: 'url' }))}
                                        className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                                          editingAttachmentForm.mode === 'url' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
                                        }`}
                                      >
                                        <LinkIcon className="w-3 h-3 inline mr-1" /> Link
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setEditingAttachmentForm(f => ({ ...f, mode: 'upload' }))}
                                        className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                                          editingAttachmentForm.mode === 'upload' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
                                        }`}
                                      >
                                        <Upload className="w-3 h-3 inline mr-1" /> PDF
                                      </button>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                                    <div className="sm:col-span-5">
                                      <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Nome do PDF</label>
                                      <input
                                        type="text"
                                        data-role="pdf-edit-input"
                                        placeholder="Nome do Documento"
                                        value={editingAttachmentForm.title}
                                        onChange={(e) => setEditingAttachmentForm({ ...editingAttachmentForm, title: e.target.value })}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleSaveEditAttachment(att.id);
                                          } else if (e.key === 'Escape') {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setEditingAttachmentId(null);
                                          }
                                        }}
                                        className="form-input text-xs bg-white"
                                      />
                                    </div>

                                    {editingAttachmentForm.mode === 'url' ? (
                                      <div className="sm:col-span-7">
                                        <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Link / URL do PDF</label>
                                        <div className="relative">
                                          <input
                                            type="url"
                                            data-role="pdf-edit-input"
                                            placeholder="https://exemplo.com/manual.pdf"
                                            value={editingAttachmentForm.url}
                                            onChange={(e) => setEditingAttachmentForm({ ...editingAttachmentForm, url: e.target.value })}
                                            onKeyDown={(e) => {
                                              if (e.key === 'Enter') {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleSaveEditAttachment(att.id);
                                              } else if (e.key === 'Escape') {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                setEditingAttachmentId(null);
                                              }
                                            }}
                                            className="form-input text-xs !pl-8 bg-white"
                                          />
                                          <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="sm:col-span-7">
                                        <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Arquivo PDF</label>
                                        <input
                                          type="file"
                                          id={`editPdfFileInput_${att.id}`}
                                          accept="application/pdf,.pdf"
                                          className="hidden"
                                          onChange={(e) => e.target.files && handleEditAttachmentFileUpload(e.target.files[0])}
                                        />
                                        <label
                                          htmlFor={`editPdfFileInput_${att.id}`}
                                          className="btn-secondary text-xs py-2 px-3 gap-1.5 cursor-pointer w-full flex items-center justify-center font-bold border-dashed border-amber-400 bg-white hover:bg-amber-50 text-amber-900"
                                        >
                                          <Upload className="w-3.5 h-3.5 text-amber-600" />
                                          <span>{editingAttachmentForm.fileName ? `Trocar: ${editingAttachmentForm.fileName}` : 'Selecionar Novo PDF'}</span>
                                        </label>
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-amber-200">
                                    <button
                                      type="button"
                                      onClick={() => setEditingAttachmentId(null)}
                                      className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 bg-white hover:bg-slate-100 text-xs font-bold transition"
                                    >
                                      Cancelar
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleSaveEditAttachment(att.id)}
                                      className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs transition flex items-center gap-1 shadow-xs"
                                    >
                                      <Check className="w-3.5 h-3.5" /> Salvar Alterações
                                    </button>
                                  </div>
                                </div>
                              );
                            }

                            return (
                              <div key={att.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors flex items-center justify-between gap-3 text-xs">
                                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                                    <FileText className="w-4 h-4" />
                                  </div>
                                  <div className="truncate min-w-0 flex-1">
                                    <span className="font-bold text-slate-900 block truncate">{att.title || att.fileName}</span>
                                    <span className="text-[10px] text-slate-400 font-mono block truncate">{att.url?.startsWith('data:') ? `Arquivo Carregado (${att.fileSize || 'PDF'})` : att.url}</span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => handleStartEditAttachment(att)}
                                    className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-amber-400 text-slate-700 hover:text-amber-700 text-xs font-bold transition flex items-center gap-1 shadow-2xs"
                                    title="Editar nome ou link deste PDF"
                                  >
                                    <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                                    <span>Editar</span>
                                  </button>

                                  {att.url && (
                                    <a
                                      href={att.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="p-1.5 rounded-lg bg-white border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-900 transition shadow-2xs"
                                      title="Abrir PDF em nova aba"
                                    >
                                      <ExternalLink className="w-3.5 h-3.5" />
                                    </a>
                                  )}

                                  <button
                                    type="button"
                                    onClick={() => handleRemoveAttachment(att.id)}
                                    className="p-1.5 rounded-lg bg-white border border-slate-200 hover:border-red-300 text-slate-400 hover:text-red-600 transition shadow-2xs"
                                    title="Excluir PDF"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* RIGHT COLUMN (6 cols): Destaque, Organization, Pricing, Specs, Custom Tabs */}
                  <div className="lg:col-span-6 space-y-6">
                    
                    {/* CARD 5: Destaque Athena */}
                    <div 
                      onClick={() => setProductForm(p => ({ ...p, isFeatured: !p.isFeatured }))}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer space-y-2 ${
                        productForm.isFeatured 
                          ? 'bg-amber-100/90 border-amber-500 shadow-xs' 
                          : 'bg-white border-slate-200 hover:border-amber-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm shrink-0 ${
                            productForm.isFeatured ? 'bg-amber-500 text-slate-950' : 'bg-slate-100 text-slate-400'
                          }`}>
                            <Star className={`w-4 h-4 ${productForm.isFeatured ? 'fill-slate-950 text-slate-950' : 'text-slate-400'}`} />
                          </div>
                          <div>
                            <span className="text-xs font-black text-slate-900 block">
                              PRODUTO EM DESTAQUE
                            </span>
                            {productForm.isFeatured && (
                              <span className="bg-amber-500 text-slate-950 text-[9px] font-black px-1.5 py-0.2 rounded uppercase">
                                ATIVO NO TOPO
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="relative inline-flex items-center shrink-0">
                          <input
                            type="checkbox"
                            checked={!!productForm.isFeatured}
                            onChange={(e) => setProductForm(p => ({ ...p, isFeatured: e.target.checked }))}
                            className="sr-only peer"
                          />
                          <div className="w-10 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-600 leading-tight">
                        {productForm.isFeatured 
                          ? 'Selo dourado ativo. O equipamento aparecerá no topo do catálogo.' 
                          : 'Ative para fixar este produto no topo do catálogo com selo dourado.'}
                      </p>
                    </div>

                    {/* CARD 6: Organização & Classificação */}
                    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Organização & Condições Comerciais</h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <SearchableSelect
                          label="Categoria *"
                          value={productForm.categoryId}
                          onChange={(newId) => setProductForm({ ...productForm, categoryId: newId })}
                          options={categories}
                          placeholder="Selecione ou busque uma categoria..."
                          onAddNew={openNewCategoryModal}
                          addNewLabel="Nova"
                          colorTheme="amber"
                          required={true}
                        />

                        <SearchableSelect
                          label="Marca / Fabricante *"
                          value={productForm.brandId}
                          onChange={(newId) => setProductForm({ ...productForm, brandId: newId })}
                          options={brands}
                          placeholder="Selecione ou busque uma marca..."
                          onAddNew={openNewBrandModal}
                          addNewLabel="Nova"
                          colorTheme="sky"
                          required={true}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">Status de Publicação</label>
                          <select
                            value={productForm.status}
                            onChange={(e) => setProductForm({ ...productForm, status: e.target.value })}
                            className="form-select text-xs font-bold"
                          >
                            <option value="published">Publicado (Visível no Catálogo)</option>
                            <option value="draft">Rascunho (Oculto)</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">
                            Selo Promocional / Badge (Opcional)
                          </label>
                          <input
                            type="text"
                            placeholder="Ex: Lançamento, Linha Pesada"
                            value={productForm.badge}
                            onChange={(e) => setProductForm({ ...productForm, badge: e.target.value })}
                            className="form-input text-xs"
                          />
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 space-y-3">
                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">Preço Base à Vista / PIX (R$)</label>
                          <input
                            type="number"
                            step="0.01"
                            placeholder="600.00"
                            disabled={productForm.priceNegotiable}
                            value={productForm.price}
                            onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                            className="form-input text-xs disabled:opacity-40 font-mono"
                          />
                        </div>

                        <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                          <input
                            type="checkbox"
                            id="priceNegotiable"
                            checked={productForm.priceNegotiable}
                            onChange={(e) => setProductForm({ ...productForm, priceNegotiable: e.target.checked })}
                            className="w-4 h-4 accent-amber-600 rounded cursor-pointer"
                          />
                          <label htmlFor="priceNegotiable" className="text-xs font-semibold text-slate-700 cursor-pointer">
                            Preço Sob Consulta (Negociável)
                          </label>
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">
                            Pontos A-Points (Opcional)
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="1"
                            placeholder="Ex: 50, 100, 200 (pontuação concedida)"
                            value={productForm.aPoints ?? ''}
                            onChange={(e) => setProductForm({ ...productForm, aPoints: e.target.value })}
                            className="form-input text-xs font-mono"
                          />
                          <span className="text-[11px] text-slate-500 block mt-0.5">
                            Pontuação creditada ao cliente ao adquirir este equipamento.
                          </span>
                        </div>

                        {/* MODALIDADE DE ENTREGA / TIPO DE PRODUTO (FÍSICO OU DIGITAL) */}
                        <div className="space-y-1.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                          <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                            <Truck className="w-3.5 h-3.5 text-amber-600" />
                            <span>Modalidade de Entrega do Equipamento / Produto</span>
                          </label>
                          <p className="text-[11px] text-slate-500 mb-2">
                            Define se o item requer entrega técnica/transporte físico ou se é uma licença/software digital sem frete.
                          </p>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            <button
                              type="button"
                              onClick={() => setProductForm({ ...productForm, productType: 'physical' })}
                              className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                                (productForm.productType || 'physical') === 'physical'
                                  ? 'bg-white border-amber-500 shadow-xs ring-1 ring-amber-500/50'
                                  : 'bg-slate-100/70 border-slate-200 hover:bg-white text-slate-600'
                              }`}
                            >
                              <div className={`p-1.5 rounded-lg shrink-0 ${
                                (productForm.productType || 'physical') === 'physical'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-slate-200 text-slate-600'
                              }`}>
                                <Truck className="w-4 h-4" />
                              </div>
                              <div className="space-y-0.5 min-w-0">
                                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                                  <span>📦 Produto Físico</span>
                                  {(productForm.productType || 'physical') === 'physical' && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                                  )}
                                </div>
                                <p className="text-[10px] text-slate-500 leading-tight">
                                  Equipamento ou ferramenta. Requer logística, entrega técnica e frete.
                                </p>
                              </div>
                            </button>

                            <button
                              type="button"
                              onClick={() => setProductForm({ ...productForm, productType: 'digital' })}
                              className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                                productForm.productType === 'digital'
                                  ? 'bg-white border-amber-500 shadow-xs ring-1 ring-amber-500/50'
                                  : 'bg-slate-100/70 border-slate-200 hover:bg-white text-slate-600'
                              }`}
                            >
                              <div className={`p-1.5 rounded-lg shrink-0 ${
                                productForm.productType === 'digital'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-slate-200 text-slate-600'
                              }`}>
                                <Zap className="w-4 h-4" />
                              </div>
                              <div className="space-y-0.5 min-w-0">
                                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                                  <span>⚡ Produto Digital</span>
                                  {productForm.productType === 'digital' && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                                  )}
                                </div>
                                <p className="text-[10px] text-slate-500 leading-tight">
                                  Licença, software ou token. Não precisa de entrega presencial nem frete.
                                </p>
                              </div>
                            </button>
                          </div>
                        </div>

                        {/* TOGGLEABLE GATEWAY SIMULATION PREVIEW */}
                        {!productForm.priceNegotiable && Number(productForm.price) > 0 && (() => {
                          const simData = calculatePaymentGateways(productForm.price);
                          if (!simData) return null;

                          return (
                            <div className="space-y-2 pt-1">
                              <div>
                                <button
                                  type="button"
                                  onClick={() => setShowPriceSimulations(!showPriceSimulations)}
                                  className="inline-flex items-center gap-2 text-xs font-bold text-amber-800 hover:text-amber-950 bg-amber-50 hover:bg-amber-100/90 px-3 py-1.5 rounded-xl border border-amber-200/90 transition-all cursor-pointer shadow-2xs"
                                >
                                  <Calculator className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                  <span>{showPriceSimulations ? 'Ocultar simulações de taxas e parcelas' : 'Ver simulações de taxas e recebimento líquido'}</span>
                                  {showPriceSimulations ? (
                                    <ChevronUp className="w-3.5 h-3.5 text-amber-700" />
                                  ) : (
                                    <ChevronDown className="w-3.5 h-3.5 text-amber-700" />
                                  )}
                                </button>
                              </div>

                              {showPriceSimulations && (
                                <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-300/90 space-y-3 text-xs animate-in fade-in duration-200 shadow-2xs">
                                  {/* Header & Sub-Tabs */}
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/80 pb-2.5">
                                    <span className="font-extrabold text-amber-950 flex items-center gap-1.5">
                                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                                      Simulação de Recebimento & Taxas Gateway
                                    </span>
                                    <span className="text-[10px] font-black text-amber-900 bg-amber-200/80 px-2.5 py-0.5 rounded-md self-start sm:self-auto">
                                      Base: {simData.formattedBasePrice}
                                    </span>
                                  </div>

                                  {/* Gateway Tabs */}
                                  <div className="grid grid-cols-4 gap-1 p-1 bg-amber-100/70 rounded-xl text-[11px] font-bold">
                                    <button
                                      type="button"
                                      onClick={() => setPriceSimulationTab('credit')}
                                      className={`py-1.5 px-1 rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer ${
                                        priceSimulationTab === 'credit'
                                          ? 'bg-white text-slate-900 shadow-2xs font-black'
                                          : 'text-amber-900/80 hover:text-amber-950'
                                      }`}
                                    >
                                      <CreditCard className="w-3 h-3 text-amber-600 shrink-0" />
                                      <span>Crédito</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => setPriceSimulationTab('pix')}
                                      className={`py-1.5 px-1 rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer ${
                                        priceSimulationTab === 'pix'
                                          ? 'bg-white text-emerald-950 shadow-2xs font-black'
                                          : 'text-amber-900/80 hover:text-amber-950'
                                      }`}
                                    >
                                      <QrCode className="w-3 h-3 text-emerald-600 shrink-0" />
                                      <span>PIX</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => setPriceSimulationTab('debit')}
                                      className={`py-1.5 px-1 rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer ${
                                        priceSimulationTab === 'debit'
                                          ? 'bg-white text-sky-950 shadow-2xs font-black'
                                          : 'text-amber-900/80 hover:text-amber-950'
                                      }`}
                                    >
                                      <Landmark className="w-3 h-3 text-sky-600 shrink-0" />
                                      <span>Débito</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => setPriceSimulationTab('boleto')}
                                      className={`py-1.5 px-1 rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer ${
                                        priceSimulationTab === 'boleto'
                                          ? 'bg-white text-slate-900 shadow-2xs font-black'
                                          : 'text-amber-900/80 hover:text-amber-950'
                                      }`}
                                    >
                                      <FileText className="w-3 h-3 text-amber-700 shrink-0" />
                                      <span>Boleto</span>
                                    </button>
                                  </div>

                                  {/* TAB CONTENT: CREDIT CARD */}
                                  {priceSimulationTab === 'credit' && (
                                    <div className="space-y-2.5">
                                      <div className="flex items-center justify-between text-[11px]">
                                        <span className="font-bold text-amber-950">Parcelamento Automático (1x a 12x):</span>
                                        <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                                          Líquido à vista: {simData.formattedBasePrice}
                                        </span>
                                      </div>

                                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[11px]">
                                        {[1, 3, 6, 12].map((n) => {
                                          const inst = simData.credit.installments.find(p => p.installments === n);
                                          if (!inst) return null;
                                          return (
                                            <div key={n} className="bg-white p-2 rounded-xl border border-amber-200 text-center shadow-2xs">
                                              <span className="font-bold text-slate-500 block text-[10px]">{n}x de</span>
                                              <span className="font-black text-slate-900 block">{inst.formattedInstallment}</span>
                                              <span className="text-[9px] text-slate-400 font-mono">Total: {inst.formattedTotal}</span>
                                            </div>
                                          );
                                        })}
                                      </div>

                                      <div className="p-2.5 rounded-xl bg-white/80 border border-amber-200 text-[11px] text-slate-600 space-y-1">
                                        <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                          <span>Você recebe o valor líquido integral à vista (D+1 ou D+2).</span>
                                        </p>
                                        <p className="text-[10px] text-slate-500 leading-tight">
                                          ℹ️ A taxa de intermediação e os juros mensais de antecipação são embutidos automaticamente no valor da parcela para o cliente.
                                        </p>
                                      </div>
                                    </div>
                                  )}

                                  {/* TAB CONTENT: PIX */}
                                  {priceSimulationTab === 'pix' && (
                                    <div className="space-y-2 bg-white p-3 rounded-xl border border-amber-200 text-xs">
                                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-center">
                                        <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                                          <span className="text-[10px] text-slate-500 block font-medium">Cobrado do Cliente</span>
                                          <span className="text-sm font-black text-slate-900">{simData.pix.formattedCustomerAmount}</span>
                                        </div>
                                        <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                                          <span className="text-[10px] text-slate-500 block font-medium">Taxa API Gateway</span>
                                          <span className="text-sm font-black text-red-600">~{simData.pix.formattedFee}</span>
                                        </div>
                                        <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200">
                                          <span className="text-[10px] text-emerald-800 block font-bold">Você Recebe Líquido</span>
                                          <span className="text-sm font-black text-emerald-950">{simData.pix.formattedNetReceived}</span>
                                        </div>
                                      </div>
                                      <div className="pt-1 flex items-center justify-between text-[10px] text-slate-500">
                                        <span>Prazo de recebimento: <strong>Imediato (D+0)</strong></span>
                                        <span>Taxa fixa por transação via API</span>
                                      </div>
                                    </div>
                                  )}

                                  {/* TAB CONTENT: DÉBITO */}
                                  {priceSimulationTab === 'debit' && (
                                    <div className="space-y-2 bg-white p-3 rounded-xl border border-amber-200 text-xs">
                                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-center">
                                        <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                                          <span className="text-[10px] text-slate-500 block font-medium">Cobrado do Cliente</span>
                                          <span className="text-sm font-black text-slate-900">{simData.debit.formattedCustomerAmount}</span>
                                        </div>
                                        <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                                          <span className="text-[10px] text-slate-500 block font-medium">Taxa Gateway (1,89% + R$ 0,35)</span>
                                          <span className="text-sm font-black text-red-600">~{simData.debit.formattedFee}</span>
                                        </div>
                                        <div className="p-2 rounded-lg bg-sky-50 border border-sky-200">
                                          <span className="text-[10px] text-sky-800 block font-bold">Você Recebe Líquido</span>
                                          <span className="text-sm font-black text-sky-950">{simData.debit.formattedNetReceived}</span>
                                        </div>
                                      </div>
                                      <div className="pt-1 flex items-center justify-between text-[10px] text-slate-500">
                                        <span>Prazo de recebimento: <strong>3 dias após pagamento (D+3)</strong></span>
                                        <span>Taxa de débito online</span>
                                      </div>
                                    </div>
                                  )}

                                  {/* TAB CONTENT: BOLETO */}
                                  {priceSimulationTab === 'boleto' && (
                                    <div className="space-y-2 bg-white p-3 rounded-xl border border-amber-200 text-xs">
                                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-center">
                                        <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                                          <span className="text-[10px] text-slate-500 block font-medium">Cobrado do Cliente</span>
                                          <span className="text-sm font-black text-slate-900">{simData.boleto.formattedCustomerAmount}</span>
                                        </div>
                                        <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                                          <span className="text-[10px] text-slate-500 block font-medium">Taxa por Boleto Pago</span>
                                          <span className="text-sm font-black text-red-600">~{simData.boleto.formattedFee}</span>
                                        </div>
                                        <div className="p-2 rounded-lg bg-amber-50 border border-amber-200">
                                          <span className="text-[10px] text-amber-900 block font-bold">Você Recebe Líquido</span>
                                          <span className="text-sm font-black text-amber-950">{simData.boleto.formattedNetReceived}</span>
                                        </div>
                                      </div>
                                      <div className="pt-1 flex items-center justify-between text-[10px] text-slate-500">
                                        <span>Prazo: <strong>1 dia útil após compensação (D+1)</strong></span>
                                        <span>Taxa cobrada apenas quando o boleto é pago</span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    </div>

                    {/* CARD 7: Especificações Técnicas (Smart Manager) */}
                    <div ref={specsSectionRef} className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div>
                          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                            <Layers className="w-4 h-4 text-amber-600" />
                            Especificações Técnicas
                          </h4>
                          <p className="text-[11px] text-slate-500">Itens tabulados no formato "Rótulo: Valor".</p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleAddSpec('')}
                          className="btn-secondary text-xs font-bold py-1.5 px-3 gap-1.5 inline-flex items-center"
                        >
                          <Plus className="w-3.5 h-3.5 text-slate-600" />
                          <span>Nova Linha</span>
                        </button>
                      </div>

                      {/* Smart Callout when a Custom Tab has Specs data */}
                      {(() => {
                        const specsTabs = (productForm.customTabs || []).filter(isSpecsCustomTab);
                        if (specsTabs.length === 0) return null;

                        return (
                          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300/80 space-y-2 shadow-2xs">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-950">
                                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                                <span>Detectamos dados de especificações na aba personalizada <strong>"{specsTabs[0].title}"</strong>:</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleConvertTabToSpecs(specsTabs[0].id)}
                                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                              >
                                <Layers className="w-3.5 h-3.5 text-emerald-200" />
                                <span>Cadastrar Especificações</span>
                              </button>
                            </div>
                            <p className="text-[11px] text-emerald-800 leading-snug">
                              Clique no botão para migrar todo o texto dessa aba para a lista tabulada oficial e excluir a aba duplicada automaticamente.
                            </p>
                          </div>
                        );
                      })()}

                      {productForm.specs && productForm.specs.length > 0 && (
                        <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                          {productForm.specs.map((specItem, idx) => (
                            <div key={idx} className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
                              <input
                                type="text"
                                placeholder="Ex: Capacidade: 4.000 kg"
                                value={specItem}
                                onChange={(e) => handleUpdateSpec(idx, e.target.value)}
                                className="form-input text-xs flex-1 border-none focus:ring-1 focus:ring-amber-500 bg-white rounded-lg font-medium"
                              />
                              <div className="flex items-center gap-0.5 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => handleMoveSpec(idx, 'up')}
                                  disabled={idx === 0}
                                  title="Mover Linha para Cima"
                                  className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200 disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                                >
                                  <ArrowUp className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleMoveSpec(idx, 'down')}
                                  disabled={idx === productForm.specs.length - 1}
                                  title="Mover Linha para Baixo"
                                  className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200 disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                                >
                                  <ArrowDown className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveSpec(idx)}
                                  className="p-1 rounded text-red-400 hover:text-red-600 hover:bg-red-50 cursor-pointer ml-0.5"
                                  title="Excluir Linha"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* CARD 8: Abas & Seções Extras Personalizadas (Aplicações, Funções, etc.) */}
                    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div>
                          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                            <Layers className="w-4 h-4 text-amber-600" />
                            Abas Personalizadas
                          </h4>
                          <p className="text-[11px] text-slate-500">Defina abas exclusivas (Diferenciais, Aplicações, etc.) e controle a ordem de exibição.</p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleAddCustomTab('Nova Seção')}
                          className="btn-secondary text-xs py-1.5 px-3 gap-1.5 inline-flex items-center font-bold text-amber-900 border-amber-300 bg-amber-50 hover:bg-amber-100 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5 text-amber-700" />
                          <span>+ Nova Aba</span>
                        </button>
                      </div>

                      {productForm.customTabs && productForm.customTabs.length > 0 ? (
                        <div className="space-y-3">
                          {productForm.customTabs.map((tab, idx) => {
                            const isSpecs = isSpecsCustomTab(tab);
                            return (
                              <div key={tab.id || idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 shadow-2xs">
                                {/* Tab Header Bar with Order & Reordering Controls */}
                                <div className="flex items-center justify-between flex-wrap gap-2 pb-1 border-b border-slate-200/60">
                                  <div className="flex items-center gap-1.5">
                                    <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-900 font-extrabold text-[10px] uppercase tracking-wider border border-amber-400/40">
                                      Aba #{idx + 1}
                                    </span>
                                    <div className="flex items-center bg-white rounded-lg border border-slate-200 p-0.5 shadow-2xs">
                                      <button
                                        type="button"
                                        onClick={() => handleMoveCustomTab(idx, 'up')}
                                        disabled={idx === 0}
                                        title="Mover Aba para Cima (Exibir antes)"
                                        className="p-1 rounded hover:bg-slate-100 disabled:opacity-20 text-slate-700 cursor-pointer disabled:cursor-not-allowed"
                                      >
                                        <ArrowUp className="w-3 h-3" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleMoveCustomTab(idx, 'down')}
                                        disabled={idx === productForm.customTabs.length - 1}
                                        title="Mover Aba para Baixo (Exibir depois)"
                                        className="p-1 rounded hover:bg-slate-100 disabled:opacity-20 text-slate-700 cursor-pointer disabled:cursor-not-allowed"
                                      >
                                        <ArrowDown className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    {isSpecs && (
                                      <button
                                        type="button"
                                        onClick={() => handleConvertTabToSpecs(tab.id)}
                                        className="text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 border border-emerald-500 px-3 py-1 rounded-lg transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                                        title="Migrar o texto desta aba para a tabela de Especificações Técnicas e excluir a aba"
                                      >
                                        <Layers className="w-3.5 h-3.5 text-emerald-200" />
                                        <span>Cadastrar Especificações</span>
                                      </button>
                                    )}

                                    <button
                                      type="button"
                                      onClick={() => handleRemoveCustomTab(tab.id)}
                                      className="text-red-500 hover:text-red-700 text-[10px] font-bold hover:underline flex items-center gap-0.5 cursor-pointer ml-auto"
                                    >
                                      <Trash2 className="w-3 h-3" /> Remover Aba
                                    </button>
                                  </div>
                                </div>

                                <div>
                                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                                    Título da Aba
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="Ex: Diferenciais, Aplicações, Requisitos..."
                                    value={tab.title}
                                    onChange={(e) => handleUpdateCustomTab(tab.id, 'title', e.target.value)}
                                    className="form-input text-xs font-bold w-full bg-white"
                                  />
                                </div>

                                <div>
                                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                                    Conteúdo da Aba (Texto ou Tópicos)
                                  </label>
                                  <textarea
                                    placeholder="Descreva os tópicos ou detalhes desta aba..."
                                    value={tab.content || ''}
                                    onChange={(e) => handleUpdateCustomTab(tab.id, 'content', e.target.value)}
                                    className="form-textarea text-xs h-20 w-full bg-white leading-relaxed font-mono"
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic bg-slate-50 p-3 rounded-xl border border-slate-200/60 text-center">
                          Nenhuma aba personalizada criada. As abas ajudam a organizar tópicos como "Diferenciais" e "Aplicações" na página do produto.
                        </p>
                      )}
                    </div>

                    {/* CARD 9: ACESSÓRIOS & ITENS COMPATÍVEIS */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4 shadow-2xs">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-900 font-extrabold text-xs flex items-center justify-center">
                            9
                          </span>
                          <div>
                            <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-800">
                              Acessórios & Itens Compatíveis (Marcações Cruzadas)
                            </h4>
                            <p className="text-[11px] text-slate-500">
                              Vincule máquinas e acessórios compatíveis. Os clientes verão esses equipamentos com prévia rápida e links cruzados.
                            </p>
                          </div>
                        </div>

                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {(productForm.compatibleProductIds || []).length} selecionado(s)
                        </span>
                      </div>

                      {/* Search & Add Compatible Products Combobox */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                          Adicionar Equipamento Compatível do Catálogo
                        </label>
                        
                        <SearchableSelect
                          options={products
                            .filter(p => p.status !== 'draft' && p.id !== (productForm.id || editingProduct?.id) && !(productForm.compatibleProductIds || []).includes(p.id))
                            .map(p => {
                              const bName = brands.find(b => b.id === p.brandId)?.name || 'Athena';
                              const cName = categories.find(c => c.id === p.categoryId)?.name || '';
                              return {
                                id: p.id,
                                name: p.name,
                                brand: bName,
                                category: cName,
                                sku: p.sku || '',
                                slug: p.slug || '',
                                image: p.image || (p.images && p.images[0]) || 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=100'
                              };
                            })}
                          value=""
                          onChange={(val) => {
                            if (val) {
                              setProductForm(prev => ({
                                ...prev,
                                compatibleProductIds: Array.from(new Set([...(prev.compatibleProductIds || []), val]))
                              }));
                              const addedProd = products.find(p => p.id === val);
                              showNotification(`Equipamento "${addedProd?.name || 'Item'}" vinculado como compatível!`, 'success');
                            }
                          }}
                          placeholder="Digite para buscar e selecionar um equipamento..."
                        />
                      </div>

                      {/* List of currently selected compatible products */}
                      {productForm.compatibleProductIds && productForm.compatibleProductIds.length > 0 ? (
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                            Equipamentos Vinculados ({productForm.compatibleProductIds.length})
                          </label>
                          <div className="grid grid-cols-1 gap-2">
                            {productForm.compatibleProductIds.map(compatId => {
                              const compatProd = products.find(p => p.id === compatId);
                              if (!compatProd) return null;
                              const compatBrand = brands.find(b => b.id === compatProd.brandId);

                              return (
                                <div
                                  key={compatId}
                                  className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs"
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 p-0.5 overflow-hidden shrink-0 flex items-center justify-center">
                                      <img
                                        src={compatProd.image || (compatProd.images && compatProd.images[0]) || 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=100'}
                                        alt={compatProd.name}
                                        className="w-full h-full object-contain"
                                      />
                                    </div>
                                    <div className="min-w-0">
                                      <span className="font-bold text-slate-900 block truncate">
                                        {compatProd.name}
                                      </span>
                                      <span className="text-[10px] text-slate-500 font-medium block">
                                        {compatBrand?.name || 'Athena'} • /produto/{compatProd.slug || compatProd.id}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1.5 shrink-0">
                                    <button
                                      type="button"
                                      onClick={() => navigateToProductInModal(compatProd)}
                                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-amber-400 text-slate-700 hover:text-amber-900 font-bold text-[11px] flex items-center gap-1 shadow-2xs cursor-pointer transition-colors"
                                      title="Editar este produto agora no modal"
                                    >
                                      <Edit3 className="w-3 h-3 text-amber-600" />
                                      <span>Editar</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => {
                                        setProductForm(prev => ({
                                          ...prev,
                                          compatibleProductIds: (prev.compatibleProductIds || []).filter(id => id !== compatId)
                                        }));
                                        showNotification('Vínculo de compatibilidade removido.', 'info');
                                      }}
                                      className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                      title="Remover compatibilidade"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic bg-slate-50 p-3 rounded-xl border border-slate-200/60 text-center">
                          Nenhum equipamento vinculado manualmente. Você pode vincular máquinas ou adicionar links pelo editor de texto.
                        </p>
                      )}

                      {/* Inbound Cross-References: Products that mark THIS product as compatible */}
                      {(() => {
                        const currentId = productForm.id || editingProduct?.id;
                        const currentSlug = productForm.slug;
                        if (!currentId && !currentSlug) return null;

                        const referencingProducts = products.filter(p => {
                          if (p.id === currentId) return false;
                          const hasDirectId = Array.isArray(p.compatibleProductIds) && p.compatibleProductIds.includes(currentId);
                          const hasSlugLink = currentSlug && Array.isArray(p.customTabs) && p.customTabs.some(t => t.content && t.content.includes(currentSlug));
                          return hasDirectId || hasSlugLink;
                        });

                        if (referencingProducts.length === 0) return null;

                        return (
                          <div className="pt-3 border-t border-slate-200/80 space-y-2">
                            <div className="flex items-center gap-1.5 text-slate-700">
                              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-800">
                                Marcado como Compatível nestes Equipamentos ({referencingProducts.length}):
                              </span>
                            </div>

                            <div className="grid grid-cols-1 gap-1.5">
                              {referencingProducts.map(refProd => {
                                const refBrand = brands.find(b => b.id === refProd.brandId);
                                return (
                                  <div
                                    key={refProd.id}
                                    className="p-2 rounded-xl bg-amber-50/60 border border-amber-200/70 flex items-center justify-between gap-3 text-xs"
                                  >
                                    <div className="flex items-center gap-2 min-w-0">
                                      <span className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0" />
                                      <span className="font-bold text-slate-900 truncate">{refProd.name}</span>
                                      <span className="text-[10px] text-slate-500 font-medium shrink-0">({refBrand?.name || 'Athena'})</span>
                                    </div>

                                    <button
                                      type="button"
                                      onClick={() => navigateToProductInModal(refProd)}
                                      className="px-2 py-0.5 rounded-md bg-white border border-amber-300 hover:border-amber-500 text-amber-900 font-bold text-[10px] flex items-center gap-1 shadow-2xs cursor-pointer shrink-0"
                                      title="Abrir este equipamento no modal para editar"
                                    >
                                      <span>Abrir</span>
                                      <ArrowRight className="w-2.5 h-2.5" />
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                  </div>

                </div>

              </form>

              {/* Sticky Action Footer */}
              <div className="bg-white px-5 sm:px-8 py-4 border-t border-slate-200 flex items-center justify-between shrink-0 shadow-xs">
                <button
                  type="button"
                  onClick={() => {
                    const draftPayload = {
                      ...productForm,
                      id: productForm.id || editingProduct?.id || 'preview',
                      isDraftPreview: true
                    };
                    sessionStorage.setItem('athena_preview_draft_product', JSON.stringify(draftPayload));
                    const token = encodeDraftToShareableUrl ? encodeDraftToShareableUrl(draftPayload) : '';
                    const previewUrl = `/produto/preview${token ? `?d=${token}` : ''}`;
                    window.open(previewUrl, '_blank', 'noopener,noreferrer');
                  }}
                  className="btn-secondary text-xs py-2.5 px-4 font-bold flex items-center gap-1.5 cursor-pointer hover:border-emerald-500 hover:text-emerald-800"
                  title="Abrir prévia do produto em uma nova aba sem fechar o formulário"
                >
                  <Eye className="w-4 h-4 text-emerald-600" />
                  <span>Pré-visualizar Página (Nova Aba)</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <div className="flex items-center gap-3">
                  <button 
                    type="button" 
                    onClick={() => setIsProductModalOpen(false)} 
                    className="btn-secondary text-xs py-2.5 px-4 font-bold"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    form="productMainForm"
                    disabled={isUploadingImages}
                    onClick={(e) => {
                      if (isUploadingImages) {
                        e.preventDefault();
                        showNotification('Aguarde o término do envio das fotos para salvar o equipamento.', 'error');
                        scrollToGallery();
                      }
                    }}
                    className={`btn-gold text-xs font-extrabold py-2.5 px-6 shadow-md transition-all flex items-center gap-2 ${
                      isUploadingImages ? 'opacity-60 cursor-not-allowed grayscale-[25%]' : ''
                    }`}
                  >
                    {isUploadingImages ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-amber-950" />
                        <span>Enviando Fotos ({uploadingImages.length})...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Salvar Equipamento</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* BRAND MODAL */}
        {isBrandModalOpen && canEditContent && (
          <div className="modal-backdrop !z-[110]" onClick={() => setIsBrandModalOpen(false)}>
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
          <div className="modal-backdrop !z-[110]" onClick={() => setIsCategoryModalOpen(false)}>
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

        {/* CUSTOM CONFIRMATION POPUP MODAL */}
        {confirmModal.isOpen && (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div 
              className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200 relative overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top soft accent line */}
              <div className={`absolute top-0 left-0 right-0 h-1.5 ${
                confirmModal.type === 'danger' ? 'bg-red-500' : confirmModal.type === 'warning' ? 'bg-amber-500' : 'bg-sky-500'
              }`} />

              <div className="flex items-start gap-4 mb-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                  confirmModal.type === 'danger' 
                    ? 'bg-red-100 text-red-600 border border-red-200' 
                    : confirmModal.type === 'warning'
                    ? 'bg-amber-100 text-amber-600 border border-amber-200'
                    : 'bg-sky-100 text-sky-600 border border-sky-200'
                }`}>
                  {confirmModal.type === 'danger' ? (
                    <Trash2 className="w-6 h-6" />
                  ) : confirmModal.type === 'warning' ? (
                    <AlertTriangle className="w-6 h-6" />
                  ) : (
                    <HelpCircle className="w-6 h-6" />
                  )}
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                    {confirmModal.title || 'Confirmação'}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
                    {confirmModal.message}
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={closeConfirmation}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs transition"
                >
                  {confirmModal.cancelText || 'Cancelar'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (typeof confirmModal.onConfirm === 'function') {
                      confirmModal.onConfirm();
                    }
                    closeConfirmation();
                  }}
                  className={`px-5 py-2.5 rounded-xl font-black text-xs text-white shadow-md transition flex items-center gap-1.5 ${
                    confirmModal.type === 'danger'
                      ? 'bg-red-600 hover:bg-red-700 shadow-red-500/20'
                      : confirmModal.type === 'warning'
                      ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/20'
                      : 'bg-sky-600 hover:bg-sky-700 shadow-sky-500/20'
                  }`}
                >
                  <Check className="w-4 h-4" />
                  <span>{confirmModal.confirmText || 'Confirmar'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PHOTO LIGHTBOX PREVIEW POPUP MODAL */}
        {previewingImage && (
          <div 
            className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-[110] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
            onClick={() => setPreviewingImage(null)}
          >
            <div 
              className="bg-white rounded-3xl p-5 sm:p-6 max-w-3xl w-full shadow-2xl border border-slate-200 relative flex flex-col items-center animate-in zoom-in-95 duration-200 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-full flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 text-xs font-black">
                    Visualizador de Imagem
                  </span>
                  {productForm.image === previewingImage && (
                    <span className="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 text-xs font-black">
                      Foto de Capa Principal
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewingImage(null)}
                  className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                  title="Fechar visualizador"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="w-full max-h-[65vh] rounded-2xl bg-slate-900/5 p-2 flex items-center justify-center overflow-hidden border border-slate-200/60">
                <img 
                  src={previewingImage} 
                  alt="Visualização do Equipamento" 
                  className="max-h-[60vh] max-w-full object-contain rounded-xl shadow-xs"
                />
              </div>

              <div className="w-full flex flex-wrap items-center justify-between gap-3 pt-4 mt-3 border-t border-slate-100 text-xs">
                <div className="text-slate-500 truncate max-w-xs sm:max-w-md font-mono text-[11px]">
                  {previewingImage}
                </div>
                <div className="flex items-center gap-2">
                  {productForm.image !== previewingImage && (
                    <button
                      type="button"
                      onClick={() => {
                        setProductForm({ ...productForm, image: previewingImage });
                        showNotification('Definida como imagem de capa com sucesso!', 'success');
                      }}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black shadow-sm transition"
                    >
                      Definir como Capa
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setPreviewingImage(null)}
                    className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 transition"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
