"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listPaginatedOrders = listPaginatedOrders;
exports.listOrders = listOrders;
exports.getOrderById = getOrderById;
exports.listMyOrders = listMyOrders;
exports.getMyOrderById = getMyOrderById;
exports.cancelMyOrder = cancelMyOrder;
exports.updateOrder = updateOrder;
exports.updateOrderStatus = updateOrderStatus;
const prisma_1 = require("../../lib/prisma");
const appError_1 = require("../../shared/errors/appError");
const order_workflow_service_1 = require("./order-workflow.service");
const orderInclude = {
    user: {
        select: {
            id: true,
            name: true,
            email: true,
            image: true,
        },
    },
    items: {
        include: {
            productVariant: {
                select: {
                    id: true,
                    productId: true,
                },
            },
        },
    },
    payments: {
        orderBy: { createdAt: "desc" },
    },
};
async function listPaginatedOrders(options = {}) {
    const page = Math.max(1, Number(options.page) || 1);
    const limit = Math.max(1, Math.min(Number(options.limit) || 12, 100)); // Default 12 orders per page
    const skip = (page - 1) * limit;
    const where = {};
    if (options.status && options.status !== "all") {
        where.orderStatus = { equals: options.status, mode: "insensitive" };
    }
    if (options.search && options.search.trim() !== "") {
        const q = options.search.trim();
        const cleanId = q.replace("#", "");
        const parsedId = Number(cleanId);
        where.OR = [
            ...(isNaN(parsedId) ? [] : [{ id: parsedId }]),
            { customerName: { contains: q, mode: "insensitive" } },
            { phone: { contains: q, mode: "insensitive" } },
            { address: { contains: q, mode: "insensitive" } },
        ];
    }
    const [orders, totalOrders] = await Promise.all([
        prisma_1.prisma.order.findMany({
            where,
            orderBy: { createdAt: "desc" },
            take: limit,
            skip,
            include: orderInclude,
        }),
        prisma_1.prisma.order.count({ where }),
    ]);
    const totalPages = Math.ceil(totalOrders / limit) || 1;
    return {
        orders,
        totalOrders,
        totalPages,
        currentPage: page,
        limit,
    };
}
function listOrders() {
    return prisma_1.prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        include: orderInclude,
    });
}
function getOrderById(id) {
    return prisma_1.prisma.order.findUnique({
        where: { id },
        include: orderInclude,
    });
}
function listMyOrders(userId) {
    return prisma_1.prisma.order.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        include: orderInclude,
    });
}
function getMyOrderById(userId, id) {
    return prisma_1.prisma.order.findFirst({
        where: { id, userId },
        include: orderInclude,
    });
}
function cancelMyOrder(userId, id) {
    return (0, order_workflow_service_1.cancelOrderAndRestore)(id, "CUSTOMER_CANCELLATION");
}
async function updateOrder(id, payload) {
    const allowed = {};
    const fields = [
        "customerName",
        "phone",
        "address",
        "city",
        "county",
        "country",
        "postalCode",
        "deliveryInstructions",
    ];
    for (const field of fields) {
        const value = payload[field];
        if (typeof value === "string")
            allowed[field] = value.trim();
    }
    if (Object.keys(allowed).length === 0) {
        throw new appError_1.AppError(400, "No valid fields to update", "VALIDATION_ERROR");
    }
    return prisma_1.prisma.order.update({ where: { id }, data: allowed });
}
async function updateOrderStatus(id, orderStatus) {
    const cleanStatus = String(orderStatus).trim();
    if (cleanStatus.toLowerCase() === "cancelled") {
        const order = await prisma_1.prisma.order.findUnique({ where: { id } });
        if (!order) {
            throw new appError_1.AppError(404, "Order not found", "ORDER_NOT_FOUND");
        }
        if (order.paymentStatus === "paid") {
            throw new appError_1.AppError(409, "Refund the paid order before cancelling it", "PAID_ORDER_REQUIRES_REFUND");
        }
        await (0, order_workflow_service_1.cancelOrderAndRestore)(id, "ADMIN_CANCELLATION");
        return getOrderById(id);
    }
    const updatedOrder = await prisma_1.prisma.order.update({
        where: { id },
        data: { orderStatus: cleanStatus },
    });
    try {
        await prisma_1.prisma.notification.create({
            data: {
                userId: updatedOrder.userId,
                type: "ORDER_STATUS",
                title: "Order Status Updated",
                message: `Your order #${id} status has been updated to '${cleanStatus.toUpperCase()}'.`,
            },
        });
    }
    catch (e) {
        console.warn("Status update notification failed:", e);
    }
    return updatedOrder;
}
//# sourceMappingURL=orders.service.js.map