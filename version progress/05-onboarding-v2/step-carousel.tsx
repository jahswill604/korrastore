// components/onboarding/step-carousel.tsx — First-Run Onboarding Step Carousel for KorraStore.
// Client component ("use client") that renders a rich 3-step skippable introduction carousel
// for new buyers arriving at the platform for the first time.
//
// Visual Design: Premium warm aesthetic using KorraStore design tokens.
//   - Step 1: Commodity grid with price badges and "from N/kg" labels.
//   - Step 2: Animated mini LedgerReceipt preview showing live value growth + STORED seal.
//   - Step 3: Dual-path exit card (Resell Marketplace vs. Request Buyback).
//
// Transitions: keyframe-based slideUp + fadeIn animations on step changes (key-remount strategy).
// Desktop: floating card 560px max-width centered on Paper background.
// Mobile (<=768px): full-viewport immersive layout, no floating card, pinned Skip button.
//
// On completing step 3 ("Get Started") or clicking Skip from any step:
//   calls `completeOnboarding` server action then navigates to /home via router.push.
// Used in: app/onboarding/page.tsx.

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { completeOnboarding } from "@/app/onboarding/actions";

// ---------------------------------------------------------------------------
// STEP 1 ILLUSTRATION — "Buy Real Commodities"
// 2x2 grid of commodity chips with emoji, name label, and price-from badge.
// Uses warm gradient fills and monospaced price text for a premium feel.
// ---------------------------------------------------------------------------
const Step1Illustration = () => (
  <div className="grid grid-cols-2 gap-3 w-full max-w-[300px] sm:max-w-[320px]" style={{ aspectRatio: "1.4" }}>
    {[
      { emoji: "🌾", label: "Rice",   price: "₦68,500/bag" },
      { emoji: "🧄", label: "Garlic", price: "₦51,000/bag" },
      { emoji: "🫘", label: "Beans",  price: "₦37,500/bag" },
      { emoji: "🌱", label: "Melon",  price: "₦28,000/bag" },
    ].map(({ emoji, label, price }) => (
      <div
        key={label}
        className="relative flex flex-col items-center justify-center gap-1 rounded-2xl border border-[var(--border-color)] overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #FDF5E4 0%, #F0E2C0 100%)",
          boxShadow: "0 2px 8px rgba(74,56,40,0.08)",
        }}
      >
        {/* Subtle diagonal grain texture overlay for warm paper feel */}
        <div
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg,transparent,transparent 2px,rgba(168,137,88,0.06) 2px,rgba(168,137,88,0.06) 4px)",
          }}
        />

        {/* Commodity emoji icon */}
        <span className="text-4xl sm:text-5xl drop-shadow-sm relative z-10">{emoji}</span>

        {/* Commodity name — Inter bold uppercase */}
        <span className="relative z-10 font-sans-inter text-[10px] font-bold uppercase tracking-widest text-[var(--husk)]">
          {label}
        </span>

        {/* Price from tag — IBM Plex Mono */}
        <span className="relative z-10 font-mono-plex text-[9px] font-semibold text-[var(--soil)] opacity-80">
          {price}
        </span>

        {/* Active/Best Seller badge on Rice only */}
        {label === "Rice" && (
          <div
            className="absolute top-2 right-2 font-mono-plex text-[7px] font-bold text-white px-1.5 py-0.5 rounded-full"
            style={{ background: "var(--deep-grain-green)" }}
          >
            ACTIVE
          </div>
        )}
      </div>
    ))}
  </div>
);

