"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCheckout = createCheckout;
exports.refundStripeOrder = refundStripeOrder;
const stripe_client_1 = require("../../config/stripe.client");
const env_1 = require("../../lib/env");
const prisma_1 = require("../../lib/prisma");
const appError_1 = require("../../shared/errors/appError");
const order_workflow_service_1 = require("../orders/order-workflow.service");
async function createCheckout(user, shipping) {
    const createdOrder = await (0, order_workflow_service_1.createOrderFromCart)(user.id, "STRIPE", shipping);
    const order = await prisma_1.prisma.order.findUniqueOrThrow({
        where: { id: createdOrder.id },
        include: { items: true },
    });
    try {
        const session = await (0, stripe_client_1.createStripeCheckoutSession)({
            id: order.id,
            customerEmail: user.email,
            deliveryFee: Number(order.deliveryFee),
            items: order.items.map((item) => ({
                productTitle: item.productTitle,
                sku: item.sku,
                size: item.size,
                color: item.color,
                price: Number(item.price),
                quantity: item.quantity,
            })),
        });
        if (!session.url) {
            throw new appError_1.AppError(502, "Stripe did not return a checkout URL", "STRIPE_CHECKOUT_URL_MISSING");
        }
        await prisma_1.prisma.$transaction([
            prisma_1.prisma.order.update({
                where: { id: order.id },
                data: {
                    stripeCheckoutSession: session.id,
                    ...(session.payment_intent
                        ? { stripePaymentIntent: session.payment_intent }
                        : {}),
                },
            }),
            prisma_1.prisma.paymentTransaction.create({
                data: {
                    orderId: order.id,
                    provider: "STRIPE",
                    type: "PAYMENT",
                    status: "pending",
                    amount: order.totalPrice,
                    currency: env_1.env.stripeCurrency,
                    providerReference: session.id,
                },
            }),
        ]);
        return {
            orderId: order.id,
            sessionId: session.id,
            checkoutUrl: session.url,
            total: Number(order.totalPrice),
            currency: env_1.env.stripeCurrency,
        };
    }
    catch (error) {
        await (0, order_workflow_service_1.cancelOrderAndRestore)(order.id, "STRIPE_CHECKOUT_CREATION_FAILED");
        throw error;
    }
}
async function refundStripeOrder(input) {
    const order = await prisma_1.prisma.order.findUnique({
        where: { id: input.orderId },
    });
    if (!order) {
        throw new appError_1.AppError(404, "Order not found", "ORDER_NOT_FOUND");
    }
    if (order.paymentStatus !== "paid" || !order.stripePaymentIntent) {
        throw new appError_1.AppError(409, "Only paid Stripe orders can be refunded", "ORDER_NOT_REFUNDABLE");
    }
    const total = Number(order.totalPrice);
    if (input.amount !== undefined &&
        (!Number.isFinite(input.amount) ||
            input.amount <= 0 ||
            input.amount > total)) {
        throw new appError_1.AppError(400, "Refund amount must be greater than zero and no more than the order total", "INVALID_REFUND_AMOUNT");
    }
    const refund = await (0, stripe_client_1.createStripeRefund)({
        orderId: order.id,
        paymentIntentId: order.stripePaymentIntent,
        ...(input.amount === undefined ? {} : { amount: input.amount }),
    });
    const isFullRefund = input.amount === undefined || input.amount >= Number(order.totalPrice);
    const paymentStatus = refund.status === "succeeded"
        ? "succeeded"
        : refund.status === "failed"
            ? "failed"
            : refund.status === "canceled"
                ? "canceled"
                : "pending";
    await prisma_1.prisma.$transaction([
        prisma_1.prisma.paymentTransaction.create({
            data: {
                orderId: order.id,
                provider: "STRIPE",
                type: "REFUND",
                status: paymentStatus,
                amount: refund.amount / 100,
                currency: refund.currency,
                providerReference: refund.id,
            },
        }),
        prisma_1.prisma.order.update({
            where: { id: order.id },
            data: {
                paymentStatus: isFullRefund ? "refunded" : "partially_refunded",
                ...(isFullRefund ? { refundedAt: new Date() } : {}),
            },
        }),
    ]);
    if (isFullRefund && input.restock) {
        await (0, order_workflow_service_1.restoreOrderInventory)(order.id, "STRIPE_REFUND");
    }
    return {
        orderId: order.id,
        refundId: refund.id,
        status: refund.status,
        amount: refund.amount / 100,
        currency: refund.currency,
    };
}
//# sourceMappingURL=stripe.service.js.map