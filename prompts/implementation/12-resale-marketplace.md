# Implementation Plan: Feature 12 — Resale Marketplace (KorraStore)

## 1. Feature Overview & Architecture
Build `/resale` as the peer-to-peer secondary market where buyers can browse verified warehouse-stored commodities listed for resale by other KorraStore customers.
The page provides commodity filtering, sorting, anonymized seller identification, real-time live stock/quantity views, and a streamlined purchase flow directly into Paystack checkout.

## 2. Component Hierarchy & File Structure
```
app/
  resale/
    page.tsx                            # Server Component (auth check, query resale listings, filters)
  api/
    resale/
      [id]/
        buy/
          route.ts                      # Route Handler (atomic reservation, order creation, Paystack init)

components/
  resale/
    resale-header.tsx                   # Server Component (page title, description banner)
    resale-filter-bar.tsx               # Client Component (commodity type tabs + sort dropdown)
    resale-grid.tsx                     # Server Component (3-column desktop / 1-column mobile grid)
    resale-card.tsx                     # Client Component (card rendering with anonymized badge & buy action)
    resale-empty-state.tsx              # Server/Client Component (empty state with reset filter CTA)

lib/
  supabase/
    queries/
      resale.ts                         # Server-side queries (getActiveResaleListings using resale_listings_public)
```

## 3. Data Flow & Security
- **Authentication**: `createClient()` with `supabase.auth.getUser()`. If unauthenticated when clicking "Buy Listing", redirects smoothly to `/login?redirect=/resale`.
- **Anonymity**: All buyer-facing reads strictly target `resale_listings_public` view — seller IDs, names, emails, and phone numbers are completely stripped. Seller is rendered as an anonymized tag (e.g. `Seller #4821 • Verified Silo Kano`).
- **Atomic Locking & Concurrency**: Direct purchasing invokes a database RPC function (`reserve_resale_listing`) with `FOR UPDATE` row lock on `resale_listings` to prevent two buyers from checking out the same listing simultaneously.
- **Payment Abstraction**: Uses `PaymentProvider` (`PaystackAdapter`) to initialize the checkout session with reference to the created order.

## 4. UI/UX Specifications (Light Mode Only)
- **Background**: Warm Paper (`#F7F4EA`)
- **Accent**: Harvest Wheat (`#D8B56A`)
- **Text & Headings**: Soil (`#4A3828`), `DM Serif Display` for headings, `Inter` for body, `IBM Plex Mono` for prices/quantities.
- **Badges**: `Deep Grain Green` (`#21483A`) for grade tags (`[Grade A / Premium]`).
- **Cards**: Light beige cards with subtle border (`#E4DCC8`), high-resolution commodity photo, asking price breakdown, and full-width "Buy Listing" button.
