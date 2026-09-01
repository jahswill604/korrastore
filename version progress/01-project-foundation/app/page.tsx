// app/page.tsx — Foundation Home Landing Page placeholder for KorraStore.
// Renders the initial project foundation status dashboard and brand hero placeholder.
// Used in: Public root route (`/`).
// Note: Serves as a foundation placeholder until 06-home-browse.md implements the full public marketplace experience.

import React from 'react';

// Status indicators representing core project plumbing modules.
const SYSTEM_STATUSES = [
  {
    name: 'App Router Layering',
    detail: 'Next.js 16 structure (app/, components/, lib/)',
    status: 'Ready',
    color: 'bg-[#1E5E43]',
  },
  {
    name: 'Browser Supabase Client',
    detail: 'lib/supabase/client.ts (Anon key RLS access)',
    status: 'Ready',
    color: 'bg-[#8B6F47]',
  },
  {
    name: 'Server Supabase Client',
    detail: 'lib/supabase/server.ts (@supabase/ssr session cookies)',
    status: 'Ready',
    color: 'bg-[#182A55]',
  },
  {
    name: 'Service Role Client',
    detail: 'lib/supabase/service.ts (import "server-only" isolated)',
    status: 'Ready',
    color: 'bg-[#D4A017]',
  },
];

// Home page server component rendering the KorraStore foundation hero and readiness cards.
export default function Home() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 max-w-6xl mx-auto w-full">
      {/* Top Brand Header */}
      <header className="w-full flex items-center justify-between py-4 border-b border-[#8B6F47]/20 mb-8">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌾</span>
          <span className="text-2xl font-bold text-[#1E5E43] tracking-tight">KorraStore</span>
          <span className="text-sm font-medium text-[#8B6F47] hidden sm:inline">— Own food. Earn value.</span>
        </div>
        <span className="px-3 py-1 text-xs font-semibold bg-[#D4A017] text-[#1F2937] rounded-full">
          v0.1.0 Foundation
        </span>
      </header>

      {/* Hero Banner Section */}
      <section className="w-full bg-[#182A55] text-white p-8 md:p-12 rounded-2xl shadow-lg mb-10">
        <div className="max-w-2xl">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4">
            KorraStore Platform Foundation
          </h1>
          <p className="text-[#F6F3E7]/90 text-base md:text-lg mb-6 leading-relaxed">
            AI-powered digital agriculture marketplace & commodity storage ledger. The foundational Next.js 16 App Router infrastructure, environment scaffolding, and Supabase client factories are fully configured.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#1E5E43] text-white text-sm font-medium rounded-lg">
            <span>✓ Foundation Plumbing Active</span>
          </div>
        </div>
      </section>

      {/* Architecture Readiness Grid */}
      <section className="w-full">
        <h2 className="text-xl font-bold text-[#1F2937] mb-6 flex items-center gap-2">
          <span>🏗️</span> System Infrastructure Readiness
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {SYSTEM_STATUSES.map((item, idx) => (
            <div
              key={idx}
              className="bg-white p-6 rounded-xl border border-[#D4A017]/40 shadow-sm flex flex-col justify-between hover:border-[#1E5E43] transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-lg text-[#1F2937]">{item.name}</h3>
                  <span className={`w-3 h-3 rounded-full ${item.color}`} />
                </div>
                <p className="text-sm text-[#8B6F47] mb-4">{item.detail}</p>
              </div>
              <div className="flex items-center justify-between text-xs pt-4 border-t border-gray-100">
                <span className="font-mono text-gray-500">STATUS</span>
                <span className="font-semibold text-[#1E5E43] bg-[#F6F3E7] px-2.5 py-1 rounded-md">
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer Notice */}
      <footer className="w-full mt-12 text-center text-xs text-[#8B6F47] py-4 border-t border-[#8B6F47]/20">
        Ready for Phase 02: Design System Integration (`02-design-system.md`).
      </footer>
    </main>
  );
}
