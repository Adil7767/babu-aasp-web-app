'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
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
  const [plansData, setPlansData] = useState(null);

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
          fetch('/api/plans?payment_details=true', { credentials: 'include' }).then((r) => (r.ok ? r.json() : null)),
        ]);
      })
      .then(([statsData, tenantsList, plans]) => {
        if (statsData) setStats(statsData);
        if (Array.isArray(tenantsList)) setTenants(tenantsList);
        if (plans) setPlansData(plans);
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
    if (!tenantId) {
      toast.error('Invalid tenant');
      return;
    }
    setActionLoading(tenantId);
    try {
      const res = await fetch(`/api/super-admin/tenants/${tenantId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        toast.success(data.message || (action === 'approve' ? 'Tenant approved' : 'Done'));
        loadData();
      } else {
        toast.error(data.error || data.detail || `Action failed (${res.status})`);
      }
    } catch (e) {
      toast.error(e.message || 'Request failed');
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
    <AppLayout user={user} title="Super Admin" subtitle="Platform overview">
      <div className="space-y-8">
        {stats && (
          <>
            <section id="overview">
              <h2 className="section-title mb-4">Platform overview</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="card-tinted border-l-4 border-l-primary shadow-md">
                  <p className="section-title text-muted-foreground">ISP companies</p>
                  <p className="stat-value text-2xl font-bold text-foreground mt-1">{stats.total_tenants}</p>
                </div>
                <div className="card border-l-4 border-l-emerald-500 shadow-md bg-emerald-500/5">
                  <p className="section-title text-muted-foreground">Total customers</p>
                  <p className="stat-value text-2xl font-bold text-foreground mt-1">{stats.total_customers}</p>
                </div>
                <div className="card border-l-4 border-l-amber-500 shadow-md bg-amber-500/5">
                  <p className="section-title text-muted-foreground">Platform revenue</p>
                  <p className="stat-value text-2xl font-bold text-foreground mt-1">{Number(stats.platform_revenue || 0).toFixed(2)}</p>
                </div>
                <div className="card border-l-4 border-border shadow-md bg-muted/40">
                  <p className="section-title text-muted-foreground">Tenants in list</p>
                  <p className="stat-value text-2xl font-bold text-foreground mt-1">{tenants.length}</p>
                </div>
              </div>
            </section>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="card shadow-md">
                <h3 className="text-sm font-medium text-muted-foreground mb-4">Customers per tenant (top 10)</h3>
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
              <div className="card shadow-md">
                <h3 className="text-sm font-medium text-muted-foreground mb-4">Tenants by plan</h3>
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
                    <div className="h-full flex items-center justify-center text-muted-foreground text-sm">No tenants yet</div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        <section id="tenants">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <h2 className="section-title">Tenants (ISPs)</h2>
            <button
              type="button"
              onClick={() => setAddOpen(true)}
              className="btn-primary py-2 px-4 text-sm"
            >
              Add tenant
            </button>
          </div>

          <div className="card overflow-hidden p-0 shadow-md">
            <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border bg-muted/60">
                <th className="px-4 py-3 text-sm font-semibold text-foreground">Name</th>
                <th className="px-4 py-3 text-sm font-semibold text-foreground">Slug</th>
                <th className="px-4 py-3 text-sm font-semibold text-foreground">Plan</th>
                <th className="px-4 py-3 text-sm font-semibold text-foreground">Customers</th>
                <th className="px-4 py-3 text-sm font-semibold text-foreground">Subscription</th>
                <th className="px-4 py-3 text-sm font-semibold text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tenants.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No tenants yet. Add one or ask admins to sign up.</td>
                </tr>
              ) : (
                tenants.map((t) => (
                  <tr key={t.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium text-foreground">{t.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{t.slug}</td>
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
                        <span className="block text-xs text-muted-foreground mt-1">Expires: {new Date(t.subscription_ends_at).toLocaleDateString()}</span>
                      )}
                      {t.subscription_status === 'PENDING_PAYMENT' && t.subscription_payment_reference && (
                        <span className="block text-xs text-muted-foreground mt-0.5" title="Payment ref">{t.subscription_payment_method} · {t.subscription_payment_reference}</span>
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
        </section>

        <section id="plans" className="card shadow-md">
          <h3 className="section-title mb-3">Plans & billing</h3>
          <p className="text-sm text-muted-foreground mb-3">Monthly prices (PKR) and payment instructions shown to tenants.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="font-medium text-foreground mb-2">Plan prices</p>
              <ul className="space-y-1.5 text-sm">
                {(plansData?.plans || [
                  { id: 'STARTER', name: 'Starter', monthly_price_pkr: 1000, customer_limit: 200 },
                  { id: 'PROFESSIONAL', name: 'Professional', monthly_price_pkr: 2000, customer_limit: 1000 },
                  { id: 'ENTERPRISE', name: 'Enterprise', monthly_price_pkr: 3000, customer_limit: 0 },
                ]).map((p) => (
                  <li key={p.id} className="flex justify-between">
                    <span>{p.name}</span>
                    <span className="font-medium text-foreground">PKR {(p.monthly_price_pkr ?? 0).toLocaleString()}/mo · {p.customer_limit === 0 ? 'Unlimited' : p.customer_limit} customers</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-medium text-foreground mb-2">Payment instructions (for tenants)</p>
              <div className="text-sm text-muted-foreground space-y-1">
                {plansData?.payment_instructions ? (
                  <>
                    {plansData.payment_instructions.jazzcash ? <p><strong>JazzCash:</strong> {plansData.payment_instructions.jazzcash}</p> : null}
                    {plansData.payment_instructions.easypaisa ? <p><strong>EasyPaisa:</strong> {plansData.payment_instructions.easypaisa}</p> : null}
                    {plansData.payment_instructions.bank ? <p><strong>Bank:</strong> {plansData.payment_instructions.bank}</p> : null}
                    {!plansData.payment_instructions.jazzcash && !plansData.payment_instructions.easypaisa && !plansData.payment_instructions.bank ? <p>Set PLATFORM_JAZZCASH_NUMBER, PLATFORM_EAZYPAISA_NUMBER, PLATFORM_BANK_DETAILS in env.</p> : null}
                  </>
                ) : (
                  <p>Load payment details from API (env vars for JazzCash, EasyPaisa, Bank).</p>
                )}
              </div>
            </div>
          </div>
        </section>

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
