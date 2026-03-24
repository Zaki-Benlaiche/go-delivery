'use client';

import React, { useEffect } from 'react';
import { useOrderStore } from '@/store/orderStore';
import StatusBadge from '@/components/StatusBadge';
import type { OrderStatus } from '@/types';
import { Truck, MapPin, Phone, CheckCircle2, Navigation, Package, Store, User } from 'lucide-react';

export default function DriverDashboard() {
  const { orders, availableOrders, fetchOrders, fetchAvailableOrders, updateStatus } = useOrderStore();

  useEffect(() => {
    fetchOrders();
    fetchAvailableOrders();
  }, [fetchOrders, fetchAvailableOrders]);

  const myActiveDeliveries = orders.filter((o) => o.status === 'out_for_delivery');
  const myCompletedDeliveries = orders.filter((o) => o.status === 'delivered');

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 className="page-title">🛵 Espace Livreur</h1>
          <p className="page-subtitle">Soyez rapide, restez prudent.</p>
        </div>
        <div style={{ background: 'var(--success)20', color: 'var(--success)', padding: '8px 16px', borderRadius: '30px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '10px', height: '10px', background: 'var(--success)', borderRadius: '50%', boxShadow: '0 0 10px var(--success)' }} className="pulse"></div>
          En Ligne (Prêt)
        </div>
      </div>

      {/* My Active Deliveries (TOP PRIORITY) */}
      {myActiveDeliveries.length > 0 && (
        <div style={{ marginBottom: '48px' }}>
          <h2 className="section-title" style={{ color: 'var(--info)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.5rem' }}>
            <Navigation size={24} /> VOS COURSES EN COURS ({myActiveDeliveries.length})
          </h2>
          <div className="grid grid-2">
            {myActiveDeliveries.map((order) => (
              <div key={order.id} className="card" style={{ border: '2px solid var(--info)', background: 'rgba(30, 144, 255, 0.05)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '6px', height: '100%', background: 'var(--info)' }}></div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '1.3rem', margin: 0 }}>Course #{order.id}</h3>
                  <span style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--accent)' }}>{order.total} DA <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 400 }}>(à encaisser)</span></span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                  {/* Point A: Restaurant */}
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'start' }}>
                    <div style={{ background: 'var(--bg-elevated)', padding: '10px', borderRadius: '50%' }}><Store size={20} color="var(--primary)" /></div>
                    <div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>ÉTAPE 1 : RÉCUPÉRATION</div>
                      <strong style={{ fontSize: '1.1rem' }}>{order.restaurant?.name}</strong>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}><MapPin size={12} style={{ display: 'inline' }}/> {order.restaurant?.address}</div>
                    </div>
                  </div>

                  {/* Vertical line indicator */}
                  <div style={{ width: '2px', height: '24px', background: 'var(--border)', margin: '-8px 0 -8px 20px' }}></div>

                  {/* Point B: Client */}
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'start' }}>
                    <div style={{ background: 'var(--info)', padding: '10px', borderRadius: '50%' }}><User size={20} color="white" /></div>
                    <div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>ÉTAPE 2 : LIVRAISON</div>
                      <strong style={{ fontSize: '1.1rem' }}>{order.customer?.name}</strong>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '4px' }}><MapPin size={12} style={{ display: 'inline' }}/> {order.deliveryAddress || 'Adresse du client'}</div>
                      <a href={`tel:${order.customer?.phone}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--bg-elevated)', padding: '6px 12px', borderRadius: '20px', color: 'white', textDecoration: 'none', fontSize: '0.9rem', border: '1px solid var(--border)' }}>
                        <Phone size={14} color="var(--success)" /> Appeler le {order.customer?.phone}
                      </a>
                    </div>
                  </div>
                </div>

                <button
                  className="btn btn-success btn-block"
                  style={{ padding: '16px', fontSize: '1.2rem', fontWeight: 800 }}
                  onClick={() => updateStatus(order.id, 'delivered')}
                >
                  <CheckCircle2 size={24} /> VALIDER LA LIVRAISON (Payé)
                </button>
              </div>
            ))}
          </div>
          <hr style={{ borderColor: 'var(--border)', margin: '48px 0', opacity: 0.5 }} />
        </div>
      )}

      <div className="grid" style={{ gridTemplateColumns: '1fr 350px', gap: '32px' }}>
        
        {/* Available Deliveries */}
        <div>
          <h2 className="section-title" style={{ marginTop: 0 }}>
            <Package size={20} /> Courses Disponibles Autour de Vous
          </h2>
          {availableOrders.length === 0 ? (
            <div className="empty-state" style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius)' }}>
              <div className="icon pulse">📡</div>
              <h3 style={{ fontSize: '1.5rem' }}>Recherche en cours...</h3>
              <p>Restez connecté, les commandes prêtes au restaurant apparaîtront ici instantanément.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {availableOrders.map((order) => (
                <div key={order.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: '4px solid var(--accent)' }}>
                  <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flex: 1 }}>
                    <div style={{ textAlign: 'center', paddingRight: '24px', borderRight: '1px solid var(--border)' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--accent)' }}>{order.total}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>DA</div>
                    </div>
                    
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <Store size={16} color="var(--primary)" />
                        <span style={{ fontWeight: 700 }}>{order.restaurant?.name}</span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>({Math.floor((new Date().getTime() - new Date(order.updatedAt || order.createdAt).getTime()) / 60000)} min d'attente)</span>
                      </div>
                      
                      <div style={{ display: 'flex', gap: '16px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={12} /> {order.restaurant?.address}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    className="btn btn-primary"
                    style={{ padding: '12px 32px', fontSize: '1.1rem', whiteSpace: 'nowrap' }}
                    onClick={() => updateStatus(order.id, 'out_for_delivery')}
                  >
                    Récupérer la course
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Historique du Jour */}
        <div>
          <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', padding: '24px' }}>
            <h3 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
              <CheckCircle2 size={20} color="var(--success)" /> 
              Historique du Jour
            </h3>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', background: 'var(--bg-elevated)', padding: '16px', borderRadius: '8px' }}>
              <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Courses</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>{myCompletedDeliveries.length}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Gains (Estimés)</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--success)' }}>{myCompletedDeliveries.length * 300} DA</div>
              </div>
            </div>

            {myCompletedDeliveries.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', padding: '20px 0' }}>Aucune livraison terminée aujourd'hui.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '300px', overflowY: 'auto' }}>
                {myCompletedDeliveries.map((order) => (
                  <div key={order.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderBottom: '1px solid var(--border)' }}>
                    <div>
                      <strong style={{ fontSize: '0.95rem' }}>{order.restaurant?.name}</strong>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Client: {order.customer?.name}</div>
                    </div>
                    <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{order.total} DA</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
