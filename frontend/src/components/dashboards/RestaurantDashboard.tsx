'use client';

import React, { useEffect, useState } from 'react';
import { ChefHat, Package, Utensils, Settings } from 'lucide-react';
import { useOrderStore } from '@/store/orderStore';
import { useMenuStore } from '@/store/menuStore';

import OrdersTab from './restaurant/OrdersTab';
import MenuTab from './restaurant/MenuTab';
import SettingsTab from './restaurant/SettingsTab';

// Restaurant-owner dashboard. Orchestrator only: holds the active tab and the
// open/closed toggle. All heavy presentation has moved into the three tab
// subcomponents so a price edit doesn't repaint the orders feed and vice versa.
export default function RestaurantDashboard() {
  const orders = useOrderStore((s) => s.orders);
  const fetchOrders = useOrderStore((s) => s.fetchOrders);
  const updateStatus = useOrderStore((s) => s.updateStatus);
  const restaurant = useMenuStore((s) => s.restaurant);
  const fetchMenu = useMenuStore((s) => s.fetchMenu);
  const toggleOpenStatus = useMenuStore((s) => s.toggleOpenStatus);

  const [activeTab, setActiveTab] = useState<'orders' | 'menu' | 'settings'>('orders');

  useEffect(() => {
    fetchOrders();
    fetchMenu();
  }, [fetchOrders, fetchMenu]);

  const pendingCount = orders.filter((o) => o.status === 'pending').length;
  const preparingCount = orders.filter((o) => o.status === 'accepted' || o.status === 'preparing').length;

  const tabs = [
    { key: 'orders' as const, label: `Commandes (${pendingCount + preparingCount})`, icon: <Package size={16} /> },
    { key: 'menu' as const, label: 'Menu', icon: <Utensils size={16} /> },
    { key: 'settings' as const, label: 'Paramètres', icon: <Settings size={16} /> },
  ];

  // Accept goes directly to 'preparing' — skips an intermediate 'accepted'
  // state that previously caused a setTimeout race condition.
  const handleAccept = (orderId: number) => updateStatus(orderId, 'preparing');
  const handleMarkReady = (orderId: number) => updateStatus(orderId, 'ready');

  return (
    <div>
      <div className="r-header">
        <div>
          <h1 className="page-title r-header-title">
            <ChefHat size={26} color="var(--primary)" /> Portail Restaurant
          </h1>
          <p className="page-subtitle">Gérez vos commandes et votre menu en temps réel</p>
        </div>
        <div className="r-header-actions">
          <button
            onClick={toggleOpenStatus}
            className={`r-open-toggle ${restaurant?.isOpen ? 'is-open' : 'is-closed'}`}
          >
            <span className="r-open-dot" />
            {restaurant?.isOpen ? 'Ouvert' : 'Fermé'}
          </button>
          <div className="tab-bar r-tab-bar">
            {tabs.map((t) => (
              <button
                key={t.key}
                className={`tab-btn ${activeTab === t.key ? 'tab-btn-active' : 'tab-btn-inactive'}`}
                onClick={() => setActiveTab(t.key)}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {activeTab === 'orders' && <OrdersTab orders={orders} onAccept={handleAccept} onMarkReady={handleMarkReady} />}
      {activeTab === 'menu' && <MenuTab />}
      {activeTab === 'settings' && <SettingsTab />}
    </div>
  );
}
