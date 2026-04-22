import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Providers } from './providers';
import { GroupGuard } from '../lib/auth/group-guard';

export const metadata: Metadata = {
  title: 'Filmin',
  description: 'Seu app pessoal para registrar filmes e séries',
  icons: {
    icon: '/assets/logo-filmin.png',
  },
  other: {
    // Desativa o tradutor automático do Google Chrome e Safari
    'google': 'notranslate',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#050505',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" translate="no" className="h-full">
      <link rel="apple-touch-icon" href="/assets/logo-filmin.png" />
      <body className="h-full overflow-hidden bg-black text-white antialiased">
        <Providers>
          <GroupGuard>
            <div className="h-full overflow-y-auto overflow-x-hidden overscroll-none">
              {children}
            </div>
          </GroupGuard>
        </Providers>
      </body>
    </html>
  );
}