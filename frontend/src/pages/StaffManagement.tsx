import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Trash2, Edit2 } from 'lucide-react';

interface Staff {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'xray' | 'pds_male' | 'pds_female';
  hireDate: string;
  active: boolean;
}

const StaffManagement: React.FC = () => {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'xray' | 'pds_male' | 'pds_female'>('active');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'xray' as const,
    hireDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchStaff();
  }, [filter]);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const query = filter === 'all' ? '' : `?active=${filter === 'active'}`;
      const response = await fetch(`http://localhost:3000/api/staff${query}`);
      if (!response.ok) throw new Error('Failed to fetch staff');
      const data = await response.json();
      setStaff(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `http://localhost:3000/api/staff/${editingId}` : 'http://localhost:3000/api/staff';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to save staff');

      setFormData({ firstName: '', lastName: '', email: '', phone: '', role: 'xray', hireDate: new Date().toISOString().split('T')[0] });
      setEditingId(null);
      setShowForm(false);
      fetchStaff();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this staff member?')) return;
    try {
      const response = await fetch(`http://localhost:3000/api/staff/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete');
      fetchStaff();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const roleColors: Record<string, string> = {
    xray: 'bg-blue-100 text-blue-800',
    pds_male: 'bg-green-100 text-green-800',
    pds_female: 'bg-pink-100 text-pink-800'
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Staff Management</h1>
        <button
          onClick={() => { setShowForm(!showForm); setEditingId(null); }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} /> Add Staff
        </button>
      </div>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-bold mb-4">{editingId ? 'Edit Staff' : 'Add New Staff'}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder="First Name" required value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} className="border rounded px-3 py-2" />
            <input type="text" placeholder="Last Name" required value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} className="border rounded px-3 py-2" />
            <input type="email" placeholder="Email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="border rounded px-3 py-2" />
            <input type="tel" placeholder="Phone" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="border rounded px-3 py-2" />
            <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value as any })} className="border rounded px-3 py-2">
              <option value="xray">X-Ray Operator</option>
              <option value="pds_male">PDS Male</option>
              <option value="pds_female">PDS Female</option>
            </select>
            <input type="date" value={formData.hireDate} onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })} className="border rounded px-3 py-2" />
            <button type="submit" className="md:col-span-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
              {editingId ? 'Update' : 'Create'} Staff
            </button>
          </form>
        </div>
      )}

      <div className="mb-6 flex gap-2">
        {(['active', 'all', 'xray', 'pds_male', 'pds_female'] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-lg font-medium ${
            filter === f ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
          }`}>
            {f === 'all' ? 'All' : f === 'active' ? 'Active' : f === 'xray' ? 'X-Ray' : f === 'pds_male' ? 'PDS Male' : 'PDS Female'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="grid gap-4">
          {staff.map((member) => (
            <div key={member.id} className="bg-white rounded-lg shadow-md p-4 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg">{member.firstName} {member.lastName}</h3>
                <p className="text-gray-600">{member.email} | {member.phone}</p>
                <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${roleColors[member.role]}`}>
                  {member.role === 'xray' ? 'X-Ray' : member.role === 'pds_male' ? 'PDS Male' : 'PDS Female'}
                </span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setEditingId(member.id); setShowForm(true); }} className="text-blue-600 hover:text-blue-800">
                  <Edit2 size={20} />
                </button>
                <button onClick={() => handleDelete(member.id)} className="text-red-600 hover:text-red-800">
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StaffManagement;
