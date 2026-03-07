'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AppLayout from '../../components/AppLayout';
import { ComplaintsPageSkeleton } from '../../components/ContentSkeletons';
import { LayoutDashboard } from 'lucide-react';

const statusColors = {
  PENDING: 'bg-amber-100 text-amber-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  RESOLVED: 'bg-emerald-100 text-emerald-800',
  CLOSED: 'bg-slate-100 text-slate-600',
};

const categoryLabels = {
  SLOW_INTERNET: 'Slow internet',
  NO_CONNECTION: 'No connection',
  ROUTER_ISSUE: 'Router issue',
  BILLING_QUERY: 'Billing query',
  OTHER: 'Other',
};

export default function AdminComplaintsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((u) => {
        if (!u || (u.role !== 'ADMIN' && u.role !== 'STAFF')) {
          router.replace('/login');
          return;
        }
        setUser(u);
        return fetch('/api/complaints', { credentials: 'include' }).then((r) => r.json());
      })
      .then((data) => Array.isArray(data) && setList(data))
      .catch(() => router.replace('/login'))
      .finally(() => setLoading(false));
  }, [router]);

  if (!user && !loading) return null;
  if (loading) {
    return (
      <AppLayout user={user} title="Complaints" subtitle="Manage support tickets">
        <ComplaintsPageSkeleton />
      </AppLayout>
    );
  }

  return (
    <AppLayout user={user} title="Complaints" subtitle="Manage support tickets">
      <div className="space-y-6">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <LayoutDashboard className="h-4 w-4" />
          Overview (income, stats, charts)
        </Link>
        {list.length === 0 ? (
          <div className="card text-center py-12 text-slate-500">
            <p className="text-lg font-medium">No complaints yet.</p>
            <p className="text-sm mt-1">Support tickets will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {list.map((c) => (
              <div key={c.id} className="card">
                <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                  <span className="inline-flex items-center rounded-lg bg-primary-100 px-2.5 py-1 text-xs font-medium text-primary-800">
                    {categoryLabels[c.category] || c.category}
                  </span>
                  <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-medium ${statusColors[c.status] || 'bg-slate-100 text-slate-600'}`}>
                    {c.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-slate-800 font-medium">{c.user?.full_name} · {c.user?.email}</p>
                <p className="text-slate-600 text-sm mt-2 leading-relaxed">{c.description}</p>
                {c.assigned_to && (
                  <p className="text-xs text-slate-500 mt-3">Assigned to {c.assigned_to.full_name}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
