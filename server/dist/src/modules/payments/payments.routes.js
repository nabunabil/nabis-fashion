"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const requireAdmin_1 = require("../../shared/middleware/requireAdmin");
const requireAuth_1 = require("../../shared/middleware/requireAuth");
const cod_controller_1 = require("./cod.controller");
const stripe_controller_1 = require("./stripe.controller");
const router = (0, express_1.Router)();
// Cash on Delivery endpoint
router.post("/cod", requireAuth_1.requireAuth, cod_controller_1.codController.createCODOrder);
router.post("/stripe/checkout", requireAuth_1.requireAuth, stripe_controller_1.stripeController.createCheckout);
router.post("/stripe/refund/:orderId", requireAuth_1.requireAuth, requireAdmin_1.requireAdmin, stripe_controller_1.stripeController.refund);
exports.default = router;
//# sourceMappingURL=payments.routes.js.map