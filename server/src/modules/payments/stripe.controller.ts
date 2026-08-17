import type { Request, Response } from "express";
import { AppError } from "../../shared/errors/appError";
import { parseShippingInfo } from "./payment.validation";
import { createCheckout, refundStripeOrder } from "./stripe.service";

export const stripeController = {
  async createCheckout(req: Request, res: Response) {
    const user = res.locals.authUser as
      | { id: number; email: string }
      | undefined;
    if (!user) {
      throw new AppError(401, "Unauthorized", "UNAUTHORIZED");
    }

    const result = await createCheckout(user, parseShippingInfo(req.body));
    return res.status(201).json({
      success: true,
      message: "Stripe checkout created",
      data: result,
    });
  },

  async refund(req: Request, res: Response) {
    const orderId = Number(req.params.orderId);
    if (!Number.isInteger(orderId) || orderId <= 0) {
      throw new AppError(400, "Invalid order ID", "VALIDATION_ERROR");
    }

    const amount =
      req.body.amount === undefined ? undefined : Number(req.body.amount);
    const result = await refundStripeOrder({
      orderId,
      ...(amount === undefined ? {} : { amount }),
      restock: req.body.restock === true,
    });

    return res.status(200).json({
      success: true,
      message: "Refund submitted",
      data: result,
    });
  },
};
