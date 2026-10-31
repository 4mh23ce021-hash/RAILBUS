import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Train,
  MapPin,
  Calendar,
  Users,
  CreditCard,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Info,
  Clock,
  Layers,
  RotateCcw
} from 'lucide-react';
import api from '../../services/api';

export default function BookingPage() {
  const [searchParams] = useSearchParams();
  const trainIdParam = searchParams.get('trainId');
  const destinationIdParam = searchParams.get('destinationId');

  const [trains, setTrains] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [selectedTrainId, setSelectedTrainId] = useState(trainIdParam || '');
  const [selectedDestId, setSelectedDestId] = useState(destinationIdParam || '');
  const [passengerCount, setPassengerCount] = useState(1);
  const [journeyDate, setJourneyDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    async function initData() {
      try {
        const [trainRes, destRes] = await Promise.all([
          api.get('/passenger/trains'),
          api.get('/passenger/destinations')
        ]);
        if (trainRes.data?.trains) {
          setTrains(trainRes.data.trains);
          if (!selectedTrainId && trainRes.data.trains.length > 0) {
            setSelectedTrainId(trainRes.data.trains[0].id);
          }
        }
        if (destRes.data?.destinations) {
          setDestinations(destRes.data.destinations);
          if (!selectedDestId && destRes.data.destinations.length > 0) {
            setSelectedDestId(destRes.data.destinations[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to load booking parameters:', err);
      } finally {
        setLoading(false);
      }
    }
    initData();
  }, []);

  const selectedTrain = trains.find((t) => t.id === selectedTrainId);
  const selectedDest = destinations.find((d) => d.id === selectedDestId);
  const totalFare = selectedDest ? selectedDest.baseFare * passengerCount : 0;

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!selectedTrainId || !selectedDestId) {
      setError('Please select both your arriving train and destination.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const res = await api.post('/passenger/bookings', {
        trainId: selectedTrainId,
        destinationId: selectedDestId,
        journeyDate,
        passengerCount
      });

      if (res.data?.booking) {
        navigate(`/passenger/payment/${res.data.booking.id}`, {
          state: {
            booking: res.data.booking,
            payment: res.data.payment,
            razorpayOrder: res.data.razorpayOrder
          }
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Booking initiation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-[#FFFDE1]/60 text-sm">
        Preparing booking configuration and interchange telemetry...
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      <div>
        <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-[#FE8505]/15 border border-[#FE8505]/30 text-[#FE8505] text-[11px] font-mono font-bold mb-1">
          <Sparkles className="w-3.5 h-3.5 text-[#FE8505]" />
          <span>SYNCHRONIZED RESERVATION CHECKOUT</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-[#FFFDE1] flex items-center space-x-2">
          <CreditCard className="w-5 h-5 text-[#FE8505]" />
          <span>Confirm Feeder Shuttle Reservation</span>
        </h1>
        <p className="text-xs text-[#FFFDE1]/70 mt-1">
          Lock in your guaranteed seat on the KSRTC City Feeder directly linked with your arriving train.
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-2xl bg-[#E52E01]/20 border border-[#E52E01]/40 text-[#FFFDE1] text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-[#E52E01] flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleBooking} className="space-y-5">
        {/* Train Selection */}
        <div className="bg-[#0e1526] p-5 rounded-3xl border border-[#3b1d11] space-y-3 shadow-xl">
          <label className="block text-xs font-bold text-[#FFFDE1]">
            Arriving Train (Mysuru Junction)
          </label>
          <select
            value={selectedTrainId}
            onChange={(e) => setSelectedTrainId(e.target.value)}
            className="w-full bg-[#080c14] border border-[#3b1d11] rounded-2xl px-4 py-2.5 text-xs text-[#FFFDE1] focus:outline-none focus:border-[#FE8505]"
          >
            {trains.map((t) => (
              <option key={t.id} value={t.id}>
                #{t.trainNumber} - {t.trainName} (ETA: {t.estimatedArrival} • Plat {t.platform})
              </option>
            ))}
          </select>

          {selectedTrain && (
            <div className="p-3 rounded-2xl bg-[#080c14] border border-[#3b1d11] flex flex-wrap items-center justify-between text-xs gap-2">
              <span className="text-slate-400">Scheduled Arrival:</span>
              <span className="font-mono text-[#FE8505] font-bold">
                {selectedTrain.estimatedArrival} ({selectedTrain.status} • Platform {selectedTrain.platform})
              </span>
            </div>
          )}
        </div>

        {/* Multi-Train Cross-Platform Synchronization Info (Requirement 8) */}
        <div className="p-4 rounded-3xl bg-[#0e1526] border border-[#FE8505]/40 text-xs space-y-1.5 shadow-xl">
          <div className="flex items-center space-x-2 text-[#FE8505] font-bold">
            <Layers className="w-4 h-4 text-[#FE8505]" />
            <span>Multi-Train Cross-Platform Synchronization Active</span>
          </div>
          <p className="text-[#FFFDE1]/80 leading-relaxed text-[11px]">
            If another train arrives on a different platform within a <strong>10-minute gap</strong>, passengers are pooled into one shared feeder bus for faster boarding. If the second train is delayed beyond 10 minutes, you will depart on time with your dedicated feeder bus!
          </p>
        </div>

        {/* Destination Selection */}
        <div className="bg-[#0e1526] p-5 rounded-3xl border border-[#3b1d11] space-y-3 shadow-xl">
          <label className="block text-xs font-bold text-[#FFFDE1]">
            City Drop-Off Destination
          </label>
          <select
            value={selectedDestId}
            onChange={(e) => setSelectedDestId(e.target.value)}
            className="w-full bg-[#080c14] border border-[#3b1d11] rounded-2xl px-4 py-2.5 text-xs text-[#FFFDE1] focus:outline-none focus:border-[#FE8505]"
          >
            {destinations.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} — ₹{d.baseFare} (~{d.estimatedTravelMinutes} mins)
              </option>
            ))}
          </select>

          {selectedDest && (
            <div className="p-3 rounded-2xl bg-[#080c14] border border-[#3b1d11] text-xs text-[#FFFDE1]/80">
              <p className="line-clamp-1">{selectedDest.address}</p>
            </div>
          )}
        </div>

        {/* Bus Timing Details (Requirement 6) */}
        <div className="bg-[#0e1526] p-5 rounded-3xl border border-[#3b1d11] space-y-3 shadow-xl">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-[#FE8505]" />
            <h3 className="text-xs font-bold text-[#FFFDE1]">
              Expected Feeder Bus Timing & Alighting Time
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-2xl bg-[#080c14] border border-[#3b1d11]">
              <span className="text-[10px] text-slate-400 block">Boarding Opens</span>
              <span className="font-mono font-bold text-[#FFFDE1]">10 min after train</span>
              <span className="text-[10px] text-[#FE8505] block">Bay 3 Portico</span>
            </div>
            <div className="p-3 rounded-2xl bg-[#080c14] border border-[#3b1d11]">
              <span className="text-[10px] text-slate-400 block">Bus Departure</span>
              <span className="font-mono font-bold text-[#FE8505]">20 min after train</span>
              <span className="text-[10px] text-slate-400 block">Guaranteed window</span>
            </div>
            <div className="p-3 rounded-2xl bg-[#080c14] border border-[#3b1d11] col-span-2 sm:col-span-1">
              <span className="text-[10px] text-slate-400 block">Expected Drop-Off</span>
              <span className="font-mono font-bold text-emerald-400">
                ~{selectedDest?.estimatedTravelMinutes || 25} mins ride
              </span>
              <span className="text-[10px] text-slate-400 block">2-min alert on arrival</span>
            </div>
          </div>
        </div>

        {/* Date and Passenger Count */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-[#0e1526] p-5 rounded-3xl border border-[#3b1d11] space-y-2 shadow-xl">
            <label className="block text-xs font-bold text-[#FFFDE1]">Journey Date</label>
            <input
              type="date"
              value={journeyDate}
              onChange={(e) => setJourneyDate(e.target.value)}
              className="w-full bg-[#080c14] border border-[#3b1d11] rounded-2xl px-4 py-2 text-xs text-[#FFFDE1] focus:outline-none focus:border-[#FE8505]"
            />
          </div>

          <div className="bg-[#0e1526] p-5 rounded-3xl border border-[#3b1d11] space-y-2 shadow-xl">
            <label className="block text-xs font-bold text-[#FFFDE1]">Passenger Seats</label>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((cnt) => (
                <button
                  type="button"
                  key={cnt}
                  onClick={() => setPassengerCount(cnt)}
                  className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${
                    passengerCount === cnt
                      ? 'bg-[#FE8505] text-[#080c14] shadow-md shadow-[#FE8505]/20'
                      : 'bg-[#080c14] text-[#FFFDE1]/70 border border-[#3b1d11] hover:text-white'
                  }`}
                >
                  {cnt}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Instant Refund Protection Pill (Requirement 2) */}
        <div className="p-4 rounded-3xl bg-[#080c14] border border-[#3b1d11] flex items-center justify-between text-xs text-[#FFFDE1]/80">
          <div className="flex items-center space-x-2">
            <RotateCcw className="w-4 h-4 text-[#E52E01] flex-shrink-0" />
            <span>
              <strong>100% Instant Refund Eligible:</strong> Automatic full refund credited if feeder bus is cancelled.
            </span>
          </div>
        </div>

        {/* Fare Summary & Submit */}
        <div className="bg-[#0e1526] p-5 rounded-3xl border border-[#3b1d11] space-y-4 shadow-xl">
          <div className="flex items-center justify-between text-xs text-[#FFFDE1]/80">
            <span>Base Fare ({passengerCount} seat{passengerCount > 1 ? 's' : ''}):</span>
            <span className="font-mono text-[#FFFDE1]">₹{selectedDest ? selectedDest.baseFare : 35} × {passengerCount}</span>
          </div>

          <div className="pt-3 border-t border-[#3b1d11] flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 block">Total Payable Fare</span>
              <span className="text-2xl font-black text-[#FE8505] font-mono">
                ₹{totalFare.toFixed(2)}
              </span>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#FE8505] to-[#E52E01] hover:from-[#ff9c2b] hover:to-[#ff4d24] text-[#080c14] hover:text-white font-black text-xs shadow-xl shadow-[#FE8505]/25 transition-all flex items-center space-x-2 disabled:opacity-50"
            >
              <span>{submitting ? 'Creating Order...' : 'Proceed to Payment'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
