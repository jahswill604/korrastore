// app/layout.tsx — Root Layout component for KorraStore Next.js App Router.
// Configures Light Mode design tokens, Google Fonts (DM Serif Display, Inter, IBM Plex Mono),
// and application metadata for SEO.
// Used in: Next.js App Router root layout shell (`app/`).

import type { Metadata } from 'next';
import { DM_Serif_Display, Inter, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';

// Display font (DM Serif Display) for hero headlines, major prices, and receipt commodity titles.
const dmSerifDisplay = DM_Serif_Display({
  weight: '400',
  variable: '--font-serif-display',
  subsets: ['latin'],
  display: 'swap',
});

// Primary UI typography font (Inter) for standard body copy, navigation, forms, and buttons.
const inter = Inter({
  variable: '--font-sans-inter',
  subsets: ['latin'],
  display: 'swap',
});

// Monospace font (IBM Plex Mono) for numeric values, commodity prices, and receipt ledger numbers.
const ibmPlexMono = IBM_Plex_Mono({
  weight: ['400', '500', '600', '700'],
  variable: '--font-mono-plex',
  subsets: ['latin'],
  display: 'swap',
});

// Application metadata configuration for SEO and browser tab titles.
export const metadata: Metadata = {
  title: 'KorraStore — Own food. Earn value.',
  description: 'Agricultural marketplace and commodity warehouse ledger platform.',
  icons: {
    icon: '/favicon.ico',
  },
};

// Interface for RootLayout props containing child page nodes.
interface RootLayoutProps {
  children: React.ReactNode;
}

// Root layout component rendering top-level HTML, font CSS variables, and light mode body structure.
export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="en"
      className={`${dmSerifDisplay.variable} ${inter.variable} ${ibmPlexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans-inter bg-[var(--paper)] text-[var(--soil)] selection:bg-[var(--harvest-wheat)] selection:text-[var(--soil)]">
        {children}
      </body>
    </html>
  );
}
