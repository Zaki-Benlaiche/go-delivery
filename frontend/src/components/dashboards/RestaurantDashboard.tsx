'use client';

import React, { useEffect, useState } from 'react';
import { useOrderStore } from '@/store/orderStore';
import { useMenuStore } from '@/store/menuStore';
import StatusBadge from '@/components/StatusBadge';
import type { OrderStatus, Product } from '@/types';
import { ChefHat, Clock, CheckCircle, Flame, User, Phone, CheckCircle2, Truck, Package, Plus, Trash2, Settings, Coffee, Upload, Utensils, Pencil } from 'lucide-react';
import { useNotificationStore } from '@/store/notificationStore';

export default function RestaurantDashboard() {
  // Atomic selectors — keeps a price edit in the menu tab from triggering a
  // re-render of the orders tab, and vice versa.
  const orders = useOrderStore((s) => s.orders);
  const fetchOrders = useOrderStore((s) => s.fetchOrders);
  const updateStatus = useOrderStore((s) => s.updateStatus);
  const products = useMenuStore((s) => s.products);
  const restaurant = useMenuStore((s) => s.restaurant);
  const fetchMenu = useMenuStore((s) => s.fetchMenu);
  const updateRestaurant = useMenuStore((s) => s.updateRestaurant);
  const toggleOpenStatus = useMenuStore((s) => s.toggleOpenStatus);
  const addProduct = useMenuStore((s) => s.addProduct);
  const updateProduct = useMenuStore((s) => s.updateProduct);
  const deleteProduct = useMenuStore((s) => s.deleteProduct);
  const addNotification = useNotificationStore((s) => s.addNotification);

  const [activeTab, setActiveTab] = useState<'orders' | 'menu' | 'settings'>('orders');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', price: '', category: 'Plats', image: '🍽️' });
  // Editing reuses the same modal as Add — when set, the modal switches to update mode.
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editDraft, setEditDraft] = useState({ name: '', price: '', category: '', image: '' });
  // Controlled state for Settings image field — avoids document.getElementById anti-pattern
  const [settingsImage, setSettingsImage] = useState('');

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

  // Sync settingsImage when restaurant data loads
  useEffect(() => {
    if (restaurant) setSettingsImage(restaurant.image || '');
  }, [restaurant]);

  const pendingOrders = orders.filter((o) => o.status === 'pending');
  const preparingOrders = orders.filter((o) => ['accepted', 'preparing'].includes(o.status));
  const readyOrders = orders.filter((o) => o.status === 'ready');
  const deliveringOrders = orders.filter((o) => o.status === 'out_for_delivery');
  const completedOrders = orders.filter((o) => o.status === 'delivered');

  const handleAccept = async (orderId: number) => {
    // Go directly to 'preparing' — skips the intermediate 'accepted' state
    // and eliminates the previous setTimeout race condition
    await updateStatus(orderId, 'preparing');
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

  const beginEdit = (product: Product) => {
    setEditingProduct(product);
    setEditDraft({
      name: product.name,
      price: String(product.price),
      category: product.category || '',
      image: product.image || '',
    });
  };

  const handleEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !editDraft.name || !editDraft.price) return;

    await updateProduct(editingProduct.id, {
      name: editDraft.name,
      price: Number(editDraft.price),
      category: editDraft.category,
      image: editDraft.image,
    });

    setEditingProduct(null);
    addNotification({
      type: 'info',
      title: 'Produit mis à jour',
      message: `${editDraft.name} — ${editDraft.price} DA`,
      icon: '✅',
      color: '#2ed573',
    });
  };

  const tabs = [
    { key: 'orders' as const, label: `Commandes (${pendingOrders.length + preparingOrders.length})`, icon: <Package size={16} /> },
    { key: 'menu' as const, label: 'Menu', icon: <Utensils size={16} /> },
    { key: 'settings' as const, label: 'Paramètres', icon: <Settings size={16} /> },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '28px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ChefHat size={26} color="var(--primary)" /> Portail Restaurant
          </h1>
          <p className="page-subtitle">Gérez vos commandes et votre menu en temps réel</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          {/* Open / Closed Toggle */}
          <button
            onClick={toggleOpenStatus}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 20px', borderRadius: '50px', border: 'none',
              fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer',
              transition: 'all 0.2s',
              background: restaurant?.isOpen ? 'linear-gradient(135deg,#2ed573,#17a348)' : 'linear-gradient(135deg,#ff4757,#c0392b)',
              color: 'white',
              boxShadow: restaurant?.isOpen ? '0 4px 16px rgba(46,213,115,0.4)' : '0 4px 16px rgba(255,71,87,0.4)',
            }}
          >
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'rgba(255,255,255,0.9)', display: 'inline-block', boxShadow: '0 0 6px rgba(255,255,255,0.8)' }} />
            {restaurant?.isOpen ? 'Ouvert' : 'Fermé'}
          </button>
          <div className="tab-bar" style={{ background: 'var(--bg-elevated)', padding: '5px', borderRadius: '12px' }}>
          {tabs.map(t => (
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

      {/* ========= TAB: COMMANDES ========= */}
      {activeTab === 'orders' && (
        <div className="fade-in">
          <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', flexWrap: 'wrap' }}>
            <div className="stat-card" style={{ flex: '1 1 120px' }}>
              <div className="stat-value" style={{ color: 'var(--primary)' }}>{pendingOrders.length}</div>
              <div className="stat-label">En attente</div>
            </div>
            <div className="stat-card" style={{ flex: '1 1 120px' }}>
              <div className="stat-value" style={{ color: 'var(--info)' }}>{preparingOrders.length}</div>
              <div className="stat-label">En préparation</div>
            </div>
          </div>

          {/* Pending Orders */}
          {pendingOrders.length > 0 && (
            <div style={{ marginBottom: '40px' }}>
              <h2 className="section-title" style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Flame size={20} /> NOUVELLES COMMANDES ({pendingOrders.length})
              </h2>
              <div className="grid grid-2">
                {pendingOrders.map((order) => (
                  <div key={order.id} className="card" style={{ border: '2px solid var(--primary)', background: 'var(--primary-glow)' }}>
                    <div className="card-header" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '14px', marginBottom: '14px' }}>
                      <div>
                        <h3 style={{ fontSize: 'clamp(1rem, 3vw, 1.3rem)' }}>Commande #{order.id}</h3>
                        <p style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fff', marginTop: '6px', fontSize: '0.82rem' }}>
                          <Clock size={13} color="var(--accent)" />
                          Il y a {Math.floor((new Date().getTime() - new Date(order.createdAt).getTime()) / 60000)} min
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: 'clamp(1.1rem, 3vw, 1.4rem)', fontWeight: 900, color: 'var(--accent)', display: 'block' }}>{order.total} DA</span>
                        <StatusBadge status={order.status as OrderStatus} />
                      </div>
                    </div>

                    <div style={{ padding: '10px', background: 'var(--bg)', borderRadius: '8px', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                        <User size={13} /> Client:
                      </div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{order.customer?.name}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '4px' }}><Phone size={11} /> {order.customer?.phone}</div>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>
                        Articles ({order.items?.reduce((acc, curr) => acc + curr.quantity, 0)})
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {order.items?.map((item) => (
                          <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                              <span style={{ color: 'var(--primary)', marginRight: '6px' }}>{item.quantity}x</span>
                              {item.product?.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button className="btn btn-primary btn-block" style={{ padding: '14px', fontSize: 'clamp(0.85rem, 2.5vw, 1rem)' }} onClick={() => handleAccept(order.id)}>
                      <CheckCircle size={18} /> Accepter & Préparer
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Preparing */}
          <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ChefHat size={18} /> En Préparation ({preparingOrders.length})
          </h2>
          {preparingOrders.length === 0 && pendingOrders.length === 0 ? (
            <div className="empty-state">
              <Coffee size={36} style={{ marginBottom: '12px', opacity: 0.5 }} />
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
                      <p style={{ fontSize: '0.78rem' }}><Clock size={10} style={{ display: 'inline', verticalAlign: '-1px' }} /> Acceptée il y a {Math.floor((new Date().getTime() - new Date(order.updatedAt || order.createdAt).getTime()) / 60000)} min</p>
                    </div>
                    <StatusBadge status={order.status as OrderStatus} />
                  </div>

                  <ul style={{ margin: '14px 0', paddingLeft: '18px', color: 'var(--text)' }}>
                    {order.items?.map((item) => (
                      <li key={item.id} style={{ marginBottom: '6px', fontSize: '0.9rem' }}>
                        <strong>{item.quantity}x</strong> {item.product?.name}
                      </li>
                    ))}
                  </ul>

                  <button className="btn btn-info btn-block" onClick={() => updateStatus(order.id, 'ready')}>
                    <CheckCircle2 size={16} /> Prêt (Appeler Livreur)
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Ready Orders */}
          {readyOrders.length > 0 && (
            <div style={{ marginTop: '40px', marginBottom: '40px' }}>
              <h2 className="section-title" style={{ color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Package size={20} /> EN ATTENTE DE LIVREUR ({readyOrders.length})
              </h2>
              <div className="grid grid-3">
                {readyOrders.map(order => (
                  <div key={order.id} className="card" style={{ border: '2px dashed var(--accent)' }}>
                    <div className="card-header" style={{ marginBottom: '14px' }}>
                      <div>
                        <h3 style={{ fontSize: 'clamp(0.95rem, 2.5vw, 1.15rem)' }}>Commande #{order.id}</h3>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>Prête depuis {Math.floor((new Date().getTime() - new Date(order.updatedAt || order.createdAt).getTime()) / 60000)} min</div>
                      </div>
                      <span className="pulse-icon" style={{ background: 'rgba(255,192,72,0.15)', color: 'var(--accent)', padding: '4px 10px', fontSize: '0.75rem', borderRadius: '20px', fontWeight: 700 }}>RECHERCHE...</span>
                    </div>
                    <div style={{ padding: '10px', background: 'var(--bg)', borderRadius: '8px' }}>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '4px' }}><strong>Client:</strong> {order.customer?.name}</div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}><strong>Total:</strong> <span style={{ color: 'var(--accent)', fontWeight: 800 }}>{order.total} DA</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Shipped & Delivered */}
          <div style={{ marginTop: '40px' }}>
            <h2 className="section-title">Expédiées & Livrées</h2>
            {deliveringOrders.length === 0 && completedOrders.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>Aucun historique pour l&apos;instant.</p>
            ) : (
              <div className="grid grid-2">
                {[...deliveringOrders, ...completedOrders].map((order) => (
                  <div key={order.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: order.status === 'delivered' ? 0.6 : 1, flexWrap: 'wrap', gap: '10px' }}>
                    <div style={{ minWidth: 0 }}>
                      <strong style={{ fontSize: 'clamp(0.9rem, 2.5vw, 1.05rem)' }}>#{order.id}</strong> — {order.total} DA
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        {order.status === 'out_for_delivery' ? (
                          <span style={{ color: 'var(--info)', display: 'flex', alignItems: 'center', gap: '4px' }}><Truck size={13} /> Livreur: {order.driver?.name}</span>
                        ) : (
                          <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCircle2 size={13} /> Livrée</span>
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

      {/* ========= TAB: MENU ========= */}
      {activeTab === 'menu' && (
        <div className="fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '10px' }}>
            <h2 className="section-title" style={{ margin: 0 }}>Votre Menu Actuel</h2>
            <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
              <Plus size={16} /> Ajouter
            </button>
          </div>

          <div className="grid grid-3">
            {products.map((product) => (
              <div key={product.id} className="card" style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{ height: '130px', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3.5rem', overflow: 'hidden' }}>
                  {product.image?.startsWith('http') || product.image?.startsWith('data:') ? (
                    <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span>{product.image}</span>
                  )}
                </div>
                <div style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px', gap: '8px' }}>
                    <h3 style={{ fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)', margin: 0, wordBreak: 'break-word' }}>{product.name}</h3>
                    <span style={{ fontWeight: 800, color: 'var(--accent)', whiteSpace: 'nowrap' }}>{product.price} DA</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'var(--bg)', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--border)' }}>
                    {product.category}
                  </span>
                  <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ flex: 1, color: 'var(--primary)' }}
                      onClick={() => beginEdit(product)}
                    >
                      <Pencil size={14} /> Modifier
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ flex: 1, color: 'var(--danger)' }}
                      onClick={() => deleteProduct(product.id)}
                    >
                      <Trash2 size={14} /> Supprimer
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {products.length === 0 && (
              <p style={{ gridColumn: '1 / -1', color: 'var(--text-muted)', textAlign: 'center', padding: '40px 0' }}>Aucun produit dans le menu.</p>
            )}
          </div>

          {/* Edit Product Modal */}
          {editingProduct && (
            <div style={{
              position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
              background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)',
              zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '16px'
            }}>
              <div className="card fade-in" style={{ width: '100%', maxWidth: '480px', border: '1px solid var(--primary-glow)' }}>
                <h2 style={{ marginBottom: '20px', fontSize: 'clamp(1rem, 3vw, 1.3rem)' }}>Modifier le produit</h2>
                <form onSubmit={handleEditProduct} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Nom du produit</label>
                    <input type="text" required value={editDraft.name} onChange={e => setEditDraft({ ...editDraft, name: e.target.value })} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>Prix (DA)</label>
                      <input type="number" required min={0} value={editDraft.price} onChange={e => setEditDraft({ ...editDraft, price: e.target.value })} />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>Catégorie</label>
                      <input type="text" value={editDraft.category} onChange={e => setEditDraft({ ...editDraft, category: e.target.value })} />
                    </div>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Image (Fichier ou URL)</label>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input type="text" placeholder="URL ou Emoji" value={editDraft.image} onChange={e => setEditDraft({ ...editDraft, image: e.target.value })} style={{ flex: 1 }} />
                      <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', flexShrink: 0 }}>
                        <Upload size={14} /> <input type="file" hidden accept="image/*" onChange={(e) => handleFileUpload(e, (b) => setEditDraft({ ...editDraft, image: b }))} />
                      </label>
                    </div>
                    {editDraft.image && (
                      <div style={{ marginTop: '8px', height: '70px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
                        {editDraft.image.startsWith('http') || editDraft.image.startsWith('data:') ? (
                          <img src={editDraft.image} alt="Preview" style={{ height: '100%', width: '100%', objectFit: 'cover' }} />
                        ) : (
                          <span style={{ fontSize: '1.8rem' }}>{editDraft.image}</span>
                        )}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setEditingProduct(null)}>Annuler</button>
                    <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Enregistrer</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Add Product Modal */}
          {showAddModal && (
            <div style={{
              position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
              background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)',
              zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '16px'
            }}>
              <div className="card fade-in" style={{ width: '100%', maxWidth: '480px', border: '1px solid var(--primary-glow)' }}>
                <h2 style={{ marginBottom: '20px', fontSize: 'clamp(1rem, 3vw, 1.3rem)' }}>Ajouter au Menu</h2>
                <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Nom du produit</label>
                    <input type="text" placeholder="ex: Pizza Margherita" required value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>Prix (DA)</label>
                      <input type="number" placeholder="ex: 800" required value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>Catégorie</label>
                      <input type="text" placeholder="ex: Plats" value={newProduct.category} onChange={e => setNewProduct({ ...newProduct, category: e.target.value })} />
                    </div>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Image (Fichier ou URL)</label>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input type="text" placeholder="URL ou Emoji" value={newProduct.image} onChange={e => setNewProduct({ ...newProduct, image: e.target.value })} style={{ flex: 1 }} />
                      <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', flexShrink: 0 }}>
                        <Upload size={14} /> <input type="file" hidden accept="image/*" onChange={(e) => handleFileUpload(e, (b) => setNewProduct({ ...newProduct, image: b }))} />
                      </label>
                    </div>
                    {newProduct.image && (
                      <div style={{ marginTop: '8px', height: '70px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
                        {newProduct.image.startsWith('http') || newProduct.image.startsWith('data:') ? (
                          <img src={newProduct.image} alt="Preview" style={{ height: '100%', width: '100%', objectFit: 'cover' }} />
                        ) : (
                          <span style={{ fontSize: '1.8rem' }}>{newProduct.image}</span>
                        )}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowAddModal(false)}>Annuler</button>
                    <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Enregistrer</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========= TAB: SETTINGS ========= */}
      {activeTab === 'settings' && restaurant && (
        <div className="fade-in">
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div className="card" style={{
              padding: '0',
              overflow: 'hidden',
              border: 'none',
              boxShadow: 'var(--shadow-lg)',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
              backdropFilter: 'blur(20px)',
              borderTop: '1px solid rgba(255,255,255,0.1)'
            }}>
              {/* Hero */}
              <div style={{ height: 'clamp(120px, 20vw, 180px)', position: 'relative', background: 'var(--primary-glow)' }}>
                {restaurant.image && (restaurant.image.startsWith('http') || restaurant.image.startsWith('data:')) ? (
                  <img src={restaurant.image} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.3 }} />
                ) : null}
                <div style={{ position: 'absolute', bottom: '-35px', left: 'clamp(16px, 4vw, 40px)', display: 'flex', alignItems: 'flex-end', gap: '16px' }}>
                  <div style={{
                    width: 'clamp(80px, 15vw, 110px)',
                    height: 'clamp(80px, 15vw, 110px)',
                    borderRadius: '20px',
                    background: 'var(--bg-card)',
                    border: '4px solid var(--bg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 'clamp(2.5rem, 6vw, 3.5rem)',
                    overflow: 'hidden',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                    flexShrink: 0,
                  }}>
                    {restaurant.image && (restaurant.image.startsWith('http') || restaurant.image.startsWith('data:')) ? (
                      <img src={restaurant.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span>{restaurant.image || '🏪'}</span>
                    )}
                  </div>
                  <div style={{ marginBottom: 'clamp(30px, 6vw, 45px)', minWidth: 0 }}>
                    <h2 style={{ margin: 0, fontSize: 'clamp(1.1rem, 3vw, 1.6rem)', color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{restaurant.name}</h2>
                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 'clamp(0.75rem, 2vw, 0.9rem)' }}>{restaurant.category || 'Restaurant Partner'}</p>
                  </div>
                </div>
              </div>

              <form onSubmit={async (e) => {
                e.preventDefault();
                const form = e.currentTarget;
                await updateRestaurant({
                  name: (form.elements.namedItem('name') as HTMLInputElement).value,
                  description: (form.elements.namedItem('description') as HTMLTextAreaElement).value,
                  address: (form.elements.namedItem('address') as HTMLInputElement).value,
                  image: settingsImage,
                });
                addNotification({
                  type: 'info',
                  title: 'Profil mis à jour',
                  message: 'Les informations du restaurant ont été enregistrées.',
                  icon: '✅',
                  color: '#2ed573',
                });
              }} style={{ padding: 'clamp(60px, 10vw, 80px) clamp(16px, 4vw, 40px) clamp(24px, 4vw, 40px)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Logo / Photo</label>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '8px', flexWrap: 'wrap' }}>
                    <input
                      type="text"
                      className="input"
                      value={settingsImage}
                      onChange={(e) => setSettingsImage(e.target.value)}
                      placeholder="Lien URL ou Base64..."
                      style={{ flex: 1, minWidth: '160px' }}
                    />
                    <label className="btn btn-secondary" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                      <Upload size={16} /> Téléverser
                      <input type="file" hidden accept="image/*" onChange={(e) => handleFileUpload(e, setSettingsImage)} />
                    </label>
                  </div>
                </div>

                <div>
                  <label style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Nom</label>
                  <input name="name" type="text" className="input" defaultValue={restaurant.name} required style={{ marginTop: '8px' }} />
                </div>

                <div>
                  <label style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Adresse</label>
                  <input name="address" type="text" className="input" defaultValue={restaurant.address} style={{ marginTop: '8px' }} />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Description</label>
                  <textarea name="description" className="input" defaultValue={restaurant.description} rows={3} style={{ marginTop: '8px' }}></textarea>
                </div>

                <div style={{ gridColumn: '1 / -1', marginTop: '12px' }}>
                  <button type="submit" className="btn btn-primary btn-block" style={{ padding: '14px', fontSize: 'clamp(0.9rem, 2.5vw, 1.05rem)', fontWeight: 800 }}>
                    Mettre à jour
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
