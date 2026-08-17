import type { Request, Response } from "express";
import { mapPrismaError } from "../../shared/errors/prisma";
import {
  deleteMyReviewByEmail,
  deleteReviewById,
  getAllReviews,
  getReviewsByProductId,
  setReviewHiddenById,
  upsertMyReviewByEmail,
} from "./review.service";

function getEmailFromLocals(res: Response): string | null {
  const authUser = (res.locals as { authUser?: { email?: string } }).authUser;
  return authUser?.email ?? null;
}

export const reviewController = {
  async getReviewsByProductId(req: Request, res: Response) {
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

      const result = await getReviewsByProductId(parsedProductId, page, limit);

      return res.status(200).json({
        success: true,
        data: result.reviews,
        meta: { total: result.total, page: result.page, limit: result.limit },
      });
    } catch (error) {
      console.error("Error fetching reviews:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch reviews",
      });
    }
  },

  async upsertMyReview(req: Request, res: Response) {
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

      const review = await upsertMyReviewByEmail(
        email,
        parsedProductId,
        rating,
        comment.trim(),
      );

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
    } catch (error) {
      const mappedError = mapPrismaError(error);

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

  async deleteMyReview(req: Request, res: Response) {
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

      const review = await deleteMyReviewByEmail(email, parsedProductId);

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
    } catch (error) {
      const mappedError = mapPrismaError(error);

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

  async setReviewHidden(req: Request, res: Response) {
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

      const review = await setReviewHiddenById(parsedId, hidden);

      return res.status(200).json({
        success: true,
        message: hidden ? "Review hidden" : "Review unhidden",
        data: review,
      });
    } catch (error) {
      const mappedError = mapPrismaError(error);

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

  async getAllReviews(req: Request, res: Response) {
    try {
      const page = req.query.page ? Number(req.query.page) : 1;
      const limit = req.query.limit ? Number(req.query.limit) : 20;

      const productId = req.query.productId
        ? Number(req.query.productId)
        : undefined;
      const userId = req.query.userId ? Number(req.query.userId) : undefined;

      const result = await getAllReviews(page, limit, productId, userId);

      return res.status(200).json({
        success: true,
        data: result.reviews,
        meta: { total: result.total, page: result.page, limit: result.limit },
      });
    } catch (error) {
      console.error("Error listing reviews:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to list reviews",
      });
    }
  },

  async deleteReviewById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const parsedId = Number(id);

      if (Number.isNaN(parsedId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid review ID",
        });
      }

      const review = await deleteReviewById(parsedId);

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
    } catch (error) {
      const mappedError = mapPrismaError(error);

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
