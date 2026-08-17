import dotenv from "dotenv";

dotenv.config();

function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(
      `${name} environment variable is required. Set it in your .env file locally or in your deployment environment.`,
    );
  }

  return value;
}

function parseCsv(value: string | undefined): string[] {
  if (!value) return [];

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseNonNegativeNumber(
  value: string | undefined,
  fallback: number,
): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 5000),
  databaseUrl: requireEnv("DATABASE_URL"),
  betterAuthSecret: process.env.BETTER_AUTH_SECRET || "default-secret-key-nabisfashton-2026",
  betterAuthUrl:
    process.env.BETTER_AUTH_URL ||
    process.env.TRUSTED_ORIGIN ||
    "http://localhost:3000",
  trustedOrigin: process.env.TRUSTED_ORIGIN || "http://localhost:3000",
  trustedOrigins: parseCsv(process.env.TRUSTED_ORIGINS),
  supportEmail:
    process.env.SUPPORT_EMAIL ||
    process.env.SMTP_FROM ||
    "support@nabisfashton.com",
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
  stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  stripePublicKey: process.env.STRIPE_PUBLIC_KEY,
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "whsec_fallback",
  stripeCurrency: process.env.STRIPE_CURRENCY || "gbp",
  stripeSuccessUrl:
    process.env.STRIPE_SUCCESS_URL ||
    `${process.env.TRUSTED_ORIGIN || "http://localhost:3000"}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
  stripeCancelUrl:
    process.env.STRIPE_CANCEL_URL ||
    `${process.env.TRUSTED_ORIGIN || "http://localhost:3000"}/checkout/cancel`,
  deliveryFeeInsideCity: parseNonNegativeNumber(
    process.env.DELIVERY_FEE_INSIDE_CITY,
    80,
  ),
  deliveryFeeOutsideCity: parseNonNegativeNumber(
    process.env.DELIVERY_FEE_OUTSIDE_CITY,
    150,
  ),
  rateLimitWindowMs: parseNonNegativeNumber(
    process.env.RATE_LIMIT_WINDOW_MS,
    60_000,
  ),
  rateLimitMax: parseNonNegativeNumber(process.env.RATE_LIMIT_MAX, 120),
  smtpUser: process.env.SMTP_USER,
  smtpPass: process.env.SMTP_PASS,
  smtpFromEmail: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER,
  vercel: process.env.VERCEL,
};
