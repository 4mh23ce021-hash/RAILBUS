import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Clock, ArrowRight, Compass, CheckCircle2, ChevronRight, Sparkles } from 'lucide-react';
import api from '../../services/api';

const stationIcon = L.divIcon({
  className: 'dest-station-marker',
  html: `
    <div style="background: #080c14; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2.5px solid #FE8505; box-shadow: 0 0 12px rgba(254, 133, 5, 0.6);">
      <span style="color: #FFFDE1; font-weight: 900; font-size: 10px; font-family: monospace;">MYS</span>
    </div>
  `,
  iconSize: [34, 34],
  iconAnchor: [17, 17]
});

const destIcon = L.divIcon({
  className: 'dest-pin-marker',
  html: `
    <div style="background: #E52E01; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid #FFFDE1; box-shadow: 0 0 10px rgba(229, 46, 1, 0.6);">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFFDE1" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
        <circle cx="12" cy="10" r="3"></circle>
      </svg>
    </div>
  `,
  iconSize: [28, 28],
  iconAnchor: [14, 14]
});

export default function DestinationSelection() {
  const [searchParams] = useSearchParams();
  const trainId = searchParams.get('trainId');
  const [destinations, setDestinations] = useState([]);
  const [selectedDest, setSelectedDest] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadDestinations() {
      try {
        const res = await api.get('/passenger/destinations');
        if (res.data?.destinations) {
          setDestinations(res.data.destinations);
          if (res.data.destinations.length > 0) {
            setSelectedDest(res.data.destinations[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load destinations:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDestinations();
  }, []);

  const handleProceed = (destination) => {
    const url = trainId
      ? `/passenger/booking?trainId=${trainId}&destinationId=${destination.id}`
      : `/passenger/trains?destinationId=${destination.id}`;
    navigate(url);
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-[#FE8505]/15 border border-[#FE8505]/30 text-[#FE8505] text-[11px] font-mono font-bold mb-1">
          <Sparkles className="w-3.5 h-3.5 text-[#FE8505]" />
          <span>KSRTC CITY INTERCHANGE NETWORK</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-[#FFFDE1] flex items-center space-x-2">
          <MapPin className="w-5 h-5 text-[#FE8505]" />
          <span>Select Mysuru City Destination</span>
        </h1>
        <p className="text-xs text-[#FFFDE1]/70 mt-1">
          Interactive network map of guaranteed KSRTC city connector drop-off corridors.
        </p>
      </div>

      {/* Interactive Leaflet Map */}
      <div className="rounded-3xl overflow-hidden border border-[#FE8505]/40 shadow-2xl h-72 sm:h-80 relative z-10">
        <MapContainer
          center={[12.3164, 76.6433]} // Mysuru Junction
          zoom={12}
          scrollWheelZoom={false}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Origin Marker: Mysuru Junction */}
          <Marker position={[12.3164, 76.6433]} icon={stationIcon}>
            <Popup>
              <div className="text-xs font-sans text-slate-100">
                <strong className="text-[#FE8505]">Mysuru Junction (MYS)</strong>
                <p>KSRTC Feeder Bay 3 & 4</p>
              </div>
            </Popup>
          </Marker>

          {/* Destination Markers */}
          {destinations.map((dest) => (
            <Marker
              key={dest.id}
              position={[dest.latitude, dest.longitude]}
              icon={destIcon}
              eventHandlers={{
                click: () => setSelectedDest(dest)
              }}
            >
              <Popup>
                <div className="text-xs font-sans text-slate-100">
                  <strong className="text-[#FE8505]">{dest.name}</strong>
                  <p>₹{dest.baseFare} • ~{dest.estimatedTravelMinutes} mins</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Destination Grid */}
      <div className="space-y-3">
        <h2 className="text-sm font-black text-[#FFFDE1]">Available City Corridors</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {destinations.map((dest) => {
            const isSelected = selectedDest?.id === dest.id;
            return (
              <div
                key={dest.id}
                onClick={() => setSelectedDest(dest)}
                className={`p-5 rounded-3xl border transition-all cursor-pointer space-y-2.5 shadow-xl ${
                  isSelected
                    ? 'bg-[#162038] border-[#FE8505] shadow-lg shadow-[#FE8505]/15'
                    : 'bg-[#0e1526] border-[#3b1d11] hover:border-[#FE8505]/50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-[#FFFDE1] text-base">{dest.name}</h3>
                    <p className="text-[11px] text-slate-400">{dest.category}</p>
                  </div>
                  <span className="font-mono text-base font-black text-emerald-400">
                    ₹{dest.baseFare}
                  </span>
                </div>

                <p className="text-xs text-[#FFFDE1]/80 line-clamp-1">{dest.address}</p>

                <div className="pt-2 border-t border-[#3b1d11] flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-1.5 text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-[#FE8505]" />
                    <span>~{dest.estimatedTravelMinutes} mins transit</span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleProceed(dest);
                    }}
                    className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#FE8505] to-[#E52E01] text-[#080c14] hover:text-white font-extrabold text-xs flex items-center space-x-1.5 transition-all shadow-md"
                  >
                    <span>Proceed</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
