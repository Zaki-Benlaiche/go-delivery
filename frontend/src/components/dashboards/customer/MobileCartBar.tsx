'use client';

import React from 'react';
import { ClipboardList } from 'lucide-react';

interface MobileCartBarProps {
  variant: 'cart' | 'shopping';
  itemsCount: number;
  cartTotal: number;
  onOpen: () => void;
}

// Floating bottom CTA on mobile when there's something pending in the cart or
// a non-empty shopping list. Tapping it opens the bottom-sheet panel.
export default function MobileCartBar({ variant, itemsCount, cartTotal, onOpen }: MobileCartBarProps) {
  if (variant === 'shopping') {
    return (
      <div className="mobile-cart-bar" onClick={onOpen}>
        <div className="mobile-cart-bar-left">
          <ClipboardList size={20} />
          <span>Voir la liste</span>
        </div>
        <span className="mobile-cart-bar-action">Commander →</span>
      </div>
    );
  }

  return (
    <div className="mobile-cart-bar" onClick={onOpen}>
      <div className="mobile-cart-bar-left">
        <div className="mobile-cart-bar-bubble">{itemsCount}</div>
        <span>Voir le panier</span>
      </div>
      <span className="mobile-cart-bar-amount">{cartTotal} DA</span>
    </div>
  );
}
