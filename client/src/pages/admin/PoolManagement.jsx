import React, { useState, useEffect } from 'react';
import {
  Layers,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Train,
  MapPin,
  Bus,
  Search,
  Filter,
  AlertTriangle,
  Send
} from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import api from '../../services/api';

export default function PoolManagement() {
  const [pools, setPools] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [selectedPoolForApproval, setSelectedPoolForApproval] = useState(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [approving, setApproving] = useState(false);
  const [rejectModalPool, setRejectModalPool] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const { realtimeEvents } = useSocket();

  const loadData = async () => {
    try {
      const [poolRes, vehicleRes] = await Promise.all([
        api.get('/admin/pools'),
        api.get('/admin/vehicles')
      ]);
      if (poolRes.data?.pools) setPools(poolRes.data.pools);
      if (vehicleRes.data?.vehicles) {
        setVehicles(vehicleRes.data.vehicles);
        if (vehicleRes.data.vehicles.length > 0) {
          setSelectedVehicleId(vehicleRes.data.vehicles[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load pools:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (realtimeEvents.length > 0) {
      loadData();
    }
  }, [realtimeEvents]);

  const handleApprove = async () => {
    if (!selectedPoolForApproval) return;
    setApproving(true);
    setActionError('');
    setActionSuccess('');

    try {
      const res = await api.post(`/admin/pools/${selectedPoolForApproval.id}/approve`, {
        vehicleId: selectedVehicleId
      });
      if (res.data?.success) {
        setActionSuccess(`Pool ${selectedPoolForApproval.poolCode} approved and vehicle assigned.`);
        setSelectedPoolForApproval(null);
        loadData();
      }
    } catch (err) {
      setActionError(err.response?.data?.message || 'Pool approval failed.');
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async () => {
    if (!rejectModalPool) return;
    setActionError('');
    setActionSuccess('');

    try {
      const res = await api.post(`/admin/pools/${rejectModalPool.id}/reject`, {
        rejectionReason: rejectionReason || 'Operational scheduling constraint'
      });
      if (res.data?.success) {
        setActionSuccess(`Pool ${rejectModalPool.poolCode} rejected.`);
        setRejectModalPool(null);
        setRejectionReason('');
        loadData();
      }
    } catch (err) {
      setActionError(err.response?.data?.message || 'Pool rejection failed.');
    }
  };

  const filteredPools = pools.filter(p => filterStatus === 'ALL' || p.status === filterStatus);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center space-x-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            <span>Passenger Pool Operational Review</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage grouping thresholds (20–56 passengers), vehicle allocation, and dispatch approvals.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
          {['ALL', 'ELIGIBLE_FOR_REVIEW', 'FORMING', 'APPROVED', 'FULL'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
                filterStatus === st
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'bg-[#0e1526] text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              {st.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {actionError && (
        <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Pool Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredPools.map((pool) => {
          const count = pool.currentPassengerCount;
          const maxCap = pool.maxCapacity || 56;
          const minCap = pool.minCapacity || 20;
          const pct = Math.min(100, Math.round((count / maxCap) * 100));
          const isEligible = pool.status === 'ELIGIBLE_FOR_REVIEW';
          const isApproved = pool.status === 'APPROVED';

          return (
            <div
              key={pool.id}
              className={`bg-[#0e1526] rounded-2xl border p-5 space-y-4 shadow-xl transition-all ${
                isEligible
                  ? 'border-amber-500/50 shadow-amber-500/5'
                  : isApproved
                  ? 'border-emerald-500/40'
                  : 'border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950/70 px-2 py-0.5 rounded border border-cyan-800/40">
                    {pool.poolCode}
                  </span>
                  <h3 className="font-bold text-white text-base mt-1.5">{pool.destination?.name}</h3>
                </div>

                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                    pool.status === 'ELIGIBLE_FOR_REVIEW'
                      ? 'bg-amber-950 text-amber-300 border border-amber-800 animate-pulse'
                      : pool.status === 'APPROVED'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                  }`}
                >
                  {pool.status.replace(/_/g, ' ')}
                </span>
              </div>

              {/* Passenger Capacity Gauge */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Demand Volume:</span>
                  <span className="font-mono font-bold text-white">
                    {count} / {maxCap} Seats ({pct}%)
                  </span>
                </div>
                <div className="h-2.5 w-full bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isEligible
                        ? 'bg-gradient-to-r from-amber-500 to-emerald-400'
                        : 'bg-gradient-to-r from-cyan-500 to-blue-500'
                    }`}
                    style={{ width: `${pct}%` }}
                  ></div>
                </div>
              </div>

              {/* Info Details */}
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 pt-2 border-t border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-500 block">Train Arrival</span>
                  <span className="text-slate-200 font-mono">#{pool.train?.trainNumber} ({pool.train?.estimatedArrival})</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Target Window</span>
                  <span className="text-cyan-300 font-mono font-semibold">{pool.targetBoardingWindow || 'Arrival + 15m'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Journey Date</span>
                  <span className="text-slate-200 font-mono">{pool.journeyDate}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Assigned Bus</span>
                  <span className="text-emerald-400 font-mono font-bold">
                    {pool.assignedVehicle?.busNumber || 'Unassigned'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center space-x-2">
                {pool.status !== 'APPROVED' && pool.status !== 'DISPATCHED' && (
                  <button
                    onClick={() => setSelectedPoolForApproval(pool)}
                    className="flex-1 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Approve Pool</span>
                  </button>
                )}

                {pool.status !== 'REJECTED' && pool.status !== 'DISPATCHED' && (
                  <button
                    onClick={() => setRejectModalPool(pool)}
                    className="py-2 px-3 rounded-xl bg-rose-950/20 hover:bg-rose-950/40 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center justify-center space-x-1 transition-colors"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Approval Modal */}
      {selectedPoolForApproval && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0e1526] rounded-2xl border border-cyan-500/40 p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-cyan-400" />
              <span>Authorize Bus Dispatch: {selectedPoolForApproval.poolCode}</span>
            </h3>
            <p className="text-xs text-slate-300">
              Select an available KSRTC vehicle to assign to this pool ({selectedPoolForApproval.currentPassengerCount} passengers).
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                Assign KSRTC Fleet Bus (Cap 56)
              </label>
              <select
                value={selectedVehicleId}
                onChange={(e) => setSelectedVehicleId(e.target.value)}
                className="w-full bg-[#080c14] border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-400 font-mono"
              >
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.busNumber} ({v.registrationNumber}) — {v.status} (Cap: {v.capacity})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setSelectedPoolForApproval(null)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                disabled={approving}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/25 disabled:opacity-50"
              >
                {approving ? 'Confirming...' : 'Confirm Vehicle & Dispatch'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {rejectModalPool && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0e1526] rounded-2xl border border-rose-500/40 p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <XCircle className="w-5 h-5 text-rose-400" />
              <span>Reject Pool: {rejectModalPool.poolCode}</span>
            </h3>
            <p className="text-xs text-slate-300">
              Provide an operational explanation for rejection. This reason will be logged in the audit registry.
            </p>

            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g., Extreme train delay exceeding operational window or vehicle unavailability."
              rows={3}
              className="w-full bg-[#080c14] border border-slate-700 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-rose-400"
            />

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setRejectModalPool(null)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-600/25"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
