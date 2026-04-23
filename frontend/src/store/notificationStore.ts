import { create } from 'zustand';

export interface AppNotification {
  id: string;
  type: 'new_order' | 'order_accepted' | 'order_preparing' | 'order_ready' | 'order_delivering' | 'order_delivered' | 'order_cancelled' | 'info';
  title: string;
  message: string;
  icon: string;
  color: string;
  timestamp: number;
  read: boolean;
  orderId?: number;
}

interface NotificationState {
  notifications: AppNotification[];
  unreadCount: number;
  showToast: boolean;
  currentToast: AppNotification | null;
  isDropdownOpen: boolean;
  addNotification: (notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => void;
  markAllRead: () => void;
  clearAll: () => void;
  dismissToast: () => void;
  toggleDropdown: () => void;
  closeDropdown: () => void;
}

let toastTimeout: ReturnType<typeof setTimeout> | null = null;

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  showToast: false,
  currentToast: null,
  isDropdownOpen: false,

  addNotification: (notif) => {
    const newNotif: AppNotification = {
      ...notif,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: Date.now(),
      read: false,
    };

    set((state) => ({
      notifications: [newNotif, ...state.notifications].slice(0, 50), // Keep last 50
      unreadCount: state.unreadCount + 1,
      showToast: true,
      currentToast: newNotif,
    }));

    // Vibrate on mobile if supported
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try { navigator.vibrate([100, 50, 100]); } catch { /* ignore */ }
    }

    // Play notification sound
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
      oscillator.frequency.setValueAtTime(1100, audioCtx.currentTime + 0.1);
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
      oscillator.start(audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + 0.4);
    } catch { /* ignore audio errors */ }

    // Auto-dismiss toast after 5s
    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      set({ showToast: false, currentToast: null });
    }, 5000);
  },

  markAllRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    }));
  },

  clearAll: () => {
    set({ notifications: [], unreadCount: 0 });
  },

  dismissToast: () => {
    if (toastTimeout) clearTimeout(toastTimeout);
    set({ showToast: false, currentToast: null });
  },

  toggleDropdown: () => {
    const isOpen = get().isDropdownOpen;
    set({ isDropdownOpen: !isOpen });
    if (!isOpen) {
      // Mark all as read when opening
      get().markAllRead();
    }
  },

  closeDropdown: () => {
    set({ isDropdownOpen: false });
  },
}));
