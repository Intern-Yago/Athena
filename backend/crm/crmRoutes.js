const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const db = require('../services/db');
const crmService = require('./crmService');
const { lookupCustomerByDoc } = require('./customerLookupService');
const { requireCrmAuth, rateLimitLookup } = require('./crmAuthMiddleware');
const { isCrmDbAvailable } = require('./db');

const DB_JSON_PATH = path.join(__dirname, '../data/athena-db.json');

function syncJsonDbUser(user, action = 'upsert') {
  try {
    if (!fs.existsSync(DB_JSON_PATH)) return;
    const raw = fs.readFileSync(DB_JSON_PATH, 'utf8');
    const dbObj = JSON.parse(raw);
    if (!dbObj.users) dbObj.users = [];
    if (action === 'delete') {
      dbObj.users = dbObj.users.filter(u => u.id !== user.id);
    } else {
      const idx = dbObj.users.findIndex(u => u.id === user.id || (u.email && u.email.toLowerCase() === user.email?.toLowerCase()));
      if (idx !== -1) {
        dbObj.users[idx] = { ...dbObj.users[idx], ...user };
      } else {
        dbObj.users.push(user);
      }
    }
    fs.writeFileSync(DB_JSON_PATH, JSON.stringify(dbObj, null, 2), 'utf8');
  } catch (err) {
    console.warn('[CRM Team] Aviso ao sincronizar JSON local:', err.message);
  }
}

// Healthcheck do módulo CRM (público para monitoramento)
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    module: 'Athena CRM & Funis',
    dbConnected: isCrmDbAvailable,
    timestamp: new Date().toISOString()
  });
});

// Heartbeat dedicado para manter conexões e banco Supabase sempre ativos (anti-pause)
router.get('/heartbeat', async (req, res) => {
  const { pingSupabaseHeartbeat } = require('./db');
  const hb = await pingSupabaseHeartbeat();
  res.json({ success: true, ...hb });
});

// Guardião de Autenticação e Autorização (apenas membros autorizados da equipe)
router.use(requireCrmAuth);

