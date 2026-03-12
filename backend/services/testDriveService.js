const pool = require('../config/db');

async function getAll(filters = {}) {
  let query = `SELECT td.*, l.name AS lead_name, l.phone AS lead_phone,
    c.brand AS car_brand, c.model AS car_model, u.name AS executive_name
    FROM test_drives td
    JOIN leads l ON td.lead_id = l.id
    JOIN cars c ON td.car_id = c.id
    LEFT JOIN users u ON td.sales_executive_id = u.id
    WHERE 1=1`;
  const values = [];
  let idx = 1;

  if (filters.date_from) {
    query += ` AND td.scheduled_date >= $${idx++}`;
    values.push(filters.date_from);
  }
  if (filters.date_to) {
    query += ` AND td.scheduled_date <= $${idx++}`;
    values.push(filters.date_to);
  }
  if (filters.sales_executive_id) {
    query += ` AND td.sales_executive_id = $${idx++}`;
    values.push(filters.sales_executive_id);
  }

  query += ' ORDER BY td.scheduled_date DESC';
  const result = await pool.query(query, values);
  return result.rows;
}

async function getById(id) {
  const result = await pool.query(
    `SELECT td.*, l.name AS lead_name, c.brand AS car_brand, c.model AS car_model, u.name AS executive_name
     FROM test_drives td
     JOIN leads l ON td.lead_id = l.id
     JOIN cars c ON td.car_id = c.id
     LEFT JOIN users u ON td.sales_executive_id = u.id
     WHERE td.id = $1`, [id]
  );
  return result.rows[0] || null;
}

async function create(data) {
  const result = await pool.query(
    `INSERT INTO test_drives (lead_id, car_id, scheduled_date, location, sales_executive_id, customer_feedback, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [data.lead_id, data.car_id, data.scheduled_date, data.location,
     data.sales_executive_id, data.customer_feedback, data.status || 'scheduled']
  );

  // Update lead status
  await pool.query(`UPDATE leads SET status = 'test_drive_scheduled', updated_at = NOW() WHERE id = $1`, [data.lead_id]);

  // Log activity
  await pool.query(
    `INSERT INTO activities (lead_id, type, description, performed_by) VALUES ($1, 'test_drive', $2, $3)`,
    [data.lead_id, `Test drive scheduled for ${data.scheduled_date}`, data.sales_executive_id]
  );

  return result.rows[0];
}

async function update(id, data) {
  const allowed = ['scheduled_date', 'location', 'sales_executive_id', 'customer_feedback', 'status'];
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
    `UPDATE test_drives SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`,
    values
  );
  return result.rows[0];
}

module.exports = { getAll, getById, create, update };
