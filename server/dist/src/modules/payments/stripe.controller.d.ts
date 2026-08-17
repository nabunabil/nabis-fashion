import type { Request, Response } from "express";
export declare const stripeController: {
    createCheckout(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    refund(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
};
//# sourceMappingURL=stripe.controller.d.ts.map