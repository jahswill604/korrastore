// app/checkout/page.tsx — KorraStore Checkout Server Component page at /checkout.
// Authenticates the buyer (server-side getUser()), reads commodityId/gradeId/qty from URL params,
// fetches commodity + grade + live inventory data from Supabase, and renders the OrderReviewForm.
// Desktop: full AppShell with collapsed NavRail. Mobile: simple top nav bar.
// Used in: Next.js App Router route /checkout

import { Metadata } from 'next';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getCheckoutCommodity } from '@/lib/supabase/queries/orders';
import { AppShell } from '@/components/layout/app-shell';
import { OrderReviewForm } from '@/components/checkout/order-review-form';

// -------------------------
// SEO metadata for the checkout route
// -------------------------
export const metadata: Metadata = {
  title: 'Checkout — KorraStore',
  description: 'Review your order and pay securely via Paystack.',
};

// -------------------------
// Page props — Next.js passes searchParams as a Promise in App Router (Next.js 15+)
// -------------------------
interface CheckoutPageProps {
  searchParams: Promise<{
    commodityId?: string;
    gradeId?: string;
    qty?: string;
  }>;
}

// -------------------------
// CheckoutPage — Server Component entry point for /checkout.
//
// Flow:
// 1. Re-verify buyer session via getUser() — redirect to /login if unauthenticated.
// 2. Resolve URL search params (commodityId, gradeId, optional qty).
// 3. Validate params presence — redirect to /home if missing.
// 4. Fetch commodity + grade + live inventory from Supabase (server-side, not trusted from URL).
// 5. Render the order review form with server-fetched props.
// -------------------------
export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  // -------------------------
  // Step 1: Auth guard — re-verify session using getUser() (not getSession()).
  // Per AGENTS.md §13, getUser() validates against Supabase Auth servers every time.
  // -------------------------
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirect=/checkout');
  }

  // -------------------------
  // Step 2: Resolve search params from the URL.
  // commodityId and gradeId come from the "Buy Now" button on commodity details.
  // qty is optional — defaults to 1 if absent.
  // -------------------------
  const params = await searchParams;
  const { commodityId, gradeId, qty } = params;

  // -------------------------
  // Step 3: Validate required params — redirect home if missing
  // -------------------------
  if (!commodityId || !gradeId) {
    redirect('/home');
  }

  const initialQuantity = Math.max(1, parseInt(qty ?? '1', 10) || 1);

  // -------------------------
  // Step 4: Fetch the commodity + grade + live inventory from the database.
  // This is RE-FETCHED server-side — we never trust stale data from URL params.
  // -------------------------
  const commodity = await getCheckoutCommodity(commodityId, gradeId);

  // If the commodity or grade doesn't exist / isn't available, show 404
  if (!commodity) {
    notFound();
  }

  return (
    <AppShell>
      {/* -------------------------
          PAGE CONTAINER
          Centered max-width layout for desktop; full-width on mobile
          ------------------------- */}
      <div
        className="min-h-screen"
        style={{ backgroundColor: '#F7F4EA' }}
      >
        {/* -------------------------
            PAGE HEADER
            Desktop: back arrow + H1 "Review your order"
            Mobile: simple top nav bar with back arrow + "Checkout" title
            ------------------------- */}

        {/* Mobile top navigation bar */}
        <div
          className="sm:hidden flex items-center justify-between px-4 py-3 bg-white border-b"
          style={{ borderColor: '#E4DCC8' }}
        >
          <Link
            href={`/commodities/${commodityId}`}
            className="w-9 h-9 flex items-center justify-center rounded-full border transition-colors hover:bg-[#F7F4EA]"
            style={{ borderColor: '#E4DCC8', color: '#4A3828' }}
            aria-label="Back to commodity details"
          >
            ←
          </Link>
          <h1
            className="font-sans-inter font-semibold text-base"
            style={{ color: '#4A3828' }}
          >
            Checkout
          </h1>
          {/* Empty spacer to center the title */}
          <div className="w-9" aria-hidden="true" />
        </div>

        {/* Desktop/tablet page header */}
        <div className="hidden sm:block px-6 pt-8 pb-2 max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <Link
              href={`/commodities/${commodityId}`}
              className="flex items-center gap-1.5 font-sans-inter text-sm transition-colors hover:opacity-70"
              style={{ color: '#A88958' }}
              aria-label="Back to commodity details"
            >
              ← Back
            </Link>
          </div>
          <h1
            className="font-serif-display text-3xl font-bold"
            style={{ color: '#4A3828' }}
          >
            Review your order
          </h1>
          <p
            className="font-sans-inter text-sm mt-1"
            style={{ color: '#A88958' }}
          >
            {commodity.commodityName} — {commodity.gradeName}
          </p>
        </div>

        {/* -------------------------
            ORDER REVIEW FORM
            Client component receiving all server-fetched data as props.
            No data fetching happens client-side.
            ------------------------- */}
        <div className="px-4 sm:px-6 pb-8 max-w-2xl mx-auto">
          <OrderReviewForm
            commodityId={commodity.commodityId}
            gradeId={commodity.gradeId}
            commodityName={commodity.commodityName}
            gradeName={commodity.gradeName}
            gradeCode={commodity.gradeCode}
            unitPrice={commodity.unitPrice}
            availableQuantity={commodity.availableQuantity}
            unit={commodity.unit}
            imageUrl={commodity.imageUrl}
            initialQuantity={initialQuantity}
          />
        </div>
      </div>
    </AppShell>
  );
}
