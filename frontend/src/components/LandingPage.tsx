'use client';

import React, { useState, useEffect } from 'react';
import { Truck, Smartphone, Star, Zap, ChevronRight, ClipboardList, MapPin, Clock, Shield, Users, ArrowRight, Utensils, Phone, CheckCircle, Activity, Sparkles, Building2, UserCircle2 } from 'lucide-react';
import AuthPage from './AuthPage';

export default function LandingPage() {
    const [showAuth, setShowAuth] = useState<'login' | 'register' | null>(null);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    if (showAuth) {
        return <AuthPage onBack={() => setShowAuth(null)} initialMode={showAuth} />;
    }

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', color: 'var(--text)', overflowX: 'hidden', fontFamily: 'var(--font-inter, system-ui)' }}>

            {/* Inline keyframes for animations not in globals.css */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes float {
                    0% { transform: translateY(0px); }
                    50% { transform: translateY(-15px); }
                    100% { transform: translateY(0px); }
                }
                @keyframes pulse-glow {
                    0% { box-shadow: 0 0 0 0 rgba(255, 71, 87, 0.4); }
                    70% { box-shadow: 0 0 0 20px rgba(255, 71, 87, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(255, 71, 87, 0); }
                }
                .floating { animation: float 6s ease-in-out infinite; }
                .floating-delayed { animation: float 6s ease-in-out 3s infinite; }
                .pro-card {
                    background: rgba(25, 27, 34, 0.6);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 24px;
                    transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.4s ease;
                }
                .pro-card:hover {
                    transform: translateY(-10px);
                    box-shadow: 0 20px 40px rgba(0,0,0,0.4);
                    border: 1px solid rgba(255, 255, 255, 0.15);
                }
            `}} />

            {/* ===== NAVBAR ===== */}
            <nav style={{
                padding: 'clamp(12px, 2vw, 20px) clamp(20px, 5vw, 60px)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: scrolled ? 'rgba(10, 11, 14, 0.85)' : 'transparent',
                backdropFilter: scrolled ? 'blur(20px)' : 'none',
                borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
                position: 'fixed', top: 0, width: '100%', zIndex: 100,
                transition: 'all 0.3s ease'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        width: '40px', height: '40px', borderRadius: '12px',
                        background: 'linear-gradient(135deg, #ff4757, #ff6b81)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 4px 15px rgba(255,71,87,0.3)'
                    }}>
                        <Truck size={22} color="white" />
                    </div>
                    <span style={{ fontSize: 'clamp(1.1rem, 3vw, 1.4rem)', fontWeight: 900, letterSpacing: '-0.5px' }}>
                        <span style={{ color: '#ff4757' }}>GO</span>-DELIVERY
                    </span>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        onClick={() => setShowAuth('login')}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            padding: '12px 24px', borderRadius: '50px',
                            background: 'rgba(255,255,255,0.05)', color: 'white',
                            border: '1px solid rgba(255,255,255,0.1)', fontWeight: 700,
                            fontSize: 'clamp(0.85rem, 2vw, 0.95rem)', cursor: 'pointer',
                            transition: 'all 0.3s', backdropFilter: 'blur(10px)',
                        }}
                        className="hover-opacity"
                    >
                        <UserCircle2 size={18} /> Se connecter
                    </button>
                    <button
                        onClick={() => setShowAuth('register')}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            padding: '12px 24px', borderRadius: '50px',
                            background: 'linear-gradient(135deg, #ff4757, #ff6b81)',
                            color: 'white', border: 'none', fontWeight: 700,
                            fontSize: 'clamp(0.85rem, 2vw, 0.95rem)', cursor: 'pointer',
                            boxShadow: '0 4px 15px rgba(255,71,87,0.4)',
                            transition: 'all 0.3s transform 0.2s',
                        }}
                    >
                        S'inscrire
                    </button>
                </div>
            </nav>

            {/* ===== HERO SECTION ===== */}
            <section style={{
                padding: 'clamp(120px, 15vw, 180px) clamp(20px, 5vw, 60px) clamp(60px, 10vw, 100px)',
                display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '40px',
                position: 'relative', overflow: 'hidden'
            }}>
                {/* Background glow effects */}
                <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(255,71,87,0.08) 0%, transparent 60%)', borderRadius: '50%', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '60vw', height: '60vw', background: 'radial-gradient(circle, rgba(30,144,255,0.06) 0%, transparent 60%)', borderRadius: '50%', pointerEvents: 'none' }} />

                <div className="fade-in" style={{ flex: '1 1 500px', maxWidth: '650px', zIndex: 2 }}>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: '8px',
                        padding: '10px 20px', borderRadius: '50px', marginBottom: '30px',
                        background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(10px)'
                    }}>
                        <Sparkles size={16} color="#ff4757" />
                        <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#f1f2f6' }}>La Plateforme Ultra Premium #1</span>
                    </div>

                    <h1 style={{
                        fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', marginBottom: '24px',
                        lineHeight: 1.1, fontWeight: 900, letterSpacing: '-1.5px',
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
                        fontSize: 'clamp(1rem, 2vw, 1.25rem)', color: 'var(--text-muted)',
                        marginBottom: '40px', maxWidth: '560px', lineHeight: 1.7,
                    }}>
                        Découvrez une expérience d'exception. Commandez les meilleurs plats de votre ville ou réservez votre tour chez le médecin et dans les administrations sans faire la queue.
                    </p>

                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                        <button
                            onClick={() => setShowAuth('register')}
                            style={{
                                padding: 'clamp(16px, 3vw, 20px) clamp(32px, 5vw, 48px)',
                                fontSize: 'clamp(1rem, 2vw, 1.15rem)', borderRadius: '50px',
                                background: 'linear-gradient(135deg, #ff4757, #ff6b81)',
                                color: 'white', border: 'none', fontWeight: 800, cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: '12px',
                                boxShadow: '0 10px 30px rgba(255,71,87,0.3)',
                                transition: 'all 0.3s',
                            }}
                        >
                            Créer un compte <ArrowRight size={22} />
                        </button>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '40px' }}>
                        <div style={{ display: 'flex' }}>
                            {[1, 2, 3].map(i => (
                                <img key={i} src={`https://i.pravatar.cc/100?img=${i + 10}`} style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid var(--bg)', marginLeft: i > 1 ? '-15px' : '0' }} alt="user" />
                            ))}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', gap: '2px' }}>
                                {[1, 2, 3, 4, 5].map(i => <Star key={i} size={16} color="#ffc048" fill="#ffc048" />)}
                            </div>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Déjà +10,000 utilisateurs</span>
                        </div>
                    </div>
                </div>

                {/* Hero Images Collage */}
                <div className="fade-in" style={{ flex: '1 1 400px', position: 'relative', height: 'min(500px, 70vh)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="floating" style={{
                        position: 'absolute', right: '0', top: '10%',
                        width: '70%', height: '70%', borderRadius: '30px',
                        overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                        border: '5px solid rgba(255,255,255,0.05)', zIndex: 1
                    }}>
                        <img src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80" alt="Premium Burger" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px', background: 'linear-gradient(transparent, rgba(0,0,0,0.9))' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ background: '#ff4757', padding: '6px 12px', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 800 }}>-20% Off</div>
                                <span>Livraison Ultra Rapide</span>
                            </div>
                        </div>
                    </div>

                    <div className="pro-card floating-delayed" style={{
                        position: 'absolute', left: '0', bottom: '15%',
                        padding: '24px', width: '60%', zIndex: 2,
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                            <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: 'rgba(30,144,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <ClipboardList size={26} color="#1e90ff" />
                            </div>
                            <div>
                                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800 }}>Dr. Karim</h4>
                                <span style={{ fontSize: '0.8rem', color: '#1e90ff', fontWeight: 600 }}>Cardiologue</span>
                            </div>
                        </div>
                        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Votre tour:</span>
                            <span style={{ fontSize: '1.2rem', fontWeight: 900, color: 'white' }}>N° 12</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== DEUX SERVICES ===== */}
            <section style={{ padding: 'clamp(60px, 10vw, 120px) clamp(20px, 5vw, 60px)', background: 'rgba(0,0,0,0.2)' }}>
                <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                    <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, marginBottom: '16px' }}>L'excellence dans chaque détail</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: 'clamp(1rem, 2vw, 1.2rem)', maxWidth: '600px', margin: '0 auto' }}>Découvrez l'application ultime qui réunit vos besoins quotidiens dans une interface éblouissante.</p>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px', justifyContent: 'center', maxWidth: '1200px', margin: '0 auto' }}>

                    {/* Livraison Card */}
                    <div className="pro-card" style={{ flex: '1 1 450px', overflow: 'hidden', padding: 0 }}>
                        <div style={{ height: '240px', width: '100%', position: 'relative' }}>
                            <img src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80" alt="Livraison" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(rgba(0,0,0,0.2), var(--bg-card))' }}></div>
                            <div style={{ position: 'absolute', bottom: '-25px', left: '30px', width: '70px', height: '70px', borderRadius: '20px', background: 'linear-gradient(135deg, #ff4757, #ff6b81)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 20px rgba(255,71,87,0.3)' }}>
                                <Utensils size={32} color="white" />
                            </div>
                        </div>
                        <div style={{ padding: '50px 30px 40px' }}>
                            <h3 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '16px', color: 'white' }}>Livraison Premium</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '24px' }}>
                                Parcourez les restaurants les plus cotés, passez votre commande avec une interface fluide, et suivez votre livreur en temps réel avec une précision chirurgicale.
                            </p>
                            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(150px, 1fr) minmax(150px, 1fr)', gap: '16px' }}>
                                {[
                                    { icon: <Zap size={18} />, text: "Livraison Express" },
                                    { icon: <Star size={18} />, text: "Top Restaurants" },
                                    { icon: <MapPin size={18} />, text: "Suivi Live GPS" },
                                    { icon: <Shield size={18} />, text: "Paiement Sécurisé" }
                                ].map((item, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f1f2f6', fontWeight: 600, fontSize: '0.95rem' }}>
                                        <span style={{ color: '#ff4757' }}>{item.icon}</span> {item.text}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Reservation Card */}
                    <div className="pro-card" style={{ flex: '1 1 450px', overflow: 'hidden', padding: 0 }}>
                        <div style={{ height: '240px', width: '100%', position: 'relative' }}>
                            <img src="https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=800&q=80" alt="Medical" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(rgba(0,0,0,0.2), var(--bg-card))' }}></div>
                            <div style={{ position: 'absolute', bottom: '-25px', left: '30px', width: '70px', height: '70px', borderRadius: '20px', background: 'linear-gradient(135deg, #1e90ff, #4facfe)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 20px rgba(30,144,255,0.3)' }}>
                                <Building2 size={32} color="white" />
                            </div>
                        </div>
                        <div style={{ padding: '50px 30px 40px' }}>
                            <h3 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '16px', color: 'white' }}>Réservation Intelligente</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '24px' }}>
                                Fini les salles d'attente bondées. Prenez votre ticket virtuel pour le médecin, l'administration ou la poste, et arrivez pile quand c'est votre tour.
                            </p>
                            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(150px, 1fr) minmax(150px, 1fr)', gap: '16px' }}>
                                {[
                                    { icon: <Clock size={18} />, text: "Temps Estimé" },
                                    { icon: <Users size={18} />, text: "File Virtuelle" },
                                    { icon: <Phone size={18} />, text: "Alertes SMS/App" },
                                    { icon: <Activity size={18} />, text: "Statut en Direct" }
                                ].map((item, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f1f2f6', fontWeight: 600, fontSize: '0.95rem' }}>
                                        <span style={{ color: '#1e90ff' }}>{item.icon}</span> {item.text}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>
            </section>

            {/* ===== HOW IT WORKS & FEATURES GRID ===== */}
            <section style={{ padding: 'clamp(60px, 10vw, 120px) clamp(20px, 5vw, 60px)' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '50px', background: 'rgba(255,192,72,0.1)', color: '#ffc048', fontWeight: 700, fontSize: '0.85rem', marginBottom: '16px' }}>
                            <Star size={14} /> Design & Performance
                        </div>
                        <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900 }}>Pourquoi choisir GO-DELIVERY ?</h2>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
                        {[
                            { icon: <Smartphone size={32} />, title: "App Native", desc: "Expérience fluide et ultra rapide sur votre téléphone, pensée pour le tactile.", color: '#a55eea', bg: 'rgba(165,94,234,0.1)' },
                            { icon: <Shield size={32} />, title: "Sécurité Totale", desc: "Vos données personnelles sont protégées avec des protocoles stricts.", color: '#2ed573', bg: 'rgba(46,213,115,0.1)' },
                            { icon: <Truck size={32} />, title: "Livreurs Pros", desc: "Notre flotte est formée pour garantir la meilleure qualité de service.", color: '#ff4757', bg: 'rgba(255,71,87,0.1)' },
                            { icon: <ClipboardList size={32} />, title: "Tout En Un", desc: "Livraison, médecins, poste, mairies... tout dans une seule application.", color: '#1e90ff', bg: 'rgba(30,144,255,0.1)' },
                        ].map((f, i) => (
                            <div key={i} className="pro-card" style={{ padding: '32px 24px', textAlign: 'center' }}>
                                <div style={{ width: '70px', height: '70px', borderRadius: '20px', background: f.bg, color: f.color, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                                    {f.icon}
                                </div>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '12px', color: 'white' }}>{f.title}</h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== CTA FINAL ===== */}
            <section style={{ padding: '0 clamp(20px, 5vw, 60px) clamp(60px, 10vw, 120px)' }}>
                <div style={{
                    maxWidth: '1200px', margin: '0 auto',
                    background: 'linear-gradient(135deg, rgba(255,71,87,0.1), rgba(30,144,255,0.1))',
                    border: '1px solid rgba(255,255,255,0.1)', borderRadius: '32px',
                    padding: 'clamp(40px, 8vw, 80px) clamp(30px, 6vw, 60px)',
                    display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '40px',
                    position: 'relative', overflow: 'hidden'
                }}>
                    {/* Background decoration */}
                    <div style={{ position: 'absolute', top: 0, right: 0, width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(255,71,87,0.2) 0%, transparent 70%)', filter: 'blur(40px)', pointerEvents: 'none' }}></div>

                    <div style={{ flex: '1 1 400px', zIndex: 2 }}>
                        <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, marginBottom: '20px', color: 'white', lineHeight: 1.1 }}>
                            Prêt à vivre le futur ?<br />Téléchargez l'App.
                        </h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '32px', maxWidth: '450px' }}>
                            Téléchargez l'APK Android officielle ou créez simplement un compte web pour commencer.
                        </p>
                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                            <button
                                onClick={() => setShowAuth('register')}
                                style={{
                                    padding: '16px 32px', fontSize: '1.05rem', borderRadius: '50px',
                                    background: 'white', color: 'black', border: 'none', fontWeight: 800, cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', gap: '10px', transition: 'transform 0.2s',
                                }}
                            >
                                Commencer maintenant
                            </button>
                            <a
                                href="/download"
                                style={{
                                    padding: '16px 32px', fontSize: '1.05rem', borderRadius: '50px',
                                    background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)',
                                    fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px',
                                    backdropFilter: 'blur(10px)', transition: 'background 0.2s',
                                }}
                            >
                                <Smartphone size={20} /> App Android
                            </a>
                        </div>
                    </div>

                    <div style={{ flex: '1 1 300px', display: 'flex', justifyContent: 'center', zIndex: 2 }}>
                        <div style={{ width: '220px', height: '450px', border: '12px solid #1a1c24', borderRadius: '40px', background: 'var(--bg)', boxShadow: '0 25px 50px rgba(0,0,0,0.5)', position: 'relative', overflow: 'hidden' }}>
                            {/* App Mockup screen inside */}
                            <div style={{ background: 'linear-gradient(135deg, #ff4757, #ffc048)', height: '140px', padding: '20px', color: 'white' }}>
                                <div style={{ fontWeight: 800, fontSize: '1.2rem', marginTop: '10px' }}>GO-DELIVERY</div>
                                <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Bienvenue, Cher client</div>
                            </div>
                            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div style={{ height: '80px', borderRadius: '16px', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', padding: '10px' }}>
                                    <div style={{ width: '50px', height: '50px', borderRadius: '10px', background: '#ff4757', marginLeft: '10px' }}></div>
                                </div>
                                <div style={{ height: '80px', borderRadius: '16px', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', padding: '10px' }}>
                                    <div style={{ width: '50px', height: '50px', borderRadius: '10px', background: '#1e90ff', marginLeft: '10px' }}></div>
                                </div>
                            </div>
                            {/* Home Indicator */}
                            <div style={{ position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)', width: '40%', height: '5px', background: 'rgba(255,255,255,0.2)', borderRadius: '10px' }}></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== FOOTER ===== */}
            <footer style={{
                padding: '32px clamp(20px, 5vw, 60px)',
                borderTop: '1px solid rgba(255,255,255,0.06)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                flexWrap: 'wrap', gap: '20px', background: 'rgba(10, 11, 14, 0.9)',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Truck size={20} color="#ff4757" />
                    <span style={{ fontWeight: 800, letterSpacing: '-0.5px' }}>GO-DELIVERY</span>
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    © 2026 GO-DELIVERY. L'excellence algérienne. 🇩🇿
                </div>
                <div style={{ display: 'flex', gap: '16px' }}>
                    <a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem' }}>Confidentialité</a>
                    <a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem' }}>Conditions</a>
                    <a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem' }}>Contact</a>
                </div>
            </footer>
        </div>
    );
}
