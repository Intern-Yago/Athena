import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { X, Columns3, Check, Trash2, ArrowUpDown } from 'lucide-react';

const PRESET_COLORS = [
  '#64748b', // Slate
  '#0ea5e9', // Sky
  '#3b82f6', // Blue
  '#f59e0b', // Amber
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#10b981', // Emerald (Ganho)
  '#ef4444'  // Red (Perdido)
];

export default function StageModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  stage = null,
  allStages = [],
  funnelId = ''
}) {
  const { isDark } = useTheme();

  const [title, setTitle] = useState('');
  const [color, setColor] = useState('#64748b');
  const [isWon, setIsWon] = useState(false);
  const [isLost, setIsLost] = useState(false);
  const [targetOrder, setTargetOrder] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (stage) {
      setTitle(stage.title || '');
      setColor(stage.color || '#64748b');
      setIsWon(Boolean(stage.is_won));
      setIsLost(Boolean(stage.is_lost));
      const currentIdx = allStages.findIndex(s => s.id === stage.id);
      setTargetOrder(currentIdx >= 0 ? currentIdx : 0);
    } else {
      setTitle('');
      setColor('#64748b');
      setIsWon(false);
      setIsLost(false);
      setTargetOrder(allStages.length);
    }
    setConfirmDelete(false);
  }, [stage, allStages, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      id: stage?.id,
      title: title.trim(),
      color,
      is_won: isWon,
      is_lost: isLost,
      funnelId,
      targetOrder: parseInt(targetOrder, 10)
    });
  };

  const handleDeleteClick = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 5000);
      return;
    }
    if (stage && onDelete) {
      onDelete(stage.id);
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
              <Columns3 className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <h2 className={`text-sm sm:text-base font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {stage ? 'Editar Coluna do Kanban' : 'Nova Coluna do Kanban'}
              </h2>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Configure o título, posição e regras da etapa
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
              Título da Coluna *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Primeiro Contato, Proposta Enviada, Concluído..."
              className={`w-full rounded-xl px-3.5 py-2 text-xs border focus:outline-none transition-colors ${
                isDark 
                  ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-600 focus:border-amber-400' 
                  : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-amber-500'
              }`}
            />
          </div>

          {/* Posicionamento / Ordem da Coluna */}
          <div>
            <label className={`block text-xs font-bold mb-1 flex items-center gap-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              <ArrowUpDown className="w-3.5 h-3.5 text-amber-500" />
              <span>Posição da Coluna no Funil</span>
            </label>
            <select
              value={targetOrder}
              onChange={(e) => setTargetOrder(Number(e.target.value))}
              className={`w-full rounded-xl px-3 py-2 text-xs border focus:outline-none cursor-pointer transition-colors ${
                isDark 
                  ? 'bg-slate-950 border-slate-800 text-white focus:border-amber-400' 
                  : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-amber-500'
              }`}
            >
              {allStages.map((stg, idx) => (
                <option key={stg.id || idx} value={idx}>
                  {idx + 1}ª Posição {stg.id === stage?.id ? '(Atual)' : `(Antes de: ${stg.title})`}
                </option>
              ))}
              {!stage && (
                <option value={allStages.length}>
                  {allStages.length + 1}ª Posição (Última coluna)
                </option>
              )}
              {stage && targetOrder === allStages.length - 1 && (
                <option value={allStages.length - 1}>
                  {allStages.length}ª Posição (Final do funil)
                </option>
              )}
            </select>
            <p className={`text-[11px] mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              Você também pode arrastar o cabeçalho da coluna diretamente no Kanban para reposicionar.
            </p>
          </div>

          <div>
            <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Cor de Destaque da Coluna
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

          <div className={`p-3.5 rounded-2xl border space-y-2.5 transition-colors ${
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <label className="flex items-center gap-2.5 text-xs font-bold cursor-pointer">
              <input
                type="checkbox"
                checked={isWon}
                onChange={(e) => {
                  setIsWon(e.target.checked);
                  if (e.target.checked) setIsLost(false);
                }}
                className="rounded accent-emerald-500 w-4 h-4 cursor-pointer"
              />
              <span className="text-emerald-500">Etapa de Ganho (Venda Fechada / Matrícula Concluída)</span>
            </label>

            <label className="flex items-center gap-2.5 text-xs font-bold cursor-pointer">
              <input
                type="checkbox"
                checked={isLost}
                onChange={(e) => {
                  setIsLost(e.target.checked);
                  if (e.target.checked) setIsWon(false);
                }}
                className="rounded accent-red-500 w-4 h-4 cursor-pointer"
              />
              <span className="text-red-500">Etapa de Perda (Desistência / Sem Interesse)</span>
            </label>
          </div>

          <div className={`flex items-center justify-between pt-3 border-t gap-2 ${
            isDark ? 'border-slate-800' : 'border-slate-100'
          }`}>
            {stage && onDelete ? (
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
                <span>{confirmDelete ? 'Certeza? Clique para confirmar' : 'Excluir Coluna'}</span>
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
                <span>Salvar Coluna</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
