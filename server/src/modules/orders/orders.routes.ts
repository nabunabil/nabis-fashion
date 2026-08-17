import { Router } from "express";
import { requireAdmin } from "../../shared/middleware/requireAdmin";
import { requireAuth } from "../../shared/middleware/requireAuth";
import { ordersController } from "./orders.controller";
import { invoiceController } from "../invoice/invoice.controller";

const router: Router = Router();

// Customer routes
router.get("/me", requireAuth, ordersController.listMyOrders);
router.get("/me/:id", requireAuth, ordersController.getMyOrder);
router.post("/me/:id/cancel", requireAuth, ordersController.cancelMyOrder);

// Admin routes
router.get("/", requireAuth, requireAdmin, ordersController.listOrders);
router.get("/:id/invoice", invoiceController.downloadInvoice);
router.get("/:id", requireAuth, requireAdmin, ordersController.getOrderById);

// Update order (Supports PUT & PATCH)
router.put("/:id", requireAuth, requireAdmin, ordersController.updateOrder);
router.patch("/:id", requireAuth, requireAdmin, ordersController.updateOrder);

// Update order status (Supports PUT & PATCH)
router.put("/:id/status", requireAuth, requireAdmin, ordersController.updateStatus);
router.patch("/:id/status", requireAuth, requireAdmin, ordersController.updateStatus);

export default router;
