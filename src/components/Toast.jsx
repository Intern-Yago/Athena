import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ toast, onClose }) {
  if (!toast) return null;

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
    error: <AlertCircle className="w-5 h-5 text-red-400" />,
    info: <Info className="w-5 h-5 text-sky-400" />
  };

  const borders = {
    success: 'border-emerald-500/40 bg-emerald-950/90',
    error: 'border-red-500/40 bg-red-950/90',
    info: 'border-sky-500/40 bg-sky-950/90'
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-fade-in max-w-sm">
      <div className={`p-4 rounded-xl border shadow-2xl backdrop-blur-md flex items-center justify-between gap-3 text-xs text-white ${borders[toast.type] || borders.info}`}>
        <div className="flex items-center gap-2.5">
          {icons[toast.type] || icons.info}
          <span className="font-semibold">{toast.message}</span>
        </div>
        <button onClick={onClose} className="p-1 hover:text-slate-300">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
