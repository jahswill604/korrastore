// components/checkout/order-review-form.tsx — Interactive order review form for KorraStore Checkout.
// Manages quantity state, computes live price breakdown (subtotal + 1% platform fee + total),
// submits to POST /api/orders, and redirects browser to Paystack hosted payment page on success.
// Shows loading state during submit, retry-capable error banner on failure.
// Used in: app/checkout/page.tsx
// IMPORTANT: This is the ONLY "use client" component in the checkout feature.

'use client';

import * as React from 'react';

// -------------------------
// Platform fee constants — 1% of subtotal, capped at ₦5,000
// -------------------------
const PLATFORM_FEE_RATE = 0.01;
const PLATFORM_FEE_CAP = 5000;

// -------------------------
// Props passed from the Server Component with pre-fetched commodity data.
// All values come from the database — nothing is computed or mocked client-side.
// -------------------------
interface OrderReviewFormProps {
  commodityId: string;
  gradeId: string;
  commodityName: string;
  gradeName: string;
  gradeCode: string;
  unitPrice: number;
  availableQuantity: number;
  unit: string;
  imageUrl: string | null;
  initialQuantity: number;
}

// -------------------------
// Naira formatter using IBM Plex Mono display convention.
// Returns a formatted string like "₦68,500" (no decimals for clean display).
// -------------------------
function formatNaira(amount: number): string {
  return '₦' + Math.round(amount).toLocaleString('en-NG');
}

// -------------------------
// Unit label helper — converts unit string to singular/plural display label.
// -------------------------
function getUnitLabel(unit: string, quantity: number): string {
  const base = unit.toLowerCase();
  if (base === 'bag') return quantity === 1 ? 'bag' : 'bags';
  if (base === 'ton') return quantity === 1 ? 'ton' : 'tons';
  if (base === 'kg') return 'kg';
  return base;
}

