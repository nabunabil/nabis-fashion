import type { Request, Response } from "express";
import { AppError } from "../../shared/errors/appError";
import { processCODOrder } from "./cod.service";
import { parseShippingInfo } from "./payment.validation";

export const codController = {
  async createCODOrder(req: Request, res: Response) {
    try {
      const authUser = res.locals.authUser as
        | { id: number; email: string }
        | undefined;

      if (!authUser) {
        throw new AppError(401, "Unauthorized", "UNAUTHORIZED");
      }

      const order = await processCODOrder(
        authUser.id,
        parseShippingInfo(req.body),
      );

      return res
        .status(201)
        .json({ success: true, message: "Order created", data: order });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      console.error("Error processing COD order:", error);
      return res
        .status(500)
        .json({ success: false, message: "Failed to create order" });
    }
  },
};
