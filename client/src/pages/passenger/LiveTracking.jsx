import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Train,
  Bus,
  Clock,
  MapPin,
  Navigation,
  Gauge,
  Phone,
  ShieldCheck,
  AlertTriangle,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Info
} from 'lucide-react';
import api from '../../services/api';

// Custom SVG Leaflet Markers with Brand Colors (#FE8505 Orange, #E52E01 Off Red, #FFFDE1 Ivory)
const createTrainIcon = () =>
  L.divIcon({
    className: 'custom-train-marker',
    html: `
      <div style="background: linear-gradient(135deg, #FE8505, #E52E01); width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 15px rgba(254, 133, 5, 0.7); border: 2px solid #FFFDE1;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFDE1" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <rect x="4" y="3" width="16" height="16" rx="2"></rect>
          <path d="M4 11h16"></path>
          <path d="M12 3v8"></path>
          <path d="m8 19-2 3"></path>
          <path d="m18 22-2-3"></path>
          <circle cx="8" cy="15" r="1"></circle>
          <circle cx="16" cy="15" r="1"></circle>
        </svg>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18]
  });

const createBusIcon = () =>
  L.divIcon({
    className: 'custom-bus-marker',
    html: `
      <div style="background: linear-gradient(135deg, #FE8505, #d96e00); width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 18px rgba(254, 133, 5, 0.8); border: 2px solid #FFFDE1;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFDE1" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M8 6v6"></path>
          <path d="M15 6v6"></path>
          <path d="M2 12h19.6"></path>
          <path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3"></path>
          <circle cx="7" cy="18" r="2"></circle>
          <path d="M9 18h5"></path>
          <circle cx="16" cy="18" r="2"></circle>
        </svg>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18]
  });

