'use client';

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Navbar from '@/components/Navbar';
import { Clock, MapPin, CheckCircle, XCircle, Users, ArrowLeft } from 'lucide-react';

interface Place {
    id: number;
    name: string;
    type: string;
    address: string;
    description: string;
    icon: string;
}

interface Reservation {
    id: number;
    queueNumber: number;
    status: string;
    date: string;
    estimatedWaitMinutes: number;
    place: Place;
}

export default function ReservationPage() {
    const user = useAuthStore(state => state.user);
    const loadUser = useAuthStore(state => state.loadUser);
    const router = useRouter();
    const [places, setPlaces] = useState<Place[]>([]);
    const [myReservations, setMyReservations] = useState<Reservation[]>([]);
    const [loading, setLoading] = useState(true);
    const [bookingPlaceId, setBookingPlaceId] = useState<number | null>(null);

    useEffect(() => {
        loadUser();
    }, [loadUser]);

    useEffect(() => {
        if (!user) return;
        fetchData();
    }, [user]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [placesRes, reservationsRes] = await Promise.all([
                api.get('/places'),
                api.get('/reservations/my'),
            ]);
            setPlaces(placesRes.data);
            setMyReservations(reservationsRes.data);
        } catch (err) {
            console.error('Error fetching reservation data:', err);
        } finally {
            setLoading(false);
        }
    };

    const bookSpot = async (placeId: number) => {
        try {
            setBookingPlaceId(placeId);
            await api.post('/reservations', { placeId });
            await fetchData();
        } catch (err) {
            console.error('Error booking spot:', err);
        } finally {
            setBookingPlaceId(null);
        }
    };

    const cancelReservation = async (id: number) => {
        try {
            await api.put(`/reservations/${id}/cancel`);
            await fetchData();
        } catch (err) {
            console.error('Error cancelling:', err);
        }
    };

    if (!user) {
        return (
            <div className="auth-page">
                <div className="pulse" style={{ fontSize: '2rem', fontWeight: 900 }}>GO-DELIVERY</div>
            </div>
        );
    }

    const typeLabels: Record<string, string> = {
        doctor: '🩺 Médecin',
        clinic: '🏥 Clinique',
        government: '🏢 Administration',
        other: '📮 Autre',
    };

    const statusLabels: Record<string, { label: string; color: string }> = {
        waiting: { label: 'En attente', color: '#f39c12' },
        called: { label: 'Appelé', color: '#27ae60' },
        done: { label: 'Terminé', color: '#2ecc71' },
        cancelled: { label: 'Annulé', color: '#e74c3c' },
    };

    const activeReservations = myReservations.filter(r => r.status === 'waiting' || r.status === 'called');

    return (
        <div className="app-layout">
            <Navbar />
            <div className="container fade-in" style={{ maxWidth: '900px', margin: '0 auto', padding: '30px 20px' }}>

                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '30px' }}>
                    <button onClick={() => router.push('/')} style={{ background: 'var(--bg-elevated)', border: 'none', color: 'var(--text)', padding: '10px', borderRadius: '12px', cursor: 'pointer', display: 'flex' }}>
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 style={{ fontSize: '1.8rem', fontWeight: 900, margin: 0 }}>
                            <span style={{ color: '#ff4757' }}>📋</span> Réservation de File
                        </h1>
                        <p style={{ opacity: 0.6, margin: 0, fontSize: '0.9rem' }}>Réservez votre place dans la file d&apos;attente</p>
                    </div>
                </div>

                {/* Active Reservations */}
                {activeReservations.length > 0 && (
                    <div style={{ marginBottom: '40px' }}>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Clock size={20} color="#f39c12" /> Mes réservations actives
                        </h2>
                        <div style={{ display: 'grid', gap: '16px' }}>
                            {activeReservations.map(res => (
                                <div key={res.id} style={{
                                    background: 'var(--bg-card)',
                                    borderRadius: '16px',
                                    padding: '20px',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    flexWrap: 'wrap',
                                    gap: '16px',
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                        <div style={{
                                            width: '56px', height: '56px', borderRadius: '14px',
                                            background: 'rgba(255,71,87,0.1)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '1.8rem'
                                        }}>
                                            {res.place?.icon || '📋'}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: '1rem' }}>{res.place?.name}</div>
                                            <div style={{ opacity: 0.6, fontSize: '0.85rem', marginTop: '4px' }}>
                                                <MapPin size={12} style={{ display: 'inline', marginRight: '4px' }} />
                                                {res.place?.address}
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#ff4757' }}>#{res.queueNumber}</div>
                                            <div style={{ fontSize: '0.75rem', opacity: 0.5 }}>Votre numéro</div>
                                        </div>

                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ fontSize: '1rem', fontWeight: 600, color: statusLabels[res.status]?.color }}>
                                                {statusLabels[res.status]?.label}
                                            </div>
                                            <div style={{ fontSize: '0.75rem', opacity: 0.5 }}>~{res.estimatedWaitMinutes} min</div>
                                        </div>

                                        <button
                                            onClick={() => cancelReservation(res.id)}
                                            style={{
                                                background: 'rgba(255,71,87,0.1)',
                                                color: '#ff4757',
                                                border: '1px solid rgba(255,71,87,0.2)',
                                                padding: '8px 16px',
                                                borderRadius: '10px',
                                                cursor: 'pointer',
                                                fontSize: '0.85rem',
                                                fontWeight: 600,
                                                display: 'flex', alignItems: 'center', gap: '6px',
                                            }}
                                        >
                                            <XCircle size={14} /> Annuler
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Places List */}
                <div>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Users size={20} color="#ff4757" /> Établissements disponibles
                    </h2>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '40px', opacity: 0.5 }}>
                            <div className="pulse" style={{ fontSize: '1.2rem' }}>Chargement...</div>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                            {places.map(place => {
                                const hasActiveBooking = activeReservations.some(r => r.place?.id === place.id);
                                return (
                                    <div key={place.id} style={{
                                        background: 'var(--bg-card)',
                                        borderRadius: '16px',
                                        padding: '24px',
                                        border: '1px solid rgba(255,255,255,0.08)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '12px',
                                        transition: 'transform 0.2s, border-color 0.2s',
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{
                                                width: '48px', height: '48px', borderRadius: '12px',
                                                background: 'rgba(255,71,87,0.1)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: '1.5rem'
                                            }}>
                                                {place.icon}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 700 }}>{place.name}</div>
                                                <div style={{ fontSize: '0.8rem', opacity: 0.5 }}>{typeLabels[place.type] || place.type}</div>
                                            </div>
                                        </div>

                                        <p style={{ opacity: 0.7, fontSize: '0.85rem', margin: 0 }}>{place.description}</p>

                                        <div style={{ fontSize: '0.8rem', opacity: 0.5, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <MapPin size={12} /> {place.address}
                                        </div>

                                        <button
                                            onClick={() => bookSpot(place.id)}
                                            disabled={hasActiveBooking || bookingPlaceId === place.id}
                                            style={{
                                                width: '100%',
                                                padding: '12px',
                                                borderRadius: '12px',
                                                border: 'none',
                                                fontWeight: 700,
                                                fontSize: '0.9rem',
                                                cursor: hasActiveBooking ? 'not-allowed' : 'pointer',
                                                background: hasActiveBooking ? 'rgba(255,255,255,0.05)' : 'var(--primary)',
                                                color: hasActiveBooking ? 'var(--text-muted)' : 'white',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                                transition: 'all 0.2s',
                                            }}
                                        >
                                            {hasActiveBooking ? (
                                                <><CheckCircle size={16} /> Déjà réservé</>
                                            ) : bookingPlaceId === place.id ? (
                                                'Réservation...'
                                            ) : (
                                                <><Users size={16} /> Prendre un numéro</>
                                            )}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* History */}
                {myReservations.filter(r => r.status === 'done' || r.status === 'cancelled').length > 0 && (
                    <div style={{ marginTop: '40px' }}>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '12px', opacity: 0.6 }}>Historique</h2>
                        <div style={{ display: 'grid', gap: '8px' }}>
                            {myReservations.filter(r => r.status === 'done' || r.status === 'cancelled').map(res => (
                                <div key={res.id} style={{
                                    background: 'var(--bg-card)',
                                    borderRadius: '12px',
                                    padding: '14px 20px',
                                    border: '1px solid rgba(255,255,255,0.05)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    opacity: 0.6,
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span>{res.place?.icon}</span>
                                        <span style={{ fontWeight: 600 }}>{res.place?.name}</span>
                                        <span style={{ fontSize: '0.8rem' }}>#{res.queueNumber}</span>
                                    </div>
                                    <span style={{ color: statusLabels[res.status]?.color, fontWeight: 600, fontSize: '0.85rem' }}>
                                        {statusLabels[res.status]?.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
