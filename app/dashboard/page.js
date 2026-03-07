'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import AppLayout from '../components/AppLayout';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [packages, setPackages] = useState([]);
  const [payments, setPayments] = useState([]);
  const [complaints, setComplaints] = useState([]);

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
      .catch(() => router.replace('/login'));
  }, []);

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
        <div className="card border-l-4 border-l-primary-500">
          <h2 className="text-sm font-medium text-slate-500">Total paid</h2>
          <p className="text-3xl font-bold text-slate-800 mt-1">{totalPaid.toFixed(2)}</p>
        </div>

        {paymentsByMonth.length > 0 && (
          <section className="card">
            <h2 className="text-sm font-medium text-slate-500 mb-4">Payments by month</h2>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={paymentsByMonth} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#64748b" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#64748b" tickFormatter={(v) => v} />
                  <Tooltip formatter={(v) => [Number(v).toFixed(2), 'Amount']} contentStyle={{ borderRadius: 8 }} />
                  <Bar dataKey="amount" fill="#0d9488" radius={[4, 4, 0, 0]} name="Amount" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        )}

        <section>
          <h2 className="text-lg font-semibold text-slate-800 mb-4">My packages</h2>
          {packages.length === 0 ? (
            <div className="card text-slate-500 text-center py-8">No package yet. Request one from admin.</div>
          ) : (
            <div className="space-y-3">
              {packages.map((s) => (
                <div key={s.id} className="card flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <p className="font-medium text-slate-800">{s.package?.name}</p>
                    <p className="text-sm text-slate-500">Till {new Date(s.end_date).toLocaleDateString()}</p>
                  </div>
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                    s.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' :
                    s.status === 'EXPIRED' ? 'bg-slate-100 text-slate-600' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {s.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Recent payments</h2>
          {payments.length === 0 ? (
            <div className="card text-slate-500 text-center py-6">No payments recorded.</div>
          ) : (
            <div className="card divide-y divide-slate-100">
              {payments.slice(0, 10).map((p) => (
                <div key={p.id} className="flex justify-between items-center py-3 first:pt-0 last:pb-0">
                  <span className="text-slate-600">{p.month}/{p.year}</span>
                  <span className="font-medium text-slate-800">{Number(p.amount).toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Complaints & support</h2>
          <div className="card">
            <p className="text-slate-600 text-sm mb-4">Submit and track support tickets for connection or billing issues.</p>
            <div className="flex flex-wrap gap-2">
              {complaints.slice(0, 3).map((c) => (
                <span key={c.id} className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                  {c.category.replace('_', ' ')} · {c.status}
                </span>
              ))}
            </div>
            <Link href="/dashboard/complaints" className="btn-primary mt-4 inline-block text-center">
              View all & submit complaint
            </Link>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
