import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Flame,
  Bus,
  MapPin,
  TrendingUp,
  Compass,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Users,
  Search,
  Filter
} from 'lucide-react';

const MYSURU_STATION = [12.3164, 76.6433];

// Mysore Hotspots Data with Visitor counts & Bus booking analytics
const MYSORE_HOTSPOTS = [
  {
    id: 'chamundi',
    name: 'Chamundi Hill & Sri Chamundeshwari Temple',
    category: 'Pilgrimage & Scenic',
    coords: [12.2780, 76.6710],
    dailyVisitors: 9800,
    visitorRank: 2,
    busNumber: 'KA-09-F-4412',
    busRank: 1, // #1 Most Booked Feeder Bus!
    busBookings: 412,
    occupancyPct: 96,
    baseFare: 35.0,
    peakHours: '06:30 AM – 11:30 AM & 04:30 PM – 08:30 PM',
    description: 'Prominent hilltop landmark with 1,000 steps, panoramic views of Mysore city, and the ancient 17th-century Chamundeshwari Temple.',
    heatRadius: 1200,
    heatColor: '#E52E01'
  },
  {
    id: 'palace',
    name: 'Mysore Palace (Amba Vilas)',
    category: 'Heritage & Royalty',
    coords: [12.3051, 76.6551],
    dailyVisitors: 14500,
    visitorRank: 1, // #1 Most Visited spot in Mysore
    busNumber: 'KA-09-F-7123',
    busRank: 3,
    busBookings: 342,
    occupancyPct: 88,
    baseFare: 25.0,
    peakHours: '10:00 AM – 05:30 PM & Sunday 07:00 PM Illumination',
    description: 'The world-famous seat of the Wadiyar dynasty, showcasing Indo-Saracenic grandeur, stained glass, and illuminated domes.',
    heatRadius: 1500,
    heatColor: '#FE8505'
  },
  {
    id: 'infosys',
    name: 'Hebbal & Infosys Tech Campus',
    category: 'IT & Industrial Hub',
    coords: [12.3780, 76.5920],
    dailyVisitors: 6200,
    visitorRank: 5,
    busNumber: 'KA-09-F-5589',
    busRank: 2, // #2 Most Booked Feeder Bus!
    busBookings: 386,
    occupancyPct: 92,
    baseFare: 45.0,
    peakHours: '08:00 AM – 10:30 AM & 05:00 PM – 07:30 PM',
    description: 'Largest corporate education facility in the world and high-density IT innovation cluster in Hebbal KIADB.',
    heatRadius: 1100,
    heatColor: '#FE8505'
  },
  {
    id: 'zoo',
    name: 'Sri Chamarajendra Zoological Gardens (Mysore Zoo)',
    category: 'Wildlife & Nature',
    coords: [12.3020, 76.6640],
    dailyVisitors: 8200,
    visitorRank: 3,
    busNumber: 'KA-09-F-5589',
    busRank: 4,
    busBookings: 298,
    occupancyPct: 82,
    baseFare: 30.0,
    peakHours: '09:30 AM – 04:30 PM (Closed Tuesdays)',
    description: 'Historic 157-acre botanical and animal garden founded in 1892, housing giraffes, tigers, rhinos, and avian sanctuaries.',
    heatRadius: 950,
    heatColor: '#FE8505'
  },
  {
    id: 'brindavan',
    name: 'Brindavan Gardens & KRS Dam',
    category: 'Tourism & Leisure',
    coords: [12.4244, 76.5744],
    dailyVisitors: 7500,
    visitorRank: 4,
    busNumber: 'KA-09-F-8890',
    busRank: 5,
    busBookings: 286,
    occupancyPct: 79,
    baseFare: 45.0,
    peakHours: '05:00 PM – 08:30 PM (Fountain Illumination)',
    description: 'Tiered symmetrical terrace gardens laid out across the Kaveri river dam with dancing musical fountains.',
    heatRadius: 1000,
    heatColor: '#E52E01'
  },
  {
    id: 'kuvempunagar',
    name: 'Kuvempunagar Cultural & Commercial Hub',
    category: 'City Centre & Commute',
    coords: [12.2855, 76.6265],
    dailyVisitors: 5100,
    visitorRank: 7,
    busNumber: 'KA-09-F-7123',
    busRank: 6,
    busBookings: 264,
    occupancyPct: 76,
    baseFare: 35.0,
    peakHours: '08:30 AM – 01:00 PM & 04:30 PM – 09:00 PM',
    description: 'Vibrant cultural, culinary, and commercial district with major university transit connectivity.',
    heatRadius: 850,
    heatColor: '#FE8505'
  },
  {
    id: 'philomena',
    name: "St. Philomena's Cathedral",
    category: 'Heritage & Faith',
    coords: [12.3210, 76.6580],
    dailyVisitors: 4800,
    visitorRank: 6,
    busNumber: 'KA-09-F-4412',
    busRank: 7,
    busBookings: 194,
    occupancyPct: 70,
    baseFare: 25.0,
    peakHours: '09:00 AM – 12:30 PM & 03:30 PM – 06:00 PM',
    description: 'Neo-Gothic architectural marvel with 175-foot spires inspired by the Cologne Cathedral in Germany.',
    heatRadius: 750,
    heatColor: '#FE8505'
  },
  {
    id: 'gokulam',
    name: 'Gokulam Yoga & Heritage Quarter',
    category: 'Wellness & Culture',
    coords: [12.3320, 76.6270],
    dailyVisitors: 3400,
    visitorRank: 8,
    busNumber: 'KA-09-F-8890',
    busRank: 8,
    busBookings: 152,
    occupancyPct: 65,
    baseFare: 30.0,
    peakHours: '07:00 AM – 11:00 AM & 05:00 PM – 08:00 PM',
    description: 'International capital of Ashtanga yoga, artisanal cafes, and leafy tranquil residential avenues.',
    heatRadius: 700,
    heatColor: '#FE8505'
  },
  {
    id: 'karanji',
    name: 'Karanji Lake & Nature Butterfly Park',
    category: 'Ecology & Parks',
    coords: [12.3040, 76.6730],
    dailyVisitors: 2900,
    visitorRank: 9,
    busNumber: 'KA-09-F-4412',
    busRank: 9,
    busBookings: 128,
    occupancyPct: 60,
    baseFare: 30.0,
    peakHours: '08:30 AM – 11:30 AM & 03:00 PM – 05:30 PM',
    description: 'Serene natural lake with Indias largest walk-through aviary, butterfly nursery, and boating docks.',
    heatRadius: 650,
    heatColor: '#FE8505'
  }
];

