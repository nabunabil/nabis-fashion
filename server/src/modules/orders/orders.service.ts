import { OrderStatus } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../shared/errors/appError";
import { cancelOrderAndRestore } from "./order-workflow.service";

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
    orderBy: { createdAt: "desc" as const },
  },
} as const;

export interface OrderQueryOptions {
  page?: number | undefined;
  limit?: number | undefined;
  status?: string | undefined;
  search?: string | undefined;
}

export async function listPaginatedOrders(options: OrderQueryOptions = {}) {
  const page = Math.max(1, Number(options.page) || 1);
  const limit = Math.max(1, Math.min(Number(options.limit) || 12, 100)); // Default 12 orders per page
  const skip = (page - 1) * limit;

  const where: any = {};

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
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip,
      include: orderInclude,
    }),
    prisma.order.count({ where }),
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

export function listOrders() {
  return prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: orderInclude,
  });
}

export function getOrderById(id: number) {
  return prisma.order.findUnique({
    where: { id },
    include: orderInclude,
  });
}

export function listMyOrders(userId: number) {
  return prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: orderInclude,
  });
}

export function getMyOrderById(userId: number, id: number) {
  return prisma.order.findFirst({
    where: { id, userId },
    include: orderInclude,
  });
}

export function cancelMyOrder(userId: number, id: number) {
  return cancelOrderAndRestore(id, "CUSTOMER_CANCELLATION");
}

export async function updateOrder(
  id: number,
  payload: Record<string, unknown>,
) {
  const allowed: Record<string, string> = {};
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
    if (typeof value === "string") allowed[field] = value.trim();
  }

  if (Object.keys(allowed).length === 0) {
    throw new AppError(
      400,
      "No valid fields to update",
      "VALIDATION_ERROR",
    );
  }

  return prisma.order.update({ where: { id }, data: allowed });
}

export async function updateOrderStatus(id: number, orderStatus: OrderStatus | string) {
  const cleanStatus = String(orderStatus).trim();

  if (cleanStatus.toLowerCase() === "cancelled") {
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      throw new AppError(404, "Order not found", "ORDER_NOT_FOUND");
    }
    if (order.paymentStatus === "paid") {
      throw new AppError(
        409,
        "Refund the paid order before cancelling it",
        "PAID_ORDER_REQUIRES_REFUND",
      );
    }
    await cancelOrderAndRestore(id, "ADMIN_CANCELLATION");
    return getOrderById(id);
  }

  const updatedOrder = await prisma.order.update({
    where: { id },
    data: { orderStatus: cleanStatus },
  });

  try {
    await prisma.notification.create({
      data: {
        userId: updatedOrder.userId,
        type: "ORDER_STATUS",
        title: "Order Status Updated",
        message: `Your order #${id} status has been updated to '${cleanStatus.toUpperCase()}'.`,
      },
    });
  } catch (e) {
    console.warn("Status update notification failed:", e);
  }

  return updatedOrder;
}
