const pool = require('../config/db');

async function getAll(filters = {}) {
  let query = `SELECT d.*, l.name AS lead_name, l.phone AS lead_phone,
    c.brand AS car_brand, c.model AS car_model, c.registration_number
    FROM deals d
    JOIN leads l ON d.lead_id = l.id
    JOIN cars c ON d.car_id = c.id
    WHERE 1=1`;
  const values = [];
  let idx = 1;

  if (filters.status) {
    query += ` AND d.status = $${idx++}`;
    values.push(filters.status);
  }

  query += ' ORDER BY d.created_at DESC';
  const result = await pool.query(query, values);
  return result.rows;
}

async function getById(id) {
  const result = await pool.query(
    `SELECT d.*, l.name AS lead_name, l.phone AS lead_phone, l.email AS lead_email,
      c.brand AS car_brand, c.model AS car_model, c.registration_number, c.year AS car_year
     FROM deals d
     JOIN leads l ON d.lead_id = l.id
     JOIN cars c ON d.car_id = c.id
     WHERE d.id = $1`, [id]
  );
  return result.rows[0] || null;
}

async function create(data) {
  const result = await pool.query(
    `INSERT INTO deals (lead_id, car_id, sale_price, commission, payment_mode, status, created_by)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [data.lead_id, data.car_id, data.sale_price, data.commission,
     data.payment_mode, data.status || 'negotiation', data.created_by]
  );

  // Log activity
  await pool.query(
    `INSERT INTO activities (lead_id, type, description, performed_by) VALUES ($1, 'negotiation', 'Deal created', $2)`,
    [data.lead_id, data.created_by]
  );

  return result.rows[0];
}

async function update(id, data) {
  const allowed = ['sale_price', 'commission', 'payment_mode', 'status', 'closed_date'];
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
    `UPDATE deals SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`,
    values
  );

  const deal = result.rows[0];

  // Auto-mark car as sold and lead as closed_won when deal is completed
  if (data.status === 'completed') {
    await pool.query(`UPDATE cars SET status = 'sold', updated_at = NOW() WHERE id = $1`, [deal.car_id]);
    await pool.query(`UPDATE leads SET status = 'closed_won', updated_at = NOW() WHERE id = $1`, [deal.lead_id]);
    await pool.query(
      `UPDATE deals SET closed_date = NOW() WHERE id = $1`, [id]
    );
    await pool.query(
      `INSERT INTO activities (lead_id, type, description, performed_by) VALUES ($1, 'deal_closed', 'Deal completed', $2)`,
      [deal.lead_id, data.updated_by || null]
    );
  }

  if (data.status === 'cancelled') {
    await pool.query(`UPDATE cars SET status = 'available', updated_at = NOW() WHERE id = $1`, [deal.car_id]);
    await pool.query(`UPDATE leads SET status = 'closed_lost', updated_at = NOW() WHERE id = $1`, [deal.lead_id]);
  }

  return deal;
}

module.exports = { getAll, getById, create, update };
