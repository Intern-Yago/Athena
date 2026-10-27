const express = require('express');
const router = express.Router();
const crmService = require('./crmService');
const { isCrmDbAvailable } = require('./db');

// Healthcheck do módulo CRM
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    module: 'Athena CRM & Funis',
    dbConnected: isCrmDbAvailable,
    timestamp: new Date().toISOString()
  });
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
    const { ra, search, status, page, limit } = req.query;
    const result = await crmService.listWorkshops({ ra, search, status, page, limit });
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

module.exports = router;
