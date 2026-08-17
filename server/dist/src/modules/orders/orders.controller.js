"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ordersController = void 0;
const appError_1 = require("../../shared/errors/appError");
const orders_service_1 = require("./orders.service");
function parseId(value) {
    const id = Number(value);
    if (!Number.isInteger(id) || id <= 0) {
        throw new appError_1.AppError(400, "Invalid order ID", "VALIDATION_ERROR");
    }
    return id;
}
function getUserId(res) {
    const user = res.locals.authUser;
    if (!user?.id) {
        throw new appError_1.AppError(401, "Unauthorized", "UNAUTHORIZED");
    }
    return user.id;
}
exports.ordersController = {
    async listOrders(req, res) {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 12;
        const status = typeof req.query.status === "string" ? req.query.status : undefined;
        const search = typeof req.query.search === "string" ? req.query.search : undefined;
        const result = await (0, orders_service_1.listPaginatedOrders)({ page, limit, status, search });
        return res.json({
            success: true,
            data: result.orders,
            totalOrders: result.totalOrders,
            totalPages: result.totalPages,
            currentPage: result.currentPage,
            limit: result.limit,
        });
    },
    async getOrderById(req, res) {
        const order = await (0, orders_service_1.getOrderById)(parseId(String(req.params.id)));
        if (!order) {
            throw new appError_1.AppError(404, "Order not found", "ORDER_NOT_FOUND");
        }
        return res.json({ success: true, data: order });
    },
    async listMyOrders(_req, res) {
        return res.json({
            success: true,
            data: await (0, orders_service_1.listMyOrders)(getUserId(res)),
        });
    },
    async getMyOrder(req, res) {
        const order = await (0, orders_service_1.getMyOrderById)(getUserId(res), parseId(String(req.params.id)));
        if (!order) {
            throw new appError_1.AppError(404, "Order not found", "ORDER_NOT_FOUND");
        }
        return res.json({ success: true, data: order });
    },
    async cancelMyOrder(req, res) {
        return res.json({
            success: true,
            message: "Order cancelled",
            data: await (0, orders_service_1.cancelMyOrder)(getUserId(res), parseId(String(req.params.id))),
        });
    },
    async updateOrder(req, res) {
        return res.json({
            success: true,
            data: await (0, orders_service_1.updateOrder)(parseId(String(req.params.id)), req.body),
        });
    },
    async updateStatus(req, res) {
        const statusVal = req.body.orderStatus || req.body.status;
        if (!statusVal || typeof statusVal !== "string") {
            throw new appError_1.AppError(400, "Order status string is required", "VALIDATION_ERROR");
        }
        const updated = await (0, orders_service_1.updateOrderStatus)(parseId(String(req.params.id)), statusVal.trim());
        return res.json({
            success: true,
            message: `Order status updated to ${statusVal}`,
            data: updated,
        });
    },
};
//# sourceMappingURL=orders.controller.js.map