// ---------------------------------------------------------------------------
// STEP 2 ILLUSTRATION — "Own It, Track Its Value"
// Mini digital LedgerReceipt card showing purchase vs. current valuation.
// Includes a stamped STORED seal, dashed divider, and value growth bar.
// ---------------------------------------------------------------------------
const Step2Illustration = () => (
  <div
    className="w-full max-w-[300px] sm:max-w-[320px] rounded-2xl border border-[var(--border-color)] p-5 relative overflow-hidden"
    style={{
      background: "linear-gradient(145deg, #FBF6E9 0%, #F2E9D5 100%)",
      boxShadow: "0 4px 20px rgba(74,56,40,0.12)",
    }}
  >
    {/* Perforated top edge — ledger ticket visual motif */}
    <div
      className="absolute top-0 left-0 right-0 h-[3px]"
      style={{
        backgroundImage: "repeating-linear-gradient(90deg,transparent 0 6px,var(--border-color) 6px 8px)",
      }}
    />

    {/* STORED official seal — top right corner, rotated for authenticity */}
    <div
      className="absolute top-3 right-3 font-mono-plex text-[7px] font-bold text-[var(--deep-grain-green)] border-2 border-[var(--deep-grain-green)] px-2 py-1 rounded uppercase tracking-widest"
      style={{ transform: "rotate(8deg)", opacity: 0.9 }}
    >
      STORED
    </div>

    {/* Commodity title & grade */}
    <div className="mb-3">
      <p className="font-serif-display text-base text-[var(--soil)] leading-tight">
        Rice (Ofada)
      </p>
      <span className="font-mono-plex text-[9px] font-semibold text-[var(--trust-indigo)] uppercase tracking-wider">
        PREMIUM GRADE
      </span>
    </div>

    {/* Dashed receipt divider between header and ledger rows */}
    <div className="receipt-dashed-divider mb-3" />

    {/* Ledger rows — Quantity and Purchase price */}
    {[
      { label: "Qty",      value: "2 bags (100 kg)" },
      { label: "Purchase", value: "₦130,000" },
    ].map(({ label, value }) => (
      <div key={label} className="flex justify-between font-mono-plex text-[11px] text-[var(--soil)] mb-1.5">
        <span className="opacity-70">{label}</span>
        <span className="font-semibold">{value}</span>
      </div>
    ))}

    {/* Current value row — green text with growth arrow */}
    <div className="flex justify-between font-mono-plex text-[11px] mb-3">
      <span className="text-[var(--soil)] opacity-70">Current</span>
      <span className="font-bold text-[var(--deep-grain-green)]">
        ₦138,600 ▲ 6.6%
      </span>
    </div>

    {/* Value progress bar — Harvest Wheat gradient representing growth */}
    <div
      className="h-7 rounded-lg flex items-center justify-end pr-3 overflow-hidden"
      style={{
        background: "linear-gradient(90deg, var(--border-color) 0%, var(--harvest-wheat) 100%)",
      }}
    >
      <span className="font-mono-plex text-[10px] font-bold text-[var(--soil)]">
        ₦138,600
      </span>
    </div>

    {/* Receipt footer — warehouse location ID */}
    <p className="font-mono-plex text-[8px] text-[var(--soil)] opacity-40 mt-2 tracking-wider">
      KOR-R-000124 · Korra Warehouse, Abuja
    </p>
  </div>
);

