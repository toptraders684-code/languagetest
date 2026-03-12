const pool = require('../config/db');

async function getStats() {
  const [leads, todayFollowups, availableCars, monthDeals, monthRevenue] = await Promise.all([
    pool.query('SELECT COUNT(*) AS count FROM leads'),
    pool.query(`SELECT COUNT(*) AS count FROM followups WHERE next_followup_date = CURRENT_DATE AND completed = false`),
    pool.query(`SELECT COUNT(*) AS count FROM cars WHERE status = 'available'`),
    pool.query(`SELECT COUNT(*) AS count FROM deals WHERE status = 'completed'
      AND EXTRACT(MONTH FROM closed_date) = EXTRACT(MONTH FROM NOW())
      AND EXTRACT(YEAR FROM closed_date) = EXTRACT(YEAR FROM NOW())`),
    pool.query(`SELECT COALESCE(SUM(sale_price), 0) AS total FROM deals WHERE status = 'completed'
      AND EXTRACT(MONTH FROM closed_date) = EXTRACT(MONTH FROM NOW())
      AND EXTRACT(YEAR FROM closed_date) = EXTRACT(YEAR FROM NOW())`),
  ]);

  return {
    total_leads: parseInt(leads.rows[0].count),
    today_followups: parseInt(todayFollowups.rows[0].count),
    cars_available: parseInt(availableCars.rows[0].count),
    deals_closed_this_month: parseInt(monthDeals.rows[0].count),
    revenue_this_month: parseFloat(monthRevenue.rows[0].total),
  };
}

async function getLeadSourceDistribution() {
  const result = await pool.query(
    `SELECT source, COUNT(*) AS count FROM leads GROUP BY source ORDER BY count DESC`
  );
  return result.rows;
}

async function getMonthlySales() {
  const result = await pool.query(
    `SELECT TO_CHAR(closed_date, 'YYYY-MM') AS month, COUNT(*) AS deals, COALESCE(SUM(sale_price), 0) AS revenue
     FROM deals WHERE status = 'completed' AND closed_date IS NOT NULL
     GROUP BY TO_CHAR(closed_date, 'YYYY-MM')
     ORDER BY month DESC LIMIT 12`
  );
  return result.rows;
}

async function getTopSellingModels() {
  const result = await pool.query(
    `SELECT c.brand, c.model, COUNT(*) AS sold
     FROM deals d JOIN cars c ON d.car_id = c.id
     WHERE d.status = 'completed'
     GROUP BY c.brand, c.model
     ORDER BY sold DESC LIMIT 10`
  );
  return result.rows;
}

module.exports = { getStats, getLeadSourceDistribution, getMonthlySales, getTopSellingModels };
