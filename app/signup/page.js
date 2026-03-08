'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const [plans, setPlans] = useState([]);
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [plan, setPlan] = useState('STARTER');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/plans')
      .then((r) => r.json())
      .then(setPlans)
      .catch(() =>
        setPlans([
          { id: 'STARTER', name: 'Starter', customer_limit: 200, monthly_price_pkr: 1000, description: 'Up to 200 customers' },
          { id: 'PROFESSIONAL', name: 'Professional', customer_limit: 1000, monthly_price_pkr: 2000, description: 'Up to 1,000 customers' },
          { id: 'ENTERPRISE', name: 'Enterprise', customer_limit: 0, monthly_price_pkr: 3000, description: 'Unlimited customers' },
        ])
      );
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_name: companyName.trim(),
          email: email.trim(),
          password,
          full_name: fullName.trim(),
          plan,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        const msg = data.detail || data.error || 'Registration failed';
        setError(msg);
        toast.error(msg);
        return;
      }
      setSuccess(true);
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="fixed inset-0 w-full min-h-screen flex flex-col items-center justify-center bg-auth px-4 py-12 overflow-auto">
        <Card className="w-full max-w-[440px] flex-shrink-0 mx-auto card-glass shadow-xl overflow-hidden border-0 relative z-10">
          <CardContent className="pt-10 pb-10 px-8 text-center space-y-6">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15 text-primary text-2xl font-bold shadow-md">
              ✓
            </div>
            <div className="space-y-2">
              <h1 className="page-title text-xl">Registration successful</h1>
              <p className="page-subtitle">
                Sign in and submit your subscription payment (JazzCash, EasyPaisa, or bank transfer) for Super Admin approval.
              </p>
            </div>
            <Link href="/login" className={cn(buttonVariants(), 'w-full h-12 rounded-xl font-semibold inline-flex items-center justify-center shadow-md hover:shadow-lg transition-shadow')}>
              Sign in
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 w-full min-h-screen flex flex-col items-center justify-center bg-auth px-4 py-12 overflow-auto">
      <div className="w-full max-w-[440px] flex-shrink-0 mx-auto space-y-10 relative z-10 animate-fade-in-up">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-card shadow-glass ring-1 ring-white/60">
            <Image src="/appicon.png" alt="NETSCALE" width={52} height={52} className="object-contain" />
          </div>
          <div>
            <h1 className="page-title">Register your ISP</h1>
            <p className="page-subtitle">
              Create an account and choose a plan. Payment is manual; Super Admin will activate your account.
            </p>
          </div>
        </div>

        <Card className="card-glass shadow-xl overflow-hidden border-0">
          <CardHeader className="pb-3 pt-6 px-6 sm:px-8">
            <CardTitle className="text-xl font-semibold tracking-tight">Create account</CardTitle>
            <CardDescription>Company and admin details</CardDescription>
          </CardHeader>
          <CardContent className="pt-2 px-6 sm:px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive font-medium">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="company_name">Company / ISP name</Label>
                <Input
                  id="company_name"
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                  placeholder="e.g. Babu ISP"
                  className="h-11 rounded-xl border-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="full_name">Your full name</Label>
                <Input
                  id="full_name"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  placeholder="Admin name"
                  className="h-11 rounded-xl border-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email (login)</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="admin@yourisp.com"
                  className="h-11 rounded-xl border-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="••••••••"
                  className="h-11 rounded-xl border-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="plan">Plan</Label>
                <select
                  id="plan"
                  value={plan}
                  onChange={(e) => setPlan(e.target.value)}
                  className="flex h-11 w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} – PKR {(p.monthly_price_pkr ?? 0).toLocaleString()}/mo · {p.description}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground">Pay via JazzCash / EasyPaisa after signup.</p>
              </div>
              <Button type="submit" disabled={loading} className="w-full h-12 rounded-xl font-semibold shadow-md hover:shadow-lg transition-shadow" aria-busy={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin shrink-0" aria-hidden />
                    <span>Registering…</span>
                  </>
                ) : (
                  'Register'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="pt-2 border-t border-border/60">
          <p className="text-center text-sm text-muted-foreground">
            <Link href="/login" className="font-semibold text-foreground hover:text-primary transition-colors">Already have an account? Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
