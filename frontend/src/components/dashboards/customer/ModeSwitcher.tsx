'use client';

import React from 'react';
import { Truck, ClipboardList } from 'lucide-react';

interface ModeSwitcherProps {
  mode: 'delivery' | 'reservation';
  onChange: (mode: 'delivery' | 'reservation') => void;
  reservationBadge?: number;
}

// Top-level toggle between Delivery and Reservation flows. Badge is the count
// of active reservations so the customer can see they have a live ticket.
export default function ModeSwitcher({ mode, onChange, reservationBadge = 0 }: ModeSwitcherProps) {
  return (
    <div className="mode-switcher">
      <button
        type="button"
        className={`mode-btn mode-btn-delivery ${mode === 'delivery' ? 'is-active' : ''}`}
        onClick={() => onChange('delivery')}
      >
        <Truck size={18} /> DELIVERY
      </button>
      <button
        type="button"
        className={`mode-btn mode-btn-reservation ${mode === 'reservation' ? 'is-active' : ''}`}
        onClick={() => onChange('reservation')}
      >
        <ClipboardList size={18} /> RÉSERVATION
        {reservationBadge > 0 && <span className="mode-btn-badge">{reservationBadge}</span>}
      </button>
    </div>
  );
}
