// components/ui/pagination.tsx — Page Pagination Navigation component for KorraStore.
// Renders page numbers and previous/next page navigation controls for large data tables and lists.
// Used in: marketplace commodity catalog, order history table, admin transaction ledger.

import * as React from "react";
import { cn } from "@/lib/utils";

// Interface for Pagination props.
export interface PaginationProps extends React.HTMLAttributes<HTMLDivElement> {
  // Current active page number (1-indexed)
  currentPage: number;
  // Total total number of pages available
  totalPages: number;
  // Page change callback function
  onPageChange: (page: number) => void;
}

// Pagination component definition.
export const Pagination: React.FC<PaginationProps> = ({
  className,
  currentPage,
  totalPages,
  onPageChange,
  ...props
}) => {
  const isFirst = currentPage <= 1;
  const isLast = currentPage >= totalPages;

  return (
    <div
      className={cn(
        "flex items-center justify-between font-sans-inter text-xs py-3 border-t border-[var(--border-color)] text-[var(--soil)]",
        className
      )}
      {...props}
    >
      <div className="text-[var(--soil-secondary)] font-medium">
        Page <span className="font-mono-plex font-bold text-[var(--soil)]">{currentPage}</span> of{" "}
        <span className="font-mono-plex font-bold text-[var(--soil)]">{totalPages}</span>
      </div>

      <div className="flex items-center space-x-2">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={isFirst}
          className="px-3 py-1.5 rounded-[8px] bg-[var(--paper)] border border-[var(--border-color)] font-semibold text-[var(--soil)] hover:bg-[#eae4d5] transition-colors disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
        >
          ← Previous
        </button>

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={isLast}
          className="px-3 py-1.5 rounded-[8px] bg-[var(--paper)] border border-[var(--border-color)] font-semibold text-[var(--soil)] hover:bg-[#eae4d5] transition-colors disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
        >
          Next →
        </button>
      </div>
    </div>
  );
};
