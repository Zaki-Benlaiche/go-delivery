'use client';

import React, { useState, useEffect } from 'react';
import { Truck, Star, Zap, ClipboardList, MapPin, Clock, Shield, Users, ArrowRight, Utensils, Phone, Activity, Sparkles, Building2, UserCircle2, ChevronRight, Smartphone } from 'lucide-react';
import AuthPage from './AuthPage';

export default function LandingPage() {
    const [showAuth, setShowAuth] = useState<'login' | 'register' | null>(null);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

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
        }}>

            {/* ===== NAVBAR ===== */}
            <nav style={{
                padding: '12px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: scrolled ? 'rgba(10, 11, 14, 0.92)' : 'transparent',
                backdropFilter: scrolled ? 'blur(20px)' : 'none',
                WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
                borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
                position: 'fixed',
                top: 0,
                width: '100%',
                zIndex: 100,
                transition: 'all 0.3s ease',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                        width: '34px', height: '34px', borderRadius: '10px',
                        background: 'linear-gradient(135deg, #ff4757, #ff6b81)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(255,71,87,0.3)',
                    }}>
                        <Truck size={18} color="white" />
                    </div>
                    <span style={{ fontSize: '1rem', fontWeight: 900, letterSpacing: '-0.5px' }}>
                        <span style={{ color: '#ff4757' }}>GO</span>-DELIVERY
                    </span>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        onClick={() => setShowAuth('login')}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '9px 18px', borderRadius: '50px',
                            background: 'rgba(255,255,255,0.05)', color: 'white',
                            border: '1px solid rgba(255,255,255,0.08)', fontWeight: 700,
                            fontSize: '0.84rem', cursor: 'pointer',
                        }}
                    >
                        <UserCircle2 size={15} /> Connexion
                    </button>
                    <button
                        onClick={() => setShowAuth('register')}
                        className="desktop-only-btn"
                        style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '9px 18px', borderRadius: '50px',
                            background: 'linear-gradient(135deg, #ff4757, #ff6b81)',
                            color: 'white', border: 'none', fontWeight: 700,
                            fontSize: '0.84rem', cursor: 'pointer',
                            boxShadow: '0 4px 15px rgba(255,71,87,0.3)',
                        }}
                    >
                        S&apos;inscrire
                    </button>
                </div>
            </nav>

            {/* ===== HERO SECTION ===== */}
            <section style={{
                paddingTop: '100px',
                paddingBottom: '40px',
                paddingLeft: '20px',
                paddingRight: '20px',
                position: 'relative',
                overflow: 'hidden',
            }}>
                {/* Background glow */}
                <div style={{
                    position: 'absolute', top: '-10%', left: '-10%',
                    width: '50vw', height: '50vw',
                    background: 'radial-gradient(circle, rgba(255,71,87,0.08) 0%, transparent 60%)',
                    borderRadius: '50%', pointerEvents: 'none',
                }} />
                <div style={{
                    position: 'absolute', bottom: '-20%', right: '-10%',
                    width: '40vw', height: '40vw',
                    background: 'radial-gradient(circle, rgba(30,144,255,0.06) 0%, transparent 60%)',
                    borderRadius: '50%', pointerEvents: 'none',
                }} />

                <div style={{
                    maxWidth: '1100px', margin: '0 auto',
                    display: 'flex', flexWrap: 'wrap', alignItems: 'center',
                    gap: '40px', justifyContent: 'center',
                }}>
                    {/* Hero Text */}
                    <div className="fade-in" style={{ flex: '1 1 360px', maxWidth: '560px', zIndex: 2 }}>
                        {/* Badge */}
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                            padding: '6px 14px', borderRadius: '50px', marginBottom: '20px',
                            background: 'rgba(255,71,87,0.08)', border: '1px solid rgba(255,71,87,0.15)',
                        }}>
                            <Sparkles size={13} color="#ff4757" />
                            <span style={{ fontWeight: 700, fontSize: '0.78rem', color: '#ff6b81' }}>Plateforme #1 en Algérie</span>
                        </div>

                        <h1 style={{
                            fontSize: 'clamp(2rem, 4vw, 3.5rem)',
                            lineHeight: 1.1, fontWeight: 900,
                            letterSpacing: '-1px', marginBottom: '16px',
                        }}>
                            Livraison &<br />
                            <span style={{
                                background: 'linear-gradient(135deg, #ff4757 0%, #ffc048 100%)',
                                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                            }}>
                                Réservation Smart
                            </span>
                        </h1>

                        <p style={{
                            fontSize: 'clamp(0.88rem, 1.5vw, 1.1rem)', color: 'var(--text-muted)',
                            lineHeight: 1.6, marginBottom: '24px', maxWidth: '480px',
                        }}>
                            Commandez vos plats préférés ou réservez votre tour chez le médecin sans faire la queue.
                        </p>

                        {/* CTA */}
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
                            <button
                                onClick={() => setShowAuth('register')}
                                style={{
                                    padding: '14px 28px', fontSize: '0.92rem', borderRadius: '14px',
                                    background: 'linear-gradient(135deg, #ff4757, #ff6b81)',
                                    color: 'white', border: 'none', fontWeight: 800, cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', gap: '8px',
                                    boxShadow: '0 8px 24px rgba(255,71,87,0.3)',
                                }}
                            >
                                Commencer <ArrowRight size={18} />
                            </button>
                            <a
                                href="/download"
                                style={{
                                    padding: '14px 20px', borderRadius: '14px',
                                    background: 'var(--bg-elevated)', color: 'var(--text)',
                                    border: '1px solid var(--border)', textDecoration: 'none',
                                    display: 'flex', alignItems: 'center', gap: '8px',
                                    fontWeight: 600, fontSize: '0.88rem',
                                }}
                            >
                                <Smartphone size={18} /> <span className="desktop-only-text">App Android</span>
                            </a>
                        </div>

                        {/* Social proof */}
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '12px',
                            padding: '12px 16px', borderRadius: '14px',
                            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)',
                            width: 'fit-content',
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

                    {/* Hero Visual - Desktop phone mockup */}
                    <div className="fade-in hero-visual" style={{
                        flex: '1 1 300px', maxWidth: '400px',
                        display: 'flex', justifyContent: 'center', zIndex: 2,
                    }}>
                        <div style={{
                            width: '240px', height: '480px',
                            border: '8px solid #1a1c24', borderRadius: '36px',
                            background: 'var(--bg)', boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
                            position: 'relative', overflow: 'hidden',
                        }}>
                            <div style={{
                                background: 'linear-gradient(135deg, #ff4757, #ffc048)',
                                height: '140px', padding: '20px', color: 'white',
                            }}>
                                <div style={{ fontWeight: 800, fontSize: '1.1rem', marginTop: '16px' }}>GO-DELIVERY</div>
                                <div style={{ fontSize: '0.78rem', opacity: 0.85 }}>Bienvenue, cher client</div>
                            </div>
                            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {[
                                    { color: '#ff4757', label: '🍕 Pizza Palace', sub: '800 DA' },
                                    { color: '#1e90ff', label: '🩺 Dr. Karim', sub: 'N° 12' },
                                    { color: '#2ed573', label: '🍔 Burger Empire', sub: '600 DA' },
                                ].map((item, i) => (
                                    <div key={i} style={{
                                        height: '60px', borderRadius: '14px',
                                        background: 'var(--bg-elevated)', display: 'flex',
                                        alignItems: 'center', padding: '0 14px', gap: '10px',
                                        border: '1px solid rgba(255,255,255,0.04)',
                                    }}>
                                        <div style={{
                                            width: '36px', height: '36px', borderRadius: '10px',
                                            background: `${item.color}18`, display: 'flex',
                                            alignItems: 'center', justifyContent: 'center',
                                            fontSize: '1.1rem',
                                        }}>
                                            {item.label.split(' ')[0]}
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.78rem', fontWeight: 700 }}>{item.label.substring(2)}</div>
                                            <div style={{ fontSize: '0.68rem', color: item.color, fontWeight: 600 }}>{item.sub}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div style={{
                                position: 'absolute', bottom: '10px', left: '50%',
                                transform: 'translateX(-50%)', width: '40%', height: '5px',
                                background: 'rgba(255,255,255,0.15)', borderRadius: '10px',
                            }} />
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== SERVICE CARDS ===== */}
            <section style={{
                padding: '40px 20px',
                background: 'rgba(255,255,255,0.015)',
                borderTop: '1px solid rgba(255,255,255,0.04)',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
            }}>
                <div style={{
                    maxWidth: '1100px', margin: '0 auto',
                    display: 'flex', flexWrap: 'wrap', gap: '16px',
                    justifyContent: 'center',
                }}>
                    {/* Delivery Card */}
                    <div
                        onClick={() => setShowAuth('register')}
                        style={{
                            flex: '1 1 340px', maxWidth: '540px',
                            background: 'var(--bg-card)', border: '1px solid rgba(255,71,87,0.12)',
                            borderRadius: '18px', overflow: 'hidden', cursor: 'pointer',
                            transition: 'all 0.3s',
                        }}
                    >
                        <div style={{ height: '150px', position: 'relative', overflow: 'hidden' }}>
                            <img
                                src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=75"
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
                        <div style={{ padding: '18px 20px' }}>
                            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '8px' }}>Livraison Premium</h3>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '14px' }}>
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
                                        fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)',
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
                            flex: '1 1 340px', maxWidth: '540px',
                            background: 'var(--bg-card)', border: '1px solid rgba(30,144,255,0.12)',
                            borderRadius: '18px', overflow: 'hidden', cursor: 'pointer',
                            transition: 'all 0.3s',
                        }}
                    >
                        <div style={{ height: '150px', position: 'relative', overflow: 'hidden' }}>
                            <img
                                src="https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=800&q=75"
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
                        <div style={{ padding: '18px 20px' }}>
                            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '8px' }}>Réservation Intelligente</h3>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '14px' }}>
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
                                        fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)',
                                    }}>
                                        <span style={{ color: item.color }}>{item.icon}</span> {item.text}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== WHY GO-DELIVERY ===== */}
            <section style={{ padding: '48px 20px' }}>
                <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                            marginBottom: '12px', padding: '6px 14px', borderRadius: '50px',
                            background: 'rgba(255,192,72,0.08)', color: '#ffc048', fontWeight: 700, fontSize: '0.8rem',
                        }}>
                            <Star size={14} fill="#ffc048" /> Pourquoi nous choisir
                        </div>
                        <h2 style={{ fontSize: 'clamp(1.3rem, 3vw, 2.2rem)', fontWeight: 900 }}>
                            L&apos;excellence dans chaque détail
                        </h2>
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                        gap: '14px',
                    }}>
                        {[
                            { icon: <Zap size={22} />, title: 'Ultra Rapide', desc: 'Livraison express en moins de 30 minutes', color: '#ff4757', bg: 'rgba(255,71,87,0.08)' },
                            { icon: <Shield size={22} />, title: 'Sécurisé', desc: 'Données protégées, paiement sûr', color: '#2ed573', bg: 'rgba(46,213,115,0.08)' },
                            { icon: <ClipboardList size={22} />, title: 'Tout en Un', desc: 'Resto, médecin, poste, admin...', color: '#1e90ff', bg: 'rgba(30,144,255,0.08)' },
                            { icon: <Truck size={22} />, title: 'Livreurs Pros', desc: 'Flotte formée et fiable', color: '#a55eea', bg: 'rgba(165,94,234,0.08)' },
                        ].map((item, i) => (
                            <div key={i} style={{
                                display: 'flex', alignItems: 'center', gap: '14px',
                                padding: '16px 18px', borderRadius: '14px',
                                background: 'var(--bg-card)', border: '1px solid rgba(255,255,255,0.04)',
                            }}>
                                <div style={{
                                    width: '46px', height: '46px', borderRadius: '12px',
                                    background: item.bg, color: item.color,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    flexShrink: 0, border: `1px solid ${item.color}20`,
                                }}>
                                    {item.icon}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: '0.92rem', marginBottom: '2px' }}>{item.title}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.desc}</div>
                                </div>
                                <ChevronRight size={16} color="var(--text-muted)" style={{ marginLeft: 'auto', flexShrink: 0, opacity: 0.3 }} />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== CTA ===== */}
            <section style={{ padding: '0 20px 48px' }}>
                <div style={{
                    maxWidth: '900px', margin: '0 auto',
                    background: 'linear-gradient(135deg, rgba(255,71,87,0.08), rgba(30,144,255,0.08))',
                    border: '1px solid rgba(255,255,255,0.06)', borderRadius: '24px',
                    padding: '36px 24px', textAlign: 'center',
                    position: 'relative', overflow: 'hidden',
                }}>
                    <div style={{
                        position: 'absolute', top: '-20px', right: '-20px',
                        width: '120px', height: '120px',
                        background: 'radial-gradient(circle, rgba(255,71,87,0.15) 0%, transparent 70%)',
                        borderRadius: '50%', pointerEvents: 'none',
                    }} />
                    <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🚀</div>
                    <h2 style={{ fontSize: 'clamp(1.2rem, 2.5vw, 1.8rem)', fontWeight: 900, marginBottom: '8px' }}>
                        Prêt à commencer ?
                    </h2>
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '20px', maxWidth: '400px', margin: '0 auto 20px' }}>
                        Créez votre compte gratuit et profitez de tous nos services.
                    </p>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button
                            onClick={() => setShowAuth('register')}
                            style={{
                                padding: '14px 28px', fontSize: '0.92rem', borderRadius: '14px',
                                background: 'linear-gradient(135deg, #ff4757, #ff6b81)',
                                color: 'white', border: 'none', fontWeight: 800, cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: '8px',
                                boxShadow: '0 8px 24px rgba(255,71,87,0.25)',
                            }}
                        >
                            Créer un compte <ArrowRight size={18} />
                        </button>
                        <button
                            onClick={() => setShowAuth('login')}
                            style={{
                                padding: '14px 24px', fontSize: '0.88rem', borderRadius: '14px',
                                background: 'transparent', color: 'var(--text-muted)',
                                border: '1px solid rgba(255,255,255,0.08)', fontWeight: 600,
                                cursor: 'pointer',
                            }}
                        >
                            J&apos;ai déjà un compte
                        </button>
                    </div>
                </div>
            </section>

            {/* ===== FOOTER ===== */}
            <footer style={{
                padding: '20px',
                borderTop: '1px solid rgba(255,255,255,0.04)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                flexWrap: 'wrap', gap: '12px',
                maxWidth: '1100px', margin: '0 auto', width: '100%',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Truck size={14} color="#ff4757" />
                    <span style={{ fontWeight: 800, fontSize: '0.82rem' }}>GO-DELIVERY</span>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>
                    © 2026 GO-DELIVERY. L&apos;excellence algérienne 🇩🇿
                </p>
            </footer>

            {/* Responsive styles */}
            <style dangerouslySetInnerHTML={{ __html: `
                .hero-visual { display: none; }
                .desktop-only-btn { display: none !important; }
                .desktop-only-text { display: none; }
                @media (min-width: 768px) {
                    .hero-visual { display: flex !important; }
                    .desktop-only-btn { display: flex !important; }
                    .desktop-only-text { display: inline; }
                }
            `}} />
        </div>
    );
}
