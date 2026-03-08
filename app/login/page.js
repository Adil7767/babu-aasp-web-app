'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { setAuthUser } from '@/store/authStore';
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
      setAuthUser(data.user);
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
    <div className="fixed inset-0 w-full min-h-screen flex flex-col items-center justify-center bg-auth px-4 py-12 overflow-auto">
      <div className="w-full max-w-[440px] flex-shrink-0 mx-auto space-y-10 relative z-10 animate-fade-in-up">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-card shadow-glass ring-1 ring-white/60 animate-[float_6s_ease-in-out_infinite]">
            <Image src="/appicon.png" alt="NETSCALE" width={56} height={56} className="object-contain drop-shadow-sm" />
          </div>
          <div className="space-y-1">
            <h1 className="page-title text-2xl sm:text-[1.75rem] tracking-tight">NETSCALE</h1>
            <p className="page-subtitle text-muted-foreground">ISP Management · Sign in to your account</p>
          </div>
        </div>

        <Card className="card-glass shadow-xl overflow-hidden border-0">
          <CardHeader className="pb-3 pt-6 px-6 sm:px-8">
            <CardTitle className="text-xl font-semibold tracking-tight">Sign in</CardTitle>
            <CardDescription className="text-muted-foreground">Enter your email and password to continue</CardDescription>
          </CardHeader>
          <CardContent className="pt-2 px-6 sm:px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-5" aria-label="Sign in form">
              {error && (
                <div role="alert" className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive font-medium" aria-live="polite">
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
                  className="h-11 rounded-xl border-input transition-shadow"
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
                  className="h-11 rounded-xl border-input transition-shadow"
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full h-12 rounded-xl font-semibold disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-shadow" aria-busy={loading}>
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

        <div className="pt-2 border-t border-border/60">
          <p className="text-center text-sm text-muted-foreground">
            <Link href="/signup" className="font-semibold text-foreground hover:text-primary transition-colors">
              Register your ISP
            </Link>
            <span className="mx-2 text-border">·</span>
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
