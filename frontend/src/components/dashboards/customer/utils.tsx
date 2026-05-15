import React from 'react';

// Image rendering shim used by every customer-side card. A field may carry:
//   - a remote URL (https://...) or data URL (data:image/...) → render <img>
//   - an emoji or short string                                → render text
//   - nothing                                                 → fallback emoji
//
// Centralised here so the same rules apply to restaurant cards, product cards,
// order cards, and history rows without each component re-implementing the test.
export const renderMedia = (imageStr: string | undefined, defaultEmoji = '🍽️') => {
  if (!imageStr) return <span>{defaultEmoji}</span>;
  if (imageStr.startsWith('http') || imageStr.startsWith('data:')) {
    // loading="lazy" + decoding="async" keep the home-screen grid responsive
    // on first paint when 10+ restaurant cards each have a remote image.
    return (
      <img
        src={imageStr}
        alt=""
        loading="lazy"
        decoding="async"
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
    );
  }
  return <span>{imageStr}</span>;
};

// Reservation status colour + label maps. Kept here (not in types/index.ts)
// because they're FR-localised and the rest of the app's status labels are
// owned by the order flow.
export const RES_STATUS_COLORS: Record<string, string> = {
  waiting: '#f39c12',
  called: '#2ed573',
  done: '#27ae60',
  cancelled: '#e74c3c',
};

export const RES_STATUS_LABELS: Record<string, string> = {
  waiting: 'En attente',
  called: 'Appelé',
  done: 'Terminé',
  cancelled: 'Annulé',
};

export const PLACE_TYPE_LABELS: Record<string, string> = {
  doctor: '🩺 Médecin',
  clinic: '🏥 Clinique',
  government: '🏢 Admin',
  other: '📮 Autre',
};
