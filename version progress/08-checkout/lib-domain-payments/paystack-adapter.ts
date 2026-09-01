// lib/domain/payments/paystack-adapter.ts — Paystack implementation of the PaymentProvider interface.
// Calls Paystack's Transaction Initialize and Verify endpoints using the server-only secret key.
// SECURITY: This file imports 'server-only' — it MUST NEVER be imported by client components.
// Used in: app/api/orders/route.ts (POST /api/orders), app/api/webhooks/paystack/route.ts (Feature 26)

import 'server-only';
import type {
  PaymentProvider,
  OrderForPayment,
  PaymentInitResult,
  PaymentVerifyResult,
} from '@/lib/domain/payments/provider';

// -------------------------
// Paystack API base URL — all requests use this base.
// Reference: https://paystack.com/docs/api/transaction/
// -------------------------
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

// -------------------------
// Internal helper: returns the Authorization header using PAYSTACK_SECRET_KEY.
// Throws at call-time if the key is not configured so errors surface early.
// -------------------------
function getAuthHeader(): string {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret || secret.includes('placeholder')) {
    throw new Error(
      '[PaystackAdapter] PAYSTACK_SECRET_KEY is not configured. ' +
      'Set it in .env.local before testing payment flows.'
    );
  }
  return `Bearer ${secret}`;
}

// -------------------------
// PaystackAdapter — concrete server-side payment provider for KorraStore MVP.
// Instantiate once and export a singleton so route handlers can share the instance.
// -------------------------
export class PaystackAdapter implements PaymentProvider {
  /**
   * Initialize a Paystack transaction and return the authorization URL.
   *
   * Steps:
   * 1. POST to /transaction/initialize with amount (in kobo), email, and our order reference.
   * 2. Parse the authorization_url, access_code, and reference from Paystack's response.
   * 3. Return PaymentInitResult so the API route can hand the URL back to the browser.
   *
   * Note: The order ID is used as the Paystack reference so the webhook (Feature 26)
   * can unambiguously match the payment back to the correct KorraStore order.
   */
  async initialize(order: OrderForPayment): Promise<PaymentInitResult> {
    // Build the initialization payload — amount MUST be integer kobo, never decimal naira
    const payload = {
      reference: order.orderId,
      email: order.buyerEmail,
      amount: Math.round(order.amountKobo), // enforce integer; no fractional kobo
      currency: order.currency,
      metadata: {
        // Readable metadata for Paystack dashboard — does not affect transaction logic
        commodity: order.commodityName,
        grade: order.gradeName,
        platform: 'KorraStore',
      },
    };

    // POST to Paystack transaction initialization endpoint
    const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: getAuthHeader(),
      },
      body: JSON.stringify(payload),
    });

    // Parse and validate Paystack's response envelope
    const json = await response.json() as {
      status: boolean;
      message: string;
      data?: {
        authorization_url: string;
        access_code: string;
        reference: string;
      };
    };

    if (!response.ok || !json.status || !json.data) {
      throw new Error(
        `[PaystackAdapter] Transaction initialization failed: ${json.message ?? response.statusText}`
      );
    }

    return {
      authorizationUrl: json.data.authorization_url,
      paystackReference: json.data.reference,
      accessCode: json.data.access_code,
    };
  }

  /**
   * Re-verify a transaction directly against Paystack's verify endpoint.
   * Used by the webhook handler (Feature 26) as a mandatory second-check.
   * NEVER trust the webhook payload's status field without this re-verification.
   *
   * @param reference — The Paystack transaction reference (same as our order ID)
   */
  async verify(reference: string): Promise<PaymentVerifyResult> {
    // GET the transaction verification endpoint — reference is URL-encoded for safety
    const response = await fetch(
      `${PAYSTACK_BASE_URL}/transaction/verify/${encodeURIComponent(reference)}`,
      {
        method: 'GET',
        headers: {
          Authorization: getAuthHeader(),
        },
        // Disable Next.js cache for this — always fetch fresh verification data
        cache: 'no-store',
      }
    );

    const json = await response.json() as {
      status: boolean;
      message: string;
      data?: {
        status: string;
        reference: string;
        amount: number;
        currency: string;
        customer: { email: string };
      };
    };

    if (!response.ok || !json.status || !json.data) {
      throw new Error(
        `[PaystackAdapter] Transaction verification failed: ${json.message ?? response.statusText}`
      );
    }

    return {
      success: json.data.status === 'success',
      reference: json.data.reference,
      // Paystack returns amount in kobo — pass it through as-is
      amountKobo: json.data.amount,
      status: json.data.status,
      customerEmail: json.data.customer.email,
    };
  }
}

// -------------------------
// Singleton export — import this in route handlers rather than constructing a new instance each request.
// -------------------------
export const paystackAdapter = new PaystackAdapter();
