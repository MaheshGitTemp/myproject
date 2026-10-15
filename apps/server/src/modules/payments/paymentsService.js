// Payments seam. v1 launch is FREE (per-contact price shown as ₹25 struck
// through, charged ₹0), so no gateway is wired yet. This module exists so the
// contact flow has a stable place to add Razorpay later WITHOUT touching the
// unlock business logic: contactController records the unlock directly today
// and will call verifyPayment() before recordUnlock() once paid plans go live.
//
// Model (user message 4): one-time per-profile unlock, no mandatory
// subscription. When enabled, the frontend creates a Razorpay order via
// createOrder(), completes checkout, then POSTs the payment to the unlock
// endpoint; verifyPayment() checks the signature server-side.

/** Whether a real gateway is configured. Always false in v1 (free launch). */
export function isGatewayEnabled() {
  return false;
}

/**
 * TODO(Razorpay): create a payment order for a one-time contact unlock.
 * Will return { orderId, amount, currency } from the Razorpay Orders API.
 * Not called in v1 — unlocks are recorded directly during the free window.
 */
export async function createOrder(/* { amount, viewerId, targetId } */) {
  throw new Error('payments_disabled');
}

/**
 * TODO(Razorpay): verify a completed payment (order id + payment id +
 * signature) using the key secret before an unlock is recorded. Returns true
 * only on a valid signature. Not called in v1.
 */
export async function verifyPayment(/* { orderId, paymentId, signature } */) {
  return false;
}
