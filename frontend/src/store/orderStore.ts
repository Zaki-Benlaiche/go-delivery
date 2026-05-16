import { create } from 'zustand';
import api from '@/lib/api';
import { getSocket } from '@/lib/socket';
import { useAuthStore } from '@/store/authStore';
import { useNotificationStore } from '@/store/notificationStore';
import type { Order } from '@/types';

interface OrderState {
  orders: Order[];
  availableOrders: Order[];
  isLoading: boolean;
  fetchOrders: () => Promise<void>;
  fetchAvailableOrders: () => Promise<void>;
  createOrder: (restaurantId: number, items: { productId: number; quantity: number }[], deliveryAddress: string) => Promise<void>;
  updateStatus: (orderId: number, status: string, opts?: { deliveryFee?: number }) => Promise<void>;
  listenToSocket: () => () => void;
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'En Attente',
  accepted: 'Acceptée',
  preparing: 'En Préparation',
  ready: 'Prête',
  out_for_delivery: 'En Livraison',
  delivered: 'Livrée',
  cancelled: 'Annulée',
};

export const useOrderStore = create<OrderState>((set) => ({
  orders: [],
  availableOrders: [],
  isLoading: false,

  fetchOrders: async () => {
    set({ isLoading: true });
    try {
      const { data } = await api.get<Order[]>('/orders');
      set({ orders: data, isLoading: false });
    } catch (err) {
      console.error('fetchOrders error:', err);
      set({ isLoading: false });
    }
  },

  fetchAvailableOrders: async () => {
    try {
      const { data } = await api.get<Order[]>('/orders/available');
      set({ availableOrders: data });
    } catch (err) {
      console.error('fetchAvailableOrders error:', err);
    }
  },

  createOrder: async (restaurantId, items, deliveryAddress) => {
    try {
      // Server replies with the full order and ALSO fires a `new_order` socket
      // event to client_<id>. The socket handler upserts the order into the
      // store, so we don't need to refetch — that round-trip just doubled the
      // perceived "send" latency for no extra information.
      const { data } = await api.post<Order>('/orders', { restaurantId, items, deliveryAddress });
      if (data?.id) {
        set((state) => ({
          orders: [data, ...state.orders.filter((o) => o.id !== data.id)],
        }));
      }
    } catch (err) {
      console.error('createOrder error:', err);
    }
  },

  updateStatus: async (orderId, status, opts) => {
    try {
      const body: { status: string; deliveryFee?: number } = { status };
      if (opts?.deliveryFee !== undefined) body.deliveryFee = opts.deliveryFee;
      await api.put(`/orders/${orderId}/status`, body);
      // Don't refetch — the server's socket event keeps state in sync, and a
      // second HTTP round-trip on every action just slows the UI down.
    } catch (err) {
      console.error('updateStatus error:', err);
      throw err;
    }
  },

  listenToSocket: () => {
    if (typeof window === 'undefined') return () => {};

    const socket = getSocket();
    if (!socket) return () => {};

    const addNotif = useNotificationStore.getState().addNotification;

    const handleOrderUpdate = (order: Order) => {
      console.log('📦 Order updated via socket:', order.id, order.status);
      
      const user = useAuthStore.getState().user;
      if (!user) return;

      // --- NOTIFICATIONS ---
      const statusLabel = STATUS_LABELS[order.status] || order.status;
      const restaurantName = order.restaurant?.name || 'Restaurant';
      const customerName = order.customer?.name || 'Client';

      if (user.role === 'client' && order.customerId === user.id) {
        if (order.status === 'accepted' || order.status === 'preparing') {
          addNotif({
            type: 'order_accepted',
            title: 'Commande Acceptée',
            message: `${restaurantName} prépare votre commande #${order.id}`,
            icon: '👨‍🍳',
            color: '#2ed573',
            orderId: order.id,
          });
        } else if (order.status === 'ready') {
          addNotif({
            type: 'order_ready',
            title: 'Commande Prête',
            message: `Votre commande #${order.id} est prête, un livreur arrive`,
            icon: '📦',
            color: '#ffc048',
            orderId: order.id,
          });
        } else if (order.status === 'out_for_delivery') {
          addNotif({
            type: 'order_delivering',
            title: 'En Livraison',
            message: `Votre commande #${order.id} est en route !`,
            icon: '🛵',
            color: '#1e90ff',
            orderId: order.id,
          });
        } else if (order.status === 'delivered') {
          addNotif({
            type: 'order_delivered',
            title: 'Livrée !',
            message: `Commande #${order.id} livrée. Bon appétit ! 🎉`,
            icon: '✅',
            color: '#2ed573',
            orderId: order.id,
          });
        } else if (order.status === 'cancelled') {
          addNotif({
            type: 'order_cancelled',
            title: 'Annulée',
            message: `Commande #${order.id} a été annulée`,
            icon: '❌',
            color: '#ff4757',
            orderId: order.id,
          });
        }
      }

      if (user.role === 'restaurant' && order.restaurant?.userId === user.id) {
        if (order.status === 'out_for_delivery') {
          addNotif({
            type: 'order_delivering',
            title: 'Livreur en Route',
            message: `Commande #${order.id} prise par ${order.driver?.name || 'un livreur'}`,
            icon: '🚗',
            color: '#1e90ff',
            orderId: order.id,
          });
        } else if (order.status === 'delivered') {
          addNotif({
            type: 'order_delivered',
            title: 'Livrée !',
            message: `Commande #${order.id} livrée à ${customerName}`,
            icon: '✅',
            color: '#2ed573',
            orderId: order.id,
          });
        }
      }

      if (user.role === 'driver' && order.driverId === user.id) {
        if (order.status === 'delivered') {
          addNotif({
            type: 'order_delivered',
            title: 'Course Terminée',
            message: `Livraison #${order.id} confirmée. Bien joué ! 💪`,
            icon: '✅',
            color: '#2ed573',
            orderId: order.id,
          });
        }
      }

      set((state) => {
        const isMyOrder = 
          (user.role === 'client' && order.customerId === user.id) ||
          (user.role === 'restaurant' && order.restaurant?.userId === user.id) ||
          (user.role === 'driver' && order.driverId === user.id);

        return {
          // Only update if it's already in our list or if it strictly belongs to us
          orders: state.orders.some(o => o.id === order.id) 
            ? state.orders.map((o) => (o.id === order.id ? order : o))
            : (isMyOrder ? [order, ...state.orders] : state.orders),

          availableOrders: order.status === 'ready'
            ? [order, ...state.availableOrders.filter((o) => o.id !== order.id)]
            : state.availableOrders.filter((o) => o.id !== order.id),
        }
      });
    };

    const handleNewOrder = (order: Order) => {
      console.log('🆕 New order via socket:', order.id);
      
      const user = useAuthStore.getState().user;
      if (!user) return;

      // --- NOTIFICATION for restaurant ---
      if (user.role === 'restaurant' && order.restaurant?.userId === user.id) {
        addNotif({
          type: 'new_order',
          title: 'Nouvelle Commande !',
          message: `${order.customer?.name || 'Client'} — ${order.total} DA`,
          icon: '🔔',
          color: '#ff4757',
          orderId: order.id,
        });
      }

      // --- NOTIFICATION for client (confirmation) ---
      if (user.role === 'client' && order.customerId === user.id) {
        addNotif({
          type: 'new_order',
          title: 'Commande Envoyée',
          message: `Votre commande #${order.id} a été envoyée à ${order.restaurant?.name || 'le restaurant'}`,
          icon: '📤',
          color: '#1e90ff',
          orderId: order.id,
        });
      }

      // Filter: Only accept if I am the client who ordered it, OR I am the restaurant owner
      if (user.role === 'client' && order.customerId !== user.id) return;
      if (user.role === 'restaurant' && order.restaurant?.userId !== user.id) return;
      if (user.role === 'driver') return;

      set((state) => ({
        orders: [order, ...state.orders.filter((o) => o.id !== order.id)],
      }));
    };

    const handleReadyForPickup = (order: Order) => {
      console.log('🚗 Order ready for pickup:', order.id);

      const user = useAuthStore.getState().user;
      if (user?.role === 'driver') {
        addNotif({
          type: 'order_ready',
          title: 'Course Disponible !',
          message: `${order.restaurant?.name || 'Restaurant'} — ${order.total} DA`,
          icon: '🚗',
          color: '#ffc048',
          orderId: order.id,
        });
      }

      set((state) => ({
        availableOrders: [order, ...state.availableOrders.filter((o) => o.id !== order.id)],
      }));
    };

    const handleOrderTaken = ({ id }: { id: number }) => {
      set((state) => ({
        availableOrders: state.availableOrders.filter((o) => o.id !== id),
      }));
    };

    socket.on('order_updated', handleOrderUpdate);
    socket.on('new_order', handleNewOrder);
    socket.on('order_ready_for_pickup', handleReadyForPickup);
    socket.on('order_taken', handleOrderTaken);

    return () => {
      socket.off('order_updated', handleOrderUpdate);
      socket.off('new_order', handleNewOrder);
      socket.off('order_ready_for_pickup', handleReadyForPickup);
      socket.off('order_taken', handleOrderTaken);
    };
  },
}));
