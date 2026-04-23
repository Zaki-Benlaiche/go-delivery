'use client';

import React, { useEffect } from 'react';
import { useOrderStore } from '@/store/orderStore';
import { Truck, MapPin, Phone, CheckCircle2, Navigation, Package, Store, User, Zap, Radio, TrendingUp } from 'lucide-react';

export default function DriverDashboard() {
  const { orders, availableOrders, fetchOrders, fetchAvailableOrders, updateStatus } = useOrderStore();

  useEffect(() => {
    fetchOrders();
    fetchAvailableOrders();
  }, [fetchOrders, fetchAvailableOrders]);

  const myActiveDeliveries = orders.filter((o) => o.status === 'out_for_delivery');
  const myCompletedDeliveries = orders.filter((o) => o.status === 'delivered');

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
                    <div style={{ fontSize: 'clamp(1.1rem, 3vw, 1.5rem)', fontWeight: 900, color: 'var(--accent)' }}>{order.total} DA</div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>À encaisser</span>
                  </div>
                </div>

                <div style={{ padding: 'clamp(16px, 4vw, 32px)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
                  {/* Store */}
                  <div style={{ display: 'flex', gap: '14px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <div className="icon-box icon-box-md" style={{ background: 'rgba(255,192,72,0.1)' }}>
                        <Store size={20} color="#ffc048" />
                      </div>
                      <div style={{ width: '2px', flex: 1, background: 'linear-gradient(to bottom, #ffc048, #1e90ff)', opacity: 0.3 }}></div>
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#ffc048', letterSpacing: '1px', textTransform: 'uppercase' }}>Récupération</div>
                      <h4 style={{ margin: '4px 0', fontSize: 'clamp(0.95rem, 2.5vw, 1.15rem)', wordBreak: 'break-word' }}>{order.restaurant?.name}</h4>
                      <p style={{ margin: '4px 0', color: 'var(--text-muted)', fontSize: '0.85rem', wordBreak: 'break-word' }}>{order.restaurant?.address}</p>
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
                    onClick={() => updateStatus(order.id, 'delivered')}
                  >
                    <CheckCircle2 size={20} /> CONFIRMER LA LIVRAISON
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
                <div key={order.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'clamp(14px, 3vw, 24px)', borderLeft: '4px solid var(--accent)', gap: '12px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', gap: 'clamp(12px, 3vw, 24px)', alignItems: 'center', minWidth: 0, flex: 1 }}>
                    <div style={{ textAlign: 'center', flexShrink: 0 }}>
                      <div style={{ fontSize: 'clamp(1.2rem, 3vw, 1.6rem)', fontWeight: 900, color: 'var(--accent)' }}>{order.total}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 800 }}>DA</div>
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                        <Store size={16} color="var(--primary)" />
                        <strong style={{ fontSize: 'clamp(0.9rem, 2.5vw, 1.05rem)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{order.restaurant?.name}</strong>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)', fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        <MapPin size={12} /> {order.restaurant?.address}
                      </div>
                    </div>
                  </div>
                  <button
                    className="btn btn-primary"
                    style={{ padding: '12px 20px', borderRadius: '12px', fontWeight: 800, whiteSpace: 'nowrap', flexShrink: 0 }}
                    onClick={() => updateStatus(order.id, 'out_for_delivery')}
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
                <div key={order.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
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
    </div>
  );
}
