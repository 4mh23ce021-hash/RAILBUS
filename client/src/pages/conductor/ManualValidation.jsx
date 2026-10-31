import React, { useState } from 'react';
import { KeyRound, CheckCircle2, AlertTriangle, Sparkles, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

export default function ManualValidation() {
  const [code, setCode] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleValidate = async (codeToTest) => {
    const finalCode = codeToTest || code;
    if (!finalCode || String(finalCode).length !== 6) {
      setError('Please enter a valid 6-digit verification code.');
      return;
    }

    setLoading(true);
    setResult(null);
    setError('');

    try {
      const res = await api.post('/conductor/validate-manual', { sixDigitCode: finalCode });
      if (res.data?.success) {
        setResult(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Manual code validation failed.');
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

  const handleQuickFillSeeded = () => {
    setCode('749215');
    handleValidate('749215');
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <Link to="/conductor/dashboard" className="text-xs text-slate-400 hover:text-white flex items-center space-x-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </Link>
        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
          MANUAL CODE TERMINAL
        </span>
      </div>

      <div className="text-center space-y-1">
        <h1 className="text-xl font-bold text-white flex items-center justify-center space-x-2">
          <KeyRound className="w-5 h-5 text-emerald-400" />
          <span>6-Digit Manual Ticket Validation</span>
        </h1>
        <p className="text-xs text-slate-400">
          Ask passenger for their 6-digit confirmation code shown on their digital ticket.
        </p>
      </div>

      {/* Code Input Display */}
      <div className="bg-[#0e1526] rounded-2xl border border-slate-800 p-6 space-y-4 shadow-xl">
        <div>
          <label className="block text-center text-xs font-semibold text-slate-400 mb-2">
            ENTER 6-DIGIT VERIFICATION CODE
          </label>
          <input
            type="text"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            placeholder="749215"
            className="w-full text-center text-3xl font-black font-mono tracking-widest bg-[#080c14] border-2 border-emerald-500/40 rounded-2xl py-3 text-white focus:outline-none focus:border-emerald-400"
          />
        </div>

        <button
          onClick={() => handleValidate()}
          disabled={loading || code.length !== 6}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-sm shadow-lg shadow-emerald-500/25 transition-all disabled:opacity-50"
        >
          {loading ? 'Verifying...' : 'Validate Code & Mark Boarded'}
        </button>

        {/* Demo Code Quick Test */}
        <button
          type="button"
          onClick={handleQuickFillSeeded}
          className="w-full py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-emerald-300 border border-emerald-500/30 text-xs font-medium flex items-center justify-center space-x-1.5 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>Quick Test Seeded Code: 749215</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Validation Result */}
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
                <span className="text-white">BOARDING VERIFIED & APPROVED!</span>
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
            </div>
          )}
        </div>
      )}
    </div>
  );
}
