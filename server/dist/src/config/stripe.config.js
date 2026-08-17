"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripeConfig = void 0;
exports.isStripeConfigured = isStripeConfigured;
exports.isStripeWebhookConfigured = isStripeWebhookConfigured;
const env_1 = require("../lib/env");
exports.stripeConfig = {
    secretKey: env_1.env.stripeSecretKey,
    publishableKey: env_1.env.stripePublicKey,
    webhookSecret: env_1.env.stripeWebhookSecret,
    currency: env_1.env.stripeCurrency,
};
function isStripeConfigured() {
    return !!(exports.stripeConfig.secretKey && exports.stripeConfig.publishableKey);
}
function isStripeWebhookConfigured() {
    return !!(exports.stripeConfig.webhookSecret &&
        !exports.stripeConfig.webhookSecret.includes("placeholder"));
}
//# sourceMappingURL=stripe.config.js.map