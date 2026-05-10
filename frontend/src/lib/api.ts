import axios from 'axios';
import { getToken, clearAuth } from '@/lib/storage';

// Detect environment for the API base URL. Capacitor APK runs at file:// or
// localhost-on-device, so we have to point it at the real backend explicitly.
const getApiUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;

  if (typeof window !== 'undefined') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((window as any).Capacitor?.isNative) {
      return 'https://go-delivery-1.onrender.com/api';
    }
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:3001/api';
    }
  }

  return 'https://go-delivery-1.onrender.com/api';
};

const api = axios.create({
  baseURL: getApiUrl(),
  headers: { 'Content-Type': 'application/json' },
  // Fail fast on dead connections instead of letting the UI freeze for minutes.
  timeout: 15000,
});

// Attach JWT token to every request via the storage abstraction.
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle 401 Unauthorized: clear creds and bounce to /auth.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        clearAuth();
        window.location.href = '/auth';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