// ---------------------------------------------------------------------------
// STEP 3 ILLUSTRATION — "Resell or Request a Buyback"
// Side-by-side path cards showing the two available exit strategies.
// Trust Indigo accent for marketplace resell; Deep Grain Green for buyback.
// ---------------------------------------------------------------------------
const Step3Illustration = () => (
  <div className="flex items-stretch gap-3 w-full max-w-[300px] sm:max-w-[320px]" style={{ minHeight: "160px" }}>
    {/* Resell path card — Trust Indigo palette */}
    <div
      className="flex-1 flex flex-col items-center justify-center gap-2.5 rounded-2xl border p-4"
      style={{
        background: "linear-gradient(145deg, #EEF1FF 0%, #D8DFFF 100%)",
        borderColor: "#B8C2F0",
        boxShadow: "0 2px 12px rgba(48,59,99,0.10)",
      }}
    >
      <span className="text-4xl drop-shadow-sm">🛒</span>
      <span
        className="font-mono-plex text-[8px] font-bold uppercase tracking-widest text-center leading-snug"
        style={{ color: "var(--trust-indigo)" }}
      >
        Resell on<br />Marketplace
      </span>
      <div
        className="font-mono-plex text-[8px] font-semibold px-2 py-1 rounded-full"
        style={{ background: "rgba(48,59,99,0.12)", color: "var(--trust-indigo)" }}
      >
        Set your price
      </div>
    </div>

    {/* Vertical "or" divider between exit paths */}
    <div className="flex flex-col items-center justify-center gap-1">
      <div className="w-px flex-1 bg-[var(--border-color)]" />
      <span className="font-serif-display text-xs text-[var(--husk)] px-1">or</span>
      <div className="w-px flex-1 bg-[var(--border-color)]" />
    </div>

    {/* Buyback path card — Deep Grain Green palette */}
    <div
      className="flex-1 flex flex-col items-center justify-center gap-2.5 rounded-2xl border p-4"
      style={{
        background: "linear-gradient(145deg, #ECF5EF 0%, #C8E6D1 100%)",
        borderColor: "#A8D4B4",
        boxShadow: "0 2px 12px rgba(33,72,58,0.10)",
      }}
    >
      <span className="text-4xl drop-shadow-sm">💰</span>
      <span
        className="font-mono-plex text-[8px] font-bold uppercase tracking-widest text-center leading-snug"
        style={{ color: "var(--deep-grain-green)" }}
      >
        Request<br />Buyback
      </span>
      <div
        className="font-mono-plex text-[8px] font-semibold px-2 py-1 rounded-full"
        style={{ background: "rgba(33,72,58,0.12)", color: "var(--deep-grain-green)" }}
      >
        Instant payout
      </div>
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// STEPS — Configuration array for the 3-step carousel.
// Each entry provides: id, illustration node, headline text, body copy, and
// an accent color used for the step badge, dot indicator, and top color strip.
// ---------------------------------------------------------------------------
const STEPS = [
  {
    id: 1,
    illustration: <Step1Illustration />,
    headline: "Buy Real Commodities",
    body: "Rice, garlic, beans, melon — purchase in bulk at real market prices and own physical goods stored securely in certified Nigerian warehouses.",
    accent: "var(--harvest-wheat)",
  },
  {
    id: 2,
    illustration: <Step2Illustration />,
    headline: "Own It, Track Its Value",
    body: "Your holdings are recorded on a digital ledger receipt. Watch your stored commodity appreciate in real time as market prices move.",
    accent: "var(--deep-grain-green)",
  },
  {
    id: 3,
    illustration: <Step3Illustration />,
    headline: "Resell or Request a Buyback",
    body: "List your holdings on the marketplace to earn more, or request an instant buyback directly from KorraStore — flexible exit, always your choice.",
    accent: "var(--trust-indigo)",
  },
] as const;

// ---------------------------------------------------------------------------
// StepCarousel — Main interactive carousel component.
// Manages step index, transitions, and the completeOnboarding action call.
// Renders distinct Desktop (floating card) and Mobile (full-viewport) layouts.
// ---------------------------------------------------------------------------
export function StepCarousel() {
  const router = useRouter();
  const [step, setStep] = useState(0); // 0-indexed current step
  const [isPending, startTransition] = useTransition();

  // Derived helpers — total count, current step data, and last-step flag.
  const totalSteps = STEPS.length;
  const currentStep = STEPS[step];
  const isLastStep = step === totalSteps - 1;

  // -------------------------------------------------------------------------
  // handleComplete — Triggered on "Get Started" (final step) or Skip tap.
  // Calls server action to persist onboarding_completed = true in profiles,
  // then navigates to /home. useTransition prevents UI lock during round-trip.
  // -------------------------------------------------------------------------
  const handleComplete = () => {
    startTransition(async () => {
      await completeOnboarding();
      router.push("/home");
    });
  };

  // -------------------------------------------------------------------------
  // handleNext — Advances carousel to next step, or completes on final step.
  // -------------------------------------------------------------------------
  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setStep((prev) => prev + 1);
    }
  };

  // -------------------------------------------------------------------------
  // DotIndicators — Clickable pill dot row. Active dot widens and uses the
  // current step's accent color. Clicking a dot jumps directly to that step.
  // -------------------------------------------------------------------------
  const DotIndicators = () => (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: totalSteps }).map((_, i) => (
        <button
          key={i}
          onClick={() => setStep(i)}
          aria-label={`Go to step ${i + 1}`}
          className="transition-all duration-300 rounded-full focus:outline-none"
          style={{
            width: i === step ? "24px" : "8px",
            height: "8px",
            background: i === step ? currentStep.accent : "var(--border-color)",
          }}
        />
      ))}
    </div>
  );

  return (
    <>
      {/* ===================================================================
          DESKTOP LAYOUT — centered floating card, max-w-[560px].
          Hidden on mobile (hidden md:flex).
          =================================================================== */}
      <div className="hidden md:flex flex-col items-center justify-center w-full px-6 min-h-screen">
        {/* Floating card with gradient background and warm shadow */}
        <div
          className="relative w-full max-w-[560px] rounded-[24px] border border-[var(--border-color)] overflow-hidden"
          style={{
            background: "linear-gradient(180deg, #FDFAF3 0%, #FAF6EC 100%)",
            boxShadow: "0 20px 60px rgba(74,56,40,0.14), 0 4px 16px rgba(74,56,40,0.08)",
          }}
        >
          {/* Thin accent color strip at top of card — changes per step */}
          <div
            className="h-1 w-full transition-all duration-500"
            style={{ background: `linear-gradient(90deg, ${currentStep.accent} 0%, transparent 100%)` }}
          />

          <div className="px-12 py-10 flex flex-col items-center">
            {/* Skip affordance — top-right absolute, Trust Indigo underline */}
            <button
              onClick={handleComplete}
              disabled={isPending}
              className="absolute top-6 right-8 font-sans-inter text-[13px] font-medium text-[var(--trust-indigo)] underline underline-offset-2 opacity-70 hover:opacity-100 transition-opacity disabled:opacity-30 cursor-pointer"
            >
              Skip
            </button>

            {/* Step counter pill badge — colored to match current accent */}
            <div
              className="font-mono-plex text-[10px] font-semibold tracking-[0.14em] uppercase px-3 py-1 rounded-full border mb-8"
              style={{
                color: currentStep.accent,
                borderColor: `color-mix(in srgb, ${currentStep.accent} 40%, transparent)`,
                background: `color-mix(in srgb, ${currentStep.accent} 8%, transparent)`,
              }}
            >
              Step {step + 1} of {totalSteps}
            </div>

            {/* Illustration — key-remounted to trigger entrance animation on each step */}
            <div
              key={`illus-desk-${step}`}
              className="mb-9 flex items-center justify-center w-full"
              style={{ animation: "onboardSlideUp 0.32s cubic-bezier(0.22,0.68,0,1.2) both" }}
            >
              {currentStep.illustration}
            </div>

            {/* Headline — DM Serif Display, 2rem */}
            <h2
              key={`h-desk-${step}`}
              className="font-serif-display text-[2rem] text-[var(--soil)] text-center leading-tight mb-3"
              style={{ animation: "onboardFadeIn 0.28s ease 0.1s both" }}
            >
              {currentStep.headline}
            </h2>

            {/* Body copy — Inter, muted soil secondary */}
            <p
              key={`b-desk-${step}`}
              className="font-sans-inter text-[15px] text-[var(--soil-secondary)] text-center leading-relaxed max-w-[380px] mb-8"
              style={{ animation: "onboardFadeIn 0.28s ease 0.18s both" }}
            >
              {currentStep.body}
            </p>

            {/* Dot progress row — clickable step indicators */}
            <DotIndicators />

            {/* Action row — Back button left, Next/Get Started right */}
            <div className="flex items-center justify-between w-full mt-8">
              {step > 0 ? (
                <button
                  onClick={() => setStep((prev) => prev - 1)}
                  className="font-sans-inter text-[14px] font-medium text-[var(--husk)] opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
                >
                  ← Back
                </button>
              ) : (
                <span /> // Spacer to keep Next right-aligned on step 1
              )}

              <Button
                variant="primary"
                size="lg"
                onClick={handleNext}
                isLoading={isPending}
                className="rounded-full px-10 shadow-soil-md"
              >
                {isLastStep ? "Get Started 🌾" : "Next →"}
              </Button>
            </div>
          </div>
        </div>

        {/* Brand watermark below the card — subtle monospace tagline */}
        <p className="font-mono-plex text-[10px] text-[var(--soil)] opacity-30 mt-5 tracking-wider uppercase">
          KorraStore · Own food. Earn value.
        </p>
      </div>

      {/* ===================================================================
          MOBILE LAYOUT — full-viewport immersive, no floating card.
          Visible only on small screens (flex md:hidden).
          =================================================================== */}
      <div className="flex md:hidden flex-col items-center w-full min-h-screen px-5 pt-20 pb-8 relative">

        {/* Skip button — pinned top-right above the logo bar */}
        <button
          onClick={handleComplete}
          disabled={isPending}
          className="absolute top-16 right-5 font-sans-inter text-[13px] font-medium text-[var(--trust-indigo)] underline underline-offset-2 opacity-70 hover:opacity-100 transition-opacity disabled:opacity-30 cursor-pointer z-20"
        >
          Skip
        </button>

        {/* Step counter pill badge */}
        <div
          className="font-mono-plex text-[10px] font-semibold tracking-[0.14em] uppercase px-3 py-1 rounded-full border mb-7 self-center"
          style={{
            color: currentStep.accent,
            borderColor: `color-mix(in srgb, ${currentStep.accent} 40%, transparent)`,
            background: `color-mix(in srgb, ${currentStep.accent} 8%, transparent)`,
          }}
        >
          Step {step + 1} of {totalSteps}
        </div>

        {/* Centered content block — grows to fill viewport height */}
        <div className="flex flex-col items-center flex-1 justify-center w-full">

          {/* Illustration block — remounted per step for entrance animation */}
          <div
            key={`illus-mob-${step}`}
            className="mb-8 flex items-center justify-center w-full"
            style={{ animation: "onboardSlideUp 0.32s cubic-bezier(0.22,0.68,0,1.2) both" }}
          >
            {currentStep.illustration}
          </div>

          {/* Headline */}
          <h2
            key={`h-mob-${step}`}
            className="font-serif-display text-[1.75rem] text-[var(--soil)] text-center leading-snug mb-3 px-2"
            style={{ animation: "onboardFadeIn 0.28s ease 0.1s both" }}
          >
            {currentStep.headline}
          </h2>

          {/* Body copy */}
          <p
            key={`b-mob-${step}`}
            className="font-sans-inter text-[15px] text-[var(--soil-secondary)] text-center leading-relaxed px-2 mb-8"
            style={{ animation: "onboardFadeIn 0.28s ease 0.18s both" }}
          >
            {currentStep.body}
          </p>

          {/* Clickable dot indicators */}
          <DotIndicators />
        </div>

        {/* Bottom CTA stack — pill button full-width + optional Back link */}
        <div className="flex flex-col items-center gap-3 w-full mt-6">
          <Button
            variant="primary"
            size="lg"
            onClick={handleNext}
            isLoading={isPending}
            className="w-full rounded-full text-base shadow-soil-md"
          >
            {isLastStep ? "Get Started 🌾" : "Next →"}
          </Button>

          {step > 0 && (
            <button
              onClick={() => setStep((prev) => prev - 1)}
              className="font-sans-inter text-[14px] font-medium text-[var(--husk)] opacity-60 hover:opacity-100 transition-opacity cursor-pointer py-1"
            >
              ← Back
            </button>
          )}
        </div>
      </div>

      {/* ===================================================================
          Keyframe animation definitions for step transitions.
          onboardSlideUp: illustrations enter with a subtle spring-up motion.
          onboardFadeIn: text fades in with a slight upward drift (delayed).
          =================================================================== */}
      <style jsx global>{`
        @keyframes onboardSlideUp {
          from { opacity: 0; transform: translateY(18px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)   scale(1);    }
        }
        @keyframes onboardFadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0);   }
        }
      `}</style>
    </>
  );
}
