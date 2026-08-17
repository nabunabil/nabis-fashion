import { Request, Response } from "express";
import { AppError } from "../../shared/errors/appError";
import { WebhookService } from "./webhook.service";

export const WebhookController = {
  handleStripeWebhook: async (req: Request, res: Response) => {
    const signature = req.headers["stripe-signature"];

    if (!signature || typeof signature !== "string") {
      throw new AppError(400, "Missing Stripe signature", "STRIPE_SIGNATURE_MISSING");
    }

    if (!Buffer.isBuffer(req.body)) {
      throw new AppError(400, "Missing webhook body", "STRIPE_BODY_MISSING");
    }

    await WebhookService.processStripeWebhook(req.body, signature);

    res.status(200).json({
      received: true,
    });
  },
};
