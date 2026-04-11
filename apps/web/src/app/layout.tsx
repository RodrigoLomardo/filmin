import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import { GroupGuard } from '../lib/auth/group-guard';

export const metadata: Metadata = {
  title: 'Filmin',
  description: 'Seu app pessoal para registrar filmes e séries',
  icons: {
    icon: '/assets/logo-filmin.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <link rel="apple-touch-icon" href="/assets/logo-filmin.png" />
      <body className="min-h-screen bg-black text-white antialiased">
        <Providers>
          <GroupGuard>{children}</GroupGuard>
        </Providers>
      </body>
    </html>
  );
}