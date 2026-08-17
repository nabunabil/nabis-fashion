"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const requireAdmin_1 = require("../../shared/middleware/requireAdmin");
const requireAuth_1 = require("../../shared/middleware/requireAuth");
const variant_controller_1 = require("./variant.controller");
const router = (0, express_1.Router)();
router.get("/", variant_controller_1.variantController.list);
router.get("/:id", variant_controller_1.variantController.get);
router.post("/", requireAuth_1.requireAuth, requireAdmin_1.requireAdmin, variant_controller_1.variantController.create);
router.patch("/:id", requireAuth_1.requireAuth, requireAdmin_1.requireAdmin, variant_controller_1.variantController.update);
router.delete("/:id", requireAuth_1.requireAuth, requireAdmin_1.requireAdmin, variant_controller_1.variantController.delete);
exports.default = router;
//# sourceMappingURL=variant.routes.js.map