'use client';

import React from 'react';
import { ChevronLeft, MapPin, Utensils, Plus, Minus } from 'lucide-react';
import type { Restaurant, Product } from '@/types';
import { renderMedia } from './utils';
import CartPanel from './CartPanel';

interface RestaurantDetailProps {
  restaurant: Restaurant;
  cart: Record<number, number>;
  cartTotal: number;
  deliveryAddress: string;
  isOrdering: boolean;
  onBack: () => void;
  onRefresh: () => void;
  onAddToCart: (id: number) => void;
  onRemoveFromCart: (id: number) => void;
  onDeliveryAddressChange: (v: string) => void;
  onOrder: () => void;
}

// Restaurant-level page: header + menu on the left, cart panel on the right
// (desktop) or in a bottom sheet (mobile).
export default function RestaurantDetail({
  restaurant,
  cart,
  cartTotal,
  deliveryAddress,
  isOrdering,
  onBack,
  onRefresh,
  onAddToCart,
  onRemoveFromCart,
  onDeliveryAddressChange,
  onOrder,
}: RestaurantDetailProps) {
  return (
    <div className="fade-in">
      <div className="rd-header">
        <button className="btn btn-secondary rd-back-btn" onClick={onBack}>
          <ChevronLeft size={20} />
        </button>
        <div className="rd-header-info">
          <div className="rd-header-thumb">{renderMedia(restaurant.image)}</div>
          <div className="rd-header-meta">
            <h1>{restaurant.name}</h1>
            <p>
              <MapPin size={14} /> {restaurant.address}
            </p>
            <div>
              <span className="rd-header-badge">Ouvert</span>
            </div>
          </div>
        </div>
      </div>

      <div className="customer-layout">
        <div>
          <div className="rd-menu-header">
            <h3>Menu</h3>
            <button className="btn btn-secondary btn-sm rd-refresh-btn" onClick={onRefresh}>
              Actualiser 🔄
            </button>
          </div>

          {!restaurant.products || restaurant.products.length === 0 ? (
            <div className="empty-state rd-menu-empty">
              <Utensils size={30} />
              <p>Ce restaurant n&apos;a pas encore de plat.</p>
            </div>
          ) : (
            <div className="grid grid-2 rd-products-grid">
              {restaurant.products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  qty={cart[product.id] || 0}
                  onAdd={() => onAddToCart(product.id)}
                  onRemove={() => onRemoveFromCart(product.id)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="desktop-cart">
          <CartPanel
            cart={cart}
            restaurant={restaurant}
            cartTotal={cartTotal}
            deliveryAddress={deliveryAddress}
            onDeliveryAddressChange={onDeliveryAddressChange}
            isOrdering={isOrdering}
            onOrder={onOrder}
            isMobile={false}
          />
        </div>
      </div>
    </div>
  );
}

function ProductCard({
  product,
  qty,
  onAdd,
  onRemove,
}: {
  product: Product;
  qty: number;
  onAdd: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="card rd-product-card">
      <div className="rd-product-top">
        <div className="rd-product-thumb">{renderMedia(product.image, '🍔')}</div>
        <div className="rd-product-info">
          <h4>{product.name}</h4>
          <span className="rd-product-category">{product.category}</span>
          <div className="rd-product-price">{product.price} DA</div>
        </div>
      </div>
      <div className="rd-product-qty">
        <span>Quantité</span>
        <div className="quantity-control rd-product-qty-control">
          <button onClick={onRemove} disabled={!qty}>
            <Minus size={13} />
          </button>
          <span>{qty}</span>
          <button onClick={onAdd} className={qty ? 'is-active' : ''}>
            <Plus size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
