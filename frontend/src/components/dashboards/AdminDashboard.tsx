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
  ArrowRight
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
  const [activeTab, setActiveTab] = useState<'users' | 'restaurants' | 'orders'>('users');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, usersRes, restRes, ordersRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/users'),
          api.get('/admin/restaurants'),
          api.get('/admin/orders'),
        ]);

        setStats(statsRes.data);
        setUsers(usersRes.data);
        setRestaurants(restRes.data);
        setOrders(ordersRes.data);
      } catch (err) {
        console.error('Error fetching admin data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="empty-state">Chargement de la console d'administration...</div>;

  return (
    <div className="fade-in">
      <div className="page-header" style={{ marginBottom: '32px' }}>
        <h1 className="page-title">Console d'Administration</h1>
        <p className="page-subtitle">Gérez les utilisateurs, les restaurants et surveillez les performances du système.</p>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-3" style={{ marginBottom: '40px' }}>
        <div className="card">
          <div className="card-header">
            <div className="card-emoji" style={{ color: 'var(--info)', background: 'rgba(30, 144, 255, 0.1)', padding: '12px', borderRadius: '12px' }}>
              <Users size={24} />
            </div>
            <TrendingUp size={20} color="var(--success)" />
          </div>
          <h3>{stats?.users}</h3>
          <p>Utilisateurs Inscrits</p>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-emoji" style={{ color: 'var(--accent)', background: 'rgba(255, 165, 2, 0.1)', padding: '12px', borderRadius: '12px' }}>
              <Store size={24} />
            </div>
            <ShieldCheck size={20} color="var(--info)" />
          </div>
          <h3>{stats?.restaurants}</h3>
          <p>Restaurants Partenaires</p>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-emoji" style={{ color: 'var(--success)', background: 'rgba(46, 213, 115, 0.1)', padding: '12px', borderRadius: '12px' }}>
              <DollarSign size={24} />
            </div>
            <ArrowRight size={20} color="var(--text-muted)" />
          </div>
          <h3>{stats?.revenue.toLocaleString()} DZD</h3>
          <p>Chiffre d'Affaires Total</p>
        </div>
      </div>

      {/* TABS */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <button 
          className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('users')}
        >
          <Users size={18} /> Utilisateurs
        </button>
        <button 
          className={`btn ${activeTab === 'restaurants' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('restaurants')}
        >
          <Store size={18} /> Restaurants
        </button>
        <button 
          className={`btn ${activeTab === 'orders' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('orders')}
        >
          <ShoppingBag size={18} /> Commandes
        </button>
      </div>

      {/* CONTENT TABLES */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ textTransform: 'capitalize' }}>Liste des {activeTab === 'orders' ? 'commandes' : activeTab}</h3>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Rechercher..." 
              style={{ padding: '8px 12px 8px 38px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-elevated)', color: 'var(--text)', fontSize: '0.85rem' }}
            />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '16px 24px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>ID</th>
                {activeTab === 'users' && (
                  <>
                    <th style={{ padding: '16px 24px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Nom</th>
                    <th style={{ padding: '16px 24px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Email</th>
                    <th style={{ padding: '16px 24px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Rôle</th>
                  </>
                )}
                {activeTab === 'restaurants' && (
                  <>
                    <th style={{ padding: '16px 24px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Nom</th>
                    <th style={{ padding: '16px 24px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Propriétaire</th>
                    <th style={{ padding: '16px 24px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Adresse</th>
                  </>
                )}
                {activeTab === 'orders' && (
                  <>
                    <th style={{ padding: '16px 24px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Client</th>
                    <th style={{ padding: '16px 24px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Restaurant</th>
                    <th style={{ padding: '16px 24px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total</th>
                    <th style={{ padding: '16px 24px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Statut</th>
                  </>
                )}
                <th style={{ padding: '16px 24px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {activeTab === 'users' && users.map(user => (
                <tr key={user.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '16px 24px', fontSize: '0.9rem' }}>#{user.id}</td>
                  <td style={{ padding: '16px 24px', fontSize: '0.9rem', fontWeight: 600 }}>{user.name}</td>
                  <td style={{ padding: '16px 24px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>{user.email}</td>
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '0.7rem', background: user.role === 'admin' ? 'var(--primary-glow)' : 'var(--bg-elevated)', color: user.role === 'admin' ? 'var(--primary)' : 'var(--text)', fontWeight: 700, textTransform: 'uppercase' }}>
                      {user.role}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px' }}><button className="btn btn-sm btn-secondary">Modifier</button></td>
                </tr>
              ))}
              {activeTab === 'restaurants' && restaurants.map(rest => (
                <tr key={rest.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '16px 24px', fontSize: '0.9rem' }}>#{rest.id}</td>
                  <td style={{ padding: '16px 24px', fontSize: '0.9rem', fontWeight: 600 }}>{rest.name}</td>
                  <td style={{ padding: '16px 24px', fontSize: '0.9rem' }}>{rest.owner?.name}</td>
                  <td style={{ padding: '16px 24px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{rest.address}</td>
                  <td style={{ padding: '16px 24px' }}><button className="btn btn-sm btn-secondary">Voir</button></td>
                </tr>
              ))}
              {activeTab === 'orders' && orders.map(order => (
                <tr key={order.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '16px 24px', fontSize: '0.9rem' }}>#{order.id}</td>
                  <td style={{ padding: '16px 24px', fontSize: '0.9rem', fontWeight: 600 }}>{order.customer?.name}</td>
                  <td style={{ padding: '16px 24px', fontSize: '0.9rem' }}>{order.restaurant?.name}</td>
                  <td style={{ padding: '16px 24px', fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent)' }}>{order.total} DZD</td>
                  <td style={{ padding: '16px 24px' }}><StatusBadge status={order.status} /></td>
                  <td style={{ padding: '16px 24px' }}><button className="btn btn-sm btn-secondary">Détails</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
