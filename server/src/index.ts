import express from "express";
import type { Request, Response, NextFunction } from "express";
import cors from "cors";
import { getAuth } from "./lib/auth";
import { env } from "./lib/env";

import { webhookRouter } from "./modules/webhook/webhook.route";
import userRoutes from "./modules/user/user.routes";
import categoryRoutes from "./modules/category/category.routes";
import cartRoutes from "./modules/cart/cart.routes";
import reviewRoutes from "./modules/review/review.routes";
import productRoutes from "./modules/product/product.routes";
import variantRoutes from "./modules/variant/variant.routes";
import paymentsRoutes from "./modules/payments/payments.routes";
import ordersRoutes from "./modules/orders/orders.routes";
import couponRoutes from "./modules/coupon/coupon.routes";
import settingRoutes from "./modules/setting/setting.routes";
import invoiceRoutes from "./modules/invoice/invoice.routes";
import { addressRoutes } from "./modules/address/address.routes";
import { notificationRoutes } from "./modules/notification/notification.routes";

const app: express.Express = express();

const allowedOrigins = [
  env.trustedOrigin,
  env.betterAuthUrl,
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
      "Cookie",
      "X-CSRF-Token",
    ],
    exposedHeaders: ["Set-Cookie", "Content-Length"],
    maxAge: 86400,
  }),
);

app.use("/api/webhooks", webhookRouter);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

let betterAuthHandlerCache: any = null;
app.use("/api/auth", async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!betterAuthHandlerCache) {
      const authInstance = await getAuth();
      const { toNodeHandler } = await import("better-auth/node");
      betterAuthHandlerCache = toNodeHandler(authInstance);
    }
    return betterAuthHandlerCache(req, res);
  } catch (err) {
    next(err);
  }
});
app.use("/api/user", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/products", productRoutes);
app.use("/api/variants", variantRoutes);
app.use("/api/payments", paymentsRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/setting", settingRoutes);
app.use("/api/invoice", invoiceRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/notifications", notificationRoutes);

app.get("/", (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: "Nabis Fashton API is running",
    version: "1.0.0",
  });
});

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", service: "Nabis Fashton API" });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  const statusCode = (err as { statusCode?: number }).statusCode;
  const code = (err as { code?: string }).code;

  if (typeof statusCode === "number") {
    return res.status(statusCode).json({
      success: false,
      message: err.message,
      ...(code ? { code } : {}),
    });
  }

  console.error("Request failed:", err);

  return res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

if (!process.env.VERCEL) {
  const PORT = env.port || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
