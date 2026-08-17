import { Request, Response, NextFunction } from "express";
import {
  listUserNotifications,
  createUserNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  notifyAllAdmins,
} from "./notification.service";
import { AppError } from "../../shared/errors/appError";

function getAuthEmail(res: Response): string {
  const email = res.locals.authUser?.email;
  if (!email) throw new AppError(401, "Unauthorized", "UNAUTHORIZED");
  return email;
}

export async function getNotificationsHandler(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const email = getAuthEmail(res);
    const result = await listUserNotifications(email);
    res.json({ success: true, data: result.notifications, unreadCount: result.unreadCount });
  } catch (error) {
    next(error);
  }
}

export async function createNotificationHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const email = getAuthEmail(res);
    const { userId, type, title, message, targetAdmins } = req.body;
    if (!title || !message) {
      throw new AppError(400, "Title and message are required", "VALIDATION_ERROR");
    }

    if (targetAdmins) {
      await notifyAllAdmins({ type, title, message });
      return res.status(201).json({ success: true, message: "Notification sent to admins" });
    }

    const created = await createUserNotification({
      userId: userId ? Number(userId) : Number(res.locals.authUser?.id),
      type,
      title,
      message,
    });

    res.status(201).json({ success: true, data: created });
  } catch (error) {
    next(error);
  }
}

export async function markAsReadHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const email = getAuthEmail(res);
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : String(rawId || "");

    if (!id) throw new AppError(400, "Notification ID is required", "VALIDATION_ERROR");

    await markNotificationAsRead(email, id);
    res.json({ success: true, message: "Notification marked as read" });
  } catch (error) {
    next(error);
  }
}

export async function markAllAsReadHandler(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const email = getAuthEmail(res);
    await markAllNotificationsAsRead(email);
    res.json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    next(error);
  }
}