export function OrderReviewForm({
  commodityId,
  gradeId,
  commodityName,
  gradeName,
  gradeCode,
  unitPrice,
  availableQuantity,
  unit,
  imageUrl,
  initialQuantity,
}: OrderReviewFormProps) {
  // -------------------------
  // Component state — quantity, unit mode, loading/error
  // -------------------------
  const [quantity, setQuantity] = React.useState<number>(
    Math.min(Math.max(1, initialQuantity), availableQuantity)
  );
  // Unit toggle: 'retail' (bags) | 'bulk' (tons, 1 ton = 10 bags for display)
  const [unitMode, setUnitMode] = React.useState<'retail' | 'bulk'>('retail');
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  // -------------------------
  // Derived price calculations — recomputed on every render when quantity changes
  // -------------------------
  const subtotal = unitPrice * quantity;
  const platformFee = Math.min(subtotal * PLATFORM_FEE_RATE, PLATFORM_FEE_CAP);
  const total = subtotal + platformFee;
  const totalKobo = Math.round(total * 100);

  // -------------------------
  // Quantity control handlers — clamp to [1, availableQuantity]
  // -------------------------
  const decrement = () => setQuantity((q) => Math.max(1, q - 1));
  const increment = () => setQuantity((q) => Math.min(availableQuantity, q + 1));

  // -------------------------
  // Submit handler — POST to /api/orders, then redirect to Paystack URL
  // -------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commodityId, gradeId, quantity }),
      });

      const data = await response.json() as {
        authorizationUrl?: string;
        error?: string;
        available?: number;
      };

      if (!response.ok || !data.authorizationUrl) {
        // Surface the server's error message (e.g. "Only X units available.")
        throw new Error(data.error ?? 'Payment initialization failed. Please try again.');
      }

      // Redirect to Paystack's hosted payment page
      // Note: window.location.href causes a full browser navigation, which is intentional.
      window.location.href = data.authorizationUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setIsLoading(false);
    }
    // Note: we don't setIsLoading(false) on success because the browser is navigating away.
  };

  // -------------------------
  // Grade badge — dark green chip matching the design system
  // -------------------------
  const GradeBadge = () => (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold font-sans-inter"
      style={{ backgroundColor: '#21483A', color: '#ffffff' }}
    >
      {gradeCode === 'A' || gradeCode === 'B' || gradeCode === 'C'
        ? `Grade ${gradeCode}`
        : gradeName}
    </span>
  );

  // -------------------------
  // Commodity thumbnail — fallback to grain emoji if no image
  // -------------------------
  const Thumbnail = () => (
    <div
      className="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden"
      style={{ backgroundColor: '#F5EFE0' }}
    >
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt={commodityName}
          className="w-full h-full object-cover rounded-xl"
        />
      ) : (
        <span className="text-2xl">🌾</span>
      )}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* -------------------------
          ORDER REVIEW CARD
          White background card with all order details
          ------------------------- */}
      <div
        className="bg-white rounded-2xl border p-6 space-y-5"
        style={{ borderColor: '#E4DCC8', boxShadow: '0 1px 4px rgba(74,56,40,0.07)' }}
      >
        {/* Commodity summary row */}
        <div className="flex items-center gap-3">
          <Thumbnail />
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="font-sans-inter font-semibold text-sm truncate"
                style={{ color: '#4A3828' }}
              >
                {commodityName}
              </span>
              <GradeBadge />
            </div>
            <span
              className="font-mono-plex text-xs mt-0.5 block"
              style={{ color: '#A88958' }}
            >
              {formatNaira(unitPrice)} / {unit}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t" style={{ borderColor: '#E4DCC8' }} />

        {/* -------------------------
            QUANTITY SECTION
            − / number / + controls with retail/bulk unit toggle
            ------------------------- */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label
              className="font-sans-inter font-medium text-sm"
              style={{ color: '#4A3828' }}
            >
              Quantity
            </label>
            {/* Quantity stepper */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={decrement}
                disabled={quantity <= 1 || isLoading}
                aria-label="Decrease quantity"
                className="w-9 h-9 rounded-full border flex items-center justify-center font-bold text-lg transition-colors disabled:opacity-40 cursor-pointer hover:bg-[#F7F4EA]"
                style={{ borderColor: '#E4DCC8', color: '#4A3828' }}
              >
                −
              </button>
              <span
                className="font-mono-plex font-bold text-lg min-w-[2rem] text-center"
                style={{ color: '#4A3828' }}
              >
                {quantity}
              </span>
              <button
                type="button"
                onClick={increment}
                disabled={quantity >= availableQuantity || isLoading}
                aria-label="Increase quantity"
                className="w-9 h-9 rounded-full border flex items-center justify-center font-bold text-lg transition-colors disabled:opacity-40 cursor-pointer hover:bg-[#F7F4EA]"
                style={{ borderColor: '#E4DCC8', color: '#4A3828' }}
              >
                +
              </button>
              <span
                className="font-sans-inter text-sm"
                style={{ color: '#4A3828' }}
              >
                {getUnitLabel(unit, quantity)}
              </span>
            </div>
          </div>

          {/* Retail / Bulk unit toggle */}
          <div className="flex items-center gap-2">
            {(['retail', 'bulk'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setUnitMode(mode)}
                disabled={isLoading}
                className="px-4 py-1.5 rounded-full text-xs font-sans-inter font-medium border transition-colors cursor-pointer capitalize"
                style={
                  unitMode === mode
                    ? { backgroundColor: '#D8B56A', borderColor: '#D8B56A', color: '#4A3828' }
                    : { backgroundColor: 'transparent', borderColor: '#E4DCC8', color: '#A88958' }
                }
              >
                {mode}
              </button>
            ))}
            <span
              className="font-sans-inter text-xs ml-1"
              style={{ color: '#A88958' }}
            >
              Available: {availableQuantity.toLocaleString()} {unit}s
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t" style={{ borderColor: '#E4DCC8' }} />

        {/* -------------------------
            PRICE BREAKDOWN
            Unit price → quantity → subtotal → platform fee → Total
            ------------------------- */}
        <div className="space-y-2.5">
          {/* Unit price row */}
          <div className="flex justify-between items-center">
            <span
              className="font-sans-inter text-sm"
              style={{ color: '#4A3828' }}
            >
              Unit price
            </span>
            <span
              className="font-mono-plex text-sm"
              style={{ color: '#4A3828' }}
            >
              {formatNaira(unitPrice)} / {unit}
            </span>
          </div>

          {/* Quantity row */}
          <div className="flex justify-between items-center">
            <span
              className="font-sans-inter text-sm"
              style={{ color: '#4A3828' }}
            >
              Quantity
            </span>
            <span
              className="font-mono-plex text-sm"
              style={{ color: '#4A3828' }}
            >
              {quantity} {getUnitLabel(unit, quantity)}
            </span>
          </div>

          {/* Thin divider before subtotal */}
          <div className="border-t" style={{ borderColor: '#E4DCC8' }} />

          {/* Subtotal row */}
          <div className="flex justify-between items-center">
            <span
              className="font-sans-inter text-sm font-semibold"
              style={{ color: '#4A3828' }}
            >
              Subtotal
            </span>
            <span
              className="font-mono-plex text-sm font-semibold"
              style={{ color: '#4A3828' }}
            >
              {formatNaira(subtotal)}
            </span>
          </div>

          {/* Platform fee row */}
          <div className="flex justify-between items-center">
            <span
              className="font-sans-inter text-xs"
              style={{ color: '#A88958' }}
            >
              Platform fee (1%)
            </span>
            <span
              className="font-mono-plex text-xs"
              style={{ color: '#A88958' }}
            >
              {formatNaira(platformFee)}
            </span>
          </div>

          {/* Thick divider before total */}
          <div className="border-t-2" style={{ borderColor: '#E4DCC8' }} />

          {/* TOTAL row — prominent Harvest Wheat gold */}
          <div className="flex justify-between items-center">
            <span
              className="font-serif-display text-lg font-bold"
              style={{ color: '#4A3828' }}
            >
              Total
            </span>
            <span
              className="font-mono-plex text-2xl font-bold"
              style={{ color: '#D8B56A' }}
            >
              {formatNaira(total)}
            </span>
          </div>
        </div>

        {/* -------------------------
            STORAGE INFO CARD
            Inset beige card explaining commodity storage
            ------------------------- */}
        <div
          className="flex items-start gap-3 p-4 rounded-xl"
          style={{ backgroundColor: '#F7F4EA', border: '1px solid #E4DCC8' }}
        >
          <span className="text-xl flex-shrink-0 mt-0.5">🏛️</span>
          <p
            className="font-sans-inter text-xs leading-relaxed"
            style={{ color: '#4A3828' }}
          >
            Stored securely in a KorraStore warehouse until you resell,
            request buyback, or request delivery.
          </p>
        </div>
      </div>

      {/* -------------------------
          ERROR BANNER
          Shown when API returns an error — includes "Try again" retry hint
          ------------------------- */}
      {error && (
        <div
          className="flex items-start gap-3 p-4 rounded-xl border"
          style={{ backgroundColor: '#FFF0F0', borderColor: '#F8C4C1' }}
          role="alert"
        >
          <span className="text-lg flex-shrink-0">⚠️</span>
          <div className="min-w-0">
            <p
              className="font-sans-inter text-sm font-semibold"
              style={{ color: '#B3432E' }}
            >
              {error}
            </p>
            <p
              className="font-sans-inter text-xs mt-1"
              style={{ color: '#A88958' }}
            >
              Please review your order and try again.
            </p>
          </div>
        </div>
      )}

      {/* -------------------------
          CTA SECTION (DESKTOP + TABLET)
          Full-width Paystack pay button + security note
          Hidden on mobile — mobile uses sticky bottom bar below
          ------------------------- */}
      <div className="hidden sm:block space-y-3">
        <button
          type="submit"
          disabled={isLoading}
          id="checkout-submit-button"
          className="w-full py-4 px-6 rounded-xl font-sans-inter font-semibold text-base transition-all duration-200 disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
          style={{
            backgroundColor: '#D8B56A',
            color: '#4A3828',
            boxShadow: '0 2px 8px rgba(216,181,106,0.35)',
          }}
        >
          {isLoading ? (
            <>
              {/* Loading spinner */}
              <svg
                className="animate-spin h-5 w-5"
                style={{ color: '#4A3828' }}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span>Initializing payment...</span>
            </>
          ) : (
            <>
              <span>Pay</span>
              <span className="font-mono-plex font-bold">{formatNaira(total)}</span>
              <span>with Paystack</span>
            </>
          )}
        </button>

        {/* Security trust note */}
        <p
          className="text-center font-sans-inter text-xs"
          style={{ color: '#A88958' }}
        >
          🔒 Payments processed securely by Paystack
        </p>
      </div>

      {/* -------------------------
          MOBILE STICKY BOTTOM BAR
          Fixed CTA bar above the BottomTabBar on mobile screens
          ------------------------- */}
      <div
        className="sm:hidden fixed bottom-[65px] left-0 right-0 z-40 px-4 py-3 space-y-2"
        style={{
          backgroundColor: 'rgba(255,255,255,0.97)',
          borderTop: '1px solid #E4DCC8',
          backdropFilter: 'blur(8px)',
        }}
      >
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-4 rounded-xl font-sans-inter font-semibold text-base flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 transition-all"
          style={{ backgroundColor: '#D8B56A', color: '#4A3828' }}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span>Initializing...</span>
            </>
          ) : (
            <>
              <span>Pay</span>
              <span className="font-mono-plex font-bold">{formatNaira(total)}</span>
              <span>with Paystack</span>
            </>
          )}
        </button>
        <p
          className="text-center font-sans-inter text-xs"
          style={{ color: '#A88958' }}
        >
          🔒 Secured by Paystack
        </p>
      </div>

      {/* Bottom spacer for mobile — prevents content hiding behind sticky bar */}
      <div className="sm:hidden h-36" aria-hidden="true" />

      {/* Hidden fields for accessibility/debugging — not sent to server (server uses body JSON) */}
      <input type="hidden" name="_totalKobo" value={totalKobo} readOnly />
    </form>
  );
}
