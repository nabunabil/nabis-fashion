"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listUserNotifications = listUserNotifications;
exports.createUserNotification = createUserNotification;
exports.notifyAllAdmins = notifyAllAdmins;
exports.markNotificationAsRead = markNotificationAsRead;
exports.markAllNotificationsAsRead = markAllNotificationsAsRead;
const prisma_1 = require("../../lib/prisma");
const appError_1 = require("../../shared/errors/appError");
async function getUserIdByEmail(email) {
    const user = await prisma_1.prisma.user.findUnique({
        where: { email },
        select: { id: true, role: true },
    });
    return user;
}
async function listUserNotifications(email) {
    const user = await getUserIdByEmail(email);
    if (!user)
        throw new appError_1.AppError(404, "User not found", "USER_NOT_FOUND");
    const isAdmin = user.role?.toLowerCase() === "admin";
    // Admins get system & admin notifications + their personal ones
    const whereCondition = isAdmin
        ? {
            OR: [
                { userId: user.id },
                { type: "SYSTEM" },
            ],
        }
        : { userId: user.id };
    const notifications = await prisma_1.prisma.notification.findMany({
        where: whereCondition,
        orderBy: { createdAt: "desc" },
        take: 30,
    });
    const unreadCount = await prisma_1.prisma.notification.count({
        where: {
            ...whereCondition,
            isRead: false,
        },
    });
    return { notifications, unreadCount };
}
async function createUserNotification(data) {
    return prisma_1.prisma.notification.create({
        data: {
            userId: data.userId,
            type: data.type || "SYSTEM",
            title: data.title.trim(),
            message: data.message.trim(),
        },
    });
}
async function notifyAllAdmins(data) {
    const admins = await prisma_1.prisma.user.findMany({
        where: { role: { equals: "admin", mode: "insensitive" } },
        select: { id: true },
    });
    if (admins.length === 0)
        return [];
    return prisma_1.prisma.notification.createMany({
        data: admins.map((a) => ({
            userId: a.id,
            type: data.type || "SYSTEM",
            title: data.title.trim(),
            message: data.message.trim(),
        })),
    });
}
async function markNotificationAsRead(email, notificationId) {
    const user = await getUserIdByEmail(email);
    if (!user)
        throw new appError_1.AppError(404, "User not found", "USER_NOT_FOUND");
    return prisma_1.prisma.notification.updateMany({
        where: {
            id: notificationId,
            userId: user.id,
        },
        data: { isRead: true },
    });
}
async function markAllNotificationsAsRead(email) {
    const user = await getUserIdByEmail(email);
    if (!user)
        throw new appError_1.AppError(404, "User not found", "USER_NOT_FOUND");
    return prisma_1.prisma.notification.updateMany({
        where: {
            userId: user.id,
            isRead: false,
        },
        data: { isRead: true },
    });
}
//# sourceMappingURL=notification.service.js.map