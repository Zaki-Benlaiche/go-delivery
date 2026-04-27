'use client';

import React from 'react';
import { useAuthStore } from '@/store/authStore';
import { useNotificationStore } from '@/store/notificationStore';
import { LogOut, User, Truck, ChefHat, Shield, Building2, ShoppingBag, Bell, Trash2 } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const { notifications, unreadCount, isDropdownOpen, toggleDropdown, closeDropdown, clearAll } = useNotificationStore();

  if (!user) return null;

  const roleConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
    client: { label: 'Client', icon: <ShoppingBag size={11} />, color: '#ffc048' },
    restaurant: { label: 'Restaurant', icon: <ChefHat size={11} />, color: '#ff6b81' },
    driver: { label: 'Livreur', icon: <Truck size={11} />, color: '#2ed573' },
    admin: { label: 'Admin', icon: <Shield size={11} />, color: '#a55eea' },
    place: { label: 'Établissement', icon: <Building2 size={11} />, color: '#1e90ff' }
  };

  const role = roleConfig[user.role] || { label: user.role, icon: <User size={11} />, color: '#747d8c' };

  const formatTimeAgo = (timestamp: number) => {
    const diff = Math.floor((Date.now() - timestamp) / 1000);
    if (diff < 60) return 'à l\'instant';
    if (diff < 3600) return `il y a ${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `il y a ${Math.floor(diff / 3600)}h`;
    return `il y a ${Math.floor(diff / 86400)}j`;
  };

  return (
    <>
      <nav style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'rgba(10, 11, 14, 0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '10px 14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '6px',
      }}>
        {/* Left: Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <img src="/logo.svg" alt="Réserve-vite" style={{ width: '30px', height: '30px', borderRadius: '8px' }} />
          <span style={{
            fontSize: '0.95rem',
            fontWeight: 900,
            letterSpacing: '-0.5px',
            background: 'linear-gradient(135deg, #ff4757, #ffc048)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            whiteSpace: 'nowrap',
          }}>
            RÉSERVE-VITE
          </span>
        </div>

        {/* Right: Notification + User + Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>

          {/* Notification Bell */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={toggleDropdown}
              style={{
                background: unreadCount > 0 ? 'rgba(255, 71, 87, 0.1)' : 'rgba(255,255,255,0.04)',
                border: unreadCount > 0 ? '1px solid rgba(255, 71, 87, 0.2)' : '1px solid rgba(255,255,255,0.06)',
                color: unreadCount > 0 ? '#ff4757' : 'var(--text-muted)',
                padding: '7px',
                borderRadius: '10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
                flexShrink: 0,
                position: 'relative',
              }}
              title="Notifications"
            >
              <Bell size={16} className={unreadCount > 0 ? 'pulse-icon' : ''} />
              {unreadCount > 0 && (
                <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
              )}
            </button>

            {/* Dropdown */}
            {isDropdownOpen && (
              <div className="notification-dropdown">
                <div className="notification-dropdown-header">
                  <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>Notifications</span>
                  {notifications.length > 0 && (
                    <button
                      onClick={(e) => { e.stopPropagation(); clearAll(); }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '4px 8px',
                        borderRadius: '6px',
                      }}
                    >
                      <Trash2 size={12} /> Effacer
                    </button>
                  )}
                </div>
                <div className="notification-dropdown-list">
                  {notifications.length === 0 ? (
                    <div style={{ padding: '30px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      <Bell size={28} style={{ opacity: 0.2, marginBottom: '8px' }} />
                      <p style={{ fontSize: '0.85rem' }}>Aucune notification</p>
                    </div>
                  ) : (
                    notifications.slice(0, 20).map((notif) => (
                      <div key={notif.id} className="notification-dropdown-item">
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '10px',
                            background: `${notif.color}15`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.1rem',
                            flexShrink: 0,
                            border: `1px solid ${notif.color}25`,
                          }}
                        >
                          {notif.icon}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            color: notif.color,
                            marginBottom: '1px',
                          }}>
                            {notif.title}
                          </div>
                          <div style={{
                            fontSize: '0.82rem',
                            color: '#c8c8cc',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}>
                            {notif.message}
                          </div>
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                            {formatTimeAgo(notif.timestamp)}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Badge */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'rgba(255,255,255,0.04)',
            padding: '4px 10px 4px 4px',
            borderRadius: '50px',
            border: '1px solid rgba(255,255,255,0.06)',
            minWidth: 0,
          }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%',
              background: `linear-gradient(135deg, ${role.color}, ${role.color}88)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <User size={13} color="white" />
            </div>
            <div style={{ lineHeight: 1.2, minWidth: 0 }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '80px' }}>{user.name}</div>
              <div style={{
                fontSize: '0.58rem', color: role.color, fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.5px',
                display: 'flex', alignItems: 'center', gap: '2px',
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
            <LogOut size={14} />
          </button>
        </div>
      </nav>

      {/* Backdrop to close dropdown */}
      {isDropdownOpen && (
        <div className="notification-backdrop" onClick={closeDropdown} />
      )}
    </>
  );
}
