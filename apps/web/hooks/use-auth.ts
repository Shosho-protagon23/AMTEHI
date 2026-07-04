'use client';

import { create } from 'zustand';
import { api } from '@/lib/api';
import type {
  UserProfile,
  LoginInput,
  RegisterInput,
  UpdateProfileInput,
} from '@amtehi/shared';

interface AuthState {
  user: UserProfile | null;
  isLoading: boolean;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
  updateProfile: (input: UpdateProfileInput) => Promise<void>;
}

/**
 * Store auth global (Zustand). Token disimpan di httpOnly cookie oleh backend,
 * jadi store hanya menyimpan data profil — bukan token.
 */
export const useAuth = create<AuthState>((set) => ({
  user: null,
  isLoading: false,

  login: async (input) => {
    set({ isLoading: true });
    try {
      const res = await api.post('/auth/login', input);
      set({ user: res.data.data as UserProfile });
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (input) => {
    set({ isLoading: true });
    try {
      await api.post('/auth/register', input);
      // Setelah daftar, langsung login agar sesi aktif
      await api.post('/auth/login', {
        email: input.email,
        password: input.password,
      });
      const me = await api.get('/profile/me');
      set({ user: me.data.data as UserProfile });
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    await api.post('/auth/logout');
    set({ user: null });
  },

  fetchMe: async () => {
    try {
      const res = await api.get('/profile/me');
      set({ user: res.data.data as UserProfile });
    } catch {
      set({ user: null });
    }
  },

  updateProfile: async (input) => {
    set({ isLoading: true });
    try {
      const res = await api.patch('/profile/me', input);
      set({ user: res.data.data as UserProfile });
    } finally {
      set({ isLoading: false });
    }
  },
}));
