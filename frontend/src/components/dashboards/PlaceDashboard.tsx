'use client';

import React, { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';
import { Phone, CheckCircle, XCircle, Clock, Users, ClipboardList, TrendingUp, RefreshCw } from 'lucide-react';

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

    if (loading) return <div className="empty-state"><div className="pulse-icon" style={{ fontSize: '2rem' }}>Chargement...</div></div>;

    const statsData = [
        { icon: <Users size={22} />, value: todayReservations.length, label: "Total aujourd'hui", color: '#1e90ff', borderColor: 'rgba(30,144,255,0.2)' },
        { icon: <Clock size={22} />, value: waiting.length, label: 'En attente', color: '#f39c12', borderColor: 'rgba(243,156,18,0.2)' },
        { icon: <Phone size={22} />, value: called.length, label: 'Appelés', color: '#2ed573', borderColor: 'rgba(46,213,115,0.2)' },
        { icon: <TrendingUp size={22} />, value: done.length, label: 'Terminés', color: '#27ae60', borderColor: 'rgba(39,174,96,0.2)' },
    ];

    return (
        <div className="fade-in" style={{ maxWidth: '1000px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ background: 'var(--gradient-blue)', borderRadius: '18px', padding: 'clamp(20px, 4vw, 32px)', marginBottom: '28px', color: 'white', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: 'clamp(12px, 3vw, 20px)', flexWrap: 'wrap' }}>
                    <div className="icon-box icon-box-lg" style={{ background: 'rgba(255,255,255,0.15)', fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', flexShrink: 0 }}>
                        {place?.icon || <ClipboardList size={28} />}
                    </div>
                    <div style={{ minWidth: 0 }}>
                        <h1 style={{ fontSize: 'clamp(1.2rem, 4vw, 1.7rem)', fontWeight: 900, margin: 0, wordBreak: 'break-word' }}>{place?.name}</h1>
                        <p style={{ opacity: 0.85, margin: '4px 0 0', fontSize: 'clamp(0.78rem, 2vw, 0.95rem)', wordBreak: 'break-word' }}>{place?.address} — {place?.description}</p>
                    </div>
                </div>
            </div>

            {/* Stats Cards — 2 cols on mobile, 4 on desktop */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px', marginBottom: '28px' }}>
                {statsData.map((s, i) => (
                    <div key={i} className="stat-card" style={{ borderColor: s.borderColor }}>
                        <div style={{ marginBottom: '8px', color: s.color }}>{s.icon}</div>
                        <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
                        <div className="stat-label">{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Queue Table */}
            <div style={{ background: 'var(--bg-card)', borderRadius: '18px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                    <h2 style={{ margin: 0, fontSize: 'clamp(0.95rem, 2.5vw, 1.15rem)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ClipboardList size={18} color="#1e90ff" /> File d&apos;attente du jour
                    </h2>
                    <button onClick={fetchData} className="btn btn-sm" style={{ background: 'var(--info-glow)', color: '#1e90ff', border: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <RefreshCw size={13} /> Actualiser
                    </button>
                </div>

                {todayReservations.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 'clamp(30px, 6vw, 60px)', opacity: 0.5 }}>
                        <Clock size={40} style={{ marginBottom: '12px' }} />
                        <p>Aucune réservation pour aujourd&apos;hui</p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '460px' }}>
                            <thead>
                                <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)' }}>
                                    <th style={{ padding: '12px 16px', fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'left' }}>N°</th>
                                    <th style={{ padding: '12px 16px', fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'left' }}>Client</th>
                                    <th style={{ padding: '12px 16px', fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'left' }}>Téléphone</th>
                                    <th style={{ padding: '12px 16px', fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'left' }}>Statut</th>
                                    <th style={{ padding: '12px 16px', fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'left' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {todayReservations.sort((a, b) => a.queueNumber - b.queueNumber).map(res => (
                                    <tr key={res.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }}>
                                        <td style={{ padding: '14px 16px', fontWeight: 900, fontSize: '1.1rem', color: '#1e90ff' }}>#{res.queueNumber}</td>
                                        <td style={{ padding: '14px 16px', fontWeight: 600 }}>{res.user?.name}</td>
                                        <td style={{ padding: '14px 16px', color: 'var(--text-muted)' }}>{res.user?.phone || '—'}</td>
                                        <td style={{ padding: '14px 16px' }}>
                                            <span style={{
                                                padding: '4px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 700,
                                                background: `${statusColors[res.status]}20`, color: statusColors[res.status],
                                                textTransform: 'uppercase'
                                            }}>
                                                {statusLabels[res.status] || res.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '14px 16px' }}>
                                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                                {res.status === 'waiting' && (
                                                    <button onClick={() => updateStatus(res.id, 'called')} className="btn btn-sm" style={{ background: 'var(--success-glow)', color: '#2ed573', border: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <Phone size={12} /> Appeler
                                                    </button>
                                                )}
                                                {res.status === 'called' && (
                                                    <button onClick={() => updateStatus(res.id, 'done')} className="btn btn-sm" style={{ background: 'rgba(39,174,96,0.15)', color: '#27ae60', border: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <CheckCircle size={12} /> Terminé
                                                    </button>
                                                )}
                                                {(res.status === 'waiting' || res.status === 'called') && (
                                                    <button onClick={() => updateStatus(res.id, 'cancelled')} className="btn btn-sm" style={{ background: 'var(--danger-glow)', color: '#e74c3c', border: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <XCircle size={12} /> Annuler
                                                    </button>
                                                )}
                                                {(res.status === 'done' || res.status === 'cancelled') && (
                                                    <span style={{ fontSize: '0.8rem', opacity: 0.4 }}>—</span>
                                                )}
                                            </div>
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
