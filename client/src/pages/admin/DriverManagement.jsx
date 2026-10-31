import React, { useState, useEffect } from 'react';
import { UserCog, Phone, ShieldCheck } from 'lucide-react';
import api from '../../services/api';

export default function DriverManagement() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await api.get('/admin/drivers');
        if (res.data?.drivers) setDrivers(res.data.drivers);
      } catch (err) {
        console.error('Failed to load drivers:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-800">
        <h1 className="text-xl font-bold text-white flex items-center space-x-2">
          <UserCog className="w-5 h-5 text-cyan-400" />
          <span>KSRTC Authorized Drivers Registry</span>
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Licensed operations personnel assigned to Railway-to-City shuttle corridors.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {drivers.map((d) => (
          <div key={d.id} className="bg-[#0e1526] rounded-2xl border border-slate-800 p-5 space-y-3 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-white text-base">{d.name}</h3>
                <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                  Lic: {d.licenseNumber}
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                {d.status}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
              <span className="flex items-center space-x-1">
                <Phone className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-mono text-slate-300">{d.phone}</span>
              </span>
              <span className="text-emerald-400 text-[11px] font-semibold">Duty Ready</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
