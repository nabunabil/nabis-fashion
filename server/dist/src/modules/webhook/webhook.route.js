"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.webhookRouter = void 0;
const express_1 = require("express");
const webhook_controller_1 = require("./webhook.controller");
exports.webhookRouter = (0, express_1.Router)();
exports.webhookRouter.post("/stripe", (0, express_1.raw)({ type: "application/json" }), webhook_controller_1.WebhookController.handleStripeWebhook);
exports.default = exports.webhookRouter;
//# sourceMappingURL=webhook.route.js.map