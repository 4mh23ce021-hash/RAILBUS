import React, { useState, useEffect } from 'react';
import { Bus, MapPin, Clock, ArrowRight, GitBranch, Navigation } from 'lucide-react';
import api from '../../services/api';

export default function RouteDetails() {
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRoutes() {
      try {
        const res = await api.get('/passenger/routes');
        if (res.data?.routes) {
          setRoutes(res.data.routes);
          if (res.data.routes.length > 0) {
            setSelectedRoute(res.data.routes[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load routes:', err);
      } finally {
        setLoading(false);
      }
    }
    loadRoutes();
  }, []);

  if (loading) {
    return (
      <div className="py-16 text-center text-slate-400 text-sm">
        Loading KSRTC transit corridors...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white flex items-center space-x-2">
          <GitBranch className="w-5 h-5 text-cyan-400" />
          <span>KSRTC City Connector Routes</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Detailed stop sequences from Mysuru Junction Railway Interchange to key hubs.
        </p>
      </div>

      {/* Route Switcher Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2">
        {routes.map((r) => (
          <button
            key={r.id}
            onClick={() => setSelectedRoute(r)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedRoute?.id === r.id
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'bg-[#0e1526] text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            {r.routeNumber} — {r.destination?.name}
          </button>
        ))}
      </div>

      {selectedRoute && (
        <div className="bg-[#0e1526] rounded-2xl border border-slate-800 p-5 space-y-6 shadow-xl">
          <div className="flex items-start justify-between pb-4 border-b border-slate-800">
            <div>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/70 px-2 py-0.5 rounded border border-cyan-800/40">
                {selectedRoute.routeNumber}
              </span>
              <h2 className="text-base font-bold text-white mt-1.5">{selectedRoute.routeName}</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Total Distance: <span className="text-slate-200 font-mono">{selectedRoute.totalDistanceKm} km</span> • Approx: <span className="text-cyan-300 font-mono">{selectedRoute.estimatedDurationMinutes} mins</span>
              </p>
            </div>

            <div className="text-right">
              <span className="text-xs font-bold text-emerald-400 font-mono">₹{selectedRoute.destination?.baseFare}</span>
              <span className="block text-[10px] text-slate-500">Standard Fare</span>
            </div>
          </div>

          {/* Stop Timeline Sequence */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Transit Stop Sequence
            </h3>

            <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-cyan-400 before:via-blue-500 before:to-emerald-400">
              {selectedRoute.stops?.map((stop, idx) => (
                <div key={stop.id || idx} className="relative group">
                  <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-slate-900 border-2 border-cyan-400"></div>
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                        {stop.stopName}
                      </span>
                      <p className="text-[10px] text-slate-400">
                        Stop #{stop.stopOrder} • Coordinates: {stop.latitude.toFixed(4)}, {stop.longitude.toFixed(4)}
                      </p>
                    </div>

                    <span className="font-mono text-slate-400 text-[11px]">
                      +{stop.estimatedArrivalOffsetMinutes} min
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
