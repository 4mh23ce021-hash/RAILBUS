import React, { useState, useEffect } from 'react';
import { Send, Bus, Users, Clock, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import api from '../../services/api';

export default function DispatchManagement() {
  const [dispatches, setDispatches] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  const loadData = async () => {
    try {
      const [dispRes, driverRes] = await Promise.all([
        api.get('/admin/dispatches'),
        api.get('/admin/drivers')
      ]);
      if (dispRes.data?.dispatches) setDispatches(dispRes.data.dispatches);
      if (driverRes.data?.drivers) setDrivers(driverRes.data.drivers);
    } catch (err) {
      console.error('Failed to load dispatches:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await api.patch(`/admin/dispatches/${id}/status`, {
        status,
        actualDeparture: status === 'DEPARTED' ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined
      });
      if (res.data?.success) {
        setMsg(`Dispatch status transitioned to ${status}.`);
        loadData();
      }
    } catch (err) {
      console.error('Failed to update dispatch:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center space-x-2">
            <Send className="w-5 h-5 text-cyan-400" />
            <span>KSRTC City Shuttle Dispatch Control</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Operational vehicle staging, platform bay allocation, and boarding departure authorization.
          </p>
        </div>
      </div>

      {msg && (
        <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {/* Dispatches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {dispatches.map((d) => (
          <div
            key={d.id}
            className="bg-[#0e1526] rounded-2xl border border-slate-800 p-5 space-y-4 shadow-xl"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950/70 px-2 py-0.5 rounded border border-cyan-800/40">
                  {d.dispatchCode}
                </span>
                <h3 className="font-bold text-white text-base mt-1.5">
                  {d.pool?.destination?.name || 'City Corridor'}
                </h3>
              </div>

              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                  d.status === 'BOARDING'
                    ? 'bg-amber-950 text-amber-300 border border-amber-800 animate-pulse'
                    : d.status === 'DEPARTED'
                    ? 'bg-blue-950 text-blue-300 border border-blue-800'
                    : d.status === 'COMPLETED'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : 'bg-slate-800 text-slate-300'
                }`}
              >
                {d.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 pt-2 border-t border-slate-800">
              <div>
                <span className="text-[10px] text-slate-500 block">Assigned Bus</span>
                <span className="text-white font-mono font-bold">{d.vehicle?.busNumber}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Departure Bay</span>
                <span className="text-cyan-300 font-medium">{d.departureBay}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Scheduled Time</span>
                <span className="text-slate-200 font-mono">{d.scheduledDeparture}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Actual Departure</span>
                <span className="text-emerald-400 font-mono">{d.actualDeparture || 'In Staging'}</span>
              </div>
            </div>

            {/* Transition Action Buttons */}
            <div className="pt-2 border-t border-slate-800 flex items-center space-x-2">
              {d.status === 'SCHEDULED' && (
                <button
                  onClick={() => handleUpdateStatus(d.id, 'BOARDING')}
                  className="w-full py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold"
                >
                  Start Boarding at Bay
                </button>
              )}
              {d.status === 'BOARDING' && (
                <button
                  onClick={() => handleUpdateStatus(d.id, 'DEPARTED')}
                  className="w-full py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-md"
                >
                  Authorize Vehicle Departure
                </button>
              )}
              {d.status === 'DEPARTED' && (
                <button
                  onClick={() => handleUpdateStatus(d.id, 'COMPLETED')}
                  className="w-full py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold"
                >
                  Mark Route Completed
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
