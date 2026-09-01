/**
 * Athena Intelligent Installment & Asaas Anticipation Calculator
 * 
 * Automatically calculates customer installments (1x to 12x) with Asaas credit card
 * intermediation fee and monthly anticipation rates embedded, ensuring the merchant
 * receives 100% of the net cash price.
 */

// Asaas Rate Table (Intermediation ~2.99% + Anticipation ~1.49% a.m.)
const ASAAS_INSTALLMENT_FACTORS = {
  1: 1.0349,  // +3.49% (1x à vista no cartão)
  2: 1.0495,  // +4.95% (2x)
  3: 1.0645,  // +6.45% (3x)
  4: 1.0795,  // +7.95% (4x)
  5: 1.0950,  // +9.50% (5x)
  6: 1.1110,  // +11.10% (6x)
  7: 1.1275,  // +12.75% (7x)
  8: 1.1445,  // +14.45% (8x)
  9: 1.1620,  // +16.20% (9x)
  10: 1.1799, // +17.99% (10x)
  11: 1.1985, // +19.85% (11x)
  12: 1.2180  // +21.80% (12x)
};

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
 * Calculate all installments from 1x to maxInstallments
 * @param {number|string} cashPrice - The base cash price on PIX
 * @param {number} maxInstallments - Maximum number of installments (default: 12)
 * @returns {Array} List of installment objects
 */
export function calculateInstallments(cashPrice, maxInstallments = 12) {
  const numPrice = typeof cashPrice === 'string' ? parseFloat(cashPrice.replace(/[^\d.,]/g, '').replace(',', '.')) : Number(cashPrice);
  if (!numPrice || isNaN(numPrice) || numPrice <= 0) return [];

  const max = Math.min(Math.max(1, maxInstallments), 12);
  const result = [];

  for (let i = 1; i <= max; i++) {
    const factor = ASAAS_INSTALLMENT_FACTORS[i] || (1 + 0.0299 + (i * 0.015));
    const totalValue = Math.round(numPrice * factor * 100) / 100;
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
      isBestValue: i === max
    });
  }

  return result;
}

/**
 * Helper to get the best installment summary text (e.g. "ou 12x de R$ 60,90")
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
