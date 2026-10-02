// -------------------------------------------------------------
// ROLE-BASED ACCESS CONTROL (RBAC) & SESSION ISOLATION
// -------------------------------------------------------------

function requireAdmin(req, res, next) {
  if (req.user?.isMagicLinkSession) {
    if (typeof logSecurityEvent === 'function') {
      logSecurityEvent({
        event: 'PRIVILEGE_ESCALATION_BLOCKED',
        userId: req.user.id,
        email: req.user.email,
        outcome: 'BLOCKED',
        reason: 'Tentativa de acesso a rota de administrador via sessão restrita de Magic Link'
      });
    }
    return res.status(403).json({ error: 'Acesso negado. Sessões de Link Emergencial não possuem autorização para executar ações administrativas.' });
  }
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Permissão negada. Apenas administradores podem executar esta ação.' });
  }
  next();
}

function requireStaff(req, res, next) {
  if (req.user?.isMagicLinkSession) {
    if (typeof logSecurityEvent === 'function') {
      logSecurityEvent({
        event: 'PRIVILEGE_ESCALATION_BLOCKED',
        userId: req.user.id,
        email: req.user.email,
        outcome: 'BLOCKED',
        reason: 'Tentativa de acesso a rota de equipe/staff via sessão restrita de Magic Link'
      });
    }
    return res.status(403).json({ error: 'Acesso negado. Sessões de Link Emergencial não possuem autorização para executar ações de equipe.' });
  }
  if (!req.user || !['admin', 'vendedor', 'editor', 'edicao'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Permissão negada. Acesso restrito à equipe interna.' });
  }
  next();
}

module.exports = {
  requireAdmin,
  requireStaff
};
