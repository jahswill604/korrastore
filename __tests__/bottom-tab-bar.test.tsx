// Regression tests for PR #4's identity-based mobile navigation selection.
// These render the real BottomTabBar while varying NAV_ITEMS at module load.

import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

let pathname = "/";

vi.mock("next/navigation", () => ({
  usePathname: () => pathname,
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    className,
    children,
  }: {
    href: string;
    className?: string;
    children: React.ReactNode;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

interface TestNavItem {
  label: string;
  href: string;
  iconName: string;
  iconSvg: React.ReactNode;
}

const navItem = (label: string, href: string, iconName: string): TestNavItem => ({
  label,
  href,
  iconName,
  iconSvg: <span data-icon={iconName} />,
});

const EXPECTED_MOBILE_ITEMS = [
  navItem("Home", "/", "home"),
  navItem("Store", "/marketplace", "store"),
  navItem("Storage", "/my-storage", "storage"),
  navItem("Orders", "/orders", "orders"),
  navItem("Profile", "/profile", "profile"),
];

async function renderBottomTabBar(items: TestNavItem[]): Promise<string> {
  vi.doMock("@/components/layout/nav-rail", () => ({ NAV_ITEMS: items }));
  const { BottomTabBar } = await import("@/components/layout/bottom-tab-bar");
  return renderToStaticMarkup(<BottomTabBar />);
}

function renderedHrefs(markup: string): string[] {
  return Array.from(markup.matchAll(/href="([^"]+)"/g), (match) => match[1]);
}

describe("BottomTabBar mobile-tab selection", () => {
  beforeEach(() => {
    pathname = "/";
    vi.resetModules();
  });

  it("renders the five mobile destinations in their intended order", async () => {
    const markup = await renderBottomTabBar(EXPECTED_MOBILE_ITEMS);

    expect(renderedHrefs(markup)).toEqual([
      "/",
      "/marketplace",
      "/my-storage",
      "/orders",
      "/profile",
    ]);
    expect(markup).toContain("Home");
    expect(markup).toContain("Profile");
  });

  it("keeps the same tabs when desktop navigation is reordered or gains items", async () => {
    const changedDesktopItems = [
      navItem("Notifications", "/notifications", "notifications"),
      EXPECTED_MOBILE_ITEMS[4],
      navItem("Receipts", "/receipts", "receipts"),
      EXPECTED_MOBILE_ITEMS[2],
      EXPECTED_MOBILE_ITEMS[0],
      EXPECTED_MOBILE_ITEMS[3],
      EXPECTED_MOBILE_ITEMS[1],
    ];

    const markup = await renderBottomTabBar(changedDesktopItems);

    expect(renderedHrefs(markup)).toEqual([
      "/",
      "/marketplace",
      "/my-storage",
      "/orders",
      "/profile",
    ]);
    expect(markup).not.toContain("Notifications");
    expect(markup).not.toContain("Receipts");
  });

  it("omits a missing destination instead of rendering an undefined link", async () => {
    const withoutProfile = EXPECTED_MOBILE_ITEMS.filter((item) => item.iconName !== "profile");

    await expect(renderBottomTabBar(withoutProfile)).resolves.not.toThrow();
    const markup = await renderBottomTabBar(withoutProfile);

    expect(renderedHrefs(markup)).toEqual(["/", "/marketplace", "/my-storage", "/orders"]);
    expect(markup).not.toContain("Profile");
    expect(markup).not.toContain("undefined");
  });

  it("marks a nested route's owning tab active without activating Home", async () => {
    pathname = "/orders/order-123";
    const markup = await renderBottomTabBar(EXPECTED_MOBILE_ITEMS);
    const ordersAnchor = markup.match(/<a href="\/orders" class="([^"]+)"/);
    const homeAnchor = markup.match(/<a href="\/" class="([^"]+)"/);

    expect(ordersAnchor?.[1]).toContain("text-[#D8B56A]");
    expect(homeAnchor?.[1]).not.toContain("text-[#D8B56A]");
  });
});
