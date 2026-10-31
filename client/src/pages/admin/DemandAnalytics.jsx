import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Train, MapPin, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';

export default function DemandAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const res = await api.get('/admin/analytics');
        if (res.data?.analytics) setData(res.data.analytics);
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="py-16 text-center text-slate-400 text-sm">
        Computing passenger demand aggregations across Mysuru corridors...
      </div>
    );
  }

  const s = data?.summary || {};
  const destinationDemand = data?.destinationDemand || [];
  const trainDemand = data?.trainDemand || [];

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-800">
        <h1 className="text-xl font-bold text-white flex items-center space-x-2">
          <BarChart3 className="w-5 h-5 text-cyan-400" />
          <span>Mobility Demand Analytics & Aggregation Trends</span>
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Real database analytics tracking destination density, train delay impacts, and pooling efficiency.
        </p>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#0e1526] p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 font-mono block">POOL SUCCESS RATE</span>
          <div className="text-3xl font-black text-emerald-400 font-mono">{s.poolSuccessRate || 100}%</div>
          <p className="text-[11px] text-slate-500">Threshold Met & Dispatched</p>
        </div>

        <div className="bg-[#0e1526] p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 font-mono block">BOARDING RATE</span>
          <div className="text-3xl font-black text-cyan-400 font-mono">{s.boardingRate || 0}%</div>
          <p className="text-[11px] text-slate-500">{s.boardedTickets || 0} of {s.totalTickets || 0} Tickets</p>
        </div>

        <div className="bg-[#0e1526] p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 font-mono block">FLEET UTILIZATION</span>
          <div className="text-3xl font-black text-white font-mono">{s.availableVehicles || 0} / {s.totalVehicles || 0}</div>
          <p className="text-[11px] text-slate-500">Active KSRTC Buses</p>
        </div>

        <div className="bg-[#0e1526] p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 font-mono block">TOTAL TRANSIT VOLUME</span>
          <div className="text-3xl font-black text-purple-400 font-mono">{s.totalPassengers || 0}</div>
          <p className="text-[11px] text-slate-500">Passengers Pooled</p>
        </div>
      </div>

      {/* Two Column Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Destination Demand Distribution */}
        <div className="bg-[#0e1526] rounded-2xl border border-slate-800 p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-cyan-400" />
              <span>Destination Demand Distribution</span>
            </h3>
            <span className="text-[10px] font-mono text-cyan-400">CORRIDOR DENSITY</span>
          </div>

          <div className="space-y-4">
            {destinationDemand.map((d) => {
              const maxP = Math.max(...destinationDemand.map(x => x.passengerCount), 1);
              const barPct = Math.round((d.passengerCount / maxP) * 100);

              return (
                <div key={d.destinationId} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200">{d.name}</span>
                    <span className="font-mono text-cyan-300 font-bold">
                      {d.passengerCount} Pax ({d.bookingCount} Bookings)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(5, barPct)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Train Demand Breakdown */}
        <div className="bg-[#0e1526] rounded-2xl border border-slate-800 p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Train className="w-4 h-4 text-cyan-400" />
              <span>Train-Wise Passenger Aggregation</span>
            </h3>
            <span className="text-[10px] font-mono text-emerald-400">INBOUND DEMAND</span>
          </div>

          <div className="space-y-3">
            {trainDemand.map((t) => (
              <div
                key={t.trainId}
                className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-cyan-400">#{t.trainNumber}</span>
                    <span className="font-semibold text-white">{t.trainName}</span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Status: {t.status} {t.delayMinutes > 0 ? `(+${t.delayMinutes}m)` : ''}
                  </span>
                </div>

                <div className="text-right">
                  <span className="font-mono text-emerald-400 font-bold">{t.passengerCount} Passengers</span>
                  <p className="text-[10px] text-slate-500">{t.bookingCount} bookings</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
