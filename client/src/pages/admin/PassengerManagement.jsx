import React, { useState, useEffect } from 'react';
import { UserCheck, Search, Filter, Train, MapPin } from 'lucide-react';
import api from '../../services/api';

export default function PassengerManagement() {
  const [passengers, setPassengers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await api.get('/admin/passengers');
        if (res.data?.passengers) setPassengers(res.data.passengers);
      } catch (err) {
        console.error('Failed to load passengers:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filtered = passengers.filter(p =>
    p.passenger?.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.passenger?.phone?.includes(search) ||
    p.bookingCode?.toLowerCase().includes(search.toLowerCase()) ||
    p.destination?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-800">
        <h1 className="text-xl font-bold text-white flex items-center space-x-2">
          <UserCheck className="w-5 h-5 text-cyan-400" />
          <span>In-Transit Passenger Records</span>
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Audited manifest records of passengers holding active pooling reservations.
        </p>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by passenger name, mobile, booking code, or destination..."
          className="w-full bg-[#0e1526] border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
        />
      </div>

      <div className="bg-[#0e1526] rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#090d16] text-slate-400 font-mono text-[11px] border-b border-slate-800">
              <tr>
                <th className="p-3.5">Passenger</th>
                <th className="p-3.5">Mobile</th>
                <th className="p-3.5">Train</th>
                <th className="p-3.5">Destination</th>
                <th className="p-3.5">Seats</th>
                <th className="p-3.5">Booking Status</th>
                <th className="p-3.5">Payment</th>
                <th className="p-3.5">Ticket</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">Loading passenger roster...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">No matching passenger records found.</td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-900/60 transition-colors">
                    <td className="p-3.5 font-semibold text-white">{item.passenger?.name}</td>
                    <td className="p-3.5 font-mono text-slate-400">{item.passenger?.phone || 'N/A'}</td>
                    <td className="p-3.5 font-mono text-cyan-300">#{item.train?.trainNumber}</td>
                    <td className="p-3.5">{item.destination?.name}</td>
                    <td className="p-3.5 font-mono">{item.passengerCount}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800/40">
                        {item.bookingStatus}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${item.paymentStatus === 'PAID' ? 'text-emerald-400 bg-emerald-950/60' : 'text-amber-400 bg-amber-950/60'}`}>
                        {item.paymentStatus}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-slate-300">
                      {item.tickets?.[0]?.sixDigitCode || 'Pending'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
