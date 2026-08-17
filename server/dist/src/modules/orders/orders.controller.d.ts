import type { Request, Response } from "express";
export declare const ordersController: {
    listOrders(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getOrderById(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    listMyOrders(_req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getMyOrder(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    cancelMyOrder(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    updateOrder(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    updateStatus(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
};
//# sourceMappingURL=orders.controller.d.ts.map