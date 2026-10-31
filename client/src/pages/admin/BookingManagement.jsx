import React, { useState, useEffect } from 'react';
import { BookOpen, Search, Filter } from 'lucide-react';
import api from '../../services/api';

export default function BookingManagement() {
  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await api.get('/admin/passengers');
        if (res.data?.passengers) setBookings(res.data.passengers);
      } catch (err) {
        console.error('Failed to load bookings:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filtered = bookings.filter(b =>
    b.bookingCode.toLowerCase().includes(search.toLowerCase()) ||
    b.passenger?.name?.toLowerCase().includes(search.toLowerCase()) ||
    b.destination?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-800">
        <h1 className="text-xl font-bold text-white flex items-center space-x-2">
          <BookOpen className="w-5 h-5 text-cyan-400" />
          <span>Global Booking Registry</span>
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Audited ledger of all passenger reservations, pooling associations, and payment reconciliation.
        </p>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by booking code, passenger name, destination..."
          className="w-full bg-[#0e1526] border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
        />
      </div>

      <div className="bg-[#0e1526] rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#090d16] text-slate-400 font-mono text-[11px] border-b border-slate-800">
              <tr>
                <th className="p-3.5">Booking Code</th>
                <th className="p-3.5">Passenger</th>
                <th className="p-3.5">Train</th>
                <th className="p-3.5">Destination</th>
                <th className="p-3.5">Journey Date</th>
                <th className="p-3.5">Seats</th>
                <th className="p-3.5">Total Fare</th>
                <th className="p-3.5">Payment</th>
                <th className="p-3.5">Booking Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filtered.map((b) => (
                <tr key={b.id} className="hover:bg-slate-900/60 transition-colors">
                  <td className="p-3.5 font-mono text-cyan-300 font-bold">{b.bookingCode}</td>
                  <td className="p-3.5 font-semibold text-white">{b.passenger?.name}</td>
                  <td className="p-3.5 font-mono">#{b.train?.trainNumber}</td>
                  <td className="p-3.5">{b.destination?.name}</td>
                  <td className="p-3.5 font-mono">{b.journeyDate}</td>
                  <td className="p-3.5 font-mono">{b.passengerCount}</td>
                  <td className="p-3.5 font-mono text-emerald-400 font-bold">₹{b.totalFare}</td>
                  <td className="p-3.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${b.paymentStatus === 'PAID' ? 'text-emerald-300 bg-emerald-950/60' : 'text-amber-300 bg-amber-950/60'}`}>
                      {b.paymentStatus}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800/40">
                      {b.bookingStatus}
                    </span>
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
