import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Train,
  Search,
  Clock,
  ArrowRight,
  ShieldCheck,
  MapPin,
  AlertCircle,
  Layers,
  Sparkles,
  Zap,
  CheckCircle2
} from 'lucide-react';
import api from '../../services/api';

export default function TrainSelection() {
  const [trains, setTrains] = useState([]);
  const [syncGroups, setSyncGroups] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('ALL'); // 'ALL' or 'MULTI_SYNC'
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchTrains() {
      try {
        const [trainRes, syncRes] = await Promise.all([
          api.get('/passenger/trains'),
          api.get('/passenger/trains/multi-sync')
        ]);
        if (trainRes.data?.trains) {
          setTrains(trainRes.data.trains);
        }
        if (syncRes.data?.syncGroups) {
          setSyncGroups(syncRes.data.syncGroups);
        }
      } catch (err) {
        console.error('Failed to load trains:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchTrains();
  }, []);

  const filteredTrains = trains.filter(
    (t) =>
      t.trainName.toLowerCase().includes(search.toLowerCase()) ||
      t.trainNumber.includes(search) ||
      t.sourceStation.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelectTrain = (train) => {
    navigate(`/passenger/destination?trainId=${train.id}`);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded bg-[#FE8505]/10 border border-[#FE8505]/30 text-[#FE8505] text-[11px] font-mono mb-1">
            <Sparkles className="w-3.5 h-3.5 text-[#FE8505]" />
            <span>MYSURU JUNCTION PLATFORMS 1–4</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#FFFDE1] flex items-center space-x-2">
            <Train className="w-5 h-5 text-[#FE8505]" />
            <span>Select Your Inbound Train</span>
          </h1>
          <p className="text-xs text-[#FFFDE1]/70 mt-1">
            Pick your train arriving at Mysuru Junction to synchronize your KSRTC city bus shuttle.
          </p>
        </div>

        {/* View Switcher: All Trains vs Multi-Train Sync */}
        <div className="flex items-center bg-[#0e1526] p-1 rounded-xl border border-[#3b1d11] text-xs">
          <button
            onClick={() => setViewMode('ALL')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              viewMode === 'ALL'
                ? 'bg-[#FE8505] text-[#080c14]'
                : 'text-[#FFFDE1]/70 hover:text-white'
            }`}
          >
            All Inbound Trains
          </button>
          <button
            onClick={() => setViewMode('MULTI_SYNC')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center space-x-1.5 ${
              viewMode === 'MULTI_SYNC'
                ? 'bg-[#FE8505] text-[#080c14]'
                : 'text-[#FFFDE1]/70 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Multi-Train Sync (≤10 Min Gap)</span>
          </button>
        </div>
      </div>

      {/* Multi-Train Platform Synchronization Matrix Banner (Requirement 8) */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-[#1c120c] via-[#0e1526] to-[#1a111a] border border-[#FE8505]/40 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#FE8505]/20 text-[#FE8505] flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-xs text-[#FFFDE1]">
                Multi-Train Cross-Platform Synchronization
              </span>
              <p className="text-[10px] text-[#FE8505] font-mono">
                10-Minute Maximum Arrival Gap Threshold Rule
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold bg-[#FE8505]/15 text-[#FE8505] px-2.5 py-0.5 rounded border border-[#FE8505]/30">
            AUTO-POOLING ACTIVE
          </span>
        </div>

        <p className="text-xs text-[#FFFDE1]/80 leading-relaxed">
          When 2 or more trains arrive on different platforms within a <strong>maximum of 10 minutes gap</strong>, passengers heading toward common city destinations share a <strong>single coordinated KSRTC feeder bus</strong>. If one train gets delayed beyond 10 minutes, the first train's passengers depart on time with their dedicated bus!
        </p>
      </div>

      {/* Multi-Train Sync View (Requirement 8) */}
      {viewMode === 'MULTI_SYNC' && (
        <div className="space-y-4">
          <h3 className="text-xs font-mono font-bold text-[#FE8505] uppercase tracking-wider">
            Detected Cross-Platform Pairings at Mysuru Junction:
          </h3>

          {syncGroups.length === 0 ? (
            <div className="p-6 text-center text-slate-400 bg-[#0e1526] rounded-2xl border border-[#3b1d11]">
              Scanning for synchronized train arrivals...
            </div>
          ) : (
            syncGroups.map((g, idx) => {
              const isSync = g.status === 'SYNC_ACTIVE';
              const t1 = g.primaryTrain;
              const t2 = g.synchronizedTrains[0];

              return (
                <div
                  key={idx}
                  className={`p-5 rounded-3xl border transition-all space-y-3.5 shadow-xl ${
                    isSync
                      ? 'bg-[#0e1526] border-[#FE8505]/50 hover:border-[#FE8505]'
                      : 'bg-[#0e1526] border-[#3b1d11]'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                          isSync
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : 'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}
                      >
                        {isSync
                          ? `SHARED FEEDER BUS ACTIVE (${g.arrivalGapMinutes} MIN ARRIVAL GAP ≤ 10M)`
                          : `SPLIT DUE TO DELAY (${g.arrivalGapMinutes} MIN GAP > 10M)`}
                      </span>
                      <h4 className="font-bold text-base text-[#FFFDE1] mt-1.5">
                        {g.busAllocation}
                      </h4>
                    </div>
                  </div>

                  {/* The Two Trains */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                    <div
                      onClick={() => handleSelectTrain(t1)}
                      className="p-3 rounded-2xl bg-[#080c14] border border-[#3b1d11] hover:border-[#FE8505] cursor-pointer space-y-1 transition-colors"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-mono text-[#FE8505] font-bold">
                          Platform {t1.platform}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Arr: {t1.estimatedArrival}
                        </span>
                      </div>
                      <span className="font-bold text-[#FFFDE1] block">
                        #{t1.trainNumber} - {t1.trainName}
                      </span>
                      <span className="text-[10px] text-slate-400">From {t1.sourceStation}</span>
                    </div>

                    {t2 && (
                      <div
                        onClick={() => handleSelectTrain(t2)}
                        className="p-3 rounded-2xl bg-[#080c14] border border-[#3b1d11] hover:border-[#FE8505] cursor-pointer space-y-1 transition-colors"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-mono text-[#FE8505] font-bold">
                            Platform {t2.platform}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            Arr: {t2.estimatedArrival}
                          </span>
                        </div>
                        <span className="font-bold text-[#FFFDE1] block">
                          #{t2.trainNumber} - {t2.trainName}
                        </span>
                        <span className="text-[10px] text-slate-400">From {t2.sourceStation}</span>
                      </div>
                    )}
                  </div>

                  <p className="text-[11px] text-[#FFFDE1]/80 leading-relaxed">
                    {g.notes}
                  </p>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Standard Train Search & List View */}
      {viewMode === 'ALL' && (
        <>
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by train number, name, or source station..."
              className="w-full bg-[#0e1526] border border-[#3b1d11] rounded-2xl pl-10 pr-4 py-3 text-sm text-[#FFFDE1] placeholder-slate-500 focus:outline-none focus:border-[#FE8505] transition-all"
            />
          </div>

          {/* Train Cards List */}
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-12 text-[#FFFDE1]/60 text-sm">
                Fetching train schedules and live delay telemetry...
              </div>
            ) : filteredTrains.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm bg-[#0e1526] rounded-2xl border border-[#3b1d11]">
                No matching trains found for "{search}".
              </div>
            ) : (
              filteredTrains.map((train) => (
                <div
                  key={train.id}
                  onClick={() => handleSelectTrain(train)}
                  className="p-5 rounded-3xl bg-[#0e1526] border border-[#3b1d11] hover:border-[#FE8505] hover:bg-[#162038] transition-all cursor-pointer group space-y-3 shadow-xl"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-mono font-bold text-[#FE8505] bg-[#FE8505]/15 px-2 py-0.5 rounded border border-[#FE8505]/30">
                          #{train.trainNumber}
                        </span>
                        <span className="text-xs font-mono text-[#FFFDE1]/80 font-bold">
                          Platform {train.platform}
                        </span>
                      </div>
                      <h3 className="text-base font-black text-[#FFFDE1] group-hover:text-[#FE8505] transition-colors mt-1">
                        {train.trainName}
                      </h3>
                    </div>

                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                        train.status === 'ON_TIME'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-[#E52E01]/20 text-[#E52E01] border border-[#E52E01]/40'
                      }`}
                    >
                      {train.status === 'ON_TIME'
                        ? 'ON TIME'
                        : `DELAY +${train.delayMinutes} MIN`}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-[#FFFDE1]/80 pt-2 border-t border-[#3b1d11]">
                    <div>
                      <span className="block text-[10px] text-slate-400">Origin Station</span>
                      <span className="text-[#FFFDE1] font-medium">{train.sourceStation}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-400">Scheduled Arrival</span>
                      <span className="text-[#FFFDE1] font-mono">{train.scheduledArrival}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-400">Estimated Arrival</span>
                      <span className="text-[#FE8505] font-mono font-bold">
                        {train.estimatedArrival}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 text-xs">
                    <span className="text-[10px] text-slate-400 font-mono">
                      Feeder Shuttle Bay 3 Synchronized
                    </span>
                    <span className="font-extrabold text-[#FE8505] group-hover:text-[#ff9c2b] flex items-center space-x-1">
                      <span>Select Train & Route</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
