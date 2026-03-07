'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import AppLayout from '../components/AppLayout';
import { DashboardSkeleton } from '../components/ContentSkeletons';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [packages, setPackages] = useState([]);
  const [payments, setPayments] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((u) => {
        if (!u) {
          router.replace('/login');
          return;
        }
        setUser(u);
        return Promise.all([
          fetch('/api/user-packages', { credentials: 'include' }).then((r) => r.json()),
          fetch('/api/payments', { credentials: 'include' }).then((r) => r.json()),
          fetch('/api/complaints', { credentials: 'include' }).then((r) => r.json()),
        ]);
      })
      .then(([pkg, pay, compList]) => {
        if (pkg) setPackages(Array.isArray(pkg) ? pkg : []);
        if (pay) setPayments(Array.isArray(pay) ? pay : []);
        if (compList) setComplaints(Array.isArray(compList) ? compList : []);
      })
      .catch(() => router.replace('/login'))
      .finally(() => setLoading(false));
  }, [router]);

  if (!user && !loading) return null;
  if (loading) {
    return (
      <AppLayout user={user} title="My dashboard" maxWidth="max-w-4xl">
        <DashboardSkeleton />
      </AppLayout>
    );
  }

  const totalPaid = payments.reduce((s, p) => s + Number(p.amount), 0);

  const paymentsByMonth = useMemo(() => {
    const byKey = {};
    payments.forEach((p) => {
      const key = `${p.month}/${p.year}`;
      if (!byKey[key]) byKey[key] = { month: key, amount: 0, count: 0 };
      byKey[key].amount += Number(p.amount);
      byKey[key].count += 1;
    });
    return Object.values(byKey).sort((a, b) => {
      const [ma, ya] = a.month.split('/').map(Number);
      const [mb, yb] = b.month.split('/').map(Number);
      return ya !== yb ? ya - yb : ma - mb;
    }).slice(-12);
  }, [payments]);

  return (
    <AppLayout user={user} title="My dashboard" maxWidth="max-w-4xl">
      <div className="space-y-8">
        <div className="card-tinted border-l-4 border-l-primary shadow-md">
          <h2 className="section-title text-muted-foreground">Total paid</h2>
          <p className="text-3xl font-bold text-foreground mt-1 tracking-tight tabular-nums">{totalPaid.toFixed(2)}</p>
        </div>

        {paymentsByMonth.length > 0 && (
          <section className="card shadow-md">
            <h2 className="section-title mb-4">Payments by month</h2>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={paymentsByMonth} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                  <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" tickFormatter={(v) => v} />
                  <Tooltip formatter={(v) => [Number(v).toFixed(2), 'Amount']} contentStyle={{ borderRadius: 12 }} />
                  <Bar dataKey="amount" fill="var(--primary)" radius={[6, 6, 0, 0]} name="Amount" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        )}

        <section>
          <h2 className="section-title mb-4">My packages</h2>
          {packages.length === 0 ? (
            <div className="empty-state">No package yet. Request one from your admin.</div>
          ) : (
            <div className="space-y-3">
              {packages.map((s) => (
                <div key={s.id} className="card flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <p className="font-semibold text-foreground">{s.package?.name}</p>
                    <p className="text-sm text-muted-foreground">Till {new Date(s.end_date).toLocaleDateString()}</p>
                  </div>
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                    s.status === 'ACTIVE' ? 'bg-primary/10 text-primary' :
                    s.status === 'EXPIRED' ? 'bg-muted text-muted-foreground' : 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
                  }`}>
                    {s.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="section-title mb-4">Recent payments</h2>
          {payments.length === 0 ? (
            <div className="empty-state">No payments recorded yet.</div>
          ) : (
            <div className="card divide-y divide-border">
              {payments.slice(0, 10).map((p) => (
                <div key={p.id} className="flex justify-between items-center py-3 first:pt-0 last:pb-0">
                  <span className="text-muted-foreground">{p.month}/{p.year}</span>
                  <span className="font-semibold text-foreground">{Number(p.amount).toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="section-title mb-4">Complaints & support</h2>
          <div className="card bg-primary/5 border-primary/20 shadow-md">
            <p className="text-muted-foreground text-sm mb-4">Submit and track support tickets for connection or billing issues.</p>
            <div className="flex flex-wrap gap-2">
              {complaints.slice(0, 3).map((c) => (
                <span key={c.id} className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-xs font-medium text-foreground">
                  {c.category.replace('_', ' ')} · {c.status}
                </span>
              ))}
            </div>
            <Link href="/dashboard/complaints" className="btn-primary mt-4 inline-flex text-center rounded-xl transition-opacity hover:opacity-95">
              View all & submit complaint
            </Link>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
