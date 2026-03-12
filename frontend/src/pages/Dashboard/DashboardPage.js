import React from 'react';
import { useFetch } from '../../hooks/useFetch';
import { getDashboardStats, getDashboardCharts } from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#818cf8', '#4f46e5'];

const statCards = [
  { key: 'total_leads', label: 'Total Leads', color: 'bg-blue-500' },
  { key: 'today_followups', label: "Today's Follow-ups", color: 'bg-orange-500' },
  { key: 'cars_available', label: 'Cars Available', color: 'bg-green-500' },
  { key: 'deals_closed_this_month', label: 'Deals This Month', color: 'bg-purple-500' },
  { key: 'revenue_this_month', label: 'Revenue This Month', color: 'bg-indigo-500', isCurrency: true },
];

export default function DashboardPage() {
  const { data: stats, loading: statsLoading } = useFetch(getDashboardStats);
  const { data: charts, loading: chartsLoading } = useFetch(getDashboardCharts);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val || 0);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {statCards.map((card) => (
          <div key={card.key} className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">{card.label}</p>
            <p className="text-2xl font-bold text-gray-800">
              {statsLoading ? '...' : card.isCurrency ? formatCurrency(stats?.[card.key]) : (stats?.[card.key] ?? 0)}
            </p>
            <div className={`h-1 w-12 ${card.color} rounded mt-3`} />
          </div>
        ))}
      </div>

      {/* Charts */}
      {!chartsLoading && charts && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Lead Sources */}
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Lead Sources</h3>
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
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Monthly Sales */}
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Monthly Sales</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={charts.monthly_sales?.reverse()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(val) => formatCurrency(val)} />
                <Bar dataKey="revenue" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Top Selling Models */}
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 lg:col-span-2">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Selling Models</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={charts.top_models} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="model" type="category" width={100} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="sold" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
