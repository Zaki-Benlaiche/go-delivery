import { create } from 'zustand';
import api from '@/lib/api';
import type { Product, Restaurant } from '@/types';

interface MenuState {
  restaurant: Restaurant | null;
  products: Product[];
  isLoading: boolean;
  fetchMenu: () => Promise<void>;
  updateRestaurant: (data: Partial<Restaurant>) => Promise<void>;
  addProduct: (product: Omit<Product, 'id' | 'restaurantId'>) => Promise<void>;
  updateProduct: (id: number, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: number) => Promise<void>;
}

export const useMenuStore = create<MenuState>((set, get) => ({
  restaurant: null,
  products: [],
  isLoading: false,

  fetchMenu: async () => {
    set({ isLoading: true });
    try {
      const { data } = await api.get('/auth/me');
      if (data.restaurant) {
        const resData = await api.get(`/restaurants/${data.restaurant.id}`);
        set({ 
          restaurant: resData.data, 
          products: resData.data.products || [], 
          isLoading: false 
        });
      } else {
        set({ isLoading: false });
      }
    } catch (err) {
      console.error('fetchMenu error:', err);
      set({ isLoading: false });
    }
  },

  updateRestaurant: async (updateData) => {
    try {
      const { data } = await api.put('/restaurants/mine', updateData);
      set({ restaurant: data });
    } catch (err) {
      console.error('updateRestaurant error:', err);
    }
  },

  addProduct: async (product) => {
    try {
      const { data } = await api.post('/restaurants/products', product);
      set((state) => ({ products: [...state.products, data] }));
    } catch (err) {
      console.error('addProduct error:', err);
    }
  },

  updateProduct: async (id, product) => {
    try {
      const { data } = await api.put(`/restaurants/products/${id}`, product);
      set((state) => ({
        products: state.products.map((p) => (p.id === id ? { ...p, ...data } : p)),
      }));
    } catch (err) {
      console.error('updateProduct error:', err);
    }
  },

  deleteProduct: async (id) => {
    try {
      await api.delete(`/restaurants/products/${id}`);
      set((state) => ({
        products: state.products.filter((p) => p.id !== id),
      }));
    } catch (err) {
      console.error('deleteProduct error:', err);
    }
  },
}));
