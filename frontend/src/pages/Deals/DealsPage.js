import React, { useState } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { getDeals, getDeal, createDeal, updateDeal, getLeads, getCars } from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';

const emptyForm = { lead_id: '', car_id: '', sale_price: '', commission: '', payment_mode: 'cash', status: 'negotiation' };
const paymentModes = ['cash', 'finance', 'bank_transfer', 'cheque'];

export default function DealsPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const { data: deals, loading, refetch } = useFetch(() => getDeals({ status: statusFilter || undefined }), [statusFilter]);
  const { data: leads } = useFetch(() => getLeads());
  const { data: cars } = useFetch(() => getCars());
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [detail, setDetail] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createDeal(form);
      setModal(false);
      setForm(emptyForm);
      refetch();
    } catch (err) {
      alert(err.response?.data?.error || 'Error creating deal');
    }
  };

  const handleStatus = async (id, status) => {
    await updateDeal(id, { status });
    refetch();
    setDetail(null);
  };

  const showDetail = async (deal) => {
    try {
      const res = await getDeal(deal.id);
      setDetail(res.data);
    } catch {
      setDetail(deal);
    }
  };

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });
  const inputCls = "w-full bg-[#333] border border-[#444] rounded px-3 py-2 text-sm text-white placeholder-[#808080] focus:ring-2 focus:ring-[#E50914] focus:border-[#E50914] outline-none";
  const formatCurrency = (v) => `$${parseFloat(v || 0).toLocaleString()}`;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h2 className="text-2xl font-bold text-white">Deals</h2>
        <button onClick={() => { setForm(emptyForm); setModal(true); }}
          className="bg-[#E50914] text-white px-4 py-2 rounded text-sm font-medium hover:bg-[#B20710] transition">
          + New Deal
        </button>
      </div>

      <div className="mb-4">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-[#333] border border-[#444] rounded px-4 py-2 text-sm text-white">
          <option value="">All Status</option>
          <option value="negotiation">Negotiation</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-10 text-[#808080]">Loading...</div>
      ) : (
        <div className="bg-[#1f1f1f] rounded-lg border border-[#333] overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#181818] text-[#808080]">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Deal #</th>
                <th className="px-4 py-3 text-left font-medium">Lead</th>
                <th className="px-4 py-3 text-left font-medium hidden md:table-cell">Car</th>
                <th className="px-4 py-3 text-left font-medium">Sale Price</th>
                <th className="px-4 py-3 text-left font-medium hidden sm:table-cell">Payment</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#333]">
              {deals?.map((deal) => (
                <tr key={deal.id} className="hover:bg-[#2a2a2a] transition-colors">
                  <td className="px-4 py-3 font-medium text-white">#{deal.id}</td>
                  <td className="px-4 py-3 text-[#aaa]">{deal.lead_name}</td>
                  <td className="px-4 py-3 text-[#aaa] hidden md:table-cell">{deal.car_brand} {deal.car_model}</td>
                  <td className="px-4 py-3 font-semibold text-[#E50914]">{formatCurrency(deal.sale_price)}</td>
                  <td className="px-4 py-3 capitalize text-[#aaa] hidden sm:table-cell">{deal.payment_mode?.replace('_', ' ')}</td>
                  <td className="px-4 py-3"><StatusBadge status={deal.status} /></td>
                  <td className="px-4 py-3">
                    <button onClick={() => showDetail(deal)} className="text-[#E50914] hover:text-[#ff4d4d] text-xs">View</button>
                  </td>
                </tr>
              ))}
              {deals?.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-[#808080]">No deals found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={!!detail} onClose={() => setDetail(null)} title={`Deal #${detail?.id}`}>
        {detail && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-[#808080]">Lead:</span> <strong className="text-white">{detail.lead_name}</strong></div>
              <div><span className="text-[#808080]">Phone:</span> <span className="text-[#aaa]">{detail.lead_phone}</span></div>
              <div><span className="text-[#808080]">Car:</span> <span className="text-[#aaa]">{detail.car_brand} {detail.car_model} ({detail.car_year})</span></div>
              <div><span className="text-[#808080]">Reg #:</span> <span className="text-[#aaa]">{detail.registration_number || '-'}</span></div>
              <div><span className="text-[#808080]">Sale Price:</span> <strong className="text-[#E50914]">{formatCurrency(detail.sale_price)}</strong></div>
              <div><span className="text-[#808080]">Commission:</span> <span className="text-[#aaa]">{formatCurrency(detail.commission)}</span></div>
              <div><span className="text-[#808080]">Payment:</span> <span className="text-[#aaa]">{detail.payment_mode?.replace('_', ' ')}</span></div>
              <div><span className="text-[#808080]">Status:</span> <StatusBadge status={detail.status} /></div>
              {detail.closed_date && <div className="col-span-2"><span className="text-[#808080]">Closed:</span> <span className="text-[#aaa]">{new Date(detail.closed_date).toLocaleDateString()}</span></div>}
            </div>
            {detail.status === 'negotiation' && (
              <div className="flex gap-2 pt-3 border-t border-[#333]">
                <button onClick={() => handleStatus(detail.id, 'confirmed')}
                  className="bg-emerald-700 text-white px-3 py-1.5 rounded text-sm hover:bg-emerald-600 transition">Confirm</button>
                <button onClick={() => handleStatus(detail.id, 'cancelled')}
                  className="bg-red-800 text-white px-3 py-1.5 rounded text-sm hover:bg-red-700 transition">Cancel</button>
              </div>
            )}
            {detail.status === 'confirmed' && (
              <div className="flex gap-2 pt-3 border-t border-[#333]">
                <button onClick={() => handleStatus(detail.id, 'completed')}
                  className="bg-green-700 text-white px-3 py-1.5 rounded text-sm hover:bg-green-600 transition">Mark Completed</button>
              </div>
            )}
          </div>
        )}
      </Modal>

      <Modal open={modal} onClose={() => setModal(false)} title="New Deal">
        <form onSubmit={handleSubmit} className="space-y-3">
          <select value={form.lead_id} onChange={set('lead_id')} className={inputCls} required>
            <option value="">Select Lead *</option>
            {leads?.map(l => <option key={l.id} value={l.id}>{l.name} ({l.phone})</option>)}
          </select>
          <select value={form.car_id} onChange={set('car_id')} className={inputCls} required>
            <option value="">Select Car *</option>
            {cars?.map(c => <option key={c.id} value={c.id}>{c.brand} {c.model} ({c.year}) - {c.status}</option>)}
          </select>
          <div className="grid grid-cols-2 gap-3">
            <input type="number" value={form.sale_price} onChange={set('sale_price')} placeholder="Sale Price *" className={inputCls} required />
            <input type="number" value={form.commission} onChange={set('commission')} placeholder="Commission" className={inputCls} />
          </div>
          <select value={form.payment_mode} onChange={set('payment_mode')} className={inputCls}>
            {paymentModes.map(p => <option key={p} value={p}>{p.replace('_', ' ')}</option>)}
          </select>
          <button type="submit" className="w-full bg-[#E50914] text-white py-2 rounded font-medium hover:bg-[#B20710] transition">
            Create Deal
          </button>
        </form>
      </Modal>
    </div>
  );
}
