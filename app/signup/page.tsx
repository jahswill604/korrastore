// app/signup/page.tsx — Public Registration Page for KorraStore.
// Renders the signup card with email, Nigerian phone (+234), and password fields.
// Used in: Public auth route /signup.
// Behavior: Automatically redirects already logged-in users to /admin or /home.

import * as React from "react";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { BackgroundTexture } from "@/components/auth/background-texture";
import { AuthCard } from "@/components/auth/auth-card";
import { SignupForm } from "@/components/auth/signup-form";

// Page metadata
export const metadata: Metadata = {
  title: "Create Account — KorraStore",
  description: "Create an account on KorraStore to purchase, store, and trade physical agricultural commodities in certified warehouses.",
};

// Server Component for Signup Page
export default async function SignupPage() {
  // Check if user is already logged in
  const currentUser = await getCurrentUser();

  if (currentUser) {
    if (currentUser.isAdmin) {
      redirect("/admin");
    } else {
      redirect("/home");
    }
  }

  return (
    <BackgroundTexture>
      <AuthCard
        title="Create your account"
        subtitle="Start storing and trading certified Nigerian agricultural commodities."
        activeTab="signup"
      >
        <React.Suspense fallback={<div className="h-48 flex items-center justify-center text-xs text-[#7A6A58]">Loading...</div>}>
          <SignupForm />
        </React.Suspense>
      </AuthCard>
    </BackgroundTexture>
  );
}
