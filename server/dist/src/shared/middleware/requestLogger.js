"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLogger = requestLogger;
const node_crypto_1 = __importDefault(require("node:crypto"));
const logger_1 = require("../logger");
function requestLogger(req, res, next) {
    const requestId = typeof req.headers["x-request-id"] === "string"
        ? req.headers["x-request-id"]
        : node_crypto_1.default.randomUUID();
    const startedAt = Date.now();
    res.setHeader("X-Request-Id", requestId);
    res.on("finish", () => {
        logger_1.logger.info("request.completed", {
            requestId,
            method: req.method,
            path: req.originalUrl,
            statusCode: res.statusCode,
            durationMs: Date.now() - startedAt,
        });
    });
    next();
}
//# sourceMappingURL=requestLogger.js.map