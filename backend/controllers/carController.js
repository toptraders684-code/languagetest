const carService = require('../services/carService');

async function getAll(req, res) {
  try {
    const cars = await carService.getAll(req.query);
    res.json(cars);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getById(req, res) {
  try {
    const car = await carService.getById(req.params.id);
    if (!car) return res.status(404).json({ error: 'Car not found' });
    res.json(car);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function create(req, res) {
  try {
    const data = { ...req.body, created_by: req.user.id };
    if (req.files && req.files.length > 0) {
      data.images = req.files.map(f => `/uploads/${f.filename}`);
    }
    const car = await carService.create(data);
    res.status(201).json(car);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function update(req, res) {
  try {
    const data = { ...req.body };
    if (req.files && req.files.length > 0) {
      data.images = req.files.map(f => `/uploads/${f.filename}`);
    }
    const car = await carService.update(req.params.id, data);
    if (!car) return res.status(404).json({ error: 'Car not found' });
    res.json(car);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function remove(req, res) {
  try {
    await carService.remove(req.params.id);
    res.json({ message: 'Car deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { getAll, getById, create, update, remove };
