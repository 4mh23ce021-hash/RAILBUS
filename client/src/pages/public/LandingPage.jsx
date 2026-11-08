import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Train,
  Bus,
  Users,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  MapPin,
  Clock,
  Compass,
  CheckCircle2,
  ChevronRight,
  Activity,
  Layers,
  Zap,
  Flame,
  Radio,
  Play,
  RotateCcw
} from 'lucide-react';
import api from '../../services/api';
import TiltCard3D from '../../components/3d/TiltCard3D';
import TransitHub3D from '../../components/3d/TransitHub3D';

export default function LandingPage() {
  const [trains, setTrains] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [trainRes, destRes] = await Promise.all([
          api.get('/passenger/trains'),
          api.get('/passenger/destinations')
        ]);
        if (trainRes.data?.trains) setTrains(trainRes.data.trains);
        if (destRes.data?.destinations) setDestinations(destRes.data.destinations);
      } catch (err) {
        console.warn('Initial public data load failed, using fallbacks:', err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section with Realistic Photographic Backdrop & High Contrast Overlay */}
      <section className="relative pt-16 sm:pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center rounded-3xl overflow-hidden bg-transit-station border border-[#FE8505]/30 shadow-2xl">
        <div className="relative z-10 max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-[#080c14]/90 border border-[#FE8505]/40 text-[#FE8505] text-xs font-mono mb-4 shadow-lg">
            <Sparkles className="w-3.5 h-3.5 text-[#FE8505]" />
            <span>MYSURU JUNCTION (MYS) SMART COMMUTE INTEGRATION</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-[#FFFDE1] max-w-4xl mx-auto leading-tight sm:leading-none">
            Your Train Arrives. <br />
            <span className="bg-gradient-to-r from-[#FE8505] via-[#ff9c2b] to-[#E52E01] bg-clip-text text-transparent">
              Your City Connects.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-xl text-[#FFFDE1]/90 max-w-2xl mx-auto font-light leading-relaxed">
            Intelligent railway-to-city bus synchronization and passenger pooling platform designed specifically for Mysuru Junction. Connect arriving trains with dedicated KSRTC city services in minutes.
          </p>

          {/* The Two Distinct Portal Access Options */}
          <div className="pt-4 max-w-xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-4">
            {/* Primary Option: Passenger Access with 3D tactile button */}
            <Link
              to="/passenger/login"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl btn-3d-orange text-base flex items-center justify-center space-x-3 group"
            >
              <span>CONTINUE AS PASSENGER</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>

            {/* Secondary Option: Admin Access with 3D glass button */}
            <Link
              to="/admin/login"
              className="w-full sm:w-auto px-6 py-4 rounded-2xl btn-3d-glass font-bold text-base flex items-center justify-center space-x-2.5"
            >
              <Activity className="w-5 h-5 text-[#FE8505]" />
              <span>ADMIN CONTROL CENTRE</span>
            </Link>
          </div>

          {/* Key Quick Links */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs font-bold">
            <Link
              to="/about"
              className="px-4 py-2 rounded-xl bg-[#0e1526]/80 text-[#FFFDE1] hover:text-[#FE8505] border border-[#3b1d11] hover:border-[#FE8505]/40 flex items-center space-x-1.5 transition-all shadow-md"
            >
              <Play className="w-3.5 h-3.5 text-[#FE8505]" />
              <span>Watch Multi-Train Demo Video</span>
            </Link>

            <Link
              to="/heatmap"
              className="px-4 py-2 rounded-xl bg-[#0e1526]/80 text-[#FFFDE1] hover:text-[#FE8505] border border-[#3b1d11] hover:border-[#FE8505]/40 flex items-center space-x-1.5 transition-all shadow-md"
            >
              <Flame className="w-3.5 h-3.5 text-[#E52E01]" />
              <span>Mysuru Popularity Heatmap</span>
            </Link>

            <Link
              to="/live-tracking"
              className="px-4 py-2 rounded-xl bg-[#0e1526]/80 text-[#FFFDE1] hover:text-[#FE8505] border border-[#3b1d11] hover:border-[#FE8505]/40 flex items-center space-x-1.5 transition-all shadow-md"
            >
              <Radio className="w-3.5 h-3.5 text-[#FE8505]" />
              <span>Live Train & Bus GPS</span>
            </Link>
          </div>

          {/* Quick Micro Statuses */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-[#FFFDE1]/80 font-medium">
            <div className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Direct Station Portico Bay 3 & 4</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#FE8505]" />
              <span>Dynamic Multi-Train Pooling (≤10 Min Gap)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>100% Instant Refund on Disruption</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3D Interactive Spatial Transit Hub Visualizer */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <TransitHub3D />
      </section>

      {/* Feature Showcase Grid with 3D Tilt Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Multi-Train Sync */}
        <TiltCard3D maxTilt={10} className="rounded-3xl">
          <div className="p-6 rounded-3xl bg-[#0e1526]/90 border border-[#3b1d11] hover:border-[#FE8505]/60 transition-all space-y-4 shadow-2xl backdrop-blur-md h-full flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#FE8505]/20 text-[#FE8505] flex items-center justify-center shadow-lg shadow-[#FE8505]/20">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-[#FFFDE1]">
                Cross-Platform Multi-Train Sync
              </h3>
              <p className="text-xs text-[#FFFDE1]/80 leading-relaxed">
                Trains arriving on Platform 1 and Platform 2 within a 10-minute gap are automatically linked to a single shared feeder bus. If a delay occurs, trains split into dedicated buses instantly!
              </p>
            </div>
            <Link
              to="/about"
              className="text-xs font-bold text-[#FE8505] hover:underline flex items-center space-x-1 pt-2"
            >
              <span>See how it works</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </TiltCard3D>

        {/* Card 2: 100% Refund Guarantee */}
        <TiltCard3D maxTilt={10} className="rounded-3xl">
          <div className="p-6 rounded-3xl bg-[#0e1526]/90 border border-[#3b1d11] hover:border-[#FE8505]/60 transition-all space-y-4 shadow-2xl backdrop-blur-md h-full flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#E52E01]/20 text-[#E52E01] flex items-center justify-center shadow-lg shadow-[#E52E01]/20">
                <RotateCcw className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-[#FFFDE1]">
                Instant Bus Cancellation Refunds
              </h3>
              <p className="text-xs text-[#FFFDE1]/80 leading-relaxed">
                If your feeder bus is cancelled due to train delay or service cancellation, you get a 1-click instant 100% refund credited straight back to your original payment method.
              </p>
            </div>
            <Link
              to="/passenger/trips"
              className="text-xs font-bold text-[#FE8505] hover:underline flex items-center space-x-1 pt-2"
            >
              <span>Learn about refund policy</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </TiltCard3D>

        {/* Card 3: Mysuru Tourism Heatmap */}
        <TiltCard3D maxTilt={10} className="rounded-3xl">
          <div className="p-6 rounded-3xl bg-[#0e1526]/90 border border-[#3b1d11] hover:border-[#FE8505]/60 transition-all space-y-4 shadow-2xl backdrop-blur-md h-full flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#FE8505]/20 text-[#FE8505] flex items-center justify-center shadow-lg shadow-[#FE8505]/20">
                <Flame className="w-6 h-6 text-[#E52E01]" />
              </div>
              <h3 className="text-lg font-black text-[#FFFDE1]">
                Mysuru Hotspots & Bus Bookings
              </h3>
              <p className="text-xs text-[#FFFDE1]/80 leading-relaxed">
                Discover the most visited tourist destinations in Mysore (Palace, Chamundi Hill, Zoo, KRS) and see which KSRTC Feeder Bus has the highest passenger bookings right now.
              </p>
            </div>
            <Link
              to="/heatmap"
              className="text-xs font-bold text-[#FE8505] hover:underline flex items-center space-x-1 pt-2"
            >
              <span>Open live heatmap</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </TiltCard3D>
      </section>

      {/* Live Train Interchange Board */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#0e1526] rounded-3xl p-6 sm:p-8 border border-[#3b1d11] shadow-2xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-[#3b1d11] gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FE8505] animate-pulse" />
                <h2 className="text-xl font-black text-[#FFFDE1] tracking-wide">
                  MYSURU JUNCTION — ACTIVE ARRIVAL TIMETABLE
                </h2>
              </div>
              <p className="text-xs text-[#FFFDE1]/70 mt-1">
                Real-time train telemetry monitored for city feeder bus pool dispatch scheduling
              </p>
            </div>
            <div className="px-3.5 py-1.5 rounded-xl bg-[#080c14] border border-[#3b1d11] text-xs font-mono text-[#FE8505] font-bold">
              PLATFORM FEEDS: LIVE
            </div>
          </div>

          <div className="mt-6 divide-y divide-[#3b1d11]/60">
            {trains.map((train) => (
              <div
                key={train.id}
                className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-[#162038]/40 px-2 rounded-xl transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-2xl bg-[#FE8505]/15 text-[#FE8505] flex items-center justify-center font-mono font-black text-sm">
                    P{train.platform}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-bold text-[#FE8505]">
                        #{train.trainNumber}
                      </span>
                      <span className="text-xs font-bold text-[#FFFDE1]">
                        {train.trainName}
                      </span>
                    </div>
                    <p className="text-xs text-[#FFFDE1]/70 mt-0.5">
                      From: {train.sourceStation}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-6 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">EST. ARRIVAL</span>
                    <span className="font-mono font-bold text-[#FFFDE1]">
                      {train.estimatedArrival}
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-mono px-2.5 py-1 rounded-full font-bold ${
                      train.status === 'ON_TIME'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-[#E52E01]/20 text-[#E52E01] border border-[#E52E01]/40'
                    }`}
                  >
                    {train.status === 'ON_TIME' ? 'ON TIME' : `DELAY +${train.delayMinutes}M`}
                  </span>

                  <Link
                    to={`/passenger/destination?trainId=${train.id}`}
                    className="px-4 py-2 rounded-xl bg-[#FE8505] hover:bg-[#ff9c2b] text-[#080c14] font-black text-xs transition-colors flex items-center space-x-1"
                  >
                    <span>Book Bus</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
