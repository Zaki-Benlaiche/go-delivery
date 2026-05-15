'use client';

import React from 'react';
import { Search, ShoppingCart, Heart, Clock, MapPin } from 'lucide-react';
import type { Restaurant } from '@/types';
import { renderMedia } from './utils';

interface ExploreTabProps {
  restaurants: Restaurant[];
  searchQuery: string;
  onSearchChange: (v: string) => void;
  onRefresh: () => void;
  onOpenRestaurant: (r: Restaurant) => void;
}

// Home screen: hero banner with a search box, then a 3-column grid of
// restaurant/superette/boucherie cards.
export default function ExploreTab({
  restaurants,
  searchQuery,
  onSearchChange,
  onRefresh,
  onOpenRestaurant,
}: ExploreTabProps) {
  const filtered = restaurants.filter(
    (r) => r.name.toLowerCase().includes(searchQuery.toLowerCase()) || r.address.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="fade-in">
      <div className="explore-banner">
        <div className="explore-banner-inner">
          <h1>
            La faim n&apos;attend pas.
            <br />
            Nous non plus.
          </h1>
          <p>Faites-vous livrer vos plats préférés en moins de 30 minutes.</p>
          <div className="explore-search">
            <Search size={18} color="var(--text-muted)" className="explore-search-icon" />
            <input
              type="text"
              placeholder="Rechercher un restaurant..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </div>
      </div>

      <h2 className="section-title explore-section-title">
        A la Une
        <button className="btn btn-secondary btn-sm explore-refresh-btn" onClick={onRefresh}>
          <Search size={13} /> Rafraîchir
        </button>
      </h2>

      {restaurants.length === 0 ? (
        <div className="empty-state">
          <div className="pulse-icon explore-empty-icon">
            <ShoppingCart size={40} />
          </div>
          <h3>Chargement des restaurants...</h3>
        </div>
      ) : (
        <div className="grid grid-3">
          {filtered.map((r) => (
            <RestaurantCard key={r.id} restaurant={r} onOpen={onOpenRestaurant} />
          ))}
          {filtered.length === 0 && (
            <div className="explore-no-results">
              <Search size={36} />
              <h3>Aucun restaurant trouvé</h3>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function RestaurantCard({ restaurant, onOpen }: { restaurant: Restaurant; onOpen: (r: Restaurant) => void }) {
  return (
    <div className="card r-card" onClick={() => onOpen(restaurant)}>
      <div className="r-card-image">
        {renderMedia(restaurant.image, '🏪')}
        <div className="r-card-heart">
          <Heart size={15} />
        </div>
        <div className={`r-card-status ${restaurant.isOpen ? 'is-open' : 'is-closed'}`}>
          <span className="r-card-status-dot" />
          {restaurant.isOpen ? 'Ouvert' : 'Fermé'}
        </div>
        <div className="r-card-eta">
          <Clock size={11} color="var(--primary)" /> 30-40 min
        </div>
        {restaurant.type && restaurant.type !== 'restaurant' && (
          <div className={`r-card-type ${restaurant.type === 'boucherie' ? 'is-boucherie' : 'is-superette'}`}>
            {restaurant.type === 'boucherie' ? '🥩 Boucherie' : '🛒 Supérette'}
          </div>
        )}
      </div>
      <div className="r-card-body">
        <h3>{restaurant.name}</h3>
        <p className="r-card-address">
          <MapPin size={12} /> {restaurant.address}
        </p>
        {restaurant.description && <p className="r-card-desc">{restaurant.description}</p>}
      </div>
    </div>
  );
}
