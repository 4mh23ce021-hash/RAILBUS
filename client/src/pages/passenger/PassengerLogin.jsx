import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Train, Lock, Mail, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import { usePassengerAuth } from '../../context/PassengerAuthContext';

export default function PassengerLogin() {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(
    searchParams.get('expired') ? 'Session expired. Please log in again.' : ''
  );
  const [loading, setLoading] = useState(false);
  const { login } = usePassengerAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/passenger/home');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid passenger credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoPassenger = () => {
    setEmail('passenger@railbus.demo');
    setPassword('Passenger@2026');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-transit-bus">
      <div className="max-w-md w-full bg-[#0e1526]/95 rounded-3xl border-2 border-[#FE8505]/40 p-6 sm:p-8 shadow-2xl relative backdrop-blur-xl">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FE8505] to-[#E52E01] flex items-center justify-center text-[#080c14] mx-auto shadow-lg shadow-[#FE8505]/20">
            <Train className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-[#FFFDE1] tracking-tight">Passenger Sign In</h2>
          <p className="text-xs text-[#FFFDE1]/70">
            Enter your credentials to access Mysuru Junction bus pooling
          </p>
        </div>

        {error && (
          <div className="mt-4 p-3.5 rounded-2xl bg-[#E52E01]/20 border border-[#E52E01]/40 text-[#FFFDE1] text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-[#E52E01] flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="mt-5 p-3.5 rounded-2xl bg-[#080c14] border border-[#3b1d11] text-xs flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="font-bold text-[#FE8505] flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Demo Passenger Login</span>
            </span>
            <p className="text-[11px] text-[#FFFDE1]/80">passenger@railbus.demo</p>
          </div>
          <button
            type="button"
            onClick={fillDemoPassenger}
            className="text-[11px] font-bold text-[#FE8505] hover:underline"
          >
            Auto Fill
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#FFFDE1] mb-1.5">Registered Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="passenger@railbus.demo"
                className="w-full bg-[#080c14] border border-[#3b1d11] rounded-2xl pl-10 pr-4 py-2.5 text-xs text-[#FFFDE1] focus:outline-none focus:border-[#FE8505]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#FFFDE1] mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#080c14] border border-[#3b1d11] rounded-2xl pl-10 pr-4 py-2.5 text-xs text-[#FFFDE1] focus:outline-none focus:border-[#FE8505]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#FE8505] to-[#E52E01] hover:from-[#ff9c2b] hover:to-[#ff4d24] text-[#080c14] hover:text-white font-black text-xs shadow-xl shadow-[#FE8505]/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In as Passenger'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-[#3b1d11] text-center text-xs text-[#FFFDE1]/70">
          <span>New commuter? </span>
          <Link to="/passenger/register" className="text-[#FE8505] font-bold hover:underline">
            Register Passenger Account
          </Link>
        </div>
      </div>
    </div>
  );
}
