import type { Request, Response } from "express";
import { mapPrismaError } from "../../shared/errors/prisma";
import {
  addItemToMyCart,
  clearMyCart,
  getMyCart,
  removeMyCartItem,
  updateMyCartItemQuantity,
} from "./cart.service";

function getEmailFromLocals(res: Response): string | null {
  const authUser = (res.locals as { authUser?: { email?: string } }).authUser;
  return authUser?.email ?? null;
}

export const cartController = {
  async getMyCart(_req: Request, res: Response) {
    try {
      const email = getEmailFromLocals(res);

      if (!email) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const cart = await getMyCart(email);

      if (!cart) {
        return res.status(404).json({
          success: false,
          message: "Cart not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: cart,
      });
    } catch (error) {
      if (error instanceof Error && error.message === "INSUFFICIENT_STOCK") {
        return res.status(409).json({
          success: false,
          message: "Requested quantity exceeds available stock",
          code: "INSUFFICIENT_STOCK",
        });
      }

      console.error("Error fetching cart:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch cart",
      });
    }
  },

  async addItem(req: Request, res: Response) {
    try {
      const email = getEmailFromLocals(res);

      if (!email) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const { productVariantId, quantity } = req.body;

      if (!Number.isInteger(productVariantId) || productVariantId <= 0) {
        return res.status(400).json({
          success: false,
          message: "Product variant ID must be a valid number",
        });
      }

      if (!Number.isInteger(quantity) || quantity <= 0) {
        return res.status(400).json({
          success: false,
          message: "Quantity must be a positive integer",
        });
      }

      const cart = await addItemToMyCart(email, productVariantId, quantity);

      if (!cart) {
        return res.status(404).json({
          success: false,
          message: "Product variant or cart owner not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Item added to cart",
        data: cart,
      });
    } catch (error) {
      if (error instanceof Error && error.message === "INSUFFICIENT_STOCK") {
        return res.status(409).json({
          success: false,
          message: "Requested quantity exceeds available stock",
          code: "INSUFFICIENT_STOCK",
        });
      }

      const mappedError = mapPrismaError(error);

      if (mappedError) {
        return res.status(mappedError.statusCode).json({
          success: false,
          message: mappedError.message,
          code: mappedError.code,
        });
      }

      console.error("Error adding cart item:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to add item to cart",
      });
    }
  },

  async updateItemQuantity(req: Request, res: Response) {
    try {
      const email = getEmailFromLocals(res);

      if (!email) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const { productVariantId } = req.params;
      const { quantity } = req.body;
      const parsedProductVariantId = Number(productVariantId);

      if (
        !Number.isInteger(parsedProductVariantId) ||
        parsedProductVariantId <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid product variant ID",
        });
      }

      if (!Number.isInteger(quantity) || quantity <= 0) {
        return res.status(400).json({
          success: false,
          message: "Quantity must be a positive integer",
        });
      }

      const cart = await updateMyCartItemQuantity(
        email,
        parsedProductVariantId,
        quantity,
      );

      if (!cart) {
        return res.status(404).json({
          success: false,
          message: "Cart item not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Cart item updated successfully",
        data: cart,
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

      console.error("Error updating cart item:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to update cart item",
      });
    }
  },

  async removeItem(req: Request, res: Response) {
    try {
      const email = getEmailFromLocals(res);

      if (!email) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const { productVariantId } = req.params;
      const parsedProductVariantId = Number(productVariantId);

      if (
        !Number.isInteger(parsedProductVariantId) ||
        parsedProductVariantId <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid product variant ID",
        });
      }

      const cart = await removeMyCartItem(email, parsedProductVariantId);

      if (!cart) {
        return res.status(404).json({
          success: false,
          message: "Cart item not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Cart item removed successfully",
        data: cart,
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

      console.error("Error removing cart item:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to remove cart item",
      });
    }
  },

  async clearCart(req: Request, res: Response) {
    try {
      const email = getEmailFromLocals(res);

      if (!email) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const cart = await clearMyCart(email);

      if (!cart) {
        return res.status(404).json({
          success: false,
          message: "Cart not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Cart cleared successfully",
        data: cart,
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

      console.error("Error clearing cart:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to clear cart",
      });
    }
  },
};
