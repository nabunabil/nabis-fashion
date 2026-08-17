"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.codController = void 0;
const appError_1 = require("../../shared/errors/appError");
const cod_service_1 = require("./cod.service");
const payment_validation_1 = require("./payment.validation");
exports.codController = {
    async createCODOrder(req, res) {
        try {
            const authUser = res.locals.authUser;
            if (!authUser) {
                throw new appError_1.AppError(401, "Unauthorized", "UNAUTHORIZED");
            }
            const order = await (0, cod_service_1.processCODOrder)(authUser.id, (0, payment_validation_1.parseShippingInfo)(req.body));
            return res
                .status(201)
                .json({ success: true, message: "Order created", data: order });
        }
        catch (error) {
            if (error instanceof appError_1.AppError) {
                throw error;
            }
            console.error("Error processing COD order:", error);
            return res
                .status(500)
                .json({ success: false, message: "Failed to create order" });
        }
    },
};
//# sourceMappingURL=cod.controller.js.map