'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useOrderStore } from '@/store/orderStore';
import StatusBadge from '@/components/StatusBadge';
import api from '@/lib/api';
import type { Restaurant, Product, OrderStatus } from '@/types';
import { ShoppingBag, Plus, Minus, MapPin, Package, Clock, Utensils, Info, Search, Heart, Star, ChevronLeft, Navigation, Phone, ChefHat, User, X, ShoppingCart, ClipboardList, Users, XCircle, CheckCircle } from 'lucide-react';

interface PlaceWithQueue {
  id: number; name: string; type: string; address: string; description: string; icon: string; waitingCount: number;
}
interface MyReservation {
  id: number; queueNumber: number; status: string; date: string; estimatedWaitMinutes: number;
  place: { id: number; name: string; icon: string; address: string; type: string };
}
interface QueueInfo {
  queueNumber: number; status: string; peopleAhead: number; estimatedWaitMinutes: number;
}

export default function CustomerDashboard() {
  const { orders, fetchOrders, createOrder } = useOrderStore();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [cart, setCart] = useState<Record<number, number>>({});
  const [isOrdering, setIsOrdering] = useState(false);
  const [activeTab, setActiveTab] = useState<'explore' | 'orders'>('explore');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);

  // === DUAL MODE ===
  const [appMode, setAppMode] = useState<'delivery' | 'reservation'>('delivery');

  // === RESERVATION STATE ===
  const [places, setPlaces] = useState<PlaceWithQueue[]>([]);
  const [myReservations, setMyReservations] = useState<MyReservation[]>([]);
  const [queueInfoMap, setQueueInfoMap] = useState<Record<number, QueueInfo>>({});
  const [bookingPlaceId, setBookingPlaceId] = useState<number | null>(null);
  const [resLoading, setResLoading] = useState(false);

  const fetchReservationData = useCallback(async () => {
    try {
      setResLoading(true);
      const [placesRes, reservationsRes] = await Promise.all([
        api.get('/places'),
        api.get('/reservations/my'),
      ]);
      setPlaces(placesRes.data);
      setMyReservations(reservationsRes.data);

      // Fetch queue info for active reservations
      const active = reservationsRes.data.filter((r: MyReservation) => r.status === 'waiting' || r.status === 'called');
      const queueInfos: Record<number, QueueInfo> = {};
      for (const res of active) {
        try {
          const qi = await api.get(`/reservations/queue/${res.id}`);
          queueInfos[res.id] = qi.data;
        } catch { /* ignore */ }
      }
      setQueueInfoMap(queueInfos);
    } catch (err) {
      console.error('Error fetching reservation data:', err);
    } finally {
      setResLoading(false);
    }
  }, []);

  const bookSpot = async (placeId: number) => {
    try {
      setBookingPlaceId(placeId);
      await api.post('/reservations', { placeId });
      await fetchReservationData();
    } catch (err) {
      console.error('Error booking spot:', err);
    } finally {
      setBookingPlaceId(null);
    }
  };

  const cancelReservation = async (id: number) => {
    try {
      await api.put(`/reservations/${id}/cancel`);
      await fetchReservationData();
    } catch (err) {
      console.error('Error cancelling:', err);
    }
  };

  const renderMedia = (imageStr: string | undefined, defaultEmoji = '🍽️') => {
    if (!imageStr) return <span>{defaultEmoji}</span>;
    if (imageStr.startsWith('http') || imageStr.startsWith('data:')) {
      return <img src={imageStr} alt="Cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />;
    }
    return <span>{imageStr}</span>;
  };

  const loadRestaurants = async () => {
    try {
      const res = await api.get<Restaurant[]>('/restaurants');
      setRestaurants(res.data);
      if (selectedRestaurant) {
        const updated = res.data.find(r => r.id === selectedRestaurant.id);
        if (updated) setSelectedRestaurant(updated);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchOrders();
    loadRestaurants();
    fetchReservationData();

    const interval = setInterval(() => {
      loadRestaurants();
      if (appMode === 'reservation') fetchReservationData();
    }, 10000);

    return () => clearInterval(interval);
  }, [fetchOrders, fetchReservationData, appMode]);

  const addToCart = (productId: number) => {
    setCart((prev) => ({ ...prev, [productId]: (prev[productId] || 0) + 1 }));
  };

  const removeFromCart = (productId: number) => {
    setCart((prev) => {
      const newCart = { ...prev };
      if (newCart[productId] > 1) newCart[productId]--;
      else delete newCart[productId];
      return newCart;
    });
  };

  const handleOrder = async () => {
    if (!selectedRestaurant || Object.keys(cart).length === 0) return;
    setIsOrdering(true);
    const items = Object.entries(cart).map(([productId, quantity]) => ({
      productId: Number(productId),
      quantity,
    }));
    await createOrder(selectedRestaurant.id, items, 'Ma Position Actuelle');
    setCart({});
    setSelectedRestaurant(null);
    setIsOrdering(false);
    setActiveTab('orders'); // Jump to orders tracking!
  };

  const cartTotal = selectedRestaurant?.products?.reduce((sum, p) => {
    return sum + (cart[p.id] || 0) * p.price;
  }, 0) || 0;

  const totalItemsCount = Object.values(cart).reduce((sum, qty) => sum + qty, 0);

  const filteredRestaurants = restaurants.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()) || r.address.toLowerCase().includes(searchQuery.toLowerCase()));

  // Render the Cart UI which is used in 2 places (Desktop sidebar & Mobile bottom sheet)
  const renderCartContent = (isMobile: boolean) => (
    <div className={!isMobile ? "card" : ""} style={{ padding: isMobile ? 0 : '24px', boxShadow: isMobile ? 'none' : '0 20px 40px rgba(0,0,0,0.3)', border: isMobile ? 'none' : '1px solid rgba(255,71,87,0.2)' }}>
      <h3 style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', fontSize: '1.3rem', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShoppingBag size={20} color="var(--primary)" /> Votre Commande
        </span>
        {isMobile && (
          <button onClick={() => setIsMobileCartOpen(false)} style={{ background: 'var(--bg-elevated)', border: 'none', color: 'var(--text-muted)', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        )}
      </h3>

      {Object.keys(cart).length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
          <div style={{ width: '80px', height: '80px', background: 'var(--bg)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Package size={32} style={{ opacity: 0.3 }} />
          </div>
          <p style={{ fontWeight: 600 }}>Le panier est vide</p>
          <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>Ajoutez des plats pour commencer.</p>
        </div>
      ) : (
        <>
          <div style={{ maxHeight: isMobile ? '40vh' : '350px', overflowY: 'auto', marginBottom: '24px', paddingRight: '8px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {Object.entries(cart).map(([productId, quantity]) => {
              const product = selectedRestaurant?.products?.find(p => p.id === Number(productId));
              if (!product) return null;
              return (
                <div key={productId} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px', fontWeight: 700, fontSize: '0.9rem' }}>
                    {quantity}x
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>{product.name}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--accent)', fontWeight: 700 }}>{product.price * quantity} DA</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ background: 'var(--bg-card)', padding: isMobile ? 0 : '16px', borderRadius: '12px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              <span>Sous-total</span>
              <span>{cartTotal} DA</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              <span>Frais de livraison</span>
              <span>200 DA</span>
            </div>
            <div style={{ borderTop: '1px dashed var(--border)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}>
              <span style={{ fontWeight: 600 }}>Total</span>
              <span style={{ fontSize: '1.8rem', fontWeight: 900, color: 'white', lineHeight: 1 }}>{cartTotal + 200} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>DA</span></span>
            </div>
          </div>

          <div style={{ background: 'var(--info)20', color: '#1e90ff', padding: '12px', borderRadius: '8px', fontSize: '0.85rem', display: 'flex', gap: '8px', marginBottom: '24px' }}>
            <Info size={16} style={{ flexShrink: 0 }} />
            Paiement en espèces à la livraison.
          </div>

          <button
            className="btn btn-primary btn-block"
            onClick={() => {
              handleOrder();
              if (isMobile) setIsMobileCartOpen(false);
            }}
            disabled={isOrdering}
            style={{ fontSize: '1.1rem', padding: '16px', borderRadius: '12px', boxShadow: '0 10px 20px rgba(255,71,87,0.3)' }}
          >
            {isOrdering ? 'Traitement...' : `Commander (${cartTotal + 200} DA)`}
          </button>
        </>
      )}
    </div>
  );

  // Active / History separation
  const activeOrders = orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled');
  const pastOrders = orders.filter(o => o.status === 'delivered' || o.status === 'cancelled');

  const activeReservations = myReservations.filter(r => r.status === 'waiting' || r.status === 'called');
  const typeLabels: Record<string, string> = { doctor: '🩺 Médecin', clinic: '🏥 Clinique', government: '🏢 Administration', other: '📮 Autre' };
  const statusColors: Record<string, string> = { waiting: '#f39c12', called: '#2ed573', done: '#27ae60', cancelled: '#e74c3c' };
  const statusLabels: Record<string, string> = { waiting: 'En attente', called: 'Appelé', done: 'Terminé', cancelled: 'Annulé' };

  return (
    <div className="customer-app" style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column' }}>

      {/* ========== TOP-LEVEL MODE SWITCHER ========== */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
        <div style={{ display: 'flex', gap: '16px' }}>
          <button
            onClick={() => setAppMode('delivery')}
            style={{
              padding: '16px 36px', borderRadius: '16px', border: '2px solid',
              borderColor: appMode === 'delivery' ? '#ff4757' : 'rgba(255,255,255,0.08)',
              background: appMode === 'delivery' ? 'rgba(255,71,87,0.12)' : 'var(--bg-card)',
              color: appMode === 'delivery' ? '#ff4757' : 'var(--text-muted)',
              fontWeight: 800, cursor: 'pointer', transition: 'all 0.3s',
              display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.05rem',
              boxShadow: appMode === 'delivery' ? '0 8px 24px rgba(255,71,87,0.15)' : 'none'
            }}
          >
            🍔 GO-DELIVERY
          </button>
          <button
            onClick={() => { setAppMode('reservation'); fetchReservationData(); }}
            style={{
              padding: '16px 36px', borderRadius: '16px', border: '2px solid',
              borderColor: appMode === 'reservation' ? '#1e90ff' : 'rgba(255,255,255,0.08)',
              background: appMode === 'reservation' ? 'rgba(30,144,255,0.12)' : 'var(--bg-card)',
              color: appMode === 'reservation' ? '#1e90ff' : 'var(--text-muted)',
              fontWeight: 800, cursor: 'pointer', transition: 'all 0.3s',
              display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.05rem',
              boxShadow: appMode === 'reservation' ? '0 8px 24px rgba(30,144,255,0.15)' : 'none',
              position: 'relative'
            }}
          >
            📋 RESERVATION
            {activeReservations.length > 0 && (
              <span style={{ position: 'absolute', top: '-4px', right: '-4px', background: '#1e90ff', color: '#fff', fontSize: '0.7rem', fontWeight: 800, width: '22px', height: '22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{activeReservations.length}</span>
            )}
          </button>
        </div>
      </div>

      {/* ========== MODE: DELIVERY ========== */}
      {appMode === 'delivery' && (<>

        {/* 🟢 DELIVERY TABS */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px' }}>
          <div style={{ display: 'flex', background: 'var(--bg-elevated)', padding: '6px', borderRadius: '30px', gap: '8px' }}>
            <button
              onClick={() => { setActiveTab('explore'); setSelectedRestaurant(null); }}
              style={{
                padding: '12px 32px', borderRadius: '24px', border: 'none',
                background: activeTab === 'explore' ? 'var(--primary)' : 'transparent',
                color: activeTab === 'explore' ? '#fff' : 'var(--text-muted)',
                fontWeight: 700, cursor: 'pointer', transition: 'all 0.3s',
                display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem'
              }}
            >
              <Utensils size={18} /> Explorer
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              style={{
                padding: '12px 32px', borderRadius: '24px', border: 'none',
                background: activeTab === 'orders' ? 'var(--primary)' : 'transparent',
                color: activeTab === 'orders' ? '#fff' : 'var(--text-muted)',
                fontWeight: 700, cursor: 'pointer', transition: 'all 0.3s',
                display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem',
                position: 'relative'
              }}
            >
              <Package size={18} /> Mes Commandes
              {activeOrders.length > 0 && (
                <span style={{ position: 'absolute', top: '8px', right: '12px', width: '10px', height: '10px', background: 'var(--accent)', borderRadius: '50%' }} className="pulse"></span>
              )}
            </button>
          </div>
        </div>

        {/* =========================================================
          TAB 1: EXPLORER (Restaurants)
          ========================================================= */}
        {activeTab === 'explore' && !selectedRestaurant && (
          <div className="fade-in">

            {/* Awesome Banner */}
            <div style={{ background: 'linear-gradient(135deg, var(--primary) 0%, #ff6b81 100%)', borderRadius: '20px', padding: '28px 24px', marginBottom: '36px', color: 'white', position: 'relative', overflow: 'hidden', boxShadow: '0 20px 40px rgba(255, 71, 87, 0.2)' }}>
              <div style={{ position: 'relative', zIndex: 2, maxWidth: '600px' }}>
                <h1 style={{ fontSize: 'clamp(1.5rem, 5vw, 2.5rem)', marginBottom: '12px', fontWeight: 900, lineHeight: 1.1 }}>La faim n'attend pas.<br />Nous non plus.</h1>
                <p style={{ fontSize: 'clamp(0.85rem, 2.5vw, 1.1rem)', opacity: 0.9, marginBottom: '20px' }}>Faites-vous livrer vos plats préférés en moins de 30 minutes.</p>

                <div style={{ display: 'flex', background: 'var(--bg-card)', padding: '8px', borderRadius: '16px', alignItems: 'center', width: '100%', maxWidth: '400px' }}>
                  <Search size={20} color="var(--text-muted)" style={{ marginLeft: '12px' }} />
                  <input
                    type="text"
                    placeholder="Rechercher un restaurant, un plat..."
                    style={{ border: 'none', background: 'transparent', color: 'var(--text)', padding: '12px', flex: 1, outline: 'none', fontSize: '1rem' }}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* Decoration */}
              <div style={{ position: 'absolute', right: '10%', top: '50%', transform: 'translateY(-50%)', fontSize: '8rem', opacity: 0.2, filter: 'blur(2px)' }}>🍔</div>
              <div style={{ position: 'absolute', right: '5%', bottom: '-20px', fontSize: '6rem', opacity: 0.3 }}>🍕</div>
            </div>

            <h2 className="section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              A la Une
              <button className="btn btn-secondary btn-sm" onClick={loadRestaurants} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                <Search size={14} /> Rafraîchir
              </button>
            </h2>

            {restaurants.length === 0 ? (
              <div className="empty-state">
                <div className="pulse" style={{ fontSize: '3rem', marginBottom: '16px' }}>🏪</div>
                <h3>Chargement des meilleures adresses...</h3>
              </div>
            ) : (
              <div className="grid grid-3">
                {filteredRestaurants.map((r) => (
                  <div key={r.id} className="card" onClick={() => setSelectedRestaurant(r)} style={{ cursor: 'pointer', padding: 0, overflow: 'hidden', transition: 'transform 0.3s, box-shadow 0.3s' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = '0 15px 30px rgba(0,0,0,0.3)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
                    <div style={{ height: '160px', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '5rem', position: 'relative', overflow: 'hidden' }}>
                      {renderMedia(r.image, '🏪')}
                      <div style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', padding: '6px', borderRadius: '50%', color: 'white' }}>
                        <Heart size={18} />
                      </div>
                      <div style={{ position: 'absolute', bottom: '16px', left: '16px', background: 'var(--bg-card)', padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}>
                        <Clock size={12} color="var(--primary)" /> 30-40 min
                      </div>
                    </div>
                    <div style={{ padding: '24px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                        <h3 style={{ fontSize: '1.3rem', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.name}</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--success)20', color: 'var(--success)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 800 }}>
                          <Star size={12} fill="currentColor" /> 4.8
                        </div>
                      </div>
                      <p style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                        <MapPin size={14} /> {r.address}
                      </p>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.75rem', background: 'var(--bg)', padding: '4px 10px', borderRadius: '12px', border: '1px solid var(--border)' }}>Fast Food</span>
                        <span style={{ fontSize: '0.75rem', background: 'var(--bg)', padding: '4px 10px', borderRadius: '12px', border: '1px solid var(--border)' }}>Livraison Rapide</span>
                      </div>
                    </div>
                  </div>
                ))}
                {filteredRestaurants.length === 0 && (
                  <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
                    <Search size={40} style={{ opacity: 0.2, marginBottom: '16px' }} />
                    <h3>Aucun restaurant trouvé</h3>
                    <p>Essayez avec d'autres mots clés.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* =========================================================
          TAB 1.1: RESTAURANT DETAILS & MENU (INSIDE EXPLORER)
          ========================================================= */}
        {activeTab === 'explore' && selectedRestaurant && (
          <div className="fade-in">

            {/* Restaurant Header */}
            <div style={{ position: 'relative', minHeight: '180px', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', borderRadius: '20px', marginBottom: '32px', display: 'flex', alignItems: 'center', padding: '24px', overflow: 'hidden' }}>
              <button
                className="btn btn-secondary"
                onClick={() => { setSelectedRestaurant(null); loadRestaurants(); }}
                style={{ position: 'absolute', top: '24px', left: '24px', width: '40px', height: '40px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: 'none', color: 'white' }}
              >
                <ChevronLeft size={24} />
              </button>

              <div style={{ position: 'absolute', right: '40px', fontSize: '10rem', opacity: 0.1, filter: 'blur(4px)', transform: 'rotate(15deg)' }}>
                <span>{selectedRestaurant.image?.startsWith('http') ? '🍽️' : selectedRestaurant.image}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', zIndex: 10, flexWrap: 'wrap' }}>
                <div style={{ fontSize: '3rem', background: 'var(--bg-card)', width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', overflow: 'hidden', flexShrink: 0 }}>
                  {renderMedia(selectedRestaurant.image)}
                </div>
                <div style={{ color: 'white' }}>
                  <h1 style={{ fontSize: 'clamp(1.3rem, 4vw, 2.5rem)', marginBottom: '8px', fontWeight: 900 }}>{selectedRestaurant.name}</h1>
                  <p style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.9, fontSize: '1.1rem', marginBottom: '16px' }}>
                    <MapPin size={16} /> {selectedRestaurant.address}
                    <span style={{ margin: '0 8px', opacity: 0.3 }}>|</span>
                    <Star size={16} color="var(--accent)" fill="var(--accent)" /> 4.8 Excellent
                  </p>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <span style={{ background: 'var(--success)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700 }}>Ouvert</span>
                    <span style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem' }}>Livraison: 200 DA</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="customer-layout">

              {/* Menu Section */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
                  <h3 style={{ fontSize: '1.5rem', margin: 0 }}>Menu du Restaurant</h3>
                  <button className="btn btn-secondary btn-sm" onClick={loadRestaurants} style={{ background: 'transparent', border: 'none', color: 'var(--primary)' }}>
                    Actualiser le menu 🔄
                  </button>
                </div>

                {(!selectedRestaurant.products || selectedRestaurant.products.length === 0) ? (
                  <div className="empty-state" style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius)' }}>
                    <div className="icon">🍽️</div>
                    <p>Ce restaurant n'a pas encore ajouté de plat.</p>
                  </div>
                ) : (
                  <div className="grid grid-2" style={{ gap: '16px' }}>
                    {selectedRestaurant.products.map((product: Product) => (
                      <div key={product.id} className="card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', transition: 'transform 0.2s', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'} onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}>
                        <div style={{ display: 'flex', gap: '16px' }}>
                          <div style={{ fontSize: '3rem', background: 'var(--bg)', width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px', flexShrink: 0, overflow: 'hidden' }}>
                            {renderMedia(product.image, '🍔')}
                          </div>
                          <div style={{ flex: 1 }}>
                            <h4 style={{ fontSize: '1.1rem', margin: '0 0 6px 0' }}>{product.name}</h4>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', background: 'var(--bg-elevated)', padding: '2px 8px', borderRadius: '4px' }}>{product.category}</span>
                            <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--accent)', marginTop: '8px' }}>
                              {product.price} DA
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg)', padding: '8px', borderRadius: '8px' }}>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Quantité</span>
                          <div className="quantity-control" style={{ margin: 0 }}>
                            <button onClick={() => removeFromCart(product.id)} disabled={!cart[product.id]} style={{ width: '32px', height: '32px' }}>
                              <Minus size={14} />
                            </button>
                            <span style={{ fontWeight: 700, width: '30px', textAlign: 'center' }}>{cart[product.id] || 0}</span>
                            <button onClick={() => addToCart(product.id)} style={{ width: '32px', height: '32px', background: cart[product.id] ? 'var(--primary)' : 'var(--bg-elevated)', color: cart[product.id] ? 'white' : 'var(--text)' }}>
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="desktop-cart">
                {renderCartContent(false)}
              </div>

            </div>
          </div>
        )}

        {/* Floating Action Bar for Mobile Cart */}
        {activeTab === 'explore' && selectedRestaurant && totalItemsCount > 0 && (
          <div className="mobile-cart-bar" onClick={() => setIsMobileCartOpen(true)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ background: 'rgba(255,255,255,0.25)', padding: '6px 12px', borderRadius: '50%', fontWeight: 800, fontSize: '0.9rem', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {totalItemsCount}
              </div>
              <span style={{ fontWeight: 700, fontSize: '1.05rem' }}>Voir le panier</span>
            </div>
            <span style={{ fontWeight: 900, fontSize: '1.2rem' }}>{cartTotal + 200} DA</span>
          </div>
        )}

        {/* Full Screen Overlay / Bottom Sheet for Mobile Cart */}
        {isMobileCartOpen && (
          <div className="mobile-cart-overlay" onClick={() => setIsMobileCartOpen(false)}>
            <div className="mobile-cart-sheet" onClick={(e) => e.stopPropagation()}>
              {renderCartContent(true)}
            </div>
          </div>
        )}

        {/* =========================================================
          TAB 2: MES COMMANDES (Order History & Tracking)
          ========================================================= */}
        {activeTab === 'orders' && appMode === 'delivery' && (
          <div className="fade-in" style={{ maxWidth: '900px', margin: '0 auto', width: '100%' }}>
            <h2 className="section-title" style={{ fontSize: '2rem', marginBottom: '32px' }}>Suivi de vos commandes</h2>

            {orders.length === 0 ? (
              <div className="empty-state" style={{ padding: '80px 20px' }}>
                <div className="icon">🛵</div>
                <h3>Aucune commande passée</h3>
                <p>Explorez nos restaurants et commandez vos plats préférés !</p>
                <button className="btn btn-primary" onClick={() => setActiveTab('explore')} style={{ marginTop: '24px' }}>
                  Découvrir les restaurants
                </button>
              </div>
            ) : (
              <>
                {/* Active Orders (Priority Display) */}
                {activeOrders.length > 0 && (
                  <div style={{ marginBottom: '48px' }}>
                    <h3 style={{ fontSize: '1.2rem', color: 'var(--primary)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="pulse" style={{ width: 8, height: 8, background: 'var(--primary)', borderRadius: '50%' }}></span>
                      En cours d'acheminement
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                      {activeOrders.map((order) => {
                        const isPending = order.status === 'pending';
                        const isPreparing = order.status === 'accepted' || order.status === 'preparing';
                        const isReady = order.status === 'ready';
                        const isDelivering = order.status === 'out_for_delivery';

                        return (
                          <div key={order.id} className="card" style={{ border: '2px solid var(--primary)', background: 'var(--bg-card)', padding: '0', overflow: 'hidden' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px', borderBottom: '1px solid var(--border)', background: 'var(--primary-glow)' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{ width: '48px', height: '48px', background: 'var(--bg)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', overflow: 'hidden' }}>
                                  {renderMedia(order.restaurant?.image, '🏪')}
                                </div>
                                <div>
                                  <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{order.restaurant?.name}</h3>
                                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Commande #{order.id}</div>
                                </div>
                              </div>
                              <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--accent)' }}>{order.total} DA</div>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total à payer</span>
                              </div>
                            </div>

                            <div style={{ padding: '32px 24px' }}>
                              {/* Visual Progress Bar */}
                              <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', marginBottom: '40px' }}>
                                <div style={{ position: 'absolute', top: '20px', left: '10%', right: '10%', height: '4px', background: 'var(--border)', zIndex: 0 }}></div>

                                <div style={{ position: 'absolute', top: '20px', left: '10%', height: '4px', background: 'var(--primary)', zIndex: 0, transition: 'width 0.5s', width: isPending ? '0%' : isPreparing ? '33%' : isReady ? '66%' : isDelivering ? '100%' : '0%' }}></div>

                                {[
                                  { icon: <Clock size={20} />, label: 'Confirmée', active: !isPending },
                                  { icon: <ChefHat size={20} />, label: 'Préparation', active: isPreparing || isReady || isDelivering },
                                  { icon: <Package size={20} />, label: 'Prête', active: isReady || isDelivering },
                                  { icon: <Navigation size={20} />, label: 'En route', active: isDelivering }
                                ].map((step, idx) => (
                                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', zIndex: 1, width: '80px' }}>
                                    <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: step.active ? 'var(--primary)' : 'var(--bg-elevated)', color: step.active ? 'white' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `4px solid var(--bg-card)`, transition: 'all 0.3s' }}>
                                      {step.icon}
                                    </div>
                                    <span style={{ fontSize: '0.8rem', fontWeight: step.active ? 700 : 400, color: step.active ? 'white' : 'var(--text-muted)' }}>{step.label}</span>
                                  </div>
                                ))}
                              </div>

                              <div style={{ background: 'var(--bg)', padding: '20px', borderRadius: '12px' }}>
                                <h4 style={{ margin: '0 0 16px 0', color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Détails de la commande</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                  {order.items?.map(item => (
                                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                                      <span><strong style={{ color: 'var(--primary)' }}>{item.quantity}x</strong> {item.product?.name}</span>
                                      <span>{item.price * item.quantity} DA</span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Driver Information if out for delivery */}
                              {isDelivering && order.driver && (
                                <div style={{ marginTop: '24px', background: 'linear-gradient(90deg, #1e90ff20, transparent)', border: '1px solid #1e90ff40', borderRadius: '12px', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <div style={{ width: '50px', height: '50px', background: '#1e90ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                                      <User size={24} />
                                    </div>
                                    <div>
                                      <div style={{ fontSize: '0.85rem', color: '#1e90ff', fontWeight: 700, textTransform: 'uppercase' }}>Votre Livreur arrive</div>
                                      <strong style={{ fontSize: '1.1rem' }}>{order.driver.name}</strong>
                                    </div>
                                  </div>
                                  <a href={`tel:${order.driver.phone}`} className="btn" style={{ background: 'white', color: '#101418', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, textDecoration: 'none' }}>
                                    <Phone size={16} /> Contacter
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Past Orders History */}
                {pastOrders.length > 0 && (
                  <div>
                    <h3 style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '20px' }}>Historique de commandes</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {pastOrders.map((order) => (
                        <div key={order.id} className="card" style={{ padding: '20px', opacity: 0.8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ fontSize: '2rem', width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', overflow: 'hidden', opacity: 0.7 }}>
                              {renderMedia(order.restaurant?.image, '🍽️')}
                            </div>
                            <div>
                              <strong style={{ fontSize: '1.1rem', display: 'block', marginBottom: '4px' }}>{order.restaurant?.name || 'Restaurant'}</strong>
                              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                {new Date(order.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })} • {order.items?.length} articles
                              </div>
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '6px' }}>{order.total} DA</div>
                            <StatusBadge status={order.status as OrderStatus} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

      </>)}

      {/* ========== MODE: RESERVATION ========== */}
      {appMode === 'reservation' && (
        <div className="fade-in" style={{ maxWidth: '900px', margin: '0 auto', width: '100%' }}>

          {/* Reservation Banner */}
          <div style={{ background: 'linear-gradient(135deg, #1e90ff 0%, #4facfe 100%)', borderRadius: '20px', padding: '28px 24px', marginBottom: '36px', color: 'white', position: 'relative', overflow: 'hidden', boxShadow: '0 20px 40px rgba(30,144,255,0.2)' }}>
            <div style={{ position: 'relative', zIndex: 2 }}>
              <h1 style={{ fontSize: 'clamp(1.5rem, 5vw, 2.2rem)', marginBottom: '8px', fontWeight: 900 }}>📋 Réservation de File</h1>
              <p style={{ fontSize: '1rem', opacity: 0.9 }}>Réservez votre place et suivez votre position en temps réel.</p>
            </div>
            <div style={{ position: 'absolute', right: '5%', top: '50%', transform: 'translateY(-50%)', fontSize: '6rem', opacity: 0.15 }}>🕐</div>
          </div>

          {/* Active Reservations with Live Queue Info */}
          {activeReservations.length > 0 && (
            <div style={{ marginBottom: '40px' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={22} color="#1e90ff" /> Vos réservations actives
              </h2>
              <div style={{ display: 'grid', gap: '16px' }}>
                {activeReservations.map(res => {
                  const qi = queueInfoMap[res.id];
                  return (
                    <div key={res.id} style={{
                      background: 'var(--bg-card)', borderRadius: '20px', padding: '24px',
                      border: '2px solid rgba(30,144,255,0.2)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'rgba(30,144,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem' }}>
                            {res.place?.icon || '📋'}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{res.place?.name}</div>
                            <div style={{ opacity: 0.5, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={12} /> {res.place?.address}</div>
                          </div>
                        </div>
                        <button onClick={() => cancelReservation(res.id)} style={{ background: 'rgba(231,76,60,0.1)', color: '#e74c3c', border: '1px solid rgba(231,76,60,0.2)', padding: '8px 16px', borderRadius: '10px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <XCircle size={14} /> Annuler
                        </button>
                      </div>

                      {/* Live Queue Stats */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', background: 'var(--bg)', borderRadius: '14px', padding: '20px' }}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#1e90ff' }}>#{res.queueNumber}</div>
                          <div style={{ fontSize: '0.8rem', opacity: 0.5 }}>Votre numéro</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#f39c12' }}>{qi?.peopleAhead ?? '—'}</div>
                          <div style={{ fontSize: '0.8rem', opacity: 0.5 }}>Personnes avant vous</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#2ed573' }}>~{qi?.estimatedWaitMinutes ?? '—'}</div>
                          <div style={{ fontSize: '0.8rem', opacity: 0.5 }}>Minutes d&apos;attente</div>
                        </div>
                      </div>

                      {/* Status */}
                      <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'center' }}>
                        <span style={{ padding: '6px 16px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700, background: res.status === 'called' ? 'rgba(46,213,115,0.15)' : 'rgba(243,156,18,0.15)', color: statusColors[res.status] }}>
                          {res.status === 'called' ? '📞 Vous êtes appelé ! Rendez-vous au guichet' : `⏳ ${statusLabels[res.status]}`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Available Places */}
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={22} color="#1e90ff" /> Établissements disponibles
          </h2>

          {resLoading && places.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', opacity: 0.5 }}>
              <div className="pulse" style={{ fontSize: '1.2rem' }}>Chargement...</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
              {places.map(place => {
                const hasActive = activeReservations.some(r => r.place?.id === place.id);
                return (
                  <div key={place.id} style={{
                    background: 'var(--bg-card)', borderRadius: '18px', padding: '24px',
                    border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: '12px',
                    transition: 'transform 0.2s, border-color 0.2s',
                  }} onMouseEnter={e => e.currentTarget.style.borderColor = '#1e90ff'} onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(30,144,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>{place.icon}</div>
                      <div>
                        <div style={{ fontWeight: 700 }}>{place.name}</div>
                        <div style={{ fontSize: '0.8rem', opacity: 0.5 }}>{typeLabels[place.type] || place.type}</div>
                      </div>
                    </div>
                    <p style={{ opacity: 0.7, fontSize: '0.85rem', margin: 0 }}>{place.description}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', opacity: 0.5 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={12} /> {place.address}</span>
                      <span style={{ color: '#f39c12', fontWeight: 700, opacity: 1 }}>{place.waitingCount} en attente</span>
                    </div>
                    <button
                      onClick={() => bookSpot(place.id)}
                      disabled={hasActive || bookingPlaceId === place.id}
                      style={{
                        width: '100%', padding: '12px', borderRadius: '12px', border: 'none',
                        fontWeight: 700, fontSize: '0.9rem',
                        cursor: hasActive ? 'not-allowed' : 'pointer',
                        background: hasActive ? 'rgba(255,255,255,0.05)' : '#1e90ff',
                        color: hasActive ? 'var(--text-muted)' : 'white',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        transition: 'all 0.2s',
                      }}
                    >
                      {hasActive ? (<><CheckCircle size={16} /> Déjà réservé</>) : bookingPlaceId === place.id ? 'Réservation...' : (<><ClipboardList size={16} /> Prendre un numéro</>)}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Reservation History */}
          {myReservations.filter(r => r.status === 'done' || r.status === 'cancelled').length > 0 && (
            <div style={{ marginTop: '40px' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '12px', opacity: 0.6 }}>Historique</h2>
              <div style={{ display: 'grid', gap: '8px' }}>
                {myReservations.filter(r => r.status === 'done' || r.status === 'cancelled').map(res => (
                  <div key={res.id} style={{ background: 'var(--bg-card)', borderRadius: '12px', padding: '14px 20px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span>{res.place?.icon}</span>
                      <span style={{ fontWeight: 600 }}>{res.place?.name}</span>
                      <span style={{ fontSize: '0.8rem' }}>#{res.queueNumber}</span>
                    </div>
                    <span style={{ color: statusColors[res.status], fontWeight: 600, fontSize: '0.85rem' }}>{statusLabels[res.status]}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
