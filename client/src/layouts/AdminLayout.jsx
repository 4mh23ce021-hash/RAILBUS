import React, { useState } from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Train,
  Radio,
  BookOpen,
  Layers,
  MapPin,
  GitBranch,
  Bus,
  UserCog,
  Send,
  CreditCard,
  QrCode,
  BarChart3,
  FileSpreadsheet,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield,
  Activity,
  Bell,
  Flame,
  Info
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { useSocket } from '../context/SocketContext';
import Canvas3DBackground from '../components/3d/Canvas3DBackground';

export default function AdminLayout() {
  const { admin, logout } = useAdminAuth();
  const { isConnected } = useSocket();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navItems = [
    { label: 'Overview', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Live Train Monitoring', path: '/admin/train-monitoring', icon: Radio, highlight: true },
    { label: 'Passenger Pools', path: '/admin/pools', icon: Layers, highlight: true },
    { label: 'Dispatch Control', path: '/admin/dispatch', icon: Send, highlight: true },
    { label: 'Demand Analytics', path: '/admin/analytics', icon: BarChart3 },
    { label: 'Mysuru Heatmap', path: '/heatmap', icon: Flame, external: true },
    { label: 'About Us (Video Demo)', path: '/about', icon: Info, external: true },
    { label: 'User Directory', path: '/admin/users', icon: Users },
    { label: 'Passenger Records', path: '/admin/passengers', icon: UserCheck },
    { label: 'Train Fleet & Timetable', path: '/admin/trains', icon: Train },
    { label: 'Booking Records', path: '/admin/bookings', icon: BookOpen },
    { label: 'City Destinations', path: '/admin/destinations', icon: MapPin },
    { label: 'Transit Routes', path: '/admin/routes', icon: GitBranch },
    { label: 'KSRTC Vehicle Fleet', path: '/admin/vehicles', icon: Bus },
    { label: 'Driver Operations', path: '/admin/drivers', icon: UserCog },
    { label: 'Payment Ledger', path: '/admin/payments', icon: CreditCard },
    { label: 'Ticket Validation Audit', path: '/admin/tickets', icon: QrCode },
    { label: 'Operational Reports', path: '/admin/reports', icon: FileSpreadsheet },
    { label: 'Control Settings', path: '/admin/settings', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-[#080c14] text-[#FFFDE1] flex font-sans antialiased overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`bg-[#0b101d] border-r border-[#3b1d11] flex flex-col transition-all duration-300 z-30 ${
          sidebarCollapsed ? 'w-20' : 'w-72'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 border-b border-[#3b1d11] px-4 flex items-center justify-between">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FE8505] to-[#E52E01] flex-shrink-0 flex items-center justify-center shadow-lg shadow-[#FE8505]/20">
              <Activity className="w-5 h-5 text-[#080c14] animate-pulse" />
            </div>
            {!sidebarCollapsed && (
              <div className="leading-tight">
                <span className="font-black text-base tracking-wider text-[#FFFDE1]">
                  COMMAND CENTER
                </span>
                <p className="text-[10px] text-[#FE8505] tracking-widest font-mono font-bold">
                  MYSURU MOBILITY
                </p>
              </div>
            )}
          </div>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1.5 rounded-lg bg-[#0e1526] hover:bg-[#162038] text-slate-400 hover:text-white transition-colors"
          >
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Live Network Status Indicator */}
        <div className="px-4 py-2.5 bg-[#080c14] border-b border-[#3b1d11] flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <span className="relative flex h-2 w-2">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full ${
                  isConnected ? 'bg-emerald-400' : 'bg-[#FE8505]'
                } opacity-75`}
              />
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  isConnected ? 'bg-emerald-500' : 'bg-[#FE8505]'
                }`}
              />
            </span>
            {!sidebarCollapsed && (
              <span className="font-mono text-[11px] text-slate-300 font-bold">
                {isConnected ? 'LIVE TELEMETRY' : 'CONNECTING...'}
              </span>
            )}
          </div>
          {!sidebarCollapsed && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#FE8505]/15 text-[#FE8505] border border-[#FE8505]/30 font-mono font-bold">
              v2.8
            </span>
          )}
        </div>

        {/* Navigation List */}
        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            if (item.external) {
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-semibold text-[#FFFDE1]/80 hover:bg-[#162038] hover:text-[#FE8505] transition-all ${
                    sidebarCollapsed ? 'justify-center px-0' : ''
                  }`}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <Icon className="w-4 h-4 text-[#FE8505] flex-shrink-0" />
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </Link>
              );
            }
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-[#FE8505]/20 to-[#E52E01]/10 text-[#FE8505] border border-[#FE8505]/30 shadow-sm font-bold'
                      : 'text-[#FFFDE1]/70 hover:bg-[#162038] hover:text-[#FFFDE1]'
                  } ${sidebarCollapsed ? 'justify-center px-0' : ''}`
                }
                title={sidebarCollapsed ? item.label : undefined}
              >
                <Icon
                  className={`w-4 h-4 flex-shrink-0 ${
                    item.highlight ? 'text-[#FE8505]' : ''
                  }`}
                />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* Admin Footer & Logout */}
        <div className="p-3 border-t border-[#3b1d11] bg-[#080c14]">
          {!sidebarCollapsed ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-[#0e1526] border border-[#FE8505]/40 flex items-center justify-center text-[#FE8505] font-bold text-xs">
                  {admin?.name ? admin.name.charAt(0) : 'A'}
                </div>
                <div className="overflow-hidden leading-tight">
                  <p className="text-xs font-bold text-[#FFFDE1] truncate">
                    {admin?.name || 'Operations Controller'}
                  </p>
                  <p className="text-[10px] text-[#FE8505] font-mono font-bold">
                    SUPER_ADMIN
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg bg-[#0e1526] hover:bg-[#E52E01]/20 text-slate-400 hover:text-[#E52E01] transition-colors"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center p-2 rounded-lg bg-[#0e1526] hover:bg-[#E52E01]/20 text-slate-400 hover:text-[#E52E01] transition-colors"
              title="Log Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </aside>

      {/* Main Administrative Screen Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-[#0e1526] border-b border-[#3b1d11] px-6 flex items-center justify-between z-20">
          <div className="flex items-center space-x-3">
            <span className="text-xs font-mono text-[#FE8505] bg-[#FE8505]/10 px-2.5 py-1 rounded border border-[#FE8505]/30 font-bold">
              KSRTC & SWR COMMAND NETWORK
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              to="/about"
              className="text-xs font-bold text-[#FE8505] hover:underline hidden sm:inline"
            >
              About System & Demo
            </Link>
            <Link
              to="/heatmap"
              className="text-xs font-bold text-[#FE8505] hover:underline hidden sm:inline"
            >
              Mysuru Heatmap
            </Link>
            <Link
              to="/"
              className="text-xs text-slate-400 hover:text-white"
            >
              Public Site →
            </Link>
          </div>
        </header>

        {/* Dynamic Route Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-[#080c14] relative">
          <Canvas3DBackground intensity="subtle" />
          <div className="relative z-10">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
