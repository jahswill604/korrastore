// app/verify-email/page.tsx — Email OTP Code Verification Page for KorraStore.
// Renders the 6-digit numeric verification code entry interface for email authentication.
// Used in: Public auth route /verify-email.

import * as React from "react";
import { Metadata } from "next";
import { BackgroundTexture } from "@/components/auth/background-texture";
import { AuthCard } from "@/components/auth/auth-card";
import { EmailOtpForm } from "@/components/auth/email-otp-form";

// Page SEO Metadata
export const metadata: Metadata = {
  title: "Verify Email Code — KorraStore",
  description: "Enter your 6-digit email verification code to access KorraStore digital commodity warehouse receipts.",
};

// ----------------------------------------------------------------------------
// VerifyEmailPage — Server Component rendering Email OTP verification view.
// ----------------------------------------------------------------------------
export default function VerifyEmailPage() {
  return (
    <BackgroundTexture>
      <AuthCard
        title="Verify your email"
        subtitle="Enter the 6-digit numeric code sent to your registered email address."
        activeTab="verify"
      >
        <React.Suspense fallback={<div className="h-48 flex items-center justify-center text-xs text-[#7A6A58]">Loading...</div>}>
          <EmailOtpForm />
        </React.Suspense>
      </AuthCard>
    </BackgroundTexture>
  );
}
