import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Bus,
  QrCode,
  KeyRound,
  Users,
  CheckCircle2,
  Clock,
  MapPin,
  Train,
  ArrowRight,
  ShieldCheck,
  History
} from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import api from '../../services/api';

export default function ConductorDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { realtimeEvents } = useSocket();

  const loadDashboard = async () => {
    try {
      const res = await api.get('/conductor/dashboard');
      if (res.data?.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load conductor dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  useEffect(() => {
    if (realtimeEvents.find(e => e.eventName === 'ticket:boarded' || e.eventName === 'pool:updated')) {
      loadDashboard();
    }
  }, [realtimeEvents]);

  if (loading) {
    return (
      <div className="py-16 text-center text-slate-400 text-sm">
        Connecting to bus telemetry and manifest terminal...
      </div>
    );
  }

  const b = data?.boardingMetrics || {};
  const pool = data?.activePool;

  return (
    <div className="space-y-5">
      {/* Assigned Vehicle Header Card */}
      <div className="bg-gradient-to-r from-emerald-950/70 via-[#0e1526] to-slate-900 rounded-2xl border border-emerald-500/30 p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-bold text-white tracking-wide">ASSIGNED FLEET BUS</span>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
            {data?.conductor?.assignedBus || 'KA-09-F-4412'}
          </span>
        </div>

        <div className="space-y-1">
          <h2 className="text-lg font-bold text-white">
            {pool ? pool.destination : 'City Connector Route RB-01'}
          </h2>
          <p className="text-xs text-slate-300">
            Train: <span className="text-cyan-300 font-semibold">{pool ? pool.train : 'Inbound Express'}</span> • Window: <span className="font-mono text-white">{pool ? pool.boardingWindow : '13:10 - 13:25'}</span>
          </p>
        </div>
      </div>

      {/* Boarding Counter Gauge Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[#0e1526] p-4 rounded-xl border border-slate-800 text-center space-y-1">
          <span className="text-[10px] text-slate-400 font-mono block">ASSIGNED</span>
          <div className="text-2xl font-black text-white font-mono">{b.totalAssigned || 0}</div>
          <span className="text-[10px] text-slate-500">Reserved</span>
        </div>

        <div className="bg-[#0e1526] p-4 rounded-xl border border-emerald-500/40 text-center space-y-1">
          <span className="text-[10px] text-emerald-400 font-mono block">BOARDED</span>
          <div className="text-2xl font-black text-emerald-400 font-mono">{b.boardedCount || 0}</div>
          <span className="text-[10px] text-emerald-500/80">Validated</span>
        </div>

        <div className="bg-[#0e1526] p-4 rounded-xl border border-slate-800 text-center space-y-1">
          <span className="text-[10px] text-slate-400 font-mono block">REMAINING</span>
          <div className="text-2xl font-black text-amber-400 font-mono">{b.remainingCount || 0}</div>
          <span className="text-[10px] text-amber-500/80">Pending</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-[#0e1526] p-4 rounded-xl border border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400">Boarding Progress:</span>
          <span className="font-mono text-emerald-400 font-bold">{b.boardingCompletionPercentage || 0}% Complete</span>
        </div>
        <div className="h-2.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
            style={{ width: `${b.boardingCompletionPercentage || 0}%` }}
          ></div>
        </div>
      </div>

      {/* Primary Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          to="/conductor/scanner"
          className="p-5 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-extrabold flex flex-col items-center justify-center space-y-2 shadow-lg shadow-emerald-500/20 transition-all text-center"
        >
          <QrCode className="w-7 h-7" />
          <span className="text-sm">Scan QR Ticket</span>
        </Link>

        <Link
          to="/conductor/manual"
          className="p-5 rounded-2xl bg-[#0e1526] hover:bg-slate-800 border border-emerald-500/30 text-emerald-300 font-bold flex flex-col items-center justify-center space-y-2 shadow-lg transition-all text-center"
        >
          <KeyRound className="w-7 h-7 text-emerald-400" />
          <span className="text-sm">Enter 6-Digit Code</span>
        </Link>
      </div>

      {/* Quick Manifest Preview */}
      <div className="bg-[#0e1526] rounded-2xl border border-slate-800 p-5 space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <Users className="w-4 h-4 text-emerald-400" />
            <span>Passenger Manifest ({data?.manifest?.length || 0})</span>
          </h3>
          <Link to="/conductor/manifest" className="text-xs text-emerald-400 hover:underline">
            View Full List →
          </Link>
        </div>

        <div className="divide-y divide-slate-800/80">
          {data?.manifest?.slice(0, 4).map((p, idx) => (
            <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
              <div>
                <span className="font-semibold text-white block">{p.passengerName}</span>
                <span className="text-[11px] text-slate-400 font-mono">Code: {p.sixDigitCode}</span>
              </div>

              <span
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                  p.ticketStatus === 'BOARDED'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {p.ticketStatus === 'BOARDED' ? '✓ BOARDED' : 'PENDING'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
