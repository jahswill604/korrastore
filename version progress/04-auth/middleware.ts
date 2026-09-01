// middleware.ts — Edge Authentication Middleware & Role-Based Route Guard for KorraStore.
// Refreshes Supabase session cookies and enforces "One Login, Two Experiences" role protection.
// Used in: Next.js edge runtime request pipeline for all incoming navigation requests.
// Security Rule: Uses supabase.auth.getUser() on every protected request; blocks non-admins from /admin.

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Array of route prefixes that require an authenticated user session
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
];

// Array of public auth routes that should redirect authenticated users away
const PUBLIC_AUTH_ROUTES = ["/login", "/signup"];

// Core Next.js Middleware handler
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Initialize mutable response object to carry refreshed session cookies
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

  // Create cookie-bound Supabase client for Edge Middleware
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // Re-verify session against Supabase Auth servers (NEVER trust getSession())
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Helper to fetch user role safely
  const getUserRole = async (userId: string): Promise<string> => {
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();
      return profile?.role || "user";
    } catch {
      return "user";
    }
  };

  // 1. ADMIN ROUTE PROTECTION: Hard server-side barrier for /admin and /admin/*
  if (pathname.startsWith("/admin")) {
    if (!user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const role = await getUserRole(user.id);
    if (role !== "admin") {
      // Non-admins attempting to access admin routes are routed to /home
      return NextResponse.redirect(new URL("/home", request.url));
    }

    return response;
  }

  // 2. BUYER PROTECTED ROUTE PROTECTION: Require valid user session
  const isBuyerProtected = PROTECTED_BUYER_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isBuyerProtected) {
    if (!user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return response;
  }

  // 3. PUBLIC AUTH ROUTES (/login, /signup): Redirect authenticated users to their home dashboard
  const isAuthRoute = PUBLIC_AUTH_ROUTES.some((route) => pathname === route);
  if (isAuthRoute && user) {
    const role = await getUserRole(user.id);
    if (role === "admin") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.redirect(new URL("/home", request.url));
  }

  return response;
}

// Next.js Middleware Matcher configuration
// Filters out static assets, image optimizations, and internal Next.js assets
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files with extensions (e.g. .svg, .png, .jpg, .css)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
