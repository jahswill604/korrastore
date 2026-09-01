# Implementation Plan: Feature 13 — Create & Manage Resale Listings (KorraStore)

## 1. Feature Overview & Architecture
Feature 13 provides the seller-side resale experience for KorraStore users:
1. **Listing Creation (`CreateListingModal`)**: Launched directly from holding cards in `/my-storage`, allowing users to list stored commodities for resale on the peer-to-peer marketplace. Available quantity is dynamically clamped, asking price is customizable, and an expiration duration (7, 14, 30 days) is selected.
2. **Atomic Quantity Reservation**: When a listing is submitted, an atomic RPC transaction checks available non-reserved quantity, creates the `resale_listings` record, and increments holding reservations.
3. **Seller Dashboard (`/resale/my-listings`)**: A dedicated management interface for buyers to track their listed commodities across `Active`, `Sold`, `Expired`, and `Cancelled` statuses.
4. **Active Listing Management**: Sellers can edit the asking unit price in-place or cancel active listings, which immediately and safely releases reserved quantities back to available storage.

## 2. Component Hierarchy & File Structure
```
app/
  resale/
    my-listings/
      page.tsx                          # Server Component (auth check, fetch seller's listings, filter by status)
  api/
    resale/
      route.ts                          # POST: Validates holding, reserves quantity atomically, creates resale listing
      [id]/
        cancel/
          route.ts                      # POST: Cancels listing and releases holding reservation
        price/
          route.ts                      # PATCH: Updates asking unit price for active listing

components/
  resale/
    create-listing-modal.tsx            # Client Component (modal/sheet for creating listing from holding)
    my-listings-header.tsx              # Server Component (title, description, link back to /resale & /my-storage)
    my-listings-tabs.tsx                # Client Component (URL-driven status filter tabs: Active, Sold, Expired, Cancelled)
    my-listing-row.tsx                  # Client Component (listing item card with status badge, metrics, action triggers)
    edit-price-modal.tsx                # Client Component (modal to adjust asking price with live payout recalculation)
    cancel-listing-dialog.tsx           # Client Component (destructive confirmation modal to cancel listing)
  my-storage/
    holding-actions.tsx                 # Client Component (updated to wire "Resell" button to CreateListingModal)

lib/
  supabase/
    queries/
      resale.ts                         # Expanded queries: getMyResaleListings, createResaleListing, updateListingPrice, cancelResaleListing
```

## 3. Data Flow & Security
- **Authentication**: All routes and API endpoints verify the user session with `supabase.auth.getUser()`.
- **Strict Ownership Checks**: Users can only list, price-edit, or cancel listings belonging to their own user ID and verified holdings.
- **Ledger & Reservation Integrity**:
  - `holdings` quantity is never directly modified on listing creation; rather, available quantity is computed as `quantity - reserved_quantity`.
  - Listing creation atomically increments reservation.
  - Listing cancellation atomically decrements reservation and sets listing status to `cancelled`.
  - Stale/expired listings will be handled by cron maintenance, releasing reservations.
- **Price Updating**: Only `unit_price` can be updated while `status === 'active'`. Quantity changes require cancellation and re-listing to prevent state corruption.

## 4. UI/UX Specifications (Light Mode Only)
- **Design Tokens**:
  - Background: Warm Paper (`#F7F4EA`)
  - Accent / CTA: Harvest Wheat (`#D8B56A`)
  - Secondary Accent / Hover: Husk (`#A88958`)
  - Text: Soil (`#4A3828`)
  - Status Badges: Active (`#21483A` green), Sold (`#303B63` indigo), Cancelled/Expired (`#B3432E` muted red / `#C7862B` warning)
  - Typography: `DM Serif Display` for headings, `Inter` for UI/body, `IBM Plex Mono` for currency and numeric weights.
