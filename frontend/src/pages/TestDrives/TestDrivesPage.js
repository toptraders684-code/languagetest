import React, { useState } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { getTestDrives, createTestDrive, updateTestDrive, getLeads, getCars } from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';

export default function TestDrivesPage() {
  const { data: testDrives, loading, refetch } = useFetch(getTestDrives);
  const { data: leads } = useFetch(() => getLeads());
  const { data: cars } = useFetch(() => getCars({ status: 'available' }));
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ lead_id: '', car_id: '', scheduled_date: '', location: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createTestDrive(form);
      setModal(false);
      setForm({ lead_id: '', car_id: '', scheduled_date: '', location: '' });
      refetch();
    } catch (err) {
      alert(err.response?.data?.error || 'Error scheduling test drive');
    }
  };

  const handleStatus = async (id, status) => {
    await updateTestDrive(id, { status });
    refetch();
  };

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });
  const inputCls = "w-full bg-[#333] border border-[#444] rounded px-3 py-2 text-sm text-white placeholder-[#808080] focus:ring-2 focus:ring-[#E50914] focus:border-[#E50914] outline-none";

  const grouped = {};
  testDrives?.forEach((td) => {
    const date = new Date(td.scheduled_date).toLocaleDateString();
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(td);
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h2 className="text-2xl font-bold text-white">Test Drives</h2>
        <button onClick={() => setModal(true)}
          className="bg-[#E50914] text-white px-4 py-2 rounded text-sm font-medium hover:bg-[#B20710] transition">
          + Schedule Test Drive
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10 text-[#808080]">Loading...</div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([date, drives]) => (
            <div key={date}>
              <h3 className="text-sm font-semibold text-[#E50914] uppercase tracking-wide mb-3">{date}</h3>
              <div className="space-y-3">
                {drives.map((td) => (
                  <div key={td.id} className="bg-[#1f1f1f] rounded-lg border border-[#333] p-4 flex flex-col sm:flex-row sm:items-center gap-3 hover:bg-[#2a2a2a] transition">
                    <div className="flex-1">
                      <p className="font-medium text-white">{td.lead_name} - {td.car_brand} {td.car_model}</p>
                      <p className="text-sm text-[#808080]">
                        {new Date(td.scheduled_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {td.location && ` at ${td.location}`}
                        {td.executive_name && ` | ${td.executive_name}`}
                      </p>
                      {td.customer_feedback && <p className="text-sm text-[#aaa] mt-1">Feedback: {td.customer_feedback}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={td.status} />
                      {td.status === 'scheduled' && (
                        <>
                          <button onClick={() => handleStatus(td.id, 'completed')}
                            className="text-xs bg-green-900/50 text-green-400 px-2 py-1 rounded hover:bg-green-900 transition">Complete</button>
                          <button onClick={() => handleStatus(td.id, 'cancelled')}
                            className="text-xs bg-red-900/50 text-red-400 px-2 py-1 rounded hover:bg-red-900 transition">Cancel</button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {testDrives?.length === 0 && <p className="text-[#808080] text-center py-10">No test drives scheduled</p>}
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title="Schedule Test Drive">
        <form onSubmit={handleSubmit} className="space-y-3">
          <select value={form.lead_id} onChange={set('lead_id')} className={inputCls} required>
            <option value="">Select Lead *</option>
            {leads?.map(l => <option key={l.id} value={l.id}>{l.name} ({l.phone})</option>)}
          </select>
          <select value={form.car_id} onChange={set('car_id')} className={inputCls} required>
            <option value="">Select Car *</option>
            {cars?.map(c => <option key={c.id} value={c.id}>{c.brand} {c.model} ({c.year})</option>)}
          </select>
          <input type="datetime-local" value={form.scheduled_date} onChange={set('scheduled_date')} className={inputCls} required />
          <input value={form.location} onChange={set('location')} placeholder="Location" className={inputCls} />
          <button type="submit" className="w-full bg-[#E50914] text-white py-2 rounded font-medium hover:bg-[#B20710] transition">
            Schedule
          </button>
        </form>
      </Modal>
    </div>
  );
}
