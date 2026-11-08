import React, { useState, useEffect } from 'react';
import { Train, Bus, ShieldCheck, Sparkles, Activity, Radio, Cpu } from 'lucide-react';

/**
 * Mind-Blowing 3D Spatial Hologram Loader
 * Features a 3D isometric gyroscope, rotating hyper-rings, sweeping laser grid,
 * and high-tech Indian Railway ↔ KSRTC telemetry telemetry readout.
 */
export default function HologramLoader3D({
  fullscreen = false,
  message = 'SYNCHRONIZING RAIL-TRANSIT NETWORK',
  onComplete = null,
  duration = 2000
}) {
  const [progress, setProgress] = useState(12);
  const [statusIndex, setStatusIndex] = useState(0);

  const telemetrySteps = [
    'CONNECTING TO MYSURU JUNCTION (MYS) DISPATCH...',
    'SYNCHRONIZING PLATFORM 1 & 2 INBOUND TIMETABLE...',
    'CALCULATING 20–56 DYNAMIC PASSENGER POOLS...',
    'CALIBRATING KSRTC PORTICO BAY 3 & 4 FLEET...',
    'INITIALIZING SPATIAL NEURAL TRANSIT MESH... 100%'
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          if (onComplete) setTimeout(onComplete, 350);
          return 100;
        }
        return prev + Math.floor(Math.random() * 15 + 8);
      });
    }, 180);

    const textTimer = setInterval(() => {
      setStatusIndex((prev) => (prev + 1) % telemetrySteps.length);
    }, 450);

    return () => {
      clearInterval(timer);
      clearInterval(textTimer);
    };
  }, [onComplete]);

  const content = (
    <div className="flex flex-col items-center justify-center p-8 relative max-w-lg mx-auto text-center select-none">
      {/* 3D Gyroscopic Transit Node */}
      <div className="relative w-44 h-44 mb-6 perspective-1000 flex items-center justify-center">
        {/* Pulsing Volumetric Backdrop Glow */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#FE8505]/20 via-[#E52E01]/25 to-[#00f0ff]/15 blur-2xl animate-pulse" />

        {/* 3D Outer Ring (Spinning around Z & Y) */}
        <div
          className="absolute inset-2 rounded-full border-2 border-dashed border-[#FE8505]/60 animate-spin-slow pointer-events-none"
          style={{ animationDuration: '8s' }}
        />

        {/* 3D Middle Ring (Reverse Tilt Spin) */}
        <div
          className="absolute inset-6 rounded-full border border-[#00f0ff]/50 animate-spin-reverse pointer-events-none"
          style={{ animationDuration: '5s' }}
        />

        {/* 3D Inner Orbital Ring with Orbiting Satellite Node */}
        <div
          className="absolute inset-10 rounded-full border border-[#E52E01]/70 animate-spin pointer-events-none"
          style={{ animationDuration: '3.5s' }}
        >
          <div className="w-2.5 h-2.5 rounded-full bg-[#FFFDE1] shadow-[0_0_12px_#FFFDE1] absolute -top-1 left-1/2 -translate-x-1/2" />
        </div>

        {/* 3D Floating Isometric Core */}
        <div className="relative z-10 w-16 h-16 rounded-2xl bg-[#0e1526]/90 border border-[#FE8505] shadow-[0_0_30px_rgba(254,133,5,0.4)] flex items-center justify-center backdrop-blur-md transform hover:rotate-12 transition-transform duration-500">
          <Train className="w-8 h-8 text-[#FE8505] animate-pulse" />
          <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#E52E01] border border-[#080c14] flex items-center justify-center">
            <Bus className="w-3 h-3 text-[#FFFDE1]" />
          </span>
        </div>

        {/* Sweeping Laser Scanline */}
        <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-[#00f0ff] to-transparent shadow-[0_0_15px_#00f0ff] animate-scanline pointer-events-none" />
      </div>

      {/* Cybernetic HUD Readouts */}
      <div className="space-y-3 z-10 w-full">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#0e1526]/90 border border-[#FE8505]/40 text-[#FE8505] text-[10px] font-mono tracking-widest uppercase shadow-lg">
          <Radio className="w-3 h-3 text-[#FE8505] animate-ping" />
          <span>RAILBUS 3D TELEMETRY ENGINE</span>
        </div>

        <h3 className="text-lg sm:text-xl font-black text-[#FFFDE1] tracking-wider uppercase">
          {message}
        </h3>

        {/* 3D Layered Cyber Progress Bar */}
        <div className="w-full bg-[#0e1526] rounded-full h-2.5 p-0.5 border border-[#3b1d11] overflow-hidden shadow-inner relative">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#FE8505] via-[#ff9c2b] to-[#E52E01] transition-all duration-300 shadow-[0_0_15px_#FE8505] relative"
            style={{ width: `${Math.min(100, progress)}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse" />
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] font-mono text-[#FFFDE1]/70 px-1">
          <span className="text-[#FE8505] truncate max-w-[70%] text-left">
            {telemetrySteps[statusIndex]}
          </span>
          <span className="font-bold text-[#FFFDE1]">{Math.min(100, progress)}%</span>
        </div>
      </div>
    </div>
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#080c14]/95 backdrop-blur-xl">
        {content}
      </div>
    );
  }

  return <div className="py-12">{content}</div>;
}
