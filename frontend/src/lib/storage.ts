// Token storage abstraction. On the APK we prefer Capacitor Preferences (faster
// + survives WebView wipes that occasionally clear localStorage); on the web
// we fall back to localStorage. Reads are synchronous-by-default through a
// boot-time hydration step so the API interceptor can grab the token on the
// very first request without awaiting.

type CapacitorWindow = Window & {
  Capacitor?: { isNative?: boolean };
};

const isNative = () => {
  if (typeof window === 'undefined') return false;
  return !!(window as CapacitorWindow).Capacitor?.isNative;
};

let memTokenCache: string | null = null;
let memUserCache: string | null = null;
let hydrated = false;

// Lazy ref to the Preferences plugin so the web bundle doesn't pull it in.
let preferencesPromise: Promise<typeof import('@capacitor/preferences').Preferences> | null = null;
const getPreferences = async () => {
  if (!preferencesPromise) {
    preferencesPromise = import('@capacitor/preferences').then((m) => m.Preferences);
  }
  return preferencesPromise;
};

export async function hydrateStorage() {
  if (typeof window === 'undefined' || hydrated) return;
  if (isNative()) {
    try {
      const Prefs = await getPreferences();
      const [t, u] = await Promise.all([Prefs.get({ key: 'token' }), Prefs.get({ key: 'user' })]);
      memTokenCache = t.value || localStorage.getItem('token');
      memUserCache = u.value || localStorage.getItem('user');
    } catch {
      memTokenCache = localStorage.getItem('token');
      memUserCache = localStorage.getItem('user');
    }
  } else {
    memTokenCache = localStorage.getItem('token');
    memUserCache = localStorage.getItem('user');
  }
  hydrated = true;
}

// Synchronous reads — backed by the in-memory cache filled at hydration.
export const getToken = (): string | null => {
  if (memTokenCache !== null) return memTokenCache;
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

export const getUser = (): string | null => {
  if (memUserCache !== null) return memUserCache;
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('user');
};

// Writes go to both backends; the localStorage write is the cheap one and
// keeps web/dev paths working even if the native plugin is slow.
export async function setAuth(token: string, user: string) {
  memTokenCache = token;
  memUserCache = user;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('token', token);
      localStorage.setItem('user', user);
    } catch { /* quota / disabled storage — fall back to memory only */ }
  }
  if (isNative()) {
    try {
      const Prefs = await getPreferences();
      await Promise.all([
        Prefs.set({ key: 'token', value: token }),
        Prefs.set({ key: 'user', value: user }),
      ]);
    } catch { /* already cached in memory + localStorage */ }
  }
}

export async function clearAuth() {
  memTokenCache = null;
  memUserCache = null;
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } catch { /* ignore */ }
  }
  if (isNative()) {
    try {
      const Prefs = await getPreferences();
      await Promise.all([Prefs.remove({ key: 'token' }), Prefs.remove({ key: 'user' })]);
    } catch { /* ignore */ }
  }
}
