// app/onboarding/page.tsx — Onboarding Flow Page for KorraStore.
// Server Component. Verifies that the visiting user is authenticated (middleware
// already handles unauthenticated redirects, but we double-check here for type-safety).
// Renders the StepCarousel client component which owns all interactive step state.
// Sits between the signup flow and /home — shown once per account, never again.
// Used in: Next.js App Router route /onboarding.

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { StepCarousel } from "@/components/onboarding/step-carousel";

// Metadata for the onboarding page (SEO / browser tab).
export const metadata = {
  title: "Welcome to KorraStore — Getting Started",
  description:
    "Learn how KorraStore works: buy real commodities, own them as stored inventory, track value, then resell or request a buyback.",
};

// ---------------------------------------------------------------------------
// OnboardingPage — Server Component entry point for /onboarding.
// Performs a lightweight session check and passes the userId to StepCarousel.
// ---------------------------------------------------------------------------
export default async function OnboardingPage() {
  const supabase = await createClient();

  // Re-verify session. Middleware guards this route, but we confirm here
  // as a belt-and-suspenders measure (per Feature 04 security rules).
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    // Full-viewport paper background with subtle grid texture (matches auth pages).
    <main
      className="min-h-screen bg-[var(--paper)] flex flex-col items-center justify-center"
      style={{
        backgroundImage:
          "repeating-linear-gradient(0deg,transparent,transparent 24px,rgba(216,181,106,0.05) 24px,rgba(216,181,106,0.05) 25px),repeating-linear-gradient(90deg,transparent,transparent 24px,rgba(216,181,106,0.04) 24px,rgba(216,181,106,0.04) 25px)",
      }}
    >
      {/* Logo mark — same positioning as auth pages for visual continuity. */}
      <div className="fixed top-0 left-0 right-0 flex items-center gap-2.5 px-8 py-5 pointer-events-none z-10">
        <span className="text-2xl">🌾</span>
        <span className="font-serif-display text-xl text-[var(--soil)]">
          KorraStore
        </span>
      </div>

      {/* StepCarousel owns all client-side state (step index, transitions, action call). */}
      <StepCarousel />
    </main>
  );
}