// Custom Station Marker
const stationIcon = L.divIcon({
  className: 'mysore-station-heat',
  html: `
    <div style="background: #080c14; width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; border: 2.5px solid #FE8505; box-shadow: 0 0 15px rgba(254, 133, 5, 0.7);">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFDE1" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <rect x="4" y="3" width="16" height="16" rx="2"></rect>
        <path d="M4 11h16"></path>
        <path d="M12 3v8"></path>
        <circle cx="8" cy="15" r="1"></circle>
        <circle cx="16" cy="15" r="1"></circle>
      </svg>
    </div>
  `,
  iconSize: [36, 36],
  iconAnchor: [18, 18]
});

// Custom Hotspot Marker
const createHotspotIcon = (rank, isTop) =>
  L.divIcon({
    className: 'hotspot-heat-marker',
    html: `
      <div style="background: ${isTop ? '#E52E01' : '#FE8505'}; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2.5px solid #FFFDE1; box-shadow: 0 0 16px ${isTop ? 'rgba(229, 46, 1, 0.8)' : 'rgba(254, 133, 5, 0.7)'}; font-weight: 900; font-family: monospace; color: #FFFDE1; font-size: 13px;">
        #${rank}
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });

export default function MysoreHeatmap() {
  const [selectedSpot, setSelectedSpot] = useState(MYSORE_HOTSPOTS[0]);
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSpots = MYSORE_HOTSPOTS.filter((spot) => {
    const matchesFilter =
      filterCategory === 'ALL' ||
      (filterCategory === 'TOURISM' && (spot.category.includes('Heritage') || spot.category.includes('Tourism') || spot.category.includes('Wildlife'))) ||
      (filterCategory === 'PILGRIMAGE' && spot.category.includes('Pilgrimage')) ||
      (filterCategory === 'TECH' && spot.category.includes('IT')) ||
      (filterCategory === 'CITY' && spot.category.includes('City'));
    const matchesSearch =
      spot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      spot.busNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      spot.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Top Bus ranking from railway station
  const rankedBuses = [...MYSORE_HOTSPOTS].sort((a, b) => b.busBookings - a.busBookings);

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded bg-[#FE8505]/10 border border-[#FE8505]/30 text-[#FE8505] text-[11px] font-mono mb-1">
            <Flame className="w-3.5 h-3.5 text-[#E52E01]" />
            <span>MYSURU MOBILITY & TOURISM HEATMAP</span>
          </div>
          <h1 className="text-2xl font-black text-[#FFFDE1] tracking-wide">
            Mysuru Popularity Heatmap & Feeder Bus Demand
          </h1>
          <p className="text-xs text-[#FFFDE1]/70">
            Discover the most visited destinations across Mysuru and track which KSRTC Feeder Bus has the highest passenger bookings directly from Mysuru Junction.
          </p>
        </div>

        <Link
          to="/passenger/trains"
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#FE8505] to-[#E52E01] text-[#080c14] hover:text-white font-extrabold text-xs shadow-lg shadow-[#FE8505]/20 flex items-center space-x-1.5 transition-all"
        >
          <span>Book Feeder Shuttle</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#0e1526] p-3 rounded-2xl border border-[#3b1d11]">
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {[
            { label: 'All Hotspots', value: 'ALL' },
            { label: 'Tourist & Heritage', value: 'TOURISM' },
            { label: 'Pilgrimage', value: 'PILGRIMAGE' },
            { label: 'IT & Work Hubs', value: 'TECH' },
            { label: 'City Transit', value: 'CITY' }
          ].map((pill) => (
            <button
              key={pill.value}
              onClick={() => setFilterCategory(pill.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterCategory === pill.value
                  ? 'bg-[#FE8505] text-[#080c14]'
                  : 'bg-[#080c14] text-[#FFFDE1]/80 hover:text-white hover:bg-[#162038]'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search hotspot, bus #, area..."
            className="w-full bg-[#080c14] border border-[#3b1d11] rounded-xl pl-9 pr-3 py-1.5 text-xs text-[#FFFDE1] placeholder-slate-500 focus:outline-none focus:border-[#FE8505]"
          />
        </div>
      </div>

      {/* Main Grid: Interactive Map (Left/Center) + Bus Leaderboard & Spot Details (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pure Map Feeling Leaflet Container (2 cols on desktop) */}
        <div className="lg:col-span-2 rounded-3xl border border-[#FE8505]/40 overflow-hidden shadow-2xl relative h-[560px]">
          <MapContainer
            center={[12.3164, 76.6433]}
            zoom={12}
            style={{ height: '100%', width: '100%' }}
            zoomControl={true}
          >
            {/* Pure travel map OpenStreetMap tile layer */}
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Mysuru Junction Station Marker */}
            <Marker position={MYSURU_STATION} icon={stationIcon}>
              <Popup>
                <div className="text-xs space-y-1">
                  <span className="font-bold text-[#FFFDE1] block">
                    Mysuru Junction Railway Station (MYS)
                  </span>
                  <p className="text-[#FE8505] font-mono">
                    KSRTC Portico Interchange (Bays 3 & 4)
                  </p>
                </div>
              </Popup>
            </Marker>

            {/* Hotspots & Density Heat Circles */}
            {filteredSpots.map((spot) => {
              const isSelected = selectedSpot?.id === spot.id;
              const isTop = spot.busRank === 1;

              return (
                <React.Fragment key={spot.id}>
                  {/* Heatmap Density Circle */}
                  <Circle
                    center={spot.coords}
                    radius={spot.heatRadius}
                    pathOptions={{
                      color: spot.heatColor,
                      fillColor: spot.heatColor,
                      fillOpacity: isSelected ? 0.35 : 0.18,
                      weight: isSelected ? 2 : 1
                    }}
                  />

                  {/* Connecting Route Line from Railway Station to Hotspot */}
                  <Polyline
                    positions={[MYSURU_STATION, spot.coords]}
                    pathOptions={{
                      color: spot.heatColor,
                      weight: isSelected ? 3.5 : 1.5,
                      dashArray: isSelected ? undefined : '5, 8',
                      opacity: isSelected ? 0.9 : 0.4
                    }}
                  />

                  {/* Hotspot Marker */}
                  <Marker
                    position={spot.coords}
                    icon={createHotspotIcon(spot.visitorRank, isTop)}
                    eventHandlers={{
                      click: () => setSelectedSpot(spot)
                    }}
                  >
                    <Popup>
                      <div className="text-xs space-y-2 max-w-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono text-[#FE8505] bg-[#FE8505]/10 px-2 py-0.5 rounded font-bold">
                            VISITOR RANK #{spot.visitorRank}
                          </span>
                          <span className="font-bold text-white text-[11px]">
                            {spot.dailyVisitors.toLocaleString()} Daily
                          </span>
                        </div>
                        <h4 className="font-bold text-[#FFFDE1] text-sm">
                          {spot.name}
                        </h4>
                        <p className="text-[#FFFDE1]/80 text-[11px]">
                          {spot.description}
                        </p>
                        <div className="pt-2 border-t border-slate-700 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-slate-400 block">KSRTC Feeder Bus</span>
                            <span className="font-mono font-bold text-[#FE8505]">
                              #{spot.busNumber} ({spot.busBookings} bookings)
                            </span>
                          </div>
                          <Link
                            to={`/passenger/destination?hotspot=${spot.id}`}
                            className="px-2.5 py-1 rounded bg-[#FE8505] text-[#080c14] font-bold text-[10px]"
                          >
                            Book Bus
                          </Link>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                </React.Fragment>
              );
            })}
          </MapContainer>

          {/* Floating Pure Map Heat Indicator Overlay */}
          <div className="absolute top-4 left-4 z-[1000] bg-[#0e1526]/90 backdrop-blur-md px-3 py-2 rounded-xl border border-[#3b1d11] text-[10px] space-y-1 text-[#FFFDE1] shadow-xl">
            <span className="font-mono text-[#FE8505] font-bold block uppercase tracking-wider">
              Heat Intensity
            </span>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-[#E52E01] inline-block" />
              <span>Very High Demand (Pilgrim / Heritage Hotspot)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-[#FE8505] inline-block" />
              <span>High Feeder Bus Commute (IT / City Core)</span>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Selected Hotspot Details & Feeder Bus Booking Leaderboard */}
        <div className="space-y-4">
          {/* Selected Hotspot Profile Card */}
          {selectedSpot && (
            <div className="p-5 rounded-2xl bg-[#0e1526] border border-[#FE8505]/40 space-y-3.5 shadow-xl">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono text-[#FE8505] bg-[#FE8505]/15 px-2 py-0.5 rounded border border-[#FE8505]/30">
                    {selectedSpot.category}
                  </span>
                  <h3 className="font-bold text-base text-[#FFFDE1] mt-1.5">
                    {selectedSpot.name}
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block font-mono">POPULARITY</span>
                  <span className="font-mono font-black text-sm text-[#E52E01]">
                    #{selectedSpot.visitorRank} in Mysuru
                  </span>
                </div>
              </div>

              <p className="text-xs text-[#FFFDE1]/80 leading-relaxed">
                {selectedSpot.description}
              </p>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-[#3b1d11]">
                <div>
                  <span className="text-[10px] text-slate-400 block">Daily Visitors</span>
                  <span className="font-mono font-bold text-[#FFFDE1]">
                    ~{selectedSpot.dailyVisitors.toLocaleString()} tourists
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Feeder Base Fare</span>
                  <span className="font-mono font-bold text-emerald-400">
                    ₹{selectedSpot.baseFare.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Dedicated Bus Info */}
              <div className="p-3 rounded-xl bg-[#080c14] border border-[#3b1d11] space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-[10px]">Assigned KSRTC Feeder Bus:</span>
                  <span className="font-mono font-bold text-[#FE8505]">
                    Bus #{selectedSpot.busNumber}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-[10px]">Today's Passenger Bookings:</span>
                  <span className="font-mono font-bold text-[#FFFDE1]">
                    {selectedSpot.busBookings} bookings ({selectedSpot.occupancyPct}% full)
                  </span>
                </div>
                <div className="w-full bg-[#162038] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[#FE8505] to-[#E52E01] h-full rounded-full"
                    style={{ width: `${selectedSpot.occupancyPct}%` }}
                  />
                </div>
              </div>

              <div className="text-[11px] text-slate-400 flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-[#FE8505]" />
                <span>Peak Hours: {selectedSpot.peakHours}</span>
              </div>

              <Link
                to={`/passenger/destination?hotspot=${selectedSpot.id}`}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#FE8505] to-[#E52E01] text-[#080c14] hover:text-white font-extrabold text-xs text-center block shadow-lg transition-all"
              >
                Book Feeder Bus to {selectedSpot.name.split(' ')[0]}
              </Link>
            </div>
          )}

          {/* Feeder Bus Booking Leaderboard: Which bus has more bookings from Railway Station (Requirement 9) */}
          <div className="p-4 rounded-2xl bg-[#0e1526] border border-[#3b1d11] space-y-3 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#3b1d11] pb-2">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-[#FE8505]" />
                <h4 className="text-xs font-bold text-[#FFFDE1]">
                  Bus Bookings From Railway Station
                </h4>
              </div>
              <span className="text-[10px] font-mono text-[#FE8505]">TOP RANKED</span>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {rankedBuses.slice(0, 5).map((bus, idx) => (
                <div
                  key={bus.id}
                  onClick={() => setSelectedSpot(bus)}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between text-xs ${
                    selectedSpot?.id === bus.id
                      ? 'bg-[#FE8505]/15 border-[#FE8505]'
                      : 'bg-[#080c14] border-[#3b1d11] hover:border-slate-600'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-1.5">
                      <span className="font-mono font-bold text-[10px] text-[#FE8505]">
                        #{idx + 1} Bus {bus.busNumber}
                      </span>
                      {idx === 0 && (
                        <span className="text-[9px] px-1 py-0.2 rounded bg-[#E52E01]/30 text-[#E52E01] font-bold">
                          HIGHEST DEMAND
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-[#FFFDE1] font-medium block truncate max-w-[160px]">
                      ➜ {bus.name}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="font-mono font-bold text-xs text-[#FFFDE1] block">
                      {bus.busBookings}
                    </span>
                    <span className="text-[10px] text-slate-400">bookings</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
