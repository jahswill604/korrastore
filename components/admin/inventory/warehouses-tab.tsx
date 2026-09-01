// components/admin/inventory/warehouses-tab.tsx — Warehouses Tab Component (Client Component).
// Renders the list of all storage locations, active status toggles, capacity stats, and edit triggers.
// Used in: app/admin/inventory/page.tsx (Warehouses tab).

"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { AdminWarehouse } from "@/lib/types/admin-inventory";
import { WarehouseFormModal } from "./warehouse-form-modal";

// ----------------------------------------------------------------------------
// Props
// ----------------------------------------------------------------------------

interface WarehousesTabProps {
  warehouses: AdminWarehouse[];
}

// ----------------------------------------------------------------------------
// WarehousesTab Component
// ----------------------------------------------------------------------------

export function WarehousesTab({ warehouses }: WarehousesTabProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = React.useState<AdminWarehouse | undefined>();
  const [togglingId, setTogglingId] = React.useState<string | null>(null);

  const handleOpenAdd = () => {
    setSelectedWarehouse(undefined);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (w: AdminWarehouse) => {
    setSelectedWarehouse(w);
    setIsModalOpen(true);
  };

  const handleToggleActive = async (w: AdminWarehouse) => {
    setTogglingId(w.id);
    try {
      await fetch(`/api/admin/inventory/warehouses/${w.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !w.active }),
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
      {/* Action Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-lg font-bold text-[#4A3828]">
            Warehouse Silos & Hubs ({warehouses.length})
          </h2>
          <p className="text-xs text-[#A88958]">
            Manage physical climate-controlled storage locations and regional holding hubs.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-[#D8B56A] text-[#4A3828] hover:bg-[#D8B56A]/90 transition-colors shadow-sm"
        >
          <span>+</span>
          <span>Add Warehouse</span>
        </button>
      </div>

      {warehouses.length === 0 ? (
        <div className="p-12 bg-white rounded-2xl border border-[#E4DCC8] text-center space-y-3">
          <div className="text-4xl">🏢</div>
          <div className="font-serif text-base text-[#4A3828]">No warehouses registered yet</div>
          <p className="text-xs text-[#A88958] max-w-sm mx-auto">
            Register your first physical warehouse or silo location to start tracking stock.
          </p>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#D8B56A] text-[#4A3828]"
          >
            + Add First Warehouse
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
                    Warehouse / Silo Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#A88958] uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#A88958] uppercase tracking-wider">
                    Location / Region
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#A88958] uppercase tracking-wider">
                    Address
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#A88958] uppercase tracking-wider">
                    Capacity
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
                {warehouses.map((w) => (
                  <tr
                    key={w.id}
                    className="border-b border-[#E4DCC8] hover:bg-[#F5EFE0]/60 transition-colors"
                  >
                    <td className="px-4 py-3 font-serif text-[#4A3828] text-sm font-semibold">
                      {w.name}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-[#6B5A48]">{w.code}</td>
                    <td className="px-4 py-3 text-xs text-[#4A3828] font-medium">{w.location}</td>
                    <td className="px-4 py-3 text-xs text-[#A88958] max-w-xs truncate">
                      {w.address || "—"}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-[#4A3828]">
                      {w.capacity ? `${w.capacity.toLocaleString()} kg` : "Uncapped"}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(w)}
                        disabled={togglingId === w.id}
                        className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-colors ${
                          w.active
                            ? "bg-[#21483A]/10 text-[#21483A] border-[#21483A]/20"
                            : "bg-[#A88958]/10 text-[#A88958] border-[#A88958]/20 opacity-60"
                        }`}
                      >
                        {togglingId === w.id ? "Updating..." : w.active ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(w)}
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
            {warehouses.map((w) => (
              <div
                key={w.id}
                className="bg-white rounded-xl border border-[#E4DCC8] p-4 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-serif text-base font-bold text-[#4A3828]">{w.name}</div>
                    <div className="font-mono text-xs text-[#A88958]">{w.code} · {w.location}</div>
                  </div>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-semibold rounded-md border ${
                      w.active
                        ? "bg-[#21483A]/10 text-[#21483A] border-[#21483A]/20"
                        : "bg-[#A88958]/10 text-[#A88958] border-[#A88958]/20"
                    }`}
                  >
                    {w.active ? "Active" : "Inactive"}
                  </span>
                </div>

                {w.address && (
                  <div className="text-xs text-[#6B5A48] bg-[#F5EFE0] p-2 rounded-lg">
                    {w.address}
                  </div>
                )}

                <div className="flex items-center justify-between text-xs pt-2 border-t border-[#E4DCC8]/60">
                  <span className="text-[#A88958]">Capacity:</span>
                  <span className="font-mono font-bold text-[#4A3828]">
                    {w.capacity ? `${w.capacity.toLocaleString()} kg` : "Uncapped"}
                  </span>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleToggleActive(w)}
                    disabled={togglingId === w.id}
                    className="flex-1 py-2 text-xs font-semibold rounded-lg border border-[#E4DCC8] bg-[#F7F4EA] text-[#4A3828]"
                  >
                    {w.active ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(w)}
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
      <WarehouseFormModal
        warehouse={selectedWarehouse}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
