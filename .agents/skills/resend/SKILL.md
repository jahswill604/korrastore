---
name: resend
description: Use whenever implementing or touching KorraStore's transactional email — purchase confirmations, order status updates, receipts, resale/buyback notifications, or any email template. Always consult this before writing Resend integration code, since KorraStore sends email through a queued notification outbox rather than firing directly from request handlers. Trigger on mentions of Resend, email, transactional email, or notification templates.
---

# Resend (KorraStore)

Resend handles all transactional email for KorraStore. There is no marketing/bulk email in the MVP — every email is triggered by a specific user or system event (order, resale, buyback, price-related updates).

Consult Resend's current API docs (https://resend.com/docs) for exact SDK method signatures before implementing — do not assume field shapes from memory.

## Environment variables

```
RESEND_API_KEY   # server only — never in client code
```

## Never send email inline from a request handler

Per AGENTS.md section 15, notifications go through a `notifications` outbox table, processed by a scheduled worker — not fired synchronously inside a webhook or Server Action. This matters especially for the Paystack webhook (see the `paystack` skill): the webhook must return `200` quickly, and an email provider outage should never block or fail order/ledger processing.

Pattern:

1. The triggering event (order paid, resale completed, buyback approved, etc.) inserts a row into `notifications` with `channel = 'email'`, `status = 'pending'`, a `template` identifier, and a JSON `payload` of template variables.
2. A scheduled worker (invoked by the notification-processing cron or the general pipeline cron — see AGENTS.md section 18) reads pending rows, sends via Resend, and updates `status` to `sent` or `failed` (with `last_error` and a retry count).
3. Failed sends are retried with backoff up to a small max-attempts limit, then marked `failed` for admin visibility — never silently dropped.

```ts
// Domain service — called by the notification worker, not directly by request handlers
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendOrderConfirmationEmail(to: string, data: OrderConfirmationData) {
  const { error } = await resend.emails.send({
    from: 'KorraStore <orders@korrastore.com>', // confirm verified sending domain before implementing
    to,
    subject: `Your KorraStore order #${data.orderId} is confirmed`,
    react: OrderConfirmationEmail(data), // or html: renderTemplate(...)
  })
  if (error) throw new ResendSendError(error)
}
```

## Templates

- Keep one component/template per notification type, named after the event: `OrderConfirmationEmail`, `OrderStatusUpdateEmail`, `ResaleListingSoldEmail`, `BuybackApprovedEmail`, `BuybackPaidEmail`, `PriceUpdateEmail` (if applicable), etc.
- Templates should follow the KorraStore design system (AGENTS.md section 20) at a basic level — Paper background, Soil/Deep Grain Green text, Harvest Wheat accents — while staying within what's practical for email client rendering (inline styles, table-based layout, no custom fonts beyond web-safe fallbacks for Inter).
- Every template that references a monetary amount or quantity must use the same formatting conventions as the app UI (IBM Plex Mono–styled numbers where the design system calls for it, though email clients may fall back to monospace generically).
- Include the commodity name, quantity, and relevant status/price plainly in the subject and body — do not make the user open the app to know what happened.

## What triggers an email (non-exhaustive, extend as features are built)

- Order: payment confirmed, order status change (`sourcing` → `in_transit` → `stored`/`delivered`), order cancelled/failed
- Resale: listing created, listing sold, listing expired
- Buyback: request submitted, approved, rejected, paid
- Account: email verification (handled by Supabase Auth's own email flow, not Resend, unless explicitly reconfigured — see the `supabase` skill)

## Checklist before shipping a Resend change

- [ ] Email is enqueued to `notifications`, not sent inline from the triggering handler
- [ ] Sending domain is verified in the Resend dashboard before going live
- [ ] Failure is retried with backoff, then marked `failed` — not silently swallowed
- [ ] `RESEND_API_KEY` never referenced in client-reachable code
- [ ] Template reflects real KorraStore content (commodity name, quantity, price) — no lorem ipsum
