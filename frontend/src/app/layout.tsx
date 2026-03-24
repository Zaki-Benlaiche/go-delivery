import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'GO-DELIVERY | Premium Food Delivery',
  description: 'Order from the best restaurants. Fast, reliable delivery.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
