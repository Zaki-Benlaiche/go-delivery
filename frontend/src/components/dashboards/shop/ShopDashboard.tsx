'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  ClipboardList, Truck, CheckCircle2, Clock, Phone, User,
  MapPin, ListChecks, Settings, Power, Store, ChefHat, Flame, Package,
  X,
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
// boucherie). Flow mirrors the restaurant one because shops now own the
// order lifecycle:
//   pending → owner accepts (preparing) → owner sets price (ready) → driver delivers
// Same component for both roles so any future flow change lands in one place;
// branding flips via the `kind` prop (icon, label, accent colour).
export default function ShopDashboard({ kind }: ShopDashboardProps) {
  const orders = useOrderStore((s) => s.orders);
  const fetchOrders = useOrderStore((s) => s.fetchOrders);
  const updateStatus = useOrderStore((s) => s.updateStatus);
  const restaurant = useMenuStore((s) => s.restaurant);
  const fetchMenu = useMenuStore((s) => s.fetchMenu);
  const updateRestaurant = useMenuStore((s) => s.updateRestaurant);
  const toggleOpenStatus = useMenuStore((s) => s.toggleOpenStatus);
  const addNotification = useNotificationStore((s) => s.addNotification);

  const [activeTab, setActiveTab] = useState<'orders' | 'settings'>('orders');
  // When the owner clicks "Prêt" we open a modal to capture the receipt
  // total — the driver inherits it and the customer sees the final price.
  const [pricingOrderId, setPricingOrderId] = useState<number | null>(null);
  const [pricingTotal, setPricingTotal] = useState('');
  const [pricingSubmitting, setPricingSubmitting] = useState(false);

  useEffect(() => {
    fetchOrders();
    fetchMenu();
  }, [fetchOrders, fetchMenu]);

  // Buckets: pending and preparing are the shop's work surface; ready+delivery
  // are post-handoff visibility; delivered is history.
  const pendingOrders = useMemo(() => orders.filter((o) => o.status === 'pending'), [orders]);
  const preparingOrders = useMemo(() => orders.filter((o) => o.status === 'accepted' || o.status === 'preparing'), [orders]);
  const readyOrders = useMemo(() => orders.filter((o) => o.status === 'ready'), [orders]);
  const inDelivery = useMemo(() => orders.filter((o) => o.status === 'out_for_delivery'), [orders]);
  const completed = useMemo(() => orders.filter((o) => o.status === 'delivered'), [orders]);

  const brand = BRAND[kind];

  const handleAccept = (orderId: number) => updateStatus(orderId, 'preparing');

  const openPricingModal = (order: Order) => {
    setPricingOrderId(order.id);
    setPricingTotal(order.total > 0 ? String(order.total) : '');
  };

  const submitPricing = async () => {
    if (pricingOrderId == null) return;
    const t = Number(pricingTotal);
    if (!Number.isFinite(t) || t < 0) return;
    setPricingSubmitting(true);
    try {
      await updateStatus(pricingOrderId, 'ready', { total: t });
      addNotification({
        type: 'info',
        title: 'Commande prête',
        message: `Total: ${t} DA — les livreurs sont notifiés.`,
        icon: '✅',
        color: 'var(--success)',
      });
      setPricingOrderId(null);
      setPricingTotal('');
    } finally {
      setPricingSubmitting(false);
    }
  };

  const pricingOrder = pricingOrderId != null ? orders.find((o) => o.id === pricingOrderId) : null;

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
              <ClipboardList size={16} /> Commandes ({pendingOrders.length + preparingOrders.length})
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
          pending={pendingOrders}
          preparing={preparingOrders}
          ready={readyOrders}
          inDelivery={inDelivery}
          completed={completed}
          onAccept={handleAccept}
          onMarkReady={openPricingModal}
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

      {pricingOrder && (
        <PricingModal
          order={pricingOrder}
          value={pricingTotal}
          onChange={setPricingTotal}
          onSubmit={submitPricing}
          onClose={() => setPricingOrderId(null)}
          submitting={pricingSubmitting}
        />
      )}
    </div>
  );
}

const BRAND: Record<ShopKind, { label: string; subtitle: string; icon: React.ReactNode; color: string; bg: string }> = {
  superette: {
    label: 'Portail Supérette',
    subtitle: 'Les clients envoient leurs listes — vous les préparez, le livreur les emporte.',
    icon: <Store size={22} />,
    color: 'var(--role-superette)',
    bg: 'var(--teal-glow)',
  },
  boucherie: {
    label: 'Portail Boucherie',
    subtitle: 'Demandes de viande — vous préparez la commande puis le livreur passe la chercher.',
    icon: <Store size={22} />,
    color: 'var(--role-boucherie)',
    bg: 'rgba(190, 18, 60, 0.10)',
  },
};

