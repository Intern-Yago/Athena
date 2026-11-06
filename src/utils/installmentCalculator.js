/**
 * Athena Intelligent Payment & Asaas Gateway Calculator
 * 
 * Precisely matches the real rate contract of Asaas:
 * - Credit Card Online Intermediation (MDR):
 *     1x: 2.99% + R$ 0.49
 *     2x to 6x: 3.49% + R$ 0.49
 *     7x to 12x: 3.99% + R$ 0.49
 * - Automatic Anticipation (Antecipação Automática):
 *     1x à vista: 1.15% a.m.
 *     2x to 12x parceladas: 1.60% a.m.
 * - PIX Dinâmico API: R$ 0.99 (promocional) / R$ 1.99 padrão (D+0)
 * - Cartão de Débito Online: 1.89% + R$ 0.35 (D+3)
 * - Boleto Bancário: R$ 0.99 (promocional) / R$ 1.99 padrão (D+1)
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
 * Calculate all installments from 1x to maxInstallments with exact Asaas auto-anticipation formula:
 * TotalToCharge = (NetPrice + 0.49) / (1 - TotalRate)
 * @param {number|string} cashPrice - The net cash price you want to receive
 * @param {number} maxInstallments - Maximum number of installments (default: 12)
 * @returns {Array} List of installment objects
 */
export function calculateInstallments(cashPrice, maxInstallments = 12) {
  const numPrice = parseNumericPrice(cashPrice);
  if (!numPrice || numPrice <= 0) return [];

  const max = Math.min(Math.max(1, maxInstallments), 12);
  const result = [];
  const fixedFee = 0.49; // R$ 0,49 por transação no cartão Asaas

  for (let i = 1; i <= max; i++) {
    const totalRate = getAsaasCreditCardTotalRate(i);
    // Exact gross charge needed so that: Gross * (1 - totalRate) - 0.49 === numPrice
    const totalValue = Math.round(((numPrice + fixedFee) / (1 - totalRate)) * 100) / 100;
    const installmentValue = Math.round((totalValue / i) * 100) / 100;
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
 * Helper to get the best installment summary text (e.g. "ou 12x de R$ 58,45")
 * @param {number|string} cashPrice 
 * @param {number} maxInstallments 
 * @returns {string}
 */
export function getBestInstallmentText(cashPrice, maxInstallments = 12) {
  const list = calculateInstallments(cashPrice, maxInstallments);
  if (list.length === 0) return '';
  const best = list[list.length - 1];
  return `ou em até ${best.installments}x de ${best.formattedInstallment}`;
}

/**
 * Comprehensive Gateway Payment Simulation based on user's exact Asaas account rates:
 * Ensures the merchant receives 100% OF THE NET CASH PRICE (R$ 600,00 líquido) across all methods:
 * - PIX: R$ 0,99 taxa embutida -> Você recebe 100% líquido (D+0)
 * - Débito: 1,89% + R$ 0,35 taxa embutida -> Você recebe 100% líquido (D+3)
 * - Boleto: R$ 0,99 taxa embutida -> Você recebe 100% líquido (D+1)
 * - Crédito: MDR + Antecipação Automática (1,15%-1,60% a.m.) embutidos -> Você recebe 100% líquido à vista (D+2)
 * @param {number|string} cashPrice 
 * @returns {object|null}
 */
export function calculatePaymentGateways(cashPrice) {
  const numPrice = parseNumericPrice(cashPrice);
  if (!numPrice || numPrice <= 0) return null;

  // 1. PIX Dinâmico via API Asaas (R$ 0,99 promocional por cobrança recebida)
  const pixFee = 0.99;
  const pixCustomer = Math.round((numPrice + pixFee) * 100) / 100;
  const pixNet = numPrice;

  // 2. Boleto Bancário Asaas (R$ 0,99 promocional por boleto pago)
  const boletoFee = 0.99;
  const boletoCustomer = Math.round((numPrice + boletoFee) * 100) / 100;
  const boletoNet = numPrice;

  // 3. Cartão de Débito Online Asaas (1,89% + R$ 0,35)
  // Cobrado = (numPrice + 0.35) / (1 - 0.0189)
  const debitCustomer = Math.round(((numPrice + 0.35) / (1 - 0.0189)) * 100) / 100;
  const debitFee = Math.round((debitCustomer - numPrice) * 100) / 100;
  const debitNet = numPrice;

  // 4. Cartão de Crédito com Antecipação Automática Asaas (1x até 12x)
  const installments = calculateInstallments(numPrice, 12);

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

