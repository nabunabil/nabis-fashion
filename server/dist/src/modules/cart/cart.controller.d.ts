import type { Request, Response } from "express";
export declare const cartController: {
    getMyCart(_req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    addItem(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    updateItemQuantity(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    removeItem(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    clearCart(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
};
//# sourceMappingURL=cart.controller.d.ts.map