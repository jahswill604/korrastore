---
name: termii
description: Use whenever implementing or touching KorraStore's SMS notifications — order status texts, buyback status texts, or any phone-number-based messaging. Always consult this before writing Termii integration code, since KorraStore uses Termii strictly for transactional SMS through the notification outbox, never as a custom-built OTP/authentication system. Trigger on mentions of Termii, SMS, text message, or phone notification.
---

# Termii (KorraStore)

Termii is KorraStore's transactional SMS provider. Per AGENTS.md section 15, Termii is used for **transactional SMS only** — order updates, buyback status, and similar system notifications sent to a user's phone number. It is explicitly **not** a custom OTP/authentication system in the MVP.

Consult Termii's current API docs (https://developers.termii.com) for exact endpoint/field shapes before implementing — do not assume field shapes from memory.

## Environment variables

```
TERMII_API_KEY   # server only — never in client code
```

## Do not build OTP logic here

Phone verification/OTP is handled entirely by **Supabase Auth's** phone OTP flow (see the `supabase` skill). If Supabase's phone-auth needs to be backed by Termii as its underlying SMS provider, that is an infrastructure-level configuration inside Supabase Auth's provider settings — follow Supabase's documented SMS-provider integration for that, not custom application code calling Termii's OTP endpoints directly. Do not write a parallel OTP system using Termii's own OTP/verification API unless explicitly requested and approved as a deliberate change to the auth architecture.

This skill covers **application-triggered transactional SMS only**.

## Send through the notification outbox, not inline

Same pattern as email (see the `resend` skill): SMS sends are enqueued to the `notifications` table with `channel = 'sms'`, and processed by the scheduled notification worker — never fired synchronously from inside the Paystack webhook or another time-sensitive handler.

```ts
// Domain service — called by the notification worker, not directly by request handlers
export async function sendTransactionalSms(to: string, message: string) {
  const res = await fetch('https://v3.api.termii.com/api/sms/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: process.env.TERMII_API_KEY,
      to: normalizePhoneNumber(to),
      from: 'KorraStore', // confirm approved sender ID with Termii before going live
      sms: message,
      type: 'plain',
      channel: 'generic', // confirm current recommended channel value in Termii docs
    }),
  })
  const data = await res.json()
  if (!res.ok) throw new TermiiSendError(data)
  return data
}
```

## Phone number normalization

Termii expects phone numbers in international format without a leading `+` (e.g. `2348012345678`, not `08012345678` or `+2348012345678`) — confirm the exact expected format in current Termii docs, since this has historically been a common integration bug. Store phone numbers in `profiles` in a single canonical format (E.164, e.g. `+2348012345678`) and convert only at the point of calling Termii.

```ts
function normalizePhoneNumber(e164: string): string {
  return e164.replace(/^\+/, '')
}
```

## Message content

- Keep messages short and unambiguous — SMS has no room for the KorraStore design system, just clear plain text.
- Always identify KorraStore by name at the start of the message (many carriers/spam filters and users expect this).
- Include the concrete detail (commodity, quantity, status, amount) — never a vague "your order has updated, check the app."

Example:

```
KorraStore: Your order of 500kg Rice (Grade A) is now in transit. Track it in the app.
```

## What triggers an SMS (non-exhaustive)

- Order status changes the user would want to know about immediately (payment confirmed, stored, delivered, cancelled/failed)
- Buyback status changes (approved, paid, rejected)
- Time-sensitive resale events (listing sold)

Not every email-triggering event needs a matching SMS — reserve SMS for higher-urgency or higher-value events to avoid over-messaging users and running up SMS costs. Confirm which specific events should also fire SMS per-feature in the relevant prompt file (AGENTS.md section 4) rather than defaulting every notification to both channels.

## Failure handling

Same retry/backoff pattern as email: failed sends retry with backoff up to a small max-attempts limit, then are marked `failed` in `notifications` for admin visibility. Never let an SMS provider outage block order or ledger processing.

## Checklist before shipping a Termii change

- [ ] SMS is enqueued to `notifications`, not sent inline from the triggering handler
- [ ] No custom OTP logic built against Termii — OTP stays in Supabase Auth
- [ ] Phone numbers normalized to Termii's expected format only at the send boundary
- [ ] `TERMII_API_KEY` never referenced in client-reachable code
- [ ] Message content is concrete (commodity/quantity/status), not vague
- [ ] Failure is retried with backoff, then marked `failed` — not silently swallowed
