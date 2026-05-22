import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2 } from 'lucide-react';

interface Location {
  id: string;
  name: string;
  code: string;
  requiredXray: number;
  requiredPds: number;
  active: boolean;
}

const LocationManagement: React.FC = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    requiredXray: 3,
    requiredPds: 6
  });

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/api/locations?active=true');
      if (!response.ok) throw new Error('Failed to fetch locations');
      const data = await response.json();
      setLocations(data);
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
      const url = editingId ? `http://localhost:3000/api/locations/${editingId}` : 'http://localhost:3000/api/locations';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to save location');

      setFormData({ name: '', code: '', requiredXray: 3, requiredPds: 6 });
      setEditingId(null);
      setShowForm(false);
      fetchLocations();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this location?')) return;
    try {
      const response = await fetch(`http://localhost:3000/api/locations/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete');
      fetchLocations();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Locations</h1>
        <button
          onClick={() => { setShowForm(!showForm); setEditingId(null); }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} /> Add Location
        </button>
      </div>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-bold mb-4">{editingId ? 'Edit Location' : 'Add New Location'}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder="Location Name" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="border rounded px-3 py-2" />
            <input type="text" placeholder="Code (e.g., T1A)" required value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} className="border rounded px-3 py-2" />
            <input type="number" placeholder="Required X-Ray" min="1" value={formData.requiredXray} onChange={(e) => setFormData({ ...formData, requiredXray: parseInt(e.target.value) })} className="border rounded px-3 py-2" />
            <input type="number" placeholder="Required PDS" min="1" value={formData.requiredPds} onChange={(e) => setFormData({ ...formData, requiredPds: parseInt(e.target.value) })} className="border rounded px-3 py-2" />
            <button type="submit" className="md:col-span-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
              {editingId ? 'Update' : 'Create'} Location
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {locations.map((location) => (
            <div key={location.id} className="bg-white rounded-lg shadow-md p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg">{location.name}</h3>
                  <p className="text-gray-600 mb-2">Code: {location.code}</p>
                  <div className="flex gap-4 text-sm">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded">X-Ray: {location.requiredXray}</span>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded">PDS: {location.requiredPds}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setEditingId(location.id); setShowForm(true); }} className="text-blue-600 hover:text-blue-800">
                    <Edit2 size={20} />
                  </button>
                  <button onClick={() => handleDelete(location.id)} className="text-red-600 hover:text-red-800">
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LocationManagement;
