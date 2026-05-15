'use client';

import React from 'react';
import { ShoppingBag, Package, Info, X } from 'lucide-react';
import type { Restaurant } from '@/types';

interface CartPanelProps {
  cart: Record<number, number>;
  restaurant: Restaurant;
  cartTotal: number;
  deliveryAddress: string;
  onDeliveryAddressChange: (v: string) => void;
  isOrdering: boolean;
  onOrder: () => void;
  isMobile: boolean;
  onClose?: () => void;
}

// Menu-vendor checkout panel. Shows the line items, sub-total, delivery
// placeholder (set by the driver), address input, and the place-order CTA.
// Two presentation modes:
//   - isMobile=false → rendered inside the desktop two-column layout (.card)
//   - isMobile=true  → rendered inside the mobile bottom sheet (no card chrome)
export default function CartPanel({
  cart,
  restaurant,
  cartTotal,
  deliveryAddress,
  onDeliveryAddressChange,
  isOrdering,
  onOrder,
  isMobile,
  onClose,
}: CartPanelProps) {
  return (
    <div className={isMobile ? 'cart-panel-mobile' : 'card cart-panel-desktop'}>
      <h3 className="cart-panel-title">
        <span>
          <ShoppingBag size={18} color="var(--primary)" /> Votre Commande
        </span>
        {isMobile && onClose && (
          <button onClick={onClose} className="cart-panel-close">
            <X size={18} />
          </button>
        )}
      </h3>

      {Object.keys(cart).length === 0 ? (
        <div className="cart-empty">
          <div className="cart-empty-icon">
            <Package size={26} />
          </div>
          <p className="cart-empty-title">Le panier est vide</p>
          <p className="cart-empty-subtitle">Ajoutez des plats pour commencer.</p>
        </div>
      ) : (
        <>
          <div className={`cart-items ${isMobile ? 'cart-items-mobile' : 'cart-items-desktop'}`}>
            {Object.entries(cart).map(([productId, quantity]) => {
              const product = restaurant.products?.find((p) => p.id === Number(productId));
              if (!product) return null;
              return (
                <div key={productId} className="cart-item">
                  <div className="cart-item-qty">{quantity}x</div>
                  <div className="cart-item-info">
                    <div className="cart-item-name">{product.name}</div>
                    <div className="cart-item-price">{product.price * quantity} DA</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className={isMobile ? '' : 'cart-totals'}>
            <div className="cart-totals-row">
              <span>Sous-total</span>
              <span>{cartTotal} DA</span>
            </div>
            <div className="cart-totals-row cart-totals-row-small">
              <span>Livraison</span>
              <span className="cart-totals-italic">fixée par le livreur</span>
            </div>
            <div className="cart-totals-final">
              <span>Total plats</span>
              <span className="cart-totals-amount">
                {cartTotal} <span className="cart-totals-unit">DA</span>
              </span>
            </div>
          </div>

          <div className="cart-address-group">
            <label>Adresse de livraison</label>
            <input
              type="text"
              placeholder="Ex: Rue des Lilas, Appt 3B, Alger..."
              value={deliveryAddress}
              onChange={(e) => onDeliveryAddressChange(e.target.value)}
              className={`cart-address-input ${deliveryAddress ? 'is-filled' : ''}`}
            />
          </div>

          <div className="cart-info-callout">
            <Info size={14} />
            Paiement en espèces à la livraison.
          </div>

          <button
            className="btn btn-primary btn-block cart-cta"
            onClick={() => {
              onOrder();
              if (isMobile && onClose) onClose();
            }}
            disabled={isOrdering}
          >
            {isOrdering ? 'Traitement...' : `Commander (${cartTotal} DA)`}
          </button>
        </>
      )}
    </div>
  );
}
