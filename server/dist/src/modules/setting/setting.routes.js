"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const requireAdmin_1 = require("../../shared/middleware/requireAdmin");
const requireAuth_1 = require("../../shared/middleware/requireAuth");
const setting_controller_1 = require("./setting.controller");
const router = (0, express_1.Router)();
// Public endpoint so storefront can read store configuration (currency, shipping fees, etc.)
router.get("/", setting_controller_1.settingController.getSettings);
// Admin-only endpoint to update store configuration
router.put("/", requireAuth_1.requireAuth, requireAdmin_1.requireAdmin, setting_controller_1.settingController.updateSettings);
exports.default = router;
//# sourceMappingURL=setting.routes.js.map