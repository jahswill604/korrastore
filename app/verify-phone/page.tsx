// app/verify-phone/page.tsx — Phone OTP Verification Page for KorraStore.
// Renders the phone verification card with 6-digit code inputs.
// Used in: Public auth route /verify-phone.

import * as React from "react";
import { Metadata } from "next";
import { BackgroundTexture } from "@/components/auth/background-texture";
import { AuthCard } from "@/components/auth/auth-card";
import { OtpForm } from "@/components/auth/otp-form";

// Page metadata
export const metadata: Metadata = {
  title: "Verify Phone Number — KorraStore",
  description: "Verify your phone number with KorraStore to secure your physical commodity storage receipts.",
};

// Server Component for Phone Verification Page
export default function VerifyPhonePage() {
  return (
    <BackgroundTexture>
      <AuthCard
        title="Verify your phone"
        subtitle="Enter the 6-digit verification code sent to your mobile device."
        activeTab="verify"
      >
        <React.Suspense fallback={<div className="h-48 flex items-center justify-center text-xs text-[#7A6A58]">Loading...</div>}>
          <OtpForm />
        </React.Suspense>
      </AuthCard>
    </BackgroundTexture>
  );
}
