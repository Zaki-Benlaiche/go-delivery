import { create } from 'zustand';
import api from '@/lib/api';
import { getSocket } from '@/lib/socket';
import { useAuthStore } from '@/store/authStore';
import type { Order } from '@/types';

interface OrderState {
  orders: Order[];
  availableOrders: Order[];
  isLoading: boolean;
  fetchOrders: () => Promise<void>;
  fetchAvailableOrders: () => Promise<void>;
  createOrder: (restaurantId: number, items: { productId: number; quantity: number }[], deliveryAddress: string) => Promise<void>;
  updateStatus: (orderId: number, status: string) => Promise<void>;
  listenToSocket: () => () => void;
}

export const useOrderStore = create<OrderState>((set, get) => ({
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
      await api.post('/orders', { restaurantId, items, deliveryAddress });
      await get().fetchOrders();
    } catch (err) {
      console.error('createOrder error:', err);
    }
  },

  updateStatus: async (orderId, status) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status });
      await get().fetchOrders();
      await get().fetchAvailableOrders();
    } catch (err) {
      console.error('updateStatus error:', err);
    }
  },

  listenToSocket: () => {
    if (typeof window === 'undefined') return () => {};

    const socket = getSocket();
    if (!socket) return () => {};

    const handleOrderUpdate = (order: Order) => {
      console.log('📦 Order updated via socket:', order.id, order.status);
      
      const user = useAuthStore.getState().user;
      if (!user) return;

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
      set((state) => ({
        availableOrders: [order, ...state.availableOrders.filter((o) => o.id !== order.id)],
      }));
    };

    socket.on('order_updated', handleOrderUpdate);
    socket.on('new_order', handleNewOrder);
    socket.on('order_ready_for_pickup', handleReadyForPickup);

    return () => {
      socket.off('order_updated', handleOrderUpdate);
      socket.off('new_order', handleNewOrder);
      socket.off('order_ready_for_pickup', handleReadyForPickup);
    };
  },
}));
