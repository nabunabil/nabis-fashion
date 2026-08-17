export declare class AppError extends Error {
    readonly statusCode: number;
    readonly code: string;
    constructor(statusCode: number, message: string, code: string);
}
export declare function isAppError(error: unknown): error is AppError;
//# sourceMappingURL=appError.d.ts.map