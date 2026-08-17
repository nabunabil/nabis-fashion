"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listVariants = listVariants;
exports.getVariant = getVariant;
exports.createVariant = createVariant;
exports.updateVariant = updateVariant;
exports.deleteVariant = deleteVariant;
const prisma_1 = require("../../lib/prisma");
const appError_1 = require("../../shared/errors/appError");
const variantInclude = {
    product: {
        select: { id: true, title: true, slug: true },
    },
};
function listVariants(productId) {
    return prisma_1.prisma.productVariant.findMany({
        ...(productId ? { where: { productId } } : {}),
        include: variantInclude,
        orderBy: [{ productId: "asc" }, { id: "asc" }],
    });
}
function getVariant(id) {
    return prisma_1.prisma.productVariant.findUnique({
        where: { id },
        include: variantInclude,
    });
}
async function createVariant(input) {
    return prisma_1.prisma.$transaction(async (tx) => {
        const variant = await tx.productVariant.create({
            data: input,
            include: variantInclude,
        });
        if (input.stock > 0) {
            await tx.inventoryMovement.create({
                data: {
                    productVariantId: variant.id,
                    quantity: input.stock,
                    reason: "INITIAL_STOCK",
                },
            });
        }
        return variant;
    });
}
async function updateVariant(id, input) {
    return prisma_1.prisma.$transaction(async (tx) => {
        const current = await tx.productVariant.findUnique({ where: { id } });
        if (!current) {
            throw new appError_1.AppError(404, "Variant not found", "VARIANT_NOT_FOUND");
        }
        const variant = await tx.productVariant.update({
            where: { id },
            data: input,
            include: variantInclude,
        });
        if (input.stock !== undefined && input.stock !== current.stock) {
            await tx.inventoryMovement.create({
                data: {
                    productVariantId: id,
                    quantity: input.stock - current.stock,
                    reason: "ADMIN_ADJUSTMENT",
                },
            });
        }
        return variant;
    });
}
async function deleteVariant(id) {
    const orderItemCount = await prisma_1.prisma.orderItem.count({
        where: { productVariantId: id },
    });
    if (orderItemCount > 0) {
        throw new appError_1.AppError(409, "Variants used by orders cannot be deleted", "VARIANT_HAS_ORDERS");
    }
    return prisma_1.prisma.productVariant.delete({ where: { id } });
}
//# sourceMappingURL=variant.service.js.map