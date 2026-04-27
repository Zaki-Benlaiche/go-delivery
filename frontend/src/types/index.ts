// TypeScript interfaces for the entire application

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'client' | 'restaurant' | 'driver' | 'admin' | 'place';
  phone?: string;
}

export interface Restaurant {
  id: number;
  name: string;
  description: string;
  image: string;
  address: string;
  category?: string;
  isActive: boolean;
  isOpen: boolean;
  userId: number;
  products?: Product[];
}

export interface Place {
  id: number;
  name: string;
  type: string;
  address: string;
  description: string;
  icon: string;
  isOpen: boolean;
  userId?: number;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  isAvailable: boolean;
  restaurantId: number;
}

export interface OrderItem {
  id: number;
  quantity: number;
  price: number;
  product?: Product;
}

export type OrderStatus =
  | 'pending'
  | 'accepted'
  | 'preparing'
  | 'ready'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export interface Order {
  id: number;
  status: OrderStatus;
  total: number;
  deliveryAddress: string;
  createdAt: string;
  updatedAt?: string;
  customerId: number;
  restaurantId: number;
  driverId: number | null;
  items?: OrderItem[];
  restaurant?: Restaurant;
  customer?: User;
  driver?: User;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'En Attente',
  accepted: 'Accepté',
  preparing: 'En Préparation',
  ready: 'Prêt',
  out_for_delivery: 'En Livraison',
  delivered: 'Livré',
  cancelled: 'Annulé',
};

export const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: '#ffa502',
  accepted: '#2ed573',
  preparing: '#3742fa',
  ready: '#ff6b81',
  out_for_delivery: '#1e90ff',
  delivered: '#2ed573',
  cancelled: '#ff4757',
};
