import React, { useState, useEffect } from 'react';
import { Radio, Train, Clock, MapPin, AlertCircle, CheckCircle2, Edit3, Save, X } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import api from '../../services/api';

export default function TrainMonitoring() {
  const [trains, setTrains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTrain, setEditingTrain] = useState(null);
  const [editForm, setEditForm] = useState({ delayMinutes: 0, status: 'ON_TIME', platform: '1', estimatedArrival: '' });
  const [msg, setMsg] = useState('');
  const { realtimeEvents } = useSocket();

  const loadTrains = async () => {
    try {
      const res = await api.get('/admin/trains');
      if (res.data?.trains) {
        setTrains(res.data.trains);
      }
    } catch (err) {
      console.error('Failed to load trains:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrains();
  }, []);

  useEffect(() => {
    if (realtimeEvents.find(e => e.eventName === 'train:status_updated')) {
      loadTrains();
    }
  }, [realtimeEvents]);

  const startEdit = (train) => {
    setEditingTrain(train);
    setEditForm({
      delayMinutes: train.delayMinutes,
      status: train.status,
      platform: train.platform,
      estimatedArrival: train.estimatedArrival
    });
  };

  const handleSaveEdit = async () => {
    if (!editingTrain) return;
    try {
      const res = await api.patch(`/admin/trains/${editingTrain.id}`, editForm);
      if (res.data?.success) {
        setMsg(`Train #${editingTrain.trainNumber} telemetry updated.`);
        setEditingTrain(null);
        loadTrains();
      }
    } catch (err) {
      console.error('Failed to update train:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <Radio className="w-5 h-5 text-cyan-400 animate-pulse" />
            <h1 className="text-xl font-bold text-white">Live Inbound Train Monitoring</h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time telemetry feeds from RailRadar & simulated railway sensors for Mysuru Junction.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-slate-300">TELEMETRY LINK: ACTIVE</span>
        </div>
      </div>

      {msg && (
        <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {/* Train Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {trains.map((train) => {
          const isDelayed = train.status === 'DELAYED';

          return (
            <div
              key={train.id}
              className={`bg-[#0e1526] rounded-2xl border p-5 space-y-4 shadow-xl transition-all ${
                isDelayed ? 'border-amber-500/40' : 'border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950/70 px-2 py-0.5 rounded border border-cyan-800/40">
                    #{train.trainNumber}
                  </span>
                  <h3 className="font-bold text-white text-base mt-1.5">{train.trainName}</h3>
                </div>

                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                    isDelayed
                      ? 'bg-amber-950 text-amber-300 border border-amber-800'
                      : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  }`}
                >
                  {isDelayed ? `DELAY +${train.delayMinutes} MIN` : 'ON TIME'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs text-slate-400 pt-2 border-t border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-500 block">Origin Station</span>
                  <span className="text-slate-200 font-medium">{train.sourceStation}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Platform</span>
                  <span className="text-cyan-300 font-mono font-bold">Platform {train.platform}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Scheduled ETA</span>
                  <span className="text-slate-200 font-mono">{train.scheduledArrival}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Estimated ETA</span>
                  <span className="text-emerald-400 font-mono font-bold">{train.estimatedArrival}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 block">PASSENGER DEMAND</span>
                  <span className="font-mono text-cyan-300 font-bold">
                    {train._count?.bookings || 0} Bookings Recorded
                  </span>
                </div>

                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                  {train.provider === 'RAILRADAR' ? 'LIVE RADAR' : 'SIMULATED DEMO'}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => startEdit(train)}
                  className="px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Update Telemetry / Delay</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Telemetry Modal */}
      {editingTrain && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0e1526] rounded-2xl border border-cyan-500/40 p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Edit3 className="w-4 h-4 text-cyan-400" />
                <span>Update Train #{editingTrain.trainNumber} Telemetry</span>
              </h3>
              <button onClick={() => setEditingTrain(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="w-full bg-[#080c14] border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                >
                  <option value="ON_TIME">ON_TIME</option>
                  <option value="DELAYED">DELAYED</option>
                  <option value="ARRIVED">ARRIVED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Delay (Minutes)</label>
                <input
                  type="number"
                  value={editForm.delayMinutes}
                  onChange={(e) => setEditForm({ ...editForm, delayMinutes: parseInt(e.target.value, 10) || 0 })}
                  className="w-full bg-[#080c14] border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Platform Number</label>
                <input
                  type="text"
                  value={editForm.platform}
                  onChange={(e) => setEditForm({ ...editForm, platform: e.target.value })}
                  className="w-full bg-[#080c14] border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Estimated Arrival Time (HH:MM)</label>
                <input
                  type="text"
                  value={editForm.estimatedArrival}
                  onChange={(e) => setEditForm({ ...editForm, estimatedArrival: e.target.value })}
                  className="w-full bg-[#080c14] border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setEditingTrain(null)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/25"
              >
                Broadcast Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
