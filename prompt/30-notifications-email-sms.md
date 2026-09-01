# Prompt: Notifications — Email & SMS Delivery — KorraStore

## Goal

Implement the notification outbox worker that actually sends queued
`notifications` rows via Resend (email) and Termii (SMS), replacing the
"enqueue only" behavior assumed by earlier prompts (`26-paystack-webhook.md`,
`15-notifications.md`, `21-admin-resale-buyback.md`, etc.) with real delivery,
retry/backoff, and failure tracking.

## Skills read

- `.agents/skills/resend/SKILL.md` — outbox pattern, template conventions, retry
  policy.
- `.agents/skills/termii/SKILL.md` — outbox pattern, phone-number normalization,
  message content rules, retry policy.
- `AGENTS.md` §15 (notification/OTP rules), §18 (notification worker as part of the
  scheduled pipeline).

## Existing code inspected

- `03-database-schema.md` — `notifications` schema; confirm it has `channel`
  (`in_app | email | sms`), `status` (`pending | sent | failed`), `template`,
  `payload` (jsonb), `attempts`, `last_error` columns — add via migration here if
  any are missing.
- `26-paystack-webhook.md`, `14-buyback.md`, `21-admin-resale-buyback.md`,
  `15-notifications.md` — all enqueue rows this worker now processes.

## Decisions / assumptions

- **One worker route, two senders**: `GET /api/cron/notifications` (or folded into
  the general pipeline cron) reads pending `email`/`sms` rows (in-app rows need no
  sending, just exist for `15-notifications.md`'s reads), dispatches to the
  matching sender, and updates status.
- **Templates per event type**, one React/HTML template component per email event
  and one plain-text builder per SMS event, named after the triggering event
  (`OrderConfirmationEmail`, `BuybackApprovedSms`, etc.), per the `resend`/`termii`
  skills.
- **Retry with backoff**: up to 3 attempts, exponential backoff between cron runs
  (track `attempts` + a `next_attempt_at` column), then mark `failed` for admin
  visibility in `23-admin-support.md`'s resend action.

## Files likely to change / add

- `app/api/cron/notifications/route.ts` — `GET`, `CRON_SECRET`-protected.
- `lib/domain/notifications/worker.ts` — reads pending rows, dispatches, updates
  status.
- `lib/domain/notifications/templates/email/*.tsx` — one per event type.
- `lib/domain/notifications/templates/sms/*.ts` — one per event type (plain-text
  builders).
- `lib/domain/notifications/senders/resend-sender.ts`,
  `senders/termii-sender.ts` — per the respective skills.
- `supabase/migrations/000X_notifications_worker_fields.sql` — add any missing
  columns (`attempts`, `next_attempt_at`, `last_error`) if not already present.
- `vercel.json` — cron schedule entry for the notifications worker.

## Implementation requirements

- Every send goes through the outbox — no direct Resend/Termii call from any
  request handler (webhook, resale/buyback routes) per the skills' rule; those
  routes only ever insert into `notifications`.
- Failed sends never block or roll back the domain event that triggered them
  (a failed email must not undo a successful payment/ledger write).
- Phone numbers are normalized only at the Termii send boundary, per the `termii`
  skill.

## Security requirements

- `RESEND_API_KEY`/`TERMII_API_KEY` used only inside their respective sender
  modules.
- Worker route protected by `CRON_SECRET`.

## Acceptance criteria

- Pending email/SMS notifications from every existing trigger point (purchase,
  order status change, resale sold, buyback status change) are actually delivered
  via Resend/Termii.
- A simulated provider failure results in a retried attempt, then a `failed`
  status with `last_error` populated, visible to admin support tools.
- Duplicate delivery of the same notification row never happens (the worker claims
  rows atomically, e.g. via a `SELECT ... FOR UPDATE SKIP LOCKED` pattern or an
  equivalent claim mechanism).

## Checks to run

- `npm run typecheck`, `npm run lint`, `npm run build`, `npm run test` (worker
  correctly retries then fails after max attempts; no double-send under concurrent
  worker runs).

## Manual test steps

1. Trigger a purchase through to `stored` (via `26-paystack-webhook.md`'s flow);
   run `GET /api/cron/notifications` locally; confirm a real email/SMS is
   delivered (using Resend/Termii test/sandbox credentials).
2. Temporarily point `RESEND_API_KEY` to an invalid value; trigger a new
   notification; run the worker; confirm it retries and eventually marks the row
   `failed` with an error recorded.
3. Use `23-admin-support.md`'s resend action on that failed row; restore a valid
   key; confirm it now sends successfully.
4. Run the worker twice in quick succession against the same pending rows; confirm
   no notification is sent twice.
