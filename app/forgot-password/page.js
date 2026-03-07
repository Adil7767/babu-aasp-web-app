'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [resetLink, setResetLink] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    setSent(false);
    setResetLink('');
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        const msg = data.detail || data.error || 'Something went wrong';
        setError(msg);
        toast.error(msg);
        return;
      }
      setSent(true);
      if (data.reset_link) setResetLink(data.reset_link);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/40 to-background px-4 py-12">
      <div className="w-full max-w-[420px] space-y-8">
        <div className="flex flex-col items-center text-center gap-3">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 shadow-lg ring-1 ring-primary/10">
            <Image src="/appicon.png" alt="NETSCALE" width={52} height={52} className="object-contain" />
          </div>
          <div>
            <h1 className="page-title">Forgot password</h1>
            <p className="page-subtitle">Enter your email to receive a reset link</p>
          </div>
        </div>

        <Card className="shadow-lg border-border/80 rounded-2xl overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-semibold">Reset password</CardTitle>
            <CardDescription>We’ll send a link to your email</CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            {sent ? (
              <div className="space-y-5">
                <p className="text-sm text-muted-foreground">
                  If an account exists with that email, you will receive a reset link. Check your inbox.
                </p>
                {resetLink && (
                  <p className="text-xs text-muted-foreground break-all">
                    Dev: <a href={resetLink} className="text-primary underline">Open reset link</a>
                  </p>
                )}
                <Link href="/login" className={cn(buttonVariants(), 'w-full h-11 rounded-xl font-semibold inline-flex items-center justify-center')}>
                  Back to sign in
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive font-medium">
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
                <Button type="submit" disabled={loading} className="w-full h-11 rounded-xl font-semibold" aria-busy={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin shrink-0" aria-hidden />
                      <span>Sending…</span>
                    </>
                  ) : (
                    'Send reset link'
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          <Link href="/login" className="font-semibold text-foreground hover:underline">Back to sign in</Link>
        </p>
      </div>
    </div>
  );
}
