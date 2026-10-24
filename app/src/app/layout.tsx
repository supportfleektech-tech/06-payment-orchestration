import './globals.css';
import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = { title: 'Payment Orchestration', description: 'KENYA254 unified payments' };
export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#0b0f14' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="top">
          <strong>💳 Payments</strong>
          <nav>
            <a href="/">Dashboard</a>
            <a href="/providers">Providers</a>
            <a href="/intents">Intents</a>
          </nav>
        </header>
        <main className="wrap">{children}</main>
        <footer className="foot">KENYA254 · Payment Orchestration · dev</footer>
      </body>
    </html>
  );
}
