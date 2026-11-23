/**
 * Athena Intelligent Payment & Asaas Gateway Calculator
 * 
 * Supports both:
 * 1. Fixed Manufacturer/Table Installments (Tabela Fixa da Montadora / Parcelamento Manual)
 * 2. Automatic Asaas Gateway Rates (MDR + Antecipação Automática)
 */

/**
 * Format number to Brazilian Real (BRL) currency
 * @param {number} value
 * @returns {string} e.g. "R$ 600,00"
 */
export function formatBRL(value) {
  if (value === null || value === undefined || isNaN(value)) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

/**
 * Parse numeric price safely from string or number
 * @param {number|string} price
 * @returns {number}
 */
export function parseNumericPrice(price) {
  if (typeof price === 'number') return isNaN(price) ? 0 : price;
  if (typeof price === 'string') {
    const clean = price.replace(/[^\d.,]/g, '').replace(',', '.');
    const num = parseFloat(clean);
    return isNaN(num) ? 0 : num;
  }
  return 0;
}

/**
 * Asaas exact MDR + Auto-Anticipation Total Discount Rate
 * @param {number} installments 
 * @returns {number} Decimal rate (e.g. 0.0414 for 4.14%)
 */
export function getAsaasCreditCardTotalRate(installments) {
  const n = Math.min(Math.max(1, installments), 12);
  
  // 1. MDR (Intermediação online padrão Asaas)
  let mdr = 0.0299; // 1x
  if (n >= 2 && n <= 6) mdr = 0.0349;
  if (n >= 7 && n <= 12) mdr = 0.0399;

  // 2. Antecipação Automática
  // 1x à vista = 1.15%
  // 2x a 12x = 1.60% a.m. x ((N+1)/2)
  let anticipation = 0.0115;
  if (n > 1) {
    anticipation = 0.0160 * ((n + 1) / 2);
  }

  return mdr + anticipation;
}

/**
 * Calculate all installments from 1x to maxInstallments.
 * If manualInstallmentTotal is provided, uses fixed manufacturer installment pricing.
 * Otherwise, applies exact Asaas auto-anticipation formula:
 * TotalToCharge = (NetPrice + 0.49) / (1 - TotalRate)
 * @param {number|string} cashPrice - The net cash price you want to receive
 * @param {number} maxInstallments - Maximum number of installments (default: 12)
 * @param {number|string|null} manualInstallmentTotal - Fixed total installment price (e.g. 10450 for EAATA 90)
 * @returns {Array} List of installment objects
 */
export function calculateInstallments(cashPrice, maxInstallments = 12, manualInstallmentTotal = null) {
  const numPrice = parseNumericPrice(cashPrice);
  if (!numPrice || numPrice <= 0) return [];

  const max = Math.min(Math.max(1, maxInstallments), 12);
  const manualTotal = parseNumericPrice(manualInstallmentTotal);
  const isManual = manualTotal > 0 && manualTotal >= numPrice;

  const result = [];
  const fixedFee = 0.49;

  for (let i = 1; i <= max; i++) {
    let totalValue;
    let installmentValue;

    if (isManual) {
      if (i === 1) {
        totalValue = numPrice;
        installmentValue = numPrice;
      } else {
        // Proporcional de 2x até max, atingindo manualTotal em max
        const ratio = (i - 1) / (max - 1);
        totalValue = Math.round((numPrice + (manualTotal - numPrice) * ratio) * 100) / 100;
        if (i === max) totalValue = manualTotal;
        installmentValue = Math.round((totalValue / i) * 100) / 100;
      }
    } else {
      const totalRate = getAsaasCreditCardTotalRate(i);
      totalValue = Math.round(((numPrice + fixedFee) / (1 - totalRate)) * 100) / 100;
      installmentValue = Math.round((totalValue / i) * 100) / 100;
    }

    const diff = Math.round((totalValue - numPrice) * 100) / 100;
    const percentage = Math.round(((totalValue - numPrice) / numPrice) * 1000) / 10;

    result.push({
      installments: i,
      installmentValue,
      totalValue,
      interestAmount: diff,
      interestPercentage: percentage,
      formattedInstallment: formatBRL(installmentValue),
      formattedTotal: formatBRL(totalValue),
      netReceived: numPrice,
      formattedNetReceived: formatBRL(numPrice),
      isBestValue: i === max
    });
  }

  return result;
}

/**
 * Helper to get the best installment summary text (e.g. "ou 12x de R$ 870,83")
 * @param {number|string} cashPrice 
 * @param {number} maxInstallments 
 * @param {number|string|null} manualInstallmentTotal
 * @returns {string}
 */
export function getBestInstallmentText(cashPrice, maxInstallments = 12, manualInstallmentTotal = null) {
  const list = calculateInstallments(cashPrice, maxInstallments, manualInstallmentTotal);
  if (list.length === 0) return '';
  const best = list[list.length - 1];
  return `ou em até ${best.installments}x de ${best.formattedInstallment}`;
}

/**
 * Comprehensive Gateway Payment Simulation
 * @param {number|string} cashPrice 
 * @param {number|string|null} manualInstallmentTotal
 * @param {number} maxInstallments
 * @returns {object|null}
 */
export function calculatePaymentGateways(cashPrice, manualInstallmentTotal = null, maxInstallments = 12) {
  const numPrice = parseNumericPrice(cashPrice);
  if (!numPrice || numPrice <= 0) return null;

  // 1. PIX Dinâmico: Valor líquido exato cadastrado (sem repassar centavos de taxa para o cliente)
  const pixCustomer = numPrice;
  const pixFee = 0;
  const pixNet = numPrice;

  // 2. Boleto Bancário Asaas
  const boletoFee = 0.99;
  const boletoCustomer = Math.round((numPrice + boletoFee) * 100) / 100;
  const boletoNet = numPrice;

  // 3. Cartão de Débito Online Asaas
  const debitCustomer = Math.round(((numPrice + 0.35) / (1 - 0.0189)) * 100) / 100;
  const debitFee = Math.round((debitCustomer - numPrice) * 100) / 100;
  const debitNet = numPrice;

  // 4. Cartão de Crédito
  const installments = calculateInstallments(numPrice, maxInstallments, manualInstallmentTotal);

  return {
    basePrice: numPrice,
    formattedBasePrice: formatBRL(numPrice),
    pix: {
      customerAmount: pixCustomer,
      formattedCustomerAmount: formatBRL(pixCustomer),
      estimatedFee: pixFee,
      formattedFee: formatBRL(pixFee),
      netReceived: pixNet,
      formattedNetReceived: formatBRL(pixNet),
      settlementTime: 'Poucos segundos (D+0)',
      description: 'Taxa fixa de R$ 0,99 embutida para você receber o valor líquido integral'
    },
    boleto: {
      customerAmount: boletoCustomer,
      formattedCustomerAmount: formatBRL(boletoCustomer),
      estimatedFee: boletoFee,
      formattedFee: formatBRL(boletoFee),
      netReceived: boletoNet,
      formattedNetReceived: formatBRL(boletoNet),
      settlementTime: '1 dia útil após o pagamento (D+1)',
      description: 'Taxa fixa de R$ 0,99 embutida para você receber o valor líquido integral'
    },
    debit: {
      customerAmount: debitCustomer,
      formattedCustomerAmount: formatBRL(debitCustomer),
      estimatedFee: debitFee,
      formattedFee: formatBRL(debitFee),
      netReceived: debitNet,
      formattedNetReceived: formatBRL(debitNet),
      settlementTime: '3 dias após o pagamento (D+3)',
      description: 'Taxa de 1,89% + R$ 0,35 embutida para você receber o valor líquido integral'
    },
    credit: {
      installments,
      netReceivedAtSight: numPrice,
      formattedNetReceivedAtSight: formatBRL(numPrice),
      settlementTime: 'Até 2 dias úteis com antecipação (D+2)',
      description: 'MDR e juros de antecipação automática (1,15%-1,60% a.m.) embutidos para você receber 100% líquido à vista'
    }
  };
}

