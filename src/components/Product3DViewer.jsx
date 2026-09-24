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
  ExternalLink,
  Play,
  Pause,
  Pencil,
  Trash2,
  Plus,
  Info,
  Layers,
  Settings,
  MousePointer
} from 'lucide-react';

export default function Product3DViewer({ 
  product, 
  height = '520px', 
  className = '', 
  autoRotateDefault = true,
  editable = false,
  onHotspotsChange = null
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
  const [availableAnimations, setAvailableAnimations] = useState([]);
  const [isPlayingAnimation, setIsPlayingAnimation] = useState(false);

  // Extract model info
  const rawModel = product?.model3d || product?.model_3d;
  const modelData = (typeof rawModel === 'string') 
    ? (() => { try { return JSON.parse(rawModel); } catch (e) { return {}; } })()
    : (rawModel || {});
  const modelSrc = modelData.glb || modelData.gltf || product?.modelGlb || product?.model3dUrl || '/models/tool_cart.glb';
  const iosSrc = modelData.usdz || product?.modelUsdz || '';
  const dimensions = modelData.dimensions || { width: 1.27, height: 0.96, depth: 0.75 };

  // Hotspots management
  const [hotspots, setHotspots] = useState(() => {
    if (Array.isArray(modelData.hotspots)) return modelData.hotspots;
    return [];
  });

  useEffect(() => {
    if (Array.isArray(modelData.hotspots)) {
      setHotspots(modelData.hotspots);
    }
  }, [JSON.stringify(modelData.hotspots)]);

  const [radialMenuHotspotId, setRadialMenuHotspotId] = useState(null);
  const [editingHotspot, setEditingHotspot] = useState(null);
  const [activeTooltipHotspotId, setActiveTooltipHotspotId] = useState(null);
  const [hotspotAnimStates, setHotspotAnimStates] = useState({});
  const [isPlacingHotspot, setIsPlacingHotspot] = useState(false);

  // Edit modal form fields
  const [formTitle, setFormTitle] = useState('');
  const [formAnim, setFormAnim] = useState('');
  const [formToggleAnim, setFormToggleAnim] = useState('');
  const [formDesc, setFormDesc] = useState('');

  useEffect(() => {
    if (editingHotspot) {
      setFormTitle(editingHotspot.title || '');
      setFormAnim(editingHotspot.animation || '');
      setFormToggleAnim(editingHotspot.toggleAnimation || '');
      setFormDesc(editingHotspot.description || '');
    }
  }, [editingHotspot]);

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
      try {
        if (viewer.availableAnimations && viewer.availableAnimations.length > 0) {
          setAvailableAnimations(viewer.availableAnimations);
        }
      } catch (err) {
        console.warn('Could not inspect 3D animations:', err);
      }
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
    if (window.location.hash.includes('ar-view')) {
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

  // Escape key to close QR Modal, radial menu or hotspot editor
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (radialMenuHotspotId) setRadialMenuHotspotId(null);
        if (editingHotspot) setEditingHotspot(null);
        if (isPlacingHotspot) setIsPlacingHotspot(false);
        if (showQrModal) setShowQrModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showQrModal, radialMenuHotspotId, editingHotspot, isPlacingHotspot]);

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

  const toggleAnimation = () => {
    const viewer = modelRef.current;
    if (!viewer) return;
    if (isPlayingAnimation) {
      viewer.pause();
      setIsPlayingAnimation(false);
    } else {
      viewer.play();
      setIsPlayingAnimation(true);
    }
  };

  const handleSaveHotspotForm = () => {
    if (!editingHotspot) return;
    const updated = hotspots.map(h => {
      if (h.id === editingHotspot.id) {
        return {
          ...h,
          title: formTitle.trim() || 'Ponto Interativo',
          animation: formAnim,
          toggleAnimation: formToggleAnim,
          description: formDesc.trim()
        };
      }
      return h;
    });
    setHotspots(updated);
    onHotspotsChange?.(updated);
    setEditingHotspot(null);
  };

  const handleDeleteHotspot = (hsId) => {
    const updated = hotspots.filter(h => h.id !== hsId);
    setHotspots(updated);
    onHotspotsChange?.(updated);
    setRadialMenuHotspotId(null);
    if (editingHotspot?.id === hsId) {
      setEditingHotspot(null);
    }
  };

  // Right-click on 3D canvas (creates new hotspot at clicked point)
  const handleCanvasContextMenu = (e) => {
    if (!editable) return;
    e.preventDefault();

    if (e.target.closest('[data-hotspot-container]') || e.target.closest('[data-hotspot-button]') || e.target.closest('button')) {
      return;
    }

    const viewer = modelRef.current;
    if (!viewer || typeof viewer.positionAndNormalFromPoint !== 'function') return;

    const hit = viewer.positionAndNormalFromPoint(e.clientX, e.clientY);
    if (!hit || !hit.position) return;

    const posStr = `${hit.position.x.toFixed(3)}m ${hit.position.y.toFixed(3)}m ${hit.position.z.toFixed(3)}m`;
    const normStr = hit.normal ? `${hit.normal.x.toFixed(3)}m ${hit.normal.y.toFixed(3)}m ${hit.normal.z.toFixed(3)}m` : '0m 0m 1m';

    const newHotspot = {
      id: `hs_${Date.now()}`,
      title: `Ponto ${hotspots.length + 1}`,
      position: posStr,
      normal: normStr,
      animation: availableAnimations[0] || '',
      toggleAnimation: '',
      description: ''
    };

    const updated = [...hotspots, newHotspot];
    setHotspots(updated);
    onHotspotsChange?.(updated);
    setRadialMenuHotspotId(null);
    setEditingHotspot(newHotspot);
    setIsPlacingHotspot(false);
  };

  // Left-click on 3D canvas when isPlacingHotspot is enabled
  const handleCanvasClick = (e) => {
    if (!editable || !isPlacingHotspot) return;
    if (e.target.closest('[data-hotspot-button]') || e.target.closest('button')) return;

    const viewer = modelRef.current;
    if (!viewer || typeof viewer.positionAndNormalFromPoint !== 'function') return;

    const hit = viewer.positionAndNormalFromPoint(e.clientX, e.clientY);
    if (!hit || !hit.position) return;

    const posStr = `${hit.position.x.toFixed(3)}m ${hit.position.y.toFixed(3)}m ${hit.position.z.toFixed(3)}m`;
    const normStr = hit.normal ? `${hit.normal.x.toFixed(3)}m ${hit.normal.y.toFixed(3)}m ${hit.normal.z.toFixed(3)}m` : '0m 0m 1m';

    const newHotspot = {
      id: `hs_${Date.now()}`,
      title: `Ponto ${hotspots.length + 1}`,
      position: posStr,
      normal: normStr,
      animation: availableAnimations[0] || '',
      toggleAnimation: '',
      description: ''
    };

    const updated = [...hotspots, newHotspot];
    setHotspots(updated);
    onHotspotsChange?.(updated);
    setRadialMenuHotspotId(null);
    setEditingHotspot(newHotspot);
    setIsPlacingHotspot(false);
  };

  const handleHotspotContextMenu = (e, hs) => {
    if (!editable) return;
    e.preventDefault();
    e.stopPropagation();
    setRadialMenuHotspotId(prev => prev === hs.id ? null : hs.id);
  };

  const handleHotspotAuxClick = (e, hs) => {
    if (!editable) return;
    if (e.button === 1) { // Middle click (scroll click)
      e.preventDefault();
      e.stopPropagation();
      setRadialMenuHotspotId(null);
      setEditingHotspot(hs);
    }
  };

  const handleHotspotClick = (e, hs) => {
    e.stopPropagation();
    if (radialMenuHotspotId) {
      setRadialMenuHotspotId(null);
    }

    // Toggle description tooltip
    setActiveTooltipHotspotId(prev => prev === hs.id ? null : hs.id);

    // If hotspot has animation configured:
    const viewer = modelRef.current;
    if (viewer) {
      const currentState = hotspotAnimStates[hs.id] || { step: 0 };
      let animToPlay = hs.animation || (availableAnimations.length > 0 ? availableAnimations[0] : null);

      if (currentState.step === 1 && hs.toggleAnimation) {
        animToPlay = hs.toggleAnimation;
      }

      if (animToPlay) {
        viewer.animationName = animToPlay;
        viewer.play({ repetitions: 1 });
        setIsPlayingAnimation(true);

        const nextStep = currentState.step === 0 ? 1 : 0;
        setHotspotAnimStates(prev => ({
          ...prev,
          [hs.id]: { step: nextStep, currentAnim: animToPlay }
        }));
      } else if (availableAnimations.length > 0) {
        toggleAnimation();
      }
    }
  };

  // Compute displayHotspots with fallback for sample commercial_refrigerator
  const displayHotspots = useMemo(() => {
    if (hotspots.length > 0) return hotspots;
    if (modelSrc && modelSrc.includes('refrigerator')) {
      return [
        {
          id: 'hs_door',
          title: 'Porta do Gabinete',
          position: '0.35m -0.15m 0.38m',
          normal: '0m 0m 1m',
          animation: availableAnimations[0] || 'FridgeDoor',
          toggleAnimation: '',
          description: 'Clique para abrir ou fechar a porta do gabinete.'
        }
      ];
    }
    return [];
  }, [hotspots, modelSrc, availableAnimations]);

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
          const arButton = viewer.querySelector('#native-ar-button') || viewer.querySelector('button[slot="ar-button"]');
          if (arButton) {
            arButton.click();
          } else {
            setShowQrModal(true);
          }
        });
        return;
      }
      const arButton = viewer.querySelector('#native-ar-button') || viewer.querySelector('button[slot="ar-button"]');
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
            Escala Real 1:1
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

      {/* ADMIN 3D HOTSPOT EDITOR TOOLBAR */}
      {editable && (
        <div className="absolute top-14 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
          <div className="pointer-events-auto flex items-center gap-2 bg-slate-950/90 backdrop-blur-md border border-amber-500/50 px-3 py-1.5 rounded-2xl shadow-xl">
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px] font-bold text-amber-300">
              Hotspots 3D
            </span>
            <span className="text-[10px] text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-full font-mono">
              {hotspots.length} {hotspots.length === 1 ? 'ponto' : 'pontos'}
            </span>
          </div>

          <div className="pointer-events-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsPlacingHotspot(prev => !prev)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-[11px] font-bold shadow-xl transition-all border ${
                isPlacingHotspot 
                  ? 'bg-amber-500 text-slate-950 border-amber-300 animate-pulse font-black' 
                  : 'bg-slate-900/90 text-white hover:bg-slate-800 border-slate-700'
              }`}
              title="Clique para ativar a mira e posicionar ponto na superfície 3D (ou clique c/ botão direito direto na peça)"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isPlacingHotspot ? 'Clique na peça...' : '+ Adicionar Ponto'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Helper Banner when Placing Hotspot */}
      {editable && isPlacingHotspot && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-20 pointer-events-none animate-in fade-in slide-in-from-top-2">
          <div className="bg-amber-500/95 text-slate-950 text-[11px] font-black px-3.5 py-1.5 rounded-full shadow-2xl flex items-center gap-1.5 border border-white/50">
            <MousePointer className="w-3.5 h-3.5 animate-bounce" />
            <span>Clique com o botão esquerdo na peça (ou ESC para cancelar)</span>
          </div>
        </div>
      )}

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
        onContextMenu={handleCanvasContextMenu}
        onClick={handleCanvasClick}
        style={{ 
          width: '100%', 
          height: '100%', 
          minHeight: '340px', 
          outline: 'none',
          cursor: isPlacingHotspot ? 'crosshair' : (editable ? 'default' : 'grab')
        }}
      >
        {/* Hidden native AR button slot for model-viewer WebXR trigger */}
        <button
          id="native-ar-button"
          slot="ar-button"
          style={{ display: 'none' }}
          aria-hidden="true"
          tabIndex={-1}
        />

        {/* INTERACTIVE 3D HOTSPOTS */}
        {displayHotspots.map((hs, index) => {
          const isRadialOpen = radialMenuHotspotId === hs.id;
          const isTooltipOpen = activeTooltipHotspotId === hs.id;
          const animState = hotspotAnimStates[hs.id];
          const isToggled = animState?.step === 1;

          return (
            <div
              key={hs.id || index}
              slot={`hotspot-${hs.id}`}
              data-position={hs.position}
              data-normal={hs.normal || '0m 0m 1m'}
              data-visibility-attribute="visible"
              data-hotspot-container="true"
              className="pointer-events-auto select-none"
            >
              <div className="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2">
                {/* CIRCULAR RADIAL FRAME (When right-clicked on existing hotspot) */}
                {isRadialOpen && editable && (
                  <div 
                    className="absolute z-50 w-28 h-28 rounded-full border-2 border-dashed border-amber-400 bg-slate-950/85 backdrop-blur-md animate-in zoom-in-75 duration-150 flex items-center justify-between px-2.5 shadow-2xl pointer-events-auto"
                    onClick={(e) => e.stopPropagation()}
                    onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  >
                    {/* Left: Pencil (Edit actions & text) */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setRadialMenuHotspotId(null);
                        setEditingHotspot(hs);
                      }}
                      title="Editar ações e texto descritivo"
                      className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-115 active:scale-95 border border-blue-400"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>

                    {/* Center: Close indicator */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setRadialMenuHotspotId(null);
                      }}
                      title="Fechar"
                      className="w-5 h-5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-[10px]"
                    >
                      ✕
                    </button>

                    {/* Right: Trash (Delete hotspot) */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteHotspot(hs.id);
                      }}
                      title="Excluir este Hotspot"
                      className="w-8 h-8 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-115 active:scale-95 border border-red-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* MAIN PIN BUTTON */}
                <button
                  data-hotspot-button="true"
                  type="button"
                  onClick={(e) => handleHotspotClick(e, hs)}
                  onContextMenu={(e) => handleHotspotContextMenu(e, hs)}
                  onAuxClick={(e) => handleHotspotAuxClick(e, hs)}
                  className="group relative flex items-center justify-center p-0 bg-transparent border-none cursor-pointer outline-none transition-transform hover:scale-115 active:scale-95 z-30"
                  title={
                    editable 
                      ? `${hs.title || 'Ponto Interativo'}\n• Botão Direito: Menu radial (Lápis e Lixeira)\n• Botão do Scroll: Configurar Ações\n• Botão Esquerdo: Disparar Ação/Animação`
                      : (hs.title || 'Clique para interagir')
                  }
                >
                  {/* Animated Ping Ring */}
                  <span className="animate-ping absolute inline-flex h-7 w-7 rounded-full bg-amber-400 opacity-60 pointer-events-none" />

                  {/* Pin Head */}
                  <span className={`relative flex items-center justify-center w-7 h-7 rounded-full border-2 border-white shadow-2xl font-black text-[11px] transition-colors ${
                    isToggled 
                      ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/50' 
                      : 'bg-amber-500 text-slate-950 shadow-amber-500/50 group-hover:bg-amber-400'
                  }`}>
                    {isToggled ? '↺' : (isPlayingAnimation ? '⏸' : '▶')}
                  </span>

                  {/* Label tag */}
                  <span className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-lg bg-slate-900/90 backdrop-blur-md text-white border border-amber-500/40 text-[9px] font-bold whitespace-nowrap shadow-xl pointer-events-none group-hover:border-amber-400 transition-colors">
                    {hs.title || `Ponto ${index + 1}`}
                  </span>
                </button>

                {/* OPTIONAL DESCRIPTION TOOLTIP CARD */}
                {hs.description && (isTooltipOpen || !editable) && (
                  <div 
                    className={`absolute left-1/2 -translate-x-1/2 bottom-8 w-48 sm:w-56 p-2.5 rounded-2xl bg-slate-950/95 backdrop-blur-md border border-amber-500/50 text-white shadow-2xl text-[11px] leading-relaxed z-40 animate-in fade-in zoom-in-95 pointer-events-auto ${
                      isTooltipOpen ? 'block' : 'hidden group-hover:block'
                    }`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1 pb-1 border-b border-slate-800">
                      <span className="font-bold text-amber-400 text-[10px] uppercase tracking-wider">
                        {hs.title || 'Informações'}
                      </span>
                      {editable && (
                        <button 
                          type="button" 
                          onClick={() => setEditingHotspot(hs)}
                          className="text-slate-400 hover:text-white"
                          title="Editar"
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    <p className="text-slate-300 text-[10px] leading-tight">{hs.description}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* CUSTOM AR PROMPT BANNER */}
        <div slot="ar-prompt" className="hidden" />
      </model-viewer>

      {/* BOTTOM FOOTER OVERLAY (Dimensions + Action Button) */}
      <div className="absolute bottom-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Physical Dimension Badge (1:1 Calibration) - Responsive & Compact */}
        {showDimensions && (
          <div className="pointer-events-auto bg-slate-900/95 backdrop-blur-md border border-slate-800/90 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl shadow-xl flex items-center gap-2 text-white">
            <Ruler className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <div className="flex items-center gap-1.5 font-mono font-bold text-slate-200 text-[10px] xs:text-[11px] sm:text-xs whitespace-nowrap">
              <span className="text-[10px] text-slate-400 font-sans uppercase font-bold mr-0.5 hidden md:inline">Medidas:</span>
              <span>L: {dimensions.width}m</span>
              <span className="text-slate-600">•</span>
              <span>A: {dimensions.height}m</span>
              <span className="text-slate-600">•</span>
              <span>P: {dimensions.depth}m</span>
            </div>
          </div>
        )}

        {/* Action Button: Direct Camera Projection on Mobile OR QR Code Modal on Desktop */}
        <div className="pointer-events-auto ml-auto shrink-0">
          <button
            type="button"
            onClick={handleLaunchAR}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-[11px] sm:text-xs uppercase tracking-wider transition-all shadow-xl active:scale-95 border border-amber-300/40 whitespace-nowrap"
            title={isMobileDevice ? 'Abrir câmera e projetar no chão da oficina em tamanho real' : 'Abrir no celular via QR Code'}
          >
            {isMobileDevice ? <Smartphone className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <QrCode className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            <span>{isMobileDevice ? 'Ver em 3D' : 'Ver na sua Oficina'}</span>
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
              Veja no Espaço da sua Oficina
            </h3>
            
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Aponte a câmera do seu celular (iOS ou Android) para o QR Code. O equipamento surgirá no chão em <strong className="text-amber-800 font-bold">tamanho real (1:1)</strong> sem precisar instalar nenhum aplicativo!
            </p>

            <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-2xl inline-block shadow-xs">
              <img 
                src={qrCodeImageUrl} 
                alt="QR Code Athena" 
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
                    <span>Copiar link para WhatsApp</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HOTSPOT CONFIGURATION / REGISTRATION MODAL */}
      {editingHotspot && (
        <div 
          className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs pointer-events-auto animate-in fade-in duration-150"
          onClick={() => setEditingHotspot(null)}
        >
          <div 
            className="bg-slate-900 border border-slate-700/80 rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl text-white relative animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Settings className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Configurar Ponto Interativo</h3>
                  <p className="text-[10px] text-slate-400">Ações acionadas pelo clique no hotspot</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingHotspot(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body Form */}
            <div className="space-y-3.5 py-4 text-xs">
              {/* Hotspot Title */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Nome / Título do Ponto
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Ex: Alavanca do Elevador, Porta da Estufa..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-xs"
                />
              </div>

              {/* Primary Animation */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1 flex items-center justify-between">
                  <span>Ação Primária (1º Clique)</span>
                  <span className="text-[10px] text-amber-400 font-normal">Animação 3D</span>
                </label>
                {availableAnimations.length > 0 ? (
                  <select
                    value={formAnim}
                    onChange={(e) => setFormAnim(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-500 text-xs"
                  >
                    <option value="">Selecione a animação...</option>
                    {availableAnimations.map((anim, idx) => (
                      <option key={anim} value={anim}>
                        {anim} {idx === 0 ? '(Padrão)' : ''}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={formAnim}
                    onChange={(e) => setFormAnim(e.target.value)}
                    placeholder="Nome da animação no GLB (opcional)"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-xs"
                  />
                )}
              </div>

              {/* Secondary / Toggle Animation (e.g. Reverse or Close) */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1 flex items-center justify-between">
                  <span>Ação Alternada (2º Clique / Reversa)</span>
                  <span className="text-[10px] text-slate-400 font-normal">Opcional</span>
                </label>
                {availableAnimations.length > 0 ? (
                  <select
                    value={formToggleAnim}
                    onChange={(e) => setFormToggleAnim(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-500 text-xs"
                  >
                    <option value="">Nenhuma (ou repetir mesma animação)</option>
                    {availableAnimations.map(anim => (
                      <option key={anim} value={anim}>{anim}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={formToggleAnim}
                    onChange={(e) => setFormToggleAnim(e.target.value)}
                    placeholder="Ex: descer_elevador, fechar_gaveta (opcional)"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-xs"
                  />
                )}
                <p className="text-[10px] text-slate-400 mt-1">
                  Permite que a mesma alavanca suba no 1º clique e desça no 2º clique.
                </p>
              </div>

              {/* Optional Description */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1 flex items-center justify-between">
                  <span>Texto Descritivo do Equipamento</span>
                  <span className="text-[10px] text-slate-400 font-normal">Opcional</span>
                </label>
                <textarea
                  rows={2}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Ex: Pressione para destravar os braços telescópicos de elevação..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-xs resize-none"
                />
              </div>

              {/* Coordinates info (read-only) */}
              <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800 text-[10px] font-mono text-slate-400 flex items-center justify-between">
                <span>Posição 3D:</span>
                <span className="text-amber-400/90">{editingHotspot.position}</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800 gap-2">
              <button
                type="button"
                onClick={() => handleDeleteHotspot(editingHotspot.id)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-red-400 hover:text-white hover:bg-red-600/30 transition-colors text-xs font-semibold"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Excluir</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditingHotspot(null)}
                  className="px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveHotspotForm}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-transform active:scale-95 shadow-lg"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Salvar Ponto</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
