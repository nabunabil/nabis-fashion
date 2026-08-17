"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const requireAdmin_1 = require("../../shared/middleware/requireAdmin");
const requireAuth_1 = require("../../shared/middleware/requireAuth");
const orders_controller_1 = require("./orders.controller");
const invoice_controller_1 = require("../invoice/invoice.controller");
const router = (0, express_1.Router)();
// Customer routes
router.get("/me", requireAuth_1.requireAuth, orders_controller_1.ordersController.listMyOrders);
router.get("/me/:id", requireAuth_1.requireAuth, orders_controller_1.ordersController.getMyOrder);
router.post("/me/:id/cancel", requireAuth_1.requireAuth, orders_controller_1.ordersController.cancelMyOrder);
// Admin routes
router.get("/", requireAuth_1.requireAuth, requireAdmin_1.requireAdmin, orders_controller_1.ordersController.listOrders);
router.get("/:id/invoice", invoice_controller_1.invoiceController.downloadInvoice);
router.get("/:id", requireAuth_1.requireAuth, requireAdmin_1.requireAdmin, orders_controller_1.ordersController.getOrderById);
// Update order (Supports PUT & PATCH)
router.put("/:id", requireAuth_1.requireAuth, requireAdmin_1.requireAdmin, orders_controller_1.ordersController.updateOrder);
router.patch("/:id", requireAuth_1.requireAuth, requireAdmin_1.requireAdmin, orders_controller_1.ordersController.updateOrder);
// Update order status (Supports PUT & PATCH)
router.put("/:id/status", requireAuth_1.requireAuth, requireAdmin_1.requireAdmin, orders_controller_1.ordersController.updateStatus);
router.patch("/:id/status", requireAuth_1.requireAuth, requireAdmin_1.requireAdmin, orders_controller_1.ordersController.updateStatus);
exports.default = router;
//# sourceMappingURL=orders.routes.js.map