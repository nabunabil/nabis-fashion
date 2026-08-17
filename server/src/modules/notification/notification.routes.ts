import { Router } from "express";
import { requireAuth } from "../../shared/middleware/requireAuth";
import {
  getNotificationsHandler,
  createNotificationHandler,
  markAsReadHandler,
  markAllAsReadHandler,
} from "./notification.controller";

export const notificationRoutes: Router = Router();

notificationRoutes.use(requireAuth);

notificationRoutes.get("/", getNotificationsHandler);
notificationRoutes.post("/", createNotificationHandler);
notificationRoutes.patch("/read-all", markAllAsReadHandler);
notificationRoutes.patch("/:id/read", markAsReadHandler);
