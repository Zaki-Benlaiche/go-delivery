'use client';

import React from 'react';
import { Download, Smartphone, FastForward, ShieldCheck } from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function DownloadPage() {
  return (
    <div className="app-layout">
      <Navbar />
      <div className="container fade-in" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', paddingTop: '4rem' }}>
        <div className="glass-card" style={{ padding: '3rem', borderRadius: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
          
          <div style={{ backgroundColor: 'rgba(255, 71, 87, 0.1)', padding: '1.5rem', borderRadius: '50%', marginBottom: '1rem' }}>
            <Smartphone size={64} color="#ff4757" />
          </div>

          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0, background: 'linear-gradient(45deg, #ff4757, #ff6b81)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            GO-DELIVERY للموبايل
          </h1>
          
          <p style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, maxWidth: '600px' }}>
            استمتع بتجربة طلب طعام أسرع وأكثر سلاسة. قم بتنزيل تطبيق الأندرويد الآن وتتبع طلباتك في الوقت الفعلي!
          </p>

          <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.9)' }}>
              <FastForward size={20} color="#2ed573" /> طلب سريع
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.9)' }}>
              <ShieldCheck size={20} color="#1e90ff" /> دفع آمن
            </div>
          </div>

          <a 
            href="/go-delivery-app.apk" 
            download="go-delivery-app.apk"
            className="btn btn-primary"
            style={{ marginTop: '2rem', padding: '1rem 2.5rem', fontSize: '1.2rem', display: 'inline-flex', alignItems: 'center', gap: '0.75rem', borderRadius: '50px', textDecoration: 'none' }}
          >
            <Download size={24} />
            تنزيل التطبيق (APK)
          </a>
          
          <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', marginTop: '1rem' }}>
            الإصدار 1.0.0 • يدعم Android 8.0 والفئات الأحدث
          </p>
        </div>
      </div>
    </div>
  );
}
