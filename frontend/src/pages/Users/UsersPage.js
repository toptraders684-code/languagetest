import React, { useState } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { getUsers, createUser, updateUser, deleteUser } from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';

const emptyForm = { name: '', email: '', password: '', role: 'sales_executive', phone: '', status: 'active' };

export default function UsersPage() {
  const { data: users, loading, refetch } = useFetch(getUsers);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        const data = { ...form };
        if (!data.password) delete data.password;
        await updateUser(editing, data);
      } else {
        await createUser(form);
      }
      setModal(false);
      setForm(emptyForm);
      setEditing(null);
      refetch();
    } catch (err) {
      alert(err.response?.data?.error || 'Error saving user');
    }
  };

  const openEdit = (user) => {
    setForm({ name: user.name, email: user.email, password: '', role: user.role, phone: user.phone || '', status: user.status });
    setEditing(user.id);
    setModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    await deleteUser(id);
    refetch();
  };

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });
  const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none";

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Users</h2>
        <button onClick={() => { setForm(emptyForm); setEditing(null); setModal(true); }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
          + Add User
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-500">Loading...</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Name</th>
                <th className="px-4 py-3 text-left font-medium hidden sm:table-cell">Email</th>
                <th className="px-4 py-3 text-left font-medium">Role</th>
                <th className="px-4 py-3 text-left font-medium hidden md:table-cell">Phone</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users?.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{u.name}</td>
                  <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">{u.email}</td>
                  <td className="px-4 py-3 capitalize">{u.role.replace('_', ' ')}</td>
                  <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{u.phone || '-'}</td>
                  <td className="px-4 py-3"><StatusBadge status={u.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(u)} className="text-indigo-600 hover:underline text-xs">Edit</button>
                      <button onClick={() => handleDelete(u.id)} className="text-red-600 hover:underline text-xs">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modal} onClose={() => { setModal(false); setEditing(null); }} title={editing ? 'Edit User' : 'Add User'}>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input value={form.name} onChange={set('name')} placeholder="Full Name *" className={inputCls} required />
          <input type="email" value={form.email} onChange={set('email')} placeholder="Email *" className={inputCls} required />
          <input type="password" value={form.password} onChange={set('password')} placeholder={editing ? 'New Password (leave blank to keep)' : 'Password *'}
            className={inputCls} required={!editing} />
          <div className="grid grid-cols-2 gap-3">
            <select value={form.role} onChange={set('role')} className={inputCls}>
              <option value="sales_executive">Sales Executive</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
            <select value={form.status} onChange={set('status')} className={inputCls}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <input value={form.phone} onChange={set('phone')} placeholder="Phone" className={inputCls} />
          <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700">
            {editing ? 'Update User' : 'Create User'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
