'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  ClipboardList, Truck, CheckCircle2, Clock, Phone, User,
  MapPin, ListChecks, Settings, Power, Store,
} from 'lucide-react';
import { useOrderStore } from '@/store/orderStore';
import { useMenuStore } from '@/store/menuStore';
import { useNotificationStore } from '@/store/notificationStore';
import type { Order, OrderStatus } from '@/types';
import StatusBadge from '@/components/StatusBadge';

export type ShopKind = 'superette' | 'boucherie';

interface ShopDashboardProps {
  kind: ShopKind;
}

// Shared dashboard for the two shopping-list vendor roles (supérette and
// boucherie). The flow is intentionally lean: shops don't accept/prepare
// orders the way restaurants do — they get a read-only feed of incoming
// shopping lists so they can anticipate demand, and a settings card to keep
// their profile fresh. Drivers handle pickup + receipt total themselves.
//
// Same component for both roles so any future flow change lands in one place;
// branding flips via the `kind` prop (icon, label, accent colour).
export default function ShopDashboard({ kind }: ShopDashboardProps) {
  const orders = useOrderStore((s) => s.orders);
  const fetchOrders = useOrderStore((s) => s.fetchOrders);
  const restaurant = useMenuStore((s) => s.restaurant);
  const fetchMenu = useMenuStore((s) => s.fetchMenu);
  const updateRestaurant = useMenuStore((s) => s.updateRestaurant);
  const toggleOpenStatus = useMenuStore((s) => s.toggleOpenStatus);
  const addNotification = useNotificationStore((s) => s.addNotification);

  const [activeTab, setActiveTab] = useState<'orders' | 'settings'>('orders');

  useEffect(() => {
    fetchOrders();
    fetchMenu();
  }, [fetchOrders, fetchMenu]);

  // Buckets — same status taxonomy as Order, but the shop only cares about
  // "active runs" vs "delivered history". Shopping-list orders skip the
  // pending/accepted/preparing chain and land in `ready` immediately.
  const incoming = useMemo(() => orders.filter((o) => o.status === 'ready'), [orders]);
  const inDelivery = useMemo(() => orders.filter((o) => o.status === 'out_for_delivery'), [orders]);
  const completed = useMemo(() => orders.filter((o) => o.status === 'delivered'), [orders]);

  const brand = BRAND[kind];

  return (
    <div className="shop-app">
      <header className="shop-header">
        <div className="shop-header-title">
          <span className="shop-header-icon" style={{ background: brand.bg, color: brand.color }}>
            {brand.icon}
          </span>
          <div>
            <h1 className="page-title shop-header-h1">{brand.label}</h1>
            <p className="page-subtitle shop-header-sub">{brand.subtitle}</p>
          </div>
        </div>

        <div className="shop-header-actions">
          <button
            onClick={toggleOpenStatus}
            className={`shop-open-toggle ${restaurant?.isOpen ? 'is-open' : 'is-closed'}`}
            aria-pressed={!!restaurant?.isOpen}
          >
            <Power size={14} />
            {restaurant?.isOpen ? 'Ouvert' : 'Fermé'}
          </button>
          <div className="tab-bar shop-tabs">
            <button
              className={`tab-btn ${activeTab === 'orders' ? 'tab-btn-active' : 'tab-btn-inactive'}`}
              onClick={() => setActiveTab('orders')}
            >
              <ClipboardList size={16} /> Commandes ({incoming.length + inDelivery.length})
            </button>
            <button
              className={`tab-btn ${activeTab === 'settings' ? 'tab-btn-active' : 'tab-btn-inactive'}`}
              onClick={() => setActiveTab('settings')}
            >
              <Settings size={16} /> Paramètres
            </button>
          </div>
        </div>
      </header>

      {activeTab === 'orders' && (
        <OrdersFeed
          kind={kind}
          incoming={incoming}
          inDelivery={inDelivery}
          completed={completed}
        />
      )}

      {activeTab === 'settings' && restaurant && (
        <SettingsCard
          kind={kind}
          name={restaurant.name}
          description={restaurant.description}
          address={restaurant.address}
          onSave={async (patch) => {
            await updateRestaurant(patch);
            addNotification({
              type: 'info',
              title: 'Profil mis à jour',
              message: 'Vos informations sont enregistrées.',
              icon: '✅',
              color: 'var(--success)',
            });
          }}
        />
      )}
    </div>
  );
}

