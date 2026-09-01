// lib/email/resend.ts — Resend Transactional Email Service for KorraStore.
// Integrates Resend SDK with KorraStore design-system-compliant HTML email templates.
// Used in: Email OTP verification, order confirmations, resale & buyback notifications, outbox worker.

import { Resend } from "resend";
import { generateOtpEmailHtml } from "@/lib/email/templates/otp-email-template";

// Initialize Resend client instance using server-only environment variable.
const resendApiKey = process.env.RESEND_API_KEY || "re_placeholder_key";
const resend = new Resend(resendApiKey);

// Interface for verification OTP email parameters.
export interface SendOtpEmailParams {
  to: string; // Recipient email address
  otpCode: string; // 6-digit numeric OTP code (e.g. "482915")
  name?: string; // Optional user recipient full name
}

// ----------------------------------------------------------------------------
// sendVerificationOtpEmail — sends 6-digit numeric OTP email via Resend.
// Uses onboarding@resend.dev (Resend verified testing domain) or custom domain.
// ----------------------------------------------------------------------------
export async function sendVerificationOtpEmail({
  to,
  otpCode,
  name,
}: SendOtpEmailParams): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    // Generate professional HTML email payload
    const htmlContent = generateOtpEmailHtml({
      otpCode,
      recipientEmail: to,
      recipientName: name || "Valued Customer",
      expiresInMinutes: 10,
    });

    // Send email via Resend SDK
    const { data, error } = await resend.emails.send({
      from: "KorraStore Verification <onboarding@resend.dev>",
      to,
      subject: `Your KorraStore Verification Code [${otpCode}]`,
      html: htmlContent,
    });

    if (error) {
      console.error("[sendVerificationOtpEmail] Resend API error:", error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to send email via Resend.";
    console.error("[sendVerificationOtpEmail] Unexpected error:", message);
    return { success: false, error: message };
  }
}
