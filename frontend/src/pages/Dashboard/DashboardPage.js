import React from 'react';
import { useFetch } from '../../hooks/useFetch';
import { getDashboardStats, getDashboardCharts } from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#E50914', '#ff4d4d', '#ff8080', '#b30000', '#ff6666', '#cc0000'];

const statCards = [
  { key: 'total_leads', label: 'Total Leads', color: 'border-blue-500' },
  { key: 'today_followups', label: "Today's Follow-ups", color: 'border-orange-500' },
  { key: 'cars_available', label: 'Cars Available', color: 'border-green-500' },
  { key: 'deals_closed_this_month', label: 'Deals This Month', color: 'border-purple-500' },
  { key: 'revenue_this_month', label: 'Revenue This Month', color: 'border-[#E50914]', isCurrency: true },
];

export default function DashboardPage() {
  const { data: stats, loading: statsLoading } = useFetch(getDashboardStats);
  const { data: charts, loading: chartsLoading } = useFetch(getDashboardCharts);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val || 0);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Dashboard</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {statCards.map((card) => (
          <div key={card.key} className={`bg-[#1f1f1f] rounded-lg p-5 border-l-4 ${card.color} hover:bg-[#2a2a2a] transition-colors`}>
            <p className="text-sm text-[#808080] mb-1">{card.label}</p>
            <p className="text-2xl font-bold text-white">
              {statsLoading ? '...' : card.isCurrency ? formatCurrency(stats?.[card.key]) : (stats?.[card.key] ?? 0)}
            </p>
          </div>
        ))}
      </div>

      {!chartsLoading && charts && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#1f1f1f] rounded-lg p-5 border border-[#333]">
            <h3 className="text-lg font-semibold text-white mb-4">Lead Sources</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={charts.lead_sources?.map(s => ({ name: s.source?.replace('_', ' ') || 'Unknown', value: parseInt(s.count) }))}
                  cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {charts.lead_sources?.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1f1f1f', border: '1px solid #333', color: '#e5e5e5' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-[#1f1f1f] rounded-lg p-5 border border-[#333]">
            <h3 className="text-lg font-semibold text-white mb-4">Monthly Sales</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={charts.monthly_sales?.reverse()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="month" stroke="#808080" />
                <YAxis stroke="#808080" />
                <Tooltip contentStyle={{ backgroundColor: '#1f1f1f', border: '1px solid #333', color: '#e5e5e5' }} formatter={(val) => formatCurrency(val)} />
                <Bar dataKey="revenue" fill="#E50914" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-[#1f1f1f] rounded-lg p-5 border border-[#333] lg:col-span-2">
            <h3 className="text-lg font-semibold text-white mb-4">Top Selling Models</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={charts.top_models} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis type="number" stroke="#808080" />
                <YAxis dataKey="model" type="category" width={100} tick={{ fontSize: 12, fill: '#aaa' }} />
                <Tooltip contentStyle={{ backgroundColor: '#1f1f1f', border: '1px solid #333', color: '#e5e5e5' }} />
                <Bar dataKey="sold" fill="#E50914" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
