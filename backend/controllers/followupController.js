const followupService = require('../services/followupService');

async function getAll(req, res) {
  try {
    const filters = { ...req.query };
    if (req.user.role === 'sales_executive') {
      filters.sales_executive_id = req.user.id;
    }
    const followups = await followupService.getAll(filters);
    res.json(followups);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function create(req, res) {
  try {
    const data = { ...req.body, sales_executive_id: req.body.sales_executive_id || req.user.id };
    const followup = await followupService.create(data);
    res.status(201).json(followup);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function update(req, res) {
  try {
    const followup = await followupService.update(req.params.id, req.body);
    if (!followup) return res.status(404).json({ error: 'Follow-up not found' });
    res.json(followup);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

module.exports = { getAll, create, update };
