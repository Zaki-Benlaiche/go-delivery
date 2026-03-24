'use client';

import React from 'react';
import { useAuthStore } from '@/store/authStore';
import { LogOut, User, Menu, Bell, Search, MapPin } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuthStore();

  if (!user) return null;

  return (
    <nav style={{ 
      position: 'sticky', 
      top: 0, 
      zIndex: 100, 
      background: 'rgba(10, 10, 10, 0.7)', 
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
      padding: '16px 32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      {/* Brand & Main Navigation Area */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
        <div style={{ 
          fontSize: '1.4rem', 
          fontWeight: 900, 
          letterSpacing: '-1px',
          background: 'linear-gradient(90deg, #fff, #888)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <div style={{ width: '24px', height: '24px', background: 'var(--primary)', borderRadius: '6px' }}></div>
          GO-DELIVERY
        </div>

        {/* Role-specific contextual info in Navbar */}
        {user.role === 'client' && (
           <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-elevated)', padding: '8px 16px', borderRadius: '30px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
             <MapPin size={14} /> Livraison vers: <strong>Alger Centre</strong>
           </div>
        )}
      </div>

      {/* Utilities & Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        
        {/* Universal Actions */}
        <div style={{ display: 'flex', gap: '16px', color: 'var(--text-muted)' }}>
          <button style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}><Search size={20} /></button>
          <button style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', position: 'relative' }}>
            <Bell size={20} />
            <span style={{ position: 'absolute', top: '-2px', right: '-2px', width: '8px', height: '8px', background: 'var(--primary)', borderRadius: '50%' }}></span>
          </button>
        </div>

        <div style={{ width: '1px', height: '24px', background: 'var(--border)' }}></div>

        {/* User Profile Dropdown Handle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <strong style={{ fontSize: '0.9rem', lineHeight: 1.2 }}>{user.name}</strong>
            <span style={{ 
              fontSize: '0.75rem', 
              color: user.role === 'restaurant' ? 'var(--info)' : user.role === 'driver' ? 'var(--accent)' : 'var(--primary)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              fontWeight: 700
            }}>
              {user.role}
            </span>
          </div>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            background: 'var(--bg-elevated)', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            border: '2px solid rgba(255,255,255,0.1)'
          }}>
            <User size={20} color="var(--text-muted)" />
          </div>
          
          <button 
            onClick={logout}
            style={{ 
              background: 'rgba(255, 71, 87, 0.1)', 
              color: 'var(--error)', 
              border: '1px solid rgba(255, 71, 87, 0.2)',
              padding: '8px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Déconnexion"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </nav>
  );
}
