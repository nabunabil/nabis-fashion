export interface InvoiceOrderData {
    id: number;
    createdAt?: Date | string;
    customerName?: string;
    address?: string;
    city?: string;
    postalCode?: string;
    country?: string;
    phone?: string;
    paymentMethod?: string;
    paymentStatus?: string;
    subtotal?: number;
    discountTotal?: number;
    deliveryFee?: number;
    totalPrice?: number;
    user?: {
        name?: string;
        email?: string;
    };
    items?: Array<{
        id?: number;
        productTitle?: string;
        size?: string;
        color?: string;
        quantity?: number;
        price?: number;
        productVariant?: {
            product?: {
                title?: string;
            };
        };
    }>;
}
export declare function createInvoicePdfBuffer(orderId: number): Promise<Buffer>;
//# sourceMappingURL=invoice.pdf.d.ts.map