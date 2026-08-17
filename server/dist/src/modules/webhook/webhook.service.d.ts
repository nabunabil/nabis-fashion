export declare function verifyStripeSignature(rawBody: Buffer, signatureHeader: string, secret?: string, nowSeconds?: number): boolean;
export declare const WebhookService: {
    processStripeWebhook: (rawBody: Buffer, signature: string) => Promise<void>;
};
//# sourceMappingURL=webhook.service.d.ts.map