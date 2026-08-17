import { Router, raw } from "express";
import { WebhookController } from "./webhook.controller";

export const webhookRouter: Router = Router();

webhookRouter.post(
  "/stripe",
  raw({ type: "application/json" }),
  WebhookController.handleStripeWebhook,
);

export default webhookRouter;
