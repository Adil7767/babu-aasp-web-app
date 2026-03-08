'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const AUTH_STORAGE_KEY = 'babu-auth';

export function useAuthStore() {
  return useAuthStoreImpl();
}

export const useAuthStoreImpl = create(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),
    }),
    { name: AUTH_STORAGE_KEY }
  )
);

export function getAuthUser() {
  return useAuthStoreImpl.getState().user;
}

export function setAuthUser(user) {
  useAuthStoreImpl.getState().setUser(user);
}

export function clearAuthUser() {
  useAuthStoreImpl.getState().clearUser();
}
