import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import {
  Ticket,
  QrCode,
  Train,
  MapPin,
  Clock,
  Bus,
  CheckCircle2,
  ShieldCheck,
  Share2,
  ArrowRight,
  Download,
  AlertTriangle,
  RotateCcw,
  Radio,
  Flame,
  Volume2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useSocket } from '../../context/SocketContext';
import api from '../../services/api';

export default function TicketPage() {
  const { id } = useParams();
  const location = useLocation();
  const { realtimeEvents } = useSocket();

  const [ticket, setTicket] = useState(location.state?.ticket || null);
  const [loading, setLoading] = useState(!ticket);
  const [error, setError] = useState('');
  const [refundSuccess, setRefundSuccess] = useState(false);
  const [refunding, setRefunding] = useState(false);

  const fetchTicket = async () => {
    try {
      const res = await api.get('/passenger/tickets');
      if (res.data?.tickets) {
        const found = res.data.tickets.find((t) => t.id === id);
        if (found) {
          setTicket(found);
        } else {
          setError('Ticket not found.');
        }
      }
    } catch (err) {
      setError('Failed to fetch ticket.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!ticket) {
      fetchTicket();
    }
  }, [id]);

  // Listen for real-time ticket scan validation event
  useEffect(() => {
    const scanEvent = realtimeEvents.find(
      (e) => e.eventName === 'ticket:boarded' && e.data?.ticketId === id
    );
    if (scanEvent && ticket && ticket.status !== 'BOARDED') {
      setTicket({ ...ticket, status: 'BOARDED', boardedAt: new Date().toISOString() });
    }
  }, [realtimeEvents, id, ticket]);

  const handleInstantRefund = async () => {
    if (!ticket?.booking?.id) return;
    setRefunding(true);
    try {
      const res = await api.post(`/passenger/bookings/${ticket.booking.id}/refund`, {
        reason: 'Passenger requested refund on ticket pass due to disruption'
      });
      if (res.data?.success) {
        try {
          confetti({ particleCount: 70, spread: 60 });
        } catch (e) {}
        setRefundSuccess(true);
        setTicket({ ...ticket, status: 'CANCELLED' });
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Refund failed.');
    } finally {
      setRefunding(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-[#FFFDE1]/60 text-sm">
        Rendering secure KSRTC digital boarding pass...
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="py-16 text-center text-[#FFFDE1]/70 text-sm bg-[#0e1526] rounded-3xl border border-[#3b1d11] p-8">
        <AlertTriangle className="w-8 h-8 text-[#FE8505] mx-auto mb-2" />
        <p>{error || 'Ticket record unavailable.'}</p>
        <Link to="/passenger/trips" className="mt-4 inline-block text-[#FE8505] font-bold text-xs underline">
          Return to My Trips
        </Link>
      </div>
    );
  }

  const booking = ticket.booking || location.state?.booking;
  const pool = booking?.pool || location.state?.pool;
  const isBoarded = ticket.status === 'BOARDED';
  const isCancelled = ticket.status === 'CANCELLED' || refundSuccess;

  return (
    <div className="max-w-md mx-auto space-y-6 pb-12">
      <div className="text-center space-y-1">
        <span className="text-[11px] font-mono tracking-widest text-[#FE8505] bg-[#FE8505]/15 px-2.5 py-0.5 rounded border border-[#FE8505]/30">
          OFFICIAL KSRTC DIGITAL PASS
        </span>
        <h1 className="text-xl sm:text-2xl font-black text-[#FFFDE1]">
          Confirmed Bus Ticket
        </h1>
        <p className="text-xs text-[#FFFDE1]/70">
          Present QR or 6-digit code to the bus conductor at Bay 3 Portico
        </p>
      </div>

      {/* Refund Success Notice */}
      {refundSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-950/80 border-2 border-emerald-500 text-xs text-emerald-200 space-y-1">
          <div className="flex items-center space-x-1.5 font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>100% Full Refund Processed!</span>
          </div>
          <p>
            Your fare has been credited back to your original payment method. Ticket status marked as CANCELLED.
          </p>
        </div>
      )}

      {/* Ticket Card with Brand Colors */}
      <div className="bg-[#0e1526] rounded-3xl border border-[#FE8505]/40 overflow-hidden shadow-2xl relative">
        {/* Ticket Header */}
        <div className="bg-gradient-to-r from-[#1c120c] via-[#0e1526] to-[#1a111a] p-5 border-b border-[#3b1d11] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FE8505]/20 text-[#FE8505] flex items-center justify-center">
              <Bus className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-black text-[#FFFDE1] tracking-wide">
                RAILBUS SHUTTLE
              </span>
              <p className="text-[10px] text-[#FE8505] font-mono font-bold">
                {ticket.ticketCode}
              </p>
            </div>
          </div>

          <span
            className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border ${
              isCancelled
                ? 'bg-[#E52E01]/20 text-[#E52E01] border-[#E52E01]'
                : isBoarded
                ? 'bg-emerald-950 text-emerald-300 border-emerald-500'
                : 'bg-[#FE8505]/20 text-[#FE8505] border-[#FE8505]'
            }`}
          >
            {isCancelled ? 'CANCELLED' : isBoarded ? '✓ BOARDED' : 'READY TO BOARD'}
          </span>
        </div>

        {/* QR Code Container */}
        <div className="p-6 flex flex-col items-center justify-center bg-[#FFFDE1] text-slate-950 space-y-3">
          <div className="p-2 bg-white rounded-2xl shadow-inner border border-slate-300">
            <QRCodeSVG
              value={JSON.stringify({
                ticketCode: ticket.ticketCode,
                sixDigitCode: ticket.sixDigitCode,
                token: ticket.qrToken
              })}
              size={180}
              level="H"
            />
          </div>

          {/* 6-Digit Manual Code */}
          <div className="text-center pt-1">
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-600 font-bold block">
              MANUAL VERIFICATION CODE
            </span>
            <span className="text-3xl font-black tracking-widest text-[#080c14] font-mono">
              {ticket.sixDigitCode}
            </span>
          </div>
        </div>

        {/* Perforated Divider */}
        <div className="relative flex items-center justify-between px-4 py-2 bg-[#0a0f1d]">
          <div className="w-5 h-5 rounded-full bg-[#080c14] -ml-6 border-r border-[#3b1d11]" />
          <div className="border-b-2 border-dashed border-[#FE8505]/40 w-full mx-2" />
          <div className="w-5 h-5 rounded-full bg-[#080c14] -mr-6 border-l border-[#3b1d11]" />
        </div>

        {/* Journey Details */}
        <div className="p-5 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3 pb-3 border-b border-[#3b1d11]">
            <div>
              <span className="text-slate-400 text-[10px] block">DROP-OFF DESTINATION</span>
              <span className="text-[#FFFDE1] font-bold text-sm">
                {booking?.destination?.name || 'City Drop-Off'}
              </span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 text-[10px] block">ARRIVING TRAIN</span>
              <span className="text-[#FE8505] font-bold font-mono text-sm">
                #{booking?.train?.trainNumber}
              </span>
            </div>
          </div>

          {/* Feeder Bus Timings (Requirement 6) */}
          <div className="p-3.5 rounded-2xl bg-[#080c14] border border-[#3b1d11] space-y-2">
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center space-x-1.5 font-bold">
                <Clock className="w-3.5 h-3.5 text-[#FE8505]" />
                <span>Bus Timing Schedule:</span>
              </span>
              <span className="font-mono text-[#FE8505] text-[11px] font-bold">
                Departs Bay 3 at 13:25
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-[#FFFDE1]/80 pt-1">
              <div>
                <span className="text-slate-500 block text-[10px]">Boarding Opens:</span>
                <span className="font-mono text-white">13:10 (Portico Bay 3)</span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 block text-[10px]">Passenger Receives Bus:</span>
                <span className="font-mono text-emerald-400 font-bold">13:45 Drop-off</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="text-slate-400 text-[10px] block">BOARDING POINT</span>
              <span className="text-[#FFFDE1] font-medium">Bay 3 (KSRTC Portico)</span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 text-[10px] block">ASSIGNED VEHICLE</span>
              <span className="text-[#FE8505] font-mono font-bold">
                {pool?.assignedVehicle?.busNumber || 'KA-09-F-4412'}
              </span>
            </div>
          </div>

          {/* Refund Option on Ticket (Requirement 2) */}
          {!isCancelled && (
            <div className="pt-2 border-t border-[#3b1d11] flex items-center justify-between">
              <span className="text-[10px] text-slate-400">
                Bus cancelled or disrupted?
              </span>
              <button
                onClick={handleInstantRefund}
                disabled={refunding}
                className="text-[11px] font-bold text-[#E52E01] hover:underline flex items-center space-x-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>{refunding ? 'Processing...' : 'Claim 100% Refund'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Action Links */}
      <div className="flex items-center space-x-3">
        <Link
          to="/passenger/live-tracking"
          className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-[#FE8505] to-[#E52E01] text-[#080c14] hover:text-white text-xs font-black text-center transition-all shadow-lg flex items-center justify-center space-x-2"
        >
          <Radio className="w-4 h-4" />
          <span>Track Feeder Bus Live</span>
        </Link>
        <Link
          to="/passenger/trips"
          className="flex-1 py-3 rounded-2xl bg-[#0e1526] hover:bg-[#162038] border border-[#3b1d11] text-[#FFFDE1] text-xs font-bold text-center transition-colors"
        >
          My Trips History
        </Link>
      </div>
    </div>
  );
}
