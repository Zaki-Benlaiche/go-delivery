'use client';

import React from 'react';
import { useAuthStore } from '@/store/authStore';
import { LogOut, User } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuthStore();

  if (!user) return null;

  const roleLabels: Record<string, string> = {
    client: 'Client',
    restaurant: 'Restaurant',
    driver: 'Livreur',
    admin: 'Admin',
    place: 'Établissement'
  };

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'rgba(10, 11, 14, 0.85)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      padding: '12px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>
      {/* Left: Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <img src="/logo.png" alt="GO-DELIVERY" style={{ width: '36px', height: '36px', borderRadius: '8px' }} />
        <span style={{
          fontSize: '1.15rem',
          fontWeight: 900,
          letterSpacing: '-0.5px',
          background: 'linear-gradient(135deg, #ff4757, #ff6b81)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          GO-DELIVERY
        </span>
      </div>

      {/* Right: User + Logout */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: 'rgba(255,255,255,0.04)',
          padding: '6px 14px 6px 6px',
          borderRadius: '50px',
          border: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #ff4757, #ff6b81)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <User size={16} color="white" />
          </div>
          <div style={{ lineHeight: 1.2 }}>
            <div className="nav-username" style={{ fontSize: '0.8rem', fontWeight: 700 }}>{user.name}</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {roleLabels[user.role] || user.role}
            </div>
          </div>
        </div>

        <button
          onClick={logout}
          style={{
            background: 'rgba(255, 71, 87, 0.08)',
            color: '#ff4757',
            border: '1px solid rgba(255, 71, 87, 0.15)',
            padding: '8px',
            borderRadius: '10px',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s',
          }}
          title="Déconnexion"
        >
          <LogOut size={16} />
        </button>
      </div>
    </nav>
  );
}
