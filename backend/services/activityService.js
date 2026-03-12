const pool = require('../config/db');

async function getByLeadId(leadId) {
  const result = await pool.query(
    `SELECT a.*, u.name AS performed_by_name
     FROM activities a
     LEFT JOIN users u ON a.performed_by = u.id
     WHERE a.lead_id = $1
     ORDER BY a.created_at DESC`,
    [leadId]
  );
  return result.rows;
}

async function create(data) {
  const result = await pool.query(
    `INSERT INTO activities (lead_id, type, description, performed_by)
     VALUES ($1,$2,$3,$4) RETURNING *`,
    [data.lead_id, data.type, data.description, data.performed_by]
  );
  return result.rows[0];
}

module.exports = { getByLeadId, create };
