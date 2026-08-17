import { NotificationType } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../shared/errors/appError";

async function getUserIdByEmail(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, role: true },
  });
  return user;
}

export type CreateNotificationPayload = {
  userId?: number;
  type?: NotificationType;
  title: string;
  message: string;
};

export async function listUserNotifications(email: string) {
  const user = await getUserIdByEmail(email);
  if (!user) throw new AppError(404, "User not found", "USER_NOT_FOUND");

  const isAdmin = user.role?.toLowerCase() === "admin";

  // Admins get system & admin notifications + their personal ones
  const whereCondition = isAdmin
    ? {
        OR: [
          { userId: user.id },
          { type: "SYSTEM" as const },
        ],
      }
    : { userId: user.id };

  const notifications = await prisma.notification.findMany({
    where: whereCondition,
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  const unreadCount = await prisma.notification.count({
    where: {
      ...whereCondition,
      isRead: false,
    },
  });

  return { notifications, unreadCount };
}

export async function createUserNotification(data: {
  userId: number;
  type?: NotificationType;
  title: string;
  message: string;
}) {
  return prisma.notification.create({
    data: {
      userId: data.userId,
      type: data.type || "SYSTEM",
      title: data.title.trim(),
      message: data.message.trim(),
    },
  });
}

export async function notifyAllAdmins(data: {
  type?: NotificationType;
  title: string;
  message: string;
}) {
  const admins = await prisma.user.findMany({
    where: { role: { equals: "admin", mode: "insensitive" } },
    select: { id: true },
  });

  if (admins.length === 0) return [];

  return prisma.notification.createMany({
    data: admins.map((a) => ({
      userId: a.id,
      type: data.type || "SYSTEM",
      title: data.title.trim(),
      message: data.message.trim(),
    })),
  });
}

export async function markNotificationAsRead(email: string, notificationId: string) {
  const user = await getUserIdByEmail(email);
  if (!user) throw new AppError(404, "User not found", "USER_NOT_FOUND");

  return prisma.notification.updateMany({
    where: {
      id: notificationId,
      userId: user.id,
    },
    data: { isRead: true },
  });
}

export async function markAllNotificationsAsRead(email: string) {
  const user = await getUserIdByEmail(email);
  if (!user) throw new AppError(404, "User not found", "USER_NOT_FOUND");

  return prisma.notification.updateMany({
    where: {
      userId: user.id,
      isRead: false,
    },
    data: { isRead: true },
  });
}
