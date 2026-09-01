// app/design-system/page.tsx — Design System Showcase Route for KorraStore.
// Renders comprehensive showcase of all light-mode design tokens, typography scales, base primitives,
// signature LedgerReceipt ticket component, navigation shell, and interactive controls.
// Used in: `/design-system` route for token validation and developer reference.

"use client";

import * as React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { LedgerReceipt } from "@/components/ui/ledger-receipt";
import { PriceDisplay } from "@/components/ui/price-display";
import { GradeBadge } from "@/components/ui/grade-badge";
import { QuantitySelector } from "@/components/ui/quantity-selector";
import { StatusStepper } from "@/components/ui/status-stepper";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Modal } from "@/components/ui/modal";
import { Toast } from "@/components/ui/toast";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";

// Color swatches metadata array.
const COLOR_SWATCHES = [
  { name: "Harvest Wheat", hex: "#D8B56A", role: "Primary Accent / CTAs / Active States", textDark: true },
  { name: "Husk", hex: "#A88958", role: "Secondary Accent / Hover Highlights", textDark: false },
  { name: "Soil", hex: "#4A3828", role: "Primary Copy / Text", textDark: false },
  { name: "Deep Grain Green", hex: "#21483A", role: "Stored Status / Positive Delta", textDark: false },
  { name: "Trust Indigo", hex: "#303B63", role: "Links / Informational Badges", textDark: false },
  { name: "Paper Base", hex: "#F7F4EA", role: "Page Background / Surface Base", textDark: true },
  { name: "Card Surface", hex: "#FFFFFF", role: "Card Fill Base", textDark: true },
  { name: "Border Color", hex: "#E4DCC8", role: "Divider & Container Borders", textDark: true },
  { name: "Danger Red", hex: "#B3432E", role: "Cancelled / Error States", textDark: false },
  { name: "Warning Amber", hex: "#C7862B", role: "Pending / Transit States", textDark: false },
];

