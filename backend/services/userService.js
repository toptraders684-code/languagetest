const bcrypt = require('bcryptjs');
const pool = require('../config/db');

async function getAll() {
  const result = await pool.query(
    'SELECT id, name, email, role, phone, status, created_at FROM users ORDER BY created_at DESC'
  );
  return result.rows;
}

async function getById(id) {
  const result = await pool.query(
    'SELECT id, name, email, role, phone, status, created_at FROM users WHERE id = $1', [id]
  );
  return result.rows[0] || null;
}

async function create({ name, email, password, role, phone }) {
  const hashed = await bcrypt.hash(password, 10);
  const result = await pool.query(
    `INSERT INTO users (name, email, password, role, phone) VALUES ($1, $2, $3, $4, $5)
     RETURNING id, name, email, role, phone, status, created_at`,
    [name, email, hashed, role, phone]
  );
  return result.rows[0];
}

async function update(id, fields) {
  const allowed = ['name', 'email', 'role', 'phone', 'status'];
  const sets = [];
  const values = [];
  let idx = 1;

  for (const key of allowed) {
    if (fields[key] !== undefined) {
      sets.push(`${key} = $${idx}`);
      values.push(fields[key]);
      idx++;
    }
  }

  if (fields.password) {
    sets.push(`password = $${idx}`);
    values.push(await bcrypt.hash(fields.password, 10));
    idx++;
  }

  sets.push(`updated_at = NOW()`);
  values.push(id);

  const result = await pool.query(
    `UPDATE users SET ${sets.join(', ')} WHERE id = $${idx}
     RETURNING id, name, email, role, phone, status`,
    values
  );
  return result.rows[0];
}

async function remove(id) {
  await pool.query('DELETE FROM users WHERE id = $1', [id]);
}

module.exports = { getAll, getById, create, update, remove };
