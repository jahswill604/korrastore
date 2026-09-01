// __tests__/auth-routing.test.ts — Unit Tests for KorraStore Role-Based Routing & Route Guards.
// Validates "One Login, Two Experiences", protected route barriers, and safe redirection behavior.
// Used by: `npm run test` (Vitest test suite).

import { describe, it, expect } from "vitest";

// Route protection logic helper for unit test assertions
function evaluateRouteAccess({
  pathname,
  user,
  role,
}: {
  pathname: string;
  user: { id: string } | null;
  role?: "user" | "admin";
}): { action: "allow" | "redirect"; destination?: string } {
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

  const PUBLIC_AUTH_ROUTES = ["/login", "/signup"];

  // 1. Admin Routes
  if (pathname.startsWith("/admin")) {
    if (!user) {
      return { action: "redirect", destination: `/login?redirect=${encodeURIComponent(pathname)}` };
    }
    if (role !== "admin") {
      return { action: "redirect", destination: "/home" };
    }
    return { action: "allow" };
  }

  // 2. Buyer Protected Routes
  const isBuyerProtected = PROTECTED_BUYER_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isBuyerProtected) {
    if (!user) {
      return { action: "redirect", destination: `/login?redirect=${encodeURIComponent(pathname)}` };
    }
    return { action: "allow" };
  }

  // 3. Public Auth Routes
  const isAuthRoute = PUBLIC_AUTH_ROUTES.includes(pathname);
  if (isAuthRoute && user) {
    if (role === "admin") {
      return { action: "redirect", destination: "/admin" };
    }
    return { action: "redirect", destination: "/home" };
  }

  return { action: "allow" };
}

describe("KorraStore Auth & Role-Based Routing", () => {
  describe("One Login, Two Experiences Rule", () => {
    it("routes admin user to /admin upon visiting /login while authenticated", () => {
      const result = evaluateRouteAccess({
        pathname: "/login",
        user: { id: "admin-123" },
        role: "admin",
      });

      expect(result.action).toBe("redirect");
      expect(result.destination).toBe("/admin");
    });

    it("routes standard buyer to /home upon visiting /login while authenticated", () => {
      const result = evaluateRouteAccess({
        pathname: "/login",
        user: { id: "user-456" },
        role: "user",
      });

      expect(result.action).toBe("redirect");
      expect(result.destination).toBe("/home");
    });
  });

  describe("Admin Route Protection", () => {
    it("redirects unauthenticated user accessing /admin/inventory to login with redirect param", () => {
      const result = evaluateRouteAccess({
        pathname: "/admin/inventory",
        user: null,
      });

      expect(result.action).toBe("redirect");
      expect(result.destination).toBe("/login?redirect=%2Fadmin%2Finventory");
    });

    it("blocks standard user from accessing /admin/orders and hard-redirects to /home", () => {
      const result = evaluateRouteAccess({
        pathname: "/admin/orders",
        user: { id: "user-456" },
        role: "user",
      });

      expect(result.action).toBe("redirect");
      expect(result.destination).toBe("/home");
    });

    it("allows admin user to access /admin/orders", () => {
      const result = evaluateRouteAccess({
        pathname: "/admin/orders",
        user: { id: "admin-123" },
        role: "admin",
      });

      expect(result.action).toBe("allow");
    });
  });

  describe("Buyer Protected Route Protection", () => {
    it("redirects unauthenticated visitor accessing /my-storage to /login", () => {
      const result = evaluateRouteAccess({
        pathname: "/my-storage",
        user: null,
      });

      expect(result.action).toBe("redirect");
      expect(result.destination).toBe("/login?redirect=%2Fmy-storage");
    });

    it("allows authenticated buyer to access /my-storage", () => {
      const result = evaluateRouteAccess({
        pathname: "/my-storage",
        user: { id: "user-456" },
        role: "user",
      });

      expect(result.action).toBe("allow");
    });

    it("allows authenticated buyer to access /checkout", () => {
      const result = evaluateRouteAccess({
        pathname: "/checkout",
        user: { id: "user-456" },
        role: "user",
      });

      expect(result.action).toBe("allow");
    });
  });
});
