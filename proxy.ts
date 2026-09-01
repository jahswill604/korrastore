// proxy.ts — Edge Authentication Proxy & Role-Based Route Guard for KorraStore.
// Refreshes Supabase session cookies and enforces "One Login, Two Experiences" role protection.
// Feature 05 addition: redirects newly registered buyers to /onboarding if onboarding_completed
// is false, and protects /onboarding itself (session required; if already completed => /home).
// Used in: Next.js edge runtime request pipeline for all incoming navigation requests.
// Security Rule: Uses supabase.auth.getUser() on every protected request; blocks non-admins from /admin.

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

// ---------------------------------------------------------------------------
// Route classification constants
// ---------------------------------------------------------------------------

// Protected buyer routes — require an authenticated session for actions.
const PROTECTED_BUYER_ROUTES = [
  "/home",
  "/commodities",
  "/checkout",
  "/orders",
  "/my-storage",
  "/receipts",
  "/resale",
  "/buyback",
  "/notifications",
  "/profile",
  "/onboarding",
];

// Public auth routes — redirect authenticated users away to their dashboard.
const PUBLIC_AUTH_ROUTES = ["/login", "/signup", "/verify-email", "/verify-phone"];

// ---------------------------------------------------------------------------
// Core Next.js Proxy handler
// ---------------------------------------------------------------------------
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Initialize mutable response to carry refreshed session cookies downstream.
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

  // Create cookie-bound Supabase client suitable for the Edge Proxy runtime.
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // Re-verify session against Supabase Auth servers.
  // NEVER use getSession() here — it does not re-validate the JWT server-side.
  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data?.user ?? null;
  } catch (err) {
    console.warn("[proxy] Supabase auth check failed (network/dev fallback):", err);
  }


  // ---------------------------------------------------------------------------
  // Helper: fetch user profile fields (role + onboarding_completed) in one query.
  // Consolidating into a single SELECT avoids two round-trips for routes that need both.
  // ---------------------------------------------------------------------------
  const getProfile = async (
    userId: string
  ): Promise<{ role: string; onboarding_completed: boolean }> => {
    try {
      const { data } = await supabase
        .from("profiles")
        .select("role, onboarding_completed")
        .eq("id", userId)
        .single();

      return {
        role: data?.role ?? "user",
        onboarding_completed: data?.onboarding_completed ?? false,
      };
    } catch {
      // Fail open on errors — safer defaults (user role, no redirect loop).
      return { role: "user", onboarding_completed: true };
    }
  };

  // ---------------------------------------------------------------------------
  // 1. ADMIN ROUTE PROTECTION — /admin and /admin/*
  // Hard server-side barrier; non-admins are bounced to /.
  // ---------------------------------------------------------------------------
  if (pathname.startsWith("/admin")) {
    if (!user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const { role } = await getProfile(user.id);
    if (role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return response;
  }

  // ---------------------------------------------------------------------------
  // 2. ONBOARDING ROUTE — special two-way guard
  //    a) Unauthenticated => /login
  //    b) Authenticated + already completed => / (no re-showing)
  //    c) Authenticated + not completed => allow through
  // ---------------------------------------------------------------------------
  if (pathname === "/onboarding") {
    if (!user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", "/onboarding");
      return NextResponse.redirect(loginUrl);
    }

    const { onboarding_completed } = await getProfile(user.id);
    if (onboarding_completed) {
      // Already done — skip to root marketplace to prevent users from re-triggering onboarding.
      return NextResponse.redirect(new URL("/", request.url));
    }

    return response;
  }

  // ---------------------------------------------------------------------------
  // 3. BUYER PROTECTED ROUTE PROTECTION
  //    Authenticated users with onboarding_completed = false are intercepted
  //    and sent to /onboarding before they can reach any buyer route.
  // ---------------------------------------------------------------------------
  const isBuyerProtected = PROTECTED_BUYER_ROUTES.some(
    (route) => pathname === route || (route !== "/" && pathname.startsWith(`${route}/`))
  );

  if (isBuyerProtected) {
    if (!user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Check onboarding status — incomplete users are gated to /onboarding.
    const { onboarding_completed } = await getProfile(user.id);
    if (!onboarding_completed && pathname !== "/onboarding") {
      return NextResponse.redirect(new URL("/onboarding", request.url));
    }

    return response;
  }

  // ---------------------------------------------------------------------------
  // 4. PUBLIC AUTH ROUTES (/login, /signup)
  //    Authenticated users are redirected to their appropriate dashboard.
  // ---------------------------------------------------------------------------
  const isAuthRoute = PUBLIC_AUTH_ROUTES.some((route) => pathname === route);
  if (isAuthRoute && user) {
    const { role, onboarding_completed } = await getProfile(user.id);

    if (role === "admin") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    // Send user to onboarding if they haven't completed it yet.
    if (!onboarding_completed) {
      return NextResponse.redirect(new URL("/onboarding", request.url));
    }

    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}

// ---------------------------------------------------------------------------
// Next.js Proxy Matcher configuration
// Excludes static assets and internal Next.js asset paths for performance.
// ---------------------------------------------------------------------------
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
