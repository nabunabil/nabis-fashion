import { Request, Response, NextFunction } from "express";
export declare function getNotificationsHandler(_req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function createNotificationHandler(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
export declare function markAsReadHandler(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function markAllAsReadHandler(_req: Request, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=notification.controller.d.ts.map