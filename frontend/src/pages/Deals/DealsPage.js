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
  const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none";
  const formatCurrency = (v) => `$${parseFloat(v || 0).toLocaleString()}`;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Deals</h2>
        <button onClick={() => { setForm(emptyForm); setModal(true); }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
          + New Deal
        </button>
      </div>

      <div className="mb-4">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 text-sm">
          <option value="">All Status</option>
          <option value="negotiation">Negotiation</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-500">Loading...</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
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
            <tbody className="divide-y divide-gray-100">
              {deals?.map((deal) => (
                <tr key={deal.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">#{deal.id}</td>
                  <td className="px-4 py-3">{deal.lead_name}</td>
                  <td className="px-4 py-3 hidden md:table-cell">{deal.car_brand} {deal.car_model}</td>
                  <td className="px-4 py-3 font-semibold text-indigo-600">{formatCurrency(deal.sale_price)}</td>
                  <td className="px-4 py-3 capitalize hidden sm:table-cell">{deal.payment_mode?.replace('_', ' ')}</td>
                  <td className="px-4 py-3"><StatusBadge status={deal.status} /></td>
                  <td className="px-4 py-3">
                    <button onClick={() => showDetail(deal)} className="text-indigo-600 hover:underline text-xs">View</button>
                  </td>
                </tr>
              ))}
              {deals?.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-500">No deals found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail Modal */}
      <Modal open={!!detail} onClose={() => setDetail(null)} title={`Deal #${detail?.id}`}>
        {detail && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-gray-500">Lead:</span> <strong>{detail.lead_name}</strong></div>
              <div><span className="text-gray-500">Phone:</span> {detail.lead_phone}</div>
              <div><span className="text-gray-500">Car:</span> {detail.car_brand} {detail.car_model} ({detail.car_year})</div>
              <div><span className="text-gray-500">Reg #:</span> {detail.registration_number || '-'}</div>
              <div><span className="text-gray-500">Sale Price:</span> <strong className="text-indigo-600">{formatCurrency(detail.sale_price)}</strong></div>
              <div><span className="text-gray-500">Commission:</span> {formatCurrency(detail.commission)}</div>
              <div><span className="text-gray-500">Payment:</span> {detail.payment_mode?.replace('_', ' ')}</div>
              <div><span className="text-gray-500">Status:</span> <StatusBadge status={detail.status} /></div>
              {detail.closed_date && <div className="col-span-2"><span className="text-gray-500">Closed:</span> {new Date(detail.closed_date).toLocaleDateString()}</div>}
            </div>
            {detail.status === 'negotiation' && (
              <div className="flex gap-2 pt-3 border-t">
                <button onClick={() => handleStatus(detail.id, 'confirmed')}
                  className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-emerald-700">Confirm</button>
                <button onClick={() => handleStatus(detail.id, 'cancelled')}
                  className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-red-700">Cancel</button>
              </div>
            )}
            {detail.status === 'confirmed' && (
              <div className="flex gap-2 pt-3 border-t">
                <button onClick={() => handleStatus(detail.id, 'completed')}
                  className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-green-700">Mark Completed</button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* New Deal Modal */}
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
          <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700">
            Create Deal
          </button>
        </form>
      </Modal>
    </div>
  );
}
