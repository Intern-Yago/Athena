import React, { useState, useEffect, useCallback } from 'react';
import { X, ArrowRight, Sparkles } from 'lucide-react';

/**
 * PromoPopupModal
 * Modal promocional de alta conversão para destaques e campanhas exclusivas.
 * 
 * Regras:
 * - Apenas 1 pop-up ativo por vez na loja.
 * - Controle de frequência por sessão (sessionStorage) para não incomodar o cliente na navegação.
 * - Suporte a links internos (catálogo/produto) e externos (WhatsApp/hotsites).
 * - Suporte a preview instantâneo no AdminPanel via prop forceOpen.
 */
export default function PromoPopupModal({
  popup,
  onNavigate,
  forceOpen = false,
  onClose
}) {
  const [isVisible, setIsVisible] = useState(false);

  const popupId = popup?.id || 'default_promo_popup';
  const sessionKey = `athena_dismissed_popup_${popupId}`;

  // Verifica se o pop-up pode ser aberto
  useEffect(() => {
    if (forceOpen) {
      setIsVisible(true);
      return;
    }

    if (!popup || popup.isActive === false || (!popup.title && !popup.imageUrl && !popup.subtitle)) {
      setIsVisible(false);
      return;
    }

    // Checagem de dispensa na sessão atual
    try {
      const isDismissed = sessionStorage.getItem(sessionKey);
      if (isDismissed === 'true' && popup.showOncePerSession !== false) {
        setIsVisible(false);
        return;
      }
    } catch {
      // Ignore sessionStorage exceptions
    }

    // Delay suave de 1.2s para aguardar a renderização inicial da página
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1200);

    return () => clearTimeout(timer);
  }, [popup, forceOpen, sessionKey]);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    if (!forceOpen) {
      try {
        sessionStorage.setItem(sessionKey, 'true');
      } catch {
        // Ignore sessionStorage exceptions
      }
    }
    if (onClose) onClose();
  }, [forceOpen, sessionKey, onClose]);

  // Tecla Escape para fechar
  useEffect(() => {
    if (!isVisible) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, handleClose]);

  if (!isVisible || (!popup && !forceOpen) || (!forceOpen && !popup?.title && !popup?.imageUrl && !popup?.subtitle)) {
    return null;
  }

  const handleActionClick = () => {
    handleClose();
    const url = popup.linkUrl || popup.link_url;
    if (!url) return;

    const isBlank = Boolean(popup.targetBlank || popup.target_blank);

    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('wa.me') || isBlank) {
      const fullUrl = url.startsWith('wa.me') ? `https://${url}` : url;
      window.open(fullUrl, isBlank ? '_blank' : '_self', 'noopener,noreferrer');
    } else {
      const cleanPath = url.startsWith('/') ? url.slice(1) : url;
      if (onNavigate) {
        onNavigate(cleanPath);
      } else {
        window.location.href = url.startsWith('/') ? url : `/${url}`;
      }
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="promo-popup-title"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-lg bg-slate-900 border border-amber-500/30 rounded-3xl overflow-hidden shadow-2xl text-white transform transition-all animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Banner do Pop-up (se houver imagem configurada) */}
        {popup.imageUrl ? (
          <div
            className="relative w-full aspect-[16/9] sm:aspect-[2/1] overflow-hidden bg-slate-950 cursor-pointer group"
            onClick={handleActionClick}
          >
            <img
              src={popup.imageUrl}
              alt={popup.title || 'Oferta Especial Athena'}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-black/30" />

            {/* Badge Promocional sobre a imagem */}
            {popup.badge && (
              <span className="absolute top-3 left-3 bg-amber-500 text-slate-950 font-black text-[10px] sm:text-[11px] px-3 py-1 rounded-full uppercase tracking-wider shadow-lg flex items-center gap-1">
                <Sparkles className="w-3 h-3 fill-slate-950" />
                <span>{popup.badge}</span>
              </span>
            )}

            {/* Botão de Fechar no topo */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleClose();
              }}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-slate-950/80 hover:bg-amber-500 text-white hover:text-slate-950 flex items-center justify-center backdrop-blur-md border border-white/20 transition-all hover:scale-105 cursor-pointer shadow-md"
              title="Fechar Pop-up"
              aria-label="Fechar Pop-up"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* Header sem imagem com botão fechar */
          <div className="flex items-center justify-between p-5 pb-0">
            {popup.badge && (
              <span className="bg-amber-500 text-slate-950 font-black text-[10px] px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 fill-slate-950" />
                <span>{popup.badge}</span>
              </span>
            )}
            <button
              type="button"
              onClick={handleClose}
              className="ml-auto w-8 h-8 rounded-full bg-slate-800 hover:bg-amber-500 text-slate-300 hover:text-slate-950 flex items-center justify-center transition-all cursor-pointer"
              title="Fechar Pop-up"
              aria-label="Fechar Pop-up"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Conteúdo Informativo */}
        <div className="p-6 sm:p-7 space-y-3">
          {popup.title && (
            <h3 id="promo-popup-title" className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
              {popup.title}
            </h3>
          )}

          {popup.subtitle && (
            <p className="text-sm sm:text-base font-bold text-amber-400 leading-snug">
              {popup.subtitle}
            </p>
          )}

          {popup.description && (
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {popup.description}
            </p>
          )}

          {/* Ações */}
          <div className="pt-3 flex flex-col sm:flex-row items-center gap-3">
            {popup.buttonText && (
              <button
                type="button"
                onClick={handleActionClick}
                className="w-full sm:flex-1 py-3 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all cursor-pointer"
              >
                <span>{popup.buttonText}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={handleClose}
              className="w-full sm:w-auto py-2.5 px-4 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer text-center"
            >
              Agora não
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
