'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, Download, Globe, Smartphone, Plus, Chrome,
  CheckCircle, Shield, QrCode, Zap, Star, ChevronRight,
} from 'lucide-react';

const PWA_STEPS = [
  {
    icon: <Chrome size={18} />,
    title: 'Ouvrez Google Chrome',
    desc: 'Naviguez vers le site dans Chrome sur votre Android.',
    color: '#ff4757',
  },
  {
    icon: <Smartphone size={18} />,
    title: 'Menu du navigateur',
    desc: 'Appuyez sur les trois points ⋮ en haut à droite de l\'écran.',
    color: '#ffc048',
  },
  {
    icon: <Plus size={18} />,
    title: 'Ajouter à l\'écran d\'accueil',
    desc: 'Sélectionnez « Ajouter à l\'écran d\'accueil » dans le menu.',
    color: '#1e90ff',
  },
  {
    icon: <CheckCircle size={18} />,
    title: 'C\'est prêt !',
    desc: 'L\'app apparaît sur votre écran d\'accueil comme une app native.',
    color: '#2ed573',
  },
];

const APK_STEPS = [
  {
    icon: <Shield size={18} />,
    title: 'Autoriser les sources inconnues',
    desc: 'Paramètres → Sécurité → Sources inconnues → Activer.',
    color: '#ffc048',
  },
  {
    icon: <Download size={18} />,
    title: 'Télécharger le fichier APK',
    desc: 'Appuyez sur le bouton de téléchargement ci-dessous.',
    color: '#ff4757',
  },
  {
    icon: <Smartphone size={18} />,
    title: 'Ouvrir le fichier',
    desc: 'Depuis votre gestionnaire de fichiers, ouvrez reserve-vite.apk.',
    color: '#1e90ff',
  },
  {
    icon: <CheckCircle size={18} />,
    title: 'Installer',
    desc: 'Suivez les instructions d\'installation Android et confirmez.',
    color: '#2ed573',
  },
];

