export declare function getAllCoupons(): Promise<{
    id: number;
    createdAt: Date;
    updatedAt: Date;
    expiresAt: Date | null;
    code: string;
    discountType: string;
    discountAmount: import("@prisma/client/runtime/client").Decimal;
    minOrderValue: import("@prisma/client/runtime/client").Decimal | null;
    usageLimit: number | null;
    usedCount: number;
    isActive: boolean;
}[]>;
export declare function getCouponByCode(code: string): Promise<{
    id: number;
    createdAt: Date;
    updatedAt: Date;
    expiresAt: Date | null;
    code: string;
    discountType: string;
    discountAmount: import("@prisma/client/runtime/client").Decimal;
    minOrderValue: import("@prisma/client/runtime/client").Decimal | null;
    usageLimit: number | null;
    usedCount: number;
    isActive: boolean;
} | null>;
export declare function createCoupon(data: {
    code: string;
    discountType?: string;
    discountAmount: number;
    minOrderValue?: number;
    usageLimit?: number;
    expiresAt?: string;
}): Promise<{
    id: number;
    createdAt: Date;
    updatedAt: Date;
    expiresAt: Date | null;
    code: string;
    discountType: string;
    discountAmount: import("@prisma/client/runtime/client").Decimal;
    minOrderValue: import("@prisma/client/runtime/client").Decimal | null;
    usageLimit: number | null;
    usedCount: number;
    isActive: boolean;
}>;
export declare function toggleCouponStatus(id: number, isActive: boolean): Promise<{
    id: number;
    createdAt: Date;
    updatedAt: Date;
    expiresAt: Date | null;
    code: string;
    discountType: string;
    discountAmount: import("@prisma/client/runtime/client").Decimal;
    minOrderValue: import("@prisma/client/runtime/client").Decimal | null;
    usageLimit: number | null;
    usedCount: number;
    isActive: boolean;
}>;
export declare function deleteCoupon(id: number): Promise<{
    id: number;
    createdAt: Date;
    updatedAt: Date;
    expiresAt: Date | null;
    code: string;
    discountType: string;
    discountAmount: import("@prisma/client/runtime/client").Decimal;
    minOrderValue: import("@prisma/client/runtime/client").Decimal | null;
    usageLimit: number | null;
    usedCount: number;
    isActive: boolean;
}>;
//# sourceMappingURL=coupon.service.d.ts.map