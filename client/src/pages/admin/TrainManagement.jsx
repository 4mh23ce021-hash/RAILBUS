import React, { useState, useEffect } from 'react';
import { Train, Clock, MapPin, Search } from 'lucide-react';
import api from '../../services/api';

export default function TrainManagement() {
  const [trains, setTrains] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTrains() {
      try {
        const res = await api.get('/admin/trains');
        if (res.data?.trains) setTrains(res.data.trains);
      } catch (err) {
        console.error('Failed to load trains:', err);
      } finally {
        setLoading(false);
      }
    }
    loadTrains();
  }, []);

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-800">
        <h1 className="text-xl font-bold text-white flex items-center space-x-2">
          <Train className="w-5 h-5 text-cyan-400" />
          <span>Mysuru Junction Train Fleet & Timetable Configuration</span>
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Configured railway corridors synchronized with city transit services.
        </p>
      </div>

      <div className="bg-[#0e1526] rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#090d16] text-slate-400 font-mono text-[11px] border-b border-slate-800">
              <tr>
                <th className="p-3.5">Train Number</th>
                <th className="p-3.5">Train Name</th>
                <th className="p-3.5">Origin Station</th>
                <th className="p-3.5">Scheduled ETA</th>
                <th className="p-3.5">Estimated ETA</th>
                <th className="p-3.5">Platform</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Provider Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {trains.map((t) => (
                <tr key={t.id} className="hover:bg-slate-900/60 transition-colors">
                  <td className="p-3.5 font-mono text-cyan-300 font-bold">#{t.trainNumber}</td>
                  <td className="p-3.5 font-semibold text-white">{t.trainName}</td>
                  <td className="p-3.5">{t.sourceStation}</td>
                  <td className="p-3.5 font-mono text-slate-400">{t.scheduledArrival}</td>
                  <td className="p-3.5 font-mono text-cyan-400 font-bold">{t.estimatedArrival}</td>
                  <td className="p-3.5 font-mono text-slate-200">Plat {t.platform}</td>
                  <td className="p-3.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${t.status === 'ON_TIME' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-amber-950 text-amber-300 border border-amber-800'}`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="p-3.5 font-mono text-slate-400">
                    {t.provider === 'RAILRADAR' ? 'LIVE RADAR' : 'SIMULATED DEMO'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
