"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapPrismaError = mapPrismaError;
const appError_1 = require("./appError");
function mapPrismaError(error) {
    if (!error || typeof error !== "object") {
        return null;
    }
    const prismaError = error;
    if (prismaError.code === "P2025") {
        return new appError_1.AppError(404, "Resource not found", "RESOURCE_NOT_FOUND");
    }
    if (prismaError.code === "P2003") {
        return new appError_1.AppError(400, "Related resource not found", "RELATED_RESOURCE_NOT_FOUND");
    }
    if (prismaError.code === "P2002") {
        const target = prismaError.meta?.target?.join(", ") || "field";
        return new appError_1.AppError(409, `A record with this ${target} already exists`, "DUPLICATE_RESOURCE");
    }
    return null;
}
//# sourceMappingURL=prisma.js.map