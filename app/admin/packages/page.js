'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import AppLayout from '../../components/AppLayout';
import { TableSkeleton } from '../../components/ContentSkeletons';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function AdminPackagesPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [addForm, setAddForm] = useState({
    name: '',
    type: 'DATA',
    mb_limit: '',
    speed_mbps: '',
    price: '',
    validity_period_days: '',
    description: '',
    is_active: true,
  });

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
        return fetch('/api/packages', { credentials: 'include' }).then((r) => r.json());
      })
      .then((data) => Array.isArray(data) && setList(data))
      .catch(() => router.replace('/login'))
      .finally(() => setLoading(false));
  }, [router]);

  async function handleAddPackage(e) {
    e.preventDefault();
    if (!addForm.name?.trim()) {
      toast.error('Package name required');
      return;
    }
    if (addForm.price === '' || isNaN(Number(addForm.price))) {
      toast.error('Valid price required');
      return;
    }
    setAddLoading(true);
    try {
      const res = await fetch('/api/packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: addForm.name.trim(),
          type: addForm.type,
          mb_limit: addForm.mb_limit ? parseInt(addForm.mb_limit, 10) : null,
          speed_mbps: addForm.speed_mbps ? parseInt(addForm.speed_mbps, 10) : null,
          price: Number(addForm.price),
          validity_period_days: addForm.validity_period_days ? parseInt(addForm.validity_period_days, 10) : null,
          description: addForm.description?.trim() || null,
          is_active: addForm.is_active,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to add package');
        return;
      }
      setList((prev) => [data, ...prev]);
      setAddForm({
        name: '',
        type: 'DATA',
        mb_limit: '',
        speed_mbps: '',
        price: '',
        validity_period_days: '',
        description: '',
        is_active: true,
      });
      setShowAdd(false);
      toast.success('Package added');
    } finally {
      setAddLoading(false);
    }
  }

  if (!user && !loading) return null;
  if (loading) {
    return (
      <AppLayout user={user} title="Packages" subtitle="Create and edit plans">
        <TableSkeleton rows={8} cols={6} />
      </AppLayout>
    );
  }

  const isAdmin = user?.role === 'ADMIN';

  return (
    <AppLayout user={user} title="Packages" subtitle="Create and edit plans">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <LayoutDashboard className="h-4 w-4" />
            Overview
          </Link>
          {isAdmin && (
            <Button onClick={() => setShowAdd((v) => !v)} variant={showAdd ? 'secondary' : 'default'}>
              {showAdd ? 'Cancel' : 'Add package'}
            </Button>
          )}
        </div>

        {showAdd && isAdmin && (
          <div className="card p-6">
            <h3 className="text-sm font-semibold text-foreground mb-4">Add package</h3>
            <form onSubmit={handleAddPackage} className="grid gap-4 sm:grid-cols-2 max-w-2xl">
              <div className="space-y-2">
                <Label htmlFor="add_name">Name</Label>
                <Input
                  id="add_name"
                  value={addForm.name}
                  onChange={(e) => setAddForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. 10 Mbps Unlimited"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add_type">Type</Label>
                <select
                  id="add_type"
                  value={addForm.type}
                  onChange={(e) => setAddForm((p) => ({ ...p, type: e.target.value }))}
                  className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="DATA">Data</option>
                  <option value="CABLE">Cable</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="add_price">Price (PKR)</Label>
                <Input
                  id="add_price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={addForm.price}
                  onChange={(e) => setAddForm((p) => ({ ...p, price: e.target.value }))}
                  placeholder="1500"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add_mb">Data limit (MB, optional)</Label>
                <Input
                  id="add_mb"
                  type="number"
                  min="0"
                  value={addForm.mb_limit}
                  onChange={(e) => setAddForm((p) => ({ ...p, mb_limit: e.target.value }))}
                  placeholder="Unlimited"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add_speed">Speed (Mbps, optional)</Label>
                <Input
                  id="add_speed"
                  type="number"
                  min="0"
                  value={addForm.speed_mbps}
                  onChange={(e) => setAddForm((p) => ({ ...p, speed_mbps: e.target.value }))}
                  placeholder="10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add_validity">Validity (days, optional)</Label>
                <Input
                  id="add_validity"
                  type="number"
                  min="1"
                  value={addForm.validity_period_days}
                  onChange={(e) => setAddForm((p) => ({ ...p, validity_period_days: e.target.value }))}
                  placeholder="30"
                />
              </div>
              <div className="sm:col-span-2 space-y-2">
                <Label htmlFor="add_desc">Description (optional)</Label>
                <textarea
                  id="add_desc"
                  value={addForm.description}
                  onChange={(e) => setAddForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Short description"
                  rows={2}
                  className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <div className="sm:col-span-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="add_active"
                  checked={addForm.is_active}
                  onChange={(e) => setAddForm((p) => ({ ...p, is_active: e.target.checked }))}
                  className="rounded border-input"
                />
                <Label htmlFor="add_active" className="font-normal">Active (available to customers)</Label>
              </div>
              <div className="sm:col-span-2">
                <Button type="submit" disabled={addLoading}>
                  {addLoading ? 'Adding…' : 'Add package'}
                </Button>
              </div>
            </form>
          </div>
        )}

        {list.length === 0 ? (
          <div className="card text-center py-12 text-muted-foreground">
            <p className="text-lg font-medium">No packages yet.</p>
            <p className="text-sm mt-1">Add a package above to offer plans to customers.</p>
          </div>
        ) : (
          <div className="rounded-xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-3 font-medium text-foreground">Name</th>
                    <th className="px-4 py-3 font-medium text-foreground">Type</th>
                    <th className="px-4 py-3 font-medium text-foreground">Data / Speed</th>
                    <th className="px-4 py-3 font-medium text-foreground">Price</th>
                    <th className="px-4 py-3 font-medium text-foreground">Validity</th>
                    <th className="px-4 py-3 font-medium text-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((pkg) => (
                    <tr key={pkg.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                      <td className="px-4 py-3 font-medium text-foreground">{pkg.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{pkg.type}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {pkg.mb_limit != null ? `${pkg.mb_limit} MB` : '—'}
                        {pkg.speed_mbps != null && ` · ${pkg.speed_mbps} Mbps`}
                        {pkg.mb_limit == null && pkg.speed_mbps == null && '—'}
                      </td>
                      <td className="px-4 py-3 font-medium text-foreground">
                        PKR {Number(pkg.price).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {pkg.validity_period_days != null ? `${pkg.validity_period_days} days` : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium ${
                            pkg.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {pkg.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
