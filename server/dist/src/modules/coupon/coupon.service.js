"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllCoupons = getAllCoupons;
exports.getCouponByCode = getCouponByCode;
exports.createCoupon = createCoupon;
exports.toggleCouponStatus = toggleCouponStatus;
exports.deleteCoupon = deleteCoupon;
const prisma_1 = require("../../lib/prisma");
async function getAllCoupons() {
    return prisma_1.prisma.coupon.findMany({
        orderBy: { createdAt: "desc" },
    });
}
async function getCouponByCode(code) {
    return prisma_1.prisma.coupon.findUnique({
        where: { code: code.toUpperCase().trim() },
    });
}
async function createCoupon(data) {
    return prisma_1.prisma.coupon.create({
        data: {
            code: data.code.toUpperCase().trim(),
            discountType: data.discountType || "percentage",
            discountAmount: data.discountAmount,
            minOrderValue: data.minOrderValue || 0,
            usageLimit: data.usageLimit || 100,
            expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        },
    });
}
async function toggleCouponStatus(id, isActive) {
    return prisma_1.prisma.coupon.update({
        where: { id },
        data: { isActive },
    });
}
async function deleteCoupon(id) {
    return prisma_1.prisma.coupon.delete({
        where: { id },
    });
}
//# sourceMappingURL=coupon.service.js.map