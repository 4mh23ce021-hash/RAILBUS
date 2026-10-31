import React, { useState, useEffect } from 'react';
import { CreditCard, Search, CheckCircle2, ShieldCheck, Lock } from 'lucide-react';
import api from '../../services/api';

export default function PaymentManagement() {
  const [payments, setPayments] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await api.get('/admin/payments');
        if (res.data?.payments) setPayments(res.data.payments);
      } catch (err) {
        console.error('Failed to load payments:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filtered = payments.filter(p =>
    p.paymentCode.toLowerCase().includes(search.toLowerCase()) ||
    p.passenger?.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.razorpayPaymentId?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-800">
        <h1 className="text-xl font-bold text-white flex items-center space-x-2">
          <CreditCard className="w-5 h-5 text-cyan-400" />
          <span>Payment Ledger & Gateway Transactions</span>
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Audited transaction records for Razorpay Test Mode and payment reconciliation.
        </p>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by payment reference code, passenger name, or gateway ID..."
          className="w-full bg-[#0e1526] border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
        />
      </div>

      <div className="bg-[#0e1526] rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#090d16] text-slate-400 font-mono text-[11px] border-b border-slate-800">
              <tr>
                <th className="p-3.5">Payment ID</th>
                <th className="p-3.5">Passenger</th>
                <th className="p-3.5">Amount</th>
                <th className="p-3.5">Gateway</th>
                <th className="p-3.5">Gateway Payment Reference</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-slate-900/60 transition-colors">
                  <td className="p-3.5 font-mono text-cyan-300 font-bold">{p.paymentCode}</td>
                  <td className="p-3.5 font-semibold text-white">{p.passenger?.name}</td>
                  <td className="p-3.5 font-mono text-emerald-400 font-bold">₹{p.amount.toFixed(2)}</td>
                  <td className="p-3.5 font-mono text-slate-400">{p.gateway}</td>
                  <td className="p-3.5 font-mono text-slate-300">{p.razorpayPaymentId || 'N/A'}</td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                      {p.status}
                    </span>
                  </td>
                  <td className="p-3.5 font-mono text-slate-400 text-[11px]">
                    {new Date(p.createdAt).toLocaleString()}
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
