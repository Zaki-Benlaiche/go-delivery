'use client';

import React from 'react';
import { Truck, Smartphone, Star, Zap, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface LandingPageProps {
    onGetStarted?: () => void;
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
    return (
        <div className="landing-page" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', color: 'var(--text)' }}>
            {/* Navbar Minimalist for Landing */}
            <nav style={{ padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Truck size={28} color="#ff4757" />
                    <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>GO-DELIVERY</span>
                </div>
                <Link href="/auth" style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '10px 20px', borderRadius: '50px', border: '1px solid rgba(255,255,255,0.3)', color: 'var(--text)', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>
                    Se connecter <ChevronRight size={16} />
                </Link>
            </nav>

            {/* Hero Section */}
            <main style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '40px 20px' }}>
                <div className="fade-in" style={{ maxWidth: '800px' }}>
                    <div style={{ display: 'inline-block', padding: '10px 20px', background: 'rgba(255, 71, 87, 0.1)', color: '#ff4757', borderRadius: '50px', marginBottom: '20px', fontWeight: 'bold', fontSize: '0.9rem' }}>
                        🚀 La meilleure plateforme de livraison en Algérie
                    </div>

                    <h1 style={{ fontSize: '3.5rem', marginBottom: '20px', lineHeight: 1.2, fontWeight: 900 }}>
                        Livraison rapide, <br />
                        <span style={{ color: '#ff4757' }}>Où que vous soyez.</span>
                    </h1>

                    <p style={{ fontSize: '1.2rem', opacity: 0.8, marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px' }}>
                        Rejoignez GO-DELIVERY, commandez vos repas préférés ou devenez partenaire. Téléchargez notre application pour la meilleure expérience mobile.
                    </p>

                    <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Link
                            href="/auth?mode=register"
                            className="btn btn-primary"
                            style={{ padding: '15px 30px', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '10px', borderRadius: '50px', textDecoration: 'none' }}
                        >
                            Créer un compte
                        </Link>
                        <Link
                            href="/download"
                            className="btn"
                            style={{ padding: '15px 30px', fontSize: '1.1rem', background: '#333', color: 'white', display: 'flex', alignItems: 'center', gap: '10px', borderRadius: '50px', border: 'none', cursor: 'pointer', textDecoration: 'none' }}
                        >
                            <Smartphone size={20} />
                            Télécharger l&apos;App (APK)
                        </Link>
                    </div>
                </div>

                {/* Features Preview */}
                <div className="fade-in" style={{ display: 'flex', gap: '30px', marginTop: '80px', flexWrap: 'wrap', justifyContent: 'center', animationDelay: '0.2s' }}>
                    <div style={{ background: 'var(--bg-card)', padding: '30px', borderRadius: '20px', width: '250px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <Zap size={32} color="#ff4757" style={{ marginBottom: '15px' }} />
                        <h3 style={{ marginBottom: '10px' }}>Rapide &amp; Efficace</h3>
                        <p style={{ opacity: 0.7, fontSize: '0.9rem' }}>Vos commandes livrées en un temps record grâce à nos coursiers.</p>
                    </div>
                    <div style={{ background: 'var(--bg-card)', padding: '30px', borderRadius: '20px', width: '250px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <Star size={32} color="#ff4757" style={{ marginBottom: '15px' }} />
                        <h3 style={{ marginBottom: '10px' }}>Qualité Premium</h3>
                        <p style={{ opacity: 0.7, fontSize: '0.9rem' }}>Les meilleurs restaurants de votre ville, sélectionnés pour vous.</p>
                    </div>
                    <div style={{ background: 'var(--bg-card)', padding: '30px', borderRadius: '20px', width: '250px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <Smartphone size={32} color="#ff4757" style={{ marginBottom: '15px' }} />
                        <h3 style={{ marginBottom: '10px' }}>App Native</h3>
                        <p style={{ opacity: 0.7, fontSize: '0.9rem' }}>Profitez de l&apos;expérience ultime sur votre téléphone Android.</p>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer style={{ padding: '20px', textAlign: 'center', opacity: 0.5, fontSize: '0.9rem' }}>
                © 2026 GO-DELIVERY. Tous droits réservés.
            </footer>
        </div>
    );
}
