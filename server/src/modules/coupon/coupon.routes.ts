import { Router } from "express";
import { requireAdmin } from "../../shared/middleware/requireAdmin";
import { requireAuth } from "../../shared/middleware/requireAuth";
import { couponController } from "./coupon.controller";

const router: Router = Router();

router.get("/", requireAuth, requireAdmin, couponController.getCoupons);
router.post("/", requireAuth, requireAdmin, couponController.create);
router.patch("/:id/status", requireAuth, requireAdmin, couponController.toggleStatus);
router.delete("/:id", requireAuth, requireAdmin, couponController.remove);
router.get("/validate/:code", couponController.validateCode);
router.post("/validate", couponController.validateCode);

export default router;
