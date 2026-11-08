import React from 'react';
import TiltCard3D from './TiltCard3D';
import { ShieldCheck, Sparkles, QrCode } from 'lucide-react';

/**
 * 3D Holographic Boarding Pass Container
 * Gives any digital ticket a tangible, metallic, luxury holographic pass aesthetic
 * with physical 3D tilt, iridescent light sheen, and tactile border notches.
 */
export default function Ticket3DPass({ children, status = 'CONFIRMED' }) {
  const isBoarded = status === 'BOARDED';
  const isCancelled = status === 'CANCELLED';

  return (
    <div className="w-full max-w-md mx-auto perspective-1000 py-4">
      <TiltCard3D
        maxTilt={14}
        scale={1.03}
        className="rounded-3xl border-2 border-[#FE8505]/60 bg-gradient-to-br from-[#0e1526] via-[#121b33] to-[#080c14] shadow-[0_25px_60px_rgba(254,133,5,0.22)] overflow-hidden relative"
      >
        {/* Holographic Iridescent Foil Sheen Strip */}
        <div className="absolute -top-10 -right-10 w-44 h-44 bg-gradient-to-br from-[#FE8505]/20 via-[#00f0ff]/20 to-[#E52E01]/20 rounded-full blur-2xl pointer-events-none" />

        {/* Perforated Notches on left & right edge (Physical ticket feel) */}
        <div className="absolute top-[48%] -left-3.5 w-7 h-7 rounded-full bg-[#080c14] border-r-2 border-[#FE8505]/40 z-30 pointer-events-none" />
        <div className="absolute top-[48%] -right-3.5 w-7 h-7 rounded-full bg-[#080c14] border-l-2 border-[#FE8505]/40 z-30 pointer-events-none" />

        {/* Top 3D Embossed Metallic Security Header */}
        <div className="px-6 py-3 bg-gradient-to-r from-[#1c120c] via-[#0e1526] to-[#1a0e0a] border-b border-[#3b1d11] flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FE8505] shadow-[0_0_8px_#FE8505] animate-pulse" />
            <span className="font-mono font-bold tracking-widest text-[#FE8505]">
              OFFICIAL KSRTC DIGITAL PASS
            </span>
          </div>
          <span className="text-[10px] font-mono text-[#FFFDE1]/70">
            {isBoarded ? 'BOARDING COMPLETED' : isCancelled ? 'VOID / REFUNDED' : 'VALID FOR TRAVEL'}
          </span>
        </div>

        {/* Inner Content with 3D Depth */}
        <div className="relative z-10" style={{ transform: 'translateZ(20px)' }}>
          {children}
        </div>

        {/* 3D Laser Scan Line (Sweeps across ticket for high-tech security feel) */}
        {!isBoarded && !isCancelled && (
          <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-[#FE8505] to-transparent shadow-[0_0_15px_#FE8505] animate-scanline pointer-events-none opacity-70" />
        )}
      </TiltCard3D>
    </div>
  );
}
