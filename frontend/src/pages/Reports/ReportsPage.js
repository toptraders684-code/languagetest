import React from 'react';
import { useFetch } from '../../hooks/useFetch';
import { getDashboardStats, getDashboardCharts } from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#818cf8', '#4f46e5', '#3730a3'];

export default function ReportsPage() {
  const { data: stats } = useFetch(getDashboardStats);
  const { data: charts } = useFetch(getDashboardCharts);

  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val || 0);

  const monthlySalesData = charts?.monthly_sales?.slice().reverse() || [];

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Reports</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <p className="text-sm text-gray-500">Total Revenue (This Month)</p>
          <p className="text-3xl font-bold text-indigo-600 mt-1">{formatCurrency(stats?.revenue_this_month)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <p className="text-sm text-gray-500">Deals Closed (This Month)</p>
          <p className="text-3xl font-bold text-green-600 mt-1">{stats?.deals_closed_this_month ?? 0}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <p className="text-sm text-gray-500">Total Leads</p>
          <p className="text-3xl font-bold text-purple-600 mt-1">{stats?.total_leads ?? 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Trend */}
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlySalesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(val) => formatCurrency(val)} />
              <Line type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Deals per Month */}
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Deals per Month</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlySalesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="deals" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Lead Source Distribution */}
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Lead Sources</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={charts?.lead_sources?.map(s => ({ name: s.source?.replace('_', ' ') || 'Unknown', value: parseInt(s.count) }))}
                cx="50%" cy="50%" outerRadius={100} dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {charts?.lead_sources?.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Top Selling Models */}
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Selling Models</h3>
          {charts?.top_models?.length > 0 ? (
            <div className="space-y-3">
              {charts.top_models.map((m, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-500 w-6">{i + 1}.</span>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{m.brand} {m.model}</span>
                      <span className="text-gray-500">{m.sold} sold</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 mt-1">
                      <div className="bg-indigo-500 h-2 rounded-full"
                        style={{ width: `${(m.sold / (charts.top_models[0]?.sold || 1)) * 100}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm text-center py-10">No sales data yet</p>
          )}
        </div>
      </div>

      {/* AI Features Placeholder */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
        <h3 className="text-lg font-semibold text-indigo-900 mb-2">AI-Powered Insights (Coming Soon)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-indigo-700">
          <div className="bg-white/50 rounded-lg p-4">
            <p className="font-medium">Lead Scoring</p>
            <p className="text-indigo-500 mt-1">AI-powered lead quality scoring based on engagement patterns</p>
          </div>
          <div className="bg-white/50 rounded-lg p-4">
            <p className="font-medium">Price Suggestion</p>
            <p className="text-indigo-500 mt-1">Market-based pricing recommendations for car inventory</p>
          </div>
        </div>
      </div>
    </div>
  );
}