export default function DesignSystemPage() {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [quantity, setQuantity] = React.useState(10);

  return (
    <AppShell>
      <div className="space-y-12 pb-12 font-sans-inter">
        {/* Header Hero Title Banner */}
        <div className="border-b border-[var(--border-color)] pb-6">
          <div className="flex items-center space-x-2 text-xs font-mono-plex uppercase font-semibold text-[var(--husk)]">
            <span>🎨 DESIGN SYSTEM V0.1.0</span>
            <span>•</span>
            <span className="text-[var(--deep-grain-green)]">LIGHT MODE ONLY</span>
          </div>
          <h1 className="font-serif-display text-3xl sm:text-4xl text-[var(--soil)] mt-2 font-bold">
            KorraStore Tokens & Primitives Showcase
          </h1>
          <p className="text-sm text-[var(--soil-secondary)] mt-2 max-w-2xl">
            Modern agricultural marketplace + trusted warehouse paper ledger aesthetic. All tokens, colors, typography, and reusable UI components are documented below.
          </p>
        </div>

        {/* Section 1: Color Token Swatches */}
        <section className="space-y-4">
          <h2 className="font-serif-display text-2xl text-[var(--soil)] border-b border-[var(--border-color)] pb-2">
            1. Color Token Palette
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {COLOR_SWATCHES.map((s) => (
              <div
                key={s.hex}
                className="bg-[var(--paper-card)] border border-[var(--border-color)] rounded-[12px] p-3 shadow-soil-sm"
              >
                <div
                  className="h-16 rounded-[8px] border border-black/10 mb-3 flex items-center justify-center font-mono-plex font-bold text-xs"
                  style={{ backgroundColor: s.hex, color: s.textDark ? "#4A3828" : "#FFFFFF" }}
                >
                  {s.hex}
                </div>
                <div className="font-bold text-sm text-[var(--soil)]">{s.name}</div>
                <div className="text-[11px] text-[var(--soil-secondary)] mt-1">{s.role}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 2: Typography Scale */}
        <section className="space-y-4">
          <h2 className="font-serif-display text-2xl text-[var(--soil)] border-b border-[var(--border-color)] pb-2">
            2. Typography Scale
          </h2>
          <div className="bg-[var(--paper-card)] border border-[var(--border-color)] rounded-[12px] p-6 shadow-soil-sm space-y-6">
            <div>
              <span className="text-xs font-mono-plex text-[var(--husk)] uppercase font-semibold block mb-1">
                Display Header — DM Serif Display
              </span>
              <h1 className="font-serif-display text-3xl sm:text-4xl text-[var(--soil)]">
                Grade-A White Maize Silo Receipt
              </h1>
            </div>

            <div>
              <span className="text-xs font-mono-plex text-[var(--husk)] uppercase font-semibold block mb-1">
                UI Body / Headings — Inter
              </span>
              <h2 className="font-sans-inter font-bold text-xl text-[var(--soil)]">
                Commodity Valuation & Storage Overview
              </h2>
              <p className="font-sans-inter text-sm text-[var(--soil-secondary)] mt-1 max-w-xl">
                KorraStore provides verified physical warehouse storage for agricultural commodities across Nigeria.
              </p>
            </div>

            <div>
              <span className="text-xs font-mono-plex text-[var(--husk)] uppercase font-semibold block mb-1">
                Numeric & Currency — IBM Plex Mono
              </span>
              <div className="font-mono-plex text-2xl font-bold text-[var(--deep-grain-green)]">
                ₦18,500,000.00 • 50 METRIC TONS
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Signature Ledger Receipt Component */}
        <section className="space-y-4">
          <h2 className="font-serif-display text-2xl text-[var(--soil)] border-b border-[var(--border-color)] pb-2">
            3. Signature Ledger Receipt Primitive (`<LedgerReceipt />`)
          </h2>
          <p className="text-xs text-[var(--soil-secondary)]">
            Signature physical ticket motif with perforated header edge, dashed divider, and valuation indicators.
          </p>
          <div className="flex justify-center p-4 bg-[var(--paper)] border border-[var(--border-color)] rounded-[14px]">
            <LedgerReceipt
              receiptNumber="RECEIPT #KORRA-2026-9904"
              commodityName="Grade-A Sokoto White Maize"
              warehouseLocation="Sokoto Central Grain Silo, Nigeria"
              quantity="50 Metric Tons"
              grade="Grade A+"
              purchaseValue="₦18,500,000"
              currentValue="₦21,250,000"
              percentageChange="+14.86%"
              isPositiveChange={true}
              status="Stored"
            />
          </div>
        </section>

        {/* Section 4: Buttons & Core Controls */}
        <section className="space-y-4">
          <h2 className="font-serif-display text-2xl text-[var(--soil)] border-b border-[var(--border-color)] pb-2">
            4. Button Variants & Controls
          </h2>
          <div className="bg-[var(--paper-card)] border border-[var(--border-color)] rounded-[12px] p-6 shadow-soil-sm space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-mono-plex text-[var(--husk)] uppercase font-semibold block">
                Variants
              </span>
              <div className="flex flex-wrap gap-3">
                <Button variant="primary">Primary CTA</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="destructive">Destructive</Button>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-mono-plex text-[var(--husk)] uppercase font-semibold block">
                Sizes & States
              </span>
              <div className="flex flex-wrap items-center gap-3">
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
                <Button isLoading>Processing...</Button>
                <Button disabled>Disabled</Button>
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: Badges, Price Display & Stepper */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* PriceDisplay & Grade Badges */}
          <Card padding="lg" className="space-y-6">
            <CardHeader className="p-0 mb-2">
              <CardTitle>PriceDisplay & Grade Badges</CardTitle>
            </CardHeader>
            <div className="space-y-4">
              <div>
                <span className="text-xs text-[var(--soil-tertiary)] uppercase font-semibold block mb-2">
                  PriceDisplay Component
                </span>
                <PriceDisplay amount={450000} size="xl" delta="+12.4%" isPositiveDelta={true} />
              </div>

              <div>
                <span className="text-xs text-[var(--soil-tertiary)] uppercase font-semibold block mb-2">
                  Negative Delta PriceDisplay
                </span>
                <PriceDisplay amount={320000} size="md" delta="-3.1%" isPositiveDelta={false} />
              </div>

              <div>
                <span className="text-xs text-[var(--soil-tertiary)] uppercase font-semibold block mb-2">
                  Grade Badges
                </span>
                <div className="flex gap-2">
                  <GradeBadge grade="Grade A" />
                  <GradeBadge grade="Grade B" />
                  <GradeBadge grade="Grade C" />
                </div>
              </div>

              <div>
                <span className="text-xs text-[var(--soil-tertiary)] uppercase font-semibold block mb-2">
                  Status Badges
                </span>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="stored">Stored</Badge>
                  <Badge variant="pending">In Transit</Badge>
                  <Badge variant="cancelled">Cancelled</Badge>
                  <Badge variant="info">Verification</Badge>
                </div>
              </div>
            </div>
          </Card>

          {/* Quantity Selector & Interactive Modal */}
          <Card padding="lg" className="space-y-6">
            <CardHeader className="p-0 mb-2">
              <CardTitle>Quantity Selector & Modals</CardTitle>
            </CardHeader>
            <div className="space-y-4">
              <div>
                <span className="text-xs text-[var(--soil-tertiary)] uppercase font-semibold block mb-2">
                  QuantitySelector Component
                </span>
                <QuantitySelector value={quantity} onChange={setQuantity} unit="Metric Tons" />
              </div>

              <div>
                <span className="text-xs text-[var(--soil-tertiary)] uppercase font-semibold block mb-2">
                  Interactive Modal Trigger
                </span>
                <Button variant="outline" onClick={() => setIsModalOpen(true)}>
                  Open Sample Modal Dialog
                </Button>
              </div>

              <div>
                <span className="text-xs text-[var(--soil-tertiary)] uppercase font-semibold block mb-2">
                  User Avatar Primitives
                </span>
                <div className="flex items-center space-x-3">
                  <Avatar fallbackText="KS" size="sm" />
                  <Avatar fallbackText="JM" size="md" />
                  <Avatar fallbackText="AD" size="lg" />
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Section 6: Order Status Stepper */}
        <section className="space-y-4">
          <h2 className="font-serif-display text-2xl text-[var(--soil)] border-b border-[var(--border-color)] pb-2">
            6. Status Stepper (`<StatusStepper />`)
          </h2>
          <Card padding="lg">
            <StatusStepper
              currentStepIndex={2}
              steps={[
                { id: "1", label: "Order Placed", description: "Payment Verified" },
                { id: "2", label: "Quality Inspection", description: "Grade A Certified" },
                { id: "3", label: "Sourcing & Transit", description: "En route to Silo" },
                { id: "4", label: "Stored in Warehouse", description: "Receipt Issued" },
              ]}
            />
          </Card>
        </section>

        {/* Section 7: Tabs & Feedback Toast */}
        <section className="space-y-4">
          <h2 className="font-serif-display text-2xl text-[var(--soil)] border-b border-[var(--border-color)] pb-2">
            7. Tabs, Toasts & Skeleton Loading States
          </h2>
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="toasts">Toast Notifications</TabsTrigger>
              <TabsTrigger value="skeletons">Skeleton Loaders</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <Card padding="md">
                <p className="text-sm text-[var(--soil-secondary)]">
                  Tabs component allows smooth switching between views while preserving light mode contrast.
                </p>
              </Card>
            </TabsContent>

            <TabsContent value="toasts">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Toast type="success" title="Commodity Purchased" message="50 MT of White Maize stored successfully." />
                <Toast type="warning" title="Silo Verification Pending" message="Quality inspection underway in Kano." />
              </div>
            </TabsContent>

            <TabsContent value="skeletons">
              <div className="space-y-3">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </TabsContent>
          </Tabs>
        </section>

        {/* Section 8: Empty State & Pagination */}
        <section className="space-y-4">
          <h2 className="font-serif-display text-2xl text-[var(--soil)] border-b border-[var(--border-color)] pb-2">
            8. Empty State & Pagination
          </h2>
          <EmptyState
            icon="📜"
            title="No Active Warehouse Receipts"
            description="You currently have no active commodity holdings in storage. Purchase commodities from the marketplace to get started."
            actionLabel="Explore Marketplace"
            onAction={() => alert("Navigating to marketplace...")}
          />

          <Pagination
            currentPage={currentPage}
            totalPages={5}
            onPageChange={setCurrentPage}
          />
        </section>
      </div>

      {/* Modal Primitive Sample Instance */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Confirm Commodity Receipt Purchase"
        description="Verify transaction details before committing payment to the warehouse escrow."
      >
        <div className="space-y-4 pt-2">
          <div className="p-3 bg-[var(--paper)] rounded-[10px] border border-[var(--border-color)] text-xs space-y-1 font-mono-plex">
            <div className="flex justify-between">
              <span>Commodity:</span>
              <span className="font-bold">White Maize (Sokoto)</span>
            </div>
            <div className="flex justify-between">
              <span>Quantity:</span>
              <span className="font-bold">{quantity} Metric Tons</span>
            </div>
            <div className="flex justify-between">
              <span>Total Price:</span>
              <span className="font-bold text-[var(--deep-grain-green)]">₦{ (quantity * 450000).toLocaleString('en-NG') }</span>
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => setIsModalOpen(false)}>
              Confirm & Pay
            </Button>
          </div>
        </div>
      </Modal>
    </AppShell>
  );
}
