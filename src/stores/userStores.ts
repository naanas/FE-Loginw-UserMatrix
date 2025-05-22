import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types/user';
import asyncStorageAdapter from '../utils/asyncStorageAdapter';

type UserState = {
  token: string | null;
  user: User | null;

  setLoginData: (data: { token: string; user: User }) => void;
  logout: () => void;
  getUserRole: () => string | null;
};

const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,

      setLoginData: ({ token, user }) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
      getUserRole: () => get().user?.role ?? null,
    }),
    {
      name: 'user-storage', 
      storage: asyncStorageAdapter, 
      partialize: (state) => ({
        token: state.token,
        user: state.user,
      }),
    }
  )
);

export default useUserStore;
