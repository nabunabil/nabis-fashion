"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const requireAdmin_1 = require("../../shared/middleware/requireAdmin");
const requireAuth_1 = require("../../shared/middleware/requireAuth");
const coupon_controller_1 = require("./coupon.controller");
const router = (0, express_1.Router)();
router.get("/", requireAuth_1.requireAuth, requireAdmin_1.requireAdmin, coupon_controller_1.couponController.getCoupons);
router.post("/", requireAuth_1.requireAuth, requireAdmin_1.requireAdmin, coupon_controller_1.couponController.create);
router.patch("/:id/status", requireAuth_1.requireAuth, requireAdmin_1.requireAdmin, coupon_controller_1.couponController.toggleStatus);
router.delete("/:id", requireAuth_1.requireAuth, requireAdmin_1.requireAdmin, coupon_controller_1.couponController.remove);
router.get("/validate/:code", coupon_controller_1.couponController.validateCode);
router.post("/validate", coupon_controller_1.couponController.validateCode);
exports.default = router;
//# sourceMappingURL=coupon.routes.js.map