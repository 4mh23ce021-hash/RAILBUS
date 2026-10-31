import React, { useState, useEffect } from 'react';
import { GitBranch, MapPin, Clock } from 'lucide-react';
import api from '../../services/api';

export default function RouteManagement() {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await api.get('/passenger/routes');
        if (res.data?.routes) setRoutes(res.data.routes);
      } catch (err) {
        console.error('Failed to load routes:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-800">
        <h1 className="text-xl font-bold text-white flex items-center space-x-2">
          <GitBranch className="w-5 h-5 text-cyan-400" />
          <span>KSRTC Transit Corridors & Waypoints</span>
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Verified route corridors from Mysuru Junction Portico to designated city hubs.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {routes.map((r) => (
          <div key={r.id} className="bg-[#0e1526] rounded-2xl border border-slate-800 p-5 space-y-4 shadow-xl">
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950/70 px-2 py-0.5 rounded border border-cyan-800/40">
                  {r.routeNumber}
                </span>
                <h3 className="font-bold text-white text-base mt-1">{r.routeName}</h3>
              </div>
              <span className="text-xs font-mono text-emerald-400 font-bold">
                {r.totalDistanceKm} km • ~{r.estimatedDurationMinutes}m
              </span>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] text-slate-500 uppercase font-mono block">Stops Timeline</span>
              <div className="space-y-1.5 pl-3 border-l-2 border-cyan-500/30">
                {r.stops?.map((st, i) => (
                  <div key={i} className="text-xs text-slate-300 flex justify-between">
                    <span>{st.stopOrder}. {st.stopName}</span>
                    <span className="text-slate-500 font-mono">+{st.estimatedArrivalOffsetMinutes}m</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
