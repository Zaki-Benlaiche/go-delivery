import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Réserve-vite | Livraison & Réservation',
  description: 'Order from the best restaurants. Fast, reliable delivery.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Réserve-vite',
  },
};

export const viewport: Viewport = {
  themeColor: '#ff4757',
  width: 'device-width',
  initialScale: 1,
  // No maximumScale / userScalable lock — blocking zoom hurts users with low
  // vision and violates WCAG 1.4.4. The form-field zoom-on-focus jitter on iOS
  // is handled by 16px+ font-size on inputs in globals.css instead.
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icons/logo-256.webp" />
      </head>
      <body>{children}</body>
    </html>
  );
}
