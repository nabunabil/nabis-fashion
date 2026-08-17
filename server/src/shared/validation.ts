import { AppError } from "./errors/appError";

export function requireString(
  value: unknown,
  field: string,
  maxLength = 500,
): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new AppError(400, `${field} is required`, "VALIDATION_ERROR");
  }

  const result = value.trim();
  if (result.length > maxLength) {
    throw new AppError(
      400,
      `${field} must be at most ${maxLength} characters`,
      "VALIDATION_ERROR",
    );
  }

  return result;
}

export function optionalString(
  value: unknown,
  field: string,
  maxLength = 500,
): string | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  return requireString(value, field, maxLength);
}

export function requirePositiveInt(value: unknown, field: string): number {
  if (!Number.isInteger(value) || Number(value) <= 0) {
    throw new AppError(
      400,
      `${field} must be a positive integer`,
      "VALIDATION_ERROR",
    );
  }

  return Number(value);
}

export function requireNonNegativeInt(value: unknown, field: string): number {
  if (!Number.isInteger(value) || Number(value) < 0) {
    throw new AppError(
      400,
      `${field} must be a non-negative integer`,
      "VALIDATION_ERROR",
    );
  }

  return Number(value);
}

export function optionalBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

/** Accept only absolute HTTP(S) URLs. This prevents javascript:, data:, and
 * relative URLs from being persisted and later rendered as profile images. */
export function optionalImageUrl(value: unknown): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;

  if (typeof value !== "string") {
    throw new AppError(400, "Image must be a valid URL", "VALIDATION_ERROR");
  }

  const str = value.trim();

  // Allow data URLs (e.g. data:image/png;base64,...)
  if (str.startsWith("data:image/")) {
    if (str.length > 15_000_000) {
      throw new AppError(400, "Image file too large", "VALIDATION_ERROR");
    }
    return str;
  }

  let url: URL;
  try {
    url = new URL(str);
  } catch {
    throw new AppError(400, "Image must be a valid URL", "VALIDATION_ERROR");
  }

  if (url.protocol !== "https:" && url.protocol !== "http:" && url.protocol !== "data:") {
    throw new AppError(
      400,
      "Image URL must use HTTP or HTTPS",
      "VALIDATION_ERROR",
    );
  }

  return url.toString();
}
