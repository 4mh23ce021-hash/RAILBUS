import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Bus, Lock, Mail, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import { useConductorAuth } from '../../context/ConductorAuthContext';

export default function ConductorLogin() {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(searchParams.get('expired') ? 'Conductor shift session expired. Please re-authenticate.' : '');
  const [loading, setLoading] = useState(false);
  const { login } = useConductorAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/conductor/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid conductor credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoConductor = () => {
    setEmail('conductor@railbus.demo');
    setPassword('Conductor@2026');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full bg-[#0e1526] rounded-2xl border border-slate-800 p-6 sm:p-8 shadow-2xl relative">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-emerald-500/20">
            <Bus className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Conductor Boarding Terminal</h2>
          <p className="text-xs text-slate-400">
            KSRTC City Connector digital ticket validation & manifest portal
          </p>
        </div>

        {error && (
          <div className="mt-6 p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Conductor Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="conductor@railbus.demo"
                className="w-full bg-[#080c14] border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-400 transition-all font-mono text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Shift Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#080c14] border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-400 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In as Conductor'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-4 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={fillDemoConductor}
            className="w-full py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-emerald-300 border border-emerald-500/30 text-xs font-medium flex items-center justify-center space-x-1.5 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Fill Demo Conductor (Suresh Gowda)</span>
          </button>
        </div>

        <div className="mt-6 text-center text-xs text-slate-400">
          <Link to="/" className="hover:text-emerald-300 transition-colors">
            ← Return to Platform Home
          </Link>
        </div>
      </div>
    </div>
  );
}
