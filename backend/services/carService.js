const pool = require('../config/db');

async function getAll(filters = {}) {
  let query = 'SELECT * FROM cars WHERE 1=1';
  const values = [];
  let idx = 1;

  if (filters.status) {
    query += ` AND status = $${idx++}`;
    values.push(filters.status);
  }
  if (filters.brand) {
    query += ` AND brand ILIKE $${idx++}`;
    values.push(`%${filters.brand}%`);
  }
  if (filters.model) {
    query += ` AND model ILIKE $${idx++}`;
    values.push(`%${filters.model}%`);
  }
  if (filters.search) {
    query += ` AND (brand ILIKE $${idx} OR model ILIKE $${idx})`;
    values.push(`%${filters.search}%`);
    idx++;
  }

  query += ' ORDER BY created_at DESC';
  const result = await pool.query(query, values);
  return result.rows;
}

async function getById(id) {
  const result = await pool.query('SELECT * FROM cars WHERE id = $1', [id]);
  return result.rows[0] || null;
}

async function create(data) {
  const result = await pool.query(
    `INSERT INTO cars (brand, model, variant, year, mileage, fuel_type, transmission, color,
      registration_number, price_expected, purchase_price, condition_notes, images, status, created_by)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
     RETURNING *`,
    [data.brand, data.model, data.variant, data.year, data.mileage, data.fuel_type,
     data.transmission, data.color, data.registration_number, data.price_expected,
     data.purchase_price, data.condition_notes, data.images || [], data.status || 'available', data.created_by]
  );
  return result.rows[0];
}

async function update(id, data) {
  const allowed = ['brand', 'model', 'variant', 'year', 'mileage', 'fuel_type',
    'transmission', 'color', 'registration_number', 'price_expected', 'purchase_price',
    'condition_notes', 'images', 'status'];
  const sets = [];
  const values = [];
  let idx = 1;

  for (const key of allowed) {
    if (data[key] !== undefined) {
      sets.push(`${key} = $${idx}`);
      values.push(data[key]);
      idx++;
    }
  }

  if (sets.length === 0) return getById(id);

  sets.push('updated_at = NOW()');
  values.push(id);

  const result = await pool.query(
    `UPDATE cars SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`,
    values
  );
  return result.rows[0];
}

async function remove(id) {
  await pool.query('DELETE FROM cars WHERE id = $1', [id]);
}

module.exports = { getAll, getById, create, update, remove };
