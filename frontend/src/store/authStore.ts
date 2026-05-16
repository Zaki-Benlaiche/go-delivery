import { create } from 'zustand';
import api from '@/lib/api';
import { resetSocketIdentity } from '@/lib/socket';
import { hydrateStorage, getToken, getUser, setAuth, clearAuth } from '@/lib/storage';
import type { User, AuthResponse } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: string, phone: string) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: true, // start true so the initial paint shows the loader, not LandingPage

  loadUser: async () => {
    if (typeof window === 'undefined') {
      set({ isLoading: false });
      return;
    }
    try {
      // Hydrate the storage cache from Capacitor Preferences (APK) or
      // localStorage (web) before reading. On web, hydrate is essentially
      // synchronous; on APK it's a single IPC round-trip.
      await hydrateStorage();
      const token = getToken();
      const userRaw = getUser();
      if (token && userRaw) {
        set({ token, user: JSON.parse(userRaw), isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      await clearAuth();
      set({ token: null, user: null, isLoading: false });
    }
  },

  login: async (email, password) => {
    try {
      const { data } = await api.post<AuthResponse>('/auth/login', { email, password });
      await setAuth(data.token, JSON.stringify(data.user));
      set({ user: data.user, token: data.token });
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      if (!e.response) {
        throw new Error('Impossible de contacter le serveur. Vérifiez votre connexion internet.');
      }
      throw new Error(e.response.data?.message || 'Email ou mot de passe incorrect.');
    }
  },

  register: async (name, email, password, role, phone) => {
    try {
      const { data } = await api.post<AuthResponse>('/auth/register', { name, email, password, role, phone });
      await setAuth(data.token, JSON.stringify(data.user));
      set({ user: data.user, token: data.token });
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      if (!e.response) {
        throw new Error('Impossible de contacter le serveur. Vérifiez votre connexion internet.');
      }
      throw new Error(e.response.data?.message || 'Erreur lors de la création du compte.');
    }
  },

  logout: () => {
    clearAuth();
    resetSocketIdentity();
    set({ user: null, token: null });
  },
}));
