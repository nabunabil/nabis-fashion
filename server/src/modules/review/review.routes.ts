import { Router } from "express";
import { requireAdmin } from "../../shared/middleware/requireAdmin";
import { requireAuth } from "../../shared/middleware/requireAuth";
import { reviewController } from "./review.controller";

const router: Router = Router();
router.get("/", requireAuth, requireAdmin, reviewController.getAllReviews);
router.get("/product/:productId", reviewController.getReviewsByProductId);
router.post(
  "/product/:productId",
  requireAuth,
  reviewController.upsertMyReview,
);
router.delete(
  "/product/:productId",
  requireAuth,
  reviewController.deleteMyReview,
);

router.delete(
  "/:id",
  requireAuth,
  requireAdmin,
  reviewController.deleteReviewById,
);

router.patch(
  "/:id/hide",
  requireAuth,
  requireAdmin,
  reviewController.setReviewHidden,
);

export default router;
