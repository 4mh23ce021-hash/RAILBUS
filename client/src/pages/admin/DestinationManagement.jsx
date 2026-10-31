import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Edit, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../../services/api';

export default function DestinationManagement() {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({
    name: '',
    address: '',
    latitude: 12.3000,
    longitude: 76.6500,
    category: 'City Centre',
    baseFare: 35.0,
    estimatedTravelMinutes: 20
  });
  const [msg, setMsg] = useState('');

  const loadData = async () => {
    try {
      const res = await api.get('/admin/destinations');
      if (res.data?.destinations) setDestinations(res.data.destinations);
    } catch (err) {
      console.error('Failed to load destinations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/admin/destinations', form);
      if (res.data?.success) {
        setMsg(`Destination "${form.name}" added successfully.`);
        setShowAddModal(false);
        loadData();
      }
    } catch (err) {
      console.error('Failed to create destination:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-cyan-400" />
            <span>Mysuru Destination & Hub Management</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Geofenced terminal drop-off points, coordinate waypoints, and base fare schedules.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 flex items-center space-x-1.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Destination</span>
        </button>
      </div>

      {msg && (
        <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {destinations.map((d) => (
          <div key={d.id} className="bg-[#0e1526] rounded-2xl border border-slate-800 p-5 space-y-3 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-white text-base">{d.name}</h3>
                <span className="text-[10px] text-cyan-400 font-mono">{d.category}</span>
              </div>
              <span className="text-base font-black text-emerald-400 font-mono">₹{d.baseFare}</span>
            </div>

            <p className="text-xs text-slate-400 line-clamp-2">{d.address}</p>

            <div className="pt-2 border-t border-slate-800 text-xs text-slate-400 grid grid-cols-2 gap-2 font-mono">
              <div>Lat: <span className="text-slate-200">{d.latitude.toFixed(4)}</span></div>
              <div>Lng: <span className="text-slate-200">{d.longitude.toFixed(4)}</span></div>
              <div>Est: <span className="text-cyan-300">~{d.estimatedTravelMinutes} min</span></div>
              <div>Active: <span className="text-emerald-400">TRUE</span></div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreate} className="bg-[#0e1526] rounded-2xl border border-cyan-500/40 p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Plus className="w-4 h-4 text-cyan-400" />
              <span>Add Destination Hub</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Destination Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Vidyaranyapuram"
                  className="w-full bg-[#080c14] border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Address / Landmark</label>
                <input
                  type="text"
                  required
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="e.g. Main Ring Road, Mysuru"
                  className="w-full bg-[#080c14] border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={form.latitude}
                    onChange={(e) => setForm({ ...form, latitude: parseFloat(e.target.value) })}
                    className="w-full bg-[#080c14] border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={form.longitude}
                    onChange={(e) => setForm({ ...form, longitude: parseFloat(e.target.value) })}
                    className="w-full bg-[#080c14] border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Base Fare (INR)</label>
                  <input
                    type="number"
                    required
                    value={form.baseFare}
                    onChange={(e) => setForm({ ...form, baseFare: parseFloat(e.target.value) })}
                    className="w-full bg-[#080c14] border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Travel (Minutes)</label>
                  <input
                    type="number"
                    required
                    value={form.estimatedTravelMinutes}
                    onChange={(e) => setForm({ ...form, estimatedTravelMinutes: parseInt(e.target.value, 10) })}
                    className="w-full bg-[#080c14] border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs"
              >
                Create Hub
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