export default function DownloadPage() {
  const [activeTab, setActiveTab] = useState<'pwa' | 'apk'>('pwa');
  const steps = activeTab === 'pwa' ? PWA_STEPS : APK_STEPS;

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', color: 'var(--text)', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* ===== TOP BAR ===== */}
      <nav style={{
        borderBottom: '1px solid var(--border)',
        padding: '12px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        background: 'rgba(10,11,14,0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        <Link href="/" style={{
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          textDecoration: 'none',
          fontSize: '0.82rem',
          fontWeight: 600,
          padding: '6px 12px',
          borderRadius: '8px',
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border)',
          flexShrink: 0,
        }}>
          <ArrowLeft size={14} /> Retour
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img src="/logo.svg" alt="Réserve-vite" style={{ width: '28px', height: '28px', borderRadius: '7px' }} />
          <span style={{
            fontWeight: 900, fontSize: '0.92rem', letterSpacing: '-0.3px',
            background: 'linear-gradient(135deg, #ff4757, #ffc048)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            RÉSERVE-VITE
          </span>
        </div>
      </nav>

      {/* ===== CONTENT ===== */}
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '36px 20px 72px' }}>

        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{
            width: '90px', height: '90px', margin: '0 auto 20px',
            borderRadius: '24px', overflow: 'hidden',
            boxShadow: '0 16px 48px rgba(255,71,87,0.25)',
            border: '2px solid rgba(255,71,87,0.2)',
          }}>
            <img src="/logo.svg" alt="Réserve-vite" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>

          <h1 style={{ fontSize: 'clamp(1.6rem, 5vw, 2.4rem)', fontWeight: 900, marginBottom: '10px', letterSpacing: '-0.5px' }}>
            Réserve-vite
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.7, maxWidth: '420px', margin: '0 auto 24px' }}>
            Commandez vos repas et réservez votre tour en file d&apos;attente — partout, tout le temps.
          </p>

          {/* Stats pills */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
              { icon: <Star size={13} fill="#ffc048" color="#ffc048" />, label: '4.8 / 5' },
              { icon: <Smartphone size={13} color="#2ed573" />, label: 'Android 8.0+' },
              { icon: <Zap size={13} color="#ff4757" />, label: '100% Gratuit' },
            ].map((pill, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '6px 14px', borderRadius: '20px',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                fontSize: '0.78rem', fontWeight: 600,
              }}>
                {pill.icon} {pill.label}
              </div>
            ))}
          </div>
        </div>

        {/* ===== TAB SWITCHER ===== */}
        <div style={{
          display: 'flex', gap: '6px',
          background: 'var(--bg-elevated)',
          padding: '5px', borderRadius: '14px',
          marginBottom: '24px',
        }}>
          {[
            { key: 'pwa' as const, icon: <Globe size={15} />, label: 'Web App (recommandé)', sublabel: 'Sans téléchargement' },
            { key: 'apk' as const, icon: <Download size={15} />, label: 'Fichier APK', sublabel: 'Installation directe' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                flex: 1, padding: '11px 12px', borderRadius: '10px', border: 'none',
                background: activeTab === tab.key ? 'var(--primary)' : 'transparent',
                color: activeTab === tab.key ? 'white' : 'var(--text-muted)',
                fontWeight: 700, cursor: 'pointer', transition: 'all 0.25s',
                fontFamily: 'inherit', display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: '3px',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.82rem' }}>
                {tab.icon} {tab.label}
              </span>
              <span style={{ fontSize: '0.68rem', opacity: 0.75, fontWeight: 500 }}>{tab.sublabel}</span>
            </button>
          ))}
        </div>

        {/* ===== STEPS CARD ===== */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '20px',
          padding: '24px',
          marginBottom: '16px',
        }}>
          <h2 style={{ fontSize: '0.92rem', fontWeight: 800, marginBottom: '24px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {activeTab === 'pwa' ? <><Globe size={16} /> Procédure d&apos;installation</> : <><Shield size={16} /> Procédure d&apos;installation</>}
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {steps.map((step, i) => (
              <div key={i} style={{ display: 'flex', gap: '16px', paddingBottom: i < steps.length - 1 ? '24px' : '0', position: 'relative' }}>
                {/* Connector */}
                {i < steps.length - 1 && (
                  <div style={{
                    position: 'absolute', left: '19px', top: '40px',
                    width: '2px', height: 'calc(100% - 18px)',
                    background: `linear-gradient(to bottom, ${step.color}40, ${steps[i + 1].color}20)`,
                  }} />
                )}
                {/* Icon circle */}
                <div style={{
                  width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
                  background: `${step.color}18`,
                  color: step.color,
                  border: `2px solid ${step.color}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  zIndex: 1,
                }}>
                  {step.icon}
                </div>
                {/* Text */}
                <div style={{ paddingTop: '8px', minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '4px' }}>{step.title}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', lineHeight: 1.6 }}>{step.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ===== CTA / INFO BLOCK ===== */}
        {activeTab === 'apk' ? (
          <a
            href="/reserve-vite.apk"
            download="reserve-vite.apk"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'linear-gradient(135deg, #ff4757 0%, #ff6b81 100%)',
              color: 'white', padding: '18px 22px', borderRadius: '16px',
              textDecoration: 'none', marginBottom: '16px',
              boxShadow: '0 10px 30px rgba(255,71,87,0.3)',
              transition: 'filter 0.2s',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '48px', height: '48px',
                background: 'rgba(255,255,255,0.18)',
                borderRadius: '13px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Download size={24} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: '3px' }}>Télécharger le fichier APK</div>
                <div style={{ fontSize: '0.78rem', opacity: 0.85 }}>reserve-vite.apk · Android 8.0+ · Gratuit</div>
              </div>
            </div>
            <ChevronRight size={20} style={{ opacity: 0.7, flexShrink: 0 }} />
          </a>
        ) : (
          <div style={{
            background: 'var(--success-glow)',
            border: '1px solid rgba(46,213,115,0.2)',
            borderRadius: '16px',
            padding: '16px 20px',
            display: 'flex', alignItems: 'center', gap: '14px',
            marginBottom: '16px',
          }}>
            <CheckCircle size={22} color="#2ed573" style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#2ed573', marginBottom: '3px' }}>
                Aucun téléchargement requis
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                La web app s&apos;installe en quelques secondes depuis Chrome et se met à jour automatiquement.
              </div>
            </div>
          </div>
        )}

        {/* ===== QR CODE ===== */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '20px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '14px',
          textAlign: 'center',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <QrCode size={18} color="var(--primary)" />
            <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>Scanner pour accéder directement</span>
          </div>

          <div style={{ background: '#ffffff', borderRadius: '16px', padding: '14px', display: 'inline-block' }}>
            <img
              src="/qrcode.png"
              alt="QR Code — Réserve-vite"
              style={{ width: '160px', height: '160px', display: 'block' }}
            />
          </div>

          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5, maxWidth: '300px' }}>
            Pointez l&apos;appareil photo de votre téléphone vers le code pour ouvrir l&apos;application instantanément.
          </p>
        </div>

      </div>
    </div>
  );
}
