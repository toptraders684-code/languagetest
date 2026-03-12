const dealService = require('../services/dealService');

async function getAll(req, res) {
  try {
    const deals = await dealService.getAll(req.query);
    res.json(deals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getById(req, res) {
  try {
    const deal = await dealService.getById(req.params.id);
    if (!deal) return res.status(404).json({ error: 'Deal not found' });
    res.json(deal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function create(req, res) {
  try {
    const data = { ...req.body, created_by: req.user.id };
    const deal = await dealService.create(data);
    res.status(201).json(deal);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function update(req, res) {
  try {
    const data = { ...req.body, updated_by: req.user.id };
    const deal = await dealService.update(req.params.id, data);
    if (!deal) return res.status(404).json({ error: 'Deal not found' });
    res.json(deal);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

module.exports = { getAll, getById, create, update };
