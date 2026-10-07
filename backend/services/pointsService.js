/**
 * pointsService.js
 * 
 * Servico de Fidelidade e Ledger Imutavel de A-Points do Athena OS.
 * Implementa controle estrito de concorrencia com Pessimistic Locking (SELECT ... FOR UPDATE)
 * e idempotencia absoluta para evitar gasto duplo ou credito duplicado.
 */

const { withTransaction, query } = require('./db');
const { recordSecurityEvent } = require('./securityAuditService');

/**
 * Aplica uma transacao no Ledger de A-Points de forma atomica com lock no saldo do usuario.
 * Suporta idempotencia: se a chave (reference_type, reference_id, transaction_type) ja existir,
 * retorna a transacao existente sem alterar o saldo novamente.
 */
async function applyPointsTransaction({
  customerId,
  orderId = null,
  referenceType,
  referenceId,
  transactionType,
  pointsAmount, // Positivo para credito, Negativo para debito
  description,
  createdBy = 'SYSTEM'
}) {
  if (!customerId) throw new Error('customerId é obrigatório para transação de pontos.');
  if (!referenceType || !referenceId) throw new Error('referenceType e referenceId são obrigatórios para idempotência.');
  if (pointsAmount === 0 || isNaN(pointsAmount)) throw new Error('pointsAmount não pode ser zero.');

  const delta = parseInt(pointsAmount, 10);
  const txType = transactionType || (delta < 0 ? 'redemption_debit' : 'purchase_credit');

  return await withTransaction(async (client) => {
    // 1. Verificacao de Idempotencia: Ja processamos esta referencia exata?
    const existingCheck = await client.query(`
      SELECT id, points_amount, balance_after, created_at
      FROM a_points_ledger
      WHERE reference_type = $1 AND reference_id = $2 AND transaction_type = $3
    `, [referenceType, referenceId, txType]);

    if (existingCheck.rows.length > 0) {
      console.log(`[POINTS IDEMPOTENT SKIP] Transação já processada anteriormente: ${referenceType}:${referenceId} (${transactionType})`);
      return {
        idempotent: true,
        transaction: existingCheck.rows[0]
      };
    }

    // 2. Lock Pessimista no usuario (Impede race conditions de resgates simultaneos)
    const userRes = await client.query(`
      SELECT id, a_points FROM users WHERE id = $1 FOR UPDATE
    `, [customerId]);

    if (userRes.rows.length === 0) {
      throw new Error(`Usuário ${customerId} não encontrado no banco de dados.`);
    }

    const currentBalance = parseInt(userRes.rows[0].a_points || 0, 10);
    const newBalance = currentBalance + delta;

    // 3. Regra de Seguranca: Saldo de pontos nunca pode ficar negativo
    if (newBalance < 0) {
      await recordSecurityEvent({
        eventType: 'POINTS_OVERDRAFT_BLOCKED',
        severity: 'high',
        actorId: customerId,
        targetResource: `users/${customerId}/points`,
        actionAttempted: `Tentativa de débito de ${Math.abs(delta)} pontos com saldo atual ${currentBalance}`,
        decision: 'blocked',
        reason: 'Saldo insuficiente para resgate de pontos'
      });
      throw new Error(`Saldo insuficiente de A-Points. Saldo atual: ${currentBalance}, necessário: ${Math.abs(delta)}.`);
    }

    // 4. Insere no Ledger Imutavel
    const ledgerRes = await client.query(`
      INSERT INTO a_points_ledger (
        customer_id, order_id, reference_type, reference_id,
        transaction_type, points_amount, balance_after, description,
        created_by, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
      RETURNING id, balance_after, created_at
    `, [
      customerId,
      orderId,
      referenceType,
      referenceId,
      txType,
      delta,
      newBalance,
      description,
      createdBy
    ]);

    // 5. Atualiza o saldo consolidado na tabela users
    await client.query(`
      UPDATE users SET a_points = $1, updated_at = NOW() WHERE id = $2
    `, [newBalance, customerId]);

    console.log(`[A-POINTS LEDGER] Usuário ${customerId}: ${delta > 0 ? '+' : ''}${delta} pts. Saldo anterior: ${currentBalance} -> Novo: ${newBalance} (${txType})`);

    return {
      idempotent: false,
      transactionId: ledgerRes.rows[0].id,
      previousBalance: currentBalance,
      newBalance,
      delta
    };
  });
}

/**
 * Credita pontos de uma compra (Ex: 1 ponto a cada R$ 50 gastos)
 */
async function creditPurchasePoints({ customerId, orderId, orderTotal, description = null }) {
  const points = Math.floor(Number(orderTotal) / 50);
  if (points <= 0) return { skipped: true, reason: 'Valor insuficiente para acumular pontos (mínimo R$ 50,00)' };

  return await applyPointsTransaction({
    customerId,
    orderId,
    referenceType: 'order_payment',
    referenceId: orderId,
    transactionType: 'purchase_credit',
    pointsAmount: points,
    description: description || `Crédito de fidelidade referente ao pedido #${orderId}`
  });
}

/**
 * Debita pontos em um resgate de fidelidade
 */
async function debitRedemptionPoints({ customerId, orderId, pointsCost, description = null, createdBy = 'CUSTOMER' }) {
  return await applyPointsTransaction({
    customerId,
    orderId,
    referenceType: 'order_redemption',
    referenceId: orderId,
    transactionType: 'redemption_debit',
    pointsAmount: -Math.abs(pointsCost),
    description: description || `Resgate de item de fidelidade no pedido #${orderId}`,
    createdBy
  });
}

/**
 * Estorna pontos em caso de cancelamento de resgate
 */
async function reverseRedemptionPoints({ customerId, orderId, pointsRefunded, reason }) {
  return await applyPointsTransaction({
    customerId,
    orderId,
    referenceType: 'order_refund',
    referenceId: `refund_${orderId}`,
    transactionType: 'refund_reversal',
    pointsAmount: Math.abs(pointsRefunded),
    description: `Estorno de pontos por cancelamento do pedido #${orderId}: ${reason || 'Cancelado'}`
  });
}

/**
 * Consulta extrato completo de um cliente para o portal do cliente
 */
async function getCustomerLedger(customerId, limit = 50) {
  const res = await query(`
    SELECT id, order_id, transaction_type, points_amount, balance_after, description, created_at
    FROM a_points_ledger
    WHERE customer_id = $1
    ORDER BY created_at DESC
    LIMIT $2
  `, [customerId, limit]);
  return res.rows;
}

/**
 * Consulta o saldo atual de um cliente
 */
async function getCustomerBalance(customerId) {
  const res = await query('SELECT a_points FROM users WHERE id = $1', [customerId]);
  if (res.rows.length === 0) return 0;
  return parseInt(res.rows[0].a_points || 0, 10);
}

module.exports = {
  applyPointsTransaction,
  creditPurchasePoints,
  debitRedemptionPoints,
  reverseRedemptionPoints,
  getCustomerLedger,
  getCustomerBalance
};
