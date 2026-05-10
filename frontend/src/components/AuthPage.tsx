'use client';

import React, { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Building2, MapPin, FileText, Tag } from 'lucide-react';

interface AuthPageProps {
  onBack?: () => void;
  initialMode?: 'login' | 'register';
}

export default function AuthPage({ onBack, initialMode = 'login' }: AuthPageProps) {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  // When AuthPage is reached via the /auth route (no onBack prop), still let the user go back.
  const handleBack = onBack ?? (() => router.push('/'));
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('client');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  // Restaurant sub-type — chooses between menu-based (restaurant) and
  // shopping-list flow (superette/boucherie). Backend defaults to 'restaurant'
  // when missing, so this only matters during registration.
  const [restaurantType, setRestaurantType] = useState<'restaurant' | 'superette' | 'boucherie'>('restaurant');

  // Établissement-specific fields
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
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(name, email, password, role, phone, role === 'restaurant' ? restaurantType : undefined);

        // If place, update place info after registration
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

  return (
    <div className="auth-page">
      <div className="auth-card fade-in" style={{ maxWidth: role === 'place' && !isLogin ? '520px' : '440px', transition: 'max-width 0.3s' }}>
        <button
          onClick={handleBack}
          style={{
            background: 'none', border: 'none', color: 'var(--text-muted)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
            fontSize: '0.85rem', marginBottom: '16px', padding: 0,
            fontFamily: 'inherit',
          }}
        >
          <ChevronLeft size={18} /> Retour
        </button>

        <div style={{ textAlign: 'center', marginBottom: '8px' }}>
          <img src="/icons/icon-192.webp" alt="Réserve-vite" width={56} height={56} loading="eager" decoding="async" style={{ width: '56px', height: '56px', borderRadius: '12px' }} />
        </div>
        <h1 style={{ textAlign: 'center' }}>Réserve-vite</h1>
        <p className="subtitle" style={{ textAlign: 'center' }}>
          {isLogin ? 'Connectez-vous à votre compte' : 'Créez un nouveau compte'}
        </p>

        {error && (
          <div style={{ background: '#ff475720', color: '#ff4757', padding: '12px', borderRadius: '10px', marginBottom: '20px', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <div className="form-group">
                <label>Nom complet</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ahmed Ben Ali" required />
              </div>
              <div className="form-group">
                <label>Rôle</label>
                <select value={role} onChange={(e) => setRole(e.target.value)}>
                  <option value="client">👤 Client</option>
                  <option value="restaurant">🍽️ Commerce (Restaurant / Supérette / Boucherie)</option>
                  <option value="driver">🚚 Livreur</option>
                  <option value="place">🏢 Établissement (Médecin, Poste...)</option>
                </select>
              </div>

              {role === 'restaurant' && (
                <div className="form-group">
                  <label>Type de commerce</label>
                  <select value={restaurantType} onChange={(e) => setRestaurantType(e.target.value as 'restaurant' | 'superette' | 'boucherie')}>
                    <option value="restaurant">🍽️ Restaurant (menu)</option>
                    <option value="superette">🛒 Supérette (liste de courses)</option>
                    <option value="boucherie">🥩 Boucherie (liste de courses)</option>
                  </select>
                  {restaurantType !== 'restaurant' && (
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                      Le client envoie une liste, le livreur achète et livre.
                    </p>
                  )}
                </div>
              )}

              <div className="form-group">
                <label>Téléphone</label>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="06 00 00 00 00" />
              </div>

              {/* ===== PLACE-SPECIFIC FIELDS ===== */}
              {role === 'place' && (
                <div style={{
                  background: 'rgba(30,144,255,0.05)',
                  border: '1px solid rgba(30,144,255,0.15)',
                  borderRadius: '14px',
                  padding: '16px',
                  marginBottom: '16px',
                }}>
                  <h4 style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: '14px', color: '#1e90ff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Building2 size={16} /> Informations de l&apos;établissement
                  </h4>

                  <div className="form-group" style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
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

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div className="form-group" style={{ marginBottom: '12px' }}>
                      <label>Type</label>
                      <select value={placeType} onChange={(e) => setPlaceType(e.target.value)}>
                        <option value="doctor">🩺 Médecin</option>
                        <option value="clinic">🏥 Clinique</option>
                        <option value="government">🏢 Administration</option>
                        <option value="other">📮 Autre</option>
                      </select>
                    </div>
                    <div className="form-group" style={{ marginBottom: '12px' }}>
                      <label>Icône</label>
                      <select value={placeIcon} onChange={(e) => setPlaceIcon(e.target.value)}>
                        {iconOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
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
                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
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
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" required />
          </div>

          <div className="form-group">
            <label>Mot de passe</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>

          <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: '8px' }}>
            {isLogin ? 'Se Connecter' : 'Créer un Compte'}
          </button>
        </form>

        <div className="auth-toggle">
          {isLogin ? (
            <span>Pas de compte ? <a onClick={() => setIsLogin(false)}>Inscrivez-vous</a></span>
          ) : (
            <span>Déjà un compte ? <a onClick={() => setIsLogin(true)}>Connectez-vous</a></span>
          )}
        </div>
      </div>
    </div>
  );
}
