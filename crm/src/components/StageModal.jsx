import React, { useState, useEffect } from 'react';
import { X, Columns3, Check, Trash2 } from 'lucide-react';

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
  funnelId = ''
}) {
  const [title, setTitle] = useState('');
  const [color, setColor] = useState('#64748b');
  const [isWon, setIsWon] = useState(false);
  const [isLost, setIsLost] = useState(false);

  useEffect(() => {
    if (stage) {
      setTitle(stage.title || '');
      setColor(stage.color || '#64748b');
      setIsWon(Boolean(stage.is_won));
      setIsLost(Boolean(stage.is_lost));
    } else {
      setTitle('');
      setColor('#64748b');
      setIsWon(false);
      setIsLost(false);
    }
  }, [stage]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({
      title: title.trim(),
      color,
      is_won: isWon,
      is_lost: isLost,
      funnelId
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-400/30 flex items-center justify-center">
              <Columns3 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white">
                {stage ? 'Editar Etapa (Coluna)' : 'Nova Etapa do Kanban'}
              </h2>
              <p className="text-[10px] text-slate-400">Configure a coluna do fluxo de trabalho</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-950 text-slate-400 hover:text-white border border-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Título da Etapa *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Primeiro Contato, Proposta Enviada, Concluído..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Cor da Coluna
            </label>
            <div className="flex items-center gap-2">
              {PRESET_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-xl transition cursor-pointer flex items-center justify-center ${
                    color === c ? 'ring-2 ring-white scale-110' : 'opacity-80 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c }}
                >
                  {color === c && <Check className="w-3.5 h-3.5 text-slate-950 stroke-[3]" />}
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={isWon}
                onChange={(e) => {
                  setIsWon(e.target.checked);
                  if (e.target.checked) setIsLost(false);
                }}
                className="rounded accent-emerald-500 w-4 h-4"
              />
              <span className="text-emerald-400">Etapa de Sucesso / Ganho (Venda Fechada / Matrícula)</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-bold text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={isLost}
                onChange={(e) => {
                  setIsLost(e.target.checked);
                  if (e.target.checked) setIsWon(false);
                }}
                className="rounded accent-red-500 w-4 h-4"
              />
              <span className="text-red-400">Etapa de Perda / Desistência</span>
            </label>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-800 gap-2">
            {stage && onDelete ? (
              <button
                type="button"
                onClick={() => onDelete(stage.id)}
                className="px-3 py-2 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-400 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Excluir Etapa</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition cursor-pointer"
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>Salvar Etapa</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
