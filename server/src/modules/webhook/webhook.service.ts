import crypto from "node:crypto";
import { env } from "../../lib/env";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../shared/errors/appError";
import { logger } from "../../shared/logger";
import { cancelOrderAndRestore } from "../orders/order-workflow.service";

type StripeEventObject = {
  id?: string;
  payment_intent?: string | { id?: string };
  client_reference_id?: string;
  status?: string;
  amount_total?: number;
  amount?: number;
  currency?: string;
  metadata?: {
    orderId?: string;
  };
};

type StripeEvent = {
  id: string;
  type: string;
  data: {
    object: StripeEventObject;
  };
};

function safeCompareHex(expected: string, received: string): boolean {
  if (!/^[a-f0-9]+$/i.test(received)) return false;

  const expectedBuffer = Buffer.from(expected, "hex");
  const receivedBuffer = Buffer.from(received, "hex");
  return (
    expectedBuffer.length === receivedBuffer.length &&
    crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
  );
}

export function verifyStripeSignature(
  rawBody: Buffer,
  signatureHeader: string,
  secret = env.stripeWebhookSecret,
  nowSeconds = Date.now() / 1000,
): boolean {
  const parts = signatureHeader.split(",").map((part) => part.trim());
  const timestampPart = parts.find((part) => part.startsWith("t="));
  const signatures = parts
    .filter((part) => part.startsWith("v1="))
    .map((part) => part.slice(3));

  if (!timestampPart || signatures.length === 0) return false;

  const timestamp = Number(timestampPart.slice(2));
  if (
    !Number.isFinite(timestamp) ||
    Math.abs(nowSeconds - timestamp) > 300
  ) {
    return false;
  }

  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${timestamp}.${rawBody.toString("utf8")}`)
    .digest("hex");

  return signatures.some((signature) => safeCompareHex(expected, signature));
}

function getOrderId(object: StripeEventObject): number | null {
  const value = object.metadata?.orderId ?? object.client_reference_id;
  const orderId = Number(value);
  return Number.isInteger(orderId) && orderId > 0 ? orderId : null;
}

function getPaymentIntentId(object: StripeEventObject): string | null {
  if (typeof object.payment_intent === "string") return object.payment_intent;
  if (
    object.payment_intent &&
    typeof object.payment_intent.id === "string"
  ) {
    return object.payment_intent.id;
  }
  return object.id?.startsWith("pi_") ? object.id : null;
}

async function findOrderId(object: StripeEventObject): Promise<number | null> {
  const directOrderId = getOrderId(object);
  if (directOrderId) return directOrderId;

  const paymentIntentId = getPaymentIntentId(object);
  const order = await prisma.order.findFirst({
    where: {
      OR: [
        ...(object.id?.startsWith("cs_")
          ? [{ stripeCheckoutSession: object.id }]
          : []),
        ...(paymentIntentId
          ? [{ stripePaymentIntent: paymentIntentId }]
          : []),
      ],
    },
    select: { id: true },
  });
  return order?.id ?? null;
}

async function markOrderPaid(object: StripeEventObject): Promise<void> {
  const orderId = await findOrderId(object);
  const paymentIntentId = getPaymentIntentId(object);
  if (!orderId) {
    logger.warn("stripe.order_not_found", { objectId: object.id });
    return;
  }

  const order = await prisma.order.update({
    where: { id: orderId },
    data: {
      paymentMethod: "STRIPE",
      paymentStatus: "paid",
      orderStatus: "confirmed",
      ...(paymentIntentId ? { stripePaymentIntent: paymentIntentId } : {}),
      ...(object.id?.startsWith("cs_")
        ? { stripeCheckoutSession: object.id }
        : {}),
    },
  });

  const reference = paymentIntentId ?? object.id;
  if (reference) {
    await prisma.paymentTransaction.upsert({
      where: { providerReference: reference },
      create: {
        orderId,
        provider: "STRIPE",
        type: "PAYMENT",
        status: "succeeded",
        amount:
          object.amount_total !== undefined
            ? object.amount_total / 100
            : order.totalPrice,
        currency: object.currency ?? env.stripeCurrency,
        providerReference: reference,
      },
      update: { status: "succeeded" },
    });
  }
}

async function markOrderFailed(object: StripeEventObject): Promise<void> {
  const orderId = await findOrderId(object);
  if (!orderId) return;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { paymentStatus: true },
  });
  if (!order || order.paymentStatus === "paid") return;

  await cancelOrderAndRestore(orderId, "STRIPE_PAYMENT_FAILED");
  const reference = getPaymentIntentId(object) ?? object.id;
  if (reference) {
    await prisma.paymentTransaction.upsert({
      where: { providerReference: reference },
      create: {
        orderId,
        provider: "STRIPE",
        type: "PAYMENT",
        status: "failed",
        amount: object.amount ? object.amount / 100 : 0,
        currency: object.currency ?? env.stripeCurrency,
        providerReference: reference,
      },
      update: { status: "failed" },
    });
  }
}

async function processEvent(event: StripeEvent): Promise<void> {
  switch (event.type) {
    case "checkout.session.completed":
    case "payment_intent.succeeded":
      await markOrderPaid(event.data.object);
      return;
    case "checkout.session.expired":
    case "payment_intent.payment_failed":
      await markOrderFailed(event.data.object);
      return;
    case "refund.updated": {
      const orderId = await findOrderId(event.data.object);
      if (orderId && event.data.object.status === "failed") {
        const providerReference = event.data.object.id;
        if (!providerReference) return;
        await prisma.paymentTransaction.updateMany({
          where: { providerReference },
          data: { status: "failed" },
        });
      }
      return;
    }
    default:
      return;
  }
}

export const WebhookService = {
  processStripeWebhook: async (rawBody: Buffer, signature: string) => {
    if (!verifyStripeSignature(rawBody, signature)) {
      throw new AppError(
        401,
        "Invalid Stripe signature",
        "STRIPE_SIGNATURE_INVALID",
      );
    }

    let event: StripeEvent;
    try {
      event = JSON.parse(rawBody.toString("utf8")) as StripeEvent;
    } catch {
      throw new AppError(
        400,
        "Invalid JSON in webhook body",
        "STRIPE_BODY_INVALID",
      );
    }

    if (!event.id || !event.type || !event.data?.object) {
      throw new AppError(
        400,
        "Invalid Stripe event",
        "STRIPE_EVENT_INVALID",
      );
    }

    const existing = await prisma.webhookEvent.findUnique({
      where: {
        provider_eventId: {
          provider: "STRIPE",
          eventId: event.id,
        },
      },
    });
    if (existing?.processedAt) return;

    if (!existing) {
      try {
        await prisma.webhookEvent.create({
          data: {
            provider: "STRIPE",
            eventId: event.id,
            eventType: event.type,
          },
        });
      } catch (error) {
        const code = (error as { code?: string }).code;
        if (code !== "P2002") throw error;
      }
    }

    await processEvent(event);
    await prisma.webhookEvent.update({
      where: {
        provider_eventId: {
          provider: "STRIPE",
          eventId: event.id,
        },
      },
      data: { processedAt: new Date() },
    });

    logger.info("stripe.webhook_processed", {
      eventId: event.id,
      eventType: event.type,
    });
  },
};
