import type { NextFunction, Request, Response } from "express";
import crypto from "node:crypto";
import { logger } from "../logger";

export function requestLogger(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const requestId =
    typeof req.headers["x-request-id"] === "string"
      ? req.headers["x-request-id"]
      : crypto.randomUUID();
  const startedAt = Date.now();

  res.setHeader("X-Request-Id", requestId);
  res.on("finish", () => {
    logger.info("request.completed", {
      requestId,
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: Date.now() - startedAt,
    });
  });

  next();
}
