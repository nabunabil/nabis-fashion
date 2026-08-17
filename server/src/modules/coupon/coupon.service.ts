import { prisma } from "../../lib/prisma";

export async function getAllCoupons() {
  return prisma.coupon.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function getCouponByCode(code: string) {
  return prisma.coupon.findUnique({
    where: { code: code.toUpperCase().trim() },
  });
}

export async function createCoupon(data: {
  code: string;
  discountType?: string;
  discountAmount: number;
  minOrderValue?: number;
  usageLimit?: number;
  expiresAt?: string;
}) {
  return prisma.coupon.create({
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

export async function toggleCouponStatus(id: number, isActive: boolean) {
  return prisma.coupon.update({
    where: { id },
    data: { isActive },
  });
}

export async function deleteCoupon(id: number) {
  return prisma.coupon.delete({
    where: { id },
  });
}
