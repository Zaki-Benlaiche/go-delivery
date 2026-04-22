'use client';

import React, { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useSearchParams, useRouter } from 'next/navigation';

export default function AuthPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(searchParams.get('mode') !== 'register');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('client');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  const { login, register } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(name, email, password, role, phone);
      }
      router.push('/');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      setError(msg);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card fade-in">
        <div style={{ textAlign: 'center', marginBottom: '8px' }}>
          <img src="/logo.png" alt="GO-DELIVERY" style={{ width: '56px', height: '56px', borderRadius: '12px' }} />
        </div>
        <h1 style={{ textAlign: 'center' }}>GO-DELIVERY</h1>
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
                  <option value="client">Client</option>
                  <option value="restaurant">Restaurant</option>
                  <option value="driver">Livreur</option>
                  <option value="place">Établissement (Médecin, Poste...)</option>
                </select>
              </div>
              <div className="form-group">
                <label>Téléphone</label>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="06 00 00 00 00" />
              </div>
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
