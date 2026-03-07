'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import AppLayout from '../components/AppLayout';
import { AdminOverviewSkeleton } from '../components/ContentSkeletons';

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

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
      .catch(() => router.replace('/login'))
      .finally(() => setLoading(false));
  }, [router]);

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

  if (!user && !loading) return null;
  if (loading) {
    return (
      <AppLayout user={user} title="Admin">
        <AdminOverviewSkeleton />
      </AppLayout>
    );
  }

  return (
    <AppLayout user={user} title="Admin">
      <div className="space-y-8">
        {stats && (
          <>
            <h2 className="section-title text-lg mb-2">Overview · {stats.year}</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="card-tinted border-l-4 border-l-primary shadow-md">
                <p className="section-title">Total income</p>
                <p className="text-2xl font-bold text-foreground mt-1 tracking-tight">{Number(stats.total_income).toFixed(2)}</p>
              </div>
              <div className="card border-l-4 border-l-destructive shadow-md bg-card">
                <p className="section-title">Total expense</p>
                <p className="text-2xl font-bold text-foreground mt-1 tracking-tight">{Number(stats.total_expense).toFixed(2)}</p>
              </div>
              <div className="card-tinted border-l-4 border-l-primary shadow-md">
                <p className="section-title">Profit</p>
                <p className="text-2xl font-bold text-primary mt-1 tracking-tight">{Number(stats.profit).toFixed(2)}</p>
              </div>
              <div className="card border-l-4 border-border shadow-md bg-muted/40">
                <p className="section-title">Customers</p>
                <p className="text-2xl font-bold text-foreground mt-1 tracking-tight">{stats.total_users} <span className="text-sm font-normal text-muted-foreground">({stats.active_customers ?? stats.total_users} active)</span></p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="card bg-muted/50 border-border shadow-md">
                <p className="section-title">Packages</p>
                <p className="text-lg font-semibold text-foreground mt-1">{stats.active_packages} active · {stats.expired_packages} expired</p>
              </div>
              <div className="card bg-amber-500/10 border-amber-500/30 shadow-md">
                <p className="section-title">Complaints</p>
                <p className="text-lg font-semibold text-foreground mt-1">{stats.complaints_pending ?? 0} pending · {stats.complaints_in_progress ?? 0} in progress · {stats.complaints_resolved ?? 0} resolved</p>
              </div>
              <div className="card bg-primary/10 border-primary/20 shadow-md">
                <p className="section-title">Inactive customers</p>
                <p className="text-lg font-semibold text-foreground mt-1">{stats.inactive_customers ?? 0}</p>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="card shadow-md">
                <h3 className="section-title mb-4">Income vs expense vs profit</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={financeChartData} layout="vertical" margin={{ left: 50, right: 16 }}>
                      <XAxis type="number" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" tickFormatter={(v) => v} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" width={80} />
                      <Tooltip formatter={(v) => [Number(v).toFixed(2), '']} contentStyle={{ borderRadius: 12 }} />
                      <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                        {financeChartData.map((entry, i) => (
                          <Cell key={i} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="card shadow-md">
                <h3 className="section-title mb-4">Complaints by status</h3>
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
                      <Tooltip formatter={(v) => [v, 'Count']} contentStyle={{ borderRadius: 12 }} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </>
        )}
        <div className="flex flex-wrap gap-4">
          <Link href="/admin/complaints" className="link-card w-full sm:w-auto sm:min-w-[280px] group">
            <span className="text-2xl" aria-hidden>🎫</span>
            <div>
              <p className="font-semibold text-foreground group-hover:text-primary">Complaints</p>
              <p className="text-sm text-muted-foreground">Manage support tickets</p>
            </div>
          </Link>
          <Link href="/" className="link-card w-full sm:w-auto sm:min-w-[280px] group">
            <span className="text-2xl" aria-hidden>🏠</span>
            <div>
              <p className="font-semibold text-foreground group-hover:text-primary">Home</p>
              <p className="text-sm text-muted-foreground">Back to portal</p>
            </div>
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}
