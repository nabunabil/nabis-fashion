"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNotificationsHandler = getNotificationsHandler;
exports.createNotificationHandler = createNotificationHandler;
exports.markAsReadHandler = markAsReadHandler;
exports.markAllAsReadHandler = markAllAsReadHandler;
const notification_service_1 = require("./notification.service");
const appError_1 = require("../../shared/errors/appError");
function getAuthEmail(res) {
    const email = res.locals.authUser?.email;
    if (!email)
        throw new appError_1.AppError(401, "Unauthorized", "UNAUTHORIZED");
    return email;
}
async function getNotificationsHandler(_req, res, next) {
    try {
        const email = getAuthEmail(res);
        const result = await (0, notification_service_1.listUserNotifications)(email);
        res.json({ success: true, data: result.notifications, unreadCount: result.unreadCount });
    }
    catch (error) {
        next(error);
    }
}
async function createNotificationHandler(req, res, next) {
    try {
        const email = getAuthEmail(res);
        const { userId, type, title, message, targetAdmins } = req.body;
        if (!title || !message) {
            throw new appError_1.AppError(400, "Title and message are required", "VALIDATION_ERROR");
        }
        if (targetAdmins) {
            await (0, notification_service_1.notifyAllAdmins)({ type, title, message });
            return res.status(201).json({ success: true, message: "Notification sent to admins" });
        }
        const created = await (0, notification_service_1.createUserNotification)({
            userId: userId ? Number(userId) : Number(res.locals.authUser?.id),
            type,
            title,
            message,
        });
        res.status(201).json({ success: true, data: created });
    }
    catch (error) {
        next(error);
    }
}
async function markAsReadHandler(req, res, next) {
    try {
        const email = getAuthEmail(res);
        const rawId = req.params.id;
        const id = Array.isArray(rawId) ? rawId[0] : String(rawId || "");
        if (!id)
            throw new appError_1.AppError(400, "Notification ID is required", "VALIDATION_ERROR");
        await (0, notification_service_1.markNotificationAsRead)(email, id);
        res.json({ success: true, message: "Notification marked as read" });
    }
    catch (error) {
        next(error);
    }
}
async function markAllAsReadHandler(_req, res, next) {
    try {
        const email = getAuthEmail(res);
        await (0, notification_service_1.markAllNotificationsAsRead)(email);
        res.json({ success: true, message: "All notifications marked as read" });
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=notification.controller.js.map