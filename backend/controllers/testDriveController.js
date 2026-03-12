const testDriveService = require('../services/testDriveService');

async function getAll(req, res) {
  try {
    const filters = { ...req.query };
    if (req.user.role === 'sales_executive') {
      filters.sales_executive_id = req.user.id;
    }
    const testDrives = await testDriveService.getAll(filters);
    res.json(testDrives);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getById(req, res) {
  try {
    const td = await testDriveService.getById(req.params.id);
    if (!td) return res.status(404).json({ error: 'Test drive not found' });
    res.json(td);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function create(req, res) {
  try {
    const data = { ...req.body, sales_executive_id: req.body.sales_executive_id || req.user.id };
    const td = await testDriveService.create(data);
    res.status(201).json(td);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function update(req, res) {
  try {
    const td = await testDriveService.update(req.params.id, req.body);
    if (!td) return res.status(404).json({ error: 'Test drive not found' });
    res.json(td);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

module.exports = { getAll, getById, create, update };
