import React, { useState, useEffect } from 'react';
import { Bus, Plus, CheckCircle2, Shield } from 'lucide-react';
import api from '../../services/api';

export default function VehicleManagement() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    busNumber: '',
    registrationNumber: '',
    vehicleType: 'KSRTC Sarige / City Express',
    capacity: 56,
    status: 'AVAILABLE',
    depot: 'Mysuru Central Depot 1'
  });
  const [msg, setMsg] = useState('');

  const loadData = async () => {
    try {
      const res = await api.get('/admin/vehicles');
      if (res.data?.vehicles) setVehicles(res.data.vehicles);
    } catch (err) {
      console.error('Failed to load vehicles:', err);
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
      const res = await api.post('/admin/vehicles', form);
      if (res.data?.success) {
        setMsg(`Vehicle ${form.busNumber} added to fleet.`);
        setShowAdd(false);
        loadData();
      }
    } catch (err) {
      console.error('Failed to create vehicle:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center space-x-2">
            <Bus className="w-5 h-5 text-cyan-400" />
            <span>KSRTC City Shuttle Fleet Inventory</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Fleet vehicle capacity enforcement (56 max passengers), availability, and depot assignments.
          </p>
        </div>

        <button
          onClick={() => setShowAdd(true)}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 flex items-center space-x-1.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Fleet Vehicle</span>
        </button>
      </div>

      {msg && (
        <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {vehicles.map((v) => (
          <div key={v.id} className="bg-[#0e1526] rounded-2xl border border-slate-800 p-5 space-y-3 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950/70 px-2 py-0.5 rounded border border-cyan-800/40">
                  {v.busNumber}
                </span>
                <h3 className="font-bold text-white text-base mt-1.5">{v.registrationNumber}</h3>
              </div>

              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                  v.status === 'AVAILABLE'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : v.status === 'ASSIGNED'
                    ? 'bg-amber-950 text-amber-300 border border-amber-800'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {v.status}
              </span>
            </div>

            <p className="text-xs text-slate-300">{v.vehicleType}</p>

            <div className="pt-2 border-t border-slate-800 text-xs text-slate-400 grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] text-slate-500 block">Maximum Capacity</span>
                <span className="text-cyan-300 font-mono font-bold">{v.capacity} Passengers</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Assigned Depot</span>
                <span className="text-slate-200">{v.depot}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreate} className="bg-[#0e1526] rounded-2xl border border-cyan-500/40 p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Plus className="w-4 h-4 text-cyan-400" />
              <span>Register New Fleet Bus</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Bus Fleet Number</label>
                <input
                  type="text"
                  required
                  placeholder="KSRTC-MYS-7700"
                  value={form.busNumber}
                  onChange={(e) => setForm({ ...form, busNumber: e.target.value })}
                  className="w-full bg-[#080c14] border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Registration Plate</label>
                <input
                  type="text"
                  required
                  placeholder="KA-09-F-7700"
                  value={form.registrationNumber}
                  onChange={(e) => setForm({ ...form, registrationNumber: e.target.value })}
                  className="w-full bg-[#080c14] border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Depot</label>
                <input
                  type="text"
                  required
                  value={form.depot}
                  onChange={(e) => setForm({ ...form, depot: e.target.value })}
                  className="w-full bg-[#080c14] border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowAdd(false)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs"
              >
                Save Vehicle
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
