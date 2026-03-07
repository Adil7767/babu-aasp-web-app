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
import { Loader2 } from 'lucide-react';

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/40 to-background px-4 py-12">
      <div className="w-full max-w-[420px] space-y-8 animate-in fade-in duration-200">
        <div className="flex flex-col items-center text-center gap-3">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 shadow-lg ring-1 ring-primary/10">
            <Image src="/appicon.png" alt="NETSCALE" width={52} height={52} className="object-contain" />
          </div>
          <div>
            <h1 className="page-title">NETSCALE</h1>
            <p className="page-subtitle">ISP Management · Sign in to your account</p>
          </div>
        </div>

        <Card className="shadow-lg border-border/80 rounded-2xl overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-semibold">Sign in</CardTitle>
            <CardDescription>Enter your email and password to continue</CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <form onSubmit={handleSubmit} className="space-y-5" aria-label="Sign in form">
              {error && (
                <div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive font-medium" aria-live="polite">
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
                  className="h-11 rounded-xl border-input"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link href="/forgot-password" className="text-xs font-medium text-primary hover:underline">
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
                  className="h-11 rounded-xl border-input"
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full h-11 rounded-xl font-semibold disabled:cursor-not-allowed" aria-busy={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin shrink-0" aria-hidden />
                    <span>Signing in…</span>
                  </>
                ) : (
                  'Sign in'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          <Link href="/signup" className="font-semibold text-foreground hover:underline">
            Register your ISP
          </Link>
          <span className="mx-1.5">·</span>
          <Link href="/" className="hover:underline">Home</Link>
        </p>
      </div>
    </div>
  );
}
