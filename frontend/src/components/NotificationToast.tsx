'use client';

import React from 'react';
import { useNotificationStore } from '@/store/notificationStore';
import { X, Bell } from 'lucide-react';

export default function NotificationToast() {
  const { showToast, currentToast, dismissToast } = useNotificationStore();

  if (!showToast || !currentToast) return null;

  return (
    <div
      className="notification-toast"
      onClick={dismissToast}
      style={{
        position: 'fixed',
        top: 'env(safe-area-inset-top, 12px)',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc(100% - 24px)',
        maxWidth: '460px',
        zIndex: 9999,
        animation: 'toastSlideIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        cursor: 'pointer',
      }}
    >
      <div
        style={{
          background: 'rgba(22, 24, 32, 0.97)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderRadius: '16px',
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          border: `1px solid ${currentToast.color}33`,
          boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.05)`,
        }}
      >
        {/* Icon */}
        <div
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: `${currentToast.color}18`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.3rem',
            flexShrink: 0,
            border: `1px solid ${currentToast.color}30`,
          }}
        >
          {currentToast.icon}
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: '0.82rem',
              fontWeight: 800,
              color: currentToast.color,
              marginBottom: '2px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
            }}
          >
            <Bell size={11} /> {currentToast.title}
          </div>
          <div
            style={{
              fontSize: '0.88rem',
              color: '#e8e8ea',
              fontWeight: 500,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {currentToast.message}
          </div>
        </div>

        {/* Close */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            dismissToast();
          }}
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: 'none',
            color: 'rgba(255,255,255,0.4)',
            width: '28px',
            height: '28px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
