// components/commodity/storage-info.tsx — Warehouse & Climate Storage Compliance Card.
// Renders static & verified warehouse storage standards (climate control, 24/7 insurance, instant resale eligibility).
// Used in: app/commodities/[commodityId]/page.tsx

import * as React from "react";

interface StorageInfoProps {
  storageInfo?: {
    warehouseName: string;
    location: string;
    temperature: string;
    humidity: string;
    insuranceStatus: string;
  };
}

export function StorageInfo({ storageInfo }: StorageInfoProps) {
  const info = storageInfo || {
    warehouseName: "Kano Central Grain Hub",
    location: "Kano State, Nigeria",
    temperature: "18°C Controlled",
    humidity: "12% Standard Moisture",
    insuranceStatus: "100% Comprehensive Coverage",
  };

  return (
    <div className="p-5 rounded-[20px] bg-[#F7F4EA] border border-[#E4DCC8] space-y-4">
      {/* Header section with icon */}
      <div className="flex items-center space-x-2.5">
        <div className="w-8 h-8 rounded-full bg-[#EBF5EE] text-[#21483A] flex items-center justify-center text-sm">
          🏭
        </div>
        <div>
          <h3 className="font-serif-display text-base font-bold text-[#4A3828]">
            Storage & Warehouse Conditions
          </h3>
          <p className="font-sans-inter text-xs text-[#6B5A48]">
            Stored in climate-controlled KorraStore partner facilities; request physical delivery anytime from My Storage.
          </p>
        </div>
      </div>

      {/* Grid of conditions */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        <div className="p-3 rounded-xl bg-white border border-[#E4DCC8] flex items-center space-x-3">
          <span className="text-lg">❄️</span>
          <div>
            <span className="block font-sans-inter text-[11px] text-[#6B5A48]">Climate Control</span>
            <span className="font-sans-inter text-xs font-bold text-[#4A3828]">{info.temperature}</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-white border border-[#E4DCC8] flex items-center space-x-3">
          <span className="text-lg">💧</span>
          <div>
            <span className="block font-sans-inter text-[11px] text-[#6B5A48]">Moisture Level</span>
            <span className="font-sans-inter text-xs font-bold text-[#4A3828]">{info.humidity}</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-white border border-[#E4DCC8] flex items-center space-x-3">
          <span className="text-lg">🛡️</span>
          <div>
            <span className="block font-sans-inter text-[11px] text-[#6B5A48]">Insurance</span>
            <span className="font-sans-inter text-xs font-bold text-[#21483A]">{info.insuranceStatus}</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-white border border-[#E4DCC8] flex items-center space-x-3">
          <span className="text-lg">⚡</span>
          <div>
            <span className="block font-sans-inter text-[11px] text-[#6B5A48]">Resale Eligible</span>
            <span className="font-sans-inter text-xs font-bold text-[#21483A]">Instant Resale Ready</span>
          </div>
        </div>
      </div>
    </div>
  );
}