const createStationIcon = () =>
  L.divIcon({
    className: 'custom-station-marker',
    html: `
      <div style="background: #0e1526; width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; border: 2px solid #FE8505; box-shadow: 0 0 10px rgba(254, 133, 5, 0.4);">
        <span style="color: #FFFDE1; font-weight: 800; font-size: 11px; font-family: monospace;">MYS</span>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });

const createDestIcon = (label) =>
  L.divIcon({
    className: 'custom-dest-marker',
    html: `
      <div style="background: #E52E01; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid #FFFDE1; box-shadow: 0 0 14px rgba(229, 46, 1, 0.7);">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFFDE1" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  });

// Waypoint coordinates for simulation
const MYSURU_STATION = [12.3164, 76.6433];

// Train approach path into Mysuru Junction (approaching from Mandya / Srirangapatna along railway tracks)
const TRAIN_PATH = [
  [12.4200, 76.6900], // Srirangapatna
  [12.3900, 76.6750], // Belagola / Naganahalli
  [12.3550, 76.6600], // Mysore North
  [12.3350, 76.6500], // Yadavagiri outer
  [12.3164, 76.6433]  // Mysuru Jn
];

// Bus routes from Mysuru Junction
const BUS_ROUTES = {
  kuvempunagar: {
    name: 'Kuvempunagar Complex',
    destinationCoord: [12.2855, 76.6265],
    path: [
      [12.3164, 76.6433], // Mysuru Station Bay 3
      [12.3080, 76.6420], // Ramaswamy Circle
      [12.2965, 76.6384], // Ballal Circle (Ashoka Circle)
      [12.2902, 76.6315], // Akshaya Bhandar
      [12.2855, 76.6265]  // Kuvempunagar Complex
    ],
    distanceKm: 7.2,
    stops: ['Station Bay 3', 'Ramaswamy Circle', 'Ballal Circle', 'Akshaya Bhandar', 'Kuvempunagar Complex']
  },
  chamundi: {
    name: 'Chamundi Hill Foothills',
    destinationCoord: [12.2780, 76.6710],
    path: [
      [12.3164, 76.6433], // Station Bay 3
      [12.3106, 76.6575], // Suburban Stand
      [12.3020, 76.6640], // Zoo Gate
      [12.2900, 76.6680], // Tavarekatte
      [12.2780, 76.6710]  // Chamundi Foothills
    ],
    distanceKm: 8.5,
    stops: ['Station Bay 3', 'Suburban Stand', 'Zoo Gate', 'Tavarekatte', 'Chamundi Foothills']
  },
  hebbal: {
    name: 'Hebbal & Infosys Campus',
    destinationCoord: [12.3780, 76.5920],
    path: [
      [12.3164, 76.6433], // Station
      [12.3275, 76.6310], // Yadavagiri
      [12.3390, 76.6220], // Vani Vilas
      [12.3510, 76.6130], // Kumbarakoppal
      [12.3780, 76.5920]  // Infosys Hebbal
    ],
    distanceKm: 11.5,
    stops: ['Station Bay 3', 'Yadavagiri', 'Vani Vilas', 'Kumbarakoppal', 'Infosys Hebbal']
  }
};

export default function LiveTracking() {
  const location = useLocation();
  const [trains, setTrains] = useState([]);
  const [selectedTrain, setSelectedTrain] = useState(null);
  const [selectedRouteKey, setSelectedRouteKey] = useState('kuvempunagar');

  // Simulation states
  const [isOnBoard, setIsOnBoard] = useState(false);
  const [isSimulating, setIsSimulating] = useState(true);
  const [simProgress, setSimProgress] = useState(0.2); // 0 to 1
  const [busProgress, setBusProgress] = useState(0.1); // 0 to 1
  const [proximityAlertShown, setProximityAlertShown] = useState(false);
  const [show2MinAlert, setShow2MinAlert] = useState(false);
  const [activeBooking, setActiveBooking] = useState(null);

  const routeData = BUS_ROUTES[selectedRouteKey] || BUS_ROUTES.kuvempunagar;

  // Load trains and bookings
  useEffect(() => {
    async function loadData() {
      try {
        const [trainRes, bookRes] = await Promise.all([
          api.get('/passenger/trains'),
          api.get('/passenger/bookings')
        ]);
        if (trainRes.data?.trains && trainRes.data.trains.length > 0) {
          setTrains(trainRes.data.trains);
          setSelectedTrain(trainRes.data.trains[0]);
        }
        if (bookRes.data?.bookings && bookRes.data.bookings.length > 0) {
          setActiveBooking(bookRes.data.bookings[0]);
        }
      } catch (err) {
        console.error('Error loading live tracking data:', err);
      }
    }
    loadData();
  }, []);

  // Timer loop for real-time progress simulation
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      // Progress train
      setSimProgress((prev) => {
        if (prev >= 1) return 1;
        return prev + 0.008;
      });

      // If passenger is on board, progress the bus
      if (isOnBoard) {
        setBusProgress((prev) => {
          const next = prev + 0.015;
          // Check for 2-minute proximity (at around 85% progress)
          if (next >= 0.85 && next < 0.98 && !proximityAlertShown) {
            setShow2MinAlert(true);
            setProximityAlertShown(true);
            // Play proximity chime
            try {
              const AudioCtx = window.AudioContext || window.webkitAudioContext;
              if (AudioCtx) {
                const ctx = new AudioCtx();
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(659.25, ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3);
                gain.gain.setValueAtTime(0.2, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start();
                osc.stop(ctx.currentTime + 0.5);
              }
            } catch (e) {}
          }
          if (next >= 1) return 1;
          return next;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isSimulating, isOnBoard, proximityAlertShown]);

  // Interpolate position along polyline
  const interpolateCoord = (coords, progress) => {
    if (!coords || coords.length === 0) return MYSURU_STATION;
    const totalSegments = coords.length - 1;
    const currentSegmentIndex = Math.min(
      Math.floor(progress * totalSegments),
      totalSegments - 1
    );
    const segmentProgress =
      (progress * totalSegments) - currentSegmentIndex;

    const start = coords[currentSegmentIndex];
    const end = coords[currentSegmentIndex + 1];

    const lat = start[0] + (end[0] - start[0]) * segmentProgress;
    const lng = start[1] + (end[1] - start[1]) * segmentProgress;
    return [lat, lng];
  };

  const currentTrainCoord = interpolateCoord(TRAIN_PATH, simProgress);
  const currentBusCoord = interpolateCoord(routeData.path, busProgress);

  // Computed live metrics
  const trainDistanceRemaining = Math.max(0, ((1 - simProgress) * 14.2)).toFixed(1);
  const trainSpeed = simProgress >= 0.98 ? 0 : 76 + Math.round(Math.sin(simProgress * 10) * 8);

  const busDistanceRemaining = Math.max(0, ((1 - busProgress) * routeData.distanceKm)).toFixed(1);
  const busTimeRemainingMin = Math.max(1, Math.round((1 - busProgress) * 22));
  const busSpeed = !isOnBoard ? 0 : busProgress >= 0.98 ? 0 : 38 + Math.round(Math.cos(busProgress * 8) * 6);

  // Stop passed
  const currentStopIndex = Math.min(
    Math.floor(busProgress * routeData.stops.length),
    routeData.stops.length - 1
  );

  return (
    <div className="space-y-6 pb-12">
      {/* 2-Minute Destination Proximity Alert Modal / Toast */}
      {show2MinAlert && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-[#E52E01]/30 via-[#0e1526] to-[#FE8505]/30 border-2 border-[#E52E01] shadow-2xl animate-pulse-glow text-xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-[#E52E01] animate-ping" />
              <span className="font-extrabold text-[#FFFDE1] text-sm tracking-wide">
                🔔 2 MINUTES TO DESTINATION!
              </span>
            </div>
            <button
              onClick={() => setShow2MinAlert(false)}
              className="text-[#FFFDE1]/80 hover:text-white font-bold px-2 py-0.5 rounded bg-slate-800"
            >
              Acknowledge
            </button>
          </div>
          <p className="text-[#FFFDE1] font-medium leading-relaxed">
            Your feeder bus is approaching{' '}
            <strong className="text-[#FE8505]">{routeData.name}</strong>{' '}
            (approx 2 minutes remaining, 700m away). Please gather your baggage and get ready to alight at the stop!
          </p>
        </div>
      )}

      {/* Page Title & Badges */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded bg-[#FE8505]/10 border border-[#FE8505]/30 text-[#FE8505] text-[11px] font-mono mb-1">
            <Sparkles className="w-3.5 h-3.5 text-[#FE8505]" />
            <span>REAL-TIME INTERCHANGE TELEMETRY</span>
          </div>
          <h1 className="text-2xl font-black text-[#FFFDE1] tracking-wide">
            Live Train & Feeder Bus Tracking
          </h1>
          <p className="text-xs text-[#FFFDE1]/70">
            Real-time GPS telemetry from Indian Railways inbound track to KSRTC City Feeder Bay 3.
          </p>
        </div>

        {/* Live Simulation Controls */}
        <div className="flex items-center space-x-2 bg-[#0e1526] p-1.5 rounded-xl border border-[#3b1d11]">
          <button
            onClick={() => setIsSimulating(!isSimulating)}
            className="px-3 py-1.5 rounded-lg bg-[#FE8505]/20 hover:bg-[#FE8505]/30 text-[#FE8505] font-bold text-xs flex items-center space-x-1.5 transition-colors"
          >
            {isSimulating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isSimulating ? 'Pause GPS' : 'Resume GPS'}</span>
          </button>
          <button
            onClick={() => {
              setSimProgress(0.1);
              setBusProgress(0.1);
              setProximityAlertShown(false);
              setShow2MinAlert(false);
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Reset Simulation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Selector Tabs: Choose Train & Destination */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Train Selector */}
        <div className="p-4 rounded-2xl bg-[#0e1526] border border-[#3b1d11] space-y-2">
          <label className="text-xs font-bold text-[#FFFDE1] flex items-center space-x-2">
            <Train className="w-4 h-4 text-[#FE8505]" />
            <span>Select Inbound Train to Track</span>
          </label>
          <select
            value={selectedTrain?.id || ''}
            onChange={(e) => {
              const found = trains.find((t) => t.id === e.target.value);
              if (found) setSelectedTrain(found);
            }}
            className="w-full bg-[#080c14] border border-[#3b1d11] rounded-xl px-3 py-2 text-xs text-[#FFFDE1] focus:outline-none focus:border-[#FE8505]"
          >
            {trains.map((t) => (
              <option key={t.id} value={t.id}>
                #{t.trainNumber} - {t.trainName} (Plat {t.platform} • Arr: {t.estimatedArrival})
              </option>
            ))}
          </select>
        </div>

        {/* Bus Route Selector */}
        <div className="p-4 rounded-2xl bg-[#0e1526] border border-[#3b1d11] space-y-2">
          <label className="text-xs font-bold text-[#FFFDE1] flex items-center space-x-2">
            <Bus className="w-4 h-4 text-[#FE8505]" />
            <span>Select KSRTC Feeder Bus Route</span>
          </label>
          <select
            value={selectedRouteKey}
            onChange={(e) => {
              setSelectedRouteKey(e.target.value);
              setBusProgress(0.1);
              setProximityAlertShown(false);
            }}
            className="w-full bg-[#080c14] border border-[#3b1d11] rounded-xl px-3 py-2 text-xs text-[#FFFDE1] focus:outline-none focus:border-[#FE8505]"
          >
            <option value="kuvempunagar">KSRTC Route RB-01: Mysuru Jn ➜ Kuvempunagar Complex</option>
            <option value="chamundi">KSRTC Route RB-02: Mysuru Jn ➜ Chamundi Hill Foothills</option>
            <option value="hebbal">KSRTC Route RB-03: Mysuru Jn ➜ Hebbal & Infosys Campus</option>
          </select>
        </div>
      </div>

      {/* Real-time Telemetry Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Train Status Card */}
        <div className="p-5 rounded-2xl bg-[#0e1526] border border-[#FE8505]/30 space-y-3 relative overflow-hidden shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#FE8505]/20 text-[#FE8505] flex items-center justify-center">
                <Train className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-[#FFFDE1]">
                  {selectedTrain?.trainName || 'Shatabdi Express'}
                </span>
                <p className="text-[10px] text-[#FE8505] font-mono">
                  #{selectedTrain?.trainNumber || '12008'} • Platform {selectedTrain?.platform || '1'}
                </p>
              </div>
            </div>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                selectedTrain?.status === 'ON_TIME'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  : 'bg-[#E52E01]/20 text-[#E52E01] border border-[#E52E01]/40'
              }`}
            >
              {selectedTrain?.status === 'ON_TIME' ? 'ON TIME' : `DELAY +${selectedTrain?.delayMinutes || 12}M`}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs pt-2 border-t border-[#3b1d11]">
            <div>
              <span className="text-[10px] text-[#FFFDE1]/60 block">Speed</span>
              <span className="font-mono font-bold text-[#FFFDE1]">{trainSpeed} km/h</span>
            </div>
            <div>
              <span className="text-[10px] text-[#FFFDE1]/60 block">Dist to Mysuru</span>
              <span className="font-mono font-bold text-[#FE8505]">{trainDistanceRemaining} km</span>
            </div>
            <div>
              <span className="text-[10px] text-[#FFFDE1]/60 block">Est. Arrival</span>
              <span className="font-mono font-bold text-[#FFFDE1]">
                {selectedTrain?.estimatedArrival || '13:00'}
              </span>
            </div>
          </div>

          {/* Train Progress Bar */}
          <div className="space-y-1 pt-1">
            <div className="flex items-center justify-between text-[10px] text-[#FFFDE1]/70">
              <span>Approach: Srirangapatna</span>
              <span>{Math.round(simProgress * 100)}% to Platform {selectedTrain?.platform || '1'}</span>
            </div>
            <div className="w-full bg-[#080c14] h-2 rounded-full overflow-hidden border border-[#3b1d11]">
              <div
                className="bg-gradient-to-r from-[#FE8505] to-[#E52E01] h-full transition-all duration-500 rounded-full"
                style={{ width: `${Math.min(100, Math.round(simProgress * 100))}%` }}
              />
            </div>
          </div>
        </div>

        {/* Bus Status Card */}
        <div className="p-5 rounded-2xl bg-[#0e1526] border border-[#FE8505]/30 space-y-3 relative overflow-hidden shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#FE8505]/20 text-[#FE8505] flex items-center justify-center">
                <Bus className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-[#FFFDE1]">
                  KSRTC Feeder Bus KA-09-F-4412
                </span>
                <p className="text-[10px] text-[#FE8505] font-mono">
                  Depot 1 • Bay 3 (KSRTC Portico)
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOnBoard(!isOnBoard)}
              className={`px-3 py-1 rounded-full text-[11px] font-bold border transition-all flex items-center space-x-1.5 shadow-md ${
                isOnBoard
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-500 animate-pulse'
                  : 'bg-[#FE8505] text-[#080c14] hover:bg-[#ff9c2b] border-[#FE8505]'
              }`}
            >
              <span>{isOnBoard ? '✓ ON BOARD (ACTIVE)' : 'I AM INSIDE BUS'}</span>
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs pt-2 border-t border-[#3b1d11]">
            <div>
              <span className="text-[10px] text-[#FFFDE1]/60 block">Bus Speed</span>
              <span className="font-mono font-bold text-[#FFFDE1]">
                {isOnBoard ? `${busSpeed} km/h` : 'At Portico'}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-[#FFFDE1]/60 block">To Destination</span>
              <span className="font-mono font-bold text-[#FE8505]">{busDistanceRemaining} km</span>
            </div>
            <div>
              <span className="text-[10px] text-[#FFFDE1]/60 block">Time to Drop-off</span>
              <span className="font-mono font-bold text-[#FFFDE1]">
                {isOnBoard ? `~${busTimeRemainingMin} mins` : 'Waiting Boarding'}
              </span>
            </div>
          </div>

          {/* Bus Progress Bar */}
          <div className="space-y-1 pt-1">
            <div className="flex items-center justify-between text-[10px] text-[#FFFDE1]/70">
              <span>Next Stop: {routeData.stops[currentStopIndex]}</span>
              <span>{Math.round(busProgress * 100)}% Journey</span>
            </div>
            <div className="w-full bg-[#080c14] h-2 rounded-full overflow-hidden border border-[#3b1d11]">
              <div
                className="bg-gradient-to-r from-[#FE8505] to-[#E52E01] h-full transition-all duration-500 rounded-full"
                style={{ width: `${Math.min(100, Math.round(busProgress * 100))}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Feeder Bus Timetable & Passenger Boarding Times (Requirement 6) */}
      <div className="p-5 rounded-2xl bg-[#0e1526] border border-[#3b1d11] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-[#FE8505]" />
            <h3 className="text-sm font-bold text-[#FFFDE1]">
              Synchronized Bus Timetable & Passenger Schedule
            </h3>
          </div>
          <span className="text-[10px] font-mono text-[#FE8505] bg-[#FE8505]/10 px-2 py-0.5 rounded border border-[#FE8505]/30">
            AUTO-SYNCED TO TRAIN #{selectedTrain?.trainNumber || '12008'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-[#080c14] border border-[#3b1d11] space-y-1">
            <span className="text-[10px] text-[#FFFDE1]/60 block">1. Train Arrival</span>
            <span className="font-mono font-bold text-[#FFFDE1] text-sm">
              {selectedTrain?.estimatedArrival || '13:00'}
            </span>
            <p className="text-[10px] text-slate-400">Platform {selectedTrain?.platform || '1'}</p>
          </div>

          <div className="p-3 rounded-xl bg-[#080c14] border border-[#3b1d11] space-y-1">
            <span className="text-[10px] text-[#FFFDE1]/60 block">2. Boarding Window</span>
            <span className="font-mono font-bold text-[#FE8505] text-sm">13:10 – 13:25</span>
            <p className="text-[10px] text-slate-400">Portico Bay 3 (50m walk)</p>
          </div>

          <div className="p-3 rounded-xl bg-[#080c14] border border-[#3b1d11] space-y-1">
            <span className="text-[10px] text-[#FFFDE1]/60 block">3. Bus Departure</span>
            <span className="font-mono font-bold text-[#FFFDE1] text-sm">13:25 Prompt</span>
            <p className="text-[10px] text-slate-400">Guaranteed departure time</p>
          </div>

          <div className="p-3 rounded-xl bg-[#080c14] border border-[#3b1d11] space-y-1">
            <span className="text-[10px] text-[#FFFDE1]/60 block">4. Passenger Drops-Off</span>
            <span className="font-mono font-bold text-emerald-400 text-sm">13:45 Expected</span>
            <p className="text-[10px] text-slate-400">{routeData.name}</p>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-[#080c14]/80 border border-[#FE8505]/20 flex items-center justify-between text-xs text-[#FFFDE1]">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-[#FE8505]" />
            <span>
              Driver: <strong>Ramesh Kumar H.</strong> • KSRTC Badge #BDG-5409
            </span>
          </div>
          <a
            href="tel:+919448100111"
            className="text-[11px] font-mono text-[#FE8505] hover:underline flex items-center space-x-1"
          >
            <Phone className="w-3 h-3" />
            <span>+91 94481 00111</span>
          </a>
        </div>
      </div>

      {/* Interactive Leaflet Map Canvas */}
      <div className="rounded-3xl border border-[#FE8505]/40 overflow-hidden shadow-2xl relative h-[450px]">
        <MapContainer
          center={[12.3164, 76.6433]}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
        >
          {/* High clarity OpenStreetMap tile layer */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Railway Inbound Track Line */}
          <Polyline
            positions={TRAIN_PATH}
            color="#E52E01"
            weight={4}
            dashArray="6, 8"
            opacity={0.8}
          />

          {/* Bus Route Corridor */}
          <Polyline
            positions={routeData.path}
            color="#FE8505"
            weight={5}
            opacity={0.9}
          />

          {/* Mysuru Junction Station Marker */}
          <Marker position={MYSURU_STATION} icon={createStationIcon()}>
            <Popup>
              <div className="text-xs space-y-1">
                <span className="font-bold text-[#FFFDE1] block">Mysuru Junction (MYS)</span>
                <p className="text-slate-300">Central Interchange & KSRTC Feeder Bay 3</p>
              </div>
            </Popup>
          </Marker>

          {/* Live Train Marker */}
          <Marker position={currentTrainCoord} icon={createTrainIcon()}>
            <Popup>
              <div className="text-xs space-y-1">
                <span className="font-bold text-[#FFFDE1] block">
                  #{selectedTrain?.trainNumber || '12008'} {selectedTrain?.trainName}
                </span>
                <p className="text-[#FE8505] font-mono">
                  Speed: {trainSpeed} km/h • Remaining: {trainDistanceRemaining} km
                </p>
              </div>
            </Popup>
          </Marker>

          {/* Live Bus Marker */}
          <Marker position={currentBusCoord} icon={createBusIcon()}>
            <Popup>
              <div className="text-xs space-y-1">
                <span className="font-bold text-[#FFFDE1] block">
                  KSRTC Feeder Bus KA-09-F-4412
                </span>
                <p className="text-[#FE8505] font-mono">
                  Route: {routeData.name} • {isOnBoard ? `Speed: ${busSpeed} km/h` : 'At Station Bay'}
                </p>
              </div>
            </Popup>
          </Marker>

          {/* Destination Marker */}
          <Marker position={routeData.destinationCoord} icon={createDestIcon()}>
            <Popup>
              <div className="text-xs space-y-1">
                <span className="font-bold text-[#FFFDE1] block">{routeData.name}</span>
                <p className="text-slate-300">Final Drop-off Terminal</p>
              </div>
            </Popup>
          </Marker>

          {/* Intermediate Stops */}
          {routeData.path.slice(1, -1).map((coord, idx) => (
            <CircleMarker
              key={idx}
              center={coord}
              radius={5}
              fillColor="#FE8505"
              color="#FFFDE1"
              weight={1}
              fillOpacity={0.8}
            />
          ))}
        </MapContainer>

        {/* Map Legend Overlay */}
        <div className="absolute bottom-4 left-4 z-[1000] bg-[#0e1526]/90 backdrop-blur-md p-3 rounded-xl border border-[#3b1d11] text-[10px] space-y-1.5 shadow-lg text-[#FFFDE1]">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-1 bg-[#E52E01] rounded inline-block" />
            <span>Railway Inbound Corridor</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-1 bg-[#FE8505] rounded inline-block" />
            <span>KSRTC Feeder Bus Route</span>
          </div>
        </div>
      </div>
    </div>
  );
}
