import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { X, Layers, Check, Trash2 } from 'lucide-react';

const PRESET_COLORS = [
  '#f59e0b', // Amber
  '#3b82f6', // Blue
  '#10b981', // Emerald
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#ef4444', // Red
  '#06b6d4'  // Cyan
];

export default function FunnelModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  funnel = null
}) {
  const { isDark } = useTheme();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#f59e0b');
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (funnel) {
      setName(funnel.name || '');
      setDescription(funnel.description || '');
      setColor(funnel.color || '#f59e0b');
    } else {
      setName('');
      setDescription('');
      setColor('#f59e0b');
    }
    setConfirmDelete(false);
  }, [funnel, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({ name: name.trim(), description: description.trim(), color });
  };

  const handleDeleteClick = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 5000);
      return;
    }
    if (funnel && onDelete) {
      onDelete(funnel.id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className={`w-full max-w-md rounded-3xl p-6 shadow-2xl border transition-colors relative ${
        isDark 
          ? 'bg-slate-900 border-slate-800 text-slate-100' 
          : 'bg-white border-slate-200 text-slate-900 shadow-slate-200/50'
      }`}>
        <div className={`flex items-center justify-between pb-4 mb-4 border-b ${
          isDark ? 'border-slate-800' : 'border-slate-100'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-500 border border-amber-500/30 flex items-center justify-center shadow-xs">
              <Layers className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <h2 className={`text-sm sm:text-base font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {funnel ? 'Editar Funil Comercial' : 'Criar Novo Funil'}
              </h2>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Ex: "Cursos", "Rifas", "Venda de Equipamentos"
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`p-1.5 rounded-xl border transition cursor-pointer ${
              isDark 
                ? 'bg-slate-950 text-slate-400 hover:text-white border-slate-800' 
                : 'bg-slate-100 text-slate-500 hover:text-slate-800 border-slate-200'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Nome do Funil *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Cursos de Diagnóstico Automotivo"
              className={`w-full rounded-xl px-3.5 py-2 text-xs border focus:outline-none transition-colors ${
                isDark 
                  ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-600 focus:border-amber-400' 
                  : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-amber-500'
              }`}
            />
          </div>

          <div>
            <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Descrição do Objetivo
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Prospecção de oficinas para novas turmas..."
              className={`w-full rounded-xl p-3 text-xs border focus:outline-none resize-none transition-colors ${
                isDark 
                  ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-600 focus:border-amber-400' 
                  : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-amber-500'
              }`}
            />
          </div>

          <div>
            <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Cor de Identificação
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {PRESET_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-xl transition cursor-pointer flex items-center justify-center ${
                    color === c ? 'ring-2 ring-amber-400 scale-110 shadow-sm' : 'opacity-80 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c }}
                >
                  {color === c && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                </button>
              ))}
            </div>
          </div>

          <div className={`flex items-center justify-between pt-3 border-t gap-2 ${
            isDark ? 'border-slate-800' : 'border-slate-100'
          }`}>
            {funnel?.id === 'fun_expansao_df' ? (
              <span className="text-[11px] font-bold text-amber-500/90 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Funil Protegido pelo Sistema (Integrado ao Radar)</span>
              </span>
            ) : funnel && onDelete ? (
              <button
                type="button"
                onClick={handleDeleteClick}
                className={`px-3 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer ${
                  confirmDelete 
                    ? 'bg-red-600 text-white animate-pulse' 
                    : 'bg-red-500/10 hover:bg-red-500/20 text-red-500'
                }`}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{confirmDelete ? 'Certeza? Clique para confirmar' : 'Excluir Funil'}</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className={`px-4 py-2 rounded-xl font-bold text-xs transition cursor-pointer ${
                  isDark 
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' 
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition cursor-pointer active:scale-95"
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>Salvar Funil</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
