'use client';

import React from 'react';
import { Flame, Clock, User, Phone, CheckCircle, ChefHat, Coffee, CheckCircle2, Package, Truck } from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import type { Order, OrderStatus } from '@/types';

interface OrdersTabProps {
  orders: Order[];
  onAccept: (orderId: number) => void;
  onMarkReady: (orderId: number) => void;
}

// Restaurant-side orders view: stat cards + pending / preparing / ready /
// history sections. Each section renders cards in its own colour band.
export default function OrdersTab({ orders, onAccept, onMarkReady }: OrdersTabProps) {
  const pendingOrders = orders.filter((o) => o.status === 'pending');
  const preparingOrders = orders.filter((o) => ['accepted', 'preparing'].includes(o.status));
  const readyOrders = orders.filter((o) => o.status === 'ready');
  const deliveringOrders = orders.filter((o) => o.status === 'out_for_delivery');
  const completedOrders = orders.filter((o) => o.status === 'delivered');

  return (
    <div className="fade-in">
      <div className="r-stats-row">
        <div className="stat-card r-stat-card">
          <div className="stat-value r-stat-pending">{pendingOrders.length}</div>
          <div className="stat-label">En attente</div>
        </div>
        <div className="stat-card r-stat-card">
          <div className="stat-value r-stat-preparing">{preparingOrders.length}</div>
          <div className="stat-label">En préparation</div>
        </div>
      </div>

      {pendingOrders.length > 0 && (
        <section className="r-orders-section">
          <h2 className="section-title r-section-pending">
            <Flame size={20} /> NOUVELLES COMMANDES ({pendingOrders.length})
          </h2>
          <div className="grid grid-2">
            {pendingOrders.map((order) => (
              <PendingOrderCard key={order.id} order={order} onAccept={onAccept} />
            ))}
          </div>
        </section>
      )}

      <h2 className="section-title r-section-preparing">
        <ChefHat size={18} /> En Préparation ({preparingOrders.length})
      </h2>
      {preparingOrders.length === 0 && pendingOrders.length === 0 ? (
        <div className="empty-state">
          <Coffee size={36} className="r-empty-icon" />
          <h3>La cuisine est calme</h3>
          <p>Les commandes acceptées apparaîtront ici.</p>
        </div>
      ) : (
        <div className="grid grid-3">
          {preparingOrders.map((order) => (
            <PreparingOrderCard key={order.id} order={order} onMarkReady={onMarkReady} />
          ))}
        </div>
      )}

      {readyOrders.length > 0 && (
        <section className="r-orders-ready">
          <h2 className="section-title r-section-ready">
            <Package size={20} /> EN ATTENTE DE LIVREUR ({readyOrders.length})
          </h2>
          <div className="grid grid-3">
            {readyOrders.map((order) => (
              <ReadyOrderCard key={order.id} order={order} />
            ))}
          </div>
        </section>
      )}

      <section className="r-orders-history">
        <h2 className="section-title">Expédiées & Livrées</h2>
        {deliveringOrders.length === 0 && completedOrders.length === 0 ? (
          <p className="r-history-empty">Aucun historique pour l&apos;instant.</p>
        ) : (
          <div className="grid grid-2">
            {[...deliveringOrders, ...completedOrders].map((order) => (
              <HistoryOrderRow key={order.id} order={order} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function minutesSince(date: string) {
  return Math.floor((Date.now() - new Date(date).getTime()) / 60000);
}

function PendingOrderCard({ order, onAccept }: { order: Order; onAccept: (id: number) => void }) {
  const itemsCount = order.items?.reduce((acc, curr) => acc + curr.quantity, 0) || 0;
  return (
    <div className="card r-pending-card">
      <div className="card-header r-pending-header">
        <div>
          <h3 className="r-pending-id">Commande #{order.id}</h3>
          <p className="r-pending-time">
            <Clock size={13} color="var(--accent)" /> Il y a {minutesSince(order.createdAt)} min
          </p>
        </div>
        <div className="r-pending-total">
          <span>{order.total} DA</span>
          <StatusBadge status={order.status as OrderStatus} />
        </div>
      </div>

      <div className="r-pending-customer">
        <div className="r-pending-customer-label">
          <User size={13} /> Client:
        </div>
        <div className="r-pending-customer-name">{order.customer?.name}</div>
        <div className="r-pending-customer-phone">
          <Phone size={11} /> {order.customer?.phone}
        </div>
      </div>

      <div className="r-pending-items">
        <div className="r-pending-items-label">Articles ({itemsCount})</div>
        <div className="r-pending-items-list">
          {order.items?.map((item) => (
            <div key={item.id} className="r-pending-item">
              <span>
                <span className="r-pending-item-qty">{item.quantity}x</span>
                {item.product?.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      <button className="btn btn-primary btn-block r-pending-cta" onClick={() => onAccept(order.id)}>
        <CheckCircle size={18} /> Accepter & Préparer
      </button>
    </div>
  );
}

function PreparingOrderCard({ order, onMarkReady }: { order: Order; onMarkReady: (id: number) => void }) {
  return (
    <div className="card r-preparing-card">
      <div className="card-header">
        <div>
          <h3 className="r-preparing-id">#{order.id}</h3>
          <p className="r-preparing-time">
            <Clock size={10} /> Acceptée il y a {minutesSince(order.updatedAt || order.createdAt)} min
          </p>
        </div>
        <StatusBadge status={order.status as OrderStatus} />
      </div>

      <ul className="r-preparing-items">
        {order.items?.map((item) => (
          <li key={item.id}>
            <strong>{item.quantity}x</strong> {item.product?.name}
          </li>
        ))}
      </ul>

      <button className="btn btn-info btn-block" onClick={() => onMarkReady(order.id)}>
        <CheckCircle2 size={16} /> Prêt (Appeler Livreur)
      </button>
    </div>
  );
}

function ReadyOrderCard({ order }: { order: Order }) {
  return (
    <div className="card r-ready-card">
      <div className="card-header r-ready-header">
        <div>
          <h3 className="r-ready-id">Commande #{order.id}</h3>
          <div className="r-ready-time">Prête depuis {minutesSince(order.updatedAt || order.createdAt)} min</div>
        </div>
        <span className="pulse-icon r-ready-pill">RECHERCHE...</span>
      </div>
      <div className="r-ready-body">
        <div>
          <strong>Client:</strong> {order.customer?.name}
        </div>
        <div>
          <strong>Total:</strong> <span className="r-ready-amount">{order.total} DA</span>
        </div>
      </div>
    </div>
  );
}

function HistoryOrderRow({ order }: { order: Order }) {
  const isDelivered = order.status === 'delivered';
  return (
    <div className={`card r-history-row ${isDelivered ? 'is-delivered' : ''}`}>
      <div className="r-history-meta">
        <strong>#{order.id}</strong> — {order.total} DA
        <div className="r-history-sub">
          {order.status === 'out_for_delivery' ? (
            <span className="r-history-delivering">
              <Truck size={13} /> Livreur: {order.driver?.name}
            </span>
          ) : (
            <span className="r-history-delivered">
              <CheckCircle2 size={13} /> Livrée
            </span>
          )}
        </div>
      </div>
      <StatusBadge status={order.status as OrderStatus} />
    </div>
  );
}
