import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, ShieldCheck, HeartHandshake, Save, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { usePassengerAuth } from '../../context/PassengerAuthContext';
import api from '../../services/api';

export default function PassengerProfile() {
  const { passenger } = usePassengerAuth();
  const [formData, setFormData] = useState({
    name: passenger?.name || '',
    phone: passenger?.phone || '',
    emergencyContact: passenger?.passengerProfile?.emergencyContact || '',
    preferredLanguage: passenger?.passengerProfile?.preferredLanguage || 'en'
  });
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (passenger) {
      setFormData({
        name: passenger.name || '',
        phone: passenger.phone || '',
        emergencyContact: passenger.passengerProfile?.emergencyContact || '',
        preferredLanguage: passenger.passengerProfile?.preferredLanguage || 'en'
      });
    }
  }, [passenger]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      const res = await api.put('/passenger/profile', formData);
      if (res.data?.success) {
        setSuccessMsg('Profile updated successfully.');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6 pb-12">
      <div>
        <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-[#FE8505]/15 border border-[#FE8505]/30 text-[#FE8505] text-[11px] font-mono font-bold mb-1">
          <Sparkles className="w-3.5 h-3.5 text-[#FE8505]" />
          <span>VERIFIED PASSENGER ACCOUNT</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-[#FFFDE1] flex items-center space-x-2">
          <User className="w-5 h-5 text-[#FE8505]" />
          <span>Passenger Profile</span>
        </h1>
        <p className="text-xs text-[#FFFDE1]/70 mt-1">
          Manage your personal commuter contact information and transit preferences.
        </p>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-2xl bg-[#E52E01]/20 border border-[#E52E01]/40 text-[#FFFDE1] text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-[#E52E01] flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-[#0e1526] rounded-3xl border border-[#3b1d11] p-6 space-y-4 shadow-xl">
        <div>
          <label className="block text-xs font-bold text-[#FFFDE1] mb-1.5">Full Name</label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-[#080c14] border border-[#3b1d11] rounded-2xl pl-10 pr-4 py-2.5 text-xs text-[#FFFDE1] focus:outline-none focus:border-[#FE8505]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#FFFDE1] mb-1.5">Registered Email (Read Only)</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="email"
              disabled
              value={passenger?.email || ''}
              className="w-full bg-[#080c14]/50 border border-[#3b1d11] rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-400 cursor-not-allowed font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#FFFDE1] mb-1.5">Mobile Phone Number</label>
          <div className="relative">
            <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+91 94481 00000"
              className="w-full bg-[#080c14] border border-[#3b1d11] rounded-2xl pl-10 pr-4 py-2.5 text-xs text-[#FFFDE1] focus:outline-none focus:border-[#FE8505] font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#FFFDE1] mb-1.5">Emergency Contact Number</label>
          <div className="relative">
            <HeartHandshake className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="tel"
              value={formData.emergencyContact}
              onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
              placeholder="+91 98450 00000"
              className="w-full bg-[#080c14] border border-[#3b1d11] rounded-2xl pl-10 pr-4 py-2.5 text-xs text-[#FFFDE1] focus:outline-none focus:border-[#FE8505] font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#FFFDE1] mb-1.5">Preferred Interface Language</label>
          <select
            value={formData.preferredLanguage}
            onChange={(e) => setFormData({ ...formData, preferredLanguage: e.target.value })}
            className="w-full bg-[#080c14] border border-[#3b1d11] rounded-2xl px-4 py-2.5 text-xs text-[#FFFDE1] focus:outline-none focus:border-[#FE8505]"
          >
            <option value="en">English (Default)</option>
            <option value="kn">ಕನ್ನಡ (Kannada)</option>
            <option value="hi">हिन्दी (Hindi)</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#FE8505] to-[#E52E01] hover:from-[#ff9c2b] hover:to-[#ff4d24] text-[#080c14] hover:text-white font-black text-xs shadow-xl shadow-[#FE8505]/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 mt-4"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
        </button>
      </form>
    </div>
  );
}
