// components/ui/modal.tsx — Accessible Dialog Modal component for KorraStore.
// Client interactive overlay dialog component with backdrop backdrop blur, title, close trigger, and footer actions.
// Used in: checkout confirmation, digital receipt detail view, resale submission form.

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// Interface for Modal props.
export interface ModalProps {
  // Boolean controlling modal visibility state
  isOpen: boolean;
  // Callback fired on modal request close
  onClose: () => void;
  // Title headline string
  title?: string;
  // Description caption string
  description?: string;
  // Children node content
  children: React.ReactNode;
  // Optional custom width className
  className?: string;
}

// Modal component definition.
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
}) => {
  // Handle escape key press
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Darkened Warm Backdrop */}
      <div
        className="fixed inset-0 bg-[var(--soil)]/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Box Surface */}
      <div
        className={cn(
          "relative bg-[#FFFFFF] border-2 border-[var(--harvest-wheat)] rounded-[16px] shadow-soil-lg w-full max-w-lg p-6 overflow-hidden z-10 font-sans-inter text-[var(--soil)] animate-in zoom-in-95 duration-150",
          className
        )}
      >
        {/* Close Button Cross */}
        <button
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-4 right-4 text-[var(--soil-tertiary)] hover:text-[var(--soil)] hover:bg-[var(--paper)] w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer"
        >
          ✕
        </button>

        {/* Title & Header Description */}
        {(title || description) && (
          <div className="mb-4 pr-8">
            {title && <h2 className="text-xl font-bold font-serif-display text-[var(--soil)]">{title}</h2>}
            {description && (
              <p className="text-xs text-[var(--soil-secondary)] mt-1">{description}</p>
            )}
          </div>
        )}

        {/* Modal Body Content */}
        <div>{children}</div>
      </div>
    </div>
  );
};
