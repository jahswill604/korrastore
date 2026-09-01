// components/admin/inventory/commodities-tab.tsx — Commodities & Grades Tab Component (Client Component).
// Renders the list of all commodities, their units, active statuses, grade counts, and edit triggers.
// Used in: app/admin/inventory/page.tsx (Commodities tab).

"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { AdminCommodity } from "@/lib/types/admin-inventory";
import { CommodityFormModal } from "./commodity-form-modal";

// ----------------------------------------------------------------------------
// Props
// ----------------------------------------------------------------------------

interface CommoditiesTabProps {
  commodities: AdminCommodity[];
}

// ----------------------------------------------------------------------------
// CommoditiesTab Component
// ----------------------------------------------------------------------------

export function CommoditiesTab({ commodities }: CommoditiesTabProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedCommodity, setSelectedCommodity] = React.useState<AdminCommodity | undefined>();
  const [togglingId, setTogglingId] = React.useState<string | null>(null);

  const handleOpenAdd = () => {
    setSelectedCommodity(undefined);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: AdminCommodity) => {
    setSelectedCommodity(c);
    setIsModalOpen(true);
  };

  const handleToggleActive = async (c: AdminCommodity) => {
    setTogglingId(c.id);
    try {
      await fetch(`/api/admin/inventory/commodities/${c.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !c.active }),
      });
      router.refresh();
    } catch (err) {
      console.error("Toggle error:", err);
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Tab Action Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-lg font-bold text-[#4A3828]">
            Commodity Catalog ({commodities.length})
          </h2>
          <p className="text-xs text-[#A88958]">
            Manage agricultural products, quality grades, and pricing standards.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-[#D8B56A] text-[#4A3828] hover:bg-[#D8B56A]/90 transition-colors shadow-sm"
        >
          <span>+</span>
          <span>Add Commodity</span>
        </button>
      </div>

      {commodities.length === 0 ? (
        <div className="p-12 bg-white rounded-2xl border border-[#E4DCC8] text-center space-y-3">
          <div className="text-4xl">🌾</div>
          <div className="font-serif text-base text-[#4A3828]">No commodities registered yet</div>
          <p className="text-xs text-[#A88958] max-w-sm mx-auto">
            Get started by registering your first agricultural commodity to enable inventory tracking.
          </p>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#D8B56A] text-[#4A3828]"
          >
            + Add First Commodity
          </button>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto rounded-xl border border-[#E4DCC8] bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F5EFE0] border-b border-[#E4DCC8]">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#A88958] uppercase tracking-wider">
                    Commodity
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#A88958] uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#A88958] uppercase tracking-wider">
                    Unit
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#A88958] uppercase tracking-wider">
                    Current Price
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#A88958] uppercase tracking-wider">
                    Grades
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#A88958] uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#A88958] uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {commodities.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-[#E4DCC8] hover:bg-[#F5EFE0]/60 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="font-serif text-[#4A3828] text-sm font-semibold">{c.name}</div>
                      {c.description && (
                        <div className="text-xs text-[#A88958] truncate max-w-xs">{c.description}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-[#6B5A48]">{c.code}</td>
                    <td className="px-4 py-3 text-xs text-[#4A3828] font-medium">{c.unit}</td>
                    <td className="px-4 py-3 font-mono text-xs font-bold text-[#21483A]">
                      ₦{c.current_price?.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-[#F5EFE0] text-[#4A3828] border border-[#E4DCC8]">
                        {c.grade_count} {c.grade_count === 1 ? "Grade" : "Grades"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(c)}
                        disabled={togglingId === c.id}
                        className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-colors ${
                          c.active
                            ? "bg-[#21483A]/10 text-[#21483A] border-[#21483A]/20"
                            : "bg-[#A88958]/10 text-[#A88958] border-[#A88958]/20 opacity-60"
                        }`}
                      >
                        {togglingId === c.id ? "Updating..." : c.active ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(c)}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg border border-[#E4DCC8] text-[#4A3828] bg-white hover:bg-[#F5EFE0] transition-colors shadow-2xs"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Stacked Cards */}
          <div className="lg:hidden space-y-3">
            {commodities.map((c) => (
              <div
                key={c.id}
                className="bg-white rounded-xl border border-[#E4DCC8] p-4 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-serif text-base font-bold text-[#4A3828]">{c.name}</div>
                    <div className="font-mono text-xs text-[#A88958]">{c.code} · Unit: {c.unit}</div>
                  </div>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-semibold rounded-md border ${
                      c.active
                        ? "bg-[#21483A]/10 text-[#21483A] border-[#21483A]/20"
                        : "bg-[#A88958]/10 text-[#A88958] border-[#A88958]/20"
                    }`}
                  >
                    {c.active ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-[#E4DCC8]/60">
                  <div>
                    <span className="text-[#A88958]">Price: </span>
                    <span className="font-mono font-bold text-[#21483A]">
                      ₦{c.current_price?.toLocaleString()}
                    </span>
                  </div>
                  <span className="text-[#A88958]">{c.grade_count} Grades</span>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleToggleActive(c)}
                    disabled={togglingId === c.id}
                    className="flex-1 py-2 text-xs font-semibold rounded-lg border border-[#E4DCC8] bg-[#F7F4EA] text-[#4A3828]"
                  >
                    {c.active ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(c)}
                    className="flex-1 py-2 text-xs font-semibold rounded-lg bg-[#D8B56A] text-[#4A3828]"
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Modal */}
      <CommodityFormModal
        commodity={selectedCommodity}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
