// app/admin/orders/[orderId]/page.tsx — Admin Order Detail & Fulfillment Control Page for KorraStore.
// Displays order lifecycle status stepper, controlled status advancement controls, exception reconciliation panel, buyer info, and audit history.
// Used in: /admin/orders/[orderId]

import * as React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminOrderDetail } from "@/lib/supabase/queries/admin/orders";
import { StatusStepper, StepItem } from "@/components/ui/status-stepper";
import { GradeBadge } from "@/components/ui/grade-badge";
import { StatusAdvanceControl } from "@/components/admin/orders/status-advance-control";
import { ExceptionResolutionPanel } from "@/components/admin/orders/exception-resolution-panel";
import { OrderAuditTrail } from "@/components/admin/orders/order-audit-trail";
import { OrderFulfillmentStatus } from "@/lib/supabase/queries/orders";

export const dynamic = "force-dynamic";

interface AdminOrderDetailPageProps {
  params: Promise<{
    orderId: string;
  }>;
}

export default async function AdminOrderDetailPage({
  params,
}: AdminOrderDetailPageProps) {
  const { orderId } = await params;

  // Fetch full order tree and audit log trail
  const order = await getAdminOrderDetail(orderId);

  if (!order) {
    notFound();
  }

  // Define steps for Fulfillment StatusStepper
  const fulfillmentSteps: StepItem[] = [
    { id: "pending", label: "Order Placed", description: "Payment initialized" },
    { id: "sourcing", label: "Sourcing Verified", description: "Quality verified" },
    { id: "in_transit", label: "In Transit", description: "En route to Silo" },
    {
      id: "completed",
      label: order.deliveryType === "home_delivery" ? "Delivered" : "Stored in Silo",
      description: order.deliveryType === "home_delivery" ? "Customer received" : "Verified in Silo",
    },
  ];

  // Calculate current active step index
  let currentStepIndex = 0;
  if (order.status === "sourcing") currentStepIndex = 1;
  else if (order.status === "in_transit") currentStepIndex = 2;
  else if (order.status === "stored" || order.status === "delivered") currentStepIndex = 3;

  // Format date helper
  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleString("en-NG", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-6 max-w-6xl pb-12">
      {/* Top Navigation & Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-[#A88958]">
        <Link
          href="/admin/orders"
          className="hover:text-[#4A3828] flex items-center gap-1 font-medium transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back to Orders List</span>
        </Link>
        <span>/</span>
        <span className="text-[#4A3828] font-semibold">Order #{order.id.slice(0, 8).toUpperCase()}</span>
      </div>

      {/* Main Order Header Banner */}
      <div className="bg-[#FCFAF5] border border-[#E4DCC8] rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h1 className="font-serif text-xl sm:text-2xl text-[#4A3828] font-bold">
              Order #KOR-{order.id.slice(0, 8).toUpperCase()}
            </h1>
            {order.isException ? (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#B3432E] text-white">
                Exception State
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#21483A]/10 text-[#21483A] border border-[#21483A]/20 capitalize">
                {order.status.replace("_", " ")}
              </span>
            )}
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                order.paymentStatus === "paid"
                  ? "bg-[#21483A]/10 text-[#21483A] border border-[#21483A]/20"
                  : "bg-[#C7862B]/10 text-[#C7862B] border border-[#C7862B]/20"
              }`}
            >
              Payment: {order.paymentStatus}
            </span>
          </div>
          <p className="text-xs text-[#A88958]">
            Placed on <span className="font-medium text-[#4A3828]">{formatDate(order.createdAt)}</span> • Delivery Mode:{" "}
            <span className="font-medium text-[#4A3828] capitalize">{order.deliveryType.replace("_", " ")}</span>
          </p>
        </div>

        {/* Quick Action / Print */}
        <div className="flex items-center gap-2">
          <Link
            href={`/orders/${order.id}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-[#F5EFE0] text-[#4A3828] border border-[#E4DCC8] text-xs font-medium transition-colors shadow-xs"
          >
            <span>View Buyer Portal</span>
            <svg className="w-3.5 h-3.5 text-[#A88958]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Fulfillment Stepper Progression */}
      <div className="bg-[#FCFAF5] border border-[#E4DCC8] rounded-2xl p-6 shadow-sm">
        <h3 className="font-serif text-sm font-bold text-[#4A3828] mb-2">
          Fulfillment Lifecycle Progression
        </h3>
        <StatusStepper steps={fulfillmentSteps} currentStepIndex={currentStepIndex} />
      </div>

      {/* Exception Resolution Panel (if order flagged with exception) */}
      {order.isException && (
        <ExceptionResolutionPanel
          orderId={order.id}
          exceptionReason={order.exceptionReason}
        />
      )}

      {/* Main Grid: Status Control + Buyer & Commodity Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3): Commodity Details & Buyer Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Commodity & Pricing Summary Card */}
          <div className="bg-[#FCFAF5] border border-[#E4DCC8] rounded-2xl p-6 shadow-sm">
            <h3 className="font-serif text-base text-[#4A3828] font-bold mb-4 pb-3 border-b border-[#E4DCC8]">
              Commodity & Pricing Breakdown
            </h3>

            <div className="flex flex-col sm:flex-row items-start justify-between gap-4 pb-4 border-b border-[#E4DCC8]/60">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl bg-[#F5EFE0] border border-[#E4DCC8] flex items-center justify-center text-2xl shrink-0">
                  🌾
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-serif text-base text-[#4A3828] font-bold">
                      {order.item.commodityName}
                    </h4>
                    <GradeBadge grade={order.item.gradeCode} size="sm" />
                  </div>
                  <p className="text-xs text-[#A88958]">
                    {order.item.gradeName} • Direct Silo Allocation
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <div className="text-xs text-[#A88958]">Ordered Quantity</div>
                <div className="font-mono text-base font-bold text-[#4A3828]">
                  {order.item.quantity.toLocaleString()} {order.item.unit}
                </div>
              </div>
            </div>

            {/* Price Line Items */}
            <div className="space-y-2.5 pt-4 text-xs">
              <div className="flex justify-between text-[#4A3828]">
                <span>Unit Price</span>
                <span className="font-mono font-medium">₦{order.item.unitPrice.toLocaleString()} / {order.item.unit}</span>
              </div>
              <div className="flex justify-between text-[#4A3828]">
                <span>Commodity Subtotal</span>
                <span className="font-mono font-medium">₦{(order.item.quantity * order.item.unitPrice).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[#4A3828]">
                <span>Platform & Storage Fee</span>
                <span className="font-mono font-medium">₦{order.platformFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-[#4A3828] pt-2 border-t border-[#E4DCC8]">
                <span>Total Amount Paid</span>
                <span className="font-mono text-[#D8B56A] text-base">
                  ₦{order.totalPrice.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Buyer & Delivery Details Card */}
          <div className="bg-[#FCFAF5] border border-[#E4DCC8] rounded-2xl p-6 shadow-sm">
            <h3 className="font-serif text-base text-[#4A3828] font-bold mb-4 pb-3 border-b border-[#E4DCC8]">
              Customer & Delivery Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[#A88958] block mb-0.5">Full Name</span>
                <span className="font-medium text-[#4A3828]">{order.buyerName}</span>
              </div>
              <div>
                <span className="text-[#A88958] block mb-0.5">Email Address</span>
                <span className="font-medium text-[#303B63]">{order.buyerEmail}</span>
              </div>
              <div>
                <span className="text-[#A88958] block mb-0.5">Phone Number</span>
                <span className="font-medium text-[#4A3828]">{order.buyerPhone || "Not provided"}</span>
              </div>
              <div>
                <span className="text-[#A88958] block mb-0.5">Delivery Destination</span>
                <span className="font-medium text-[#4A3828]">
                  {order.deliveryAddress || "KorraStore Climate-Controlled Silo (Abuja Hub)"}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Transaction Details Card */}
          {order.paymentDetails && (
            <div className="bg-[#FCFAF5] border border-[#E4DCC8] rounded-2xl p-6 shadow-sm">
              <h3 className="font-serif text-base text-[#4A3828] font-bold mb-4 pb-3 border-b border-[#E4DCC8]">
                Payment Transaction Record
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-[#A88958] block mb-0.5">Provider Reference</span>
                  <span className="font-mono font-medium text-[#4A3828]">{order.paymentDetails.reference}</span>
                </div>
                <div>
                  <span className="text-[#A88958] block mb-0.5">Currency / Amount</span>
                  <span className="font-mono font-medium text-[#4A3828]">
                    {order.paymentDetails.currency} ₦{order.paymentDetails.amount.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-[#A88958] block mb-0.5">Settlement Timestamp</span>
                  <span className="font-mono font-medium text-[#4A3828]">
                    {order.paymentDetails.paidAt ? formatDate(order.paymentDetails.paidAt) : "Pending"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column (1/3): Status Advance Controls & Audit Trail */}
        <div className="space-y-6">
          {/* Controlled Status Advancement Selector */}
          <StatusAdvanceControl
            orderId={order.id}
            currentStatus={order.status as OrderFulfillmentStatus}
            isException={order.isException}
          />

          {/* Chronological Audit Trail Component */}
          <OrderAuditTrail auditTrail={order.auditTrail} />
        </div>
      </div>
    </div>
  );
}
