import { type ShippingInfo } from "../orders/order-workflow.service";
export declare function createCheckout(user: {
    id: number;
    email: string;
}, shipping: ShippingInfo): Promise<{
    orderId: number;
    sessionId: string;
    checkoutUrl: string;
    total: number;
    currency: string;
}>;
export declare function refundStripeOrder(input: {
    orderId: number;
    amount?: number;
    restock: boolean;
}): Promise<{
    orderId: number;
    refundId: string;
    status: string | null;
    amount: number;
    currency: string;
}>;
//# sourceMappingURL=stripe.service.d.ts.map