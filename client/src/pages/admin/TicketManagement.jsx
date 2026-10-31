import React, { useState, useEffect } from 'react';
import { QrCode, Search, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import api from '../../services/api';

export default function TicketManagement() {
  const [tickets, setTickets] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await api.get('/admin/tickets');
        if (res.data?.tickets) setTickets(res.data.tickets);
      } catch (err) {
        console.error('Failed to load tickets:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filtered = tickets.filter(t =>
    t.ticketCode.toLowerCase().includes(search.toLowerCase()) ||
    t.sixDigitCode.includes(search) ||
    t.passenger?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-800">
        <h1 className="text-xl font-bold text-white flex items-center space-x-2">
          <QrCode className="w-5 h-5 text-cyan-400" />
          <span>Ticket Validation Audit & Manifest Ledger</span>
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Atomic scan verifications, 6-digit codes, and conductor boarding events.
        </p>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by ticket code, 6-digit code, passenger name..."
          className="w-full bg-[#0e1526] border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
        />
      </div>

      <div className="bg-[#0e1526] rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#090d16] text-slate-400 font-mono text-[11px] border-b border-slate-800">
              <tr>
                <th className="p-3.5">Ticket Code</th>
                <th className="p-3.5">6-Digit Code</th>
                <th className="p-3.5">Passenger</th>
                <th className="p-3.5">Destination</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Issued At</th>
                <th className="p-3.5">Boarded At</th>
                <th className="p-3.5">Total Scans</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filtered.map((t) => (
                <tr key={t.id} className="hover:bg-slate-900/60 transition-colors">
                  <td className="p-3.5 font-mono text-cyan-300 font-bold">{t.ticketCode}</td>
                  <td className="p-3.5 font-mono text-white font-black text-sm tracking-widest">{t.sixDigitCode}</td>
                  <td className="p-3.5 font-semibold text-slate-100">{t.passenger?.name}</td>
                  <td className="p-3.5">{t.booking?.destination?.name}</td>
                  <td className="p-3.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        t.status === 'BOARDED'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                      }`}
                    >
                      {t.status}
                    </span>
                  </td>
                  <td className="p-3.5 font-mono text-slate-400 text-[11px]">
                    {new Date(t.issuedAt).toLocaleTimeString()}
                  </td>
                  <td className="p-3.5 font-mono text-emerald-400 text-[11px]">
                    {t.boardedAt ? new Date(t.boardedAt).toLocaleTimeString() : 'Not Yet'}
                  </td>
                  <td className="p-3.5 font-mono text-slate-300">
                    {t.scans?.length || 0} scan(s)
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
