// app/layout.tsx — Root Layout component for KorraStore Next.js App Router.
// Wraps all top-level routes with standard HTML structure, font definitions, and application metadata.
// Used in: Next.js App Router root layout shell (`app/`).

import type { Metadata } from 'next';
import { Inter, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';

// Primary UI typography font (Inter) for standard body copy, controls, and headings.
const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

// Monospace typography font (IBM Plex Mono) for numeric data, receipt tokens, and ledger codes.
const ibmPlexMono = IBM_Plex_Mono({
  weight: ['400', '600'],
  variable: '--font-mono',
  subsets: ['latin'],
});

// Application metadata configuration for SEO and browser tab titles.
export const metadata: Metadata = {
  title: 'KorraStore — Own food. Earn value.',
  description: 'AI-powered digital agriculture marketplace and commodity storage platform.',
  icons: {
    icon: '/favicon.ico',
  },
};

// Interface for RootLayout props containing child page nodes.
interface RootLayoutProps {
  children: React.ReactNode;
}

// Root layout component rendering top-level HTML, font CSS variables, and page contents.
export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className={`${inter.variable} ${ibmPlexMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-[#F6F3E7] text-[#1F2937]">
        {children}
      </body>
    </html>
  );
}
