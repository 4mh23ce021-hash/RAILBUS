import React, { useState } from 'react';
import { QrCode, CheckCircle2, AlertTriangle, Sparkles, RefreshCw, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

export default function QRScanner() {
  const [tokenInput, setTokenInput] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleValidate = async (tokenToTest) => {
    const token = tokenToTest || tokenInput;
    if (!token) return;

    setLoading(true);
    setResult(null);
    setError('');

    try {
      const res = await api.post('/conductor/validate-qr', { qrToken: token });
      if (res.data?.success) {
        setResult(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'QR validation failed.');
      if (err.response?.data?.status === 'DUPLICATE') {
        setResult({
          status: 'DUPLICATE',
          message: err.response.data.message,
          ticket: err.response.data.ticket
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const testSeededToken = () => {
    setTokenInput('QR_RAILBUS_MYS_8801_SECURE');
    handleValidate('QR_RAILBUS_MYS_8801_SECURE');
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <Link to="/conductor/dashboard" className="text-xs text-slate-400 hover:text-white flex items-center space-x-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </Link>
        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
          SCANNER ACTIVE
        </span>
      </div>

      <div className="text-center space-y-1">
        <h1 className="text-xl font-bold text-white flex items-center justify-center space-x-2">
          <QrCode className="w-5 h-5 text-emerald-400" />
          <span>Digital Ticket QR Scanner</span>
        </h1>
        <p className="text-xs text-slate-400">
          Point device at passenger ticket or paste/enter the QR token.
        </p>
      </div>

      {/* Camera Viewfinder View */}
      <div className="relative rounded-3xl overflow-hidden bg-black border-2 border-emerald-500/50 shadow-2xl p-8 flex flex-col items-center justify-center min-h-[260px]">
        {/* Animated Scanning Line */}
        <div className="absolute inset-x-8 top-12 bottom-12 border-2 border-dashed border-emerald-500/40 rounded-2xl pointer-events-none flex items-center justify-center">
          <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-lg shadow-emerald-400/50 animate-pulse"></div>
        </div>

        <QrCode className="w-20 h-20 text-slate-700 animate-pulse" />
        <span className="text-xs font-mono text-emerald-400 mt-4 tracking-wider">
          AIM VIEWFINDER AT TICKET QR
        </span>
      </div>

      {/* Quick Test Demo Token Pill */}
      <div className="bg-[#0e1526] p-4 rounded-xl border border-slate-800 space-y-2">
        <span className="text-[11px] font-semibold text-slate-300 block">Evaluation Quick Scanner</span>
        <button
          type="button"
          onClick={testSeededToken}
          className="w-full py-2 px-3 rounded-lg bg-emerald-950/40 hover:bg-emerald-950/70 text-emerald-300 border border-emerald-500/30 text-xs font-medium flex items-center justify-center space-x-2 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>Scan Seeded Passenger Ticket (Ananya Rao)</span>
        </button>
      </div>

      {/* Manual Token Fallback */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-slate-400">Manual QR Token Entry</label>
        <div className="flex space-x-2">
          <input
            type="text"
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            placeholder="e.g. QR_RAILBUS_MYS_8801_SECURE"
            className="flex-1 bg-[#080c14] border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-emerald-400"
          />
          <button
            onClick={() => handleValidate()}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Validate'}
          </button>
        </div>
      </div>

      {/* Scan Results Display */}
      {result && (
        <div
          className={`p-5 rounded-2xl border text-xs space-y-3 shadow-xl ${
            result.status === 'SUCCESS'
              ? 'bg-emerald-950/50 border-emerald-500 text-emerald-200'
              : 'bg-rose-950/50 border-rose-500 text-rose-200'
          }`}
        >
          <div className="flex items-center space-x-2 font-bold text-sm">
            {result.status === 'SUCCESS' ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span className="text-white">BOARDING VALIDATED SUCCESSFULLY!</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-5 h-5 text-rose-400" />
                <span className="text-white">VALIDATION REJECTED: {result.status}</span>
              </>
            )}
          </div>

          <p className="text-xs leading-relaxed">{result.message}</p>

          {result.ticket && (
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 space-y-1 font-mono text-[11px]">
              <div>Passenger: <span className="text-white font-bold">{result.ticket.passenger?.name || 'Verified Passenger'}</span></div>
              <div>Ticket: <span className="text-cyan-300 font-bold">{result.ticket.ticketCode}</span></div>
              <div>Destination: <span className="text-emerald-300">{result.ticket.booking?.destination?.name}</span></div>
              <div>6-Digit Code: <span className="text-white font-bold">{result.ticket.sixDigitCode}</span></div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
