'use client';

import { useQuery } from '@tanstack/react-query';

async function fetchMe() {
  const r = await fetch('/api/auth/me', { credentials: 'include' });
  if (!r.ok) return null;
  return r.json();
}

export function useAuthMe() {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: fetchMe,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}
