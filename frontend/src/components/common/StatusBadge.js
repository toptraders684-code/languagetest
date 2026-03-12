import React from 'react';

const colorMap = {
  available: 'bg-green-100 text-green-800',
  reserved: 'bg-yellow-100 text-yellow-800',
  sold: 'bg-red-100 text-red-800',
  new: 'bg-blue-100 text-blue-800',
  contacted: 'bg-purple-100 text-purple-800',
  interested: 'bg-indigo-100 text-indigo-800',
  test_drive_scheduled: 'bg-cyan-100 text-cyan-800',
  negotiation: 'bg-orange-100 text-orange-800',
  closed_won: 'bg-green-100 text-green-800',
  closed_lost: 'bg-red-100 text-red-800',
  scheduled: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  confirmed: 'bg-emerald-100 text-emerald-800',
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
};

export default function StatusBadge({ status }) {
  const colors = colorMap[status] || 'bg-gray-100 text-gray-800';
  const label = status?.replace(/_/g, ' ');

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${colors}`}>
      {label}
    </span>
  );
}
