'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        const msg = data.detail || data.error || 'Login failed';
        setError(msg);
        toast.error(msg);
        return;
      }
      if (data.user.role === 'SUPER_ADMIN') {
        router.push('/super-admin');
      } else if (data.user.tenant?.subscription_status === 'SUSPENDED') {
        router.push('/suspended');
      } else if ((data.user.role === 'ADMIN' || data.user.role === 'STAFF') && data.user.tenant?.subscription_status === 'PENDING_PAYMENT') {
        router.push('/pending-subscription');
      } else if ((data.user.role === 'ADMIN' || data.user.role === 'STAFF') && data.user.tenant?.subscription_ends_at && new Date(data.user.tenant.subscription_ends_at) < new Date()) {
        router.push('/renew-subscription');
      } else if (data.user.role === 'ADMIN' || data.user.role === 'STAFF') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center text-center gap-2">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 ring-2 ring-primary/20">
            <Image src="/appicon.png" alt="NETSCALE" width={48} height={48} className="object-contain" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">NETSCALE</h1>
          <p className="text-sm text-muted-foreground">ISP Management · Sign in to your account</p>
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-lg">Sign in</CardTitle>
            <CardDescription>Enter your email and password</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="h-10"
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full h-10">
                {loading ? 'Signing in…' : 'Sign in'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          <Link href="/signup" className="font-medium text-foreground hover:underline">
            Register your ISP
          </Link>
          {' · '}
          <Link href="/" className="hover:underline">Home</Link>
        </p>
      </div>
    </div>
  );
}
