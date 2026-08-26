import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import HeroSlim from './components/HeroSlim';
import Catalog from './components/Catalog';
import AdminPanel from './components/AdminPanel';
import Footer from './components/Footer';
import Toast from './components/Toast';
import ProductDetailPage from './pages/ProductDetailPage';
import CategoryPage from './pages/CategoryPage';
import BrandPage from './pages/BrandPage';
import AboutPage from './pages/AboutPage';
import LoginPage from './pages/LoginPage';
import NotFoundPage from './pages/NotFoundPage';
import ServerErrorPage from './pages/ServerErrorPage';
import ErrorBoundary from './components/ErrorBoundary';
import BottomNavBar from './components/BottomNavBar';
import ComparisonFloatingBar from './components/ComparisonFloatingBar';
import ProductComparisonModal from './components/ProductComparisonModal';

import { INITIAL_CATEGORIES, INITIAL_BRANDS } from './data/initialData';
import { Layers, Tag, ArrowRight, MessageCircle } from 'lucide-react';
import { safeStorageGet, safeStorageSet, safeStorageRemove, idbGet } from './utils/storage';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://athena-backend-hu1m.onrender.com/api';

export default function App() {
  const [products, setProducts] = useState(() => {
    const saved = safeStorageGet('athena_products', null);
    if (Array.isArray(saved)) return saved;
    return [];
  });

  const [categories, setCategories] = useState(() => {
    const saved = safeStorageGet('athena_categories', null);
    if (Array.isArray(saved) && saved.length > 0) {
      const merged = [...saved];
      INITIAL_CATEGORIES.forEach((ic) => {
        if (!merged.some((c) => c.id === ic.id || (c.slug && c.slug === ic.slug))) {
          merged.push(ic);
        }
      });
      return merged;
    }
    return INITIAL_CATEGORIES;
  });

  const [brands, setBrands] = useState(() => {
    const saved = safeStorageGet('athena_brands', null);
    if (Array.isArray(saved) && saved.length > 0) {
      const merged = [...saved];
      INITIAL_BRANDS.forEach((ib) => {
        if (!merged.some((b) => b.id === ib.id || (b.slug && b.slug === ib.slug))) {
          merged.push(ib);
        }
      });
      return merged;
    }
    return INITIAL_BRANDS;
  });

  const [isBackendConnected, setIsBackendConnected] = useState(false);

  // Authenticated User State (Employee Login & Roles)
  const [currentUser, setCurrentUser] = useState(() => {
    return safeStorageGet('athena_user', null);
  });

  // Clean HTML5 Router (Zero "#" symbols, beautiful URLs like /admin, /produto/elevador)
  const getRouteFromUrl = () => {
    const path = window.location.pathname.replace(/^\//, '');
    if (path) return path;
    if (window.location.hash) {
      return window.location.hash.replace('#/', '').replace('#', '');
    }
    return 'catalog';
  };

  const [currentRoute, setCurrentRoute] = useState(getRouteFromUrl);
  const [previousRoute, setPreviousRoute] = useState(null);

  // Multi-Selection E-commerce Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [maxPriceFilter, setMaxPriceFilter] = useState(null);

  const [editingProduct, setEditingProduct] = useState(null);
  const [toast, setToast] = useState(null);

  // Side-by-Side Product Comparison States
  const [comparisonList, setComparisonList] = useState([]);
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);

  const handleToggleComparison = (product) => {
    if (comparisonList.some((p) => p.id === product.id)) {
      setComparisonList((prev) => prev.filter((p) => p.id !== product.id));
      showNotification('Equipamento removido do comparador.', 'info');
    } else {
      if (comparisonList.length >= 3) {
        showNotification('Você pode comparar até 3 modelos simultaneamente.', 'info');
        return;
      }
      setComparisonList((prev) => [...prev, product]);
      showNotification(`"${product.name.slice(0, 28)}..." adicionado ao comparador!`, 'success');
    }
  };

  const handleRemoveComparisonItem = (productId) => {
    setComparisonList((prev) => {
      const updated = prev.filter((p) => p.id !== productId);
      if (updated.length === 0) setIsComparisonModalOpen(false);
      return updated;
    });
  };

  const handleClearComparison = () => {
    setComparisonList([]);
    setIsComparisonModalOpen(false);
    showNotification('Comparador limpo.', 'info');
  };

  // Auth Handlers
  const handleLoginSuccess = (userObj) => {
    setCurrentUser(userObj);
    safeStorageSet('athena_user', userObj);
    showNotification(`Bem-vindo, ${userObj.name}!`, 'success');
    navigateTo('admin');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    safeStorageRemove('athena_user');
    showNotification('Sessão encerrada.', 'info');
    navigateTo('catalog');
  };

  // Navigation helper using HTML5 PushState (Clean URLs without hashtags)
  const navigateTo = (routePath) => {
    setPreviousRoute(currentRoute);
    const cleanPath = routePath.startsWith('/') ? routePath : `/${routePath}`;
    window.history.pushState({}, '', cleanPath);
    setCurrentRoute(routePath.replace(/^\//, ''));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Route change listener for browser back/forward and F5 persistence
  useEffect(() => {
    const handleUrlChange = () => {
      const route = getRouteFromUrl();
      setCurrentRoute((prev) => {
        setPreviousRoute(prev);
        return route;
      });
    };

    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, []);

  // Load heavy data from IndexedDB on startup
  useEffect(() => {
    const loadFromIndexedDB = async () => {
      try {
        const [idbProds, idbCats, idbBrands] = await Promise.all([
          idbGet('athena_products'),
          idbGet('athena_categories'),
          idbGet('athena_brands')
        ]);
        if (Array.isArray(idbProds) && idbProds.length > 0) {
          setProducts((prev) => (prev.length === 0 || idbProds.length >= prev.length ? idbProds : prev));
        }
        if (Array.isArray(idbCats) && idbCats.length > 0) {
          setCategories((prev) => (prev.length <= INITIAL_CATEGORIES.length ? idbCats : prev));
        }
        if (Array.isArray(idbBrands) && idbBrands.length > 0) {
          setBrands((prev) => (prev.length <= INITIAL_BRANDS.length ? idbBrands : prev));
        }
      } catch (e) {
        console.warn('[Athena Storage] Erro ao sincronizar IndexedDB:', e);
      }
    };
    loadFromIndexedDB();
  }, []);

  // Fetch from NestJS / Node backend if available
  useEffect(() => {
    const fetchBackendData = async () => {
      try {
        const [prodRes, catRes, brandRes] = await Promise.all([
          fetch(`${API_BASE_URL}/products`),
          fetch(`${API_BASE_URL}/categories`),
          fetch(`${API_BASE_URL}/brands`)
        ]);

        if (prodRes.ok && catRes.ok && brandRes.ok) {
          const prodData = await prodRes.json();
          const catData = await catRes.json();
          const brandData = await brandRes.json();

          setProducts(prodData);
          setCategories(catData);
          setBrands(brandData);
          setIsBackendConnected(true);
        }
      } catch (err) {
        setIsBackendConnected(false);
      }
    };

    fetchBackendData();
  }, []);

  // Sync fallback to safe storage (IndexedDB + safe LocalStorage)
  useEffect(() => {
    if (products && products.length > 0) {
      safeStorageSet('athena_products', products);
    }
  }, [products]);

  useEffect(() => {
    if (categories && categories.length > 0) {
      safeStorageSet('athena_categories', categories);
    }
  }, [categories]);

  useEffect(() => {
    if (brands && brands.length > 0) {
      safeStorageSet('athena_brands', brands);
    }
  }, [brands]);

  const showNotification = (message, type = 'success') => {
    setToast({ message, type });
  };

  const handleAddProduct = async (newProduct) => {
    setProducts((prev) => [newProduct, ...prev]);

    if (isBackendConnected) {
      try {
        await fetch(`${API_BASE_URL}/products`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newProduct)
        });
      } catch (e) {
        console.error('Erro backend:', e);
      }
    }
  };

  const handleUpdateProduct = async (updatedProduct) => {
    setProducts((prev) => prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)));

    if (isBackendConnected) {
      try {
        await fetch(`${API_BASE_URL}/products/${updatedProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedProduct)
        });
      } catch (e) {
        console.error('Erro backend:', e);
      }
    }
  };

  const handleDeleteProduct = async (productId) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));

    if (isBackendConnected) {
      try {
        await fetch(`${API_BASE_URL}/products/${productId}`, {
          method: 'DELETE'
        });
      } catch (e) {
        console.error('Erro backend:', e);
      }
    }
  };

  const handleAddCategory = async (newCat) => {
    setCategories((prev) => [...prev, newCat]);

    if (isBackendConnected) {
      try {
        await fetch(`${API_BASE_URL}/categories`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newCat)
        });
      } catch (e) {
        console.error('Erro backend:', e);
      }
    }
  };

  const handleUpdateCategory = async (updatedCat) => {
    setCategories((prev) => prev.map((c) => (c.id === updatedCat.id ? updatedCat : c)));

    if (isBackendConnected) {
      try {
        await fetch(`${API_BASE_URL}/categories/${updatedCat.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedCat)
        });
      } catch (e) {
        console.error('Erro backend ao atualizar categoria:', e);
      }
    }
  };

  const handleDeleteCategory = async (catId) => {
    setCategories((prev) => prev.filter((c) => c.id !== catId));
    if (selectedCategories.includes(catId)) {
      setSelectedCategories(selectedCategories.filter(id => id !== catId));
    }

    if (isBackendConnected) {
      try {
        await fetch(`${API_BASE_URL}/categories/${catId}`, {
          method: 'DELETE'
        });
      } catch (e) {
        console.error('Erro backend:', e);
      }
    }
  };

  const handleAddBrand = async (newBrand) => {
    setBrands((prev) => [...prev, newBrand]);

    if (isBackendConnected) {
      try {
        await fetch(`${API_BASE_URL}/brands`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newBrand)
        });
      } catch (e) {
        console.error('Erro backend:', e);
      }
    }
  };

  const handleUpdateBrand = async (updatedBrand) => {
    setBrands((prev) => prev.map((b) => (b.id === updatedBrand.id ? updatedBrand : b)));

    if (isBackendConnected) {
      try {
        await fetch(`${API_BASE_URL}/brands/${updatedBrand.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedBrand)
        });
      } catch (e) {
        console.error('Erro backend:', e);
      }
    }
  };

  const handleReorderCategories = async (newCategories) => {
    setCategories(newCategories);
    safeStorageSet('athena_categories', newCategories);
    if (isBackendConnected) {
      try {
        await fetch(`${API_BASE_URL}/categories/reorder`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ categories: newCategories })
        });
      } catch (e) {
        console.error('Erro backend ao reordenar categorias:', e);
      }
    }
  };

  const handleReorderBrands = async (newBrands) => {
    setBrands(newBrands);
    safeStorageSet('athena_brands', newBrands);
    if (isBackendConnected) {
      try {
        await fetch(`${API_BASE_URL}/brands/reorder`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ brands: newBrands })
        });
      } catch (e) {
        console.error('Erro backend ao reordenar marcas:', e);
      }
    }
  };

  const handleReorderProducts = async (newProducts) => {
    setProducts(newProducts);
    safeStorageSet('athena_products', newProducts);
    if (isBackendConnected) {
      try {
        await fetch(`${API_BASE_URL}/products/reorder`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ products: newProducts })
        });
      } catch (e) {
        console.error('Erro backend ao reordenar produtos:', e);
      }
    }
  };

  const handleDeleteBrand = async (brandId) => {
    setBrands((prev) => prev.filter((b) => b.id !== brandId));
    if (selectedBrands.includes(brandId)) {
      setSelectedBrands(selectedBrands.filter(id => id !== brandId));
    }

    if (isBackendConnected) {
      try {
        await fetch(`${API_BASE_URL}/brands/${brandId}`, {
          method: 'DELETE'
        });
      } catch (e) {
        console.error('Erro backend:', e);
      }
    }
  };

  const handleEditProductFromCatalog = (product) => {
    setEditingProduct(product);
    navigateTo('admin');
  };

  const isAdminView = currentRoute === 'admin' && !!currentUser;
  const publicProducts = isAdminView ? products : products.filter(p => p.status !== 'draft');

  // Render Page Content Router
  const renderCurrentPage = () => {
    if (currentRoute === 'login') {
      return (
        <LoginPage
          onLoginSuccess={handleLoginSuccess}
          onNavigate={navigateTo}
          API_BASE_URL={API_BASE_URL}
        />
      );
    }

    if (currentRoute.startsWith('produto/') || currentRoute.startsWith('product:')) {
      const slugOrId = currentRoute.includes('/') ? currentRoute.split('/')[1] : currentRoute.split(':')[1];
      return (
        <ProductDetailPage
          productSlugOrId={slugOrId}
          products={products}
          categories={categories}
          brands={brands}
          onNavigate={navigateTo}
          isPreview={slugOrId === 'preview'}
          previousRoute={previousRoute}
          currentUser={currentUser}
          onEditProduct={handleEditProductFromCatalog}
          comparisonList={comparisonList}
          onToggleComparison={handleToggleComparison}
        />
      );
    }

    if (currentRoute.startsWith('categoria/') || currentRoute.startsWith('category:')) {
      const catSlugOrId = currentRoute.includes('/') ? currentRoute.split('/')[1] : currentRoute.split(':')[1];
      const targetCat = categories.find(c => c.slug === catSlugOrId || c.id === catSlugOrId) || categories[0];
      return (
        <CategoryPage
          categoryId={targetCat.id}
          categories={categories}
          products={publicProducts}
          brands={brands}
          onSelectProduct={(p) => navigateTo(`produto/${p.slug || p.id}`)}
          isAdmin={isAdminView}
          onEditProduct={handleEditProductFromCatalog}
          onDeleteProduct={handleDeleteProduct}
          onNavigate={navigateTo}
          comparisonList={comparisonList}
          onToggleComparison={handleToggleComparison}
        />
      );
    }

    if (currentRoute.startsWith('marca/') || currentRoute.startsWith('brand:')) {
      const brandSlugOrId = currentRoute.includes('/') ? currentRoute.split('/')[1] : currentRoute.split(':')[1];
      const targetBrand = brands.find(b => b.slug === brandSlugOrId || b.id === brandSlugOrId) || brands[0];
      return (
        <BrandPage
          brandId={targetBrand.id}
          brands={brands}
          products={publicProducts}
          categories={categories}
          onSelectProduct={(p) => navigateTo(`produto/${p.slug || p.id}`)}
          isAdmin={isAdminView}
          onEditProduct={handleEditProductFromCatalog}
          onDeleteProduct={handleDeleteProduct}
          onNavigate={navigateTo}
          comparisonList={comparisonList}
          onToggleComparison={handleToggleComparison}
        />
      );
    }

    if (currentRoute === 'categories') {
      return (
        <div className="py-12">
          <div className="container-custom space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold shadow-xs">
                <Layers className="w-3.5 h-3.5 text-amber-600" /> Nossas Linhas de Produtos
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900">
                Explore por Categoria
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                Clique em qualquer categoria para visualizar a página de equipamentos dedicados.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((cat) => {
                const catProducts = publicProducts.filter((p) => p.categoryId === cat.id);
                return (
                  <div 
                    key={cat.id} 
                    onClick={() => navigateTo(`categoria/${cat.slug || cat.id}`)}
                    className="card p-6 bg-white border-slate-200 hover:border-amber-400 cursor-pointer flex flex-col justify-between space-y-4 group shadow-xs hover:shadow-md transition-all"
                  >
                    <div className="space-y-3">
                      <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                        <Layers className="w-6 h-6" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                        {cat.name}
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {cat.description}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-xs">
                      <span className="font-bold text-amber-700">
                        {catProducts.length} equipamento(s)
                      </span>
                      <span className="text-slate-500 group-hover:text-slate-900 flex items-center gap-1 font-bold">
                        Ver página <ArrowRight className="w-3.5 h-3.5 text-amber-600 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      );
    }

    if (currentRoute === 'brands') {
      return (
        <div className="py-12">
          <div className="container-custom space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-50 text-sky-800 border border-sky-200 text-xs font-bold shadow-xs">
                <Tag className="w-3.5 h-3.5 text-sky-600" /> Fabricantes & Parceiros
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900">
                Marcas de Confiança
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                Trabalhamos com os líderes do setor de equipamentos para oferecer alta performance.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {brands.map((b) => {
                const brandProducts = publicProducts.filter((p) => p.brandId === b.id);
                return (
                  <div 
                    key={b.id}
                    onClick={() => navigateTo(`marca/${b.slug || b.id}`)}
                    className="card p-6 bg-white border-slate-200 hover:border-sky-400 cursor-pointer flex flex-col justify-between space-y-4 group shadow-xs hover:shadow-md transition-all"
                  >
                    <div className="space-y-3">
                      <div className="w-full h-24 rounded-xl bg-slate-50 border border-slate-200 overflow-hidden flex items-center justify-center p-3">
                        <img 
                          src={b.logo || 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=200&auto=format&fit=crop&q=80'} 
                          alt={b.name} 
                          className="max-h-full object-contain filter group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-sky-600 transition-colors">
                        {b.name}
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {b.description}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-xs">
                      <span className="font-bold text-sky-600">
                        {brandProducts.length} equipamento(s)
                      </span>
                      <span className="text-slate-500 group-hover:text-slate-900 flex items-center gap-1 font-bold">
                        Ver página <ArrowRight className="w-3.5 h-3.5 text-sky-600 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      );
    }

    if (currentRoute === 'about' || currentRoute === 'sobre') {
      return <AboutPage />;
    }

    if (currentRoute === 'admin') {
      // Guard admin route: if not logged in, redirect to login page!
      if (!currentUser) {
        return (
          <LoginPage
            onLoginSuccess={handleLoginSuccess}
            onNavigate={navigateTo}
            API_BASE_URL={API_BASE_URL}
          />
        );
      }

      return (
        <AdminPanel
          products={products}
          categories={categories}
          brands={brands}
          onAddProduct={handleAddProduct}
          onUpdateProduct={handleUpdateProduct}
          onDeleteProduct={handleDeleteProduct}
          onReorderProducts={handleReorderProducts}
          onAddCategory={handleAddCategory}
          onUpdateCategory={handleUpdateCategory}
          onDeleteCategory={handleDeleteCategory}
          onReorderCategories={handleReorderCategories}
          onAddBrand={handleAddBrand}
          onUpdateBrand={handleUpdateBrand}
          onDeleteBrand={handleDeleteBrand}
          onReorderBrands={handleReorderBrands}
          showNotification={showNotification}
          editingProduct={editingProduct}
          setEditingProduct={setEditingProduct}
          onNavigate={navigateTo}
          currentUser={currentUser}
          onLogout={handleLogout}
          API_BASE_URL={API_BASE_URL}
        />
      );
    }

    if (currentRoute === '404') {
      return <NotFoundPage onNavigate={navigateTo} />;
    }

    if (currentRoute === '500') {
      return <ServerErrorPage onNavigate={navigateTo} onRetry={() => window.location.reload()} />;
    }

    // Default Catalog Page
    if (!currentRoute || currentRoute === 'catalog' || currentRoute === 'catalogo' || currentRoute === 'inicio' || currentRoute === 'home') {
      return (
        <>
          <HeroSlim
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            categories={categories}
            selectedCategory={selectedCategories[0] || 'all'}
            setSelectedCategory={(catId) => {
              if (catId === 'all') setSelectedCategories([]);
              else setSelectedCategories([catId]);
            }}
          />

          <Catalog
            products={publicProducts}
            categories={categories}
            brands={brands}
            selectedCategories={selectedCategories}
            setSelectedCategories={setSelectedCategories}
            selectedBrands={selectedBrands}
            setSelectedBrands={setSelectedBrands}
            maxPriceFilter={maxPriceFilter}
            setMaxPriceFilter={setMaxPriceFilter}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onSelectProduct={(product) => navigateTo(`produto/${product.slug || product.id}`)}
            isAdmin={isAdminView}
            onEditProduct={handleEditProductFromCatalog}
            onDeleteProduct={handleDeleteProduct}
            onOpenAddProduct={() => {
              setEditingProduct(null);
              navigateTo('admin');
            }}
            comparisonList={comparisonList}
            onToggleComparison={handleToggleComparison}
          />
        </>
      );
    }

    // Unrecognized route -> 404 Not Found Page
    return <NotFoundPage onNavigate={navigateTo} />;
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-amber-500 selection:text-white">
        
        {/* Header */}
        <Header
          activeTab={currentRoute}
          onNavigate={navigateTo}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          productsCount={publicProducts.length}
          categoriesCount={categories.length}
          brandsCount={brands.length}
          categories={categories}
          brands={brands}
          products={publicProducts}
        />

        {/* Main Page Content */}
        <main className="flex-1 pt-16 sm:pt-20">
          {renderCurrentPage()}
        </main>

      {/* Floating WhatsApp Action Button (Desktop Only) */}
      <a
        href="https://wa.me/5561983485671?text=Ol%C3%A1%21+Vim+pelo+site+da+Athena+Solu%C3%A7%C3%B5es+Automotivas+e+gostaria+de+um+or%C3%A7amento."
        target="_blank"
        rel="noopener noreferrer"
        className="hidden md:flex fixed bottom-6 right-6 z-40 p-3.5 rounded-full bg-emerald-600 text-white shadow-2xl hover:bg-emerald-500 hover:scale-110 active:scale-95 transition-all items-center gap-2 group text-xs font-extrabold"
        title="Falar no WhatsApp (61) 98348-5671"
      >
        <MessageCircle className="w-6 h-6 fill-current text-white shrink-0" />
        <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 text-white font-bold">
          (61) 98348-5671
        </span>
      </a>

      {/* Comparison Floating Action Bar */}
      <ComparisonFloatingBar
        comparisonList={comparisonList}
        onOpenModal={() => setIsComparisonModalOpen(true)}
        onRemoveItem={handleRemoveComparisonItem}
        onClearComparison={handleClearComparison}
      />

      {/* Side-by-Side Product Comparison Modal */}
      <ProductComparisonModal
        isOpen={isComparisonModalOpen}
        onClose={() => setIsComparisonModalOpen(false)}
        comparisonList={comparisonList}
        categories={categories}
        brands={brands}
        onRemoveItem={handleRemoveComparisonItem}
        onClearComparison={handleClearComparison}
        onNavigate={navigateTo}
      />

      {/* App-style Bottom Navigation Bar for Mobile */}
      <BottomNavBar activeTab={currentRoute} onNavigate={navigateTo} />

      {/* Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Footer */}
      <div className="pb-14 md:pb-0">
        <Footer setActiveTab={navigateTo} />
      </div>

    </div>
    </ErrorBoundary>
  );
}
