// components/admin/inventory/inventory-tab.tsx — Inventory Balances Tab Server Component for KorraStore.
// Renders the dense desktop table and mobile stacked cards showing per-commodity/grade/warehouse
// inventory lines with physical, reserved, and available quantities + action triggers.
// Used in: app/admin/inventory/page.tsx (Inventory Balances tab).

import * as React from 'react';
import type { AdminInventoryLine, AdminCommodity, AdminWarehouse } from '@/lib/types/admin-inventory';
import { AdjustInventoryModal } from './adjust-inventory-modal';
import { MovementHistoryModal } from './movement-history-modal';

// ----------------------------------------------------------------------------
// Props
// ----------------------------------------------------------------------------

interface InventoryTabProps {
  lines: AdminInventoryLine[];
  commodities: AdminCommodity[];
  warehouses: AdminWarehouse[];
}

// ----------------------------------------------------------------------------
// Helper: Grade badge colours
// ----------------------------------------------------------------------------

function GradeBadge({ code, name }: { code: string; name: string }) {
  const isPremium = name.toLowerCase().includes('premium') || code === 'A';
  const isStandard = name.toLowerCase().includes('standard') || code === 'B';

  const cls = isPremium
    ? 'bg-[#21483A]/10 text-[#21483A] border border-[#21483A]/20'
    : isStandard
    ? 'bg-[#303B63]/10 text-[#303B63] border border-[#303B63]/20'
    : 'bg-[#A88958]/10 text-[#A88958] border border-[#A88958]/20';

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${cls}`}>
      {name}
    </span>
  );
}

// ----------------------------------------------------------------------------
// Helper: Quantity display with colour signalling
// ----------------------------------------------------------------------------

function QuantityCell({ value, unit, danger = false }: { value: number; unit: string; danger?: boolean }) {
  return (
    <span className={`font-mono text-sm tabular-nums ${danger && value === 0 ? 'text-[#B3432E] font-semibold' : value > 0 ? 'text-[#21483A]' : 'text-[#4A3828]'}`}>
      {value.toLocaleString()} {unit}
    </span>
  );
}

// ----------------------------------------------------------------------------
// Desktop Table Row
// ----------------------------------------------------------------------------

function InventoryTableRow({ line }: { line: AdminInventoryLine }) {
  return (
    <tr className="border-b border-[#E4DCC8] hover:bg-[#F5EFE0]/60 transition-colors">
      {/* Commodity + Grade */}
      <td className="px-4 py-3">
        <div className="font-serif text-[#4A3828] text-sm font-medium">{line.commodity_name}</div>
        <div className="mt-1">
          <GradeBadge code={line.grade_code} name={line.grade_name} />
        </div>
      </td>

      {/* Warehouse */}
      <td className="px-4 py-3 text-sm text-[#4A3828]">
        <div className="font-medium">{line.warehouse_name}</div>
        <div className="text-xs text-[#A88958]">{line.warehouse_location}</div>
      </td>

      {/* Physical Stock */}
      <td className="px-4 py-3">
        <QuantityCell value={line.quantity} unit={line.commodity_unit} />
      </td>

      {/* Reserved */}
      <td className="px-4 py-3">
        {line.reserved_quantity > 0 ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#C7862B]/10 text-[#C7862B] text-xs font-semibold border border-[#C7862B]/20">
            {line.reserved_quantity.toLocaleString()} {line.commodity_unit}
          </span>
        ) : (
          <span className="text-[#A88958] text-xs">—</span>
        )}
      </td>

      {/* Available */}
      <td className="px-4 py-3">
        <QuantityCell value={line.available_quantity} unit={line.commodity_unit} danger />
      </td>

      {/* Actions */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          {/* AdjustInventoryModal is a client component — rendered inline */}
          <AdjustInventoryModal line={line} />
          <MovementHistoryModal inventoryId={line.id} label={`${line.commodity_name} / ${line.grade_name}`} />
        </div>
      </td>
    </tr>
  );
}

// ----------------------------------------------------------------------------
// Mobile Stacked Card
// ----------------------------------------------------------------------------

function InventoryMobileCard({ line }: { line: AdminInventoryLine }) {
  return (
    <div className="bg-white rounded-xl border border-[#E4DCC8] p-4 space-y-3">
      {/* Header: commodity name + grade badge */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="font-serif text-[#4A3828] text-base font-semibold">{line.commodity_name}</div>
          <div className="text-xs text-[#A88958] mt-0.5">{line.warehouse_name} · {line.warehouse_location}</div>
        </div>
        <GradeBadge code={line.grade_code} name={line.grade_name} />
      </div>

      {/* Stock figures */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-[#F5EFE0] rounded-lg p-2">
          <div className="text-[10px] text-[#A88958] uppercase font-semibold tracking-wider mb-1">Physical</div>
          <div className="font-mono text-sm font-bold text-[#4A3828]">{line.quantity.toLocaleString()}</div>
          <div className="text-[10px] text-[#A88958]">{line.commodity_unit}</div>
        </div>
        <div className="bg-[#C7862B]/5 rounded-lg p-2">
          <div className="text-[10px] text-[#A88958] uppercase font-semibold tracking-wider mb-1">Reserved</div>
          <div className="font-mono text-sm font-bold text-[#C7862B]">{line.reserved_quantity.toLocaleString()}</div>
          <div className="text-[10px] text-[#A88958]">{line.commodity_unit}</div>
        </div>
        <div className={`${line.available_quantity === 0 ? 'bg-[#B3432E]/5' : 'bg-[#21483A]/5'} rounded-lg p-2`}>
          <div className="text-[10px] text-[#A88958] uppercase font-semibold tracking-wider mb-1">Available</div>
          <div className={`font-mono text-sm font-bold ${line.available_quantity === 0 ? 'text-[#B3432E]' : 'text-[#21483A]'}`}>
            {line.available_quantity.toLocaleString()}
          </div>
          <div className="text-[10px] text-[#A88958]">{line.commodity_unit}</div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <AdjustInventoryModal line={line} compact />
        <MovementHistoryModal inventoryId={line.id} label={`${line.commodity_name} / ${line.grade_name}`} compact />
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// InventoryTab — Main Export
// ----------------------------------------------------------------------------

export function InventoryTab({ lines, commodities, warehouses }: InventoryTabProps) {
  if (lines.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="text-5xl mb-4">📦</div>
        <div className="font-serif text-xl text-[#4A3828] mb-2">No inventory lines yet</div>
        <p className="text-sm text-[#A88958] max-w-sm">
          Add commodities and warehouses first, then stock levels will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto rounded-xl border border-[#E4DCC8] bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#F5EFE0] border-b border-[#E4DCC8]">
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#A88958] uppercase tracking-wider">
                Commodity / Grade
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#A88958] uppercase tracking-wider">
                Warehouse Silo
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#A88958] uppercase tracking-wider">
                Physical Stock
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#A88958] uppercase tracking-wider">
                Reserved
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#A88958] uppercase tracking-wider">
                Available
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#A88958] uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {lines.map((line) => (
              <InventoryTableRow key={line.id} line={line} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card Stack */}
      <div className="lg:hidden space-y-3">
        {lines.map((line) => (
          <InventoryMobileCard key={line.id} line={line} />
        ))}
      </div>
    </div>
  );
}
