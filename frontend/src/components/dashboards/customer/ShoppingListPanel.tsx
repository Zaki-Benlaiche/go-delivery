'use client';

import React from 'react';
import { ClipboardList, Info, X } from 'lucide-react';

interface ShoppingListPanelProps {
  shoppingListText: string;
  deliveryAddress: string;
  onDeliveryAddressChange: (v: string) => void;
  isOrdering: boolean;
  onOrder: () => void;
  isMobile: boolean;
  onClose?: () => void;
}

// Checkout panel for shopping-list shops (superette/boucherie). Shows the
// already-typed list back to the customer for confirmation, takes the address,
// and explains the receipt-based pricing model.
export default function ShoppingListPanel({
  shoppingListText,
  deliveryAddress,
  onDeliveryAddressChange,
  isOrdering,
  onOrder,
  isMobile,
  onClose,
}: ShoppingListPanelProps) {
  const isReady = shoppingListText.trim().length > 0;

  return (
    <div className={isMobile ? 'shop-panel-mobile' : 'card shop-panel-desktop'}>
      <h3 className="shop-panel-title">
        <span>
          <ClipboardList size={18} color="#16a085" /> Récapitulatif
        </span>
        {isMobile && onClose && (
          <button onClick={onClose} className="shop-panel-close">
            <X size={18} />
          </button>
        )}
      </h3>

      <div className={`shop-panel-list ${isMobile ? 'shop-panel-list-mobile' : ''}`}>
        <div className="shop-panel-list-label">Votre liste</div>
        <pre className="shop-panel-list-pre">
          {shoppingListText.trim() || <span className="shop-panel-empty">Liste vide</span>}
        </pre>
      </div>

      <div className="shop-panel-address">
        <label>Adresse de livraison</label>
        <input
          type="text"
          placeholder="Ex: Rue des Lilas, Appt 3B, Alger..."
          value={deliveryAddress}
          onChange={(e) => onDeliveryAddressChange(e.target.value)}
          className={`shop-panel-input ${deliveryAddress ? 'is-filled' : ''}`}
        />
      </div>

      <div className="shop-panel-callout">
        <Info size={14} />
        <span>
          Le prix final sera fixé par le livreur après l&apos;achat (ticket de caisse + livraison). Paiement en espèces à la
          livraison.
        </span>
      </div>

      <button
        className="btn btn-primary btn-block shop-panel-cta"
        onClick={() => {
          onOrder();
          if (isMobile && onClose) onClose();
        }}
        disabled={isOrdering || !isReady}
      >
        {isOrdering ? 'Envoi...' : 'Envoyer la commande'}
      </button>
    </div>
  );
}
