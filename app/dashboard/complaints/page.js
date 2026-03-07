'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '../../components/AppLayout';

const CATEGORIES = [
  { value: 'SLOW_INTERNET', label: 'Slow internet' },
  { value: 'NO_CONNECTION', label: 'No connection' },
  { value: 'ROUTER_ISSUE', label: 'Router issue' },
  { value: 'BILLING_QUERY', label: 'Billing query' },
  { value: 'OTHER', label: 'Other' },
];

const STATUS_CLASS = {
  PENDING: 'bg-amber-100 text-amber-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  RESOLVED: 'bg-emerald-100 text-emerald-800',
  CLOSED: 'bg-slate-100 text-slate-600',
};

export default function UserComplaintsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [list, setList] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [category, setCategory] = useState('SLOW_INTERNET');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((u) => {
        if (!u) {
          router.replace('/login');
          return;
        }
        setUser(u);
        return fetch('/api/complaints', { credentials: 'include' }).then((r) => r.json());
      })
      .then((data) => Array.isArray(data) && setList(data))
      .catch(() => router.replace('/login'));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!description.trim()) return;
    setSubmitting(true);
    try {
      await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ category, description: description.trim() }),
      });
      setDescription('');
      setShowForm(false);
      const res = await fetch('/api/complaints', { credentials: 'include' });
      const data = await res.json();
      setList(Array.isArray(data) ? data : []);
    } finally {
      setSubmitting(false);
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-200 border-t-primary-600" />
          <p className="text-sm text-slate-500">Loading…</p>
        </div>
      </div>
    );
  }

  return (
    <AppLayout user={user} title="My complaints" subtitle="Submit and track support tickets" maxWidth="max-w-4xl">
      <div>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="btn-primary mb-6"
        >
          {showForm ? 'Cancel' : 'Submit new complaint'}
        </button>

        {showForm && (
          <form onSubmit={handleSubmit} className="card mb-8 space-y-4">
            <div>
              <label className="label">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="input-field"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={4}
                className="input-field"
                placeholder="Describe your issue…"
              />
            </div>
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? 'Submitting…' : 'Submit'}
            </button>
          </form>
        )}

        {list.length === 0 && !showForm ? (
          <div className="card text-center py-12 text-slate-500">
            <p>No complaints yet.</p>
            <p className="text-sm mt-1">Use the button above to submit a support ticket.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {list.map((c) => (
              <div key={c.id} className="card">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="inline-flex items-center rounded-lg bg-primary-100 px-2.5 py-1 text-xs font-medium text-primary-800">
                    {CATEGORIES.find((x) => x.value === c.category)?.label || c.category}
                  </span>
                  <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-medium ${STATUS_CLASS[c.status] || 'bg-slate-100 text-slate-600'}`}>
                    {c.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-slate-700">{c.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
