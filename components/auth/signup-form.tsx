// components/auth/signup-form.tsx — Client-Side Sign-Up Form for KorraStore.
// Captures user email, Nigerian phone number (+234), and password to register a new buyer account.
// Used in: app/signup/page.tsx.

"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// SignupForm component definition
export function SignupForm() {
  const router = useRouter();

  // Form input state
  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);

  // Status & error state
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (!fullName.trim()) {
      setErrorMessage("Please enter your full name.");
      return;
    }
    if (!email.trim()) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }
    if (!phone.trim() || phone.trim().length < 10) {
      setErrorMessage("Please enter a valid Nigerian phone number.");
      return;
    }
    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters in length.");
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();

      // Format Nigerian phone with +234
      const cleanPhone = phone.trim().replace(/^0+/, "");
      const formattedPhone = cleanPhone.startsWith("+") ? cleanPhone : `+234${cleanPhone}`;

      // ── Single Email Signup ───────────────────────────────────────────────
      // Calls supabase.auth.signUp() and checks if email is already registered.
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            phone: formattedPhone,
          },
        },
      });

      if (signUpError) {
        const isAlreadyRegistered =
          signUpError.message.toLowerCase().includes("already registered") ||
          signUpError.message.toLowerCase().includes("already exists") ||
          signUpError.message.toLowerCase().includes("user_already_exists");
        const isRateLimit = signUpError.message.toLowerCase().includes("rate limit");

        setErrorMessage(
          isAlreadyRegistered
            ? "An account with this email address already exists. Please log in instead or use a different email."
            : isRateLimit
            ? "Too many requests. Please wait 2–5 minutes before trying again."
            : signUpError.message
        );
        setIsLoading(false);
        return;
      }

      // Check if Supabase returned an empty identities array (email already registered)
      if (signUpData?.user && signUpData.user.identities && signUpData.user.identities.length === 0) {
        setErrorMessage(
          "An account with this email address already exists. Please log in instead or use a different email."
        );
        setIsLoading(false);
        return;
      }

      // Redirect to /verify-email to enter the code sent in the single email
      router.push(`/verify-email?email=${encodeURIComponent(email.trim())}`);




    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred during signup.";
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

      {/* Full Name Input */}
      <Input
        label="Full Name"
        type="text"
        placeholder="e.g. Aliko Bello"
        value={fullName}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFullName(e.target.value)}
        disabled={isLoading}
        required
        autoComplete="name"
        prefixElement={
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        }
      />

      {/* Email Input */}
      <Input
        label="Email Address"
        type="email"
        placeholder="name@example.com"
        value={email}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
        disabled={isLoading}
        required
        autoComplete="email"
        prefixElement={
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        }
      />

      {/* Phone Number Input (with Nigerian +234 country code) */}
      <Input
        label="Phone Number"
        type="tel"
        placeholder="801 234 5678"
        value={phone}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)}
        disabled={isLoading}
        required
        autoComplete="tel"
        prefixElement={
          <div className="flex items-center gap-1 font-mono-numbers text-xs font-semibold text-[var(--soil)]">
            <span className="text-sm">🇳🇬</span>
            <span>+234</span>
          </div>
        }
        helperText="Required for commodity physical delivery & payout security."
      />

      {/* Password Input */}
      <Input
        label="Password"
        type={showPassword ? "text" : "password"}
        placeholder="At least 8 characters"
        value={password}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
        disabled={isLoading}
        required
        autoComplete="new-password"
        prefixElement={
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" strokeWidth="2" />
            <path strokeWidth="2" d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
        }
        suffixElement={
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="p-1 hover:text-[var(--soil)] transition-colors focus:outline-none"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
                />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            )}
          </button>
        }
      />

      {/* Submit Button */}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        isLoading={isLoading}
        className="w-full mt-2 font-semibold shadow-soil-sm"
      >
        Create KorraStore Account
      </Button>
    </form>
  );
}
