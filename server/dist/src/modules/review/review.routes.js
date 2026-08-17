"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const requireAdmin_1 = require("../../shared/middleware/requireAdmin");
const requireAuth_1 = require("../../shared/middleware/requireAuth");
const review_controller_1 = require("./review.controller");
const router = (0, express_1.Router)();
router.get("/", requireAuth_1.requireAuth, requireAdmin_1.requireAdmin, review_controller_1.reviewController.getAllReviews);
router.get("/product/:productId", review_controller_1.reviewController.getReviewsByProductId);
router.post("/product/:productId", requireAuth_1.requireAuth, review_controller_1.reviewController.upsertMyReview);
router.delete("/product/:productId", requireAuth_1.requireAuth, review_controller_1.reviewController.deleteMyReview);
router.delete("/:id", requireAuth_1.requireAuth, requireAdmin_1.requireAdmin, review_controller_1.reviewController.deleteReviewById);
router.patch("/:id/hide", requireAuth_1.requireAuth, requireAdmin_1.requireAdmin, review_controller_1.reviewController.setReviewHidden);
exports.default = router;
//# sourceMappingURL=review.routes.js.map