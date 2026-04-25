'use client';

import React, { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import Navbar from '@/components/Navbar';
import NotificationToast from '@/components/NotificationToast';
import CustomerDashboard from '@/components/dashboards/CustomerDashboard';
import RestaurantDashboard from '@/components/dashboards/RestaurantDashboard';
import DriverDashboard from '@/components/dashboards/DriverDashboard';
import AdminDashboard from '@/components/dashboards/AdminDashboard';
import PlaceDashboard from '@/components/dashboards/PlaceDashboard';
import LandingPage from '@/components/LandingPage';
import { useOrderStore } from '@/store/orderStore';

export default function Home() {
  const user = useAuthStore(state => state.user);
  const isLoading = useAuthStore(state => state.isLoading);
  const loadUser = useAuthStore(state => state.loadUser);
  const listenToSocket = useOrderStore(state => state.listenToSocket);

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
          Réserve-vite
        </div>
      </div>
    );
  }

  if (!user) {
    return <LandingPage />;
  }

  return (
    <>
      <NotificationToast />
      <div className="app-layout">
        <Navbar />
        <div className="container fade-in">
          {user.role === 'client' && <CustomerDashboard />}
          {user.role === 'restaurant' && <RestaurantDashboard />}
          {user.role === 'driver' && <DriverDashboard />}
          {user.role === 'admin' && <AdminDashboard />}
          {user.role === 'place' && <PlaceDashboard />}
        </div>
      </div>
    </>
  );
}
