'use client';

import React, { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft, Building2, MapPin, FileText, Tag,
  User as UserIcon, Truck, Utensils, ShoppingCart, Beef, Stethoscope,
} from 'lucide-react';

interface AuthPageProps {
  onBack?: () => void;
  initialMode?: 'login' | 'register';
}

type RegisterRole = 'client' | 'restaurant' | 'superette' | 'boucherie' | 'driver' | 'place';

// Visual role picker entries. Each role gets its own colour token so the cards
// communicate kind at a glance — the customer-facing flow has six distinct
// account types now that superette/boucherie are first-class roles.
const ROLES: Array<{ value: RegisterRole; label: string; sub: string; icon: React.ReactNode; color: string }> = [
  { value: 'client', label: 'Client', sub: 'Commander à manger ou prendre un ticket', icon: <UserIcon size={18} />, color: 'var(--role-client)' },
  { value: 'restaurant', label: 'Restaurant', sub: 'Menu + commandes en temps réel', icon: <Utensils size={18} />, color: 'var(--role-restaurant)' },
  { value: 'superette', label: 'Supérette', sub: 'Le livreur achète selon la liste', icon: <ShoppingCart size={18} />, color: 'var(--role-superette)' },
  { value: 'boucherie', label: 'Boucherie', sub: 'Viande sur commande, liste libre', icon: <Beef size={18} />, color: 'var(--role-boucherie)' },
  { value: 'driver', label: 'Livreur', sub: 'Accepter des courses, fixer le prix', icon: <Truck size={18} />, color: 'var(--role-driver)' },
  { value: 'place', label: 'Établissement', sub: 'Médecin, mairie, poste — file d\'attente', icon: <Stethoscope size={18} />, color: 'var(--role-place)' },
];

export default function AuthPage({ onBack, initialMode = 'login' }: AuthPageProps) {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  // Reached via /auth route (no onBack prop) → still let the user go home.
  const handleBack = onBack ?? (() => router.push('/'));
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<RegisterRole>('client');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Établissement-specific fields (only collected when role === 'place')
  const [placeName, setPlaceName] = useState('');
  const [placeAddress, setPlaceAddress] = useState('');
  const [placeDescription, setPlaceDescription] = useState('');
  const [placeType, setPlaceType] = useState('other');
  const [placeIcon, setPlaceIcon] = useState('🏢');

  const login = useAuthStore((s) => s.login);
  const register = useAuthStore((s) => s.register);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        // Backend treats superette/boucherie as roles now; restaurantType arg
        // is only used for plain 'restaurant' → legacy field, harmless.
        await register(name, email, password, role, phone);

        if (role === 'place' && placeName) {
          try {
            const api = (await import('@/lib/api')).default;
            const placeRes = await api.get('/reservations/my-place');
            if (placeRes.data?.place?.id) {
              await api.put(`/places/${placeRes.data.place.id}`, {
                name: placeName,
                address: placeAddress,
                description: placeDescription,
                type: placeType,
                icon: placeIcon,
              });
            }
          } catch {
            // Place info can be updated later from dashboard
          }
        }
      }
      router.push('/');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const iconOptions = [
    { value: '🩺', label: '🩺 Médecin' },
    { value: '🦷', label: '🦷 Dentiste' },
    { value: '🏥', label: '🏥 Clinique' },
    { value: '🏢', label: '🏢 Administration' },
    { value: '📮', label: '📮 Poste' },
    { value: '⚖️', label: '⚖️ Justice' },
    { value: '🏦', label: '🏦 Banque' },
    { value: '🎓', label: '🎓 Université' },
  ];

  const isExpandedCard = role === 'place' && !isLogin;

  return (
    <div className="auth-page">
      <div className={`auth-card fade-in ${isExpandedCard ? 'auth-card-wide' : ''}`}>
        <button onClick={handleBack} className="auth-back-btn">
          <ChevronLeft size={18} /> Retour
        </button>

        <div className="auth-logo">
          <img
            src="/icons/icon-192.webp"
            alt="Réserve-vite"
            width={56}
            height={56}
            loading="eager"
            decoding="async"
          />
        </div>
        <h1>Réserve-vite</h1>
        <p className="subtitle">{isLogin ? 'Connectez-vous à votre compte' : 'Créez un nouveau compte'}</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <div className="form-group">
                <label>Nom complet</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ahmed Ben Ali"
                  required
                />
              </div>

              <div className="form-group">
                <label>Choisissez votre rôle</label>
                <div className="role-grid">
                  {ROLES.map((r) => {
                    const active = role === r.value;
                    return (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => setRole(r.value)}
                        className={`role-card ${active ? 'is-active' : ''}`}
                        style={active ? { '--role-color': r.color } as React.CSSProperties : undefined}
                      >
                        <span className="role-card-icon" style={{ color: r.color }}>
                          {r.icon}
                        </span>
                        <span className="role-card-text">
                          <span className="role-card-label">{r.label}</span>
                          <span className="role-card-sub">{r.sub}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="form-group">
                <label>Téléphone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="06 00 00 00 00"
                />
              </div>

              {role === 'place' && (
                <div className="place-fields">
                  <h4 className="place-fields-title">
                    <Building2 size={16} /> Informations de l&apos;établissement
                  </h4>

                  <div className="form-group">
                    <label>
                      <Tag size={12} /> Nom de l&apos;établissement
                    </label>
                    <input
                      type="text"
                      value={placeName}
                      onChange={(e) => setPlaceName(e.target.value)}
                      placeholder="ex: Dr. Karim - Cardiologue"
                      required
                    />
                  </div>

                  <div className="place-fields-row">
                    <div className="form-group">
                      <label>Type</label>
                      <select value={placeType} onChange={(e) => setPlaceType(e.target.value)}>
                        <option value="doctor">🩺 Médecin</option>
                        <option value="clinic">🏥 Clinique</option>
                        <option value="government">🏢 Administration</option>
                        <option value="other">📮 Autre</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Icône</label>
                      <select value={placeIcon} onChange={(e) => setPlaceIcon(e.target.value)}>
                        {iconOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>
                      <MapPin size={12} /> Adresse
                    </label>
                    <input
                      type="text"
                      value={placeAddress}
                      onChange={(e) => setPlaceAddress(e.target.value)}
                      placeholder="ex: Centre Ville, Constantine"
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>
                      <FileText size={12} /> Description
                    </label>
                    <input
                      type="text"
                      value={placeDescription}
                      onChange={(e) => setPlaceDescription(e.target.value)}
                      placeholder="ex: Consultation cardiologie"
                    />
                  </div>
                </div>
              )}
            </>
          )}

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label>Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block auth-submit-btn" disabled={submitting}>
            {submitting ? '...' : isLogin ? 'Se Connecter' : 'Créer un Compte'}
          </button>
        </form>

        <div className="auth-toggle">
          {isLogin ? (
            <span>
              Pas de compte ?{' '}
              <a onClick={() => setIsLogin(false)}>Inscrivez-vous</a>
            </span>
          ) : (
            <span>
              Déjà un compte ?{' '}
              <a onClick={() => setIsLogin(true)}>Connectez-vous</a>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
