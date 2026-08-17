"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
const auth_1 = require("../../lib/auth");
const user_service_1 = require("../../modules/user/user.service");
async function requireAuth(req, res, next) {
    try {
        const authInstance = await (0, auth_1.getAuth)();
        const session = await authInstance.api.getSession({
            headers: req.headers,
        });
        const email = session?.user?.email;
        if (!email) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }
        const user = await (0, user_service_1.getUserProfileByEmail)(email);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }
        res.locals.authUser = {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
        };
        return next();
    }
    catch {
        return res.status(401).json({
            success: false,
            message: "Unauthorized",
        });
    }
}
//# sourceMappingURL=requireAuth.js.map