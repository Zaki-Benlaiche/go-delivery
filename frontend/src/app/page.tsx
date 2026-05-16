'use client';

import React, { useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useAuthStore } from '@/store/authStore';
import Navbar from '@/components/Navbar';
import NotificationToast from '@/components/NotificationToast';
import LandingPage from '@/components/LandingPage';
import { useOrderStore } from '@/store/orderStore';

// Each dashboard is a fat tree of UI/icons (20–60KB raw). Loading all five
// upfront punishes every user with code for roles they'll never use. With
// dynamic(), the bundler emits one chunk per dashboard and only fetches the
// one matching the signed-in role — first paint drops from ~150KB+ to ~30KB
// of role-relevant JS, with the rest streamed on demand.
const dashboardLoader = (
  <div className="auth-page">
    <div className="pulse" style={{ fontSize: '1.5rem', fontWeight: 800 }}>
      Réserve-vite
    </div>
  </div>
);

const CustomerDashboard = dynamic(() => import('@/components/dashboards/CustomerDashboard'), {
  loading: () => dashboardLoader,
  ssr: false,
});
const RestaurantDashboard = dynamic(() => import('@/components/dashboards/RestaurantDashboard'), {
  loading: () => dashboardLoader,
  ssr: false,
});
const SuperetteDashboard = dynamic(() => import('@/components/dashboards/SuperetteDashboard'), {
  loading: () => dashboardLoader,
  ssr: false,
});
const BoucherieDashboard = dynamic(() => import('@/components/dashboards/BoucherieDashboard'), {
  loading: () => dashboardLoader,
  ssr: false,
});
const DriverDashboard = dynamic(() => import('@/components/dashboards/DriverDashboard'), {
  loading: () => dashboardLoader,
  ssr: false,
});
const AdminDashboard = dynamic(() => import('@/components/dashboards/AdminDashboard'), {
  loading: () => dashboardLoader,
  ssr: false,
});
const PlaceDashboard = dynamic(() => import('@/components/dashboards/PlaceDashboard'), {
  loading: () => dashboardLoader,
  ssr: false,
});

const DASHBOARDS: Record<string, React.ComponentType> = {
  client: CustomerDashboard,
  restaurant: RestaurantDashboard,
  superette: SuperetteDashboard,
  boucherie: BoucherieDashboard,
  driver: DriverDashboard,
  admin: AdminDashboard,
  place: PlaceDashboard,
};

export default function Home() {
  // Atomic selectors — each subscribes to a single field, so unrelated store
  // changes (e.g. a token refresh) don't re-render the whole page.
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);
  const loadUser = useAuthStore((s) => s.loadUser);
  const listenToSocket = useOrderStore((s) => s.listenToSocket);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    if (!user) return;
    return listenToSocket();
  }, [user, listenToSocket]);

  if (isLoading) return dashboardLoader;
  if (!user) return <LandingPage />;

  const Dashboard = DASHBOARDS[user.role];
  if (!Dashboard) return <LandingPage />;

  return (
    <>
      <NotificationToast />
      <div className="app-layout">
        <Navbar />
        <div className="container fade-in">
          <Suspense fallback={dashboardLoader}>
            <Dashboard />
          </Suspense>
        </div>
      </div>
    </>
  );
}
