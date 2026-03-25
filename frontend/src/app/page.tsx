'use client';

import React, { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import AuthPage from '@/components/AuthPage';
import Navbar from '@/components/Navbar';
import CustomerDashboard from '@/components/dashboards/CustomerDashboard';
import RestaurantDashboard from '@/components/dashboards/RestaurantDashboard';
import DriverDashboard from '@/components/dashboards/DriverDashboard';
import AdminDashboard from '@/components/dashboards/AdminDashboard';
import { useOrderStore } from '@/store/orderStore';

export default function Home() {
  const { user, isLoading, loadUser } = useAuthStore();
  const { listenToSocket } = useOrderStore();

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    if (user) {
      const cleanup = listenToSocket();
      return cleanup;
    }
  }, [user, listenToSocket]);

  if (isLoading) {
    return (
      <div className="auth-page">
        <div className="pulse" style={{ fontSize: '2rem', fontWeight: 900 }}>
          GO-DELIVERY
        </div>
      </div>
    );
  }

  if (!user) return <AuthPage />;

  return (
    <div className="app-layout">
      <Navbar />
      <div className="container fade-in">
        {user.role === 'client' && <CustomerDashboard />}
        {user.role === 'restaurant' && <RestaurantDashboard />}
        {user.role === 'driver' && <DriverDashboard />}
        {user.role === 'admin' && <AdminDashboard />}
      </div>
    </div>
  );
}
