"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reviewController = void 0;
const prisma_1 = require("../../shared/errors/prisma");
const review_service_1 = require("./review.service");
function getEmailFromLocals(res) {
    const authUser = res.locals.authUser;
    return authUser?.email ?? null;
}
exports.reviewController = {
    async getReviewsByProductId(req, res) {
        try {
            const { productId } = req.params;
            const parsedProductId = Number(productId);
            if (Number.isNaN(parsedProductId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid product ID",
                });
            }
            const page = req.query.page ? Number(req.query.page) : 1;
            const limit = req.query.limit ? Number(req.query.limit) : 10;
            const result = await (0, review_service_1.getReviewsByProductId)(parsedProductId, page, limit);
            return res.status(200).json({
                success: true,
                data: result.reviews,
                meta: { total: result.total, page: result.page, limit: result.limit },
            });
        }
        catch (error) {
            console.error("Error fetching reviews:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to fetch reviews",
            });
        }
    },
    async upsertMyReview(req, res) {
        try {
            const email = getEmailFromLocals(res);
            if (!email) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized",
                });
            }
            const { productId } = req.params;
            const parsedProductId = Number(productId);
            const { rating, comment } = req.body;
            if (Number.isNaN(parsedProductId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid product ID",
                });
            }
            if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
                return res.status(400).json({
                    success: false,
                    message: "Rating must be an integer between 1 and 5",
                });
            }
            if (!comment || typeof comment !== "string") {
                return res.status(400).json({
                    success: false,
                    message: "Comment is required and must be a string",
                });
            }
            const review = await (0, review_service_1.upsertMyReviewByEmail)(email, parsedProductId, rating, comment.trim());
            if (!review) {
                return res.status(404).json({
                    success: false,
                    message: "Product or user not found",
                });
            }
            return res.status(200).json({
                success: true,
                message: "Review saved successfully",
                data: review,
            });
        }
        catch (error) {
            const mappedError = (0, prisma_1.mapPrismaError)(error);
            if (mappedError) {
                return res.status(mappedError.statusCode).json({
                    success: false,
                    message: mappedError.message,
                    code: mappedError.code,
                });
            }
            console.error("Error saving review:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to save review",
            });
        }
    },
    async deleteMyReview(req, res) {
        try {
            const email = getEmailFromLocals(res);
            if (!email) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized",
                });
            }
            const { productId } = req.params;
            const parsedProductId = Number(productId);
            if (Number.isNaN(parsedProductId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid product ID",
                });
            }
            const review = await (0, review_service_1.deleteMyReviewByEmail)(email, parsedProductId);
            if (!review) {
                return res.status(404).json({
                    success: false,
                    message: "Review not found",
                });
            }
            return res.status(200).json({
                success: true,
                message: "Review deleted successfully",
                data: review,
            });
        }
        catch (error) {
            const mappedError = (0, prisma_1.mapPrismaError)(error);
            if (mappedError) {
                return res.status(mappedError.statusCode).json({
                    success: false,
                    message: mappedError.message,
                    code: mappedError.code,
                });
            }
            console.error("Error deleting review:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to delete review",
            });
        }
    },
    async setReviewHidden(req, res) {
        try {
            const { id } = req.params;
            const parsedId = Number(id);
            if (Number.isNaN(parsedId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid review ID",
                });
            }
            const { hidden } = req.body;
            if (typeof hidden !== "boolean") {
                return res.status(400).json({
                    success: false,
                    message: "Request body must include boolean 'hidden' field",
                });
            }
            const review = await (0, review_service_1.setReviewHiddenById)(parsedId, hidden);
            return res.status(200).json({
                success: true,
                message: hidden ? "Review hidden" : "Review unhidden",
                data: review,
            });
        }
        catch (error) {
            const mappedError = (0, prisma_1.mapPrismaError)(error);
            if (mappedError) {
                return res.status(mappedError.statusCode).json({
                    success: false,
                    message: mappedError.message,
                    code: mappedError.code,
                });
            }
            console.error("Error setting review hidden flag:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to update review",
            });
        }
    },
    async getAllReviews(req, res) {
        try {
            const page = req.query.page ? Number(req.query.page) : 1;
            const limit = req.query.limit ? Number(req.query.limit) : 20;
            const productId = req.query.productId
                ? Number(req.query.productId)
                : undefined;
            const userId = req.query.userId ? Number(req.query.userId) : undefined;
            const result = await (0, review_service_1.getAllReviews)(page, limit, productId, userId);
            return res.status(200).json({
                success: true,
                data: result.reviews,
                meta: { total: result.total, page: result.page, limit: result.limit },
            });
        }
        catch (error) {
            console.error("Error listing reviews:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to list reviews",
            });
        }
    },
    async deleteReviewById(req, res) {
        try {
            const { id } = req.params;
            const parsedId = Number(id);
            if (Number.isNaN(parsedId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid review ID",
                });
            }
            const review = await (0, review_service_1.deleteReviewById)(parsedId);
            if (!review) {
                return res.status(404).json({
                    success: false,
                    message: "Review not found",
                });
            }
            return res.status(200).json({
                success: true,
                message: "Review deleted successfully",
                data: review,
            });
        }
        catch (error) {
            const mappedError = (0, prisma_1.mapPrismaError)(error);
            if (mappedError) {
                return res.status(mappedError.statusCode).json({
                    success: false,
                    message: mappedError.message,
                    code: mappedError.code,
                });
            }
            console.error("Error deleting review:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to delete review",
            });
        }
    },
};
//# sourceMappingURL=review.controller.js.map