import { Prisma } from "@prisma/client";
export type InventoryMovementReason = string;
export type ShippingInfo = {
    name: string;
    number: string;
    address: string;
    city: string;
    county?: string;
    country: string;
    postalCode: string;
    isInsideCity: boolean;
    shippingTier?: "STANDARD" | "EXPRESS";
    deliveryInstructions?: string;
};
export declare function createOrderFromCart(userId: number, paymentMethod: "COD" | "STRIPE", shipping: ShippingInfo): Promise<{
    items: {
        id: number;
        price: Prisma.Decimal;
        sku: string;
        size: string;
        color: string;
        productVariantId: number;
        quantity: number;
        orderId: number;
        productTitle: string;
    }[];
} & {
    id: number;
    phone: string;
    createdAt: Date;
    updatedAt: Date;
    userId: number;
    subtotal: Prisma.Decimal;
    discountTotal: Prisma.Decimal;
    deliveryFee: Prisma.Decimal;
    totalPrice: Prisma.Decimal;
    orderStatus: string;
    paymentMethod: string;
    paymentStatus: string;
    stripePaymentIntent: string | null;
    stripeCheckoutSession: string | null;
    customerName: string;
    address: string;
    isInsideCity: boolean;
    deliveryInstructions: string | null;
    city: string;
    county: string | null;
    country: string;
    postalCode: string;
    inventoryRestoredAt: Date | null;
    cancelledAt: Date | null;
    refundedAt: Date | null;
}>;
export declare function restoreOrderInventory(orderId: number, reason: InventoryMovementReason): Promise<boolean>;
export declare function cancelOrderAndRestore(orderId: number, reason: InventoryMovementReason): Promise<void>;
//# sourceMappingURL=order-workflow.service.d.ts.map