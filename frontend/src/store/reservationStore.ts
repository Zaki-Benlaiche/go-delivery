import { create } from 'zustand';
import api from '@/lib/api';
import { getSocket } from '@/lib/socket';
import { useAuthStore } from '@/store/authStore';
import { useNotificationStore } from '@/store/notificationStore';

export interface PlaceWithQueue {
  id: number;
  name: string;
  type: string;
  address: string;
  description: string;
  icon: string;
  waitingCount: number;
  isOpen: boolean;
  userId?: number;
}

export interface MyReservation {
  id: number;
  queueNumber: number;
  peopleBefore: number;
  status: string;
  date: string;
  estimatedWaitMinutes: number;
  userId?: number;
  placeId?: number;
  place: { id: number; name: string; icon: string; address: string; type: string; userId?: number };
}

interface ReservationState {
  places: PlaceWithQueue[];
  myReservations: MyReservation[];
  loaded: boolean;
  fetchAll: () => Promise<void>;
  bookSpot: (placeId: number) => Promise<void>;
  cancelReservation: (id: number) => Promise<void>;
  listenToSocket: () => () => void;
}

const STATUS_LABELS: Record<string, string> = {
  waiting: 'En attente',
  called: 'Appelé',
  done: 'Terminé',
  cancelled: 'Annulé',
};

export const useReservationStore = create<ReservationState>((set, get) => ({
  places: [],
  myReservations: [],
  loaded: false,

  fetchAll: async () => {
    try {
      const [placesRes, reservationsRes] = await Promise.all([
        api.get<PlaceWithQueue[]>('/places'),
        api.get<MyReservation[]>('/reservations/my'),
      ]);
      set({ places: placesRes.data, myReservations: reservationsRes.data, loaded: true });
    } catch (err) {
      console.error('reservation fetchAll error:', err);
      set({ loaded: true });
    }
  },

  bookSpot: async (placeId) => {
    const { data } = await api.post<MyReservation>('/reservations', { placeId });
    set((s) => ({
      myReservations: [data, ...s.myReservations.filter((r) => r.id !== data.id)],
      places: s.places.map((p) => p.id === placeId ? { ...p, waitingCount: (p.waitingCount || 0) + 1 } : p),
    }));
  },

  cancelReservation: async (id) => {
    await api.put(`/reservations/${id}/cancel`);
    set((s) => ({
      myReservations: s.myReservations.map((r) => r.id === id ? { ...r, status: 'cancelled' } : r),
    }));
  },

  listenToSocket: () => {
    if (typeof window === 'undefined') return () => {};
    const socket = getSocket();
    if (!socket) return () => {};

    const addNotif = useNotificationStore.getState().addNotification;

    const handleUpdated = (reservation: MyReservation) => {
      const user = useAuthStore.getState().user;
      if (!user) return;

      // Notify customer when the doctor calls them or updates info.
      if (user.id === reservation.userId) {
        if (reservation.status === 'called') {
          addNotif({
            type: 'info',
            title: 'Vous êtes appelé !',
            message: `${reservation.place?.name || 'Établissement'} vous attend (#${reservation.queueNumber})`,
            icon: '📞',
            color: '#2ed573',
          });
        }
      }

      set((s) => {
        const exists = s.myReservations.some((r) => r.id === reservation.id);
        return {
          myReservations: exists
            ? s.myReservations.map((r) => (r.id === reservation.id ? { ...r, ...reservation } : r))
            : (user.id === reservation.userId ? [reservation, ...s.myReservations] : s.myReservations),
        };
      });
    };

    const handleCreated = (reservation: MyReservation) => {
      const user = useAuthStore.getState().user;
      if (!user) return;
      // Place owner gets a fresh booking — refresh the list.
      if (user.role === 'place') {
        // We can't easily merge into PlaceDashboard's local state from here, so it
        // re-listens to this same event there. Customer side: only insert if it's mine.
      }
      if (user.id === reservation.userId) {
        set((s) => ({
          myReservations: [reservation, ...s.myReservations.filter((r) => r.id !== reservation.id)],
        }));
      }
    };

    socket.on('reservation_updated', handleUpdated);
    socket.on('reservation_created', handleCreated);

    return () => {
      socket.off('reservation_updated', handleUpdated);
      socket.off('reservation_created', handleCreated);
    };
  },
}));

export const reservationStatusLabels = STATUS_LABELS;