const BRAND: Record<ShopKind, { label: string; subtitle: string; icon: React.ReactNode; color: string; bg: string }> = {
  superette: {
    label: 'Portail Supérette',
    subtitle: 'Listes de courses en temps réel — le livreur achète puis livre.',
    icon: <Store size={22} />,
    color: 'var(--role-superette)',
    bg: 'var(--teal-glow)',
  },
  boucherie: {
    label: 'Portail Boucherie',
    subtitle: 'Demandes de viande — le livreur passe, achète et livre.',
    icon: <Store size={22} />,
    color: 'var(--role-boucherie)',
    bg: 'rgba(190, 18, 60, 0.10)',
  },
};

function OrdersFeed({
  kind,
  incoming,
  inDelivery,
  completed,
}: {
  kind: ShopKind;
  incoming: Order[];
  inDelivery: Order[];
  completed: Order[];
}) {
  const brand = BRAND[kind];
  const total = incoming.length + inDelivery.length;

  return (
    <div className="fade-in shop-orders">
      <div className="shop-stats">
        <StatPill label="Listes en attente" value={incoming.length} color="var(--accent)" />
        <StatPill label="En livraison" value={inDelivery.length} color="var(--info)" />
        <StatPill label="Livrées (total)" value={completed.length} color="var(--success)" />
      </div>

      {total === 0 ? (
        <div className="empty-state shop-empty">
          <div className="shop-empty-icon" style={{ background: brand.bg, color: brand.color }}>
            <ListChecks size={32} />
          </div>
          <h3>Aucune commande pour l&apos;instant</h3>
          <p>Les listes envoyées par les clients apparaîtront ici en temps réel.</p>
        </div>
      ) : (
        <>
          {incoming.length > 0 && (
            <section className="shop-section">
              <h2 className="shop-section-title shop-section-incoming">
                <span className="pulse-dot" /> Nouvelles listes ({incoming.length})
              </h2>
              <div className="grid grid-2">
                {incoming.map((order) => (
                  <ShoppingListCard key={order.id} order={order} brandColor={brand.color} status="ready" />
                ))}
              </div>
            </section>
          )}

          {inDelivery.length > 0 && (
            <section className="shop-section">
              <h2 className="shop-section-title shop-section-delivery">
                <Truck size={18} /> En livraison ({inDelivery.length})
              </h2>
              <div className="grid grid-2">
                {inDelivery.map((order) => (
                  <ShoppingListCard key={order.id} order={order} brandColor={brand.color} status="out_for_delivery" />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {completed.length > 0 && (
        <section className="shop-section shop-history">
          <h2 className="shop-section-title">Dernières livrées</h2>
          <div className="shop-history-list">
            {completed.slice(0, 10).map((order) => (
              <HistoryRow key={order.id} order={order} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function StatPill({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="shop-stat-pill" style={{ borderColor: color, color }}>
      <span className="shop-stat-pill-value" style={{ color }}>{value}</span>
      <span className="shop-stat-pill-label">{label}</span>
    </div>
  );
}

function ShoppingListCard({
  order,
  brandColor,
  status,
}: {
  order: Order;
  brandColor: string;
  status: 'ready' | 'out_for_delivery';
}) {
  const minutesAgo = Math.max(0, Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 60000));
  return (
    <div className={`card shop-list-card ${status === 'ready' ? 'is-incoming' : 'is-delivering'}`}>
      <div className="shop-list-card-header">
        <div className="shop-list-card-meta">
          <h3>Commande #{order.id}</h3>
          <span className="shop-list-card-time">
            <Clock size={11} /> il y a {minutesAgo} min
          </span>
        </div>
        <StatusBadge status={order.status as OrderStatus} />
      </div>

      <div className="shop-list-card-customer">
        <div className="shop-list-card-customer-icon" style={{ background: brandColor }}>
          <User size={14} />
        </div>
        <div className="shop-list-card-customer-info">
          <strong>{order.customer?.name || 'Client'}</strong>
          {order.customer?.phone && (
            <a href={`tel:${order.customer.phone}`} className="shop-list-card-phone">
              <Phone size={11} /> {order.customer.phone}
            </a>
          )}
        </div>
      </div>

      <div className="shop-list-card-list">
        <div className="shop-list-card-list-label">
          <ListChecks size={12} /> Liste de courses
        </div>
        <pre className="shop-list-card-list-pre">{order.shoppingList || '(vide)'}</pre>
      </div>

      {order.deliveryAddress && (
        <div className="shop-list-card-address">
          <MapPin size={12} /> {order.deliveryAddress}
        </div>
      )}

      {status === 'out_for_delivery' && order.driver && (
        <div className="shop-list-card-driver">
          <Truck size={13} />
          <span>
            Pris par <strong>{order.driver.name}</strong>
          </span>
          {order.driver.phone && (
            <a href={`tel:${order.driver.phone}`} className="shop-list-card-driver-call">
              <Phone size={12} />
            </a>
          )}
        </div>
      )}
    </div>
  );
}

function HistoryRow({ order }: { order: Order }) {
  return (
    <div className="shop-history-row">
      <div className="shop-history-row-meta">
        <CheckCircle2 size={14} color="var(--success)" />
        <span>
          <strong>#{order.id}</strong> · {order.customer?.name || 'Client'}
          {order.total > 0 && <> · {order.total} DA</>}
        </span>
      </div>
      <span className="shop-history-row-time">
        {new Date(order.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
      </span>
    </div>
  );
}

function SettingsCard({
  kind,
  name,
  description,
  address,
  onSave,
}: {
  kind: ShopKind;
  name: string;
  description: string;
  address: string;
  onSave: (patch: { name: string; description: string; address: string }) => Promise<void>;
}) {
  const [draftName, setDraftName] = useState(name);
  const [draftDescription, setDraftDescription] = useState(description);
  const [draftAddress, setDraftAddress] = useState(address);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDraftName(name);
    setDraftDescription(description);
    setDraftAddress(address);
  }, [name, description, address]);

  const brand = BRAND[kind];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({ name: draftName, description: draftDescription, address: draftAddress });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="card shop-settings fade-in">
      <div className="shop-settings-head">
        <span className="shop-settings-icon" style={{ background: brand.bg, color: brand.color }}>
          {brand.icon}
        </span>
        <div>
          <h2 className="shop-settings-title">Informations du commerce</h2>
          <p className="shop-settings-sub">
            Ce nom et cette adresse seront affichés aux clients qui parcourent l&apos;application.
          </p>
        </div>
      </div>

      <div className="form-group">
        <label>Nom du commerce</label>
        <input
          type="text"
          value={draftName}
          onChange={(e) => setDraftName(e.target.value)}
          placeholder={kind === 'boucherie' ? 'ex: Boucherie El Baraka' : 'ex: Supérette Diar El Hana'}
          required
        />
      </div>

      <div className="form-group">
        <label>Adresse</label>
        <input
          type="text"
          value={draftAddress}
          onChange={(e) => setDraftAddress(e.target.value)}
          placeholder="ex: Rue Mohamed V, Alger"
        />
      </div>

      <div className="form-group">
        <label>Description (visible aux clients)</label>
        <textarea
          value={draftDescription}
          onChange={(e) => setDraftDescription(e.target.value)}
          className="input"
          rows={3}
          placeholder={
            kind === 'boucherie'
              ? 'ex: Viande fraîche tous les jours, agneau et bœuf.'
              : 'ex: Produits frais, fruits, légumes, épicerie.'
          }
        />
      </div>

      <button type="submit" className="btn btn-primary btn-block shop-settings-submit" disabled={saving}>
        {saving ? '...' : 'Enregistrer'}
      </button>
    </form>
  );
}
