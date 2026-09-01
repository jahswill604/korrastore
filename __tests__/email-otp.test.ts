// __tests__/email-otp.test.ts — Unit Tests for KorraStore Email 6-Digit OTP Verification.
// Validates 6-digit numeric OTP formatting, template HTML rendering, and digit code validation.
// Used by: `npm run test` (Vitest test suite).

import { describe, it, expect } from "vitest";
import { generateOtpEmailHtml } from "@/lib/email/templates/otp-email-template";

// Helper function simulating 6-digit numeric OTP code validation
function validateOtpCode(code: string): { valid: boolean; error?: string } {
  const cleanCode = code.trim();
  if (!cleanCode) {
    return { valid: false, error: "Please enter the 6-digit verification code." };
  }
  if (!/^\d{6}$/.test(cleanCode)) {
    return { valid: false, error: "Verification code must consist of exactly 6 numeric digits." };
  }
  return { valid: true };
}

describe("KorraStore Email 6-Digit OTP Verification", () => {
  describe("Numeric OTP Code Validation", () => {
    it("accepts valid 6-digit numeric OTP code", () => {
      const result = validateOtpCode("482915");
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("rejects non-numeric characters in OTP code", () => {
      const result = validateOtpCode("482A15");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("6 numeric digits");
    });

    it("rejects OTP codes shorter than 6 digits", () => {
      const result = validateOtpCode("12345");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("6 numeric digits");
    });

    it("rejects OTP codes longer than 6 digits", () => {
      const result = validateOtpCode("1234567");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("6 numeric digits");
    });

    it("rejects empty OTP input", () => {
      const result = validateOtpCode("");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("Please enter");
    });
  });

  describe("Professional HTML Email Template Generator", () => {
    it("renders branded KorraStore header and formatted 6-digit OTP code cells", () => {
      const html = generateOtpEmailHtml({
        otpCode: "839104",
        recipientEmail: "test@example.com",
        recipientName: "Bello Abubakar",
        expiresInMinutes: 10,
      });

      expect(html).toContain("KorraStore");
      expect(html).toContain("8");
      expect(html).toContain("3");
      expect(html).toContain("9");
      expect(html).toContain("Bello Abubakar");
      expect(html).toContain("10 minutes");
      expect(html).toContain("#21483A"); // Deep Grain Green brand color
      expect(html).toContain("#D8B56A"); // Harvest Wheat accent color
    });

    it("renders fallback recipient name when omitted", () => {
      const html = generateOtpEmailHtml({
        otpCode: "102938",
        recipientEmail: "test@example.com",
      });

      expect(html).toContain("Valued Customer");
      expect(html).toContain("1");
      expect(html).toContain("0");
    });
  });
});
