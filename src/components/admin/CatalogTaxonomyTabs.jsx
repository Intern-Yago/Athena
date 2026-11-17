import React from 'react';
import {
  FolderTree, Plus, Edit3, Trash2, Layers, Package, ArrowRight,
  Sparkles, GripVertical, ExternalLink, EyeOff, Eye, ArrowUp, ArrowDown,
  Tag, Globe
} from 'lucide-react';
import { MACRO_DEPARTMENTS } from '../../constants/departments';
import { MacroIcon } from './AdminUiPrimitives';

export default function CatalogTaxonomyTabs(props) {
  const {
    activeAdminTab,
    canEditContent,
    openNewDeptModal,
    departments,
    categories,
    products,
    setSelectedMacroForDetails,
    openEditDeptModal,
    handleDeleteDept,
    autoSortCategoriesByCount,
    openNewCategoryModal,
    categoryDeptFilter,
    setCategoryDeptFilter,
    getDepartmentByCategoryId,
    setDraggedCategoryId,
    dragOverCategoryId,
    setDragOverCategoryId,
    draggedCategoryId,
    handleCategoryDrop,
    openEditCategoryModal,
    toggleCategoryStatus,
    moveCategoryOrder,
    isAdminRole,
    askConfirmation,
    onDeleteCategory,
    showNotification,
    autoSortBrandsByCount,
    openNewBrandModal,
    brands,
    setDraggedBrandId,
    dragOverBrandId,
    setDragOverBrandId,
    draggedBrandId,
    handleBrandDrop,
    setPreviewingImage,
    openEditBrandModal,
    toggleBrandStatus,
    moveBrandOrder,
    onDeleteBrand
  } = props;

  return (
    <>
        {/* MACRO-CATEGORIES (DEPARTMENTS) MANAGEMENT TAB */}
        {activeAdminTab === 'departments' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FolderTree className="w-5 h-5 text-amber-600" />
                  <span>Gerenciar Macro-Categorias</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Grandes departamentos que organizam o catálogo da loja. Clique em qualquer macro para ver, reatribuir ou editar suas categorias.
                </p>
              </div>

              {canEditContent && (
                <button
                  type="button"
                  onClick={openNewDeptModal}
                  className="btn-gold text-xs font-bold py-2 px-3.5 flex items-center gap-1.5 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Nova Macro-Categoria</span>
                </button>
              )}
            </div>

            {/* Macro-Categories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
              {(departments || MACRO_DEPARTMENTS).map((dept) => {
                const deptCategories = categories.filter(c => {
                  if (c.departmentId) return c.departmentId === dept.id;
                  return (dept.categoryIds || []).includes(c.id);
                });
                const deptProductsCount = products.filter(p => deptCategories.some(c => c.id === p.categoryId)).length;

                return (
                  <div
                    key={dept.id}
                    onClick={() => setSelectedMacroForDetails(dept)}
                    className="bg-slate-50/70 hover:bg-white rounded-2xl border border-slate-200 hover:border-amber-400 hover:shadow-md transition-all p-5 flex flex-col justify-between group cursor-pointer relative"
                  >
                    <div>
                      {/* Top Header: Icon & Action buttons */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-700 flex items-center justify-center font-bold shadow-2xs group-hover:scale-105 transition-transform">
                          <MacroIcon name={dept.icon} className="w-5 h-5" />
                        </div>

                        {canEditContent && (
                          <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={(e) => openEditDeptModal(dept, e)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-700 hover:bg-amber-50 transition-colors"
                              title="Editar Nome, Nome Curto e Ícone desta Macro"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleDeleteDept(dept, e)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Excluir Macro-Categoria"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Title & Short Name */}
                      <h4 className="font-extrabold text-sm text-slate-900 group-hover:text-amber-700 transition-colors line-clamp-1 mb-0.5">
                        {dept.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 font-medium mb-3">
                        Abreviado: <span className="font-semibold text-slate-700">{dept.shortName || dept.name}</span>
                      </p>

                      {/* Stat Badges */}
                      <div className="flex items-center gap-2 mb-3">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-100/70 text-amber-900 font-bold text-[11px]">
                          <Layers className="w-3 h-3 text-amber-700" />
                          {deptCategories.length} categorias
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-200/80 text-slate-800 font-bold text-[11px]">
                          <Package className="w-3 h-3 text-slate-600" />
                          {deptProductsCount} produtos
                        </span>
                      </div>

                      {/* Category preview pills */}
                      {deptCategories.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {deptCategories.slice(0, 3).map((cat) => (
                            <span
                              key={cat.id}
                              className="px-2 py-0.5 bg-white border border-slate-200/80 rounded-md text-[10px] text-slate-600 font-medium truncate max-w-[130px]"
                            >
                              {cat.name}
                            </span>
                          ))}
                          {deptCategories.length > 3 && (
                            <span className="px-1.5 py-0.5 text-[10px] text-amber-700 font-bold">
                              +{deptCategories.length - 3} mais...
                            </span>
                          )}
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-400 italic mb-4">
                          Nenhuma categoria vinculada ainda.
                        </p>
                      )}
                    </div>

                    {/* Footer Button: Ver Categorias */}
                    <button
                      type="button"
                      onClick={() => setSelectedMacroForDetails(dept)}
                      className="w-full mt-2 py-2 px-3 rounded-xl bg-white hover:bg-amber-500 hover:text-slate-950 text-slate-700 text-xs font-bold border border-slate-200 hover:border-amber-500 shadow-2xs flex items-center justify-center gap-2 transition-all cursor-pointer group-hover:border-amber-400"
                    >
                      <span>Gerenciar Categorias ({deptCategories.length})</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* CATEGORIES MANAGEMENT TAB */}
        {activeAdminTab === 'categories' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Gerenciar & Reordenar Categorias</h3>
                <p className="text-xs text-slate-500">Defina a ordem de exibição comercial no filtro e o Macro-Departamento pai.</p>
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

            {/* Filter by Macro-Department Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="text-xs font-bold text-slate-700">Filtrar por Macro-Departamento:</span>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={categoryDeptFilter}
                  onChange={(e) => setCategoryDeptFilter(e.target.value)}
                  className="form-input text-xs py-1.5 px-3 min-w-[240px] bg-white font-medium"
                >
                  <option value="all">Todos os Macro-Departamentos ({categories.length})</option>
                  {(departments || MACRO_DEPARTMENTS).map(dept => {
                    const count = categories.filter(c => {
                      if (c.departmentId) return c.departmentId === dept.id;
                      return (dept.categoryIds || []).includes(c.id);
                    }).length;
                    return (
                      <option key={dept.id} value={dept.id}>
                        {dept.name} ({count})
                      </option>
                    );
                  })}
                </select>
                {categoryDeptFilter !== 'all' && (
                  <button
                    onClick={() => setCategoryDeptFilter('all')}
                    className="text-xs text-amber-700 hover:text-amber-800 font-bold hover:underline shrink-0"
                  >
                    Ver Todas
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {categories
                .filter(cat => {
                  if (categoryDeptFilter === 'all') return true;
                  if (cat.departmentId) return cat.departmentId === categoryDeptFilter;
                  const dept = (departments || MACRO_DEPARTMENTS).find(d => d.id === categoryDeptFilter);
                  return dept ? (dept.categoryIds || []).includes(cat.id) : false;
                })
                .map((cat, idx) => {
                  const dept = getDepartmentByCategoryId(cat.id, categories, departments);
                  return (
                <div 
                  key={cat.id} 
                  draggable={canEditContent}
                  onDragStart={(e) => {
                    if (!canEditContent) return;
                    e.dataTransfer.effectAllowed = 'move';
                    e.dataTransfer.setData('text/plain', cat.id);
                    setDraggedCategoryId(cat.id);
                  }}
                  onDragOver={(e) => {
                    if (!canEditContent) return;
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                    if (dragOverCategoryId !== cat.id) {
                      setDragOverCategoryId(cat.id);
                    }
                  }}
                  onDragLeave={() => {
                    if (dragOverCategoryId === cat.id) {
                      setDragOverCategoryId(null);
                    }
                  }}
                  onDrop={(e) => {
                    if (!canEditContent) return;
                    e.preventDefault();
                    const sourceId = draggedCategoryId || e.dataTransfer.getData('text/plain');
                    handleCategoryDrop(sourceId, cat.id);
                  }}
                  onDragEnd={() => {
                    setDraggedCategoryId(null);
                    setDragOverCategoryId(null);
                  }}
                  className={`p-3.5 rounded-xl border flex items-center justify-between transition-all select-none ${
                    draggedCategoryId === cat.id
                      ? 'opacity-30 bg-amber-50 border-amber-300'
                      : dragOverCategoryId === cat.id
                      ? 'bg-amber-100/70 border-amber-500 ring-2 ring-amber-400 scale-[1.01] shadow-md'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {canEditContent && (
                      <div 
                        className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-amber-600 p-1 rounded shrink-0"
                        title="Segure e arraste para reordenar a categoria"
                      >
                        <GripVertical className="w-4 h-4" />
                      </div>
                    )}
                    <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 font-extrabold text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span 
                          onClick={() => canEditContent && openEditCategoryModal(cat)}
                          className={`font-bold text-xs text-slate-900 ${canEditContent ? 'cursor-pointer hover:text-amber-600 hover:underline' : ''}`}
                          title={canEditContent ? "Clique para editar esta categoria" : undefined}
                        >
                          {cat.name}
                        </span>
                        {dept && (
                          <span 
                            className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[10px] font-semibold border border-amber-200/60"
                            title={`Macro-Departamento: ${dept.name}`}
                          >
                            {dept.shortName}
                          </span>
                        )}
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
                  );
                })}
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
                <div 
                  key={b.id} 
                  draggable={canEditContent}
                  onDragStart={(e) => {
                    if (!canEditContent) return;
                    e.dataTransfer.effectAllowed = 'move';
                    e.dataTransfer.setData('text/plain', b.id);
                    setDraggedBrandId(b.id);
                  }}
                  onDragOver={(e) => {
                    if (!canEditContent) return;
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                    if (dragOverBrandId !== b.id) {
                      setDragOverBrandId(b.id);
                    }
                  }}
                  onDragLeave={() => {
                    if (dragOverBrandId === b.id) {
                      setDragOverBrandId(null);
                    }
                  }}
                  onDrop={(e) => {
                    if (!canEditContent) return;
                    e.preventDefault();
                    const sourceId = draggedBrandId || e.dataTransfer.getData('text/plain');
                    handleBrandDrop(sourceId, b.id);
                  }}
                  onDragEnd={() => {
                    setDraggedBrandId(null);
                    setDragOverBrandId(null);
                  }}
                  className={`p-3.5 rounded-xl border flex items-center justify-between transition-all select-none ${
                    draggedBrandId === b.id
                      ? 'opacity-30 bg-sky-50 border-sky-300'
                      : dragOverBrandId === b.id
                      ? 'bg-sky-100/70 border-sky-500 ring-2 ring-sky-400 scale-[1.01] shadow-md'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {canEditContent && (
                      <div 
                        className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-sky-600 p-1 rounded shrink-0"
                        title="Segure e arraste para reordenar a marca"
                      >
                        <GripVertical className="w-4 h-4" />
                      </div>
                    )}
                    <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-800 font-extrabold text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>

                    <div 
                      onClick={() => b.logo && setPreviewingImage(b.logo)}
                      className={`w-12 h-10 rounded-lg bg-white border border-slate-200 overflow-hidden flex items-center justify-center p-1 shrink-0 ${
                        b.logo ? 'cursor-zoom-in hover:border-sky-400 hover:shadow-sm group transition-all' : ''
                      }`}
                      title={b.logo ? "Clique para expandir a logo da marca" : undefined}
                    >
                      {b.logo ? (
                        <img src={b.logo} alt={b.name} className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform" />
                      ) : (
                        <Tag className="w-5 h-5 text-slate-400" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span 
                          onClick={() => canEditContent && openEditBrandModal(b)}
                          className={`font-bold text-xs text-slate-900 ${canEditContent ? 'cursor-pointer hover:text-sky-700 hover:underline' : ''}`}
                          title={canEditContent ? "Clique para editar esta marca" : undefined}
                        >
                          {b.name}
                        </span>
                        {b.status === 'draft' && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-500 text-white text-[9px] font-bold">
                            Rascunho
                          </span>
                        )}
                        {b.isAuthorized && (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[9px] font-bold border border-emerald-300">
                            {b.authorizationLabel || 'Autorizada'}
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
    </>
  );
}
