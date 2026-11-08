import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Train,
  Radio,
  Layers,
  Send,
  Bus,
  CreditCard,
  QrCode,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  MapPin,
  Activity,
  ArrowUpRight,
  Flame,
  RotateCcw
} from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import api from '../../services/api';
import HologramLoader3D from '../../components/3d/HologramLoader3D';
import TiltCard3D from '../../components/3d/TiltCard3D';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { realtimeEvents } = useSocket();

  const loadMetrics = async () => {
    try {
      const res = await api.get('/admin/dashboard');
      if (res.data?.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, []);

  // Refresh metrics on socket events
  useEffect(() => {
    if (realtimeEvents.length > 0) {
      loadMetrics();
    }
  }, [realtimeEvents]);

  if (loading) {
    return <HologramLoader3D message="POLLING REAL-TIME TELEMETRY FROM MYSURU NODES" />;
  }

  const m = data?.metrics || {};

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#3b1d11]">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FE8505] animate-pulse"></span>
            <h1 className="text-xl font-black text-[#FFFDE1] tracking-wide">
              OPERATIONAL TELEMETRY & NETWORK SYNCHRONIZATION
            </h1>
          </div>
          <p className="text-xs text-[#FFFDE1]/70 mt-0.5">
            Real-time passenger aggregation across Mysuru Junction (MYS) & KSRTC City Network
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <Link
            to="/admin/pools"
            className="px-4 py-2 rounded-xl bg-[#FE8505]/15 hover:bg-[#FE8505]/25 text-[#FE8505] border border-[#FE8505]/30 font-bold flex items-center space-x-1.5 transition-colors"
          >
            <Layers className="w-4 h-4 text-[#FE8505]" />
            <span>Pools Review ({m.poolsAwaitingApproval || 0})</span>
          </Link>
          <Link
            to="/admin/dispatch"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#FE8505] to-[#E52E01] hover:from-[#ff9c2b] hover:to-[#ff4d24] text-[#080c14] hover:text-white font-black flex items-center space-x-1.5 transition-all shadow-md shadow-[#FE8505]/20"
          >
            <Send className="w-4 h-4" />
            <span>Dispatch Control</span>
          </Link>
        </div>
      </div>

      {/* Signature Live Mobility Network Visualization */}
      <section className="bg-gradient-to-br from-[#0c1220] via-[#0e1628] to-[#0a0f1d] rounded-3xl border border-[#FE8505]/30 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#FE8505]/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="flex items-center justify-between pb-6 border-b border-[#3b1d11]">
          <div>
            <span className="text-[10px] font-mono tracking-widest text-[#FE8505] bg-[#FE8505]/15 px-2.5 py-0.5 rounded border border-[#FE8505]/30 font-bold">
              SIGNATURE NETWORK TOPOLOGY
            </span>
            <h2 className="text-lg font-black text-[#FFFDE1] mt-1">
              Live Mobility Pipeline Visualization
            </h2>
          </div>
          <span className="text-xs text-[#FFFDE1]/70 font-mono hidden sm:inline">
            ALGORITHM: DYNAMIC POOLING (20–56 PAX) • 10-MIN SYNC
          </span>
        </div>

        {/* The 5 Connected Nodes */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-5 gap-4 relative">
          {/* Node 1: Mysuru Junction */}
          <div className="bg-[#090d16] p-4 rounded-2xl border border-[#3b1d11] hover:border-[#FE8505]/40 transition-all space-y-2 relative group">
            <div className="flex items-center justify-between">
              <span className="w-7 h-7 rounded-lg bg-[#FE8505]/20 text-[#FE8505] flex items-center justify-center font-bold text-xs">
                1
              </span>
              <span className="text-[10px] font-mono text-emerald-400">ONLINE</span>
            </div>
            <h3 className="text-xs font-bold text-[#FFFDE1] uppercase tracking-wider">Mysuru Junction</h3>
            <p className="text-[11px] text-slate-400">Platforms 1–4 Terminal Portico Interchange</p>
            <div className="pt-2 border-t border-[#3b1d11] text-[11px] font-mono text-[#FE8505]">
              {m.monitoredTrains || 6} Inbound Trains
            </div>
          </div>

          {/* Node 2: Multi-Train Sync */}
          <div className="bg-[#090d16] p-4 rounded-2xl border border-[#3b1d11] hover:border-[#FE8505]/40 transition-all space-y-2 relative group">
            <div className="flex items-center justify-between">
              <span className="w-7 h-7 rounded-lg bg-[#FE8505]/20 text-[#FE8505] flex items-center justify-center font-bold text-xs">
                2
              </span>
              <span className="text-[10px] font-mono text-[#FE8505]">ACTIVE</span>
            </div>
            <h3 className="text-xs font-bold text-[#FFFDE1] uppercase tracking-wider">Multi-Train Sync</h3>
            <p className="text-[11px] text-slate-400">≤10 Min Arrival Gap Platform Merge</p>
            <div className="pt-2 border-t border-[#3b1d11] text-[11px] font-mono text-[#FFFDE1]">
              Plat 1 & 2 Combined
            </div>
          </div>

          {/* Node 3: Aggregation Pools */}
          <div className="bg-[#090d16] p-4 rounded-2xl border border-[#3b1d11] hover:border-[#FE8505]/40 transition-all space-y-2 relative group">
            <div className="flex items-center justify-between">
              <span className="w-7 h-7 rounded-lg bg-[#FE8505]/20 text-[#FE8505] flex items-center justify-center font-bold text-xs">
                3
              </span>
              <span className="text-[10px] font-mono text-[#FE8505]">POOLING</span>
            </div>
            <h3 className="text-xs font-bold text-[#FFFDE1] uppercase tracking-wider">Passenger Pools</h3>
            <p className="text-[11px] text-slate-400">20 Pax Threshold Review Engine</p>
            <div className="pt-2 border-t border-[#3b1d11] text-[11px] font-mono text-emerald-400">
              {m.activePools || 0} Active Corridors
            </div>
          </div>

          {/* Node 4: Dispatch Bay */}
          <div className="bg-[#090d16] p-4 rounded-2xl border border-[#3b1d11] hover:border-[#FE8505]/40 transition-all space-y-2 relative group">
            <div className="flex items-center justify-between">
              <span className="w-7 h-7 rounded-lg bg-[#FE8505]/20 text-[#FE8505] flex items-center justify-center font-bold text-xs">
                4
              </span>
              <span className="text-[10px] font-mono text-emerald-400">STANDBY</span>
            </div>
            <h3 className="text-xs font-bold text-[#FFFDE1] uppercase tracking-wider">KSRTC Bay 3 & 4</h3>
            <p className="text-[11px] text-slate-400">Portico Interchange Loading Bayside</p>
            <div className="pt-2 border-t border-[#3b1d11] text-[11px] font-mono text-[#FE8505]">
              {m.availableVehicles || 0} Buses Ready
            </div>
          </div>

          {/* Node 5: City Destinations */}
          <div className="bg-[#090d16] p-4 rounded-2xl border border-[#3b1d11] hover:border-[#FE8505]/40 transition-all space-y-2 relative group">
            <div className="flex items-center justify-between">
              <span className="w-7 h-7 rounded-lg bg-[#FE8505]/20 text-[#FE8505] flex items-center justify-center font-bold text-xs">
                5
              </span>
              <span className="text-[10px] font-mono text-emerald-400">EN ROUTE</span>
            </div>
            <h3 className="text-xs font-bold text-[#FFFDE1] uppercase tracking-wider">City Terminals</h3>
            <p className="text-[11px] text-slate-400">Kuvempunagar, Chamundi, Hebbal IT</p>
            <div className="pt-2 border-t border-[#3b1d11] text-[11px] font-mono text-emerald-400">
              {m.successfulBoardings || 0} Boardings
            </div>
          </div>
        </div>
      </section>

      {/* Numerical Metrics Matrix */}
      <section className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="bg-[#0e1526] p-4 rounded-2xl border border-[#3b1d11] space-y-1">
          <span className="text-[10px] text-slate-400 font-mono block">TOTAL REGISTERED</span>
          <div className="text-2xl font-black text-[#FFFDE1] font-mono">{m.totalUsers || 0}</div>
          <span className="text-[11px] text-slate-500">Users in System</span>
        </div>

        <div className="bg-[#0e1526] p-4 rounded-2xl border border-[#3b1d11] space-y-1">
          <span className="text-[10px] text-slate-400 font-mono block">ACTIVE PASSENGERS</span>
          <div className="text-2xl font-black text-[#FE8505] font-mono">{m.activePassengers || 0}</div>
          <span className="text-[11px] text-[#FE8505]/80">Active Accounts</span>
        </div>

        <div className="bg-[#0e1526] p-4 rounded-2xl border border-[#3b1d11] space-y-1">
          <span className="text-[10px] text-slate-400 font-mono block">TOTAL BOOKINGS</span>
          <div className="text-2xl font-black text-[#FFFDE1] font-mono">{m.totalBookings || 0}</div>
          <span className="text-[11px] text-slate-500">Completed & In-Flight</span>
        </div>

        <div className="bg-[#0e1526] p-4 rounded-2xl border border-[#FE8505]/40 space-y-1">
          <span className="text-[10px] text-[#FE8505] font-mono block font-bold">REVIEW REQUIRED</span>
          <div className="text-2xl font-black text-[#FE8505] font-mono">{m.poolsAwaitingApproval || 0}</div>
          <span className="text-[11px] text-amber-500/80">≥20 Pax Threshold</span>
        </div>

        <div className="bg-[#0e1526] p-4 rounded-2xl border border-[#3b1d11] space-y-1">
          <span className="text-[10px] text-slate-400 font-mono block">APPROVED POOLS</span>
          <div className="text-2xl font-black text-emerald-400 font-mono">{m.approvedPools || 0}</div>
          <span className="text-[11px] text-emerald-500/80">Vehicles Assigned</span>
        </div>

        <div className="bg-[#0e1526] p-4 rounded-2xl border border-[#3b1d11] space-y-1">
          <span className="text-[10px] text-slate-400 font-mono block">FLEET READY</span>
          <div className="text-2xl font-black text-[#FFFDE1] font-mono">{m.availableVehicles || 0}</div>
          <span className="text-[11px] text-slate-500">Available KSRTC Buses</span>
        </div>

        <div className="bg-[#0e1526] p-4 rounded-2xl border border-[#3b1d11] space-y-1">
          <span className="text-[10px] text-slate-400 font-mono block">REVENUE VOLUME</span>
          <div className="text-2xl font-black text-emerald-400 font-mono">₹{m.totalPaymentVolume || 0}</div>
          <span className="text-[11px] text-emerald-500/80">Captured Payments</span>
        </div>
      </section>

      {/* Two Column Layout: Recent Activity & Audit Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Bookings Table */}
        <div className="lg:col-span-2 bg-[#0e1526] rounded-3xl border border-[#3b1d11] p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-[#3b1d11]">
            <h3 className="text-sm font-bold text-[#FFFDE1] flex items-center space-x-2">
              <Train className="w-4 h-4 text-[#FE8505]" />
              <span>Recent Passenger Booking Requests</span>
            </h3>
            <Link to="/admin/bookings" className="text-xs text-[#FE8505] hover:underline font-bold">
              View All Records →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#FFFDE1]/80">
              <thead className="bg-[#080c14] text-slate-400 font-mono text-[11px]">
                <tr>
                  <th className="p-3">Booking Code</th>
                  <th className="p-3">Passenger</th>
                  <th className="p-3">Train</th>
                  <th className="p-3">Destination</th>
                  <th className="p-3">Seats</th>
                  <th className="p-3">Fare</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#3b1d11]/80">
                {data?.recentBookings?.map((b) => (
                  <tr key={b.id} className="hover:bg-[#162038]/60 transition-colors">
                    <td className="p-3 font-mono text-[#FE8505] font-bold">{b.bookingCode}</td>
                    <td className="p-3 font-medium text-white">{b.passenger?.name || 'Passenger'}</td>
                    <td className="p-3 font-mono">#{b.train?.trainNumber}</td>
                    <td className="p-3">{b.destination?.name}</td>
                    <td className="p-3 font-mono">{b.passengerCount}</td>
                    <td className="p-3 font-mono text-emerald-400 font-bold">₹{b.totalFare}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#FE8505]/15 text-[#FE8505] border border-[#FE8505]/30">
                        {b.bookingStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live System Audit Stream */}
        <div className="bg-[#0e1526] rounded-3xl border border-[#3b1d11] p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-[#3b1d11]">
            <h3 className="text-sm font-bold text-[#FFFDE1] flex items-center space-x-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Operational Audit Log</span>
            </h3>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
              STREAMING
            </span>
          </div>

          <div className="space-y-3">
            {data?.recentAuditLogs?.map((log) => (
              <div key={log.id} className="p-3 rounded-2xl bg-[#080c14] border border-[#3b1d11] text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[#FE8505] font-semibold">{log.action}</span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(log.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-[#FFFDE1]/80 text-[11px]">{log.details}</p>
                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                  <span>Actor: {log.user?.name || 'System Engine'}</span>
                  <span className="font-mono">IP: {log.ipAddress || '127.0.0.1'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
