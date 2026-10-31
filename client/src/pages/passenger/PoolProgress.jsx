import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Layers,
  Users,
  CheckCircle2,
  Clock,
  Train,
  MapPin,
  Bus,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import api from '../../services/api';

export default function PoolProgress() {
  const { id } = useParams();
  const { realtimeEvents } = useSocket();
  const [pool, setPool] = useState(null);
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPool = async () => {
    try {
      const res = await api.get('/passenger/bookings');
      if (res.data?.bookings) {
        const foundBooking = res.data.bookings.find((b) => b.poolId === id || b.pool?.id === id);
        if (foundBooking) {
          setBooking(foundBooking);
          if (foundBooking.pool) {
            setPool(foundBooking.pool);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load pool status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPool();
  }, [id]);

  useEffect(() => {
    const updateEvent = realtimeEvents.find(
      (e) => e.eventName === 'pool:updated' && e.data?.poolId === id
    );
    if (updateEvent && pool) {
      setPool((prev) => ({
        ...prev,
        currentPassengerCount: updateEvent.data.currentPassengerCount,
        status: updateEvent.data.status
      }));
    }
  }, [realtimeEvents, id, pool]);

  if (loading) {
    return (
      <div className="py-16 text-center text-[#FFFDE1]/60 text-sm">
        Syncing pool metrics with mobility operations...
      </div>
    );
  }

  const count = pool?.currentPassengerCount || 24;
  const maxCap = pool?.maxCapacity || 56;
  const minCap = pool?.minCapacity || 20;
  const percentage = Math.min(100, Math.round((count / maxCap) * 100));

  const isEligible = count >= minCap;
  const isFull = count >= maxCap;
  const isCancelled = pool?.status === 'CANCELLED' || pool?.status === 'REJECTED';

  return (
    <div className="max-w-md mx-auto space-y-6 pb-12">
      <div>
        <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-[#FE8505]/15 border border-[#FE8505]/30 text-[#FE8505] text-[11px] font-mono font-bold mb-1">
          <Sparkles className="w-3.5 h-3.5 text-[#FE8505]" />
          <span>REAL-TIME PASSENGER AGGREGATION</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-[#FFFDE1] flex items-center space-x-2">
          <Layers className="w-5 h-5 text-[#FE8505]" />
          <span>Live Passenger Pool Capacity</span>
        </h1>
        <p className="text-xs text-[#FFFDE1]/70 mt-1">
          Tracking fellow train passengers traveling towards your city corridor.
        </p>
      </div>

      {isCancelled && (
        <div className="p-4 rounded-3xl bg-[#E52E01]/20 border border-[#E52E01]/50 text-xs space-y-2">
          <div className="flex items-center space-x-2 text-[#E52E01] font-bold">
            <AlertCircle className="w-4 h-4" />
            <span>Feeder Bus Pool Cancelled</span>
          </div>
          <p className="text-[#FFFDE1]/90">
            This pool was cancelled due to track delay or operational schedule adjustment. 100% full instant refund is available.
          </p>
          <Link
            to="/passenger/trips"
            className="inline-flex items-center space-x-1 text-xs font-bold text-[#FFFDE1] hover:underline"
          >
            <span>Claim Refund in My Trips</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      )}

      <div className="bg-[#0e1526] rounded-3xl border border-[#3b1d11] p-6 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-[#3b1d11]">
          <div>
            <span className="text-[10px] text-slate-400 font-mono uppercase">POOL IDENTIFIER</span>
            <h3 className="font-bold text-[#FFFDE1] text-sm font-mono">{pool?.poolCode || 'POOL-MYS-SYNC'}</h3>
          </div>
          <span
            className={`text-[10px] font-mono px-2.5 py-1 rounded-full font-bold ${
              isCancelled
                ? 'bg-[#E52E01]/20 text-[#E52E01] border border-[#E52E01]'
                : isEligible
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                : 'bg-[#FE8505]/15 text-[#FE8505] border border-[#FE8505]/30'
            }`}
          >
            {pool?.status || (isEligible ? 'ELIGIBLE FOR REVIEW' : 'FORMING')}
          </span>
        </div>

        {/* Big Counter Gauge */}
        <div className="text-center py-2 space-y-1">
          <div className="text-5xl font-black font-mono text-[#FE8505]">
            {count} <span className="text-xl text-slate-500 font-normal">/ {maxCap}</span>
          </div>
          <p className="text-xs text-[#FFFDE1]/70">
            Passengers Joined • <span className="text-[#FE8505] font-bold">{percentage}% Full</span>
          </p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="h-3.5 w-full bg-[#080c14] rounded-full overflow-hidden p-0.5 border border-[#3b1d11]">
            <div
              className="h-full bg-gradient-to-r from-[#FE8505] to-[#E52E01] rounded-full transition-all duration-500 shadow-lg shadow-[#FE8505]/30"
              style={{ width: `${percentage}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#FFFDE1]/60 font-mono">
            <span>0</span>
            <span className="text-[#FE8505] font-bold">Min 20 (Review)</span>
            <span className="text-emerald-400 font-bold">56 (Max Cap)</span>
          </div>
        </div>

        {/* Status Milestones */}
        <div className="space-y-3 pt-2">
          <div className="flex items-start space-x-3 text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-[#FFFDE1]">1–19 Passengers: Initial Pool Forming</span>
              <p className="text-[#FFFDE1]/70 text-[11px]">System groups arriving train passengers by destination.</p>
            </div>
          </div>

          <div className="flex items-start space-x-3 text-xs">
            <CheckCircle2
              className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                isEligible ? 'text-emerald-400' : 'text-slate-600'
              }`}
            />
            <div>
              <span className={`font-bold ${isEligible ? 'text-[#FFFDE1]' : 'text-slate-500'}`}>
                20–55 Passengers: Operations Review
              </span>
              <p className="text-[#FFFDE1]/70 text-[11px]">
                Threshold met! Dedicated bus allocation queued with KSRTC command.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 text-xs">
            <CheckCircle2
              className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                isFull ? 'text-emerald-400' : 'text-slate-600'
              }`}
            />
            <div>
              <span className={`font-bold ${isFull ? 'text-[#FFFDE1]' : 'text-slate-500'}`}>
                56 Passengers: Pool Full
              </span>
              <p className="text-[#FFFDE1]/70 text-[11px]">
                Vehicle at maximum authorized capacity. Additional pool opens.
              </p>
            </div>
          </div>
        </div>

        {/* Boarding Window */}
        <div className="p-3.5 rounded-2xl bg-[#080c14] border border-[#3b1d11] flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-[#FE8505]" />
            <span className="text-slate-300">Target Boarding Window:</span>
          </div>
          <span className="font-mono text-[#FE8505] font-bold">
            {pool?.targetBoardingWindow || 'Arrival + 15 min'}
          </span>
        </div>
      </div>

      <div className="text-center">
        <Link
          to="/passenger/trips"
          className="inline-flex items-center space-x-2 text-xs font-bold text-[#FE8505] hover:underline"
        >
          <span>View All My Trips & Boarding Passes</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
