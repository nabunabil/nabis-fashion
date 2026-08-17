"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookService = void 0;
exports.verifyStripeSignature = verifyStripeSignature;
const node_crypto_1 = __importDefault(require("node:crypto"));
const env_1 = require("../../lib/env");
const prisma_1 = require("../../lib/prisma");
const appError_1 = require("../../shared/errors/appError");
const logger_1 = require("../../shared/logger");
const order_workflow_service_1 = require("../orders/order-workflow.service");
function safeCompareHex(expected, received) {
    if (!/^[a-f0-9]+$/i.test(received))
        return false;
    const expectedBuffer = Buffer.from(expected, "hex");
    const receivedBuffer = Buffer.from(received, "hex");
    return (expectedBuffer.length === receivedBuffer.length &&
        node_crypto_1.default.timingSafeEqual(expectedBuffer, receivedBuffer));
}
function verifyStripeSignature(rawBody, signatureHeader, secret = env_1.env.stripeWebhookSecret, nowSeconds = Date.now() / 1000) {
    const parts = signatureHeader.split(",").map((part) => part.trim());
    const timestampPart = parts.find((part) => part.startsWith("t="));
    const signatures = parts
        .filter((part) => part.startsWith("v1="))
        .map((part) => part.slice(3));
    if (!timestampPart || signatures.length === 0)
        return false;
    const timestamp = Number(timestampPart.slice(2));
    if (!Number.isFinite(timestamp) ||
        Math.abs(nowSeconds - timestamp) > 300) {
        return false;
    }
    const expected = node_crypto_1.default
        .createHmac("sha256", secret)
        .update(`${timestamp}.${rawBody.toString("utf8")}`)
        .digest("hex");
    return signatures.some((signature) => safeCompareHex(expected, signature));
}
function getOrderId(object) {
    const value = object.metadata?.orderId ?? object.client_reference_id;
    const orderId = Number(value);
    return Number.isInteger(orderId) && orderId > 0 ? orderId : null;
}
function getPaymentIntentId(object) {
    if (typeof object.payment_intent === "string")
        return object.payment_intent;
    if (object.payment_intent &&
        typeof object.payment_intent.id === "string") {
        return object.payment_intent.id;
    }
    return object.id?.startsWith("pi_") ? object.id : null;
}
async function findOrderId(object) {
    const directOrderId = getOrderId(object);
    if (directOrderId)
        return directOrderId;
    const paymentIntentId = getPaymentIntentId(object);
    const order = await prisma_1.prisma.order.findFirst({
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
async function markOrderPaid(object) {
    const orderId = await findOrderId(object);
    const paymentIntentId = getPaymentIntentId(object);
    if (!orderId) {
        logger_1.logger.warn("stripe.order_not_found", { objectId: object.id });
        return;
    }
    const order = await prisma_1.prisma.order.update({
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
        await prisma_1.prisma.paymentTransaction.upsert({
            where: { providerReference: reference },
            create: {
                orderId,
                provider: "STRIPE",
                type: "PAYMENT",
                status: "succeeded",
                amount: object.amount_total !== undefined
                    ? object.amount_total / 100
                    : order.totalPrice,
                currency: object.currency ?? env_1.env.stripeCurrency,
                providerReference: reference,
            },
            update: { status: "succeeded" },
        });
    }
}
async function markOrderFailed(object) {
    const orderId = await findOrderId(object);
    if (!orderId)
        return;
    const order = await prisma_1.prisma.order.findUnique({
        where: { id: orderId },
        select: { paymentStatus: true },
    });
    if (!order || order.paymentStatus === "paid")
        return;
    await (0, order_workflow_service_1.cancelOrderAndRestore)(orderId, "STRIPE_PAYMENT_FAILED");
    const reference = getPaymentIntentId(object) ?? object.id;
    if (reference) {
        await prisma_1.prisma.paymentTransaction.upsert({
            where: { providerReference: reference },
            create: {
                orderId,
                provider: "STRIPE",
                type: "PAYMENT",
                status: "failed",
                amount: object.amount ? object.amount / 100 : 0,
                currency: object.currency ?? env_1.env.stripeCurrency,
                providerReference: reference,
            },
            update: { status: "failed" },
        });
    }
}
async function processEvent(event) {
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
                if (!providerReference)
                    return;
                await prisma_1.prisma.paymentTransaction.updateMany({
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
exports.WebhookService = {
    processStripeWebhook: async (rawBody, signature) => {
        if (!verifyStripeSignature(rawBody, signature)) {
            throw new appError_1.AppError(401, "Invalid Stripe signature", "STRIPE_SIGNATURE_INVALID");
        }
        let event;
        try {
            event = JSON.parse(rawBody.toString("utf8"));
        }
        catch {
            throw new appError_1.AppError(400, "Invalid JSON in webhook body", "STRIPE_BODY_INVALID");
        }
        if (!event.id || !event.type || !event.data?.object) {
            throw new appError_1.AppError(400, "Invalid Stripe event", "STRIPE_EVENT_INVALID");
        }
        const existing = await prisma_1.prisma.webhookEvent.findUnique({
            where: {
                provider_eventId: {
                    provider: "STRIPE",
                    eventId: event.id,
                },
            },
        });
        if (existing?.processedAt)
            return;
        if (!existing) {
            try {
                await prisma_1.prisma.webhookEvent.create({
                    data: {
                        provider: "STRIPE",
                        eventId: event.id,
                        eventType: event.type,
                    },
                });
            }
            catch (error) {
                const code = error.code;
                if (code !== "P2002")
                    throw error;
            }
        }
        await processEvent(event);
        await prisma_1.prisma.webhookEvent.update({
            where: {
                provider_eventId: {
                    provider: "STRIPE",
                    eventId: event.id,
                },
            },
            data: { processedAt: new Date() },
        });
        logger_1.logger.info("stripe.webhook_processed", {
            eventId: event.id,
            eventType: event.type,
        });
    },
};
//# sourceMappingURL=webhook.service.js.map