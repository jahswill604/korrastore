// components/ui/toast.tsx — Notification Toast banner component for KorraStore.
// Client component rendering feedback toast messages (success, error, warning, info) with design tokens.
// Used in: transaction notifications, form submit feedback, error alerts.

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// Interface for Toast item properties.
export interface ToastProps {
  id?: string;
  type?: "success" | "error" | "warning" | "info";
  title: string;
  message?: string;
  onDismiss?: () => void;
  className?: string;
}

// Toast notification component definition.
export const Toast: React.FC<ToastProps> = ({
  type = "success",
  title,
  message,
  onDismiss,
  className,
}) => {
  const typeStyles = {
    success: "bg-[var(--deep-grain-green)] text-[#FFFFFF] border-[var(--deep-grain-green)]",
    error: "bg-[var(--danger)] text-[#FFFFFF] border-[var(--danger)]",
    warning: "bg-[var(--warning)] text-[#FFFFFF] border-[var(--warning)]",
    info: "bg-[var(--trust-indigo)] text-[#FFFFFF] border-[var(--trust-indigo)]",
  };

  const icons = {
    success: "✅",
    error: "⚠️",
    warning: "🔔",
    info: "ℹ️",
  };

  return (
    <div
      className={cn(
        "flex items-start p-4 rounded-[12px] shadow-soil-md border text-sm font-sans-inter max-w-sm w-full gap-3",
        typeStyles[type],
        className
      )}
    >
      <span className="text-base shrink-0">{icons[type]}</span>
      <div className="flex-1">
        <h4 className="font-bold leading-tight">{title}</h4>
        {message && <p className="text-xs opacity-90 mt-1">{message}</p>}
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-current opacity-70 hover:opacity-100 text-xs font-bold px-1 cursor-pointer"
        >
          ✕
        </button>
      )}
    </div>
  );
};
