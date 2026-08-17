import type { NextFunction, Request, Response } from "express";
import { env } from "../../lib/env";

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

export function rateLimit(
  req: Request,
  res: Response,
  next: NextFunction,
): Response | void {
  const now = Date.now();
  const key = req.ip || req.socket.remoteAddress || "unknown";
  const current = buckets.get(key);
  const bucket =
    !current || current.resetAt <= now
      ? { count: 0, resetAt: now + env.rateLimitWindowMs }
      : current;

  bucket.count += 1;
  buckets.set(key, bucket);

  res.setHeader("RateLimit-Limit", String(env.rateLimitMax));
  res.setHeader(
    "RateLimit-Remaining",
    String(Math.max(env.rateLimitMax - bucket.count, 0)),
  );
  res.setHeader("RateLimit-Reset", String(Math.ceil(bucket.resetAt / 1000)));

  if (bucket.count > env.rateLimitMax) {
    return res.status(429).json({
      success: false,
      message: "Too many requests. Please try again later.",
      code: "RATE_LIMIT_EXCEEDED",
    });
  }

  next();
}
