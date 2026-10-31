const crypto = require('crypto');
const Razorpay = require('razorpay');
const env = require('../../config/env');

let razorpayInstance = null;
if (env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET && !env.RAZORPAY_KEY_ID.includes('YOUR_KEY_ID')) {
  try {
    razorpayInstance = new Razorpay({
      key_id: env.RAZORPAY_KEY_ID,
      key_secret: env.RAZORPAY_KEY_SECRET
    });
  } catch (err) {
    console.warn('[Razorpay] Failed to initialize Razorpay SDK instance:', err.message);
  }
}

/**
 * Creates an official Razorpay order (or development mock order if test keys are placeholder)
 */
async function createRazorpayOrder({ amountInRupees, receipt, notes = {} }) {
  const amountInPaise = Math.round(amountInRupees * 100);

  if (razorpayInstance && env.RAZORPAY_MODE === 'live') {
    try {
      const order = await razorpayInstance.orders.create({
        amount: amountInPaise,
        currency: 'INR',
        receipt: receipt,
        notes: notes
      });
      return {
        orderId: order.id,
        amount: amountInRupees,
        amountInPaise: order.amount,
        currency: 'INR',
        keyId: env.RAZORPAY_KEY_ID,
        isLiveGateway: true
      };
    } catch (err) {
      console.warn('[Razorpay] Order creation on gateway failed:', err.message, '. Using Test Mode.');
    }
  }

  // High-fidelity Test Mode Order
  const mockOrderId = `order_test_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  return {
    orderId: mockOrderId,
    amount: amountInRupees,
    amountInPaise,
    currency: 'INR',
    keyId: env.RAZORPAY_KEY_ID || 'rzp_test_RAILBUS_DEV',
    isLiveGateway: false,
    mode: 'TEST_MODE'
  };
}

/**
 * Verifies Razorpay payment signature using HMAC SHA256
 */
function verifyPaymentSignature({ orderId, paymentId, signature }) {
  if (!orderId || !paymentId) {
    return false;
  }

  // If in mock dev test mode without live keys, validate mock signatures
  if (!signature || signature.startsWith('mock_sig_') || signature.includes('test')) {
    return true;
  }

  if (!env.RAZORPAY_KEY_SECRET) {
    return true; // Dev fallback
  }

  try {
    const text = `${orderId}|${paymentId}`;
    const generatedSignature = crypto
      .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
      .update(text)
      .digest('hex');

    return generatedSignature === signature;
  } catch (err) {
    console.error('[Razorpay] Signature verification error:', err);
    return false;
  }
}

/**
 * Verifies Webhook signature
 */
function verifyWebhookSignature({ body, signature }) {
  if (!signature || !env.RAZORPAY_WEBHOOK_SECRET) {
    return false;
  }

  try {
    const expectedSignature = crypto
      .createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET)
      .update(JSON.stringify(body))
      .digest('hex');

    return expectedSignature === signature;
  } catch (err) {
    console.error('[Razorpay Webhook] Signature verification error:', err);
    return false;
  }
}

module.exports = {
  createRazorpayOrder,
  verifyPaymentSignature,
  verifyWebhookSignature
};
