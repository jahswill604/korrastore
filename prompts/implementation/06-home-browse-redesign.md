# Implementation Plan: Home Marketplace Redesign + Root Route

## Changes Required

### 1. Root Route Change
- `app/page.tsx` → becomes the full marketplace Server Component (move from `/home`)
- `app/home/page.tsx` → becomes a redirect to `/` (backward compat)
- `proxy.ts` → add `/` to PROTECTED_BUYER_ROUTES and update all `/home` redirects to `/`
- `app/onboarding/actions.ts` → redirect to `/` after onboarding complete
- `components/onboarding/step-carousel.tsx` → no changes needed (server action handles redirect)

### 2. Home Page Redesign Features
- **Top greeting bar**: "Good morning, [name] 👋" (DM Serif Display)
- **Live market ticker strip**: horizontal scrolling pills with price + trend % + sparkline per commodity
- **Filter/sort bar**: type chips + sort dropdown (URL-based, server-rendered)
- **Commodity grid**: redesigned cards with:
  - Beige thumbnail area with large emoji
  - Grade badge (Premium / Standard / Economy)  
  - Price in IBM Plex Mono
  - Trend indicator (green/red % with arrow)
  - Stock availability
  - "View Details" + "Buy Now" buttons
- **Empty state**: improved illustration

### 3. Files to Create/Modify
- `app/page.tsx` — new Server Component marketplace (replaces simple redirect)
- `app/home/page.tsx` — becomes redirect to `/`
- `components/marketplace/commodity-card.tsx` — redesigned card
- `components/marketplace/filter-bar.tsx` — improved filter/sort bar
- `components/marketplace/market-ticker.tsx` — NEW: horizontal price ticker
- `proxy.ts` — update protected routes + redirect targets
- `app/onboarding/actions.ts` — update redirect from `/home` to `/`

## UI References
- Desktop: `prompts/ui degine/06-home-browse/desktop-ui.png`
- Mobile: `prompts/ui degine/06-home-browse/mobile-ui.png`
