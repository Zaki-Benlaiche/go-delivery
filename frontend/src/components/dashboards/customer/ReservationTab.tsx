'use client';

import React, { useState } from 'react';
import { ClipboardList, Clock, Users, MapPin, XCircle, CheckCircle } from 'lucide-react';
import { useReservationStore, type MyReservation, type PlaceWithQueue } from '@/store/reservationStore';
import { RES_STATUS_COLORS, RES_STATUS_LABELS, PLACE_TYPE_LABELS } from './utils';

// Reservation flow for the customer. Self-contained: pulls everything it needs
// from useReservationStore via atomic selectors so unrelated order updates
// don't re-render this tab.
export default function ReservationTab() {
  const places = useReservationStore((s) => s.places);
  const myReservations = useReservationStore((s) => s.myReservations);
  const resLoaded = useReservationStore((s) => s.loaded);
  const bookReservationStore = useReservationStore((s) => s.bookSpot);
  const cancelReservationStore = useReservationStore((s) => s.cancelReservation);

  const [bookingPlaceId, setBookingPlaceId] = useState<number | null>(null);

  const bookSpot = async (placeId: number) => {
    try {
      setBookingPlaceId(placeId);
      await bookReservationStore(placeId);
    } catch (err) {
      console.error('Error booking spot:', err);
    } finally {
      setBookingPlaceId(null);
    }
  };

  const cancelReservation = async (id: number) => {
    try {
      await cancelReservationStore(id);
    } catch (err) {
      console.error('Error cancelling:', err);
    }
  };

  const activeReservations = myReservations.filter((r) => r.status === 'waiting' || r.status === 'called');
  const pastReservations = myReservations.filter((r) => r.status === 'done' || r.status === 'cancelled');

  return (
    <div className="fade-in res-tab">
      <header className="res-banner">
        <h1>
          <ClipboardList size={24} /> Réservation de File
        </h1>
        <p>Réservez votre place et suivez votre position en temps réel.</p>
      </header>

      {activeReservations.length > 0 && (
        <section className="res-section">
          <h2 className="res-section-title">
            <Clock size={20} color="#1e90ff" /> Vos réservations actives
          </h2>
          <div className="res-active-grid">
            {activeReservations.map((res) => (
              <ActiveReservationCard key={res.id} res={res} onCancel={cancelReservation} />
            ))}
          </div>
        </section>
      )}

      <h2 className="res-section-title">
        <Users size={20} color="#1e90ff" /> Établissements
      </h2>

      {!resLoaded && places.length === 0 ? (
        <div className="res-loading">
          <div className="pulse-icon">Chargement...</div>
        </div>
      ) : (
        <div className="res-places-grid">
          {places.map((place) => (
            <PlaceCard
              key={place.id}
              place={place}
              hasActive={activeReservations.some((r) => r.place?.id === place.id)}
              isBooking={bookingPlaceId === place.id}
              onBook={bookSpot}
            />
          ))}
        </div>
      )}

      {pastReservations.length > 0 && (
        <section className="res-history">
          <h2>Historique</h2>
          <div className="res-history-list">
            {pastReservations.map((res) => (
              <div key={res.id} className="res-history-row">
                <div>
                  <span>{res.place?.icon}</span>
                  <span className="res-history-name">{res.place?.name}</span>
                  <span className="res-history-num">#{res.queueNumber}</span>
                </div>
                <span style={{ color: RES_STATUS_COLORS[res.status] }}>{RES_STATUS_LABELS[res.status]}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// Single active reservation: live queue stats and a cancel button.
function ActiveReservationCard({ res, onCancel }: { res: MyReservation; onCancel: (id: number) => void }) {
  return (
    <div className="res-active-card">
      <div className="res-active-header">
        <div className="res-active-place">
          <div className="icon-box icon-box-md res-icon">{res.place?.icon || <ClipboardList size={20} />}</div>
          <div className="res-active-meta">
            <div className="res-active-name">{res.place?.name}</div>
            <div className="res-active-addr">
              <MapPin size={11} /> {res.place?.address}
            </div>
          </div>
        </div>
        <button onClick={() => onCancel(res.id)} className="btn btn-sm res-cancel-btn">
          <XCircle size={13} /> Annuler
        </button>
      </div>

      <div className="res-stats">
        <div>
          <div className="res-stat-num res-stat-blue">#{res.queueNumber}</div>
          <div className="res-stat-label">Numéro</div>
        </div>
        <div>
          <div className="res-stat-num res-stat-orange">{res.peopleBefore ?? 0}</div>
          <div className="res-stat-label">Avant vous</div>
        </div>
        <div>
          <div className="res-stat-num res-stat-green">~{res.estimatedWaitMinutes ?? 0}</div>
          <div className="res-stat-label">Minutes</div>
        </div>
      </div>

      <div className="res-status-row">
        <span
          className={`res-status-badge ${res.status === 'called' ? 'res-status-called' : 'res-status-waiting'}`}
          style={{ color: RES_STATUS_COLORS[res.status] }}
        >
          {res.status === 'called' ? '📞 Vous êtes appelé !' : `⏳ ${RES_STATUS_LABELS[res.status]}`}
        </span>
      </div>
    </div>
  );
}

// One place card in the "Établissements" grid.
function PlaceCard({
  place,
  hasActive,
  isBooking,
  onBook,
}: {
  place: PlaceWithQueue;
  hasActive: boolean;
  isBooking: boolean;
  onBook: (id: number) => void;
}) {
  const disabled = !place.isOpen || hasActive || isBooking;
  return (
    <div className="card place-card" style={{ opacity: place.isOpen ? 1 : 0.75 }}>
      <div className="place-head">
        <div className="icon-box icon-box-md place-icon">{place.icon}</div>
        <div className="place-meta">
          <div className="place-name">{place.name}</div>
          <div className="place-type">{PLACE_TYPE_LABELS[place.type] || place.type}</div>
        </div>
        <span className={`place-badge ${place.isOpen ? 'place-open' : 'place-closed'}`}>
          <span className="place-dot" />
          {place.isOpen ? 'Ouvert' : 'Fermé'}
        </span>
      </div>
      <p className="place-desc">{place.description}</p>
      <div className="place-footer">
        <span className="place-addr">
          <MapPin size={11} /> {place.address}
        </span>
        <span className="place-waiting">{place.waitingCount} att.</span>
      </div>
      <button
        onClick={() => onBook(place.id)}
        disabled={disabled}
        className={`btn btn-block place-cta ${!place.isOpen ? 'place-cta-closed' : hasActive ? 'place-cta-active' : 'place-cta-open'}`}
      >
        {!place.isOpen ? (
          <>
            <XCircle size={14} /> Fermé actuellement
          </>
        ) : hasActive ? (
          <>
            <CheckCircle size={14} /> Déjà réservé
          </>
        ) : isBooking ? (
          'Réservation...'
        ) : (
          <>
            <ClipboardList size={14} /> Prendre un numéro
          </>
        )}
      </button>
    </div>
  );
}
