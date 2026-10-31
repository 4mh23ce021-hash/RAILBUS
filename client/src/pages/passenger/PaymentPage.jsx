import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  AlertCircle,
  Train,
  MapPin,
  Clock,
  Sparkles,
  RotateCcw
} from 'lucide-react';
import api from '../../services/api';

export default function PaymentPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [booking, setBooking] = useState(location.state?.booking || null);
  const [payment, setPayment] = useState(location.state?.payment || null);
  const [razorpayOrder, setRazorpayOrder] = useState(location.state?.razorpayOrder || null);
  const [loading, setLoading] = useState(!booking);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchBookingDetails() {
      if (booking) return;
      try {
        const res = await api.get(`/passenger/bookings/${bookingId}`);
        if (res.data?.booking) {
          setBooking(res.data.booking);
          if (res.data.booking.payments?.[0]) {
            setPayment(res.data.booking.payments[0]);
          }
        }
      } catch (err) {
        setError('Failed to retrieve booking information.');
      } finally {
        setLoading(false);
      }
    }
    fetchBookingDetails();
  }, [bookingId]);

  const handleSimulatedRazorpayPayment = async () => {
    setProcessing(true);
    setError('');

    try {
      const mockPaymentId = `pay_rzp_test_${Date.now()}`;
      const mockSignature = `mock_sig_${Date.now()}`;

      const res = await api.post('/passenger/bookings/confirm-payment', {
        bookingId: booking.id,
        paymentId: payment ? payment.id : undefined,
        razorpayPaymentId: mockPaymentId,
        razorpaySignature: mockSignature
      });

      if (res.data?.success) {
        try {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch (e) {}

        navigate(`/passenger/ticket/${res.data.ticket.id}`, {
          state: {
            ticket: res.data.ticket,
            pool: res.data.pool,
            booking: res.data.booking,
            isNew: true
          }
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Payment processing failed. Please retry.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-[#FFFDE1]/60 text-sm">
        Loading payment checkout parameters...
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-6 pb-12">
      <div className="text-center space-y-1">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FE8505] to-[#E52E01] flex items-center justify-center text-[#080c14] mx-auto shadow-lg shadow-[#FE8505]/20">
          <CreditCard className="w-6 h-6" />
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-[#FFFDE1]">
          Razorpay Secure Checkout
        </h1>
        <p className="text-xs text-[#FFFDE1]/70">
          Official KSRTC Railway-to-City Shuttle Fare Collection
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-2xl bg-[#E52E01]/20 border border-[#E52E01]/40 text-[#FFFDE1] text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-[#E52E01] flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Booking Summary Card */}
      <div className="bg-[#0e1526] rounded-3xl border border-[#3b1d11] p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-[#3b1d11] text-xs">
          <span className="text-slate-400">Booking Code:</span>
          <span className="font-mono text-[#FE8505] font-bold">{booking?.bookingCode}</span>
        </div>

        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center space-x-1.5">
              <Train className="w-4 h-4 text-[#FE8505]" />
              <span>Arriving Train:</span>
            </span>
            <span className="text-[#FFFDE1] font-semibold">
              #{booking?.train?.trainNumber} - {booking?.train?.trainName}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center space-x-1.5">
              <MapPin className="w-4 h-4 text-[#FE8505]" />
              <span>City Drop-Off:</span>
            </span>
            <span className="text-[#FFFDE1] font-semibold">{booking?.destination?.name}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center space-x-1.5">
              <Clock className="w-4 h-4 text-[#FE8505]" />
              <span>Boarding Point:</span>
            </span>
            <span className="text-[#FFFDE1] font-semibold">Bay 3 / 4 Station Portico</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400">Reserved Seats:</span>
            <span className="text-[#FFFDE1] font-semibold">{booking?.passengerCount} Passenger(s)</span>
          </div>
        </div>

        <div className="pt-3 border-t border-[#3b1d11] flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-300">Total Payable:</span>
          <span className="text-2xl font-black text-[#FE8505] font-mono">
            ₹{booking?.totalFare?.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Gateway Card */}
      <div className="bg-[#0e1526] rounded-3xl border border-[#3b1d11] p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-bold text-[#FFFDE1]">RAZORPAY SECURE GATEWAY</span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FE8505]/15 text-[#FE8505] border border-[#FE8505]/30 font-bold">
            256-BIT ENCRYPTION
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-[#080c14] border border-[#3b1d11] flex items-center space-x-2 text-xs text-[#FFFDE1]/80">
          <RotateCcw className="w-4 h-4 text-[#E52E01] flex-shrink-0" />
          <span>Full 100% instant refund eligible if feeder bus is disrupted or cancelled.</span>
        </div>

        <button
          onClick={handleSimulatedRazorpayPayment}
          disabled={processing}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#FE8505] to-[#E52E01] hover:from-[#ff9c2b] hover:to-[#ff4d24] text-[#080c14] hover:text-white font-black text-sm shadow-xl shadow-[#FE8505]/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          <Lock className="w-4 h-4" />
          <span>{processing ? 'Processing Payment & Pooling...' : `Authorize & Pay ₹${booking?.totalFare?.toFixed(2)}`}</span>
        </button>
      </div>
    </div>
  );
}
