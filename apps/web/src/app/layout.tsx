// RIGVERSE — Root Layout
// Global providers, fonts, and base styles.

import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { StoreHydrator } from '@/components/store-hydrator';
import { Toaster } from '@/components/toaster';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
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
    <html lang="en" className={`${inter.variable} antialiased`}>
      <body className="bg-rigverse-bg text-white min-h-screen overflow-x-hidden font-sans">
        <StoreHydrator />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
