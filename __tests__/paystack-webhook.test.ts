// __tests__/paystack-webhook.test.ts — Vitest unit tests for Feature 26: Paystack Webhook.
// Tests the deterministic, security-critical rules the webhook handler enforces:
// HMAC-SHA512 signature verification, and the idempotency decision made when
// `payments.reference` hits its unique constraint.
// Run with: npm run test
//
// These mirror the logic in app/api/webhooks/paystack/route.ts in isolation —
// not the actual HTTP handler — matching the pattern already used by
// __tests__/checkout.test.ts (full route testing would require a mocked
// Supabase + Next request environment).

import { describe, it, expect } from 'vitest';
import crypto from 'crypto';

// -------------------------
// Mirror of isValidSignature() from app/api/webhooks/paystack/route.ts
// -------------------------
function isValidSignature(
  rawBody: string,
  signatureHeader: string | null,
  secret: string | undefined
): boolean {
  if (!secret || secret.includes('placeholder')) return false;
  if (!signatureHeader) return false;
  const expected = crypto.createHmac('sha512', secret).update(rawBody).digest('hex');
  const expectedBuf = Buffer.from(expected, 'utf8');
  const givenBuf = Buffer.from(signatureHeader, 'utf8');
  if (expectedBuf.length !== givenBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, givenBuf);
}

describe('Paystack webhook — signature verification', () => {
  const secret = 'sk_test_real_secret_key';
  const body = JSON.stringify({ event: 'charge.success', data: { reference: 'order-123' } });

  it('accepts a signature computed with the correct secret', () => {
    const signature = crypto.createHmac('sha512', secret).update(body).digest('hex');
    expect(isValidSignature(body, signature, secret)).toBe(true);
  });

  it('rejects a signature computed with the wrong secret', () => {
    const wrongSignature = crypto.createHmac('sha512', 'wrong_secret').update(body).digest('hex');
    expect(isValidSignature(body, wrongSignature, secret)).toBe(false);
  });

  it('rejects a signature that does not match a tampered body', () => {
    const signature = crypto.createHmac('sha512', secret).update(body).digest('hex');
    const tamperedBody = JSON.stringify({ event: 'charge.success', data: { reference: 'order-999' } });
    expect(isValidSignature(tamperedBody, signature, secret)).toBe(false);
  });

  it('rejects when no signature header is present', () => {
    expect(isValidSignature(body, null, secret)).toBe(false);
  });

  it('rejects when the secret is unconfigured', () => {
    const signature = crypto.createHmac('sha512', 'anything').update(body).digest('hex');
    expect(isValidSignature(body, signature, undefined)).toBe(false);
  });

  it('rejects when the secret is still a placeholder', () => {
    const placeholder = 'sk_test_placeholder';
    const signature = crypto.createHmac('sha512', placeholder).update(body).digest('hex');
    expect(isValidSignature(body, signature, placeholder)).toBe(false);
  });
});

describe('Paystack webhook — idempotency decision', () => {
  // Mirror of the branch in the route: a unique_violation (Postgres code 23505)
  // on payments.reference means this event was already processed.
  function shouldSkipAsAlreadyProcessed(insertErrorCode: string | null): boolean {
    return insertErrorCode === '23505';
  }

  it('treats a unique_violation as already-processed (skip side effects)', () => {
    expect(shouldSkipAsAlreadyProcessed('23505')).toBe(true);
  });

  it('does not treat other errors as already-processed', () => {
    expect(shouldSkipAsAlreadyProcessed('23503')).toBe(false);
    expect(shouldSkipAsAlreadyProcessed(null)).toBe(false);
  });
});

describe('Paystack webhook — event filtering', () => {
  function shouldProcessEvent(eventName: string): boolean {
    return eventName === 'charge.success';
  }

  it('processes charge.success events', () => {
    expect(shouldProcessEvent('charge.success')).toBe(true);
  });

  it('ignores unrelated event types', () => {
    expect(shouldProcessEvent('transfer.success')).toBe(false);
    expect(shouldProcessEvent('subscription.create')).toBe(false);
  });
});