function OrdersFeed({
  kind,
  pending,
  preparing,
  ready,
  inDelivery,
  completed,
  onAccept,
  onMarkReady,
}: {
  kind: ShopKind;
  pending: Order[];
  preparing: Order[];
  ready: Order[];
  inDelivery: Order[];
  completed: Order[];
  onAccept: (id: number) => void;
  onMarkReady: (order: Order) => void;
}) {
  const brand = BRAND[kind];
  const totalActive = pending.length + preparing.length + ready.length + inDelivery.length;

  return (
    <div className="fade-in shop-orders">
      <div className="shop-stats">
        <StatPill label="Nouvelles" value={pending.length} color="var(--primary)" />
        <StatPill label="En préparation" value={preparing.length} color="var(--info)" />
        <StatPill label="Attente livreur" value={ready.length} color="var(--accent)" />
        <StatPill label="En livraison" value={inDelivery.length} color="var(--role-driver)" />
      </div>

      {totalActive === 0 ? (
        <div className="empty-state shop-empty">
          <div className="shop-empty-icon" style={{ background: brand.bg, color: brand.color }}>
            <ListChecks size={32} />
          </div>
          <h3>Aucune commande pour l&apos;instant</h3>
          <p>Les listes envoyées par les clients apparaîtront ici en temps réel.</p>
        </div>
      ) : (
        <>
          {pending.length > 0 && (
            <section className="shop-section">
              <h2 className="shop-section-title shop-section-pending">
                <Flame size={18} /> NOUVELLES LISTES ({pending.length})
              </h2>
              <div className="grid grid-2">
                {pending.map((order) => (
                  <ShoppingListCard
                    key={order.id}
                    order={order}
                    brandColor={brand.color}
                    variant="pending"
                    onAccept={() => onAccept(order.id)}
                  />
                ))}
              </div>
            </section>
          )}

          {preparing.length > 0 && (
            <section className="shop-section">
              <h2 className="shop-section-title shop-section-preparing">
                <ChefHat size={18} /> En préparation ({preparing.length})
              </h2>
              <div className="grid grid-2">
                {preparing.map((order) => (
                  <ShoppingListCard
                    key={order.id}
                    order={order}
                    brandColor={brand.color}
                    variant="preparing"
                    onMarkReady={() => onMarkReady(order)}
                  />
                ))}
              </div>
            </section>
          )}

          {ready.length > 0 && (
            <section className="shop-section">
              <h2 className="shop-section-title shop-section-ready">
                <Package size={18} /> Prêtes — attente livreur ({ready.length})
              </h2>
              <div className="grid grid-2">
                {ready.map((order) => (
                  <ShoppingListCard key={order.id} order={order} brandColor={brand.color} variant="ready" />
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
                  <ShoppingListCard key={order.id} order={order} brandColor={brand.color} variant="delivery" />
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

type CardVariant = 'pending' | 'preparing' | 'ready' | 'delivery';

function ShoppingListCard({
  order,
  brandColor,
  variant,
  onAccept,
  onMarkReady,
}: {
  order: Order;
  brandColor: string;
  variant: CardVariant;
  onAccept?: () => void;
  onMarkReady?: () => void;
}) {
  const minutesAgo = Math.max(0, Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 60000));

  return (
    <div className={`card shop-list-card is-${variant}`}>
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
          <ListChecks size={12} /> Liste demandée
        </div>
        <pre className="shop-list-card-list-pre">{order.shoppingList || '(vide)'}</pre>
      </div>

      {order.deliveryAddress && (
        <div className="shop-list-card-address">
          <MapPin size={12} /> {order.deliveryAddress}
        </div>
      )}

      {(variant === 'ready' || variant === 'delivery') && order.total > 0 && (
        <div className="shop-list-card-total">
          Total client&nbsp;: <strong>{order.total} DA</strong>
        </div>
      )}

      {variant === 'delivery' && order.driver && (
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

      {variant === 'pending' && onAccept && (
        <button className="btn btn-primary btn-block shop-list-card-cta" onClick={onAccept}>
          <CheckCircle2 size={16} /> Accepter & Préparer
        </button>
      )}

      {variant === 'preparing' && onMarkReady && (
        <button className="btn btn-info btn-block shop-list-card-cta" onClick={onMarkReady}>
          <Package size={16} /> Prête (saisir le prix)
        </button>
      )}

      {variant === 'ready' && (
        <div className="shop-list-card-waiting">
          <span className="pulse-dot" />
          En attente d&apos;un livreur…
        </div>
      )}
    </div>
  );
}

function PricingModal({
  order,
  value,
  onChange,
  onSubmit,
  onClose,
  submitting,
}: {
  order: Order;
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  onClose: () => void;
  submitting: boolean;
}) {
  const numeric = Number(value);
  const canSubmit = Number.isFinite(numeric) && numeric >= 0 && value !== '';

  return (
    <div className="rd-modal-overlay" onClick={onClose}>
      <div className="card fade-in rd-modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="rd-modal-title">Prix final — Commande #{order.id}</h2>
        <p className="shop-modal-help">
          Indiquez le prix total que le client doit payer pour les articles (sans la livraison). Le livreur ajoutera ses frais.
        </p>

        <div className="shop-modal-recap">
          <div className="shop-modal-recap-label">Liste préparée</div>
          <pre className="shop-modal-recap-list">{order.shoppingList || '(vide)'}</pre>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (canSubmit && !submitting) onSubmit();
          }}
          className="rd-modal-form"
        >
          <div className="form-group rd-modal-field">
            <label>Prix total (DA)</label>
            <input
              type="number"
              min={0}
              required
              autoFocus
              placeholder="ex: 1850"
              value={value}
              onChange={(e) => onChange(e.target.value)}
            />
          </div>
          <div className="rd-modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
              <X size={14} /> Annuler
            </button>
            <button type="submit" className="btn btn-primary" disabled={!canSubmit || submitting}>
              {submitting ? '...' : 'Confirmer & notifier les livreurs'}
            </button>
          </div>
        </form>
      </div>
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
