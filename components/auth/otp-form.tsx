// components/auth/otp-form.tsx — Phone OTP Verification Form for KorraStore.
// Displays phone verification state. Phone OTP verification is currently disabled,
// routing users to email-based authentication and verification links instead.
// Used in: app/verify-phone/page.tsx.

"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// ----------------------------------------------------------------------------
// OtpForm component definition.
// Displays notice that phone verification is disabled and offers email sign-in route.
// ----------------------------------------------------------------------------
export function OtpForm() {
  return (
    <div className="flex flex-col gap-5 text-center font-sans-inter">
      {/* Informational Banner */}
      <div
        role="status"
        className="p-4 bg-[#EBF5F0] border border-[#BCE1CE] rounded-[12px] text-xs font-medium text-[var(--deep-grain-green)] flex flex-col items-center gap-2"
      >
        <span className="text-2xl">✉️</span>
        <h3 className="font-serif-dm text-base font-bold text-[var(--soil)]">
          Email Verification Active
        </h3>
        <p className="text-xs text-[var(--soil-secondary)] leading-relaxed max-w-xs">
          Phone number verification is disabled for now. Account verification links are sent directly to your registered email address.
        </p>
      </div>

      {/* Return to Sign In CTA */}
      <Link href="/login" className="w-full">
        <Button variant="primary" size="lg" className="w-full font-semibold shadow-soil-sm">
          Proceed to Sign In →
        </Button>
      </Link>
    </div>
  );
}
