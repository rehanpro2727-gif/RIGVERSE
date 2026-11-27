// RIGVERSE — Root Layout
// Global providers, fonts, and base styles.

<<<<<<< HEAD
import type { Metadata } from 'next';
import { Orbitron, Space_Grotesk } from 'next/font/google';
=======
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
>>>>>>> 5a30304695ef9f65487c4ccac024ba3591bd265a
import './globals.css';
import { StoreHydrator } from '@/components/store-hydrator';
import { Toaster } from '@/components/toaster';

const orbitron = Orbitron({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-orbitron',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'RIGVERSE — Build Your Legend',
  description: "India's most immersive PC configurator. Real prices. Live compatibility. 3D assembly.",
};

// Next.js 14 wants viewport and themeColor in their own export, not in metadata.
export const viewport: Viewport = {
  themeColor: '#0B0B14',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
<<<<<<< HEAD
    <html lang="en" className={`${orbitron.variable} ${spaceGrotesk.variable} antialiased`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-rigverse-bg text-white min-h-screen overflow-x-hidden font-body">
=======
    <html lang="en" className={`${inter.variable} antialiased`}>
      <body className="bg-rigverse-bg text-white min-h-screen overflow-x-hidden font-sans">
        <StoreHydrator />
>>>>>>> 5a30304695ef9f65487c4ccac024ba3591bd265a
        {children}
        <Toaster />
      </body>
    </html>
  );
}
