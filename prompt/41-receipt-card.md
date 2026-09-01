# Prompt: Receipt Card Component — KorraStore

## Goal

Fully implement the `LedgerReceipt` primitive stubbed in `02-design-system.md` at
production quality — the app's signature visual element — including both its
full-size form (`11-receipt-detail.md`) and a compact card variant (used in lists,
e.g. a "recent receipts" preview if added later, or referenced from
`10-my-storage.md`). Light mode only.

## Skills read

- `02-design-system.md` — token shell/stub, "physical ledger ticket" aesthetic
  direction (perforated edge, dashed dividers).
- `11-receipt-detail.md` — the primary full-size consumer.

## Decisions / assumptions

- **Two size variants**: `full` (used on `/receipts/[receiptId]`, per
  `11-receipt-detail.md`'s spec) and `compact` (a smaller card summary — commodity,
  quantity, grade, current value — for use in lists without full receipt detail).
- **The perforated-edge/dashed-divider visual treatment is CSS-only** (no image
  assets) — implemented via a repeating background pattern or SVG mask, kept
  performant and crisp at all sizes.
- **Data-driven, not hardcoded**: both variants accept the same underlying receipt
  data shape so they never drift out of sync in content, only in layout density.

## Files likely to change / add

- `components/ui/ledger-receipt.tsx` (final implementation, both size variants).
- Update `11-receipt-detail.md`'s `receipt-view.tsx` to use the finalized `full`
  variant.
- Add the `compact` variant to `10-my-storage.md`'s holding card if a receipt
  preview is desired there (optional enhancement — confirm before adding scope
  beyond what `10-my-storage.md` originally specified).

## Implementation requirements

- CSS-only decorative treatment (no raster image assets for the perforation/
  divider effect).
- Both variants share the same prop shape (`ReceiptData`) so callers don't
  duplicate data-mapping logic between them.
- Legible at both sizes without text below `body-sm`.

## Security requirements

None — pure display.

## Acceptance criteria

- `full` variant matches `11-receipt-detail.md`'s visual spec exactly.
- `compact` variant reads clearly as "the same ticket, smaller," not a
  disconnected design.
- No layout jank or blurriness in the decorative edge treatment at any screen
  density.

## Checks to run

- `npm run typecheck`, `npm run lint`, `npm run build`.

## Manual test steps

1. View a receipt at `/receipts/[receiptId]`; confirm the full variant matches the
   intended ledger-ticket aesthetic crisply at both mobile and desktop widths.
2. If the compact variant is used anywhere, confirm it reads as a smaller version
   of the same design language, not a different component.
3. Zoom the browser to 150%/200%; confirm the decorative treatment stays crisp,
   not pixelated.
