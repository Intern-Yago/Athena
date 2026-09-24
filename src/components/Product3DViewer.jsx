import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Box, 
  RotateCw, 
  Maximize2, 
  Minimize2, 
  Smartphone, 
  QrCode, 
  X, 
  CheckCircle2, 
  Ruler,
  Compass,
  Sparkles,
  Copy,
  Check,
  ExternalLink
} from 'lucide-react';

export default function Product3DViewer({ 
  product, 
  height = '520px', 
  className = '', 
  autoRotateDefault = true 
}) {
  const modelRef = useRef(null);
  const containerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [isRotating, setIsRotating] = useState(autoRotateDefault);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showDimensions, setShowDimensions] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isMobileDevice, setIsMobileDevice] = useState(false);

  // Extract model info
  const modelData = product?.model3d || {};
  const modelSrc = modelData.glb || modelData.gltf || product?.modelGlb || product?.model3dUrl || '/models/tool_cart.glb';
  const iosSrc = modelData.usdz || product?.modelUsdz || '';
  const dimensions = modelData.dimensions || { width: 1.27, height: 0.96, depth: 0.75 };

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      if (typeof navigator === 'undefined') return false;
      const ua = navigator.userAgent || navigator.vendor || window.opera || '';
      const isMobileUA = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua);
      const isTouchScreen = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
      return isMobileUA || (isTouchScreen && window.innerWidth <= 840);
    };
    setIsMobileDevice(checkMobile());
  }, []);

  // Setup model-viewer event listeners for load progress
  useEffect(() => {
    const viewer = modelRef.current;
    if (!viewer) return;

    const handleProgress = (event) => {
      const progress = Math.round((event.detail.totalProgress || 0) * 100);
      setLoadProgress(progress);
    };

    const handleLoad = () => {
      setIsLoading(false);
      setLoadProgress(100);
    };

    viewer.addEventListener('progress', handleProgress);
    viewer.addEventListener('load', handleLoad);

    return () => {
      viewer.removeEventListener('progress', handleProgress);
      viewer.removeEventListener('load', handleLoad);
    };
  }, [modelSrc]);

  // Pause WebGL auto-rotation when modal is open to completely eliminate GPU frame drop / lag
  useEffect(() => {
    const viewer = modelRef.current;
    if (!viewer) return;
    if (showQrModal) {
      viewer.removeAttribute('auto-rotate');
    } else if (isRotating) {
      viewer.setAttribute('auto-rotate', '');
    }
  }, [showQrModal, isRotating]);

  // Auto-launch AR on mobile if URL hash contains #ar-view
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.location.hash.includes('ar-view') || window.location.search.includes('view=3d')) {
      const timer = setTimeout(() => {
        const viewer = modelRef.current;
        if (viewer && typeof viewer.activateAR === 'function') {
          viewer.activateAR().catch(() => {});
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Escape key to close QR Modal
  useEffect(() => {
    if (!showQrModal) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowQrModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showQrModal]);

  const toggleAutoRotate = () => {
    const viewer = modelRef.current;
    if (!viewer) return;
    const next = !isRotating;
    setIsRotating(next);
    if (next) {
      viewer.setAttribute('auto-rotate', '');
    } else {
      viewer.removeAttribute('auto-rotate');
    }
  };

  const handleResetCamera = () => {
    const viewer = modelRef.current;
    if (viewer && typeof viewer.resetTurntableRotation === 'function') {
      viewer.resetTurntableRotation();
    }
    if (viewer) {
      viewer.cameraOrbit = '0deg 75deg 105%';
    }
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;
    if (!document.fullscreenElement) {
      container.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  // Safe and resilient mobile preview URL generator
  const mobilePreviewUrl = useMemo(() => {
    if (typeof window === 'undefined') return '';
    const origin = window.location.origin;
    const currentParams = new URLSearchParams(window.location.search);
    const draftToken = currentParams.get('d') || currentParams.get('token');

    // If an encoded draft token is present, preserve it for the phone
    if (draftToken) {
      return `${origin}/produto/preview?d=${encodeURIComponent(draftToken)}&view=3d#ar-view`;
    }

    // Determine valid product slug or ID (never 'undefined')
    let validSlug = '';
    if (product?.slug && product.slug !== 'undefined') {
      validSlug = product.slug;
    } else if (product?.id && product.id !== 'undefined') {
      validSlug = product.id;
    } else if (window.location.pathname.startsWith('/produto/')) {
      const pathSlug = window.location.pathname.replace('/produto/', '').split('?')[0].split('#')[0];
      if (pathSlug && pathSlug !== 'undefined' && pathSlug !== 'preview') {
        validSlug = pathSlug;
      }
    }

    if (!validSlug) {
      validSlug = 'carrinho-oficina-modular-3d-ar';
    }

    const isDraft = product?.status === 'draft' || currentParams.get('preview') === 'true';
    return `${origin}/produto/${validSlug}${isDraft ? '?preview=true&view=3d' : '?view=3d'}#ar-view`;
  }, [product?.slug, product?.id, product?.status]);

  const qrCodeImageUrl = useMemo(() => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=8&data=${encodeURIComponent(mobilePreviewUrl)}`;
  }, [mobilePreviewUrl]);

  // Main AR Launch Action:
  // On Mobile -> directly activates native AR (Google Scene Viewer / Apple Quick Look)
  // On Desktop -> opens the optimized QR Code modal
  const handleLaunchAR = () => {
    const viewer = modelRef.current;
    if (isMobileDevice && viewer) {
      if (typeof viewer.activateAR === 'function') {
        viewer.activateAR().catch(() => {
          setShowQrModal(true);
        });
        return;
      }
      const arButton = viewer.querySelector('button[slot="ar-button"]');
      if (arButton) {
        arButton.click();
        return;
      }
    }
    setShowQrModal(true);
  };

  const handleCopyLink = () => {
    if (!mobilePreviewUrl) return;
    navigator.clipboard?.writeText(mobilePreviewUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div 
      ref={containerRef}
      className={`relative w-full rounded-3xl bg-radial from-slate-900 via-slate-950 to-slate-950 border border-slate-800 overflow-hidden shadow-2xl group flex flex-col justify-between ${className}`}
      style={{ height: isFullscreen ? '100vh' : height, minHeight: '360px' }}
    >
      {/* TOP HEADER CONTROLS BAR */}
      <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
        {/* Real Scale 1:1 Badge */}
        <div className="pointer-events-auto flex items-center gap-1.5 bg-slate-900/90 border border-amber-500/40 px-3 py-1.5 rounded-xl shadow-lg">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span className="text-[11px] font-black tracking-wider uppercase text-amber-300">
            Escala Real 1:1 (WebAR)
          </span>
        </div>

        {/* Action Controls */}
        <div className="pointer-events-auto flex items-center gap-1.5 bg-slate-900/90 border border-slate-700/80 p-1 rounded-2xl shadow-xl">
          <button
            type="button"
            onClick={toggleAutoRotate}
            title={isRotating ? 'Pausar Rotação 360°' : 'Girar Automaticamente'}
            className={`p-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 ${
              isRotating 
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold' 
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRotating ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
            <span className="text-[10px] hidden sm:inline">360°</span>
          </button>

          <button
            type="button"
            onClick={handleResetCamera}
            title="Recentralizar visualização da câmera"
            className="p-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
          >
            <Compass className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setShowDimensions(prev => !prev)}
            title="Alternar exibição de medidas métricas"
            className={`p-2 rounded-xl text-xs transition-all ${
              showDimensions 
                ? 'text-amber-400 bg-slate-800/80' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Ruler className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Sair da Tela Cheia' : 'Tela Cheia'}
            className="p-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* LOADING OVERLAY */}
      {isLoading && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950/90">
          <div className="relative w-16 h-16 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-2 border-amber-500/20 border-t-amber-500 animate-spin" />
            <Box className="w-6 h-6 text-amber-400" />
          </div>
          <span className="mt-4 text-xs font-bold uppercase tracking-wider text-slate-300">
            Carregando Modelo 3D... {loadProgress}%
          </span>
          <span className="text-[10px] text-slate-500 mt-1">
            Geometria e texturas de alta precisão
          </span>
        </div>
      )}

      {/* GOOGLE MODEL-VIEWER CUSTOM WEB COMPONENT */}
      <model-viewer
        ref={modelRef}
        src={modelSrc}
        {...(iosSrc ? { 'ios-src': iosSrc } : {})}
        alt={product?.name || 'Modelo 3D Equipamento Automotivo'}
        ar
        ar-modes="webxr scene-viewer quick-look"
        ar-scale="fixed"
        camera-controls
        touch-action="pan-y"
        shadow-intensity="1.4"
        shadow-softness="0.7"
        exposure="1.08"
        auto-rotate
        auto-rotate-delay="1500"
        rotation-per-second="20deg"
        style={{ width: '100%', height: '100%', minHeight: '340px', outline: 'none' }}
      >
        {/* CUSTOM AR LAUNCH BUTTON (Mobile Native Trigger slot) */}
        <button
          slot="ar-button"
          className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider shadow-2xl hover:brightness-110 active:scale-95 transition-all border border-amber-300/40"
        >
          <Smartphone className="w-4 h-4 text-slate-950" />
          <span>Ver no seu espaço físico (AR)</span>
        </button>

        {/* CUSTOM AR PROMPT BANNER */}
        <div slot="ar-prompt" className="hidden" />
      </model-viewer>

      {/* BOTTOM FOOTER OVERLAY (Dimensions + AR Launch Button) */}
      <div className="absolute bottom-4 left-4 right-4 z-20 flex items-end justify-between flex-wrap gap-2 pointer-events-none">
        {/* Physical Dimension Box (1:1 Verification) */}
        {showDimensions && (
          <div className="pointer-events-auto bg-slate-900/95 border border-slate-800 p-2.5 rounded-2xl shadow-xl flex items-center gap-3 text-white">
            <div className="w-7 h-7 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
              <Ruler className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="flex flex-col text-[11px] leading-tight">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                Medidas Reais da Peça
              </span>
              <div className="flex items-center gap-2 font-mono font-bold text-slate-200 mt-0.5">
                <span>L: {dimensions.width}m</span>
                <span className="text-slate-600">•</span>
                <span>A: {dimensions.height}m</span>
                <span className="text-slate-600">•</span>
                <span>P: {dimensions.depth}m</span>
              </div>
            </div>
          </div>
        )}

        {/* AR Launch Button: Direct Native AR on Mobile OR QR Code Modal on Desktop */}
        <div className="pointer-events-auto ml-auto">
          <button
            type="button"
            onClick={handleLaunchAR}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-xl active:scale-95 border border-amber-300/40"
            title={isMobileDevice ? 'Abrir câmera e projetar no chão da oficina' : 'Abrir no celular via QR Code para Realidade Aumentada'}
          >
            {isMobileDevice ? <Smartphone className="w-4 h-4" /> : <QrCode className="w-4 h-4" />}
            <span>{isMobileDevice ? 'Ver no Chão da Oficina (AR)' : 'Ver na sua Oficina (AR)'}</span>
          </button>
        </div>
      </div>

      {/* LIGHTWEIGHT, HIGH-CONTRAST QR CODE MODAL (DESKTOP ONLY) */}
      {showQrModal && (
        <div 
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/80 pointer-events-auto animate-in fade-in duration-150"
          onClick={() => setShowQrModal(false)}
        >
          <div 
            className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 max-w-sm w-full shadow-2xl relative text-center text-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-700 flex items-center justify-center mx-auto mb-3">
              <Smartphone className="w-6 h-6 text-amber-600" />
            </div>

            <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
              Veja na sua Oficina em Realidade Aumentada
            </h3>
            
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Aponte a câmera do seu celular (iOS ou Android) para o QR Code. O equipamento surgirá no chão em <strong className="text-amber-800 font-bold">tamanho real (1:1)</strong> sem instalar nada!
            </p>

            <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-2xl inline-block shadow-xs">
              <img 
                src={qrCodeImageUrl} 
                alt="QR Code Realidade Aumentada Athena" 
                className="w-48 h-48 sm:w-52 sm:h-52 mx-auto rounded-lg"
              />
            </div>

            <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-amber-900 font-bold bg-amber-50 border border-amber-200/90 py-2 px-3 rounded-xl">
              <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Compatível com iPhone e Android</span>
            </div>

            {/* Quick Copy Link Option */}
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-center">
              <button
                type="button"
                onClick={handleCopyLink}
                className="text-[11px] font-bold text-slate-500 hover:text-amber-800 flex items-center gap-1.5 transition-colors"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Link copiado com sucesso!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar link do WebAR para WhatsApp</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
