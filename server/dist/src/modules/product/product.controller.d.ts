import type { Request, Response } from "express";
export declare const productController: {
    getHomepageProducts(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getAllProducts(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    searchProducts(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getProductById(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getProductBySlug(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    createProduct(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    updateProduct(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    deleteProduct(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getProductImages(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    addProductImage(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    deleteProductImage(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
};
//# sourceMappingURL=product.controller.d.ts.map