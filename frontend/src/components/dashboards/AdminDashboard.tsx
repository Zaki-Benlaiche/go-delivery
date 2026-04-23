'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import {
  Users,
  Store,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  Search,
  ArrowRight,
  ClipboardList,
  Phone,
  CheckCircle,
  XCircle
} from 'lucide-react';
import StatusBadge from '../StatusBadge';

interface Stats {
  users: number;
  restaurants: number;
  orders: number;
  revenue: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'restaurants' | 'orders' | 'reservations'>('users');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, usersRes, restRes, ordersRes, reservRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/users'),
          api.get('/admin/restaurants'),
          api.get('/admin/orders'),
          api.get('/reservations/all'),
        ]);

        setStats(statsRes.data);
        setUsers(usersRes.data);
        setRestaurants(restRes.data);
        setOrders(ordersRes.data);
        setReservations(reservRes.data);
      } catch (err) {
        console.error('Error fetching admin data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleRoleChange = async (userId: number, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'client' : 'admin';
    const confirmMessage = newRole === 'admin'
      ? 'Voulez-vous vraiment donner les droits administrateur à cet utilisateur ?'
      : 'Voulez-vous vraiment retirer les droits administrateur de cet utilisateur ?';

    if (!window.confirm(confirmMessage)) return;

    try {
      const token = localStorage.getItem('token');
      await api.put(`/admin/users/${userId}/role`,
        { role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      alert(`Le rôle a été mis à jour avec succès : ${newRole}`);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erreur lors de la mise à jour du rôle');
    }
  };

  const handleReservationStatus = async (id: number, status: string) => {
    try {
      await api.put(`/reservations/${id}/status`, { status });
      setReservations(reservations.map(r => r.id === id ? { ...r, status } : r));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erreur');
    }
  };

  if (loading) return <div className="empty-state">Chargement de la console d&apos;administration...</div>;

  const statCards = [
    { icon: <Users size={22} />, value: stats?.users, label: 'Utilisateurs', color: '#1e90ff', glow: 'var(--info-glow)', badge: <TrendingUp size={16} color="var(--success)" /> },
    { icon: <Store size={22} />, value: stats?.restaurants, label: 'Restaurants', color: '#ffc048', glow: 'rgba(255,192,72,0.1)', badge: <ShieldCheck size={16} color="var(--info)" /> },
    { icon: <DollarSign size={22} />, value: `${stats?.revenue.toLocaleString()} DZD`, label: "Chiffre d'Affaires", color: '#2ed573', glow: 'var(--success-glow)', badge: <ArrowRight size={16} color="var(--text-muted)" /> },
  ];

  const tabs = [
    { key: 'users' as const, label: 'Utilisateurs', icon: <Users size={16} /> },
    { key: 'restaurants' as const, label: 'Restaurants', icon: <Store size={16} /> },
    { key: 'orders' as const, label: 'Commandes', icon: <ShoppingBag size={16} /> },
    { key: 'reservations' as const, label: 'Réservations', icon: <ClipboardList size={16} /> },
  ];

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '28px' }}>
        <h1 className="page-title">Console d&apos;Administration</h1>
        <p className="page-subtitle">Gérez les utilisateurs, les restaurants et surveillez les performances.</p>
      </div>

      {/* STATS GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '14px', marginBottom: '32px' }}>
        {statCards.map((s, i) => (
          <div key={i} className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div className="icon-box icon-box-md" style={{ background: s.glow, color: s.color }}>
                {s.icon}
              </div>
              {s.badge}
            </div>
            <div className="stat-value" style={{ color: s.color, textAlign: 'left' }}>{s.value}</div>
            <div className="stat-label" style={{ textAlign: 'left' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* TABS */}
      <div className="tab-bar" style={{ marginBottom: '20px', background: 'var(--bg-elevated)', padding: '5px', borderRadius: '12px' }}>
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

      {/* CONTENT TABLE */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <h3 style={{ textTransform: 'capitalize', fontSize: 'clamp(0.9rem, 2.5vw, 1.1rem)' }}>Liste des {activeTab === 'orders' ? 'commandes' : activeTab === 'reservations' ? 'réservations' : activeTab}</h3>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Rechercher..."
              style={{ padding: '7px 10px 7px 34px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-elevated)', color: 'var(--text)', fontSize: '0.82rem', width: 'clamp(120px, 30vw, 200px)' }}
            />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '500px' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '12px 16px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>ID</th>
                {activeTab === 'users' && (
                  <>
                    <th style={{ padding: '12px 16px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Nom</th>
                    <th style={{ padding: '12px 16px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Email</th>
                    <th style={{ padding: '12px 16px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Rôle</th>
                  </>
                )}
                {activeTab === 'restaurants' && (
                  <>
                    <th style={{ padding: '12px 16px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Nom</th>
                    <th style={{ padding: '12px 16px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Propriétaire</th>
                    <th style={{ padding: '12px 16px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Adresse</th>
                  </>
                )}
                {activeTab === 'orders' && (
                  <>
                    <th style={{ padding: '12px 16px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Client</th>
                    <th style={{ padding: '12px 16px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Restaurant</th>
                    <th style={{ padding: '12px 16px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total</th>
                    <th style={{ padding: '12px 16px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Statut</th>
                  </>
                )}
                {activeTab === 'reservations' && (
                  <>
                    <th style={{ padding: '12px 16px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Client</th>
                    <th style={{ padding: '12px 16px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Lieu</th>
                    <th style={{ padding: '12px 16px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>N° File</th>
                    <th style={{ padding: '12px 16px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Statut</th>
                  </>
                )}
                <th style={{ padding: '12px 16px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {activeTab === 'users' && users.map(user => (
                <tr key={user.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px 16px', fontSize: '0.85rem' }}>#{user.id}</td>
                  <td style={{ padding: '12px 16px', fontSize: '0.85rem', fontWeight: 600 }}>{user.name}</td>
                  <td style={{ padding: '12px 16px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{user.email}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '0.68rem', background: user.role === 'admin' ? 'var(--violet-glow)' : 'var(--bg-elevated)', color: user.role === 'admin' ? 'var(--violet)' : 'var(--text)', fontWeight: 700, textTransform: 'uppercase' }}>
                      {user.role}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <button
                      className={`btn btn-sm ${user.role === 'admin' ? 'btn-secondary' : 'btn-primary'}`}
                      onClick={() => handleRoleChange(user.id, user.role)}
                    >
                      {user.role === 'admin' ? 'Retirer' : 'Admin'}
                    </button>
                  </td>
                </tr>
              ))}
              {activeTab === 'restaurants' && restaurants.map(rest => (
                <tr key={rest.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px 16px', fontSize: '0.85rem' }}>#{rest.id}</td>
                  <td style={{ padding: '12px 16px', fontSize: '0.85rem', fontWeight: 600 }}>{rest.name}</td>
                  <td style={{ padding: '12px 16px', fontSize: '0.85rem' }}>{rest.owner?.name}</td>
                  <td style={{ padding: '12px 16px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{rest.address}</td>
                  <td style={{ padding: '12px 16px' }}><button className="btn btn-sm btn-secondary">Voir</button></td>
                </tr>
              ))}
              {activeTab === 'orders' && orders.map(order => (
                <tr key={order.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px 16px', fontSize: '0.85rem' }}>#{order.id}</td>
                  <td style={{ padding: '12px 16px', fontSize: '0.85rem', fontWeight: 600 }}>{order.customer?.name}</td>
                  <td style={{ padding: '12px 16px', fontSize: '0.85rem' }}>{order.restaurant?.name}</td>
                  <td style={{ padding: '12px 16px', fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent)' }}>{order.total} DZD</td>
                  <td style={{ padding: '12px 16px' }}><StatusBadge status={order.status} /></td>
                  <td style={{ padding: '12px 16px' }}><button className="btn btn-sm btn-secondary">Détails</button></td>
                </tr>
              ))}
              {activeTab === 'reservations' && reservations.map(res => (
                <tr key={res.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px 16px', fontSize: '0.85rem' }}>#{res.id}</td>
                  <td style={{ padding: '12px 16px', fontSize: '0.85rem', fontWeight: 600 }}>{res.user?.name}</td>
                  <td style={{ padding: '12px 16px', fontSize: '0.85rem' }}>{res.place?.icon} {res.place?.name}</td>
                  <td style={{ padding: '12px 16px', fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)' }}>#{res.queueNumber}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      padding: '4px 10px', borderRadius: '20px', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase',
                      background: res.status === 'waiting' ? 'rgba(243,156,18,0.15)' : res.status === 'called' ? 'rgba(46,213,115,0.15)' : res.status === 'done' ? 'rgba(46,213,115,0.3)' : 'rgba(231,76,60,0.15)',
                      color: res.status === 'waiting' ? '#f39c12' : res.status === 'called' ? '#2ed573' : res.status === 'done' ? '#27ae60' : '#e74c3c'
                    }}>{res.status === 'waiting' ? 'En attente' : res.status === 'called' ? 'Appelé' : res.status === 'done' ? 'Terminé' : 'Annulé'}</span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {res.status === 'waiting' && (
                        <button onClick={() => handleReservationStatus(res.id, 'called')} className="btn btn-sm" style={{ background: 'var(--success-glow)', color: '#2ed573', border: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Phone size={11} /> Appeler
                        </button>
                      )}
                      {res.status === 'called' && (
                        <button onClick={() => handleReservationStatus(res.id, 'done')} className="btn btn-sm" style={{ background: 'rgba(39,174,96,0.15)', color: '#27ae60', border: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle size={11} /> Terminé
                        </button>
                      )}
                      {(res.status === 'waiting' || res.status === 'called') && (
                        <button onClick={() => handleReservationStatus(res.id, 'cancelled')} className="btn btn-sm" style={{ background: 'var(--danger-glow)', color: '#e74c3c', border: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <XCircle size={11} /> Annuler
                        </button>
                      )}
                      {(res.status === 'done' || res.status === 'cancelled') && (
                        <span style={{ fontSize: '0.8rem', opacity: 0.5 }}>—</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
