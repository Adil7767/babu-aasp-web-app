'use client';

import { useQuery } from '@tanstack/react-query';

async function fetchStats() {
  const r = await fetch('/api/stats', { credentials: 'include' });
  if (r.status === 402) return null;
  if (!r.ok) throw new Error('Failed to fetch stats');
  return r.json();
}

export function useStats(enabled = true) {
  return useQuery({
    queryKey: ['stats'],
    queryFn: fetchStats,
    staleTime: 60 * 1000,
    enabled,
  });
}
