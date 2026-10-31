import React, { useState, useEffect } from 'react';
import { Users, Search, CheckCircle2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

export default function PassengerManifest() {
  const [manifest, setManifest] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await api.get('/conductor/dashboard');
        if (res.data?.manifest) setManifest(res.data.manifest);
      } catch (err) {
        console.error('Failed to load manifest:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filtered = manifest.filter(p =>
    p.passengerName.toLowerCase().includes(search.toLowerCase()) ||
    p.sixDigitCode.includes(search) ||
    p.bookingCode.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-md mx-auto space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <Link to="/conductor/dashboard" className="text-xs text-slate-400 hover:text-white flex items-center space-x-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </Link>
        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
          TOTAL: {manifest.length} PASSENGERS
        </span>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search manifest by passenger name or 6-digit code..."
          className="w-full bg-[#0e1526] border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-400"
        />
      </div>

      <div className="bg-[#0e1526] rounded-2xl border border-slate-800 p-4 divide-y divide-slate-800/80 shadow-xl">
        {loading ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            Loading assigned manifest records...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            No passengers found matching "{search}".
          </div>
        ) : (
          filtered.map((item, idx) => {
            const isBoarded = item.ticketStatus === 'BOARDED';
            return (
              <div key={idx} className="py-3 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-white text-xs">{item.passengerName}</span>
                    <span className="text-[10px] text-slate-400 font-mono">({item.phone})</span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Code: <span className="text-cyan-300 font-bold">{item.sixDigitCode}</span> • Seats: {item.passengerCount}
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold block ${
                      isBoarded
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {isBoarded ? '✓ BOARDED' : 'PENDING'}
                  </span>
                  {item.boardedAt && (
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(item.boardedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
