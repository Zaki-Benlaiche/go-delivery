'use client';

import React, { useState } from 'react';
import { Truck, Smartphone, Star, Zap, ChevronRight, ClipboardList, MapPin, Clock, Shield, Users, ArrowRight, Utensils, Phone, CheckCircle } from 'lucide-react';
import AuthPage from './AuthPage';

export default function LandingPage() {
    const [showAuth, setShowAuth] = useState<'login' | 'register' | null>(null);

    if (showAuth) {
        return <AuthPage onBack={() => setShowAuth(null)} initialMode={showAuth} />;
    }

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', color: 'var(--text)', overflowX: 'hidden' }}>

            {/* ===== NAVBAR ===== */}
            <nav style={{
                padding: 'clamp(12px, 2vw, 20px) clamp(16px, 4vw, 40px)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: 'rgba(10, 11, 14, 0.85)', backdropFilter: 'blur(20px)',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                position: 'sticky', top: 0, zIndex: 100,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                        width: '36px', height: '36px', borderRadius: '10px',
                        background: 'linear-gradient(135deg, #ff4757, #ffc048)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <Truck size={20} color="white" />
                    </div>
                    <span style={{ fontSize: 'clamp(1rem, 3vw, 1.2rem)', fontWeight: 900, letterSpacing: '-0.5px' }}>
                        <span style={{ color: '#ff4757' }}>GO</span>-DELIVERY
                    </span>
                </div>
                <button
                    onClick={() => setShowAuth('login')}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        padding: '10px 20px', borderRadius: '50px',
                        background: 'linear-gradient(135deg, #ff4757, #ff6b81)',
                        color: 'white', border: 'none', fontWeight: 700,
                        fontSize: 'clamp(0.78rem, 2vw, 0.9rem)', cursor: 'pointer',
                        boxShadow: '0 4px 15px rgba(255,71,87,0.3)',
                        transition: 'all 0.3s',
                    }}
                >
                    Se connecter <ChevronRight size={16} />
                </button>
            </nav>

            {/* ===== HERO ===== */}
            <section style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                justifyContent: 'center', alignItems: 'center',
                textAlign: 'center', padding: 'clamp(40px, 8vw, 80px) clamp(16px, 4vw, 40px)',
                position: 'relative',
            }}>
                {/* Background glow */}
                <div style={{
                    position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)',
                    width: 'clamp(300px, 60vw, 600px)', height: 'clamp(300px, 60vw, 600px)',
                    background: 'radial-gradient(circle, rgba(255,71,87,0.08) 0%, transparent 70%)',
                    borderRadius: '50%', pointerEvents: 'none',
                }} />

                <div className="fade-in" style={{ maxWidth: '800px', position: 'relative', zIndex: 2 }}>
                    {/* Badge */}
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: '8px',
                        padding: '8px 18px', borderRadius: '50px', marginBottom: '24px',
                        background: 'rgba(255, 71, 87, 0.08)', border: '1px solid rgba(255,71,87,0.15)',
                        color: '#ff4757', fontWeight: 700, fontSize: 'clamp(0.75rem, 2vw, 0.88rem)',
                    }}>
                        <Zap size={14} /> La plateforme #1 en Algérie
                    </div>

                    <h1 style={{
                        fontSize: 'clamp(2rem, 7vw, 3.8rem)', marginBottom: '24px',
                        lineHeight: 1.1, fontWeight: 900, letterSpacing: '-1px',
                    }}>
                        Livraison & Réservation<br />
                        <span style={{
                            background: 'linear-gradient(135deg, #ff4757, #ffc048)',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        }}>
                            en un seul clic.
                        </span>
                    </h1>

                    <p style={{
                        fontSize: 'clamp(0.9rem, 2.5vw, 1.15rem)', opacity: 0.7,
                        marginBottom: '40px', maxWidth: '560px', margin: '0 auto 40px',
                        lineHeight: 1.6,
                    }}>
                        Commandez vos repas préférés ou réservez votre place chez le médecin,
                        la poste et plus encore. Tout depuis votre téléphone.
                    </p>

                    {/* CTA Buttons */}
                    <div style={{
                        display: 'flex', gap: '14px', justifyContent: 'center',
                        flexWrap: 'wrap', marginBottom: '20px',
                    }}>
                        <button
                            onClick={() => setShowAuth('register')}
                            style={{
                                padding: 'clamp(14px, 3vw, 18px) clamp(28px, 5vw, 40px)',
                                fontSize: 'clamp(0.9rem, 2.5vw, 1.1rem)', borderRadius: '50px',
                                background: 'linear-gradient(135deg, #ff4757, #ff6b81)',
                                color: 'white', border: 'none', fontWeight: 800, cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: '10px',
                                boxShadow: '0 8px 30px rgba(255,71,87,0.3)',
                                transition: 'all 0.3s',
                            }}
                        >
                            <ArrowRight size={20} /> Créer un compte
                        </button>
                        <a
                            href="/download"
                            style={{
                                padding: 'clamp(14px, 3vw, 18px) clamp(28px, 5vw, 40px)',
                                fontSize: 'clamp(0.9rem, 2.5vw, 1.1rem)', borderRadius: '50px',
                                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                                color: 'white', textDecoration: 'none', fontWeight: 700, cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: '10px',
                                transition: 'all 0.3s',
                            }}
                        >
                            <Smartphone size={20} /> Télécharger l&apos;App
                        </a>
                    </div>
                </div>
            </section>

            {/* ===== DUAL SERVICES ===== */}
            <section style={{
                padding: 'clamp(40px, 8vw, 80px) clamp(16px, 4vw, 40px)',
                maxWidth: '1100px', margin: '0 auto', width: '100%',
            }}>
                <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                    <h2 style={{ fontSize: 'clamp(1.4rem, 4vw, 2.2rem)', fontWeight: 900, marginBottom: '12px' }}>
                        Deux services, une seule app
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: 'clamp(0.85rem, 2vw, 1rem)', maxWidth: '500px', margin: '0 auto' }}>
                        GO-DELIVERY combine livraison de repas et réservation de files d&apos;attente.
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                    {/* Delivery Card */}
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(255,71,87,0.06) 0%, rgba(255,192,72,0.04) 100%)',
                        border: '1px solid rgba(255,71,87,0.15)', borderRadius: '24px',
                        padding: 'clamp(24px, 4vw, 36px)', position: 'relative', overflow: 'hidden',
                    }}>
                        <div style={{
                            position: 'absolute', top: '-30px', right: '-30px',
                            width: '120px', height: '120px', borderRadius: '50%',
                            background: 'rgba(255,71,87,0.06)', pointerEvents: 'none',
                        }} />
                        <div style={{
                            width: '56px', height: '56px', borderRadius: '16px',
                            background: 'rgba(255,71,87,0.12)', display: 'flex',
                            alignItems: 'center', justifyContent: 'center', marginBottom: '20px',
                        }}>
                            <Utensils size={26} color="#ff4757" />
                        </div>
                        <h3 style={{ fontSize: 'clamp(1.1rem, 3vw, 1.4rem)', fontWeight: 800, marginBottom: '10px', color: '#ff4757' }}>
                            Livraison de Repas
                        </h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '20px' }}>
                            Parcourez les meilleurs restaurants, passez commande et suivez votre livreur en temps réel.
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {[
                                { icon: <MapPin size={14} />, text: 'Restaurants à proximité' },
                                { icon: <Clock size={14} />, text: 'Livraison en 30 min' },
                                { icon: <Star size={14} />, text: 'Suivi en temps réel' },
                            ].map((item, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                    <span style={{ color: '#ff4757' }}>{item.icon}</span> {item.text}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Reservation Card */}
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(30,144,255,0.06) 0%, rgba(46,213,115,0.04) 100%)',
                        border: '1px solid rgba(30,144,255,0.15)', borderRadius: '24px',
                        padding: 'clamp(24px, 4vw, 36px)', position: 'relative', overflow: 'hidden',
                    }}>
                        <div style={{
                            position: 'absolute', top: '-30px', right: '-30px',
                            width: '120px', height: '120px', borderRadius: '50%',
                            background: 'rgba(30,144,255,0.06)', pointerEvents: 'none',
                        }} />
                        <div style={{
                            width: '56px', height: '56px', borderRadius: '16px',
                            background: 'rgba(30,144,255,0.12)', display: 'flex',
                            alignItems: 'center', justifyContent: 'center', marginBottom: '20px',
                        }}>
                            <ClipboardList size={26} color="#1e90ff" />
                        </div>
                        <h3 style={{ fontSize: 'clamp(1.1rem, 3vw, 1.4rem)', fontWeight: 800, marginBottom: '10px', color: '#1e90ff' }}>
                            Réservation de File
                        </h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '20px' }}>
                            Réservez votre place chez le médecin, la poste, la mairie et évitez l&apos;attente.
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {[
                                { icon: <Users size={14} />, text: 'Votre position dans la file' },
                                { icon: <Phone size={14} />, text: 'Notification quand c\'est votre tour' },
                                { icon: <CheckCircle size={14} />, text: 'Plus besoin de faire la queue' },
                            ].map((item, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                    <span style={{ color: '#1e90ff' }}>{item.icon}</span> {item.text}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== FEATURES ===== */}
            <section style={{
                padding: 'clamp(40px, 8vw, 80px) clamp(16px, 4vw, 40px)',
                background: 'rgba(255,255,255,0.01)',
            }}>
                <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                        <h2 style={{ fontSize: 'clamp(1.4rem, 4vw, 2.2rem)', fontWeight: 900, marginBottom: '12px' }}>
                            Pourquoi GO-DELIVERY ?
                        </h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: 'clamp(0.85rem, 2vw, 1rem)' }}>
                            Une expérience pensée pour votre confort.
                        </p>
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                        gap: '16px',
                    }}>
                        {[
                            { icon: <Zap size={28} />, title: 'Ultra Rapide', desc: 'Commandez en 3 clics, livré en 30 minutes.', color: '#ff4757', bg: 'rgba(255,71,87,0.08)' },
                            { icon: <Shield size={28} />, title: 'Sécurisé', desc: 'Paiement à la livraison, données protégées.', color: '#2ed573', bg: 'rgba(46,213,115,0.08)' },
                            { icon: <Star size={28} />, title: 'Top Qualité', desc: 'Restaurants sélectionnés et vérifiés.', color: '#ffc048', bg: 'rgba(255,192,72,0.08)' },
                            { icon: <Smartphone size={28} />, title: 'App Mobile', desc: 'Application native Android disponible.', color: '#1e90ff', bg: 'rgba(30,144,255,0.08)' },
                        ].map((f, i) => (
                            <div key={i} style={{
                                background: 'var(--bg-card)', padding: 'clamp(24px, 4vw, 32px)',
                                borderRadius: '20px', border: '1px solid rgba(255,255,255,0.06)',
                                transition: 'all 0.3s',
                            }}>
                                <div style={{
                                    width: '52px', height: '52px', borderRadius: '14px',
                                    background: f.bg, display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', marginBottom: '16px', color: f.color,
                                }}>
                                    {f.icon}
                                </div>
                                <h3 style={{ fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)', fontWeight: 700, marginBottom: '8px' }}>{f.title}</h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.5 }}>{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== CTA FINAL ===== */}
            <section style={{
                padding: 'clamp(40px, 8vw, 80px) clamp(16px, 4vw, 40px)',
                textAlign: 'center',
            }}>
                <div style={{
                    maxWidth: '700px', margin: '0 auto',
                    background: 'linear-gradient(135deg, rgba(255,71,87,0.08), rgba(30,144,255,0.08))',
                    border: '1px solid rgba(255,255,255,0.06)', borderRadius: '28px',
                    padding: 'clamp(32px, 6vw, 56px) clamp(20px, 4vw, 40px)',
                }}>
                    <h2 style={{ fontSize: 'clamp(1.3rem, 4vw, 2rem)', fontWeight: 900, marginBottom: '14px' }}>
                        Prêt à commencer ?
                    </h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '28px', fontSize: 'clamp(0.85rem, 2vw, 1rem)' }}>
                        Rejoignez des milliers d&apos;utilisateurs qui font confiance à GO-DELIVERY.
                    </p>
                    <button
                        onClick={() => setShowAuth('register')}
                        style={{
                            padding: 'clamp(14px, 3vw, 18px) clamp(32px, 6vw, 48px)',
                            fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)', borderRadius: '50px',
                            background: 'linear-gradient(135deg, #ff4757, #ff6b81)',
                            color: 'white', border: 'none', fontWeight: 800, cursor: 'pointer',
                            display: 'inline-flex', alignItems: 'center', gap: '10px',
                            boxShadow: '0 8px 30px rgba(255,71,87,0.3)',
                            transition: 'all 0.3s',
                        }}
                    >
                        Créer un compte gratuit <ArrowRight size={20} />
                    </button>
                </div>
            </section>

            {/* ===== FOOTER ===== */}
            <footer style={{
                padding: '24px clamp(16px, 4vw, 40px)',
                borderTop: '1px solid rgba(255,255,255,0.06)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                flexWrap: 'wrap', gap: '10px',
                fontSize: '0.8rem', color: 'var(--text-muted)',
            }}>
                <span>© 2026 GO-DELIVERY. Tous droits réservés.</span>
                <div style={{ display: 'flex', gap: '16px' }}>
                    <span>Algérie 🇩🇿</span>
                </div>
            </footer>
        </div>
    );
}
