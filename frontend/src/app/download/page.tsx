'use client';

import React from 'react';
import { Download, Smartphone, FastForward, ShieldCheck, Plus, Share, Globe } from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function DownloadPage() {
  return (
    <div className="app-layout">
      <Navbar />
      <div className="container fade-in" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', paddingTop: '4rem' }}>
        <div className="glass-card" style={{ padding: '3rem', borderRadius: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
          
          <img src="/logo.png" alt="Réserve-vite" style={{ width: '80px', height: '80px', borderRadius: '20px' }} />

          <h1 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.5rem)', fontWeight: 800, margin: 0, background: 'linear-gradient(45deg, #ff4757, #ff6b81)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Réserve-vite
          </h1>
          
          <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, maxWidth: '600px' }}>
            استمتع بتجربة طلب طعام أسرع وأكثر سلاسة. قم بتثبيت التطبيق وتتبع طلباتك في الوقت الفعلي!
          </p>

          <div style={{ display: 'flex', gap: '2rem', marginTop: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.9)' }}>
              <FastForward size={20} color="#2ed573" /> طلب سريع
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.9)' }}>
              <ShieldCheck size={20} color="#1e90ff" /> حجز ذكي
            </div>
          </div>

          {/* ===== PWA INSTALL (الطريقة الأساسية) ===== */}
          <div style={{
            width: '100%', padding: '24px', borderRadius: '18px',
            background: 'linear-gradient(135deg, rgba(255,71,87,0.08), rgba(255,192,72,0.06))',
            border: '1px solid rgba(255,71,87,0.12)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '16px' }}>
              <Globe size={20} color="#ff4757" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>تثبيت التطبيق (مُوصى به)</h3>
            </div>

            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '400px', margin: '0 auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(255,71,87,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#ff4757', fontWeight: 800, fontSize: '0.78rem' }}>1</div>
                <span>افتح التطبيق في المتصفح Chrome</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(255,71,87,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#ff4757', fontWeight: 800, fontSize: '0.78rem' }}>2</div>
                <span>اضغط على <Share size={14} style={{ verticalAlign: 'middle' }} /> أو ⋮ (القائمة)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(255,71,87,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#ff4757', fontWeight: 800, fontSize: '0.78rem' }}>3</div>
                <span>اختر &quot;إضافة إلى الشاشة الرئيسية&quot; <Plus size={14} style={{ verticalAlign: 'middle' }} /></span>
              </div>
            </div>

            <p style={{ fontSize: '0.78rem', color: 'rgba(46,213,115,0.8)', marginTop: '14px', fontWeight: 600 }}>
              ✅ سيظهر التطبيق باسم &quot;Réserve-vite&quot; مع الشعار الجديد
            </p>
          </div>

          {/* ===== APK DOWNLOAD ===== */}
          <div style={{ width: '100%', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1.5rem' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
              أو حمّل ملف APK مباشرة:
            </p>
            <a 
              href="/go-delivery-app.apk" 
              download="reserve-vite.apk"
              className="btn btn-secondary"
              style={{ padding: '12px 24px', fontSize: '0.92rem', display: 'inline-flex', alignItems: 'center', gap: '8px', borderRadius: '50px', textDecoration: 'none' }}
            >
              <Download size={18} />
              تنزيل APK
            </a>
            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', marginTop: '8px' }}>
              الإصدار 1.0.0 • Android 8.0+
            </p>
          </div>

          {/* QR Code Section */}
          <div style={{
            padding: '1.5rem',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem',
            width: '100%',
          }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)' }}>
              📸 امسح رمز QR للدخول مباشرة
            </h3>
            <div style={{
              background: '#fff',
              borderRadius: '16px', padding: '12px',
            }}>
              <img
                src="/qrcode.png"
                alt="QR Code - Réserve-vite"
                style={{ width: '180px', height: '180px', display: 'block' }}
              />
            </div>
            <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)' }}>
              go-delivery-ten.vercel.app
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
