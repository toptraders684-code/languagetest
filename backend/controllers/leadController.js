const leadService = require('../services/leadService');
const activityService = require('../services/activityService');

async function getAll(req, res) {
  try {
    const filters = { ...req.query };
    // Sales executives only see their own leads
    if (req.user.role === 'sales_executive') {
      filters.assigned_to = req.user.id;
    }
    const leads = await leadService.getAll(filters);
    res.json(leads);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getById(req, res) {
  try {
    const lead = await leadService.getById(req.params.id);
    if (!lead) return res.status(404).json({ error: 'Lead not found' });
    res.json(lead);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function create(req, res) {
  try {
    const lead = await leadService.create(req.body);
    res.status(201).json(lead);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function update(req, res) {
  try {
    const data = { ...req.body, updated_by: req.user.id };
    const lead = await leadService.update(req.params.id, data);
    if (!lead) return res.status(404).json({ error: 'Lead not found' });
    res.json(lead);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function remove(req, res) {
  try {
    await leadService.remove(req.params.id);
    res.json({ message: 'Lead deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getTimeline(req, res) {
  try {
    const activities = await activityService.getByLeadId(req.params.id);
    res.json(activities);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { getAll, getById, create, update, remove, getTimeline };
