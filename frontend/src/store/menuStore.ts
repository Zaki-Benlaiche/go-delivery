import { create } from 'zustand';
import api from '@/lib/api';
import type { Product } from '@/types';

interface MenuState {
  products: Product[];
  isLoading: boolean;
  fetchMenu: () => Promise<void>;
  addProduct: (product: Omit<Product, 'id' | 'restaurantId'>) => Promise<void>;
  updateProduct: (id: number, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: number) => Promise<void>;
}

export const useMenuStore = create<MenuState>((set, get) => ({
  products: [],
  isLoading: false,

  fetchMenu: async () => {
    set({ isLoading: true });
    try {
      const { data } = await api.get('/auth/me'); // The auth/me route inclides the restaurant and its products. But wait, we need products.
      // Actually, better to fetch the restaurant's products specifically or get them from the user profile if included.
      // Let's create a specific fetch or use the data from authStore. Wait, auth/me returns the user with restaurant, but not products.
      // Let's just fetch the restaurant's full details.
      if (data.restaurant) {
        const resData = await api.get(`/restaurants/${data.restaurant.id}`);
        set({ products: resData.data.products || [], isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (err) {
      console.error('fetchMenu error:', err);
      set({ isLoading: false });
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
