"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userController = void 0;
const user_service_1 = require("./user.service");
const validation_1 = require("../../shared/validation");
function getEmailFromLocals(res) {
    const authUser = res.locals.authUser;
    return authUser?.email ?? null;
}
exports.userController = {
    // Admin endpoints
    async getAllUsers(req, res) {
        try {
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 15;
            const search = typeof req.query.search === "string" ? req.query.search : undefined;
            const role = typeof req.query.role === "string" ? req.query.role : undefined;
            const result = await (0, user_service_1.getPaginatedUsers)({ page, limit, search, role });
            return res.status(200).json({
                success: true,
                data: result.users,
                totalUsers: result.totalUsers,
                totalPages: result.totalPages,
                currentPage: result.currentPage,
                limit: result.limit,
            });
        }
        catch (error) {
            console.error("Error fetching users:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to fetch users",
            });
        }
    },
    async getUserById(req, res) {
        try {
            const { id } = req.params;
            const userId = Number(id);
            if (isNaN(userId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid user ID",
                });
            }
            const user = await (0, user_service_1.getUserById)(userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found",
                });
            }
            return res.status(200).json({
                success: true,
                data: user,
            });
        }
        catch (error) {
            console.error("Error fetching user:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to fetch user",
            });
        }
    },
    async updateUserRole(req, res) {
        try {
            const { id } = req.params;
            const { role } = req.body;
            const userId = Number(id);
            if (isNaN(userId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid user ID",
                });
            }
            if (!role || typeof role !== "string") {
                return res.status(400).json({
                    success: false,
                    message: "Role is required",
                });
            }
            const targetUser = await (0, user_service_1.getUserById)(userId);
            if (!targetUser) {
                return res.status(404).json({
                    success: false,
                    message: "User not found",
                });
            }
            // Check current admin email from session
            const adminEmail = getEmailFromLocals(res);
            // Protect other admin profiles from being demoted/modified by unauthorized actions if desired
            if (targetUser.email !== adminEmail && targetUser.role === "admin" && role !== "admin") {
                return res.status(403).json({
                    success: false,
                    message: "You cannot change or demote another admin profile",
                });
            }
            const updatedUser = await (0, user_service_1.updateUserRoleById)(userId, role.toLowerCase());
            return res.status(200).json({
                success: true,
                message: "User role updated successfully",
                data: updatedUser,
            });
        }
        catch (error) {
            console.error("Error updating user role:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to update user role",
            });
        }
    },
    async deleteUser(req, res) {
        try {
            const { id } = req.params;
            const userId = Number(id);
            if (isNaN(userId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid user ID",
                });
            }
            const user = await (0, user_service_1.deleteUserById)(userId);
            return res.status(200).json({
                success: true,
                message: "User deleted successfully",
                data: user,
            });
        }
        catch (error) {
            console.error("Error deleting user:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to delete user",
            });
        }
    },
    // User endpoints
    async getMyProfile(_req, res) {
        const email = getEmailFromLocals(res);
        if (!email) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }
        const user = await (0, user_service_1.getUserProfileByEmail)(email);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }
        return res.status(200).json({
            success: true,
            data: user,
        });
    },
    async updateMyProfile(req, res) {
        const email = getEmailFromLocals(res);
        if (!email) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }
        const { name, phone, image } = req.body;
        const nextName = typeof name === "string" ? name.trim() : undefined;
        const nextPhone = typeof phone === "string" ? phone.trim() : undefined;
        const nextImage = (0, validation_1.optionalImageUrl)(image);
        if (nextName === undefined &&
            nextPhone === undefined &&
            nextImage === undefined) {
            return res.status(400).json({
                success: false,
                message: "At least one of name, phone, or image is required",
            });
        }
        const user = await (0, user_service_1.updateUserProfileByEmail)(email, {
            ...(nextName !== undefined ? { name: nextName } : {}),
            ...(nextPhone !== undefined ? { phone: nextPhone } : {}),
            ...(nextImage !== undefined ? { image: nextImage } : {}),
        });
        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: user,
        });
    },
};
//# sourceMappingURL=user.controller.js.map