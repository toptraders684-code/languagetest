const pool = require('../config/db');

async function getAll(filters = {}) {
  let query = `SELECT l.*, c.brand AS car_brand, c.model AS car_model, u.name AS assigned_name
    FROM leads l
    LEFT JOIN cars c ON l.interested_car_id = c.id
    LEFT JOIN users u ON l.assigned_to = u.id
    WHERE 1=1`;
  const values = [];
  let idx = 1;

  if (filters.status) {
    query += ` AND l.status = $${idx++}`;
    values.push(filters.status);
  }
  if (filters.assigned_to) {
    query += ` AND l.assigned_to = $${idx++}`;
    values.push(filters.assigned_to);
  }
  if (filters.search) {
    query += ` AND (l.name ILIKE $${idx} OR l.phone ILIKE $${idx})`;
    values.push(`%${filters.search}%`);
    idx++;
  }

  query += ' ORDER BY l.created_at DESC';
  const result = await pool.query(query, values);
  return result.rows;
}

async function getById(id) {
  const result = await pool.query(
    `SELECT l.*, c.brand AS car_brand, c.model AS car_model, u.name AS assigned_name
     FROM leads l
     LEFT JOIN cars c ON l.interested_car_id = c.id
     LEFT JOIN users u ON l.assigned_to = u.id
     WHERE l.id = $1`, [id]
  );
  return result.rows[0] || null;
}

async function create(data) {
  // Auto-assign to sales executive with fewest leads if not specified
  let assignedTo = data.assigned_to;
  if (!assignedTo) {
    const res = await pool.query(
      `SELECT u.id FROM users u
       LEFT JOIN leads l ON l.assigned_to = u.id AND l.status NOT IN ('closed_won', 'closed_lost')
       WHERE u.role = 'sales_executive' AND u.status = 'active'
       GROUP BY u.id
       ORDER BY COUNT(l.id) ASC
       LIMIT 1`
    );
    if (res.rows.length > 0) assignedTo = res.rows[0].id;
  }

  const result = await pool.query(
    `INSERT INTO leads (name, phone, email, city, budget, interested_car_id, source, status, assigned_to)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
    [data.name, data.phone, data.email, data.city, data.budget,
     data.interested_car_id, data.source, data.status || 'new', assignedTo]
  );

  const lead = result.rows[0];

  // Create activity entry
  await pool.query(
    `INSERT INTO activities (lead_id, type, description, performed_by) VALUES ($1, 'lead_created', 'Lead created', $2)`,
    [lead.id, assignedTo]
  );

  return lead;
}

async function update(id, data) {
  const allowed = ['name', 'phone', 'email', 'city', 'budget', 'interested_car_id',
    'source', 'status', 'assigned_to'];
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
    `UPDATE leads SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`,
    values
  );

  // Log status change
  if (data.status) {
    await pool.query(
      `INSERT INTO activities (lead_id, type, description, performed_by)
       VALUES ($1, 'status_change', $2, $3)`,
      [id, `Status changed to ${data.status}`, data.updated_by || null]
    );
  }

  return result.rows[0];
}

async function remove(id) {
  await pool.query('DELETE FROM leads WHERE id = $1', [id]);
}

module.exports = { getAll, getById, create, update, remove };
