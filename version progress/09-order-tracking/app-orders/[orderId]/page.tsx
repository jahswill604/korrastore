// app/orders/[orderId]/page.tsx — Server Component for KorraStore Order Tracking & Detail View.
// Renders the order tracking milestones via StatusStepper, payment verification status, and financial breakdown.
// Security: Enforces strict auth.uid() ownership check — returns 404 (notFound) if order does not belong to buyer.
// Used in: /orders/[orderId] route.

import * as React from "react";
import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getOrderDetail, OrderFulfillmentStatus } from "@/lib/supabase/queries/orders";
import { AppShell } from "@/components/layout/app-shell";
import { StatusStepper, StepItem } from "@/components/ui/status-stepper";
import { Card } from "@/components/ui/card";
import { OrderSummaryCard } from "@/components/orders/order-summary-card";
import { getFulfillmentBadgeConfig } from "@/components/orders/order-row";
import { cn } from "@/lib/utils";

interface OrderDetailPageProps {
  params: Promise<{
    orderId: string;
  }>;
  searchParams?: Promise<{
    reference?: string;
    trxref?: string;
    status?: string;
  }>;
}

export async function generateMetadata({ params }: OrderDetailPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  return {
    title: `Order Tracking #${resolvedParams.orderId.slice(0, 8).toUpperCase()} — KorraStore`,
    description: "Real-time fulfillment tracking and warehouse storage status for your KorraStore order.",
  };
}

// ----------------------------------------------------------------------------
// Fulfillment Stepper Definition
// ----------------------------------------------------------------------------
const FULFILLMENT_STEPS: StepItem[] = [
  {
    id: "step_placed",
    label: "Order Placed",
    description: "Payment verified",
  },
  {
    id: "step_sourcing",
    label: "Sourcing Verified",
    description: "Origin grain quality checked",
  },
  {
    id: "step_transit",
    label: "In Transit",
    description: "En route to Silo Hub",
  },
  {
    id: "step_stored",
    label: "Stored in Silo",
    description: "Holding issued & verified",
  },
];

// Helper to determine active step index (0 to 3) based on status
function getStepIndex(status: OrderFulfillmentStatus): number {
  switch (status) {
    case "pending_payment":
      return 0;
    case "sourcing":
      return 1;
    case "in_transit":
      return 2;
    case "stored":
    case "delivered":
      return 3;
    default:
      return 0;
  }
}

export default async function OrderDetailPage({ params, searchParams }: OrderDetailPageProps) {
  // --------------------------------------------------------------------------
  // 1. Session Verification
  // --------------------------------------------------------------------------
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const resolvedParams = await params;
  const resolvedQuery = searchParams ? await searchParams : {};

  if (!user) {
    redirect(`/login?redirect=/orders/${resolvedParams.orderId}`);
  }

  // --------------------------------------------------------------------------
  // 2. Fetch Order Details with Ownership Guard
  // --------------------------------------------------------------------------
  const order = await getOrderDetail(user.id, resolvedParams.orderId);

  // If order does not exist or user is not the owner, trigger 404 (do not leak data)
  if (!order) {
    notFound();
  }

  // Detect payment return state from query parameters
  const isFromPaymentCallback = Boolean(resolvedQuery.reference || resolvedQuery.trxref);
  const isPaymentSuccess = isFromPaymentCallback && resolvedQuery.status !== "failed" && resolvedQuery.status !== "cancelled";

  // If returning from a successful payment callback, advance status in view if still pending
  if (isPaymentSuccess && order.paymentStatus === "pending") {
    order.paymentStatus = "paid";
    if (order.status === "pending_payment") {
      order.status = "sourcing";
    }
  }

  const currentStepIndex = getStepIndex(order.status);
  const badgeConfig = getFulfillmentBadgeConfig(order.status);
  const isCancelledOrFailed = order.status === "cancelled" || order.status === "failed";

  const formattedDate = new Date(order.createdAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Top Navigation Back Link */}
        <div>
          <Link
            href="/orders"
            className="inline-flex items-center space-x-1.5 text-xs sm:text-sm font-semibold text-[#4A3828]/75 hover:text-[#4A3828] transition-colors"
          >
            <span>←</span>
            <span>Back to Orders</span>
          </Link>
        </div>

        {/* Payment Confirmation Banner if redirected from Paystack */}
        {isPaymentSuccess && (
          <div className="p-4 rounded-xl bg-[#21483A]/10 border border-[#21483A]/30 flex items-start space-x-3 text-sm text-[#21483A]">
            <span className="text-xl">✅</span>
            <div>
              <p className="font-bold">Payment Completed Successfully!</p>
              <p className="text-xs text-[#21483A]/80 mt-0.5">
                Your order has been confirmed. Sourcing and quality verification are now in progress.
              </p>
            </div>
          </div>
        )}

        {/* Order Header Summary */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E4DCC8] pb-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <h1 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#4A3828]">
                Order #{order.id.slice(0, 8).toUpperCase()}
              </h1>
              <span
                className={cn(
                  "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
                  badgeConfig.customClass
                )}
              >
                {badgeConfig.label}
              </span>
            </div>
            <p className="text-xs sm:text-sm font-mono-plex text-[#A88958] mt-1">
              Placed on {formattedDate}
            </p>
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* Fulfillment Lifecycle Stepper */}
        {/* ------------------------------------------------------------------ */}
        {!isCancelledOrFailed && (
          <Card className="p-5 sm:p-6 bg-[#FFFFFF] border-[#E4DCC8] shadow-soil-xs">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-serif-display text-base sm:text-lg font-bold text-[#4A3828]">
                Fulfillment Progress
              </h2>
              <span className="text-xs font-mono-plex text-[#A88958]">
                Stage {currentStepIndex + 1} of 4
              </span>
            </div>

            <StatusStepper
              steps={FULFILLMENT_STEPS}
              currentStepIndex={currentStepIndex}
              className="mt-2"
            />
          </Card>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* Order Details & Summary Card */}
        {/* ------------------------------------------------------------------ */}
        <OrderSummaryCard order={order} />
      </div>
    </AppShell>
  );
}
