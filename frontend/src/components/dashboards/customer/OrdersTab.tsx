'use client';

import React from 'react';
import { Truck, Clock, ChefHat, Package, Navigation, Phone, User } from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import type { Order, OrderStatus } from '@/types';
import { renderMedia } from './utils';

interface OrdersTabProps {
  orders: Order[];
  onExplore: () => void;
}

// Customer order tracking. Active orders show the live progress strip + driver
// callout; past orders collapse to a compact row.
export default function OrdersTab({ orders, onExplore }: OrdersTabProps) {
  const activeOrders = orders.filter((o) => o.status !== 'delivered' && o.status !== 'cancelled');
  const pastOrders = orders.filter((o) => o.status === 'delivered' || o.status === 'cancelled');

  return (
    <div className="fade-in orders-tab">
      <h2 className="section-title orders-title">Suivi de vos commandes</h2>

      {orders.length === 0 ? (
        <div className="empty-state orders-empty">
          <Truck size={40} className="orders-empty-icon" />
          <h3>Aucune commande passée</h3>
          <p>Explorez nos restaurants et commandez vos plats préférés !</p>
          <button className="btn btn-primary orders-empty-btn" onClick={onExplore}>
            Découvrir
          </button>
        </div>
      ) : (
        <>
          {activeOrders.length > 0 && (
            <section className="orders-section">
              <h3 className="orders-active-title">
                <span className="pulse-dot orders-active-dot" />
                En cours
              </h3>
              <div className="orders-active-list">
                {activeOrders.map((order) => (
                  <ActiveOrderCard key={order.id} order={order} />
                ))}
              </div>
            </section>
          )}

          {pastOrders.length > 0 && (
            <section>
              <h3 className="orders-past-title">Historique</h3>
              <div className="orders-past-list">
                {pastOrders.map((order) => (
                  <PastOrderRow key={order.id} order={order} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

function ActiveOrderCard({ order }: { order: Order }) {
  const isPending = order.status === 'pending';
  const isPreparing = order.status === 'accepted' || order.status === 'preparing';
  const isReady = order.status === 'ready';
  const isDelivering = order.status === 'out_for_delivery';
  // Progress strip width as % of the bar. Matches the 4-step row underneath.
  const progressWidth = isPending ? '0%' : isPreparing ? '33%' : isReady ? '66%' : isDelivering ? '100%' : '0%';

  return (
    <div className="card active-order-card">
      <div className="active-order-header">
        <div className="active-order-info">
          <div className="active-order-thumb">{renderMedia(order.restaurant?.image, '🏪')}</div>
          <div className="active-order-meta">
            <h3>{order.restaurant?.name}</h3>
            <div className="active-order-num">#{order.id}</div>
          </div>
        </div>
        <div className="active-order-total">
          <div className="active-order-amount">{order.total + (order.deliveryFee || 0)} DA</div>
          {order.deliveryFee ? (
            <div className="active-order-breakdown">
              plats {order.total} + livreur {order.deliveryFee}
            </div>
          ) : (
            <div className="active-order-breakdown">+ livraison à confirmer</div>
          )}
        </div>
      </div>

      <div className="active-order-body">
        <div className="order-progress">
          <div className="order-progress-track" />
          <div className="order-progress-fill" style={{ width: progressWidth }} />
          {(
            [
              { icon: <Clock size={16} />, label: 'Confirmée', active: !isPending },
              { icon: <ChefHat size={16} />, label: 'Prépa.', active: isPreparing || isReady || isDelivering },
              { icon: <Package size={16} />, label: 'Prête', active: isReady || isDelivering },
              { icon: <Navigation size={16} />, label: 'Route', active: isDelivering },
            ]
          ).map((step, idx) => (
            <div key={idx} className="order-progress-step">
              <div className={`order-progress-circle ${step.active ? 'is-active' : ''}`}>{step.icon}</div>
              <span className={`order-progress-label ${step.active ? 'is-active' : ''}`}>{step.label}</span>
            </div>
          ))}
        </div>

        <div className="order-detail-box">
          <h4>Détails</h4>
          <div className="order-items-list">
            {order.items?.map((item) => (
              <div key={item.id} className="order-item-row">
                <span>
                  <strong className="order-item-qty">{item.quantity}x</strong> {item.product?.name}
                </span>
                <span>{item.price * item.quantity} DA</span>
              </div>
            ))}
          </div>
        </div>

        {isDelivering && order.driver && (
          <div className="order-driver-card">
            <div className="order-driver-info">
              <div className="order-driver-avatar">
                <User size={20} />
              </div>
              <div>
                <div className="order-driver-label">Livreur</div>
                <strong className="order-driver-name">{order.driver.name}</strong>
              </div>
            </div>
            <a href={`tel:${order.driver.phone}`} className="btn btn-sm order-driver-call">
              <Phone size={14} /> Appeler
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

function PastOrderRow({ order }: { order: Order }) {
  return (
    <div className="card past-order-row">
      <div className="past-order-info">
        <div className="past-order-thumb">{renderMedia(order.restaurant?.image, '🍽️')}</div>
        <div className="past-order-meta">
          <strong>{order.restaurant?.name || 'Restaurant'}</strong>
          <div className="past-order-date">
            {new Date(order.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} •{' '}
            {order.items?.length} articles
          </div>
        </div>
      </div>
      <div className="past-order-right">
        <div className="past-order-amount">{order.total} DA</div>
        <StatusBadge status={order.status as OrderStatus} />
      </div>
    </div>
  );
}
