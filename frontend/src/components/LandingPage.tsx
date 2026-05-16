'use client';

import React, { useState, useEffect } from 'react';
import {
  Truck, Star, Zap, ClipboardList, MapPin, Shield, Users, ArrowRight,
  Utensils, Phone, Activity, Sparkles, Building2, UserCircle2, Smartphone,
  CheckCircle2,
} from 'lucide-react';
import AuthPage from './AuthPage';

// Marketing landing for non-authed visitors. Four pillars: restaurants,
// drivers, places (queue tickets) and clients. Register flow + APK download.
export default function LandingPage() {
  const [showAuth, setShowAuth] = useState<'login' | 'register' | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (showAuth) {
    return <AuthPage onBack={() => setShowAuth(null)} initialMode={showAuth} />;
  }

  return (
    <div className="landing">
      {/* NAV */}
      <nav className={`landing-nav ${scrolled ? 'is-scrolled' : ''}`}>
        <div className="landing-nav-brand">
          <img src="/icons/logo-192.webp" alt="Réserve-vite" width={36} height={36} loading="eager" decoding="async" />
          <span>
            <strong>Réserve</strong>-vite
          </span>
        </div>
        <div className="landing-nav-actions">
          <button onClick={() => setShowAuth('login')} className="landing-nav-login">
            <UserCircle2 size={15} /> Connexion
          </button>
          <button onClick={() => setShowAuth('register')} className="landing-nav-register">
            S&apos;inscrire <ArrowRight size={14} />
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section className="landing-hero">
        <div className="landing-hero-bg-1" aria-hidden="true" />
        <div className="landing-hero-bg-2" aria-hidden="true" />

        <div className="landing-hero-inner">
          <div className="landing-hero-text fade-in">
            <div className="landing-badge">
              <Sparkles size={14} /> Made in Algeria
            </div>
            <h1 className="landing-h1">
              Tout livré.<br />
              <span className="landing-h1-accent">Tout réservé.</span>
            </h1>
            <p className="landing-lead">
              Restaurants, médecins, mairie — une seule app pour vos commandes et vos tickets de
              file d&apos;attente, partout en Algérie.
            </p>
            <div className="landing-cta-row">
              <button onClick={() => setShowAuth('register')} className="btn btn-primary landing-cta-primary">
                Commencer <ArrowRight size={16} />
              </button>
              <a href="/download" className="btn btn-secondary landing-cta-secondary">
                <Smartphone size={16} /> Télécharger l&apos;APK
              </a>
            </div>
            <div className="landing-meta-row">
              <span><CheckCircle2 size={14} color="var(--success)" /> Paiement à la livraison</span>
              <span><CheckCircle2 size={14} color="var(--success)" /> 100% en français</span>
              <span><CheckCircle2 size={14} color="var(--success)" /> Compte vendeur gratuit</span>
            </div>
          </div>

          <div className="landing-hero-visual fade-in">
            <div className="landing-phone">
              <div className="landing-phone-screen">
                <div className="landing-phone-bar" />
                <div className="landing-phone-card landing-phone-card-1">
                  <div className="landing-phone-card-icon" style={{ background: 'var(--primary-glow)', color: 'var(--primary)' }}>
                    <Utensils size={18} />
                  </div>
                  <div>
                    <strong>Pizza Palace</strong>
                    <div>30-40 min · Ouvert</div>
                  </div>
                </div>
                <div className="landing-phone-card landing-phone-card-2">
                  <div className="landing-phone-card-icon" style={{ background: 'var(--success-glow)', color: 'var(--role-driver)' }}>
                    <Truck size={18} />
                  </div>
                  <div>
                    <strong>Mohamed (livreur)</strong>
                    <div>Course acceptée · 5 min</div>
                  </div>
                </div>
                <div className="landing-phone-card landing-phone-card-3">
                  <div className="landing-phone-card-icon" style={{ background: 'var(--info-glow)', color: 'var(--info)' }}>
                    <ClipboardList size={18} />
                  </div>
                  <div>
                    <strong>Dr. Karim</strong>
                    <div>3 personnes avant · ~45 min</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES — 4 roles */}
      <section className="landing-section">
        <div className="landing-section-head">
          <span className="landing-section-tag">SERVICES</span>
          <h2>Une plateforme, quatre espaces.</h2>
          <p>Chaque rôle a son tableau de bord, ses notifications, et son flux adapté.</p>
        </div>

        <div className="landing-services-grid">
          {SERVICES.map((s) => (
            <div key={s.label} className="landing-service-card">
              <div className="landing-service-icon" style={{ background: s.bg, color: s.color }}>
                {s.icon}
              </div>
              <h3>{s.label}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="landing-section landing-section-alt">
        <div className="landing-section-head">
          <span className="landing-section-tag">EN 3 ÉTAPES</span>
          <h2>De la commande à la livraison.</h2>
        </div>

        <div className="landing-steps">
          {STEPS.map((s, i) => (
            <div key={s.title} className="landing-step">
              <div className="landing-step-num">{i + 1}</div>
              <div className="landing-step-icon">{s.icon}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* WHY */}
      <section className="landing-section">
        <div className="landing-section-head">
          <span className="landing-section-tag">POURQUOI</span>
          <h2>Pensé pour l&apos;Algérie.</h2>
        </div>

        <div className="landing-features-grid">
          {FEATURES.map((f) => (
            <div key={f.label} className="landing-feature">
              <div className="landing-feature-icon">{f.icon}</div>
              <h4>{f.label}</h4>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="landing-cta-section">
        <div className="landing-cta-card">
          <Sparkles size={28} color="var(--primary)" />
          <h2>Prêt à commencer ?</h2>
          <p>Compte gratuit en 30 secondes, aucune carte bancaire requise.</p>
          <div className="landing-cta-row landing-cta-row-center">
            <button onClick={() => setShowAuth('register')} className="btn btn-primary landing-cta-primary">
              Créer un compte <ArrowRight size={16} />
            </button>
            <button onClick={() => setShowAuth('login')} className="btn btn-secondary landing-cta-secondary">
              <UserCircle2 size={16} /> J&apos;ai déjà un compte
            </button>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <span>© 2025 Réserve-vite — Algérie</span>
        <a href="/download">Télécharger l&apos;APK</a>
      </footer>
    </div>
  );
}

const SERVICES = [
  { label: 'Restaurants', icon: <Utensils size={22} />, color: 'var(--role-restaurant)', bg: 'var(--primary-glow)', desc: 'Menus, panier, suivi en temps réel.' },
  { label: 'Livreurs', icon: <Truck size={22} />, color: 'var(--role-driver)', bg: 'var(--success-glow)', desc: 'Acceptez des courses, fixez votre tarif.' },
  { label: 'Médecins & admins', icon: <Building2 size={22} />, color: 'var(--role-place)', bg: 'var(--info-glow)', desc: 'Vos patients prennent un ticket à distance.' },
  { label: 'Clients', icon: <UserCircle2 size={22} />, color: 'var(--role-client)', bg: 'var(--accent-glow)', desc: 'Tout en un, un seul compte.' },
];

const STEPS = [
  { icon: <Smartphone size={28} color="var(--primary)" />, title: 'Choisissez', desc: 'Restaurant ou ticket de file — quelques tapotements.' },
  { icon: <Zap size={28} color="var(--accent)" />, title: 'Envoyez', desc: 'Confirmation instantanée et notification au commerce / livreur.' },
  { icon: <Truck size={28} color="var(--info)" />, title: 'Recevez', desc: 'Suivi en direct du livreur jusqu\'à votre porte.' },
];

const FEATURES = [
  { icon: <Shield size={20} color="var(--success)" />, label: 'Données sécurisées', desc: 'Mots de passe hashés, sessions chiffrées.' },
  { icon: <Zap size={20} color="var(--accent)" />, label: 'Temps réel', desc: 'Sockets pour les notifications et le suivi des courses.' },
  { icon: <MapPin size={20} color="var(--info)" />, label: 'Pensé local', desc: 'DA, français, et adresses libres — pas de GPS imposé.' },
  { icon: <Phone size={20} color="var(--primary)" />, label: 'Paiement cash', desc: 'À la livraison, comme tout le monde fait déjà.' },
  { icon: <Activity size={20} color="var(--violet)" />, label: 'Notifications', desc: 'Vibration et son pour ne rien rater.' },
  { icon: <Users size={20} color="var(--role-driver)" />, label: 'Multi-rôles', desc: 'Client, restaurant, livreur, médecin — un seul code.' },
  { icon: <ClipboardList size={20} color="var(--role-place)" />, label: 'Files de réservation', desc: 'Prenez un ticket pour le médecin sans bouger.' },
  { icon: <Star size={20} color="var(--accent)" />, label: 'Gratuit pour démarrer', desc: 'Compte vendeur gratuit, sans engagement.' },
];
