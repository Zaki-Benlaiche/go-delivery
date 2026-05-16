'use client';

import React, { useEffect, useState } from 'react';
import { useOrderStore } from '@/store/orderStore';
import { Truck, MapPin, Phone, CheckCircle2, Navigation, Package, Store, User, Zap, Radio, TrendingUp, X, ClipboardList, ShoppingBasket } from 'lucide-react';

export default function DriverDashboard() {
  // Atomic selectors — pulling each field separately ensures a price modal
  // toggle doesn't trigger a re-subscribe on the whole orders array.
  const orders = useOrderStore((s) => s.orders);
  const availableOrders = useOrderStore((s) => s.availableOrders);
  const fetchOrders = useOrderStore((s) => s.fetchOrders);
  const fetchAvailableOrders = useOrderStore((s) => s.fetchAvailableOrders);
  const updateStatus = useOrderStore((s) => s.updateStatus);

  // Modal state for the price the livreur wants to charge for this run.
  const [pendingOrderId, setPendingOrderId] = useState<number | null>(null);
  const [pendingFee, setPendingFee] = useState<string>('');
  const [accepting, setAccepting] = useState(false);

  // Modal state for confirming delivery of a shopping-list run. The driver
  // enters the receipt total here before flipping the order to 'delivered'.
  const [confirmingOrderId, setConfirmingOrderId] = useState<number | null>(null);
  const [confirmTotal, setConfirmTotal] = useState<string>('');
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    fetchOrders();
    fetchAvailableOrders();
  }, [fetchOrders, fetchAvailableOrders]);

  const myActiveDeliveries = orders.filter((o) => o.status === 'out_for_delivery');
  const myCompletedDeliveries = orders.filter((o) => o.status === 'delivered');

  const beginAccept = (orderId: number) => {
    setPendingOrderId(orderId);
    setPendingFee('');
  };

  const confirmAccept = async () => {
    if (pendingOrderId == null) return;
    const fee = Number(pendingFee);
    if (!Number.isFinite(fee) || fee < 0) return;
    setAccepting(true);
    try {
      await updateStatus(pendingOrderId, 'out_for_delivery', { deliveryFee: fee });
      setPendingOrderId(null);
      setPendingFee('');
    } catch {
      // Server rejected (likely 409 — taken by someone else). Keep the modal open
      // so the user sees the failed state, then refresh to drop the stale row.
      fetchAvailableOrders();
    } finally {
      setAccepting(false);
    }
  };

  const pendingOrder = pendingOrderId != null ? availableOrders.find(o => o.id === pendingOrderId) : null;
  const confirmingOrder = confirmingOrderId != null ? orders.find(o => o.id === confirmingOrderId) : null;

  // Confirm delivery — for shopping-list orders, prompt for receipt total first.
  const handleConfirmDelivery = (order: { id: number; shoppingList?: string | null }) => {
    if (order.shoppingList) {
      setConfirmingOrderId(order.id);
      setConfirmTotal('');
    } else {
      updateStatus(order.id, 'delivered');
    }
  };

  const finalizeShoppingDelivery = async () => {
    if (confirmingOrderId == null) return;
    const t = Number(confirmTotal);
    if (!Number.isFinite(t) || t < 0) return;
    setConfirming(true);
    try {
      await updateStatus(confirmingOrderId, 'delivered', { total: t });
      setConfirmingOrderId(null);
      setConfirmTotal('');
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className="fade-in">
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 className="page-title" style={{ fontSize: 'clamp(1.3rem, 5vw, 2.2rem)', fontWeight: 900, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Zap size={28} color="#ffc048" className="pulse-icon" /> Espace Courrier
          </h1>
          <p className="page-subtitle" style={{ fontSize: 'clamp(0.8rem, 2.5vw, 1rem)' }}>Prêt pour la prochaine course ? Le client vous attend.</p>
        </div>
        <div style={{
          background: 'rgba(46, 213, 115, 0.1)',
          border: '1px solid rgba(46, 213, 115, 0.3)',
          color: '#2ed573',
          padding: '8px 16px',
          borderRadius: '30px',
          fontWeight: 800,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backdropFilter: 'blur(10px)',
          fontSize: 'clamp(0.7rem, 2vw, 0.85rem)',
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}>
          <div style={{ width: '8px', height: '8px', background: '#2ed573', borderRadius: '50%' }} className="pulse-dot"></div>
          EN LIGNE
        </div>
      </div>

      {/* 1. Active Deliveries (High Priority) */}
      {myActiveDeliveries.length > 0 && (
        <div style={{ marginBottom: '40px' }}>
          <h2 className="section-title" style={{ color: 'var(--info)', display: 'flex', alignItems: 'center', gap: '10px', fontSize: 'clamp(1rem, 3vw, 1.4rem)', marginBottom: '20px' }}>
            <Navigation size={22} className="pulse-icon" /> LIVRAISON EN COURS
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {myActiveDeliveries.map((order) => (
              <div key={order.id} className="card" style={{
                padding: '0',
                overflow: 'hidden',
                border: '1px solid rgba(30, 144, 255, 0.3)',
                background: 'linear-gradient(135deg, rgba(30, 144, 255, 0.05) 0%, rgba(30, 144, 255, 0.02) 100%)',
                boxShadow: '0 12px 30px rgba(0,0,0,0.3)',
              }}>
                <div style={{ background: 'rgba(30, 144, 255, 0.1)', padding: 'clamp(14px, 3vw, 24px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(30, 144, 255, 0.2)', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '42px', height: '42px', background: 'var(--info)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: '1rem', flexShrink: 0 }}>#{order.id}</div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: 'clamp(1rem, 3vw, 1.2rem)' }}>Course Active</h3>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>En route vers le client</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 'clamp(1.1rem, 3vw, 1.5rem)', fontWeight: 900, color: 'var(--accent)' }}>{order.total + (order.deliveryFee || 0)} DA</div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>À encaisser{order.deliveryFee ? ` (livraison ${order.deliveryFee})` : ''}</span>
                  </div>
                </div>

                <div style={{ padding: 'clamp(16px, 4vw, 32px)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
                  {/* Store */}
                  <div style={{ display: 'flex', gap: '14px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <div className="icon-box icon-box-md" style={{ background: 'rgba(255,192,72,0.1)' }}>
                        {order.shoppingList ? <ShoppingBasket size={20} color="#ffc048" /> : <Store size={20} color="#ffc048" />}
                      </div>
                      <div style={{ width: '2px', flex: 1, background: 'linear-gradient(to bottom, #ffc048, #1e90ff)', opacity: 0.3 }}></div>
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#ffc048', letterSpacing: '1px', textTransform: 'uppercase' }}>
                        {order.shoppingList ? (order.restaurant?.type === 'boucherie' ? 'Boucherie' : 'Supérette') : 'Récupération'}
                      </div>
                      <h4 style={{ margin: '4px 0', fontSize: 'clamp(0.95rem, 2.5vw, 1.15rem)', wordBreak: 'break-word' }}>{order.restaurant?.name}</h4>
                      <p style={{ margin: '4px 0', color: 'var(--text-muted)', fontSize: '0.85rem', wordBreak: 'break-word' }}>{order.restaurant?.address}</p>
                      {order.shoppingList && (
                        <div style={{ marginTop: '10px', background: 'var(--bg)', padding: '10px 12px', borderRadius: '8px', border: '1px dashed rgba(255,192,72,0.4)' }}>
                          <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#ffc048', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <ClipboardList size={11} /> À acheter
                          </div>
                          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: 'inherit', fontSize: '0.85rem', margin: 0, lineHeight: 1.5, color: 'var(--text)' }}>{order.shoppingList}</pre>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Destination */}
                  <div style={{ display: 'flex', gap: '14px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <div className="icon-box icon-box-md" style={{ background: 'rgba(30,144,255,0.1)' }}>
                        <User size={20} color="#1e90ff" />
                      </div>
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#1e90ff', letterSpacing: '1px', textTransform: 'uppercase' }}>Destination</div>
                      <h4 style={{ margin: '4px 0', fontSize: 'clamp(0.95rem, 2.5vw, 1.15rem)', wordBreak: 'break-word' }}>{order.customer?.name}</h4>
                      <p style={{ margin: '4px 0', color: 'var(--text-muted)', fontSize: '0.85rem', wordBreak: 'break-word' }}>{order.deliveryAddress || 'Adresse non spécifiée'}</p>
                      <a href={`tel:${order.customer?.phone}`} style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: 'rgba(46, 213, 115, 0.1)',
                        color: '#2ed573',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        textDecoration: 'none',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        border: '1px solid rgba(46, 213, 115, 0.2)',
                        marginTop: '4px'
                      }}>
                        <Phone size={13} /> Appeler
                      </a>
                    </div>
                  </div>
                </div>

                <div style={{ padding: '0 clamp(16px, 4vw, 32px) clamp(16px, 4vw, 32px)' }}>
                  <button
                    className="btn btn-success btn-block"
                    style={{ padding: 'clamp(14px, 3vw, 20px)', fontSize: 'clamp(0.9rem, 2.5vw, 1.1rem)', fontWeight: 900, borderRadius: '14px' }}
                    onClick={() => handleConfirmDelivery(order)}
                  >
                    <CheckCircle2 size={20} />
                    {order.shoppingList ? 'CONFIRMER (saisir le total)' : 'CONFIRMER LA LIVRAISON'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Main Grid: Available & History */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>

        {/* Available Deliveries */}
        <div>
          <h2 className="section-title" style={{ marginTop: 0, fontSize: 'clamp(1rem, 3vw, 1.3rem)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Package size={20} color="var(--accent)" /> Courses Disponibles
          </h2>
          {availableOrders.length === 0 ? (
            <div className="empty-state" style={{ background: 'var(--bg-card)', borderRadius: '20px', padding: 'clamp(30px, 6vw, 60px) clamp(20px, 4vw, 40px)' }}>
              <div style={{ marginBottom: '16px' }}>
                <Radio size={40} color="var(--info)" className="pulse-icon" />
              </div>
              <h3 style={{ fontSize: 'clamp(1rem, 3vw, 1.4rem)', marginBottom: '8px' }}>Recherche de courses...</h3>
              <p style={{ color: 'var(--text-muted)' }}>Dès qu&apos;un restaurant finit une commande, elle apparaîtra ici.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {availableOrders.map((order) => (
                <div key={order.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'clamp(14px, 3vw, 24px)', borderLeft: `4px solid ${order.shoppingList ? '#16a085' : 'var(--accent)'}`, gap: '12px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', gap: 'clamp(12px, 3vw, 24px)', alignItems: 'center', minWidth: 0, flex: 1 }}>
                    <div style={{ textAlign: 'center', flexShrink: 0 }}>
                      {order.shoppingList ? (
                        <ShoppingBasket size={28} color="#16a085" />
                      ) : (
                        <>
                          <div style={{ fontSize: 'clamp(1.2rem, 3vw, 1.6rem)', fontWeight: 900, color: 'var(--accent)' }}>{order.total}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 800 }}>DA</div>
                        </>
                      )}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                        <Store size={16} color="var(--primary)" />
                        <strong style={{ fontSize: 'clamp(0.9rem, 2.5vw, 1.05rem)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{order.restaurant?.name}</strong>
                        {order.shoppingList && (
                          <span style={{ background: '#16a085', color: 'white', fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', flexShrink: 0 }}>
                            {order.restaurant?.type === 'boucherie' ? 'Boucher' : 'Courses'}
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)', fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        <MapPin size={12} /> {order.restaurant?.address}
                      </div>
                    </div>
                  </div>
                  <button
                    className="btn btn-primary"
                    style={{ padding: '12px 20px', borderRadius: '12px', fontWeight: 800, whiteSpace: 'nowrap', flexShrink: 0 }}
                    onClick={() => beginAccept(order.id)}
                  >
                    ACCEPTER
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* History / Daily Earnings */}
        <div>
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: '20px',
            padding: 'clamp(20px, 4vw, 30px)',
            border: '1px solid var(--border)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ fontSize: 'clamp(1rem, 2.5vw, 1.2rem)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <TrendingUp size={18} color="var(--success)" /> Performance du Jour
            </h3>

            <div style={{ background: 'var(--bg-elevated)', padding: 'clamp(16px, 3vw, 24px)', borderRadius: '16px', marginBottom: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>REVENUS ESTIMÉS</div>
              <div style={{ fontSize: 'clamp(1.8rem, 5vw, 2.5rem)', fontWeight: 900, color: 'var(--success)' }}>{myCompletedDeliveries.length * 300} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>DA</span></div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>Basé sur {myCompletedDeliveries.length} livraisons</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <h4 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Dernières Courses</h4>
              {myCompletedDeliveries.slice(0, 5).map((order) => (
                <div key={order.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{order.restaurant?.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Livrée avec succès</div>
                  </div>
                  <div style={{ fontWeight: 800, color: 'var(--success)', flexShrink: 0 }}>+{order.total} DA</div>
                </div>
              ))}
              {myCompletedDeliveries.length === 0 && (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', padding: '16px 0' }}>Aucune course terminée aujourd&apos;hui.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Shopping-list delivery confirm — driver enters the receipt total
          before flipping the order to delivered. */}
      {confirmingOrderId != null && confirmingOrder && (
        <div
          onClick={() => !confirming && setConfirmingOrderId(null)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
            zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="card fade-in"
            style={{
              width: '100%', maxWidth: '440px', padding: '24px',
              border: '1px solid rgba(22,160,133,0.3)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.05rem' }}>
                <ShoppingBasket size={18} color="#16a085" /> Total du ticket
              </h3>
              <button
                onClick={() => !confirming && setConfirmingOrderId(null)}
                disabled={confirming}
                style={{ background: 'var(--bg-elevated)', border: 'none', color: 'var(--text-muted)', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: confirming ? 'not-allowed' : 'pointer' }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ background: 'var(--bg)', padding: '12px', borderRadius: '10px', marginBottom: '16px', fontSize: '0.85rem' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Liste achetée</div>
              <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: 'inherit', fontSize: '0.85rem', margin: 0, lineHeight: 1.5, maxHeight: '120px', overflowY: 'auto' }}>{confirmingOrder.shoppingList}</pre>
            </div>

            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px', display: 'block' }}>
              Total achat (DA)
            </label>
            <input
              type="number"
              autoFocus
              min={0}
              value={confirmTotal}
              onChange={(e) => setConfirmTotal(e.target.value)}
              placeholder="Ex: 1850"
              style={{
                width: '100%', padding: '14px 16px', borderRadius: '12px',
                border: '1px solid var(--border)', background: 'var(--bg-elevated)', color: 'var(--text)',
                fontSize: '1.1rem', fontWeight: 700, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
              }}
              onKeyDown={(e) => { if (e.key === 'Enter' && confirmTotal !== '') finalizeShoppingDelivery(); }}
            />
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '8px' }}>
              Le client paiera ce montant + votre prix de livraison ({confirmingOrder.deliveryFee || 0} DA).
            </p>

            <button
              onClick={finalizeShoppingDelivery}
              disabled={confirming || confirmTotal === ''}
              className="btn btn-success btn-block"
              style={{ marginTop: '14px', padding: '14px', fontSize: '1rem', fontWeight: 800, borderRadius: '12px' }}
            >
              {confirming ? 'Confirmation...' : 'Confirmer la livraison'}
            </button>
          </div>
        </div>
      )}

      {/* Delivery price prompt — livreur sets their own fee before accepting. */}
      {pendingOrderId != null && (
        <div
          onClick={() => !accepting && setPendingOrderId(null)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
            zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="card fade-in"
            style={{
              width: '100%', maxWidth: '420px', padding: '24px',
              border: '1px solid rgba(46,213,115,0.25)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.05rem' }}>
                <Truck size={18} color="#2ed573" /> Fixer le prix de livraison
              </h3>
              <button
                onClick={() => !accepting && setPendingOrderId(null)}
                disabled={accepting}
                style={{ background: 'var(--bg-elevated)', border: 'none', color: 'var(--text-muted)', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: accepting ? 'not-allowed' : 'pointer' }}
              >
                <X size={16} />
              </button>
            </div>

            {pendingOrder ? (
              <div style={{ background: 'var(--bg)', padding: '12px', borderRadius: '10px', marginBottom: '18px', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Commerce</span>
                  <strong>{pendingOrder.restaurant?.name}</strong>
                </div>
                {pendingOrder.shoppingList ? (
                  <div style={{ marginTop: '8px' }}>
                    <div style={{ color: 'var(--text-muted)', marginBottom: '4px', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Liste à acheter</div>
                    <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: 'inherit', fontSize: '0.85rem', margin: 0, lineHeight: 1.5, maxHeight: '120px', overflowY: 'auto' }}>{pendingOrder.shoppingList}</pre>
                  </div>
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Total plats</span>
                    <strong>{pendingOrder.total} DA</strong>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Vers</span>
                  <span style={{ textAlign: 'right', maxWidth: '60%' }}>{pendingOrder.deliveryAddress || '—'}</span>
                </div>
              </div>
            ) : null}

            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px', display: 'block' }}>
              Prix livreur (DA)
            </label>
            <input
              type="number"
              autoFocus
              min={0}
              value={pendingFee}
              onChange={(e) => setPendingFee(e.target.value)}
              placeholder="Ex: 200"
              style={{
                width: '100%', padding: '14px 16px', borderRadius: '12px',
                border: '1px solid var(--border)', background: 'var(--bg-elevated)', color: 'var(--text)',
                fontSize: '1.1rem', fontWeight: 700, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
              }}
              onKeyDown={(e) => { if (e.key === 'Enter' && pendingFee !== '') confirmAccept(); }}
            />

            <button
              onClick={confirmAccept}
              disabled={accepting || pendingFee === ''}
              className="btn btn-success btn-block"
              style={{ marginTop: '18px', padding: '14px', fontSize: '1rem', fontWeight: 800, borderRadius: '12px' }}
            >
              {accepting ? 'Validation...' : `Accepter et démarrer`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
