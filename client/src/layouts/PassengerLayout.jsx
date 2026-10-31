import React from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import {
  Home,
  Compass,
  Ticket,
  Bell,
  User,
  Train,
  LogOut,
  Radio,
  Flame,
  Info,
  ShieldAlert
} from 'lucide-react';
import { usePassengerAuth } from '../context/PassengerAuthContext';
import NotificationCenter from '../components/NotificationCenter';

export default function PassengerLayout() {
  const { passenger, logout } = usePassengerAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/passenger/login');
  };

  return (
    <div className="min-h-screen bg-[#080c14] text-[#FFFDE1] flex flex-col font-sans pb-20 md:pb-0 antialiased">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-[#0e1526]/95 backdrop-blur-md border-b border-[#3b1d11] px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/passenger/home" className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#FE8505] to-[#E52E01] flex items-center justify-center shadow-md shadow-[#FE8505]/20">
              <Train className="w-4 h-4 text-[#080c14]" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-black text-base tracking-wide text-[#FFFDE1]">
                  RAILBUS
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#FE8505]/15 text-[#FE8505] border border-[#FE8505]/30 font-mono font-bold">
                  MYSURU
                </span>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-6 text-xs font-bold text-[#FFFDE1]/80">
            <NavLink
              to="/passenger/home"
              className={({ isActive }) =>
                `hover:text-[#FE8505] transition-colors flex items-center space-x-1.5 ${
                  isActive ? 'text-[#FE8505]' : ''
                }`
              }
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </NavLink>

            <NavLink
              to="/passenger/trains"
              className={({ isActive }) =>
                `hover:text-[#FE8505] transition-colors flex items-center space-x-1.5 ${
                  isActive ? 'text-[#FE8505]' : ''
                }`
              }
            >
              <Compass className="w-4 h-4" />
              <span>Book Shuttle</span>
            </NavLink>

            <NavLink
              to="/passenger/live-tracking"
              className={({ isActive }) =>
                `hover:text-[#FE8505] transition-colors flex items-center space-x-1.5 ${
                  isActive ? 'text-[#FE8505]' : ''
                }`
              }
            >
              <Radio className="w-4 h-4 text-[#FE8505]" />
              <span>Live Tracking</span>
            </NavLink>

            <NavLink
              to="/passenger/heatmap"
              className={({ isActive }) =>
                `hover:text-[#FE8505] transition-colors flex items-center space-x-1.5 ${
                  isActive ? 'text-[#FE8505]' : ''
                }`
              }
            >
              <Flame className="w-4 h-4 text-[#E52E01]" />
              <span>Heatmap</span>
            </NavLink>

            <NavLink
              to="/passenger/about"
              className={({ isActive }) =>
                `hover:text-[#FE8505] transition-colors flex items-center space-x-1.5 ${
                  isActive ? 'text-[#FE8505]' : ''
                }`
              }
            >
              <Info className="w-4 h-4" />
              <span>About Us (Demo)</span>
            </NavLink>

            <NavLink
              to="/passenger/trips"
              className={({ isActive }) =>
                `hover:text-[#FE8505] transition-colors flex items-center space-x-1.5 ${
                  isActive ? 'text-[#FE8505]' : ''
                }`
              }
            >
              <Ticket className="w-4 h-4" />
              <span>My Trips</span>
            </NavLink>
          </nav>

          <div className="flex items-center space-x-3">
            {/* Interactive Notification Center Component (Requirement 3) */}
            <NotificationCenter />

            <Link
              to="/passenger/profile"
              className="p-2 rounded-xl bg-[#080c14] hover:bg-[#162038] text-[#FFFDE1]/80 hover:text-[#FE8505] border border-[#3b1d11] transition-colors hidden sm:flex"
              title="Passenger Profile"
            >
              <User className="w-4 h-4" />
            </Link>

            <button
              onClick={handleLogout}
              className="p-2 rounded-xl bg-[#080c14] hover:bg-[#E52E01]/20 text-slate-400 hover:text-[#E52E01] border border-[#3b1d11] hover:border-[#E52E01]/40 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Passenger Workspace Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6">
        <Outlet />
      </main>

      {/* Dedicated Passenger Bottom Navigation Bar (Mobile First) */}
      <nav className="fixed bottom-0 inset-x-0 z-40 bg-[#0e1526]/95 backdrop-blur-lg border-t border-[#3b1d11] py-2 px-4 shadow-2xl md:hidden">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <NavLink
            to="/passenger/home"
            className={({ isActive }) =>
              `flex flex-col items-center space-y-1 transition-colors ${
                isActive ? 'text-[#FE8505]' : 'text-slate-400 hover:text-slate-200'
              }`
            }
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] font-medium tracking-tight">Home</span>
          </NavLink>

          <NavLink
            to="/passenger/live-tracking"
            className={({ isActive }) =>
              `flex flex-col items-center space-y-1 transition-colors ${
                isActive ? 'text-[#FE8505]' : 'text-slate-400 hover:text-slate-200'
              }`
            }
          >
            <Radio className="w-5 h-5" />
            <span className="text-[10px] font-medium tracking-tight">Live GPS</span>
          </NavLink>

          <NavLink
            to="/passenger/heatmap"
            className={({ isActive }) =>
              `flex flex-col items-center space-y-1 transition-colors ${
                isActive ? 'text-[#FE8505]' : 'text-slate-400 hover:text-slate-200'
              }`
            }
          >
            <Flame className="w-5 h-5 text-[#E52E01]" />
            <span className="text-[10px] font-medium tracking-tight">Heatmap</span>
          </NavLink>

          <NavLink
            to="/passenger/trips"
            className={({ isActive }) =>
              `flex flex-col items-center space-y-1 transition-colors ${
                isActive ? 'text-[#FE8505]' : 'text-slate-400 hover:text-slate-200'
              }`
            }
          >
            <Ticket className="w-5 h-5" />
            <span className="text-[10px] font-medium tracking-tight">My Trips</span>
          </NavLink>

          <NavLink
            to="/passenger/profile"
            className={({ isActive }) =>
              `flex flex-col items-center space-y-1 transition-colors ${
                isActive ? 'text-[#FE8505]' : 'text-slate-400 hover:text-slate-200'
              }`
            }
          >
            <User className="w-5 h-5" />
            <span className="text-[10px] font-medium tracking-tight">Profile</span>
          </NavLink>
        </div>
      </nav>
    </div>
  );
}
