const dashboardService = require('../services/dashboardService');

async function getStats(req, res) {
  try {
    const stats = await dashboardService.getStats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getCharts(req, res) {
  try {
    const [leadSources, monthlySales, topModels] = await Promise.all([
      dashboardService.getLeadSourceDistribution(),
      dashboardService.getMonthlySales(),
      dashboardService.getTopSellingModels(),
    ]);
    res.json({ lead_sources: leadSources, monthly_sales: monthlySales, top_models: topModels });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { getStats, getCharts };
