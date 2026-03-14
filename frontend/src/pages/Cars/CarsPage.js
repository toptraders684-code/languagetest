import React, { useState } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { getCars, createCar, updateCar, deleteCar } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';

const emptyForm = {
  brand: '', model: '', variant: '', year: new Date().getFullYear(), mileage: '',
  fuel_type: 'Petrol', transmission: 'Manual', color: '', registration_number: '',
  price_expected: '', purchase_price: '', condition_notes: '', status: 'available',
};

export default function CarsPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const { data: cars, loading, refetch } = useFetch(() => getCars({ search, status: statusFilter || undefined }), [search, statusFilter]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [detail, setDetail] = useState(null);

  const canManage = ['admin', 'manager'].includes(user?.role);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await updateCar(editing, form);
      } else {
        await createCar(form);
      }
      setModal(false);
      setForm(emptyForm);
      setEditing(null);
      refetch();
    } catch (err) {
      alert(err.response?.data?.error || 'Error saving car');
    }
  };

  const openEdit = (car) => {
    setForm({
      brand: car.brand, model: car.model, variant: car.variant || '', year: car.year,
      mileage: car.mileage || '', fuel_type: car.fuel_type || 'Petrol',
      transmission: car.transmission || 'Manual', color: car.color || '',
      registration_number: car.registration_number || '', price_expected: car.price_expected || '',
      purchase_price: car.purchase_price || '', condition_notes: car.condition_notes || '',
      status: car.status,
    });
    setEditing(car.id);
    setModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this car?')) return;
    await deleteCar(id);
    refetch();
  };

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });
  const inputCls = "w-full bg-[#333] border border-[#444] rounded px-3 py-2 text-sm text-white placeholder-[#808080] focus:ring-2 focus:ring-[#E50914] focus:border-[#E50914] outline-none";

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h2 className="text-2xl font-bold text-white">Car Inventory</h2>
        {canManage && (
          <button onClick={() => { setForm(emptyForm); setEditing(null); setModal(true); }}
            className="bg-[#E50914] text-white px-4 py-2 rounded text-sm font-medium hover:bg-[#B20710] transition">
            + Add Car
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search brand/model..."
          className="bg-[#333] border border-[#444] rounded px-4 py-2 text-sm text-white placeholder-[#808080] flex-1 focus:ring-2 focus:ring-[#E50914] outline-none" />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-[#333] border border-[#444] rounded px-4 py-2 text-sm text-white">
          <option value="">All Status</option>
          <option value="available">Available</option>
          <option value="reserved">Reserved</option>
          <option value="sold">Sold</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-10 text-[#808080]">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {cars?.map((car) => (
            <div key={car.id} className="bg-[#1f1f1f] rounded-lg border border-[#333] p-5 hover:bg-[#2a2a2a] hover:border-[#555] transition-all duration-200 cursor-pointer"
              onClick={() => setDetail(car)}>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-white">{car.brand} {car.model}</h3>
                  <p className="text-sm text-[#808080]">{car.variant} - {car.year}</p>
                </div>
                <StatusBadge status={car.status} />
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm text-[#aaa]">
                <span>{car.fuel_type} / {car.transmission}</span>
                <span>{car.mileage ? `${car.mileage.toLocaleString()} km` : '-'}</span>
                <span className="text-[#E50914] font-semibold">
                  ${parseFloat(car.price_expected || 0).toLocaleString()}
                </span>
                <span className="text-[#666]">{car.registration_number || '-'}</span>
              </div>
              {canManage && (
                <div className="flex gap-2 mt-3 pt-3 border-t border-[#333]">
                  <button onClick={(e) => { e.stopPropagation(); openEdit(car); }}
                    className="text-xs text-[#E50914] hover:text-[#ff4d4d]">Edit</button>
                  {user?.role === 'admin' && (
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(car.id); }}
                      className="text-xs text-red-500 hover:text-red-400">Delete</button>
                  )}
                </div>
              )}
            </div>
          ))}
          {cars?.length === 0 && <p className="text-[#808080] col-span-3 text-center py-10">No cars found</p>}
        </div>
      )}

      <Modal open={!!detail} onClose={() => setDetail(null)} title="Car Details">
        {detail && (
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div><span className="text-[#808080]">Brand:</span> <strong className="text-white">{detail.brand}</strong></div>
              <div><span className="text-[#808080]">Model:</span> <strong className="text-white">{detail.model}</strong></div>
              <div><span className="text-[#808080]">Variant:</span> <span className="text-[#aaa]">{detail.variant || '-'}</span></div>
              <div><span className="text-[#808080]">Year:</span> <span className="text-[#aaa]">{detail.year}</span></div>
              <div><span className="text-[#808080]">Mileage:</span> <span className="text-[#aaa]">{detail.mileage?.toLocaleString() || '-'} km</span></div>
              <div><span className="text-[#808080]">Fuel:</span> <span className="text-[#aaa]">{detail.fuel_type}</span></div>
              <div><span className="text-[#808080]">Transmission:</span> <span className="text-[#aaa]">{detail.transmission}</span></div>
              <div><span className="text-[#808080]">Color:</span> <span className="text-[#aaa]">{detail.color || '-'}</span></div>
              <div><span className="text-[#808080]">Reg #:</span> <span className="text-[#aaa]">{detail.registration_number || '-'}</span></div>
              <div><span className="text-[#808080]">Status:</span> <StatusBadge status={detail.status} /></div>
              <div><span className="text-[#808080]">Expected:</span> <span className="text-[#E50914] font-semibold">${parseFloat(detail.price_expected || 0).toLocaleString()}</span></div>
              <div><span className="text-[#808080]">Purchase:</span> <span className="text-[#aaa]">${parseFloat(detail.purchase_price || 0).toLocaleString()}</span></div>
            </div>
            {detail.condition_notes && (
              <div><span className="text-[#808080]">Condition:</span><p className="mt-1 text-[#aaa]">{detail.condition_notes}</p></div>
            )}
          </div>
        )}
      </Modal>

      <Modal open={modal} onClose={() => { setModal(false); setEditing(null); }} title={editing ? 'Edit Car' : 'Add Car'}>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input value={form.brand} onChange={set('brand')} placeholder="Brand *" className={inputCls} required />
            <input value={form.model} onChange={set('model')} placeholder="Model *" className={inputCls} required />
            <input value={form.variant} onChange={set('variant')} placeholder="Variant" className={inputCls} />
            <input type="number" value={form.year} onChange={set('year')} placeholder="Year *" className={inputCls} required />
            <input type="number" value={form.mileage} onChange={set('mileage')} placeholder="Mileage (km)" className={inputCls} />
            <select value={form.fuel_type} onChange={set('fuel_type')} className={inputCls}>
              <option>Petrol</option><option>Diesel</option><option>Electric</option><option>Hybrid</option><option>CNG</option>
            </select>
            <select value={form.transmission} onChange={set('transmission')} className={inputCls}>
              <option>Manual</option><option>Automatic</option>
            </select>
            <input value={form.color} onChange={set('color')} placeholder="Color" className={inputCls} />
            <input value={form.registration_number} onChange={set('registration_number')} placeholder="Registration #" className={inputCls} />
            <select value={form.status} onChange={set('status')} className={inputCls}>
              <option value="available">Available</option><option value="reserved">Reserved</option><option value="sold">Sold</option>
            </select>
            <input type="number" value={form.price_expected} onChange={set('price_expected')} placeholder="Expected Price" className={inputCls} />
            <input type="number" value={form.purchase_price} onChange={set('purchase_price')} placeholder="Purchase Price" className={inputCls} />
          </div>
          <textarea value={form.condition_notes} onChange={set('condition_notes')} placeholder="Condition notes..." className={inputCls} rows={3} />
          <button type="submit" className="w-full bg-[#E50914] text-white py-2 rounded font-medium hover:bg-[#B20710] transition">
            {editing ? 'Update Car' : 'Add Car'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
