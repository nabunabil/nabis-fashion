"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const requireAdmin_1 = require("../../shared/middleware/requireAdmin");
const requireAuth_1 = require("../../shared/middleware/requireAuth");
const user_controller_1 = require("./user.controller");
const router = (0, express_1.Router)();
// Admin routes
router.get("/admin/users", requireAuth_1.requireAuth, requireAdmin_1.requireAdmin, user_controller_1.userController.getAllUsers);
router.get("/admin/users/:id", requireAuth_1.requireAuth, requireAdmin_1.requireAdmin, user_controller_1.userController.getUserById);
router.put("/admin/users/:id/role", requireAuth_1.requireAuth, requireAdmin_1.requireAdmin, user_controller_1.userController.updateUserRole);
router.delete("/admin/users/:id", requireAuth_1.requireAuth, requireAdmin_1.requireAdmin, user_controller_1.userController.deleteUser);
// User routes
router.get("/me", requireAuth_1.requireAuth, user_controller_1.userController.getMyProfile);
router.put("/me", requireAuth_1.requireAuth, user_controller_1.userController.updateMyProfile);
exports.default = router;
//# sourceMappingURL=user.routes.js.map