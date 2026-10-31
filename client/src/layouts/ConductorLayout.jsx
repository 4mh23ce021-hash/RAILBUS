import React from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { QrCode, KeyRound, Users, History, Bus, LogOut, ShieldCheck } from 'lucide-react';
import { useConductorAuth } from '../context/ConductorAuthContext';

export default function ConductorLayout() {
  const { conductor, logout } = useConductorAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/conductor/login');
  };

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col font-sans pb-16 md:pb-0">
      {/* Top Header */}
      <header className="bg-[#0e1526] border-b border-slate-800 px-4 py-3 sticky top-0 z-30 shadow-md">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Bus className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-bold text-sm text-white">CONDUCTOR VALIDATOR</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono">
                  ACTIVE
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {conductor?.name || 'Suresh B. Gowda'} • ID: {conductor?.conductorProfile?.employeeId || 'KSRTC-MYS-8821'}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="p-2 rounded-lg bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-transparent hover:border-rose-500/30 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 max-w-2xl w-full mx-auto p-4">
        <Outlet />
      </main>

      {/* Bottom Conductor Navigation Bar */}
      <nav className="fixed bottom-0 inset-x-0 z-40 bg-[#0e1526]/95 backdrop-blur-md border-t border-slate-800 py-2 px-4 shadow-xl">
        <div className="max-w-md mx-auto flex items-center justify-around">
          <NavLink
            to="/conductor/dashboard"
            end
            className={({ isActive }) =>
              `flex flex-col items-center space-y-1 ${
                isActive ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
              }`
            }
          >
            <Bus className="w-5 h-5" />
            <span className="text-[10px] font-medium">Dashboard</span>
          </NavLink>

          <NavLink
            to="/conductor/scanner"
            className={({ isActive }) =>
              `flex flex-col items-center space-y-1 ${
                isActive ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
              }`
            }
          >
            <QrCode className="w-5 h-5" />
            <span className="text-[10px] font-medium">QR Scanner</span>
          </NavLink>

          <NavLink
            to="/conductor/manual"
            className={({ isActive }) =>
              `flex flex-col items-center space-y-1 ${
                isActive ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
              }`
            }
          >
            <KeyRound className="w-5 h-5" />
            <span className="text-[10px] font-medium">6-Digit Code</span>
          </NavLink>

          <NavLink
            to="/conductor/manifest"
            className={({ isActive }) =>
              `flex flex-col items-center space-y-1 ${
                isActive ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
              }`
            }
          >
            <Users className="w-5 h-5" />
            <span className="text-[10px] font-medium">Manifest</span>
          </NavLink>
        </div>
      </nav>
    </div>
  );
}
