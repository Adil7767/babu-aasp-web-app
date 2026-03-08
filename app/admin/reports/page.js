'use client';

import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import AppLayout from '../../components/AppLayout';
import { AdminOverviewSkeleton } from '../../components/ContentSkeletons';
import { useAuthMe } from '../../hooks/useAuthMe';
import { useStats } from '../../hooks/useStats';
import { ChevronRight } from 'lucide-react';

export default function AdminReportsPage() {
  const router = useRouter();
  const { data: user, isLoading: userLoading, isError: userError } = useAuthMe();
  const { data: stats, isLoading: statsLoading } = useStats(!!user && (user?.role === 'ADMIN' || user?.role === 'STAFF'));

  useEffect(() => {
    if (userLoading || user == null) return;
    if (user && user.role !== 'ADMIN' && user.role !== 'STAFF') {
      router.replace('/login');
      return;
    }
    if (user?.tenant?.subscription_status === 'PENDING_PAYMENT') {
      router.replace('/pending-subscription');
      return;
    }
    if (user?.tenant?.subscription_status === 'SUSPENDED') {
      router.replace('/suspended');
      return;
    }
    if (stats === null && !statsLoading) {
      router.replace('/renew-subscription');
    }
  }, [user, userLoading, stats, statsLoading, router]);

  useEffect(() => {
    if (userError) router.replace('/login');
  }, [userError, router]);

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

  if (!user && !userLoading) {
    return (
      <AppLayout user={undefined} title="Reports">
        <AdminOverviewSkeleton />
      </AppLayout>
    );
  }
  if (user && user.role !== 'ADMIN' && user.role !== 'STAFF') {
    return (
      <AppLayout user={user ?? undefined} title="Reports">
        <AdminOverviewSkeleton />
      </AppLayout>
    );
  }

  return (
    <AppLayout user={user ?? undefined} title="Reports" subtitle="Charts and analytics">
      {statsLoading || !stats ? (
        <AdminOverviewSkeleton />
      ) : (
        <div className="space-y-8">
          <h2 className="section-title text-lg mb-2">Reports · {stats.year}</h2>
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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="card border-l-4 border-l-primary shadow-md">
              <p className="section-title text-muted-foreground">Customers</p>
              <p className="stat-value text-xl font-bold text-foreground mt-1">{stats.total_users} <span className="text-sm font-normal text-muted-foreground">({stats.active_customers ?? stats.total_users} active)</span></p>
            </div>
            <div className="card border-l-4 border-l-border shadow-md bg-muted/40">
              <p className="section-title text-muted-foreground">Packages</p>
              <p className="stat-value text-xl font-bold text-foreground mt-1">{stats.active_packages} active · {stats.expired_packages} expired</p>
            </div>
            <div className="card border-l-4 border-l-amber-500 shadow-md bg-amber-500/5">
              <p className="section-title text-muted-foreground">Complaints</p>
              <p className="stat-value text-xl font-bold text-foreground mt-1">{stats.complaints_pending ?? 0} pending · {stats.complaints_resolved ?? 0} resolved</p>
            </div>
            <div className="card border-l-4 border-l-muted shadow-md">
              <p className="section-title text-muted-foreground">Inactive customers</p>
              <p className="stat-value text-xl font-bold text-foreground mt-1">{stats.inactive_customers ?? 0}</p>
            </div>
          </div>
          <Link href="/admin" className="link-card w-full sm:w-auto sm:min-w-[280px] group inline-flex">
            <span className="text-2xl" aria-hidden>←</span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground group-hover:text-primary transition-colors">Back to Dashboard</p>
              <p className="text-sm text-muted-foreground">Overview and stats</p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary shrink-0 transition-colors" />
          </Link>
        </div>
      )}
    </AppLayout>
  );
}
