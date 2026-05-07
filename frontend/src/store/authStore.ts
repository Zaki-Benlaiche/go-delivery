import { create } from 'zustand';
import api from '@/lib/api';
import { resetSocketIdentity } from '@/lib/socket';
import type { User, AuthResponse } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: string, phone: string, restaurantType?: string) => Promise<void>;
  logout: () => void;
  loadUser: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: false,

  loadUser: () => {
    if (typeof window !== 'undefined') {
      try {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        if (token && userData) {
          set({ token, user: JSON.parse(userData), isLoading: false });
        } else {
          set({ isLoading: false });
        }
      } catch (error) {
        console.error('Failed to parse user data', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({ token: null, user: null, isLoading: false });
      }
    }
  },

  login: async (email, password) => {
    try {
      const { data } = await api.post<AuthResponse>('/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      set({ user: data.user, token: data.token });
    } catch (err: any) {
      if (!err?.response) {
        throw new Error('Impossible de contacter le serveur. Vérifiez votre connexion internet.');
      }
      throw new Error(err.response.data?.message || 'Email ou mot de passe incorrect.');
    }
  },

  register: async (name, email, password, role, phone, restaurantType) => {
    try {
      const { data } = await api.post<AuthResponse>('/auth/register', { name, email, password, role, phone, restaurantType });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      set({ user: data.user, token: data.token });
    } catch (err: any) {
      if (!err?.response) {
        throw new Error('Impossible de contacter le serveur. Vérifiez votre connexion internet.');
      }
      throw new Error(err.response.data?.message || 'Erreur lors de la création du compte.');
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    resetSocketIdentity();
    set({ user: null, token: null });
  },
}));
