// components/receipts/receipt-actions.tsx — Interactive action buttons for Receipt Detail page.
// Client Component handling navigation to My Storage and secure signed receipt download/print.
// Used in: app/receipts/[receiptId]/page.tsx

"use client";

import React, { useState } from "react";
import Link from "next/link";

export interface ReceiptActionsProps {
  /** Unique receipt UUID */
  receiptId: string;
  /** Holding ID to route directly to holding if needed */
  holdingId?: string;
  /** Receipt serial code for filename */
  receiptNumber: string;
}

export const ReceiptActions: React.FC<ReceiptActionsProps> = ({
  receiptId,
  receiptNumber,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Handle secure receipt download
  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      const res = await fetch(`/api/receipts/${receiptId}/download`);
      
      if (res.ok) {
        const data = await res.json();
        if (data.signedUrl) {
          // Trigger browser download via temporary link element
          const link = document.createElement("a");
          link.href = data.signedUrl;
          link.download = data.filename || `KorraStore-Receipt-${receiptNumber}.pdf`;
          link.target = "_blank";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          setDownloadSuccess(true);
          setTimeout(() => setDownloadSuccess(false), 4000);
          return;
        }
      }

      // Fallback: Trigger browser print dialog for the receipt
      window.print();
    } catch (err) {
      console.warn("[ReceiptActions] Download failed, triggering print fallback:", err);
      window.print();
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="w-full max-w-[640px] mx-auto pt-6 flex flex-col sm:flex-row gap-3">
      {/* 1. View in My Storage Link */}
      <Link
        href="/my-storage"
        className="flex-1 inline-flex items-center justify-center h-12 px-6 rounded-[12px] border-2 border-[#D8B56A] text-[#4A3828] bg-[#FFFFFF] hover:bg-[#F7F4EA] font-semibold text-sm transition-all shadow-soil-xs hover:border-[#A88958]"
      >
        <span className="mr-2 text-base">🌾</span>
        <span>View in My Storage</span>
      </Link>

      {/* 2. Download Official Receipt Button */}
      <button
        type="button"
        onClick={handleDownload}
        disabled={isDownloading}
        className="flex-1 inline-flex items-center justify-center h-12 px-6 rounded-[12px] bg-[#D8B56A] hover:bg-[#c9a456] text-[#4A3828] font-bold text-sm transition-all shadow-soil-xs hover:shadow-soil-sm disabled:opacity-60"
      >
        {isDownloading ? (
          <span className="flex items-center gap-2">
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4 text-[#4A3828]"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Generating Signed PDF...
          </span>
        ) : downloadSuccess ? (
          <span className="flex items-center gap-2 text-[#21483A]">
            <span>✓</span> Downloaded!
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <span>⬇</span> Download Receipt
          </span>
        )}
      </button>
    </div>
  );
};
