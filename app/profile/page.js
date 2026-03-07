'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [edit, setEdit] = useState({ full_name: '', phone: '', address: '', email: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [changePw, setChangePw] = useState({ current: '', new: '', confirm: '' });
  const [pwError, setPwError] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [pwSaved, setPwSaved] = useState(false);

  useEffect(() => {
    fetch('/api/auth/profile', { credentials: 'include' })
      .then((r) => {
        if (!r.ok) {
          router.replace('/login');
          return null;
        }
        return r.json();
      })
      .then((data) => {
        if (data) {
          setProfile(data);
          setEdit({
            full_name: data.full_name || '',
            phone: data.phone || '',
            address: data.address || '',
            email: data.email || '',
          });
        }
      })
      .catch(() => router.replace('/login'));
  }, []);

  async function handleSaveProfile(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    setSaved(false);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(edit),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Update failed');
        return;
      }
      setProfile(data);
      setSaved(true);
    } finally {
      setLoading(false);
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    setPwError('');
    if (changePw.new !== changePw.confirm) {
      setPwError('New passwords do not match');
      return;
    }
    if (changePw.new.length < 6) {
      setPwError('New password must be at least 6 characters');
      return;
    }
    setPwLoading(true);
    setPwSaved(false);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          current_password: changePw.current,
          new_password: changePw.new,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPwError(data.error || 'Change failed');
        return;
      }
      setPwSaved(true);
      setChangePw({ current: '', new: '', confirm: '' });
    } finally {
      setPwLoading(false);
    }
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-200 border-t-primary-600" />
          <p className="text-sm text-slate-500">Loading…</p>
        </div>
      </div>
    );
  }

  const backHref = profile.role === 'ADMIN' || profile.role === 'STAFF' ? '/admin' : '/dashboard';

  return (
    <div className="min-h-screen bg-surface">
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto max-w-2xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex h-10 w-10 items-center justify-center rounded-xl overflow-hidden">
              <Image src="/appicon.png" alt="NETSCALE" width={40} height={40} className="object-contain" />
            </Link>
            <h1 className="text-lg font-semibold text-slate-800">My profile</h1>
          </div>
          <Link href={backHref} className="btn-secondary py-2 px-4 text-sm">Back</Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8 space-y-8">
        <div className="card">
          <h2 className="text-sm font-medium text-slate-500 mb-4">Profile info</h2>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            {error && <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">{error}</div>}
            {saved && <p className="text-sm text-emerald-600">Profile updated.</p>}
            <div>
              <label className="label">Full name</label>
              <input
                type="text"
                value={edit.full_name}
                onChange={(e) => setEdit((p) => ({ ...p, full_name: e.target.value }))}
                className="input-field"
              />
            </div>
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                value={edit.email}
                onChange={(e) => setEdit((p) => ({ ...p, email: e.target.value }))}
                className="input-field"
                readOnly={profile.role !== 'ADMIN'}
              />
              {profile.role !== 'ADMIN' && <p className="text-xs text-slate-400 mt-1">Only admins can change email.</p>}
            </div>
            <div>
              <label className="label">Phone</label>
              <input
                type="text"
                value={edit.phone}
                onChange={(e) => setEdit((p) => ({ ...p, phone: e.target.value }))}
                className="input-field"
                placeholder="Optional"
              />
            </div>
            <div>
              <label className="label">Address</label>
              <textarea
                value={edit.address}
                onChange={(e) => setEdit((p) => ({ ...p, address: e.target.value }))}
                className="input-field min-h-[80px]"
                placeholder="Optional"
                rows={3}
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary">Save profile</button>
          </form>
        </div>

        <div className="card">
          <h2 className="text-sm font-medium text-slate-500 mb-4">Change password</h2>
          <form onSubmit={handleChangePassword} className="space-y-4">
            {pwError && <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">{pwError}</div>}
            {pwSaved && <p className="text-sm text-emerald-600">Password changed.</p>}
            <div>
              <label className="label">Current password</label>
              <input
                type="password"
                value={changePw.current}
                onChange={(e) => setChangePw((p) => ({ ...p, current: e.target.value }))}
                className="input-field"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="label">New password</label>
              <input
                type="password"
                value={changePw.new}
                onChange={(e) => setChangePw((p) => ({ ...p, new: e.target.value }))}
                className="input-field"
                placeholder="Min 6 characters"
                minLength={6}
              />
            </div>
            <div>
              <label className="label">Confirm new password</label>
              <input
                type="password"
                value={changePw.confirm}
                onChange={(e) => setChangePw((p) => ({ ...p, confirm: e.target.value }))}
                className="input-field"
                placeholder="••••••••"
              />
            </div>
            <button type="submit" disabled={pwLoading} className="btn-primary">Change password</button>
          </form>
        </div>
      </main>
    </div>
  );
}
