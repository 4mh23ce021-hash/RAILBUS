import React, { useState, useEffect } from 'react';
import { Users, Search, Filter, ShieldCheck, UserX, UserCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const loadUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      if (res.data?.users) {
        setUsers(res.data.users);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleToggleStatus = async (user) => {
    const newStatus = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    setMsg('');
    setError('');

    try {
      const res = await api.patch(`/admin/users/${user.id}/status`, { status: newStatus });
      if (res.data?.success) {
        setMsg(`User ${user.email} status changed to ${newStatus}.`);
        loadUsers();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user status.');
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchesSearch =
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.phone?.includes(search) ||
      u.id?.includes(search);
    return matchesRole && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center space-x-2">
            <Users className="w-5 h-5 text-cyan-400" />
            <span>User Directory & Access Control</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Registered passenger profiles, conductors, and administrative account permissions.
          </p>
        </div>

        {/* Role Filters */}
        <div className="flex items-center space-x-2 text-xs">
          {['ALL', 'PASSENGER', 'CONDUCTOR', 'ADMIN'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
                roleFilter === r
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'bg-[#0e1526] text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {msg && (
        <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {error && (
        <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by user name, registered phone, email, or account UUID..."
          className="w-full bg-[#0e1526] border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
        />
      </div>

      {/* Users Table */}
      <div className="bg-[#0e1526] rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#090d16] text-slate-400 font-mono text-[11px] border-b border-slate-800">
              <tr>
                <th className="p-3.5">Name / Email</th>
                <th className="p-3.5">Phone</th>
                <th className="p-3.5">Role</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Bookings</th>
                <th className="p-3.5">Registered</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    Loading registered user records...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No matching accounts found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isDemoAdmin = u.email === 'admin@railbus.demo';
                  const isActive = u.status === 'ACTIVE';

                  return (
                    <tr key={u.id} className="hover:bg-slate-900/60 transition-colors">
                      <td className="p-3.5">
                        <span className="font-semibold text-white block">{u.name}</span>
                        <span className="text-[11px] text-slate-400 font-mono">{u.email}</span>
                      </td>
                      <td className="p-3.5 font-mono text-slate-300">{u.phone || 'N/A'}</td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            u.role === 'ADMIN'
                              ? 'bg-purple-950 text-purple-300 border border-purple-800'
                              : u.role === 'CONDUCTOR'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                            isActive
                              ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60'
                              : 'bg-rose-950/60 text-rose-400 border border-rose-800/60'
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono text-slate-400">
                        {u._count?.bookings || 0}
                      </td>
                      <td className="p-3.5 text-slate-400 font-mono text-[11px]">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-3.5 text-right">
                        {!isDemoAdmin ? (
                          <button
                            onClick={() => handleToggleStatus(u)}
                            className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                              isActive
                                ? 'bg-rose-950/30 hover:bg-rose-950/50 text-rose-300 border border-rose-500/30'
                                : 'bg-emerald-950/30 hover:bg-emerald-950/50 text-emerald-300 border border-emerald-500/30'
                            }`}
                          >
                            {isActive ? 'Suspend' : 'Activate'}
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-500 font-mono">Protected Admin</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
