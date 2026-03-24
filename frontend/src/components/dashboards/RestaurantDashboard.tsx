'use client';

import React, { useEffect, useState } from 'react';
import { useOrderStore } from '@/store/orderStore';
import { useMenuStore } from '@/store/menuStore';
import StatusBadge from '@/components/StatusBadge';
import type { OrderStatus, Product } from '@/types';
import { ChefHat, Clock, CheckCircle, Flame, User, Phone, CheckCircle2, Truck, Package, Plus, Edit, Trash2 } from 'lucide-react';

export default function RestaurantDashboard() {
  const { orders, fetchOrders, updateStatus } = useOrderStore();
  const { products, fetchMenu, addProduct, deleteProduct } = useMenuStore();
  
  const [activeTab, setActiveTab] = useState<'orders' | 'menu'>('orders');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', price: '', category: 'Plats', image: '🍽️' });

  useEffect(() => {
    fetchOrders();
    fetchMenu();
  }, [fetchOrders, fetchMenu]);

  // Order groupings
  const pendingOrders = orders.filter((o) => o.status === 'pending');
  const preparingOrders = orders.filter((o) => ['accepted', 'preparing'].includes(o.status));
  const readyOrders = orders.filter((o) => o.status === 'ready');
  const deliveringOrders = orders.filter((o) => o.status === 'out_for_delivery');
  const completedOrders = orders.filter((o) => o.status === 'delivered');

  const handleAccept = async (orderId: number) => {
    await updateStatus(orderId, 'accepted');
    setTimeout(() => updateStatus(orderId, 'preparing'), 500);
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price) return;
    
    await addProduct({
      name: newProduct.name,
      price: Number(newProduct.price),
      category: newProduct.category,
      image: newProduct.image,
      isAvailable: true,
    });
    
    setShowAddModal(false);
    setNewProduct({ name: '', price: '', category: 'Plats', image: '🍽️' });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
        <div>
          <h1 className="page-title">👨‍🍳 Portail Restaurant</h1>
          <p className="page-subtitle">Gérez vos commandes et votre menu en temps réel</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', background: 'var(--bg-elevated)', padding: '6px', borderRadius: '12px' }}>
          <button 
            onClick={() => setActiveTab('orders')}
            style={{ 
              padding: '10px 24px', 
              borderRadius: '8px', 
              border: 'none', 
              background: activeTab === 'orders' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'orders' ? '#fff' : 'var(--text-muted)',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            📦 Commandes ({pendingOrders.length + preparingOrders.length})
          </button>
          <button 
            onClick={() => setActiveTab('menu')}
            style={{ 
              padding: '10px 24px', 
              borderRadius: '8px', 
              border: 'none', 
              background: activeTab === 'menu' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'menu' ? '#fff' : 'var(--text-muted)',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            🍔 Gestion du Menu
          </button>
        </div>
      </div>

      {/* =========================================================
          TAB: COMMANDES (KDS)
          ========================================================= */}
      {activeTab === 'orders' && (
        <div className="fade-in">
          <div style={{ display: 'flex', gap: '16px', marginBottom: '40px' }}>
            <div className="card" style={{ padding: '12px 24px', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--primary)' }}>{pendingOrders.length}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>En attente</div>
            </div>
            <div className="card" style={{ padding: '12px 24px', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--info)' }}>{preparingOrders.length}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>En préparation</div>
            </div>
          </div>

          {/* New Orders (Pending) - High Priority */}
          {pendingOrders.length > 0 && (
            <div style={{ marginBottom: '48px' }}>
              <h2 className="section-title" style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Flame size={24} /> NOUVELLES COMMANDES ({pendingOrders.length})
              </h2>
              <div className="grid grid-2">
                {pendingOrders.map((order) => (
                  <div key={order.id} className="card" style={{ border: '2px solid var(--primary)', background: 'var(--primary-glow)', transform: 'scale(1.02)' }}>
                    <div className="card-header" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '16px', marginBottom: '16px' }}>
                      <div>
                        <h3 style={{ fontSize: '1.4rem' }}>Commande #{order.id}</h3>
                        <p style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fff', marginTop: '8px' }}>
                          <Clock size={14} color="var(--accent)" /> 
                          Il y a {Math.floor((new Date().getTime() - new Date(order.createdAt).getTime()) / 60000)} min
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--accent)', display: 'block' }}>{order.total} DA</span>
                        <StatusBadge status={order.status as OrderStatus} />
                      </div>
                    </div>

                    <div style={{ padding: '12px', background: 'var(--bg)', borderRadius: '8px', marginBottom: '20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        <User size={14} /> Informations Client:
                      </div>
                      <div style={{ fontWeight: 600 }}>{order.customer?.name}</div>
                      <div style={{ color: 'var(--text-muted)' }}><Phone size={12} style={{ display: 'inline' }}/> {order.customer?.phone}</div>
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                      <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
                        Articles à préparer ({order.items?.reduce((acc, curr) => acc + curr.quantity, 0)})
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {order.items?.map((item) => (
                          <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px' }}>
                            <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>
                              <span style={{ color: 'var(--primary)', marginRight: '8px' }}>{item.quantity}x</span> 
                              {item.product?.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button className="btn btn-primary btn-block" style={{ padding: '16px', fontSize: '1.1rem' }} onClick={() => handleAccept(order.id)}>
                      <CheckCircle size={20} /> Accepter & Lancer la Préparation
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Preparing Orders */}
          <h2 className="section-title">
            <ChefHat size={20} /> En Préparation ({preparingOrders.length})
          </h2>
          {preparingOrders.length === 0 && pendingOrders.length === 0 ? (
            <div className="empty-state">
              <div className="icon">🍵</div>
              <h3>La cuisine est calme</h3>
              <p>Les commandes acceptées apparaîtront ici.</p>
            </div>
          ) : (
            <div className="grid grid-3">
              {preparingOrders.map((order) => (
                <div key={order.id} className="card" style={{ borderLeft: '4px solid var(--info)' }}>
                  <div className="card-header">
                    <div>
                      <h3 style={{ color: 'var(--info)' }}>#{order.id}</h3>
                      <p style={{ fontSize: '0.8rem' }}><Clock size={10} style={{ display: 'inline' }}/> Acceptée il y a {Math.floor((new Date().getTime() - new Date(order.updatedAt || order.createdAt).getTime()) / 60000)} min</p>
                    </div>
                    <StatusBadge status={order.status as OrderStatus} />
                  </div>
                  
                  <ul style={{ margin: '16px 0', paddingLeft: '20px', color: 'var(--text)' }}>
                    {order.items?.map((item) => (
                      <li key={item.id} style={{ marginBottom: '8px' }}>
                        <strong>{item.quantity}x</strong> {item.product?.name}
                      </li>
                    ))}
                  </ul>

                  <button className="btn btn-info btn-block" onClick={() => updateStatus(order.id, 'ready')}>
                    ✅ Marquer "Prêt" (Appeler un Livreur)
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Ready Orders (Waiting for Driver) */}
          {readyOrders.length > 0 && (
            <div style={{ marginTop: '48px', marginBottom: '48px' }}>
              <h2 className="section-title" style={{ color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Package size={24} /> PRÊT - EN ATTENTE DE LIVREUR ({readyOrders.length})
              </h2>
              <div className="grid grid-3">
                 {readyOrders.map(order => (
                   <div key={order.id} className="card" style={{ border: '2px dashed var(--accent)', background: 'var(--bg-card)' }}>
                     <div className="card-header" style={{ marginBottom: '16px' }}>
                       <div>
                         <h3 style={{ fontSize: '1.2rem' }}>Commande #{order.id}</h3>
                         <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>Prête depuis {Math.floor((new Date().getTime() - new Date(order.updatedAt || order.createdAt).getTime()) / 60000)} min</div>
                       </div>
                       <span className="pulse" style={{ background: 'var(--accent)20', color: 'var(--accent)', padding: '4px 12px', fontSize: '0.8rem', borderRadius: '20px', fontWeight: 700 }}>RECHERCHE...</span>
                     </div>
                     <div style={{ padding: '12px', background: 'var(--bg)', borderRadius: '8px' }}>
                       <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}><strong>Client:</strong> {order.customer?.name}</div>
                       <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}><strong>Total:</strong> <span style={{ color: 'var(--accent)', fontWeight: 800 }}>{order.total} DA</span></div>
                     </div>
                   </div>
                 ))}
              </div>
            </div>
          )}

          {/* Expédiées & Livrées (Historique) */}
          <div style={{ marginTop: '48px' }}>
             <h2 className="section-title">Expédiées & Livrées</h2>
             {deliveringOrders.length === 0 && completedOrders.length === 0 ? (
               <p style={{ color: 'var(--text-muted)' }}>Aucun historique pour l'instant.</p>
             ) : (
               <div className="grid grid-2">
                 {[...deliveringOrders, ...completedOrders].map((order) => (
                  <div key={order.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: order.status === 'delivered' ? 0.6 : 1 }}>
                    <div>
                      <strong style={{ fontSize: '1.1rem' }}>#{order.id}</strong> — {order.total} DA
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        {order.status === 'out_for_delivery' ? (
                           <span style={{ color: 'var(--info)' }}><Truck size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-2px' }}/> Livreur en route ({order.driver?.name})</span>
                        ) : (
                           <span style={{ color: 'var(--success)' }}><CheckCircle2 size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-2px' }}/> Livrée avec succès</span>
                        )}
                      </div>
                    </div>
                    <StatusBadge status={order.status as OrderStatus} />
                  </div>
                ))}
               </div>
             )}
          </div>
        </div>
      )}

      {/* =========================================================
          TAB: GESTION DU MENU
          ========================================================= */}
      {activeTab === 'menu' && (
        <div className="fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 className="section-title" style={{ margin: 0 }}>Votre Menu Actuel</h2>
            <button className="btn btn-primary" onClick={() => setShowAddModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Plus size={18} /> Ajouter un produit
            </button>
          </div>

          <div className="grid grid-3">
            {products.map((product) => (
              <div key={product.id} className="card" style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{ height: '100px', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>
                  {product.image}
                </div>
                <div style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                    <h3 style={{ fontSize: '1.2rem', margin: 0 }}>{product.name}</h3>
                    <span style={{ fontWeight: 800, color: 'var(--accent)' }}>{product.price} DA</span>
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', background: 'var(--bg)', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--border)' }}>
                    {product.category}
                  </span>
                  
                  <div style={{ display: 'flex', gap: '8px', marginTop: '24px' }}>
                    <button 
                      className="btn btn-secondary btn-block" 
                      style={{ color: 'var(--error)', borderColor: 'rgba(255, 71, 87, 0.2)' }}
                      onClick={() => deleteProduct(product.id)}
                    >
                      <Trash2 size={16} /> Supprimer
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {products.length === 0 && (
              <p style={{ gridColumn: '1 / -1', color: 'var(--text-muted)', textAlign: 'center', padding: '40px 0' }}>Aucun produit dans le menu pour le moment.</p>
            )}
          </div>

          {/* Modal Overlay for Add Product */}
          {showAddModal && (
            <div style={{
              position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
              background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)',
              zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <div className="card fade-in" style={{ width: '100%', maxWidth: '500px', border: '1px solid var(--primary-glow)' }}>
                <h2 style={{ marginBottom: '24px' }}>Ajouter au Menu</h2>
                <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label>Nom du produit</label>
                    <input type="text" className="input" placeholder="ex: Pizza Margherita" required value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
                  </div>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ flex: 1 }}>
                      <label>Prix (DA)</label>
                      <input type="number" className="input" placeholder="ex: 800" required value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label>Catégorie</label>
                      <input type="text" className="input" placeholder="ex: Plats" value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} />
                    </div>
                  </div>
                  <div>
                    <label>Emoji (Image)</label>
                    <input type="text" className="input" placeholder="ex: 🍕" value={newProduct.image} onChange={e => setNewProduct({...newProduct, image: e.target.value})} />
                  </div>
                  <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                    <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowAddModal(false)}>Annuler</button>
                    <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Enregistrer</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
