import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Shield, Lock, Mail, ArrowRight, AlertCircle, Key, Activity, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';

export default function AdminLogin() {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(
    searchParams.get('expired') ? 'Admin session expired. Please re-authenticate.' : ''
  );
  const [loading, setLoading] = useState(false);
  const { login } = useAdminAuth();
  const navigate = useNavigate();

  const isDev = true; // Development demo mode

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      // Wait microtick to allow context update then replace history
      setTimeout(() => {
        navigate('/admin/dashboard', { replace: true });
      }, 50);
    } catch (err) {
      console.error('Admin login error:', err);
      setError(
        err.response?.data?.message ||
        err.message ||
        'Administrative credentials verification failed. Check email & password.'
      );
      setLoading(false);
    }
  };

  const fillDemoAdmin = () => {
    setEmail('admin@railbus.demo');
    setPassword('RailBus@Admin2026');
    setError('');
  };

  return (
    <div className="min-h-screen bg-[#080c14] flex items-center justify-center px-4 py-12 relative overflow-hidden bg-transit-station">
      {/* Background radial glow in Orange & Off Red */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-to-tr from-[#FE8505]/15 via-[#E52E01]/10 to-[#FE8505]/15 blur-[140px] rounded-full pointer-events-none" />

      <div className="max-w-md w-full bg-[#0e1526]/95 rounded-3xl border-2 border-[#FE8505]/40 p-8 shadow-2xl relative z-10 backdrop-blur-xl">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#FE8505] to-[#E52E01] flex items-center justify-center text-[#080c14] mx-auto shadow-lg shadow-[#FE8505]/30">
            <Activity className="w-7 h-7 text-[#080c14]" />
          </div>
          <span className="text-[10px] font-mono tracking-widest text-[#FE8505] bg-[#FE8505]/15 px-2.5 py-0.5 rounded border border-[#FE8505]/30 inline-block mt-2 font-bold">
            SECURE OPERATIONS TERMINAL
          </span>
          <h2 className="text-2xl font-black text-[#FFFDE1] tracking-wide">
            RAILBUS COMMAND CENTER
          </h2>
          <p className="text-xs text-[#FFFDE1]/70">
            Authorized KSRTC & Railway Synchronization Personnel Only
          </p>
        </div>

        {/* Development Demo Credentials Callout */}
        {isDev && (
          <div className="mt-6 p-4 rounded-2xl bg-[#080c14] border border-[#FE8505]/30 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#FE8505] flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#FE8505]" />
                <span>Default Demo Credentials</span>
              </span>
              <button
                type="button"
                onClick={fillDemoAdmin}
                className="text-[11px] font-bold text-[#FE8505] hover:text-[#ff9c2b] underline"
              >
                Auto Fill
              </button>
            </div>
            <div className="text-[11px] font-mono text-[#FFFDE1]/90 space-y-0.5">
              <div>Email: <span className="text-white font-bold">admin@railbus.demo</span></div>
              <div>Password: <span className="text-white font-bold">RailBus@Admin2026</span></div>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3.5 rounded-2xl bg-[#E52E01]/20 border border-[#E52E01]/50 text-[#FFFDE1] text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-[#E52E01] flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#FFFDE1] mb-1.5">
              Command Center Identity
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@railbus.demo"
                className="w-full bg-[#080c14] border border-[#3b1d11] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#FFFDE1] placeholder-slate-500 focus:outline-none focus:border-[#FE8505] transition-all font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#FFFDE1] mb-1.5">
              Authorization Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#080c14] border border-[#3b1d11] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#FFFDE1] placeholder-slate-500 focus:outline-none focus:border-[#FE8505] transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#FE8505] to-[#E52E01] hover:from-[#ff9c2b] hover:to-[#ff4d24] text-[#080c14] hover:text-white font-black text-sm shadow-xl shadow-[#FE8505]/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <span>{loading ? 'Verifying Authorization...' : 'Access Command Terminal'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-[#3b1d11] text-center">
          <Link to="/" className="text-xs text-[#FFFDE1]/70 hover:text-[#FE8505] transition-colors">
            ← Return to Public Portal
          </Link>
        </div>
      </div>
    </div>
  );
}
