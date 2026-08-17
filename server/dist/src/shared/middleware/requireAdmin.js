"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdmin = requireAdmin;
async function requireAdmin(_req, res, next) {
    const authUser = res.locals.authUser;
    if (!authUser?.role || authUser.role !== "admin") {
        return res.status(403).json({
            success: false,
            message: "Forbidden: Admin access required",
        });
    }
    return next();
}
//# sourceMappingURL=requireAdmin.js.map