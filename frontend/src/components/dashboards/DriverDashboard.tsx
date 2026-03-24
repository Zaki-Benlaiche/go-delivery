'use client';

import React, { useEffect } from 'react';
import { useOrderStore } from '@/store/orderStore';
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
    <div className="fade-in">
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '8px' }}>🚀 Espace Courrier</h1>
          <p className="page-subtitle" style={{ fontSize: '1.1rem', opacity: 0.7 }}>Prêt pour la prochaine course ? Le client vous attend.</p>
        </div>
        <div style={{ background: 'rgba(46, 213, 115, 0.1)', border: '1px solid rgba(46, 213, 115, 0.3)', color: '#2ed573', padding: '10px 20px', borderRadius: '30px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px', backdropFilter: 'blur(10px)' }}>
          <div style={{ width: '10px', height: '10px', background: '#2ed573', borderRadius: '50%', boxShadow: '0 0 15px #2ed573' }} className="pulse"></div>
          EN LIGNE & DISPONIBLE
        </div>
      </div>

      {/* 1. Active Deliveries (High Priority) */}
      {myActiveDeliveries.length > 0 && (
        <div style={{ marginBottom: '60px' }}>
          <h2 className="section-title" style={{ color: 'var(--info)', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.6rem', marginBottom: '24px' }}>
            <Navigation size={28} className="pulse" /> LIVRAISON EN COURS
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {myActiveDeliveries.map((order) => (
              <div key={order.id} className="card" style={{ 
                padding: '0', 
                overflow: 'hidden', 
                border: '1px solid rgba(30, 144, 255, 0.3)', 
                background: 'linear-gradient(135deg, rgba(30, 144, 255, 0.05) 0%, rgba(30, 144, 255, 0.02) 100%)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                backdropFilter: 'blur(10px)'
              }}>
                <div style={{ background: 'rgba(30, 144, 255, 0.1)', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(30, 144, 255, 0.2)' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ width: '50px', height: '50px', background: 'var(--info)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: '1.2rem' }}>#{order.id}</div>
                      <div>
                         <h3 style={{ margin: 0, fontSize: '1.3rem' }}>Course Active</h3>
                         <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>En route vers l'adresse client</span>
                      </div>
                   </div>
                   <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--accent)' }}>{order.total} DA</div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>À encaisser</span>
                   </div>
                </div>

                <div style={{ padding: '32px', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '40px' }}>
                  {/* Step A: Store */}
                  <div style={{ display: 'flex', gap: '20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                       <div style={{ width: '48px', height: '48px', background: 'rgba(255,165,2,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Store size={22} color="#ffa502" />
                       </div>
                       <div style={{ width: '2px', flex: 1, background: 'linear-gradient(to bottom, #ffa502, #1e90ff)', opacity: 0.3 }}></div>
                    </div>
                    <div>
                       <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ffa502', letterSpacing: '1px', textTransform: 'uppercase' }}>Récupération</div>
                       <h4 style={{ margin: '4px 0', fontSize: '1.2rem' }}>{order.restaurant?.name}</h4>
                       <p style={{ margin: '8px 0', color: 'var(--text-muted)', fontSize: '0.95rem' }}>{order.restaurant?.address}</p>
                    </div>
                  </div>

                  {/* Step B: Destination */}
                  <div style={{ display: 'flex', gap: '20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                       <div style={{ width: '48px', height: '48px', background: 'rgba(30,144,255,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <User size={22} color="#1e90ff" />
                       </div>
                    </div>
                    <div>
                       <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#1e90ff', letterSpacing: '1px', textTransform: 'uppercase' }}>Destination</div>
                       <h4 style={{ margin: '4px 0', fontSize: '1.2rem' }}>{order.customer?.name}</h4>
                       <p style={{ margin: '8px 0', color: 'var(--text-muted)', fontSize: '0.95rem' }}>{order.deliveryAddress || 'Adresse non spécifiée'}</p>
                       <a href={`tel:${order.customer?.phone}`} style={{ 
                         display: 'inline-flex', 
                         alignItems: 'center', 
                         gap: '8px', 
                         background: 'rgba(46, 213, 115, 0.1)', 
                         color: '#2ed573', 
                         padding: '6px 14px', 
                         borderRadius: '20px', 
                         textDecoration: 'none', 
                         fontSize: '0.9rem',
                         fontWeight: 700,
                         border: '1px solid rgba(46, 213, 115, 0.2)'
                       }}>
                         <Phone size={14} /> Appeler
                       </a>
                    </div>
                  </div>
                </div>

                <div style={{ padding: '0 32px 32px 32px' }}>
                   <button
                    className="btn btn-success btn-block"
                    style={{ padding: '20px', fontSize: '1.2rem', fontWeight: 900, borderRadius: '16px', boxShadow: '0 10px 40px rgba(46, 213, 115, 0.3)' }}
                    onClick={() => updateStatus(order.id, 'delivered')}
                  >
                    <CheckCircle2 size={24} style={{ marginRight: '8px' }} /> CONFIRMER LA LIVRAISON
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Main Grid: Available & History */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '40px' }}>
        
        {/* Available Deliveries */}
        <div>
          <h2 className="section-title" style={{ marginTop: 0, fontSize: '1.5rem', marginBottom: '24px' }}>
            <Package size={24} style={{ marginRight: '10px' }} /> Courses Disponibles
          </h2>
          {availableOrders.length === 0 ? (
            <div className="empty-state" style={{ background: 'var(--bg-card)', borderRadius: '24px', padding: '60px 40px' }}>
              <div className="pulse" style={{ fontSize: '3rem', marginBottom: '20px' }}>📡</div>
              <h3 style={{ fontSize: '1.6rem', marginBottom: '8px' }}>Recherche de courses...</h3>
              <p style={{ color: 'var(--text-muted)' }}>Dès qu'un restaurant finit une commande, elle apparaîtra ici.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {availableOrders.map((order) => (
                <div key={order.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px', borderLeft: '4px solid var(--accent)' }}>
                  <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
                    <div style={{ textAlign: 'center', minWidth: '80px' }}>
                      <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--accent)' }}>{order.total}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 800 }}>DA</div>
                    </div>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                           <Store size={18} color="var(--primary)" />
                           <strong style={{ fontSize: '1.1rem' }}>{order.restaurant?.name}</strong>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                           <MapPin size={14} /> {order.restaurant?.address}
                        </div>
                    </div>
                  </div>
                  <button
                    className="btn btn-primary"
                    style={{ padding: '14px 30px', borderRadius: '12px', fontWeight: 800 }}
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
             borderRadius: '24px', 
             padding: '30px', 
             border: '1px solid var(--border)',
             boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
           }}>
             <h3 style={{ fontSize: '1.3rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
               <CheckCircle2 size={20} color="var(--success)" /> Performance du Jour
             </h3>
             
             <div style={{ background: 'var(--bg-elevated)', padding: '24px', borderRadius: '20px', marginBottom: '24px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '8px' }}>REVENUS ESTIMÉS</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--success)' }}>{myCompletedDeliveries.length * 300} <span style={{ fontSize: '1rem' }}>DA</span></div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>Basé sur {myCompletedDeliveries.length} livraisons</div>
             </div>

             <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Dernières Courses</h4>
                {myCompletedDeliveries.slice(0, 5).map((order) => (
                  <div key={order.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{order.restaurant?.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Livrè avec succès</div>
                    </div>
                    <div style={{ fontWeight: 800 }}>+{order.total} DA</div>
                  </div>
                ))}
                {myCompletedDeliveries.length === 0 && (
                  <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', padding: '20px 0' }}>Aucune course terminée aujourd'hui.</p>
                )}
             </div>
           </div>
        </div>

      </div>
    </div>
  );
}
