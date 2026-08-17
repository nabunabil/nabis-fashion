"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const auth_1 = require("./lib/auth");
const env_1 = require("./lib/env");
const webhook_route_1 = require("./modules/webhook/webhook.route");
const user_routes_1 = __importDefault(require("./modules/user/user.routes"));
const category_routes_1 = __importDefault(require("./modules/category/category.routes"));
const cart_routes_1 = __importDefault(require("./modules/cart/cart.routes"));
const review_routes_1 = __importDefault(require("./modules/review/review.routes"));
const product_routes_1 = __importDefault(require("./modules/product/product.routes"));
const variant_routes_1 = __importDefault(require("./modules/variant/variant.routes"));
const payments_routes_1 = __importDefault(require("./modules/payments/payments.routes"));
const orders_routes_1 = __importDefault(require("./modules/orders/orders.routes"));
const coupon_routes_1 = __importDefault(require("./modules/coupon/coupon.routes"));
const setting_routes_1 = __importDefault(require("./modules/setting/setting.routes"));
const invoice_routes_1 = __importDefault(require("./modules/invoice/invoice.routes"));
const address_routes_1 = require("./modules/address/address.routes");
const notification_routes_1 = require("./modules/notification/notification.routes");
const app = (0, express_1.default)();
const allowedOrigins = [
    env_1.env.trustedOrigin,
    env_1.env.betterAuthUrl,
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
].filter(Boolean);
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin)
            return callback(null, true);
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
}));
app.use("/api/webhooks", webhook_route_1.webhookRouter);
app.use(express_1.default.json({ limit: "50mb" }));
app.use(express_1.default.urlencoded({ limit: "50mb", extended: true }));
let betterAuthHandlerCache = null;
app.use("/api/auth", async (req, res, next) => {
    try {
        if (!betterAuthHandlerCache) {
            const authInstance = await (0, auth_1.getAuth)();
            const { toNodeHandler } = await import("better-auth/node");
            betterAuthHandlerCache = toNodeHandler(authInstance);
        }
        return betterAuthHandlerCache(req, res);
    }
    catch (err) {
        next(err);
    }
});
app.use("/api/user", user_routes_1.default);
app.use("/api/categories", category_routes_1.default);
app.use("/api/cart", cart_routes_1.default);
app.use("/api/reviews", review_routes_1.default);
app.use("/api/products", product_routes_1.default);
app.use("/api/variants", variant_routes_1.default);
app.use("/api/payments", payments_routes_1.default);
app.use("/api/orders", orders_routes_1.default);
app.use("/api/coupons", coupon_routes_1.default);
app.use("/api/setting", setting_routes_1.default);
app.use("/api/invoice", invoice_routes_1.default);
app.use("/api/addresses", address_routes_1.addressRoutes);
app.use("/api/notifications", notification_routes_1.notificationRoutes);
app.get("/", (_req, res) => {
    res.json({
        success: true,
        message: "Nabis Fashton API is running",
        version: "1.0.0",
    });
});
app.get("/health", (_req, res) => {
    res.json({ status: "ok", service: "Nabis Fashton API" });
});
app.use((err, _req, res, _next) => {
    const statusCode = err.statusCode;
    const code = err.code;
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
    const PORT = env_1.env.port || 5000;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}
exports.default = app;
//# sourceMappingURL=index.js.map