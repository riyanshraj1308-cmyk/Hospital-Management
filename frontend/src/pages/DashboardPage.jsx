import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../utils/api';
import { useAuth } from '../hooks/useAuth';

const StatCard = ({ icon, label, value, sub, color }) => (
  <div className="stat-card">
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 ${color}`}>{icon}</div>
    <div>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-2xl font-display font-bold text-slate-900">{value ?? '—'}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [apptChart, setApptChart] = useState([]);
  const [revenueChart, setRevenueChart] = useState([]);
  const [deptStats, setDeptStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/dashboard/stats'),
      api.get('/dashboard/appointments-chart'),
      api.get('/dashboard/revenue-chart'),
      api.get('/dashboard/department-stats'),
    ]).then(([s, a, r, d]) => {
      setStats(s.data);
      setApptChart(a.data);
      setRevenueChart(r.data);
      setDeptStats(d.data);
    }).finally(() => setLoading(false));
  }, []);

  const fmt = (n) => n >= 1000 ? `₹${(n / 1000).toFixed(1)}K` : `₹${n}`;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="page-title">Good morning, {user?.name?.split(' ')[0]} 👋</h1>
        <p className="text-slate-500 mt-1">Here's what's happening at MediCore today.</p>
      </div>

      {/* Stat Cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card animate-pulse h-24 bg-slate-100" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon="👥" label="Total Patients" value={stats?.totalPatients} sub="Active" color="bg-blue-50" />
          <StatCard icon="🩺" label="Doctors" value={stats?.totalDoctors} sub="Available" color="bg-green-50" />
          <StatCard icon="📅" label="Today's Appointments" value={stats?.todayAppointments} sub={`${stats?.pendingAppointments} pending`} color="bg-amber-50" />
          <StatCard icon="💰" label="Monthly Revenue" value={fmt(stats?.monthlyRevenue || 0)} sub={`Total: ${fmt(stats?.totalRevenue || 0)}`} color="bg-purple-50" />
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appointments chart */}
        <div className="card">
          <h2 className="font-display font-semibold text-slate-800 mb-4">Appointments (Last 7 Days)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={apptChart}>
              <defs>
                <linearGradient id="apptGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
              <Area type="monotone" dataKey="appointments" stroke="#3b82f6" fill="url(#apptGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue chart */}
        <div className="card">
          <h2 className="font-display font-semibold text-slate-800 mb-4">Revenue (Last 6 Months)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={revenueChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={(v) => `₹${v / 1000}K`} />
              <Tooltip formatter={(v) => [`₹${v.toLocaleString()}`, 'Revenue']}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
              <Bar dataKey="revenue" fill="#10b981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Stats Pie */}
        <div className="card">
          <h2 className="font-display font-semibold text-slate-800 mb-4">By Department</h2>
          {deptStats.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={deptStats} dataKey="appointments" nameKey="_id" cx="50%" cy="50%" outerRadius={70}>
                    {deptStats.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1 mt-2">
                {deptStats.slice(0, 4).map((d, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span className="text-slate-600">{d._id || 'General'}</span>
                    </div>
                    <span className="font-medium text-slate-800">{d.appointments}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm text-slate-400 text-center py-8">No data yet</p>
          )}
        </div>

        {/* Recent Patients */}
        <div className="card col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-slate-800">Recent Patients</h2>
            <Link to="/patients" className="text-sm text-primary-600 hover:underline">View all</Link>
          </div>
          {stats?.recentPatients?.length > 0 ? (
            <div className="space-y-3">
              {stats.recentPatients.map((p) => (
                <Link key={p._id} to={`/patients/${p._id}`}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-semibold text-sm flex-shrink-0">
                    {p.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{p.name}</p>
                    <p className="text-xs text-slate-400">{p.patientId} · {p.phone}</p>
                  </div>
                  <span className="text-xs text-slate-400">{new Date(p.createdAt).toLocaleDateString('en-IN')}</span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400 text-center py-8">No patients yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
