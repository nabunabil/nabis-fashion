import type { Request, Response } from "express";
import { AppError } from "../../shared/errors/appError";
import {
  cancelMyOrder,
  getMyOrderById,
  getOrderById,
  listMyOrders,
  listOrders,
  listPaginatedOrders,
  updateOrder,
  updateOrderStatus,
} from "./orders.service";

function parseId(value: string | undefined): number {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError(400, "Invalid order ID", "VALIDATION_ERROR");
  }
  return id;
}

function getUserId(res: Response): number {
  const user = res.locals.authUser as { id?: number } | undefined;
  if (!user?.id) {
    throw new AppError(401, "Unauthorized", "UNAUTHORIZED");
  }
  return user.id;
}

export const ordersController = {
  async listOrders(req: Request, res: Response) {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 12;
    const status = typeof req.query.status === "string" ? req.query.status : undefined;
    const search = typeof req.query.search === "string" ? req.query.search : undefined;

    const result = await listPaginatedOrders({ page, limit, status, search });

    return res.json({
      success: true,
      data: result.orders,
      totalOrders: result.totalOrders,
      totalPages: result.totalPages,
      currentPage: result.currentPage,
      limit: result.limit,
    });
  },

  async getOrderById(req: Request, res: Response) {
    const order = await getOrderById(parseId(String(req.params.id)));
    if (!order) {
      throw new AppError(404, "Order not found", "ORDER_NOT_FOUND");
    }
    return res.json({ success: true, data: order });
  },

  async listMyOrders(_req: Request, res: Response) {
    return res.json({
      success: true,
      data: await listMyOrders(getUserId(res)),
    });
  },

  async getMyOrder(req: Request, res: Response) {
    const order = await getMyOrderById(
      getUserId(res),
      parseId(String(req.params.id)),
    );
    if (!order) {
      throw new AppError(404, "Order not found", "ORDER_NOT_FOUND");
    }
    return res.json({ success: true, data: order });
  },

  async cancelMyOrder(req: Request, res: Response) {
    return res.json({
      success: true,
      message: "Order cancelled",
      data: await cancelMyOrder(getUserId(res), parseId(String(req.params.id))),
    });
  },

  async updateOrder(req: Request, res: Response) {
    return res.json({
      success: true,
      data: await updateOrder(parseId(String(req.params.id)), req.body),
    });
  },

  async updateStatus(req: Request, res: Response) {
    const statusVal = req.body.orderStatus || req.body.status;
    if (!statusVal || typeof statusVal !== "string") {
      throw new AppError(
        400,
        "Order status string is required",
        "VALIDATION_ERROR",
      );
    }
    const updated = await updateOrderStatus(
      parseId(String(req.params.id)),
      statusVal.trim(),
    );
    return res.json({
      success: true,
      message: `Order status updated to ${statusVal}`,
      data: updated,
    });
  },
};
