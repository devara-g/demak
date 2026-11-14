import type { Metadata, Viewport } from 'next';
import { Inter, Fraunces, Caveat, Courier_Prime, Cinzel } from 'next/font/google';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
});

const cinzel = Cinzel({
  subsets: ['latin'],
  variable: '--font-cinzel',
  display: 'swap',
});

const caveat = Caveat({
  subsets: ['latin'],
  variable: '--font-caveat',
  display: 'swap',
});

const courierPrime = Courier_Prime({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-courier-prime',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Tentang Kamu & Nuansa Pink — Sebuah Buku Kecil Untukmu',
  description: 'Buku kenangan dan pengakuan kecil interaktif bernuansa merah jambu bersama Snoopy.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body
        className={`${inter.variable} ${fraunces.variable} ${cinzel.variable} ${caveat.variable} ${courierPrime.variable} h-[100dvh] w-screen overflow-hidden flex flex-col justify-between`}
      >
        {children}
      </body>
    </html>
  );
}

