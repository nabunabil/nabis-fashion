"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripeController = void 0;
const appError_1 = require("../../shared/errors/appError");
const payment_validation_1 = require("./payment.validation");
const stripe_service_1 = require("./stripe.service");
exports.stripeController = {
    async createCheckout(req, res) {
        const user = res.locals.authUser;
        if (!user) {
            throw new appError_1.AppError(401, "Unauthorized", "UNAUTHORIZED");
        }
        const result = await (0, stripe_service_1.createCheckout)(user, (0, payment_validation_1.parseShippingInfo)(req.body));
        return res.status(201).json({
            success: true,
            message: "Stripe checkout created",
            data: result,
        });
    },
    async refund(req, res) {
        const orderId = Number(req.params.orderId);
        if (!Number.isInteger(orderId) || orderId <= 0) {
            throw new appError_1.AppError(400, "Invalid order ID", "VALIDATION_ERROR");
        }
        const amount = req.body.amount === undefined ? undefined : Number(req.body.amount);
        const result = await (0, stripe_service_1.refundStripeOrder)({
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
//# sourceMappingURL=stripe.controller.js.map