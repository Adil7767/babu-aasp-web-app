'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';

async function fetchMe() {
  const { setUser, clearUser } = useAuthStore.getState();
  const r = await fetch('/api/auth/me', { credentials: 'include' });
  if (!r.ok) {
    clearUser();
    return null;
  }
  const user = await r.json();
  setUser(user);
  return user;
}

export function useAuthMe() {
  const storeUser = useAuthStore((s) => s.user);
  const query = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: fetchMe,
    retry: false,
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    initialData: storeUser,
  });
  return {
    ...query,
    data: query.data !== undefined ? query.data : storeUser,
  };
}
