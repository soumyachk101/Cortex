import type { Metadata } from 'next';
import { Playfair_Display, Source_Sans_3 } from 'next/font/google';
import { ThemeProvider } from '@/providers/theme-provider';
import { FirebaseProvider } from '@/providers/firebase-provider';
import './globals.css';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const sourceSans = Source_Sans_3({
  subsets: ['latin'],
  variable: '--font-source-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Cortex — Personal Finance & Productivity',
  description: 'A botanical-inspired personal finance and productivity app with AI assistance',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${playfair.variable} ${sourceSans.variable}`}>
      <body className="font-sans antialiased bg-alabaster text-forest">
        <ThemeProvider>
          <FirebaseProvider>
          {/* Paper Grain Texture Overlay */}
          <div
            className="pointer-events-none fixed inset-0 z-50 opacity-[0.015]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'repeat',
            }}
          />
          {children}
          </FirebaseProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
