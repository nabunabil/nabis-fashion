import type { Request, Response } from "express";
export declare const userController: {
    getAllUsers(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getUserById(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    updateUserRole(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    deleteUser(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getMyProfile(_req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    updateMyProfile(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
};
//# sourceMappingURL=user.controller.d.ts.map