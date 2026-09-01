// app/onboarding/page.tsx — Onboarding Flow Page for KorraStore.
// Server Component. Verifies the visiting user is authenticated (belt-and-suspenders
// alongside middleware), then renders the StepCarousel client component.
//
// Background: warm Paper (#F7F4EA) with a subtle golden geometric grid overlay
// (matching the desktop mockup — thin square + concentric circle lines).
// Logo bar fixed top-left. StepCarousel fills the viewport.
//
// Route: /onboarding — shown once per new buyer account, never repeated.
// Used in: Next.js App Router route /onboarding.

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { StepCarousel } from "@/components/onboarding/step-carousel";

// Page-level SEO metadata for /onboarding.
export const metadata = {
  title: "Welcome to KorraStore — Getting Started",
  description:
    "Learn how KorraStore works: buy real commodities, own them as stored inventory, track value, then resell or request a buyback.",
};

// ---------------------------------------------------------------------------
// OnboardingPage — Server Component entry point for /onboarding.
// Performs a lightweight session check; unauthenticated users redirect to /login.
// ---------------------------------------------------------------------------
export default async function OnboardingPage() {
  const supabase = await createClient();

  // Re-verify session using getUser() (never trust raw getSession()).
  // Middleware already guards this route but we confirm here for type-safety.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    // Full-viewport Paper background with the golden geometric grid pattern
    // visible in the approved desktop mockup. Uses two overlaid SVG patterns:
    //   1. Square grid lines in faint golden stroke.
    //   2. Large concentric circle arcs for the circular design motif.
    <main
      className="min-h-screen relative overflow-hidden"
      style={{ background: "#F7F4EA" }}
    >
      {/* Golden geometric grid overlay — matches desktop mockup background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(216,181,106,0.12) 1px, transparent 1px),
            linear-gradient(90deg, rgba(216,181,106,0.12) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Concentric arc decorative circles — large, centered, very faint */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "800px",
          height: "800px",
          borderRadius: "50%",
          boxShadow: `
            0 0 0 1px rgba(216,181,106,0.1),
            0 0 0 80px rgba(216,181,106,0.04),
            0 0 0 160px rgba(216,181,106,0.04),
            0 0 0 240px rgba(216,181,106,0.04)
          `,
        }}
      />

      {/* Fixed logo bar — KorraStore brand mark top-left, always visible */}
      <div className="fixed top-0 left-0 right-0 flex items-center gap-2.5 px-6 py-5 z-20 pointer-events-none">
        <span className="text-2xl">🌾</span>
        <span className="font-serif-display text-[20px] text-[var(--soil)] leading-none">
          KorraStore
        </span>
      </div>

      {/* StepCarousel — owns all step state, animations, and the server action call */}
      <div className="relative z-10">
        <StepCarousel />
      </div>
    </main>
  );
}
