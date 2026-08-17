export declare function requireString(value: unknown, field: string, maxLength?: number): string;
export declare function optionalString(value: unknown, field: string, maxLength?: number): string | undefined;
export declare function requirePositiveInt(value: unknown, field: string): number;
export declare function requireNonNegativeInt(value: unknown, field: string): number;
export declare function optionalBoolean(value: unknown, fallback: boolean): boolean;
/** Accept only absolute HTTP(S) URLs. This prevents javascript:, data:, and
 * relative URLs from being persisted and later rendered as profile images. */
export declare function optionalImageUrl(value: unknown): string | null | undefined;
//# sourceMappingURL=validation.d.ts.map