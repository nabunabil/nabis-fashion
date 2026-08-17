import { Router } from "express";
import { requireAdmin } from "../../shared/middleware/requireAdmin";
import { requireAuth } from "../../shared/middleware/requireAuth";
import { codController } from "./cod.controller";
import { stripeController } from "./stripe.controller";

const router: Router = Router();

// Cash on Delivery endpoint
router.post("/cod", requireAuth, codController.createCODOrder);
router.post("/stripe/checkout", requireAuth, stripeController.createCheckout);
router.post(
  "/stripe/refund/:orderId",
  requireAuth,
  requireAdmin,
  stripeController.refund,
);

export default router;
