const pool = require('../config/db');

async function getAll(filters = {}) {
  let query = `SELECT f.*, l.name AS lead_name, l.phone AS lead_phone, u.name AS executive_name
    FROM followups f
    JOIN leads l ON f.lead_id = l.id
    LEFT JOIN users u ON f.sales_executive_id = u.id
    WHERE 1=1`;
  const values = [];
  let idx = 1;

  if (filters.sales_executive_id) {
    query += ` AND f.sales_executive_id = $${idx++}`;
    values.push(filters.sales_executive_id);
  }
  if (filters.today) {
    query += ` AND f.next_followup_date = CURRENT_DATE AND f.completed = false`;
  }
  if (filters.completed !== undefined) {
    query += ` AND f.completed = $${idx++}`;
    values.push(filters.completed);
  }

  query += ' ORDER BY f.next_followup_date ASC';
  const result = await pool.query(query, values);
  return result.rows;
}

async function create(data) {
  const result = await pool.query(
    `INSERT INTO followups (lead_id, notes, next_followup_date, sales_executive_id)
     VALUES ($1,$2,$3,$4) RETURNING *`,
    [data.lead_id, data.notes, data.next_followup_date, data.sales_executive_id]
  );

  await pool.query(
    `INSERT INTO activities (lead_id, type, description, performed_by)
     VALUES ($1, 'followup', $2, $3)`,
    [data.lead_id, `Follow-up scheduled for ${data.next_followup_date}`, data.sales_executive_id]
  );

  return result.rows[0];
}

async function update(id, data) {
  const allowed = ['notes', 'next_followup_date', 'completed'];
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

  if (sets.length === 0) return null;

  sets.push('updated_at = NOW()');
  values.push(id);

  const result = await pool.query(
    `UPDATE followups SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`,
    values
  );
  return result.rows[0];
}

module.exports = { getAll, create, update };
