import React from 'react';
import {
  Images, Plus, Clock, Link as LinkIcon, ExternalLink, ArrowUp, ArrowDown,
  Eye, EyeOff, Edit3, Trash2, Sparkles, Check, Layers, CheckCircle2
} from 'lucide-react';
import SmartLinkPicker from '../SmartLinkPicker';
import PromoPopupModal from '../PromoPopupModal';

export default function BannersPopupTab(props) {
  const {
    canEditContent,
    openNewBannerModal,
    banners,
    openEditBannerModal,
    getBannerScheduleInfo,
    handleMoveBanner,
    handleToggleBannerActive,
    isAdminRole,
    setBannerToDelete,
    popupForm,
    setIsPreviewPopupOpen,
    onUpdatePromoPopup,
    setPopupForm,
    products,
    categories,
    brands,
    setIsSelectingPopupMedia,
    setIsLibraryModalOpen,
    isPreviewPopupOpen
  } = props;

  return (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Images className="w-5 h-5 text-amber-600" />
                  Banners da Home (Carrossel Rotativo)
                </h3>
                <p className="text-xs text-slate-500">
                  Gerencie os banners exibidos no topo da página inicial com imagens dedicadas para Desktop e Celular (Mobile).
                </p>
              </div>

              {canEditContent && (
                <button
                  type="button"
                  onClick={openNewBannerModal}
                  className="btn-gold text-xs font-bold py-2.5 px-4 flex items-center gap-1.5 cursor-pointer shadow-xs self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Novo Banner</span>
                </button>
              )}
            </div>

            {/* Banner List */}
            {(!banners || banners.length === 0) ? (
              <div className="text-center py-12 px-4 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 space-y-3">
                <Images className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-sm font-bold text-slate-700">Nenhum banner cadastrado</p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Adicione banners para destacar lançamentos, promoções ou categorias no topo do site.
                </p>
                {canEditContent && (
                  <button
                    type="button"
                    onClick={openNewBannerModal}
                    className="btn-gold text-xs font-bold py-2 px-4 cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Cadastrar Primeiro Banner</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3.5">
                {banners.map((b, idx) => {
                  const desktopImg = b.desktopImage || b.desktop_image;
                  const mobileImg = b.mobileImage || b.mobile_image;
                  const isActive = b.isActive !== false;

                  return (
                    <div
                      key={b.id || idx}
                      className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                        isActive
                          ? 'bg-slate-50/60 border-slate-200 hover:border-amber-300 hover:shadow-xs'
                          : 'bg-slate-100/70 border-slate-200/80 opacity-70'
                      }`}
                    >
                      {/* Left: Position Number & Image Previews */}
                      <div className="flex items-center gap-3.5 min-w-0">
                        <span className="w-7 h-7 rounded-full bg-amber-500/15 text-amber-800 font-black text-xs flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>

                        {/* Dual Previews: Desktop & Mobile */}
                        <div className="flex items-center gap-2 shrink-0">
                          {/* Desktop Thumbnail */}
                          <div
                            className="w-24 h-14 rounded-xl bg-slate-900 border border-slate-200 overflow-hidden relative group cursor-pointer"
                            onClick={() => openEditBannerModal(b)}
                            title="Preview Desktop (Clique para editar)"
                          >
                            <img
                              src={desktopImg}
                              alt={b.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.src = 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=400&auto=format&fit=crop&q=80';
                              }}
                            />
                            <span className="absolute bottom-0.5 left-0.5 px-1 py-0.2 rounded bg-slate-950/80 text-white font-mono text-[8px] flex items-center gap-0.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 inline-block" /> PC
                            </span>
                          </div>

                          {/* Mobile Thumbnail */}
                          <div
                            className="w-12 h-14 rounded-xl bg-slate-900 border border-slate-200 overflow-hidden relative group cursor-pointer"
                            onClick={() => openEditBannerModal(b)}
                            title={mobileImg ? "Preview Celular (Mobile Dedicado)" : "Usa imagem desktop adaptada no celular"}
                          >
                            <img
                              src={mobileImg || desktopImg}
                              alt={`${b.title} Mobile`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.src = 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=200&auto=format&fit=crop&q=80';
                              }}
                            />
                            <span className="absolute bottom-0.5 left-0.5 px-1 py-0.2 rounded bg-slate-950/80 text-white font-mono text-[8px] flex items-center gap-0.5">
                              <span className={`w-1.5 h-1.5 rounded-full inline-block ${mobileImg ? 'bg-emerald-400' : 'bg-slate-400'}`} /> Cel
                            </span>
                          </div>
                        </div>

                        {/* Title & Details */}
                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-xs text-slate-900 truncate max-w-xs" title={b.title}>
                              {b.title || 'Banner sem título'}
                            </span>

                            {(() => {
                              const sched = getBannerScheduleInfo(b);
                              return (
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${sched.badgeClass}`}>
                                  {sched.status === 'scheduled' && <Clock className="w-3 h-3 text-amber-700 animate-pulse" />}
                                  {sched.status === 'active' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                                  {sched.status === 'expired' && <span className="w-1.5 h-1.5 rounded-full bg-red-400" />}
                                  {sched.status === 'paused' && <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />}
                                  {sched.label}
                                </span>
                              );
                            })()}

                            {mobileImg ? (
                              <span className="px-1.5 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 text-[9px] font-bold">
                                Mobile Dedicado
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[9px]">
                                Mobile Adaptado
                              </span>
                            )}
                          </div>

                          {/* Link info */}
                          <div className="text-[11px] text-slate-500 truncate flex items-center gap-1">
                            {b.linkUrl || b.link_url ? (
                              <span className="inline-flex items-center gap-1 text-sky-700 font-mono font-medium">
                                <LinkIcon className="w-3 h-3 text-sky-600 shrink-0" />
                                <span className="truncate max-w-sm">{b.linkUrl || b.link_url}</span>
                                {(b.targetBlank || b.target_blank) && (
                                  <ExternalLink className="w-2.5 h-2.5 text-slate-400 shrink-0" title="Abre em nova aba" />
                                )}
                              </span>
                            ) : (
                              <span className="text-slate-400 italic">Sem link de clique</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      {canEditContent && (
                        <div className="flex items-center gap-1.5 self-end md:self-center shrink-0">
                          {/* Reorder Up */}
                          <button
                            type="button"
                            onClick={() => handleMoveBanner(idx, 'up')}
                            disabled={idx === 0}
                            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition"
                            title="Mover para cima"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>

                          {/* Reorder Down */}
                          <button
                            type="button"
                            onClick={() => handleMoveBanner(idx, 'down')}
                            disabled={idx === banners.length - 1}
                            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition"
                            title="Mover para baixo"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>

                          {/* Quick Toggle Active */}
                          <button
                            type="button"
                            onClick={() => handleToggleBannerActive(b)}
                            className={`p-1.5 rounded-lg border transition cursor-pointer ${
                              isActive
                                ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-500 border-slate-200'
                            }`}
                            title={isActive ? 'Pausar exibição deste banner' : 'Ativar exibição deste banner'}
                          >
                            {isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                          </button>

                          {/* Edit Button */}
                          <button
                            type="button"
                            onClick={() => openEditBannerModal(b)}
                            className="btn-secondary text-xs py-1.5 px-2.5 font-bold flex items-center gap-1 cursor-pointer"
                            title="Editar banner"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                            <span>Editar</span>
                          </button>

                          {/* Delete Button */}
                          {isAdminRole && (
                            <button
                              type="button"
                              onClick={() => setBannerToDelete(b)}
                              className="btn-danger text-xs p-2 cursor-pointer"
                              title="Excluir banner"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* POP-UP PROMOCIONAL DA LOJA CARD */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <span>Pop-up Promocional da Loja (Modal de Entrada)</span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                    popupForm.isActive ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-slate-100 text-slate-500 border border-slate-200'
                  }`}>
                    {popupForm.isActive ? 'Ativo na Loja' : 'Desativado'}
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Exiba um anúncio ou oferta exclusiva em destaque na entrada da loja virtual (limite de 1 pop-up ativo).
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsPreviewPopupOpen(true)}
                  className="px-3 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-600" />
                  <span>Visualizar Pop-up</span>
                </button>

                {canEditContent && (
                  <button
                    type="button"
                    onClick={() => {
                      if (onUpdatePromoPopup) {
                        onUpdatePromoPopup(popupForm);
                      }
                    }}
                    className="btn-gold text-xs font-bold py-2 px-4 cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Salvar Pop-up</span>
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column (Inputs) */}
              <div className="lg:col-span-8 space-y-4">
                {/* Ativação Toggle */}
                <div 
                  onClick={() => canEditContent && setPopupForm(p => ({ ...p, isActive: !p.isActive }))}
                  className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    popupForm.isActive ? 'bg-amber-50/80 border-amber-300' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div>
                    <span className="text-xs font-black text-slate-900 block">Status do Pop-up</span>
                    <span className="text-[11px] text-slate-500">
                      {popupForm.isActive ? 'Pop-up habilitado e pronto para exibição aos clientes.' : 'Pop-up desligado. Nenhuma janela será exibida.'}
                    </span>
                  </div>
                  <div className="relative inline-flex items-center shrink-0">
                    <input
                      type="checkbox"
                      checked={!!popupForm.isActive}
                      onChange={(e) => canEditContent && setPopupForm(p => ({ ...p, isActive: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                  </div>
                </div>

                {/* Seletor de Modo de Layout: Completo vs Flyer / Apenas Imagem */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-amber-500" />
                      <span>Estilo Visual do Pop-up</span>
                    </label>
                    <span className="text-[10px] text-slate-500 font-mono">Formato de Apresentação</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => canEditContent && setPopupForm(p => ({ ...p, layoutMode: 'full' }))}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                        (popupForm.layoutMode || 'full') === 'full'
                          ? 'bg-amber-50/80 border-amber-400 ring-2 ring-amber-400/20'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">Layout Completo</span>
                        {(popupForm.layoutMode || 'full') === 'full' && (
                          <span className="w-2 h-2 rounded-full bg-amber-500" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 leading-snug">
                        Banner no topo com degradê suave + Título, Descrição e Botão de Ação abaixo.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => canEditContent && setPopupForm(p => ({ ...p, layoutMode: 'flyer' }))}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                        popupForm.layoutMode === 'flyer'
                          ? 'bg-amber-50/80 border-amber-400 ring-2 ring-amber-400/20'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">Flyer / Arte Pronta</span>
                        {popupForm.layoutMode === 'flyer' && (
                          <span className="w-2 h-2 rounded-full bg-amber-500" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 leading-snug">
                        Apenas a imagem sem degradê azul ou textos. A arte inteira fica clicável.
                      </p>
                    </button>
                  </div>

                  {popupForm.layoutMode === 'flyer' && (
                    <div className="p-3 bg-amber-100/70 border border-amber-300/60 rounded-xl flex items-center justify-between gap-3 text-xs text-amber-950">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-700 shrink-0" />
                        <span>
                          <strong>Modo Flyer Ativo:</strong> Nenhum texto ou botão será renderizado sobre ou abaixo da arte. O pop-up exibirá a imagem limpa e 100% clicável.
                        </span>
                      </div>
                      {(popupForm.title || popupForm.subtitle || popupForm.description || popupForm.buttonText) && canEditContent && (
                        <button
                          type="button"
                          onClick={() => setPopupForm(p => ({
                            ...p,
                            title: '',
                            subtitle: '',
                            description: '',
                            buttonText: ''
                          }))}
                          className="shrink-0 px-2.5 py-1 text-[11px] font-bold text-amber-900 bg-amber-200/80 hover:bg-amber-300/80 rounded-lg transition-colors cursor-pointer"
                        >
                          Limpar campos de texto
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Campos de Texto (Visíveis em ambos, desabilitados/opcionais no modo flyer) */}
                <div className={`space-y-4 transition-opacity ${popupForm.layoutMode === 'flyer' ? 'opacity-60' : 'opacity-100'}`}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Título do Pop-up {popupForm.layoutMode === 'flyer' && <span className="text-[10px] text-slate-400 font-normal">(Opcional no modo Flyer)</span>}
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Super Promoção Athena"
                        value={popupForm.title || ''}
                        onChange={(e) => setPopupForm(p => ({ ...p, title: e.target.value }))}
                        className="form-input text-xs w-full"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Selo / Badge (Opcional)</label>
                      <input
                        type="text"
                        placeholder="Ex: OFERTA EXCLUSIVA ou LANÇAMENTO"
                        value={popupForm.badge || ''}
                        onChange={(e) => setPopupForm(p => ({ ...p, badge: e.target.value }))}
                        className="form-input text-xs w-full"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Subtítulo / Chamada em Destaque {popupForm.layoutMode === 'flyer' && <span className="text-[10px] text-slate-400 font-normal">(Opcional no modo Flyer)</span>}
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Scanner Thinkcar THINKTOOL LITE com Condições Especiais!"
                      value={popupForm.subtitle || ''}
                      onChange={(e) => setPopupForm(p => ({ ...p, subtitle: e.target.value }))}
                      className="form-input text-xs w-full"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Descrição / Texto Informativo {popupForm.layoutMode === 'flyer' && <span className="text-[10px] text-slate-400 font-normal">(Opcional no modo Flyer)</span>}
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Descreva as condições da oferta, diferenciais do produto ou instruções..."
                      value={popupForm.description || ''}
                      onChange={(e) => setPopupForm(p => ({ ...p, description: e.target.value }))}
                      className="form-textarea text-xs w-full"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Texto do Botão de Ação {popupForm.layoutMode === 'flyer' && <span className="text-[10px] text-slate-400 font-normal">(Opcional no modo Flyer)</span>}
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Ver Oferta Exclusiva"
                        value={popupForm.buttonText || ''}
                        onChange={(e) => setPopupForm(p => ({ ...p, buttonText: e.target.value }))}
                        className="form-input text-xs w-full"
                      />
                    </div>
                  </div>
                </div>

                {/* Seletor Inteligente de Link (SmartLinkPicker com Autocomplete & Árvore) */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <LinkIcon className="w-3.5 h-3.5 text-amber-500" />
                      <span>Link de Destino ao Clicar (No Botão ou na Imagem)</span>
                    </label>
                    <span className="text-[10px] text-slate-500 font-mono">Páginas, Produtos ou URL Livre</span>
                  </div>

                  <SmartLinkPicker
                    value={popupForm.linkUrl || ''}
                    onChange={(newUrl) => setPopupForm(p => ({ ...p, linkUrl: newUrl }))}
                    targetBlank={!!popupForm.targetBlank}
                    onTargetBlankChange={(newBlank) => setPopupForm(p => ({ ...p, targetBlank: newBlank }))}
                    products={products}
                    categories={categories}
                    brands={brands}
                  />
                </div>

                {/* Regra Automática de Cooldown de 12 Horas */}
                <div className="flex items-center gap-2 pt-1 text-xs text-slate-600 bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span><strong>Frequência Inteligente Ativa:</strong> Ao fechar o pop-up, ele ficará oculto por <strong>12 horas</strong> para o visitante (logado ou deslogado, mesmo abrindo novas abas).</span>
                </div>
              </div>

              {/* Right Column (Image Picker, Live Preview & Dimensions Guide) */}
              <div className="lg:col-span-4 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 block">Imagem / Banner do Pop-up</label>
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      placeholder="URL da imagem ou R2"
                      value={popupForm.imageUrl || ''}
                      onChange={(e) => setPopupForm(p => ({ ...p, imageUrl: e.target.value }))}
                      className="form-input text-xs flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setIsSelectingPopupMedia(true);
                        setIsLibraryModalOpen(true);
                      }}
                      className="btn-secondary text-xs py-2 px-2.5 flex items-center gap-1.5 cursor-pointer shrink-0"
                      title="Selecionar imagem da Biblioteca R2"
                    >
                      <Images className="w-3.5 h-3.5 text-amber-600" />
                      <span>R2</span>
                    </button>
                  </div>

                  {popupForm.imageUrl ? (
                    <div className={`relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 group ${
                      popupForm.layoutMode === 'flyer' ? 'aspect-[4/5] sm:aspect-square' : 'aspect-[16/9]'
                    }`}>
                      <img
                        src={popupForm.imageUrl}
                        alt="Preview Pop-up"
                        className={`w-full h-full ${popupForm.layoutMode === 'flyer' ? 'object-contain' : 'object-cover'}`}
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=600&auto=format&fit=crop&q=80';
                        }}
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => setPopupForm(p => ({ ...p, imageUrl: '' }))}
                          className="px-2.5 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remover</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl border-2 border-dashed border-slate-200 aspect-[16/9] bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
                      <Images className="w-8 h-8 text-slate-300 mb-1" />
                      <span className="text-xs font-bold text-slate-500">Sem imagem</span>
                      <span className="text-[10px] text-slate-400">Insira uma URL ou escolha na Biblioteca R2</span>
                    </div>
                  )}
                </div>

                {/* Guia de Resolução Recomendada */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/80 space-y-2 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Tamanhos Recomendados</span>
                  </div>
                  <div className="space-y-1.5 text-[11px] text-slate-600 leading-snug">
                    <div>
                      <strong className="text-slate-800 block">Modo Flyer / Arte Pronta:</strong>
                      <span>• Quadrado: <strong>1080 x 1080 px</strong> (1:1 - Ideal)</span><br />
                      <span>• Cartaz Vertical: <strong>1080 x 1350 px</strong> (4:5)</span>
                    </div>
                    <div>
                      <strong className="text-slate-800 block">Modo Completo (Com Textos):</strong>
                      <span>• Panorâmico: <strong>1200 x 675 px</strong> (16:9)</span><br />
                      <span>• Formato 2:1: <strong>1200 x 600 px</strong></span>
                    </div>
                    <div className="pt-1 text-[10px] text-slate-500">
                      Peso recomendado: <strong>&lt; 250 KB (WebP)</strong> para carregamento imediato sem afetar o Core Web Vitals.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Modal de Preview do Pop-up */}
          {isPreviewPopupOpen && (
            <PromoPopupModal
              popup={popupForm}
              forceOpen={true}
              onClose={() => setIsPreviewPopupOpen(false)}
            />
          )}
        </div>
  );
}
