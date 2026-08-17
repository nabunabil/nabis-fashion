import { env } from "../lib/env";
import { AppError } from "../shared/errors/appError";

type StripeCheckoutOrder = {
  id: number;
  customerEmail: string;
  deliveryFee: number;
  items: Array<{
    productTitle: string;
    sku: string;
    size: string;
    color: string;
    price: number;
    quantity: number;
  }>;
};

type StripeCheckoutResponse = {
  id: string;
  url: string | null;
  payment_intent?: string | null;
};

type StripeRefundResponse = {
  id: string;
  status: string | null;
  amount: number;
  currency: string;
  payment_intent: string;
};

function toMinorUnits(amount: number): number {
  return Math.round(amount * 100);
}

async function stripeRequest<T>(
  path: string,
  body: URLSearchParams,
  idempotencyKey?: string,
): Promise<T> {
  if (!env.stripeSecretKey) {
    throw new AppError(
      503,
      "Stripe is not configured",
      "STRIPE_NOT_CONFIGURED",
    );
  }

  const response = await fetch(`https://api.stripe.com/v1${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.stripeSecretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
      ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
    },
    body,
  });
  const payload = (await response.json()) as {
    error?: { message?: string };
  } & T;

  if (!response.ok) {
    throw new AppError(
      502,
      payload.error?.message || "Stripe request failed",
      "STRIPE_REQUEST_FAILED",
    );
  }

  return payload;
}

export async function createStripeCheckoutSession(
  order: StripeCheckoutOrder,
): Promise<StripeCheckoutResponse> {
  const body = new URLSearchParams();
  body.set("mode", "payment");
  body.set("success_url", env.stripeSuccessUrl);
  body.set("cancel_url", `${env.stripeCancelUrl}?orderId=${order.id}`);
  body.set("customer_email", order.customerEmail);
  body.set("client_reference_id", String(order.id));
  body.set("metadata[orderId]", String(order.id));
  body.set("payment_intent_data[metadata][orderId]", String(order.id));

  order.items.forEach((item, index) => {
    const prefix = `line_items[${index}]`;
    body.set(`${prefix}[quantity]`, String(item.quantity));
    body.set(`${prefix}[price_data][currency]`, env.stripeCurrency);
    body.set(
      `${prefix}[price_data][unit_amount]`,
      String(toMinorUnits(item.price)),
    );
    body.set(
      `${prefix}[price_data][product_data][name]`,
      `${item.productTitle} - ${item.size} / ${item.color}`,
    );
    body.set(`${prefix}[price_data][product_data][metadata][sku]`, item.sku);
  });

  if (order.deliveryFee > 0) {
    const prefix = `line_items[${order.items.length}]`;
    body.set(`${prefix}[quantity]`, "1");
    body.set(`${prefix}[price_data][currency]`, env.stripeCurrency);
    body.set(
      `${prefix}[price_data][unit_amount]`,
      String(toMinorUnits(order.deliveryFee)),
    );
    body.set(`${prefix}[price_data][product_data][name]`, "Delivery fee");
  }

  return stripeRequest<StripeCheckoutResponse>(
    "/checkout/sessions",
    body,
    `checkout-order-${order.id}`,
  );
}

export async function createStripeRefund(input: {
  orderId: number;
  paymentIntentId: string;
  amount?: number;
}): Promise<StripeRefundResponse> {
  const body = new URLSearchParams({
    payment_intent: input.paymentIntentId,
    "metadata[orderId]": String(input.orderId),
  });

  if (input.amount !== undefined) {
    body.set("amount", String(toMinorUnits(input.amount)));
  }

  return stripeRequest<StripeRefundResponse>(
    "/refunds",
    body,
    `refund-order-${input.orderId}-${input.amount ?? "full"}`,
  );
}
