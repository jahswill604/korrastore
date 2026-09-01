// components/resale/my-listing-row.tsx — Individual Seller Listing Card / Row.
// Client Component ("use client") — renders a seller's resale listing with status badges, metrics,
// and action buttons triggering EditPriceModal and CancelListingDialog.
// Used in: app/resale/my-listings/page.tsx

'use client';

import * as React from 'react';
import { useState } from 'react';
import Image from 'next/image';
import { SellerResaleListing } from '@/lib/supabase/queries/resale';
import { EditPriceModal } from './edit-price-modal';
import { CancelListingDialog } from './cancel-listing-dialog';

// ----------------------------------------------------------------------------
// Props Interface
// ----------------------------------------------------------------------------

interface MyListingRowProps {
  listing: SellerResaleListing;
}

// ----------------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------------

function formatNaira(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateString: string): string {
  try {
    return new Intl.DateTimeFormat('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(dateString));
  } catch {
    return dateString;
  }
}

function getCommodityEmoji(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes('rice')) return '🌾';
  if (lower.includes('garlic')) return '🧄';
  if (lower.includes('bean') || lower.includes('soy')) return '🫘';
  if (lower.includes('melon') || lower.includes('egusi')) return '🍈';
  if (lower.includes('maize') || lower.includes('corn')) return '🌽';
  return '📦';
}

function getStatusBadge(status: SellerResaleListing['status']) {
  switch (status) {
    case 'active':
      return {
        label: 'Active',
        bg: '#E6F0EC',
        text: '#21483A',
        border: '#B8D4C5',
      };
    case 'sold':
      return {
        label: 'Sold',
        bg: '#E8ECF5',
        text: '#303B63',
        border: '#CAD4E8',
      };
    case 'cancelled':
      return {
        label: 'Cancelled',
        bg: '#F9EAE8',
        text: '#B3432E',
        border: '#E8C5BE',
      };
    case 'expired':
      return {
        label: 'Expired',
        bg: '#FDF6E2',
        text: '#C7862B',
        border: '#F0D68A',
      };
    default:
      return {
        label: status,
        bg: '#F5F0E8',
        text: '#6B5A48',
        border: '#D8CDB8',
      };
  }
}

// ----------------------------------------------------------------------------
// MyListingRow Component
// ----------------------------------------------------------------------------

export function MyListingRow({ listing }: MyListingRowProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

  const statusStyle = getStatusBadge(listing.status);
  const isActive = listing.status === 'active';

  return (
    <>
      <div className="bg-white border border-[#E4DCC8] rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md hover:border-[#D8B56A] transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Thumbnail + Commodity Info */}
        <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1 min-w-0">
          {/* Thumbnail */}
          <div
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex-shrink-0 overflow-hidden flex items-center justify-center text-2xl"
            style={{ backgroundColor: '#F5EFE0' }}
          >
            {listing.commodityImageUrl ? (
              <Image
                src={listing.commodityImageUrl}
                alt={listing.commodityName}
                width={64}
                height={64}
                className="object-cover w-full h-full"
              />
            ) : (
              <span>{getCommodityEmoji(listing.commodityName)}</span>
            )}
          </div>

          {/* Details */}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-serif-display text-base sm:text-lg font-bold text-[#4A3828] truncate">
                {listing.commodityName}
              </h3>
              <span className="px-2 py-0.5 bg-[#E6F0EC] text-[#21483A] border border-[#B8D4C5] rounded-full text-[11px] font-bold font-sans-inter">
                Grade {listing.gradeCode}
              </span>
              <span
                className="px-2 py-0.5 rounded-full text-[11px] font-bold font-sans-inter border"
                style={{
                  backgroundColor: statusStyle.bg,
                  color: statusStyle.text,
                  borderColor: statusStyle.border,
                }}
              >
                {statusStyle.label}
              </span>
            </div>

            <p className="text-xs font-sans-inter text-[#4A3828]/60 mt-1 flex flex-wrap items-center gap-x-2">
              <span>{listing.warehouseName}</span>
              <span>•</span>
              <span>Listed {formatDate(listing.createdAt)}</span>
              {listing.expiresAt && isActive && (
                <>
                  <span>•</span>
                  <span className="text-[#A88958] font-medium">
                    Expires {formatDate(listing.expiresAt)}
                  </span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Middle: Metrics & Pricing */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-3 sm:pt-0 border-[#E4DCC8]">
          <div className="text-left sm:text-right">
            <p className="text-[11px] font-sans-inter text-[#4A3828]/60">Quantity</p>
            <p className="font-mono-plex text-sm font-bold text-[#4A3828]">
              {listing.quantity.toLocaleString()} {listing.commodityUnit}
            </p>
          </div>

          <div className="text-right">
            <p className="text-[11px] font-sans-inter text-[#4A3828]/60">Asking Price</p>
            <p className="font-mono-plex text-sm sm:text-base font-bold text-[#21483A]">
              {formatNaira(listing.unitPrice)}
              <span className="text-xs font-normal text-[#4A3828]/60 ml-0.5">
                /{listing.commodityUnit}
              </span>
            </p>
            <p className="text-[11px] font-mono-plex text-[#4A3828]/50">
              Total: {formatNaira(listing.totalPrice)}
            </p>
          </div>
        </div>

        {/* Right: Actions for Active listings */}
        {isActive && (
          <div className="flex sm:flex-col gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E4DCC8]">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(true)}
              className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl text-xs font-semibold font-sans-inter border border-[#E4DCC8] bg-white text-[#4A3828] hover:bg-[#EFE9D9] hover:border-[#D8B56A] active:scale-95 transition-all text-center"
            >
              Edit Price
            </button>
            <button
              type="button"
              onClick={() => setIsCancelDialogOpen(true)}
              className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl text-xs font-semibold font-sans-inter border border-[#E8C5BE] bg-[#F9EAE8]/50 text-[#B3432E] hover:bg-[#F9EAE8] active:scale-95 transition-all text-center"
            >
              Cancel Listing
            </button>
          </div>
        )}
      </div>

      {/* Edit Price Modal */}
      {isActive && (
        <EditPriceModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          listing={{
            id: listing.id,
            commodityName: listing.commodityName,
            gradeCode: listing.gradeCode,
            quantity: listing.quantity,
            unitPrice: listing.unitPrice,
            commodityUnit: listing.commodityUnit,
          }}
        />
      )}

      {/* Cancel Confirmation Dialog */}
      {isActive && (
        <CancelListingDialog
          isOpen={isCancelDialogOpen}
          onClose={() => setIsCancelDialogOpen(false)}
          listing={{
            id: listing.id,
            commodityName: listing.commodityName,
            gradeCode: listing.gradeCode,
            quantity: listing.quantity,
            commodityUnit: listing.commodityUnit,
          }}
        />
      )}
    </>
  );
}
