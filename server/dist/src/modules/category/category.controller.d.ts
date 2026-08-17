import type { Request, Response } from "express";
export declare const categoryController: {
    getAllCategories(_req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getCategoryById(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getCategoryBySlug(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    createCategory(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    updateCategory(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    deleteCategory(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
};
//# sourceMappingURL=category.controller.d.ts.map