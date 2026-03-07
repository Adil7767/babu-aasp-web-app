'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import AppLayout from '../components/AppLayout';
import { ProfilePageSkeleton } from '../components/ContentSkeletons';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { User, Lock, Camera } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [edit, setEdit] = useState({ full_name: '', phone: '', address: '', email: '', avatar_url: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [changePw, setChangePw] = useState({ current: '', new: '', confirm: '' });
  const [pwError, setPwError] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [pwSaved, setPwSaved] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const uploadInputRef = useRef(null);

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then((r) => {
        if (!r.ok) {
          router.replace('/login');
          return null;
        }
        return r.json();
      })
      .then((u) => {
        if (u) setUser(u);
      })
      .catch(() => router.replace('/login'));
  }, [router]);

  useEffect(() => {
    if (!user) return;
    fetch('/api/auth/profile', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) {
          setProfile(data);
          setEdit({
            full_name: data.full_name || '',
            phone: data.phone || '',
            address: data.address || '',
            email: data.email || '',
            avatar_url: data.avatar_url || '',
          });
        }
      });
  }, [user]);

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
        toast.error(data.error || 'Update failed');
        return;
      }
      setProfile(data);
      setUser((prev) => (prev ? { ...prev, ...data } : null));
      setSaved(true);
      toast.success('Profile updated');
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
        toast.error(data.error || 'Change failed');
        return;
      }
      setPwSaved(true);
      setChangePw({ current: '', new: '', confirm: '' });
      toast.success('Password changed');
    } finally {
      setPwLoading(false);
    }
  }

  if (!user) {
    return (
      <AppLayout user={null} title="Profile" subtitle="Update your account" maxWidth="max-w-2xl">
        <ProfilePageSkeleton />
      </AppLayout>
    );
  }

  async function handleAvatarUpload(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setAvatarUploading(true);
    setAvatarError(false);
    try {
      const form = new FormData();
      form.append('file', f);
      form.append('folder', 'avatars');
      const res = await fetch('/api/upload', { method: 'POST', credentials: 'include', body: form });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Upload failed');
        return;
      }
      setEdit((p) => ({ ...p, avatar_url: data.url }));
      toast.success('Image uploaded');
    } catch (err) {
      toast.error('Upload failed');
    } finally {
      setAvatarUploading(false);
      e.target.value = '';
    }
  }

  const displayAvatar = (edit.avatar_url?.trim() || profile?.avatar_url) && !avatarError;
  const initial = (profile?.full_name || user?.full_name || 'U').charAt(0).toUpperCase();

  return (
    <AppLayout user={user} title="Profile" subtitle="Update your account" maxWidth="max-w-2xl">
      <div className="space-y-8">
        {/* Profile picture & info card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile & picture
            </CardTitle>
            <CardDescription>Update your display name, email, and profile photo (paste an image URL).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              <div className="flex flex-col items-center gap-3">
                <div className="relative h-24 w-24 rounded-full overflow-hidden bg-muted ring-2 ring-border flex items-center justify-center">
                  {displayAvatar ? (
                    <Image
                      src={edit.avatar_url?.trim() || profile?.avatar_url}
                      alt="Avatar"
                      fill
                      className="object-cover"
                      unoptimized
                      onError={() => setAvatarError(true)}
                      onLoad={() => setAvatarError(false)}
                    />
                  ) : null}
                  {!displayAvatar && (
                    <span className="text-3xl font-semibold text-muted-foreground">{initial}</span>
                  )}
                  <button
                    type="button"
                    onClick={() => uploadInputRef.current?.click()}
                    disabled={avatarUploading}
                    className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50"
                    aria-label="Upload photo"
                  >
                    <Camera className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-xs text-muted-foreground text-center">Shown in header</p>
              </div>
              <div className="flex-1 w-full space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="avatar_url">Profile picture URL</Label>
                  <Input
                    id="avatar_url"
                    type="url"
                    value={edit.avatar_url}
                    onChange={(e) => setEdit((p) => ({ ...p, avatar_url: e.target.value }))}
                    placeholder="https://… or upload below"
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Or upload image (S3 / Cloudinary)</Label>
                  <input
                    ref={uploadInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    className="hidden"
                    onChange={handleAvatarUpload}
                    disabled={avatarUploading}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={avatarUploading}
                    onClick={() => uploadInputRef.current?.click()}
                  >
                    {avatarUploading ? 'Uploading…' : 'Choose image to upload'}
                  </Button>
                  <p className="text-xs text-muted-foreground">JPEG, PNG, GIF or WebP, max 5 MB.</p>
                </div>
              </div>
            </div>

            {error && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}
            {saved && (
              <p className="text-sm text-emerald-600 font-medium">Profile updated.</p>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full name</Label>
                  <Input
                    id="full_name"
                    type="text"
                    value={edit.full_name}
                    onChange={(e) => setEdit((p) => ({ ...p, full_name: e.target.value }))}
                    placeholder="Your name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={edit.email}
                    onChange={(e) => setEdit((p) => ({ ...p, email: e.target.value }))}
                    placeholder="you@example.com"
                    disabled={profile?.role !== 'ADMIN'}
                  />
                  {profile?.role !== 'ADMIN' && (
                    <p className="text-xs text-muted-foreground">Only admins can change email.</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="text"
                  value={edit.phone}
                  onChange={(e) => setEdit((p) => ({ ...p, phone: e.target.value }))}
                  placeholder="Optional"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <textarea
                  id="address"
                  value={edit.address}
                  onChange={(e) => setEdit((p) => ({ ...p, address: e.target.value }))}
                  placeholder="Optional"
                  rows={3}
                  className="flex min-h-[80px] w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving…' : 'Save profile'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Change password */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Change password
            </CardTitle>
            <CardDescription>Set a new password. You will stay signed in.</CardDescription>
          </CardHeader>
          <CardContent>
            {pwError && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive mb-4">
                {pwError}
              </div>
            )}
            {pwSaved && (
              <p className="text-sm text-emerald-600 font-medium mb-4">Password changed.</p>
            )}
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current_pw">Current password</Label>
                <Input
                  id="current_pw"
                  type="password"
                  value={changePw.current}
                  onChange={(e) => setChangePw((p) => ({ ...p, current: e.target.value }))}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new_pw">New password</Label>
                <Input
                  id="new_pw"
                  type="password"
                  value={changePw.new}
                  onChange={(e) => setChangePw((p) => ({ ...p, new: e.target.value }))}
                  placeholder="Min 6 characters"
                  minLength={6}
                  autoComplete="new-password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm_pw">Confirm new password</Label>
                <Input
                  id="confirm_pw"
                  type="password"
                  value={changePw.confirm}
                  onChange={(e) => setChangePw((p) => ({ ...p, confirm: e.target.value }))}
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
              </div>
              <Button type="submit" disabled={pwLoading} variant="secondary">
                {pwLoading ? 'Updating…' : 'Change password'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
