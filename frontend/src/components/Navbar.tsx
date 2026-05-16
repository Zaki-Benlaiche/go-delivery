'use client';

import React from 'react';
import { useAuthStore } from '@/store/authStore';
import { useNotificationStore } from '@/store/notificationStore';
import {
  LogOut, User, Truck, ChefHat, Shield, Building2, ShoppingBag, Bell, Trash2,
  Store, Beef,
} from 'lucide-react';

// Top-of-app shell. Sticky on scroll, role-coloured user pill, notification
// dropdown. Visual style is Dark Premium: smoked-glass black blur with a
// violet-tinted hairline border.
export default function Navbar() {
  // Atomic selectors — destructuring the whole store re-renders the navbar
  // every time *any* notification arrives, which thrashes the badge animation.
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const notifications = useNotificationStore((s) => s.notifications);
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const isDropdownOpen = useNotificationStore((s) => s.isDropdownOpen);
  const toggleDropdown = useNotificationStore((s) => s.toggleDropdown);
  const closeDropdown = useNotificationStore((s) => s.closeDropdown);
  const clearAll = useNotificationStore((s) => s.clearAll);

  if (!user) return null;

  const role = ROLE_CONFIG[user.role] || { label: user.role, icon: <User size={11} />, color: 'var(--text-muted)' };

  const formatTimeAgo = (timestamp: number) => {
    const diff = Math.floor((Date.now() - timestamp) / 1000);
    if (diff < 60) return 'à l\'instant';
    if (diff < 3600) return `il y a ${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `il y a ${Math.floor(diff / 3600)}h`;
    return `il y a ${Math.floor(diff / 86400)}j`;
  };

  return (
    <>
      <nav className="app-navbar">
        <div className="app-navbar-brand">
          <img src="/icons/logo-192.webp" alt="Réserve-vite" width={32} height={32} loading="eager" decoding="async" />
          <span className="app-navbar-name">RÉSERVE-VITE</span>
        </div>

        <div className="app-navbar-actions">
          <div className="app-navbar-bell-wrap">
            <button
              onClick={toggleDropdown}
              className={`app-navbar-bell ${unreadCount > 0 ? 'has-unread' : ''}`}
              title="Notifications"
              aria-label="Notifications"
            >
              <Bell size={16} className={unreadCount > 0 ? 'pulse-icon' : ''} />
              {unreadCount > 0 && <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
            </button>

            {isDropdownOpen && (
              <div className="notification-dropdown">
                <div className="notification-dropdown-header">
                  <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>Notifications</span>
                  {notifications.length > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        clearAll();
                      }}
                      className="app-navbar-clear-btn"
                    >
                      <Trash2 size={12} /> Effacer
                    </button>
                  )}
                </div>
                <div className="notification-dropdown-list">
                  {notifications.length === 0 ? (
                    <div className="app-navbar-empty">
                      <Bell size={28} />
                      <p>Aucune notification</p>
                    </div>
                  ) : (
                    notifications.slice(0, 20).map((notif) => (
                      <div key={notif.id} className="notification-dropdown-item">
                        <div className="app-navbar-notif-icon" style={{ background: `${notif.color}18`, border: `1px solid ${notif.color}30`, color: notif.color }}>
                          {notif.icon}
                        </div>
                        <div className="app-navbar-notif-body">
                          <div className="app-navbar-notif-title" style={{ color: notif.color }}>
                            {notif.title}
                          </div>
                          <div className="app-navbar-notif-msg">{notif.message}</div>
                          <div className="app-navbar-notif-time">{formatTimeAgo(notif.timestamp)}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="app-navbar-user">
            <div className="app-navbar-avatar" style={{ background: role.color }}>
              <User size={13} color="white" />
            </div>
            <div className="app-navbar-user-text">
              <div className="app-navbar-user-name">{user.name}</div>
              <div className="app-navbar-user-role" style={{ color: role.color }}>
                {role.icon} {role.label}
              </div>
            </div>
          </div>

          <button onClick={logout} className="app-navbar-logout" title="Déconnexion" aria-label="Déconnexion">
            <LogOut size={14} />
          </button>
        </div>
      </nav>

      {isDropdownOpen && <div className="notification-backdrop" onClick={closeDropdown} />}
    </>
  );
}

// Role display config. Same lookup the AuthPage uses, but with smaller icons
// since the navbar pill is space-constrained.
const ROLE_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  client: { label: 'Client', icon: <ShoppingBag size={11} />, color: 'var(--role-client)' },
  restaurant: { label: 'Restaurant', icon: <ChefHat size={11} />, color: 'var(--role-restaurant)' },
  superette: { label: 'Supérette', icon: <Store size={11} />, color: 'var(--role-superette)' },
  boucherie: { label: 'Boucherie', icon: <Beef size={11} />, color: 'var(--role-boucherie)' },
  driver: { label: 'Livreur', icon: <Truck size={11} />, color: 'var(--role-driver)' },
  admin: { label: 'Admin', icon: <Shield size={11} />, color: 'var(--role-admin)' },
  place: { label: 'Établissement', icon: <Building2 size={11} />, color: 'var(--role-place)' },
};
