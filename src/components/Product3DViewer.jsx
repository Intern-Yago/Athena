import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  RotateCw, 
  Maximize2, 
  Minimize2, 
  Smartphone, 
  QrCode, 
  X, 
  Info, 
  CheckCircle2, 
  Ruler,
  Compass,
  Sparkles
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

  // Extract model info
  const modelData = product?.model3d || {};
  const modelSrc = modelData.glb || modelData.gltf || product?.modelGlb || product?.model3dUrl || '/models/tool_cart.glb';
  const iosSrc = modelData.usdz || product?.modelUsdz || '';
  const dimensions = modelData.dimensions || { width: 1.27, height: 0.96, depth: 0.75 };

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

  // Generate mobile URL for QR Code
  const mobilePreviewUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/produto/${product?.slug || product?.id}?preview=true#ar-view` 
    : '';
  const qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&margin=10&data=${encodeURIComponent(mobilePreviewUrl)}`;

  return (
    <div 
      ref={containerRef}
      className={`relative w-full rounded-3xl bg-radial from-slate-900 via-slate-950 to-slate-950 border border-slate-800 overflow-hidden shadow-2xl group flex flex-col justify-between ${className}`}
      style={{ height: isFullscreen ? '100vh' : height, minHeight: '420px' }}
    >
      {/* TOP HEADER CONTROLS BAR */}
      <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
        {/* Real Scale 1:1 Badge */}
        <div className="pointer-events-auto flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md border border-amber-500/40 px-3 py-1.5 rounded-xl shadow-lg">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span className="text-[11px] font-black tracking-wider uppercase text-amber-300">
            Escala Real 1:1 (WebAR)
          </span>
        </div>

        {/* Action Controls */}
        <div className="pointer-events-auto flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md border border-slate-700/80 p-1 rounded-2xl shadow-xl">
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
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-xs">
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
        style={{ width: '100%', height: '100%', minHeight: '380px', outline: 'none' }}
      >
        {/* CUSTOM AR LAUNCH BUTTON (Mobile Native Trigger) */}
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

      {/* BOTTOM FOOTER OVERLAY (Dimensions + Desktop QR Code button) */}
      <div className="absolute bottom-4 left-4 right-4 z-20 flex items-end justify-between flex-wrap gap-2 pointer-events-none">
        {/* Physical Dimension Box (1:1 Verification) */}
        {showDimensions && (
          <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-md border border-slate-800 p-2.5 rounded-2xl shadow-xl flex items-center gap-3 text-white">
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

        {/* Desktop Button: Send to Phone (QR Code) */}
        <div className="pointer-events-auto ml-auto">
          <button
            type="button"
            onClick={() => setShowQrModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-900/90 hover:bg-amber-500 text-white hover:text-slate-950 border border-slate-700 hover:border-amber-400 text-xs font-bold transition-all shadow-xl backdrop-blur-md"
            title="Abrir no celular via QR Code para Realidade Aumentada"
          >
            <QrCode className="w-4 h-4" />
            <span className="hidden sm:inline">Ver na sua Oficina (AR)</span>
            <span className="sm:hidden">Abrir AR</span>
          </button>
        </div>
      </div>

      {/* QR CODE MODAL FOR DESKTOP -> MOBILE AR */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in pointer-events-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl relative text-center">
            <button
              type="button"
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-4">
              <Smartphone className="w-6 h-6 text-amber-400" />
            </div>

            <h3 className="text-lg font-black text-white">
              Veja na sua Oficina em Realidade Aumentada
            </h3>
            
            <p className="text-xs text-slate-400 mt-2">
              Aponte a câmera do seu celular (iOS ou Android) para o QR Code abaixo. O equipamento surgirá no chão da sua oficina em **tamanho real (1:1)** sem precisar instalar nada!
            </p>

            <div className="mt-5 p-4 bg-white rounded-2xl inline-block shadow-inner">
              <img 
                src={qrCodeImageUrl} 
                alt="QR Code Realidade Aumentada Athena" 
                className="w-48 h-48 mx-auto"
              />
            </div>

            <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-amber-300 font-semibold bg-amber-500/10 border border-amber-500/20 py-2 px-3 rounded-xl">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Compatível com iPhone e celulares Android</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
