// components/onboarding/step-carousel.tsx
// First-run onboarding carousel for KorraStore new buyers.
// 3 steps: Buy Commodities, Track Value, Resell/Buyback.
// Desktop: centered floating white card (420px) with illustration area + nav row.
// Mobile: full-viewport with white card for illustration, text + CTA below.
// Pixel-perfect match to approved UI design mockups.
"use client";

import { useState, useTransition } from "react";
import { completeOnboarding } from "@/app/onboarding/actions";

// ---------------------------------------------------------------------------
// SVG: Circular "STORED" Official Seal stamp used on commodity tiles.
// Rendered as pure SVG for crisp display at any size.
// ---------------------------------------------------------------------------
function StoredSeal({ size = 38 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <circle cx="32" cy="32" r="29" stroke="#21483A" strokeWidth="2.5" />
      <circle cx="32" cy="32" r="24" stroke="#21483A" strokeWidth="1.2" strokeDasharray="3 2" />
      <text
        x="32" y="30"
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#21483A"
        fontFamily="Georgia, serif"
        fontSize="10"
        fontWeight="700"
        letterSpacing="1"
      >
        STORED
      </text>
      <text
        x="32" y="42"
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#21483A"
        fontFamily="monospace"
        fontSize="5"
        letterSpacing="0.5"
      >
        OFFICIAL SEAL
      </text>
    </svg>
  );
}

