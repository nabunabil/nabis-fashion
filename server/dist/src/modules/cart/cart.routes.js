"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const requireAuth_1 = require("../../shared/middleware/requireAuth");
const cart_controller_1 = require("./cart.controller");
const router = (0, express_1.Router)();
router.get("/", requireAuth_1.requireAuth, cart_controller_1.cartController.getMyCart);
router.post("/items", requireAuth_1.requireAuth, cart_controller_1.cartController.addItem);
router.patch("/items/:productVariantId", requireAuth_1.requireAuth, cart_controller_1.cartController.updateItemQuantity);
router.delete("/items/:productVariantId", requireAuth_1.requireAuth, cart_controller_1.cartController.removeItem);
router.delete("/clear", requireAuth_1.requireAuth, cart_controller_1.cartController.clearCart);
exports.default = router;
//# sourceMappingURL=cart.routes.js.map