import React, { useState, useEffect } from 'react';
import {
  Plus,
  ChevronDown,
  Search,
  X,
  Check,
  Sparkles,
  Disc,
  Layers,
  Cpu,
  Droplet,
  Wrench,
  Wind,
  Box,
  Zap,
  Truck,
  Shield,
  Package,
  Grid,
  FolderTree
} from 'lucide-react';

/**
 * Searchable Combobox Component (Filtragem em tempo real com busca flexível e suporte a imagens)
 */
export function SearchableSelect({
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

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

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

      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-2xl border border-slate-200 shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
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
export function RadialProgressCircle({ progress = 0, size = 48, strokeWidth = 4 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const validProgress = Math.min(100, Math.max(0, progress));
  const strokeDashoffset = circumference - (validProgress / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="w-full h-full -rotate-90 transform" viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.25)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
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

export const DEPT_AVAILABLE_ICONS = [
  { name: 'Layers', label: 'Camadas' },
  { name: 'FolderTree', label: 'Estrutura' },
  { name: 'Sparkles', label: 'Estética / Brilho' },
  { name: 'Disc', label: 'Disco / Pneus' },
  { name: 'Cpu', label: 'Eletrônica / Chip' },
  { name: 'Droplet', label: 'Óleos / Fluidos' },
  { name: 'Wrench', label: 'Mecânica / Chave' },
  { name: 'Wind', label: 'Pneumática / Ar' },
  { name: 'Box', label: 'Caixa / Móveis' },
  { name: 'Zap', label: 'Elétrica / Potência' },
  { name: 'Truck', label: 'Pesados / Transporte' },
  { name: 'Shield', label: 'Segurança' },
  { name: 'Package', label: 'Equipamentos' },
  { name: 'Grid', label: 'Grade Geral' }
];

export function MacroIcon({ name, className = 'w-5 h-5' }) {
  switch (name) {
    case 'Sparkles': return <Sparkles className={className} />;
    case 'Disc': return <Disc className={className} />;
    case 'Layers': return <Layers className={className} />;
    case 'Cpu': return <Cpu className={className} />;
    case 'Droplet': return <Droplet className={className} />;
    case 'Wrench': return <Wrench className={className} />;
    case 'Wind': return <Wind className={className} />;
    case 'Box': return <Box className={className} />;
    case 'Zap': return <Zap className={className} />;
    case 'Truck': return <Truck className={className} />;
    case 'Shield': return <Shield className={className} />;
    case 'Package': return <Package className={className} />;
    case 'Grid': return <Grid className={className} />;
    case 'FolderTree':
    default:
      return <FolderTree className={className} />;
  }
}
