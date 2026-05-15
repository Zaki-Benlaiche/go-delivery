'use client';

import React, { useEffect, useState } from 'react';
import { Utensils, Package } from 'lucide-react';
import { useOrderStore } from '@/store/orderStore';
import { useReservationStore } from '@/store/reservationStore';
import api from '@/lib/api';
import type { Restaurant } from '@/types';

import ModeSwitcher from './customer/ModeSwitcher';
import ExploreTab from './customer/ExploreTab';
import RestaurantDetail from './customer/RestaurantDetail';
import OrdersTab from './customer/OrdersTab';
import ReservationTab from './customer/ReservationTab';
import CartPanel from './customer/CartPanel';
import ShoppingListPanel from './customer/ShoppingListPanel';
import MobileCartBar from './customer/MobileCartBar';

// Customer-facing top-level dashboard. This file is now an orchestrator: it
// holds the shared session state (cart, selected restaurant, active tab) and
// hands it down to focused subcomponents. Each subcomponent owns its own
// presentation; this file owns coordination.
export default function CustomerDashboard() {
  // Atomic selectors so a status change on one order doesn't re-render the
  // whole tab tree (only the orders list itself rebuilds).
  const orders = useOrderStore((s) => s.orders);
  const fetchOrders = useOrderStore((s) => s.fetchOrders);
  const createOrder = useOrderStore((s) => s.createOrder);
  const fetchReservationData = useReservationStore((s) => s.fetchAll);
  const listenReservationSocket = useReservationStore((s) => s.listenToSocket);
  const myReservations = useReservationStore((s) => s.myReservations);

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [cart, setCart] = useState<Record<number, number>>({});
  const [isOrdering, setIsOrdering] = useState(false);
  const [activeTab, setActiveTab] = useState<'explore' | 'orders'>('explore');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);
  const [appMode, setAppMode] = useState<'delivery' | 'reservation'>('delivery');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  // Free-text shopping list for superette/boucherie orders. Replaces the cart
  // when the selected vendor is not a regular restaurant.
  const [shoppingListText, setShoppingListText] = useState('');

  const loadRestaurants = async () => {
    try {
      const res = await api.get<Restaurant[]>('/restaurants');
      setRestaurants(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch a single restaurant *with* its products. Used when opening a card
  // and when the user hits "refresh" inside the menu view.
  const openRestaurant = async (r: Restaurant) => {
    setSelectedRestaurant(r);
    try {
      const res = await api.get<Restaurant>(`/restaurants/${r.id}`);
      setSelectedRestaurant(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchOrders();
    loadRestaurants();
    fetchReservationData();
    const cleanup = listenReservationSocket();
    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addToCart = (productId: number) =>
    setCart((prev) => ({ ...prev, [productId]: (prev[productId] || 0) + 1 }));

  const removeFromCart = (productId: number) =>
    setCart((prev) => {
      const next = { ...prev };
      if (next[productId] > 1) next[productId]--;
      else delete next[productId];
      return next;
    });

  const isShoppingFlow = selectedRestaurant?.type === 'superette' || selectedRestaurant?.type === 'boucherie';

  const handleOrder = async () => {
    if (!selectedRestaurant) return;
    const address = deliveryAddress.trim() || 'Adresse non précisée';

    if (isShoppingFlow) {
      if (!shoppingListText.trim()) return;
      setIsOrdering(true);
      await createOrder(selectedRestaurant.id, [], address, shoppingListText.trim());
      setShoppingListText('');
    } else {
      if (Object.keys(cart).length === 0) return;
      setIsOrdering(true);
      const items = Object.entries(cart).map(([productId, quantity]) => ({
        productId: Number(productId),
        quantity,
      }));
      await createOrder(selectedRestaurant.id, items, address);
      setCart({});
    }

    setDeliveryAddress('');
    setSelectedRestaurant(null);
    setIsOrdering(false);
    setActiveTab('orders');
  };

  const cartTotal = selectedRestaurant?.products?.reduce((sum, p) => sum + (cart[p.id] || 0) * p.price, 0) || 0;
  const totalItemsCount = Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  const activeOrders = orders.filter((o) => o.status !== 'delivered' && o.status !== 'cancelled');
  const activeReservations = myReservations.filter((r) => r.status === 'waiting' || r.status === 'called');

  return (
    <div className="customer-app">
      <ModeSwitcher
        mode={appMode}
        onChange={(m) => {
          setAppMode(m);
          if (m === 'reservation') fetchReservationData();
        }}
        reservationBadge={activeReservations.length}
      />

      {appMode === 'delivery' && (
        <>
          <div className="customer-tabs">
            <div className="tab-bar">
              <button
                className={`tab-btn ${activeTab === 'explore' ? 'tab-btn-active' : 'tab-btn-inactive'}`}
                onClick={() => {
                  setActiveTab('explore');
                  setSelectedRestaurant(null);
                }}
              >
                <Utensils size={16} /> Explorer
              </button>
              <button
                className={`tab-btn customer-tab-orders ${activeTab === 'orders' ? 'tab-btn-active' : 'tab-btn-inactive'}`}
                onClick={() => setActiveTab('orders')}
              >
                <Package size={16} /> Commandes
                {activeOrders.length > 0 && <span className="pulse-dot customer-tab-dot" />}
              </button>
            </div>
          </div>

          {activeTab === 'explore' && !selectedRestaurant && (
            <ExploreTab
              restaurants={restaurants}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onRefresh={loadRestaurants}
              onOpenRestaurant={openRestaurant}
            />
          )}

          {activeTab === 'explore' && selectedRestaurant && (
            <RestaurantDetail
              restaurant={selectedRestaurant}
              cart={cart}
              cartTotal={cartTotal}
              shoppingListText={shoppingListText}
              deliveryAddress={deliveryAddress}
              isOrdering={isOrdering}
              onBack={() => {
                setSelectedRestaurant(null);
                loadRestaurants();
              }}
              onRefresh={() => openRestaurant(selectedRestaurant)}
              onAddToCart={addToCart}
              onRemoveFromCart={removeFromCart}
              onShoppingListChange={setShoppingListText}
              onDeliveryAddressChange={setDeliveryAddress}
              onOrder={handleOrder}
            />
          )}

          {activeTab === 'explore' && selectedRestaurant && !isShoppingFlow && totalItemsCount > 0 && (
            <MobileCartBar
              variant="cart"
              itemsCount={totalItemsCount}
              cartTotal={cartTotal}
              onOpen={() => setIsMobileCartOpen(true)}
            />
          )}

          {activeTab === 'explore' && selectedRestaurant && isShoppingFlow && shoppingListText.trim().length > 0 && (
            <MobileCartBar
              variant="shopping"
              itemsCount={0}
              cartTotal={0}
              onOpen={() => setIsMobileCartOpen(true)}
            />
          )}

          {isMobileCartOpen && selectedRestaurant && (
            <div className="mobile-cart-overlay" onClick={() => setIsMobileCartOpen(false)}>
              <div className="mobile-cart-sheet" onClick={(e) => e.stopPropagation()}>
                {isShoppingFlow ? (
                  <ShoppingListPanel
                    shoppingListText={shoppingListText}
                    deliveryAddress={deliveryAddress}
                    onDeliveryAddressChange={setDeliveryAddress}
                    isOrdering={isOrdering}
                    onOrder={handleOrder}
                    isMobile
                    onClose={() => setIsMobileCartOpen(false)}
                  />
                ) : (
                  <CartPanel
                    cart={cart}
                    restaurant={selectedRestaurant}
                    cartTotal={cartTotal}
                    deliveryAddress={deliveryAddress}
                    onDeliveryAddressChange={setDeliveryAddress}
                    isOrdering={isOrdering}
                    onOrder={handleOrder}
                    isMobile
                    onClose={() => setIsMobileCartOpen(false)}
                  />
                )}
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <OrdersTab orders={orders} onExplore={() => setActiveTab('explore')} />
          )}
        </>
      )}

      {appMode === 'reservation' && <ReservationTab />}
    </div>
  );
}
