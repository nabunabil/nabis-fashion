"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookController = void 0;
const appError_1 = require("../../shared/errors/appError");
const webhook_service_1 = require("./webhook.service");
exports.WebhookController = {
    handleStripeWebhook: async (req, res) => {
        const signature = req.headers["stripe-signature"];
        if (!signature || typeof signature !== "string") {
            throw new appError_1.AppError(400, "Missing Stripe signature", "STRIPE_SIGNATURE_MISSING");
        }
        if (!Buffer.isBuffer(req.body)) {
            throw new appError_1.AppError(400, "Missing webhook body", "STRIPE_BODY_MISSING");
        }
        await webhook_service_1.WebhookService.processStripeWebhook(req.body, signature);
        res.status(200).json({
            received: true,
        });
    },
};
//# sourceMappingURL=webhook.controller.js.map