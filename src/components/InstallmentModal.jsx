import React from 'react';
import { X, CreditCard, QrCode, ShieldCheck, Zap, ArrowRight, Info } from 'lucide-react';
import { calculateInstallments, formatBRL } from '../utils/installmentCalculator';

export default function InstallmentModal({ isOpen, onClose, productName, cashPrice, maxInstallments = 12 }) {
  if (!isOpen) return null;

  const installments = calculateInstallments(cashPrice, maxInstallments);
  const formattedCash = formatBRL(cashPrice);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 max-w-lg w-full max-h-[90vh] flex flex-col space-y-5 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 leading-tight">Opções de Pagamento</h3>
              <p className="text-xs text-slate-500 line-clamp-1 max-w-[280px]">
                {productName || 'Equipamento Athena'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cash / PIX Highlight Card */}
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                À Vista no PIX
              </span>
              <span className="text-xl font-black text-emerald-950">
                {formattedCash}
              </span>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-emerald-200/80 text-emerald-900 text-[10px] font-black uppercase tracking-wider">
            Melhor Preço
          </span>
        </div>

        {/* Installment Table */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-2 max-h-72">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 px-3 pb-1 uppercase tracking-wider">
            <span>Parcelamento no Cartão</span>
            <span>Total a Pagar</span>
          </div>

          {installments.map((item) => (
            <div
              key={item.installments}
              className={`flex items-center justify-between p-3 rounded-xl border text-xs transition-all ${
                item.installments === 1
                  ? 'bg-slate-50 border-slate-200 text-slate-800'
                  : item.installments === maxInstallments
                  ? 'bg-amber-50/50 border-amber-200/80 text-slate-900 font-bold'
                  : 'bg-white border-slate-100 hover:border-slate-300 text-slate-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 font-black text-[11px] flex items-center justify-center shrink-0">
                  {item.installments}x
                </span>
                <span className="font-extrabold text-slate-900">
                  {item.formattedInstallment}
                </span>
                <span className="text-[10px] text-slate-400">/ mês</span>
              </div>

              <div className="text-right">
                <span className="font-bold text-slate-800 block">{item.formattedTotal}</span>
                {item.interestPercentage > 0 && (
                  <span className="text-[10px] text-amber-700 font-semibold">
                    (+{item.interestPercentage}%)
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Security Badge */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-1.5 text-[11px]">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Processado com segurança via Asaas Gateway</span>
          </div>
          <button
            onClick={onClose}
            className="btn-gold py-2 px-4 text-xs font-bold rounded-xl cursor-pointer"
          >
            Entendido
          </button>
        </div>

      </div>
    </div>
  );
}
