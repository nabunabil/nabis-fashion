type StripeCheckoutOrder = {
    id: number;
    customerEmail: string;
    deliveryFee: number;
    items: Array<{
        productTitle: string;
        sku: string;
        size: string;
        color: string;
        price: number;
        quantity: number;
    }>;
};
type StripeCheckoutResponse = {
    id: string;
    url: string | null;
    payment_intent?: string | null;
};
type StripeRefundResponse = {
    id: string;
    status: string | null;
    amount: number;
    currency: string;
    payment_intent: string;
};
export declare function createStripeCheckoutSession(order: StripeCheckoutOrder): Promise<StripeCheckoutResponse>;
export declare function createStripeRefund(input: {
    orderId: number;
    paymentIntentId: string;
    amount?: number;
}): Promise<StripeRefundResponse>;
export {};
//# sourceMappingURL=stripe.client.d.ts.map