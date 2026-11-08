import React, { useState } from 'react';
import { Train, Bus, ShieldCheck, Sparkles, ArrowRight, Radio, Activity, Users, Clock } from 'lucide-react';
import TiltCard3D from './TiltCard3D';

/**
 * 3D Interactive Spatial Transit Hub Visualizer
 * Shows the live Mysuru Junction (MYS) ↔ KSRTC Bay 3 & 4 synchronization
 * with floating 3D depth, isometric perspective, and interactive tilt.
 */
export default function TransitHub3D() {
  const [activePlatform, setActivePlatform] = useState(1);

  return (
    <div className="w-full max-w-5xl mx-auto my-8 perspective-1000">
      <TiltCard3D
        maxTilt={8}
        scale={1.01}
        className="rounded-3xl border border-[#FE8505]/40 bg-gradient-to-b from-[#0e1526]/90 via-[#0a0f1d]/95 to-[#080c14] p-6 sm:p-10 shadow-[0_20px_50px_rgba(254,133,5,0.15)] backdrop-blur-xl relative overflow-hidden"
      >
        {/* Holographic Top Status Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-[#3b1d11] gap-4">
          <div className="flex items-center space-x-3">
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FE8505] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#FE8505]"></span>
            </div>
            <div>
              <span className="text-xs font-mono font-bold text-[#FE8505] tracking-widest uppercase">
                3D LIVE SPATIAL TOPOLOGY MATRIX
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-[#FFFDE1] tracking-wide">
                Mysuru Junction (MYS) ↔ KSRTC Feeder Node
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs font-mono">
            <span className="px-3 py-1 rounded-full bg-[#FE8505]/15 border border-[#FE8505]/40 text-[#FE8505] font-bold flex items-center space-x-1.5 shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>LIVE POOLING 20–56 PAX</span>
            </span>
          </div>
        </div>

        {/* 3D Isometric Mobility Diagram Canvas */}
        <div className="relative py-8 sm:py-12 flex flex-col md:flex-row items-center justify-between gap-8 z-10">
          {/* Node 1: Arriving Inbound Train (3D Pop-out Card) */}
          <div
            className="w-full md:w-72 p-5 rounded-2xl bg-[#162038]/90 border border-[#FE8505]/50 shadow-2xl transition-all duration-300 hover:border-[#FE8505]"
            style={{ transform: 'translateZ(30px)' }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="px-2.5 py-0.5 rounded-full bg-[#E52E01]/20 border border-[#E52E01]/50 text-[#E52E01] text-[10px] font-mono font-bold">
                INBOUND TRAIN
              </span>
              <span className="text-[11px] font-mono text-[#FE8505] font-bold">PLATFORM {activePlatform}</span>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FE8505] to-[#E52E01] flex items-center justify-center text-[#080c14] shadow-lg shadow-[#FE8505]/30">
                <Train className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-black text-sm text-[#FFFDE1]">#20660 Vande Bharat</h4>
                <p className="text-[11px] text-[#FFFDE1]/70">Bengaluru ➔ Mysuru Jn</p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#3b1d11] flex items-center justify-between text-[11px] font-mono">
              <span className="text-[#FFFDE1]/70">Arrival Window</span>
              <span className="text-emerald-400 font-bold flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>13:00 (ON TIME)</span>
              </span>
            </div>
          </div>

          {/* 3D Dynamic Convergence Beam */}
          <div className="flex flex-col items-center justify-center my-2 md:my-0 relative">
            <div className="hidden md:flex items-center space-x-3 text-[#FE8505]">
              <div className="w-16 h-0.5 bg-gradient-to-r from-[#FE8505] to-transparent animate-pulse" />
              <div className="w-10 h-10 rounded-full bg-[#0e1526] border-2 border-[#FE8505] flex items-center justify-center shadow-[0_0_20px_#FE8505] animate-bounce">
                <ArrowRight className="w-5 h-5 text-[#FE8505]" />
              </div>
              <div className="w-16 h-0.5 bg-gradient-to-l from-[#FE8505] to-transparent animate-pulse" />
            </div>

            <div className="text-[10px] font-mono font-bold text-[#FFFDE1]/80 mt-2 px-3 py-1 rounded-full bg-[#080c14] border border-[#3b1d11] text-center shadow-lg">
              <span>ZERO-WAIT TRANSFER (BAYS 3 & 4)</span>
            </div>
          </div>

          {/* Node 2: KSRTC Feeder Bus (3D Pop-out Card) */}
          <div
            className="w-full md:w-72 p-5 rounded-2xl bg-[#162038]/90 border border-[#FE8505]/50 shadow-2xl transition-all duration-300 hover:border-[#FE8505]"
            style={{ transform: 'translateZ(30px)' }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="px-2.5 py-0.5 rounded-full bg-[#FE8505]/20 border border-[#FE8505]/50 text-[#FE8505] text-[10px] font-mono font-bold">
                CITY FEEDER BUS
              </span>
              <span className="text-[11px] font-mono text-[#00f0ff] font-bold">BAY 3 PORTICO</span>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00f0ff] to-[#FE8505] flex items-center justify-center text-[#080c14] shadow-lg shadow-[#00f0ff]/30">
                <Bus className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-black text-sm text-[#FFFDE1]">KA-09-F-4412</h4>
                <p className="text-[11px] text-[#FFFDE1]/70">Chamundi Hill & Palace</p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#3b1d11] space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-[#FFFDE1]/70">Pool Capacity</span>
                <span className="text-[#FE8505] font-bold">46 / 56 PAX (82%)</span>
              </div>
              <div className="w-full bg-[#080c14] rounded-full h-1.5 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#FE8505] to-[#E52E01] w-[82%]" />
              </div>
            </div>
          </div>
        </div>

        {/* 3D Telemetry Strip at Bottom */}
        <div className="mt-6 pt-4 border-t border-[#3b1d11] grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3 rounded-xl bg-[#080c14]/80 border border-[#3b1d11]">
            <p className="text-[10px] text-[#FFFDE1]/60 font-mono">STATION INTERCHANGE</p>
            <p className="text-xs sm:text-sm font-bold text-[#FFFDE1] mt-0.5">Mysuru Jn (MYS)</p>
          </div>
          <div className="p-3 rounded-xl bg-[#080c14]/80 border border-[#3b1d11]">
            <p className="text-[10px] text-[#FFFDE1]/60 font-mono">AVG TRANSFER TIME</p>
            <p className="text-xs sm:text-sm font-bold text-emerald-400 mt-0.5">4.2 Minutes</p>
          </div>
          <div className="p-3 rounded-xl bg-[#080c14]/80 border border-[#3b1d11]">
            <p className="text-[10px] text-[#FFFDE1]/60 font-mono">KSRTC FEEDER BAY</p>
            <p className="text-xs sm:text-sm font-bold text-[#FE8505] mt-0.5">Bays 3 & 4 Dedicated</p>
          </div>
          <div className="p-3 rounded-xl bg-[#080c14]/80 border border-[#3b1d11]">
            <p className="text-[10px] text-[#FFFDE1]/60 font-mono">BOARDING VERIFICATION</p>
            <p className="text-xs sm:text-sm font-bold text-[#00f0ff] mt-0.5">Atomic QR Pass</p>
          </div>
        </div>
      </TiltCard3D>
    </div>
  );
}
