import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Ticket,
  Train,
  MapPin,
  Calendar,
  Clock,
  ArrowRight,
  QrCode,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  ShieldCheck,
  X,
  CreditCard,
  Sparkles,
  RefreshCw,
  Bus
} from 'lucide-react';
import confetti from 'canvas-confetti';
import api from '../../services/api';

export default function BookingHistory() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refundingBooking, setRefundingBooking] = useState(null);
  const [refundSuccessModal, setRefundSuccessModal] = useState(null);
  const [processingRefund, setProcessingRefund] = useState(false);

  const loadBookings = async () => {
    try {
      const res = await api.get('/passenger/bookings');
      if (res.data?.bookings) {
        setBookings(res.data.bookings);
      }
    } catch (err) {
      console.error('Failed to load trips history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleClaimRefund = async (booking) => {
    setProcessingRefund(true);
    try {
      const res = await api.post(`/passenger/bookings/${booking.id}/refund`, {
        reason: 'Passenger requested refund due to KSRTC bus cancellation / schedule delay'
      });

      if (res.data?.success) {
        // Trigger celebratory confetti
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch (e) {}

        setRefundSuccessModal({
          bookingCode: booking.bookingCode,
          destination: booking.destination?.name,
          amount: booking.totalFare,
          refundCode: res.data.refundCode || `RFND-MYS-${Date.now().toString().slice(-6)}`,
          date: new Date().toLocaleString()
        });

        // Update local state
        setBookings((prev) =>
          prev.map((b) =>
            b.id === booking.id
              ? { ...b, paymentStatus: 'REFUNDED', bookingStatus: 'CANCELLED' }
              : b
          )
        );
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Refund processing failed. Please contact operations support.');
    } finally {
      setProcessingRefund(false);
      setRefundingBooking(null);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#FFFDE1] flex items-center space-x-2">
            <Ticket className="w-5 h-5 text-[#FE8505]" />
            <span>My Trips & Tickets</span>
          </h1>
          <p className="text-xs text-[#FFFDE1]/70 mt-1">
            Complete history of your synchronized train-to-bus reservations, live passes, and instant refund records.
          </p>
        </div>

        <Link
          to="/passenger/trains"
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#FE8505] to-[#E52E01] text-[#080c14] hover:text-white text-xs font-black transition-all shadow-md"
        >
          + Book New Shuttle
        </Link>
      </div>

      {/* Refund Success Modal */}
      {refundSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="max-w-md w-full bg-[#0e1526] border-2 border-[#FE8505] rounded-3xl p-6 shadow-2xl space-y-4 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-950/80 border border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto shadow-lg">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 uppercase">
              100% Instant Refund Credited
            </span>

            <h3 className="text-xl font-black text-[#FFFDE1]">
              ₹{refundSuccessModal.amount?.toFixed(2)} Refund Processed!
            </h3>

            <p className="text-xs text-[#FFFDE1]/80 leading-relaxed">
              Your payment for booking <strong className="text-white">{refundSuccessModal.bookingCode}</strong> ({refundSuccessModal.destination}) has been successfully credited to your original payment method.
            </p>

            <div className="p-3.5 rounded-2xl bg-[#080c14] border border-[#3b1d11] text-left text-xs space-y-1.5 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Refund Ref ID:</span>
                <span className="text-[#FE8505] font-bold">{refundSuccessModal.refundCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Method:</span>
                <span className="text-[#FFFDE1]">Original Source (UPI / Card)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Time:</span>
                <span className="text-[#FFFDE1]">{refundSuccessModal.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status:</span>
                <span className="text-emerald-400 font-bold">COMPLETED</span>
              </div>
            </div>

            <button
              onClick={() => setRefundSuccessModal(null)}
              className="w-full py-2.5 rounded-xl bg-[#FE8505] text-[#080c14] font-black text-xs hover:bg-[#ff9c2b] transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Refund Confirmation Modal */}
      {refundingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="max-w-md w-full bg-[#0e1526] border-2 border-[#E52E01] rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 rounded-xl bg-[#E52E01]/20 text-[#E52E01] flex items-center justify-center">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#FFFDE1]">
                    Claim 100% Instant Refund
                  </h3>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {refundingBooking.bookingCode}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setRefundingBooking(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#080c14] border border-[#3b1d11] space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Destination:</span>
                <span className="font-bold text-[#FFFDE1]">
                  {refundingBooking.destination?.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Train Connect:</span>
                <span className="font-mono text-[#FE8505]">
                  #{refundingBooking.train?.trainNumber} - {refundingBooking.train?.trainName}
                </span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-[#3b1d11]">
                <span className="text-slate-300 font-medium">Full Refund Amount:</span>
                <span className="font-mono font-black text-emerald-400 text-base">
                  ₹{refundingBooking.totalFare?.toFixed(2)}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-[#FFFDE1]/80 leading-relaxed">
              Due to feeder bus operational disruption or train schedule alteration, this booking qualifies for a 100% immediate refund without any cancellation fee. Funds are credited instantly to your original payment method.
            </p>

            <div className="flex items-center space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setRefundingBooking(null)}
                className="flex-1 py-2.5 rounded-xl bg-[#080c14] text-slate-300 hover:text-white border border-[#3b1d11] text-xs font-bold"
              >
                Go Back
              </button>
              <button
                type="button"
                disabled={processingRefund}
                onClick={() => handleClaimRefund(refundingBooking)}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#E52E01] to-[#FE8505] text-[#FFFDE1] font-black text-xs shadow-lg transition-all flex items-center justify-center space-x-2"
              >
                {processingRefund ? (
                  <span>Processing...</span>
                ) : (
                  <>
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Confirm Refund</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bookings List */}
      {loading ? (
        <div className="py-16 text-center text-[#FFFDE1]/60 text-sm">
          Loading your travel and refund records...
        </div>
      ) : bookings.length === 0 ? (
        <div className="py-16 text-center bg-[#0e1526] rounded-3xl border border-[#3b1d11] p-8 space-y-3">
          <Ticket className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-[#FFFDE1]">No Trips Booked Yet</h3>
          <p className="text-xs text-[#FFFDE1]/70 max-w-sm mx-auto">
            Book your first train-to-bus shuttle to enjoy seamless city transit from Mysuru Junction.
          </p>
          <Link
            to="/passenger/trains"
            className="inline-block mt-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FE8505] to-[#E52E01] text-[#080c14] hover:text-white font-extrabold text-xs shadow-md"
          >
            Explore Arriving Trains
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => {
            const ticket = b.tickets?.[0];
            const isBoarded = ticket?.status === 'BOARDED';
            const isRefunded = b.paymentStatus === 'REFUNDED';
            const isCancelled = b.bookingStatus === 'CANCELLED' || isRefunded;
            const isPaid = b.paymentStatus === 'PAID';

            return (
              <div
                key={b.id}
                className="bg-[#0e1526] rounded-3xl border border-[#3b1d11] hover:border-[#FE8505]/40 p-5 space-y-4 shadow-xl transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-[#FE8505] bg-[#FE8505]/15 px-2 py-0.5 rounded border border-[#FE8505]/30">
                      {b.bookingCode}
                    </span>
                    <h3 className="font-black text-[#FFFDE1] text-base mt-1.5">
                      {b.destination?.name || 'City Drop-Off'}
                    </h3>
                  </div>

                  {/* Status Badges */}
                  <div className="flex items-center space-x-2">
                    {isRefunded ? (
                      <span className="text-[10px] font-mono px-2.5 py-1 rounded-full font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>100% REFUNDED</span>
                      </span>
                    ) : isCancelled ? (
                      <span className="text-[10px] font-mono px-2.5 py-1 rounded-full font-bold bg-[#E52E01]/20 text-[#E52E01] border border-[#E52E01]/40">
                        CANCELLED
                      </span>
                    ) : isBoarded ? (
                      <span className="text-[10px] font-mono px-2.5 py-1 rounded-full font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                        BOARDED
                      </span>
                    ) : isPaid ? (
                      <span className="text-[10px] font-mono px-2.5 py-1 rounded-full font-bold bg-[#FE8505]/15 text-[#FE8505] border border-[#FE8505]/30">
                        CONFIRMED PASS
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono px-2.5 py-1 rounded-full font-bold bg-amber-950 text-amber-300 border border-amber-800">
                        PENDING PAYMENT
                      </span>
                    )}
                  </div>
                </div>

                {/* Journey & Train Details */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2 border-t border-[#3b1d11]">
                  <div>
                    <span className="block text-[10px] text-slate-400">Inbound Train</span>
                    <span className="text-[#FFFDE1] font-bold">
                      #{b.train?.trainNumber} - {b.train?.trainName}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400">Journey Date</span>
                    <span className="text-[#FFFDE1] font-mono">{b.journeyDate}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400">Total Fare</span>
                    <span className="text-[#FE8505] font-mono font-bold">
                      ₹{b.totalFare?.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400">Boarding Point</span>
                    <span className="text-[#FFFDE1] font-medium">Bay 3 Portico</span>
                  </div>
                </div>

                {/* Cancellation & Refund Alert Banner (Requirement 2) */}
                {isPaid && !isRefunded && (
                  <div className="p-3 rounded-2xl bg-[#080c14] border border-[#3b1d11] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center space-x-2 text-[#FFFDE1]/80">
                      <ShieldCheck className="w-4 h-4 text-[#FE8505] flex-shrink-0" />
                      <span>
                        Protected by 100% full refund policy if bus is cancelled or delayed.
                      </span>
                    </div>

                    <button
                      onClick={() => setRefundingBooking(b)}
                      className="px-3 py-1.5 rounded-xl bg-[#E52E01]/20 hover:bg-[#E52E01]/30 text-[#E52E01] border border-[#E52E01]/40 text-xs font-bold transition-colors flex items-center space-x-1.5 whitespace-nowrap"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Claim Instant Refund</span>
                    </button>
                  </div>
                )}

                {/* Card Bottom Actions */}
                <div className="pt-2 border-t border-[#3b1d11] flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center space-x-3 text-slate-400">
                    <Link
                      to="/passenger/live-tracking"
                      className="text-[#FE8505] hover:underline flex items-center space-x-1 text-[11px] font-bold"
                    >
                      <Bus className="w-3.5 h-3.5" />
                      <span>Track Feeder Bus Live</span>
                    </Link>
                  </div>

                  <div className="flex items-center space-x-2">
                    {ticket && !isCancelled && (
                      <Link
                        to={`/passenger/ticket/${ticket.id}`}
                        className="px-4 py-1.5 rounded-xl bg-[#FE8505] hover:bg-[#ff9c2b] text-[#080c14] text-xs font-black flex items-center space-x-1.5 transition-all shadow-md"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>View Pass ({ticket.sixDigitCode})</span>
                      </Link>
                    )}

                    {!ticket && !isCancelled && !isPaid && (
                      <Link
                        to={`/passenger/payment/${b.id}`}
                        className="px-4 py-1.5 rounded-xl bg-[#FE8505] text-[#080c14] font-bold text-xs"
                      >
                        Complete Payment
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
