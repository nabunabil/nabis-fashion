"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireString = requireString;
exports.optionalString = optionalString;
exports.requirePositiveInt = requirePositiveInt;
exports.requireNonNegativeInt = requireNonNegativeInt;
exports.optionalBoolean = optionalBoolean;
exports.optionalImageUrl = optionalImageUrl;
const appError_1 = require("./errors/appError");
function requireString(value, field, maxLength = 500) {
    if (typeof value !== "string" || value.trim() === "") {
        throw new appError_1.AppError(400, `${field} is required`, "VALIDATION_ERROR");
    }
    const result = value.trim();
    if (result.length > maxLength) {
        throw new appError_1.AppError(400, `${field} must be at most ${maxLength} characters`, "VALIDATION_ERROR");
    }
    return result;
}
function optionalString(value, field, maxLength = 500) {
    if (value === undefined || value === null || value === "") {
        return undefined;
    }
    return requireString(value, field, maxLength);
}
function requirePositiveInt(value, field) {
    if (!Number.isInteger(value) || Number(value) <= 0) {
        throw new appError_1.AppError(400, `${field} must be a positive integer`, "VALIDATION_ERROR");
    }
    return Number(value);
}
function requireNonNegativeInt(value, field) {
    if (!Number.isInteger(value) || Number(value) < 0) {
        throw new appError_1.AppError(400, `${field} must be a non-negative integer`, "VALIDATION_ERROR");
    }
    return Number(value);
}
function optionalBoolean(value, fallback) {
    return typeof value === "boolean" ? value : fallback;
}
/** Accept only absolute HTTP(S) URLs. This prevents javascript:, data:, and
 * relative URLs from being persisted and later rendered as profile images. */
function optionalImageUrl(value) {
    if (value === undefined)
        return undefined;
    if (value === null || value === "")
        return null;
    if (typeof value !== "string") {
        throw new appError_1.AppError(400, "Image must be a valid URL", "VALIDATION_ERROR");
    }
    const str = value.trim();
    // Allow data URLs (e.g. data:image/png;base64,...)
    if (str.startsWith("data:image/")) {
        if (str.length > 15_000_000) {
            throw new appError_1.AppError(400, "Image file too large", "VALIDATION_ERROR");
        }
        return str;
    }
    let url;
    try {
        url = new URL(str);
    }
    catch {
        throw new appError_1.AppError(400, "Image must be a valid URL", "VALIDATION_ERROR");
    }
    if (url.protocol !== "https:" && url.protocol !== "http:" && url.protocol !== "data:") {
        throw new appError_1.AppError(400, "Image URL must use HTTP or HTTPS", "VALIDATION_ERROR");
    }
    return url.toString();
}
//# sourceMappingURL=validation.js.map