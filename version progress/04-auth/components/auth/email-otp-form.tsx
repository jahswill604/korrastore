// components/auth/email-otp-form.tsx — Client-Side Email OTP Verification Form for KorraStore.
// Renders strictly 6-digit numeric verification code inputs with auto-advance, paste support,
// 60-second resend countdown timer, and server-side custom OTP verification via /api/auth/verify-otp.
// Used in: app/verify-email/page.tsx.

"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

// ----------------------------------------------------------------------------
// EmailOtpForm component definition — strictly 6-digit numeric OTP input.
// ----------------------------------------------------------------------------
export function EmailOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const emailParam = searchParams.get("email") || "";
  const [email, setEmail] = React.useState(emailParam);

  // Strictly 6 digit code input array state
  const [digits, setDigits] = React.useState<string[]>(["", "", "", "", "", ""]);
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  // Status & error state
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(
    emailParam ? `6-digit verification code sent to ${emailParam}` : null
  );
  const [resendTimer, setResendTimer] = React.useState(59);

  // Countdown timer effect for code resend
  React.useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Auto-focus the first digit input on mount
  React.useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Handle single digit input changes and focus management
  const handleChange = (index: number, value: string) => {
    const cleanChar = value.replace(/\D/g, "").slice(-1);
    const nextDigits = [...digits];
    nextDigits[index] = cleanChar;
    setDigits(nextDigits);
    setErrorMessage(null);

    // Auto-advance focus to next input field
    if (cleanChar && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace key press for navigation
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste of strictly 6-digit code from clipboard
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pastedData.length > 0) {
      const nextDigits = ["", "", "", "", "", ""];
      for (let i = 0; i < Math.min(pastedData.length, 6); i++) {
        nextDigits[i] = pastedData[i] || "";
      }
      setDigits(nextDigits);
      const nextFocus = Math.min(pastedData.length, 5);
      inputRefs.current[nextFocus]?.focus();
    }
  };

  // ── Resend: calls /api/auth/send-otp (guarantees strictly 6-digit numeric code) ──
  const handleResend = async () => {
    if (resendTimer > 0) return;
    if (!email) {
      setErrorMessage("Please enter your email address to receive a code.");
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (data.success) {
        setSuccessMessage(`New 6-digit code sent to ${email}. Check your inbox.`);
        setResendTimer(59);
      } else {
        const isRateLimit = data.error?.toLowerCase().includes("rate limit");
        setErrorMessage(
          isRateLimit
            ? "Too many requests. Please wait a few minutes before trying again."
            : data.error || "Failed to resend verification code. Please try again."
        );
      }
    } catch {
      setErrorMessage("Failed to resend verification code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // ── Verify: validates strictly 6-digit code with /api/auth/verify-otp ──────
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const code = digits.join("");

    if (!email.trim()) {
      setErrorMessage("Please enter your email address.");
      return;
    }

    if (code.length < 6) {
      setErrorMessage("Please enter the full 6-digit numeric verification code.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), code }),
      });

      const result = await res.json();

      if (!result.success) {
        setErrorMessage(result.error || "Verification failed. Please try again.");
        setIsLoading(false);
        return;
      }

      router.push(result.redirect ?? "/home");
      router.refresh();

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Verification failed. Please try again.";
      setErrorMessage(message);
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Error Alert Banner */}
      {errorMessage && (
        <div
          role="alert"
          className="p-3.5 bg-[#FDF2F0] border border-[#F5C2BA] rounded-[10px] text-xs font-medium text-[var(--danger)] font-sans-inter flex items-start gap-2.5"
        >
          <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" strokeWidth="2" />
            <path strokeWidth="2" strokeLinecap="round" d="M12 8v4m0 4h.01" />
          </svg>
          <span className="leading-relaxed">{errorMessage}</span>
        </div>
      )}

      {/* Success Status Banner */}
      {successMessage && !errorMessage && (
        <div
          role="status"
          className="p-3 bg-[#EBF5F0] border border-[#BCE1CE] rounded-[10px] text-xs font-medium text-[var(--deep-grain-green)] font-sans-inter flex items-start gap-2"
        >
          <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{successMessage}</span>
        </div>
      )}

      {/* Email Address Input (if not passed in searchParams) */}
      {!emailParam && (
        <div className="flex flex-col gap-1">
          <label htmlFor="otp-email" className="text-xs font-semibold text-[var(--soil)]">
            Email Address
          </label>
          <input
            id="otp-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            disabled={isLoading}
            className="w-full px-3.5 py-2.5 text-sm rounded-lg bg-white border border-[var(--border-color)] text-[var(--soil)] focus:outline-none focus:ring-2 focus:ring-[var(--harvest-wheat)]"
            required
          />
        </div>
      )}

      {/* Strictly 6 Digit Numeric Code Input Group */}
      <div className="flex items-center justify-between gap-2 sm:gap-3 my-2" onPaste={handlePaste}>
        {digits.map((digit, idx) => (
          <input
            key={idx}
            ref={(el) => {
              inputRefs.current[idx] = el;
            }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(idx, e.target.value)}
            onKeyDown={(e) => handleKeyDown(idx, e)}
            disabled={isLoading}
            className="w-12 h-14 sm:w-13 sm:h-15 text-center font-mono-numbers text-2xl font-bold text-[var(--soil)] bg-[#FFFFFF] border-2 border-[var(--border-color)] rounded-[12px] focus:outline-none focus:ring-2 focus:ring-[var(--harvest-wheat)] focus:border-[var(--harvest-wheat)] disabled:bg-[#F2EFE9] transition-all shadow-soil-sm"
            aria-label={`Digit ${idx + 1}`}
          />
        ))}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        isLoading={isLoading}
        className="w-full mt-2 font-semibold shadow-soil-sm"
      >
        Verify Email & Sign In →
      </Button>

      {/* Resend Code Control */}
      <div className="flex items-center justify-between text-xs font-sans-inter text-[#7A6A58] pt-2">
        <span>Didn&apos;t receive the 6-digit code?</span>
        {resendTimer > 0 ? (
          <span className="font-mono-numbers font-medium text-[var(--husk)]">
            Resend in {resendTimer}s
          </span>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            disabled={isLoading}
            className="font-semibold text-[var(--trust-indigo)] hover:underline focus:outline-none cursor-pointer"
          >
            Resend Code
          </button>
        )}
      </div>
    </form>
  );
}
