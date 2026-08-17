export declare function sendEmail({ to, subject, html, }: {
    to: string;
    subject: string;
    html: string;
}): Promise<any>;
type OrderItem = {
    quantity: number;
    price: number;
    medicine: {
        name: string;
    };
};
type OrderForEmail = {
    id: string;
    total: number;
    paymentMethod: string;
    shippingName: string;
    shippingEmail: string;
    address: string;
    createdAt: Date;
    items: OrderItem[];
};
export declare function sendOrderConfirmationEmail(order: OrderForEmail): Promise<any>;
export {};
//# sourceMappingURL=email.d.ts.map