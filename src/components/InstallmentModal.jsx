import React, { useState } from 'react';
import { X, CreditCard, QrCode, ShieldCheck, Zap, FileText, CheckCircle2, Landmark, Clock, ArrowRight } from 'lucide-react';
import { calculateInstallments, calculatePaymentGateways, formatBRL } from '../utils/installmentCalculator';

export default function InstallmentModal({ isOpen, onClose, productName, cashPrice, maxInstallments = 12 }) {
  const [selectedTab, setSelectedTab] = useState('credit');

  if (!isOpen) return null;

  const installments = calculateInstallments(cashPrice, maxInstallments);
  const formattedCash = formatBRL(cashPrice);
  const gateways = calculatePaymentGateways(cashPrice);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-7 max-w-lg w-full max-h-[92vh] flex flex-col space-y-4 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3.5 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 leading-tight">Formas de Pagamento</h3>
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

        {/* Payment Methods Tab Switcher */}
        <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-100/80 rounded-2xl shrink-0 text-xs font-bold">
          <button
            type="button"
            onClick={() => setSelectedTab('credit')}
            className={`py-2 px-1 rounded-xl flex flex-col sm:flex-row items-center justify-center gap-1 transition-all cursor-pointer ${
              selectedTab === 'credit'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 font-extrabold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5 text-amber-600" />
            <span className="text-[11px]">Crédito</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedTab('pix')}
            className={`py-2 px-1 rounded-xl flex flex-col sm:flex-row items-center justify-center gap-1 transition-all cursor-pointer ${
              selectedTab === 'pix'
                ? 'bg-white text-emerald-950 shadow-xs border border-slate-200/80 font-extrabold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <QrCode className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-[11px]">PIX</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedTab('debit')}
            className={`py-2 px-1 rounded-xl flex flex-col sm:flex-row items-center justify-center gap-1 transition-all cursor-pointer ${
              selectedTab === 'debit'
                ? 'bg-white text-sky-950 shadow-xs border border-slate-200/80 font-extrabold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Landmark className="w-3.5 h-3.5 text-sky-600" />
            <span className="text-[11px]">Débito</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedTab('boleto')}
            className={`py-2 px-1 rounded-xl flex flex-col sm:flex-row items-center justify-center gap-1 transition-all cursor-pointer ${
              selectedTab === 'boleto'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 font-extrabold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-amber-700" />
            <span className="text-[11px]">Boleto</span>
          </button>
        </div>

        {/* TAB 1: CARTÃO DE CRÉDITO */}
        {selectedTab === 'credit' && (
          <div className="flex-1 flex flex-col space-y-3 overflow-hidden">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 px-2 pb-0.5 uppercase tracking-wider shrink-0">
              <span>Parcelamento em até {maxInstallments}x</span>
              <span>Total no Cartão</span>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 space-y-2 max-h-72">
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
          </div>
        )}

        {/* TAB 2: PIX */}
        {selectedTab === 'pix' && (
          <div className="flex-1 flex flex-col space-y-3 py-2">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <QrCode className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                    Pagamento à Vista no PIX
                  </span>
                  <span className="text-2xl font-black text-emerald-950">
                    {gateways?.pix?.formattedCustomerAmount || formattedCash}
                  </span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-200/80 text-emerald-900 text-[10px] font-black uppercase tracking-wider">
                Melhor Preço
              </span>
            </div>

            <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-xs text-slate-600">
              <div className="flex items-center gap-2 text-slate-800 font-bold">
                <Zap className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Liberação e faturamento imediato</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                O QR Code e a chave Pix Copia e Cola são gerados instantaneamente no fechamento do pedido, com confirmação automática pelo sistema bancário.
              </p>
            </div>
          </div>
        )}

        {/* TAB 3: DÉBITO */}
        {selectedTab === 'debit' && (
          <div className="flex-1 flex flex-col space-y-3 py-2">
            <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Landmark className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-sky-800 uppercase tracking-wider block">
                    Cartão de Débito à Vista
                  </span>
                  <span className="text-2xl font-black text-sky-950">
                    {gateways?.debit?.formattedCustomerAmount || formattedCash}
                  </span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-sky-200/80 text-sky-900 text-[10px] font-black uppercase tracking-wider">
                À Vista
              </span>
            </div>

            <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-xs text-slate-600">
              <div className="flex items-center gap-2 text-slate-800 font-bold">
                <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
                <span>Débito Online Visa, Elo e Mastercard</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Pagamento seguro direto da sua conta corrente através de autenticação bancária com confirmação rápida.
              </p>
            </div>
          </div>
        )}

        {/* TAB 4: BOLETO BANCÁRIO */}
        {selectedTab === 'boleto' && (
          <div className="flex-1 flex flex-col space-y-3 py-2">
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider block">
                    Boleto Bancário
                  </span>
                  <span className="text-2xl font-black text-amber-950">
                    {gateways?.boleto?.formattedCustomerAmount || formattedCash}
                  </span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-amber-200 text-amber-900 text-[10px] font-black uppercase tracking-wider">
                3 Dias Úteis
              </span>
            </div>

            <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-xs text-slate-600">
              <div className="flex items-center gap-2 text-slate-800 font-bold">
                <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Vencimento em 3 dias úteis</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Pague em qualquer agência bancária, lotérica ou pelo Internet Banking do seu banco. A compensação ocorre em até 1 dia útil após o pagamento.
              </p>
            </div>
          </div>
        )}

        {/* Footer Security Badge */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-1.5 text-[11px]">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium text-slate-600">Processamento Seguro & Criptografia SSL</span>
          </div>
          <button
            onClick={onClose}
            className="btn-gold py-2 px-4 text-xs font-bold rounded-xl cursor-pointer"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
}

