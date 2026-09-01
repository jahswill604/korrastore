# Implementation Plan: Feature 11 — Receipt Detail (KorraStore)

## 1. Feature Overview & Architecture
Build `/receipts/[receiptId]` as the full digital ownership receipt view for a stored commodity purchase.
The page renders the signature full-scale physical ledger ticket with perforated edges, dashed dividers, live commodity valuations, purchase vs. current price delta calculations, storage location, and secure downloadable signed-URL receipt generation.

## 2. Component Hierarchy & File Structure
```
app/
  receipts/
    [receiptId]/
      page.tsx                          # Server Component (auth check, data fetching, metadata)
  api/
    receipts/
      [receiptId]/
        download/
          route.ts                      # Route Handler (secure signed URL generation from Supabase Storage)

components/
  receipts/
    receipt-view.tsx                    # Server Component (full ticket rendering with LedgerReceipt layout)
    receipt-actions.tsx                 # Client Component ("View in Storage" navigation + download trigger)
    receipt-not-generated.tsx           # Server/Client Component (clean state when receipt is still pending generation)

lib/
  supabase/
    queries/
      receipts.ts                       # Server-side queries (getReceiptDetail, getReceiptFileUrl)
```

## 3. Data Flow & Security
- **Authentication**: `createClient()` with `supabase.auth.getUser()`. If unauthenticated, redirect to `/login?redirect=/receipts/[receiptId]`.
- **Authorization**: Scoped to authenticated user (`auth.uid() = user_id`). If receipt does not exist or user is unauthorized, return `notFound()`.
- **Live Valuation**: Computed dynamically via `holdings_with_current_value` and latest commodity pricing — never stored statically or derived purely client-side.
- **Storage & Download**: Uses `@supabase/ssr` / service role client to generate a 60-second short-lived signed URL (`createSignedUrl`) from the private storage bucket `receipts`.

## 4. UI/UX Specifications (Light Mode Only)
- **Background**: Warm Paper (`#F7F4EA`)
- **Accent**: Harvest Wheat (`#D8B56A`)
- **Text & Headings**: Soil (`#4A3828`), `DM Serif Display` for headings, `Inter` for body, `IBM Plex Mono` for numbers/prices/receipt IDs.
- **Badge/Positive**: Deep Grain Green (`#21483A`)
- **Perforated Ticket Header**: Dark green ribbon with receipt code and status badge.
- **Action Buttons**:
  - Secondary: "View in My Storage" -> `/my-storage`
  - Primary: "⬇ Download Receipt" -> Triggers signed download or direct print export.
