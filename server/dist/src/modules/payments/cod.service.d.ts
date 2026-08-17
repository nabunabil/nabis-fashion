import { type ShippingInfo } from "../orders/order-workflow.service";
export declare function processCODOrder(userId: number, shipping: ShippingInfo): Promise<{
    items: {
        id: number;
        price: import("@prisma/client/runtime/client").Decimal;
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
    subtotal: import("@prisma/client/runtime/client").Decimal;
    discountTotal: import("@prisma/client/runtime/client").Decimal;
    deliveryFee: import("@prisma/client/runtime/client").Decimal;
    totalPrice: import("@prisma/client/runtime/client").Decimal;
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
//# sourceMappingURL=cod.service.d.ts.map