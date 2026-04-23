'use client';

import React, { useState } from 'react';
import { Truck, Star, Zap, ClipboardList, MapPin, Clock, Shield, Users, ArrowRight, Utensils, Phone, Activity, Sparkles, Building2, UserCircle2, ChevronRight, Smartphone } from 'lucide-react';
import AuthPage from './AuthPage';

export default function LandingPage() {
    const [showAuth, setShowAuth] = useState<'login' | 'register' | null>(null);

    if (showAuth) {
        return <AuthPage onBack={() => setShowAuth(null)} initialMode={showAuth} />;
    }

    return (
        <div style={{
            minHeight: '100dvh',
            display: 'flex',
            flexDirection: 'column',
            background: 'var(--bg)',
            color: 'var(--text)',
            overflowX: 'hidden',
            maxWidth: '480px',
            margin: '0 auto',
            position: 'relative',
        }}>

            {/* ===== TOP BAR ===== */}
            <div style={{
                padding: '14px 16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'rgba(10, 11, 14, 0.95)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
                position: 'sticky',
                top: 0,
                zIndex: 100,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                        width: '32px', height: '32px', borderRadius: '10px',
                        background: 'linear-gradient(135deg, #ff4757, #ff6b81)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(255,71,87,0.3)',
                    }}>
                        <Truck size={17} color="white" />
                    </div>
                    <span style={{ fontSize: '0.95rem', fontWeight: 900, letterSpacing: '-0.5px' }}>
                        <span style={{ color: '#ff4757' }}>GO</span>-DELIVERY
                    </span>
                </div>
                <button
                    onClick={() => setShowAuth('login')}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '5px',
                        padding: '8px 16px', borderRadius: '50px',
                        background: 'rgba(255,255,255,0.06)', color: 'white',
                        border: '1px solid rgba(255,255,255,0.08)', fontWeight: 700,
                        fontSize: '0.82rem', cursor: 'pointer',
                    }}
                >
                    <UserCircle2 size={15} /> Connexion
                </button>
            </div>

            {/* ===== HERO SECTION ===== */}
            <div style={{
                padding: '32px 20px 28px',
                position: 'relative',
                overflow: 'hidden',
            }}>
                {/* Background glow */}
                <div style={{
                    position: 'absolute', top: '-40px', right: '-40px',
                    width: '200px', height: '200px',
                    background: 'radial-gradient(circle, rgba(255,71,87,0.12) 0%, transparent 70%)',
                    borderRadius: '50%', pointerEvents: 'none',
                }} />
                <div style={{
                    position: 'absolute', bottom: '-30px', left: '-30px',
                    width: '160px', height: '160px',
                    background: 'radial-gradient(circle, rgba(30,144,255,0.08) 0%, transparent 70%)',
                    borderRadius: '50%', pointerEvents: 'none',
                }} />

                {/* Badge */}
                <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    padding: '6px 14px', borderRadius: '50px', marginBottom: '20px',
                    background: 'rgba(255,71,87,0.08)', border: '1px solid rgba(255,71,87,0.15)',
                }}>
                    <Sparkles size={13} color="#ff4757" />
                    <span style={{ fontWeight: 700, fontSize: '0.75rem', color: '#ff6b81' }}>Plateforme #1 en Algérie</span>
                </div>

                {/* Title */}
                <h1 style={{
                    fontSize: '2rem',
                    lineHeight: 1.1,
                    fontWeight: 900,
                    letterSpacing: '-1px',
                    marginBottom: '14px',
                }}>
                    Livraison &<br />
                    <span style={{
                        background: 'linear-gradient(135deg, #ff4757 0%, #ffc048 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}>
                        Réservation Smart
                    </span>
                </h1>

                {/* Subtitle */}
                <p style={{
                    fontSize: '0.9rem', color: 'var(--text-muted)',
                    lineHeight: 1.6, marginBottom: '24px',
                }}>
                    Commandez vos plats préférés ou réservez votre tour chez le médecin sans faire la queue.
                </p>

                {/* CTA Buttons */}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
                    <button
                        onClick={() => setShowAuth('register')}
                        style={{
                            flex: 1, padding: '14px 20px',
                            fontSize: '0.9rem', borderRadius: '14px',
                            background: 'linear-gradient(135deg, #ff4757, #ff6b81)',
                            color: 'white', border: 'none', fontWeight: 800, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                            boxShadow: '0 8px 24px rgba(255,71,87,0.3)',
                        }}
                    >
                        Commencer <ArrowRight size={18} />
                    </button>
                    <a
                        href="/download"
                        style={{
                            padding: '14px 18px', borderRadius: '14px',
                            background: 'var(--bg-elevated)', color: 'var(--text)',
                            border: '1px solid var(--border)', textDecoration: 'none',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', flexShrink: 0,
                        }}
                    >
                        <Smartphone size={18} />
                    </a>
                </div>

                {/* Social proof */}
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '12px 16px', borderRadius: '14px',
                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)',
                }}>
                    <div style={{ display: 'flex' }}>
                        {[11, 12, 13].map((i, idx) => (
                            <img
                                key={i}
                                src={`https://i.pravatar.cc/80?img=${i}`}
                                style={{
                                    width: '30px', height: '30px', borderRadius: '50%',
                                    border: '2px solid var(--bg)',
                                    marginLeft: idx > 0 ? '-10px' : '0',
                                }}
                                alt="user"
                            />
                        ))}
                    </div>
                    <div>
                        <div style={{ display: 'flex', gap: '1px', marginBottom: '2px' }}>
                            {[1, 2, 3, 4, 5].map(i => <Star key={i} size={12} color="#ffc048" fill="#ffc048" />)}
                        </div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>+10,000 utilisateurs actifs</span>
                    </div>
                </div>
            </div>

            {/* ===== SERVICE CARDS ===== */}
            <div style={{ padding: '0 16px 28px', display: 'flex', flexDirection: 'column', gap: '14px' }}>

                {/* Delivery Card */}
                <div
                    onClick={() => setShowAuth('register')}
                    style={{
                        background: 'var(--bg-card)',
                        border: '1px solid rgba(255,71,87,0.12)',
                        borderRadius: '18px',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                    }}
                >
                    <div style={{
                        height: '130px', position: 'relative', overflow: 'hidden',
                    }}>
                        <img
                            src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=75"
                            alt="Food Delivery"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <div style={{
                            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                            background: 'linear-gradient(transparent 30%, rgba(10,11,14,0.9) 100%)',
                        }} />
                        <div style={{
                            position: 'absolute', top: '12px', left: '12px',
                            background: 'linear-gradient(135deg, #ff4757, #ff6b81)',
                            padding: '5px 12px', borderRadius: '50px',
                            fontSize: '0.72rem', fontWeight: 800, color: 'white',
                            display: 'flex', alignItems: 'center', gap: '4px',
                        }}>
                            <Utensils size={12} /> LIVRAISON
                        </div>
                    </div>

                    <div style={{ padding: '16px 18px' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '6px' }}>
                            Livraison Premium
                        </h3>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '14px' }}>
                            Les meilleurs restaurants, livrés à votre porte en moins de 30 minutes.
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                            {[
                                { icon: <Zap size={13} />, text: 'Express', color: '#ff4757' },
                                { icon: <MapPin size={13} />, text: 'Suivi GPS', color: '#ffc048' },
                                { icon: <Star size={13} />, text: 'Top Restos', color: '#2ed573' },
                                { icon: <Shield size={13} />, text: 'Sécurisé', color: '#1e90ff' },
                            ].map((item, i) => (
                                <div key={i} style={{
                                    display: 'flex', alignItems: 'center', gap: '6px',
                                    fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-muted)',
                                }}>
                                    <span style={{ color: item.color }}>{item.icon}</span> {item.text}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Reservation Card */}
                <div
                    onClick={() => setShowAuth('register')}
                    style={{
                        background: 'var(--bg-card)',
                        border: '1px solid rgba(30,144,255,0.12)',
                        borderRadius: '18px',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                    }}
                >
                    <div style={{
                        height: '130px', position: 'relative', overflow: 'hidden',
                    }}>
                        <img
                            src="https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=600&q=75"
                            alt="Reservation"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <div style={{
                            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                            background: 'linear-gradient(transparent 30%, rgba(10,11,14,0.9) 100%)',
                        }} />
                        <div style={{
                            position: 'absolute', top: '12px', left: '12px',
                            background: 'linear-gradient(135deg, #1e90ff, #4facfe)',
                            padding: '5px 12px', borderRadius: '50px',
                            fontSize: '0.72rem', fontWeight: 800, color: 'white',
                            display: 'flex', alignItems: 'center', gap: '4px',
                        }}>
                            <Building2 size={12} /> RÉSERVATION
                        </div>
                    </div>

                    <div style={{ padding: '16px 18px' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '6px' }}>
                            Réservation Intelligente
                        </h3>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '14px' }}>
                            Prenez votre ticket virtuel et arrivez pile quand c&apos;est votre tour.
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                            {[
                                { icon: <Clock size={13} />, text: 'Temps réel', color: '#1e90ff' },
                                { icon: <Users size={13} />, text: 'File virtuelle', color: '#a55eea' },
                                { icon: <Phone size={13} />, text: 'Alertes', color: '#2ed573' },
                                { icon: <Activity size={13} />, text: 'Statut live', color: '#ffc048' },
                            ].map((item, i) => (
                                <div key={i} style={{
                                    display: 'flex', alignItems: 'center', gap: '6px',
                                    fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-muted)',
                                }}>
                                    <span style={{ color: item.color }}>{item.icon}</span> {item.text}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ===== WHY GO-DELIVERY ===== */}
            <div style={{
                padding: '28px 16px',
                background: 'rgba(255,255,255,0.015)',
                borderTop: '1px solid rgba(255,255,255,0.04)',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
            }}>
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    marginBottom: '18px',
                }}>
                    <Star size={16} color="#ffc048" fill="#ffc048" />
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>Pourquoi nous choisir ?</h2>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {[
                        {
                            icon: <Zap size={20} />,
                            title: 'Ultra Rapide',
                            desc: 'Livraison express en moins de 30 min',
                            color: '#ff4757',
                            bg: 'rgba(255,71,87,0.08)',
                        },
                        {
                            icon: <Shield size={20} />,
                            title: 'Sécurisé',
                            desc: 'Données protégées, paiement sûr',
                            color: '#2ed573',
                            bg: 'rgba(46,213,115,0.08)',
                        },
                        {
                            icon: <ClipboardList size={20} />,
                            title: 'Tout en Un',
                            desc: 'Resto, médecin, poste, admin...',
                            color: '#1e90ff',
                            bg: 'rgba(30,144,255,0.08)',
                        },
                        {
                            icon: <Truck size={20} />,
                            title: 'Livreurs Pros',
                            desc: 'Flotte formée et fiable',
                            color: '#a55eea',
                            bg: 'rgba(165,94,234,0.08)',
                        },
                    ].map((item, i) => (
                        <div key={i} style={{
                            display: 'flex', alignItems: 'center', gap: '14px',
                            padding: '14px 16px', borderRadius: '14px',
                            background: 'var(--bg-card)', border: '1px solid rgba(255,255,255,0.04)',
                        }}>
                            <div style={{
                                width: '44px', height: '44px', borderRadius: '12px',
                                background: item.bg, color: item.color,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0, border: `1px solid ${item.color}20`,
                            }}>
                                {item.icon}
                            </div>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '2px' }}>{item.title}</div>
                                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{item.desc}</div>
                            </div>
                            <ChevronRight size={16} color="var(--text-muted)" style={{ marginLeft: 'auto', flexShrink: 0, opacity: 0.4 }} />
                        </div>
                    ))}
                </div>
            </div>

            {/* ===== CTA BOTTOM ===== */}
            <div style={{
                padding: '32px 16px',
                textAlign: 'center',
            }}>
                <div style={{
                    background: 'linear-gradient(135deg, rgba(255,71,87,0.08), rgba(30,144,255,0.08))',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '20px',
                    padding: '28px 20px',
                    position: 'relative',
                    overflow: 'hidden',
                }}>
                    {/* Decorative glow */}
                    <div style={{
                        position: 'absolute', top: '-20px', right: '-20px',
                        width: '100px', height: '100px',
                        background: 'radial-gradient(circle, rgba(255,71,87,0.15) 0%, transparent 70%)',
                        borderRadius: '50%', pointerEvents: 'none',
                    }} />

                    <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🚀</div>
                    <h2 style={{
                        fontSize: '1.3rem', fontWeight: 900,
                        marginBottom: '8px', lineHeight: 1.2,
                    }}>
                        Prêt à commencer ?
                    </h2>
                    <p style={{
                        fontSize: '0.85rem', color: 'var(--text-muted)',
                        marginBottom: '20px', lineHeight: 1.5,
                    }}>
                        Créez votre compte gratuit et profitez de tous nos services.
                    </p>

                    <button
                        onClick={() => setShowAuth('register')}
                        style={{
                            width: '100%', padding: '15px',
                            fontSize: '0.95rem', borderRadius: '14px',
                            background: 'linear-gradient(135deg, #ff4757, #ff6b81)',
                            color: 'white', border: 'none', fontWeight: 800, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                            boxShadow: '0 8px 24px rgba(255,71,87,0.25)',
                        }}
                    >
                        Créer un compte gratuitement <ArrowRight size={18} />
                    </button>

                    <button
                        onClick={() => setShowAuth('login')}
                        style={{
                            width: '100%', padding: '13px', marginTop: '10px',
                            fontSize: '0.88rem', borderRadius: '14px',
                            background: 'transparent', color: 'var(--text-muted)',
                            border: '1px solid rgba(255,255,255,0.08)', fontWeight: 600,
                            cursor: 'pointer',
                        }}
                    >
                        J&apos;ai déjà un compte
                    </button>
                </div>
            </div>

            {/* ===== FOOTER ===== */}
            <footer style={{
                padding: '20px 16px',
                borderTop: '1px solid rgba(255,255,255,0.04)',
                textAlign: 'center',
            }}>
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    gap: '6px', marginBottom: '8px',
                }}>
                    <Truck size={14} color="#ff4757" />
                    <span style={{ fontWeight: 800, fontSize: '0.82rem', letterSpacing: '-0.3px' }}>GO-DELIVERY</span>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>
                    © 2026 GO-DELIVERY. L&apos;excellence algérienne 🇩🇿
                </p>
            </footer>
        </div>
    );
}
