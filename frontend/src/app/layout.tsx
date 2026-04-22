import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'GO-DELIVERY | Premium Food Delivery',
  description: 'Order from the best restaurants. Fast, reliable delivery.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'GO-DELIVERY',
  },
};

export const viewport: Viewport = {
  themeColor: '#ff4757',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body>
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then(function(registrations) {
                  for (let registration of registrations) {
                    registration.unregister();
                    console.log('Service Worker unregistered:', registration.scope);
                  }
                });
                caches.keys().then(function(cacheNames) {
                  return Promise.all(
                    cacheNames.map(function(cacheName) {
                      console.log('Clearing cache:', cacheName);
                      return caches.delete(cacheName);
                    })
                  );
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
