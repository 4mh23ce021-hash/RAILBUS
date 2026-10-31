import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowRight, User, Terminal, Train, Bus, Sparkles } from 'lucide-react';

export default function AdminLoginChoice() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-transit-station">
      <div className="max-w-md w-full bg-[#0e1526]/95 rounded-3xl border-2 border-[#FE8505]/40 p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FE8505] to-[#E52E01] text-[#080c14] mx-auto flex items-center justify-center shadow-lg shadow-[#FE8505]/20">
            <Terminal className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-[#FFFDE1] tracking-wide">RAILBUS ACCESS SELECTION</h2>
          <p className="text-xs text-[#FFFDE1]/70 leading-relaxed">
            Role-isolated architecture: Select the authenticated terminal corresponding to your operational role.
          </p>
        </div>

        <div className="mt-8 space-y-4">
          <Link
            to="/passenger/login"
            className="w-full p-4 rounded-2xl bg-[#080c14] border border-[#3b1d11] hover:border-[#FE8505] transition-all flex items-center justify-between group shadow-lg"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#FE8505]/20 text-[#FE8505] flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-[#FFFDE1] text-sm group-hover:text-[#FE8505] transition-colors">
                  Passenger Application
                </h3>
                <p className="text-xs text-slate-400">Book bus pooling, tickets & tracking</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#FE8505] group-hover:translate-x-1 transition-all" />
          </Link>

          <Link
            to="/admin/login"
            className="w-full p-4 rounded-2xl bg-gradient-to-r from-[#080c14] to-[#1c120c] border border-[#FE8505]/40 hover:border-[#FE8505] transition-all flex items-center justify-between group shadow-xl"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#FE8505] text-[#080c14] flex items-center justify-center font-bold">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-[#FFFDE1] text-sm group-hover:text-[#FE8505] transition-colors">
                  Admin Command Center
                </h3>
                <p className="text-xs text-slate-400">Operations, fleet dispatch & analytics</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-[#FE8505] group-hover:translate-x-1 transition-all" />
          </Link>

          <Link
            to="/conductor/login"
            className="w-full p-4 rounded-2xl bg-[#080c14] border border-[#3b1d11] hover:border-emerald-500/50 transition-all flex items-center justify-between group shadow-lg"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Terminal className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-[#FFFDE1] text-sm group-hover:text-emerald-400 transition-colors">
                  Conductor Mobile Validator
                </h3>
                <p className="text-xs text-slate-400">On-bus ticket QR and PIN validation</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
          </Link>
        </div>
      </div>
    </div>
  );
}
