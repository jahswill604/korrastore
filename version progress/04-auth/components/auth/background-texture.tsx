// components/auth/background-texture.tsx — Ledger Paper Background container for KorraStore.
// Renders full-viewport subtle grain/texture container for authentication flows.
// Used in: app/login/page.tsx, app/signup/page.tsx, app/verify-phone/page.tsx.

import * as React from "react";
import { cn } from "@/lib/utils";

// Interface for BackgroundTexture props
export interface BackgroundTextureProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

// BackgroundTexture component rendering the warm Paper backdrop and subtle ledger lattice effect.
export function BackgroundTexture({ children, className, ...props }: BackgroundTextureProps) {
  return (
    <div
      className={cn(
        "min-h-screen w-full bg-[var(--paper)] text-[var(--soil)] flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 relative overflow-x-hidden",
        className
      )}
      {...props}
    >
      {/* Decorative subtle vintage ledger lines in background (pure CSS) */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40 select-none"
        style={{
          backgroundImage:
            "radial-gradient(#D8B56A 0.75px, transparent 0.75px), radial-gradient(#A88958 0.75px, #F7F4EA 0.75px)",
          backgroundSize: "30px 30px",
          backgroundPosition: "0 0, 15px 15px",
        }}
        aria-hidden="true"
      />

      {/* Subtle warm glow around center */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#EEDEB8]/30 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      {/* Main Content Container */}
      <div className="relative z-10 w-full max-w-[440px] flex flex-col items-center">
        {children}
      </div>
    </div>
  );
}
