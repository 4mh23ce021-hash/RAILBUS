import React, { useState } from 'react';
import { FileSpreadsheet, Download, CheckCircle2, ShieldCheck } from 'lucide-react';
import api from '../../services/api';

export default function Reports() {
  const [reportType, setReportType] = useState('bookings');
  const [generating, setGenerating] = useState(false);
  const [msg, setMsg] = useState('');

  const handleDownload = async () => {
    setGenerating(true);
    setMsg('');
    try {
      const res = await api.get(`/admin/reports?reportType=${reportType}`);
      if (res.data?.rows && res.data.rows.length > 0) {
        const rows = res.data.rows;
        const headers = Object.keys(rows[0]);
        const csvContent = [
          headers.join(','),
          ...rows.map(row => headers.map(h => `"${String(row[h] || '').replace(/"/g, '""')}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `RAILBUS_${reportType.toUpperCase()}_REPORT_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setMsg(`Report generated and downloaded successfully.`);
      }
    } catch (err) {
      console.error('Failed to generate report:', err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="pb-4 border-b border-slate-800">
        <h1 className="text-xl font-bold text-white flex items-center space-x-2">
          <FileSpreadsheet className="w-5 h-5 text-cyan-400" />
          <span>Operational Data Export & Reports</span>
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Generate sanitized CSV reports for administrative review, fleet utilization, and accounting.
        </p>
      </div>

      {msg && (
        <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      <div className="bg-[#0e1526] rounded-2xl border border-slate-800 p-6 space-y-5 shadow-xl">
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-300">Select Report Type</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setReportType('bookings')}
              className={`p-4 rounded-xl border text-left transition-all ${
                reportType === 'bookings'
                  ? 'bg-cyan-500/10 border-cyan-400 text-cyan-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              <h4 className="font-bold text-sm text-white">Passenger Bookings</h4>
              <p className="text-[11px] text-slate-400 mt-1">Full reservation records, fares, and dates</p>
            </button>

            <button
              type="button"
              onClick={() => setReportType('pools')}
              className={`p-4 rounded-xl border text-left transition-all ${
                reportType === 'pools'
                  ? 'bg-cyan-500/10 border-cyan-400 text-cyan-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              <h4 className="font-bold text-sm text-white">Passenger Pools</h4>
              <p className="text-[11px] text-slate-400 mt-1">Pool capacities, vehicle dispatches & statuses</p>
            </button>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 space-y-1">
          <div className="flex items-center space-x-1.5 text-slate-300 font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Data Privacy Policy</span>
          </div>
          <p className="text-[11px]">
            Passenger mobile contacts are masked (***XXXX) according to platform compliance guidelines.
          </p>
        </div>

        <button
          onClick={handleDownload}
          disabled={generating}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span>{generating ? 'Compiling CSV Dataset...' : 'Download CSV Report'}</span>
        </button>
      </div>
    </div>
  );
}
