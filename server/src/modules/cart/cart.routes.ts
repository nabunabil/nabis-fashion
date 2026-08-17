import { Router } from "express";
import { requireAuth } from "../../shared/middleware/requireAuth";
import { cartController } from "./cart.controller";

const router: Router = Router();

router.get("/", requireAuth, cartController.getMyCart);
router.post("/items", requireAuth, cartController.addItem);
router.patch(
  "/items/:productVariantId",
  requireAuth,
  cartController.updateItemQuantity,
);
router.delete(
  "/items/:productVariantId",
  requireAuth,
  cartController.removeItem,
);
router.delete("/clear", requireAuth, cartController.clearCart);

export default router;
