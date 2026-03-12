import React, { useState } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { getLeads, createLead, updateLead, deleteLead, getLeadTimeline, getCars } from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';

const emptyForm = {
  name: '', phone: '', email: '', city: '', budget: '',
  interested_car_id: '', source: 'walk_in', status: 'new',
};

const statusOptions = ['new', 'contacted', 'interested', 'test_drive_scheduled', 'negotiation', 'closed_won', 'closed_lost'];
const sourceOptions = [
  { value: 'walk_in', label: 'Walk-in' },
  { value: 'website', label: 'Website' },
  { value: 'referral', label: 'Referral' },
  { value: 'marketplace', label: 'Marketplace' },
];

export default function LeadsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const { data: leads, loading, refetch } = useFetch(() => getLeads({ search, status: statusFilter || undefined }), [search, statusFilter]);
  const { data: cars } = useFetch(() => getCars({ status: 'available' }));
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [timeline, setTimeline] = useState(null);
  const [activities, setActivities] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = { ...form, budget: form.budget || null, interested_car_id: form.interested_car_id || null };
      if (editing) {
        await updateLead(editing, data);
      } else {
        await createLead(data);
      }
      setModal(false);
      setForm(emptyForm);
      setEditing(null);
      refetch();
    } catch (err) {
      alert(err.response?.data?.error || 'Error saving lead');
    }
  };

  const openEdit = (lead) => {
    setForm({
      name: lead.name, phone: lead.phone, email: lead.email || '', city: lead.city || '',
      budget: lead.budget || '', interested_car_id: lead.interested_car_id || '',
      source: lead.source || 'walk_in', status: lead.status,
    });
    setEditing(lead.id);
    setModal(true);
  };

  const showTimeline = async (lead) => {
    setTimeline(lead);
    try {
      const res = await getLeadTimeline(lead.id);
      setActivities(res.data);
    } catch {
      setActivities([]);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this lead?')) return;
    await deleteLead(id);
    refetch();
  };

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });
  const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none";

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Leads</h2>
        <button onClick={() => { setForm(emptyForm); setEditing(null); setModal(true); }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
          + Add Lead
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name/phone..."
          className="border border-gray-300 rounded-lg px-4 py-2 text-sm flex-1 focus:ring-2 focus:ring-indigo-500 outline-none" />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 text-sm">
          <option value="">All Status</option>
          {statusOptions.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-500">Loading...</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Name</th>
                <th className="px-4 py-3 text-left font-medium hidden sm:table-cell">Phone</th>
                <th className="px-4 py-3 text-left font-medium hidden md:table-cell">Interested Car</th>
                <th className="px-4 py-3 text-left font-medium hidden md:table-cell">Source</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium hidden lg:table-cell">Assigned To</th>
                <th className="px-4 py-3 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {leads?.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{lead.name}</td>
                  <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">{lead.phone}</td>
                  <td className="px-4 py-3 text-gray-600 hidden md:table-cell">
                    {lead.car_brand ? `${lead.car_brand} ${lead.car_model}` : '-'}
                  </td>
                  <td className="px-4 py-3 text-gray-600 hidden md:table-cell capitalize">{lead.source?.replace('_', ' ')}</td>
                  <td className="px-4 py-3"><StatusBadge status={lead.status} /></td>
                  <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">{lead.assigned_name || '-'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => showTimeline(lead)} className="text-indigo-600 hover:underline text-xs">View</button>
                      <button onClick={() => openEdit(lead)} className="text-indigo-600 hover:underline text-xs">Edit</button>
                      <button onClick={() => handleDelete(lead.id)} className="text-red-600 hover:underline text-xs">Del</button>
                    </div>
                  </td>
                </tr>
              ))}
              {leads?.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-500">No leads found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Timeline Modal */}
      <Modal open={!!timeline} onClose={() => setTimeline(null)} title={`${timeline?.name} - Timeline`}>
        {timeline && (
          <div>
            <div className="grid grid-cols-2 gap-2 text-sm mb-4 pb-4 border-b">
              <div><span className="text-gray-500">Phone:</span> {timeline.phone}</div>
              <div><span className="text-gray-500">Email:</span> {timeline.email || '-'}</div>
              <div><span className="text-gray-500">City:</span> {timeline.city || '-'}</div>
              <div><span className="text-gray-500">Budget:</span> ${parseFloat(timeline.budget || 0).toLocaleString()}</div>
            </div>
            <h4 className="font-semibold text-gray-700 mb-3">Activity Timeline</h4>
            {activities.length === 0 ? (
              <p className="text-gray-500 text-sm">No activities yet</p>
            ) : (
              <div className="space-y-3">
                {activities.map((a) => (
                  <div key={a.id} className="flex gap-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
                    <div>
                      <p className="text-gray-800">{a.description}</p>
                      <p className="text-gray-400 text-xs">
                        {new Date(a.created_at).toLocaleString()}
                        {a.performed_by_name && ` by ${a.performed_by_name}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Add/Edit Modal */}
      <Modal open={modal} onClose={() => { setModal(false); setEditing(null); }} title={editing ? 'Edit Lead' : 'Add Lead'}>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input value={form.name} onChange={set('name')} placeholder="Name *" className={inputCls} required />
          <input value={form.phone} onChange={set('phone')} placeholder="Phone *" className={inputCls} required />
          <input type="email" value={form.email} onChange={set('email')} placeholder="Email" className={inputCls} />
          <div className="grid grid-cols-2 gap-3">
            <input value={form.city} onChange={set('city')} placeholder="City" className={inputCls} />
            <input type="number" value={form.budget} onChange={set('budget')} placeholder="Budget" className={inputCls} />
          </div>
          <select value={form.interested_car_id} onChange={set('interested_car_id')} className={inputCls}>
            <option value="">Select interested car</option>
            {cars?.map(c => <option key={c.id} value={c.id}>{c.brand} {c.model} ({c.year})</option>)}
          </select>
          <div className="grid grid-cols-2 gap-3">
            <select value={form.source} onChange={set('source')} className={inputCls}>
              {sourceOptions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            <select value={form.status} onChange={set('status')} className={inputCls}>
              {statusOptions.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
            </select>
          </div>
          <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700">
            {editing ? 'Update Lead' : 'Add Lead'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
