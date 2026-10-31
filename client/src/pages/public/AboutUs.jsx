import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Train,
  Bus,
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Activity,
  Layers,
  Zap,
  Users,
  Compass,
  Volume2
} from 'lucide-react';

export default function AboutUs() {
  // Video / Animation simulation state
  const [isPlaying, setIsPlaying] = useState(true);
  const [activeStage, setActiveStage] = useState(1); // 1: Sync (<=10m), 2: Delay (>10m), 3: Boarding
  const [delaySliderMinutes, setDelaySliderMinutes] = useState(8); // gap between trains (mins)
  const [playbackTime, setPlaybackTime] = useState(0);

  // Auto-play timer for demo simulation
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setPlaybackTime((prev) => {
        const next = (prev + 1) % 15;
        if (next === 0) setActiveStage(1);
        else if (next === 5) setActiveStage(2);
        else if (next === 10) setActiveStage(3);
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const isSharedPool = delaySliderMinutes <= 10;

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section with Photographic Realistic Train & Bus Overlay */}
      <section className="relative py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center rounded-3xl overflow-hidden bg-transit-train shadow-2xl border border-[#FE8505]/30">
        <div className="relative z-10 max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#080c14]/90 border border-[#FE8505]/40 text-[#FE8505] text-xs font-mono shadow-md">
            <Sparkles className="w-3.5 h-3.5 text-[#FE8505]" />
            <span>KSRTC & SOUTH WESTERN RAILWAY JOINT MOBILITY INITIATIVE</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#FFFDE1] tracking-tight leading-tight">
            How RAILBUS Bridges Railway Tracks to City Roads
          </h1>

          <p className="text-sm sm:text-base text-[#FFFDE1]/90 max-w-2xl mx-auto font-light leading-relaxed">
            Eliminating the last-mile chaos at Mysuru Junction. By synchronizing real-time railway arrival telemetry with dynamic KSRTC feeder bus pooling, we guarantee seamless, reliable, and affordable urban transit.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <a
              href="#demo-video"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#FE8505] to-[#E52E01] text-[#080c14] hover:text-white font-extrabold text-xs shadow-lg shadow-[#FE8505]/30 flex items-center space-x-2 transition-all"
            >
              <Play className="w-4 h-4" />
              <span>WATCH INTERACTIVE DEMO SIMULATION</span>
            </a>
            <Link
              to="/passenger/trains"
              className="px-6 py-3 rounded-xl bg-[#0e1526]/90 hover:bg-[#162038] text-[#FFFDE1] border border-[#3b1d11] font-bold text-xs transition-all"
            >
              Explore Inbound Trains
            </Link>
          </div>
        </div>
      </section>

      {/* Interactive Demo Video & Simulation Player (Requirement 4 & Requirement 8) */}
      <section id="demo-video" className="max-w-5xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="text-center space-y-2">
          <span className="text-xs font-mono font-bold text-[#FE8505] bg-[#FE8505]/10 px-3 py-1 rounded-full border border-[#FE8505]/30">
            AUDIO-VISUAL ARCHITECTURE SIMULATION
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#FFFDE1]">
            Interactive Synchronization & Multi-Train Pooling Engine
          </h2>
          <p className="text-xs sm:text-sm text-[#FFFDE1]/70 max-w-2xl mx-auto">
            Experience how arriving trains are linked to dedicated feeder buses, and how our 10-minute multi-platform rule dynamically manages passenger pools during normal and delayed operations.
          </p>
        </div>

        {/* Video Simulation Container */}
        <div className="rounded-3xl bg-[#0e1526] border-2 border-[#FE8505]/50 overflow-hidden shadow-2xl relative">
          {/* Top Video Player Bar */}
          <div className="bg-gradient-to-r from-[#1c120c] via-[#0e1526] to-[#1a111a] p-4 border-b border-[#3b1d11] flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FE8505] opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#FE8505]" />
              </span>
              <span className="font-bold text-xs text-[#FFFDE1] font-mono">
                SIMULATION: MYSURU JUNCTION (MYS) INTERCHANGE BAY 3
              </span>
            </div>

            <div className="flex items-center space-x-3 text-xs">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-1.5 rounded-lg bg-[#FE8505]/20 hover:bg-[#FE8505]/30 text-[#FE8505] font-bold flex items-center space-x-1"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isPlaying ? 'Pause' : 'Play Demo'}</span>
              </button>
              <button
                onClick={() => {
                  setPlaybackTime(0);
                  setActiveStage(1);
                  setDelaySliderMinutes(8);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
                title="Restart"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Canvas-Like Vector Graphical Demo Screen */}
          <div className="p-6 sm:p-8 space-y-6 bg-[#080c14]/95 min-h-[380px] flex flex-col justify-between relative overflow-hidden">
            {/* Visual Tracks & Platforms */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
              {/* Platform 1 Train */}
              <div
                className={`p-4 rounded-2xl border transition-all ${
                  activeStage >= 1
                    ? 'bg-[#0e1526] border-[#FE8505] shadow-lg shadow-[#FE8505]/10'
                    : 'bg-[#080c14] border-[#3b1d11] opacity-70'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-[#FE8505] font-bold">PLATFORM 1</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 font-mono">
                    ON TIME
                  </span>
                </div>
                <div className="mt-2 space-y-1">
                  <div className="flex items-center space-x-2">
                    <Train className="w-5 h-5 text-[#FE8505]" />
                    <span className="font-bold text-sm text-[#FFFDE1]">#12008 Shatabdi Express</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Scheduled: 13:00 • From Chennai (MAS)</p>
                  <p className="text-[11px] text-[#FE8505] font-mono">24 Passengers for Kuvempunagar</p>
                </div>
              </div>

              {/* Platform 2 Train (Subject to Delay / Gap) */}
              <div
                className={`p-4 rounded-2xl border transition-all ${
                  isSharedPool
                    ? 'bg-[#0e1526] border-[#FE8505] shadow-lg shadow-[#FE8505]/10'
                    : 'bg-[#0e1526] border-[#E52E01] shadow-lg shadow-[#E52E01]/10'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-[#FFFDE1] font-bold">PLATFORM 2</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold ${
                      isSharedPool
                        ? 'bg-emerald-950 text-emerald-300'
                        : 'bg-[#E52E01]/20 text-[#E52E01]'
                    }`}
                  >
                    {isSharedPool ? `GAP ${delaySliderMinutes} MIN` : `DELAY +${delaySliderMinutes} MIN`}
                  </span>
                </div>
                <div className="mt-2 space-y-1">
                  <div className="flex items-center space-x-2">
                    <Train
                      className={`w-5 h-5 ${isSharedPool ? 'text-[#FE8505]' : 'text-[#E52E01]'}`}
                    />
                    <span className="font-bold text-sm text-[#FFFDE1]">#16535 Gol Gumbaz Express</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Est. Arrival: 13:{delaySliderMinutes < 10 ? `0${delaySliderMinutes}` : delaySliderMinutes} • Solapur (SUR)
                  </p>
                  <p
                    className={`text-[11px] font-mono font-bold ${
                      isSharedPool ? 'text-[#FE8505]' : 'text-[#E52E01]'
                    }`}
                  >
                    22 Passengers for Kuvempunagar
                  </p>
                </div>
              </div>

              {/* Dynamic Feeder Bus Outcome */}
              <div
                className={`p-4 rounded-2xl border transition-all ${
                  isSharedPool
                    ? 'bg-gradient-to-br from-[#0e1526] to-[#1c120c] border-[#FE8505] shadow-xl'
                    : 'bg-gradient-to-br from-[#0e1526] to-[#1e0e0a] border-[#E52E01] shadow-xl'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-[#FE8505] font-bold">KSRTC BAY 3 FEEDER</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                      isSharedPool
                        ? 'bg-[#FE8505] text-[#080c14]'
                        : 'bg-[#E52E01] text-white'
                    }`}
                  >
                    {isSharedPool ? 'SHARED BUS MERGED' : 'SPLIT DEDICATED BUS'}
                  </span>
                </div>
                <div className="mt-2 space-y-1">
                  <div className="flex items-center space-x-2">
                    <Bus className="w-5 h-5 text-[#FE8505]" />
                    <span className="font-bold text-sm text-[#FFFDE1]">
                      {isSharedPool ? 'Bus #KA-09-F-4412 (Combined)' : 'Bus 1 (Shatabdi) & Bus 2 (Gol Gumbaz)'}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#FFFDE1]/80">
                    {isSharedPool
                      ? '46/56 Seats Booked Together (Platform 1 & 2 Combined)'
                      : 'Train 1 departs immediately (13:15). Train 2 passengers allocated separate feeder bus.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Visual Decision Logic Explainer Box */}
            <div className="p-4 rounded-2xl bg-[#0e1526] border border-[#3b1d11] space-y-2">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-[#FE8505]" />
                <h4 className="text-xs font-bold text-[#FFFDE1]">
                  Algorithm Rule In Action:{' '}
                  <span className="text-[#FE8505]">
                    {isSharedPool
                      ? `Arrival Gap is ${delaySliderMinutes} Minutes (≤ 10 Min Threshold)`
                      : `Arrival Gap is ${delaySliderMinutes} Minutes (> 10 Min Threshold)`}
                  </span>
                </h4>
              </div>
              <p className="text-xs text-[#FFFDE1]/80 leading-relaxed">
                {isSharedPool ? (
                  <>
                    <strong className="text-emerald-400">Multi-Train Synchronization Activated:</strong>{' '}
                    Because Train 1 and Train 2 arrive at Mysuru Junction within a 10-minute gap, passengers heading to the same corridor (Kuvempunagar) are pooled together into <strong>one single KSRTC feeder bus</strong>. This cuts down empty bus trips and lowers waiting times.
                  </>
                ) : (
                  <>
                    <strong className="text-[#E52E01]">Automatic Delay Splitting Activated:</strong>{' '}
                    The arrival gap between Train 1 and Train 2 exceeds 10 minutes. To protect on-time passengers from waiting for the delayed train, <strong>Train 1 passengers depart on schedule</strong> in their feeder bus, and a <strong>separate dedicated bus is dynamically dispatched for Train 2 passengers</strong>!
                  </>
                )}
              </p>
            </div>

            {/* Interactive Delay Simulator Slider (Allows user to try the exact 10 min rule!) */}
            <div className="p-4 rounded-2xl bg-[#0a0f1d] border border-[#FE8505]/30 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#FFFDE1] flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-[#FE8505]" />
                  <span>Adjust Train Arrival Gap (Try The 10-Minute Limit):</span>
                </span>
                <span
                  className={`font-mono font-black text-sm px-2.5 py-0.5 rounded ${
                    isSharedPool
                      ? 'bg-[#FE8505]/20 text-[#FE8505] border border-[#FE8505]/40'
                      : 'bg-[#E52E01]/20 text-[#E52E01] border border-[#E52E01]/40'
                  }`}
                >
                  {delaySliderMinutes} Minutes Gap
                </span>
              </div>

              <input
                type="range"
                min="2"
                max="30"
                step="1"
                value={delaySliderMinutes}
                onChange={(e) => setDelaySliderMinutes(Number(e.target.value))}
                className="w-full accent-[#FE8505] cursor-pointer"
              />

              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span>2 min (Shared Bus)</span>
                <span className="text-[#FE8505] font-bold">10 min (Sync Limit)</span>
                <span>30 min (Separate Buses)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Principles & Key Benefits */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#FFFDE1]">
            Why Mysuru Junction Chose Intelligent Feeder Pooling
          </h2>
          <p className="text-xs sm:text-sm text-[#FFFDE1]/70 max-w-xl mx-auto">
            Engineered from ground up to serve daily commuters, tech professionals, and leisure travelers alike.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-[#0e1526] border border-[#3b1d11] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#FE8505]/20 text-[#FE8505] flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-[#FFFDE1]">
              Dynamic 20–56 Seat Pooling
            </h3>
            <p className="text-xs text-[#FFFDE1]/80 leading-relaxed">
              Feeder buses are authorized automatically when a corridor reaches 20 passengers, scaling up to 56 passengers per vehicle for maximum efficiency.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[#0e1526] border border-[#3b1d11] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#E52E01]/20 text-[#E52E01] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-[#FFFDE1]">
              100% Instant Refund Protection
            </h3>
            <p className="text-xs text-[#FFFDE1]/80 leading-relaxed">
              If an inbound train cancellation or unexpected schedule disruption occurs, passengers receive an instant 100% full refund directly back to their source UPI/card.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[#0e1526] border border-[#3b1d11] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#FE8505]/20 text-[#FE8505] flex items-center justify-center">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-[#FFFDE1]">
              Live GPS & 2-Minute Alerts
            </h3>
            <p className="text-xs text-[#FFFDE1]/80 leading-relaxed">
              Real-time radar tracking on Leaflet maps with automated audible proximity alerts 2 minutes before reaching your chosen Mysuru drop-off stop.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
