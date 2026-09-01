// app/login/page.tsx — Public Authentication Login Page for KorraStore.
// Renders the login card with email & password form on a ledger paper background.
// Used in: Public auth route /login.
// Behavior: Automatically redirects already logged-in users to /admin or /home.

import * as React from "react";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { BackgroundTexture } from "@/components/auth/background-texture";
import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";

// Page metadata for SEO and branding
export const metadata: Metadata = {
  title: "Sign In — KorraStore",
  description: "Sign in to access your physical commodity holdings, orders, and marketplace resale dashboard on KorraStore.",
};

// Interface for search params passed to page
interface LoginPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// Server Component for Login Page
export default async function LoginPage({ searchParams }: LoginPageProps) {
  // Check if user is already logged in
  const currentUser = await getCurrentUser();

  if (currentUser) {
    // Role-based routing: Admin to /admin, user to /home
    if (currentUser.isAdmin) {
      redirect("/admin");
    } else {
      redirect("/home");
    }
  }

  const params = await searchParams;
  const signupParam = params["signup"];
  const isSignupSuccess = signupParam === "email_sent" || signupParam === "success";
  const errorParam = params["error"] as string | undefined;

  return (
    <BackgroundTexture>
      <AuthCard
        title="Welcome back"
        subtitle="Sign in to manage your stored physical commodities and resale holdings."
        activeTab="login"
        successMessage={
          isSignupSuccess
            ? "Account created successfully! A verification link has been sent to your email address. Please check your inbox and verify your email to log in."
            : null
        }
        error={errorParam === "auth_callback_failed" ? "Authentication verification link expired or invalid." : null}
      >

        <React.Suspense fallback={<div className="h-48 flex items-center justify-center text-xs text-[#7A6A58]">Loading...</div>}>
          <LoginForm />
        </React.Suspense>
      </AuthCard>
    </BackgroundTexture>
  );
}
