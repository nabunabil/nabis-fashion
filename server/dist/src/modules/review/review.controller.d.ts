import type { Request, Response } from "express";
export declare const reviewController: {
    getReviewsByProductId(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    upsertMyReview(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    deleteMyReview(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    setReviewHidden(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getAllReviews(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    deleteReviewById(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
};
//# sourceMappingURL=review.controller.d.ts.map