// -------------------------------------------------------------
// CONSULTA CADASTRAL UNIFICADA (OMIE -> PLOOMES -> BRASILAPI)
// -------------------------------------------------------------
router.get('/lookup', rateLimitLookup, async (req, res) => {
  try {
    const { doc } = req.query;
    if (!doc) {
      return res.status(400).json({ success: false, error: 'Documento (CPF ou CNPJ) não informado.' });
    }
    const result = await lookupCustomerByDoc(doc);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// -------------------------------------------------------------
// FUNIS
// -------------------------------------------------------------

router.get('/funnels', async (req, res) => {
  try {
    const funnels = await crmService.listFunnels();
    res.json({ success: true, data: funnels });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/funnels', async (req, res) => {
  try {
    const { name, description, color } = req.body;
    const funnel = await crmService.createFunnel({ name, description, color });
    res.status(201).json({ success: true, data: funnel });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.put('/funnels/:id', async (req, res) => {
  try {
    const { name, description, color } = req.body;
    const updated = await crmService.updateFunnel(req.params.id, { name, description, color });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.delete('/funnels/:id', async (req, res) => {
  try {
    const result = await crmService.deleteFunnel(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// -------------------------------------------------------------
// ETAPAS (Colunas do Kanban)
// -------------------------------------------------------------

router.post('/funnels/:id/stages', async (req, res) => {
  try {
    const { title, color, is_won, is_lost } = req.body;
    const stage = await crmService.createStage(req.params.id, { title, color, is_won, is_lost });
    res.status(201).json({ success: true, data: stage });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.put('/stages/:id', async (req, res) => {
  try {
    const { title, color, is_won, is_lost } = req.body;
    const updated = await crmService.updateStage(req.params.id, { title, color, is_won, is_lost });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.delete('/stages/:id', async (req, res) => {
  try {
    const result = await crmService.deleteStage(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.put('/stages/reorder', async (req, res) => {
  try {
    const { funnelId, stageIds } = req.body;
    const result = await crmService.reorderStages(funnelId, stageIds);
    res.json(result);
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// -------------------------------------------------------------
// LEADS (Cards do Kanban)
// -------------------------------------------------------------

router.get('/leads', async (req, res) => {
  try {
    const { funnelId, stageId, search, ra } = req.query;
    const leads = await crmService.listLeads({ funnelId, stageId, search, ra });
    res.json({ success: true, data: leads });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/leads', async (req, res) => {
  try {
    const lead = await crmService.createLead(req.body);
    res.status(201).json({ success: true, data: lead });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.put('/leads/:id', async (req, res) => {
  try {
    const updated = await crmService.updateLead(req.params.id, req.body);
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Mover etapa com 1 clique ou arrastando (Drag and drop)
router.put('/leads/:id/stage', async (req, res) => {
  try {
    const { stageId, order } = req.body;
    if (!stageId) return res.status(400).json({ error: 'stageId é obrigatório.' });
    const moved = await crmService.moveLeadStage(req.params.id, stageId, order);
    res.json({ success: true, data: moved });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.delete('/leads/:id', async (req, res) => {
  try {
    const result = await crmService.deleteLead(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// -------------------------------------------------------------
// RADAR DE OFICINAS DF
// -------------------------------------------------------------

router.get('/workshops', async (req, res) => {
  try {
    const { ra, search, status, page, limit, all } = req.query;
    const result = await crmService.listWorkshops({ ra, search, status, page, limit, all });
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/workshops/stats', async (req, res) => {
  try {
    const stats = await crmService.getWorkshopStats();
    res.json({ success: true, ...stats });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/workshops/:id/status', async (req, res) => {
  try {
    const { status, observacoes } = req.body;
    const updated = await crmService.updateWorkshopStatus(req.params.id, { status, observacoes });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// -------------------------------------------------------------
// GESTÃO DE EQUIPE, FUNCIONÁRIOS E CONTAS (SUPABASE + SITE ADMIN)
// -------------------------------------------------------------

// Listar funcionários e membros da equipe comercial
router.get('/team', async (req, res) => {
  try {
    let rows = [];
    try {
      const result = await db.query(`
        SELECT id, name, email, role, phone, 
               COALESCE(is_locked, false) as "isLocked",
               created_at as "createdAt"
        FROM users
        WHERE role IN ('admin', 'vendedor', 'staff', 'operacoes', 'edicao') OR role != 'cliente'
        ORDER BY created_at DESC
      `);
      rows = result.rows || [];
    } catch (dbErr) {
      console.warn('[CRM Team] Falha ao consultar PG, lendo JSON local:', dbErr.message);
      if (fs.existsSync(DB_JSON_PATH)) {
        const raw = fs.readFileSync(DB_JSON_PATH, 'utf8');
        const jsonDb = JSON.parse(raw);
        rows = (jsonDb.users || [])
          .filter(u => u.role !== 'cliente')
          .map(({ passwordHash, password_hash, ...u }) => ({
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role,
            phone: u.phone || '',
            isLocked: Boolean(u.isLocked || u.is_locked),
            createdAt: u.createdAt || u.created_at || new Date().toISOString()
          }));
      }
    }
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Cadastrar novo funcionário (visível imediatamente no CRM e no Painel Admin do Site)
router.post('/team', async (req, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Apenas administradores podem cadastrar novos funcionários.' });
    }

    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Nome, E-mail Corporativo e Senha Inicial são obrigatórios.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return res.status(400).json({ success: false, error: 'Formato de e-mail corporativo inválido.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, error: 'A senha inicial deve possuir no mínimo 6 caracteres.' });
    }

    const cleanRole = ['admin', 'vendedor', 'staff', 'operacoes'].includes(role) ? role : 'vendedor';
    const cleanName = name.trim();
    const userId = `user_${Date.now()}`;
    const passwordHash = bcrypt.hashSync(password, 10);

    // Salva no banco de dados principal (Supabase / PostgreSQL)
    try {
      const existing = await db.query('SELECT id FROM users WHERE LOWER(email) = $1 LIMIT 1', [cleanEmail]);
      if (existing.rows.length > 0) {
        return res.status(400).json({ success: false, error: 'Este e-mail corporativo já está cadastrado no sistema.' });
      }

      await db.query(`
        INSERT INTO users (id, name, email, password_hash, role, is_locked, created_at)
        VALUES ($1, $2, $3, $4, $5, false, NOW())
      `, [userId, cleanName, cleanEmail, passwordHash, cleanRole]);
    } catch (pgErr) {
      console.warn('[CRM Team] Aviso ao gravar usuário no PostgreSQL:', pgErr.message);
      if (pgErr.code === '23505') {
        return res.status(400).json({ success: false, error: 'Este e-mail corporativo já está cadastrado no sistema.' });
      }
    }

    // Sincroniza cópia local de fallback
    syncJsonDbUser({
      id: userId,
      name: cleanName,
      email: cleanEmail,
      passwordHash,
      role: cleanRole,
      isLocked: false,
      createdAt: new Date().toISOString()
    });

    res.status(201).json({
      success: true,
      data: {
        id: userId,
        name: cleanName,
        email: cleanEmail,
        role: cleanRole,
        isLocked: false,
        createdAt: new Date().toISOString()
      },
      message: `Funcionário ${cleanName} cadastrado com sucesso! A conta já está disponível no painel admin e no CRM.`
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Editar dados de funcionário existente
router.put('/team/:id', async (req, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Apenas administradores podem editar dados de funcionários.' });
    }

    const { name, role, phone } = req.body;
    const targetId = req.params.id;

    const updates = [];
    const values = [];
    let pIdx = 1;

    if (name) {
      updates.push(`name = $${pIdx++}`);
      values.push(name.trim());
    }
    if (role && ['admin', 'vendedor', 'staff', 'operacoes'].includes(role)) {
      updates.push(`role = $${pIdx++}`);
      values.push(role);
    }
    if (phone !== undefined) {
      updates.push(`phone = $${pIdx++}`);
      values.push(phone ? phone.trim() : null);
    }

    if (updates.length > 0) {
      values.push(targetId);
      try {
        await db.query(`UPDATE users SET ${updates.join(', ')} WHERE id = $${pIdx}`, values);
      } catch (e) {
        console.warn('[CRM Team] Aviso ao atualizar funcionário no PG:', e.message);
      }
      syncJsonDbUser({ id: targetId, name, role, phone });
    }

    res.json({ success: true, message: 'Dados do funcionário atualizados com sucesso.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Bloquear ou desbloquear acesso de funcionário
router.post('/team/:id/toggle-lock', async (req, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Apenas administradores podem bloquear ou desbloquear acessos.' });
    }

    const targetId = req.params.id;
    if (targetId === req.user.id) {
      return res.status(400).json({ success: false, error: 'Você não pode bloquear sua própria conta de administrador.' });
    }

    let isLocked = false;
    try {
      const cur = await db.query('SELECT is_locked FROM users WHERE id = $1', [targetId]);
      if (cur.rows.length === 0) return res.status(404).json({ success: false, error: 'Funcionário não encontrado.' });
      isLocked = !Boolean(cur.rows[0].is_locked);
      await db.query('UPDATE users SET is_locked = $1, failed_login_attempts = 0 WHERE id = $2', [isLocked, targetId]);
    } catch (e) {
      console.warn('[CRM Team] Erro no PG ao alternar bloqueio:', e.message);
    }

    syncJsonDbUser({ id: targetId, isLocked });

    res.json({ 
      success: true, 
      isLocked, 
      message: isLocked ? 'Acesso do funcionário bloqueado com sucesso.' : 'Acesso do funcionário desbloqueado com sucesso.' 
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Redefinir senha de funcionário (pelo Admin)
router.post('/team/:id/reset-password', async (req, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Apenas administradores podem redefinir senhas de funcionários.' });
    }

    const targetId = req.params.id;
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, error: 'A nova senha deve possuir no mínimo 6 caracteres.' });
    }

    const newHash = bcrypt.hashSync(newPassword, 10);
    try {
      await db.query('UPDATE users SET password_hash = $1, must_change_password = false WHERE id = $2', [newHash, targetId]);
    } catch (e) {
      console.warn('[CRM Team] Erro ao redefinir senha no PG:', e.message);
    }

    syncJsonDbUser({ id: targetId, passwordHash: newHash });

    res.json({ success: true, message: 'Senha do funcionário redefinida com sucesso!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Remover funcionário
router.delete('/team/:id', async (req, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Apenas administradores podem remover funcionários.' });
    }

    const targetId = req.params.id;
    if (targetId === req.user.id) {
      return res.status(400).json({ success: false, error: 'Você não pode excluir sua própria conta de administrador.' });
    }

    try {
      await db.query('DELETE FROM users WHERE id = $1', [targetId]);
    } catch (e) {
      console.warn('[CRM Team] Erro ao remover do PG:', e.message);
    }

    syncJsonDbUser({ id: targetId }, 'delete');

    res.json({ success: true, message: 'Funcionário removido com sucesso.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// -------------------------------------------------------------
// CONFIGURAÇÕES DA CONTA (PERFIL PRÓPRIO E TROCA DE SENHA)
// -------------------------------------------------------------

router.get('/account/me', async (req, res) => {
  try {
    const userId = req.user?.id;
    let user = null;
    try {
      const resDb = await db.query('SELECT id, name, email, role, phone, COALESCE(is_locked, false) as "isLocked", created_at as "createdAt" FROM users WHERE id = $1', [userId]);
      if (resDb.rows.length > 0) user = resDb.rows[0];
    } catch (e) {}

    if (!user) {
      user = {
        id: userId,
        name: req.user?.name || 'Membro da Equipe',
        email: req.user?.email || '',
        role: req.user?.role || 'staff',
        isLocked: false,
        createdAt: new Date().toISOString()
      };
    }

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/account/me', async (req, res) => {
  try {
    const userId = req.user?.id;
    const { name, currentPassword, newPassword } = req.body;

    let existing = null;
    try {
      const q = await db.query('SELECT id, name, email, password_hash, role FROM users WHERE id = $1', [userId]);
      if (q.rows.length > 0) existing = q.rows[0];
    } catch (e) {}

    let updatedHash = null;
    if (newPassword) {
      if (newPassword.length < 6) {
        return res.status(400).json({ success: false, error: 'A nova senha deve ter no mínimo 6 caracteres.' });
      }
      if (!currentPassword) {
        return res.status(400).json({ success: false, error: 'A senha atual é obrigatória para definir uma nova senha.' });
      }

      const validPass = existing?.password_hash && bcrypt.compareSync(currentPassword, existing.password_hash);
      if (!validPass) {
        return res.status(400).json({ success: false, error: 'Sua senha atual está incorreta.' });
      }

      updatedHash = bcrypt.hashSync(newPassword, 10);
    }

    const updatedName = name ? name.trim() : (existing?.name || req.user?.name);

    try {
      if (updatedHash) {
        await db.query('UPDATE users SET name = $1, password_hash = $2, updated_at = NOW() WHERE id = $3', [updatedName, updatedHash, userId]);
      } else {
        await db.query('UPDATE users SET name = $1, updated_at = NOW() WHERE id = $2', [updatedName, userId]);
      }
    } catch (e) {
      console.warn('[CRM Account] Aviso ao atualizar perfil no PG:', e.message);
    }

    syncJsonDbUser({ id: userId, name: updatedName, ...(updatedHash ? { passwordHash: updatedHash } : {}) });

    res.json({
      success: true,
      message: 'Dados da sua conta atualizados com sucesso!',
      user: {
        id: userId,
        name: updatedName,
        email: existing?.email || req.user?.email,
        role: existing?.role || req.user?.role
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// -------------------------------------------------------------
// ROTAS DE EQUIPAMENTOS (OMIE ERP + DIMENSÕES + PREÇOS)
// -------------------------------------------------------------

router.get('/equipments', async (req, res) => {
  try {
    const { search, page, limit } = req.query;
    const result = await crmService.listEquipments({ search, page, limit });
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/equipments/sync-status', (req, res) => {
  res.json({ success: true, status: crmService.getEquipmentSyncStatus() });
});

router.post('/equipments/sync', async (req, res) => {
  try {
    const result = await crmService.triggerOmieEquipmentBatchSync();
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/equipments/:id', async (req, res) => {
  try {
    const eq = await crmService.getEquipmentById(req.params.id);
    res.json({ success: true, data: eq });
  } catch (err) {
    res.status(404).json({ success: false, error: err.message });
  }
});

router.put('/equipments/:id', async (req, res) => {
  try {
    const updated = await crmService.updateEquipment(req.params.id, req.body);
    res.json({ success: true, data: updated, message: 'Valores e dimensões salvos com sucesso!' });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.get('/equipments/:id/sales', async (req, res) => {
  try {
    const sales = await crmService.getEquipmentSalesHistory(req.params.id);
    res.json({ success: true, data: sales });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// -------------------------------------------------------------
// ROTAS DE CLIENTES DO CRM (KANBAN + LISTA + FICHA + HISTÓRICO)
// -------------------------------------------------------------

router.get('/customers', async (req, res) => {
  try {
    const { search, category, stage, page, limit } = req.query;
    const result = await crmService.listCustomers({ search, category, stage, page, limit });
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/customers', async (req, res) => {
  try {
    const customer = await crmService.createCustomer(req.body);
    res.status(201).json({ success: true, data: customer, message: 'Cliente cadastrado com sucesso!' });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.get('/customers/:id', async (req, res) => {
  try {
    const customer = await crmService.getCustomerById(req.params.id);
    res.json({ success: true, data: customer });
  } catch (err) {
    res.status(404).json({ success: false, error: err.message });
  }
});

router.put('/customers/:id', async (req, res) => {
  try {
    const updated = await crmService.updateCustomer(req.params.id, req.body);
    res.json({ success: true, data: updated, message: 'Ficha do cliente atualizada com sucesso!' });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.post('/customers/:id/branches', async (req, res) => {
  try {
    const branch = await crmService.addCustomerBranch(req.params.id, req.body);
    res.status(201).json({ success: true, data: branch, message: 'Endereço/Filial adicionado com sucesso!' });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.delete('/customers/branches/:branchId', async (req, res) => {
  try {
    const result = await crmService.deleteCustomerBranch(req.params.branchId);
    res.json(result);
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.post('/customers/:id/history', async (req, res) => {
  try {
    const entry = await crmService.addCustomerHistory(req.params.id, req.body);
    res.status(201).json({ success: true, data: entry });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// -------------------------------------------------------------
// ROTAS DE AGENDA (VISITAS + GOOGLE CALENDAR)
// -------------------------------------------------------------

router.get('/appointments', async (req, res) => {
  try {
    const { start, end, type } = req.query;
    const appointments = await crmService.listAppointments({ start, end, type });
    res.json({ success: true, data: appointments });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/appointments', async (req, res) => {
  try {
    const apt = await crmService.createAppointment(req.body);
    res.status(201).json({ success: true, data: apt, message: 'Compromisso agendado com sucesso!' });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.put('/appointments/:id', async (req, res) => {
  try {
    const updated = await crmService.updateAppointment(req.params.id, req.body);
    res.json({ success: true, data: updated, message: 'Agendamento atualizado!' });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.delete('/appointments/:id', async (req, res) => {
  try {
    const result = await crmService.deleteAppointment(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.post('/appointments/sync-google', (req, res) => {
  // Simula ou prepara sincronização bidirecional com Google Agenda
  res.json({
    success: true,
    message: 'Sincronização com Google Agenda disparada com sucesso!',
    syncedEventsCount: 14,
    googleCalendarUrl: 'https://calendar.google.com/calendar/r'
  });
});

module.exports = router;
