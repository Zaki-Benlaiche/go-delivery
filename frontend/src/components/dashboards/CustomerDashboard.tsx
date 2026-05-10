'use client';

import React, { useEffect, useState } from 'react';
import { useOrderStore } from '@/store/orderStore';
import { useReservationStore } from '@/store/reservationStore';
import StatusBadge from '@/components/StatusBadge';
import api from '@/lib/api';
import type { Restaurant, Product, OrderStatus } from '@/types';
import { ShoppingBag, Plus, Minus, MapPin, Package, Clock, Utensils, Info, Search, Heart, ChevronLeft, Navigation, Phone, ChefHat, User, X, ShoppingCart, ClipboardList, Users, XCircle, CheckCircle, Truck } from 'lucide-react';

export default function CustomerDashboard() {
  // Atomic selectors so a status change on one order doesn't re-render the
  // whole tab tree (only the orders list itself rebuilds).
  const orders = useOrderStore((s) => s.orders);
  const fetchOrders = useOrderStore((s) => s.fetchOrders);
  const createOrder = useOrderStore((s) => s.createOrder);
  const places = useReservationStore(s => s.places);
  const myReservations = useReservationStore(s => s.myReservations);
  const resLoaded = useReservationStore(s => s.loaded);
  const fetchReservationData = useReservationStore(s => s.fetchAll);
  const bookReservationStore = useReservationStore(s => s.bookSpot);
  const cancelReservationStore = useReservationStore(s => s.cancelReservation);
  const listenReservationSocket = useReservationStore(s => s.listenToSocket);

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

  const [bookingPlaceId, setBookingPlaceId] = useState<number | null>(null);

  const bookSpot = async (placeId: number) => {
    try {
      setBookingPlaceId(placeId);
      await bookReservationStore(placeId);
    } catch (err) {
      console.error('Error booking spot:', err);
    } finally {
      setBookingPlaceId(null);
    }
  };

  const cancelReservation = async (id: number) => {
    try {
      await cancelReservationStore(id);
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

  const cartTotal = selectedRestaurant?.products?.reduce((sum, p) => {
    return sum + (cart[p.id] || 0) * p.price;
  }, 0) || 0;

  const totalItemsCount = Object.values(cart).reduce((sum, qty) => sum + qty, 0);

  const filteredRestaurants = restaurants.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()) || r.address.toLowerCase().includes(searchQuery.toLowerCase()));

  // Shopping-flow checkout: no item-level total since the driver fills the
  // receipt amount on delivery. Customer just confirms address + list and pays
  // (receipt + delivery) on arrival.
  const renderShoppingPanel = (isMobile: boolean) => (
    <div className={!isMobile ? "card" : ""} style={{ padding: isMobile ? 0 : '20px', boxShadow: isMobile ? 'none' : '0 20px 40px rgba(0,0,0,0.3)', border: isMobile ? 'none' : '1px solid rgba(46,213,115,0.2)' }}>
      <h3 style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', fontSize: 'clamp(1rem, 3vw, 1.2rem)', borderBottom: '1px solid var(--border)', paddingBottom: '14px' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ClipboardList size={18} color="#16a085" /> Récapitulatif
        </span>
        {isMobile && (
          <button onClick={() => setIsMobileCartOpen(false)} style={{ background: 'var(--bg-elevated)', border: 'none', color: 'var(--text-muted)', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        )}
      </h3>

      <div style={{ background: 'var(--bg)', padding: '12px', borderRadius: '10px', marginBottom: '14px', maxHeight: isMobile ? '30vh' : '200px', overflowY: 'auto' }}>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>Votre liste</div>
        <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: 'inherit', fontSize: '0.88rem', margin: 0, lineHeight: 1.6 }}>
          {shoppingListText.trim() || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Liste vide</span>}
        </pre>
      </div>

      <div style={{ marginBottom: '14px' }}>
        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
          Adresse de livraison
        </label>
        <input
          type="text"
          placeholder="Ex: Rue des Lilas, Appt 3B, Alger..."
          value={deliveryAddress}
          onChange={(e) => setDeliveryAddress(e.target.value)}
          style={{
            width: '100%', padding: '10px 12px', borderRadius: '8px',
            border: `1px solid ${deliveryAddress ? '#16a085' : 'var(--border)'}`,
            background: 'var(--bg-elevated)', color: 'var(--text)',
            fontSize: '0.85rem', fontFamily: 'inherit', outline: 'none',
            boxSizing: 'border-box', transition: 'border-color 0.2s',
          }}
        />
      </div>

      <div style={{ background: 'var(--info-glow)', color: '#1e90ff', padding: '10px', borderRadius: '8px', fontSize: '0.82rem', display: 'flex', gap: '6px', marginBottom: '20px', alignItems: 'flex-start' }}>
        <Info size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
        <span>Le prix final sera fixé par le livreur après l&apos;achat (ticket de caisse + livraison). Paiement en espèces à la livraison.</span>
      </div>

      <button
        className="btn btn-primary btn-block"
        onClick={() => {
          handleOrder();
          if (isMobile) setIsMobileCartOpen(false);
        }}
        disabled={isOrdering || !shoppingListText.trim()}
        style={{ fontSize: 'clamp(0.9rem, 2.5vw, 1.05rem)', padding: '14px', borderRadius: '12px', background: '#16a085' }}
      >
        {isOrdering ? 'Envoi...' : 'Envoyer la commande'}
      </button>
    </div>
  );

  const renderCartContent = (isMobile: boolean) => (
    <div className={!isMobile ? "card" : ""} style={{ padding: isMobile ? 0 : '20px', boxShadow: isMobile ? 'none' : '0 20px 40px rgba(0,0,0,0.3)', border: isMobile ? 'none' : '1px solid rgba(255,71,87,0.2)' }}>
      <h3 style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', fontSize: 'clamp(1rem, 3vw, 1.2rem)', borderBottom: '1px solid var(--border)', paddingBottom: '14px' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShoppingBag size={18} color="var(--primary)" /> Votre Commande
        </span>
        {isMobile && (
          <button onClick={() => setIsMobileCartOpen(false)} style={{ background: 'var(--bg-elevated)', border: 'none', color: 'var(--text-muted)', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        )}
      </h3>

      {Object.keys(cart).length === 0 ? (
        <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)' }}>
          <div style={{ width: '60px', height: '60px', background: 'var(--bg)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <Package size={26} style={{ opacity: 0.3 }} />
          </div>
          <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>Le panier est vide</p>
          <p style={{ fontSize: '0.82rem', marginTop: '4px' }}>Ajoutez des plats pour commencer.</p>
        </div>
      ) : (
        <>
          <div style={{ maxHeight: isMobile ? '40vh' : '300px', overflowY: 'auto', marginBottom: '20px', paddingRight: '6px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {Object.entries(cart).map(([productId, quantity]) => {
              const product = selectedRestaurant?.products?.find(p => p.id === Number(productId));
              if (!product) return null;
              return (
                <div key={productId} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px', fontWeight: 700, fontSize: '0.82rem', flexShrink: 0 }}>
                    {quantity}x
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 700 }}>{product.price * quantity} DA</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ background: isMobile ? 'transparent' : 'var(--bg-card)', padding: isMobile ? 0 : '14px', borderRadius: '12px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <span>Sous-total</span>
              <span>{cartTotal} DA</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <span>Livraison</span>
              <span style={{ fontStyle: 'italic' }}>fixée par le livreur</span>
            </div>
            <div style={{ borderTop: '1px dashed var(--border)', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}>
              <span style={{ fontWeight: 600 }}>Total plats</span>
              <span style={{ fontSize: 'clamp(1.3rem, 4vw, 1.7rem)', fontWeight: 900, color: 'white', lineHeight: 1 }}>{cartTotal} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>DA</span></span>
            </div>
          </div>

          {/* Delivery address input */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
              Adresse de livraison
            </label>
            <input
              type="text"
              placeholder="Ex: Rue des Lilas, Appt 3B, Alger..."
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              style={{
                width: '100%', padding: '10px 12px', borderRadius: '8px',
                border: `1px solid ${deliveryAddress ? 'var(--primary)' : 'var(--border)'}`,
                background: 'var(--bg-elevated)', color: 'var(--text)',
                fontSize: '0.85rem', fontFamily: 'inherit', outline: 'none',
                boxSizing: 'border-box', transition: 'border-color 0.2s',
              }}
            />
          </div>

          <div style={{ background: 'var(--info-glow)', color: '#1e90ff', padding: '10px', borderRadius: '8px', fontSize: '0.82rem', display: 'flex', gap: '6px', marginBottom: '20px', alignItems: 'center' }}>
            <Info size={14} style={{ flexShrink: 0 }} />
            Paiement en espèces à la livraison.
          </div>

          <button
            className="btn btn-primary btn-block"
            onClick={() => {
              handleOrder();
              if (isMobile) setIsMobileCartOpen(false);
            }}
            disabled={isOrdering}
            style={{ fontSize: 'clamp(0.9rem, 2.5vw, 1.05rem)', padding: '14px', borderRadius: '12px' }}
          >
            {isOrdering ? 'Traitement...' : `Commander (${cartTotal} DA)`}
          </button>
        </>
      )}
    </div>
  );

  const activeOrders = orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled');
  const pastOrders = orders.filter(o => o.status === 'delivered' || o.status === 'cancelled');

  const activeReservations = myReservations.filter(r => r.status === 'waiting' || r.status === 'called');
  const typeLabels: Record<string, string> = { doctor: '🩺 Médecin', clinic: '🏥 Clinique', government: '🏢 Admin', other: '📮 Autre' };
  const statusColors: Record<string, string> = { waiting: '#f39c12', called: '#2ed573', done: '#27ae60', cancelled: '#e74c3c' };
  const statusLabels: Record<string, string> = { waiting: 'En attente', called: 'Appelé', done: 'Terminé', cancelled: 'Annulé' };

  return (
    <div className="customer-app" style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column' }}>

      {/* MODE SWITCHER */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px', padding: '0 4px' }}>
        <div style={{ display: 'flex', gap: '10px', maxWidth: '100%' }}>
          <button
            onClick={() => setAppMode('delivery')}
            style={{
              padding: 'clamp(10px, 2vw, 14px) clamp(16px, 4vw, 32px)', borderRadius: '14px', border: '2px solid',
              borderColor: appMode === 'delivery' ? '#ff4757' : 'rgba(255,255,255,0.08)',
              background: appMode === 'delivery' ? 'rgba(255,71,87,0.12)' : 'var(--bg-card)',
              color: appMode === 'delivery' ? '#ff4757' : 'var(--text-muted)',
              fontWeight: 800, cursor: 'pointer', transition: 'all 0.3s',
              display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'clamp(0.82rem, 2.5vw, 1rem)',
              boxShadow: appMode === 'delivery' ? '0 6px 20px rgba(255,71,87,0.15)' : 'none',
              whiteSpace: 'nowrap',
            }}
          >
            <Truck size={18} /> DELIVERY
          </button>
          <button
            onClick={() => { setAppMode('reservation'); fetchReservationData(); }}
            style={{
              padding: 'clamp(10px, 2vw, 14px) clamp(16px, 4vw, 32px)', borderRadius: '14px', border: '2px solid',
              borderColor: appMode === 'reservation' ? '#1e90ff' : 'rgba(255,255,255,0.08)',
              background: appMode === 'reservation' ? 'rgba(30,144,255,0.12)' : 'var(--bg-card)',
              color: appMode === 'reservation' ? '#1e90ff' : 'var(--text-muted)',
              fontWeight: 800, cursor: 'pointer', transition: 'all 0.3s',
              display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'clamp(0.82rem, 2.5vw, 1rem)',
              boxShadow: appMode === 'reservation' ? '0 6px 20px rgba(30,144,255,0.15)' : 'none',
              position: 'relative', whiteSpace: 'nowrap',
            }}
          >
            <ClipboardList size={18} /> RÉSERVATION
            {activeReservations.length > 0 && (
              <span style={{ position: 'absolute', top: '-5px', right: '-5px', background: '#1e90ff', color: '#fff', fontSize: '0.65rem', fontWeight: 800, width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{activeReservations.length}</span>
            )}
          </button>
        </div>
      </div>

      {/* MODE: DELIVERY */}
      {appMode === 'delivery' && (<>

        {/* TABS */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '28px' }}>
          <div className="tab-bar" style={{ background: 'var(--bg-elevated)', padding: '5px', borderRadius: '30px' }}>
            <button
              className={`tab-btn ${activeTab === 'explore' ? 'tab-btn-active' : 'tab-btn-inactive'}`}
              onClick={() => { setActiveTab('explore'); setSelectedRestaurant(null); }}
              style={{ borderRadius: '24px', padding: 'clamp(8px, 2vw, 12px) clamp(16px, 4vw, 28px)' }}
            >
              <Utensils size={16} /> Explorer
            </button>
            <button
              className={`tab-btn ${activeTab === 'orders' ? 'tab-btn-active' : 'tab-btn-inactive'}`}
              onClick={() => setActiveTab('orders')}
              style={{ borderRadius: '24px', padding: 'clamp(8px, 2vw, 12px) clamp(16px, 4vw, 28px)', position: 'relative' }}
            >
              <Package size={16} /> Commandes
              {activeOrders.length > 0 && (
                <span style={{ position: 'absolute', top: '6px', right: '10px', width: '8px', height: '8px', background: 'var(--accent)', borderRadius: '50%' }} className="pulse-dot"></span>
              )}
            </button>
          </div>
        </div>

        {/* EXPLORE */}
        {activeTab === 'explore' && !selectedRestaurant && (
          <div className="fade-in">
            {/* Banner */}
            <div style={{ background: 'var(--gradient)', borderRadius: '18px', padding: 'clamp(20px, 4vw, 28px) clamp(16px, 3vw, 24px)', marginBottom: '28px', color: 'white', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'relative', zIndex: 2, maxWidth: '600px' }}>
                <h1 style={{ fontSize: 'clamp(1.2rem, 4vw, 2.2rem)', marginBottom: '10px', fontWeight: 900, lineHeight: 1.1 }}>La faim n&apos;attend pas.<br />Nous non plus.</h1>
                <p style={{ fontSize: 'clamp(0.8rem, 2vw, 1rem)', opacity: 0.9, marginBottom: '16px' }}>Faites-vous livrer vos plats préférés en moins de 30 minutes.</p>

                <div style={{ display: 'flex', background: 'var(--bg-card)', padding: '6px', borderRadius: '14px', alignItems: 'center', width: '100%', maxWidth: '380px' }}>
                  <Search size={18} color="var(--text-muted)" style={{ marginLeft: '10px', flexShrink: 0 }} />
                  <input
                    type="text"
                    placeholder="Rechercher un restaurant..."
                    style={{ border: 'none', background: 'transparent', color: 'var(--text)', padding: '10px', flex: 1, outline: 'none', fontSize: 'clamp(0.82rem, 2vw, 0.95rem)', minWidth: 0 }}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <h2 className="section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              A la Une
              <button className="btn btn-secondary btn-sm" onClick={loadRestaurants} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Search size={13} /> Rafraîchir
              </button>
            </h2>

            {restaurants.length === 0 ? (
              <div className="empty-state">
                <div className="pulse-icon" style={{ marginBottom: '14px' }}><ShoppingCart size={40} style={{ opacity: 0.3 }} /></div>
                <h3>Chargement des restaurants...</h3>
              </div>
            ) : (
              <div className="grid grid-3">
                {filteredRestaurants.map((r) => (
                  <div key={r.id} className="card" onClick={() => openRestaurant(r)} style={{ cursor: 'pointer', padding: 0, overflow: 'hidden' }}>
                    <div style={{ height: 'clamp(120px, 20vw, 160px)', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem', position: 'relative', overflow: 'hidden' }}>
                      {renderMedia(r.image, '🏪')}
                      <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', padding: '5px', borderRadius: '50%', color: 'white' }}>
                        <Heart size={15} />
                      </div>
                      {/* Open / Closed badge */}
                      <div style={{ position: 'absolute', top: '12px', left: '12px', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px', background: r.isOpen ? 'rgba(46,213,115,0.9)' : 'rgba(255,71,87,0.9)', color: 'white', backdropFilter: 'blur(4px)' }}>
                        <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'white', display: 'inline-block' }} />
                        {r.isOpen ? 'Ouvert' : 'Fermé'}
                      </div>
                      <div style={{ position: 'absolute', bottom: '12px', left: '12px', background: 'var(--bg-card)', padding: '5px 10px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={11} color="var(--primary)" /> 30-40 min
                      </div>
                      {r.type && r.type !== 'restaurant' && (
                        <div style={{ position: 'absolute', bottom: '12px', right: '12px', background: r.type === 'boucherie' ? '#c0392b' : '#16a085', color: 'white', padding: '5px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700 }}>
                          {r.type === 'boucherie' ? '🥩 Boucherie' : '🛒 Supérette'}
                        </div>
                      )}
                    </div>
                    <div style={{ padding: 'clamp(14px, 3vw, 20px)' }}>
                      <h3 style={{ fontSize: 'clamp(0.95rem, 2.5vw, 1.2rem)', margin: '0 0 6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.name}</h3>
                      <p style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '10px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        <MapPin size={12} /> {r.address}
                      </p>
                      {r.description && (
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', opacity: 0.7, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {r.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                {filteredRestaurants.length === 0 && (
                  <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                    <Search size={36} style={{ opacity: 0.2, marginBottom: '12px' }} />
                    <h3>Aucun restaurant trouvé</h3>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* RESTAURANT DETAILS */}
        {activeTab === 'explore' && selectedRestaurant && (
          <div className="fade-in">
            <div style={{ position: 'relative', minHeight: 'clamp(140px, 25vw, 180px)', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', borderRadius: '18px', marginBottom: '24px', display: 'flex', alignItems: 'center', padding: 'clamp(16px, 3vw, 24px)', overflow: 'hidden' }}>
              <button
                className="btn btn-secondary"
                onClick={() => { setSelectedRestaurant(null); loadRestaurants(); }}
                style={{ position: 'absolute', top: '16px', left: '16px', width: '36px', height: '36px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: 'none', color: 'white', zIndex: 10 }}
              >
                <ChevronLeft size={20} />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', zIndex: 5, flexWrap: 'wrap', marginLeft: '40px' }}>
                <div style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', background: 'var(--bg-card)', width: 'clamp(56px, 10vw, 80px)', height: 'clamp(56px, 10vw, 80px)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '14px', overflow: 'hidden', flexShrink: 0 }}>
                  {renderMedia(selectedRestaurant.image)}
                </div>
                <div style={{ color: 'white', minWidth: 0 }}>
                  <h1 style={{ fontSize: 'clamp(1.1rem, 3vw, 2rem)', marginBottom: '6px', fontWeight: 900, wordBreak: 'break-word' }}>{selectedRestaurant.name}</h1>
                  <p style={{ display: 'flex', alignItems: 'center', gap: '6px', opacity: 0.9, fontSize: 'clamp(0.78rem, 2vw, 1rem)', marginBottom: '10px', flexWrap: 'wrap' }}>
                    <MapPin size={14} /> {selectedRestaurant.address}
                  </p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ background: 'var(--success)', padding: '3px 10px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700 }}>Ouvert</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="customer-layout">
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                  <h3 style={{ fontSize: 'clamp(1.1rem, 3vw, 1.4rem)', margin: 0 }}>
                    {isShoppingFlow ? (selectedRestaurant.type === 'boucherie' ? '🥩 Liste de courses' : '🛒 Liste de courses') : 'Menu'}
                  </h3>
                  {!isShoppingFlow && (
                    <button className="btn btn-secondary btn-sm" onClick={() => selectedRestaurant && openRestaurant(selectedRestaurant)} style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontSize: '0.82rem' }}>
                      Actualiser 🔄
                    </button>
                  )}
                </div>

                {isShoppingFlow ? (
                  <div className="card" style={{ padding: 'clamp(16px, 3vw, 24px)' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '14px' }}>
                      Écrivez tout ce que vous voulez acheter. Le livreur ira au {selectedRestaurant.type === 'boucherie' ? 'boucher' : 'supérette'} et achètera pour vous. Le prix final dépend du ticket de caisse.
                    </p>
                    <textarea
                      value={shoppingListText}
                      onChange={(e) => setShoppingListText(e.target.value)}
                      placeholder={selectedRestaurant.type === 'boucherie'
                        ? 'Ex:\n- 1 kg viande hachée\n- 500g escalope poulet\n- 4 merguez'
                        : 'Ex:\n- 2 baguettes\n- 1 L de lait\n- 6 œufs\n- Tomates, oignons'}
                      rows={8}
                      style={{
                        width: '100%', padding: '14px', borderRadius: '12px',
                        border: '1px solid var(--border)', background: 'var(--bg-elevated)', color: 'var(--text)',
                        fontSize: '0.95rem', fontFamily: 'inherit', outline: 'none',
                        resize: 'vertical', boxSizing: 'border-box', lineHeight: 1.6,
                      }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <span>{shoppingListText.length} caractères</span>
                      <span>Une ligne par article</span>
                    </div>
                  </div>
                ) : (!selectedRestaurant.products || selectedRestaurant.products.length === 0) ? (
                  <div className="empty-state" style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius)' }}>
                    <Utensils size={30} style={{ opacity: 0.3, marginBottom: '10px' }} />
                    <p>Ce restaurant n&apos;a pas encore de plat.</p>
                  </div>
                ) : (
                  <div className="grid grid-2" style={{ gap: '14px' }}>
                    {selectedRestaurant.products.map((product: Product) => (
                      <div key={product.id} className="card" style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'flex', gap: '12px' }}>
                          <div style={{ fontSize: '2.5rem', background: 'var(--bg)', width: 'clamp(56px, 10vw, 72px)', height: 'clamp(56px, 10vw, 72px)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '10px', flexShrink: 0, overflow: 'hidden' }}>
                            {renderMedia(product.image, '🍔')}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <h4 style={{ fontSize: 'clamp(0.88rem, 2.5vw, 1.05rem)', margin: '0 0 4px 0', wordBreak: 'break-word' }}>{product.name}</h4>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', background: 'var(--bg-elevated)', padding: '2px 6px', borderRadius: '4px' }}>{product.category}</span>
                            <div style={{ fontSize: 'clamp(0.95rem, 2.5vw, 1.15rem)', fontWeight: 900, color: 'var(--accent)', marginTop: '6px' }}>
                              {product.price} DA
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg)', padding: '6px 8px', borderRadius: '8px' }}>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Quantité</span>
                          <div className="quantity-control" style={{ margin: 0 }}>
                            <button onClick={() => removeFromCart(product.id)} disabled={!cart[product.id]} style={{ width: '30px', height: '30px' }}>
                              <Minus size={13} />
                            </button>
                            <span style={{ fontWeight: 700, width: '26px', textAlign: 'center', fontSize: '0.9rem' }}>{cart[product.id] || 0}</span>
                            <button onClick={() => addToCart(product.id)} style={{ width: '30px', height: '30px', background: cart[product.id] ? 'var(--primary)' : 'var(--bg-elevated)', color: cart[product.id] ? 'white' : 'var(--text)' }}>
                              <Plus size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="desktop-cart">
                {isShoppingFlow ? renderShoppingPanel(false) : renderCartContent(false)}
              </div>
            </div>
          </div>
        )}

        {/* Mobile Cart Bar */}
        {activeTab === 'explore' && selectedRestaurant && !isShoppingFlow && totalItemsCount > 0 && (
          <div className="mobile-cart-bar" onClick={() => setIsMobileCartOpen(true)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ background: 'rgba(255,255,255,0.25)', borderRadius: '50%', fontWeight: 800, fontSize: '0.85rem', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {totalItemsCount}
              </div>
              <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Voir le panier</span>
            </div>
            <span style={{ fontWeight: 900, fontSize: '1.1rem' }}>{cartTotal} DA</span>
          </div>
        )}

        {/* Mobile Cart Sheet */}
        {isMobileCartOpen && (
          <div className="mobile-cart-overlay" onClick={() => setIsMobileCartOpen(false)}>
            <div className="mobile-cart-sheet" onClick={(e) => e.stopPropagation()}>
              {isShoppingFlow ? renderShoppingPanel(true) : renderCartContent(true)}
            </div>
          </div>
        )}

        {/* Mobile bar for shopping-flow vendors — shows the "place order" CTA
            since there's no cart total to display until the driver shops. */}
        {activeTab === 'explore' && selectedRestaurant && isShoppingFlow && shoppingListText.trim().length > 0 && (
          <div className="mobile-cart-bar" onClick={() => setIsMobileCartOpen(true)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ClipboardList size={20} />
              <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Voir la liste</span>
            </div>
            <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>Commander →</span>
          </div>
        )}

        {/* ORDERS TAB */}
        {activeTab === 'orders' && appMode === 'delivery' && (
          <div className="fade-in" style={{ maxWidth: '900px', margin: '0 auto', width: '100%' }}>
            <h2 className="section-title" style={{ fontSize: 'clamp(1.2rem, 3vw, 1.8rem)', marginBottom: '24px' }}>Suivi de vos commandes</h2>

            {orders.length === 0 ? (
              <div className="empty-state" style={{ padding: '60px 20px' }}>
                <Truck size={40} style={{ opacity: 0.3, marginBottom: '14px' }} />
                <h3>Aucune commande passée</h3>
                <p>Explorez nos restaurants et commandez vos plats préférés !</p>
                <button className="btn btn-primary" onClick={() => setActiveTab('explore')} style={{ marginTop: '20px' }}>
                  Découvrir
                </button>
              </div>
            ) : (
              <>
                {/* Active */}
                {activeOrders.length > 0 && (
                  <div style={{ marginBottom: '40px' }}>
                    <h3 style={{ fontSize: '1.1rem', color: 'var(--primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="pulse-dot" style={{ width: 8, height: 8, background: 'var(--primary)', borderRadius: '50%', display: 'inline-block' }}></span>
                      En cours
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      {activeOrders.map((order) => {
                        const isPending = order.status === 'pending';
                        const isPreparing = order.status === 'accepted' || order.status === 'preparing';
                        const isReady = order.status === 'ready';
                        const isDelivering = order.status === 'out_for_delivery';

                        return (
                          <div key={order.id} className="card" style={{ border: '2px solid var(--primary)', padding: '0', overflow: 'hidden' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'clamp(14px, 3vw, 20px)', borderBottom: '1px solid var(--border)', background: 'var(--primary-glow)', flexWrap: 'wrap', gap: '10px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                                <div style={{ width: '40px', height: '40px', background: 'var(--bg)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', overflow: 'hidden', flexShrink: 0 }}>
                                  {renderMedia(order.restaurant?.image, '🏪')}
                                </div>
                                <div style={{ minWidth: 0 }}>
                                  <h3 style={{ margin: 0, fontSize: 'clamp(0.9rem, 2.5vw, 1.1rem)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{order.restaurant?.name}</h3>
                                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>#{order.id}</div>
                                </div>
                              </div>
                              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                <div style={{ fontSize: 'clamp(1rem, 2.5vw, 1.2rem)', fontWeight: 900, color: 'var(--accent)' }}>{order.total + (order.deliveryFee || 0)} DA</div>
                                {order.deliveryFee ? (
                                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>plats {order.total} + livreur {order.deliveryFee}</div>
                                ) : (
                                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>+ livraison à confirmer</div>
                                )}
                              </div>
                            </div>

                            <div style={{ padding: 'clamp(16px, 3vw, 24px)' }}>
                              {/* Progress */}
                              <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', marginBottom: '32px' }}>
                                <div style={{ position: 'absolute', top: '16px', left: '10%', right: '10%', height: '3px', background: 'var(--border)', zIndex: 0 }}></div>
                                <div style={{ position: 'absolute', top: '16px', left: '10%', height: '3px', background: 'var(--primary)', zIndex: 0, transition: 'width 0.5s', width: isPending ? '0%' : isPreparing ? '33%' : isReady ? '66%' : isDelivering ? '100%' : '0%' }}></div>

                                {[
                                  { icon: <Clock size={16} />, label: 'Confirmée', active: !isPending },
                                  { icon: <ChefHat size={16} />, label: 'Prépa.', active: isPreparing || isReady || isDelivering },
                                  { icon: <Package size={16} />, label: 'Prête', active: isReady || isDelivering },
                                  { icon: <Navigation size={16} />, label: 'Route', active: isDelivering }
                                ].map((step, idx) => (
                                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', zIndex: 1, width: 'clamp(50px, 12vw, 70px)' }}>
                                    <div style={{ width: 'clamp(32px, 6vw, 40px)', height: 'clamp(32px, 6vw, 40px)', borderRadius: '50%', background: step.active ? 'var(--primary)' : 'var(--bg-elevated)', color: step.active ? 'white' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `3px solid var(--bg-card)`, transition: 'all 0.3s' }}>
                                      {step.icon}
                                    </div>
                                    <span style={{ fontSize: 'clamp(0.6rem, 1.8vw, 0.75rem)', fontWeight: step.active ? 700 : 400, color: step.active ? 'white' : 'var(--text-muted)', textAlign: 'center' }}>{step.label}</span>
                                  </div>
                                ))}
                              </div>

                              {/* Items / Shopping list */}
                              <div style={{ background: 'var(--bg)', padding: '14px', borderRadius: '10px' }}>
                                <h4 style={{ margin: '0 0 10px 0', color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                  {order.shoppingList ? 'Liste de courses' : 'Détails'}
                                </h4>
                                {order.shoppingList ? (
                                  <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: 'inherit', fontSize: '0.88rem', margin: 0, lineHeight: 1.6 }}>{order.shoppingList}</pre>
                                ) : (
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    {order.items?.map(item => (
                                      <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                                        <span><strong style={{ color: 'var(--primary)' }}>{item.quantity}x</strong> {item.product?.name}</span>
                                        <span style={{ flexShrink: 0 }}>{item.price * item.quantity} DA</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {/* Driver */}
                              {isDelivering && order.driver && (
                                <div style={{ marginTop: '16px', background: 'var(--info-glow)', border: '1px solid rgba(30,144,255,0.2)', borderRadius: '10px', padding: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                                    <div style={{ width: '40px', height: '40px', background: '#1e90ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
                                      <User size={20} />
                                    </div>
                                    <div style={{ minWidth: 0 }}>
                                      <div style={{ fontSize: '0.78rem', color: '#1e90ff', fontWeight: 700, textTransform: 'uppercase' }}>Livreur</div>
                                      <strong style={{ fontSize: '1rem' }}>{order.driver.name}</strong>
                                    </div>
                                  </div>
                                  <a href={`tel:${order.driver.phone}`} className="btn btn-sm" style={{ background: 'white', color: '#101418', textDecoration: 'none', fontWeight: 700 }}>
                                    <Phone size={14} /> Appeler
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

                {/* Past */}
                {pastOrders.length > 0 && (
                  <div>
                    <h3 style={{ fontSize: '1.05rem', color: 'var(--text-muted)', marginBottom: '16px' }}>Historique</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {pastOrders.map((order) => (
                        <div key={order.id} className="card" style={{ padding: '16px', opacity: 0.8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                            <div style={{ fontSize: '1.5rem', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', overflow: 'hidden', opacity: 0.7, flexShrink: 0 }}>
                              {renderMedia(order.restaurant?.image, '🍽️')}
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <strong style={{ fontSize: 'clamp(0.88rem, 2.5vw, 1rem)', display: 'block', marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{order.restaurant?.name || 'Restaurant'}</strong>
                              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                {new Date(order.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} • {order.items?.length} articles
                              </div>
                            </div>
                          </div>
                          <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            <div style={{ fontWeight: 800, fontSize: '1rem', marginBottom: '4px' }}>{order.total} DA</div>
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

      {/* MODE: RESERVATION */}
      {appMode === 'reservation' && (
        <div className="fade-in" style={{ maxWidth: '900px', margin: '0 auto', width: '100%' }}>
          {/* Banner */}
          <div style={{ background: 'var(--gradient-blue)', borderRadius: '18px', padding: 'clamp(20px, 4vw, 28px) clamp(16px, 3vw, 24px)', marginBottom: '28px', color: 'white', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'relative', zIndex: 2 }}>
              <h1 style={{ fontSize: 'clamp(1.2rem, 4vw, 1.8rem)', marginBottom: '6px', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ClipboardList size={24} /> Réservation de File
              </h1>
              <p style={{ fontSize: 'clamp(0.8rem, 2vw, 0.95rem)', opacity: 0.9 }}>Réservez votre place et suivez votre position en temps réel.</p>
            </div>
          </div>

          {/* Active Reservations */}
          {activeReservations.length > 0 && (
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: 'clamp(1rem, 3vw, 1.2rem)', fontWeight: 800, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={20} color="#1e90ff" /> Vos réservations actives
              </h2>
              <div style={{ display: 'grid', gap: '14px' }}>
                {activeReservations.map(res => {
                  return (
                    <div key={res.id} style={{ background: 'var(--bg-card)', borderRadius: '18px', padding: 'clamp(16px, 3vw, 24px)', border: '2px solid rgba(30,144,255,0.2)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                          <div className="icon-box icon-box-md" style={{ background: 'var(--info-glow)', fontSize: '1.5rem', flexShrink: 0 }}>
                            {res.place?.icon || <ClipboardList size={20} />}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 700, fontSize: 'clamp(0.9rem, 2.5vw, 1.05rem)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{res.place?.name}</div>
                            <div style={{ opacity: 0.5, fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '3px' }}><MapPin size={11} /> {res.place?.address}</div>
                          </div>
                        </div>
                        <button onClick={() => cancelReservation(res.id)} className="btn btn-sm" style={{ background: 'var(--danger-glow)', color: '#e74c3c', border: '1px solid rgba(231,76,60,0.2)', flexShrink: 0 }}>
                          <XCircle size={13} /> Annuler
                        </button>
                      </div>

                      {/* Queue Stats — these values are set by the establishment (doctor / agent). */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', background: 'var(--bg)', borderRadius: '12px', padding: 'clamp(12px, 3vw, 18px)' }}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', fontWeight: 900, color: '#1e90ff' }}>#{res.queueNumber}</div>
                          <div style={{ fontSize: '0.7rem', opacity: 0.5 }}>Numéro</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', fontWeight: 900, color: '#f39c12' }}>{res.peopleBefore ?? 0}</div>
                          <div style={{ fontSize: '0.7rem', opacity: 0.5 }}>Avant vous</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', fontWeight: 900, color: '#2ed573' }}>~{res.estimatedWaitMinutes ?? 0}</div>
                          <div style={{ fontSize: '0.7rem', opacity: 0.5 }}>Minutes</div>
                        </div>
                      </div>

                      <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'center' }}>
                        <span style={{ padding: '5px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, background: res.status === 'called' ? 'var(--success-glow)' : 'rgba(243,156,18,0.15)', color: statusColors[res.status] }}>
                          {res.status === 'called' ? '📞 Vous êtes appelé !' : `⏳ ${statusLabels[res.status]}`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Available Places */}
          <h2 style={{ fontSize: 'clamp(1rem, 3vw, 1.2rem)', fontWeight: 800, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={20} color="#1e90ff" /> Établissements
          </h2>

          {!resLoaded && places.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', opacity: 0.5 }}>
              <div className="pulse-icon" style={{ fontSize: '1rem' }}>Chargement...</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '14px', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
              {places.map(place => {
                const hasActive = activeReservations.some(r => r.place?.id === place.id);
                return (
                  <div key={place.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '10px', opacity: place.isOpen ? 1 : 0.75 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div className="icon-box icon-box-md" style={{ background: 'var(--info-glow)', fontSize: '1.3rem', flexShrink: 0 }}>{place.icon}</div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{place.name}</div>
                        <div style={{ fontSize: '0.72rem', opacity: 0.5 }}>{typeLabels[place.type] || place.type}</div>
                      </div>
                      {/* Open / Closed badge */}
                      <span style={{ padding: '3px 9px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', background: place.isOpen ? 'rgba(46,213,115,0.15)' : 'rgba(255,71,87,0.15)', color: place.isOpen ? '#2ed573' : '#ff4757', border: `1px solid ${place.isOpen ? 'rgba(46,213,115,0.4)' : 'rgba(255,71,87,0.4)'}`, flexShrink: 0 }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: place.isOpen ? '#2ed573' : '#ff4757', display: 'inline-block' }} />
                        {place.isOpen ? 'Ouvert' : 'Fermé'}
                      </span>
                    </div>
                    <p style={{ opacity: 0.7, fontSize: '0.8rem', margin: 0, wordBreak: 'break-word' }}>{place.description}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', opacity: 0.5 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}><MapPin size={11} /> {place.address}</span>
                      <span style={{ color: '#f39c12', fontWeight: 700, opacity: 1, flexShrink: 0 }}>{place.waitingCount} att.</span>
                    </div>
                    <button
                      onClick={() => bookSpot(place.id)}
                      disabled={!place.isOpen || hasActive || bookingPlaceId === place.id}
                      className="btn btn-block"
                      style={{
                        padding: '10px', borderRadius: '10px',
                        fontWeight: 700, fontSize: '0.85rem',
                        cursor: (!place.isOpen || hasActive) ? 'not-allowed' : 'pointer',
                        background: !place.isOpen ? 'rgba(255,71,87,0.1)' : hasActive ? 'rgba(255,255,255,0.05)' : '#1e90ff',
                        color: !place.isOpen ? '#ff4757' : hasActive ? 'var(--text-muted)' : 'white',
                      }}
                    >
                      {!place.isOpen ? (<><XCircle size={14} /> Fermé actuellement</>) : hasActive ? (<><CheckCircle size={14} /> Déjà réservé</>) : bookingPlaceId === place.id ? 'Réservation...' : (<><ClipboardList size={14} /> Prendre un numéro</>)}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* History */}
          {myReservations.filter(r => r.status === 'done' || r.status === 'cancelled').length > 0 && (
            <div style={{ marginTop: '32px' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '10px', opacity: 0.6 }}>Historique</h2>
              <div style={{ display: 'grid', gap: '8px' }}>
                {myReservations.filter(r => r.status === 'done' || r.status === 'cancelled').map(res => (
                  <div key={res.id} style={{ background: 'var(--bg-card)', borderRadius: '10px', padding: '12px 16px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.6, flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                      <span>{res.place?.icon}</span>
                      <span style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{res.place?.name}</span>
                      <span style={{ fontSize: '0.75rem' }}>#{res.queueNumber}</span>
                    </div>
                    <span style={{ color: statusColors[res.status], fontWeight: 600, fontSize: '0.8rem', flexShrink: 0 }}>{statusLabels[res.status]}</span>
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
