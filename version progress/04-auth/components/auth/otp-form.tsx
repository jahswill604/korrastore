// components/auth/otp-form.tsx — Client-Side Phone OTP Verification Form for KorraStore.
// Renders 6-digit verification code inputs with countdown resend timer and error handling.
// Used in: app/verify-phone/page.tsx.

"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

// OtpForm component definition
export function OtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams.get("phone") || "+2348000000000";

  // 6 digit code state
  const [digits, setDigits] = React.useState<string[]>(["", "", "", "", "", ""]);
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  // State management
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(
    `Verification code sent to ${phone}`
  );
  const [resendTimer, setResendTimer] = React.useState(59);

  // Countdown timer effect
  React.useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Focus the first input on mount
  React.useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Handle single digit changes and auto-focus
  const handleChange = (index: number, value: string) => {
    // Keep only the last character entered
    const cleanChar = value.replace(/\D/g, "").slice(-1);

    const nextDigits = [...digits];
    nextDigits[index] = cleanChar;
    setDigits(nextDigits);
    setErrorMessage(null);

    // Auto-advance focus to next input
    if (cleanChar && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace navigation
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste of 6-digit code
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pastedData.length > 0) {
      const nextDigits = [...digits];
      for (let i = 0; i < 6; i++) {
        nextDigits[i] = pastedData[i] || "";
      }
      setDigits(nextDigits);
      const nextFocus = Math.min(pastedData.length, 5);
      inputRefs.current[nextFocus]?.focus();
    }
  };

  // Resend OTP code handler
  const handleResend = async () => {
    if (resendTimer > 0) return;
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resend({
        type: "sms",
        phone,
      });

      if (error) {
        setErrorMessage(error.message);
      } else {
        setSuccessMessage(`New code sent to ${phone}`);
        setResendTimer(59);
      }
    } catch {
      setErrorMessage("Failed to resend code. Please try again.");
    }
  };

  // Submit OTP handler
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const token = digits.join("");

    if (token.length < 6) {
      setErrorMessage("Please enter the full 6-digit verification code.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const supabase = createClient();

      // Verify OTP with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.verifyOtp({
        phone,
        token,
        type: "sms",
      });

      if (authError || !authData.user) {
        setErrorMessage(authError?.message || "Invalid or expired code. Please try again.");
        setIsLoading(false);
        return;
      }

      // Check profile role
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", authData.user.id)
        .single();

      if (profile?.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/home");
      }
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Verification failed. Please try again.";
      setErrorMessage(message);
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Informational or error banner */}
      {errorMessage && (
        <div
          role="alert"
          className="p-3.5 bg-[#FDF2F0] border border-[#F5C2BA] rounded-[10px] text-xs font-medium text-[var(--danger)] font-sans-inter flex items-start gap-2.5"
        >
          <svg
            className="w-4 h-4 shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="12" r="10" strokeWidth="2" />
            <path strokeWidth="2" strokeLinecap="round" d="M12 8v4m0 4h.01" />
          </svg>
          <span className="leading-relaxed">{errorMessage}</span>
        </div>
      )}

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

      {/* 6 Digit Input Group */}
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
            className="w-12 h-14 sm:w-13 sm:h-15 text-center font-mono-numbers text-xl font-bold text-[var(--soil)] bg-[#FFFFFF] border-2 border-[var(--border-color)] rounded-[12px] focus:outline-none focus:ring-2 focus:ring-[var(--harvest-wheat)] focus:border-[var(--harvest-wheat)] disabled:bg-[#F2EFE9] transition-all"
            aria-label={`Digit ${idx + 1}`}
          />
        ))}
      </div>

      {/* Verify Submit Button */}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        isLoading={isLoading}
        className="w-full mt-2 font-semibold shadow-soil-sm"
      >
        Verify Phone & Enter KorraStore
      </Button>

      {/* Resend Code Action */}
      <div className="flex items-center justify-between text-xs font-sans-inter text-[#7A6A58] pt-2">
        <span>Didn&apos;t receive the code?</span>
        {resendTimer > 0 ? (
          <span className="font-mono-numbers font-medium text-[var(--husk)]">
            Resend in {resendTimer}s
          </span>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            className="font-semibold text-[var(--trust-indigo)] hover:underline focus:outline-none cursor-pointer"
          >
            Resend Code
          </button>
        )}
      </div>
    </form>
  );
}
