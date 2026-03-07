'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import AppLayout from '../../components/AppLayout';
import { DataTable } from '../../components/DataTable';
import { TableSkeleton } from '../../components/ContentSkeletons';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { LayoutDashboard, Pencil, Eye, UserX } from 'lucide-react';

export default function AdminUsersPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
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
        return fetch('/api/users', { credentials: 'include' }).then((r) => r.json());
      })
      .then((data) => Array.isArray(data) && setList(data))
      .catch(() => router.replace('/login'))
      .finally(() => setLoading(false));
  }, [router]);

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
      <AppLayout user={user} title="Customers" subtitle="Manage customers and staff">
        <TableSkeleton rows={8} cols={5} />
      </AppLayout>
    );
  }

  const isAdmin = user?.role === 'ADMIN';

  const columns = [
    { id: 'full_name', label: 'Name', sortable: true, render: (val, row) => <span className="font-medium text-foreground">{val || '—'}</span> },
    { id: 'email', label: 'Email', sortable: true, className: 'text-muted-foreground' },
    {
      id: 'role',
      label: 'Role',
      sortable: true,
      render: (val) => (
        <Badge variant={val === 'ADMIN' ? 'primary' : val === 'STAFF' ? 'warning' : 'default'}>
          {val}
        </Badge>
      ),
    },
    {
      id: 'is_active',
      label: 'Status',
      sortable: true,
      render: (val) => (
        <Badge variant={val ? 'success' : 'default'}>{val ? 'Active' : 'Inactive'}</Badge>
      ),
    },
    {
      id: 'created_at',
      label: 'Created',
      sortable: true,
      render: (val) => <span className="text-muted-foreground">{val ? new Date(val).toLocaleDateString() : '—'}</span>,
    },
  ];

  return (
    <AppLayout user={user} title="Customers" subtitle="Manage customers and staff">
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
              <BreadcrumbPage>Customers</BreadcrumbPage>
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
          {isAdmin && (
            <Button onClick={() => setShowAdd((v) => !v)} variant={showAdd ? 'secondary' : 'default'}>
              {showAdd ? 'Cancel' : 'Add user'}
            </Button>
          )}
        </div>

        {showAdd && isAdmin && (
          <div className="card p-6">
            <h3 className="section-title mb-4">Add user</h3>
            <form onSubmit={handleAddUser} className="grid gap-4 sm:grid-cols-2 max-w-2xl">
              <div className="space-y-2">
                <Label htmlFor="add_name">Full name</Label>
                <Input
                  id="add_name"
                  value={addForm.full_name}
                  onChange={(e) => setAddForm((p) => ({ ...p, full_name: e.target.value }))}
                  placeholder="John Doe"
                  className="input-field"
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
                  className="input-field"
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
                  className="input-field"
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
                  className="input-field h-10"
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

        <DataTable
          columns={columns}
          data={list}
          searchPlaceholder="Search by name or email..."
          searchKeys={['full_name', 'email']}
          initialSort={{ key: 'full_name', dir: 'asc' }}
          stickyHeader
          emptyMessage="No users yet. Add customers or staff above."
          pagination
          defaultPageSize={10}
          renderActions={(row) => (
            <div className="flex items-center justify-end gap-1">
              <Link href={`/admin/users?view=${row.id}`}>
                <Button variant="ghost" size="icon" className="h-8 w-8" title="View">
                  <Eye className="h-4 w-4" />
                </Button>
              </Link>
              {isAdmin && (
                <>
                  <Link href={`/admin/users?edit=${row.id}`}>
                    <Button variant="ghost" size="icon" className="h-8 w-8" title="Edit">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href={`/admin/users?suspend=${row.id}`}>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" title="Suspend">
                      <UserX className="h-4 w-4" />
                    </Button>
                  </Link>
                </>
              )}
            </div>
          )}
        />
      </div>
    </AppLayout>
  );
}
