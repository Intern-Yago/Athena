import React, { useState } from 'react';
import { 
  Tag, 
  Plus, 
  Package, 
  Copy, 
  ArrowUp, 
  ArrowDown, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  AlertTriangle, 
  Upload, 
  Images, 
  Loader2 
} from 'lucide-react';

export default function ProductVariantsManager({
  productForm,
  setProductForm,
  showNotification,
  isProductQuoteOnly,
  getVariantAvailability,
  formatBRL,
  onOpenMediaLibrary,
  apiBaseUrl,
  getAuthHeaders
}) {
  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
  const [editingVariantIndex, setEditingVariantIndex] = useState(null);
  const [variantModalForm, setVariantModalForm] = useState({
    id: '',
    name: '',
    sku: '',
    omieCode: '',
    omieProductId: null,
    colorHex: '',
    price: '',
    image: '',
    stockQty: '',
    statusControl: 'auto',
    isActive: true,
    showInCatalog: true,
  });
  const [isDraggingVariantImage, setIsDraggingVariantImage] = useState(false);
  const [isUploadingVariantImage, setIsUploadingVariantImage] = useState(false);

  const handleOpenAddVariantModal = () => {
    setEditingVariantIndex(null);
    setVariantModalForm({
      id: `var_${Date.now()}`,
      name: '',
      sku: '',
      omieCode: '',
      omieProductId: null,
      colorHex: '',
      price: '',
      image: '',
      stockQty: '',
      statusControl: 'auto',
      isActive: true,
      showInCatalog: true,
    });
    setIsVariantModalOpen(true);
  };

  const handleOpenEditVariantModal = (index) => {
    const v = (productForm.variants || [])[index];
    if (!v) return;
    setEditingVariantIndex(index);
    let initialControl = v.statusControl;
    if (!initialControl) {
      if (v.isActive === false) initialControl = 'manual_inactive';
      else if (v.isManualForce) initialControl = 'manual_active';
      else initialControl = 'auto';
    }
    setVariantModalForm({
      id: v.id || `var_${Date.now()}_${index}`,
      name: v.name || '',
      sku: v.sku || '',
      omieCode: v.omieCode || '',
      omieProductId: v.omieProductId || null,
      colorHex: v.colorHex || '',
      price: v.price !== undefined && v.price !== null ? v.price : '',
      image: v.image || '',
      stockQty: v.stockQty !== undefined && v.stockQty !== null ? v.stockQty : '',
      statusControl: initialControl,
      isActive: initialControl !== 'manual_inactive',
      showInCatalog: v.showInCatalog !== false,
    });
    setIsVariantModalOpen(true);
  };

  const handleSaveVariantModal = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!variantModalForm.name.trim()) {
      showNotification('Preencha o Nome da Opção (ex: Vermelho, 7 Gavetas, 220V).', 'error');
      return;
    }

    const control = variantModalForm.statusControl || 'auto';
    const isAct = control !== 'manual_inactive';

    const cleanedVariant = {
      id: variantModalForm.id || `var_${Date.now()}`,
      name: variantModalForm.name.trim(),
      sku: (variantModalForm.sku || '').trim(),
      omieCode: (variantModalForm.omieCode || variantModalForm.sku || '').trim(),
      omieProductId: variantModalForm.omieProductId ? Number(variantModalForm.omieProductId) : null,
      colorHex: (variantModalForm.colorHex || '').trim(),
      price: variantModalForm.price !== '' ? Number(variantModalForm.price) : '',
      image: (variantModalForm.image || '').trim(),
      stockQty: variantModalForm.stockQty !== '' ? Number(variantModalForm.stockQty) : '',
      statusControl: control,
      isManualForce: control === 'manual_active',
      isActive: isAct,
      showInCatalog: variantModalForm.showInCatalog !== false,
    };

    setProductForm((prev) => {
      const list = [...(prev.variants || [])];
      if (editingVariantIndex !== null && editingVariantIndex >= 0 && editingVariantIndex < list.length) {
        list[editingVariantIndex] = cleanedVariant;
      } else {
        list.push(cleanedVariant);
      }
      return { ...prev, variants: list };
    });

    setIsVariantModalOpen(false);
    setEditingVariantIndex(null);
    showNotification(
      editingVariantIndex !== null ? 'Variação atualizada com sucesso!' : 'Variação adicionada!', 
      'success'
    );
  };

  const handleDuplicateVariant = (index) => {
    const v = (productForm.variants || [])[index];
    if (!v) return;
    const cloned = {
      ...v,
      id: `var_${Date.now()}`,
      name: `${v.name} (Cópia)`,
      sku: v.sku ? `${v.sku}-CP` : '',
    };
    setProductForm((prev) => ({
      ...prev,
      variants: [...(prev.variants || []), cloned]
    }));
    showNotification(`Variação "${v.name}" duplicada.`, 'info');
  };

  const handleMoveVariant = (index, direction) => {
    setProductForm((prev) => {
      const list = [...(prev.variants || [])];
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= list.length) return prev;
      const [item] = list.splice(index, 1);
      list.splice(targetIndex, 0, item);
      return { ...prev, variants: list };
    });
  };

  const handleDeleteVariant = (index) => {
    const v = (productForm.variants || [])[index];
    setProductForm((prev) => ({
      ...prev,
      variants: (prev.variants || []).filter((_, idx) => idx !== index)
    }));
    showNotification(`Opção "${v?.name || 'Variação'}" removida.`, 'info');
  };

  const handleToggleVariantCatalog = (index) => {
    setProductForm((prev) => {
      const list = [...(prev.variants || [])];
      if (!list[index]) return prev;
      const current = list[index].showInCatalog !== false;
      list[index] = { ...list[index], showInCatalog: !current };
      return { ...prev, variants: list };
    });
  };

  const handleVariantStatusControlChange = (index, newControl) => {
    setProductForm((prev) => {
      const list = [...(prev.variants || [])];
      if (!list[index]) return prev;
      list[index] = {
        ...list[index],
        statusControl: newControl,
        isManualForce: newControl === 'manual_active',
        isActive: newControl !== 'manual_inactive'
      };
      return { ...prev, variants: list };
    });
  };

  const handleVariantImageFileUpload = async (file) => {
    if (!file || !file.type.startsWith('image/')) {
      showNotification('Selecione uma imagem válida para a variação.', 'error');
      return;
    }

    setIsUploadingVariantImage(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64Data = e.target.result;
      setVariantModalForm((prev) => ({ ...prev, image: base64Data }));
      showNotification('Enviando foto da variação para a nuvem...', 'info');

      try {
        const cleanName = (variantModalForm.name || 'variacao').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-');
        const headers = getAuthHeaders ? getAuthHeaders() : { 'Content-Type': 'application/json' };
        const res = await fetch(`${apiBaseUrl || '/api'}/upload`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            file: base64Data,
            folder: 'athena_variacoes',
            filename: `var-${cleanName}-${Date.now().toString(36)}`
          })
        });

        if (res.ok) {
          const data = await res.json();
          setVariantModalForm((prev) => ({ ...prev, image: data.url }));
          showNotification('Foto da variação salva na nuvem R2!', 'success');
        } else {
          showNotification('Foto salva localmente na variação.', 'info');
        }
      } catch (err) {
        showNotification('Foto da variação salva localmente.', 'info');
      } finally {
        setIsUploadingVariantImage(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDropVariantImage = (e) => {
    e.preventDefault();
    setIsDraggingVariantImage(false);
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleVariantImageFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handlePasteVariantModal = (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          e.preventDefault();
          handleVariantImageFileUpload(file);
          break;
        }
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <Tag className="w-4 h-4 text-amber-600" />
              <span>Variações do Produto (Cores, Tamanhos & Estoque Omie)</span>
            </h4>
            {Array.isArray(productForm.variants) && productForm.variants.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300">
                {productForm.variants.length} {productForm.variants.length === 1 ? 'opção' : 'opções'}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Unifique opções em uma única vitrine com SKUs, saldos de estoque e fotos exclusivas por variação.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAddVariantModal}
          className="px-3.5 py-2 rounded-xl text-xs font-bold text-amber-900 bg-amber-100/90 hover:bg-amber-200/90 border border-amber-300 shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 text-amber-800" />
          <span>Nova Variação</span>
        </button>
      </div>

      {/* Aviso de Herança de Preço Sob Consulta */}
      {isProductQuoteOnly(productForm) && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-extrabold text-amber-950">Aviso: Equipamento em modo "Sob Consulta"</p>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              Como o produto principal está com preço a combinar ou sem valor numérico definido, <strong>todas as opções herdam o modo Sob Consulta no site</strong>. A compra direta online é desabilitada em favor do botão de orçamento via WhatsApp.
            </p>
          </div>
        </div>
      )}

      {(!productForm.variants || productForm.variants.length === 0) ? (
        <div className="py-8 px-4 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/60 text-center space-y-2.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 mx-auto flex items-center justify-center shadow-2xs">
            <Tag className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-800">Nenhuma variação cadastrada</p>
            <p className="text-[11px] text-slate-500 max-w-md mx-auto">
              Este equipamento será exibido como produto individual. Adicione opções como Vermelho, Azul, 5 Gavetas ou 220V para disponibilizar opções de escolha ao cliente.
            </p>
          </div>
          <button
            type="button"
            onClick={handleOpenAddVariantModal}
            className="btn-gold text-xs font-bold py-2 px-4 rounded-xl shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Adicionar Primeira Variação</span>
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-2xs">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-black uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <th className="py-3 px-3 w-14 text-center">Foto</th>
                <th className="py-3 px-3">Nome da Opção</th>
                <th className="py-3 px-3">SKU / Omie</th>
                <th className="py-3 px-3">Cor Visual</th>
                <th className="py-3 px-3">Preço / Estoque</th>
                <th className="py-3 px-3 text-center min-w-[150px]">Status de Venda</th>
                <th className="py-3 px-3 text-center">Catálogo</th>
                <th className="py-3 px-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {productForm.variants.map((v, idx) => {
                const variantAvail = getVariantAvailability(v, productForm);
                const isParentQuote = isProductQuoteOnly(productForm);
                const currentControl = v.statusControl || (v.isActive === false ? 'manual_inactive' : (v.isManualForce ? 'manual_active' : 'auto'));
                const isOptCatalog = v.showInCatalog !== false;
                const displayPhoto = v.image || productForm.image || (Array.isArray(productForm.images) && productForm.images[0]);
                return (
                  <tr 
                    key={v.id || idx} 
                    className={`hover:bg-slate-50/80 transition-colors ${!variantAvail.canBuy && !isParentQuote ? 'opacity-65 bg-slate-50/40' : ''}`}
                  >
                    {/* Foto */}
                    <td className="py-2.5 px-3 text-center">
                      <div className="w-10 h-10 rounded-lg border border-slate-200 bg-slate-50 p-0.5 mx-auto overflow-hidden flex items-center justify-center relative group">
                        {displayPhoto ? (
                          <img src={displayPhoto} alt={v.name} className="w-full h-full object-contain" />
                        ) : (
                          <Package className="w-4 h-4 text-slate-300" />
                        )}
                        {!v.image && (
                          <span className="absolute bottom-0 inset-x-0 bg-slate-900/80 text-[8px] text-slate-200 font-bold text-center leading-tight py-0.5">
                            Herda
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Nome da Opção */}
                    <td className="py-2.5 px-3">
                      <p className="font-extrabold text-slate-900 leading-snug">{v.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">{v.id}</p>
                    </td>

                    {/* SKU / Omie */}
                    <td className="py-2.5 px-3">
                      {v.sku || v.omieCode ? (
                        <div className="space-y-0.5">
                          <span className="font-mono text-[11px] font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 inline-block">
                            {v.sku || v.omieCode}
                          </span>
                          {v.omieProductId && (
                            <p className="text-[9px] text-slate-400 font-mono">ID: {v.omieProductId}</p>
                          )}
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Não vinculado</span>
                      )}
                    </td>

                    {/* Cor Visual */}
                    <td className="py-2.5 px-3">
                      {v.colorHex ? (
                        <div className="flex items-center gap-1.5">
                          <span 
                            className="w-4 h-4 rounded-full border border-slate-300 shadow-2xs inline-block shrink-0" 
                            style={{ backgroundColor: v.colorHex }} 
                          />
                          <span className="font-mono text-[11px] text-slate-600 font-semibold">{v.colorHex}</span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Botão de texto</span>
                      )}
                    </td>

                    {/* Preço / Estoque */}
                    <td className="py-2.5 px-3">
                      <div className="space-y-0.5">
                        <p className="font-bold text-slate-800 text-[11px]">
                          {v.price !== undefined && v.price !== null && v.price !== '' && Number(v.price) > 0 ? (
                            formatBRL(v.price)
                          ) : (
                            <span className="text-slate-400 font-normal">Herda base ({productForm.price ? formatBRL(productForm.price) : 'R$ 0,00'})</span>
                          )}
                        </p>
                        <p className="text-[10px] text-slate-500 font-medium">
                          {v.stockQty !== undefined && v.stockQty !== null && v.stockQty !== '' ? (
                            Number(v.stockQty) > 0 ? (
                              <span className="text-emerald-700 font-semibold">{v.stockQty} un em estoque</span>
                            ) : (
                              <span className="text-red-600 font-semibold">0 un (Esgotado)</span>
                            )
                          ) : (
                            <span className="text-slate-400 italic">Sem estoque próprio</span>
                          )}
                        </p>
                      </div>
                    </td>

                    {/* Status de Venda */}
                    <td className="py-2.5 px-3 text-center">
                      <div className="inline-flex flex-col items-center gap-1">
                        <select
                          value={currentControl}
                          onChange={(e) => handleVariantStatusControlChange(idx, e.target.value)}
                          className={`text-[10px] font-bold py-1 px-2 rounded-lg border cursor-pointer outline-none transition-colors ${
                            currentControl === 'manual_active' 
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                              : currentControl === 'manual_inactive'
                              ? 'bg-red-50 text-red-800 border-red-300'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          <option value="auto">Automático (Estoque)</option>
                          <option value="manual_active">Forçar Ativa (Manual)</option>
                          <option value="manual_inactive">Forçar Desativada</option>
                        </select>
                        <span className={`text-[9px] font-semibold ${
                          variantAvail.canBuy 
                            ? 'text-emerald-600' 
                            : isParentQuote 
                            ? 'text-amber-700' 
                            : 'text-red-500'
                        }`}>
                          {variantAvail.label}
                        </span>
                      </div>
                    </td>

                    {/* Catálogo */}
                    <td className="py-2.5 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleVariantCatalog(idx)}
                        className={`text-[10px] font-bold py-1 px-2 rounded-md transition-colors cursor-pointer border ${
                          isOptCatalog 
                            ? 'bg-amber-50 text-amber-900 border-amber-300' 
                            : 'bg-slate-100 text-slate-400 border-slate-200'
                        }`}
                        title={isOptCatalog ? 'Exibindo no card do catálogo' : 'Oculto no card do catálogo'}
                      >
                        {isOptCatalog ? 'Visível' : 'Oculto'}
                      </button>
                    </td>

                    {/* Ações */}
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleMoveVariant(idx, -1)}
                          disabled={idx === 0}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg disabled:opacity-30 disabled:pointer-events-none cursor-pointer transition-colors"
                          title="Mover para cima"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveVariant(idx, 1)}
                          disabled={idx === productForm.variants.length - 1}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg disabled:opacity-30 disabled:pointer-events-none cursor-pointer transition-colors"
                          title="Mover para baixo"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDuplicateVariant(idx)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
                          title="Duplicar opção"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEditVariantModal(idx)}
                          className="p-1.5 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded-lg cursor-pointer transition-colors font-bold flex items-center gap-1"
                          title="Editar variação completa"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteVariant(idx)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
                          title="Excluir opção"
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
      )}

      {/* DEDICATED PRODUCT VARIANT MODAL */}
      {isVariantModalOpen && (
        <div 
          className="modal-backdrop !z-[120] p-3 sm:p-6" 
          onClick={() => {
            setIsVariantModalOpen(false);
            setEditingVariantIndex(null);
          }}
          onPaste={handlePasteVariantModal}
        >
          <div 
            className="modal-content !max-w-2xl !p-0 bg-white border border-slate-200 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center shrink-0">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                    {editingVariantIndex !== null ? 'Editar Variação' : 'Nova Variação do Produto'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Configure nome, SKU Omie, estoque, cor e foto exclusiva desta opção.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsVariantModalOpen(false);
                  setEditingVariantIndex(null);
                }}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
                title="Fechar modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSaveVariantModal} className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
              {/* 1. Nome da Opção */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span>Nome da Opção</span>
                  <span className="text-amber-600">*</span>
                  <span className="text-[11px] font-normal text-slate-400">(ex: Vermelho, 7 Gavetas, 220V)</span>
                </label>
                <input
                  type="text"
                  required
                  value={variantModalForm.name}
                  onChange={(e) => setVariantModalForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Vermelho, 220V, 5 Gavetas..."
                  className="form-input text-sm font-semibold"
                  autoFocus
                />
                <p className="text-[11px] text-slate-500">
                  Texto exibido no seletor da página do produto, no carrinho e nos pedidos.
                </p>
              </div>

              {/* 2. SKU Omie, Código Omie & Estoque */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 block">
                    Código SKU no Omie
                  </label>
                  <input
                    type="text"
                    value={variantModalForm.sku}
                    onChange={(e) => setVariantModalForm(prev => ({ ...prev, sku: e.target.value }))}
                    placeholder="Ex: WLF-CAR-VM"
                    className="form-input text-xs font-mono"
                  />
                  <p className="text-[10px] text-slate-400">
                    Código alfanumérico / SKU no ERP.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 block">
                    Cód. Numérico Omie
                  </label>
                  <input
                    type="text"
                    value={variantModalForm.omieCode || ''}
                    onChange={(e) => setVariantModalForm(prev => ({ ...prev, omieCode: e.target.value }))}
                    placeholder="Ex: 892011"
                    className="form-input text-xs font-mono"
                  />
                  <p className="text-[10px] text-slate-400">
                    Código interno Omie (opcional).
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 block">
                    Estoque (unidades)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={variantModalForm.stockQty}
                    onChange={(e) => setVariantModalForm(prev => ({ ...prev, stockQty: e.target.value }))}
                    placeholder="Saldo Omie ou 0"
                    className="form-input text-xs"
                  />
                  <p className="text-[10px] text-slate-400">
                    Saldo sincronizado no ERP.
                  </p>
                </div>
              </div>

              {/* 3. Cor Visual & Preço Específico */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Cor */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 block">
                    Cor (Bolinha)
                  </label>
                  <div className="flex items-center gap-2">
                    <label 
                      className="relative cursor-pointer w-10 h-10 rounded-xl border-2 border-slate-300 shadow-2xs overflow-hidden shrink-0 flex items-center justify-center hover:scale-105 transition-transform" 
                      style={{ backgroundColor: variantModalForm.colorHex || '#f8fafc' }} 
                      title="Clique para escolher na paleta de cores"
                    >
                      <input
                        type="color"
                        value={variantModalForm.colorHex || '#DC2626'}
                        onChange={(e) => setVariantModalForm(prev => ({ ...prev, colorHex: e.target.value }))}
                        className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                      />
                    </label>
                    <input
                      type="text"
                      value={variantModalForm.colorHex}
                      onChange={(e) => setVariantModalForm(prev => ({ ...prev, colorHex: e.target.value }))}
                      placeholder="#HEX"
                      className="form-input text-xs font-mono uppercase flex-1"
                    />
                    {variantModalForm.colorHex && (
                      <button
                        type="button"
                        onClick={() => setVariantModalForm(prev => ({ ...prev, colorHex: '' }))}
                        className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 text-xs shrink-0 cursor-pointer"
                        title="Remover cor (vira botão de texto puro)"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Preencha apenas se for opção de cor para exibir bolinhas no catálogo.
                  </p>
                </div>

                {/* Preço Específico */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 block">
                    Preço Específico (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={variantModalForm.price}
                    onChange={(e) => setVariantModalForm(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="Opcional (herda padrão)"
                    className="form-input text-xs font-mono"
                  />
                  <p className="text-[10px] text-slate-400">
                    Se vazio, herda o preço base do produto ({productForm.price ? formatBRL(productForm.price) : 'R$ 0,00'}).
                  </p>
                </div>
              </div>

              {/* 4. Status & Visibilidade (Controle Automático ou Prioridade Manual) */}
              <div className="space-y-3 pt-1">
                {isProductQuoteOnly(productForm) && (
                  <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <p className="font-extrabold text-amber-950">Aviso: Equipamento em modo "Sob Consulta"</p>
                      <p className="text-[11px] text-amber-800 leading-relaxed">
                        O equipamento principal está marcado como <strong>Sob Consulta</strong> (preço a combinar / R$ 0,00). 
                        Por isso, no site, esta opção será exibida exclusivamente para <strong>cotação/orçamento</strong>, independente das opções abaixo.
                      </p>
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 block">
                      Disponibilidade & Regra de Venda no Site
                    </label>
                    <span className="text-[11px] text-slate-500">
                      Sua escolha manual tem <strong className="text-slate-800">prioridade máxima</strong>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <label 
                      className={`p-3 rounded-2xl border text-xs cursor-pointer flex flex-col gap-1 transition-all ${
                        (!variantModalForm.statusControl || variantModalForm.statusControl === 'auto')
                          ? 'border-amber-500 bg-amber-50/60 ring-2 ring-amber-500/20 text-amber-950'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold">Automático</span>
                        <input
                          type="radio"
                          name="variantStatusControl"
                          value="auto"
                          checked={!variantModalForm.statusControl || variantModalForm.statusControl === 'auto'}
                          onChange={() => setVariantModalForm(prev => ({ ...prev, statusControl: 'auto' }))}
                          className="accent-amber-600"
                        />
                      </div>
                      <p className="text-[10px] text-slate-500 leading-tight">
                        Ativa se houver estoque; desativa automaticamente se o estoque zerar.
                      </p>
                    </label>

                    <label 
                      className={`p-3 rounded-2xl border text-xs cursor-pointer flex flex-col gap-1 transition-all ${
                        variantModalForm.statusControl === 'manual_active'
                          ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20 text-emerald-950'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-emerald-900">Forçar Ativa</span>
                        <input
                          type="radio"
                          name="variantStatusControl"
                          value="manual_active"
                          checked={variantModalForm.statusControl === 'manual_active'}
                          onChange={() => setVariantModalForm(prev => ({ ...prev, statusControl: 'manual_active' }))}
                          className="accent-emerald-600"
                        />
                      </div>
                      <p className="text-[10px] text-emerald-700 leading-tight">
                        Disponível no site mesmo sem estoque (ex: sob encomenda).
                      </p>
                    </label>

                    <label 
                      className={`p-3 rounded-2xl border text-xs cursor-pointer flex flex-col gap-1 transition-all ${
                        variantModalForm.statusControl === 'manual_inactive'
                          ? 'border-red-500 bg-red-50/60 ring-2 ring-red-500/20 text-red-950'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-red-900">Desativar</span>
                        <input
                          type="radio"
                          name="variantStatusControl"
                          value="manual_inactive"
                          checked={variantModalForm.statusControl === 'manual_inactive'}
                          onChange={() => setVariantModalForm(prev => ({ ...prev, statusControl: 'manual_inactive' }))}
                          className="accent-red-600"
                        />
                      </div>
                      <p className="text-[10px] text-red-700 leading-tight">
                        Desativa a opção mesmo se houver estoque cadastrado.
                      </p>
                    </label>
                  </div>
                </div>

                {/* Exibição no Catálogo */}
                <div className="pt-1">
                  <label className="flex items-center gap-3 p-3 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={variantModalForm.showInCatalog !== false}
                      onChange={(e) => setVariantModalForm(prev => ({ ...prev, showInCatalog: e.target.checked }))}
                      className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500"
                    />
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-slate-800">
                        Exibir miniatura/bolinha desta opção no card do catálogo
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Permite que clientes vejam que este produto tem variações antes mesmo de abrir a página de detalhes.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* 5. Foto Específica desta Opção */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 block">
                    URL da Foto desta Opção (opcional — herda foto principal se vazio)
                  </label>
                  {variantModalForm.image && (
                    <button
                      type="button"
                      onClick={() => setVariantModalForm(prev => ({ ...prev, image: '' }))}
                      className="text-[11px] text-red-600 hover:text-red-700 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Remover foto</span>
                    </button>
                  )}
                </div>

                {/* Dropzone & Preview Area */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDraggingVariantImage(true); }}
                  onDragLeave={() => setIsDraggingVariantImage(false)}
                  onDrop={handleDropVariantImage}
                  className={`relative rounded-2xl border-2 border-dashed p-4 transition-all text-center ${
                    isDraggingVariantImage 
                      ? 'border-amber-500 bg-amber-50/80 scale-[1.01]' 
                      : variantModalForm.image 
                      ? 'border-slate-200 bg-slate-50/40' 
                      : 'border-slate-300 bg-slate-50/80 hover:bg-slate-50 hover:border-amber-400'
                  }`}
                >
                  {variantModalForm.image ? (
                    <div className="flex items-center justify-center gap-4 flex-wrap">
                      <div className="w-24 h-24 rounded-xl border border-slate-300 bg-white p-1 shadow-sm overflow-hidden flex items-center justify-center shrink-0">
                        <img 
                          src={variantModalForm.image} 
                          alt={variantModalForm.name || 'Variação'} 
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="text-left space-y-2">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                          Foto personalizada ativa
                        </span>
                        <div className="flex items-center gap-2">
                          {onOpenMediaLibrary && (
                            <button
                              type="button"
                              onClick={() => onOpenMediaLibrary((url) => {
                                setVariantModalForm(prev => ({ ...prev, image: url }));
                              })}
                              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 shadow-2xs flex items-center gap-1.5 cursor-pointer"
                            >
                              <Images className="w-3.5 h-3.5 text-amber-600" />
                              <span>Trocar pela Biblioteca R2</span>
                            </button>
                          )}
                          <label className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 shadow-2xs flex items-center gap-1.5 cursor-pointer">
                            <Upload className="w-3.5 h-3.5 text-slate-600" />
                            <span>Subir Arquivo</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  handleVariantImageFileUpload(e.target.files[0]);
                                }
                              }}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-3 space-y-2.5">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto shadow-2xs">
                        {isUploadingVariantImage ? (
                          <Loader2 className="w-5 h-5 animate-spin text-amber-600" />
                        ) : (
                          <Upload className="w-5 h-5" />
                        )}
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-slate-800">
                          {isUploadingVariantImage ? 'Enviando imagem...' : 'Arraste uma foto aqui, cole com Ctrl+V ou escolha:'}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Formatos suportados: WebP, PNG, JPG, GIF
                        </p>
                      </div>

                      <div className="flex items-center justify-center gap-2 pt-1 flex-wrap">
                        <label className="btn-secondary text-xs font-bold py-1.5 px-3 rounded-xl gap-1.5 inline-flex items-center cursor-pointer shadow-2xs">
                          <Upload className="w-3.5 h-3.5 text-slate-600" />
                          <span>Enviar do Computador</span>
                          <input
                            type="file"
                            accept="image/*"
                            disabled={isUploadingVariantImage}
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                handleVariantImageFileUpload(e.target.files[0]);
                              }
                            }}
                            className="hidden"
                          />
                        </label>

                        {onOpenMediaLibrary && (
                          <button
                            type="button"
                            disabled={isUploadingVariantImage}
                            onClick={() => onOpenMediaLibrary((url) => {
                              setVariantModalForm(prev => ({ ...prev, image: url }));
                            })}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-100 hover:bg-amber-200 border border-amber-300 text-amber-900 shadow-2xs flex items-center gap-1.5 cursor-pointer"
                          >
                            <Images className="w-3.5 h-3.5 text-amber-700" />
                            <span>Biblioteca R2</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-1">
                  <input
                    type="url"
                    value={variantModalForm.image}
                    onChange={(e) => setVariantModalForm(prev => ({ ...prev, image: e.target.value }))}
                    placeholder="Ou cole a URL direta da imagem (ex: https://...)"
                    className="form-input text-xs font-mono"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsVariantModalOpen(false);
                    setEditingVariantIndex(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="btn-gold text-xs font-bold py-2.5 px-6 rounded-xl shadow-xs cursor-pointer flex items-center gap-2"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>{editingVariantIndex !== null ? 'Salvar Variação' : 'Adicionar Variação'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
