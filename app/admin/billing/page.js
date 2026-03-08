'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AppLayout from '../../components/AppLayout';
import { AdminOverviewSkeleton } from '../../components/ContentSkeletons';
import { useAuthMe } from '../../hooks/useAuthMe';
import { useStats } from '../../hooks/useStats';
import { ChevronRight } from 'lucide-react';

export default function AdminBillingPage() {
  const router = useRouter();
  const { data: user, isLoading: userLoading, isError: userError } = useAuthMe();
  const { data: stats, isLoading: statsLoading } = useStats(!!user && (user?.role === 'ADMIN' || user?.role === 'STAFF'));

  useEffect(() => {
    if (userLoading || user == null) return;
    if (user && user.role !== 'ADMIN' && user.role !== 'STAFF') router.replace('/login');
    else if (user?.tenant?.subscription_status === 'PENDING_PAYMENT') router.replace('/pending-subscription');
    else if (user?.tenant?.subscription_status === 'SUSPENDED') router.replace('/suspended');
    else if (stats === null && !statsLoading) router.replace('/renew-subscription');
  }, [user, userLoading, stats, statsLoading, router]);

  useEffect(() => {
    if (userError) router.replace('/login');
  }, [userError, router]);

  if (!user && !userLoading) return <AppLayout user={undefined} title="Billing"><AdminOverviewSkeleton /></AppLayout>;
  if (user && user.role !== 'ADMIN' && user.role !== 'STAFF') return <AppLayout user={user} title="Billing"><AdminOverviewSkeleton /></AppLayout>;

  return (
    <AppLayout user={user ?? undefined} title="Billing" subtitle="Subscription and revenue">
      {statsLoading || !stats ? (
        <AdminOverviewSkeleton />
      ) : (
        <div className="space-y-8">
          <h2 className="section-title text-lg mb-2">Billing overview</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="card-tinted border-l-4 border-l-primary shadow-md">
              <p className="section-title text-muted-foreground">Total income</p>
              <p className="stat-value text-2xl font-bold text-foreground mt-1">{Number(stats.total_income).toFixed(2)}</p>
            </div>
            <div className="card border-l-4 border-l-destructive shadow-md bg-card">
              <p className="section-title text-muted-foreground">Total expense</p>
              <p className="stat-value text-2xl font-bold text-foreground mt-1">{Number(stats.total_expense).toFixed(2)}</p>
            </div>
            <div className="card-tinted border-l-4 border-l-primary shadow-md">
              <p className="section-title text-muted-foreground">Profit</p>
              <p className="stat-value text-2xl font-bold text-primary mt-1">{Number(stats.profit).toFixed(2)}</p>
            </div>
          </div>
          <div className="card bg-muted/50 border-border shadow-md">
            <p className="section-title text-muted-foreground mb-2">Your subscription</p>
            <p className="text-foreground">
              {user?.tenant?.subscription_status === 'ACTIVE' ? 'Active.' : 'Ensure your platform subscription is active.'}
            </p>
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
