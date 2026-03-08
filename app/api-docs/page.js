'use client';

import Link from 'next/link';

const GROUPS = [
  { title: 'Auth', paths: ['/api/auth/login', '/api/auth/me', '/api/auth/logout', '/api/auth/forgot-password', '/api/auth/reset-password', '/api/auth/change-password', '/api/auth/profile'] },
  { title: 'Users', paths: ['/api/users', '/api/users/:id'] },
  { title: 'Packages & plans', paths: ['/api/packages', '/api/plans'] },
  { title: 'Tenant & stats', paths: ['/api/tenant', '/api/stats'] },
  { title: 'Complaints, payments, invoices', paths: ['/api/complaints', '/api/payments', '/api/invoices'] },
  { title: 'Super admin', paths: ['/api/super-admin/stats', '/api/super-admin/tenants'] },
];

export default function ApiDocsPage() {
  const base = typeof window !== 'undefined' ? window.location.origin : '';
  const v1 = `${base}/v1`;

  return (
    <div className="min-h-screen bg-background p-6 sm:p-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">API Reference</h1>
        <p className="mt-1 text-muted-foreground text-sm">
          Use base URL <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">{v1}</code> for versioned requests (e.g. mobile).
        </p>
        <div className="mt-6 space-y-6">
          {GROUPS.map((g) => (
            <section key={g.title}>
              <h2 className="text-lg font-semibold text-foreground">{g.title}</h2>
              <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-muted-foreground font-mono">
                {g.paths.map((p) => (
                  <li key={p}>
                    <span className="text-foreground">{v1}{p.replace(':id', '[id]')}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
        <p className="mt-8 text-muted-foreground text-sm">
          <Link href="/" className="text-primary hover:underline">Back to app</Link>
        </p>
      </div>
    </div>
  );
}
