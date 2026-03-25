'use client';

import React, { useEffect, useState } from 'react';
import { useOrderStore } from '@/store/orderStore';
import { useMenuStore } from '@/store/menuStore';
import StatusBadge from '@/components/StatusBadge';
import type { OrderStatus, Product } from '@/types';
import { ChefHat, Clock, CheckCircle, Flame, User, Phone, CheckCircle2, Truck, Package, Plus, Edit, Trash2 } from 'lucide-react';

export default function RestaurantDashboard() {
  const { orders, fetchOrders, updateStatus } = useOrderStore();
  const { products, restaurant, fetchMenu, updateRestaurant, addProduct, deleteProduct } = useMenuStore();
  
  const [activeTab, setActiveTab] = useState<'orders' | 'menu' | 'settings'>('orders');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', price: '', category: 'Plats', image: '🍽️' });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, callback: (base64: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        callback(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="page-title">👨‍🍳 Portail Restaurant</h1>
          <p className="page-subtitle">Gérez vos commandes et votre menu en temps réel</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', background: 'var(--bg-elevated)', padding: '6px', borderRadius: '12px', overflowX: 'auto', maxWidth: '100%' }}>
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
          <button 
            onClick={() => setActiveTab('settings')}
            style={{ 
              padding: '10px 24px', 
              borderRadius: '8px', 
              border: 'none', 
              background: activeTab === 'settings' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'settings' ? '#fff' : 'var(--text-muted)',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            ⚙️ Paramètres
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
                <div style={{ height: '150px', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem', overflow: 'hidden' }}>
                  {product.image?.startsWith('http') ? (
                    <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span>{product.image}</span>
                  )}
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
                    <label>Image du produit (Fichier ou URL)</label>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input type="text" className="input" placeholder="URL ou Emoji" value={newProduct.image} onChange={e => setNewProduct({...newProduct, image: e.target.value})} style={{ flex: 1 }} />
                      <label className="btn btn-secondary" style={{ cursor: 'pointer', padding: '10px' }}>
                        📁 <input type="file" hidden accept="image/*" onChange={(e) => handleFileUpload(e, (b) => setNewProduct({...newProduct, image: b}))} />
                      </label>
                    </div>
                    {newProduct.image && (
                      <div style={{ marginTop: '10px', height: '80px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
                        {newProduct.image.startsWith('http') || newProduct.image.startsWith('data:') ? (
                           <img src={newProduct.image} alt="Preview" style={{ height: '100%', width: '100%', objectFit: 'cover' }} />
                        ) : (
                           <span style={{ fontSize: '2rem' }}>{newProduct.image}</span>
                        )}
                      </div>
                    )}
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

      {/* =========================================================
          TAB: PARAMÈTRES (SETTINGS)
          ========================================================= */}
      {activeTab === 'settings' && restaurant && (
        <div className="fade-in">
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
             <div className="card" style={{ 
               padding: '0', 
               overflow: 'hidden', 
               border: 'none', 
               boxShadow: '0 30px 60px rgba(0,0,0,0.4)',
               background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
               backdropFilter: 'blur(20px)',
               borderTop: '1px solid rgba(255,255,255,0.1)'
             }}>
               {/* Hero Section in Settings */}
               <div style={{ height: '180px', position: 'relative', background: 'var(--primary-glow)' }}>
                 {restaurant.image && (restaurant.image.startsWith('http') || restaurant.image.startsWith('data:')) ? (
                   <img src={restaurant.image} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.3 }} />
                 ) : null}
                 <div style={{ position: 'absolute', bottom: '-40px', left: '40px', display: 'flex', alignItems: 'flex-end', gap: '20px' }}>
                    <div style={{ 
                      width: '120px', 
                      height: '120px', 
                      borderRadius: '24px', 
                      background: 'var(--bg-card)', 
                      border: '4px solid var(--bg)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      fontSize: '4rem',
                      overflow: 'hidden',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
                    }}>
                      {restaurant.image && (restaurant.image.startsWith('http') || restaurant.image.startsWith('data:')) ? (
                        <img src={restaurant.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span>{restaurant.image || '🏪'}</span>
                      )}
                    </div>
                    <div style={{ marginBottom: '45px' }}>
                       <h2 style={{ margin: 0, fontSize: '1.8rem', color: 'white' }}>{restaurant.name}</h2>
                       <p style={{ margin: 0, color: 'var(--text-muted)' }}>{restaurant.category || 'Restaurant Partner'}</p>
                    </div>
                 </div>
               </div>

               <form onSubmit={async (e) => {
                 e.preventDefault();
                 const formData = new FormData(e.currentTarget);
                 // We collect the image from state because file inputs are handled separately
                 await updateRestaurant({
                   name: (e.currentTarget.elements.namedItem('name') as HTMLInputElement).value,
                   description: (e.currentTarget.elements.namedItem('description') as HTMLTextAreaElement).value,
                   address: (e.currentTarget.elements.namedItem('address') as HTMLInputElement).value,
                   image: (e.currentTarget.elements.namedItem('image_data') as HTMLInputElement).value,
                 });
                 alert('✅ Profil mis à jour avec succès !');
               }} style={{ padding: '80px 40px 40px 40px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                 
                 <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Logo / Photo de Couverture</label>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                       <input name="image_data" id="image_data" type="text" className="input" defaultValue={restaurant.image} placeholder="Lien direct ou Base64..." style={{ flex: 1 }} />
                       <label className="btn btn-secondary" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                         <Plus size={18} /> Téléverser 
                         <input type="file" hidden accept="image/*" onChange={(e) => handleFileUpload(e, (b) => {
                           const input = document.getElementById('image_data') as HTMLInputElement;
                           if (input) input.value = b;
                         })} />
                       </label>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '6px' }}>Sélectionnez une photo de votre établissement ou de votre logo.</p>
                 </div>

                 <div>
                   <label style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Nom de l'établissement</label>
                   <input name="name" type="text" className="input" defaultValue={restaurant.name} required style={{ marginTop: '8px' }} />
                 </div>

                 <div>
                   <label style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Adresse physique</label>
                   <input name="address" type="text" className="input" defaultValue={restaurant.address} style={{ marginTop: '8px' }} />
                 </div>

                 <div style={{ gridColumn: '1 / -1' }}>
                   <label style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Description & Slogan</label>
                   <textarea name="description" className="input" defaultValue={restaurant.description} rows={3} style={{ marginTop: '8px' }}></textarea>
                 </div>

                 <div style={{ gridColumn: '1 / -1', marginTop: '20px' }}>
                    <button type="submit" className="btn btn-primary btn-block" style={{ padding: '16px', fontSize: '1.1rem', fontWeight: 800 }}>
                      Mettre à jour mon Restaurant
                    </button>
                 </div>
               </form>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
