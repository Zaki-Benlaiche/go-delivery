'use client';

import React, { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';
import { Phone, CheckCircle, XCircle, Clock, Users, ClipboardList, TrendingUp } from 'lucide-react';

interface PlaceReservation {
    id: number;
    queueNumber: number;
    status: string;
    date: string;
    estimatedWaitMinutes: number;
    user: { id: number; name: string; email: string; phone: string };
    place: { id: number; name: string; icon: string; type: string };
}

interface PlaceInfo {
    id: number; name: string; type: string; address: string; description: string; icon: string;
}

export default function PlaceDashboard() {
    const [place, setPlace] = useState<PlaceInfo | null>(null);
    const [reservations, setReservations] = useState<PlaceReservation[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        try {
            const res = await api.get('/reservations/my-place');
            setPlace(res.data.place);
            setReservations(res.data.reservations);
        } catch (err) {
            console.error('Error fetching place data:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, [fetchData]);

    const updateStatus = async (id: number, status: string) => {
        try {
            await api.put(`/reservations/${id}/status`, { status });
            setReservations(prev => prev.map(r => r.id === id ? { ...r, status } : r));
        } catch (err) {
            console.error('Error updating:', err);
        }
    };

    const today = new Date().toISOString().split('T')[0];
    const todayReservations = reservations.filter(r => r.date === today);
    const waiting = todayReservations.filter(r => r.status === 'waiting');
    const called = todayReservations.filter(r => r.status === 'called');
    const done = todayReservations.filter(r => r.status === 'done');

    const statusColors: Record<string, string> = { waiting: '#f39c12', called: '#2ed573', done: '#27ae60', cancelled: '#e74c3c' };
    const statusLabels: Record<string, string> = { waiting: 'En attente', called: 'Appelé', done: 'Terminé', cancelled: 'Annulé' };

    if (loading) return <div className="empty-state"><div className="pulse" style={{ fontSize: '2rem' }}>Chargement...</div></div>;

    return (
        <div className="fade-in" style={{ maxWidth: '1000px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ background: 'linear-gradient(135deg, #1e90ff 0%, #4facfe 100%)', borderRadius: '20px', padding: '32px', marginBottom: '32px', color: 'white', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ fontSize: '3rem', background: 'rgba(255,255,255,0.15)', width: '80px', height: '80px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {place?.icon || '📋'}
                    </div>
                    <div>
                        <h1 style={{ fontSize: '1.8rem', fontWeight: 900, margin: 0 }}>{place?.name}</h1>
                        <p style={{ opacity: 0.85, margin: '4px 0 0', fontSize: '1rem' }}>{place?.address} — {place?.description}</p>
                    </div>
                </div>
                <div style={{ position: 'absolute', right: '5%', top: '50%', transform: 'translateY(-50%)', fontSize: '8rem', opacity: 0.1 }}>📋</div>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
                <div style={{ background: 'var(--bg-card)', borderRadius: '16px', padding: '20px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <Users size={24} color="#1e90ff" style={{ marginBottom: '8px' }} />
                    <div style={{ fontSize: '2rem', fontWeight: 900 }}>{todayReservations.length}</div>
                    <div style={{ fontSize: '0.8rem', opacity: 0.5 }}>Total aujourd&apos;hui</div>
                </div>
                <div style={{ background: 'var(--bg-card)', borderRadius: '16px', padding: '20px', textAlign: 'center', border: '1px solid rgba(243,156,18,0.2)' }}>
                    <Clock size={24} color="#f39c12" style={{ marginBottom: '8px' }} />
                    <div style={{ fontSize: '2rem', fontWeight: 900, color: '#f39c12' }}>{waiting.length}</div>
                    <div style={{ fontSize: '0.8rem', opacity: 0.5 }}>En attente</div>
                </div>
                <div style={{ background: 'var(--bg-card)', borderRadius: '16px', padding: '20px', textAlign: 'center', border: '1px solid rgba(46,213,115,0.2)' }}>
                    <Phone size={24} color="#2ed573" style={{ marginBottom: '8px' }} />
                    <div style={{ fontSize: '2rem', fontWeight: 900, color: '#2ed573' }}>{called.length}</div>
                    <div style={{ fontSize: '0.8rem', opacity: 0.5 }}>Appelés</div>
                </div>
                <div style={{ background: 'var(--bg-card)', borderRadius: '16px', padding: '20px', textAlign: 'center', border: '1px solid rgba(39,174,96,0.2)' }}>
                    <TrendingUp size={24} color="#27ae60" style={{ marginBottom: '8px' }} />
                    <div style={{ fontSize: '2rem', fontWeight: 900, color: '#27ae60' }}>{done.length}</div>
                    <div style={{ fontSize: '0.8rem', opacity: 0.5 }}>Terminés</div>
                </div>
            </div>

            {/* Queue Table */}
            <div style={{ background: 'var(--bg-card)', borderRadius: '20px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ClipboardList size={20} color="#1e90ff" /> File d&apos;attente du jour
                    </h2>
                    <button onClick={fetchData} style={{ background: 'rgba(30,144,255,0.1)', color: '#1e90ff', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
                        🔄 Actualiser
                    </button>
                </div>

                {todayReservations.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px', opacity: 0.5 }}>
                        <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🕐</div>
                        <p>Aucune réservation pour aujourd&apos;hui</p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)' }}>
                                    <th style={{ padding: '14px 20px', fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'left' }}>N°</th>
                                    <th style={{ padding: '14px 20px', fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'left' }}>Client</th>
                                    <th style={{ padding: '14px 20px', fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'left' }}>Téléphone</th>
                                    <th style={{ padding: '14px 20px', fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'left' }}>Statut</th>
                                    <th style={{ padding: '14px 20px', fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'left' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {todayReservations.sort((a, b) => a.queueNumber - b.queueNumber).map(res => (
                                    <tr key={res.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }}>
                                        <td style={{ padding: '16px 20px', fontWeight: 900, fontSize: '1.2rem', color: '#1e90ff' }}>#{res.queueNumber}</td>
                                        <td style={{ padding: '16px 20px', fontWeight: 600 }}>{res.user?.name}</td>
                                        <td style={{ padding: '16px 20px', color: 'var(--text-muted)' }}>{res.user?.phone || '—'}</td>
                                        <td style={{ padding: '16px 20px' }}>
                                            <span style={{
                                                padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700,
                                                background: `${statusColors[res.status]}20`, color: statusColors[res.status],
                                                textTransform: 'uppercase'
                                            }}>
                                                {statusLabels[res.status] || res.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px 20px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                            {res.status === 'waiting' && (
                                                <button onClick={() => updateStatus(res.id, 'called')} style={{ background: 'rgba(46,213,115,0.15)', color: '#2ed573', border: 'none', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <Phone size={14} /> Appeler
                                                </button>
                                            )}
                                            {res.status === 'called' && (
                                                <button onClick={() => updateStatus(res.id, 'done')} style={{ background: 'rgba(39,174,96,0.15)', color: '#27ae60', border: 'none', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <CheckCircle size={14} /> Terminé
                                                </button>
                                            )}
                                            {(res.status === 'waiting' || res.status === 'called') && (
                                                <button onClick={() => updateStatus(res.id, 'cancelled')} style={{ background: 'rgba(231,76,60,0.1)', color: '#e74c3c', border: 'none', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <XCircle size={14} /> Annuler
                                                </button>
                                            )}
                                            {(res.status === 'done' || res.status === 'cancelled') && (
                                                <span style={{ fontSize: '0.85rem', opacity: 0.4 }}>—</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
