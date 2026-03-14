import React from 'react';
import { useFetch } from '../../hooks/useFetch';
import { getDashboardStats, getDashboardCharts } from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const COLORS = ['#E50914', '#ff4d4d', '#ff8080', '#b30000', '#ff6666', '#cc0000', '#990000'];

export default function ReportsPage() {
  const { data: stats } = useFetch(getDashboardStats);
  const { data: charts } = useFetch(getDashboardCharts);

  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val || 0);

  const monthlySalesData = charts?.monthly_sales?.slice().reverse() || [];
  const tooltipStyle = { backgroundColor: '#1f1f1f', border: '1px solid #333', color: '#e5e5e5' };

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Reports</h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-[#1f1f1f] rounded-lg p-5 border-l-4 border-[#E50914]">
          <p className="text-sm text-[#808080]">Total Revenue (This Month)</p>
          <p className="text-3xl font-bold text-[#E50914] mt-1">{formatCurrency(stats?.revenue_this_month)}</p>
        </div>
        <div className="bg-[#1f1f1f] rounded-lg p-5 border-l-4 border-green-500">
          <p className="text-sm text-[#808080]">Deals Closed (This Month)</p>
          <p className="text-3xl font-bold text-green-400 mt-1">{stats?.deals_closed_this_month ?? 0}</p>
        </div>
        <div className="bg-[#1f1f1f] rounded-lg p-5 border-l-4 border-purple-500">
          <p className="text-sm text-[#808080]">Total Leads</p>
          <p className="text-3xl font-bold text-purple-400 mt-1">{stats?.total_leads ?? 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-[#1f1f1f] rounded-lg p-5 border border-[#333]">
          <h3 className="text-lg font-semibold text-white mb-4">Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlySalesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="month" stroke="#808080" />
              <YAxis stroke="#808080" />
              <Tooltip contentStyle={tooltipStyle} formatter={(val) => formatCurrency(val)} />
              <Line type="monotone" dataKey="revenue" stroke="#E50914" strokeWidth={2} dot={{ r: 4, fill: '#E50914' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-[#1f1f1f] rounded-lg p-5 border border-[#333]">
          <h3 className="text-lg font-semibold text-white mb-4">Deals per Month</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlySalesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="month" stroke="#808080" />
              <YAxis stroke="#808080" />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="deals" fill="#E50914" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-[#1f1f1f] rounded-lg p-5 border border-[#333]">
          <h3 className="text-lg font-semibold text-white mb-4">Lead Sources</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={charts?.lead_sources?.map(s => ({ name: s.source?.replace('_', ' ') || 'Unknown', value: parseInt(s.count) }))}
                cx="50%" cy="50%" outerRadius={100} dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {charts?.lead_sources?.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-[#1f1f1f] rounded-lg p-5 border border-[#333]">
          <h3 className="text-lg font-semibold text-white mb-4">Top Selling Models</h3>
          {charts?.top_models?.length > 0 ? (
            <div className="space-y-3">
              {charts.top_models.map((m, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-sm font-medium text-[#808080] w-6">{i + 1}.</span>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-white">{m.brand} {m.model}</span>
                      <span className="text-[#808080]">{m.sold} sold</span>
                    </div>
                    <div className="w-full bg-[#333] rounded-full h-2 mt-1">
                      <div className="bg-[#E50914] h-2 rounded-full"
                        style={{ width: `${(m.sold / (charts.top_models[0]?.sold || 1)) * 100}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[#808080] text-sm text-center py-10">No sales data yet</p>
          )}
        </div>
      </div>

      <div className="bg-gradient-to-r from-[#1a0000] to-[#0a0a0a] rounded-lg p-6 border border-[#E50914]/30">
        <h3 className="text-lg font-semibold text-[#E50914] mb-2">AI-Powered Insights (Coming Soon)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-[#aaa]">
          <div className="bg-[#1f1f1f]/50 rounded-lg p-4 border border-[#333]">
            <p className="font-medium text-white">Lead Scoring</p>
            <p className="text-[#808080] mt-1">AI-powered lead quality scoring based on engagement patterns</p>
          </div>
          <div className="bg-[#1f1f1f]/50 rounded-lg p-4 border border-[#333]">
            <p className="font-medium text-white">Price Suggestion</p>
            <p className="text-[#808080] mt-1">Market-based pricing recommendations for car inventory</p>
          </div>
        </div>
      </div>
    </div>
  );
}
