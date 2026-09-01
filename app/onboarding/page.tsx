// app/onboarding/page.tsx — Onboarding Flow Page for KorraStore.
// Server Component. Auth-guards the route (belt-and-suspenders alongside middleware).
// Renders the geometric Paper background + logo bar + StepCarousel client component.
//
// Background matches desktop mockup:
//   - Square grid lines in faint golden tone
//   - Large diagonal cross-hatched square overlay (rotated 45deg square lines)
//   - Concentric arc rings centred on viewport
//   - KorraStore logo fixed top-left
// Used in: Next.js App Router /onboarding route.

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { StepCarousel } from "@/components/onboarding/step-carousel";

export const metadata = {
  title: "Welcome to KorraStore — Getting Started",
  description:
    "Learn how KorraStore works: buy real commodities, own them as stored inventory, track value, then resell or request a buyback.",
};

export default async function OnboardingPage() {
  const supabase = await createClient();

  // Re-verify session (never trust raw getSession per Feature 04 rules).
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#F7F4EA",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* ── Layer 1: fine square grid ── */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(168,137,88,0.14) 1px, transparent 1px),
            linear-gradient(90deg, rgba(168,137,88,0.14) 1px, transparent 1px)
          `,
          backgroundSize: "56px 56px",
          pointerEvents: "none",
        }}
      />

      {/* ── Layer 2: larger diagonal square outline (rotated bounding box) ── */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: "680px",
          height: "680px",
          transform: "translate(-50%, -50%) rotate(45deg)",
          border: "1px solid rgba(168,137,88,0.18)",
          pointerEvents: "none",
        }}
      />

      {/* ── Layer 3: concentric circle arcs ── */}
      {[380, 520, 660].map((d, i) => (
        <div
          key={i}
          aria-hidden="true"
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: `${d}px`,
            height: `${d}px`,
            borderRadius: "50%",
            border: "1px solid rgba(168,137,88,0.13)",
            transform: "translate(-50%, -50%)",
            pointerEvents: "none",
          }}
        />
      ))}

      {/* ── Layer 4: outer bounding rectangle outline ── */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "10%",
          left: "8%",
          right: "8%",
          bottom: "10%",
          border: "1px solid rgba(168,137,88,0.14)",
          borderRadius: "2px",
          pointerEvents: "none",
        }}
      />

      {/* ── Fixed logo bar ── */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "18px 28px",
          zIndex: 50,
          pointerEvents: "none",
        }}
      >
        <span style={{ fontSize: "22px", lineHeight: 1 }}>🌾</span>
        <span
          className="font-serif-display"
          style={{ fontSize: "20px", color: "#4A3828", lineHeight: 1 }}
        >
          KorraStore
        </span>
      </div>

      {/* ── Skip button (mobile only — fixed top-right) ── */}
      {/* Note: Desktop Skip is inside the card (StepCarousel). Mobile has it here so it sits above the card. */}

      {/* ── StepCarousel ── */}
      <div style={{ position: "relative", zIndex: 10 }}>
        <StepCarousel />
      </div>
    </main>
  );
}
