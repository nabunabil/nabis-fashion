"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyCart = getMyCart;
exports.addItemToMyCart = addItemToMyCart;
exports.updateMyCartItemQuantity = updateMyCartItemQuantity;
exports.removeMyCartItem = removeMyCartItem;
exports.clearMyCart = clearMyCart;
const prisma_1 = require("../../lib/prisma");
async function getUserIdByEmail(email) {
    const user = await prisma_1.prisma.user.findUnique({
        where: { email },
        select: { id: true },
    });
    return user?.id ?? null;
}
async function getOrCreateCartByUserId(userId) {
    const existingCart = await prisma_1.prisma.cart.findFirst({
        where: { userId },
        select: { id: true },
        orderBy: { createdAt: "asc" },
    });
    if (existingCart) {
        return existingCart;
    }
    return prisma_1.prisma.cart.create({
        data: { userId },
        select: { id: true },
    });
}
const cartItemSelect = {
    id: true,
    quantity: true,
    productVariantId: true,
    productVariant: {
        select: {
            id: true,
            size: true,
            color: true,
            stock: true,
            product: {
                select: {
                    id: true,
                    title: true,
                    slug: true,
                    price: true,
                    discountPrice: true,
                    category: {
                        select: {
                            id: true,
                            name: true,
                            slug: true,
                        },
                    },
                    images: {
                        select: {
                            id: true,
                            imageUrl: true,
                        },
                    },
                },
            },
        },
    },
};
async function getCartWithItemsByUserId(userId) {
    return prisma_1.prisma.cart.findFirst({
        where: { userId },
        select: {
            id: true,
            userId: true,
            createdAt: true,
            items: {
                select: cartItemSelect,
                orderBy: { id: "asc" },
            },
        },
        orderBy: { createdAt: "asc" },
    });
}
function buildCartSummary(cart) {
    const items = cart?.items ?? [];
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => {
        const unitPrice = Number(item.productVariant.product.discountPrice ||
            item.productVariant.product.price);
        return sum + unitPrice * item.quantity;
    }, 0);
    return {
        totalItems: items.length,
        totalQuantity,
        subtotal,
    };
}
async function getMyCart(email) {
    const userId = await getUserIdByEmail(email);
    if (!userId) {
        return null;
    }
    let cart = await getCartWithItemsByUserId(userId);
    if (!cart) {
        await getOrCreateCartByUserId(userId);
        cart = await getCartWithItemsByUserId(userId);
    }
    return {
        cart,
        summary: buildCartSummary(cart),
    };
}
async function addItemToMyCart(email, productVariantId, quantity) {
    const userId = await getUserIdByEmail(email);
    if (!userId) {
        return null;
    }
    const productVariant = await prisma_1.prisma.productVariant.findUnique({
        where: { id: productVariantId },
        select: { id: true, stock: true },
    });
    if (!productVariant) {
        return null;
    }
    const cart = await getOrCreateCartByUserId(userId);
    const existingItem = await prisma_1.prisma.cartItem.findFirst({
        where: {
            cartId: cart.id,
            productVariantId,
        },
        select: { id: true, quantity: true },
    });
    const requestedQuantity = (existingItem?.quantity ?? 0) + quantity;
    if (requestedQuantity > productVariant.stock) {
        throw new Error("INSUFFICIENT_STOCK");
    }
    if (existingItem) {
        await prisma_1.prisma.cartItem.update({
            where: { id: existingItem.id },
            data: {
                quantity: existingItem.quantity + quantity,
            },
        });
    }
    else {
        await prisma_1.prisma.cartItem.create({
            data: {
                cartId: cart.id,
                productVariantId,
                quantity,
            },
        });
    }
    const updatedCart = await getCartWithItemsByUserId(userId);
    return {
        cart: updatedCart,
        summary: buildCartSummary(updatedCart),
    };
}
async function updateMyCartItemQuantity(email, productVariantId, quantity) {
    const userId = await getUserIdByEmail(email);
    if (!userId) {
        return null;
    }
    const cart = await getOrCreateCartByUserId(userId);
    const cartItem = await prisma_1.prisma.cartItem.findFirst({
        where: {
            cartId: cart.id,
            productVariantId,
        },
        select: {
            id: true,
            productVariant: { select: { stock: true } },
        },
    });
    if (!cartItem) {
        return null;
    }
    if (quantity > cartItem.productVariant.stock) {
        throw new Error("INSUFFICIENT_STOCK");
    }
    await prisma_1.prisma.cartItem.update({
        where: { id: cartItem.id },
        data: { quantity },
    });
    const updatedCart = await getCartWithItemsByUserId(userId);
    return {
        cart: updatedCart,
        summary: buildCartSummary(updatedCart),
    };
}
async function removeMyCartItem(email, productVariantId) {
    const userId = await getUserIdByEmail(email);
    if (!userId) {
        return null;
    }
    const cart = await getOrCreateCartByUserId(userId);
    const cartItem = await prisma_1.prisma.cartItem.findFirst({
        where: {
            cartId: cart.id,
            productVariantId,
        },
        select: { id: true },
    });
    if (!cartItem) {
        return null;
    }
    await prisma_1.prisma.cartItem.delete({
        where: { id: cartItem.id },
    });
    const updatedCart = await getCartWithItemsByUserId(userId);
    return {
        cart: updatedCart,
        summary: buildCartSummary(updatedCart),
    };
}
async function clearMyCart(email) {
    const userId = await getUserIdByEmail(email);
    if (!userId) {
        return null;
    }
    const cart = await getOrCreateCartByUserId(userId);
    await prisma_1.prisma.cartItem.deleteMany({
        where: { cartId: cart.id },
    });
    const updatedCart = await getCartWithItemsByUserId(userId);
    return {
        cart: updatedCart,
        summary: buildCartSummary(updatedCart),
    };
}
//# sourceMappingURL=cart.service.js.map