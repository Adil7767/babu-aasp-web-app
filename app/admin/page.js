'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import AppLayout from '../components/AppLayout';

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((u) => {
        if (!u || (u.role !== 'ADMIN' && u.role !== 'STAFF')) {
          router.replace('/login');
          return;
        }
        if (u.tenant?.subscription_status === 'PENDING_PAYMENT') {
          router.replace('/pending-subscription');
          return;
        }
        if (u.tenant?.subscription_status === 'SUSPENDED') {
          router.replace('/suspended');
          return;
        }
        setUser(u);
        return fetch('/api/stats', { credentials: 'include' }).then((r) => {
          if (r.status === 402) {
            router.replace('/renew-subscription');
            return null;
          }
          return r.ok ? r.json() : null;
        });
      })
      .then(setStats)
      .catch(() => router.replace('/login'));
  }, []);

  const financeChartData = useMemo(() => {
    if (!stats) return [];
    const profit = Number(stats.profit);
    return [
      { name: 'Income', value: Number(stats.total_income), fill: '#0d9488' },
      { name: 'Expense', value: Number(stats.total_expense), fill: '#f43f5e' },
      { name: 'Profit', value: profit, fill: profit >= 0 ? '#10b981' : '#ef4444' },
    ];
  }, [stats]);

  const complaintsChartData = useMemo(() => {
    if (!stats) return [];
    const data = [];
    if ((stats.complaints_pending ?? 0) > 0) data.push({ name: 'Pending', value: stats.complaints_pending, fill: '#f59e0b' });
    if ((stats.complaints_in_progress ?? 0) > 0) data.push({ name: 'In progress', value: stats.complaints_in_progress, fill: '#0d9488' });
    if ((stats.complaints_resolved ?? 0) > 0) data.push({ name: 'Resolved', value: stats.complaints_resolved, fill: '#10b981' });
    return data.length ? data : [{ name: 'None', value: 1, fill: '#94a3b8' }];
  }, [stats]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-200 border-t-primary-600" />
          <p className="text-sm text-slate-500">Loading…</p>
        </div>
      </div>
    );
  }

  return (
    <AppLayout user={user} title="Admin">
      <div>
        {stats && (
          <>
            <h2 className="text-xl font-semibold text-slate-800 mb-6">Overview · {stats.year}</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
              <div className="card border-l-4 border-l-primary-500">
                <p className="text-sm font-medium text-slate-500">Total income</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">{Number(stats.total_income).toFixed(2)}</p>
              </div>
              <div className="card border-l-4 border-l-rose-400">
                <p className="text-sm font-medium text-slate-500">Total expense</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">{Number(stats.total_expense).toFixed(2)}</p>
              </div>
              <div className="card border-l-4 border-l-emerald-500">
                <p className="text-sm font-medium text-slate-500">Profit</p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">{Number(stats.profit).toFixed(2)}</p>
              </div>
              <div className="card border-l-4 border-l-slate-400">
                <p className="text-sm font-medium text-slate-500">Customers</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">{stats.total_users} <span className="text-sm font-normal text-slate-400">({stats.active_customers ?? stats.total_users} active)</span></p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3 mb-8">
              <div className="card bg-slate-50/50">
                <p className="text-sm font-medium text-slate-500">Packages</p>
                <p className="text-lg font-semibold text-slate-800 mt-1">{stats.active_packages} active · {stats.expired_packages} expired</p>
              </div>
              <div className="card bg-amber-50/50">
                <p className="text-sm font-medium text-slate-500">Complaints</p>
                <p className="text-lg font-semibold text-slate-800 mt-1">{stats.complaints_pending ?? 0} pending · {stats.complaints_in_progress ?? 0} in progress · {stats.complaints_resolved ?? 0} resolved</p>
              </div>
              <div className="card bg-primary-50/50">
                <p className="text-sm font-medium text-slate-500">Inactive customers</p>
                <p className="text-lg font-semibold text-slate-800 mt-1">{stats.inactive_customers ?? 0}</p>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2 mb-8">
              <div className="card">
                <h3 className="text-sm font-medium text-slate-500 mb-4">Income vs expense vs profit</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={financeChartData} layout="vertical" margin={{ left: 50, right: 16 }}>
                      <XAxis type="number" tick={{ fontSize: 11 }} stroke="#64748b" tickFormatter={(v) => v} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} stroke="#64748b" width={80} />
                      <Tooltip formatter={(v) => [Number(v).toFixed(2), '']} contentStyle={{ borderRadius: 8 }} />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                        {financeChartData.map((entry, i) => (
                          <Cell key={i} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="card">
                <h3 className="text-sm font-medium text-slate-500 mb-4">Complaints by status</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={complaintsChartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={48}
                        outerRadius={80}
                        paddingAngle={2}
                        label={({ name, value }) => value ? `${name}: ${value}` : null}
                      >
                        {complaintsChartData.map((entry, i) => (
                          <Cell key={i} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v) => [v, 'Count']} contentStyle={{ borderRadius: 8 }} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </>
        )}
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/complaints" className="card flex items-center gap-3 w-full sm:w-auto hover:shadow-soft hover:border-primary-200 transition group">
            <span className="text-2xl">🎫</span>
            <div>
              <p className="font-semibold text-slate-800 group-hover:text-primary-600">Complaints</p>
              <p className="text-sm text-slate-500">Manage support tickets</p>
            </div>
          </Link>
          <Link href="/" className="card flex items-center gap-3 w-full sm:w-auto hover:shadow-soft hover:border-primary-200 transition group">
            <span className="text-2xl">🏠</span>
            <div>
              <p className="font-semibold text-slate-800 group-hover:text-primary-600">Home</p>
              <p className="text-sm text-slate-500">Back to portal</p>
            </div>
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}
