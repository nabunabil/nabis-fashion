import { OrderStatus } from "@prisma/client";
export interface OrderQueryOptions {
    page?: number | undefined;
    limit?: number | undefined;
    status?: string | undefined;
    search?: string | undefined;
}
export declare function listPaginatedOrders(options?: OrderQueryOptions): Promise<{
    orders: ({
        user: {
            name: string;
            id: number;
            email: string;
            image: string | null;
        };
        items: ({
            productVariant: {
                id: number;
                productId: number;
            };
        } & {
            id: number;
            price: import("@prisma/client/runtime/client").Decimal;
            sku: string;
            size: string;
            color: string;
            productVariantId: number;
            quantity: number;
            orderId: number;
            productTitle: string;
        })[];
        payments: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            status: string;
            type: string;
            orderId: number;
            provider: string;
            amount: import("@prisma/client/runtime/client").Decimal;
            currency: string;
            providerReference: string | null;
            metadata: import("@prisma/client/runtime/client").JsonValue | null;
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
    })[];
    totalOrders: number;
    totalPages: number;
    currentPage: number;
    limit: number;
}>;
export declare function listOrders(): import("@prisma/client").Prisma.PrismaPromise<({
    user: {
        name: string;
        id: number;
        email: string;
        image: string | null;
    };
    items: ({
        productVariant: {
            id: number;
            productId: number;
        };
    } & {
        id: number;
        price: import("@prisma/client/runtime/client").Decimal;
        sku: string;
        size: string;
        color: string;
        productVariantId: number;
        quantity: number;
        orderId: number;
        productTitle: string;
    })[];
    payments: {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        type: string;
        orderId: number;
        provider: string;
        amount: import("@prisma/client/runtime/client").Decimal;
        currency: string;
        providerReference: string | null;
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
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
})[]>;
export declare function getOrderById(id: number): import("@prisma/client").Prisma.Prisma__OrderClient<({
    user: {
        name: string;
        id: number;
        email: string;
        image: string | null;
    };
    items: ({
        productVariant: {
            id: number;
            productId: number;
        };
    } & {
        id: number;
        price: import("@prisma/client/runtime/client").Decimal;
        sku: string;
        size: string;
        color: string;
        productVariantId: number;
        quantity: number;
        orderId: number;
        productTitle: string;
    })[];
    payments: {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        type: string;
        orderId: number;
        provider: string;
        amount: import("@prisma/client/runtime/client").Decimal;
        currency: string;
        providerReference: string | null;
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
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
}) | null, null, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
export declare function listMyOrders(userId: number): import("@prisma/client").Prisma.PrismaPromise<({
    user: {
        name: string;
        id: number;
        email: string;
        image: string | null;
    };
    items: ({
        productVariant: {
            id: number;
            productId: number;
        };
    } & {
        id: number;
        price: import("@prisma/client/runtime/client").Decimal;
        sku: string;
        size: string;
        color: string;
        productVariantId: number;
        quantity: number;
        orderId: number;
        productTitle: string;
    })[];
    payments: {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        type: string;
        orderId: number;
        provider: string;
        amount: import("@prisma/client/runtime/client").Decimal;
        currency: string;
        providerReference: string | null;
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
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
})[]>;
export declare function getMyOrderById(userId: number, id: number): import("@prisma/client").Prisma.Prisma__OrderClient<({
    user: {
        name: string;
        id: number;
        email: string;
        image: string | null;
    };
    items: ({
        productVariant: {
            id: number;
            productId: number;
        };
    } & {
        id: number;
        price: import("@prisma/client/runtime/client").Decimal;
        sku: string;
        size: string;
        color: string;
        productVariantId: number;
        quantity: number;
        orderId: number;
        productTitle: string;
    })[];
    payments: {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        type: string;
        orderId: number;
        provider: string;
        amount: import("@prisma/client/runtime/client").Decimal;
        currency: string;
        providerReference: string | null;
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
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
}) | null, null, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
export declare function cancelMyOrder(userId: number, id: number): Promise<void>;
export declare function updateOrder(id: number, payload: Record<string, unknown>): Promise<{
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
export declare function updateOrderStatus(id: number, orderStatus: OrderStatus | string): Promise<{
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
} | null>;
//# sourceMappingURL=orders.service.d.ts.map