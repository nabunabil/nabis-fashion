import type { Request, Response } from "express";
export declare const couponController: {
    getCoupons(_req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    create(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    toggleStatus(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    remove(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    validateCode(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
};
//# sourceMappingURL=coupon.controller.d.ts.map