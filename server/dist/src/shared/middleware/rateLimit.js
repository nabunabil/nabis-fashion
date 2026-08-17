"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimit = rateLimit;
const env_1 = require("../../lib/env");
const buckets = new Map();
function rateLimit(req, res, next) {
    const now = Date.now();
    const key = req.ip || req.socket.remoteAddress || "unknown";
    const current = buckets.get(key);
    const bucket = !current || current.resetAt <= now
        ? { count: 0, resetAt: now + env_1.env.rateLimitWindowMs }
        : current;
    bucket.count += 1;
    buckets.set(key, bucket);
    res.setHeader("RateLimit-Limit", String(env_1.env.rateLimitMax));
    res.setHeader("RateLimit-Remaining", String(Math.max(env_1.env.rateLimitMax - bucket.count, 0)));
    res.setHeader("RateLimit-Reset", String(Math.ceil(bucket.resetAt / 1000)));
    if (bucket.count > env_1.env.rateLimitMax) {
        return res.status(429).json({
            success: false,
            message: "Too many requests. Please try again later.",
            code: "RATE_LIMIT_EXCEEDED",
        });
    }
    next();
}
//# sourceMappingURL=rateLimit.js.map