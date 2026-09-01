// lib/domain/payments/provider.ts — PaymentProvider interface and shared payment types for KorraStore.
// Defines the abstraction boundary so order/ledger code never calls Paystack (or any future provider) directly.
// All payment operations (initialize, verify) must go through this interface.
// Used in: lib/domain/payments/paystack-adapter.ts, app/api/orders/route.ts

// -------------------------
// Order data passed to the payment provider for initialization.
// Amount is always in KOBO (naira × 100) to prevent rounding bugs.
// -------------------------
export interface OrderForPayment {
  /** KorraStore internal order ID — used as the Paystack reference for webhook matching */
  orderId: string;
  /** Buyer's email address — required by Paystack for the transaction record */
  buyerEmail: string;
  /** Total amount in KOBO (naira × 100). Use Math.round() to avoid fractional kobo. */
  amountKobo: number;
  /** Currency code — always NGN for KorraStore */
  currency: 'NGN';
  /** Commodity name for readable Paystack dashboard metadata */
  commodityName: string;
  /** Grade label for readable metadata */
  gradeName: string;
}

// -------------------------
// Returned after successful payment initialization.
// The authorizationUrl is where the buyer is redirected to complete payment.
// -------------------------
export interface PaymentInitResult {
  /** Paystack-hosted payment page URL — redirect buyer here immediately */
  authorizationUrl: string;
  /** Paystack transaction reference — store alongside order for reconciliation */
  paystackReference: string;
  /** Paystack access code (shorter form of reference, for popup mode) */
  accessCode: string;
}

// -------------------------
// Returned after verifying a transaction server-to-server via Paystack's verify endpoint.
// Used in Feature 26 (webhook) to confirm payment before advancing the order ledger.
// -------------------------
export interface PaymentVerifyResult {
  /** Whether the transaction was genuinely successful per Paystack's own records */
  success: boolean;
  /** Paystack transaction reference */
  reference: string;
  /** Verified amount in KOBO as confirmed by Paystack (not from webhook payload) */
  amountKobo: number;
  /** Paystack status string: "success" | "failed" | "abandoned" | etc. */
  status: string;
  /** Buyer's email as recorded by Paystack */
  customerEmail: string;
}

// -------------------------
// PaymentProvider interface — the abstraction boundary between domain logic and payment SDKs.
// Implement this interface to add a new payment provider (e.g. Flutterwave) without
// touching order creation or ledger code.
// -------------------------
export interface PaymentProvider {
  /**
   * Initialize a payment transaction and return the URL to redirect the buyer to.
   * Must be called server-side only — never expose secret keys to the browser.
   */
  initialize(order: OrderForPayment): Promise<PaymentInitResult>;

  /**
   * Re-verify a completed transaction directly against the payment provider's API.
   * Used in the Paystack webhook handler (Feature 26) — NEVER trust the webhook payload alone.
   */
  verify(reference: string): Promise<PaymentVerifyResult>;
}
