'use client';

import React from 'react';
import { useAuthStore } from '@/store/authStore';
import { LogOut, User, Truck, ChefHat, Shield, Building2, ShoppingBag } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuthStore();

  if (!user) return null;

  const roleConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
    client: { label: 'Client', icon: <ShoppingBag size={12} />, color: '#ffc048' },
    restaurant: { label: 'Restaurant', icon: <ChefHat size={12} />, color: '#ff6b81' },
    driver: { label: 'Livreur', icon: <Truck size={12} />, color: '#2ed573' },
    admin: { label: 'Admin', icon: <Shield size={12} />, color: '#a55eea' },
    place: { label: 'Établissement', icon: <Building2 size={12} />, color: '#1e90ff' }
  };

  const role = roleConfig[user.role] || { label: user.role, icon: <User size={12} />, color: '#747d8c' };

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'rgba(10, 11, 14, 0.9)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      padding: '10px 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '8px',
    }}>
      {/* Left: Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        <img src="/logo.png" alt="GO-DELIVERY" style={{ width: '32px', height: '32px', borderRadius: '8px' }} />
        <span style={{
          fontSize: 'clamp(0.9rem, 3vw, 1.1rem)',
          fontWeight: 900,
          letterSpacing: '-0.5px',
          background: 'linear-gradient(135deg, #ff4757, #ffc048)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          whiteSpace: 'nowrap',
        }}>
          GO-DELIVERY
        </span>
      </div>

      {/* Right: User + Logout */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: 'rgba(255,255,255,0.04)',
          padding: '5px 12px 5px 5px',
          borderRadius: '50px',
          border: '1px solid rgba(255,255,255,0.06)',
          minWidth: 0,
        }}>
          <div style={{
            width: '30px', height: '30px', borderRadius: '50%',
            background: `linear-gradient(135deg, ${role.color}, ${role.color}88)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <User size={14} color="white" />
          </div>
          <div style={{ lineHeight: 1.2, minWidth: 0 }}>
            <div className="nav-username" style={{ fontSize: '0.78rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</div>
            <div style={{
              fontSize: '0.6rem', color: role.color, fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.5px',
              display: 'flex', alignItems: 'center', gap: '3px',
              whiteSpace: 'nowrap'
            }}>
              {role.icon} {role.label}
            </div>
          </div>
        </div>

        <button
          onClick={logout}
          style={{
            background: 'rgba(255, 71, 87, 0.08)',
            color: '#ff4757',
            border: '1px solid rgba(255, 71, 87, 0.15)',
            padding: '7px',
            borderRadius: '10px',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s',
            flexShrink: 0,
          }}
          title="Déconnexion"
        >
          <LogOut size={15} />
        </button>
      </div>
    </nav>
  );
}
