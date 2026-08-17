"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrderFromCart = createOrderFromCart;
exports.restoreOrderInventory = restoreOrderInventory;
exports.cancelOrderAndRestore = cancelOrderAndRestore;
const client_1 = require("@prisma/client");
const env_1 = require("../../lib/env");
const prisma_1 = require("../../lib/prisma");
const appError_1 = require("../../shared/errors/appError");
function money(value) {
    return Number(value.toFixed(2));
}
function effectivePrice(price, discountPrice) {
    const regular = Number(price);
    const discount = Number(discountPrice);
    return discount > 0 && discount < regular ? discount : regular;
}
async function createOrderFromCart(userId, paymentMethod, shipping) {
    return prisma_1.prisma.$transaction(async (tx) => {
        const cart = await tx.cart.findUnique({
            where: { userId },
            include: {
                items: {
                    orderBy: { id: "asc" },
                    include: {
                        productVariant: {
                            include: {
                                product: true,
                            },
                        },
                    },
                },
            },
        });
        if (!cart || cart.items.length === 0) {
            throw new appError_1.AppError(400, "Cart is empty", "CART_EMPTY");
        }
        let subtotal = 0;
        let discountTotal = 0;
        for (const item of cart.items) {
            const variant = item.productVariant;
            const updated = await tx.productVariant.updateMany({
                where: {
                    id: variant.id,
                    stock: { gte: item.quantity },
                },
                data: {
                    stock: { decrement: item.quantity },
                },
            });
            if (updated.count !== 1) {
                throw new appError_1.AppError(409, `Insufficient stock for ${variant.product.title} (${variant.size}, ${variant.color})`, "INSUFFICIENT_STOCK");
            }
            const regularPrice = Number(variant.product.price);
            const unitPrice = effectivePrice(variant.product.price, variant.product.discountPrice);
            subtotal += unitPrice * item.quantity;
            discountTotal +=
                Math.max(regularPrice - unitPrice, 0) * item.quantity;
        }
        subtotal = money(subtotal);
        discountTotal = money(discountTotal);
        // Fetch dynamic shipping rates & threshold from storeSetting
        const storeSetting = await tx.storeSetting.findUnique({ where: { id: 1 } });
        const insideCityFee = storeSetting?.insideCityFee !== undefined ? Number(storeSetting.insideCityFee) : env_1.env.deliveryFeeInsideCity;
        const outsideCityFee = storeSetting?.outsideCityFee !== undefined ? Number(storeSetting.outsideCityFee) : env_1.env.deliveryFeeOutsideCity;
        const freeShippingMinOrder = storeSetting?.freeShippingMinOrder !== undefined ? Number(storeSetting.freeShippingMinOrder) : 300.00;
        let deliveryFee = 0;
        if (subtotal >= freeShippingMinOrder && shipping.shippingTier !== "EXPRESS") {
            deliveryFee = 0;
        }
        else if (shipping.shippingTier === "EXPRESS") {
            deliveryFee = outsideCityFee;
        }
        else {
            deliveryFee = shipping.isInsideCity ? insideCityFee : outsideCityFee;
        }
        const totalPrice = money(subtotal + deliveryFee);
        const initialPaymentStatus = paymentMethod === "COD" ? "due" : "pending";
        const order = await tx.order.create({
            data: {
                userId,
                subtotal,
                discountTotal,
                deliveryFee,
                totalPrice,
                orderStatus: "pending",
                paymentMethod,
                paymentStatus: initialPaymentStatus,
                customerName: shipping.name,
                phone: shipping.number,
                address: shipping.address,
                city: shipping.city,
                ...(shipping.county !== undefined ? { county: shipping.county } : {}),
                country: shipping.country,
                postalCode: shipping.postalCode,
                isInsideCity: shipping.isInsideCity,
                ...(shipping.deliveryInstructions !== undefined
                    ? { deliveryInstructions: shipping.deliveryInstructions }
                    : {}),
                items: {
                    create: cart.items.map((item) => {
                        const variant = item.productVariant;
                        return {
                            productVariantId: variant.id,
                            price: effectivePrice(variant.product.price, variant.product.discountPrice),
                            quantity: item.quantity,
                            productTitle: variant.product.title,
                            sku: variant.sku,
                            size: variant.size,
                            color: variant.color,
                        };
                    }),
                },
            },
            include: { items: true },
        });
        await tx.inventoryMovement.createMany({
            data: cart.items.map((item) => ({
                productVariantId: item.productVariantId,
                orderId: order.id,
                quantity: -item.quantity,
                reason: paymentMethod === "COD" ? "COD_ORDER" : "STRIPE_RESERVATION",
            })),
        });
        await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
        // Trigger notifications for user & admin
        try {
            await tx.notification.create({
                data: {
                    userId,
                    type: "ORDER_STATUS",
                    title: "Order Placed Successfully",
                    message: `Your order #${order.id} for $${Number(order.totalPrice).toFixed(2)} has been placed successfully.`,
                },
            });
            const admins = await tx.user.findMany({
                where: { role: { equals: "admin", mode: "insensitive" } },
                select: { id: true },
            });
            if (admins.length > 0) {
                await tx.notification.createMany({
                    data: admins.map((a) => ({
                        userId: a.id,
                        type: "SYSTEM",
                        title: "New Order Received",
                        message: `New order #${order.id} placed by ${shipping.name} ($${Number(order.totalPrice).toFixed(2)}).`,
                    })),
                });
            }
        }
        catch (e) {
            console.warn("Notification creation failed:", e);
        }
        return order;
    }, { isolationLevel: client_1.Prisma.TransactionIsolationLevel.Serializable });
}
async function restoreOrderInventory(orderId, reason) {
    return prisma_1.prisma.$transaction(async (tx) => {
        const claimed = await tx.order.updateMany({
            where: {
                id: orderId,
                inventoryRestoredAt: null,
            },
            data: {
                inventoryRestoredAt: new Date(),
            },
        });
        if (claimed.count !== 1) {
            return false;
        }
        const items = await tx.orderItem.findMany({ where: { orderId } });
        for (const item of items) {
            await tx.productVariant.update({
                where: { id: item.productVariantId },
                data: { stock: { increment: item.quantity } },
            });
        }
        await tx.inventoryMovement.createMany({
            data: items.map((item) => ({
                productVariantId: item.productVariantId,
                orderId,
                quantity: item.quantity,
                reason,
            })),
        });
        return true;
    }, { isolationLevel: client_1.Prisma.TransactionIsolationLevel.Serializable });
}
async function cancelOrderAndRestore(orderId, reason) {
    await restoreOrderInventory(orderId, reason);
    await prisma_1.prisma.order.update({
        where: { id: orderId },
        data: {
            orderStatus: "cancelled",
            cancelledAt: new Date(),
            paymentStatus: { set: "failed" },
        },
    });
}
//# sourceMappingURL=order-workflow.service.js.map