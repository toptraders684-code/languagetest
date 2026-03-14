import React from 'react';

const colorMap = {
  available: 'bg-green-900/50 text-green-400 border-green-700',
  reserved: 'bg-yellow-900/50 text-yellow-400 border-yellow-700',
  sold: 'bg-red-900/50 text-red-400 border-red-700',
  new: 'bg-blue-900/50 text-blue-400 border-blue-700',
  contacted: 'bg-purple-900/50 text-purple-400 border-purple-700',
  interested: 'bg-indigo-900/50 text-indigo-400 border-indigo-700',
  test_drive_scheduled: 'bg-cyan-900/50 text-cyan-400 border-cyan-700',
  negotiation: 'bg-orange-900/50 text-orange-400 border-orange-700',
  closed_won: 'bg-green-900/50 text-green-400 border-green-700',
  closed_lost: 'bg-red-900/50 text-red-400 border-red-700',
  scheduled: 'bg-blue-900/50 text-blue-400 border-blue-700',
  completed: 'bg-green-900/50 text-green-400 border-green-700',
  cancelled: 'bg-red-900/50 text-red-400 border-red-700',
  confirmed: 'bg-emerald-900/50 text-emerald-400 border-emerald-700',
  active: 'bg-green-900/50 text-green-400 border-green-700',
  inactive: 'bg-gray-800/50 text-gray-400 border-gray-600',
};

export default function StatusBadge({ status }) {
  const colors = colorMap[status] || 'bg-gray-800/50 text-gray-400 border-gray-600';
  const label = status?.replace(/_/g, ' ');

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize border ${colors}`}>
      {label}
    </span>
  );
}
