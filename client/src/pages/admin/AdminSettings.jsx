import React from 'react';
import { Settings, Shield, Server, Database, Radio, CreditCard, Layers } from 'lucide-react';

export default function AdminSettings() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="pb-4 border-b border-slate-800">
        <h1 className="text-xl font-bold text-white flex items-center space-x-2">
          <Settings className="w-5 h-5 text-cyan-400" />
          <span>Platform Architecture & Control Settings</span>
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Core runtime configuration parameters for the RAILBUS Mobility Platform.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Dynamic Pooling Parameters */}
        <div className="bg-[#0e1526] p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center space-x-2 text-cyan-400">
            <Layers className="w-4 h-4" />
            <h3 className="text-sm font-bold text-white">Dynamic Pooling Engine</h3>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Min Threshold (Review):</span>
              <span className="font-mono text-cyan-300 font-bold">20 Passengers</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Max Capacity (Hard Cap):</span>
              <span className="font-mono text-emerald-400 font-bold">56 Passengers</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Auto-Spillover:</span>
              <span className="font-mono text-slate-200">Enabled (&gt;56 Pax)</span>
            </div>
          </div>
        </div>

        {/* External Integrations */}
        <div className="bg-[#0e1526] p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center space-x-2 text-cyan-400">
            <Radio className="w-4 h-4" />
            <h3 className="text-sm font-bold text-white">External Gateways</h3>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">RailRadar Telemetry:</span>
              <span className="font-mono text-amber-300">Simulated / Fallback</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Razorpay Gateway:</span>
              <span className="font-mono text-emerald-400">Test Mode (HMAC SHA256)</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Map & Geocoding:</span>
              <span className="font-mono text-cyan-300">OpenStreetMap / Nominatim</span>
            </div>
          </div>
        </div>

        {/* Station Interchange Config */}
        <div className="bg-[#0e1526] p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center space-x-2 text-cyan-400">
            <Server className="w-4 h-4" />
            <h3 className="text-sm font-bold text-white">Station Interchange Coordinates</h3>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Station Code:</span>
              <span className="text-white font-bold">MYS (Mysuru Junction)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">GPS Coordinates:</span>
              <span className="text-cyan-300">12.3164° N, 76.6433° E</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Designated Boarding:</span>
              <span className="text-emerald-300">Platform Portico Bay 3 & 4</span>
            </div>
          </div>
        </div>

        {/* Security & Access */}
        <div className="bg-[#0e1526] p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center space-x-2 text-cyan-400">
            <Shield className="w-4 h-4" />
            <h3 className="text-sm font-bold text-white">Security & Permissions</h3>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Role Isolation:</span>
              <span className="font-mono text-emerald-400">Strict (Passenger/Admin/Conductor)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Password Hashing:</span>
              <span className="font-mono text-slate-300">Bcrypt (Salt 12)</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Session Strategy:</span>
              <span className="font-mono text-cyan-300">JWT (7 Days Expiry)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
