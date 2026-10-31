import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Train, User, Mail, Phone, Lock, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { usePassengerAuth } from '../../context/PassengerAuthContext';

export default function PassengerRegister() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = usePassengerAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password
      });
      navigate('/passenger/home');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please check your information.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-transit-bus">
      <div className="max-w-md w-full bg-[#0e1526]/95 rounded-3xl border-2 border-[#FE8505]/40 p-6 sm:p-8 shadow-2xl relative backdrop-blur-xl">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FE8505] to-[#E52E01] flex items-center justify-center text-[#080c14] mx-auto shadow-lg shadow-[#FE8505]/20">
            <Train className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-[#FFFDE1] tracking-tight">Create Passenger Account</h2>
          <p className="text-xs text-[#FFFDE1]/70">
            Register for seamless train-to-bus synchronization in Mysuru
          </p>
        </div>

        {error && (
          <div className="mt-4 p-3.5 rounded-2xl bg-[#E52E01]/20 border border-[#E52E01]/40 text-[#FFFDE1] text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-[#E52E01] flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-[#FFFDE1] mb-1.5">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Ramesh Gowda"
                className="w-full bg-[#080c14] border border-[#3b1d11] rounded-2xl pl-10 pr-4 py-2.5 text-xs text-[#FFFDE1] focus:outline-none focus:border-[#FE8505]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#FFFDE1] mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="ramesh@example.com"
                className="w-full bg-[#080c14] border border-[#3b1d11] rounded-2xl pl-10 pr-4 py-2.5 text-xs text-[#FFFDE1] focus:outline-none focus:border-[#FE8505]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#FFFDE1] mb-1.5">Mobile Phone (10 Digits)</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="tel"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                placeholder="9876543210"
                className="w-full bg-[#080c14] border border-[#3b1d11] rounded-2xl pl-10 pr-4 py-2.5 text-xs text-[#FFFDE1] focus:outline-none focus:border-[#FE8505] font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#FFFDE1] mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••••••"
                className="w-full bg-[#080c14] border border-[#3b1d11] rounded-2xl pl-10 pr-4 py-2.5 text-xs text-[#FFFDE1] focus:outline-none focus:border-[#FE8505]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#FFFDE1] mb-1.5">Confirm Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                name="confirmPassword"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••••••"
                className="w-full bg-[#080c14] border border-[#3b1d11] rounded-2xl pl-10 pr-4 py-2.5 text-xs text-[#FFFDE1] focus:outline-none focus:border-[#FE8505]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#FE8505] to-[#E52E01] hover:from-[#ff9c2b] hover:to-[#ff4d24] text-[#080c14] hover:text-white font-black text-xs shadow-xl shadow-[#FE8505]/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 mt-2"
          >
            <span>{loading ? 'Creating Account...' : 'Complete Passenger Registration'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-[#3b1d11] text-center text-xs text-[#FFFDE1]/70">
          <span>Already have an account? </span>
          <Link to="/passenger/login" className="text-[#FE8505] font-bold hover:underline">
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
}
