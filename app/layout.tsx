import type { Metadata } from 'next';
import { Inter, Fraunces, Caveat, Courier_Prime, Cinzel } from 'next/font/google';
import './globals.css';

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
  title: 'Catatan Biru & Snoopy — Sebuah Buku Kecil Untukmu',
  description: 'Buku kenangan dan pengakuan kecil interaktif bernuansa biru teduh bersama Snoopy.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body
        className={`${inter.variable} ${fraunces.variable} ${cinzel.variable} ${caveat.variable} ${courierPrime.variable} h-screen w-screen overflow-hidden flex flex-col justify-between`}
      >
        {children}
      </body>
    </html>
  );
}

