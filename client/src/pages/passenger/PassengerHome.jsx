import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Train,
  Bus,
  Compass,
  Ticket,
  ArrowRight,
  MapPin,
  Clock,
  Sparkles,
  QrCode,
  ShieldCheck,
  ChevronRight,
  Layers,
  Flame,
  Radio,
  RotateCcw,
  Info
} from 'lucide-react';
import { usePassengerAuth } from '../../context/PassengerAuthContext';
import api from '../../services/api';

export default function PassengerHome() {
  const { passenger } = usePassengerAuth();
  const [trains, setTrains] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [recentBooking, setRecentBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [trainRes, destRes, bookingRes] = await Promise.all([
          api.get('/passenger/trains'),
          api.get('/passenger/destinations'),
          api.get('/passenger/bookings')
        ]);
        if (trainRes.data?.trains) setTrains(trainRes.data.trains);
        if (destRes.data?.destinations) setDestinations(destRes.data.destinations);
        if (bookingRes.data?.bookings && bookingRes.data.bookings.length > 0) {
          setRecentBooking(bookingRes.data.bookings[0]);
        }
      } catch (err) {
        console.error('Passenger home data fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#1c120c] via-[#0e1526] to-[#1a111a] border border-[#FE8505]/40 p-6 sm:p-8 shadow-2xl">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-[#FE8505]/15 border border-[#FE8505]/30 text-[#FE8505] text-[11px] font-mono font-bold">
              <Sparkles className="w-3 h-3 text-[#FE8505]" />
              <span>MYSURU JUNCTION INTERCHANGE (BAYS 3 & 4)</span>
            </div>
            <h1 className="text-xl sm:text-3xl font-black text-[#FFFDE1]">
              Welcome back, {passenger?.name || 'Passenger'}!
            </h1>
            <p className="text-xs sm:text-sm text-[#FFFDE1]/80 max-w-lg">
              Synchronize your train arrival with a guaranteed seat on the dedicated KSRTC city feeder bus.
            </p>
          </div>

          <Link
            to="/passenger/trains"
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#FE8505] to-[#E52E01] hover:from-[#ff9c2b] hover:to-[#ff4d24] text-[#080c14] hover:text-white font-black text-xs shadow-xl shadow-[#FE8505]/25 transition-all flex items-center space-x-2"
          >
            <span>Book New Shuttle</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Quick Action Navigation Grid (Requirements 1, 4, 8, 9) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Live Tracking Feature Card */}
        <Link
          to="/passenger/live-tracking"
          className="p-5 rounded-3xl bg-[#0e1526] border border-[#3b1d11] hover:border-[#FE8505] hover:bg-[#162038] transition-all group space-y-3 shadow-xl"
        >
          <div className="w-10 h-10 rounded-2xl bg-[#FE8505]/20 text-[#FE8505] flex items-center justify-center group-hover:scale-110 transition-transform">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-black text-sm text-[#FFFDE1] group-hover:text-[#FE8505] transition-colors">
              Live GPS Tracking
            </h3>
            <p className="text-[11px] text-[#FFFDE1]/70 mt-0.5">
              Track arriving trains, feeder bus location, and receive 2-min drop-off alerts.
            </p>
          </div>
          <div className="text-[10px] font-bold text-[#FE8505] flex items-center space-x-1 pt-1">
            <span>Launch Live Map</span>
            <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Mysore Heatmap Card */}
        <Link
          to="/passenger/heatmap"
          className="p-5 rounded-3xl bg-[#0e1526] border border-[#3b1d11] hover:border-[#FE8505] hover:bg-[#162038] transition-all group space-y-3 shadow-xl"
        >
          <div className="w-10 h-10 rounded-2xl bg-[#E52E01]/20 text-[#E52E01] flex items-center justify-center group-hover:scale-110 transition-transform">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-black text-sm text-[#FFFDE1] group-hover:text-[#FE8505] transition-colors">
              Mysuru Heatmap
            </h3>
            <p className="text-[11px] text-[#FFFDE1]/70 mt-0.5">
              Explore most visited spots and find which feeder bus has more bookings.
            </p>
          </div>
          <div className="text-[10px] font-bold text-[#FE8505] flex items-center space-x-1 pt-1">
            <span>Explore Heatmap</span>
            <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Multi-Train Sync Card */}
        <Link
          to="/passenger/trains"
          className="p-5 rounded-3xl bg-[#0e1526] border border-[#3b1d11] hover:border-[#FE8505] hover:bg-[#162038] transition-all group space-y-3 shadow-xl"
        >
          <div className="w-10 h-10 rounded-2xl bg-[#FE8505]/20 text-[#FE8505] flex items-center justify-center group-hover:scale-110 transition-transform">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-black text-sm text-[#FFFDE1] group-hover:text-[#FE8505] transition-colors">
              Multi-Train Sync (≤10m)
            </h3>
            <p className="text-[11px] text-[#FFFDE1]/70 mt-0.5">
              Sync trains across Platforms 1 & 2 for a single coordinated feeder bus.
            </p>
          </div>
          <div className="text-[10px] font-bold text-[#FE8505] flex items-center space-x-1 pt-1">
            <span>View Train Pairs</span>
            <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* About Us & Video Demo Card */}
        <Link
          to="/passenger/about"
          className="p-5 rounded-3xl bg-[#0e1526] border border-[#3b1d11] hover:border-[#FE8505] hover:bg-[#162038] transition-all group space-y-3 shadow-xl"
        >
          <div className="w-10 h-10 rounded-2xl bg-[#FE8505]/20 text-[#FE8505] flex items-center justify-center group-hover:scale-110 transition-transform">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-black text-sm text-[#FFFDE1] group-hover:text-[#FE8505] transition-colors">
              How RAILBUS Works
            </h3>
            <p className="text-[11px] text-[#FFFDE1]/70 mt-0.5">
              Interactive demo simulation of train-to-bus dynamic pooling rules.
            </p>
          </div>
          <div className="text-[10px] font-bold text-[#FE8505] flex items-center space-x-1 pt-1">
            <span>Watch Demo Video</span>
            <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>

      {/* Active Ticket Banner if exists */}
      {recentBooking && recentBooking.tickets?.length > 0 && (
        <div className="p-5 rounded-3xl bg-gradient-to-r from-[#1c120c] via-[#0e1526] to-[#0e1526] border border-[#FE8505]/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#FE8505]/20 text-[#FE8505] flex items-center justify-center flex-shrink-0">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-black text-[#FFFDE1]">ACTIVE DIGITAL PASS</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono font-bold">
                  {recentBooking.tickets[0].status}
                </span>
              </div>
              <p className="text-xs text-[#FFFDE1]/80 mt-0.5">
                To: <strong className="text-white">{recentBooking.destination?.name}</strong> • Validation Code:{' '}
                <span className="font-mono font-bold text-[#FE8505]">{recentBooking.tickets[0].sixDigitCode}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Link
              to="/passenger/live-tracking"
              className="px-4 py-2 rounded-xl bg-[#080c14] border border-[#3b1d11] text-[#FE8505] font-bold text-xs hover:border-[#FE8505] transition-colors"
            >
              Track Bus
            </Link>
            <Link
              to={`/passenger/ticket/${recentBooking.tickets[0].id}`}
              className="px-4 py-2 rounded-xl bg-[#FE8505] text-[#080c14] font-black text-xs hover:bg-[#ff9c2b] transition-colors"
            >
              Show Boarding Pass
            </Link>
          </div>
        </div>
      )}

      {/* Inbound Trains Feed */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Train className="w-4 h-4 text-[#FE8505]" />
            <h2 className="text-base font-black text-[#FFFDE1]">
              Inbound Trains Arriving at Mysuru Junction
            </h2>
          </div>
          <Link
            to="/passenger/trains"
            className="text-xs font-bold text-[#FE8505] hover:underline flex items-center space-x-1"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {trains.slice(0, 4).map((t) => (
            <Link
              key={t.id}
              to={`/passenger/destination?trainId=${t.id}`}
              className="p-5 rounded-3xl bg-[#0e1526] border border-[#3b1d11] hover:border-[#FE8505] hover:bg-[#162038] transition-all group space-y-3 shadow-lg"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-bold text-[#FE8505] bg-[#FE8505]/15 px-2 py-0.5 rounded border border-[#FE8505]/30">
                      #{t.trainNumber}
                    </span>
                    <span className="text-xs font-mono text-[#FFFDE1]/80 font-bold">
                      Platform {t.platform}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-[#FFFDE1] group-hover:text-[#FE8505] transition-colors mt-1">
                    {t.trainName}
                  </h4>
                </div>

                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                    t.status === 'ON_TIME'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-[#E52E01]/20 text-[#E52E01] border border-[#E52E01]/40'
                  }`}
                >
                  {t.status === 'ON_TIME' ? 'ON TIME' : `DELAY +${t.delayMinutes}M`}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-[#FFFDE1]/70 pt-2 border-t border-[#3b1d11]">
                <span>From {t.sourceStation}</span>
                <span className="font-mono font-bold text-[#FE8505]">
                  Est: {t.estimatedArrival}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
