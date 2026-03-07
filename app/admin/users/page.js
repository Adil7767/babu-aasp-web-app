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
import { LayoutDashboard } from 'lucide-react';

export default function AdminUsersPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [addForm, setAddForm] = useState({ full_name: '', email: '', password: '', role: 'USER' });

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
        const q = roleFilter ? `?role=${roleFilter}` : '';
        return fetch(`/api/users${q}`, { credentials: 'include' }).then((r) => r.json());
      })
      .then((data) => Array.isArray(data) && setList(data))
      .catch(() => router.replace('/login'))
      .finally(() => setLoading(false));
  }, [router, roleFilter]);

  async function handleAddUser(e) {
    e.preventDefault();
    if (!addForm.full_name?.trim() || !addForm.email?.trim() || !addForm.password?.trim()) {
      toast.error('Name, email and password required');
      return;
    }
    setAddLoading(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          full_name: addForm.full_name.trim(),
          email: addForm.email.trim().toLowerCase(),
          password: addForm.password,
          role: addForm.role,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to add user');
        return;
      }
      setList((prev) => [data, ...prev]);
      setAddForm({ full_name: '', email: '', password: '', role: 'USER' });
      setShowAdd(false);
      toast.success('User added');
    } finally {
      setAddLoading(false);
    }
  }

  if (!user && !loading) return null;
  if (loading) {
    return (
      <AppLayout user={user} title="Users" subtitle="Manage customers and staff">
        <TableSkeleton rows={8} cols={5} />
      </AppLayout>
    );
  }

  const isAdmin = user?.role === 'ADMIN';

  return (
    <AppLayout user={user} title="Users" subtitle="Manage customers and staff">
      <div className="space-y-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/admin">Admin</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Users</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground shadow-sm transition-all hover:bg-accent hover:text-accent-foreground hover:shadow-md"
          >
            <LayoutDashboard className="h-4 w-4" />
            Overview
          </Link>
          <div className="flex items-center gap-2">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="flex h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="">All (customers & staff)</option>
              <option value="USER">Customers only</option>
              <option value="STAFF">Staff only</option>
            </select>
            {isAdmin && (
              <Button onClick={() => setShowAdd((v) => !v)} variant={showAdd ? 'secondary' : 'default'}>
                {showAdd ? 'Cancel' : 'Add user'}
              </Button>
            )}
          </div>
        </div>

        {showAdd && isAdmin && (
          <div className="card p-6">
            <h3 className="text-sm font-semibold text-foreground mb-4">Add user</h3>
            <form onSubmit={handleAddUser} className="grid gap-4 sm:grid-cols-2 max-w-2xl">
              <div className="space-y-2">
                <Label htmlFor="add_name">Full name</Label>
                <Input
                  id="add_name"
                  value={addForm.full_name}
                  onChange={(e) => setAddForm((p) => ({ ...p, full_name: e.target.value }))}
                  placeholder="John Doe"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add_email">Email</Label>
                <Input
                  id="add_email"
                  type="email"
                  value={addForm.email}
                  onChange={(e) => setAddForm((p) => ({ ...p, email: e.target.value }))}
                  placeholder="john@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add_password">Password</Label>
                <Input
                  id="add_password"
                  type="password"
                  value={addForm.password}
                  onChange={(e) => setAddForm((p) => ({ ...p, password: e.target.value }))}
                  placeholder="Min 6 characters"
                  minLength={6}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add_role">Role</Label>
                <select
                  id="add_role"
                  value={addForm.role}
                  onChange={(e) => setAddForm((p) => ({ ...p, role: e.target.value }))}
                  className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="USER">Customer</option>
                  <option value="STAFF">Staff</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <Button type="submit" disabled={addLoading}>
                  {addLoading ? 'Adding…' : 'Add user'}
                </Button>
              </div>
            </form>
          </div>
        )}

        {list.length === 0 ? (
          <div className="card text-center py-12 text-muted-foreground">
            <p className="text-lg font-medium">No users yet.</p>
            <p className="text-sm mt-1">Add customers or staff above.</p>
          </div>
        ) : (
          <div className="rounded-xl border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.full_name || '—'}</TableCell>
                    <TableCell className="text-muted-foreground">{u.email}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium ${
                          u.role === 'ADMIN'
                            ? 'bg-primary/15 text-primary'
                            : u.role === 'STAFF'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {u.role}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium ${
                          u.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {u.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
