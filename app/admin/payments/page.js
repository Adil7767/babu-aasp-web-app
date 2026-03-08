'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AppLayout from '../../components/AppLayout';
import { TableSkeleton } from '../../components/ContentSkeletons';
import { useAuthMe } from '../../hooks/useAuthMe';
import { ChevronRight } from 'lucide-react';

export default function AdminPaymentsPage() {
  const router = useRouter();
  const { data: user, isLoading: userLoading, isError: userError } = useAuthMe();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

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
    fetch('/api/payments', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setPayments(Array.isArray(data) ? data : []))
      .catch(() => setPayments([]))
      .finally(() => setLoading(false));
  }, [user, userLoading, router]);

  useEffect(() => {
    if (userError) router.replace('/login');
  }, [userError, router]);

  if (!user && !userLoading) {
    return (
      <AppLayout user={undefined} title="Payments">
        <TableSkeleton rows={8} cols={5} />
      </AppLayout>
    );
  }
  if (user && user.role !== 'ADMIN' && user.role !== 'STAFF') {
    return (
      <AppLayout user={user ?? undefined} title="Payments">
        <TableSkeleton rows={8} cols={5} />
      </AppLayout>
    );
  }

  return (
    <AppLayout user={user ?? undefined} title="Payments" subtitle="Payment history">
      {loading ? (
        <TableSkeleton rows={8} cols={5} />
      ) : (
        <div className="space-y-6">
          <div className="rounded-xl border border-border overflow-hidden bg-card">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-3 font-medium text-muted-foreground">Date</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Amount</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Month / Year</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Method</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                        No payments yet.
                      </td>
                    </tr>
                  ) : (
                    payments.map((p) => (
                      <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                        <td className="px-4 py-3">
                          {p.paid_at ? new Date(p.paid_at).toLocaleDateString() : '—'}
                        </td>
                        <td className="px-4 py-3 font-medium">{Number(p.amount).toFixed(2)}</td>
                        <td className="px-4 py-3">{p.month} / {p.year}</td>
                        <td className="px-4 py-3">{p.payment_method || '—'}</td>
                        <td className="px-4 py-3 text-muted-foreground max-w-[200px] truncate">{p.notes || '—'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
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
