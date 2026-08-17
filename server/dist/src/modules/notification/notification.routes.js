"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationRoutes = void 0;
const express_1 = require("express");
const requireAuth_1 = require("../../shared/middleware/requireAuth");
const notification_controller_1 = require("./notification.controller");
exports.notificationRoutes = (0, express_1.Router)();
exports.notificationRoutes.use(requireAuth_1.requireAuth);
exports.notificationRoutes.get("/", notification_controller_1.getNotificationsHandler);
exports.notificationRoutes.post("/", notification_controller_1.createNotificationHandler);
exports.notificationRoutes.patch("/read-all", notification_controller_1.markAllAsReadHandler);
exports.notificationRoutes.patch("/:id/read", notification_controller_1.markAsReadHandler);
//# sourceMappingURL=notification.routes.js.map