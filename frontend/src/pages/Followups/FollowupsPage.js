import React, { useState } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { getFollowups, createFollowup, updateFollowup, getLeads } from '../../services/api';
import Modal from '../../components/common/Modal';

export default function FollowupsPage() {
  const [showToday, setShowToday] = useState(true);
  const { data: followups, loading, refetch } = useFetch(() => getFollowups({ today: showToday || undefined }), [showToday]);
  const { data: leads } = useFetch(() => getLeads());
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ lead_id: '', notes: '', next_followup_date: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createFollowup(form);
      setModal(false);
      setForm({ lead_id: '', notes: '', next_followup_date: '' });
      refetch();
    } catch (err) {
      alert(err.response?.data?.error || 'Error creating follow-up');
    }
  };

  const markDone = async (id) => {
    await updateFollowup(id, { completed: true });
    refetch();
  };

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });
  const inputCls = "w-full bg-[#333] border border-[#444] rounded px-3 py-2 text-sm text-white placeholder-[#808080] focus:ring-2 focus:ring-[#E50914] focus:border-[#E50914] outline-none";

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h2 className="text-2xl font-bold text-white">Follow-ups</h2>
        <div className="flex gap-2">
          <button onClick={() => setShowToday(!showToday)}
            className={`px-3 py-2 rounded text-sm font-medium transition ${showToday ? 'bg-[#E50914]/20 text-[#E50914] border border-[#E50914]/50' : 'bg-[#333] text-[#aaa] border border-[#444]'}`}>
            {showToday ? "Today's" : "All"}
          </button>
          <button onClick={() => setModal(true)}
            className="bg-[#E50914] text-white px-4 py-2 rounded text-sm font-medium hover:bg-[#B20710] transition">
            + Add Follow-up
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10 text-[#808080]">Loading...</div>
      ) : (
        <div className="space-y-3">
          {followups?.map((f) => (
            <div key={f.id} className={`bg-[#1f1f1f] rounded-lg border p-4 flex flex-col sm:flex-row sm:items-center gap-3 transition
              ${f.completed ? 'border-[#333] opacity-50' : 'border-[#333] hover:bg-[#2a2a2a]'}`}>
              <div className="flex-1">
                <p className="font-medium text-white">{f.lead_name} <span className="text-[#666]">({f.lead_phone})</span></p>
                <p className="text-sm text-[#aaa] mt-1">{f.notes || 'No notes'}</p>
                <p className="text-xs text-[#666] mt-1">
                  Due: {f.next_followup_date ? new Date(f.next_followup_date).toLocaleDateString() : 'Not set'}
                  {f.executive_name && ` | ${f.executive_name}`}
                </p>
              </div>
              {!f.completed && (
                <button onClick={() => markDone(f.id)}
                  className="text-sm bg-green-900/50 text-green-400 px-3 py-1.5 rounded hover:bg-green-900 transition whitespace-nowrap border border-green-700">
                  Mark Done
                </button>
              )}
              {f.completed && <span className="text-xs text-green-500 font-medium">Completed</span>}
            </div>
          ))}
          {followups?.length === 0 && (
            <p className="text-[#808080] text-center py-10">
              {showToday ? "No follow-ups for today" : "No follow-ups found"}
            </p>
          )}
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title="New Follow-up">
        <form onSubmit={handleSubmit} className="space-y-3">
          <select value={form.lead_id} onChange={set('lead_id')} className={inputCls} required>
            <option value="">Select Lead *</option>
            {leads?.map(l => <option key={l.id} value={l.id}>{l.name} ({l.phone})</option>)}
          </select>
          <textarea value={form.notes} onChange={set('notes')} placeholder="Notes..." className={inputCls} rows={3} />
          <input type="date" value={form.next_followup_date} onChange={set('next_followup_date')} className={inputCls} required />
          <button type="submit" className="w-full bg-[#E50914] text-white py-2 rounded font-medium hover:bg-[#B20710] transition">
            Create Follow-up
          </button>
        </form>
      </Modal>
    </div>
  );
}
