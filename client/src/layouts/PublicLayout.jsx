import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Train, Bus, ShieldCheck, Compass, ArrowRight, Activity, Flame, Radio, Info } from 'lucide-react';
import Canvas3DBackground from '../components/3d/Canvas3DBackground';

export default function PublicLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-[#080c14] text-[#FFFDE1] font-sans antialiased relative">
      {/* 3D Spatial Canvas Background */}
      <Canvas3DBackground intensity="normal" />

      {/* Top Mobility Status Banner */}
      <div className="bg-gradient-to-r from-[#1c120c] via-[#080c14] to-[#1a0e0a] border-b border-[#3b1d11] px-4 py-1.5 text-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FE8505] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FE8505]"></span>
            </span>
            <span className="text-[#FFFDE1]/90 font-medium">Mysuru Junction (MYS) ↔ KSRTC City Interchange</span>
            <span className="hidden md:inline-block px-1.5 py-0.5 rounded text-[10px] bg-[#FE8505]/15 text-[#FE8505] border border-[#FE8505]/40 font-mono">
              SYNCHRONIZATION ACTIVE
            </span>
          </div>
          <div className="flex items-center space-x-4 text-[#FFFDE1]/70">
            <span className="text-[11px] hidden sm:inline">Platform 1 & 2 Sync: Online</span>
            <Link
              to="/conductor/login"
              className="text-[11px] text-[#FFFDE1]/70 hover:text-[#FE8505] transition-colors flex items-center space-x-1"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#FE8505]" />
              <span>Conductor Portal</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Public Navigation */}
      <header className="sticky top-0 z-40 bg-[#080c14]/95 backdrop-blur-md border-b border-[#3b1d11]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FE8505] to-[#E52E01] flex items-center justify-center shadow-lg shadow-[#FE8505]/30 group-hover:scale-105 transition-all">
              <Train className="w-5 h-5 text-[#080c14]" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-xl font-black tracking-wider text-[#FFFDE1]">
                  RAILBUS
                </span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono tracking-widest bg-[#FE8505]/15 text-[#FE8505] border border-[#FE8505]/30 font-bold">
                  MYSURU
                </span>
              </div>
              <p className="text-[10px] text-[#FE8505] tracking-wide font-medium">
                INTELLIGENT MOBILITY NETWORK
              </p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-6 text-xs font-semibold text-[#FFFDE1]/80">
            <Link
              to="/about"
              className={`hover:text-[#FE8505] transition-colors flex items-center space-x-1.5 ${
                location.pathname === '/about' ? 'text-[#FE8505]' : ''
              }`}
            >
              <Info className="w-3.5 h-3.5" />
              <span>About Us (Video Demo)</span>
            </Link>

            <Link
              to="/heatmap"
              className={`hover:text-[#FE8505] transition-colors flex items-center space-x-1.5 ${
                location.pathname === '/heatmap' ? 'text-[#FE8505]' : ''
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-[#E52E01]" />
              <span>Mysuru Heatmap</span>
            </Link>

            <Link
              to="/live-tracking"
              className={`hover:text-[#FE8505] transition-colors flex items-center space-x-1.5 ${
                location.pathname === '/live-tracking' ? 'text-[#FE8505]' : ''
              }`}
            >
              <Radio className="w-3.5 h-3.5 text-[#FE8505]" />
              <span>Live Tracking</span>
            </Link>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center space-x-3">
            {/* Primary Passenger CTA */}
            <Link
              to="/passenger/login"
              className="px-4 py-2 text-xs sm:text-sm font-extrabold rounded-xl bg-gradient-to-r from-[#FE8505] to-[#E52E01] hover:from-[#ff9c2b] hover:to-[#ff4d24] text-[#080c14] hover:text-white shadow-lg shadow-[#FE8505]/25 transition-all flex items-center space-x-2"
            >
              <span>CONTINUE AS PASSENGER</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            {/* Separate Admin Control Centre CTA */}
            <Link
              to="/admin/login"
              className="px-3.5 py-2 text-xs sm:text-sm font-bold rounded-xl bg-[#0e1526] hover:bg-[#162038] text-[#FE8505] border border-[#FE8505]/30 hover:border-[#FE8505] transition-all flex items-center space-x-1.5 shadow-sm"
              title="Dedicated Administrative Operations Gateway"
            >
              <Activity className="w-4 h-4 text-[#FE8505]" />
              <span className="hidden sm:inline">ADMIN CONTROL CENTRE</span>
              <span className="sm:hidden">ADMIN</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Page Content */}
      <main className="flex-1 relative z-10">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-[#3b1d11] bg-[#06090f]/90 backdrop-blur-md py-10 text-xs text-[#FFFDE1]/70 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-[#FE8505]/20 flex items-center justify-center text-[#FE8505]">
                <Train className="w-4 h-4" />
              </div>
              <span className="font-bold text-[#FFFDE1] text-sm">RAILBUS MYSURU</span>
            </div>
            <p className="text-[#FFFDE1]/70 leading-relaxed">
              "Your Train Arrives. Your City Connects." Synchronizing arriving rail passengers with dedicated KSRTC city transit networks through intelligent pooling.
            </p>
          </div>

          <div>
            <span className="font-bold text-[#FFFDE1] text-sm block mb-3">Transit Links</span>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="hover:text-[#FE8505] transition-colors">
                  About Us & Multi-Train Video Demo
                </Link>
              </li>
              <li>
                <Link to="/heatmap" className="hover:text-[#FE8505] transition-colors">
                  Mysuru Popularity Heatmap
                </Link>
              </li>
              <li>
                <Link to="/live-tracking" className="hover:text-[#FE8505] transition-colors">
                  Live Train & Feeder Bus GPS
                </Link>
              </li>
              <li>
                <Link to="/passenger/trains" className="hover:text-[#FE8505] transition-colors">
                  Book Inbound Shuttle
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <span className="font-bold text-[#FFFDE1] text-sm block mb-3">Portal Access</span>
            <ul className="space-y-2">
              <li>
                <Link to="/passenger/login" className="hover:text-[#FE8505] transition-colors">
                  Passenger Travel Portal
                </Link>
              </li>
              <li>
                <Link to="/admin/login" className="hover:text-[#FE8505] transition-colors">
                  Admin Command Centre
                </Link>
              </li>
              <li>
                <Link to="/conductor/login" className="hover:text-[#FE8505] transition-colors">
                  KSRTC Conductor Validation
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <span className="font-bold text-[#FFFDE1] text-sm block mb-3">Operations Portico</span>
            <p className="text-[#FFFDE1]/70">
              Mysuru Junction Railway Station (MYS), Main Portico Exit Bay 3 & Bay 4, Medar Block, Yadavagiri, Mysuru, Karnataka 570001
            </p>
            <p className="font-mono text-[#FE8505] text-[11px]">
              KSRTC Control: 0821-2411001
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