// ---------------------------------------------------------------------------
// CommodityTile — one cell in the 2x2 Step 1 grid.
// Amber/gold outer frame, cream inner photo area, price badge top, STORED seal + label bottom.
// ---------------------------------------------------------------------------
function CommodityTile({
  emoji,
  label,
  price,
}: {
  emoji: string;
  label: string;
  price: string;
}) {
  return (
    // Outer amber frame — gives the "framed photo" look from the mockup
    <div
      className="relative rounded-xl overflow-hidden flex flex-col"
      style={{
        background: "linear-gradient(145deg, #D4A843 0%, #B8892A 100%)",
        padding: "6px",
        boxShadow: "0 3px 12px rgba(74,56,40,0.20)",
        aspectRatio: "1",
      }}
    >
      {/* Price badge — top-left of outer frame */}
      <div
        className="absolute top-[8px] left-[8px] z-20 font-mono-plex font-bold text-[10px] px-2 py-0.5 rounded-md"
        style={{
          background: "rgba(255,255,255,0.95)",
          color: "#4A3828",
          boxShadow: "0 1px 4px rgba(0,0,0,0.12)",
        }}
      >
        {price}
      </div>

      {/* Inner cream photo area */}
      <div
        className="flex-1 rounded-lg flex flex-col items-center justify-center relative overflow-hidden"
        style={{
          background: "linear-gradient(160deg, #FDFAF2 0%, #F5EDD6 100%)",
          minHeight: "0",
        }}
      >
        {/* Food illustration — large emoji centered */}
        <span
          className="select-none"
          style={{
            fontSize: "clamp(36px, 8vw, 52px)",
            lineHeight: 1,
            filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.12))",
          }}
        >
          {emoji}
        </span>
      </div>

      {/* Bottom bar — STORED seal left, label right */}
      <div className="flex items-center justify-between pt-[5px] px-[2px]">
        <div style={{ transform: "scale(0.75)", transformOrigin: "left center" }}>
          <StoredSeal size={32} />
        </div>
        <span
          className="font-sans-inter font-bold uppercase text-white text-right"
          style={{ fontSize: "10px", letterSpacing: "0.08em", textShadow: "0 1px 2px rgba(0,0,0,0.3)" }}
        >
          {label}
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// STEP 1 ILLUSTRATION — 2x2 grid of commodity tiles
// ---------------------------------------------------------------------------
function Step1Visual() {
  return (
    <div
      className="grid grid-cols-2 gap-2.5"
      style={{ width: "100%", maxWidth: "280px", margin: "0 auto" }}
    >
      <CommodityTile emoji="🍚" label="Rice"   price="₦68,500" />
      <CommodityTile emoji="🧄" label="Garlic" price="₦51,000" />
      <CommodityTile emoji="🫘" label="Beans"  price="₦37,500" />
      <CommodityTile emoji="🍈" label="Melon"  price="₦28,000" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// STEP 2 ILLUSTRATION — Curled receipt paper with gold backing layer
// Shows Rice 100kg holding: purchase price, current value +6.6%, sparkline chart
// ---------------------------------------------------------------------------
function Step2Visual() {
  return (
    <div
      className="relative"
      style={{ width: "100%", maxWidth: "280px", margin: "0 auto", paddingBottom: "12px" }}
    >
      {/* Gold backing shadow layer — receipt depth illusion */}
      <div
        className="absolute rounded-xl"
        style={{
          top: "10px",
          left: "8px",
          right: "-4px",
          bottom: "0px",
          background: "linear-gradient(145deg, #C9A045 0%, #9E7820 100%)",
          borderRadius: "14px",
          zIndex: 0,
        }}
      />

      {/* Main receipt paper */}
      <div
        className="relative rounded-xl overflow-hidden"
        style={{
          background: "linear-gradient(175deg, #FEFCF4 0%, #F7F0DE 100%)",
          boxShadow: "0 6px 24px rgba(74,56,40,0.16)",
          zIndex: 1,
          padding: "0",
        }}
      >
        {/* Perforated top edge */}
        <div
          style={{
            height: "8px",
            background: "radial-gradient(circle at 5px 0, #F7F4EA 6px, #FEFCF4 6px)",
            backgroundSize: "14px 8px",
            backgroundRepeat: "repeat-x",
          }}
        />

        <div className="px-5 pt-1 pb-4">
          {/* Header row: title + circular STORED seal */}
          <div className="flex items-start justify-between mb-3">
            <div>
              <p
                className="font-serif-display text-[var(--soil)]"
                style={{ fontSize: "17px", fontWeight: 400 }}
              >
                Rice 100kg
              </p>
              <p
                className="font-sans-inter text-[var(--soil-secondary)]"
                style={{ fontSize: "11px" }}
              >
                Receipt
              </p>
            </div>
            {/* Official STORED seal — rotated slightly */}
            <div style={{ transform: "rotate(-8deg)", marginTop: "-4px" }}>
              <StoredSeal size={48} />
            </div>
          </div>

          {/* Dashed receipt divider */}
          <div
            style={{
              borderTop: "1.5px dashed #C9A868",
              marginBottom: "10px",
              opacity: 0.6,
            }}
          />

          {/* Purchase row */}
          <div className="mb-1">
            <p
              className="font-sans-inter text-[var(--soil-secondary)]"
              style={{ fontSize: "11px" }}
            >
              Purchase
            </p>
            <p
              className="font-mono-plex font-semibold text-[var(--soil)]"
              style={{ fontSize: "13px" }}
            >
              ₦130,000
            </p>
          </div>

          {/* Current value — bold green */}
          <p
            className="font-mono-plex font-bold"
            style={{ fontSize: "22px", color: "#21483A", lineHeight: 1.1 }}
          >
            ₦138,600
          </p>
          <p
            className="font-sans-inter mb-3"
            style={{ fontSize: "11px", color: "#21483A" }}
          >
            Current Value +6.6%
          </p>

          {/* Sparkline growth chart — SVG */}
          <svg
            viewBox="0 0 220 52"
            style={{ width: "100%", height: "52px", display: "block" }}
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="cgFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#21483A" stopOpacity="0.22" />
                <stop offset="100%" stopColor="#21483A" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M0,44 C30,42 50,34 80,26 C110,18 130,20 155,13 C175,8 195,6 220,3 L220,52 L0,52 Z"
              fill="url(#cgFill)"
            />
            <path
              d="M0,44 C30,42 50,34 80,26 C110,18 130,20 155,13 C175,8 195,6 220,3"
              fill="none"
              stroke="#21483A"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Perforated bottom edge */}
        <div
          style={{
            height: "8px",
            background: "radial-gradient(circle at 5px 100%, #F7F4EA 6px, #F7F0DE 6px)",
            backgroundSize: "14px 8px",
            backgroundRepeat: "repeat-x",
          }}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// STEP 3 ILLUSTRATION — Two exit-path cards: Resell vs Buyback
// ---------------------------------------------------------------------------
function Step3Visual() {
  return (
    <div
      className="flex items-stretch gap-3"
      style={{ width: "100%", maxWidth: "280px", margin: "0 auto", minHeight: "140px" }}
    >
      {/* Resell card */}
      <div
        className="flex-1 rounded-2xl border flex flex-col items-center justify-center gap-2 p-4"
        style={{
          background: "linear-gradient(150deg, #EEF1FF 0%, #D9DFFF 100%)",
          borderColor: "#B4BFEE",
          boxShadow: "0 2px 16px rgba(48,59,99,0.12)",
        }}
      >
        <span style={{ fontSize: "36px", lineHeight: 1, filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))" }}>🛒</span>
        <span
          className="font-sans-inter font-bold uppercase text-center"
          style={{ fontSize: "9px", letterSpacing: "0.07em", color: "#303B63", lineHeight: 1.4 }}
        >
          Resell on<br />Marketplace
        </span>
        <span
          className="font-mono-plex font-semibold rounded-full px-2 py-0.5"
          style={{ fontSize: "8px", background: "rgba(48,59,99,0.10)", color: "#303B63" }}
        >
          Set your price
        </span>
      </div>

      {/* Divider with "or" */}
      <div className="flex flex-col items-center justify-center gap-1.5">
        <div className="flex-1 w-px" style={{ background: "#E4DCC8" }} />
        <span className="font-serif-display text-[11px]" style={{ color: "#A88958" }}>or</span>
        <div className="flex-1 w-px" style={{ background: "#E4DCC8" }} />
      </div>

      {/* Buyback card */}
      <div
        className="flex-1 rounded-2xl border flex flex-col items-center justify-center gap-2 p-4"
        style={{
          background: "linear-gradient(150deg, #EBF5EE 0%, #C4E8CF 100%)",
          borderColor: "#A3D1AF",
          boxShadow: "0 2px 16px rgba(33,72,58,0.12)",
        }}
      >
        <span style={{ fontSize: "36px", lineHeight: 1, filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))" }}>💰</span>
        <span
          className="font-sans-inter font-bold uppercase text-center"
          style={{ fontSize: "9px", letterSpacing: "0.07em", color: "#21483A", lineHeight: 1.4 }}
        >
          Request<br />Buyback
        </span>
        <span
          className="font-mono-plex font-semibold rounded-full px-2 py-0.5"
          style={{ fontSize: "8px", background: "rgba(33,72,58,0.10)", color: "#21483A" }}
        >
          Instant payout
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// STEPS config — illustration, headline, body, accent per step.
// ---------------------------------------------------------------------------
type Step = {
  id: number;
  visual: React.ReactNode;
  headline: string;
  body: string;
  accent: string;
};

const STEPS: Step[] = [
  {
    id: 1,
    visual: <Step1Visual />,
    headline: "Buy Real Commodities",
    body: "Rice, garlic, beans, melon — purchase in bulk at real market prices and own physical goods stored securely in certified Nigerian warehouses.",
    accent: "#D8B56A",
  },
  {
    id: 2,
    visual: <Step2Visual />,
    headline: "Own It, Track Its Value",
    body: "Your holdings are recorded on a digital ledger receipt. Watch your stored commodity appreciate in real time as market prices move.",
    accent: "#21483A",
  },
  {
    id: 3,
    visual: <Step3Visual />,
    headline: "Resell or Request a Buyback",
    body: "List your holdings on the marketplace to earn more, or request an instant buyback directly from KorraStore — flexible exit, your choice.",
    accent: "#303B63",
  },
];

// ---------------------------------------------------------------------------
// PillButton — reusable styled pill button component.
// variant "filled" = solid accent background, "outline" = bordered ghost.
// ---------------------------------------------------------------------------
function PillButton({
  onClick,
  disabled,
  variant,
  accent,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  variant: "filled" | "outline";
  accent: string;
  children: React.ReactNode;
}) {
  const base: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    borderRadius: "9999px",
    fontFamily: "var(--font-sans-inter, Inter, system-ui, sans-serif)",
    fontWeight: 600,
    fontSize: "14px",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
    transition: "opacity 0.15s, transform 0.1s",
    border: "none",
    padding: "10px 22px",
    lineHeight: 1,
    whiteSpace: "nowrap",
  };

  const isDarkAccent = accent === "#21483A" || accent === "#303B63";

  const filled: React.CSSProperties = {
    background: accent,
    color: isDarkAccent ? "#FFFFFF" : "#4A3828",
    boxShadow: `0 4px 14px ${accent}55`,
  };

  const outline: React.CSSProperties = {
    background: "transparent",
    color: "#4A3828",
    border: "1.5px solid #D4C9A8",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{ ...base, ...(variant === "filled" ? filled : outline) }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.03)"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; }}
    >
      {children}
    </button>
  );
}

// ---------------------------------------------------------------------------
// DotNav — animated step dot indicators. Active dot = wider pill shape.
// ---------------------------------------------------------------------------
function DotNav({
  total,
  current,
  accent,
  onDotClick,
}: {
  total: number;
  current: number;
  accent: string;
  onDotClick: (i: number) => void;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
      {Array.from({ length: total }).map((_, i) => (
        <button
          key={i}
          onClick={() => onDotClick(i)}
          aria-label={`Go to step ${i + 1}`}
          style={{
            width: i === current ? "24px" : "8px",
            height: "8px",
            borderRadius: "9999px",
            background: i === current ? accent : "#D8C9A8",
            border: "none",
            cursor: "pointer",
            transition: "all 0.3s cubic-bezier(0.34,1.56,0.64,1)",
            padding: 0,
          }}
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// StepCarousel — Main exported component.
// ---------------------------------------------------------------------------
export function StepCarousel() {
  const [step, setStep] = useState(0);
  const [isPending, startTransition] = useTransition();
  const [animKey, setAnimKey] = useState(0); // forces re-animation on step change
  const [completeError, setCompleteError] = useState<string | null>(null); // surfaces DB write failures

  const total = STEPS.length;
  const cur = STEPS[step];
  const isLast = step === total - 1;

  // Complete onboarding — server action handles the redirect AFTER confirming the DB write.
  // This prevents the race condition where the middleware reads stale profile data.
  // If the action returns an error object, surface it so the user can retry.
  const handleComplete = () => {
    setCompleteError(null);
    startTransition(async () => {
      const result = await completeOnboarding();
      // completeOnboarding() throws a Next.js redirect on success (never reaches here).
      // If we reach this point, it returned an error object.
      if (result && "error" in result) {
        setCompleteError("Something went wrong. Please try again.");
      }
    });
  };

  // Advance step or complete on last step.
  const handleNext = () => {
    if (isLast) return handleComplete();
    setStep((p) => p + 1);
    setAnimKey((k) => k + 1);
  };

  // Go back one step.
  const handleBack = () => {
    setStep((p) => p - 1);
    setAnimKey((k) => k + 1);
  };

  // Jump to specific step via dot.
  const handleDot = (i: number) => {
    setStep(i);
    setAnimKey((k) => k + 1);
  };

  return (
    <>
      {/* =====================================================================
          DESKTOP LAYOUT — white floating card on paper+grid background.
          Hidden on mobile (hidden md:flex).
          ===================================================================== */}
      <div
        className="hidden md:flex flex-col items-center justify-center w-full"
        style={{ minHeight: "100vh" }}
      >
        {/* Floating card */}
        <div
          style={{
            width: "100%",
            maxWidth: "440px",
            background: "#FFFFFF",
            borderRadius: "20px",
            border: "1.5px solid #E8DEC9",
            boxShadow:
              "0 4px 6px rgba(74,56,40,0.04), 0 12px 32px rgba(74,56,40,0.10), 0 24px 64px rgba(74,56,40,0.08)",
            overflow: "hidden",
          }}
        >
          {/* Card header: Step N (left) | Skip (right) */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "20px 24px 16px",
            }}
          >
            <span
              className="font-serif-display"
              style={{ fontSize: "16px", color: "#4A3828" }}
            >
              Step {step + 1}
            </span>
            <button
              onClick={handleComplete}
              disabled={isPending}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontFamily: "var(--font-sans-inter, Inter, system-ui, sans-serif)",
                fontSize: "14px",
                fontWeight: 500,
                color: "#303B63",
                opacity: 0.75,
                padding: "2px 0",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = "1"; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = "0.75"; }}
            >
              Skip
            </button>
          </div>

          {/* Illustration container — warm beige area, rounded inside */}
          <div style={{ padding: "0 16px 0" }}>
            <div
              style={{
                background: "linear-gradient(160deg, #F8F3E6 0%, #F0E8D0 100%)",
                borderRadius: "14px",
                padding: "28px 20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "260px",
                overflow: "hidden",
              }}
            >
              <div
                key={`d-vis-${step}-${animKey}`}
                style={{ animation: "kSlideUp 0.38s cubic-bezier(0.22,0.68,0,1.1) both", width: "100%" }}
              >
                {cur.visual}
              </div>
            </div>
          </div>

          {/* Text section */}
          <div style={{ padding: "20px 28px 0" }}>
            <h2
              key={`d-h-${step}-${animKey}`}
              className="font-serif-display"
              style={{
                fontSize: "28px",
                color: "#4A3828",
                textAlign: "center",
                lineHeight: 1.15,
                marginBottom: "10px",
                animation: "kFadeUp 0.3s ease 0.12s both",
              }}
            >
              {cur.headline}
            </h2>
            <p
              key={`d-b-${step}-${animKey}`}
              className="font-sans-inter"
              style={{
                fontSize: "14px",
                color: "#6B5A48",
                textAlign: "center",
                lineHeight: 1.65,
                margin: "0 auto",
                maxWidth: "340px",
                animation: "kFadeUp 0.3s ease 0.2s both",
              }}
            >
              {cur.body}
            </p>
          </div>

          {/* Error banner — shown if completeOnboarding() DB write fails */}
          {completeError && (
            <div
              style={{
                margin: "0 24px 0",
                padding: "10px 14px",
                borderRadius: "8px",
                background: "#FDECEA",
                border: "1px solid #E8A9A0",
                color: "#B3432E",
                fontSize: "13px",
                fontFamily: "var(--font-sans-inter, Inter, system-ui, sans-serif)",
                textAlign: "center",
              }}
            >
              {completeError}
            </div>
          )}

          {/* Bottom navigation: Back | Dots | Next */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "20px 24px 24px",
            }}
          >
            {/* Back pill — outline, visible from step 2 onwards */}
            {step > 0 ? (
              <PillButton onClick={handleBack} variant="outline" accent={cur.accent}>
                ← Back
              </PillButton>
            ) : (
              <div style={{ width: "90px" }} />
            )}

            {/* Dot indicators */}
            <DotNav total={total} current={step} accent={cur.accent} onDotClick={handleDot} />

            {/* Next / Get Started filled pill */}
            <PillButton
              onClick={handleNext}
              disabled={isPending}
              variant="filled"
              accent={cur.accent}
            >
              {isPending ? (
                <span
                  style={{
                    display: "inline-block",
                    width: "13px",
                    height: "13px",
                    borderRadius: "50%",
                    border: "2px solid currentColor",
                    borderTopColor: "transparent",
                    animation: "spin 0.7s linear infinite",
                  }}
                />
              ) : null}
              {isLast ? "Get Started" : "Next →"}
            </PillButton>
          </div>
        </div>
      </div>

      {/* =====================================================================
          MOBILE LAYOUT — full-viewport, logo+skip fixed top, card + text below.
          Shown only on small screens (flex md:hidden).
          ===================================================================== */}
      <div
        className="flex md:hidden flex-col w-full"
        style={{ minHeight: "100vh", paddingTop: "72px", paddingBottom: "32px" }}
      >
        {/* White illustration card (contains step label + visual) */}
        <div
          style={{
            margin: "0 16px",
            background: "#FFFFFF",
            borderRadius: "20px",
            border: "1.5px solid #E8DEC9",
            boxShadow: "0 8px 32px rgba(74,56,40,0.12)",
            overflow: "hidden",
          }}
        >
          {/* Step label — small monospace, accent color, centered */}
          <p
            className="font-mono-plex"
            style={{
              textAlign: "center",
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.12em",
              color: cur.accent,
              padding: "16px 0 12px",
            }}
          >
            STEP {step + 1} OF {total}
          </p>

          {/* Illustration area inside card */}
          <div
            style={{
              padding: "0 16px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              key={`m-vis-${step}-${animKey}`}
              style={{ animation: "kSlideUp 0.38s cubic-bezier(0.22,0.68,0,1.1) both", width: "100%" }}
            >
              {cur.visual}
            </div>
          </div>
        </div>

        {/* Text + nav area — below the card */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "0 24px",
          }}
        >
          {/* Headline */}
          <h2
            key={`m-h-${step}-${animKey}`}
            className="font-serif-display"
            style={{
              fontSize: "28px",
              color: "#4A3828",
              textAlign: "center",
              lineHeight: 1.15,
              margin: "20px 0 10px",
              animation: "kFadeUp 0.3s ease 0.12s both",
            }}
          >
            {cur.headline}
          </h2>

          {/* Body copy */}
          <p
            key={`m-b-${step}-${animKey}`}
            className="font-sans-inter"
            style={{
              fontSize: "15px",
              color: "#6B5A48",
              textAlign: "center",
              lineHeight: 1.65,
              marginBottom: "20px",
              animation: "kFadeUp 0.3s ease 0.2s both",
            }}
          >
            {cur.body}
          </p>

          {/* Dot indicators */}
          <div style={{ marginBottom: "20px" }}>
            <DotNav total={total} current={step} accent={cur.accent} onDotClick={handleDot} />
          </div>

          {/* Spacer to push CTA down */}
          <div style={{ flex: 1 }} />

          {/* Full-width Next / Get Started pill button */}
          <button
            onClick={handleNext}
            disabled={isPending}
            className="font-sans-inter"
            style={{
              width: "100%",
              borderRadius: "9999px",
              padding: "16px",
              background: cur.accent,
              color: (cur.accent === "#21483A" || cur.accent === "#303B63") ? "#FFFFFF" : "#4A3828",
              fontSize: "16px",
              fontWeight: 600,
              border: "none",
              cursor: isPending ? "not-allowed" : "pointer",
              opacity: isPending ? 0.6 : 1,
              boxShadow: `0 6px 20px ${cur.accent}44`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              transition: "opacity 0.15s, transform 0.1s",
              marginBottom: step > 0 ? "8px" : "0",
            }}
            onMouseEnter={(e) => { if (!isPending) e.currentTarget.style.transform = "scale(1.01)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
          >
            {isPending && (
              <span
                style={{
                  display: "inline-block",
                  width: "16px",
                  height: "16px",
                  borderRadius: "50%",
                  border: "2px solid currentColor",
                  borderTopColor: "transparent",
                  animation: "spin 0.7s linear infinite",
                }}
              />
            )}
            {isLast ? "Get Started 🌾" : "Next →"}
          </button>

          {/* Back text link — step 2+ only */}
          {step > 0 && (
            <button
              onClick={handleBack}
              className="font-sans-inter"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: 500,
                color: "#A88958",
                opacity: 0.8,
                padding: "6px 0",
              }}
            >
              ← Back
            </button>
          )}
        </div>
      </div>

      {/* Keyframe animations + spinner */}
      <style jsx global>{`
        @keyframes kSlideUp {
          from { opacity: 0; transform: translateY(22px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
        @keyframes kFadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
