"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStripeCheckoutSession = createStripeCheckoutSession;
exports.createStripeRefund = createStripeRefund;
const env_1 = require("../lib/env");
const appError_1 = require("../shared/errors/appError");
function toMinorUnits(amount) {
    return Math.round(amount * 100);
}
async function stripeRequest(path, body, idempotencyKey) {
    if (!env_1.env.stripeSecretKey) {
        throw new appError_1.AppError(503, "Stripe is not configured", "STRIPE_NOT_CONFIGURED");
    }
    const response = await fetch(`https://api.stripe.com/v1${path}`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${env_1.env.stripeSecretKey}`,
            "Content-Type": "application/x-www-form-urlencoded",
            ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
        },
        body,
    });
    const payload = (await response.json());
    if (!response.ok) {
        throw new appError_1.AppError(502, payload.error?.message || "Stripe request failed", "STRIPE_REQUEST_FAILED");
    }
    return payload;
}
async function createStripeCheckoutSession(order) {
    const body = new URLSearchParams();
    body.set("mode", "payment");
    body.set("success_url", env_1.env.stripeSuccessUrl);
    body.set("cancel_url", `${env_1.env.stripeCancelUrl}?orderId=${order.id}`);
    body.set("customer_email", order.customerEmail);
    body.set("client_reference_id", String(order.id));
    body.set("metadata[orderId]", String(order.id));
    body.set("payment_intent_data[metadata][orderId]", String(order.id));
    order.items.forEach((item, index) => {
        const prefix = `line_items[${index}]`;
        body.set(`${prefix}[quantity]`, String(item.quantity));
        body.set(`${prefix}[price_data][currency]`, env_1.env.stripeCurrency);
        body.set(`${prefix}[price_data][unit_amount]`, String(toMinorUnits(item.price)));
        body.set(`${prefix}[price_data][product_data][name]`, `${item.productTitle} - ${item.size} / ${item.color}`);
        body.set(`${prefix}[price_data][product_data][metadata][sku]`, item.sku);
    });
    if (order.deliveryFee > 0) {
        const prefix = `line_items[${order.items.length}]`;
        body.set(`${prefix}[quantity]`, "1");
        body.set(`${prefix}[price_data][currency]`, env_1.env.stripeCurrency);
        body.set(`${prefix}[price_data][unit_amount]`, String(toMinorUnits(order.deliveryFee)));
        body.set(`${prefix}[price_data][product_data][name]`, "Delivery fee");
    }
    return stripeRequest("/checkout/sessions", body, `checkout-order-${order.id}`);
}
async function createStripeRefund(input) {
    const body = new URLSearchParams({
        payment_intent: input.paymentIntentId,
        "metadata[orderId]": String(input.orderId),
    });
    if (input.amount !== undefined) {
        body.set("amount", String(toMinorUnits(input.amount)));
    }
    return stripeRequest("/refunds", body, `refund-order-${input.orderId}-${input.amount ?? "full"}`);
}
//# sourceMappingURL=stripe.client.js.map