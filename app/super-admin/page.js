'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import AppLayout from '../components/AppLayout';
import { SuperAdminSkeleton } from '../components/ContentSkeletons';

export default function SuperAdminPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [addName, setAddName] = useState('');
  const [addSlug, setAddSlug] = useState('');
  const [addPlan, setAddPlan] = useState('STARTER');
  const [addError, setAddError] = useState('');
  const [addLoading, setAddLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  function loadData() {
    fetch('/api/auth/me', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((u) => {
        if (!u || u.role !== 'SUPER_ADMIN') {
          router.replace('/');
          return;
        }
        setUser(u);
        return Promise.all([
          fetch('/api/super-admin/stats', { credentials: 'include' }).then((r) => (r.ok ? r.json() : null)),
          fetch('/api/super-admin/tenants', { credentials: 'include' }).then((r) => (r.ok ? r.json() : [])),
        ]);
      })
      .then(([statsData, tenantsList]) => {
        if (statsData) setStats(statsData);
        if (Array.isArray(tenantsList)) setTenants(tenantsList);
      })
      .catch(() => router.replace('/'))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleAddTenant(e) {
    e.preventDefault();
    setAddError('');
    setAddLoading(true);
    try {
      const res = await fetch('/api/super-admin/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: addName.trim(),
          slug: (addSlug || addName).trim().toLowerCase().replace(/\s+/g, '-'),
          plan: addPlan,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAddError(data.error || 'Failed to create tenant');
        return;
      }
      setAddOpen(false);
      setAddName('');
      setAddSlug('');
      setAddPlan('STARTER');
      loadData();
    } finally {
      setAddLoading(false);
    }
  }

  async function handleTenantAction(tenantId, action) {
    setActionLoading(tenantId);
    try {
      const res = await fetch(`/api/super-admin/tenants/${tenantId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action }),
      });
      if (res.ok) loadData();
      else {
        const data = await res.json();
        alert(data.error || 'Action failed');
      }
    } finally {
      setActionLoading(null);
    }
  }

  if (!user && !loading) return null;

  if (loading || !user) {
    return (
      <AppLayout user={user} title="Super Admin">
        <SuperAdminSkeleton />
      </AppLayout>
    );
  }

  const tenantsBarData = useMemo(() =>
    tenants.slice(0, 10).map((t) => ({
      name: t.name.length > 12 ? t.name.slice(0, 10) + '…' : t.name,
      customers: t._count?.profiles ?? 0,
      fullName: t.name,
    })),
    [tenants]
  );

  const planPieData = useMemo(() => {
    const byPlan = {};
    tenants.forEach((t) => {
      const p = t.plan || 'STARTER';
      byPlan[p] = (byPlan[p] || 0) + 1;
    });
    const colors = { STARTER: '#0d9488', PROFESSIONAL: '#8b5cf6', ENTERPRISE: '#f59e0b' };
    return Object.entries(byPlan).map(([name, value]) => ({
      name,
      value,
      fill: colors[name] || '#94a3b8',
    }));
  }, [tenants]);

  return (
    <AppLayout user={user} title="Super Admin">
      <div>
        {stats && (
          <>
            <h2 className="text-xl font-semibold text-slate-800 mb-6">Platform overview</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
              <div className="card border-l-4 border-l-primary-500">
                <p className="text-sm font-medium text-slate-500">ISP companies</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">{stats.total_tenants}</p>
              </div>
              <div className="card border-l-4 border-l-emerald-500">
                <p className="text-sm font-medium text-slate-500">Total customers</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">{stats.total_customers}</p>
              </div>
              <div className="card border-l-4 border-l-amber-500">
                <p className="text-sm font-medium text-slate-500">Platform revenue</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">{Number(stats.platform_revenue || 0).toFixed(2)}</p>
              </div>
              <div className="card border-l-4 border-l-slate-400">
                <p className="text-sm font-medium text-slate-500">Tenants in list</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">{tenants.length}</p>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2 mb-8">
              <div className="card">
                <h3 className="text-sm font-medium text-slate-500 mb-4">Customers per tenant (top 10)</h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={tenantsBarData} margin={{ top: 8, right: 8, left: 0, bottom: 24 }}>
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#64748b" angle={-25} textAnchor="end" />
                      <YAxis tick={{ fontSize: 11 }} stroke="#64748b" />
                      <Tooltip formatter={(v) => [v, 'Customers']} labelFormatter={(_, payload) => payload[0]?.payload?.fullName} contentStyle={{ borderRadius: 8 }} />
                      <Bar dataKey="customers" fill="#0d9488" radius={[4, 4, 0, 0]} name="Customers" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="card">
                <h3 className="text-sm font-medium text-slate-500 mb-4">Tenants by plan</h3>
                <div className="h-72">
                  {planPieData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={planPieData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={56}
                          outerRadius={88}
                          paddingAngle={2}
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                          {planPieData.map((entry, i) => (
                            <Cell key={i} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v) => [v, 'Tenants']} contentStyle={{ borderRadius: 8 }} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-500 text-sm">No tenants yet</div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-slate-800">Tenants (ISPs)</h2>
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="btn-primary py-2 px-4 text-sm"
          >
            Add tenant
          </button>
        </div>

        <div className="card overflow-hidden p-0">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80">
                <th className="px-4 py-3 text-sm font-semibold text-slate-700">Name</th>
                <th className="px-4 py-3 text-sm font-semibold text-slate-700">Slug</th>
                <th className="px-4 py-3 text-sm font-semibold text-slate-700">Plan</th>
                <th className="px-4 py-3 text-sm font-semibold text-slate-700">Customers</th>
                <th className="px-4 py-3 text-sm font-semibold text-slate-700">Subscription</th>
                <th className="px-4 py-3 text-sm font-semibold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tenants.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">No tenants yet. Add one or ask admins to sign up.</td>
                </tr>
              ) : (
                tenants.map((t) => (
                  <tr key={t.id} className="border-b border-slate-100 last:border-0">
                    <td className="px-4 py-3 font-medium text-slate-800">{t.name}</td>
                    <td className="px-4 py-3 text-slate-600">{t.slug}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-medium text-primary-700">
                        {t.plan}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{t._count?.profiles ?? 0}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        t.subscription_status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' :
                        t.subscription_status === 'PENDING_PAYMENT' ? 'bg-amber-100 text-amber-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {t.subscription_status === 'PENDING_PAYMENT' ? 'Pending payment' : t.subscription_status}
                      </span>
                      {t.subscription_ends_at && (
                        <span className="block text-xs text-slate-500 mt-1">Expires: {new Date(t.subscription_ends_at).toLocaleDateString()}</span>
                      )}
                      {t.subscription_status === 'PENDING_PAYMENT' && t.subscription_payment_reference && (
                        <span className="block text-xs text-slate-500 mt-0.5" title="Payment ref">{t.subscription_payment_method} · {t.subscription_payment_reference}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {t.subscription_status === 'PENDING_PAYMENT' && (
                        <>
                          <button type="button" disabled={actionLoading === t.id} onClick={() => handleTenantAction(t.id, 'approve')} className="text-emerald-600 font-medium text-sm hover:underline mr-2 disabled:opacity-50">
                            {actionLoading === t.id ? '…' : 'Approve'}
                          </button>
                          <button type="button" disabled={actionLoading === t.id} onClick={() => handleTenantAction(t.id, 'suspend')} className="text-rose-600 font-medium text-sm hover:underline disabled:opacity-50">
                            Suspend
                          </button>
                        </>
                      )}
                      {t.subscription_status === 'ACTIVE' && (
                        <>
                          <button type="button" disabled={actionLoading === t.id} onClick={() => handleTenantAction(t.id, 'renew')} className="text-primary-600 font-medium text-sm hover:underline mr-2 disabled:opacity-50">
                            {actionLoading === t.id ? '…' : 'Renew'}
                          </button>
                          <button type="button" disabled={actionLoading === t.id} onClick={() => handleTenantAction(t.id, 'suspend')} className="text-rose-600 font-medium text-sm hover:underline disabled:opacity-50">
                            Suspend
                          </button>
                        </>
                      )}
                      {t.subscription_status === 'SUSPENDED' && (
                        <button type="button" disabled={actionLoading === t.id} onClick={() => handleTenantAction(t.id, 'activate')} className="text-emerald-600 font-medium text-sm hover:underline disabled:opacity-50">
                          {actionLoading === t.id ? '…' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50/50 p-4 text-sm text-slate-600">
          <p className="font-medium text-slate-700 mb-1">Plans (monthly, PKR)</p>
          <ul className="list-disc list-inside space-y-0.5">
            <li>Starter: PKR 1,000/mo · 200 customers</li>
            <li>Professional: PKR 2,000/mo · 1,000 customers</li>
            <li>Enterprise: PKR 3,000/mo · Unlimited</li>
          </ul>
        </div>

      {addOpen && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-slate-900/50 px-4" onClick={() => !addLoading && setAddOpen(false)}>
          <div className="card w-full max-w-md shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Add tenant (ISP)</h3>
            <form onSubmit={handleAddTenant} className="space-y-4">
              {addError && (
                <div className="rounded-lg bg-rose-50 border border-rose-200 px-3 py-2 text-sm text-rose-700">{addError}</div>
              )}
              <div>
                <label className="label">Name</label>
                <input
                  type="text"
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  className="input-field"
                  placeholder="e.g. Acme ISP"
                  required
                />
              </div>
              <div>
                <label className="label">Slug (optional, auto from name)</label>
                <input
                  type="text"
                  value={addSlug}
                  onChange={(e) => setAddSlug(e.target.value)}
                  className="input-field"
                  placeholder="acme-isp"
                />
              </div>
              <div>
                <label className="label">Plan</label>
                <select
                  value={addPlan}
                  onChange={(e) => setAddPlan(e.target.value)}
                  className="input-field"
                >
                  <option value="STARTER">Starter (200)</option>
                  <option value="PROFESSIONAL">Professional (1000)</option>
                  <option value="ENTERPRISE">Enterprise (Unlimited)</option>
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={addLoading} className="btn-primary flex-1 py-2.5">
                  {addLoading ? 'Creating…' : 'Create'}
                </button>
                <button type="button" onClick={() => setAddOpen(false)} disabled={addLoading} className="btn-secondary py-2.5 px-4">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </AppLayout>
  );
}
