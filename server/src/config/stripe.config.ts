import { env } from "../lib/env";

export const stripeConfig = {
  secretKey: env.stripeSecretKey,
  publishableKey: env.stripePublicKey,
  webhookSecret: env.stripeWebhookSecret,
  currency: env.stripeCurrency,
};

export function isStripeConfigured(): boolean {
  return !!(stripeConfig.secretKey && stripeConfig.publishableKey);
}

export function isStripeWebhookConfigured(): boolean {
  return !!(
    stripeConfig.webhookSecret &&
    !stripeConfig.webhookSecret.includes("placeholder")
  );
}
