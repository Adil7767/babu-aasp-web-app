'use client';

import { useQuery } from '@tanstack/react-query';

async function fetchUsers(role) {
  const url = role ? `/api/users?role=${role}` : '/api/users';
  const r = await fetch(url, { credentials: 'include' });
  if (!r.ok) throw new Error('Failed to fetch users');
  return r.json();
}

export function useUsers(role = '') {
  return useQuery({
    queryKey: ['users', role || 'all'],
    queryFn: () => fetchUsers(role),
    enabled: true,
  });
}
