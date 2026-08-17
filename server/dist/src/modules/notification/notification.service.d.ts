import { NotificationType } from "@prisma/client";
export type CreateNotificationPayload = {
    userId?: number;
    type?: NotificationType;
    title: string;
    message: string;
};
export declare function listUserNotifications(email: string): Promise<{
    notifications: {
        id: string;
        createdAt: Date;
        userId: number;
        type: import("@prisma/client").$Enums.NotificationType;
        title: string;
        message: string;
        isRead: boolean;
    }[];
    unreadCount: number;
}>;
export declare function createUserNotification(data: {
    userId: number;
    type?: NotificationType;
    title: string;
    message: string;
}): Promise<{
    id: string;
    createdAt: Date;
    userId: number;
    type: import("@prisma/client").$Enums.NotificationType;
    title: string;
    message: string;
    isRead: boolean;
}>;
export declare function notifyAllAdmins(data: {
    type?: NotificationType;
    title: string;
    message: string;
}): Promise<never[] | import("@prisma/client").Prisma.BatchPayload>;
export declare function markNotificationAsRead(email: string, notificationId: string): Promise<import("@prisma/client").Prisma.BatchPayload>;
export declare function markAllNotificationsAsRead(email: string): Promise<import("@prisma/client").Prisma.BatchPayload>;
//# sourceMappingURL=notification.service.d.ts.map